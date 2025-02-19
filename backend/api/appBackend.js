const PORT = 3456;
const WS_PORT = 3457; // Porta WebSocket

window.listeners = {};

window.appBackend = {

    run: async (methodName, payload) => {
    
        const response = await fetch(`http://localhost:${PORT}/${methodName}`, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        let res = await response.json(),
            result = res.result;

            console.log('res', res)
            console.log('result', result)

        if (!res.success) {
            return { error: 'Response is unsuccsesfull' }
        }

        return result;

    },

    on: (event, callback) => {

        if (!window.listeners[event]) {
            window.listeners[event] = [];
        }

        window.listeners[event].push(callback);
    },

    init () {

        // Conectar ao WebSocket do backend
        window.ws = new WebSocket(`ws://localhost:${WS_PORT}`);

        window.ws.onmessage = (message) => {

            try {
        
                const data = JSON.parse(message.data),
                        event = data.event,
                            payload = data.payload;
        
                const listeners = window.listeners[event] ;
        
                listeners.forEach((listener) => {
                    listener(payload)
                });
        
            } catch (error) {
                console.error("Erro ao processar mensagem WebSocket:", error);
            }
        };
        
        window.ws.onerror = (error) => {
            console.error("Erro no WebSocket:", error);
        };
        
        window.ws.onclose = () => {
            console.warn("Conexão WebSocket fechada");
        };
    }
};


