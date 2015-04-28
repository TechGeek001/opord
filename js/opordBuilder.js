// App variables
var active_section = new Array(0,1);
var controllers = new Array(
	new AdminInfoController(),
	new AnnexController()
);
var sections = new Array(); // Sections and subsections are base 0
var version = "0.1";
// Page elements
var $main_nav_elements;
var $title;
var fragments;
var $preview;
var $content;
var $annexes;

$(document).ready(function() {
	// Identify key elements
	$title = $("h1");
	$preview = $("#preview");
	$annexes = $("#annexes-menu");
	$content = $("#content");
	// Call the startup function
	startup();
	// Call the preview function
	preview();
});

// Actions to take on startup
var startup = function() {
	$title.find("small").text("Version " + version);
	// Set actions for main navigation
	$main_nav_elements = $("#main_navigation").find("li");
	$main_nav_elements.click(function(event) {
		event.preventDefault();
		navigate($main_nav_elements.index($(this)), 0);
	});
	// Load HTML fragments into the builder
	fragments = {
		"_length": 14,
		"_sections": 7,
		"admin_info": {
			"task_org": "Task Organization",
			"data": "Admin Data",
			"operation": "Operation",
			"references": "References",
			"timeline": "Timeline"
		},
		"situation": {
			"area_of_operations": "Area of Operations"
		},
		"mission": false,
		"execution": {
			"concept": "Concept of the Operation" // KDDTMK
		},
		"sustainment": {
			"classes_of_supply": "Classes of Supply"
		},
		"command_and_signal": {
			"succession_of_command": "Succession of Command"
		},
		"annexes": {
			"a": "Annex A (Task Organization)",
			"b": "Annex B (Intelligence)",
			"c": "Annex C (Operations)",
			"d": "Annex D (Fire Support)"
		}
	}
	
	// Top level keys are in the main menu
	var $container = $("#content");
	var loaded = 0;
	var section = 0;
	var subsection = 0;
	
	var onSectionLoad = function(status, $container) {
		if(status == "error") {
			if($container.attr("id").indexOf("-") > -1) {
				$container.html("<p class=\"text-danger\">There was an error loading this section</p>");
			} else {
				$("<p>").attr("class", "text-danger").text("There was an error loading this section").appendTo($container);
			}
		}
		// Once all the parts have been loaded, assign part-specific controls from JS objects
		loaded++;
		if(loaded == fragments._length) {
			for(var i = 0; i < controllers.length; i++) {
				controllers[i].init(controllers);
			}
		}
	}
	
	for(var k in fragments) {
		if(fragments.hasOwnProperty(k) && k.charAt(0) != "_") {
			// Add this section to the array
			sections.push(new Array(k));
			// Handle ANNEXES differently from all other sections
			if(k != "annexes") {
				// Create a new DIV to put the content in
				var $part_container = $("<div>").attr("id", k).appendTo($container);
				// Create navigation for any sub-parts
				var $part_navigation = $("<nav>").attr("class", "navbar navbar-default").prependTo($part_container);
				// Iterate through the expected parts
				if(typeof fragments[k] === "boolean") {	// If the value is boolean, this has no sub-parts
					// Indicate that there are no sub-parts on the part navigation
					$part_navigation.append($("<p>").text("There are no sub-parts to this section").attr("class", "navbar-text"));
					$part_container.load("/parts/" + k + "/" + k + ".html", function(response, status, xhr) {
						onSectionLoad(status, $(this));
					}).hide();
				} else {	// Else, iterate through all the sub-parts
					sections[section][1] = new Array();
					// Create the navigation item for the sub-parts
					var $sub_navigation = $("<ul>").attr("class", "nav navbar-nav");
					for(var k2 in fragments[k]) {
						if(fragments[k].hasOwnProperty(k2)) {
							// Add this subsection to the array
							sections[section][1].push(k + "-" + k2);
							// Create a navigation item for this sub-part
							$sub_navigation.append($("<li>").html(
								"<a href=\"#\"><span class=\"glyphicon glyphicon-remove-circle red\"></span> " + fragments[k][k2] + "</a>"
							).data({"a": section, "b": subsection}).click(function(event) {
								event.preventDefault();
								$e = $(this);
								navigate($e.data("a"), $e.data("b"));
							}));
							// Create a new DIV to put the content in
							var $sub_container = $("<div>").attr("id", k + "-" + k2).appendTo($part_container);
							// Load in the HTML
							$sub_container.load("/parts/" + k + "/" + k2 + ".html", function(response, status, xhr) {
								onSectionLoad(status, $(this));
							}).hide();
							subsection++;
						}
					}
					// Append the sub-part navigation to the parent
					// See if the list items are wider than the container
					if($sub_navigation.find("li").length > 3) {
						$sub_navigation = $("<ul>").attr("class", "nav navbar-nav").append(
							$("<li>").attr("class", "dropdown").append(
								$("<a>").attr({
									"href": "#",
									"class": "dropdown-toggle",
									"data-toggle": "dropdown",
									"aria-expanded": "false"
								}).text("Navigate Section ").append(
									$("<span>").attr("class", "caret")
								)
							).append($sub_navigation.attr("class", "dropdown-menu"))
						);
					}
					$part_navigation.append($sub_navigation);
				}
			// ANNEXES have a different style menu
			} else {
				// Create a new DIV to put the content in
				var $part_container = $("<div>").attr("id", k).appendTo($container);
				// Create navigation for any sub-parts
				var $part_navigation = $annexes;
				sections[section][1] = new Array();
				var collapseMod = " in";
				for(var k2 in fragments[k]) {
					if(fragments[k].hasOwnProperty(k2)) {
						// Create the navigation item for the sub-parts
						var $sub_navigation = $("<div>").attr("class", "panel panel-default").appendTo($part_navigation);
						// Add this subsection to the array
						sections[section][1].push(k + "-" + k2);
						// Create a navigation item for this sub-part
						$sub_navigation.append($("<div>").attr({
							"class": "panel-heading",
							"role": "tab",
							"id": k2 + "-heading"
						}).html(
							"<h4 class=\"panel-title\"><a class=\"collapsed\" data-toggle=\"collapse\" data-parent=\"#annexes-menu\" href=\"#" + k2 + "-panel\" aria-expanded=\"false\" aria-controls=\"" + k2 + "-panel\">" + fragments[k][k2] + "</a></h4>"
						));
						$sub_navigation.append($("<div>").attr({
							"id": k2 + "-panel",
							"class": "panel-collapse collapse" + collapseMod,
							"role": "tabpanel",
							"aria-labelledby": k2 + "-heading"
						}).html(
							"<ul class=\"list-group\"></ul><div class=\"panel-footer\"><a href=\"#\" class=\"add-annex\" data-annex=\"" + k2 + "\">Add New Appendix</a></div>"
						));
						// Create the navigation action
						$sub_navigation.find(".panel-title a").data({"a": section, "b": subsection}).click(function(event) {
							event.preventDefault();
							$e = $(this);
							navigate($e.data("a"), $e.data("b"));
						});
						// Create a new DIV to put the content in
						var $sub_container = $("<div>").attr("id", k + "-" + k2).appendTo($part_container);
						// Load in the HTML
						$sub_container.load("/parts/" + k + "/" + k2 + ".html", function(response, status, xhr) {
							onSectionLoad(status, $(this));
						}).hide();
						subsection++;
						collapseMod = "";
					}
				}
			}
			$part_container.hide();
			section++;
			subsection = 0;
		}
	}
	navigate(0,0);
}

