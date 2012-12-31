sinon.config = {
    useFakeTimers: false,
};

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

QUnit.module(
	'PubSub', {
		setup: function () {
			_pubsub = new PubSub();
		},
		teardown: function () {
			delete _pubsub;
		}
	}
);

test( 'constructor', function () {

	expect( 2 );

	ok( _pubsub instanceof PubSub, '_pubsub is an instance of PubSub' );
	throws( PubSub, Error, 'PubSub cannot be called as a function')

});


QUnit.module(
	'publish', {
		setup: function () {
			_pubsub = new PubSub();
		},
		teardown: function () {
			delete _pubsub;
		}
	}
);

// Yes, this is blatantly from:
//    http://sinonjs.org/docs/#stubs
// The reason it's here?  I grabbed the code to see if stubbing was working
// and it wasn't.  A few pulled hairs later and I figured out I wasn't 
// executing callbacks in a try/catch block.
test( 'should call all subscribers, even if there are exceptions', function () {

	expect( 4 );
    var topic     = 'Test Topic',
    	stub      = sinon.stub().throws(),
    	firstSpy  = sinon.spy(),
    	secondSpy = sinon.spy();

    _pubsub.subscribe({
    	topic: topic,
    	callback: stub
    });
    _pubsub.subscribe({
    	topic: topic,
    	callback: firstSpy
    });
    _pubsub.subscribe({
    	topic: topic,
    	callback: secondSpy
    });

    _pubsub.publish( topic, {} );

    ok( stub.calledOnce, 'stub called exactly once' );
    ok( stub.calledBefore( firstSpy ), 'stub called before firstSpy' );
    ok( firstSpy.calledOnce , 'firstSpy called exactly once' );
    ok( secondSpy.calledOnce, 'secondSpy called exactly once' );


});

test( 'should return false with no subscriber', function() {

	expect( 1 );

    var topic = 'Test Topic';
	equal( _pubsub.publish( topic ), false, 'publish( topic ) returned false' );

});

test( 'should throw an Error if there is no topic', function() {

	expect( 1 );

    throws( _pubsub.publish, Error, 'publish() threw an Error' );

});


test( 'should return true with one subscriber', function() {

	expect( 2 );

    // Setup
	var topic = 'Test Topic',
		spy   = sinon.spy(),
		token = _pubsub.subscribe({
			topic: topic,
			callback: spy
		});

	equal( _pubsub.publish( topic ), true, 'publish( topic ) returns true' );
    ok( spy.calledOnce, 'spy called exactly once' );

});

test( 'should return true with three subscribers', function() {

	expect( 2 );

    // Setup
	var topic       = 'Test Topic',
		spy    = sinon.spy(),
		secondSpy   = sinon.spy(),
		thirdSpy    = sinon.spy(),
		firstToken  = _pubsub.subscribe({
			topic: topic,
			callback: spy
		}),
		secondToken = _pubsub.subscribe({
			topic: topic,
			callback: spy
		}),
		thirdToken  = _pubsub.subscribe({
			topic: topic,
			callback: spy
		});

	equal( _pubsub.publish( topic ), true, 'publish( topic ) returns true' );
    ok( spy.calledThrice, 'spy called exactly three times' );

});

QUnit.module(
	'subscribe', {
		setup: function () {
			_pubsub = new PubSub();
		},
		teardown: function () {
			delete _pubsub;
		}
	}
);

test( 'called with no arguments should throw an exception', function () {

	expect( 1 );

	throws( function () { _pubsub.subscribe() }, Error, 'subscribe() threw an Error' );

});

test( 'called without a topic should throw an exception', function () {

	expect( 1 );

	throws( function () { _pubsub.subscribe({}) }, Error, 'subscribe({}) threw an Error' );

});

test( 'called without a callback should return a token', function () {

	expect( 1 );

    // Setup
	var topic = 'Test Topic',
		token = _pubsub.subscribe({
			topic: topic
	});
	strictEqual( token, '0', 'subscribe() returned a valid token' );

});

test( 'should throw an exception if callback is not a function', function () {

	expect( 1 );

	var topic = 'Test Topic';
	throws( function () {
		_pubsub.subscribe({
			topic: topic,
			callback: 1
		})
	}, Error, 'subscribe() threw an Error' );

});

test( 'should have three subscribers when subscribed called three times', function () {

	expect( 1 );

    // Setup
	var topic       = 'Test Topic',
		firstToken  = _pubsub.subscribe({
			topic: topic,
		}),
		secondToken = _pubsub.subscribe({
			topic: topic,
		}),
		thirdToken  = _pubsub.subscribe({
			topic: topic,
		}),
		subscribers = _pubsub.getSubscribers( topic );

	equal( subscribers.length, 3, 'subscribers.length is 3' );

});

test( 'should return a string when subscribing', function () {

    var topic = 'Test Topic',
		token = _pubsub.subscribe({
		topic: topic,
		callback: function () { return }
	});
	equal( typeof token, 'string', 'token is string' );

});

asyncTest( 'should handle asynchronous callbacks', function () {

	expect( 2 );
	
	// Setup
	var topic = 'Test Topic',
		spy   = sinon.spy(),
		firstToken = _pubsub.subscribe({
			topic: topic,
			callback: function () {
		    	var message = this.queue.shift(),
		    		that = this;
			    if (message) {
				    setTimeout( function () {
				    	ok( true, 'executed asynchronous callback' );
					    that.queue.finish();
						start();
					    that.callback();
					}, 200 );
				}
			}
		}),
		value = _pubsub.publish( topic, {} );

	ok( value, '_pubsub.publish( topic, {} ) succeeded' );

});

QUnit.module(
	'unsubscribe', {
		setup: function () {
			_pubsub = new PubSub();
		},
		teardown: function () {
			delete _pubsub;
		}
	}
);

test( 'should unsubscribe when there is a subscriber', function () {

	expect( 1 );

	var topic = 'Test Topic',
		spy   = sinon.spy(),
		token = _pubsub.subscribe({
			topic: topic,
			callback: spy
		}),
		value = _pubsub.unsubscribe( token );

    equal( value, true, 'pubsub.unsubscribe( token )' );

});

test( 'should not throw an exception whencalled without a subscriber', function () {

	expect( 1 );

	var topic = 'Test Topic',
		value = _pubsub.unsubscribe();

    equal( value, false, 'pubsub.unsubscribe()' );

});

QUnit.module(
	'deleteSubscriber', {
		setup: function () {
			_pubsub = new PubSub();
		},
		teardown: function () {
			delete _pubsub;
		}
	}
);


test( 'should delete one subscriber', function () {

	expect( 1 );

    // Setup
	var topic = 'Test Topic',
		spy   = sinon.spy(),
		token = _pubsub.subscribe({
			topic: topic,
			callback: spy
		}),
		value = _pubsub.deleteSubscriber( topic, 0 );

    equal( value, true, 'pubsub.deleteSubscriber( topic, 0 )' );

});

test( 'should not die when deleting nonexisting subscribers', function () {

	expect( 2 );
	
	// Setup
	var topic = 'Test Topic',
		firstToken = _pubsub.subscribe({
			topic: topic,
			callback: function () { return }
		}),
		value = _pubsub.deleteSubscriber( topic, 1 );

    equal( value, false, 'pubsub.deleteSubscriber( topic, 1 )' );

    // Setup a second test...
	secondToken = _pubsub.subscribe({
		topic: topic,
		callback: function () { return }
	});

    // This time, with an invalid topic.
	value = _pubsub.deleteSubscriber( topic + 1, 1 );
    equal( value, false, 'pubsub.deleteSubscriber( topic + 1, 1 )' );


});
