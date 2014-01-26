var util = require('util');
//var net = require('net');
var EventEmitter = require('events').EventEmitter;
var SkyBox = require('./skybox');
//var url = require('url');
var dgram = require('dgram');

/* get channels from http://tv.sky.com/channel/index (default) OR use the guide @ http://tv.sky.com/tv-guide
 * and grab from the AJAX request made to  http://tv.sky.com/channel/index/<Your area>
 */
var channels = require('./channels.json').init.channels;


// The LogitechMediaServer object is an event emitter with a few properties.
// After creating it, call .start() and wait for the "registration_finished" event.
function SkyPlusNetwork() {
  var self = this;
  //self.address = address;
}
util.inherits(SkyPlusNetwork, EventEmitter);


// Start listening to the telnet server provided by Logitech Media Server.
// I haven't implemented log in with username/password yet - should be easy to do.
SkyPlusNetwork.prototype.start = function() {

    var self = this;
//  'req.open("GET","/schedule?channel="+num,true); req.send();} ' +
/*  Listens to SSDP Broadcasts. */

    console.log("Detecting Sky Box on network, Please wait up to 30 seconds.......")
    var server = dgram.createSocket("udp4");

    server.on("message", function(msg, rinfo) {
       console.log("Broadcast from %s with msg: %s",rinfo.address,msg);
        // User-Agent from Sky box is ALWAYS "redsonic". Use this to check if broadcast is from a Sky Box
        if (String(msg).indexOf("redsonic") > 1) {
            console.log("Sky Box detected at " + rinfo.address);
            self.registerPlayer(rinfo.address);
            //skyServiceHost = rinfo.address;
            server.close();
            //startHTTPServer();
        }
    });
    // SSDP Broadcasts to Port 1900
    server.bind(1900);
}

// Passed a player index and a player IP address, add to in-memory dictionary of players
SkyPlusNetwork.prototype.registerPlayer = function(pnum, pid) {
    var self = this;

    self.players[pid]        = new SkyBox(pid,actions);
    self.players[pid].id     = pid;
    self.players[pid].index  = pnum;

    // Check whether this is the last player we're waiting for, if so emit "registration_finished"
    if (Object.keys(self.players).length == self.numPlayers) {
        self.emit("registration_finished");
        // Can now start listening for all sorts of things!
        //self.telnet.writeln("listen 1");
    }
}


module.exports = SkyPlusNetwork;