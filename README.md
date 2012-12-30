drift
=====

*Noun*

```
A continuous slow movement from one place to another.
```

*Synonym*

```
pedantry
```


This is the story of what caused me to not commit any code for six days.

At the time of the last [commit](@64236abec7b3d8cab7b89e82fb880707ffa6d163),
tests were failing intermitently and I had only the vaguest of clues why. I 
knew that [setTimeout()](https://developer.mozilla.org/en-US/docs/DOM/window.setTimeout) and [setInterval](https://developer.mozilla.org/en-US/docs/DOM/window.setInterval)]()
were imprecise.  I also knew that allbrowser based events executed in a single
thread, thanks to [John Resig](http://ejohn.org/blog/how-javascript-timers-work/).
To allow for this imprecision, tests were written to accept the time in
milliseconds to be off by up to 100 milliseconds.  Even then, tests were failing from time to time.

I began to wonder: was clock.js drifting away from the real time over a long
period of time?

To answer that, I cobbled together a cusory test script that proved that a 
static delay (see staticDelayTest.js) did, in theory, slow down about one 
second out of every ten.  That was unacceptable so I did some
[research](http://www.sitepoint.com/creating-accurate-timers-in-javascript/), wrote a
test case (see dynamicDelay.js) and came to the conclusion that there was room
for improvement.

Then I formulated a test case for the original implementation of clock.js
(see originalImplementation.js) which lead to further confusion.  It's not
nearly as bad as the static delay.  In fact, it wads pretty good, staying
within about one second of the actual time due to the fact that I was adding
a fixed number of milliseconds to epoch, based on the delay of the timer.  For
better or worse, this stayed pretty close to true time, with errors mostly
negating each other instead of being cummulative.  Of course, these tests were
being run in a clean room - there was nothing else vying for the single thread,
so these numbers were "best case".

Then a bit of obsession set in.  The clock could be better, so it would be. A
little coffeescript hacking later and *voila* a self-healing clock was born.
Despite what I preach, I did not write the tests first.  In some ways, this is
good, because writing the tests proved to be the actual challenge here.  When
I finished the first draft of the test, I tried to run all four tests at once.
The result was a bunch of timers competing for a single thread.  This would not
do, so I began toying with ways to make setTimeout and setInterval run
synchronously.  The secondary goal was to allow the four existing tests to be
run easily without significant modification.

The something shiny happened: I wrote a very simple, content-based pub sub
implementation in JavaScript (see PubSub.js).  Despite being a major
distraction, it turned out to be a valuable lesson and an even more valuable
tool for testing.  With each test a callback for a subscription, I was able
to run as many different tests as I saw fit.  The one drawback is that these
tests all competed for the single thread.  Interestingly, this caused the drift
to actually decrease in most cases.
