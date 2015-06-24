/**
 * Created by mfaivremacon on 22/06/15.
 */

var mySide = function(game) {
  var id = this.userId;
  if(game.white._id === id) return 'w';
  if(game.black._id === id) return 'b';
  return null;
};


Meteor.methods({

  'gameCreate': function(rated) {
    if(!this.userId) throw new Meteor.Error('user not logged');
    var name = getUserName(Meteor.users.findOne(this.userId));
    return Games.insert({
      user: {_id: this.userId, name: name},
      white: {_id: this.userId, name: name},
      status: 'open',
      rated: rated === "true",
      createdAt: new Date()
    });
  },

  'gameAccept': function(id) {
    console.log('accepting', id);
    if(!this.userId) throw new Meteor.Error('user not logged');
    var name = getUserName(Meteor.users.findOne(this.userId));
    return Games.update({_id: id}, {
      $set: {
        status: 'playing',
        black: {_id: this.userId, name: name},
        startedAt: new Date()
      }
    });
  },

  'gameMove': function(game_id, move, fen, pgn, game_over, status) {
    //console.log(game_id, move, fen);
    var ply = Moves.find({game_id: game_id}).count() + 1;
    var to_play = move.color === 'w' ? 'b' : 'w';
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
        if(to_play === 'w' && p_id === game.white._id) {
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
    var winner, loser, win_color;
    if(p_id === game.white._id) {
      loser = game.white;
      winner = game.black;
      win_color = "b";
    }
    else {
      loser = game.black;
      winner = game.white;
      win_color = "w";
    }
    text = loser.name + " resigned";
    return Games.update({_id: id}, {
      $set: {
        status: 'ended',
        result: {status: 'resigned', text: text, winner: winner, loser: loser, win_color: win_color}
      }
    });
  }

});
