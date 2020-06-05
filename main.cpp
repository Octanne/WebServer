#include <string>
#include <iostream>
#include <thread>

#include "WebServer.h"

using namespace std;

void wServer(WebServer *wS) {
	wS->launch();
}

int main(void) {
	WebServer wServ;
	
	thread wThread(wServer, &wServ);
	cout << endl << "Type something to stop the server..." << endl;
	string entry;
	cin >> entry;
	wServ.stop();
	wThread.join();
	cout << "Server stoped!";
}