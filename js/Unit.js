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
	this.MODIFIERS = {
		1: null,
		2: null
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
				// Convert to integers
				for(var j = 0; j < values[attributes[i]].length; j++) {
					values[attributes[i]][j] = parseInt(values[attributes[i]][j]);
				}
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
	
	this.SVG_GROUP = document.createElementNS("http://www.w3.org/2000/svg", "g");
	// If all of the fields are defined, initialize the object normally
	if(id && icn && ech) {
		// Check that all of the fields are correct and that the definitions exist
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
	} else if(id) {
		// Else, if there is only one string given, this is the result of the toString method. Break it apart and initialize
		this.load(id);
	} else {
		// Else, this is an empty unit
		this.IDENTITY = "0";
		this.ICON = "000";
		this.ECHELON = "000";
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
Unit.prototype.modifier = function(m) {
	if(this.modifiers(m) && (typeof this.modifiers(m).modifies == "undefined" || this.modifiers(m).modifies.indexOf(this.ICON) != -1)) {
		if(m == "000" || m == "001") {
			this.MODIFIERS[this.modifiers(m).type] = null;
		} else {
			this.MODIFIERS[this.modifiers(m).type] = m;
		}
	} else {
		console.error("The given modifier (" + m + ") is not valid or is incomplete.");
	}
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
						if(typeof s === "undefined" || s === null || s == "") {
							this.AMPLIFIERS[i] = null;
						} else if(typeof s !== "string") {
							this.AMPLIFIERS[i] = s.toString();
						} else {
							this.AMPLIFIERS[i] = s;
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
						} else if(typeof s === "string") {
							if(s == "true") {
								this.AMPLIFIERS[i] = true;
							} else if(s == "false") {
								this.AMPLIFIERS[i] = false;
							}
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
							this.AMPLIFIERS[i].a = s.a;
						} else if(typeof s.a === "string") {
							if(s.a == "true") {
								this.AMPLIFIERS[i].a = true;
							} else if(s.a == "false") {
								this.AMPLIFIERS[i].a = false;
							}
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
	
	var drawShape = function(path, o) {
		if(typeof o === "undefined") {
			o = {};
		}
		
		var p = document.createElementNS(xmlns, "path");
		p.setAttributeNS(null, "d", path);
		if(typeof o.dasharray !== "undefined") {
			p.setAttributeNS(null, "stroke-dasharray", o.dasharray);
		}
		if(typeof o.dashoffset !== "undefined") {
			p.setAttributeNS(null, "stroke-dashoffset", o.dashoffset);
		}
		if(typeof o.fill !== "undefined") {
			p.setAttributeNS(null, "fill", o.fill);
		}
		if(typeof o.strokeWidth !== "undefined") {
			p.setAttributeNS(null, "stroke-width", o.strokeWidth);
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
		t.setAttributeNS(null, "text-anchor", anchor);
		t.textContent = text;
		if(typeof o.strokeWidth !== "undefined") {
			t.setAttributeNS(null, "stroke-width", o.strokeWidth);
		} else {
			t.setAttributeNS(null, "stroke-width", 2);
		}
		if(typeof o.fontSize !== "undefined") {
			t.setAttributeNS(null, "font-size", o.fontSize);
		} else {
			t.setAttributeNS(null, "font-size", rectHeight / 3);
		}
		if(typeof o.baseline !== "undefined") {
			t.setAttributeNS(null, "dominant-baseline", o.baseline);
		} else {
			t.setAttributeNS(null, "dominant-baseline", "alphabetic");
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
		var rectHeight = rectWidth * .625;
		var border = rectHeight * .025;
		var echelonSpacer = border * 2;
		var textSpacer = border * 4;
		var hypotenuseConstant = 1.416;														// The ratio of the rotated diamond height to the original rectangle height
		var diamondConstant = 1.85;															// The ratio of the original full icon to the diamond's dimensions
		var quatrefoilConstant = 1.57;														// The ratio of the original full icon to the quatrefoil's dimensions
		var amp5Padding = 0;
		var width = 0;
		var height = 0;
		// Some extra dimensions to take into account later
		var taskforceHeight = rectHeight / 3;												// The height of the taskforce (1/3 the rectangle height)
		var echelonHeight = rectHeight / 4;													// The height of the echelon (1/4 the rectangle height)
		var diamondWidthOffset = (rectWidth - rectHeight) / 2;								// The extra width created by translating the diamond
		var diamondHeightOffset = ((rectHeight * hypotenuseConstant) - rectHeight) / 2;		// The extra height created by translating the diamond
		var squareWidthOffset = (rectWidth - rectHeight) / 2;								// The extra width created by centering the square
		var quatrefoilWidthOffset = (rectWidth - (rectHeight * hypotenuseConstant)) / 2;	// The extra width created by centering the quatrefoil
		// Full frame width/height helps correct issues created by the diamond frame
		var centerX = 0;
		var centerY = 0;
		var iconFullWidth = 0;
		var iconFullHeight = 0;
		var iconWidth = 0;
		var iconHeight = 0;
		var iconOffsetX = 0;
		var iconOffsetY = 0;
		var iconDiamondWidthOffset = 0;
		var iconDiamondHeightOffset = 0;
		var iconQuatrefoilWidthOffset = 0;
		var iconQuatrefoilHeightOffset = 0;
		var echelonWidth = 0;
		// Set some svg group settings
		this.SVG_GROUP.setAttributeNS(null, "stroke-width", border);
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
					centerX = (width + border) / 2;
					centerY = (height + border) / 2;
					iconFullWidth = width;
					iconFullHeight = height;
					iconWidth = height;
					iconHeight = height / 3;
					iconOffsetX = (width - iconWidth) / 2;
					iconOffsetY = iconHeight;
					var o = !frame.dasharray ? {} : {dasharray: frame.dasharray + " " + frame.dasharray, dashoffset: frame.dasharray / 2};
					frameGroup.appendChild(drawRect(0, 0, width, height, o));
					// Translate to make room for the echelon
					frameGroup.setAttributeNS(null, "transform", "translate(0, " + taskforceHeight + ")");
					iconGroup.setAttributeNS(null, "transform", "translate(0, " +  taskforceHeight + ")");
					amp5Padding = 6;
					break;
				case("diamond"):
					width = rectHeight * hypotenuseConstant;
					height = rectHeight * hypotenuseConstant;
					centerX = (width + border) / 2;
					centerY = (height + border) / 2;
					iconFullWidth = rectWidth / diamondConstant;
					iconFullHeight = rectHeight / diamondConstant;
					iconFullOffsetX = (width - iconFullWidth) / 2;
					iconFullOffsetY = (height - iconFullHeight) / 2;
					iconWidth = height * .6;
					iconHeight = iconWidth / 3;
					iconOffsetX = (width - iconWidth) / 2;
					iconOffsetY = (height - iconHeight) / 2;
					var p = "M";
					p += (width / 2) + " 0";
					p += "L" + width + " " + (height / 2);
					p += "L" + (width / 2) + " " + height;
					p += "L0" + " " + (height / 2);
					p += "Z";
					var o = !frame.dasharray ? {} : {dasharray: frame.dasharray + " " + frame.dasharray, dashoffset: frame.dasharray / 2};
					frameGroup.appendChild(drawShape(p, o));
					// Translate to center and make room for the echelon
					frameGroup.setAttributeNS(null, "transform", "translate(0, " + taskforceHeight + ")");
					iconGroup.setAttributeNS(null, "transform", "translate(0, " +  taskforceHeight + ")");
					amp5Padding = -4;
					break;
				case("square"):
					width = rectHeight;
					height = rectHeight;
					centerX = (width + border) / 2;
					centerY = (height + border) / 2;
					iconFullWidth = width;
					iconFullHeight = height;
					iconWidth = height * .8;
					iconHeight = height / 3;
					iconOffsetX = (width - iconWidth) / 2;
					iconOffsetY = iconHeight - (iconHeight * .1);
					var o = !frame.dasharray ? {} : {dasharray: frame.dasharray + " " + frame.dasharray, dashoffset: frame.dasharray / 2};
					frameGroup.appendChild(drawRect(0, 0, width, height, o));
					// Translate to make room for the echelon
					frameGroup.setAttributeNS(null, "transform", "translate(0, " + taskforceHeight + ")");
					iconGroup.setAttributeNS(null, "transform", "translate(0, " +  taskforceHeight + ")");
					amp5Padding = 6;
					break;
				case("quatrefoil"):
					width = rectHeight * hypotenuseConstant;
					height = rectHeight * hypotenuseConstant;
					centerX = (width + border) / 2;
					centerY = (height + border) / 2;
					iconFullWidth = rectWidth / quatrefoilConstant;
					iconFullHeight = rectHeight / quatrefoilConstant;
					iconFullOffsetX = (width - iconFullWidth) / 2;
					iconFullOffsetY = (height - iconFullHeight) / 2;
					iconWidth = height * .6;
					iconHeight = iconWidth / 3;
					iconOffsetX = (width - iconWidth) / 2;
					iconOffsetY = (height - iconHeight) / 2;
					var o = !frame.dasharray ? {} : {dasharray: frame.dasharray + " " + frame.dasharray, dashoffset: frame.dasharray / 2};
					frameGroup.appendChild(drawQuatrefoil(width / 2, height / 2, width / 2, o));
					// Translate to make room for the echelon
					frameGroup.setAttributeNS(null, "transform", "translate(0, " + taskforceHeight + ")");
					iconGroup.setAttributeNS(null, "transform", "translate(0, " +  taskforceHeight + ")");
					amp5Padding = -4;
					break;
			}
		} else {
			
		}
		this.SVG_GROUP.appendChild(frameGroup);
		
		// Build the icon
		if(typeof icon.definition !== "undefined") {
			if(frame.unit_frame == "rect" || frame.unit_frame == "square") {
				if(typeof icon.fullFrame !== "undefined" && icon.fullFrame === true) {
					var useWidth = iconFullWidth;
					var useHeight = iconFullHeight;
					var useOffsetX = 0;
					var useOffsetY = 0;
				} else if(typeof icon.fullFrame !== "undefined" && icon.fullFrame == "mixed") {
					var useWidth1 = iconFullWidth;
					var useHeight1 = iconFullHeight;
					var useOffsetX1 = 0;
					var useOffsetY1 = 0;
					var useWidth2 = iconWidth;
					var useHeight2 = iconHeight;
					var useOffsetX2 = iconOffsetX;
					var useOffsetY2 = iconOffsetY;
				} else {
					var useWidth = iconWidth;
					var useHeight = iconHeight;
					var useOffsetX = iconOffsetX;
					var useOffsetY = iconOffsetY;
				}
			} else {
				if(typeof icon.extendIcon !== "undefined" && icon.extendIcon === true) {
					var useWidth = width;
					var useHeight = height;
					if(frame.unit_frame == "diamond") {
						var useOffsetX = 0;
						var useOffsetY = 0;
					} else {
						var useOffsetX = 0;
						var useOffsetY = 0;
					}
				} else if(typeof icon.fullFrame !== "undefined" && icon.fullFrame === true) {
					var useWidth = iconFullWidth;
					var useHeight = iconFullHeight;
					var useOffsetX = iconFullOffsetX;
					var useOffsetY = iconFullOffsetY;
				} else if(typeof icon.fullFrame !== "undefined" && icon.fullFrame == "mixed") {
					var useWidth1 = iconFullWidth;
					var useHeight1 = iconFullHeight;
					var useOffsetX1 = iconFullOffsetX;
					var useOffsetY1 = iconFullOffsetY;
					var useWidth2 = iconFullWidth - (border * 6);
					var useHeight2 = iconFullHeight - (border * 6);
					var useOffsetX2 = iconOffsetX + (border * 3);
					var useOffsetY2 = iconOffsetY - (border * 2);
				} else {
					var useWidth = iconWidth;
					var useHeight = iconHeight;
					var useOffsetX = iconOffsetX;
					var useOffsetY = iconOffsetY;
				}
			}
			
			for(var i = 0; i < icon.definition.length; i++) {
				var d = icon.definition[i];
				if(typeof d.size !== "undefined" && d.size == "full") {
					var useWidth = useWidth1;
					var useHeight = useHeight1;
					var useOffsetX = useOffsetX1;
					var useOffsetY = useOffsetY1;
				} else if(typeof d.size !== "undefined" && d.size == "oct") {
					var useWidth = useWidth2;
					var useHeight = useHeight2;
					var useOffsetX = useOffsetX2;
					var useOffsetY = useOffsetY2;
				}
				switch(d.type) {
					case("line"):
						var x1 = (d.x1 * useWidth) + useOffsetX;
						var y1 = (d.y1 * useHeight) + useOffsetY;
						var x2 = (d.x2 * useWidth) + useOffsetX;
						var y2 = (d.y2 * useHeight) + useOffsetY;
						iconGroup.appendChild(drawLine(x1, y1, x2, y2));
						break;
					case("text"):
						var x = (d.x * useWidth) + useOffsetX;
						var y = (d.y * useHeight) + useOffsetY;
						var o = typeof d.options !== "undefined" ? d.options : {fill: "transparent"};
						iconGroup.appendChild(drawText(x, y, d.text, "middle", {fill: lineColor, baseline: "central", fontSize: typeof o.fontSize !== "undefined" ? d.options.fontSize * useHeight : rectHeight / 3}));
						break;
					case("circle"):
						var x = (d.x * useWidth) + useOffsetX;
						var y = (d.y * useHeight) + useOffsetY;
						var r = d.r * useHeight;
						var o = typeof d.options !== "undefined" ? d.options : {fill: "transparent"};
						iconGroup.appendChild(drawCircle(x, y, r, o));
						break;
					case("path"):
						var pathFragments = new Array();
						for(var j = 0; j < d.pathArray.length; j++) {
							var s = d.pathArray[j];
							switch(s[0]) {
								case("M"):
								case("L"):
								case("Q"):
								case("C"):
									var k = 0;
									pathFragments.push(s.replace(/[.]?\d+/g, function(n) {
										if(k % 2 == 0) {
											n = (parseFloat(n) * useWidth) + useOffsetX;
										} else {
											n = (parseFloat(n) * useHeight) + useOffsetY;
										}
										k++;
										return n;
									}));
									break;
								case("A"):
									var k = 0;
									pathFragments.push(s.replace(/[.]?\d+/g, function(n) {
										if(k == 0) {
											n = parseFloat(n) * useWidth;
										} else if(k == 1) {
											n = parseFloat(n) * useHeight;
										} else if(k == 5) {
											n = (parseFloat(n) * useWidth) + useOffsetX;
										} else if(k == 6) {
											n = (parseFloat(n) * useHeight) + useOffsetY;
										} else {
											n = n;
										}
										k++;
										return n;
									}));
									break;
								default:
									pathFragments.push(s);
									break;
							}
							pathString = pathFragments.join(" ");
						}
						var o = typeof d.options !== "undefined" ? d.options : {fill: "transparent"};
						iconGroup.appendChild(drawShape(pathString, o));
						break;
				}
			}
		}
		this.SVG_GROUP.appendChild(iconGroup);
		
		// Build the modifiers
		for(var modIndex = 1; modIndex <= 2; modIndex++) {
			if(typeof this.MODIFIERS[modIndex] !== "undefined" && this.MODIFIERS[modIndex] !== null) {
				var modifier = this.modifiers(this.MODIFIERS[modIndex]);
				var useWidth = iconWidth * .6;
				var useHeight = iconHeight - (border * 4);
				var useOffsetX = iconOffsetX + (iconWidth * .2);
				var useOffsetY = modIndex % 2 == 0 ? iconOffsetY + useHeight + (border * 6) : iconOffsetY - useHeight - border;
				for(var i = 0; i < modifier.definition.length; i++) {
					var d = modifier.definition[i];
					switch(d.type) {
						case("line"):
							var x1 = (d.x1 * useWidth) + useOffsetX;
							var y1 = (d.y1 * useHeight) + useOffsetY;
							var x2 = (d.x2 * useWidth) + useOffsetX;
							var y2 = (d.y2 * useHeight) + useOffsetY;
							iconGroup.appendChild(drawLine(x1, y1, x2, y2));
							break;
						case("text"):
							var x = (d.x * useWidth) + useOffsetX;
							var y = (d.y * useHeight) + useOffsetY;
							var anchor = typeof d.anchor === "undefined" ? "middle" : d.anchor;
							var baseline = typeof d.baseline === "undefined" ? "central" : d.baseline;
							iconGroup.appendChild(drawText(x, y, d.text, anchor, {fill: lineColor, baseline: baseline, fontSize: useHeight + (border * 2)}));
							break;
						case("circle"):
							var x = (d.x * useWidth) + useOffsetX;
							var y = (d.y * useHeight) + useOffsetY;
							var r = d.r * useHeight;
							var o = typeof d.options !== "undefined" ? d.options : {fill: "transparent"};
							iconGroup.appendChild(drawCircle(x, y, r, o));
							break;
						case("path"):
							var pathFragments = new Array();
							for(var j = 0; j < d.pathArray.length; j++) {
								var s = d.pathArray[j];
								switch(s[0]) {
									case("M"):
									case("L"):
									case("Q"):
									case("C"):
										var k = 0;
										pathFragments.push(s.replace(/[.]?\d+/g, function(n) {
											if(k % 2 == 0) {
												n = (parseFloat(n) * useWidth) + useOffsetX;
											} else {
												n = (parseFloat(n) * useHeight) + useOffsetY;
											}
											k++;
											return n;
										}));
										break;
									case("A"):
										var k = 0;
										pathFragments.push(s.replace(/[.]?\d+/g, function(n) {
											if(k == 0) {
												n = parseFloat(n) * useWidth;
											} else if(k == 1) {
												n = parseFloat(n) * useHeight;
											} else if(k == 5) {
												n = (parseFloat(n) * useWidth) + useOffsetX;
											} else if(k == 6) {
												n = (parseFloat(n) * useHeight) + useOffsetY;
											} else {
												n = n;
											}
											k++;
											return n;
										}));
										break;
									default:
										pathFragments.push(s);
										break;
								}
								pathString = pathFragments.join(" ");
							}
							var o = typeof d.options !== "undefined" ? d.options : {fill: "transparent"};
							iconGroup.appendChild(drawShape(pathString, o));
							break;
					}
				}
			}
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
			f2Group.appendChild(drawText(0, 0, this.AMPLIFIERS[2], "start", {strokeWidth: 0, fill: lineColor, baseline: "hanging"}));
			f2Group.setAttributeNS(null, "transform", "translate(" + (width + textSpacer) + ", " + taskforceHeight + ")", {fontSize: height / 3});
			this.SVG_GROUP.appendChild(f2Group);
		}
		if(this.AMPLIFIERS[3]) {
			var f3Group = document.createElementNS("http://www.w3.org/2000/svg", "g");
			f3Group.appendChild(drawText(0, centerY, this.AMPLIFIERS[3], "start", {strokeWidth: 0, fill: lineColor, baseline: "central"}));
			f3Group.setAttributeNS(null, "transform", "translate(" + (width + textSpacer) + ", " + taskforceHeight + ")");
			this.SVG_GROUP.appendChild(f3Group);
		}
		if(this.AMPLIFIERS[4]) {
			var f4Group = document.createElementNS("http://www.w3.org/2000/svg", "g");
			f4Group.appendChild(drawText(0, height, this.AMPLIFIERS[4], "start", {strokeWidth: 0, fill: lineColor, baseline: "alphabetic"}));
			f4Group.setAttributeNS(null, "transform", "translate(" + (width + textSpacer) + ", " + taskforceHeight + ")");
			this.SVG_GROUP.appendChild(f4Group);
		}
		if(this.AMPLIFIERS[5]) {
			var f5Group = document.createElementNS("http://www.w3.org/2000/svg", "g");
			f5Group.appendChild(drawText(0, (height * 1.3) - amp5Padding, this.AMPLIFIERS[5], "start", {strokeWidth: 0, fill: lineColor, baseline: "central"}));
			f5Group.setAttributeNS(null, "transform", "translate(" + (width + textSpacer) + ", " + taskforceHeight + ")");
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
	}
	if(typeof canvas !== "undefined") {
		canvas.appendChild(this.SVG_GROUP);
	}
	// TODO this.load(this.toString());
	return this;
}

Unit.prototype.center = function() {
	var unitSize = this.SVG_GROUP.getBBox();
	var parent = this.SVG_GROUP.parentNode;
	while(parent && parent.nodeName.toLowerCase() != "svg") {
		parent = parent.parentNode;
	}
	if(parent.nodeName.toLowerCase() != "svg") {
		console.error("Could not find the containing SVG element");
		return false;
	}
	var thisX = this.SVG_GROUP.getBoundingClientRect().width;
	var thisY = this.SVG_GROUP.getBoundingClientRect().height;
	var parentX = parent.getBoundingClientRect().width;
	var parentY = parent.getBoundingClientRect().height;
	var x = (parentX / 2) - (thisX / 2);
	var y = (parentY / 2) - (thisY / 2);
	this.settings({translate: x + "," + y});
	this.setTransformValues(this.SVG_GROUP);
	return this;
}

// Return the HTML object
Unit.prototype.getElement = function() {
	return this.SVG_GROUP;
}

// Export the unit into a shorthand string
Unit.prototype.toString = function() {
	var amplifierArr = new Array();
	for(var i = 1; i <= 14; i++) {
		if(i != 6 && this.AMPLIFIERS[i] !== null && this.AMPLIFIERS[i] !== false) {
			if(typeof this.AMPLIFIERS[i].a === "undefined") {
				amplifierArr.push(i + ":" + this.AMPLIFIERS[i]);
			} else {
				var subArr = new Array();
				for(var k in this.AMPLIFIERS[i]) {
					if(this.AMPLIFIERS[i][k] !== null) {
						subArr.push(k + ":" + this.AMPLIFIERS[i][k]);
					}
				}
				if(subArr.length > 0) {
					amplifierArr.push(i + ":" + subArr.join(";"));
				}
			}
		}
	}
	var amplifierStr = amplifierArr.join(";");
	var settingsArr = new Array();
	for(var k in this.SETTINGS) {
		if(this.SETTINGS[k] !== false) {
			settingsArr.push(k + ":" + this.SETTINGS[k]);
		}
	}
	var settingsStr = settingsArr.join(";");
	var arr = new Array(
		this.IDENTITY + this.ICON + this.ECHELON,
		amplifierStr,
		settingsStr
	);
	return arr.join("|");
}

// Import the unit from the toString()
Unit.prototype.load = function(str) {
	arr = str.split("|");
	var id = arr[0].substr(0, 1);
	var icn = arr[0].substr(1, 3);
	var ech = arr[0].substr(4, 3);
	var amplifierStr = arr[1];
	var settingsStr = arr[2];
	this.identity(id);
	this.icon(icn);
	this.echelon(ech);
	var amplifierArr = amplifierStr.split(";");
	var o = {};
	for(var i = 0; i < amplifierArr.length; i++) {
		var arr = amplifierArr[i].split(":");
		var k = arr[0];
		var v = !isNaN(arr[1]) ? parseFloat(arr[1]) : arr[1];
		o[k] = v;
	}
	this.amplifiers(o);
	var settingsArr = settingsStr.split(";");
	o = {};
	for(var i = 0; i < settingsArr.length; i++) {
		var arr = settingsArr[i].split(":");
		var k = arr[0];
		var v = !isNaN(arr[1]) ? parseFloat(arr[1]) : arr[1];
		o[k] = v;
	}
	this.settings(o);
	return this;
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
		"0": {
			title: "-- None --"
		},
		"f": {
			title: "Friendly",
			color: "#99CEFB",
			dasharray: false,
			unit_frame: "rect",
			equipment_frame: "circle"
		},
		"a": {
			title: "Assumed Friendly",
			color: "#99CEFB",
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
			color: "#83BC7E",
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
	var fillColor = this.SETTINGS.type == "full" ? "black" : this.identities(this.IDENTITY).color;
	var bgColor = this.SETTINGS.type == "full" ? this.identities(this.IDENTITY).color : "transparent";
	var icons = {
		"000": {
			title: "-- None --",
			type: "unit"
		},
		"ada": {
			title: "Air Defense Artillery",
			type: "unit",
			fullFrame: true,
			definition: new Array(
				{
					type: "path",
					pathArray: new Array(
						"M0,1",
						"C.05,.66 .95,.66 1,1"
					)
				}
			)
		},
		"amd": {
			title: "Air and Missile Defense",
			type: "unit",
			fullFrame: true,
			definition: new Array(
				{
					type: "text",
					text: "MD",
					x: .5,
					y: .5
				},
				{
					type: "path",
					pathArray: new Array(
						"M0,1",
						"C.05,.6 .95,.6 1,1"
					)
				}
			)
		},
		"ana": {
			title: "Anti-Armor",
			type: "unit",
			fullFrame: true,
			definition: new Array(
				{
					type: "line",
					x1: 0,
					x2: .5,
					y1: 1,
					y2: 0
				},
				{
					type: "line",
					x1: .5,
					x2: 1,
					y1: 0,
					y2: 1
				}
			)
		},
		"arm": {
			title: "Armored (Armor)",
			type: "unit",
			definition: new Array(
				{
					type: "path",
					pathArray: new Array(
						"M.1,1",
						"A.1,.5 0 0,1 .1,0"
					)
				},
				{
					type: "line",
					x1: .1,
					x2: .9,
					y1: 0,
					y2: 0
				},
				{
					type: "path",
					pathArray: new Array(
						"M.9,1",
						"A.1,.5 0 0,0 .9,0"
					)
				},
				{
					type: "line",
					x1: .1,
					x2: .9,
					y1: 1,
					y2: 1
				}
			)
		},
		"arc": {
			title: "Armored Cavalry",
			type: "unit",
			fullFrame: "mixed",
			definition: new Array(
				{
					type: "path",
					size: "oct",
					pathArray: new Array(
						"M.1,1",
						"A.1,.5 0 0,1 .1,0"
					)
				},
				{
					type: "line",
					size: "oct",
					x1: .1,
					x2: .9,
					y1: 0,
					y2: 0
				},
				{
					type: "path",
					size: "oct",
					pathArray: new Array(
						"M.9,1",
						"A.1,.5 0 0,0 .9,0"
					)
				},
				{
					type: "line",
					size: "oct",
					x1: .1,
					x2: .9,
					y1: 1,
					y2: 1
				},
				{
					type: "line",
					size: "full",
					x1: 0,
					x2: 1,
					y1: 1,
					y2: 0
				}
			)
		},
		"mai": {
			title: "Mechanized (Armored) Infantry",
			type: "unit",
			fullFrame: "mixed",
			definition: new Array(
				{
					type: "path",
					size: "oct",
					pathArray: new Array(
						"M.1,1",
						"A.1,.5 0 0,1 .1,0"
					)
				},
				{
					type: "line",
					size: "oct",
					x1: .1,
					x2: .9,
					y1: 0,
					y2: 0
				},
				{
					type: "path",
					size: "oct",
					pathArray: new Array(
						"M.9,1",
						"A.1,.5 0 0,0 .9,0"
					)
				},
				{
					type: "line",
					size: "oct",
					x1: .1,
					x2: .9,
					y1: 1,
					y2: 1
				},
				{
					type: "line",
					size: "full",
					x1: 0,
					x2: 1,
					y1: 1,
					y2: 0
				},
				{
					type: "line",
					size: "full",
					x1: 1,
					x2: 0,
					y1: 1,
					y2: 0
				}
			)
		},
		"rwa": {
			title: "Army Aviation / Rotary Wing Aviation",
			type: "unit",
			definition: new Array(
				{
					type: "path",
					pathArray: new Array(
						"M0,0",
						"L1,1",
						"L1,0",
						"L0,1",
						"Z"
					),
					options: {
						fill: fillColor
					}
				}
			)
		},
		"fwa": {
			title: "Fixed Wing Aviation",
			type: "unit",
			definition: new Array(
				{
					type: "path",
					pathArray: new Array(
						"M.16,0",
						"L.84,1",
						"A.16,.5 0 0,0 .84,0",
						"L.16,1",
						"A.16,.5 0 0,1 .16,0",
						"Z"
					),
					options: {
						fill: fillColor
					}
				}
			)
		},
		"bnd": {
			title: "Band",
			type: "unit",
			fullFrame: true,
			definition: new Array(
				{
					type: "text",
					text: "BAND",
					x: .5,
					y: .5
				}
			)
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
			type: "unit",
			definition: new Array(
				{
					type: "path",
					pathArray: new Array(
						"M0,.22",
						"A.125,.33 0 0,1 .25,.22",
						"A.125,.4 0 0,1 0,.22"
					),
					options: {
						fill: fillColor
					}
				},
				{
					type: "path",
					pathArray: new Array(
						"M.125, 0",
						"Q.66,0 .66,1"
					),
					options: {
						strokeWidth: 18,
						fill: "transparent"
					}
				},
				{
					type: "path",
					pathArray: new Array(
						"M1,.22",
						"A.125,.33 0 0,0 .75,.22",
						"A.125,.4 0 0,0 1,.22"
					),
					options: {
						fill: fillColor
					}
				},
				{
					type: "path",
					pathArray: new Array(
						"M.875, 0",
						"Q.33,0 .33,1"
					),
					options: {
						strokeWidth: 18,
						fill: "transparent"
					}
				}
			)
		},
		"che": {
			title: "Chemical, Biological, Radiological, Nuclear, and High-Yield Explosives",
			type: "unit",
			definition: new Array(
				{
					type: "path",
					pathArray: new Array(
						"M0,.22",
						"A.125,.33 0 0,1 .25,.22",
						"A.125,.4 0 0,1 0,.22"
					),
					options: {
						fill: fillColor
					}
				},
				{
					type: "path",
					pathArray: new Array(
						"M.125, 0",
						"Q.66,0 .66,1"
					),
					options: {
						strokeWidth: 18,
						fill: "transparent"
					}
				},
				{
					type: "path",
					pathArray: new Array(
						"M1,.22",
						"A.125,.33 0 0,0 .75,.22",
						"A.125,.4 0 0,0 1,.22"
					),
					options: {
						fill: fillColor
					}
				},
				{
					type: "path",
					pathArray: new Array(
						"M.875, 0",
						"Q.33,0 .33,1"
					),
					options: {
						strokeWidth: 18,
						fill: "transparent"
					}
				},
				{
					type: "path",
					pathArray: new Array(
						"M.33,.5",
						"L.4,0",
						"L.6,0",
						"L.66,.5",
						"L.6,1",
						"L.4,1",
						"Z"
					),
					options: {
						fill: bgColor
					}
				},
				{
					type: "text",
					text: "E",
					x: .5,
					y: .5,
					options: {
						fontSize: .66
					}
				}
			)
		},
		"cva": {
			title: "Civil Affairs",
			type: "unit",
			fullFrame: true,
			definition: new Array(
				{
					type: "text",
					text: "CA",
					x: .5,
					y: .5
				}
			)
		},
		"cmc": {
			title: "Civil-Military Cooperation",
			type: "unit",
			definition: new Array(
				{
					type: "path",
					pathArray: new Array(
						"M0,0",
						"L1,0",
						"L1,.5",
						"A.5,.5 0 0,1 0,.5",
						"Z"
					)
				}
			)
		},
		"crs": {
			title: "Chaplain (Religious Support)",
			type: "unit",
			fullFrame: true,
			definition: new Array(
				{
					type: "text",
					text: "REL",
					x: .5,
					y: .5
				}
			)
		},
		"cba": {
			title: "Combined Arms",
			type: "unit",
			definition: new Array(
				{
					type: "path",
					pathArray: new Array(
						"M.1,1",
						"A.1,.5 0 0,1 .1,0"
					)
				},
				{
					type: "line",
					x1: .1,
					x2: .9,
					y1: 0,
					y2: 0
				},
				{
					type: "path",
					pathArray: new Array(
						"M.9,1",
						"A.1,.5 0 0,0 .9,0"
					)
				},
				{
					type: "line",
					x1: .1,
					x2: .9,
					y1: 1,
					y2: 1
				},
				{
					type: "line",
					x1: .33,
					x2: .66,
					y1: 1,
					y2: 0
				},
				{
					type: "line",
					x1: .33,
					x2: .66,
					y1: 0,
					y2: 1
				}
			)
		},
		"eng": {
			title: "Engineer",
			type: "unit",
			fullFrame: false,
			definition: new Array(
				{
					type: "line",
					x1: 0,
					x2: 1,
					y1: 0,
					y2: 0
				},
				{
					type: "line",
					x1: 0,
					x2: 0,
					y1: 0,
					y2: 1
				},
				{
					type: "line",
					x1: .5,
					x2: .5,
					y1: 0,
					y2: .75
				},
				{
					type: "line",
					x1: 1,
					x2: 1,
					y1: 0,
					y2: 1
				}
			)
		},
		"fda": {
			title: "Field Artillery",
			type: "unit",
			definition: new Array(
				{
					type: "circle",
					x: .5,
					y: .5,
					r: .33,
					options: {
						fill: fillColor
					}
				}
			)
		},
		"fin": {
			title: "Finance",
			type: "unit",
			definition: new Array(
				{
					type: "line",
					x1: .2,
					x2: .8,
					y1: 1,
					y2: 1
				},
				{
					type: "line",
					x1: .2,
					x2: .8,
					y1: .5,
					y2: .5
				},
				{
					type: "line",
					x1: .2,
					x2: .2,
					y1: 1,
					y2: .5
				},
				{
					type: "line",
					x1: .8,
					x2: .8,
					y1: 1,
					y2: .5
				},
				{
					type: "line",
					x1: .2,
					x2: .4,
					y1: .5,
					y2: 0
				},
				{
					type: "line",
					x1: .8,
					x2: .6,
					y1: .5,
					y2: 0
				},
				{
					type: "line",
					x1: .4,
					x2: .6,
					y1: 0,
					y2: 0
				}
			)
		},
		"mtf": {
			title: "Hospital (Medical Treatment Facility)",
			type: "unit",
			fullFrame: true,
			extendIcon: true,
			definition: new Array(
				{
					type: "line",
					x1: 0,
					x2: 1,
					y1: .5,
					y2: .5
				},
				{
					type: "line",
					x1: .5,
					x2: .5,
					y1: 0,
					y2: 1
				},
				{
					type: "line",
					x1: .25,
					x2: .25,
					y1: .33,
					y2: .66
				},
				{
					type: "line",
					x1: .75,
					x2: .75,
					y1: .33,
					y2: .66
				}
			)
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
			type: "unit",
			fullFrame: true,
			definition: new Array(
				{
					type: "text",
					text: "IO",
					x: .5,
					y: .5
				}
			)
		},
		"trp": {
			title: "Interpreter / Translator",
			type: "unit",
			definition: new Array(
				{
					type: "path",
					pathArray: new Array(
						"M.5,.5",
						"L.3,1",
						"L.3,.66",
						"L.1,.66",
						"L.1,.33",
						"L.3,.33",
						"L.3,0",
						"Z"
					)
				},
				{
					type: "path",
					pathArray: new Array(
						"M.5,.5",
						"L.7,1",
						"L.7,.66",
						"L.9,.66",
						"L.9,.33",
						"L.7,.33",
						"L.7,0",
						"Z"
					),
					options: {
						fill: fillColor
					}
				}
			)
		},
		"jag": {
			title: "Judge Advocate General",
			type: "unit",
			fullFrame: true,
			definition: new Array(
				{
					type: "text",
					text: "JAG",
					x: .5,
					y: .5
				}
			)
		},
		"lio": {
			title: "Liaison",
			type: "unit",
			fullFrame: true,
			definition: new Array(
				{
					type: "text",
					text: "LO",
					x: .5,
					y: .5
				}
			)
		},
		"mnt": {
			title: "Maintenance",
			type: "unit",
			definition: new Array(
				{
					type: "path",
					pathArray: new Array(
						"M0,0",
						"L.15,0",
						"Q.25,0 .25,.1",
						"L.25,.9",
						"Q.25,1 .15,1",
						"L0,1",
						"M.25,.5",
						"L.75,.5",
						"M1,0",
						"L.85,0",
						"Q.75,0 .75,.1",
						"L.75,.9",
						"Q.75,1 .85,1",
						"L1,1"
					),
					options: {
						strokeWidth: 8
					}
				}
			)
		},
		"meh": {
			title: "Maneuver Enhancement",
			type: "unit",
			definition: new Array(
				{
					type: "path",
					pathArray: new Array(
						"M.33,0",
						"L.33,.66",
						"L.5,1",
						"L.66,.66",
						"L.66,0",
						"Z"
					),
					options: {
						fill: fillColor
					}
				}
			)
		},
		"med": {
			title: "Medical",
			type: "unit",
			fullFrame: true,
			extendIcon: true,
			definition: new Array(
				{
					type: "line",
					x1: 0,
					x2: 1,
					y1: .5,
					y2: .5
				},
				{
					type: "line",
					x1: .5,
					x2: .5,
					y1: 0,
					y2: 1
				}
			)
		},
		"mih": {
			title: "Military History",
			type: "unit",
			fullFrame: true,
			definition: new Array(
				{
					type: "text",
					text: "MH",
					x: .5,
					y: .5
				}
			)
		},
		"min": {
			title: "Military Intelligence",
			type: "unit",
			fullFrame: true,
			definition: new Array(
				{
					type: "text",
					text: "MI",
					x: .5,
					y: .5
				}
			)
		},
		"mlp": {
			title: "Military Police",
			type: "unit",
			fullFrame: true,
			definition: new Array(
				{
					type: "text",
					text: "MP",
					x: .5,
					y: .5
				}
			)
		},
		"mld": {
			title: "Missile Defense",
			type: "unit",
			fullFrame: true,
			definition: new Array(
				{
					type: "text",
					text: "MD",
					x: .5,
					y: .5
				}
			)
		},
		"ord": {
			title: "Ordnance",
			type: "unit",
			definition: new Array(
				{
					type: "circle",
					x: .5,
					y: .66,
					r: .33
				},
				{
					type: "line",
					x1: .45,
					x2: .41,
					y1: .33,
					y2: 0
				},
				{
					type: "line",
					x1: .43,
					x2: .37,
					y1: .4,
					y2: .1
				},
				{
					type: "line",
					x1: .55,
					x2: .59,
					y1: .33,
					y2: 0
				},
				{
					type: "line",
					x1: .57,
					x2: .63,
					y1: .4,
					y2: .1
				}
			)
		},
		"prs": {
			title: "Personnel (Personnel Services or Human Resources)",
			type: "unit",
			fullFrame: true,
			definition: new Array(
				{
					type: "text",
					text: "PS",
					x: .5,
					y: .5
				}
			)
		},
		"psy": {
			title: "Psycological Operations / Military Information Support Operations (MISO)",
			type: "unit",
			definition: new Array(
				{
					type: "path",
					pathArray: new Array(
						"M.3,.25",
						"Q.25,.25 .25,.3",
						"L.25,.7",
						"Q.25,.75 .3,.75",
						"L.5,.75",
						"L.66,1",
						"L.66,0",
						"L.5,.25",
						"Z",
						"M.66,.25",
						"L.75,.25",
						"M.66,.42",
						"L.75,.42",
						"M.66,.61",
						"L.75,.61",
						"M.66,.75",
						"L.75,.75"
					),
					options: {
						fill: fillColor
					}
				}
			)
		},
		"pba": {
			title: "Public Affairs",
			type: "unit",
			fullFrame: true,
			definition: new Array(
				{
					type: "text",
					text: "PA",
					x: .5,
					y: .5
				}
			)
		},
		"qtm": {
			title: "Quartermaster",
			type: "unit",
			definition: new Array(
				{
					type: "circle",
					x: .8,
					y: .5,
					r: .4
				},
				{
					type: "line",
					x1: 0,
					x2: .65,
					y1: .5,
					y2: .5
				},
				{
					type: "line",
					x1: .1,
					x2: .1,
					y1: .5,
					y2: 1
				},
				{
					type: "line",
					x1: .25,
					x2: .25,
					y1: .5,
					y2: 1
				},
				{
					type: "line",
					x1: .1,
					x2: .25,
					y1: .8,
					y2: .8
				}
			)
		},
		"rgr": {
			title: "Ranger",
			type: "unit",
			fullFrame: true,
			definition: new Array(
				{
					type: "text",
					text: "RGR",
					x: .5,
					y: .5
				}
			)
		},
		"sel": {
			title: "Sea, Air, Land (SEAL) Navy",
			type: "unit",
			fullFrame: true,
			definition: new Array(
				{
					type: "text",
					text: "SEAL",
					x: .5,
					y: .5
				}
			)
		},
		"sec": {
			title: "Security (Internal Security Forces)",
			type: "unit",
			fullFrame: true,
			definition: new Array(
				{
					type: "text",
					text: "SEC",
					x: .5,
					y: .5
				}
			)
		},
		"scp": {
			title: "Security Police",
			type: "unit",
			fullFrame: true,
			definition: new Array(
				{
					type: "text",
					text: "SP",
					x: .5,
					y: .5
				}
			)
		},
		"sig": {
			title: "Signal",
			type: "unit",
			fullFrame: true,
			definition: new Array(
				{
					type: "line",
					x1: 0,
					x2: .5,
					y1: 0,
					y2: .6
				},
				{
					type: "line",
					x1: .5,
					x2: .5,
					y1: .6,
					y2: .4
				},
				{
					type: "line",
					x1: .5,
					x2: 1,
					y1: .4,
					y2: 1
				}
			)
		},
		"spc": {
			title: "Space",
			type: "unit"
		},
		"spf": {
			title: "Special Forces",
			type: "unit",
			fullFrame: true,
			definition: new Array(
				{
					type: "text",
					text: "SF",
					x: .5,
					y: .5
				}
			)
		},
		"sof": {
			title: "Special Operations Forces Joint",
			type: "unit",
			fullFrame: true,
			definition: new Array(
				{
					type: "text",
					text: "SOF",
					x: .5,
					y: .5
				}
			)
		},
		"stp": {
			title: "Special Troops",
			type: "unit",
			fullFrame: true,
			definition: new Array(
				{
					type: "text",
					text: "ST",
					x: .5,
					y: .5
				}
			)
		},
		"spt": {
			title: "Support",
			type: "unit",
			fullFrame: true,
			definition: new Array(
				{
					type: "text",
					text: "SPT",
					x: .5,
					y: .5
				}
			)
		},
		"sbs": {
			title: "Surveillance (Battlefield Surveillance)",
			type: "unit",
			definition: new Array(
				{
					type: "path",
					pathArray: new Array(
						"M.5,0",
						"L.75,1",
						"L.25,1",
						"Z"
					),
					options: {
						fill: fillColor
					}
				}
			)
		},
		"sus": {
			title: "Sustainment",
			type: "unit",
			fullFrame: true,
			definition: new Array(
				{
					type: "text",
					text: "SUST",
					x: .5,
					y: .5
				}
			)
		},
		"trs": {
			title: "Transportation",
			type: "unit",
			definition: new Array(
				{
					type: "circle",
					x: .5,
					y: .5,
					r: .5
				},
				{
					type: "line",
					x1: .5,
					x2: .5,
					y1: 0,
					y2: 1
				},
				{
					type: "line",
					x1: .33,
					x2: .66,
					y1: .5,
					y2: .5
				},
				{
					type: "line",
					x1: .38,
					x2: .62,
					y1: .18,
					y2: .82
				},
				{
					type: "line",
					x1: .62,
					x2: .38,
					y1: .18,
					y2: .82
				}
			)
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

// Modifier Definitions
Unit.prototype.modifiers = function(m) {
	var fillColor = this.SETTINGS.type == "full" ? "black" : frame.color;
	
	var modifiers = {
		"000": {
			title: "-- None --",
			type: 1
		},
		// Table 1 Modifiers
		"ast": {
			title: "Assault",
			type: 1,
			modifies: new Array("rwa"),
			definition: new Array(
				{
					type: "text",
					text: "ASLT",
					x: .5,
					y: .5
				}
			)
		},
		"atk": {
			title: "Attack",
			type: 1,
			modifies: new Array("rwa"),
			definition: new Array(
				{
					type: "text",
					text: "A",
					x: .5,
					y: .5
				}
			)
		},
		"sar": {
			title: "Search and Rescue",
			type: 1,
			modifies: new Array("rwa"),
			definition: new Array(
				{
					type: "text",
					text: "SAR",
					x: .5,
					y: .5
				}
			)
		},
		"uas": {
			title: "Unmanned Aerial System",
			type: 1,
			modifies: new Array("rwa")
		},
		"utl": {
			title: "Utility",
			type: 1,
			modifies: new Array("rwa"),
			definition: new Array(
				{
					type: "text",
					text: "U",
					x: .5,
					y: .5
				}
			)
		},
		"bio": {
			title: "Biological",
			type: 1,
			modifies: new Array("cem"),
			definition: new Array(
				{
					type: "text",
					text: "B",
					x: .5,
					y: .5
				}
			)
		},
		"che": {
			title: "Chemical",
			type: 1,
			modifies: new Array("cem"),
			definition: new Array(
				{
					type: "text",
					text: "C",
					x: .5,
					y: .5
				}
			)
		},
		"dec": {
			title: "Decontamination",
			type: 1,
			modifies: new Array("cem"),
			definition: new Array(
				{
					type: "text",
					text: "D",
					x: .5,
					y: .5
				}
			)
		},
		"nuc": {
			title: "Nuclear",
			type: 1,
			modifies: new Array("cem"),
			definition: new Array(
				{
					type: "text",
					text: "N",
					x: .5,
					y: .5
				}
			)
		},
		"rad": {
			title: "Radiological",
			type: 1,
			modifies: new Array("cem"),
			definition: new Array(
				{
					type: "text",
					text: "R",
					x: .5,
					y: .5
				}
			)
		},
		"smk": {
			title: "Smoke (Obscuration)",
			type: 1,
			modifies: new Array("cem"),
			definition: new Array(
				{
					type: "text",
					text: "S",
					x: .5,
					y: .5
				}
			)
		},
		"bdg": {
			title: "Bridging",
			type: 1,
			modifies: new Array("eng")
		},
		"cbt": {
			title: "Combat",
			type: 1,
			modifies: new Array("eng"),
			definition: new Array(
				{
					type: "text",
					text: "CBT",
					x: .5,
					y: .5
				}
			)
		},
		"con": {
			title: "Construction (NATO)",
			type: 1,
			modifies: new Array("eng"),
			definition: new Array(
				{
					type: "text",
					text: "CON",
					x: .5,
					y: .5
				}
			)
		},
		"div": {
			title: "Diving",
			type: 1,
			modifies: new Array("eng")
		},
		"drl": {
			title: "Drilling",
			type: 1,
			modifies: new Array("eng")
		},
		"gen": {
			title: "General",
			type: 1,
			modifies: new Array("eng"),
			definition: new Array(
				{
					type: "text",
					text: "GEN",
					x: .5,
					y: .5
				}
			)
		},
		"top": {
			title: "Topographic",
			type: 1,
			modifies: new Array("eng")
		},
		"fdc": {
			title: "Fire Direction Center",
			type: 1,
			modifies: new Array("fda"),
			definition: new Array(
				{
					type: "text",
					text: "FDC",
					x: .5,
					y: .5
				}
			)
		},
		"met": {
			title: "Meteorological",
			type: 1,
			modifies: new Array("fda"),
			definition: new Array(
				{
					type: "text",
					text: "MET",
					x: .5,
					y: .5
				}
			)
		},
		"mrl": {
			title: "Multiple Rocket Launcher",
			type: 1,
			modifies: new Array("fda")
		},
		"srl": {
			title: "Single Rocket Launcher",
			type: 1,
			modifies: new Array("fda")
		},
		"sur": {
			title: "Survey",
			type: 1,
			modifies: new Array("fda")
		},
		"tga": {
			title: "Target Acquisition",
			type: 1,
			modifies: new Array("fda"),
			definition: new Array(
				{
					type: "text",
					text: "TA",
					x: .5,
					y: .5
				}
			)
		},
		"mtr": {
			title: "Mortar",
			type: 1,
			modifies: new Array("inf", "mai")
		},
		"snp": {
			title: "Sniper",
			type: 1,
			modifies: new Array("inf", "mai")
		},
		"wpn": {
			title: "Weapons",
			type: 1,
			modifies: new Array("inf", "mai"),
			definition: new Array(
				{
					type: "text",
					text: "W",
					x: .5,
					y: .5
				}
			)
		},
		"elo": {
			title: "Electro-Optical",
			type: 1,
			modifies: new Array("mnt"),
			definition: new Array(
				{
					type: "text",
					text: "EO",
					x: .5,
					y: .5
				}
			)
		},
		"mr1": {
			title: "NATO Medical Role 1",
			type: 1,
			modifies: new Array("med"),
			definition: new Array(
				{
					type: "text",
					text: "1",
					x: .6,
					y: .5,
					anchor: "start"
				}
			)
		},
		"mr2": {
			title: "NATO Medical Role 2",
			type: 1,
			modifies: new Array("med"),
			definition: new Array(
				{
					type: "text",
					text: "2",
					x: .6,
					y: .5,
					anchor: "start"
				}
			)
		},
		"mr3": {
			title: "NATO Medical Role 3",
			type: 1,
			modifies: new Array("med"),
			definition: new Array(
				{
					type: "text",
					text: "3",
					x: .6,
					y: .5,
					anchor: "start"
				}
			)
		},
		"mr4": {
			title: "NATO Medical Role 4",
			type: 1,
			modifies: new Array("med"),
			definition: new Array(
				{
					type: "text",
					text: "4",
					x: .6,
					y: .5,
					anchor: "start"
				}
			)
		},
		"cin": {
			title: "Counterintelligence",
			type: 1,
			modifies: new Array("min"),
			definition: new Array(
				{
					type: "text",
					text: "CI",
					x: .5,
					y: .5
				}
			)
		},
		"eww": {
			title: "Electronic Warfare",
			type: 1,
			modifies: new Array("min"),
			definition: new Array(
				{
					type: "text",
					text: "EW",
					x: .5,
					y: .5
				}
			)
		},
		"sen": {
			title: "Sensor",
			type: 1,
			modifies: new Array("min")
		},
		"sgi": {
			title: "Signals Intelligence",
			type: 1,
			modifies: new Array("min")
		},
		"tae": {
			title: "Tactical Exploitation",
			type: 1,
			modifies: new Array("min"),
			definition: new Array(
				{
					type: "text",
					text: "TE",
					x: .5,
					y: .5
				}
			)
		},
		"cid": {
			title: "Criminal Investigation Division",
			type: 1,
			modifies: new Array("mlp"),
			definition: new Array(
				{
					type: "text",
					text: "CID",
					x: .5,
					y: .5
				}
			)
		},
		"det": {
			title: "Detention",
			type: 1,
			modifies: new Array("mlp"),
			definition: new Array(
				{
					type: "text",
					text: "DET",
					x: .5,
					y: .5
				}
			)
		},
		"dog": {
			title: "Military Working Dog",
			type: 1,
			modifies: new Array("mlp"),
			definition: new Array(
				{
					type: "text",
					text: "DOG",
					x: .5,
					y: .5
				}
			)
		},
		"swt": {
			title: "Special Weapons and Tactics",
			type: 1,
			modifies: new Array("mlp"),
			definition: new Array(
				{
					type: "text",
					text: "SWAT",
					x: .5,
					y: .5
				}
			)
		},
		"eod": {
			title: "Explosive Ordinance Disposal",
			type: 1,
			modifies: new Array("ord"),
			definition: new Array(
				{
					type: "text",
					text: "EOD",
					x: .5,
					y: .5
				}
			)
		},
		"ptl": {
			title: "Postal",
			type: 1,
			modifies: new Array("prs")
		},
		"moa": {
			title: "Mortuary Affairs",
			type: 1,
			modifies: new Array("qtm")
		},
		"pln": {
			title: "Pipeline",
			type: 1,
			modifies: new Array("qtm")
		},
		"wtr": {
			title: "Water",
			type: 1,
			modifies: new Array("qtm")
		},
		"bor": {
			title: "Border",
			type: 1,
			modifies: new Array("sec"),
			definition: new Array(
				{
					type: "text",
					text: "BOR",
					x: .5,
					y: .5
				}
			)
		},
		"dig": {
			title: "Digital",
			type: 1,
			modifies: new Array("sig"),
			definition: new Array(
				{
					type: "text",
					text: "DIG",
					x: .5,
					y: .5
				}
			)
		},
		"enh": {
			title: "Enhanced",
			type: 1,
			modifies: new Array("sig"),
			definition: new Array(
				{
					type: "text",
					text: "ENH",
					x: .5,
					y: .5
				}
			)
		},
		"net": {
			title: "Network / Network Operations",
			type: 1,
			modifies: new Array("sig"),
			definition: new Array(
				{
					type: "text",
					text: "NET",
					x: .5,
					y: .5
				}
			)
		},
		"tcs": {
			title: "Tactical Satellite",
			type: 1,
			modifies: new Array("sig")
		},
		"vdi": {
			title: "Video Imagery (Combat Camera)",
			type: 1,
			modifies: new Array("sig")
		},
		"air": {
			title: "Airfield, Aerial Port of Debarkation / Embarkation",
			type: 1,
			modifies: new Array("trs")
		},
		"mcc": {
			title: "Movement Control Center",
			type: 1,
			modifies: new Array("trs"),
			definition: new Array(
				{
					type: "text",
					text: "MCC",
					x: .5,
					y: .5
				}
			)
		},
		"rwy": {
			title: "Railway / Railhead",
			type: 1,
			modifies: new Array("trs")
		},
		"spt": {
			title: "Seaport, Seaport of Debarkation / Embarkation",
			type: 1,
			modifies: new Array("trs")
		},
		"wcf": {
			title: "Watercraft",
			type: 1,
			modifies: new Array("trs")
		},
		"ara": {
			title: "Area",
			type: 1,
			definition: new Array(
				{
					type: "text",
					text: "AREA",
					x: .5,
					y: .5
				}
			)
		},
		"arm": {
			title: "Armored (Protection)",
			type: 1
		},
		"clp": {
			title: "Close Protection (NATO)",
			type: 1,
			definition: new Array(
				{
					type: "text",
					text: "CLP",
					x: .5,
					y: .5
				}
			)
		},
		"cac": {
			title: "Command and Control",
			type: 1,
			definition: new Array(
				{
					type: "text",
					text: "C2",
					x: .5,
					y: .5
				}
			)
		},
		"ccc": {
			title: "Cross-Cultural Communication",
			type: 1,
			definition: new Array(
				{
					type: "text",
					text: "CCC",
					x: .5,
					y: .5
				}
			)
		},
		"crc": {
			title: "Crowd and Riot Control (NATO)",
			type: 1,
			definition: new Array(
				{
					type: "text",
					text: "CRC",
					x: .5,
					y: .5
				}
			)
		},
		"drc": {
			title: "Direct Communications (NATO)",
			type: 1
		},
		"teh": {
			title: "Theater Support",
			type: 1
		},
		"aeh": {
			title: "Army / Theater Army Support",
			type: 1
		},
		"ceh": {
			title: "Corps Support",
			type: 1
		},
		"deh": {
			title: "Division Support",
			type: 1
		},
		"beh": {
			title: "Brigade Support",
			type: 1
		},
		"feh": {
			title: "Force (USMC) Support",
			type: 1,
			definition: new Array(
				{
					type: "text",
					text: "F",
					x: .5,
					y: .5
				}
			)
		},
		"fws": {
			title: "Forward Support",
			type: 1,
			definition: new Array(
				{
					type: "text",
					text: "FWD",
					x: .5,
					y: .5
				}
			)
		},
		"hqe": {
			title: "Headquarters / Headquarters Element",
			type: 1,
			fullFrame: true
		},
		"mnt": {
			title: "Maintenance",
			type: 1
		},
		"mde": {
			title: "Medical Evacuation",
			type: 1
		},
		"mas": {
			title: "Mobile Advisor and Support (NATO)",
			type: 1
		},
		"mbs": {
			title: "Mobility Support",
			type: 1,
			definition: new Array(
				{
					type: "text",
					text: "MS",
					x: .5,
					y: .5
				}
			)
		},
		"mln": {
			title: "Multinational",
			type: 1,
			definition: new Array(
				{
					type: "text",
					text: "MN",
					x: .5,
					y: .5
				}
			)
		},
		"msu": {
			title: "Multinational Specialized Unit (NATO)",
			type: 1,
			definition: new Array(
				{
					type: "text",
					text: "MSU",
					x: .5,
					y: .5
				}
			)
		},
		"ops": {
			title: "Operations",
			type: 1,
			definition: new Array(
				{
					type: "text",
					text: "OPS",
					x: .5,
					y: .5
				}
			)
		},
		"pol": {
			title: "Petrolium, Oil, and Lubricants (POL)",
			type: 1,
			definition: new Array(
				{
					type: "path",
					pathArray: new Array(
						"M.33,0",
						"L.66,0",
						"L.5,.5",
						"Z",
						"M.5,.5",
						"L.5,1"
					)
				}
			)
		},
		"rdr": {
			title: "Radar",
			type: 1
		},
		// Modifier table 2
		"001": {
			title: "-- None --",
			type: 2
		},
		"aas": {
			title: "Air Assault",
			type: 2,
			definition: new Array(
				{
					type: "path",
					pathArray: new Array(
						"M.1,.3",
						"L.5,1",
						"L.9,.3"
					)
				}
			)
		},
		"abn": {
			title: "Airborne",
			type: 2,
			definition: new Array(
				{
					type: "path",
					pathArray: new Array(
						"M0,1",
						"Q.25,0 .5,1",
						"Q.75,0 1,1"
					)
				}
			)
		},
		"aph": {
			title: "Amphibious",
			type: 2,
			fullFrame: true
		},
		"sld": {
			title: "Arctic (Sled)",
			type: 2
		},
		"bcy": {
			title: "Bicycle-Equipped",
			type: 2
		},
		"mtn": {
			title: "Mountain",
			type: 2
		},
		"ovs": {
			title: "Over-Snow (Prime Mover)",
			type: 2
		},
		"pka": {
			title: "Pack Animal",
			type: 2
		},
		"rrd": {
			title: "Railroad",
			type: 2
		},
		"rof": {
			title: "Riverine or Floating",
			type: 2
		},
		"ski": {
			title: "Ski",
			type: 2
		},
		"twd": {
			title: "Towed",
			type: 2
		},
		"trk": {
			title: "Tracked or Self-Propelled",
			type: 2
		},
		"vtl": {
			title: "Vertical Take-Off and Landing",
			type: 2,
			definition: new Array(
				{
					type: "text",
					text: "VTOL",
					x: .5,
					y: .5
				}
			)
		},
		"wld": {
			title: "Wheeled",
			type: 2
		},
		"clr": {
			title: "Close Range",
			type: 2,
			definition: new Array(
				{
					type: "text",
					text: "CR",
					x: .5,
					y: .5
				}
			)
		},
		"hvy": {
			title: "Heavy",
			type: 2,
			definition: new Array(
				{
					type: "text",
					text: "H",
					x: .5,
					y: .5
				}
			)
		},
		"hal": {
			title: "High Altitude",
			type: 2,
			definition: new Array(
				{
					type: "text",
					text: "HA",
					x: .5,
					y: .5
				}
			)
		},
		"lte": {
			title: "Light",
			type: 2,
			definition: new Array(
				{
					type: "text",
					text: "L",
					x: .5,
					y: .5
				}
			)
		},
		"lrg": {
			title: "Long Range",
			type: 2,
			definition: new Array(
				{
					type: "text",
					text: "LR",
					x: .5,
					y: .5
				}
			)
		},
		"lat": {
			title: "Low Altitude",
			type: 2,
			definition: new Array(
				{
					type: "text",
					text: "LA",
					x: .5,
					y: .5
				}
			)
		},
		"lma": {
			title: "Low to Medium Altitude",
			type: 2,
			definition: new Array(
				{
					type: "text",
					text: "LMA",
					x: .5,
					y: .5
				}
			)
		},
		"med": {
			title: "Medium",
			type: 2,
			definition: new Array(
				{
					type: "text",
					text: "M",
					x: .5,
					y: .5
				}
			)
		},
		"mat": {
			title: "Medium Altitude",
			type: 2,
			definition: new Array(
				{
					type: "text",
					text: "MA",
					x: .5,
					y: .5
				}
			)
		},
		"mdr": {
			title: "Medium Range",
			type: 2,
			definition: new Array(
				{
					type: "text",
					text: "MR",
					x: .5,
					y: .5
				}
			)
		},
		"mha": {
			title: "Medium to High Altitude",
			type: 2,
			definition: new Array(
				{
					type: "text",
					text: "MHA",
					x: .5,
					y: .5
				}
			)
		},
		"shr": {
			title: "Short Range",
			type: 2,
			definition: new Array(
				{
					type: "text",
					text: "SR",
					x: .5,
					y: .5
				}
			)
		},
		"vhv": {
			title: "Very Heavy",
			type: 2,
			modifies: new Array("fda"),
			definition: new Array(
				{
					type: "text",
					text: "VH",
					x: .5,
					y: .5
				}
			)
		},
		"las": {
			title: "Launcher (UAV)",
			type: 2,
			modifies: new Array("rwa")
		},
		"ras": {
			title: "Recovery (UAV)",
			type: 2,
			modifies: new Array("rwa")
		},
		"dcn": {
			title: "Decontamination",
			type: 2,
			modifies: new Array("cem"),
			definition: new Array(
				{
					type: "text",
					text: "D",
					x: .5,
					y: .5
				}
			)
		},
		"lab": {
			title: "Laboratory",
			type: 2,
			modifies: new Array("cem"),
			definition: new Array(
				{
					type: "text",
					text: "LAB",
					x: .5,
					y: .5
				}
			)
		},
		"cty": {
			title: "Casualty Staging (NATO)",
			type: 2,
			modifies: new Array("med"),
			definition: new Array(
				{
					type: "text",
					text: "CS",
					x: .6,
					y: .5,
					anchor: "start"
				}
			)
		},
		"dtl": {
			title: "Dental",
			type: 2,
			modifies: new Array("med"),
			definition: new Array(
				{
					type: "text",
					text: "D",
					x: .6,
					y: .5,
					anchor: "start"
				}
			)
		},
		"psy": {
			title: "Psycological",
			type: 2,
			modifies: new Array("med"),
			definition: new Array(
				{
					type: "text",
					text: "P",
					x: .6,
					y: .5,
					anchor: "start"
				}
			)
		},
		"vet": {
			title: "Veterinary",
			type: 2,
			modifies: new Array("med"),
			definition: new Array(
				{
					type: "text",
					text: "V",
					x: .6,
					y: .5,
					anchor: "start"
				}
			)
		},
		"anl": {
			title: "Analysis",
			type: 2,
			modifies: new Array("min")
		},
		"drf": {
			title: "Direction Finding",
			type: 2,
			modifies: new Array("min")
		},
		"elr": {
			title: "Electronic Ranging",
			type: 2,
			modifies: new Array("min")
		},
		"int": {
			title: "Intercept",
			type: 2,
			modifies: new Array("min")
		},
		"jam": {
			title: "Jamming",
			type: 2,
			modifies: new Array("min")
		},
		"sch": {
			title: "Search",
			type: 2,
			modifies: new Array("min")
		},
		"spy": {
			title: "Supply",
			type: 2,
			fullFrame: true,
			modifies: new Array("qtm")
		},
		"itm": {
			title: "Intermodal",
			type: 2,
			modifies: new Array("trs")
		},
		"rec": {
			title: "Recovery",
			type: 2
		},
		"str": {
			title: "Strategic",
			type: 2,
			definition: new Array(
				{
					type: "text",
					text: "STR",
					x: .5,
					y: .5
				}
			)
		},
		"sup": {
			title: "Support",
			type: 2,
			definition: new Array(
				{
					type: "text",
					text: "SPT",
					x: .5,
					y: .5
				}
			)
		},
		"tac": {
			title: "Tactical",
			type: 2,
			definition: new Array(
				{
					type: "text",
					text: "TAC",
					x: .5,
					y: .5
				}
			)
		},
	}
	
	if(typeof m !== "undefined") {
		if(typeof modifiers[m] !== "undefined") {
			return modifiers[m];
		} else {
			return false;
		}
	} else {
		return modifiers;
	}
}

// Unit Size Definitions
Unit.prototype.echelons = function(ech) {
	var echelons = {
		"000": {
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