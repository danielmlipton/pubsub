// WTF, PhantomJS?
//    http://code.google.com/p/phantomjs/issues/detail?id=522
// Polyfill from:
//    https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Function/bind
if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") {
      // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }
 
    var aArgs = Array.prototype.slice.call(arguments, 1), 
        fToBind = this, 
        fNOP = function () {},
        fBound = function () {
          return fToBind.apply(this instanceof fNOP && oThis
                                 ? this
                                 : oThis,
                               aArgs.concat(Array.prototype.slice.call(arguments)));
        };
 
    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();
 
    return fBound;
  };
}

var page = require('webpage').create();
var url = 'http://localhost:9876/capture';
var captureAttempts = 0;
var captured = false;
var locked = false;

var log = function(str) {
    var dt = new Date();
    console.log(dt.toString() + ': ' + str);
};

var pageLoaded = function(status) {
    log('Finished loading ' + url + ' with status: ' + status);

    var runnerFrame = page.evaluate(function() {
        return document.getElementById('runner');
    });

    if (!runnerFrame) {
        locked = false;
        setTimeout(capture, 1000);
    } else {
        captured = true;
    }
};

var capture = function() {
    if (captureAttempts === 5) {
        log('Failed to capture JSTD after ' + captureAttempts + ' attempts.');
        phantom.exit();
    }

    if (captured || locked) {
        return;
    }

    captureAttempts += 1;
    locked = true;

    log('Attempting (' + captureAttempts + ') to load: ' + url);
    page.open(url, pageLoaded);
};

capture();
