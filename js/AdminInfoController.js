function AdminInfoController() {
	var CONTROLLERS;
	var PAGE;
}

AdminInfoController.prototype.init = function(controllers) {
	CONTROLLERS = controllers;
	PAGE = $("#admin_info");
	// Create the controls for the Admin section
	var $buttons = PAGE.find(".references").find("button").not(".reference_controls button");
	var $sections = PAGE.find(".reference_controls").children("div").hide();
	$buttons.click(function(event) {
		this.blur();
		var $e = $(this);
		var i = $buttons.index($e);
		if($e.hasClass("active")) {
			$e.removeClass("active");
			$sections.eq(i).hide();
			$e.find(".glyphicon").addClass("glyphicon-plus").removeClass("glyphicon-minus");
		} else {
			$e.addClass("active");
			$buttons.not($e).removeClass("active").find(".glyphicon").addClass("glyphicon-plus").removeClass("glyphicon-minus");;
			$sections.eq(i).show();
			$sections.not($sections.eq(i)).hide();
			$e.find(".glyphicon").removeClass("glyphicon-plus").addClass("glyphicon-minus");
		}
	});
}