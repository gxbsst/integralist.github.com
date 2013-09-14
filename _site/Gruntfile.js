module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({

        imageDirectory: 'Assets/Images/src/',

        // grunt responsive_images:dev:default
        // grunt responsive_images:dev:lazyload
        responsive_images: {
            dev: {
                options: {
                    sizes: [
                        {
                            width: 320,
                        },
                        {
                            width: 640
                        },
                        {
                            width: 1024
                        }
                    ]
                },
                files: [{
                    expand: true,
                    cwd: '<%= imageDirectory %>',
                    src: ['*.{jpg,gif,png}'],
                    dest: '<%= imageDirectory %>generated/'
                }]
            }
        }

    });

    // Load NPM Tasks
    grunt.loadNpmTasks('grunt-responsive-images');

    // Default Task
    grunt.registerTask('default', ['responsive_images:dev']);

};
