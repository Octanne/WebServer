function updateData(){
	wSocket.send("temp");
}

var wSocket = new WebSocket('ws://' + location.host + '/ws');
setInterval(updateData, 2000);

if (!window.console) { window.console = { log: function() {} }; }

wSocket.onopen = function(ev)  { console.log(ev); };
wSocket.onerror = function(ev) { console.log(ev); };
wSocket.onclose = function(ev) { console.log(ev); };
wSocket.onmessage = function(ev) {
	console.log(ev.data);
	var answer = ev.data;
	answer = answer.substr(answer.indexOf('=')+1);
	document.getElementById("dTemp").innerHTML = answer + "°C";
};