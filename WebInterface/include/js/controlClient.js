var wSocket = new WebSocket('wss://' + location.host + '/wss');
if (!window.console) { window.console = { log: function() {} }; }
wSocket.onopen = function(ev)  { console.log(ev);
	launchAutoRefresh();
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
		
		document.getElementById("temperature").innerHTML = temp+"°C";
		document.getElementById("cpuUsage").innerHTML = cpuUsage+"%"; document.getElementById("cpuUsage").style.width = cpuUsage+"%";
		document.getElementById("ramUsage").innerHTML = ramUsage+"%"; document.getElementById("ramUsage").style.width = ramUsage+"%";
		document.getElementById("netUsageTX").innerHTML = "<div id=\"netUsageRX\" class=\"progress-bar\" style=\"width:0%;\">"+netUsage+"%</div>"+(100-netUsage)+"%";
		document.getElementById("netUsageRX").style.width = netUsage+"%";
		if(temp <= 45){
			document.getElementById("temperature").style.color = "green";
		}else if(temp <= 50){
			document.getElementById("temperature").style.color = "darkorange";
		}else if(temp > 60){
			document.getElementById("temperature").style.color = "red";
		}
		if(syncStatus){
			document.getElementById("syncStat").style.color = "green";
			document.getElementById("syncStat").innerHTML = "ACTIVE";
		}else{
			document.getElementById("syncStat").style.color = "red";
			document.getElementById("syncStat").innerHTML = "INACTIF";
		}
		if(webStatus){
			document.getElementById("webStat").style.color = "green";
			document.getElementById("webStat").innerHTML = "ACTIVE";
		}else{
			document.getElementById("webStat").style.color = "red";
			document.getElementById("webStat").innerHTML = "INACTIF";
		}
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
function launchAutoRefresh(){
	sendMessage("status");
	setInterval(sendMessage, 4000, "status", "nothing");
}