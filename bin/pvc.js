#!/usr/bin/env node
"use strict";

var path = require("path")
var yargs = require('yargs')
var Pvc = require('../index')
var pkg = require('../package.json')
var config = require('../../../pvc.config')
var argv = yargs.argv
var command = argv._[0]
var colors = require('colors')

// Local version replace global one
try {
	var localPvc = require.resolve(path.join(process.cwd(), "node_modules", "page-version-control", "bin", "pvc.js"));
	if (__filename !== localPvc) {
		return require(localPvc);
	}
} catch (e) {
}

// all support commands
var commandsMap = {
	publish: 'publish a new version',
	history: 'show latest 50 version details',
	prev: 'rollback to the previous version',
	rollback: 'rollback to the designated version'
}

var optionsMap = {
	'environment': {
		alias: 'e',
		demand: true,
		describe: 'you must set your current redis environment to make sure what you wanna do',
		type: 'string'
	},
	'description': {
		alias: 'd',
		demand: true,
		describe: 'you should add your description when you release a new version',
		type: 'string'
	},
	'to': {
		alias: 't',
		demand: true,
		describe: 'you should point the version number you want rollback to',
		type: 'number'
	}
}

//options for each command
function fixOptions(cmd) {
	if (!commandsMap[cmd]) {
		yargs.showHelp()
		return
	}
	var f_cmd = cmd + ' [e] '
	var params = {
		'environment': optionsMap.environment
	}
	var exampleStr = [
		'$0 ' + cmd + ' -e dbeta'
	]
	if (cmd === 'publish') {
		f_cmd += '[description]'
		params.description = optionsMap.description
		exampleStr = [
			'$0 ' + cmd + ' -e dbeta -d 新特性上线'
		]
	} else if (cmd === 'rollback') {
		f_cmd += '[to]'
		params.to = optionsMap.to
		exampleStr = [
			'$0 ' + cmd + ' -e dbeta -v 48'
		]
	}

	return {
		cmd: cmd,
		options: Object.keys(params).length ? params : undefined,
		example: exampleStr
	}
}

Object.keys(commandsMap).forEach(function (key) {
	var options = {}
	var rs = fixOptions(key)
	options = Object.assign(options, rs.options)

	yargs.usage('$0 ' + key + ' [options]')
		.example(rs.example[0], rs.example[1])
		.command(rs.cmd, commandsMap[key], options)
	// .help('help')
	// .updateStrings({
	//   'Commands:': key + ':'
	// })
	// .wrap(null)
})

yargs.version(pkg.version)
	.usage('$0 <command> [options]')
	.alias('version', 'v')
	.help('help')
	.alias('help', 'h')
	// .global('e')
	.epilog('copyright 2016 yuzhe.xing')

if (!commandsMap[command]) {
	yargs.showHelp()
	return
}

if (!argv.e) {
	console.log(optionsMap.environment.describe.warn)
	yargs.showHelp()
	return
}

if (command === 'publish' && !argv.d) {
	console.log(optionsMap.description.describe.warn)
	console.log('Replaced with the current time'.warn)
}

if (command === 'rollback' && !argv.t) {
	console.log(optionsMap.to.describe.warn)
	yargs.showHelp()
	return
}

var pvc = new Pvc({
	redisPath: config.redisPath,
	htmlPath: config.htmlPath,
	env: argv.e,
	prefix: config.prefix
})

if (command === 'publish') {
	pvc.publish(argv.d || ('version:' + new Date()))
}

if (command === 'history') {
	pvc.showHistory()
}

if (command === 'prev') {
	pvc.prev()
}

if (command === 'rollback') {
	pvc.rollback(argv.t)
}
