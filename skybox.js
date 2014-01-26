/*
 *  Web client for the Sky+ box
 */

//var http = require('http');
var url = require('url');
var dgram = require('dgram');
var EventEmitter = require('events').EventEmitter;

/* get channels from http://tv.sky.com/channel/index (default) OR use the guide @ http://tv.sky.com/tv-guide
 * and grab from the AJAX request made to  http://tv.sky.com/channel/index/<Your area>
 */
var channels = require('./channels.json').init.channels;
var actions = require('./actions.json').actions;

function SkyBox(address) {
	var self = this;
	self.address = address;
	// Sky box
	var skyServiceHost = "";
	var skyServicePort = 49153;
	var skyBoxDetected = false;
}
util.inherits(SkyBox, EventEmitter);



// HTTP server
//var localPort = process.argv[2] || 5555;
//var httpServerRunning = false;


/*
* 	SOAP Request definitions
*/

SkyBox.prototype.command = function(command, commandValue) {

	var self = this;
	// SkyPlay2 Service
	var playServicePath = '/SkyPlay2'
	var _action = actions.name[command];
	console.log('Sky command %s',_action.name);
	this.doSkyRequest(_action,playServicePath, commandValue, function(res) {
		this.emit('response',res);
	})}
}
/*
 * 	Sends requests to the detected Sky Box
 */
SkyBox.prototype.doSkyRequest = function(actions, servicePath, actionArgs, initRes) {

	var self = this;
	var options = {
		hostname : skyServiceHost,
		port : skyServicePort,
		path : servicePath,
		method : 'POST',
		headers : {
			'USER-AGENT' : 'SKY_skyplus', // This seems to be required.
			'SOAPACTION' : actions.header,
			'CONTENT-TYPE' : 'text/xml; charset="utf-8"'
		}
	};

	var req = http.request(options, function(res) {
		res.setEncoding('utf8');
		res.on('data', function(chunk) {
			initRes.end(chunk);
		});
	});

	req.write(actions.getBody(actionArgs));
	req.end();

	req.on('error', function(e) {
		console.log('Error in Comms with SKY Box ' + e.message);
	});
};

/*
 * 	Incoming HTTP Server. Passes requests to
 */
// function startHTTPServer() {

// 	http.createServer(function(req, res) {
// 		//ignore favicon requests
// 		if (req.url === '/favicon.ico') {
// 			return;
// 		}

// 		var requestPath = url.parse(req.url).pathname;

// 		switch (requestPath) {
// 			case '/' :
// 				doGUIRequest(res);
// 				break;
// 			case '/pause' :
// 				console.log("Pausing");
// 				doSkyRequest(pauseActions, playServicePath, res);
// 				break;
// 			case '/play' :
// 				console.log("Playing");
// 				doSkyRequest(playActions, playServicePath, res);
// 				break;
// 			case '/channel' :
// 				var channel = url.parse(req.url, true).query.channel;
// 				console.log("Changing to channel ID " + channel);
// 				doSkyRequest(channelActions, playServicePath, res, Number(channel).toString(16));
// 				break;
// 			case '/ffw' :
// 				var speed = url.parse(req.url, true).query.speed;
// 				console.log("Fast forwarding at " + speed + "x speed");
// 				doSkyRequest(ffwActions, playServicePath, res, Number(speed).toString(16));
// 				break;
// 			case '/skipAds' :
// 				var speed = url.parse(req.url, true).query.speed;
// 				console.log("Attempting to Skip adverts, playing in 7 seconds");
// 				doSkyRequest(ffwActions, playServicePath, res, 30);
// 				setTimout(function(){doSkyRequest(playActions, playServicePath, res)},7000);
// 				break;
// 			case '/scheduled' :
// 				var channel = url.parse(req.url, true).query.channel;
// 				console.log("Schedule called for channel: " + channel);
// 				getChannelListings(channel, function(data) {
// 					var current = getCurrentScheduledProgram(data);
// 					console.log('Current Program : ' + current);
// 					res.end(current);
// 				}); 
//             break;
// 			default :
            
// 				console.log("Bad Request to " + requestPath);
// 				res.end('Bad Request');
// 				break;
// 		}
// 	}).listen(localPort);
// 	console.log("Web server now running on port " + localPort)
// }

SkyBox.prototype.inspect = function() {
    // Convenience method for debugging/logging.
    // Return self but without certain lengthy sub-objects.
    var self = this;
    var x = {};
    Object.keys(self).forEach(function(k) {
        if (["telnet", "_events"].indexOf(k) == -1) {
            x[k] = self[k];
        }
    });
    x.noise_level = self.getNoiseLevel();
    return x;
}


module.exports = SkyBox;