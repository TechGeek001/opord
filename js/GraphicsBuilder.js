GraphicsBuilder = function(container, w, h) {
	// Namespace declaration for SVG elements
	this.xmlns = "http://www.w3.org/2000/svg";
	this.xmlnsxlink = "http://www.w3.org/1999/xlink";
	// Width of the canvas in pixels
	this.width = w;
	// Height of the canvas in pixels
	this.height = h;
	// Detect if an element is being dragged
	this.dragging = false;
	// Toggle allowing an element to be dragged
	this.canDrag = true;
	// The function to execute when the mouse is clicked on the canvas
	this.clickFunction = null;
	// The function to execute when the mouse is released on the canvas
	this.mouseUpFunction = null;
	// The function to execute then the mouse is moved on the canvas
	this.moveFunction = null;
	
	// An array of units/equipment
	this.symbolData = new Array();
	// Background image
	this.bgData = {
		x: 0,
		y: 0,
		e: null
	}
	// Grid data
	this.gridData = {
		x: 0,
		y: 0,
		size: 0,
		accuracy: 0,
		set: false,
		xGrid: 0,
		yGrid: 0,
		g: null
	}
	
	var Controller = this;
	
	///////////////////////////////////////////////////////////////////////////////////////////////
	// PROTECTED SVG AND DRAWING FUNCTIONS
	///////////////////////////////////////////////////////////////////////////////////////////////
	
	var minGridSize = 25;
	var minGridSizeBuffer = 5;
	var grid4Color = "yellow";
	var grid6Color = "#EEE";
	var line4Color = "black";
	var line6Color = "gray";
	var line0Color = "red";
	
	/**
	 * Draw a line from x1y1 to x2y2
	 * 
	 * @method drawLine
	 * @param {Number} x1			The first X coordinate
	 * @param {Number} y1			The first Y coordinate
	 * @param {Number} x2			The second X coordinate
	 * @param {Number} y2			The second Y coordinate
	 * @return {Object}				The resulting DOM object
	 */
	this.drawLine = function(x1, y1, x2, y2, o) {
		if(typeof o === "undefined") {
			o = {};
		}
		var l = document.createElementNS(this.xmlns, "line");
		l.setAttributeNS(null, "x1", x1);
		l.setAttributeNS(null, "x2", x2);
		l.setAttributeNS(null, "y1", y1);
		l.setAttributeNS(null, "y2", y2);
		if(typeof o.stroke !== "undefined") {
			l.setAttributeNS(null, "stroke", o.stroke);
		}
		if(typeof o.dasharray !== "undefined") {
			l.setAttributeNS(null, "stroke-dasharray", o.dasharray);
		}
		return l;
	}
	
	/**
	 * Draw a circle centered on x,y with a radius of r
	 * 
	 * @method drawCircle
	 * @param {Number} x			The X coordinate to center this on
	 * @param {Number} y			The Y coordinate to center this on
	 * @param {Number} r			The radius of the circle
	 * @return {Object}				The resulting DOM object
	 */
	this.drawCircle = function(x, y, r, o) {
		if(typeof o === "undefined") {
			o = {};
		}
		var c = document.createElementNS(this.xmlns, "circle");
		c.setAttributeNS(null, "cx", x);
		c.setAttributeNS(null, "cy", y);
		c.setAttributeNS(null, "r", r);
		if(typeof o.strokeWidth !== "undefined") {
			c.setAttributeNS(null, "stroke-width", o.strokeWidth);
		}
		if(typeof o.fill !== "undefined") {
			c.setAttributeNS(null, "fill", o.fill);
		}
		return c;
	}
	
	/**
	 * Create a text element oriented on x,y
	 * 
	 * @method drawText
	 * @param {Number} x			The X coordinate to center this on
	 * @param {Number} y			The Y coordinate to center this on
	 * @param {String} t			The text to add to this
	 * @param {String} anchor		The anchor for the text (start|middle|end)
	 * @return {Object}				The resulting DOM object
	 */
	this.drawText = function(x, y, text, anchor, o) {
		if(typeof o === "undefined") {
			o = {};
		}
		// Verify that the anchor is valid
		if(anchor !== "start" && anchor !== "end") {
			anchor = "middle";
		}
		var t = document.createElementNS(this.xmlns, "text");
		t.setAttributeNS(null, "x", x);
		t.setAttributeNS(null, "y", y + 2);
		t.setAttributeNS(null, "font-size", minGridSize / 2);
		t.setAttributeNS(null, "text-anchor", anchor);
		t.setAttributeNS(null, "alignment-baseline", "middle");
		t.textContent = text;
		return t;
	}
	
	/**
	 * 
	 */
	this.drawImage = function(x, y, w, h, scale, src) {
		var i = document.createElementNS(this.xmlns, "image");
		i.setAttributeNS(null, "x", x);
		i.setAttributeNS(null, "y", y);
		i.setAttributeNS(null, "width", w);
		i.setAttributeNS(null, "height", h);
		i.setAttributeNS(null, "height", h);
		i.setAttributeNS(null, "transform", "scale(" + (scale) + ")");
		i.setAttributeNS(this.xmlnsxlink, "xlink:href", src);
		return i;
	}
	
	/**
	 * Draw a four or six digit grid over the canvas
	 * 
	 * @method drawGrid
	 * @param {Number} x			The X coordinate for the left-most grid line
	 * @param {Number} y			The Y coordinate for the top-most grid line
	 * @param {Number} size			The distance in pixels between grid lines
	 */
	this.drawGrid = function(x, y, size) {
		// Empty the grid group
		this.gridData.g.innerHTML = "";
		// Build the entire X grid
		var create = new Array(x, this.width + minGridSize, initialXGrid, y, this.height + minGridSize, initialYGrid);
		// Use an array to hold all the values needed and iterate twice (X, then Y)
		for(var i = 0; i < create.length; i = i + 3) {
			while(create[i] < create[i + 1]) {
				// Check the grid coordinate and adjust the color accordingly
				var coord = create[i + 2];
				if(coord == 0) {
					var circleColor = grid4Color;
					var lineColor = line0Color;
				} else if(gridAccuracy == 6 && coord % 100 != 0) {
					var circleColor = grid6Color;
					var lineColor = line6Color;
				} else {
					var circleColor = grid4Color;
					var lineColor = line4Color;
				}
				// Convert the coordinate to a string
				if(gridAccuracy == 4) {
					if(coord < 10) {
						var coordString = "0" + coord;
					} else {
						var coordString = coord + "";
					}
				} else if(gridAccuracy == 6) {
					if(coord < 10) {
						// Convert "01" to "001"
						var coordString = "00" + coord;
					} else if(coord < 100) {
						// Convert "99" to "099"
						var coordString = "0" + coord;
					} else {
						var coordString = coord + "";
					}
				}
				// This is an X coordinate
				if(i == 0) {
					this.gridData.g.insertBefore(this.drawLine(create[i], 0, create[i], this.height, {stroke: lineColor}), this.gridData.g.childNodes[0]);
					this.gridData.g.appendChild(this.drawCircle(create[i], minGridSize / 2, minGridSize / 2, {fill: circleColor, strokeWidth: 0}));
					this.gridData.g.appendChild(this.drawText(create[i], minGridSize / 2, coordString, "middle"));
					this.gridData.g.appendChild(this.drawCircle(create[i], this.height - minGridSize / 2, minGridSize / 2, {fill: circleColor, strokeWidth: 0}));
					this.gridData.g.appendChild(this.drawText(create[i], this.height - minGridSize / 2, coordString, "middle"));
					// Update the coordinate
					if(gridAccuracy == 4 && create[i + 2] == 99) {
						create[i + 2] = 0;
					} else if(gridAccuracy == 6 && create[i + 2] == 999) {
						create[i + 2] = 0;
					} else {
						create[i + 2]++;
					}
				// This is a Y coordinate
				} else {
					this.gridData.g.insertBefore(this.drawLine(0, create[i], this.width, create[i], {stroke: lineColor}), this.gridData.g.childNodes[0]);
					this.gridData.g.appendChild(this.drawCircle(minGridSize / 2, create[i], minGridSize / 2, {fill: circleColor, strokeWidth: 0}));
					this.gridData.g.appendChild(this.drawText(minGridSize / 2, create[i], coordString, "middle"));
					this.gridData.g.appendChild(this.drawCircle(this.width - minGridSize / 2, create[i], minGridSize / 2, {fill: circleColor, strokeWidth: 0}));
					this.gridData.g.appendChild(this.drawText(this.width - minGridSize / 2, create[i], coordString, "middle"));
					// Update the coordinate
					if(create[i + 2] == 0) {
						if(gridAccuracy == 4) {
							create[i + 2] = 99;
						} else {
							create[i + 2] = 999;
						}
					} else {
						create[i + 2]--;
					}
				}
				// Increase the current position to the next grid line
				create[i] += size;
			}
		}
	}

	///////////////////////////////////////////////////////////////////////////////////////////////
	// PROTECTED MOUSE-CLICK FUNCTIONS
	///////////////////////////////////////////////////////////////////////////////////////////////
	
	var initialXPos = 0;			// The x position of the first click in pixels
	var initialYPos = 0;			// The y position of the first click in pixels
	var initialXGrid = 0;			// The x position of the first grid as 4 digits
	var initialYGrid = 0;			// The y position of the first grid as 4 digits
	var secondXGrid = 0;			// The x position of the second grid as 4 digits
	var secondYGrid = 0;			// The y position of the second grid as 4 digits
	var gridSize = 0;				// The width and height of the grid square in pixels
	var distanceX1 = 0;				// The x position of the first point for known distance
	var distanceY1 = 0;				// The y position of the first point for known distance
	var distanceX2 = 0;				// The x position of the second point for known distance
	var distanceY2 = 0;				// The y position of the second point for known distance
	var knownDistance = 0;			// The known distance to be measured
	var knownDistanceUnits = null;	// The units that the known distance is to be measured in
	var gridAccuracy = 4;			// The number of digits to expand the grid to
	var originalTranslationX = 0;	// The original translation x value for this unit
	var originalTranslationY = 0;	// The original translation y value for this unit
	
	/**
	 * Place a point on the canvas (e.g. a grid coordinate). Used in conjunction with the crosshair() move event
	 *
	 * @method placeFirstAdjPoint
	 */
	this.placeFirstAdjPoint = function(e) {
		// Create the group that will eventually hold the entire grid
		if(this.gridData.g === null) {
			this.gridData.g = document.createElementNS(this.xmlns, "g");
			this.gridData.g.setAttributeNS(null, "stroke-width", 1);
			this.gridData.g.setAttributeNS(null, "stroke", "black");
		}
		// Create the lines that hold the initial grid position
		var g0 = this.drawLine(0, this.mousePosition(e).y, this.width, this.mousePosition(e).y, {stroke: "blue"});
		var g1 = this.drawLine(this.mousePosition(e).x, 0, this.mousePosition(e).x, this.height, {stroke: "blue"});
		this.gridData.g.appendChild(g0);
		this.gridData.g.appendChild(g1);
		this.gridLayer.appendChild(this.gridData.g);
		// Destroy the initial crosshairs
		this.gridLayer.removeChild(crosshairX);
		this.gridLayer.removeChild(crosshairY);
		crosshairX = null;
		crosshairY = null;
		// Update variables to tell the next function where the original lines are
		initialXPos = this.mousePosition(e).x;
		initialYPos = this.mousePosition(e).y;
		// Update the click and move functions to place the second point
		this.canDrag = false;
		this.moveFunction = this.adjacentGridLines;
		this.clickFunction = this.placeSecondAdjPoint;
	}
	
	/**
	 * Place a second point on the canvas (e.g. a grid coordinate). Used in conjunction with the adjacentGridLines() move event
	 *
	 * @method placeSecondAdjPoint
	 */
	this.placeSecondAdjPoint = function(e) {
		// Calculate the width of each grid square
		if(this.width > this.height) {
			var diff = Math.abs(initialXPos - this.mousePosition(e).x);
		} else {
			var diff = Math.abs(initialYPos - this.mousePosition(e).y);
		}
		// Ensure that the minimum width is met
		if(diff >= minGridSize + minGridSizeBuffer) {
			// Null out the move and click functions
			this.moveFunction = null;
			this.clickFunction = null;
			this.canDrag = true;
			// Remove the grid lines
			this.gridLayer.removeChild(crosshairX1);
			this.gridLayer.removeChild(crosshairY1);
			this.gridLayer.removeChild(crosshairX2);
			this.gridLayer.removeChild(crosshairY2);
			crosshairX1 = null;
			crosshairY1 = null;
			crosshairX2 = null;
			crosshairY2 = null;
			// Calculate the left and top-most grid line positions (pixels)
			diff = gridAccuracy == 4 ? diff / 1000 : diff / 100;
			this.completeGridCalc(diff);
		}
	}
	
	/**
	 *
	 */
	this.placeFirstKnownPoint = function(e) {
		// Create the group that will eventually hold the entire grid
		if(this.gridData.g === null) {
			this.gridData.g = document.createElementNS(this.xmlns, "g");
			this.gridData.g.setAttributeNS(null, "stroke-width", 1);
			this.gridData.g.setAttributeNS(null, "stroke", "black");
		}
		// Create the lines that hold the initial grid position
		var g0 = this.drawLine(0, this.mousePosition(e).y, this.width, this.mousePosition(e).y, {stroke: "blue"});
		var g1 = this.drawLine(this.mousePosition(e).x, 0, this.mousePosition(e).x, this.height, {stroke: "blue"});
		this.gridData.g.appendChild(g0);
		this.gridData.g.appendChild(g1);
		this.gridLayer.appendChild(this.gridData.g);
		// Update variables to tell the next function where the original lines are
		initialXPos = this.mousePosition(e).x;
		initialYPos = this.mousePosition(e).y;
		// Update the click and move functions to place the second point
		this.moveFunction = this.crosshairToLine;
		this.clickFunction = this.placeSecondKnownPoint;
		this.canDrag = false;
	}
	
	/**
	 *
	 */
	this.placeSecondKnownPoint = function(e) {
		var mp = this.mousePosition(e);
		// Calculate the width of each grid square
		if(this.width > this.height) {
			var diff = Math.abs(initialXPos - mp.x);
			var distance = "horizontal";
		} else {
			var diff = Math.abs(initialYPos - mp.y);
			var distance = "vertical";
		}
		// Figure out what the pixels/1km conversion is
		var x = mp.x;
		if(x > initialXPos) {
			if(mp.y > initialYPos) {
				diff = diff / gridData[3][distance];
			} else {
				diff = diff / gridData[0][distance];
			}
		} else {
			if(mp.y > initialYPos) {
				diff = diff / gridData[2][distance];
			} else {
				diff = diff / gridData[1][distance];
			}
		}
		// Ensure that the minimum width is met
		var multiplier = gridAccuracy == 4 ? 1000 : 100;
		if(diff * multiplier >= minGridSize + minGridSizeBuffer) {
			// Find the closest solid grid coordinates (4 or 6 digits)
			this.findClosestGrids(diff);
			// Null out the move and click functions
			this.moveFunction = null;
			this.clickFunction = null;
			this.canDrag = true;
			// Remove the grid lines
			this.gridLayer.removeChild(crosshairX);
			this.gridLayer.removeChild(crosshairY);
			// Calculate the left and top-most grid line positions (pixels)
			this.completeGridCalc(diff);
		}
	}
	
	this.placeGridKnownDistance = function(e) {
		// Create the group that will eventually hold the entire grid
		if(this.gridData.g === null) {
			this.gridData.g = document.createElementNS(this.xmlns, "g");
			this.gridData.g.setAttributeNS(null, "stroke-width", 1);
			this.gridData.g.setAttributeNS(null, "stroke", "black");
		}
		// Create the lines that hold the initial grid position
		var g0 = this.drawLine(0, this.mousePosition(e).y, this.width, this.mousePosition(e).y, {stroke: "blue"});
		var g1 = this.drawLine(this.mousePosition(e).x, 0, this.mousePosition(e).x, this.height, {stroke: "blue"});
		this.gridData.g.appendChild(g0);
		this.gridData.g.appendChild(g1);
		this.gridLayer.appendChild(this.gridData.g);
		// Update variables to tell the next function where the original lines are
		initialXPos = this.mousePosition(e).x;
		initialYPos = this.mousePosition(e).y;
		// Update the click and move functions to place the second point
		this.moveFunction = this.crosshairSmall;
		this.clickFunction = this.placeFirstPointKnownDistance;
		this.canDrag = false;
	}
	
	/**
	 *
	 */
	this.placeFirstPointKnownDistance = function(e) {
		distanceX1 = this.mousePosition(e).x;
		distanceY1 = this.mousePosition(e).y;
		distanceLine = this.drawLine(distanceX1, distanceY1, distanceX1, distanceY1, {stroke: "red", dasharray: "5 5"});
		this.gridLayer.appendChild(distanceLine);
		// Update the click function to place the second point
		this.clickFunction = this.placeSecondPointKnownDistance;
		this.canDrag = false;
	}
	
	/**
	 *
	 */
	this.placeSecondPointKnownDistance = function(e) {
		distanceX2 = this.mousePosition(e).x;
		distanceY2 = this.mousePosition(e).y;
		// Remove the grid lines
		this.gridLayer.removeChild(crosshairX);
		this.gridLayer.removeChild(crosshairY);
		this.gridLayer.removeChild(distanceLine);
		crosshairX = null;
		crosshairY = null;
		distanceLine = null;
		// Null out the move and click functions
		this.moveFunction = null;
		this.clickFunction = null;
		// Figure out the 10 meter/pixel ratio
		var x = Math.abs(distanceX1 - distanceX2);
		var y = Math.abs(distanceY1 - distanceY2);
		var distancePx = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
		// Convert the known distance to meters if it isn't already
		switch(knownDistanceUnits) {
			case("ft"):
				knownDistance = knownDistance * .3048
				break;
			case("yd"):
				knownDistance = knownDistance * .9144
				break;
			case("mi"):
				knownDistance = knownDistance * 1609.34
				break;
			case("km"):
				knownDistance = knownDistance * 1000;
				break;
		}
		// Find the pixel difference in a meter
		diff = distancePx / knownDistance;
		var multiplier = gridAccuracy == 4 ? 1000 : 100;
		// Ensure that the minimum width is met
		if(diff * multiplier >= minGridSize + minGridSizeBuffer) {
			// Find the closest solid grid coordinates (4 or 6 digits)
			this.findClosestGrids(diff);
			// Null out the move and click functions
			this.moveFunction = null;
			this.clickFunction = null;
			this.canDrag = true;
			// Calculate the left and top-most grid line positions (pixels) and draw the grid
			this.completeGridCalc(diff);
		}
	}
	
	///////////////////////////////////////////////////////////////////////////////////////////////
	// PROTECTED MOUSE-DOWN FUNCTIONS
	///////////////////////////////////////////////////////////////////////////////////////////////
	
	this.moveUnit = function(e) {
		// Because this references the unit, the Controller variable is used to refer to the GraphicsBuilder
		if(Controller.canDrag && e.which == 1) {
			Controller.dragging = this;
			var m = Controller.mousePosition(e);
			initialXPos = m.x;
			initialYPos = m.y;
			var t = Controller.getTransformValues(this).translate;
			originalTranslationX = t ? parseInt(t[0]) : 0;
			originalTranslationY = t ? parseInt(t[1]) : 0;
			Controller.moveFunction = Controller.changeUnitPosition;
			Controller.mouseUpFunction = Controller.releaseUnit;
		}
	}
	
	///////////////////////////////////////////////////////////////////////////////////////////////
	// PROTECTED MOUSE-UP FUNCTIONS
	///////////////////////////////////////////////////////////////////////////////////////////////
	
	this.releaseUnit = function(e) {
		this.dragging = false;
		this.moveFunction = null;
		this.mouseUpFunction = null;
	}
	
	///////////////////////////////////////////////////////////////////////////////////////////////
	// PROTECTED MOUSE-MOVE FUNCTIONS
	///////////////////////////////////////////////////////////////////////////////////////////////
	
	var crosshairX = null;
	var crosshairY = null;
	var crosshairX1 = null;
	var crosshairX2 = null;
	var crosshairY1 = null;
	var crosshairY2 = null;
	var distanceLine = null;
	var gridData = null;
	var crosshairConstrainQ1 = 0;
	var crosshairConstrainQ2 = 0;
	var crosshairConstrainQ3 = 0;
	var crosshairConstrainQ4 = 0;
	
	/**
	 * Create a crosshair effect that follows the user's cursor
	 
	 * @method crosshair
	 */
	this.crosshair = function(e) {
		// If the crosshairs don't yet exist, create them
		if(crosshairX === null) {
			crosshairX = this.drawLine(0, 0, this.width, 0, {stroke: "red"});
			crosshairY = this.drawLine(0, 0, 0, this.height, {stroke: "red"});
		}
		// If the nodes don't have parents yet, add them to the canvas
		if(crosshairX.parentNode === null) {
			this.gridLayer.appendChild(crosshairX);
			this.gridLayer.appendChild(crosshairY);
		}
		// Update the crosshair positions
		var mp = this.mousePosition(e);
		crosshairX.setAttributeNS(null, "y1", mp.y);
		crosshairX.setAttributeNS(null, "y2", mp.y);
		crosshairY.setAttributeNS(null, "x1", mp.x);
		crosshairY.setAttributeNS(null, "x2", mp.x);
	}
	
	/**
	 * Constrain a crosshair to a line determined by the x position and crosshairConstrain variables
	 */
	this.crosshairToLine = function(e) {
		// If the crosshairs don't yet exist, create them
		if(crosshairX === null) {
			crosshairX = this.drawLine(0, 0, this.width, 0, {stroke: "red"});
			crosshairY = this.drawLine(0, 0, 0, this.height, {stroke: "red"});
		}
		// If the nodes don't have parents yet, add them to the canvas
		if(crosshairX.parentNode === null) {
			this.gridLayer.appendChild(crosshairX);
			this.gridLayer.appendChild(crosshairY);
		}
		// Update the crosshair positions
		
		var mp = this.mousePosition(e);
		var x = mp.x
		if(x > initialXPos) {
			if(mp.y > initialYPos) {
				var y = initialYPos - ((x - initialXPos) * crosshairConstrainQ4);
			} else {
				var y = initialYPos - ((x - initialXPos) * crosshairConstrainQ1);
			}
		} else {
			if(mp.y > initialYPos) {
				var y = initialYPos - ((x - initialXPos) * crosshairConstrainQ3);
			} else {
				var y = initialYPos - ((x - initialXPos) * crosshairConstrainQ2);
			}
		}
		crosshairX.setAttributeNS(null, "y1", y);
		crosshairX.setAttributeNS(null, "y2", y);
		crosshairY.setAttributeNS(null, "x1", x);
		crosshairY.setAttributeNS(null, "x2", x);
	}
	
	/**
	 *
	 */
	this.crosshairSmall = function(e) {
		// If the crosshairs don't yet exist, create them
		if(crosshairX === null) {
			crosshairX = this.drawLine(0, 0, this.width, 0, {stroke: "red"});
			crosshairY = this.drawLine(0, 0, 0, this.height, {stroke: "red"});
		}
		// If the nodes don't have parents yet, add them to the canvas
		if(crosshairX.parentNode === null) {
			this.gridLayer.appendChild(crosshairX);
			this.gridLayer.appendChild(crosshairY);
		}
		// Update the crosshair positions
		var mp = this.mousePosition(e);
		crosshairX.setAttributeNS(null, "y1", mp.y);
		crosshairX.setAttributeNS(null, "y2", mp.y);
		crosshairX.setAttributeNS(null, "x1", mp.x - 10);
		crosshairX.setAttributeNS(null, "x2", mp.x + 10);
		crosshairY.setAttributeNS(null, "y1", mp.y - 10);
		crosshairY.setAttributeNS(null, "y2", mp.y + 10);
		crosshairY.setAttributeNS(null, "x1", mp.x);
		crosshairY.setAttributeNS(null, "x2", mp.x);
		// Update the distance line, if it exists
		if(distanceLine) {
			distanceLine.setAttributeNS(null, "x2", mp.x);
			distanceLine.setAttributeNS(null, "y2", mp.y);
		}
	}
	
	/**
	 * Create ghost grid lines adjacent to one that is already set
	 *
	 * @method adjacentGridLines
	 */
	this.adjacentGridLines = function(e) {
		// If the crosshairs don't yet exist, create them
		if(crosshairX1 === null) {
			crosshairX1 = this.drawLine(0, 0, this.width, 0, {stroke: "red"});
			crosshairY1 = this.drawLine(0, 0, 0, this.height, {stroke: "red"});
			crosshairX2 = this.drawLine(0, 0, this.width, 0, {stroke: "red"});
			crosshairY2 = this.drawLine(0, 0, 0, this.height, {stroke: "red"});
		}
		// If the nodes don't have parents yet, add them to the canvas
		if(crosshairX1.parentNode === null) {
			this.gridLayer.appendChild(crosshairX1);
			this.gridLayer.appendChild(crosshairY1);
			this.gridLayer.appendChild(crosshairX2);
			this.gridLayer.appendChild(crosshairY2);
		}
		// Calculate the difference between the original grid and the mouse
		if(this.width > this.height) {
			var diff = Math.abs(initialXPos - this.mousePosition(e).x);
		} else {
			var diff = Math.abs(initialYPos - this.mousePosition(e).y);
		}
		crosshairX1.setAttributeNS(null, "y1", initialYPos - diff);
		crosshairX1.setAttributeNS(null, "y2", initialYPos - diff);
		crosshairY1.setAttributeNS(null, "x1", initialXPos - diff);
		crosshairY1.setAttributeNS(null, "x2", initialXPos - diff);
		crosshairX2.setAttributeNS(null, "y1", initialYPos + diff);
		crosshairX2.setAttributeNS(null, "y2", initialYPos + diff);
		crosshairY2.setAttributeNS(null, "x1", initialXPos + diff);
		crosshairY2.setAttributeNS(null, "x2", initialXPos + diff);
	}
	
	this.changeUnitPosition = function(e) {
		if(this.canDrag) {
			var m = Controller.mousePosition(e);
			var x = originalTranslationX + (m.x - initialXPos);
			var y = originalTranslationY + (m.y - initialYPos);
			this.updateTransformValues(this.dragging, {translate: x + "," + y});
		} else {
			this.releaseUnit(e);
		}
	}
	
	///////////////////////////////////////////////////////////////////////////////////////////////
	// PROTECTED MOUSE-OUT FUNCTIONS
	///////////////////////////////////////////////////////////////////////////////////////////////
	
	
	
	///////////////////////////////////////////////////////////////////////////////////////////////
	// PROTECTED HELPER FUNCTIONS
	///////////////////////////////////////////////////////////////////////////////////////////////
	
	/**
	 * Get the current position of the mouse on the canvas
	 *
	 * @method mousePosition
	 * @param {Event} e				The event object
	 * @return {Object} The current x,y position of the mouse on the canvas
	 */
	this.mousePosition = function(e) {
		// Get the parent position
		var getPosition = function(e) {
			var xPosition = 0;
			var yPosition = 0;
			while(e) {
				xPosition += (e.offsetLeft - e.scrollLeft + e.clientLeft);
				yPosition += (e.offsetTop - e.scrollTop + e.clientTop);
				e = e.offsetParent;
			}
			return { x: xPosition, y: yPosition };
		}
		var parentPosition = getPosition(e.currentTarget);
		return { x: e.clientX - parentPosition.x, y: e.clientY - parentPosition.y };
	}
	
	/**
	 * Sets the initial grid coordinates for createGrid(). Expects a valid 4 or 6 digit grid
	 *
	 * @method setInitialGrid
	 */
	this.setInitialGrid = function(g, a) {
		gridAccuracy = a;
		initialXGrid = g.substr(0, g.length / 2);
		initialYGrid = g.substr(g.length / 2, g.length);
	}
	
	/**
	 *
	 */
	this.setSecondGrid = function(g) {
		secondXGrid = g.substr(0, g.length / 2);
		secondYGrid = g.substr(g.length / 2, g.length);
	}
	
	/**
	 *
	 */
	this.setKnownDistance = function(i, u) {
		if(!isNaN(i) && i > 0 && (
			u == "m" ||
			u == "km" ||
			u == "ft" ||
			u == "yd" ||
			u == "mi"
		)) {
			knownDistance = i;
			knownDistanceUnits = u;
		}
	}
	
	/**
	 *
	 */
	this.setGridColorsHelper = function(colors) {
		grid4Color = colors[0];
		grid6Color = colors[1];
		line4Color = colors[2];
		line6Color = colors[3];
		line0Color = colors[4];
	}
	
	/**
	 *
	 */
	this.setGridData = function(data) {
		gridData = data;
		crosshairConstrainQ1 = data[0].slope;
		crosshairConstrainQ2 = data[1].slope;
		crosshairConstrainQ3 = data[2].slope;
		crosshairConstrainQ4 = data[3].slope;
	}
	
	this.findClosestGrids = function(diff) {
		// Find the closest solid grid coordinates (4 or 6 digits)
		var remainderX = gridAccuracy == 4 ? parseInt(initialXGrid.substring(2, 4)) : parseInt(initialXGrid.substring(3, 4));
		// Convert the remainder to the length in meters
		remainderX = remainderX * 10;
		var pixelChangeX = remainderX * diff;
		initialXGrid = gridAccuracy == 4 ? parseInt(initialXGrid.substring(0, 2)) : parseInt(initialXGrid.substring(0, 3));
		// If the starting position is less than the difference, go to the next grid up
		if(remainderX != 0) {
			// If the grid line (left) is outside of the visible area, increase it to the next one
			if(initialXPos < pixelChangeX) {
				var interval = gridAccuracy == 4 ? -1000 : -100;
				pixelChangeX = (diff * interval) + pixelChangeX;
				initialXGrid++;
				if(
					(gridAccuracy == 4 && initialXGrid == 100) ||
					(gridAccuracy == 6 && initialXGrid == 1000)
				){
					initialXGrid = 0;
				}
			}
			initialXPos -= pixelChangeX;
		}
		
		// Find the closest solid grid coordinates (4 or 6 digits)
		var remainderY = gridAccuracy == 4 ? parseInt(initialYGrid.substring(2, 4)) : parseInt(initialYGrid.substring(3, 4));
		// Convert the remainder to the length in meters
		remainderY = remainderY * 10;
		var pixelChangeY = remainderY * diff;
		initialYGrid = gridAccuracy == 4 ? parseInt(initialYGrid.substring(0, 2)) : parseInt(initialYGrid.substring(0, 3));
		// If the grid line (bottom) is outside of the visible area, increase it to the next one
		if(remainderY != 0) {
			if(initialYPos + pixelChangeY > this.height) {
				var interval = gridAccuracy == 4 ? -1000 : -100;
				pixelChangeY = (diff * interval) + pixelChangeY;
				initialYGrid++;
				if(
					(gridAccuracy == 4 && initialYGrid == 100) ||
					(gridAccuracy == 6 && initialYGrid == 1000)
				){
					initialYGrid = 0;
				}
			}
			initialYPos += pixelChangeY;
		}
	}
	
	this.completeGridCalc = function(diff) {
		var firstX = initialXPos;
		var firstY = initialYPos;
		diff = gridAccuracy == 4 ? diff * 1000 : diff * 100;
		while(firstX > 0 - minGridSize) {
			firstX -= diff;
			if(initialXGrid == 0) {
				if(gridAccuracy == 4) {
					initialXGrid = 99;
				} else {
					initialXGrid = 999;
				}
			} else {
				initialXGrid--;
			}
		}
		while(firstY > 0 - minGridSize) {
			firstY -= diff;
			if(gridAccuracy == 4 && initialYGrid == 100) {
				initialYGrid = 0;
			} else if(gridAccuracy == 6 && initialYGrid == 1000) {
				initialYGrid = 0;
			} else {
				initialYGrid++;
			}
		}
		this.gridData.set = true;
		this.gridData.x = firstX;
		this.gridData.y = firstY;
		this.gridData.size = diff;
		this.gridData.accuracy = gridAccuracy;
		this.gridData.xGrid = initialXGrid;
		this.gridData.yGrid = initialYGrid;
		// Build the entire grid
		this.drawGrid(firstX, firstY, diff);
	}
	
	/**
	 * Get the canvas element (useful for other controller classes
	 *
	 * @method getCanvasElement
	 * @return {Object} The canvas DOM object
	 */
	this.getCanvasElement = function() {
		return this.gridLayer;
	}
	
	/**
	 * Get the transformation value of a unit
	 */
	this.getTransformValues = function(e) {
		var atrString = e.getAttribute("transform") ? e.getAttribute("transform") : "";
		var attributes = new Array("translate", "rotate", "scale", "skew", "matrix");
		var values = {};
		for(var i = 0; i < attributes.length; i++) {
			var regexp = new RegExp(attributes[i] + "\\(([^)]+)\\)");
			// Get the original value
			var str = atrString.match(regexp) ? atrString.match(regexp)[1] : false;
			// Add back the parentheses
			if(str) {
				values[attributes[i]] = str.split(",");
			}
		}
		return values;
	}
	
	/**
	 * Update the transform attribute because it has multiple properties. Setting a sub-attribute to false will remove it
	 */
	this.updateTransformValues = function(e, o) {
		var atrString = e.getAttribute("transform") ? e.getAttribute("transform") : "";
		var attributes = new Array("translate", "rotate", "scale", "skew", "matrix");
		var values = new Array();
		for(var i = 0; i < attributes.length; i++) {
			var regexp = new RegExp(attributes[i] + "\\(([^)]+)\\)");
			// Get the original value
			var str = atrString.match(regexp) ? atrString.match(regexp)[1] : false;
			// Update with the new value
			var str = typeof o[attributes[i]] !== "undefined" ? o[attributes[i]] : str;
			// Add back the parentheses
			if(str) {
				values.push(attributes[i] + "(" + str + ")");
			}
		}
		e.setAttributeNS(null, "transform", values.join(" "));
	}
	
	///////////////////////////////////////////////////////////////////////////////////////////////
	
	// Create the canvas SVG groups and attach it to the container supplied by the user
	if(document.getElementById(container)) {
		// Establish a variable for the svg container
		this.container = document.getElementById(container);
		this.imageLayer = document.createElementNS(this.xmlns, "g");
		this.imageLayer.setAttribute("id", "image-layer");
		this.imageLayer.setAttribute("width", w);
		this.imageLayer.setAttribute("height", h);
		this.imageLayer.setAttribute("version", "1.1");
		this.imageLayer.setAttribute("xmlns:xlink", this.xmlnsxlink);
		this.gridLayer = document.createElementNS(this.xmlns, "g");
		this.gridLayer.setAttribute("id", "grid-layer");
		this.gridLayer.setAttribute("width", w);
		this.gridLayer.setAttribute("height", h);
		this.gridLayer.setAttribute("version", "1.1");
		this.gridLayer.setAttribute("xmlns:xlink", this.xmlnsxlink);
		this.symbolLayer = document.createElementNS(this.xmlns, "g");
		this.symbolLayer.setAttribute("id", "symbol-layer");
		this.symbolLayer.setAttribute("width", w);
		this.symbolLayer.setAttribute("height", h);
		this.symbolLayer.setAttribute("version", "1.1");
		this.symbolLayer.setAttribute("xmlns:xlink", this.xmlnsxlink);
		this.container.appendChild(this.imageLayer);
		this.container.appendChild(this.gridLayer);
		this.container.appendChild(this.symbolLayer);
	} else {
		console.error("Canvas element doesn't exist. Got " + document.getElementById(container) + " when looking for \"#" + container + "\".");
	}
	
	// Set the click functionality
	this.container.addEventListener("click", function(e) {
		if(Controller.clickFunction && e.which == 1) {
			Controller.clickFunction(e);
		}
	});
	
	// Set the move functionality
	this.container.addEventListener("mousemove", function(e) {
		if(Controller.moveFunction) {
			Controller.moveFunction(e)
		}
	});
	
	// Set the mouseup functionality
	this.container.addEventListener("mouseup", function(e) {
		if(Controller.mouseUpFunction && e.which == 1) {
			Controller.mouseUpFunction(e)
		}
	});
	
	// Set the mouseout functionality
	this.container.addEventListener("mouseout", function(e) {
		
	});
}

