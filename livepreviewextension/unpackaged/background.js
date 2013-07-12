console.log("Live Preview Extension Loaded");


var windowid = null;
var tabid = null;
var _port = null;
var tcpport = 8082;
chrome.runtime.onConnectExternal.addListener(function(port) {
_port = port;
  port.onMessage.addListener(function(msg) {
   if (msg.type == "ACTIVE"){
   if (msg.active == true){

   console.log("Live Preview Activated");
   tcpport = msg.port;
    if (windowid != null){
    chrome.windows.update(windowid, {focused: true}, function (window){
    chrome.tabs.update(tabid,{url: "http://127.0.0.1:" + tcpport.toString() + msg.file,active: true},function (tab){
    
     port.postMessage({type: "STATUS",connected: true});
    console.log("Window ID: " + window.id);
    
    });
    
   });
    
    
    
    } else {
    chrome.tabs.create({windowId: window.id,url: "http://127.0.0.1:" + tcpport.toString() + msg.file,active: true}, function (tab){
    tabid = tab.id;
    chrome.windows.create({tabId: tab.id}, function (window){
   windowid = window.id;
   port.postMessage({type: "STATUS",connected: true});
    console.log("Window ID: " + window.id);
   });
  
   });
  }
  
   } else {

   if (windowid != null){
   chrome.windows.remove(windowid, function(){windowid == null});
   }
   console.log("Live Preview Deactivated");
   
   }
   }
   
   if (msg.type == "REFRESH"){
   if (tabid != null){
   chrome.tabs.reload(tabid, {}, function (){})
   }
   }
   
     if (msg.type == "UPDATE"){
   if (tabid != null){
    chrome.tabs.update(tabid,{url: "http://127.0.0.1:" + tcpport.toString() + msg.file},function (tab){
   });
   }
   }
  });
  
  chrome.windows.onRemoved.addListener(function(windowId){
   
   if (windowId == windowid){
   console.log("Window Closed");
   windowid = null;
   _port.postMessage({type: "TABCLOSED"});
  
   console.log("Live Preview Deactivated");
   
   }
   
   });
   
   chrome.tabs.onRemoved.addListener(function(tabId, removeInfo){
   
   if (tabId == tabid){
   console.log("Tab Closed");
   tabid = null;
   _port.postMessage({type: "TABCLOSED"});
    
   console.log("Live Preview Deactivated");
   
   }
   
   });
   
});

   