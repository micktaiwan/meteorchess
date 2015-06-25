if(typeof console == "undefined") {
  this.console = {
    log: function() {
    }
  };
}

lozData = {};

lozData.next = 0; // next board id.
lozData.hashFull = 0;
lozData.mvNum = 0;
lozData.mvStr = '';
lozData.source = 'lozza.js';

//{{{  Number.round

Number.prototype.round = function(places) {

  return +(Math.round(this + "e+" + places) + "e-" + places);
}

//}}}
//{{{  lozGetURLArgs

lozGetURLArgs = function() {

  var url = location.href;
  var qs = url.substring(url.indexOf('?') + 1).split('&');

  for(var i = 0, result = {}; i < qs.length; i++) {
    qs[i] = qs[i].split('=');
    result[qs[i][0]] = decodeURIComponent(qs[i][1]);
  }

  return result;
};

//}}}
//{{{  lozDecodeFEN

lozDecodeFEN = function(fen) {

  fen = fen.replace(/\s+/g, ' ');

  var a = fen.split(' ');

  var feno = {};

  feno.board = (a[0] == undefined) ? '' : a[0];
  feno.turn = (a[1] == undefined) ? 'w' : a[1];
  feno.rights = (a[2] == undefined) ? 'KQkq' : a[2];
  feno.ep = (a[3] == undefined) ? '-' : a[3];

  return feno;
}

//}}}
//{{{  lozEncodeFEN

lozEncodeFEN = function(feno) {
  return feno.board + ' ' + feno.turn + ' ' + feno.rights + ' ' + feno.ep + ' 0 1';
}

//}}}
//{{{  lozMakeURL

lozMakeURL = function(u) {

  var url = lozData.page;
  var sep = '?';

  for(var a in u) {
    if(typeof u[a] == 'undefined')
      continue;
    url += sep + a + '=' + u[a];
    sep = '&';
  }

  return url;
}

//}}}

//{{{  lozGetInt

lozGetInt = function(key, def) {

  for(var i = 0; i < lozData.tokens.length; i++)
    if(lozData.tokens[i] == key)
      return parseInt(lozData.tokens[i + 1]);

  return def;
}

//}}}
//{{{  lozGetInt1

lozGetInt1 = function(key, def) {

  for(var i = 0; i < lozData.tokens.length; i++)
    if(lozData.tokens[i] == key)
      return parseInt(lozData.tokens[i + 2]);

  return def;
}

//}}}
//{{{  lozGetStr

lozGetStr = function(key, def) {

  for(var i = 0; i < lozData.tokens.length; i++)
    if(lozData.tokens[i] == key)
      return lozData.tokens[i + 1];

  return def;
}

//}}}
//{{{  lozGetStrToEnd

lozGetStrToEnd = function(key, def) {

  for(var i = 0; i < lozData.tokens.length; i++) {
    if(lozData.tokens[i] == key) {
      var val = '';
      for(var j = i + 1; j < lozData.tokens.length; j++)
        val += lozData.tokens[j] + ' ';
      return val;
    }
  }

  return def;
}

lozUpdateStats = function() {

  if(lozData.mvNum && lozData.mvStr)
    var move = ' | ' + lozData.mvNum + '/' + lozData.mvStr;
  else
    var move = '';

  if(lozData.hashFull)
    var hash = ' | ' + lozData.hashFull / 10 + '%';
  else
    var hash = '';

  $(lozData.idStats).html(lozData.seconds + ' s | ' + lozData.kilonodes + ' kn | ' + lozData.knps + ' kn/s' + move + hash);
}

//}}}
//{{{  lozUpdatePV

lozUpdatePV = function() {

  if(lozData.selDepth)
    var d = lozData.depth + '/' + lozData.selDepth;
  else
    var d = lozData.depth;

  $(lozData.idInfo).prepend(lozData.seconds + ' ' + d + ' (' + lozData.score + lozData.units + ') ' + lozData.pv + '<br>');
}

//}}}
//{{{  lozUpdateInfo

lozUpdateInfo = function() {

  $(lozData.idInfo).prepend(lozData.info + '<br>');
}

//}}}
//{{{  lozUpdateBoard

lozUpdateBoard = function() {

  var id = 'board' + lozData.next++;

  $(lozData.idInfo).prepend('<div style="width: 250px;" id="' + id + '"><div>');

  var cb = new ChessBoard(id, {
    showNotation: true,
    draggable: true,
    dropOffBoard: 'snapback',
    position: lozData.board
  });

}

//}}}

