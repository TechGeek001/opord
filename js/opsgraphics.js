var G;
var $canvasContainer;
var $canvas;
// IMAGE CONTROLS
var $imageModal;
var $imagePanel;
// GRID CONTROLS
var $gridModal;
var $gridPanel;
var gridtype;
// UNIT CONTROLS
var $unitModal;
var $unitPanel;

function init() {
	$(window).resize(resizeCanvas);
	
	// The canvas element
	$canvasContainer = $("#canvas-container");
	$canvas = $canvasContainer.find("#graphics-canvas");
	resizeCanvas();
	
	imageControls();
	gridControls();
	unitControls();
	
	G = new GraphicsBuilder("graphics-canvas", $canvas.width(), $canvas.height());
	G.setImage(-50, -100, $canvas.width(), $canvas.height(), 1.22, "img/galloway.png");
}

function imageControls() {
	// Parent variables
	$imageModal = $("#imageModal");
	$imagePanel = $("#imagePanel");
	// Function variables
	var preview;
	// LOAD THE GRID MODAL DATA
	$imageModal.load("/parts/graphics/image.html", function(response, status, xhr) {
		preview = new GraphicsBuilder("background-preview", $canvas.width(), $canvas.height());
		preview.setImage(0, 0, $canvas.width(), $canvas.height(), 1, "img/galloway.png");
		var moveInt = 10;
		var rotateInt = 1;
		var scaleInt = .1;
		// CHANGE THE IMAGE
		$imageModal.find(".existing-image").change(function() {
			preview.setImage(
				$imageModal.find(".x-position").val(),
				$imageModal.find(".y-position").val(),
				$canvas.width(),
				$canvas.height(),
				$imageModal.find(".scale").val(),
				"/img/" + $imageModal.find(".existing-image").val()
			);
		});
		// CHANGE POSITION LEFT/RIGHT
		$imageModal.find(".left").click(function() {
			var $i = $(this).closest(".input-group").find("input");
			var i = parseFloat($i.val());
			$i.val(i - moveInt).change();
		});
		$imageModal.find(".right").click(function() {
			var $i = $(this).closest(".input-group").find("input");
			var i = parseFloat($i.val());
			$i.val(i + moveInt).change();
		});
		$imageModal.find(".x-position").keyup(function() {
			checkAndMove($(this));
		}).change(function() {
			checkAndMove($(this));
		}).data("last", $(this).val());
		// CHANGE POSITION UP/DOWN
		$imageModal.find(".up").click(function() {
			var $i = $(this).closest(".input-group").find("input");
			var i = parseFloat($i.val());
			$i.val(i - moveInt).change();
		});
		$imageModal.find(".down").click(function() {
			var $i = $(this).closest(".input-group").find("input");
			var i = parseFloat($i.val());
			$i.val(i + moveInt).change();
		});
		$imageModal.find(".y-position").keyup(function() {
			checkAndMove($(this));
		}).change(function() {
			checkAndMove($(this));
		}).data("last", $(this).val());
		// CHANGE ROTATION
		$imageModal.find(".rotate-left").click(function() {
			var $i = $(this).closest(".input-group").find("input");
			var i = parseFloat($i.val());
			$i.val(i - rotateInt).change();
		});
		$imageModal.find(".rotate-right").click(function() {
			var $i = $(this).closest(".input-group").find("input");
			var i = parseFloat($i.val());
			$i.val(i + rotateInt).change();
		});
		$imageModal.find(".rotation").keyup(function() {
			checkAndMove($(this));
		}).change(function() {
			checkAndMove($(this));
		}).data("last", $(this).val());
		// CHANGE SCALE
		$imageModal.find(".scale-down").click(function() {
			var $i = $(this).closest(".input-group").find("input");
			var i = parseFloat($i.val());
			$i.val(i - scaleInt).change();
		});
		$imageModal.find(".scale-up").click(function() {
			var $i = $(this).closest(".input-group").find("input");
			var i = parseFloat($i.val());
			$i.val(i + scaleInt).change();
		});
		$imageModal.find(".scale").keyup(function() {
			checkAndMove($(this));
		}).change(function() {
			checkAndMove($(this));
		}).data("last", $(this).val());
		// FINALIZE THE CHANGES
		$imageModal.find(".change-image").click(function() {
			G.setImage(
				$imageModal.find(".x-position").val(),
				$imageModal.find(".y-position").val(),
				$canvas.width(),
				$canvas.height(),
				$imageModal.find(".scale").val(),
				"/img/" + $imageModal.find(".existing-image").val()
			);
			$imageModal.modal("hide");
		});
		// Check the data coming into the inputs
		function checkAndMove($e) {
			if($e.hasClass("x-position")) {
				if(!isNaN($e.val())) {
					preview.moveImage($e.val(), false);
					$e.data("last", $e.val());
				} else {
					$e.val($e.data("last"));
				}
			} else if($e.hasClass("y-position")) {
				if(!isNaN($e.val())) {
					preview.moveImage(false, $e.val());
					$e.data("last", $e.val());
				} else {
					$e.val($e.data("last"));
				}
			} else if($e.hasClass("rotation")) {
				if(!isNaN($e.val()) && $e.val() >= -360 && $e.val() <= 360) {
					preview.rotateImage($e.val());
					$e.data("last", $e.val());
				} else {
					$e.val($e.data("last"));
				}
			} else if($e.hasClass("scale")) {
				if(!isNaN($e.val())) {
					$e.val(parseFloat($e.val()).toFixed(2));
					preview.scaleImage($e.val());
					$e.data("last", $e.val());
				} else {
					$e.val($e.data("last"));
				}
			}
		}
	});
}

