/**
 * Created by mfaivremacon on 22/06/15.
 */

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

  'gameMove': function(game_id, move, fen, pgn, game_over) {
    console.log(game_id, move, fen);
    var ply = Moves.find({game_id: game_id}).count() + 1;
    var to_play = move.color === 'w' ? 'b' : 'w';
    Moves.insert({
      game_id: game_id,
      move: move,
      fen: fen,
      ply: ply
    });
    var arr = {fen: fen, ply: ply, pgn: pgn, to_play: to_play, lastMovedAt: new Date()};
    if(game_over) _.extend(arr, {status: 'ended'});
    Games.update({_id: game_id}, {$set: arr, $push: {moves: move}})
  }

});
