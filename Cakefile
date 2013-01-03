{spawn, exec, execFile} = require 'child_process'
fs	      	            = require 'fs'

# JsTestDriver-1.3.5.jar has a pretty nasty bug.  The short of it is that if
#    you load a file like 'test/test.js' and more than one file from your cwd
#    end that way, it loads the first one.  Since adding the qunit submodule,
#    this was causing strange errors until I realized JsTestDriver was loading
#    the wrong 'test/test.js'.  Reverted to the old version of JsTestDriver.
#    More info at http://code.google.com/p/js-test-driver/issues/detail?id=223
#     
# Download at:
#    http://code.google.com/p/js-test-driver/downloads/detail?name=JsTestDriver-1.3.3d.jar&can=1&q=
JSTESTDRIVER_JAR  = 'resources/js-test-driver/JsTestDriver-1.3.3d.jar'
JSTESTDRIVER_CONF = 'resources/js-test-driver/jsTestDriver.conf'
JSTESTDRIVER_PORT = 9876

option '-s', '--silent', 'do not display any output'

log = (childProcess) ->

  logData = (data) ->
    data = data.toString().trim()
    console.log data if data isnt "" and !options?.silent

  childProcess.stdout.on 'data', logData
  childProcess.stderr.on 'data', logData

# Lint Tasks
task 'lint', 'run jsl on src/PubSub.js', ->
  exec( "find ./src -name node_modules -prune -o -name '*.js'", (error, stdout, stderr) ->
    throw error if error
    for file in stdout.toString().trim().split( '\n' )
      foo = spawn 'jsl', [ '-conf', 'jsl.conf', '-process', file ]
  )

# Doc Tasks
task 'doc', 'build the documentation', ->
  exec([
    'docco -o docs src/*.js'
  ].join(' && '), (err) ->
    throw err if err
  )

# JsTestDriver Tasks
task 'jstd', 'tasks related to JsTestDriver', (options) ->

    jstd = spawn 'java', [ '-jar', JSTESTDRIVER_JAR, '--config', JSTESTDRIVER_CONF, '--port', JSTESTDRIVER_PORT ], {
        detached: true,
        stdio:  [ 'ignore', 'ignore', 'ignore' ]
    } 
    jstd.unref()
    console.log ' [*] JsTestDriver server started in the background.' if !options.silent

    phantomjs = require('phantomjs')
    binPath   = phantomjs.path
    childArgs = [ "#{__dirname}/resources/js-test-driver-phantomjs/phantomjs-jstd.js" ]

    execFile binPath, childArgs, (error, stdout, stderr) ->
      throw error if error

    console.log ' [*] PhantomJS browser started (Ctrl-C to exit)' if !options.silent

    process.on 'SIGINT', ->
      console.log '\n [*] PhantomJS server interupted' if !options.silent
      jstd.kill()
      console.log ' [*] JsTestDriver server killed' if !options.silent
      process.exit(0)


# Test Tasks
task 'test', 'run tests', (options)->
  log spawn 'java', [ '-jar', JSTESTDRIVER_JAR, '--config', JSTESTDRIVER_CONF, '--tests', 'all', '--reset' ]
