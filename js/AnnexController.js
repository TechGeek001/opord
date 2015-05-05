function AnnexController() {
	this.CONTROLLERS;
	this.PAGE;
	// Variables
	this.GRAPHICS_SCALE;
	this.G;
	// Main Panel Elements
	this.MAIN_PANEL;
	this.MAIN_PANEL_BG;
	this.STEP_1;
	this.STEP_2;
	this.PARTS;
}

AnnexController.prototype.init = function(controllers) {
	var Controller = this;
	var $canvasContainer = $("#graphics-canvas-container");
	var $canvas = $("#graphics-canvas");
	
	this.CONTROLLERS = controllers;
	this.PAGE = $("#annexes");
	// Main Panel Elements
	this.MAIN_PANEL = $("#annex-builder");
	this.MAIN_PANEL_BG = $("#annex-builder-background");
	this.PARTS = this.MAIN_PANEL.find(".annex-part");
	
	// Set the behavior for all top menu items in the annex builder
	this.PARTS.find(".annex-part-menu .btn").click(function() {
		var $btn = $(this);
		var $part = $btn.closest(".annex-part");
		$btn.blur();
		if(!$btn.hasClass("btn-primary")) {
			// Open this section
			Controller.openAnnexBuilderSection($part.data("part"), $btn.data("section"));
		} else {
			// Close this section
			Controller.closeAnnexBuilderSection($part.data("part"));
		}
	});
	
	// Hide the panel if the close button is clicked
	this.MAIN_PANEL.find(".close").click(function(e) {
		e.preventDefault();
		// This is the Annex Builder main panel
		if($(this).hasClass("main")) {
			Controller.closeAnnexBuilder();
		// Else, this is a part's section panel
		} else {
			Controller.closeAnnexBuilderSection($(this).closest(".annex-part").data("part"));
		}
	});
	
	// Add a new appendix if the add links are clicked
	$(".add-annex").click(function(e) {
		e.preventDefault();
		Controller.openAnnexBuilder();
	});
	
	// Complete the init by hiding the second step of the process
	
	// TODO
	//this.MAIN_PANEL.find(".step2").hide();
	//this.MAIN_PANEL_BG.hide();
	this.closeAnnexBuilder();
	this.openAnnexBuilder();
	// END TODO
	
	// Initialize the Graphics Builder
	var canvasWidth = 1080;
	var canvasHeight = 835;
	this.GRAPHICS_SCALE = 1;
	// See if the default height will accomodate the canvas
	var defaultHeight = window.innerHeight - 40;
	// If not, adjust the size until it does
	if(defaultHeight < canvasHeight) {
		canvasScale = Math.round((defaultHeight / canvasHeight) * 100) / 100;
		canvasHeight = defaultHeight;
		canvasWidth = Math.floor((canvasHeight * 11) / 8.5);
		// Adjust the actual annex builder background
		this.MAIN_PANEL.css({
			"height": canvasHeight + "px",
			"margin-top": ((canvasHeight) / -2) + "px",
			"top": "50%"
		});
		canvasHeight -= 47;
	} else {
		canvasHeight = Math.floor((window.innerHeight - 57) * .8);
		canvasWidth = Math.floor((canvasHeight * 11) / 8.5);
	}
	// Center the canvas
	$canvas.css({
		"width": canvasWidth - 2,
		"height": canvasHeight - 2
	});
	$canvasContainer.css({
		"width": canvasWidth,
		"height": canvasHeight,
		"left": "50%",
		"margin-left": (canvasWidth / -2) + "px"
	});
	this.G = new GraphicsBuilder("graphics-canvas", canvasWidth - 2, canvasHeight - 2);
	this.G.setImage(-100, -100, canvasWidth, canvasHeight, 1.3, "img/galloway.png");
	
	this.introControls();
	this.graphicsControls();
}

AnnexController.prototype.introControls = function() {
	var Controller = this;
	var $panel = this.MAIN_PANEL.find(".annex-part[data-part='intro']");
	$panel.find("a").click(function(e) {
		e.preventDefault();
		Controller.openAnnexBuilderPart($(this).data("part"));
	});
}

