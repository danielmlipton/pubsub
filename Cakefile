{spawn, exec} = require 'child_process'
fs	      	  = require 'fs'

watchFiles    = [
  'src/clock.coffee',
  'src/clock.jade'
]

log = (childProcess) ->

  logData = (data) ->
    data = data.toString().trim()
    console.log( data ) if data isnt ""

  childProcess.stdout.on 'data', logData
  childProcess.stderr.on 'data', logData

# Build Tasks
# task 'build', 'build clock library and examples', ->
#   log spawn 'coffee', [ '-c', '-o', 'lib', 'src' ]
#   log spawn 'jade', [ 'src/clock.jade', '-O', 'examples', '-P' ]

# Lint Tasks
task 'lint', 'run jslint, coffeelint, and jsonlint', ->
  invoke 'jslint'

task 'jslint', 'run jsl on lib/clock.js', ->
  exec( "find . -name node_modules -prune -o -name '*.js'", (error, stdout, stderr) ->
    throw error if error
    for file in stdout.toString().trim().split( '\n' )
      log spawn 'jsl', [ '-conf', 'jsl.conf', '-process', file ]
  )

# Doc Tasks
task 'doc', 'rebuild the (incomplete) clock documentation', ->
  exec([
    'node_modules/docco/bin/docco -o docs src/*.js'
  ].join(' && '), (err) ->
    throw err if err
  )

# Test Tasks
task 'test', 'run all tests', ->
  log spawn 'qunit', [ '-c', 'src/PubSub.js', '-t', 'test/test.js' ]
  # log spawn 'phantomjs', [ 'test/runner.js', 'test/index.html' ]
  # exec( "find . -name 'test/features/*.feature'", (error, stdout, stderr) ->
  #   throw error if error
  #   for file in stdout.toString().trim().split( '\n' )
  #     log spawn 'cucumber.js', [
  #       file,
  #       '--require',
  #       'test/features/step_definitions/clockStepDefinitions.js'
  #     ]
  # )