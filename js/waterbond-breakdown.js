var delay = (function(){
  var timer = 0;
  return function(callback, ms){
    clearTimeout (timer);
    timer = setTimeout(callback, ms);
  };
})();

$(window).resize(function() {
  console.log( "Handler for .resize() called." );
  delay(function(){
      //alert('Resize...');
      //...
      reset();
    }, 500);
  
  
});



//$(document).ready(function() {

	var dataUrl = "./data/waterbond-breakdown.json"
	var myData = {}; // for console copy
	var introduction = ""; // put this here or in dOM?	
	var currentDepth = 0; // gm add
	//var visTop = document.getElementById("chart").offsetTop;
	var visPosition = $("#chart").offset();

	var description = "";

	var margin = {top: 40, right: 0, bottom: 0, left: 0},
	//width = $(window).width() - margin.left - margin.right - 20,
	//height = $(window).height()  - margin.top - margin.bottom - 100,
	width = $("#chart").width() - margin.left - margin.right - 20,
	//height = $("#chart").height()  - margin.top - margin.bottom - 100,
	height = width * .75,
	
	//height = $("#chart").height()  - margin.top - margin.bottom - 100,
	
	formatNumber = d3.format(",d"),	transitioning;

	/* create x and y scales */
	var x = d3.scale.linear()
	.domain([0, width])
	.range([0, width]);

	var y = d3.scale.linear()
	.domain([0, height])
	.range([0, height]);

	var treemap, grandparent, svg;

	

	

	/* Next, the data is loaded in from 'zoomabletreemap.json'. This is a flare json file, just like in the other treemaps and in the unaltered Zoomable Treemap. Note, an extra field called "url" has been added for the leaf nodes to track which webpage should be opened on click. The "value" field determines the relative size of the box compared to others. The "name" field is the text that will be displayed for that node, be it a leaf or parent rectangle. */

	/* load in data, display root */
	d3.json(dataUrl, function(root) {
	
		myData = root; // gm copy add so I can inspect
		
		stage(root);
		initialize(root);
		accumulate(root);
		layout(root);
		display(root);
		
		}) // end of d3 json test  -- moved functions outside of closure

		function stage(root){
			console.log("stage");
			console.log("stage running with root.category at " + root.category);
				treemap = d3.layout.treemap()
						.children(function(d, depth) { return depth ? null : d.children; })
						.sort(function(a, b) { return a.value - b.value; }) // sorting of values in descending order
						.ratio(height / width * 0.5 * (1 + Math.sqrt(5))) // ratio can be played with here
						.round(false); // round numbers or round edges?

					/* create svg */
					//var 
					svg = d3.select("#chart").append("svg")
						.attr("width", width + margin.left + margin.right)
						.attr("height", height + margin.bottom + margin.top)
						.style("margin-left", -margin.left + "px")
						.style("margin.right", -margin.right + "px")
						.append("g")
						.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
						.style("shape-rendering", "crispEdges");

					//var 
					grandparent = svg.append("g")
						.attr("class", "grandparent");

					grandparent.append("rect")
						.attr("y", -margin.top)
						.attr("width", width)
						.attr("height", margin.top);

					grandparent.append("text")
						.attr("x", 2)
						.attr("y", 6 - margin.top)
						.attr("dy", ".75em");

			//nothing
			}



		function initialize(root) {
			console.log("initialize");
		
		
			root.x = root.y = 0;
			root.dx = width;
			root.dy = height;
			root.depth = 0;
		}

		// Aggregate the values for internal nodes. This is normally done by the
		// treemap layout, but not here because of our custom implementation.
		function accumulate(d) {
			console.log("accumulate");
			return d.children
			? d.value = d.children.reduce(function(p, v) { return p + accumulate(v); }, 0)
			: d.value;
		}

		// Compute the treemap layout recursively such that each group of siblings
		// uses the same size (1×1) rather than the dimensions of the parent cell.
		// This optimizes the layout for the current zoom state. Note that a wrapper
		// object is created for the parent node for each group of siblings so that
		// the parent’s dimensions are not discarded as we recurse. Since each group
		// of sibling was laid out in 1×1, we must rescale to fit using absolute
		// coordinates. This lets us use a viewport to zoom.
		function layout(d) {
			console.log("layout");
		
		
			// if this object has children, based on children attribute existing
			if (d.children) {
				//
				treemap.nodes({children: d.children});
				d.children.forEach(function(c) {
					// new child x position is the x of the parent plus the x of the child, times the width of the parent
					c.x = d.x + c.x * d.dx;
					// new child y position is the y of the parent plus the y of the child, times the height of the parent
					c.y = d.y + c.y * d.dy;
					// multiply child width by parent width
					//c.dx *= d.dx is same as c.dx = c.dx *d.dx
					c.dx *= d.dx;
					// multiply child height by parent height
					c.dy *= d.dy;
					// assign d id (or object, really) to "parent" parameter of child 
					c.parent = d;
					// draw layout of child object (just this one)
					layout(c);
				});
			}
		}
	
		/* The 'display' function does a lot of the heavy lifting and is where our customizations come in. A click event was added to the parent rectangle. A foreign object is inserted instead of a SVG text object to allow text wrapping. SVG does not have text wrapping natively, so we are using it's foreign object command to insert divs. Divs wrap text by default. This also gives us easy control of text formatting via CSS. Note that the text is inserted as HTML instead of text, this allows us to place formatting in our json file (e.g. italics, newlines). */
	
		/* display show the treemap and writes the embedded transition function */
		
		function reset(){
			console.log("reset");
		// if this exists, destroy it?
			/**/if(svg){
				d3.select("svg").remove(); // remove old svg if it exists
				myData.reset = true;
			}
			
			width = $("#chart").width() - margin.left - margin.right - 20,
			height = $("#chart").height()  - margin.top - margin.bottom - 100,
			//formatNumber = d3.format(",d"),	transitioning;

			/* reset x and y scales */
			x = d3.scale.linear()
				.domain([0, width])
				.range([0, width]);

			y = d3.scale.linear()
				.domain([0, height])
				.range([0, height]);
			
			
			myData.x = myData.y = 0;
			myData.dx = width;
			myData.dy = height;
			myData.depth = currentDepth;
			myData.currentDepth = currentDepth;
			
			stage(myData);
			layout(myData);
			display(myData);
			
		}
		
		
		
		
		
		
		
		function display(d) {
			console.log("display");
		
		/* create grandparent bar at top */
			grandparent
				.datum(d.parent)
				//.on("click", transition) // always has children
				.on("click", function(d){
					myData.reset = false;
					transition(d);
				}) // gm change for resizing
				.select("text")
				//.text(name(d));
				.text(name(d));

			// not sure why there's a 1 here?
			var g1 = svg.insert("g", ".grandparent")
				.datum(d)
				.attr("id","g1")
				.attr("class", "depth");

			/* add in data */
			var g = g1.selectAll("g")
				.data(d.children)
				.enter().append("g");

			/* transition on child click */
			g.filter(function(d) { return d.children; })
				.classed("children", true) /* this is the group not its rects */
				/* gm */
				.attr("id",function(d){
					return "g-" + d.category;
				})
				.attr("class",function(){
					return "children";
				})
				//.on("click", transition)
				/*.on("click", function(d) { 
					console.log("clicked with num children at " + d.children.length)
					if(d.children.length > 1){
						transition(d); 
						return true;
					}
				})*/
				
				
				
							
		/* GM append text objects to child classed groups */
		
			/// sends groupData undefined error
			/*g.selectAll(".child")
				.data(function(d,i) { return d.children })
				.enter()
					.append("text")
						.text(function(d){
							return d.name
						})
						.attr("class","smalltext foreign")
						.call(smalltext)
					*/
					
					
			/* write children rectangles */
			g.selectAll(".child")
				.data(function(d) { return d.children || [d]; })// if there are children nodes give that otherwise just the data
				.enter().append("rect")
				//.attr("class", "child drought") // monochrome
				//	colored by group
				/**/
				.attr("class", function(d){
					return "child " + d.parent.category;
				})
				.attr("id",function(d,i){
					return "rect-" + d.parent.category + "-" +  i;
				})
				

				
				
				/* gm moved this to child */
				 	.on("click", function(d) { 
					//console.log("clicked with num children at " + d.parent.children.length)
					if(d.parent.children.length > 1){
						myData.reset = false; // so that it transitions
						transition(d.parent); 
						return true;
					}
				})
				/* gm */
				.on("mouseover", function(d){
					//console.log("mousing over " + this.id)
					//console.log("mousing over category " + d.parent.category)
					// TOOLTIP ADDITION
					
					
						// if we are currently at root level, highlight all child elements on mouseover, so we can describe them as a group (parent box has no visual attrs)					
					/**/
					if(currentDepth == 0){
						// fade OTHERS
						d3.selectAll(".child")
							.attr("style","opacity:0.6")
							.classed("highlight",false);

						//d3.selectAll(".textdiv")
							//	.classed("off",true);
				
						//  group highlight
						d3.selectAll("." + d.parent.category)
							.classed("highlight",false)
							.attr("style","opacity:1")// works but obviously not with monochrome
							
							tooltipText(d);
										
							var myPosition = d3.mouse($(this)[0]);
							
							// show/hide click to drill down prompt
							if(d.parent.children.length > 1){
								d3.select("#tooltipSm")
									.classed("hidden",false)
									.style("left",myPosition[0] + 10 + "px")
									.style("top",myPosition[1] + 100 + "px")
									.html("<b> Click for more detail on " + d.parent.nameShort + "</b>")
							} else {
								d3.select("#tooltipSm")
									.classed("hidden",true)
							}
						
						} else {
							// if we have drilled down, let it highlight only child elements
							// single highlight
							d3.selectAll(".child")
								.attr("style","opacity:0.6")
								.classed("highlight",false);
						
						
							d3.select(this)
								.attr("style","opacity:1")
								.classed("highlight",true); 
								
							tooltipText(d);
							
							// show/hide click to drill down prompt
							d3.select("#tooltipSm")
								.classed("hidden",false)
								.style("left", 10 + "px")
								.style("top", 110 + "px")
								.html("<b> Click header to show all bond categories</b>")
						
						
					
						} // end currentDepth test
					
				
	
					// IF HAS CHILDREN
					
					console.log("moused with num children at " + d.parent.children.length)
					
				//if(d.parent.children.length > 1){  // doesn't ever work -- needs to be inside selection	
						
						
						
						
						/*d3.select("#tooltipGM")
							.classed("hidden",false)
							//.transition()
							//.duration(150)
							//.style("left",Math.min(width-150,xPosition + 50)+ "px")
							//.style("left",Math.min(width,xPosition + 150)+ "px")// to right of pointer
							//.style("left",Math.max(10,xPosition - 150)+ "px")// to left of pointer
							.style("left","63%")
							.style("left",visPosition.left + width + 10 + "px")
							//.style("top","300px")
							.style("top",visPosition.top + 45 +  "px")
							.style("position","absolute")
							//.style("left","600px")
							//.style("top",yPosition + objHeight /2 + "px")// when descr included
							//.style("top",yPosition + objHeight + "px")
						
						//d3.select("#tooltipGM")	
						//		.select("#parentName")
							//	.style("display","none")
								//.html(d.parent.name)*/
						
					
						
						/*d3.select("#tooltipGM")
						
								.select("#name")
									.html("<strong>" + d.parent.name + "</strong>")
									//.html("<strong>" + d.name + "</strong>")
							
								d3.select("#tooltipGM")	.select("#amtDisplay")
									.html(d.parent.amtDisplay)
									//.html(d.amtDisplay)
							
								d3.select("#tooltipGM")	.select("#description")
								.html(d.description)
									
								d3.select("#tooltipGM").select("#prompt")
									.html(function(){
										if(d.parent.children.length > 1){
											return "<strong>Click to break down this category further</strong>";
										} else {
											return "";
										}
										
									})*/
							
						
						d3.select("#tooltipGM")	
								.style("pointer-events","none")
							
								.datum(d.parent)
								//.on("click", transition) 
								//.on("click",transition)
								/**/
								.on("click",function(d){
									//console.log("link");
									transition(d.parent);
								})
						
						
							
							/*d3.select("#chartDescription")
								.select("#name")
								.html("<strong>" + d.name + "</strong>")
							
							d3.select("#chartDescription")
								.select("#amtDisplay")
								.html(d.amtDisplay)
							
						
							d3.select("#chartDescription")
								.select("#description")
								.html(d.description)	*/
	
					//}// end if d.children > 1 
					//else {
						// hide the tooltip overlay
					//	d3.select("#tooltipGM")
						//	.classed("hidden",true)
						
						
							
					//} // end else when children == 1 
					
					// in all cases
					
				/*	d3.select("#chartDescription")
							.select("#parentName")
							.html("<strong>" + d.parent.name + "</strong>")
							
						
						d3.select("#chartDescription")	
							.select("#parentDescription")
							.html(d.parent.description)
							
						d3.select("#chartDescription")	
							.select("#parentAmtDisplay")
							.html(d.parent.amtDisplay)
					
					*/
	
				})
				
				.on("mouseout", function(d){
				
				
					d3.selectAll("." + d.parent.category).classed("highlight",false);// 
																d3.selectAll(".child").style("opacity",1); // gm to fade others
					$("#g-" + d.parent.category).fadeTo(100,1); // gm to highlight this group
					
					//console.log("this is " + this.id)
				
					d3.select(this)
						.classed("highlight",false)
				
				
					d3.select("#tooltipSm")
									.classed("hidden",true)
				
					//d3.select("#tooltipGM")
						//	.classed("hidden",true)
					
				})
				
				/* gm add, trying to put in centered labels */
				
				// does it go blank because now it has children???
				
				// trying with svg text
				/*.append("text")
					.attr("class","smalltext")
					.text("geoffy")
					//.call(smalltext)*/
				
				
				// tried with foreign object, made everything go white
				/*.append("foreignObject")
				//.call(rect)
				.attr("id",function(d){
					return "overlay_label" + d.name;
				})
				.attr("class",function(d){
					return "sforeignobj";
				})
				.append("xhtml:div")
				
				.attr("class",function(d, i){
					return "smtextdiv " + d.parent.category + "_" + i;
				}) 
				.attr("dy", ".75em")
				.html(function(d) { return d.name; })
				.style("pointer-events","none")
				*/
				
				/* end GM ADD */
				
				.call(rect);
				
				

			/* write parent rectangle */
			g.append("rect")
				.attr("class", "parent")
				/* gm */
				.attr("id",function(d){
					return "rect-" + d.category + "-parent";
				})
				.call(rect)
				/* open new window based on the json's URL value for leaf nodes */
				/* Chrome displays this on top */
				/*.on("click", function(d) { 
					if(!d.children){
						window.open(d.url); 
					}
				})*/
				.append("title")
				.text(function(d) { return formatNumber(d.value); });
				
			/* Adding a foreign object instead of a text object, allows for text wrapping */
			g.append("foreignObject")
				.call(rect)
				.attr("id",function(d){
					return "overlay_" + d.name;
				})
				
				/* open new window based on the json's URL value for leaf nodes */
				/* Firefox displays this on top */
				/*.on("click", function(d) { 
					if(!d.children){
						window.open(d.url); 
					}
				})*/
				.attr("class","foreignobj")
				/*.attr("class",function(d){
					return "foreignobj";
				})*/
				.append("xhtml:div")
				.attr("class",function(d){
					return "textdiv " + d.category;
				}) 
				.attr("dy", ".75em")
				.html(function(d) { 
					if(d.nameShort == ""){
						return d.name + "<div class='amtDisplay'>" + d.amtDisplay + "</div>";
					} else {
						return d.nameShort + "<div class='amtDisplay'>" + d.amtDisplay + "</div>";
					}					
				})
				
				//.attr("class","textdiv"); //textdiv class allows us to style the text easily with CSS
			
			
			function tooltipText(d){
				//console.log("tooltipText running with d.name at " + d.name + " and currentDepth at " + currentDepth);
				
				var nameText;
				var amountText;
				var descriptionText;
				var promptText;
				
				// if we are in root categories
				if(currentDepth == 0){
				
					d3.select("#tooltipGM")	
							.select("#parentName")
							.style("display","none")
					
					nameText = "" +  d.parent.name + "";
					if(d.parent.img != ""){
						$("#photo").html("<img src=" + d.parent.img + ">");		
						$("#photo").css("display","block");			
					} else {
						$("#photo").css("display","none");
					}
					amountText = d.parent.amtDisplay;
					descriptionText = d.parent.description;
					
					if(d.parent.children.length > 1){
						promptText = "Click to break down this category further";
					} else {
						promptText = "";
					}
					
					
				// if we have drilled down
				} else {				
				
					d3.select("#tooltipGM")	
							.select("#parentName")
							.style("display","block")
							.text(function(d){
								if(d.nameShort == ""){
									return d.name.split(" ")[0] + " " +  d.parent.name.split(" ")[1] + "...";
								} else {
									return d.nameShort;
								}
							})
							
						
					nameText = "" +  d.name + "";
					if(d.img != ""){
						$("#photo").html("<img src=" + d.img + ">");		
						$("#photo").css("display","block");			
					} else {
						$("#photo").css("display","none");
					}
					amountText = d.amtDisplay;
					descriptionText = d.description;
					promptText = "";
				}
				

				
				d3.select("#tooltipGM").select("#name")
					.html("<strong>" + nameText + "</strong>")
				
				d3.select("#tooltipGM")	.select("#amtDisplay")
					.html(amountText)
					
				d3.select("#tooltipGM")	.select("#description")
					.html(descriptionText)/**/
					
				d3.select("#tooltipGM").select("#prompt")
					.html(promptText)
	
			
			}
			
			
			
				/* The 'transition' function is inside the display function. It is rewritten at each display and handles the change of each element as well as the viewport to the new zoom level. We have added transitions for our new divs. Note there is a Webkit bug that prevents D3 from selecting camelCase elements such as 'foreignObject' (see the stackoverflow article). Hence, we had to assign a class to the foreign objects and select them that way. */
			
				/* create transition function for transitions */
				function transition(d) {
					console.log("--- transition firing with d.name at "  + d .name + " and d.depth at " + d.depth);
					
					currentDepth = d.depth;// gm state test
					myData.currentNode = d;//
					myData.currentDepth = d.depth;
					
					defaultDuration = 750;
					noDuration = 0;
					
					if(myData.reset == true){
						currentDuration = noDuration;
					} else {
						currentDuration = defaultDuration;
					
					}
					
					

					
					if (transitioning || !d) return;
							transitioning = true;

							var g2 = display(d),
							t1 = g1.transition().duration(currentDuration),
							t2 = g2.transition().duration(currentDuration);

							// Update the domain only after entering new elements.
							x.domain([d.x, d.x + d.dx]);
							y.domain([d.y, d.y + d.dy]);

							// Enable anti-aliasing during the transition.
							svg.style("shape-rendering", null);

							// Draw child nodes on top of parent nodes.
							svg.selectAll(".depth").sort(function(a, b) { return a.depth - b.depth; });

							// Fade-in entering text.
							g2.selectAll("text").style("fill-opacity", 0);
							g2.selectAll("foreignObject div").style("display", "none"); /*added*/

							// Transition to the new view.
							t1.selectAll("text").call(text).style("fill-opacity", 0);
							t2.selectAll("text").call(text).style("fill-opacity", 1);
							t1.selectAll("rect").call(rect);
							t2.selectAll("rect").call(rect);

							t1.selectAll(".textdiv").style("display", "none"); /* added */
							
							//t1.selectAll(".smalltext").call(smalltext); /* GM EXPERIMENT */
							
							t1.selectAll(".foreignobj").call(foreign); /* added */
							t2.selectAll(".textdiv").style("display", "block"); /* added */
							t2.selectAll(".amtDisplay").style("display", "block"); /* added */
							t2.selectAll(".foreignobj").call(foreign); /* added */ 

							// Remove the old node when the transition is finished.
							
							/**/t1.remove().each("end", function() {
								svg.style("shape-rendering", "crispEdges");
								transitioning = false;
							});
							
							// G ADD TO RESTORE CLICK FUNCTION?
							d3.selectAll(".foreignobj").style("pointer-events","none")
							
							/*
							d3.selectAll(".child")
								//d3.selectAll(".child").attr("width","30px");  //works
									.on("click", function(d) { 
									console.log("clicked with num children at " + d.parent.children.length)
								})*/
							
							
							
							
							
							

				}//endfunc transition

			/* gm deep link add */
			
			if(myData.currentNode){
				console.log("not the first transition");
				if(myData.currentDepth == 1){
					transition(myData.currentNode);
				}
			}

			return g;
		}//endfunc display
	
		/* Finally, we have some functions to handle the resizing of individual elements. */
	
		/*gm */
			
		function smalltext(text) {
			text.attr("x", function(d) { return x(d.x) + 5; })
			.attr("y", function(d) { return y(d.y) -20; })
			.attr("width",40)
			.attr("height",20);
			
		}
		
	
		function text(text) {
			text.attr("x", function(d) { return x(d.x) + 6; })
			.attr("y", function(d) { return y(d.y) + 6; });
		}

		function rect(rect) {
			rect.attr("x", function(d) { return x(d.x); })
			.attr("y", function(d) { return y(d.y); })
			.attr("width", function(d) { return x(d.x + d.dx) - x(d.x); })
			.attr("height", function(d) { return y(d.y + d.dy) - y(d.y); });
		}

		function foreign(foreign){ /* added */
			foreign.attr("x", function(d) { return x(d.x); })
			.attr("y", function(d) { return y(d.y); })
			.attr("width", function(d) { return x(d.x + d.dx) - x(d.x); })
			.attr("height", function(d) { return y(d.y + d.dy) - y(d.y); });
		}

		function name(d) {
			console.log("name running with d/d.name/d.parent at " + d + "/" + d.name + "/" + d.parent);
			if(d.parent){
				if(d.nameShort == ""){
					return d.parent.name + " >  " + d.name;
				} else {
					return d.parent.name + " >  " + d.nameShort;
				}
			} else {
				return d.name;
			}/**/
			
			
			//return d.parent ? name(d.parent) + " >  " + d.name : d.name;
			
		}
	//});// end d3.json
	


//}); // end document.ready
