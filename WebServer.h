#ifndef WEBSERVER_H
#define WEBSERVER_H

#include <string>
#include <iostream>
#include <fstream>

#include "mongoose.h"

class WebServer
{
private:
	// Mongoose event manager
	struct mg_mgr mgr;
	// Mongoose connection
	struct mg_connection *nc;
	// Port 
	std::string port;
public:
	WebServer();
	~WebServer();

	void launch();
};
// Struct containing setings for how to server HTTP with mongoose
static struct mg_serve_http_opts s_http_server_opts;
std::string intoString(const char* chr, int size);
// Event handler
static void ev_handler(struct mg_connection *nc, int ev, void *p);
#endif

