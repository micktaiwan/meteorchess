/**
 * Created by mfaivremacon on 01/07/15.
 */


var displayEloProgression = function(eloProgression) {

  if(!eloProgression || eloProgression.length < 2) {
    $("#chartElo").height(0);
    return;
  }

  //Donnees.find({hard_id: hard_id, cle: cle, date: {$gt: dateAfter}}, {sort: {date: 1}}).fetch();
  var elo = [];
  _.map(eloProgression, function(p) {elo.push([p.date, p.elo])});
  var title = "Elo";
  var data = [{label: "elo", data: elo}];

  var options = {
    xaxis: {
      mode: "time",
      timeformat: "%b %d"
    },
    legend: {
      show: true,
      position: "se"
    }
  };
  $("#chartElo").plot(data, options);

};

Template.account.rendered = function() {

  displayEloProgression(this.data.eloProgression);

};


Template.account.helpers({

  'games': function() {
    return Games.find({}, {sort: {lastMovedAt: -1}});
  },

  'gamesCount': function() {
    return Games.find().count();
  }

});
