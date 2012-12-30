{spawn, exec} = require 'child_process'
fs	      	  = require 'fs'

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

option '-u', '--up',   'bring the JsTestDriver server up   (cake -u jstd)'
option '-d', '--down', 'bring the JsTestDriver server down (cake -d jstd)'
option '-j', '--jstd', 'run the JsTestDriver tests         (cake -j test)'
option '-a', '--all',  'run all of the JsTestDriver tests  (cake -a test)'

log = (childProcess) ->

  logData = (data) ->
    data = data.toString().trim()
    console.log( data ) if data isnt ""

  childProcess.stdout.on 'data', logData
  childProcess.stderr.on 'data', logData
  return childProcess

# Lint Tasks
task 'lint', 'run jsl on src/PubSub.js', ->
  exec( "find ./src -name node_modules -prune -o -name '*.js'", (error, stdout, stderr) ->
    throw error if error
    for file in stdout.toString().trim().split( '\n' )
      log spawn 'jsl', [ '-conf', 'jsl.conf', '-process', file ]
  )

# Doc Tasks
task 'doc', 'build the documentation', ->
  exec([
    'node_modules/docco/bin/docco -o docs src/*.js'
  ].join(' && '), (err) ->
    throw err if err
  )

# JsTestDriver Tasks
task 'jstd', 'tasks related to JsTestDriver', (options) ->
  if options.up

    # Ugh.  If there's an error on start up, it's awfully tricky to capture.
    jstd = spawn 'java', [ '-jar', JSTESTDRIVER_JAR, '--config', JSTESTDRIVER_CONF, '--port', JSTESTDRIVER_PORT ], {
        detached: true,
        stdio:  [ 'ignore', 'ignore', 'ignore' ]
    } 
    fs.writeFile 'jstd.pid', jstd.pid, (err)  ->
      throw err if err
    jstd.unref()
    console.log 'JsTestDriver server started in the background.'
    console.log 'Do not forget to capture at least one browser.'

  else if options.down
    fs.readFile('jstd.pid', (err, data)  ->
      throw err if err
      kill = spawn 'kill', [ '-9', data ]
      kill.on 'exit', (code) ->
        if code isnt 0
          console.log "kill exited with code: #{ code }"
          console.log "removing stale pid file"
        fs.unlink 'jstd.pid', (err) ->
          throw err if err
    )


# Test Tasks
task 'test', 'run tests', (options)->
  if options.jstd or options.all
    log spawn 'java', [ '-jar', JSTESTDRIVER_JAR, '--config', JSTESTDRIVER_CONF, '--tests', 'all', '--reset' ]
  if !options.jstd or options.all
    log spawn 'qunit', [ '-c', 'src/PubSub.js', '-t', 'test/test.js' ]