///////////////////////////////////////////////////////////////////////////////////////////////////
// BACKGROUND IMAGE FUNCTIONS
///////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Add a background image to the ops graphics
 *
 * @method setImage
 */
GraphicsBuilder.prototype.setImage = function(x, y, w, h, scale, src) {
	this.bgData.e = this.drawImage(x, y, w, h, scale, src);
	// Ensure that this is always on the bottom of the stack
	this.imageLayer.insertBefore(this.bgData.e, this.gridLayer.firstChild);
}

///////////////////////////////////////////////////////////////////////////////////////////////////
// GRID FUNCTIONS
///////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Create a grid based on two adjacent grid lines
 *
 * @method gridFromAdjacentLines
 */
GraphicsBuilder.prototype.gridFromAdjacentLines = function(g, o) {
	this.removeGrid();
	if(typeof o === "undefined") {
		o = {};
	}
	var accuracy = typeof o.accuracy !== "undefined" && (o.accuracy == 4 || o.accuracy == 6) ? o.accuracy : 4;
	// Check the grid
	g = this.checkGrid(g, {accuracy: accuracy});
	if(g) {
		this.setInitialGrid(g, accuracy);
		// Set click and move functions
		this.clickFunction = this.placeFirstAdjPoint;
		this.moveFunction = this.crosshair;
		this.canDrag = false;
	} else {
		console.error("Invalid grid given");
	}
}

