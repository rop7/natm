
const { WebSocketServer } = require('ws');

const WS_PORT = 3457;

var wss;

module.exports = { 

    start () {
        
        wss = new WebSocketServer({ port: WS_PORT });

        wss.broadcast = function (event, payload) {

            const data = JSON.stringify({event, payload});
        
            // console.log("wss data", data)
        
            wss.clients.forEach(client => {
                if (client.readyState === 1) {
                    client.send(data);
                }
            })
        }

        return wss;
    }
}