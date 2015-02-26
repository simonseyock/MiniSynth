var uprocess = require('uprocess');
var fs = require('fs');
var uprocessJSHintMapper = require('./node_modules/uprocess/jshint-line-mapper.js');
//var uprocessReporter = require('./node_modules/uprocess/jshint-reporter.js');

//uprocessJSHintMapper.makeReporter(require('jshint-stylish'), 'tmp/linemap-<%= pkg.name %>.json');

module.exports = function(grunt) {
	
	var lineMap = [];
	
	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			// options: {
			// banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			// },
			build: {
				src: 'build/lib/<%= pkg.name %>.js',
				dest: 'build/lib/<%= pkg.name %>.min.js'
			}
		},
		less: {
			development: {
				options: {
					//paths: ["assets/css"]
				},
				files: {
					"build/css/<%= pkg.name %>.css": "less/sequencer-chessboard.less"
				}
			}
		},
		uprocess: {
			main: {
				defines: {},
				src: 'javascript/main.js',
				dest: 'build/lib/<%= pkg.name %>.js'
			}
		},
		jshint: {
			options: {
				//reporter: uprocessJSHintMapper.makeReporter(require('jshint-stylish'), 'tmp/linemap-<%= pkg.name %>.json')
				//reporter: require('jshint-stylish')
				//reporter: uprocessReporter
			},
			main: ['build/lib/<%= pkg.name %>.js']
		}
	});

	var lineMap = [];
	
	grunt.task.registerMultiTask('uprocess', function () {
		//var lineMap = { lines: [] };
		fs.writeFileSync(this.data.dest, uprocess.processFile(this.data.src, this.data.defines, lineMap));
		//fs.writeFileSync(this.data.lineMap, JSON.stringify(lineMap));
		//grunt.log.writeln("Successfully preprocessed into file: " + this.data.dest);
	});
	
	grunt.task.registerTask('ujshint', function () {
		grunt.task.requires('uprocess');
		
		grunt.log.writeln(lineMap[0].file, lineMap[0].line);
		grunt.log.writeln(lineMap[43].file, lineMap[43].line);
		grunt.log.writeln(lineMap[243].file, lineMap[243].line);
		
		//uprocessJSHintMapper.lineMap = lineMap;
		
		grunt.config('jshint.options.reporter', uprocessJSHintMapper.makeReporter(lineMap));
		
		grunt.task.run('jshint');
		//uprocessReporter.lineMap = JSON.parse(fs.readFileSync(this.data.options.lineMap, "utf-8"));
	});

	grunt.task.registerTask('build', ["uprocess", "less"]);

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-jshint');


	// tasks.
	//grunt.registerTask('uglify', ['uglify']);
	//grunt.registerTask('less', ['less']);


};