/*jshint -W030 */

'use strict';

var path = require('path');
var fs = require('fs-extra');
var async = require('async');
var childProcess = require('child_process');
var gruntExec = 'node ' + path.resolve('node_modules/grunt-cli/bin/grunt');

var should = require('chai').should();


/**
 * Executes a Scenario given by tests.
 *
 * - A scenario starts with a `gruntfile.js` configuration.
 * - Each build task will upload to a mock repo (folder name is `remote`)
 * - It will then clone the remote.
 * - Validations are done on the `verify` folder
 *
 * NOTE: this function DOES change the process's working directory to the `scenario` so that
 * validations are easier access.
 */
var execScenario = function (scenario, cb) {
	process.chdir(__dirname + '/scenarios/' + scenario);

	var remoteDir = 'remote';
	var verifyDir = 'verify';


	var tasks = [];


	tasks.push(function createAndRemoveDirs(next) {
		fs.removeSync(remoteDir);
		fs.removeSync(verifyDir);

		fs.mkdirSync(remoteDir);
		next();
	});


	tasks.push(function createRemote(next) {
		childProcess.exec('git init --bare', {cwd: remoteDir}, function (err) {
			if (err) throw Error(err);
			next(err);
		});
	});


	tasks.push(function executeGruntCommand(next) {
		//options
		gruntExec += ' --no-color';

		childProcess.exec(gruntExec, next);
	});



	tasks.push(function createVerifyFromRemote(next) {
		childProcess.exec('git clone -l remote verify', function (err) {
			if (err) throw Error(err);
			next(err);
		});
	});


	async.series(tasks, function executeGruntfile(err, results) {
		cb(err, results[1]);
	});
};



/**
 * Tests
 *
 * Assume that each test (`it`) is in the current working directory of the scenario.
 */
describe('build control tests', function () {

	it('should do a basic deployment', function (done) {
		execScenario('basic_deploy', function (err, results) {
			fs.existsSync('verify/empty_file').should.be.true;
			done();
		});
	});


});
