var LoopbackServer = function(address, handler, rate, latency) {
    this._handler = handler;
    this._interval = null;
    this.RATE = rate || 300;
    this.LATENCY = latency || 0;
    this.send = this.first_send;
};

LoopbackServer.prototype = {
    first_send: function(player_state) {
        var that = this;
        this._interval = setInterval(function() {
            that._handler({'p0': that.player_state});

            }, this.RATE);
        this.send = this.real_send;
    },
    real_send: function(player_state) {
        this.player_state = player_state;
    }
}


var Server = function(address, handler) {
    if (address) {
        s = new WebSocket(address);
    } else {
        s = new WebSocket("ws://" + prompt("Enter server address", "localhost:8080"));
    }
    s.onopen = function() {};
    s.onclose = function() {};
    s.onerror = function() {};
    s.onmessage = function(e) { console.log("server: ", e.data); handler(JSON.parse(e.data)); };
    this.socket = s;
};

Server.prototype = {
    send: function (msg) {
        if (this.socket.readyState !== 1) {
            console.error("Socket not ready:", this.socket.readyState);
            return;
        }
        if (typeof msg !== "string") {
            this.socket.send(JSON.stringify(msg));
        } else {
            this.socket.send(msg);
        }
    }

}


