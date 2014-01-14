#!/usr/bin/env node
/* vim: set shiftwidth=2 tabstop=2 noexpandtab textwidth=80 wrap : */
//"use strict";

var path = require('path');
var fs = require('fs');
var write = fs.writeFileSync;
var exists = fs.existsSync;
var link = fs.symlinkSync;

if (!exists('component.json')) {
	console.log('There needs to be a `component.json` in this directory.');
	process.exit(1);
}

var deps = dependencies('component.json');

var root = path.resolve('./');

linkInto(deps, path.resolve('node_modules'));

/**
 * Recursively creates symlinks for all the dependencies
 */
function linkInto(deps, modulePath, done) {
	done = done || {};
	for (var key in deps) {
		if (key in done)
			continue;
		var slug = key.replace('/', '-');
		var name = key.split('/').pop();
		var dir = path.resolve('components', slug);
		var nodepath = path.resolve(modulePath, name);

		// create a bogus package.json with a `main`
		var component = require(path.resolve(dir, 'component.json'));
		var pkgfile = path.resolve(dir, 'package.json');
		if (component.main && !exists(pkgfile)) {
			write(pkgfile, JSON.stringify({main: component.main}, 2));
		}

		// create the symlink
		if (exists(nodepath))
			continue;
		link(dir, nodepath);
		done[key] = true; // only once for each dependency
		console.log('  \033[90mLinking :\033[0m \033[36m%s\033[0m -> \033[36m%s\033[0m',
			path.relative(root, nodepath), path.relative(root, dir));
		// create node_modules dir
		var subpath = path.resolve(nodepath, 'node_modules');
		if (!exists(subpath))
			fs.mkdirSync(subpath);
		// recurse to dependencies
		linkInto(deps[key], subpath, done);
	}
}

// copied mostly from component-size
function dependencies(file) {
	var json = require(path.resolve(file));
	var deps = json.dependencies || {};
	var ret = {};

	for (var key in deps) {
		var slug = key.replace('/', '-');
		var dep = path.resolve('components', slug, 'component.json');
		ret[key] = dependencies(dep);
	}

	return ret;
}

