/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

/** Simple extension that adds a "File > Hello World" menu item */
define(function (require, exports, module) {
    "use strict";

    var CommandManager = brackets.getModule("command/CommandManager"),
        Menus          = brackets.getModule("command/Menus");
	 var ProjectManager = brackets.getModule("project/ProjectManager");

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

    CommandManager.register("Fullscreen", "chromeapp.fullscreen", handleFullscreen);

    CommandManager.register("Import Folder", "chromeapp.importfolder", importFolder);
        CommandManager.register("Import File", "chromeapp.importfile", importFile);
    // Then create a menu item bound to the command
    // The label of the menu item is the name we gave the command (see above)
    var filemenu = Menus.getMenu(Menus.AppMenuBar.FILE_MENU);
    var menu = Menus.getMenu(Menus.AppMenuBar.VIEW_MENU);

    
    // We could also add a key binding at the same time:
    var ver = parseInt(window.navigator.appVersion.match(/Chrome\/(\d+)\./)[1], 10);
    if (ver != 27){
   menu.addMenuItem("chromeapp.fullscreen", "F11");
   }
      filemenu.addMenuItem("chromeapp.importfolder", "Ctrl-Alt-I");
      filemenu.addMenuItem("chromeapp.importfile");
   
   
    function handleFolderSelect(evt) {
    var files = evt.target.files; // FileList object
    
    // files is a FileList of File objects. List some properties.
    var output = [];
    for (var i = 0, f; f = files[i]; i++) {
    
    var dir = f.webkitRelativePath.substring(0, f.webkitRelativePath.lastIndexOf('/'));
    console.log(dir);
    
 
    brackets.fs.makedir(dir,null,function(error){
    console.log("Created Directory");
    });
    
  
    
    var reader = new FileReader();

      // Closure to capture the file information.
      reader.onload = (function(theFile) {
        return function(e) {
       
                brackets.fs.writeFile(theFile.webkitRelativePath,e.target.result,null,function(error){
    console.log("Created Files");
     ProjectManager.refreshFileTree();
    });
	    
        };
      })(f);

      // Read in the image file as a data URL.
      reader.readAsText(f);
    
   
    }

  }
  
  function handleFileSelect(evt) {
   var savedir = ProjectManager.getSelectedItem().fullPath;
  if (ProjectManager.getSelectedItem().isFile){
  savedir = savedir.substring(0, savedir.lastIndexOf('/')) + "/"; 
 }

  
    var files = evt.target.files; // FileList object
    
    // files is a FileList of File objects. List some properties.
    var output = [];
    for (var i = 0, f; f = files[i]; i++) {
   
  
    
    var reader = new FileReader();

      // Closure to capture the file information.
      reader.onload = (function(theFile) {
        return function(e) {
       
                brackets.fs.writeFile(savedir + theFile.name,e.target.result,null,function(error){
    console.log("Created Files");
     ProjectManager.refreshFileTree();
    });
	    
        };
      })(f);

      // Read in the image file as a data URL.
      reader.readAsText(f);
    
   
    }

  }



  
   function importFolder(){
  document.getElementById('folderinput').addEventListener('change', handleFolderSelect, false);   
   document.getElementById("folderinput").click();
   }
   
     function importFile(){
     
  document.getElementById('fileinput').addEventListener('change', handleFileSelect, false);   
   document.getElementById("fileinput").click();
   }
});