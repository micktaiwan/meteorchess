/**
 * Created by mfaivremacon on 22/06/15.
 */

Meteor.methods({

  'gameCreate': function(rated, color) {
    if(!this.userId) throw new Meteor.Error('user not logged');
    var u = Meteor.users.findOne(this.userId);
    var name = getUserName(u);
    var type =  (u.profile && u.profile.guest) ? 'guest' : 'member';
    var obj = {
      user: {_id: this.userId, name: name, type: type},
      status: 'open',
      rated: rated === "true",
      createdAt: new Date()
    };
    if(color === 'w') _.extend(obj, {white: {_id: this.userId, name: name, type: 'human'}});
    else _.extend(obj, {black: {_id: this.userId, name: name, type: 'human'}});
    return Games.insert(obj);
  },

  'gameCreateComputer': function(rated, color) {
    if(!this.userId) throw new Meteor.Error('user not logged');
    var name = getUserName(Meteor.users.findOne(this.userId));
    var obj = {
      user: {_id: this.userId, name: name},
      status: 'playing',
      rated: rated === "true",
      createdAt: new Date(),
      startedAt: new Date()
    };
    if(color === 'w') _.extend(obj, {
      white: {_id: this.userId, name: name, type: 'human'},
      black: {_id: 'lozza', name: 'Lozza (C)', type: 'computer'}
    });
    else _.extend(obj, {
      black: {_id: this.userId, name: name, type: 'human'},
      white: {_id: 'lozza', name: 'Lozza (C)', type: 'computer'}
    });
    return Games.insert(obj);
  },

  'gameAccept': function(id) {
    console.log('accepting', id);
    if(!this.userId) throw new Meteor.Error('user not logged');
    var name = getUserName(Meteor.users.findOne(this.userId));
    var game = Games.findOne(id);
    var obj = {
      status: 'playing',
      startedAt: new Date()
    };
    if(game.white) _.extend(obj, {black: {_id: this.userId, name: name, type: 'human'}});
    else _.extend(obj, {white: {_id: this.userId, name: name, type: 'human'}});
    return Games.update({_id: id}, {$set: obj});
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
      var winner = undefined, loser = undefined, win_color = undefined;
      if(status === 'checkmate') {
        var game = Games.findOne(game_id);
        if(to_play === 'w') {
          loser = game.white;
          winner = game.black;
          text = "Black won";
          win_color = "b";
        }
        else {
          loser = game.black;
          winner = game.white;
          text = "White won";
          win_color = "w";
        }
      }
      else text = "Game was drawn";
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
    }
    else {
      loser = game.black;
      winner = game.white;
      win_color = "w";
      text = "Black resigned";
    }

    return Games.update({_id: id}, {
      $set: {
        status: 'ended',
        result: {status: 'resigned', text: text, winner: winner, loser: loser, win_color: win_color}
      }
    });
  }

});
