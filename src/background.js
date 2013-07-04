
/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global chrome */

(function () {
    "use strict";
    
    chrome.app.runtime.onLaunched.addListener(function () {
        chrome.app.window.create('index.html', {
            'bounds': {
                'width': 400,
                'height': 500
            }
        });
    });
}());