/**
 * Create a grid based on two known points
 *
 * @method gridFromKnownPoints
 */
GraphicsBuilder.prototype.gridFromKnownPoints = function(g1, g2, o) {
	this.removeGrid();
	if(typeof o === "undefined") {
		o = {};
	}
	var accuracy = typeof o.accuracy !== "undefined" && (o.accuracy == 4 || o.accuracy == 6) ? o.accuracy : 4;
	// Check the grid
	g1 = this.checkGrid(g1, {accuracy: 8});
	g2 = this.checkGrid(g2, {accuracy: 8});
	if(g1 && g2) {
		this.setInitialGrid(g1, accuracy);
		this.setSecondGrid(g2);
		var data = this.getDifference(g1, g2);
		// Set click and move functions
		this.setGridData(data);
		this.clickFunction = this.placeFirstKnownPoint;
		this.moveFunction = this.crosshair;
		this.canDrag = false;
	}
}

/**
 * Create a grid based on a known distance
 *
 * @method gridFromKnownDistance
 */
GraphicsBuilder.prototype.gridFromKnownDistance = function(g, d, u, o) {
	this.removeGrid();
	if(typeof o === "undefined") {
		o = {};
	}
	var accuracy = typeof o.accuracy !== "undefined" && (o.accuracy == 4 || o.accuracy == 6) ? o.accuracy : 4;
	// Check the grid
	g = this.checkGrid(g, {accuracy: 8});
	if(g) {
		this.setInitialGrid(g, accuracy);
		this.setKnownDistance(d, u);
		// Set click and move functions
		this.clickFunction = this.placeGridKnownDistance;
		this.moveFunction = this.crosshair;
		this.canDrag = false;
	}
}

