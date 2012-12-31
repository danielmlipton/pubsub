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

// A simple, content-based, [publisher subscriber pattern](http://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern)
// implemented in javascript.
// ### Why is it here?
// 1.  To make testing the "drift" scenarios easier.
// 2.  To distract me.
(function() {

    this.PubSub = (function() {

        
// ### Queue Constructor
// A simple, private queuing class for storing content for subscribers.
// The constructor does not take an argument.

// **Example**  

//     var queue = new Queue();
        function Queue ( value ) { 

// The private array content is stored in before it's processed.  The queue
// is first in, first out.
            var _queue  = [],

// This flag allows setTimeout() and setInterval() events to be processed
// sequentially.   
                _processing = false;

// #### Queue.push( value )
// A privileged method (closure) to push content onto its private queue.
// Takes an object as an argument.  No validation is done on the object. 
// The object is the *message* the *publisher* is *broadcasting* to the
// *subscribers*.

// **Example**

//     queue.push( { 'Sample message.' } );
            this.push   = function (value) {  _queue.push( value ); };

// #### Queue.shift()
// A priviledged method (closure) to shift content from the queue.  Takes no
// arguments and returns the object stored at the first position in the
// queue.  

// <a id="queue.shift" />
// **Example** 

//     // This is the pattern used inside of a callback for synchronous
//     // processing of the queue.
//     var message = queue.shift();
//     if (message) {
//         console.log( message );  
//         queue.finish();
//     }
            this.shift  = function () {

// The algorithm here is if there is no callback currently processing the
// queue and there are items in the queue, then mark the queue as being
// processed and return the next item from the queue.  Otherwise, there's 
// nothing to see here.
                if (!_processing && _queue.length > 0) {
                    _processing = true;
                    return _queue.shift();
                } else {
                    return false;
                }
            };

// #### Queue.finish()
// A priviledged method (closure) that sets the processing flag to false.
// I don't know why I was hellbent on making this private, but this is just
// sugar coating for telling the queue the currently executing callback
// is done.  See example for [Queue.shift](#queue.shift).
            this.finish = function () {
                _processing = false;
            };
        }

// ### PubSub Constructor
// Creates a new PubSub object.
// #### Priviledged Methods:
// 1.  [PubSub.getSubscribers()](#pubsub.getSubscribers)
// 2.  [PubSub.setSubscriber()](#pubsub.setSubscriber)
// 3.  [PubSub.deleteSubscriber()](#pubsub.deleteSubscruibe)
// 4.  [PubSub.broadcast()](#pubsub.broadcast)
// #### Public Methods:
// 1.  [PubSub.subscribe()](#pubsub.subscribe)
// 2.  [PubSub.publish()](#pubsub.publish)
// 3.  [PubSub.unsubscribe()](#pubsub.unsubscribe)

// **Example**

//     var pubsub = new PubSub()

        function PubSub() {

            /*\
            |*| This really doesn't need to be in production code, but once 
            |*| bitten, twice shy of 80's hair bands and their pyrotechnics.
            \*/
            if (!(this instanceof arguments.callee)) {
                throw new Error('Constructor called as a function');
            }

// This object holds the subscribers and queues.
            var _content = {},

// The unique id of each subscriber and becaomes the token by which subscribers
// can be identified and deleted.  This is only used when deleting a subscriber.
                _subscriberUid = -1;

// <a id="pubsub.getSubscribers" />
// #### PubSub.getSubscribers()
// A priviledged method (closure) that returns the list of subscribers and
// queues associated with the given key.

// **Example**

//     var topicSubscribers = pubsub.getSubscribers( 'Topic' );
//     
//     // This is currently only used to delete subscribers.
//     var allSubscribers   = pubsub.getSubscribers();

            this.getSubscribers = function ( key ) {
                return key ? _content[ key ] : _content;
            };

// <a id="pubsub.setSubscriber" />
// #### PubSub.setSubscriber()
// A priviledged method (closure) that creates or sets the value of a
// subscriber.

// **Example**

//     pubsub.setSubscriber( 'Topic', {
//         callback: function () { console.log( arguments ) }
//     });
            this.setSubscriber = function ( key, value ) {
                if (!_content[ key ]) {
                    _content[ key ] = [];
                }
                value.token = (++_subscriberUid).toString();
                _content[ key ].push( value );
                return value.token;
            };

// <a id="pubsub.deleteSubscriber" /> 
// #### PubSub.deleteSubscriber()
// A priviledged method (closure) that deletes a subscriber.

// **Example**

//     var token = pubsub.subscribe( 'Topic', {
//         callback: function () { console.log( arguments ) }
//     });
//     pubsub.deleteSubscriber( token );
            this.deleteSubscriber = function ( i, j ) {
                if (typeof _content[ i ] === 'object' &&
                    _content[ i ].splice( j, 1 ).length == 1) {
                    return true;
                } else {
                    return false;
                }
            };

// <a id="pubsub.broadcast" /> 
// #### PubSub.broadcast()
// A priviledged method (closure) that puts a method on the appropriate
// subscriber queues and calling the subscriber's callback methods.

// **Example**

//     pubsub.broadcast( 'Topic', {
//         callback: function () { console.log( arguments ) }
//     });
            this.broadcast = function ( key, value ) {
                var subscribers = this.getSubscribers( key );
                if (!subscribers) {
                    return false;
                }
                for (var i in subscribers) {
                    var subscriber = subscribers[ i ];
                    if (!subscriber[ 'queue' ]) {
                        subscriber[ 'queue' ] = new Queue();
                    }
                    subscriber[ 'queue' ].push( value );
                    subscriber.callback.bind( subscriber );
                    try {
                        subscriber.callback();
                    } catch (e) {
                        /* Fail silently?  That seems like a bad idea. */
                    }
                }
                return true;
            };
        }

// <a id="pubsub.subscribe" /> 
// #### PubSub.subscribe()
// A public method that creates a queue for publishers to broadcast to and sets
// a callback method to be invoked upon publishing.

// **Example**

//     var token = pubsub.subscribe({
//         topic:    'Topic',
//         callback: function () { console.log( arguments ) }
//     });

        PubSub.prototype.subscribe = function ( options ) {
            if (typeof options !== 'object') {
                throw new Error('options is not an object');
            }
            if (!options.topic) {
                throw new Error('options.topic is required');
            }
            if (!options.callback) {
                options.callback = function () {};
            }
            if (typeof options.callback !== 'function') {
                throw new Error( 'options.callback is not a function' );
            }
            return this.setSubscriber( options.topic, {
                'callback': options.callback
            });

        };

// <a id="pubsub.publish" />
// #### PubSub.publish()
// A public method that broadcasts a message to all available subscribers.

// **Example**

//     pubsub.publish({
//         do:    'A needle pulling thread'
//     });
 
        PubSub.prototype.publish = function( key, value ) {
            if (!key) {
                throw new Error('key is required');
            }

            return this.broadcast( key, value );

        };

// <a id="pubsub.unsubscribe" />
// #### PubSub.unsubscribe()
// A public method that unsubscribes a subscriber

// **Example**

//     pubsub.unsubscribe( token );

        /*\
        |*| This.  Is.  (not)  Sparta.
        \*/
        PubSub.prototype.unsubscribe = function( token ) {
            var content = this.getSubscribers();
            for (var i in content) {
                for (var j in content[ i ]) {
                    if (content[ i ][ j ][ 'token' ] === token) {
                        this.deleteSubscriber( i, j );
                        return true;
                    }
                }
            }
            return false;
        };

        return PubSub;

    })();

}).call(this);
