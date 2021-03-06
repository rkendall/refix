var path = require('path');
var expect = require('chai').expect;

var config = require('../lib/config');
var parser = require('../lib/parser');

describe('Original Files', function() {

	var testWorkingDir = 'test/files/modules/original';

	describe('References', function() {
		var files;
		var options = {
			workingDirectory: testWorkingDir
		};
		beforeEach(function(done) {
			config.reset();
			config.set(options);
			parser.getReferences().then(function(result) {
				files = result;
				done();
			});
		});
		afterEach(function() {
			config.reset();
		});
		it('Should get correct number of files', function() {
			expect(Object.keys(files.existingFiles)).to.have.length(23);
		});
		it('Should get correct number of referencing files', function() {
			expect(Object.keys(files.referencingFiles)).to.have.length(2);
		});
		it('Should get correct file paths', function() {
			expect(files.existingFiles).to.have.property(path.join(process.cwd(), options.workingDirectory, 'file1.json'));
			expect(files.existingFiles).to.have.property(path.join(process.cwd(), options.workingDirectory, 'level1a/file-with-references.jsx'));
			expect(files.existingFiles).to.have.property(path.join(process.cwd(), options.workingDirectory, 'level1a/level2a/level3a/file8.js'));
		});
		it('Should get correct number of references within files', function() {
			expect(Object.keys(files.referencedFiles)).to.have.length(12);
		})
	});

	describe('Filtered References with one glob', function() {
		var files;
		var options = {
			workingDirectory: testWorkingDir,
			referencingFileFilter: ['*.js'],
			referencedFileFilter: ['*.js']
		};
		beforeEach(function(done) {
			config.forceSet(options);
			parser.getReferences().then(function(result) {
				files = result;
				done();
			})
		});
		it('Should get correct number of existing files', function() {
			expect(Object.keys(files.existingFiles)).to.have.length(12);
		});
		it('Should get correct number of references within files', function() {
			expect(Object.keys(files.referencedFiles)).to.have.length(9);
		})
	});

	describe('Filtered References with two globs', function() {
		var files;
		var options = {
			workingDirectory: testWorkingDir,
			referencingFileFilter: ['*.js', '*.jsx'],
			referencedFileFilter: ['*.js', '*.jsx']
		};
		beforeEach(function(done) {
			config.forceSet(options);
			parser.getReferences().then(function(result) {
				files = result;
				done();
			})
		});
		it('Should get correct number of existing files', function() {
			expect(Object.keys(files.existingFiles)).to.have.length(15);
		});
		it('Should get correct number of references within files', function() {
			expect(Object.keys(files.referencedFiles)).to.have.length(12);
		})
	});

	describe('Broken References', function() {
		var brokenReferences;
		var options = {
			workingDirectory: testWorkingDir
		};
		beforeEach(function(done) {
			config.forceSet(options);
			parser.getBrokenReferences().then(function(result) {
				brokenReferences = result.brokenReferences;
				done();
			})
		});
		it('Should find no broken references', function() {
			expect(Object.keys(brokenReferences)).to.have.length(0);
		});
	});

});