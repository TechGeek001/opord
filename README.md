# US Army Operations Order / Graphics Shell

Purpose
--------------
The purpose of this project is to give junior officers an easy to use application for creating OPORDs to standard. Additionally, it provides an easy-to-use interface for creating operational graphics.

Basic Graphics Tutorial
--------------
As of 0.1, I am exploring the graphics piece of this project, as it is the most interesting and provides the most benefit to junior officers. The graphics are created using SVG and JavaScript, in part using the jQuery library. First, click the "Create New Order" button from the home page. Access the graphics interface by navigating to "Annexes" on the main navigation bar, then using the left menu, click "Add New Appendix" under any Annex title. Note that the Appendix Builder may already be active due to testing. Under the Graphics heading, click the Ops Graphics / Terrain link.
A test image is pre-loaded into the canvas.

**Grid Lines - Adjacent Grids**
On the panel's top navigation, click the "Grid" button. Enter a four or six digit grid (do not include the grid zone designation or 100,000-meter square identification) in the first input field, then click the "Create Grid" button on the bottom of the panel. The panel will close, and you will see a red crosshair centered on your cursor's position. Hover over the spot on the graphic that you would like to place the point, then click. The crosshair will turn blue, indicating that the pivot point has been placed. Continue moving your mouse until any of the red lines touch the adjacent grid line you wish to place, then click again. The entire grid will be generated based on your selections. From this point on, the application will report the grid location of your cursor whenever you mouse over the canvas.

**Grid Lines - Known Points**
On the panel's top navigation, click the "Grid" button. Enter an eight digit grid (do not include the grid zone designation or 100,000-meter square identification) in both the input fields, then click the "Create Grid" button on the bottom of the panel. The panel will close, and you will see a red crosshair centered on your cursor's position. Hover over the spot on the graphic that you would like to place the point, then click. The crosshair will turn blue, indicating that the pivot point has been placed. Continue moving your cursor until it is over the second point. Note that the application will constrain the movement of the crosshair to valid trajectories in all four directions. Click to place the second point. The entire grid will be generated based on your selections. From this point on, the application will report the grid location of your cursor whenever you mouse over the canvas.

**Grid Lines - Known Point and Distance**
On the panel's top navigation, click the "Grid" button. Enter an eight digit grid (do not include the grid zone designation or 100,000-meter square identification) in the first input field, and a distance in the second and third fields, then click the "Create Grid" button on the bottom of the panel. The panel will close, and you will see a red crosshair centered on your cursor's position. Hover over the spot on the graphic that you would like to place the point, then click. The crosshair will turn blue, indicating that the pivot point has been placed. Move your cursor to the point on the ground that you will use to start the distance measurement and click. You will notice that a line projects from the start point to your cursor. Click on the end point that you are using to measure distance. The entire grid will be generated based on your selections. From this point on, the application will report the grid location of your cursor whenever you mouse over the canvas.

**Units and Equipment**
Unit and equipment symbols are based on FM 1-02 and ADRP 1-02. On the panel's top navigation, click the "Units / Equipment" button. On the top row, from left to right, select "Unit", "Friendly", "Infantry", and "Squad". Depending on the default settings, you may see the preview icon update accordingly. Change the remaining options as you see fit. Once you are satisfied with your icon, click the "Add Symbol" button at the bottom of the panel. The panel will close, and your icon will appear in the upper left corner of the canvas. To move the icon to the desired location, click and drag on the icon, then release your mouse once it is in the correct position. Repeat the above steps, but change the Identification from "Friendly" to "Hostile". Double clicking the symbol on the canvas will open a menu, which you can use to edit some aspects of the symbol and access additional options.

Changelog
--------------
0.1	Initial Commit