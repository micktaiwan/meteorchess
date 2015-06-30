/**
 * Created by mfaivremacon on 22/06/15.
 */

var updateElo = function(w, l, result) {
  var winner = Meteor.users.findOne(w._id);
  var loser = Meteor.users.findOne(l._id);
  console.log(w, winner);
  if(!winner || !loser || winner.profile.guest || loser.profile.guest) return;
  if(!winner.elo) winner.elo = 1500;
  if(!loser.elo) loser.elo = 1500;
  var elo = new Elo();
  var wne = elo.getNewRating(winner.elo, loser.elo, result);
  var lne = elo.getNewRating(loser.elo, winner.elo, 1 - result);
  console.log('Winner', wne, 'Loser', lne);
  Meteor.users.update({_id: w._id}, {$set: {elo: wne}});
  Meteor.users.update({_id: l._id}, {$set: {elo: lne}});
};

var doGameCancel = function(id, force) {
  console.log('cancelling', id);
  var game = Games.findOne(id);
  if(!force && game.ply > 3)
    throw new Meteor.Error('Can not cancel a game with more than 3 plies');
  Moves.remove({game_id: id});
  Positions.update({}, {$pull: {games: id}});
  Chats.remove({gameId: id});
  return Games.remove({_id: id});
};

Meteor.methods({

  'gameCreate': function(rated, color) {
    if(!this.userId) throw new Meteor.Error('user not logged');
    var u = Meteor.users.findOne(this.userId);
    var name = getUserName(u);
    var type = (u.profile && u.profile.guest) ? 'guest' : 'member';
    var obj = {
      user: {_id: this.userId, name: name, type: type},
      status: 'open',
      rated: rated === "true",
      ply : 0,
      to_play: 'w',
      createdAt: new Date()
    };
    var elo = u.elo ? u.elo : 1500;
    var human = {_id: this.userId, name: name, type: 'human', elo: elo};
    if(color === 'w') _.extend(obj, {white: human});
    else _.extend(obj, {black: human});
    return Games.insert(obj);
  },

  'gameCreateComputer': function(rated, color) {
    if(!this.userId) throw new Meteor.Error('user not logged');
    var u = Meteor.users.findOne(this.userId);
    var name = getUserName(u);
    var obj = {
      user: {_id: this.userId, name: name},
      status: 'playing',
      rated: rated === "true",
      createdAt: new Date(),
      startedAt: new Date()
    };
    var elo = u.elo ? u.elo : 1500;
    var human = {_id: this.userId, name: name, type: 'human', elo: elo};
    var computer = {_id: 'lozza', name: 'Lozza (C)', type: 'computer'};
    if(color === 'w') _.extend(obj, {
      white: human,
      black: computer
    });
    else _.extend(obj, {
      black: human,
      white: computer
    });
    return Games.insert(obj);
  },

  'gameAccept': function(id) {
    console.log('accepting', id);
    if(!this.userId) throw new Meteor.Error('user not logged');
    var u = Meteor.users.findOne(this.userId);
    var name = getUserName(u);
    var game = Games.findOne(id);
    var obj = {
      status: 'playing',
      startedAt: new Date()
    };
    var elo = u.elo ? u.elo : 1500;
    var human = {_id: this.userId, name: name, type: 'human', elo: elo};
    if(game.white) _.extend(obj, {black: human});
    else _.extend(obj, {white: human});
    return Games.update({_id: id}, {$set: obj});
  },

  'gameCancel': function(id) {
    if(!this.userId) throw new Meteor.Error('user not logged');
    return doGameCancel(id);
  },


  'gameMove': function(game_id, move, fen, pgn, game_over, status) {
    var ply = Moves.find({game_id: game_id}).count() + 1;
    var to_play = (move.color === 'w' ? 'b' : 'w');
    //console.log(game_id, move, fen, to_play);
    Moves.insert({
      game_id: game_id,
      move: move,
      fen: fen,
      ply: ply
    });

    // save position
    var simple_fen = fen.split(' ');
    simple_fen = simple_fen[0] + ' ' + simple_fen[1] + ' ' + simple_fen[2];
    var p = Positions.findOne({fen: simple_fen});
    if(!p)
      Positions.insert({fen: simple_fen, games: [game_id]});
    else
      Positions.update({_id: p._id}, {$push: {games: game_id}});

    // game ended ?
    var result = undefined, text = undefined;
    if(status) { // game ended
      var game = Games.findOne(game_id);
      var winner = undefined, loser = undefined, win_color = undefined;
      if(status === 'checkmate') {
        if(to_play === 'w') {
          loser = game.white;
          winner = game.black;
          text = "Black won";
          win_color = "b";
          updateElo(game.black, game.white, 1);
        }
        else {
          loser = game.black;
          winner = game.white;
          text = "White won";
          win_color = "w";
          updateElo(game.white, game.black, 1);
        }
      }
      else {
        text = "Game was drawn";
        updateElo(game.white, game.black, 0.5);
      }
      result = {status: status, text: text, winner: winner, loser: loser, win_color: win_color}
    }

    // change game state
    var arr = {fen: fen, ply: ply, pgn: pgn, to_play: to_play, lastMovedAt: new Date()};
    if(game_over)
      _.extend(arr, {status: 'ended', result: result});
    Games.update({_id: game_id}, {$set: arr, $push: {moves: move}})
  },

  'gameResign': function(id) {
    console.log('resigning', id);
    var p_id = this.userId;
    if(!p_id) throw new Meteor.Error('user not logged');
    var game = Games.findOne(id);
    var winner, loser, win_color, text;
    if(p_id === game.white._id) {
      loser = game.white;
      winner = game.black;
      win_color = "b";
      text = "White resigned";
      updateElo(game.black, game.white, 1);
    }
    else {
      loser = game.black;
      winner = game.white;
      win_color = "w";
      text = "Black resigned";
      updateElo(game.white, game.black, 1);
    }

    return Games.update({_id: id}, {
      $set: {
        status: 'ended',
        result: {status: 'resigned', text: text, winner: winner, loser: loser, win_color: win_color}
      }
    });
  },

  'gameAddSpectator': function(g_id, u_id, name) {
    return Games.update({_id: g_id}, {$push: {spectators: {_id: u_id, name: name}}});
  },

  'gameRemoveSpectator': function(g_id, u_id) {
    return Games.update({_id: g_id}, {$pull: {spectators: {_id: u_id}}});
  }
});

UserStatus.events.on("connectionLogout", function(fields) {
  Games.update({}, {$pull: {spectators: {_id: fields.userId}}}, {multi: true});
});
