'use strict';

var path = require('path');
var mime = require('mime');
var minimatch = require('minimatch');
var XRegExp = require('../vendor/xregexp-all');

var utils = {

	getSearchPatterns: function(replacementString, options) {
		var valuePattern = replacementString
			? XRegExp.escape(replacementString)
			: options.valuePattern;
		return options.searchPatterns.map(function(generalPattern) {
			return XRegExp.build(generalPattern, {
				valuePattern: XRegExp('(?<value>' + valuePattern + ')')
			}, 'g');
		});
	},

	getAbsolutePathFromRelativePath: function(pathOfFileContainingReference, relativePathOfReference) {
		var dirOfFileContainingReference = path.dirname(pathOfFileContainingReference);
		var absolutePathOfReference = path.resolve(dirOfFileContainingReference, relativePathOfReference);
		var absolutePathOfReferenceWithFileExtension = this.restoreJsFileExtension(absolutePathOfReference);
		return absolutePathOfReferenceWithFileExtension;
	},

	getRelativePathFromAbsolutePath: function(pathOfReferencingFile, absolutePathOfReference) {
		var relativeDir = path.relative(path.dirname(pathOfReferencingFile), path.dirname(absolutePathOfReference));
		var relativePath = path.join(relativeDir, path.basename(absolutePathOfReference));
		if (relativePath.substring(0, 1) !== '.') {
			relativePath = './' + relativePath;
		}
		return relativePath;
	},

	getRelativePathOfReference: function(pathOfReferencingFile, pathReferenced, existingFiles) {
		var referencedFile = existingFiles[pathOfReferencingFile].referencedFiles.find(function(referencedFile) {
			return referencedFile.absoluteReference === pathReferenced;
		});
		return referencedFile.relativeReference;
	},

	isFileInsideDirsToFix: function(pathOfReferencedFile, options) {
		return pathOfReferencedFile.substr(0, options.workingDir.length) === options.workingDir;
	},

	doesFileExist: function(filePath, existingFiles) {
		if (existingFiles.hasOwnProperty(filePath)) {
			return true;
		}
		return Q.fcall(fs.stat, filePath)
			.then(function(error) {
				return Boolean(error);
			});
	},

	isFileIncluded: function(filePath, globArray) {
		var inclusionGlobs = this.filterGlobs(globArray, 'inclusion');
		var exclusionGlobs = this.filterGlobs(globArray, 'exlusion');
		var filename = path.basename(filePath);
		// One of the inclusion conditions must be met
		var isFileIncluded = inclusionGlobs.some(function(pattern) {
			return minimatch(filename, pattern);
		});
		if (!isFileIncluded) {
			return false;
		}
		// All of the exlcusion conditions must be met
		return exclusionGlobs.every(function(pattern) {
			return minimatch(filename, pattern);
		})
	},

	filterGlobs: function(globs, type) {
		var types = {
			inclusion: true,
			exlusion: false
		};
		var filteredGlobs = [];
		globs.forEach(function(glob) {
			if ((glob.indexOf('!') !== 0) === types[type]) {
				filteredGlobs.push(glob);
			}
		});
		return filteredGlobs;
	},

	restoreJsFileExtension: function(filePath) {
		mime.default_type = 'none';
		var mimeType = mime.lookup(filePath);
		if (mimeType === 'none') {
			filePath += '.js';
		}
		return filePath;
	},

	mergeArrays: function(array1, array2) {
		var mergedArray = array1.slice();
		array2.forEach(function(value) {
			if (array1.indexOf(value) === -1) {
				mergedArray.push(value);
			}
		});
		return mergedArray;
	}

};

module.exports = utils;