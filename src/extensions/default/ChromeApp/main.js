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
	   var savedir = "";
   if (ProjectManager.getSelectedItem() == null){
   savedir = "";
   } else {
   savedir = ProjectManager.getSelectedItem().fullPath;
  if (savedir.indexOf(".") != -1){
  savedir = savedir.substring(0, savedir.lastIndexOf('/')) + "/"; 
 }
 }
    var files = evt.target.files; // FileList object
    
    // files is a FileList of File objects. List some properties.
    var output = [];
    for (var i = 0, f; f = files[i]; i++) {
    
    var dir = f.webkitRelativePath.substring(0, f.webkitRelativePath.lastIndexOf('/'));
    console.log(dir);
    
 
    brackets.fs.makedir(savedir + dir,null,function(error){
    console.log("Created Directory");
    });
    
  
    
    var reader = new FileReader();

      // Closure to capture the file information.
      reader.onload = (function(theFile) {
        return function(e) {
       
                brackets.fs.writeFile(savedir + theFile.webkitRelativePath,e.target.result,null,function(error){
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
   var savedir = "";
   if (ProjectManager.getSelectedItem() == null){
   savedir = "";
   } else {
   savedir = ProjectManager.getSelectedItem().fullPath;
  if (savedir.indexOf(".") != -1){
  savedir = savedir.substring(0, savedir.lastIndexOf('/')) + "/"; 
 }
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
    document.getElementById("inputfiles").reset();
   
   }
   
     function importFile(){
     
  document.getElementById('fileinput').addEventListener('change', handleFileSelect, false);   
   document.getElementById("fileinput").click();
   document.getElementById("inputfiles").reset();
   }
   
   //Create HTTP Server
   var tcpport = Math.floor(Math.random() * (25000 - 20000 + 1)) +  20000;
   
   brackets.fs.tcpport = tcpport;
   console.log(tcpport);
    var socket = chrome.socket;
    var serverid;
  var socketInfo;
   socket.create("tcp", {}, function(_socketInfo) {
   console.log("HTTP Server Created");
  socketInfo = _socketInfo;  // Cache globally [eek]
  serverid = _socketInfo.socketId;
  socket.listen(socketInfo.socketId, "127.0.0.1", tcpport, 20, function(result) {
    //Accept the first response
    socket.accept(socketInfo.socketId, onAccept);
  });
});

//Listen on Server

var onAccept = function(acceptInfo) {
  // This is a request that the system is processing. 
  // Read the data.
  socket.read(acceptInfo.socketId, function(readInfo) {
    // Parse the request.
    var request = arrayBufferToString(readInfo.data).split("\n")[0];
    console.log("Request: " + request);
    var requesttype = request.split(" ")[0];
    console.log("Request Type: " + requesttype);
    var requestfile = request.split(" ")[1];
    console.log("Requested File: " + requestfile);
    
    if (requesttype == "GET"){

       requestfile = decodeURI(requestfile);

       brackets.fs.readFile(requestfile,null,function (error,result){
        
        console.log(error);

        writeResponse(acceptInfo.socketId,false,"200 OK","text/html",result,true);    
 
   

    });
   
   

    
  
    
    }
   
  }); 
};


    var writeResponse = function(socketId, keepAlive, responsecode, contenttype, data, headers){
    var newdata = stringToUint8Array(data);
    if (headers == true){
    var header = "HTTP/1.0 " + responsecode + "\r\nContent-length: " + newdata.byteLength + "\r\nContent-type:" + contenttype + "\r\n\r\n" + data;
    } else {
    var header = data;
    }
    header = stringToUint8Array(header);
  
    var outputBuffer = new ArrayBuffer(header.byteLength);
    var view = new Uint8Array(outputBuffer)
    view.set(header, 0);
   

     socket.write(socketId, outputBuffer, function(writeInfo) {
      console.log("WRITE", writeInfo);
      
        socket.destroy(socketId);
	socket.accept(serverid, onAccept);
	


	
    });
    };
   

  
   var stringToUint8Array = function(string) {

    var buffer = new ArrayBuffer(string.length);
    var view = new Uint8Array(buffer);
    for(var i = 0; i < string.length; i++) {
      view[i] = string.charCodeAt(i);
    }
    return view;
  };

  var arrayBufferToString = function(buffer) {
 
    var str = '';
    var uArrayVal = new Uint8Array(buffer);
    for(var s = 0; s < uArrayVal.length; s++) {
      str += String.fromCharCode(uArrayVal[s]);
    }
    return str;
  };
  

  

   
   
   
});