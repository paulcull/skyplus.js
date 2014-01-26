/*
 *  Web client for the Sky+ box
 */

//var http = require('http');
var util = require('util');
var url = require('url');
var dgram = require('dgram');
var EventEmitter = require('events').EventEmitter;



function SkyBox(address,actions) {
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


	/*
	* 	SOAP Request definitions
	*/

	// SkyPlay2 Service
	var playServicePath = '/SkyPlay2'
	var pauseActions = {
		header : '"urn:schemas-nds-com:service:SkyPlay:2#Pause"',
		body : '<?xml version="1.0" encoding="utf-8"?>' + 
					'<s:Envelope s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/" xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body>' + 
					'<u:Pause xmlns:u="urn:schemas-nds-com:service:SkyPlay:2">' + 
					'<InstanceID>0</InstanceID></u:Pause></s:Body></s:Envelope>',
		getBody : function() {
			return this.body;
		}
	};

	var playActions = {
		header : '"urn:schemas-nds-com:service:SkyPlay:2#Play"',
		body : '<?xml version="1.0" encoding="utf-8"?>' + 
					'<s:Envelope s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/" xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body>' + 
					'<u:Play xmlns:u="urn:schemas-nds-com:service:SkyPlay:2">' + 
					'<InstanceID>0</InstanceID><Speed>1</Speed></u:Play></s:Body></s:Envelope>',
		getBody : function() {
			return this.body;
		}
	};

	var ffwActions = {
		header : '"urn:schemas-nds-com:service:SkyPlay:2#Play"',
		getBody : function(speed) {
			return '<?xml version="1.0" encoding="utf-8"?>' +
		'<s:Envelope s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/" xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body>' +
		'<u:Play xmlns:u="urn:schemas-nds-com:service:SkyPlay:2">' +
		'<InstanceID>0</InstanceID><Speed>' + speed + '</Speed></u:Play></s:Body></s:Envelope>';
		}
	};

	var channelActions = {
		header : '"urn:schemas-nds-com:service:SkyPlay:2#SetAVTransportURI"',
		getBody : function(channel) {
			return '<?xml version="1.0" encoding="utf-8"?>' + 
						'<s:Envelope s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/" xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body>' + 
						'<u:SetAVTransportURI xmlns:u="urn:schemas-nds-com:service:SkyPlay:2">' + 
						'<InstanceID>0</InstanceID><CurrentURI>xsi://' + channel + '</CurrentURI></u:SetAVTransportURI></s:Body></s:Envelope>'
		}
	}


	var _action = []; 
	switch (command) {
	    case 'Play':  _action = playActions; break;
	    case 'Pause':   _action =  pauseActions; break;
	    case 'Fwd':   _action =  ffwActions; break;
	    case 'Rew':   _action =  rewActions; break;
	    case 'Channel':   _action =  channelActions; break;
	    default: console.log('Unknown action');    break;
	}


	console.log('Sky command %s',command);
	console.log('actions : %s',JSON.stringify(_action))
	this.doSkyRequest(_action,playServicePath, commandValue, function(res) {
		this.emit('response',res);
	});
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
}


/* 
 * return details of the skybox
 */
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