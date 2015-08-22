var app  = require('express')();
var http = require('http').Server(app);
var io   = require('socket.io')(http);
var fs   = require('fs');

var online = 0;
var users  = {};

var jackpot = {

    hash     : null,
    players  : [],
    value    : 0.00,
    time     : 120,
    items    : [],
    finished : 0,
    running  : false,

    init : function(data) {

        console.log(data);

        jackpot.setHash(data.HASH);

        console.log("Game Rodando:" + data.HASH);
        console.log("Game Tempo:" + jackpot.time);

        jackpot.deposit();
    },

    deposit : function() {

        if (jackpot.players.length == 0 && ! jackpot.running)
            jackpot.countdown();

    },

    countdown : function() {

        if (jackpot.running)
            return jackpot.time;

        jackpot.runing = true;

        var countdown = setInterval(function () {

            jackpot.time--;
            io.emit('jackpot:countdown', jackpot.time);
            
            if (jackpot.time <= 0) {
                jackpot.runing = false;
                clearInterval(countdown);
            }

            console.log("Tempo na Mesa:" + jackpot.time);

        }, 1000);

        return jackpot.time;
    },

    check : function(data) {

        if (jackpot.hash || this.jackpot == data.HASH)
            return true;

        return false;
    },

    setHash : function(data) {
        return this.hash = data;
    }

};

app.get('/', function(req, res){
    res.send('<pre>csgomillion.com</pre>');
});

io.on('connection', function(socket){

    // Increase users online.
    online++;
    io.emit('chat:online', online);

    console.log('Guet user connected');

    socket.on('disconnect', function() {
        // Decrease users online.
        online--;
        io.emit('chat:online', online);

        console.log('Guest user disconnected');
    });

    socket.on('chat:message', function(data) {
        socket.broadcast.emit('chat:message', data);
        console.log(data.user.PERSON_NAME + ' type on chat : ' + data.message.text);
    });

    socket.on('jackpot:search', function(data) {

        if (jackpot.check(data))
            return false;

        jackpot.init(data.HASH);
    });

});

http.listen(3000, function(){
    console.log('listening on *:3000');
});