/**
 * Remove the grid from the canvas
 *
 * @method removeGrid
 */
GraphicsBuilder.prototype.removeGrid = function() {
	if(this.gridData.g) {
		this.gridLayer.removeChild(this.gridData.g);
		this.gridData.g = null;
		this.gridData.set = false;
	}
}

/**
 * Report the grid location based on the given x/y mouse coordinates OR an event object
 *
 * @method gridToPixel
 */
GraphicsBuilder.prototype.gridToPixel = function(x, y) {
	if(this.gridData.set) {
		if(typeof y === "undefined") {
			var e = this.mousePosition(x);
			x = e.x;
			y = e.y
		} else if(!isNumeric(x) || !isNumeric(y)) {
			return false;
		}
		// Figure out what the pixel/10 meter ratio is
		if(this.gridData.accuracy == 4) {
			var s = this.gridData.size / 100;
		} else {
			var s = this.gridData.size / 10;
		}
		// Start at the initial x/y grid coordinate and keep going until the current position is found
		var cx = this.gridData.x;
		var cy = this.gridData.y;
		var gx = this.gridData.xGrid < 100 ? this.gridData.xGrid * 100 : this.gridData.xGrid * 10;
		var gy = this.gridData.yGrid < 100 ? this.gridData.yGrid * 100 : this.gridData.yGrid * 10;
		// Get the left-most grid coordinate
		while(cx > 0) {
			cx -= s;
			gx--;
			if(gx < 0) {
				gx = 9999;
			}
		}
		// Go right until the current position is reached
		while(cx + s < x) {
			cx += s;
			gx++;
			if(gx > 9999) {
				gx = 0;
			}
		}
		// Get the top-most grid coordinate
		while(cy > 0) {
			cy -= s;
			gy++;
			if(gy > 9999) {
				gy = 0;
			}
		}
		// Go down until the current position is reached
		while(cy < y) {
			cy += s;
			gy--;
			if(gy < 0) {
				gy = 9999;
			}
		}
		// Get the correct number of digits
		gx = "" + gx;
		while(gx.length < 4) {
			gx = "0" + gx;
		}
		gy = "" + gy;
		while(gy.length < 4) {
			gy = "0" + gy;
		}
		return gx + " " + gy;
	} else {
		return false;
	}
}

