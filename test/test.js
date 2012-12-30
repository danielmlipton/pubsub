QUnit.module(
	"PubSub", {
		setup: function () {
			_pubsub = new PubSub();
		},
		teardown: function () {
			delete _pubsub;
		}
	}
);

test( "constructor", function () {
	expect( 1 );

	ok( _pubsub instanceof PubSub, "_pubsub is an instance of PubSub" );

});

test( "publish, no subscriber", function() {

	expect( 2 );

	equal( _pubsub.publish( 'foo' ), false, "_pubsub.publish( 'foo' )" );
    throws( _pubsub.publish, Error, "_pubsub.publish()" );

});

test( "publish, one subscriber", function() {

	expect( 5 );

	var token = _pubsub.subscribe({
		topic: 'foo',
		callback: function () { return }
	});
	equal( typeof token, "string", "token is string" );

	var subscribers = _pubsub.getSubscribers( 'foo' );
	equal( subscribers.length, 1, "subscribers.length is 1" );
	equal( _pubsub.publish( 'foo' ), true, "_pubsub.publish( 'foo' )" );
    throws( _pubsub.publish, Error, "_pubsub.publish()" );
    equal(
    	_pubsub.deleteSubscriber( 'foo', 0 ),
    	true,
    	"pubsub.deleteSubscriber( 'foo', 0 )"
    );

});

// test( "publish, two subscribes", function() {

// 	expect( 4 );

// 	var tokenA = _pubsub.subscribe({
// 		topic: 'foo',
// 		callback: function () { return }
// 	});

// 	var tokenB = _pubsub.subscribe({
// 		topic: 'foo',
// 		callback: function () { return }
// 	});

// 	equal( typeof token, "string", "token is string" );

// 	var subscribers = _pubsub.getSubscribers( 'foo' );
// 	equal( subscribers.length, 1, "subscribers.length is 1" );
// 	equal( _pubsub.publish( 'foo' ), true, "_pubsub.publish( 'foo' )" );
//     throws( _pubsub.publish, Error, "_pubsub.publish()" );

// });

// asyncTest( "clock one second later", function() {

//   expect( 1 );
 
//   setTimeout(function() {
//     ok( _date.getTime() <= _clock.epoch + 1100, "Time in milliseconds is one second-ish later" );
//     start();
//   }, 1010);

// });