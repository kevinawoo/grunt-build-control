module.exports = function (grunt) {
  // add custom tasks
  grunt.loadTasks('../../../tasks');


  // test config
  grunt.initConfig({
    buildcontrol: {
      options: {
        dir: 'dist',
        remote: '../remote'
      },
      testing: {
        options: {
          branch: 'master',
          commit: true,
          push: true,
          connectCommits: false
        }
      }
    }
  });

  // default task
  grunt.registerTask('default', ['buildcontrol']);
};
