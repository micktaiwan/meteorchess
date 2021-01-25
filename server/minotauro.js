Meteor.methods({

  getConfig(privateKey) {

    const disk = require('diskusage');
    let info;
    disk.check('/', function(err, usage) {
      info = err ? err : usage;
    });

    return {
      name: 'MeteorChess',
      url: '/',
      release: Meteor.release,
      disk: info,
    };
  },

});
