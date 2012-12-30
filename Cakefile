{spawn, exec} = require 'child_process'
fs	      	  = require 'fs'

JSTESTDRIVER_JAR  = 'JsTestDriver-1.3.5.jar'
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
    jstd = spawn 'java', [ '-jar', JSTESTDRIVER_JAR, '--port', JSTESTDRIVER_PORT ], {
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
    log spawn 'java', [ '-jar', JSTESTDRIVER_JAR, '--tests', 'all', '--reset' ]
  if !options.jstd or options.all
    log spawn 'qunit', [ '-c', 'src/PubSub.js', '-t', 'test/test.js' ]
