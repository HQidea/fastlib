module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                compress: {
                    drop_console: true
                },
                banner: '/*! (c) 2014 HQHOME - <%= pkg.name %> - <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                files: {
                    'public/javascripts/<%= pkg.name %>.min.js': ['public/javascripts/<%= pkg.name %>.js']
                }
            }
        },
        cssmin: {
            options: {
                keepSpecialComments: 0,
                banner: '/*! (c) 2014 HQHOME - <%= pkg.name %> - <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                files: {
                    'public/stylesheets/style.min.css': ['public/stylesheets/bootstrap.css', 'public/stylesheets/style.css']
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.registerTask('default', ['uglify', 'cssmin']);
};