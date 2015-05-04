function Unit(id, icn, ech, amplifiers, settings, flags) {
	this.IDENTITY = null;
	this.ICON = null;
	this.ECHELON = null;
	this.AMPLIFIERS = {
		1: null,
		2: null,
		3: null,
		4: null,
		5: null,
		6: null,
		7: null,
		8: null,
		9: null,
		10: {
			"a": null,
			"b": null
		},
		11: {
			"a": null,
			"b": null
		},
		12: null,
		13: null,
		14: null
	}
	this.SETTINGS = {
		type: "full",
		translate: false,
		rotate: false,
		scale: .5,
		skew: false,
		matrix: false
	}
	this.SVG_GROUP = null;
	this.FLAGS = {
		dragged: false,
		linked: false,
		selected: false,
		selectedIndex: -1
	}
	
	this.getTransformValues = function(e) {
		if(typeof e === "undefined") {
			e = this.SVG_GROUP;
		}
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
	
	this.setTransformValues = function(e) {
		if(typeof e === "undefined") {
			e = this.SVG_GROUP;
		}
		var atrString = e.getAttribute("transform") ? e.getAttribute("transform") : "";
		var attributes = new Array("translate", "rotate", "scale", "skew", "matrix");
		var values = new Array();
		for(var i = 0; i < attributes.length; i++) {
			var regexp = new RegExp(attributes[i] + "\\(([^)]+)\\)");
			// Get the original value
			var str = atrString.match(regexp) ? atrString.match(regexp)[1] : false;
			// Update with the new value
			var str = typeof this.SETTINGS[attributes[i]] !== "undefined" ? this.SETTINGS[attributes[i]] : str;
			// Add back the parentheses
			if(str) {
				values.push(attributes[i] + "(" + str + ")");
			}
		}
		e.setAttributeNS(null, "transform", values.join(" "));
	}
	
	// Check that all of the fields are correct and that the definitions exist
	this.SVG_GROUP = document.createElementNS("http://www.w3.org/2000/svg", "g");
	this.identity(id);
	this.icon(icn);
	this.echelon(ech);
	if(typeof amplifiers !== "undefined") {
		this.amplifiers(amplifiers);
	}
	if(typeof settings !== "undefined") {
		this.settings(settings);
	}
	if(typeof flags !== "undefined") {
		this.flags(flags);
	}
	
	return this;
}

/**
 * Update the identity of this unit
 *
 * @method identity
 * @param {String} id							The new ID for this unit
 * @return {Object} this
 */
Unit.prototype.identity = function(id) {
	if(this.identities(id)) {
		this.IDENTITY = id;
	} else {
		console.error("The given ID (" + id + ") is not valid.");
	}
	return this;
}

/**
 * Update the icon of this unit
 *
 * @method icon
 * @param {String} icn							The new icon for this unit
 * @return {Object} this
 */
Unit.prototype.icon = function(icn) {
	if(this.icons(icn)) {
		this.ICON = icn;
	} else {
		console.error("The given icon (" + icn + ") is not valid.");
	}
	return this;
}

/**
 * Update the echelon of this unit
 *
 * @method echelon
 * @param {String} ech							The new echelon for this unit
 * @return {Object} this
 */
Unit.prototype.echelon = function(ech) {
	if(this.echelons(ech)) {
		this.ECHELON = ech;
	} else {
		console.error("The given echelon (" + ech + ") is not valid.");
	}
	return this;
}

/**
 * TODO
 * Update the modifiers for this unit
 *
 * @method modifier
 * @param {String} icn							The modifier to add to this unit
 * @return {Object} this
 */
Unit.prototype.modifiers = function(m) {
	return this;
}

/**
 * Update the amplifiers for this unit
 *
 * @method amplifier
 * @param {Object} a							The amplifiers for this unit (1-5, 7-14)
 * @return {Object} this
 */
Unit.prototype.amplifiers = function(a) {
	if(typeof a !== "undefined") {
		for(var i = 1; i <= 14; i++) {
			if(typeof a[i] !== "undefined") {
				var s = a[i];
				switch(i) {
					case(1):
						/*
						Indicates whether the unit is reinforced, detached, or both.
						*/
						if(s == "r" || s == "d") {
							this.AMPLIFIERS[i] = s;
						} else {
							this.AMPLIFIERS[i] = null;
						}
						break;
					case(2):
						/*
						An accepted code that shows the country indicator.
						*/
						if(!s || s == "false") {
							this.AMPLIFIERS[i] = null;
						} else {
							this.AMPLIFIERS[i] = s;
						}
						break;
					case(3):
						/*
						A unique alphanumeric designation that identifies the unit being displayed.
						Note: When showing unique alphanumeric designations for combat arms regimental units (air defense
						artillery, armor, aviation, cavalry, field artillery, infantry, and special forces) the following rules apply:
						No regimental headquarters: A dash (-) will be used between the battalion and the regimental designation
						where there is no regimental headquarters. (Example: A/6-37 for A Battery, 6th Battalion, 37th Field Artillery)
						Regimental headquarters: A slash (/) will be used between the battalion and the regimental designation
						where there is a regimental headquarters of an active operational unit to show continuity of the units.
						(Example: F/2/11 for F Troop, 2d Squadron/11th Armored Cavalry Regiment)
						*/
					case(4):
						/*
						Number or title of the next higher formation of the unit being displayed.
						*/
					case(5):
						/*
						Free text staff comments for information required by the commander. Can also be used for unit
						location if required.
						*/
						if(typeof s == "string") {
							if(s == "") {
								this.AMPLIFIERS[i] = null;
							} else {
								this.AMPLIFIERS[i] = s;
							}
						}
						break;
					case(7):
						/*
						Quantity that identifies the number of items present.
						*/
						if(!isNaN(s) && s > 0) {
							this.AMPLIFIERS[i] = s;
						}
						break;
					case(8):
						/*
						Task force amplifier placed over the echelon. (See table 4-6 on page 4-30.)
						*/
					case(9):
						/*
						Feint or dummy indicator shows that the element is being used for deception purposes.
						Note: The dummy indicator appears as shown in figure 3-1 on page 3-4 and can be used for all
						framed symbol sets. For control measures, it is a control measure symbol used in conjunction
						with other control measures. (See table 8-6 on page 8-71 for feint or dummy symbols.)
						*/
						if(typeof s === "boolean") {
							this.AMPLIFIERS[i] = s;
						}
						break;
					
					case(10):
						/*
						a.	Headquarters staff indicator identifies symbol as a headquarters. (See figure 4-3 on page
						4-11.)
						b.	Offset location indicator is used to denote precise location of headquarters or to declutter
						multiple unit locations and headquarters. (See figure 4-3 on page 4-11.)
						*/
						if(typeof s.a === "boolean") {
							this.AMPLIFIERS[i] = s;
						}
						break;
					case(11):
						/*
						a. The direction of movement arrow indicates the direction the symbol is moving or will move.
						b. The offset location indicator without the arrow is used to denote precise location of units or to
							declutter multiple unit locations, except for headquarters. (See figure 4-2 on page 4-34.)
						*/
						break;
					case(12):
						/*
						Combat effectiveness of unit or equipment displayed. (See Table 4-9 on page 4-36.)
						*/
						break;
					case(13):
						/*
						Mobility indicator of the equipment being displayed. (See figure 5-1 on page 5-15 and table 5-3
						on page 5-13.)
						*/
						break;
					case(14):
						/*
						Indicates what type of headquarters element is being displayed. (See table 4-8 on page 4-35.)
						*/
						this.AMPLIFIERS[i] = s;
						break;
				}
			}
		}
	}
	return this;
}

/**
 * Update the graphical settings for this unit
 *
 * @method settings
 * @param {Object} s							The settings to add or overwrite
 * @return {Object} this
 */
Unit.prototype.settings = function(s) {
	for(var k in s) {
		switch(k) {
			case("type"):
				if(s[k] == "color" || s[k] == "full" || s[k] == "min") {
					this.SETTINGS[k] = s[k];
				} else {
					console.error("The setting value (" + s[k] + ") for " + k + " is not valid.");
				}
				break;
			case("translate"):
				this.SETTINGS[k] = s[k];
				this.setTransformValues();
				break;
			case("scale"):
				if(s[k] > 0 && s[k] <= 1) {
					this.SETTINGS[k] = s[k];
					this.setTransformValues();
				} else {
					console.error("The setting value (" + s[k] + ") for " + k + " is not valid.");
				}
				break;
			default:
				console.log("TEST: The unknown setting value (" + s[k] + ") for " + k + " was changed.");
				this.SETTINGS[k] = s[k];
		}
	}
	return this;
}

/**
 * Update the flags for this unit
 *
 * @method flags
 * @param {Object|String} f						The flags to overwrite OR the flag value to return
 * @return {Object|String} this OR the value of the flag
 */
Unit.prototype.flags = function(f) {
	if(typeof f == "string") {
		if(typeof this.FLAGS[f] !== "undefined") {
			return this.FLAGS[f];
		} else {
			return null;
		}
	} else {
		for(var k in f) {
			switch(k) {
				case("dragged"):
				case("linked"):
					if(typeof f[k] === "boolean") {
						this.FLAGS[k] = f[k];
					}
					break;
				case("selected"):
					if(typeof f[k] === "boolean") {
						this.FLAGS[k] = f[k];
					}
					this.draw();
					break;
				case("selectedIndex"):
					if(!isNaN(f[k])) {
						this.FLAGS[k] = f[k];
					}
					break;
			}
		}
		return this;
	}
}

/**
 * Draw the unit on the given canvas (should be an SVG element)
 *
 * @method draw
 * @param {Object} canvas							The DOM object to write this unit to
 * @return {Object} this
 */
Unit.prototype.draw = function(canvas) {
	var xmlns = "http://www.w3.org/2000/svg";
	
	var rectWidth = 384;
	var rectHeight = 240;
	var diamondWidth = 340;
	
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
	var drawLine = function(x1, y1, x2, y2, o) {
		if(typeof o === "undefined") {
			o = {};
		}
		var l = document.createElementNS(xmlns, "line");
		l.setAttributeNS(null, "x1", x1);
		l.setAttributeNS(null, "x2", x2);
		l.setAttributeNS(null, "y1", y1);
		l.setAttributeNS(null, "y2", y2);
		if(typeof o.stroke !== "undefined") {
			l.setAttributeNS(null, "stroke", o.stroke);
		}
		if(typeof o.strokeWidth !== "undefined") {
			l.setAttributeNS(null, "stroke-width", o.strokeWidth);
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
	var drawRect = function(x, y, w, h, o) {
		if(typeof o === "undefined") {
			o = {};
		}
		var r = document.createElementNS(xmlns, "rect");
		r.setAttributeNS(null, "x", x);
		r.setAttributeNS(null, "y", y);
		r.setAttributeNS(null, "width", w);
		r.setAttributeNS(null, "height", h);
		if(typeof o.fill !== "undefined") {
			r.setAttributeNS(null, "fill", o.fill);
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
	var drawCircle = function(x, y, r, o) {
		if(typeof o === "undefined") {
			o = {};
		}
		var c = document.createElementNS(xmlns, "circle");
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
	 * Draw a quatrefoil centered on x,y with a radius of r
	 * 
	 * @method drawQuatrefoil
	 * @param {Number} x			The X coordinate to center this on
	 * @param {Number} y			The Y coordinate to center this on
	 * @param {Number} r			The radius of the circle
	 * @return {Object}				The resulting DOM object
	 */
	var drawQuatrefoil = function(x, y, r, o) {
		if(typeof o === "undefined") {
			o = {};
		}
		
		var r2 = r / 2;
		var ps = "M" + (x - r2) + " " + (y - r2);
		ps += " A " + r2 + " "  + r2 + " 0 1 1 ";
		ps += " " + (x + r2) + " " + (y - r2);
		ps += " A " + r2 + " "  + r2 + " 0 1 1 ";
		ps += " " + (x + r2) + " " + (y + r2);
		ps += " A " + r2 + " "  + r2 + " 0 1 1 ";
		ps += " " + (x - r2) + " " + (y + r2);
		ps += " A " + r2 + " "  + r2 + " 0 1 1 ";
		ps += " " + (x - r2) + " " + (y - r2);
		
		var p = document.createElementNS(xmlns, "path");
		p.setAttributeNS(null, "d", ps);
		if(typeof o.dasharray !== "undefined") {
			p.setAttributeNS(null, "stroke-dasharray", o.dasharray);
		}
		if(typeof o.dashoffset !== "undefined") {
			p.setAttributeNS(null, "stroke-dashoffset", o.dashoffset);
		}
		return p;
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
	var drawText = function(x, y, text, anchor, o) {
		if(typeof o === "undefined") {
			o = {};
		}
		// Verify that the anchor is valid
		if(anchor !== "start" && anchor !== "end") {
			anchor = "middle";
		}
		var t = document.createElementNS(xmlns, "text");
		t.setAttributeNS(null, "x", x);
		t.setAttributeNS(null, "y", y);
		t.setAttributeNS(null, "font-size", rectHeight / 3 + "px");
		t.setAttributeNS(null, "text-anchor", anchor);
		t.setAttributeNS(null, "alignment-baseline", "text-top");
		t.textContent = text;
		if(typeof o.strokeWidth !== "undefined") {
			t.setAttributeNS(null, "stroke-width", o.strokeWidth);
		} else {
			t.setAttributeNS(null, "stroke-width", 2);
		}
		if(typeof o.fill !== "undefined") {
			t.setAttributeNS(null, "fill", o.fill);
		}
		return t;
	}
	
	// Get the frame and icon to be drawn
	var frame = this.identities(this.IDENTITY);
	var icon = this.icons(this.ICON);
	var echelon = this.echelons(this.ECHELON);
	if(frame && icon && echelon) {
		this.SVG_GROUP.innerHTML = "";
		// Get the design variables
		var lineColor = this.SETTINGS.type == "full" ? "black" : frame.color;
		var fillColor = this.SETTINGS.type == "full" ? frame.color : "transparent";
		var lineType = frame.dasharray == false ? false : frame.dasharray;
		// Width and height will be updated when the frame is built
		var border = 6;
		var echelonSpacer = 8;
		var textSpacer = 16;
		var textHeight = 94;
		var hypotenuseConstant = 1.416;														// The ratio of the rotated diamond height to the original rectangle height
		var diamondConstant = 1.85;															// The ratio of the original full icon to the diamond's dimensions
		var quatrefoilConstant = 1.57;														// The ratio of the original full icon to the quatrefoil's dimensions
		var width = 0;
		var height = 0;
		// Some extra dimensions to take into account later
		var taskforceHeight = (rectHeight + border) / 3;									// The height of the taskforce (1/3 the rectangle height)
		var echelonHeight = (rectHeight + border) / 4;										// The height of the echelon (1/4 the rectangle height)
		var diamondWidthOffset = (rectWidth - rectHeight) / 2;								// The extra width created by translating the diamond
		var diamondHeightOffset = ((rectHeight * hypotenuseConstant) - rectHeight) / 2;		// The extra height created by translating the diamond
		var squareWidthOffset = (rectWidth - rectHeight) / 2;								// The extra width created by centering the square
		var quatrefoilWidthOffset = (rectWidth - (rectHeight * hypotenuseConstant)) / 2;	// The extra width created by centering the quatrefoil
		// Full frame width/height helps correct issues created by the diamond frame
		var centerX = 0;
		var iconFullWidth = 0;
		var iconFullHeight = 0;
		var iconDiamondWidthOffset = 0;
		var iconDiamondHeightOffset = 0;
		var iconQuatrefoilWidthOffset = 0;
		var iconQuatrefoilHeightOffset = 0;
		var echelonWidth = 0;
		// Set some svg group settings
		this.SVG_GROUP.setAttributeNS(null, "stroke-width", border + "px");
		this.SVG_GROUP.setAttributeNS(null, "fill", fillColor);
		this.SVG_GROUP.setAttributeNS(null, "stroke", lineColor);
		// Build the groups
		var frameGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
		var iconGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
		var echelonGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
		// Build the frame
		if(icon.type == "unit") {
			switch(frame.unit_frame) {
				case("rect"):
					width = rectWidth;
					height = rectHeight;
					centerX = rectWidth / 2;
					iconFullWidth = width;
					iconFullHeight = height;
					var o = !frame.dasharray ? {} : {dasharray: frame.dasharray + " " + frame.dasharray, dashoffset: frame.dasharray / 2};
					frameGroup.appendChild(drawRect(0, 0, width, height, o));
					// Translate to make room for the echelon
					frameGroup.setAttributeNS(null, "transform", "translate(0, " + taskforceHeight + ")");
					iconGroup.setAttributeNS(null, "transform", "translate(0, " +  taskforceHeight + ")");
					break;
				case("diamond"):
					width = rectHeight;
					height = rectHeight;
					var o = !frame.dasharray ? {} : {dasharray: frame.dasharray + " " + frame.dasharray, dashoffset: frame.dasharray / 2};
					var o = !frame.dasharray ? {rotate: "45 " + width / 2 + " " + height / 2} : {rotate: "45 " + width / 2 + " " + height / 2, dasharray: frame.dasharray + " " + frame.dasharray, dashoffset: frame.dasharray / 2};
					frameGroup.appendChild(drawRect(0, 0, width, height, o));
					width = width * hypotenuseConstant;
					height = height * hypotenuseConstant;
					centerX = width / 2;
					iconFullWidth = rectWidth / diamondConstant;
					iconFullHeight = rectHeight / diamondConstant;
					iconDiamondWidthOffset = (width - iconFullWidth) / 2;
					iconDiamondHeightOffset = (height - iconFullHeight) / 4;
					// Translate to center and make room for the echelon
					frameGroup.setAttributeNS(null, "transform", "translate(" + ((width - rectHeight) / 2) + ", " + (taskforceHeight + diamondHeightOffset) + ")");
					iconGroup.setAttributeNS(null, "transform", "translate(" + iconDiamondWidthOffset + ", " + (taskforceHeight + diamondHeightOffset + iconDiamondHeightOffset) + ")");
					break;
				case("square"):
					width = rectHeight;
					height = rectHeight;
					centerX = width / 2;
					iconFullWidth = width;
					iconFullHeight = height;
					var o = !frame.dasharray ? {} : {dasharray: frame.dasharray + " " + frame.dasharray, dashoffset: frame.dasharray / 2};
					frameGroup.appendChild(drawRect(0, 0, width, height, o));
					// Translate to make room for the echelon
					frameGroup.setAttributeNS(null, "transform", "translate(0, " + taskforceHeight + ")");
					iconGroup.setAttributeNS(null, "transform", "translate(0, " +  taskforceHeight + ")");
					break;
				case("quatrefoil"):
					width = rectHeight * hypotenuseConstant;
					height = rectHeight * hypotenuseConstant;
					centerX = width / 2;
					iconFullWidth = rectWidth / quatrefoilConstant;
					iconFullHeight = rectHeight / quatrefoilConstant;
					iconQuatrefoilWidthOffset = (width - iconFullWidth) / 2;
					iconQuatrefoilHeightOffset = (height - iconFullHeight) / 2;
					var o = !frame.dasharray ? {} : {dasharray: frame.dasharray + " " + frame.dasharray, dashoffset: frame.dasharray / 2};
					frameGroup.appendChild(drawQuatrefoil(width / 2, height / 2, width / 2, o));
					// Translate to make room for the echelon
					frameGroup.setAttributeNS(null, "transform", "translate(0, " + taskforceHeight + ")");
					iconGroup.setAttributeNS(null, "transform", "translate(" + iconQuatrefoilWidthOffset + ", " +  (taskforceHeight + iconQuatrefoilHeightOffset) + ")");
					break;
			}
		} else {
			
		}
		this.SVG_GROUP.appendChild(frameGroup);
		// Build the icon
		if(typeof icon.definition !== "undefined") {
			for(var i = 0; i < icon.definition.length; i++) {
				var d = icon.definition[i];
				switch(d.type) {
					case("line"):
						var x1 = icon.fullFrame ? d.x1 * iconFullWidth : d.x1;
						var y1 = icon.fullFrame ? d.y1 * iconFullHeight : d.y1;
						var x2 = icon.fullFrame ? d.x2 * iconFullWidth : d.x2;
						var y2 = icon.fullFrame ? d.y2 * iconFullHeight : d.y2;
						iconGroup.appendChild(drawLine(x1, y1, x2, y2));
						break;
				}
			}
			this.SVG_GROUP.appendChild(iconGroup);
		}
		// Build the echelon
		if(typeof this.ECHELON !== "undefined") {
			var echelonFill = this.SETTINGS.type == "min" ? frame.color : "black";
			switch(this.ECHELON) {
				case("tmc"):
					echelonGroup.appendChild(drawCircle(centerX, (echelonHeight / 2), (echelonHeight / 2) - echelonSpacer - (border / 2), {fill: "transparent"}));
					echelonGroup.appendChild(drawLine(centerX + (echelonHeight / 4) + (border * 1.25), echelonSpacer + (border / 2), centerX - (echelonHeight / 4) - (border * 1.25), echelonHeight - echelonSpacer - (border / 2)));
					echelonWidth = echelonHeight;
					break;
				case("sqd"):
					echelonGroup.appendChild(drawCircle(centerX, (echelonHeight / 2) - (border / 2), (echelonHeight / 2) - echelonSpacer, {fill: echelonFill, strokeWidth: 0}));
					echelonWidth = echelonHeight;
					break;
				case("sec"):
					echelonGroup.appendChild(drawCircle(centerX - (echelonHeight / 2) + (echelonSpacer / 2), (echelonHeight / 2) - (border / 2), (echelonHeight / 2) - echelonSpacer, {fill: echelonFill, strokeWidth: 0}));
					echelonGroup.appendChild(drawCircle(centerX + (echelonHeight / 2) - (echelonSpacer / 2), (echelonHeight / 2) - (border / 2), (echelonHeight / 2) - echelonSpacer, {fill: echelonFill, strokeWidth: 0}));
					echelonWidth = (echelonHeight * 2) + echelonSpacer;
					break;
				case("plt"):
					echelonGroup.appendChild(drawCircle(centerX, (echelonHeight / 2) - (border / 2), (echelonHeight / 2) - echelonSpacer, {fill: echelonFill, strokeWidth: 0}));
					echelonGroup.appendChild(drawCircle(centerX - echelonHeight + echelonSpacer, (echelonHeight / 2) - (border / 2), (echelonHeight / 2) - echelonSpacer, {fill: echelonFill, strokeWidth: 0}));
					echelonGroup.appendChild(drawCircle(centerX + echelonHeight - echelonSpacer, (echelonHeight / 2) - (border / 2), (echelonHeight / 2) - echelonSpacer, {fill: echelonFill, strokeWidth: 0}));
					echelonWidth = (echelonHeight * 3) + (echelonSpacer * 2);
					break;
				case("cpy"):
					echelonGroup.appendChild(drawLine(centerX, 0, centerX, echelonHeight, {strokeWidth: echelonSpacer * 1.5}));
					echelonWidth = echelonSpacer * 1.5;
					break;
				case("btn"):
					echelonGroup.appendChild(drawLine(centerX - (echelonSpacer * 1.5), 0, centerX - (echelonSpacer * 1.5), echelonHeight, {strokeWidth: echelonSpacer * 1.5}));
					echelonGroup.appendChild(drawLine(centerX + (echelonSpacer * 1.5), 0, centerX + (echelonSpacer * 1.5), echelonHeight, {strokeWidth: echelonSpacer * 1.5}));
					echelonWidth = echelonSpacer * 4.5;
					break;
				case("rgt"):
					echelonGroup.appendChild(drawLine(centerX, 0, centerX, echelonHeight, {strokeWidth: echelonSpacer * 1.5}));
					echelonGroup.appendChild(drawLine(centerX - (echelonSpacer * 3), 0, centerX - (echelonSpacer * 3), echelonHeight, {strokeWidth: echelonSpacer * 1.5}));
					echelonGroup.appendChild(drawLine(centerX + (echelonSpacer * 3), 0, centerX + (echelonSpacer * 3), echelonHeight, {strokeWidth: echelonSpacer * 1.5}));
					echelonWidth = echelonSpacer * 7.5;
					break;
				case("bde"):
					var x1 = centerX - (echelonHeight / 2) + (echelonSpacer * 1.5);
					var x2 = centerX + (echelonHeight / 2) - (echelonSpacer * 1.5);
					var y1 = echelonSpacer * 1.5;
					var y2 = echelonHeight - (echelonSpacer * 1.5);
					echelonGroup.appendChild(drawLine(x1, y1, x2, y2, {strokeWidth: echelonSpacer * 1.5}));
					echelonGroup.appendChild(drawLine(x1, y2, x2, y1, {strokeWidth: echelonSpacer * 1.5}));
					echelonWidth = echelonHeight + (echelonSpacer * 2);
					break;
				case("div"):
					var x1 = centerX - (echelonHeight / 2) + (echelonSpacer * 1.5);
					var x2 = centerX + (echelonHeight / 2) - (echelonSpacer * 1.5);
					var y1 = echelonSpacer * 1.5;
					var y2 = echelonHeight - (echelonSpacer * 1.5);
					echelonGroup.appendChild(drawLine(x1 - (echelonHeight / 2) + (echelonSpacer / 2), y1, x2 - (echelonHeight / 2) + (echelonSpacer / 2), y2, {strokeWidth: echelonSpacer * 1.5}));
					echelonGroup.appendChild(drawLine(x1 - (echelonHeight /2) + (echelonSpacer / 2), y2, x2 - (echelonHeight / 2) + (echelonSpacer / 2), y1, {strokeWidth: echelonSpacer * 1.5}));
					echelonGroup.appendChild(drawLine(x1 + (echelonHeight / 2) - (echelonSpacer / 2), y1, x2 + (echelonHeight / 2) - (echelonSpacer / 2), y2, {strokeWidth: echelonSpacer * 1.5}));
					echelonGroup.appendChild(drawLine(x1 + (echelonHeight / 2) - (echelonSpacer / 2), y2, x2 + (echelonHeight / 2) - (echelonSpacer / 2), y1, {strokeWidth: echelonSpacer * 1.5}));
					echelonWidth = echelonHeight * 2;
					break;
				case("cps"):
					var x1 = centerX - (echelonHeight / 2) + (echelonSpacer * 1.5);
					var x2 = centerX + (echelonHeight / 2) - (echelonSpacer * 1.5);
					var y1 = echelonSpacer * 1.5;
					var y2 = echelonHeight - (echelonSpacer * 1.5);
					var offset = (echelonHeight / 2) + (echelonSpacer * 1.5);
					echelonGroup.appendChild(drawLine(x1, y1, x2, y2, {strokeWidth: echelonSpacer * 1.5}));
					echelonGroup.appendChild(drawLine(x1, y2, x2, y1, {strokeWidth: echelonSpacer * 1.5}));
					echelonGroup.appendChild(drawLine(x1 - offset - (echelonHeight / 2) + (echelonSpacer * 2.5), y1, x2 - offset - (echelonHeight / 2) + (echelonSpacer * 2.5), y2, {strokeWidth: echelonSpacer * 1.5}));
					echelonGroup.appendChild(drawLine(x1 - offset - (echelonHeight / 2) + (echelonSpacer * 2.5), y2, x2 - offset - (echelonHeight / 2) + (echelonSpacer * 2.5), y1, {strokeWidth: echelonSpacer * 1.5}));
					echelonGroup.appendChild(drawLine(x1 + offset + (echelonHeight / 2) - (echelonSpacer * 2.5), y1, x2 + offset + (echelonHeight / 2) - (echelonSpacer * 2.5), y2, {strokeWidth: echelonSpacer * 1.5}));
					echelonGroup.appendChild(drawLine(x1 + offset + (echelonHeight / 2) - (echelonSpacer * 2.5), y2, x2 + offset + (echelonHeight / 2) - (echelonSpacer * 2.5), y1, {strokeWidth: echelonSpacer * 1.5}));
					echelonWidth = echelonHeight * 3;
					break;
				case("amy"):
					var x1 = centerX - (echelonHeight / 2) + (echelonSpacer * 1.5);
					var x2 = centerX + (echelonHeight / 2) - (echelonSpacer * 1.5);
					var y1 = echelonSpacer * 1.5;
					var y2 = echelonHeight - (echelonSpacer * 1.5);
					echelonGroup.appendChild(drawLine(x1 - (echelonHeight / 2) + (echelonSpacer / 2), y1, x2 - (echelonHeight / 2) + (echelonSpacer / 2), y2, {strokeWidth: echelonSpacer * 1.5}));
					echelonGroup.appendChild(drawLine(x1 - (echelonHeight /2) + (echelonSpacer / 2), y2, x2 - (echelonHeight / 2) + (echelonSpacer / 2), y1, {strokeWidth: echelonSpacer * 1.5}));
					echelonGroup.appendChild(drawLine(x1 + (echelonHeight / 2) - (echelonSpacer / 2), y1, x2 + (echelonHeight / 2) - (echelonSpacer / 2), y2, {strokeWidth: echelonSpacer * 1.5}));
					echelonGroup.appendChild(drawLine(x1 + (echelonHeight / 2) - (echelonSpacer / 2), y2, x2 + (echelonHeight / 2) - (echelonSpacer / 2), y1, {strokeWidth: echelonSpacer * 1.5}));
					echelonGroup.appendChild(drawLine(x1 - (echelonHeight) - (echelonSpacer * 2.25), y1, x2 - (echelonHeight) - (echelonSpacer * 2.25), y2, {strokeWidth: echelonSpacer * 1.5}));
					echelonGroup.appendChild(drawLine(x1 - (echelonHeight) - (echelonSpacer * 2.25), y2, x2 - (echelonHeight) - (echelonSpacer * 2.25), y1, {strokeWidth: echelonSpacer * 1.5}));
					echelonGroup.appendChild(drawLine(x1 + (echelonHeight) + (echelonSpacer * 2.25), y1, x2 + (echelonHeight) + (echelonSpacer * 2.25), y2, {strokeWidth: echelonSpacer * 1.5}));
					echelonGroup.appendChild(drawLine(x1 + (echelonHeight) + (echelonSpacer * 2.25), y2, x2 + (echelonHeight) + (echelonSpacer * 2.25), y1, {strokeWidth: echelonSpacer * 1.5}));
					echelonWidth = (echelonHeight * 3) + (echelonSpacer * 2);
					break;
				case("arg"):
					var x1 = centerX - (echelonHeight / 2) + (echelonSpacer * 1.5);
					var x2 = centerX + (echelonHeight / 2) - (echelonSpacer * 1.5);
					var y1 = echelonSpacer * 1.5;
					var y2 = echelonHeight - (echelonSpacer * 1.5);
					var offset = (echelonHeight / 2) + (echelonSpacer * 1.5);
					echelonGroup.appendChild(drawLine(x1, y1, x2, y2, {strokeWidth: echelonSpacer * 1.5}));
					echelonGroup.appendChild(drawLine(x1, y2, x2, y1, {strokeWidth: echelonSpacer * 1.5}));
					echelonGroup.appendChild(drawLine(x1 - offset - (echelonHeight / 2) + (echelonSpacer * 2.5), y1, x2 - offset - (echelonHeight / 2) + (echelonSpacer * 2.5), y2, {strokeWidth: echelonSpacer * 1.5}));
					echelonGroup.appendChild(drawLine(x1 - offset - (echelonHeight / 2) + (echelonSpacer * 2.5), y2, x2 - offset - (echelonHeight / 2) + (echelonSpacer * 2.5), y1, {strokeWidth: echelonSpacer * 1.5}));
					echelonGroup.appendChild(drawLine(x1 + offset + (echelonHeight / 2) - (echelonSpacer * 2.5), y1, x2 + offset + (echelonHeight / 2) - (echelonSpacer * 2.5), y2, {strokeWidth: echelonSpacer * 1.5}));
					echelonGroup.appendChild(drawLine(x1 + offset + (echelonHeight / 2) - (echelonSpacer * 2.5), y2, x2 + offset + (echelonHeight / 2) - (echelonSpacer * 2.5), y1, {strokeWidth: echelonSpacer * 1.5}));
					echelonGroup.appendChild(drawLine(x1 - offset - (echelonHeight) - (echelonSpacer / 4), y1, x2 - offset - (echelonHeight) - (echelonSpacer / 4), y2, {strokeWidth: echelonSpacer * 1.5}));
					echelonGroup.appendChild(drawLine(x1 - offset - (echelonHeight) - (echelonSpacer / 4), y2, x2 - offset - (echelonHeight) - (echelonSpacer / 4), y1, {strokeWidth: echelonSpacer * 1.5}));
					echelonGroup.appendChild(drawLine(x1 + offset + (echelonHeight) + (echelonSpacer / 4), y1, x2 + offset + (echelonHeight) + (echelonSpacer / 4), y2, {strokeWidth: echelonSpacer * 1.5}));
					echelonGroup.appendChild(drawLine(x1 + offset + (echelonHeight) + (echelonSpacer / 4), y2, x2 + offset + (echelonHeight) + (echelonSpacer / 4), y1, {strokeWidth: echelonSpacer * 1.5}));
					echelonWidth = (echelonHeight * 4) + echelonSpacer;
					break;
				case("tht"):
					var x1 = centerX - (echelonHeight / 2) + (echelonSpacer * 1.5);
					var x2 = centerX + (echelonHeight / 2) - (echelonSpacer * 1.5);
					var y1 = echelonSpacer * 1.5;
					var y2 = echelonHeight - (echelonSpacer * 1.5);
					echelonGroup.appendChild(drawLine(x1 - (echelonHeight / 2) + (echelonSpacer / 2), y1, x2 - (echelonHeight / 2) + (echelonSpacer / 2), y2, {strokeWidth: echelonSpacer * 1.5}));
					echelonGroup.appendChild(drawLine(x1 - (echelonHeight /2) + (echelonSpacer / 2), y2, x2 - (echelonHeight / 2) + (echelonSpacer / 2), y1, {strokeWidth: echelonSpacer * 1.5}));
					echelonGroup.appendChild(drawLine(x1 + (echelonHeight / 2) - (echelonSpacer / 2), y1, x2 + (echelonHeight / 2) - (echelonSpacer / 2), y2, {strokeWidth: echelonSpacer * 1.5}));
					echelonGroup.appendChild(drawLine(x1 + (echelonHeight / 2) - (echelonSpacer / 2), y2, x2 + (echelonHeight / 2) - (echelonSpacer / 2), y1, {strokeWidth: echelonSpacer * 1.5}));
					echelonGroup.appendChild(drawLine(x1 - (echelonHeight) - (echelonSpacer * 2.25), y1, x2 - (echelonHeight) - (echelonSpacer * 2.25), y2, {strokeWidth: echelonSpacer * 1.5}));
					echelonGroup.appendChild(drawLine(x1 - (echelonHeight) - (echelonSpacer * 2.25), y2, x2 - (echelonHeight) - (echelonSpacer * 2.25), y1, {strokeWidth: echelonSpacer * 1.5}));
					echelonGroup.appendChild(drawLine(x1 + (echelonHeight) + (echelonSpacer * 2.25), y1, x2 + (echelonHeight) + (echelonSpacer * 2.25), y2, {strokeWidth: echelonSpacer * 1.5}));
					echelonGroup.appendChild(drawLine(x1 + (echelonHeight) + (echelonSpacer * 2.25), y2, x2 + (echelonHeight) + (echelonSpacer * 2.25), y1, {strokeWidth: echelonSpacer * 1.5}));
					echelonGroup.appendChild(drawLine(x1 - (echelonHeight * 1.5) - (echelonSpacer * 5), y1, x2 - (echelonHeight * 1.5) - (echelonSpacer * 5), y2, {strokeWidth: echelonSpacer * 1.5}));
					echelonGroup.appendChild(drawLine(x1 - (echelonHeight * 1.5) - (echelonSpacer * 5), y2, x2 - (echelonHeight * 1.5) - (echelonSpacer * 5), y1, {strokeWidth: echelonSpacer * 1.5}));
					echelonGroup.appendChild(drawLine(x1 + (echelonHeight * 1.5) + (echelonSpacer * 5), y1, x2 + (echelonHeight * 1.5) + (echelonSpacer * 5), y2, {strokeWidth: echelonSpacer * 1.5}));
					echelonGroup.appendChild(drawLine(x1 + (echelonHeight * 1.5) + (echelonSpacer * 5), y2, x2 + (echelonHeight * 1.5) + (echelonSpacer * 5), y1, {strokeWidth: echelonSpacer * 1.5}));
					echelonWidth = (echelonHeight * 5) + echelonSpacer;
					break;
				case("cmd"):
					echelonGroup.appendChild(drawLine(centerX - echelonHeight - (echelonSpacer * .5), echelonHeight / 2, centerX - (echelonSpacer * .5), echelonHeight / 2, {strokeWidth: echelonSpacer * 1.5}));
					echelonGroup.appendChild(drawLine(centerX - ((echelonHeight + echelonSpacer) / 2), 0, centerX - ((echelonHeight + echelonSpacer) / 2), echelonHeight, {strokeWidth: echelonSpacer * 1.5}));
					echelonGroup.appendChild(drawLine(centerX + echelonHeight + (echelonSpacer * .5), echelonHeight / 2, centerX + (echelonSpacer * .5), echelonHeight / 2, {strokeWidth: echelonSpacer * 1.5}));
					echelonGroup.appendChild(drawLine(centerX + ((echelonHeight + echelonSpacer) / 2), 0, centerX + ((echelonHeight + echelonSpacer) / 2), echelonHeight, {strokeWidth: echelonSpacer * 1.5}));
					echelonWidth = (echelonHeight * 2) + (echelonSpacer * 3.5);
					break;
			}
			echelonGroup.setAttributeNS(null, "transform", "translate(0, " + (taskforceHeight - echelonHeight) + ")")
			this.SVG_GROUP.appendChild(echelonGroup);
		}
		
		// Write in the unit text
		height += border / 2;
		if(this.AMPLIFIERS[1]) {
			var f1Group = document.createElementNS("http://www.w3.org/2000/svg", "g");
			var refSize = echelonHeight * .5;
			f1Group.appendChild(drawLine(0, (refSize / 2), refSize, (refSize / 2)));
			if(this.AMPLIFIERS[1] == "r") {
				f1Group.appendChild(drawLine((refSize / 2), 0, (refSize / 2), refSize));
			}
			f1Group.setAttributeNS(null, "transform", "translate(" + (width + textSpacer + 7) + ", " + ((taskforceHeight - echelonHeight) + ((echelonHeight - refSize) / 2)) + ")");
			this.SVG_GROUP.appendChild(f1Group);
		}
		if(this.AMPLIFIERS[2]) {
			var f2Group = document.createElementNS("http://www.w3.org/2000/svg", "g");
			f2Group.appendChild(drawText(0, 0, this.AMPLIFIERS[2], "start", {strokeWidth: 0, fill: lineColor}));
			f2Group.setAttributeNS(null, "transform", "translate(" + ((centerX + (width / 2)) + textSpacer) + ", " + ((height + taskforceHeight) - (textHeight * 2)) + ")");
			this.SVG_GROUP.appendChild(f2Group);
		}
		if(this.AMPLIFIERS[3]) {
			var f3Group = document.createElementNS("http://www.w3.org/2000/svg", "g");
			f3Group.appendChild(drawText(0, 0, this.AMPLIFIERS[3], "start", {strokeWidth: 0, fill: lineColor}));
			f3Group.setAttributeNS(null, "transform", "translate(" + ((centerX + (width / 2)) + textSpacer) + ", " + ((height + taskforceHeight) - textHeight) + ")");
			this.SVG_GROUP.appendChild(f3Group);
		}
		if(this.AMPLIFIERS[4]) {
			var f4Group = document.createElementNS("http://www.w3.org/2000/svg", "g");
			f4Group.appendChild(drawText(0, 0, this.AMPLIFIERS[4], "start", {strokeWidth: 0, fill: lineColor}));
			f4Group.setAttributeNS(null, "transform", "translate(" + ((centerX + (width / 2)) + textSpacer) + ", " + (height + taskforceHeight) + ")");
			this.SVG_GROUP.appendChild(f4Group);
		}
		if(this.AMPLIFIERS[5]) {
			var f5Group = document.createElementNS("http://www.w3.org/2000/svg", "g");
			f5Group.appendChild(drawText(0, 0, this.AMPLIFIERS[5], "start", {strokeWidth: 0, fill: lineColor}));
			f5Group.setAttributeNS(null, "transform", "translate(" + ((centerX + (width / 2)) + textSpacer) + ", " + ((height + taskforceHeight) + textHeight) + ")");
			this.SVG_GROUP.appendChild(f5Group);
		}
		if(this.AMPLIFIERS[8]) {
			var f8Group = document.createElementNS("http://www.w3.org/2000/svg", "g");
			var buffer = taskforceHeight - echelonHeight;
			f8Group.appendChild(drawLine(centerX - (echelonWidth / 2) - buffer, 0, centerX + (echelonWidth / 2) + buffer, 0));
			f8Group.appendChild(drawLine(centerX - (echelonWidth / 2) - buffer, 0, centerX - (echelonWidth / 2) - buffer, taskforceHeight));
			f8Group.appendChild(drawLine(centerX + (echelonWidth / 2) + buffer, 0, centerX + (echelonWidth / 2) + buffer, taskforceHeight));
			this.SVG_GROUP.appendChild(f8Group);
		}
		if(this.AMPLIFIERS[9]) {
			var f9Group = document.createElementNS("http://www.w3.org/2000/svg", "g");
			f9Group.appendChild(drawLine(0, taskforceHeight, centerX, 0, {dasharray: "20 20"}));
			f9Group.appendChild(drawLine(centerX, 0, width, taskforceHeight, {dasharray: "20 20"}));
			this.SVG_GROUP.appendChild(f9Group);
		}
		if(this.AMPLIFIERS[10].a) {
			var f10Group = document.createElementNS("http://www.w3.org/2000/svg", "g");
			f10Group.appendChild(drawLine(0, taskforceHeight, 0, taskforceHeight + (height * 1.75)));
			this.SVG_GROUP.appendChild(f10Group);
			if(!this.AMPLIFIERS[14]) {
				height = height * 1.75;
			}
		}
		if(this.AMPLIFIERS[14]) {
			var f14Group = document.createElementNS("http://www.w3.org/2000/svg", "g");
			f14Group.appendChild(drawText(centerX, taskforceHeight + height + 70, this.AMPLIFIERS[14].toUpperCase(), "middle", {fill: "black"}));
			this.SVG_GROUP.appendChild(f14Group);
			// Add in the height from AMP 10.a
			height = height * 1.75;
		}
		
		// Check for flags that have a graphical component
		if(this.FLAGS.selected) {
			var b = document.createElementNS("http://www.w3.org/2000/svg", "g");
			var dim = this.SVG_GROUP.getBBox();
			var padding = 20;
			var bw = width;
			var bh = height + taskforceHeight - (border / 2);
			var selSize = 20;
			b.appendChild(drawRect(selSize / 2, selSize / 2, bw, bh, {fill: "transparent", stroke: "gray", dasharray: "10 10"}));
			
			b.appendChild(drawRect(0, 0, selSize, selSize, {fill: "white", stroke: "gray"}));
			b.appendChild(drawRect(bw / 2, 0, selSize, selSize, {fill: "white", stroke: "gray"}));
			b.appendChild(drawRect(bw, 0, selSize, selSize, {fill: "white", stroke: "gray"}));
			
			b.appendChild(drawRect(0, bh / 2, selSize, selSize, {fill: "white", stroke: "gray"}));
			b.appendChild(drawRect(bw, bh / 2, selSize, selSize, {fill: "white", stroke: "gray"}));
			
			b.appendChild(drawRect(0, bh, selSize, selSize, {fill: "white", stroke: "gray"}));
			b.appendChild(drawRect(bw / 2, bh, selSize, selSize, {fill: "white", stroke: "gray"}));
			b.appendChild(drawRect(bw, bh, selSize, selSize, {fill: "white", stroke: "gray"}));
			
			b.setAttributeNS(null, "transform", "translate(-" + selSize / 2 + ",-" + selSize / 2 + ")");
			
			this.SVG_GROUP.appendChild(b);
		}
		
		// Add in transformation options
		this.setTransformValues(this.SVG_GROUP);
		
		if(typeof canvas !== "undefined") {
			canvas.appendChild(this.SVG_GROUP);
		}
	}
	return this;
}

// Return the HTML object
Unit.prototype.getElement = function() {
	return this.SVG_GROUP;
}

// Export the unit into a shorthand string
Unit.prototype.toString = function() {
	var str = "TODO";
	return str;
}

// Make a duplicate of this unit
Unit.prototype.copy = function() {
	var nu = new Unit(this.IDENTITY, this.ICON, this.ECHELON, this.AMPLIFIERS, this.SETTINGS, this.FLAGS).draw();
	// Offset the icon so that it can be seen against its original
	var offset = 20;
	nu.translate(offset, offset, true);
	// Ensure the new unit is not selected
	nu.flags({selected: false, selectedIndex: -1});
	// Return the newly created unit
	return nu;
}

// Unit Identity Definitions
Unit.prototype.identities = function(id) {
	var identities = {
		"f": {
			title: "Friendly",
			color: "blue",
			dasharray: false,
			unit_frame: "rect",
			equipment_frame: "circle"
		},
		"a": {
			title: "Assumed Friendly",
			color: "blue",
			dasharray: 12,
			unit_frame: "rect",
			equipment_frame: "circle"
		},
		"h": {
			title: "Hostile",
			color: "red",
			dasharray: false,
			unit_frame: "diamond",
			equipment_frame: "diamond"
		},
		"s": {
			title: "Suspect",
			color: "red",
			dasharray: 12,
			unit_frame: "diamond",
			equipment_frame: "diamond"
		},
		"n": {
			title: "Neutral",
			color: "green",
			dasharray: false,
			unit_frame: "square",
			equipment_frame: "square"
		},
		"u": {
			title: "Unknown",
			color: "yellow",
			dasharray: false,
			unit_frame: "quatrefoil",
			equipment_frame: "quatrefoil"
		},
		"p": {
			title: "Pending",
			color: "yellow",
			dasharray: 14,
			unit_frame: "quatrefoil",
			equipment_frame: "quatrefoil"
		}
	}
	
	if(typeof id !== "undefined") {
		if(typeof identities[id] !== "undefined") {
			return identities[id];
		} else {
			return false;
		}
	} else {
		return identities;
	}
}

// Translate
Unit.prototype.translate = function(x, y, add) {
	if(typeof add === "undefined" || typeof add != "boolean") {
		add = false;
	}
	var a = this.getTransformValues().translate;
	if(add) {
		a[0] = parseInt(a[0]) + x;
		a[1] = parseInt(a[1]) + y;
	} else {
		a[0] = x;
		a[1] = y;
	}
	var s = a.join(",");
	this.settings({translate: s}).draw();
}

// Unit Icon Definitions
Unit.prototype.icons = function(icn) {
	var icons = {
		"adm": {
			title: "Administrative",
			type: "unit"
			},
		"ada": {
			title: "Air Defense Artillery",
			type: "unit"
		},
		"amd": {
			title: "Air and Missile Defense",
			type: "unit"
		},
		"ana": {
			title: "Anti-Armor",
			type: "unit"
		},
		"arm": {
			title: "Armored (Armor)",
			type: "unit"
		},
		"arc": {
			title: "Armored Cavalry",
			type: "unit"
		},
		"mai": {
			title: "Mechanized (Armored) Infantry",
			type: "unit"
		},
		"rwa": {
			title: "Army Aviation / Rotary Wing Aviation",
			type: "unit"
		},
		"fwa": {
			title: "Fixed Wing Aviation",
			type: "unit"
		},
		"bnd": {
			title: "Band",
			type: "unit"
		},
		"cav": {
			title: "Cavalry (Reconnaissance)",
			type: "unit",
			fullFrame: true,
			definition: new Array(
				{
					type: "line",
					x1: 0,
					x2: 1,
					y1: 1,
					y2: 0
				}
			)
		},
		"cem": {
			title: "Chemical (Chemical, Biological, Radiological, and Nuclear)",
			type: "unit"
		},
		"che": {
			title: "Chemical, Biological, Radiological, Nuclear, and High-Yield Explosives",
			type: "unit"
		},
		"cva": {
			title: "Civil Affairs",
			type: "unit"
		},
		"cmc": {
			title: "Civil-Military Cooperation",
			type: "unit"
		},
		"crs": {
			title: "Chaplain (Religious Support)",
			type: "unit"
		},
		"cba": {
			title: "Combined Arms",
			type: "unit"
		},
		"eng": {
			title: "Engineer",
			type: "unit"
		},
		"fda": {
			title: "Field Artillery",
			type: "unit"
		},
		"fin": {
			title: "Finance",
			type: "unit"
		},
		"mtf": {
			title: "Hospital (Medical Treatment Facility)",
			type: "unit"
		},
		"inf": {
			title: "Infantry",
			type: "unit",
			fullFrame: true,
			definition: new Array(
				{
					type: "line",
					x1: 0,
					x2: 1,
					y1: 1,
					y2: 0
				},
				{
					type: "line",
					x1: 0,
					x2: 1,
					y1: 0,
					y2: 1
				}
			)
		},
		"ino": {
			title: "Information Operations",
			type: "unit"
		},
		"trp": {
			title: "Interpreter / Translator",
			type: "unit"
		},
		"jag": {
			title: "Judge Advocate General",
			type: "unit"
		},
		"lio": {
			title: "Liaison",
			type: "unit"
		},
		"mnt": {
			title: "Maintenance",
			type: "unit"
		},
		"meh": {
			title: "Maneuver Enhancement",
			type: "unit"
		},
		"med": {
			title: "Medical",
			type: "unit"
		},
		"mih": {
			title: "Military History",
			type: "unit"
		},
		"min": {
			title: "Military Intelligence",
			type: "unit"
		},
		"mlp": {
			title: "Military Police",
			type: "unit"
		},
		"mld": {
			title: "Missile Defense",
			type: "unit"
		},
		"ord": {
			title: "Ordnance",
			type: "unit"
		},
		"prs": {
			title: "Personnel (Personnel Services or Human Resources)",
			type: "unit"
		},
		"psy": {
			title: "Psycological Operations / Military Information Support Operations",
			type: "unit"
		},
		"pba": {
			title: "Public Affairs",
			type: "unit"
		},
		"qtm": {
			title: "Quartermaster",
			type: "unit"
		},
		"rgr": {
			title: "Ranger",
			type: "unit"
		},
		"sel": {
			title: "Sea, Air, Land (SEAL) Navy",
			type: "unit"
		},
		"sec": {
			title: "Security (Internal Security Forces)",
			type: "unit"
		},
		"scp": {
			title: "Security Police",
			type: "unit"
		},
		"sig": {
			title: "Signal",
			type: "unit"
		},
		"spc": {
			title: "Space",
			type: "unit"
		},
		"spf": {
			title: "Special Forces",
			type: "unit"
		},
		"sof": {
			title: "Special Operations Forces Joint",
			type: "unit"
		},
		"stp": {
			title: "Special Troops",
			type: "unit"
		},
		"spt": {
			title: "Support",
			type: "unit"
		},
		"sbs": {
			title: "Surveillance (Battlefield Surveillance)",
			type: "unit"
		},
		"sus": {
			title: "Sustainment",
			type: "unit"
		},
		"trs": {
			title: "Transportation",
			type: "unit"
		}
	}
	
	if(typeof icn !== "undefined") {
		if(typeof icons[icn] !== "undefined") {
			return icons[icn];
		} else {
			return false;
		}
	} else {
		return icons;
	}
}

// Unit Size Definitions
Unit.prototype.echelons = function(ech) {
	var echelons = {
		"none": {
			title: "-- None --"
		},
		"tmc": {
			title: "Team / Crew"
		},
		"sqd": {
			title: "Squad"
		},
		"sec": {
			title: "Section"
		},
		"plt": {
			title: "Platoon / Detachment"
		},
		"cpy": {
			title: "Company / Troop / Battery"
		},
		"btn": {
			title: "Battalion / Squadron"
		},
		"rgt": {
			title: "Regiment / Group"
		},
		"bde": {
			title: "Brigade"
		},
		"div": {
			title: "Division"
		},
		"cps": {
			title: "Corps"
		},
		"amy": {
			title: "Army"
		},
		"arg": {
			title: "Army Group"
		},
		"tht": {
			title: "Theater"
		},
		"cmd": {
			title: "Command"
		}
	}
	
	if(typeof ech !== "undefined") {
		if(typeof echelons[ech] !== "undefined") {
			return echelons[ech];
		} else {
			return false;
		}
	} else {
		return echelons;
	}
}

// Country Codes
Unit.prototype.countries = function(c) {
	var countries = new Array(
		"United States US USA",
		"Afghanistan AF AFG",
		"Albania AL ALB",
		"Algeria DZ DZA",
		"American Samoa AS ASM",
		"Andorra AD AND",
		"Angola AO AGO",
		"Anguilla AI AIA",
		"Antarctica AQ ATA",
		"Antigua and Barbuda AG ATG",
		"Argentina AR ARG",
		"Armenia AM ARM",
		"Aruba AW ABW",
		"Australia AU AUS",
		"Austria AT AUT",
		"Azerbaijan AZ AZE",
		"Bahamas BS BHS",
		"Bahrain BH BHR",
		"Bangladesh BD BGD",
		"Barbados BB BRB",
		"Belarus BY BLR",
		"Belize BZ BLZ",
		"Belgium BE BEL",
		"Benin BJ BEN",
		"Bermuda BM BMU",
		"Bhutan BT BTN",
		"Bolivia BO BOL",
		"Bosnia and Herzegovina BA BIH",
		"Botswana BW BWA",
		"Bouvet Island BV BVT",
		"Brazil BR BRA",
		"British Indian Ocean Territory IO IOT",
		"Brunei Darussalam BN BRN",
		"Bulgaria BG BGR",
		"Burkina Faso BF BFA",
		"Burundi BI BDI",
		"Cambodia KH KHM",
		"Cameroon CM CMR",
		"Canada CA CAN",
		"Cape Verde CV CPV",
		"Cayman Islands KY CYM",
		"Central African Republic CF CAF",
		"Chad TD TCD",
		"Chile CL CHL",
		"China CN CHN",
		"Christmas Island CX CXR",
		"Cocos (Keeling) Islands CC CCK",
		"Colombia CO COL",
		"Comoros KM COM",
		"Congo CG COG",
		"Congo, The Democratic Republic of the CD COD",
		"Cook Islands CK COK",
		"Costa Rica CR CRI",
		"Cote d’Ivoire (Ivory Coast) CI CIV",
		"Croatia (Hrvatska) HR HRV",
		"Cuba CU CUB",
		"Cypress CY CYP",
		"Czech Republic CZ CZE",
		"Denmark DK DNK",
		"Djibouti DJ DJI",
		"Dominica DM DMA",
		"Dominican Republic DO DOM",
		"Ecuador EC ECU",
		"El Salvador SV SLV",
		"Egypt EG EGY",
		"Equatorial Guinea GQ GNQ",
		"Eritrea ER ERI",
		"Estonia EE EST",
		"Ethiopia ET ETH",
		"Falkland Islands (Malvinas) FK FLK",
		"Faroe Islands FO FRO",
		"Fiji FJ FJI",
		"Finland FI FIN",
		"France FR FRA",
		"French Guiana GF GUF",
		"French Polynesia PF PYF",
		"French Southern Territories TF ATF",
		"Gabon GA GAB",
		"Gambia GM GMB",
		"Georgia GE GEO",
		"Germany DE DEU",
		"Ghana GH GHA",
		"Gibraltar GI GIB",
		"Greece GR GRC",
		"Greenland GL GRL",
		"Grenada GD GRD",
		"Guadaloupe GP GLP",
		"Guam GU GUM",
		"Guatamala GT GTM",
		"Guinea GN GIN",
		"Guinea–Bissau GW GNB",
		"Guyana GY GUY",
		"Haiti HT HTI",
		"Heard Island and McDonald Islands HM HMD",
		"Holy See (Vatican City State) VA VAT",
		"Honduras HN HND",
		"Hong Kong HK HKG",
		"Hungary HU HUN",
		"Iceland IS ISL",
		"India IN IND",
		"Indonesia ID IDN",
		"Iran, Islamic Republic of IR IRN",
		"Iraq IQ IRQ",
		"Ireland IE IRL",
		"Israel IL ISL",
		"Italy IT ITA",
		"Jamaica JM JAM",
		"Japan JP JPN",
		"Jordan JO JOR",
		"Kazakhstan KZ KAZ",
		"Kenya KE KEN",
		"Kiribati KI KIR",
		"Korea, Democratic People’s Republic of KP PRK",
		"Korea, Republic of KR KOR",
		"Kuwait KW KWT",
		"Kyrgyzstan KG KGZ",
		"Lao People’s Democratic Republic LA LAO",
		"Latvia LV LVA",
		"Lebanon LB LBN",
		"Lesotho LS LSO",
		"Liberia LR LBR",
		"Libyan LY LBY",
		"Liechtenstein LI LIE",
		"Lithuania LT LTU",
		"Luxembourg LU LUX",
		"Macao MO MAC",
		"Madagascar MD MDG",
		"Malawi MW MWI",
		"Malaysia MY MYS",
		"Maldives MV MDV",
		"Mali ML MLI",
		"Malta MT MLT",
		"Martinique MQ MTQ",
		"Mauritania MR MRT",
		"Mauritius MU MUS",
		"Mexico MX MEX",
		"Micronesia, Federated States of FM FSM",
		"Moldova, Republic of MD MDA",
		"Monoco MC MCO",
		"Mongolia MN MNG",
		"Montserrat MS MSR",
		"Morocco MA MAR",
		"Mozambique MZ MOZ",
		"Myanmar MM MMR",
		"Namibia NA NAM",
		"Nauru NR NRU",
		"Nepal NP NPL",
		"Netherlands NL NLD",
		"Netherlands Antilles AN ANT",
		"New Caledonia NC NCL",
		"New Zealand NZ NZL",
		"Nicaragua NI NIC",
		"Niger NE NER",
		"Nigeria NG NGA",
		"Niue NU NIU",
		"Norfolk Island NF NFK",
		"Northern Mariana Islands MP MNP",
		"Norway NO NOR",
		"Oman OM OMN",
		"Pakistan PK PAK",
		"Palau PW PLW",
		"Panama PA PAN",
		"Papua New Guinea PG PNG",
		"Paraguay PY PRY",
		"Peru PE PER",
		"Philippines PH PHL",
		"Pitcairn PN PCN",
		"Poland PL POL",
		"Portugal PT PRT",
		"Puerto Rico PR PRI",
		"Qatar QA QAT",
		"Reunion RE REU",
		"Romania RO ROU",
		"Russian Federation RU RUS",
		"Rwanda RW RWA",
		"Saint Helena SH SHL",
		"Saint Kitts and Nevis KN KNA",
		"Saint Lucia LC LCA",
		"Saint Pierre and Miquelone PM SPM",
		"Saint Vincent and the Grenadines VC VCT",
		"Samoa WS WSM",
		"San Marino SM SMR",
		"Sao Tome and Principe ST STP",
		"Saudi Arabia SA SAU",
		"Senegal SN SEN",
		"Serbia and Montenegro CS SCG",
		"Seychelles SC SYC",
		"Sierra Leone SL SLE",
		"Singapore SG SGP",
		"Slovakia SK SVK",
		"Slovenia SI SVN",
		"Solomon Islands SB SLB",
		"Somalia SO SOM",
		"South Africa ZA ZAF",
		"South Georgia and South Sandwich Islands GS SGS",
		"Spain ES ESP",
		"Sri Lanka LK LKA",
		"Sudan SD SDN",
		"Suriname SR SUR",
		"Svalbard and Jan Mayen Islands SJ SJM",
		"Swaziland SZ SWZ",
		"Sweden SE SWE",
		"Switzerland CH CHE",
		"Syrian Arab Republic SY SYR",
		"Taiwan, Province of China TW TWN",
		"Tajikistan TJ TJK",
		"Tanzania, United Republic of TZ TZA",
		"Thailand TH THA",
		"Timor–Leste TL TLS",
		"Togo TG TGO",
		"Tokelau TK TKL",
		"Tonga TO TON",
		"Trinidad and Tobago TT TTO",
		"Tunisia TN TUN",
		"Turkey TR TUR",
		"Turkmenistan TM TKM",
		"Turks and Caicos Islands TC TCA",
		"Tuvalu TV TUV",
		"Uganda UG UGA",
		"Ukraine UA UKR",
		"United Arab Emirates AE AER",
		"United Kingdom GB GBR",
		"United States Minor Outlying Islands UM UMI",
		"Uruguay UY URY",
		"Uzbekistan UZ UZB",
		"Vanuatu VU VUT",
		"Venezuala VE VEN",
		"Viet Nam VN VNM",
		"Virgin Islands (British) VG VGB",
		"Virgin Islands (US) VI VIR",
		"Wallis and Futuna Islands WF WLF",
		"Western Sahara EH ESH",
		"Yemen YE YEM",
		"Yugoslavia, Federal Republic of YU YUG",
		"Zambia ZM ZMB",
		"Zimbabwe ZW ZWE"
	);
	
	for(var i = 0; i < countries.length; i++) {
		var str = countries[i].split(" ");
		var s2 = str[str.length - 1];
		var s3 = str[str.length - 2];
		str.splice(str.length - 2, 2);
		countries[i] = new Array(s2, s3, str.join(" "));
	}
	
	return countries;
}