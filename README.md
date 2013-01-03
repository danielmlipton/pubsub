A simple, content-based, [publisher subscriber pattern](http://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern)
implemented in javascript.

### Queue Constructor
A simple, private queuing class for storing content for subscribers.
The constructor does not take an argument.

**Example**  

    var queue = new Queue();

The private array content is stored in before it's processed.  The queue
is first in, first out.

This flag allows setTimeout() and setInterval() events to be processed
sequentially.   

#### Queue.push( value )
A privileged method (closure) to push content onto its private queue.
Takes an object as an argument.  No validation is done on the object. 
The object is the *message* the *publisher* is *broadcasting* to the
*subscribers*.

**Example**

    queue.push( { 'Sample message.' } );

#### Queue.shift()
A priviledged method (closure) to shift content from the queue.  Takes no
arguments and returns the object stored at the first position in the
queue.  

<a id="queue.shift" />
**Example** 

    // This is the pattern used inside of a callback for synchronous
    // processing of the queue.
    var message = queue.shift();
    if (message) {
        console.log( message );  
        queue.finish();
    }

The algorithm here is if there is no callback currently processing the
queue and there are items in the queue, then mark the queue as being
processed and return the next item from the queue.  Otherwise, there's 
nothing to see here.

#### Queue.finish()
A priviledged method (closure) that sets the processing flag to false.
I don't know why I was hellbent on making this private, but this is just
sugar coating for telling the queue the currently executing callback
is done.  See example for [Queue.shift](#queue.shift).

### PubSub Constructor
Creates a new PubSub object.
#### Priviledged Methods:
1.  [PubSub.getSubscribers()](#pubsub.getSubscribers)
2.  [PubSub.setSubscriber()](#pubsub.setSubscriber)
3.  [PubSub.deleteSubscriber()](#pubsub.deleteSubscruibe)
4.  [PubSub.broadcast()](#pubsub.broadcast)

#### Public Methods:
1.  [PubSub.subscribe()](#pubsub.subscribe)
2.  [PubSub.publish()](#pubsub.publish)
3.  [PubSub.unsubscribe()](#pubsub.unsubscribe)

**Example**

    var pubsub = new PubSub()

This object holds the subscribers and queues.

The unique id of each subscriber and becaomes the token by which subscribers
can be identified and deleted.  This is only used when deleting a subscriber.

<a id="pubsub.getSubscribers" />
#### PubSub.getSubscribers()
A priviledged method (closure) that returns the list of subscribers and
queues associated with the given key.

**Example**

    var topicSubscribers = pubsub.getSubscribers( 'Topic' );
    
    // This is currently only used to delete subscribers.
    var allSubscribers   = pubsub.getSubscribers();

<a id="pubsub.setSubscriber" />
#### PubSub.setSubscriber()
A priviledged method (closure) that creates or sets the value of a
subscriber.

**Example**

    pubsub.setSubscriber( 'Topic', {
        callback: function () { console.log( arguments ) }
    });

<a id="pubsub.deleteSubscriber" /> 
#### PubSub.deleteSubscriber()
A priviledged method (closure) that deletes a subscriber.

**Example**

    var token = pubsub.subscribe( 'Topic', {
        callback: function () { console.log( arguments ) }
    });
    pubsub.deleteSubscriber( token );

<a id="pubsub.broadcast" /> 
#### PubSub.broadcast()
A priviledged method (closure) that puts a method on the appropriate
subscriber queues and calling the subscriber's callback methods.

**Example**

    pubsub.broadcast( 'Topic', {
        callback: function () { console.log( arguments ) }
    });

<a id="pubsub.subscribe" /> 
#### PubSub.subscribe()
A public method that creates a queue for publishers to broadcast to and sets
a callback method to be invoked upon publishing.

**Example**

    var token = pubsub.subscribe({
        topic:    'Topic',
        callback: function () { console.log( arguments ) }
    });

<a id="pubsub.publish" />
#### PubSub.publish()
A public method that broadcasts a message to all available subscribers.

**Example**

    pubsub.publish({
        do:    'A needle pulling thread'
    });

<a id="pubsub.unsubscribe" />
#### PubSub.unsubscribe()
A public method that unsubscribes a subscriber

**Example**

    pubsub.unsubscribe( token );
