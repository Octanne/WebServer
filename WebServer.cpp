#include "WebServer.h"



WebServer::WebServer()
{
	// Init mongoose
	mg_mgr_init(&mgr, NULL);

	// Set port
	port = "8000";
}


WebServer::~WebServer()
{

}

void WebServer::launch() {
	
	std::cout << "Starting WebServer on port " << port << std::endl;
	
	// Start Web Server
	nc = mg_bind(&mgr, port.c_str(), ev_handler);

	// If connection fails
	if (nc == NULL) {
		std::cout << "Failed to create listener" << std::endl;
		return;
	}

	// Set up HTTP server options
	mg_set_protocol_http_websocket(nc);

	s_http_server_opts.document_root = "/home/pi/Desktop/WebInterface";
	s_http_server_opts.enable_directory_listing = "no";

	for (;;) {
		mg_mgr_poll(&mgr, 1000);
	}

	//Free up all memory allocated
	mg_mgr_free(&mgr);

	return;
}

std::string intoString(const char* a, int size)
{
	int i;
	std::string s = "";
	for (i = 0; i < size; i++) {
		s = s + a[i];
	}
	return s;
}

// Event handler
static void ev_handler(struct mg_connection *nc, int ev, void *p) {
	switch (ev) {
		case MG_EV_WEBSOCKET_HANDSHAKE_DONE: {
			/* New websocket connection. Tell everybody. */
			char addr[32];
			mg_sock_addr_to_str(&nc->sa, addr, sizeof(addr),
				MG_SOCK_STRINGIFY_IP | MG_SOCK_STRINGIFY_PORT);
			std::cout << "[WebSocket] connection with " << addr << " has been started." << std::endl;
			break;
		}
		case MG_EV_CLOSE: {
			/* Disconnect WSocket connection */
			if (nc->flags & MG_F_IS_WEBSOCKET) {
				char addr[32];
				mg_sock_addr_to_str(&nc->sa, addr, sizeof(addr),
					MG_SOCK_STRINGIFY_IP | MG_SOCK_STRINGIFY_PORT);
				std::cout << "[WebSocket] connection with " << addr << " has been ended." << std::endl;
			}
			break;
		}
		case MG_EV_WEBSOCKET_FRAME: {
			struct websocket_message *wm = (struct websocket_message *) p;
			/* New websocket message read & send an answer. */
			struct mg_str d = { (char *)wm->data, wm->size };
			char addr[32];
			mg_sock_addr_to_str(&nc->sa, addr, sizeof(addr),
				MG_SOCK_STRINGIFY_IP | MG_SOCK_STRINGIFY_PORT);
			std::cout << "[WebSocket:"<< addr << "] new request receive: '" << wm->data << "'" << std::endl;
			
			std::string requestM = intoString(d.p, d.len);
			if (requestM == "temp") {
				//Reading Temp
				std::string temp = "";
				std::ifstream ifile("/sys/class/thermal/thermal_zone0/temp");
				ifile >> temp;
				ifile.close();
				temp.insert(2, 1, '.');
				temp.pop_back(); temp.pop_back();
				std::string answer = "temp=" + temp;

				std::cout << "[WebSocket:" << addr << "] answer send: '" << answer << "'" << std::endl;

				char buf[500];
				snprintf(buf, sizeof(buf), "%.*s", (int)answer.length(), answer.c_str());
				mg_send_websocket_frame(nc, WEBSOCKET_OP_TEXT, buf, strlen(buf));
			}
			break;
		}
		// If event is a http request
		case MG_EV_HTTP_REQUEST: {
			mg_serve_http(nc, (struct http_message *) p, s_http_server_opts);
			break;
		}
	}
}