AnnexController.prototype.graphicsControls = function() {
	var Controller = this;
	var $panel = this.MAIN_PANEL.find(".annex-part[data-part='graphics']");
	var $canvasContainer = $("#graphics-canvas-container");
	var $canvas = $("#graphics-canvas");
	var $gridReporter = $("#grid-reporter").hide();
	
	// GRID CONTROLS
	var $gridPanel = $panel.find(".content[data-section='grid']");
	var $colors = $gridPanel.find(".graphics-color-selected");
	// Clicking anywhere in the grid option checks the correct radio
	$gridPanel.find(".g1").click(function() {
		$(this).find("input[type='radio']").prop("checked", true);
	});
	$gridPanel.find(".g2").click(function() {
		$(this).find("input[type='radio']").prop("checked", true);
	});
	$gridPanel.find(".g3").click(function() {
		$(this).find("input[type='radio']").prop("checked", true);
	});
	// The create grid function
	$gridPanel.find(".create-grid").click(function(e) {
		e.preventDefault();
		var gridType = $gridPanel.find(".grid-type:checked").val();
		var accuracy = parseInt($gridPanel.find(".grid-accuracy:checked").val());
		switch(gridType) {
			case("1"):
				var grid = $gridPanel.find(".g1").find("input[type='text']").val();
				if(!isNaN(grid) && (grid.length == 4 || grid.length == 6)) {
					Controller.G.gridFromAdjacentLines(grid, {accuracy: accuracy});
					Controller.closeAnnexBuilderSection("graphics");
				} else {
					//error
				}
				break;
			case("2"):
				var grid1 = $gridPanel.find(".g2").find("input[type='text']").eq(0).val();
				var grid2 = $gridPanel.find(".g2").find("input[type='text']").eq(1).val();
				if((!isNaN(grid1) && grid1.length == 8) && (!isNaN(grid2) && grid2.length == 8)) {
					Controller.G.gridFromKnownPoints(grid1, grid2, {accuracy: accuracy});
					Controller.closeAnnexBuilderSection("graphics");
				} else {
					//error
				}
				break;
			case("3"):
				var grid = $gridPanel.find(".g3").find("input[type='text']").eq(0).val();
				var distance = parseFloat($gridPanel.find(".g3").find("input[type='text']").eq(1).val());
				var unit = $gridPanel.find(".g3").find("select").val();
				if(!isNaN(grid) && grid.length == 8 && !isNaN(distance) && (
					unit == "m" ||
					unit == "ft" ||
					unit == "yd" ||
					unit == "mi" ||
					unit == "km"
				)) {
					Controller.G.gridFromKnownDistance(grid, distance, unit, {accuracy: accuracy});
					Controller.closeAnnexBuilderSection("graphics");
				} else {
					//error
				}
				break;
			default:
				return false;
		}
	});
	// The delete grid function
	$gridPanel.find(".delete-grid").click(function(e) {
		e.preventDefault();
		Controller.G.removeGrid();
	});
	// Change the colors in the grid graphics
	$gridPanel.find(".graphics-color-bar .item").click(function() {
		$(this).closest(".graphics-colors-container").children(".graphics-color-selected").css("background-color", $(this).css("background-color"));
		Controller.G.setGridColors(
			$colors.eq(3).css("background-color"),
			$colors.eq(4).css("background-color"),
			$colors.eq(0).css("background-color"),
			$colors.eq(1).css("background-color"),
			$colors.eq(2).css("background-color")
		);
	});
	// Show the grid location of the mouse pointer if the grid has been palced
	$canvas.mousemove(function(e) {
		var g = Controller.G.gridToPixel(e);
		if(g) {
			if($gridReporter.is(":hidden")) {
				$gridReporter.show();
			}
			$gridReporter.text("Current Location: " + g);
		} else {
			if(!$gridReporter.is(":hidden")) {
				$gridReporter.hide();
			}
		}
	}).mouseout(function() {
		$gridReporter.hide();
	});
	
	// UNITS CONTROLS
	var linkUnitToGrid = function(s) {
		Controller.G.linkUnitToGrid(s, function() {
			// TODO CALLBACK
		});
	}
	
	var $unitSmallMenu = $("#unit-small-menu").hide();
	var $unitSmallMenuOne = $unitSmallMenu.find(".select-one");
	var $unitSmallMenuMany = $unitSmallMenu.find(".select-many");
	var selectedUnits = new Array();
	var startingSize = .35;
	var $unitsPanel = $panel.find(".content[data-section='units']");
	var $unitPreviewCanvas = $unitsPanel.find("svg");
	var unitPreview = new Unit().settings({scale: startingSize}).draw($unitPreviewCanvas[0]);
	var selectedUnits = null;
	
	// Initially set the small unit panel in the top left
	$unitSmallMenu.css({
		"top": 5,
		"left": 5
	});
	
	// Define the function when a unit is selected and deselected
	this.G.onSelectCallback = function(u) {
		$unitSmallMenu.find(".number").text(u.length);
		if(u.length == 1) {
			$unitSmallMenu.find(".unit-designation").val(u[0].AMPLIFIERS[3]);
			$unitSmallMenu.find(".higher-unit").val(u[0].AMPLIFIERS[4]);
			$unitSmallMenu.find(".comments").val(u[0].AMPLIFIERS[5]);
			$unitSmallMenu.show();
			$unitSmallMenuOne.show();
			$unitSmallMenuMany.hide();
		} else {
			$unitSmallMenuOne.hide();
			$unitSmallMenuMany.show();
		}
		selectedUnits = u;
	}
	
	this.G.offSelectCallback = function(u) {
		if(u.length == 0) {
			$unitSmallMenu.hide();
			selectedUnits = u;
		} else if(u.length == 1) {
			Controller.G.onSelectCallback(u);
		}
	}
	
	this.G.onSymbolMove = function(o) {
		var averageX = 0;
		for(var i = 0; i < o.symbols.length; i++) {
			averageX += o.symbols[i].getTransformValues().translate[0];
		}
		averageX = averageX / o.symbols.length;
		if(averageX <= $canvas.width() / 2) {
			$unitSmallMenu.css({
				"right": 5,
				"left": ""
			});
		} else {
			$unitSmallMenu.css({
				"left": 5,
				"right": ""
			});
		}
		
		var averageY = 0;
		for(var i = 0; i < o.symbols.length; i++) {
			averageY += o.symbols[i].getTransformValues().translate[1];
		}
		averageY = averageY / o.symbols.length;
		if(averageY <= $canvas.height() / 2) {
			$unitSmallMenu.css({
				"bottom": 5,
				"top": ""
			});
		} else {
			$unitSmallMenu.css({
				"top": 5,
				"bottom": ""
			});
		}
	}
	
	// Close the small unit panel and deselect all units
	$unitSmallMenu.find(".close").click(function() {
		$unitSmallMenu.hide();
		Controller.G.removeSelectedSymbol();
	});
	// Copy the selected units
	$unitSmallMenu.find(".copy-unit").click(function() {
		var newSymbols = new Array();
		for(var i = 0; i < selectedUnits.length; i++) {
			newSymbols.push(Controller.G.addSymbol(selectedUnits[i].copy()));
		};
		Controller.G.addSelectedSymbol(newSymbols, true);
	});
	// Delete the selected units
	$unitSmallMenu.find(".delete-unit").click(function() {
		for(var i = 0; i < selectedUnits.length; i++) {
			Controller.G.removeSymbol(selectedUnits[i].getElement().getAttribute("data-index"));
		}
		$unitSmallMenu.hide();
	});
	// Change the unit designation
	$unitSmallMenu.find(".unit-designation").on("input", function() {
		var string = $(this).val();
		for(var i = 0; i < selectedUnits.length; i++) {
			selectedUnits[i].amplifiers({3: string}).draw();
		}
	});
	// Change the higher formation
	$unitSmallMenu.find(".higher-unit").on("input", function() {
		var string = $(this).val();
		for(var i = 0; i < selectedUnits.length; i++) {
			selectedUnits[i].amplifiers({4: string}).draw();
		}
	});
	// Change the comments/location
	$unitSmallMenu.find(".comments").on("input", function() {
		var string = $(this).val();
		for(var i = 0; i < selectedUnits.length; i++) {
			selectedUnits[i].amplifiers({5: string}).draw();
		}
	});
	
	// Add all of the options to the select fields
	var identities = unitPreview.identities();
	var $identity = $unitsPanel.find("select.identity");
	$.each(identities, function(k, v) {
		if(k == "f") {
			$("<option>").attr({
				value: k,
				selected: "selected"
			}).text(v.title).data("type", v.type).appendTo($identity);
		} else {
			$("<option>").attr("value", k).text(v.title).data("type", v.type).appendTo($identity);
		}
	});
	// Set the icons
	var icons = unitPreview.icons();
	var $icon = $unitsPanel.find("select.icon");
	$.each(icons, function(k, v) {
		if(k == "inf") {
			$("<option>").attr({
				value: k,
				selected: "selected"
			}).text(v.title).data("type", v.type).appendTo($icon);
		} else if(typeof v.definition === "undefined") {
			$("<option>").attr({
				value: k,
				disabled: "disabled"
			}).text(v.title).data("type", v.type).appendTo($icon);
		} else {
			$("<option>").attr("value", k).text(v.title).data("type", v.type).appendTo($icon);
		}
	});
	// Set the echelons
	var echelons = unitPreview.echelons();
	var $echelon = $unitsPanel.find("select.echelon");
	$.each(echelons, function(k, v) {
		if(k == "sqd") {
			$("<option>").attr({
				value: k,
				selected: "selected"
			}).text(v.title).data("type", v.type).appendTo($echelon);
		} else {
			$("<option>").attr("value", k).text(v.title).data("type", v.type).appendTo($echelon);
		}
		
	});
	// Set reinforced/detached
	var $refdet = $unitsPanel.find(".refdet");
	// Set the countries
	var countries = unitPreview.countries();
	var $country = $unitsPanel.find("select.country");
	$.each(countries, function(k, v) {
		$("<option>").attr("value", v[1]).text(v[2]).appendTo($country);
	});
	// Set the headquarters selector
	var $headquarters = $unitsPanel.find("select.headquarters");
	// Set the unit designation
	var $unitDesignation = $unitsPanel.find("input.unit-designation");
	// Set the higher formation
	var $higherUnit = $unitsPanel.find("input.higher-unit");
	// Set the comments/location
	var $comments = $unitsPanel.find("input.comments");
	// Set the Taskforce modifier
	var $tf = $unitsPanel.find("input.tf");
	// Set the feint/dummy modifier
	var $fd = $unitsPanel.find("input.fd");
	// Set the size slider
	var $size = $("#size-slider");
	$size.slider({
		value: startingSize,
		min: .2,
		max: .7,
		step: .05,
		slide: function(event, ui) {
			unitPreview.settings({scale: ui.value}).draw();
		},
		change: function(event, ui) {
			unitPreview.settings({scale: ui.value}).draw();
		}
    });
	// Set the frame type
	var $frameType = $unitsPanel.find(".icon-type");
	// Change the unit identification
	$identity.change(function() {
		unitPreview.identity($(this).val()).draw();
	}).change();
	// Change the unit icon
	$icon.change(function() {
		unitPreview.icon($(this).val()).draw();
	}).change();
	// Change the unit echelon
	$echelon.change(function() {
		unitPreview.echelon($(this).val()).draw();
	}).change();
	// Change reinforced/detached
	$refdet.click(function() {
		unitPreview.amplifiers({1: $(this).val()}).draw();
	});
	// Change country indicator
	$country.change(function() {
		unitPreview.amplifiers({2: $(this).val()}).draw();
	});
	// Change the headquarters type
	$headquarters.change(function() {
		var isHeadquarters = $(this).val() != "false";
		unitPreview.amplifiers({10: {a: isHeadquarters}});
		if(isHeadquarters) {
			$echelon.val("none");
			unitPreview.echelon("none");
			if($(this).val() != "true") {
				unitPreview.amplifiers({14: $(this).val()});
			} else {
				unitPreview.amplifiers({14: false});
			}
			unitPreview.draw();
		} else {
			unitPreview.amplifiers({14: false});
			$echelon.change();
		}
	});
	// Change the unit designation
	$unitDesignation.on("input", function() {
		unitPreview.amplifiers({3: $(this).val()}).draw();
	});
	// Change the higher formation
	$higherUnit.on("input", function() {
		unitPreview.amplifiers({4: $(this).val()}).draw();
	});
	// Change the comments/location
	$comments.on("input", function() {
		unitPreview.amplifiers({5: $(this).val()}).draw();
	});
	// Change the TaskForce modifier
	$tf.click(function() {
		unitPreview.amplifiers({8: $(this).is(":checked")}).draw();
	});
	// Change the feint/dummy modifier
	$fd.click(function() {
		unitPreview.amplifiers({9: $(this).is(":checked")}).draw();
	});
	// Change the icon type
	$frameType.click(function() {
		unitPreview.settings({type: $(this).val()}).draw();
	});
	// Add the symbol to the graphics
	$unitsPanel.find($(".add-unit").click(function() {
		unitPreview.draw();
		Controller.G.addSymbol(unitPreview);
		Controller.G.removeSelectedSymbol();
		$unitSmallMenu.hide();
		// Create a new unit for the preview
		unitPreview = new Unit($identity.val(), $icon.val(), $echelon.val()).draw($unitPreviewCanvas[0]);
		// Reset the options
		$refdet.eq(0).prop("checked", "checked");
		$country.val("false");
		$unitDesignation.val("");
		$higherUnit.val("");
		$comments.val("");
		$size.slider("value", startingSize);
		Controller.closeAnnexBuilderSection("graphics");
	}));
}

