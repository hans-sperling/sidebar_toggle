module.exports = function(grunt) {
    'use strict';

    // ---------------------------------------------------------------------------------------------------------- Banner

    function getBanner() {
        return '/*! <%= pkg.name %> - <%= pkg.description %> - Version: <%= pkg.version %> */\n';
    }

    // ----------------------------------------------------------------------------------------------------------- Grunt

    grunt.initConfig({
        pkg    : grunt.file.readJSON('package.json'),
        uglify : {
            dist : {
                options : {
                    banner : getBanner()
                },
                src  : 'src/js/**/*.js',
                dest : 'dist/js/<%= pkg.name %>.min.js'
            }
        },
        concat : {
            dist : {
                options : {
                    banner : getBanner()
                },
                src  : ['src/js/**/*.js'],
                dest : 'dist/js/<%= pkg.name %>.js'
            }
        },
        copy : {
            fonts : {
                expand  : true,
                flatten : true,
                src     : 'src/font/**/*',
                dest    : 'dist/font/'
            }
        },
        sass : {
            dev : {
                options: {
                    style     : 'expanded',
                    sourcemap : 'none',
                    debugInfo : false
                },
                files: [{
                    expand : true,
                    cwd    : 'src/scss/',
                    src    : ['**/*.scss'],
                    dest   : 'dist/css/',
                    ext    : '.css'
                }]
            },
            dist : {
                options: {
                    style     : 'expanded',
                    sourcemap : 'auto',
                    check     : true,
                    trace     : true
                },
                files: [{
                    expand : true,
                    cwd    : 'src/scss/',
                    src    : ['**/*.scss'],
                    dest   : 'dist/css/',
                    ext    : '.min.css'
                }]
            }
        },
        watch : {
            sass : {
                files : ['src/scss/**/*.scss'],
                tasks : ['sass:dev']
            }
        }
    });

    // ----------------------------------------------------------------------------------------------- Plugins

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // ------------------------------------------------------------------------------------------------- Tasks


    grunt.registerTask('build',   ['concat:dist', 'uglify:dist', 'sass:dist', 'sass:dev', 'copy:fonts']);
    grunt.registerTask('default', ['sass:dev']);
};