/**
 * Report the x/y location based on the given grid coordinates
 *
 * @method pixelToGrid
 */
GraphicsBuilder.prototype.pixelToGrid = function(gx, gy) {
	
}

/**
 * Set the colors for the different grid elements. Assumes a valid color or hex string
 *
 * @method setGridColors
 * @param {String} c4				The color of the grid square identifier circle
 * @param {String} c6				The color of the 1/10 grid square identifier circle
 * @param {String} l4				The color of the grid square identifier line
 * @param {String} l6				The color of the 1/10 grid square identifier line
 * @param {String} gzi				The color of the 00 line (grid zone identifier)
 */
GraphicsBuilder.prototype.setGridColors = function(c4, c6, l4, l6, gzi) {
	this.setGridColorsHelper(new Array(c4, c6, l4, l6, gzi));
}

/**
 * Checks a grid for validity
 *
 * @method checkGrid
 * @param g {String}				A four, six, or eight digit grid
 * @param r {Object}				Requirements to constrain the result to
 * @return {String} The corrected grid
 */
GraphicsBuilder.prototype.checkGrid = function(g, r) {
	// If there are no requirements, set it to an empty object
	if(typeof r === "undefined") {
		r = {};
	}
	// Set the actual requirements based on the input or the defaults
	var accuracy = typeof r.accuracy !== "undefined" && (r.accuracy == 4 || r.accuracy == 6 || r.accuracy == 8) ? r.accuracy : 8;
	// Ensure there are no non-numeric characters in the grid
	if(!isNaN(g)) {
		// Ensure that the correct number of digits exists
		if(g.length <= 8 && g.length > 0 && g.length % 2 == 0) {
			var g1 = g.substring(0, g.length / 2);
			var g2 = g.substring(g.length / 2, g.length);
			// If the supplied grid is more accurate than needed, remove extra digits
			// e.g. Given: 12345678 | Needed: 123567
			if(g.length > accuracy) {
				while(g1.length > accuracy / 2) {
					g1 = g1.substring(0, g1.length - 1);
					g2 = g2.substring(0, g2.length - 1);
				}
			// Else, if the supplied grid is less accurate than needed, add trailing zeroes until the correct accuracy is reached
			// e.g. Given: 123456 | Needed: 12304560
			} else if(g.length < accuracy) {
				while(g1.length < accuracy / 2) {
					g1 += "0";
					g2 += "0";
				}
			}
			return g1 + g2;
		} else {
			return false;
		}
	} else {
		return false;
	}
}

