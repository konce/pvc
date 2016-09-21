#!/usr/bin/env node
"use strict";

// var Pvc = require('./index')
// var config = require('./pvc.config')
// var yargs = require('yargs')
// var argv = yargs.argv
// var command = argv._[0]
//
// var commandsMap = {
// 	publish: 'publish a new version',
// 	history: 'show latest 50 version details',
// 	prev: 'rollback to the previous version',
// 	rollback: 'rollback to the designated version'
// }
//
// yargs.usage('$0 command')
// 	.demand(1, 'must provide a valid command')
// 	.options({
// 		'e': {
// 			alias: 'environment',
// 			demand: true,
// 			describe: 'your redis environment',
// 			type: 'string'
// 		}
// 	})
// var pvc = new Pvc({
// 	redisPath: config.redisPath,
// 	htmlPath: config.htmlPath,
// 	env: argv.e,
// 	prefix: config.prefix
// })
//
// function fixOptions () {
// 	if (!commandsMap[command]) {
// 		yargs.showHelp()
// 		return
// 	}
// 	var params = {}
// 	var exampleStr = [
// 		'$0 ' + command + ' -e dbeta'
// 	]
// 	if (command === 'publish') {
// 		params.d = {
// 			alias: 'description',
// 			demand: true,
// 			describe: 'description your version',
// 			type: 'string'
// 		}
// 		exampleStr = [
// 			'$0 ' + command + ' -e dbeta -d 新特性上线'
// 		]
// 	}
// 	if (command === 'rollback') {
// 		params.v = {
// 			alias: 'version',
// 			demand: true,
// 			describe: 'the version number you want rollback',
// 			type: 'number'
// 		}
// 		exampleStr = [
// 			'$0 ' + command + ' -e dbeta -v 48'
// 		]
// 	}
// 	yargs.reset()
// 		.usage('$0 ' + cmd)
// 		.options(params)
// 		.help('h')
// 		.example(exampleStr[0], exampleStr[1])
// 	return params
// }
//
// Object(commandsMap).keys.forEach(function (key) {
// 	yargs.command(key, commandsMap[key], function (obj) {
// 		var keys = Object(fixOptions()).keys
// 		var param0 = yargs.args[keys[0]]
// 		console.log('haha ' + command + ' :' + param0)
// 		return
// 		pvc[command](param0)
// 	})
// })
//
// yargs.epilog('copyright 2016').global('e')