// Open the Annex Builder Function
AnnexController.prototype.openAnnexBuilder = function() {
	this.MAIN_PANEL.show();
	this.MAIN_PANEL_BG.show();
	this.openAnnexBuilderPart("intro");
}

 // Close the Annex Builder Function
AnnexController.prototype.closeAnnexBuilder = function() {
	this.MAIN_PANEL.hide();
	this.MAIN_PANEL_BG.hide();
	this.PARTS.hide();
}

// Open an Annex Builder Part (e.g. Graphics, Timeline)
AnnexController.prototype.openAnnexBuilderPart = function(part) {
	this.closeAnnexBuilderSection(part);
	this.PARTS.hide();
	this.PARTS.filter(function() {
		return $(this).data("part") == part;
	}).show();
}

// Close the active Annex Builder Part (e.g. Graphics, Timeline)
AnnexController.prototype.closeAnnexBuilderPart = function() {
	this.PARTS.hide();
	this.openAnnexBuilderPart("intro");
}

// Open a section within a part
AnnexController.prototype.openAnnexBuilderSection = function(part, section) {
	this.closeAnnexBuilderSection(part);
	var $part = this.PARTS.filter(function() {
		return $(this).data("part") == part;
	});
	$part.find(".annex-part-menu .btn[data-section='" + section + "']").removeClass("btn-default").addClass("btn-primary");
	$part.find(".content[data-section='" + section + "']").show();
	$part.find(".annex-part-section").show();
}

// Close the active section within a part
AnnexController.prototype.closeAnnexBuilderSection = function(part) {
	var $part = this.PARTS.filter(function() {
		return $(this).data("part") == part;
	});
	$part.find(".annex-part-menu .btn").removeClass("btn-primary").addClass("btn-default");
	$part.find(".content").hide();
	$part.find(".annex-part-section").hide();
}