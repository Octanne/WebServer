var wSocket = new WebSocket('wss://' + location.host + '/wss');
if (!window.console) { window.console = { log: function() {} }; }
wSocket.onopen = function(ev)  { console.log(ev);
	setInterval(sendMessage("status", "nothing"), 2000);
};
wSocket.onerror = function(ev) { console.log(ev); };
wSocket.onclose = function(ev) { console.log(ev); };

wSocket.onmessage = function(ev) {
	var webMessage = JSON.parse(ev.data);
	console.log("[WebSocket] new data incoming : "+webMessage.type);
	
	if(webMessage.type == "sysStatus"){
		var temp = webMessage.temp;
		var cpuUsage = webMessage.cpuUsage;
		var ramUsage = webMessage.ramUsage;
		var netUsage = webMessage.netUsage;
		
		var webStatus = webMessage.webStatus;
		var syncStatus = webMessage.syncStatus;
		console.log("---------------------------------------------");
		console.log("Temp : " + temp + "°C | Network : " + netUsage + "%");
		console.log("CPU Usage : " + cpuUsage + "% | Ram Usage : " + ramUsage + "%");
		console.log("Web : " + webStatus + " | Sync : " + syncStatus);
		console.log("---------------------------------------------");
		
		
	}
	if(webMessage.type == "consoleUP"){
		
	}
	if(webMessage.type == "error"){
		console.log("[WebSocket] ERROR : " + webMessage.msg);
	}
};

function sendMessage(type, arg = "nothing"){
	var webMessage = {
		secretKey: "secretKey",
		date: Date.now().toString(),
		order: type,
		args: arg
	};
	wSocket.send(JSON.stringify(webMessage).toString());
}