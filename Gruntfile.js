// Gruntfile.js

// our wrapper function (required by grunt and its plugins)
// all configuration goes inside this function
module.exports = function(grunt) {

  // ===========================================================================
  // CONFIGURE GRUNT ===========================================================
  // ===========================================================================
  grunt.initConfig({

    // get the configuration info from package.json ----------------------------
    // this way we can use things like name and version (pkg.name)
    pkg: grunt.file.readJSON('package.json'),

    // all of our configuration will go here
    jshint: {
      options: {
        reporter: require('jshint-stylish') // use jshint-stylish to make our errors look and read good
      },

      // when this task is run, lint the Gruntfile and all js files in src
      build: ['Gruntfile.js', 'src/**/*.js']
    },
    // fixmyjs: {
    //   options: {
    //     // Task-specific options go here.
    //     diff: true
    //   },
    //   build: ['Gruntfile.js', 'src/**/*.js']
    //
    jade: {
      compile: {
        options: {
          data: {
            debug: false
          }
        },
        files: {
          "dist/index.html": ["src/*.jade"]
        }
      }
    },
    copy: {
      build: {
        expand: true,
        cwd: 'src/data/',
        src: '**',
        dest: 'dist/data/',
      },
    },
    cssmin: {
      options: {
        banner: '/*\n <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> \n*/\n'
      },
      build: {
        files: {
          'dist/css/style.min.css': ['src/**/*.css', 'node_modules/c3/c3.css']
        }
      }
    },
    browserify: {
      'bundled/bundle.js': ['src/scripts.js']
    },
    uglify: {
      options: {
        banner: '/*\n <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> \n*/\n'
      },
      build: {
        files: {
          'dist/js/script.min.js': 'bundled/bundle.js'
        }
      }
    },
    watch: {
      stylesheets: {
        files: ['src/**/*.css'],
        tasks: ['cssmin']
      },
      scripts: {
        files: 'src/**/*.js',
        tasks: ['jshint', 'browserify', 'uglify']
      },
      templates: {
        files: 'src/**/*.jade',
        tasks: ['jade']
      },
      data: {
        files: 'src/data/*',
        tasks: ['copy']
      }

    }


  });

  // ===========================================================================
  // LOAD GRUNT PLUGINS ========================================================
  // ===========================================================================
  // we can only load these if they are in our package.json
  // make sure you have run npm install so our app can find these
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-fixmyjs');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-contrib-copy');

  // ========= // CREATE TASKS =========

// this default task will go through all configuration (dev and production) in each task
grunt.registerTask('default', ['jshint', 'browserify','uglify', 'copy', 'cssmin', 'jade']);

};
