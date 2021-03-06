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
	// User-defined function when a unit is selected
	this.onSelectCallback = null;
	// User-defined function when a unit is deselected
	this.offSelectCallback = null;
	// User-defined function when a unit is being moved
	this.onSymbolMove = null;
	
	// An array of units/equipment
	this.symbolData = new Array();
	// An array of units/equipment that are currently selected
	this.selectedSymbols = new Array();
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
	 * Draw a line from x1y1 to x2y2
	 * 
	 * @method drawRect
	 * @param {Number} x			The X coordinate for the top left corner
	 * @param {Number} y			The Y coordinate for the top left corner
	 * @param {Number} w			The width
	 * @param {Number} h			The height
	 * @param {Object} o			Extra options
	 * @return {Object}				The resulting DOM object
	 */
	this.drawRect = function(x, y, w, h, o) {
		if(typeof o === "undefined") {
			o = {};
		}
		var r = document.createElementNS(this.xmlns, "rect");
		r.setAttributeNS(null, "x", x);
		r.setAttributeNS(null, "y", y);
		r.setAttributeNS(null, "width", w);
		r.setAttributeNS(null, "height", h);
		if(typeof o.fill !== "undefined") {
			r.setAttributeNS(null, "fill", o.fill);
		}
		if(typeof o.fillOpacity !== "undefined") {
			r.setAttributeNS(null, "fill-opacity", o.fillOpacity);
		}
		if(typeof o.stroke !== "undefined") {
			r.setAttributeNS(null, "stroke", o.stroke);
		}
		if(typeof o.dasharray !== "undefined") {
			r.setAttributeNS(null, "stroke-dasharray", o.dasharray);
		}
		if(typeof o.dashoffset !== "undefined") {
			r.setAttributeNS(null, "stroke-dashoffset", o.dashoffset);
		}
		if(typeof o.rotate !== "undefined") {
			r.setAttributeNS(null, "transform", "rotate(" + o.rotate + ")");
		}
		return r;
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
				} else if(gridAccuracy == 6 && coord % 10 != 0) {
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
					if(coord % 10 == 0) {
						var coordString = coord / 10 + "";
						if(coord / 10 < 10) {
							// Convert "1" to "01"
							var coordString = "0" + coordString;
						}
					} else {
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
		// Reset the GraphicsBuilder mouse functions used by the grids
		this.moveFunction = null;
		this.clickFunction = null;
		this.canDrag = true;
	}

	///////////////////////////////////////////////////////////////////////////////////////////////
	// PROTECTED MOUSE-CLICK FUNCTIONS
	///////////////////////////////////////////////////////////////////////////////////////////////
	
	var initialXPos = 0;					// The x position of the first click in pixels
	var initialYPos = 0;					// The y position of the first click in pixels
	var initialXGrid = 0;					// The x position of the first grid as 4 digits
	var initialYGrid = 0;					// The y position of the first grid as 4 digits
	var secondXGrid = 0;					// The x position of the second grid as 4 digits
	var secondYGrid = 0;					// The y position of the second grid as 4 digits
	var gridSize = 0;						// The width and height of the grid square in pixels
	var distanceX1 = 0;						// The x position of the first point for known distance
	var distanceY1 = 0;						// The y position of the first point for known distance
	var distanceX2 = 0;						// The x position of the second point for known distance
	var distanceY2 = 0;						// The y position of the second point for known distance
	var knownDistance = 0;					// The known distance to be measured
	var knownDistanceUnits = null;			// The units that the known distance is to be measured in
	var gridAccuracy = 4;					// The number of digits to expand the grid to
	var originalTranslationX = new Array();	// The original translation x value for this unit
	var originalTranslationY = new Array();	// The original translation y value for this unit
	
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
		var changeX = mp.x - initialXPos;
		var changeY = mp.y - initialYPos;
		if(crosshairConstrainQ1 != 0 && crosshairConstrainQ1 != Infinity) {
			// Quadrant 1
			if(mp.x > initialXPos && mp.y < initialYPos) {
				var quadrantIndex = 0;
			// Quadrant 2
			} else if(mp.x < initialXPos && mp.y < initialYPos) {
				var quadrantIndex = 1;
			// Quadrant 3
			} else if(mp.x < initialXPos && mp.y > initialYPos) {
				var quadrantIndex = 2;
			// Quadrant 4
			} else {
				var quadrantIndex = 3;
			}
			// Normal change
			if(Math.abs(changeX) > Math.abs(changeY)) {
				var diff = Math.abs(changeX / gridData[quadrantIndex]["horizontal"]);
			} else {
				var diff = Math.abs(changeY / gridData[quadrantIndex]["vertical"]);
			}
		} else if(crosshairConstrainQ1 == Infinity) {
			// No change in X
			var diff = Math.abs(changeY / gridData[0]["vertical"]);
		} else {
			// No change in Y
			var diff = Math.abs(changeX / gridData[0]["horizontal"]);
		}
		// Ensure that the minimum width is met
		var multiplier = gridAccuracy == 4 ? 1000 : 100;
		if(diff * multiplier >= minGridSize + minGridSizeBuffer) {
			// Find the closest solid grid coordinates (4 or 6 digits)
			this.findClosestGrids(diff);
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
			// Calculate the left and top-most grid line positions (pixels) and draw the grid
			this.completeGridCalc(diff);
		}
	}
	
	///////////////////////////////////////////////////////////////////////////////////////////////
	// PROTECTED MOUSE-DOWN FUNCTIONS
	///////////////////////////////////////////////////////////////////////////////////////////////
	
	var selectBox = null;
	
	this.moveUnit = function(e) {
		e.stopPropagation();
		// Because this function is referenced by the unit, the Controller variable is used to refer to the GraphicsBuilder
		if(Controller.canDrag && e.which == 1) {
			var m = Controller.mousePosition(e);
			Controller.dragging = true;
			initialXPos = m.x;
			initialYPos = m.y;
			for(var i = 0; i < Controller.selectedSymbols.length; i++) {
				Controller.selectedSymbols[i] += ""; // TODO CONVERT ALL NUMBERS TO INTS
				var t = Controller.symbolData[Controller.selectedSymbols[i]].getTransformValues().translate;
				originalTranslationX[i] = t ? t[0] : 0;
				originalTranslationY[i] = t ? t[1] : 0;
			}
			Controller.moveFunction = Controller.changeUnitPosition;
			Controller.mouseUpFunction = Controller.releaseUnit;
		}
	}
	
	this.mouseDownToggleSelectUnit = function(e) {
		// Because this function is referenced by the unit, the Controller variable is used to refer to the GraphicsBuilder
		e.stopPropagation();
		if(e.which == 1) {
			var i = this.getAttribute("data-index");
			Controller.addSelectedSymbol(i);
			if(Controller.symbolData[i]) {
				var s = Controller.symbolData[i];
				s.flags({selected: true});
				// If the shift key is not held down, there are multiple symbols selected, and this unit is not already selected, remove all other symbols are deselected
				if(!e.shiftKey && Controller.selectedSymbols.length > 1 && s.getElement().getAttribute("data-selected") != "true") {
					var remove = new Array();
					for(var j = 0; j < Controller.selectedSymbols.length; j++) {
						if(Controller.selectedSymbols[j] != i) {
							remove.push(Controller.selectedSymbols[j]);
						}
					}
					Controller.removeSelectedSymbol(remove);
				}
			}
		}
	}
	
	this.selectionBoxMouseDown = function(e) {
		if(e.which == 1) {
			if(selectBox) {
				Controller.releaseSelectionBox(e);
			}
			Controller.dragging = true;
			var m = Controller.mousePosition(e);
			initialXPos = m.x;
			initialYPos = m.y;
			Controller.moveFunction = Controller.drawSelectionBox;
			Controller.mouseUpFunction = Controller.releaseSelectionBox;
			selectBox = Controller.drawRect(initialXPos, initialYPos, 1, 1, {fill: "gray", stroke: "gray", strokeWidth: 2, fillOpacity: "0.5"});
			Controller.symbolLayer.appendChild(selectBox);
		}
	}
	
	///////////////////////////////////////////////////////////////////////////////////////////////
	// PROTECTED MOUSE-UP FUNCTIONS
	///////////////////////////////////////////////////////////////////////////////////////////////
	
	this.releaseUnit = function(e) {
		if(e.which == 1) {
			Controller.dragging = false;
			Controller.moveFunction = null;
			Controller.mouseUpFunction = null;
			originalTranslationX = new Array();
			originalTranslationY = new Array();
		}
	}
	
	this.mouseUpToggleSelectUnit = function(e) {
		if(e.which == 1) {
			// Because this function is referenced by the unit, the Controller variable is used to refer to the GraphicsBuilder
			var i = this.getAttribute("data-index");
			if(Controller.symbolData[i]) {
				var s = Controller.symbolData[i];
				// Determine if the unit was dragged or not
				if(s.flags("dragged")) {
					if(s.getElement().getAttribute("data-selected") == "false") {
						// If the unit was dragged, and the selected attribute has not been added, the unit is selected
						s.getElement().setAttribute("data-selected", true);
						// If the unit was dragged, and the selected attribute has been added, the unit(s) remain selected
						for(var j = 0; j < Controller.selectedSymbols.length; j++) {
							Controller.symbolData[Controller.selectedSymbols[j]].flags({dragged: false});
						}
						// User-defined function
						if(Controller.onSelectCallback) {
							var array = new Array();
							for(var j = 0; j < Controller.selectedSymbols.length; j++) {
								array.push(Controller.symbolData[Controller.selectedSymbols[j]]);
							}
							Controller.onSelectCallback(array, Controller.mousePosition(e));
						}
					} else {
						// If the unit was dragged, and the selected attribute has been added, the unit(s) remain selected
						for(var j = 0; j < Controller.selectedSymbols.length; j++) {
							Controller.symbolData[Controller.selectedSymbols[j]].flags({dragged: false});
						}
					}
				} else {
					if(s.getElement().getAttribute("data-selected") == "false") {
						// If the unit was not dragged, and the selected attribute has not been added, the unit is selected
						s.flags({dragged: false}).getElement().setAttribute("data-selected", true);
						// User-defined function
						if(Controller.onSelectCallback) {
							var array = new Array();
							for(var j = 0; j < Controller.selectedSymbols.length; j++) {
								array.push(Controller.symbolData[Controller.selectedSymbols[j]]);
							}
							Controller.onSelectCallback(array, Controller.mousePosition(e));
						}
					} else {
						// If the unit was not dragged, and the selected attribute has already been added, the unit is deselected
						if(!e.shiftKey && Controller.selectedSymbols.length > 1) {
							// If the shift key is not held down and there are multiple symbols selected, select ONLY this symbol
							var remove = new Array();
							for(var j = 0; j < Controller.selectedSymbols.length; j++) {
								if(Controller.selectedSymbols[j] != i) {
									remove.push(Controller.selectedSymbols[j]);
								}
							}
							Controller.removeSelectedSymbol(remove);
						} else {
							// If the shift key is held down, or there are not multiple symbols selected, deselect this symbol (if multiple, all others will remain selected)
							Controller.removeSelectedSymbol(i);
						}
					}
				}
			}
		}
	}
	
	this.releaseSelectionBox = function(e) {
		Controller.dragging = false;
		Controller.symbolLayer.removeChild(selectBox);
		selectBox = null;
		Controller.moveFunction = null;
		Controller.mouseUpFunction = null;
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
	var projectedX = 0;
	var projectedY = 0;
	
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
		
		if(crosshairConstrainQ1 != 0 && crosshairConstrainQ1 != Infinity) {
			// Quadrant 1
			if(mp.x > initialXPos && mp.y < initialYPos) {
				var slope = crosshairConstrainQ1;
			// Quadrant 2
			} else if(mp.x < initialXPos && mp.y < initialYPos) {
				var slope = crosshairConstrainQ2;
			// Quadrant 3
			} else if(mp.x < initialXPos && mp.y > initialYPos) {
				var slope = crosshairConstrainQ3;
			// Quadrant 4
			} else {
				var slope = crosshairConstrainQ4;
			}
			var changeX = mp.x - initialXPos;
			var changeY = mp.y - initialYPos;
			// Normal change
			if(Math.abs(changeX) > Math.abs(changeY)) {
				var x = initialXPos + changeX;
				var y = initialYPos - (changeX * slope);
			} else {
				var y = initialYPos + changeY;
				var x = initialXPos - (changeY / slope);
			}
		} else if(crosshairConstrainQ1 == Infinity) {
			// No change in X
			var x = initialXPos;
			var y = mp.y;
		} else {
			// No change in Y
			var y = initialYPos;
			var x = mp.x;
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
			for(var i = 0; i < Controller.selectedSymbols.length; i++) {
				var x = originalTranslationX[i] + (m.x - initialXPos);
				var y = originalTranslationY[i] + (m.y - initialYPos);
				var obj = this.symbolData[this.selectedSymbols[i]];
				// Don't set the dragged flag until a certain threshhold has been reached (used to display the context menu on the canvas)
				if(Math.abs(m.x - initialXPos) > 5 || Math.abs(m.y - initialYPos) > 5) {
					obj.flags({dragged: true}).settings({translate: x + "," + y});
				} else {
					// Once the threshhold has been reached, the flag will not reset (must be changed in another function)
					obj.settings({translate: x + "," + y});
				}
			}
			// User-defined function
			if(this.onSymbolMove) {
				var array = new Array();
				for(var j = 0; j < this.selectedSymbols.length; j++) {
					array.push(this.symbolData[this.selectedSymbols[j]]);
				}
				this.onSymbolMove({symbols: array, mouse: {x: m.x, y: m.y}});
			}
		} else {
			this.releaseUnit(e);
		}
	}
	
	this.drawSelectionBox = function(e) {
		if(this.canDrag && this.dragging) {
			var m = this.mousePosition(e);
			var x = m.x;
			var y = m.y;
			var selectWidth = x - initialXPos;
			var selectHeight = y - initialYPos;
			if(selectWidth > 0) {
				var x1 = initialXPos;
				var x2 = initialXPos + selectWidth;
				selectBox.setAttribute("width", selectWidth);
			} else {
				selectWidth = Math.abs(selectWidth);
				var x1 = initialXPos - selectWidth;
				var x2 = initialXPos;
				selectBox.setAttribute("x", initialXPos - selectWidth);
				selectBox.setAttribute("width", selectWidth);
			}
			if(selectHeight > 0) {
				var y1 = initialYPos;
				var y2 = initialYPos + selectHeight;
				selectBox.setAttribute("height", selectHeight);
			} else {
				selectHeight = Math.abs(selectHeight);
				var y1 = initialYPos - selectHeight;
				var y2 = initialYPos;
				selectBox.setAttribute("y", initialYPos - selectHeight);
				selectBox.setAttribute("height", selectHeight);
			}
			// Iterate through all the symbols and select the ones that are within the bounding box
			var selected = new Array();
			for(var i = 0; i < this.symbolData.length; i++) {
				if(Controller.symbolData[i]) {
					var s = Controller.symbolData[i].getTransformValues().translate;
					if(typeof s === "undefined") {
						s = new Array(0, 0);
					}
					if(s[0] >= x1 && s[0] <= x2 && s[1] >= y1 && s[1] <= y2) {
						selected.push(i);
					}
				}
			}
			this.addSelectedSymbol(selected, true);
			// If something was selected, call the user-defined function
			if(selected.length > 0) {
			// User-defined function
				if(Controller.onSelectCallback) {
					var array = new Array();
					for(var j = 0; j < Controller.selectedSymbols.length; j++) {
						array.push(Controller.symbolData[Controller.selectedSymbols[j]]);
					}
					Controller.onSelectCallback(array, m);
				}
			}
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
	this.setTransformValues = function(e, o) {
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
			if(str !== false) {
				console.log(attributes[i], str);
				values.push(attributes[i] + "(" + str + ")");
			} else {
				console.log("no", attributes[i], str);
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
		this.imageLayer.setAttribute("version", "1.1");
		this.imageLayer.setAttribute("xmlns:xlink", this.xmlnsxlink);
		this.gridLayer = document.createElementNS(this.xmlns, "g");
		this.gridLayer.setAttribute("id", "grid-layer");
		this.gridLayer.setAttribute("version", "1.1");
		this.gridLayer.setAttribute("xmlns:xlink", this.xmlnsxlink);
		this.symbolLayer = document.createElementNS(this.xmlns, "g");
		this.symbolLayer.setAttribute("id", "symbol-layer");
		this.symbolLayer.setAttribute("version", "1.1");
		this.symbolLayer.setAttribute("xmlns:xlink", this.xmlnsxlink);
		this.container.appendChild(this.imageLayer);
		this.container.appendChild(this.gridLayer);
		this.container.appendChild(this.symbolLayer);
	} else {
		console.error("Canvas element doesn't exist. Got " + document.getElementById(container) + " when looking for \"#" + container + "\".");
	}
	
	// Set the mousedown functionality
	this.container.addEventListener("mousedown", function(e) {
		if(e.which == 1) {
			e.preventDefault();
			e.stopPropagation();
			// If there is a function defined, use it - else, use the default selection box
			if(Controller.clickFunction) {
				Controller.clickFunction(e);
			} else {
				Controller.selectionBoxMouseDown(e);
			}
			if(Controller.selectedSymbols.length > 0) {
				// Manually deselect all selected symbols
				for(var i = 0; i < Controller.selectedSymbols.length; i++) {
					Controller.symbolData[Controller.selectedSymbols[i]].flags({selected: false, dragged: false}).getElement().setAttribute("data-selected", false);
				}
				Controller.removeSelectedSymbol();
			}
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
		if(Controller.mouseOutFunction) {
			Controller.mouseOutFunction(e)
		}
	});
	
	var moveValue = 1;
	var moveDirection = null;
	var numberOfMoves = 0;
	var moveIncrement = 5;
	// Set various keypress functions
	document.addEventListener("keydown", function(e) {
		switch(e.keyCode) {
			// Left key
			case(37):
				thisDirection = "left";
				if(moveDirection == thisDirection) {
					moveValue = Math.ceil(numberOfMoves / moveIncrement);
				} else {
					moveValue = 1;
					numberOfMoves = 0;
					moveDirection = thisDirection;
				}
				for(var i = 0; i < Controller.selectedSymbols.length; i++) {
					Controller.symbolData[Controller.selectedSymbols[i]].translate(-(moveValue), 0, true);
				}
				numberOfMoves++;
				break;
			// Right key
			case(39):
				thisDirection = "right";
				if(moveDirection == thisDirection) {
					moveValue = Math.ceil(numberOfMoves / moveIncrement);
				} else {
					moveValue = 1;
					numberOfMoves = 0;
					moveDirection = thisDirection;
				}
				for(var i = 0; i < Controller.selectedSymbols.length; i++) {
					Controller.symbolData[Controller.selectedSymbols[i]].translate(moveValue, 0, true);
				}
				numberOfMoves++;
				break;
			// Up key
			case(38):
				thisDirection = "up";
				if(moveDirection == thisDirection) {
					moveValue = Math.ceil(numberOfMoves / moveIncrement);
				} else {
					moveValue = 1;
					numberOfMoves = 0;
					moveDirection = thisDirection;
				}
				for(var i = 0; i < Controller.selectedSymbols.length; i++) {
					Controller.symbolData[Controller.selectedSymbols[i]].translate(0, -(moveValue), true);
				}
				numberOfMoves++;
				break;
			// Down key
			case(40):
				thisDirection = "down";
				if(moveDirection == thisDirection) {
					moveValue = Math.ceil(numberOfMoves / moveIncrement);
				} else {
					moveValue = 1;
					numberOfMoves = 0;
					moveDirection = thisDirection;
				}
				for(var i = 0; i < Controller.selectedSymbols.length; i++) {
					Controller.symbolData[Controller.selectedSymbols[i]].translate(0, moveValue, true);
				}
				numberOfMoves++;
				break;
		}
	});
	document.addEventListener("keyup", function(e) {
		moveValue = 1;
		moveDirection = null;
		numberOfMoves = 0;
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
	this.imageLayer.innerHTML = "";
	// Append the element
	this.imageLayer.appendChild(this.bgData.e);
}

GraphicsBuilder.prototype.moveImage = function(x, y, add) {
	if(typeof add === "undefined") {
		add = false;
	}
	if(typeof x !== "undefined" && x !== false) {
		var o = add ? parseFloat(this.bgData.e.getAttribute("x")) + x : x;
		this.bgData.e.setAttribute("x", o);
	}
	if(typeof y !== "undefined" && y !== false) {
		var o = add ? parseFloat(this.bgData.e.getAttribute("y")) + y : y;
		this.bgData.e.setAttribute("y", o);
	}
}

GraphicsBuilder.prototype.scaleImage = function(s) {
	if(typeof s !== "undefined" && s > 0) {
		this.setTransformValues(this.bgData.e, {"scale": s});
	}
}

GraphicsBuilder.prototype.rotateImage = function(s) {
	if(typeof s !== "undefined" && s >= -360 && s <= 360) {
		this.setTransformValues(this.bgData.e, {"rotate": s});
	}
}

///////////////////////////////////////////////////////////////////////////////////////////////////
// GRID FUNCTIONS
///////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @method checkGridValues
 * Checks the grid data entered for correctness
 * Result codes: 0=success, 1=missing parameter, 2=malformed value
 * 
 * @param type		{Integer}					The mode to use for this grid (1-3)
 * @param i1		{String}					The first grid (4-digit or 6-digit if type=1 || 8-digit if type=2 or type=3)
 * @param i2		{String|Integer}			The second grid if type=2 || The known distance if type=35
 * @param i3		{String}					The known distance units if type=35
 * @return			{Object}					The result code and the properly formatted data
 */
GraphicsBuilder.prototype.checkGridValues = function(type, i1, i2, i3) {
	type = typeof type !== "undefined" && type >= 1 && type <= 3 ? type : 0;
	var obj = {
		success: true,
		code: 0,
		data: new Array()
	};
	// CHECK THE FIRST VALUE (TYPES 1-3)
	if(type > 0) {
		if(typeof i1 === "undefined" || i1 == "") {
			obj.data[0] = null;
		} else if(isNaN(i1) || (i1.length != 4 && i1.length != 6 && i1.length != 8)) {
			obj.data[0] = false;
		} else {
			obj.data[0] = i1;
		}
	}
	// CHECK THE SECOND VALUE (TYPES 2 & 3)
	if(type > 1) {
		if(typeof i2 === "undefined" || i2 == "") {
			obj.data[1] = null;
		} else if(isNaN(i2)) {
			obj.data[1] = false;
		} else if(type == 2 && ((i2.length != 4 && i2.length != 6 && i2.length != 8) || (parseInt(i2) == parseInt(i1)))) {
			obj.data[1] = false;
		} else if(type == 3 && i2 <= 0) {
			obj.data[1] = false;
		} else {
			obj.data[1] = type ==  2 ? i2 : parseFloat(i2);
		}
	}
	// CHECK THE THIRD VALUE (TYPE 3)
	if(type > 2) {
		var vals = new Array("m", "ft", "yd", "mi", "km");
		if(typeof i3 === "undefined") {
			obj.data[2] = null;
		} else if(vals.indexOf(i3) == -1) {
			obj.data[2] = false;
		} else {
			obj.data[2] = i3;
		}
	}
	
	// Get the success status and the result code
	if(obj.data.length == 0) {
		obj.success = false;
		obj.code = 1;
	} else {
		for(var i = 0; i < type; i++) {
			if(obj.data[i] === null) {
				obj.success = false;
				obj.code = 1;
				break;
			} else if (obj.data[i] === false) {
				obj.success = false;
				obj.code = 2;
			}
		}
	}
	return obj;
}

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
	if(this.checkGridValues(1, g).success) {
		this.setInitialGrid(g, accuracy);
		// Set click and move functions
		this.clickFunction = this.placeFirstAdjPoint;
		this.moveFunction = this.crosshair;
		this.canDrag = false;
	} else {
		console.error("error", g);
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
	if(this.checkGridValues(2, g1, g2).success) {
		this.setInitialGrid(g1, accuracy);
		this.setSecondGrid(g2);
		var data = this.getDifference(g1, g2);
		// Set click and move functions
		this.setGridData(data);
		this.clickFunction = this.placeFirstKnownPoint;
		this.moveFunction = this.crosshair;
		this.canDrag = false;
	} else {
		console.error("error", g1, g2);
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
	if(this.checkGridValues(3, g, d, u).success) {
		this.setInitialGrid(g, accuracy);
		this.setKnownDistance(d, u);
		// Set click and move functions
		this.clickFunction = this.placeGridKnownDistance;
		this.moveFunction = this.crosshair;
		this.canDrag = false;
	} else {
		console.error("error", g, d, u);
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
		g = g.toString();
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
		x2 = 1000 + x2;
	}
	if(y2 < y1) {
		y2 = 1000 + y2;
	}
	
	// Set up the four iterations to get the change for each potential grid (based on grid zone identifiers)
	var iterations = new Array(
		new Array(x2, y2),
		new Array(-1000 + x2, y2),
		new Array(-1000 + x2, -1000 + y2),
		new Array(x2, -1000 + y2)
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
GraphicsBuilder.prototype.addSymbol = function(symbolObject, draw) {
	this.symbolData.push(symbolObject);
	var e = symbolObject.draw(this.symbolLayer).getElement();
	var Controller = this;
	e.setAttribute("id", "symbol-" + (this.symbolData.length - 1));
	e.setAttribute("data-index", this.symbolData.length - 1);
	e.setAttribute("data-selected", false);
	e.addEventListener("mousedown", this.mouseDownToggleSelectUnit);
	e.addEventListener("mouseup", this.mouseUpToggleSelectUnit);
	e.addEventListener("mousedown", this.moveUnit);
	return this.symbolData.length - 1;
}

GraphicsBuilder.prototype.getSymbol = function(i) {
	if(typeof this.symbolData[i] !== "undefined") {
		return this.symbolData[i];
	} else {
		return false;
	}
}

GraphicsBuilder.prototype.removeSymbol = function(i) {
	if(this.symbolData[i]) {
		// If the symbol is selected, remove it
		if(this.selectedSymbols.indexOf(i) != -1) {
			this.removeSelectedSymbol(i);
		}
		var e = this.symbolData[i].getElement();
		this.symbolLayer.removeChild(e);
	}
	this.symbolData[i] = null;
}

// Returns the selected symbols
GraphicsBuilder.prototype.addSelectedSymbol = function(i, select) {
	if(typeof i !== "undefined") {
		if(typeof i === "string") {
			i = new Array(i);
		}
		
		// If select is enabled, remove the current selected units
		if(typeof select !== "undefined" && select === true) {
			this.removeSelectedSymbol();
		}
		
		// Iterate through the array of symbols to add
		for(var j = 0; j < i.length; j++) {
			i[j] += ""; // TODO CONVERT ALL NUMBERS TO INTS
			if(this.symbolData[i[j]] && this.selectedSymbols.indexOf(i[j]) == -1) {
				this.selectedSymbols.push(i[j]);
			}
			// If select is enabled, add the needed attributes to the new unit
			if(typeof select !== "undefined" && select === true) {
				this.symbolData[i[j]].flags({selected: true}).getElement().setAttribute("data-selected", true);
			}
		}
		
		// If select is enabled, trigger the user-defined function
		if(typeof select !== "undefined" && select === true && this.onSelectCallback) {
			// User-defined function
			var array = new Array();
			for(var k = 0; k < this.selectedSymbols.length; k++) {
				array.push(this.symbolData[this.selectedSymbols[k]]);
			}
			this.onSelectCallback(array);
		}
	}
	return this.selectedSymbols;
}

GraphicsBuilder.prototype.getSelectedSymbols = function() {
	var array = new Array();
	for(var j = 0; j < this.selectedSymbols.length; j++) {
		array.push(this.symbolData[this.selectedSymbols[j]]);
	}
	return array;
}

GraphicsBuilder.prototype.removeSelectedSymbol = function(i) {
	var originalLength = this.selectedSymbols.length;
	if(typeof i !== "undefined") {
		if(typeof i === "string") {
			i = new Array(i);
		}
		// Iterate through the array of symbols to remove
		for(var j = 0; j < i.length; j++) {
			i[j] += ""; // TODO CONVERT ALL NUMBERS TO INTS
			if(this.selectedSymbols.indexOf(i[j]) != -1) {
				this.symbolData[i[j]].flags({selected: false}).getElement().setAttribute("data-selected", false);
				this.selectedSymbols.splice(this.selectedSymbols.indexOf(i[j]), 1);
			}
		}
	} else {
		for(var i = 0; i < this.selectedSymbols.length; i++) {
			this.symbolData[this.selectedSymbols[i]].flags({selected: false}).getElement().setAttribute("data-selected", false);
		}
		this.selectedSymbols = new Array();
	}
	// If the length is less, fire the onSelectCallback
	if(this.selectedSymbols.length < originalLength) {
		// User-defined function
		if(this.offSelectCallback) {
			var array = new Array();
			for(var j = 0; j < this.selectedSymbols.length; j++) {
				array.push(this.symbolData[this.selectedSymbols[j]]);
			}
			this.offSelectCallback(array);
		}
	}
	return this.selectedSymbols;
}