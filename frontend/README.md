# neutralinojs-minimal

The default template for a Neutralinojs app. It's possible to use your favorite frontend framework by using [these steps](https://neutralino.js.org/docs/getting-started/using-frontend-libraries).

## Contributors

[![Contributors](https://contrib.rocks/image?repo=neutragit slinojs/neutralinojs-minimal)](https://github.com/neutralinojs/neutralinojs-minimal/graphs/contributors)

## License

[MIT](LICENSE)

## Icon credits

- `trayIcon.png` - Made by [Freepik](https://www.freepik.com) and downloaded from [Flaticon](https://www.flaticon.com)


fazer ws no appBackend.js para receber oq antes era ex:        
     neu.window.webContents.send("signalFromMain", 'messagesDispatchStarted');



fazer websocket de listening no appBackend.js, 

api: window.appBackend.on 

atualmente esta funcionando bem assim:

-------------------------------------------

const PORT = 3456

window.appBackend = {
    
    run: async (methodName, payload) => {

        return new Promise(async resolve => {
            try {

                const response = await fetch(`http://localhost:${PORT}/${methodName}`, {
                    method: 'POST',
                    mode: 'cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                
                let res = await response.json(),
                    result = res.result
                
                if (res === "true") {
                    result = true
                }
                
                if( result === "false") {
                    result = false
                }
                
                resolve(result)
    
            } catch (error) {

                console.error('Erro ao chamar o backend:', error);
                
                reject(error);

            }
        })
        

    }
};


ADC - VARIAVEL DIA DE ANIVERSARIO

Bom dia, {{PrimeiroNome}}* , tudo bem?

Aqui é Chris sua Gerente se Negócios. Vindo aqui informar que estamos no ciclo 3 e vc esta *{{Situação}}*  a  *{{Ciclos Inativos}}* ciclos e corre risco de perder se cadastro. Passe seu pedido (natura  + Avon + CPV).

VC tem hj disponível *{{Crédito Disponível}}* pts para usar em seus pedidos.

Aguardo seu contato. Bjs Chris