// Modify the preview pane
var preview = function() {
	var $container = $("#preview").css("max-height", $(window).height() - ($("#page_header").height() + 20));
}

// Show a part of the application
var showPage = function(a,b) {
	if(typeof sections[a] !== "undefined") {
		// Look for the jQuery object OR string ID of the section
		if(typeof sections[a][0] === "string") {
			sections[a][0] = $("#" + sections[a][0]);
		}
		// Show the section
		$main_nav_elements.eq(a).addClass("active");
		sections[a][0].show();
		if(typeof sections[a][1] !== "undefined") {
			// Look for the jQuery object OR string ID of the subsection
			if(typeof sections[a][1][b] === "string") {
				sections[a][1][b] = $("#" + sections[a][1][b]);
			}
			if(sections[a][0].find(".dropdown").length > 0) {
				sections[a][0].find(".dropdown-menu>li").eq(b).addClass("active");
			} else {
				sections[a][0].find(".nav>li").eq(b).addClass("active");
			}
			sections[a][1][b].show();
		}
	}
}

// Hide a part of the application
var hidePage = function(a, b) {
	if(typeof sections[a] !== "undefined") {
		// Look for the jQuery object OR string ID of the section
		if(typeof sections[a][0] === "string") {
			sections[a][0] = $("#" + sections[a][0]);
		}
		if(typeof sections[a][1] !== "undefined") {
			// Look for the jQuery object OR string ID of the subsection
			if(typeof sections[a][1][b] === "string") {
				sections[a][1][b] = $("#" + sections[a][1][b]);
			}
			// Hide the subsection
			if(sections[a][0].find(".dropdown").length > 0) {
				sections[a][0].find(".dropdown-menu>li.active").removeClass("active");
			} else {
				sections[a][0].find(".nav>li.active").removeClass("active");
			}
			sections[a][1][b].hide();
		}
		// Hide the section
		$main_nav_elements.eq(a).removeClass("active");
		sections[a][0].hide();
	}
}

// Switch the active page of the application
var navigate = function(a, b) {
	hidePage(active_section[0], active_section[1]);
	active_section[0] = a;
	active_section[1] = b;
	showPage(active_section[0], active_section[1]);
	if(a != fragments._sections - 1) {
		$preview.show();
		$annexes.hide();
		$content.attr("class", "col-md-8");
	} else {
		$preview.hide();
		$annexes.show();
		$content.attr("class", "col-md-9");
	}
}