function gridControls() {
	// Parent variables
	$gridModal = $("#gridModal");
	$gridPanel = $("#gridPanel");
	gridtype = -1;
	// Function variables
	var $gridOptions
	var $colors;
	// LOAD THE GRID MODAL DATA
	$gridModal.load("/parts/graphics/grid.html", function(response, status, xhr) {
		$gridOptions = $gridModal.find(".alert");
		$colors = $gridModal.find(".graphics-color-selected");
		// IF THE ALERT DIV IS CLICKED, HIGHLIGHT IT
		$gridOptions.click(function() {
			var $g = $(this);
			gridtype = $g.data("gridtype");
			$gridOptions.not($g).attr("class", "alert alert-default").find("h4").find(".glyphicon").hide();
			// Check the data for correctness
			switch(gridtype) {
				case(1):
					gridPanelStatus(G.checkGridValues(gridtype, 
						$g.find("input[type='text']").val()
					));
					break;
				case(2):
					gridPanelStatus(G.checkGridValues(gridtype, 
						$g.find("input[type='text']").eq(0).val(),
						$g.find("input[type='text']").eq(1).val()
					));
					break;
				case(3):
					gridPanelStatus(G.checkGridValues(gridtype, 
						$g.find("input[type='text']").eq(0).val(),
						$g.find("input[type='text']").eq(1).val(),
						$g.find("select").val()
					));
					break;
			}
		});
		
		$gridOptions.find("input").keyup(function(e) {
			e.stopPropagation();
			var $g = $(this).closest(".alert");
			gridtype = $g.data("gridtype");
			$gridOptions.not($g).attr("class", "alert alert-default").find("h4").find(".glyphicon").hide();
			// Check the data for correctness
			switch(gridtype) {
				case(1):
					gridPanelStatus(G.checkGridValues(gridtype, 
						$g.find("input[type='text']").val()
					));
					break;
				case(2):
					gridPanelStatus(G.checkGridValues(gridtype, 
						$g.find("input[type='text']").eq(0).val(),
						$g.find("input[type='text']").eq(1).val()
					));
					break;
				case(3):
					gridPanelStatus(G.checkGridValues(gridtype, 
						$g.find("input[type='text']").eq(0).val(),
						$g.find("input[type='text']").eq(1).val(),
						$g.find("select").val()
					));
					break;
			}
		});
		
		// Change the colors in the grid graphics
		$gridModal.find(".graphics-color-bar .item").click(function() {
			$(this).closest(".graphics-colors-container").children(".graphics-color-selected").css("background-color", $(this).css("background-color"));
			G.setGridColors(
				$colors.eq(3).css("background-color"),
				$colors.eq(4).css("background-color"),
				$colors.eq(0).css("background-color"),
				$colors.eq(1).css("background-color"),
				$colors.eq(2).css("background-color")
			);
		});
		
		// CREATE THE GRID
		$gridModal.find(".create-grid").click(function(e) {
			e.preventDefault();
			// A variable to hold the result of the data check
			var r;
			// Check the data for correctness
			var $g = $gridOptions.eq(gridtype - 1);
			switch(gridtype) {
				case(1):
					r = G.checkGridValues(gridtype, 
						$g.find("input[type='text']").val()
					);
					break;
				case(2):
					r = G.checkGridValues(gridtype, 
						$g.find("input[type='text']").eq(0).val(),
						$g.find("input[type='text']").eq(1).val()
					);
					break;
				case(3):
					r = G.checkGridValues(gridtype, 
						$g.find("input[type='text']").eq(0).val(),
						$g.find("input[type='text']").eq(1).val(),
						$g.find("select").val()
					);
					break;
				default:
					r = G.checkGridValues(0);
			}
			// The accuracy of the grid lines (4 or 6)
			var accuracy = parseInt($gridModal.find(".grid-accuracy:checked").val());
			// If correct, start building the grid and close this panel
			if(r.success && (accuracy == 4 || accuracy == 6)) {
				switch(gridtype) {
					case(1):
						G.gridFromAdjacentLines(r.data[0], {accuracy: accuracy});
						break;
					case(2):
						G.gridFromKnownPoints(r.data[0], r.data[1], {accuracy: accuracy});
						break;
					case(3):
						G.gridFromKnownDistance(r.data[0], r.data[1], r.data[2], {accuracy: accuracy});
						break;
				}
				$gridModal.modal("hide");
			// Else, display an error and change the color of the relevant alert
			} else {
				gridPanelStatus(r);
			}
		});
	});
	
	// DELETE THE EXISTING GRID
	$gridPanel.find(".delete-grid").click(function(e) {
		e.preventDefault();
		G.removeGrid();
	});
	
	// Change the colors in the grid graphics
	$gridModal.find(".graphics-color-bar .item").click(function() {
		$(this).closest(".graphics-colors-container").children(".graphics-color-selected").css("background-color", $(this).css("background-color"));
		Controller.G.setGridColors(
			$colors.eq(3).css("background-color"),
			$colors.eq(4).css("background-color"),
			$colors.eq(0).css("background-color"),
			$colors.eq(1).css("background-color"),
			$colors.eq(2).css("background-color")
		);
	});
	
	/**
	 * @method gridPanelStatus
	 * Checks the grid data entered for correctness
	 * 
	 * @param r			{Object}					The result object from G.checkGridValues()
	 */
	function gridPanelStatus(r) {
		$e = $gridOptions.eq(gridtype - 1);
		$e.attr("class", "alert");
		// If the result was successful, turn the panel green
		if(r.success) {
			$e.addClass("alert-success");
		} else if(r.code == 1) {
			$e.addClass("alert-warning");
		} else {
			$e.addClass("alert-danger");
		}
	}
}

