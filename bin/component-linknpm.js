#!/usr/bin/env node
/* vim: set shiftwidth=2 tabstop=2 noexpandtab textwidth=80 wrap : */
"use strict";

var fs = require('fs');
var read = fs.readFileSync;
var write = fs.writeFileSync;
var exists = fs.existsSync;
var link = fs.symlinkSync;
var readlink = fs.readlinkSync;

if (!exists('component.json')) {
	console.log('There needs to be a `component.json` in this directory.');
	process.exit(1);
}

var deps = Object.keys(JSON.parse(read('component.json', 'utf8')).dependencies);

deps.forEach(function (dep) {
	dep = dep.split('/');
	//var user = dep[0];
	var repo = dep[1];
	var component = 'components/' + dep.join('-');
	var linkto = '../' + component;
	var nodemodule = 'node_modules/' + repo;

	if (!exists(component)) {
		console.log(dep.join('/') + ' does not exist in `components`, you should ' +
			'install the components first.');
		return;
	}
	if (exists(nodemodule)) {
		try {
			var linkpath = readlink(nodemodule);
			if (linkpath !== linkto)
				return; // do not overwrite existing dependencies
		} catch (e) {
			// if its not a link, don’t bother at all
			return;
		}
	}

	// create a bogus package.json with a `main`
	var componentjson = JSON.parse(read(component + '/component.json', 'utf8'));
	if (componentjson.main) {
		write(component + '/package.json',
			JSON.stringify({main: componentjson.main}, 2));
	}

	// oh boy, those relative symlinks -_-
	try {
		link(linkto, nodemodule);
	} catch (e) {} // ignore already exists error
	console.log('Created symlink `' + nodemodule + ' -> ' + linkto + '`.');
});

