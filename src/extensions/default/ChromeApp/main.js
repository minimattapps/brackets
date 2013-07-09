/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

/** Simple extension that adds a "File > Hello World" menu item */
define(function (require, exports, module) {
    "use strict";

    var CommandManager = brackets.getModule("command/CommandManager"),
        Menus          = brackets.getModule("command/Menus");

var fullscreen = false;
    // Function to run when the menu item is clicked
 function handleFullscreen() {
	    if (fullscreen == false){

		chrome.app.window.current().fullscreen();
		fullscreen = true;
       
		} else {
		chrome.app.window.current().restore();
		fullscreen = false;
		}
    }
    
    
    // First, register a command - a UI-less object associating an id to a handler
    var MY_COMMAND_ID = "chromeapp.fullscreen";   // package-style naming to avoid collisions
    CommandManager.register("Fullscreen", MY_COMMAND_ID, handleFullscreen);

    // Then create a menu item bound to the command
    // The label of the menu item is the name we gave the command (see above)
    var menu = Menus.getMenu(Menus.AppMenuBar.VIEW_MENU);

    
    // We could also add a key binding at the same time:
    var ver = parseInt(window.navigator.appVersion.match(/Chrome\/(\d+)\./)[1], 10);
    if (ver != 27){
   menu.addMenuItem(MY_COMMAND_ID, "F11");
   }
    // (Note: "Ctrl" is automatically mapped to "Cmd" on Mac)
});