function unitControls() {
	// Parent variables
	$unitModal = $("#unitModal");
	$unitPanel = $("#unitPanel");
	// Function variables
	var $unitPreviewCanvas;
	var startingSize = .25;
	var unitPreview;
	// LOAD THE GRID MODAL DATA
	$unitModal.load("/parts/graphics/unit.html", function(response, status, xhr) {
		$unitPreviewCanvas = $unitModal.find("svg");
		unitPreview = new Unit("f", "inf", "sqd").settings({scale: startingSize}).draw($unitPreviewCanvas[0]);
		// Add all of the options to the select fields
		var identities = unitPreview.identities();
		var $identity = $unitModal.find("select.identity");
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
		var $icon = $unitModal.find("select.icon");
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
		var $echelon = $unitModal.find("select.echelon");
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
		var $refdet = $unitModal.find(".refdet");
		// Set the countries
		var countries = unitPreview.countries();
		var $country = $unitModal.find("select.country");
		$.each(countries, function(k, v) {
			$("<option>").attr("value", v[1]).text(v[2]).appendTo($country);
		});
		// Set the headquarters selector
		var $headquarters = $unitModal.find("select.headquarters");
		// Set the unit designation
		var $unitDesignation = $unitModal.find("input.unit-designation");
		// Set the higher formation
		var $higherUnit = $unitModal.find("input.higher-unit");
		// Set the comments/location
		var $comments = $unitModal.find("input.comments");
		// Set the Taskforce modifier
		var $tf = $unitModal.find("input.tf");
		// Set the feint/dummy modifier
		var $fd = $unitModal.find("input.fd");
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
		var $frameType = $unitModal.find(".icon-type");
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
		$unitModal.find($(".create-unit").click(function() {
			unitPreview.draw();
			G.addSymbol(unitPreview);
			G.removeSelectedSymbol();
			// Create a new unit for the preview
			unitPreview = new Unit($identity.val(), $icon.val(), $echelon.val()).draw($unitPreviewCanvas[0]);
			// Reset the options
			$refdet.eq(0).prop("checked", "checked");
			$country.val("false");
			$unitDesignation.val("");
			$higherUnit.val("");
			$comments.val("");
			$size.slider("value", startingSize);
			$unitModal.modal("hide");
		}));
	});
}

function resizeCanvas() {
	var originalWidth = 1140;
	// The ratio between the width and height of the canvas (based on 8" x 10.5" print dimensions)
	var aspectRatio = .75;
	var canvasWidth = $canvasContainer.closest(".container").width();
	if(parseInt(canvasWidth * aspectRatio) > window.innerHeight - 91) {
		var canvasHeight = window.innerHeight - 91;
		canvasWidth = parseInt(canvasHeight / aspectRatio);
	} else {
		var canvasHeight = parseInt(canvasWidth * aspectRatio);
	}
	var scale = canvasWidth / originalWidth;
	$canvasContainer.css({
		width: canvasWidth,
		height: canvasHeight,
		left: "50%",
		marginLeft: (canvasWidth / -2)
	});
	$canvas.css({
		width: $canvasContainer.width(),
		height: $canvasContainer.height()
	});
}

$(window).load(init);