/**
 * Get the distance in meters between two grid coordinates within 1000m
 *
 * @method getDifference
 * @param g1 {String}				The first grid
 * @param g2 {String}				The second grid
 * @return {Object} The possible distances between the x, y, and straight-line in meters (q1, q2, q3, and q4))
 */
GraphicsBuilder.prototype.getDifference = function(g1, g2) {
	g1 = this.checkGrid(g1, {accuracy: 8});
	g2 = this.checkGrid(g2, {accuracy: 8});
	if(g1 && g2) {
		var x1 = parseInt(g1.substring(0, 4));
		var x2 = parseInt(g2.substring(0, 4));
		var y1 = parseInt(g1.substring(4, 8));
		var y2 = parseInt(g2.substring(4, 8));
	}
	
	// Convert g2 to ensure it is in quadrant1 in relation to g1
	if(x2 < x1) {
		x2 = 10000 + x2;
	}
	if(y2 < y1) {
		y2 = 10000 + y2;
	}
	
	// Set up the four iterations to get the change for each potential grid (based on grid zone identifiers)
	var iterations = new Array(
		new Array(x2, y2),
		new Array(-10000 + x2, y2),
		new Array(-10000 + x2, -10000 + y2),
		new Array(x2, -10000 + y2)
	);
	
	var result = new Array();
	
	for(var i = 0; i < iterations.length; i++) {
		var x = iterations[i][0] - x1;
		var y = iterations[i][1] - y1;
		var sl = Math.sqrt(Math.pow(x,2) + Math.pow(y,2));
		result.push({
			"horizontal": Math.abs(x * 10),
			"vertical": Math.abs(y * 10),
			"straightline": Math.abs(sl * 10),
			"slope": y / x
		});
	}
	return result;
}

///////////////////////////////////////////////////////////////////////////////////////////////////
// UNIT/EQUIPMENT FUNCTIONS
///////////////////////////////////////////////////////////////////////////////////////////////////
GraphicsBuilder.prototype.addSymbol = function(symbolObject) {
	this.symbolData.push(symbolObject);
	var e = symbolObject.draw(this.symbolLayer).getElement();
	e.setAttribute("id", "symbol-" + this.symbolData.length);
	e.addEventListener("mousedown", this.moveUnit);
	e.addEventListener("mouseup", this.releaseUnit);
	return this.symbolData.length - 1;
}

GraphicsBuilder.prototype.removeSymbol = function(i) {
	if(this.symbolData[i]) {
		var e = this.symbolData[i].getElement();
		this.symbolLayer.removeChild(e);
	}
	this.symbolData[i] = null;
}