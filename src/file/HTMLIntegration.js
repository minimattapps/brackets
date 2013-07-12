/*
 * Copyright (c) 2012 Adobe Systems Incorporated. All rights reserved.
 *  
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"), 
 * to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the 
 * Software is furnished to do so, subject to the following conditions:
 *  
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *  
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 * 
 */


/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, brackets*/
define(function (require, exports, module) {
    "use strict";
    
    var DocumentManager = null;
    var LiveDevelopment = null;
    

    
    var client;
    
    function mapError(error) {
      
            return brackets.fs.NO_ERROR;
        
        
        
    }
	
	var fs = null;
    
    function readdir(path, callback) {
	console.log("READ DIR: " + path);
       // client.readdir(path, function (error, entries) {
       //     callback(mapError(error), entries);
       // });
	   
	   if (path == "/"){
	   var dirReader = fs.root.createReader();
 
  

     dirReader.readEntries (function(results) {
	  var entries = [];
      for(var i = 0; i < results.length; i++) {
	  entries[i] = results[i].name;
	  }
	  callback(brackets.fs.NO_ERROR,entries);
    }, errorHandler);
  

  
    } else {
	 fs.root.getDirectory(path, {}, function(dirEntry){
  var dirReader = dirEntry.createReader();
  dirReader.readEntries(function(entries) {
  var results = [];
    for(var i = 0; i < entries.length; i++) {
     results[i] = entries[i].name;
    }
	 callback(brackets.fs.NO_ERROR,results);
	
 
  }, errorHandler);
}, errorHandler);
	}
	}
    
    function makedir(path, mode, callback) {
      //  client.mkdir(path, function (error) {
      //      callback(mapError(error));
      //  });
	   fs.root.getDirectory(path, {create: true}, function(){
	   callback(brackets.fs.NO_ERROR);
	   }, errorHandler);
    }
	
	
	
	
    
    function stat(path, callback) {
	console.log("STAT:" + path);
       // client.stat(path, function (error, data) {
       //     callback(mapError(error), {
       //         isFile: function () {
       //             return data.isFile;
        //        },
        //        isDirectory: function () {
        //            return data.isFolder;
        //        },
        //        mtime: data && data.modifiedAt
        //    });
       // });
	   
	   if (path == "/"){
	    callback(brackets.fs.NO_ERROR, {
                isFile: function () {
                  return false;
               },
               isDirectory: function () {
                    return true;
                },
                mtime: 0
            });
	   } else {

	  
	   if (path.indexOf(".") != -1){
     fs.root.getFile(path, {create : false}, function() {
            callback(brackets.fs.NO_ERROR, {
                isFile: function () {
                  return true;
               },
               isDirectory: function () {
                   return false;
                },
                mtime: 0
            });

        }, function() {
            callback(brackets.fs.ERR_NOT_FOUND,{});
        });
 
	   } else {
	   
	   
	       fs.root.getDirectory(path, {create : false}, function() {
            callback(brackets.fs.NO_ERROR, {
                isFile: function () {
                  return false;
               },
               isDirectory: function () {
                   return true;
                },
                mtime: 0
            });

        }, function() {
            callback(brackets.fs.ERR_NOT_FOUND,{});
        });
	   }
	  
	   
	   
	
	   
	   
	   }
    }
    
    function readFile(path, encoding, callback) {
       // client.readFile(path, function (error, data) {
       //     callback(mapError(error), data);
       // });
	   fs.root.getFile(path, {}, function(fileEntry) {

    // Get a File object representing the file,
    // then use FileReader to read its contents.
    fileEntry.file(function(file) {
       var reader = new FileReader();

       reader.onloadend = function(e) {
        var result = e.target.result;
		callback(brackets.fs.NO_ERROR,result);
       };

       reader.readAsText(file);
    }, errorHandler);

  }, function (error){
  callback(error.code,"");
  });
    }
    
    function writeFile(path, data, encoding, callback) {
     fs.root.getFile(path, {create: true}, function(fileEntry) {
     fileEntry.remove(function(){
           fs.root.getFile(path, {create: true}, function(fileEntry) {

    // Create a FileWriter object for our FileEntry (log.txt).
    fileEntry.createWriter(function(fileWriter) {

      fileWriter.onwriteend = function(e) {
        console.log('Write completed.');
	LiveDevelopment.RefreshPage(path);
		callback(brackets.fs.NO_ERROR);
      };

      fileWriter.onerror = function(e) {
        console.log('Write failed: ' + e.toString());
      };

      // Create a new Blob and write it to log.txt.
      var blob = new Blob([data], {type: 'text/plain'});

      fileWriter.write(blob);

    }, errorHandler);

  }, errorHandler);
     },function(){});
     }, function(error){});
    
  
    }
    
function rename(oldPath, newPath, callback) {
    console.log("RENAME: " + oldPath);

    var newDirName = newPath.substr(0, newPath.lastIndexOf("/") + 1),
        newFileName = newPath.substr(newPath.lastIndexOf("/") + 1);

    fs.root.getFile(oldPath, {create: false}, function (fileEntry) {
        if (newDirName === "/") {
            fileEntry.moveTo(fs.root, newFileName, function () {
                callback(brackets.fs.NO_ERROR);
            }, errorHandler);
        } else {

            fs.root.getDirectory(newDirName, {create: true}, function (dirEntry) {
                fileEntry.moveTo(dirEntry, newFileName, function () {
                    callback(brackets.fs.NO_ERROR);
                }, errorHandler);
            }, errorHandler);

        }
    }, errorHandler);

}
	
	function unlink(path, callback){
	console.log("DELETE: " + path);
	 if (path.indexOf(".") != -1){
	fs.root.getFile(path, {create: false}, function(fileEntry) {

    fileEntry.remove(function() {
      callback(brackets.fs.NO_ERROR);
    }, errorHandler);

  }, errorHandler);
	
	} else {
	
	 fs.root.getDirectory(path, {}, function(dirEntry) {

    dirEntry.removeRecursively(function() {
      callback(brackets.fs.NO_ERROR);
    }, errorHandler);

  }, errorHandler);
	
	}
	}
    
    function showOpenDialog(allowMultipleSelection, chooseDirectory, title, initialPath, fileTypes, callback) {
        alert("File/directory chooser not implemented yet");
        if (chooseDirectory) {
            callback(0, "/");
        } else {
            callback(1);
        }
    }
	
	function onInitFs(filesystem) {
  console.log('Opened file system: ' + filesystem.name);
        fs = filesystem;
		
        brackets.fs = {};
        brackets.fs.readdir = readdir;
        brackets.fs.makedir = makedir;
        brackets.fs.stat = stat;
        brackets.fs.readFile = readFile;
        brackets.fs.writeFile = writeFile;
        brackets.fs.rename = rename;
		brackets.fs.moveToTrash = unlink;
        brackets.fs.showOpenDialog = showOpenDialog;
          DocumentManager     = brackets.getModule("document/DocumentManager");
      LiveDevelopment     = brackets.getModule("LiveDevelopment/main");
        // Error codes
        brackets.fs.NO_ERROR                    = 0;
        brackets.fs.ERR_UNKNOWN                 = 1;
        brackets.fs.ERR_INVALID_PARAMS          = 2;
        brackets.fs.ERR_NOT_FOUND               = 3;
        brackets.fs.ERR_CANT_READ               = 4;
        brackets.fs.ERR_UNSUPPORTED_ENCODING    = 5;
        brackets.fs.ERR_CANT_WRITE              = 6;
        brackets.fs.ERR_OUT_OF_SPACE            = 7;
        brackets.fs.ERR_NOT_FILE                = 8;
        brackets.fs.ERR_NOT_DIRECTORY           = 9;
        brackets.fs.ERR_FILE_EXISTS             = 10;
}

function errorHandler(e) {
  var msg = '';

  switch (e.code) {
    case FileError.QUOTA_EXCEEDED_ERR:
      msg = 'QUOTA_EXCEEDED_ERR';
      break;
    case FileError.NOT_FOUND_ERR:
      msg = 'NOT_FOUND_ERR';
      break;
    case FileError.SECURITY_ERR:
      msg = 'SECURITY_ERR';
      break;
    case FileError.INVALID_MODIFICATION_ERR:
      msg = 'INVALID_MODIFICATION_ERR';
      break;
    case FileError.INVALID_STATE_ERR:
      msg = 'INVALID_STATE_ERR';
      break;
    default:
      msg = 'Unknown Error';
      break;
  };

  console.log('Error: ' + msg);
}



    
    function init() {
    
       window.webkitRequestFileSystem(window.PERSISTENT, 1024*1024*1024*1024 /*1TB*/, onInitFs, errorHandler);
       
    }
    
    exports.init = init;
});
