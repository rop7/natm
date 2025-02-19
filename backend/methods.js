const fs = require('fs')
const venom = require('venom-bot')
const util = require('./api/util.js');
const wss = require('./wss.js')

const ws = wss.start();

var backendMethods = {},
    isSeondingMessages = false,
	cancelSendingMessagesRequested = false,
    venomClient;
    environment = process.env.NODE_ENV,
    isOfflineDevelopment = process.env.IS_OFFLINE_DEVELOPMENT;

const venomOptions = {
    logQR: false,
    headless: false,
    bypassCSP: true,
    disableDefaultArgs: true,
    useChrome: true,
    browserWS: '',
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu'
    ]
}

backendMethods.connectToWhatsapp = async () => {

    if (fs.existsSync(process.cwd() + "/tokens/WhatsappDefaultSession")) {
        fs.rmSync(process.cwd() + "/tokens/WhatsappDefaultSession", { recursive: true, force: true });
    }

    return new Promise((resolve, reject) => {

        venom.create('WhatsappDefaultSession', null, (statusSession) => {

            console.log('Status da Sessão:', statusSession);

            if (statusSession === 'successChat' || statusSession === 'waitChat') {
                resolve(true)
            }

        }, { ...venomOptions, attempts: 3 }).then(client => {

            venomClient = client

        }).catch(reject);

    })
}

backendMethods.checkWhatsappConnection = () => {
    
    return new Promise((resolve, reject) => {

        venom.create('WhatsappDefaultSession', null, (statusSession) => {

            console.log('Status da Sessão:', statusSession);

            if (statusSession === 'notLogged' || statusSession === 'desconnectedMobile') {
                resolve(false);				
            } 
            
            if (statusSession === 'successChat' ||  statusSession === 'waitChat') {
                resolve(true);
            }

        }, { ...venomOptions, headless: true, attempts: 3, autoClose: 60000 }).then(client => {
            
            venomClient = client;

        }).catch(reject);

    })
}

backendMethods.cancelSendMessage = () =>  {

    if (isSeondingMessages) {
        isSeondingMessages = false;
        cancelSendingMessagesRequested = true;
    }

}

backendMethods.getNodeEnvironment = () => {
    return environment;
}

backendMethods.isOfflineDevelopment = () =>  {
    return isOfflineDevelopment;
}

backendMethods.venomClientSendMessage = async (options) =>  {

    if (!venomClient) {
        throw new Error('venomClient is not defined');
    }

    if (isSeondingMessages) {
        console.error('Um processo de disparos já está rodando atualmente...')
        return;
    }

    try {

        isSeondingMessages = true;

        ws.broadcast("signalFromBackend", 'messagesDispatchStarted');

        console.log('contacts', options.contacts)
        console.log('text', options.text)
        console.log('delay', options.delay)

        let counter = 0

        for (const contact of options.contacts) {

            if (cancelSendingMessagesRequested) {
                
                finnishDispatching(() => {
                    util.consoleStream('Cancelamento de disparos solicitado.').then(message => {
                        ws.broadcast("messageFromBackend", message);
                    })
                })

                return
            }

            const templatedMessage = util.templateString(options.text, contact),
                    millisecondsDelay = util.secondsToMilliseconds(options.delay)

            util.consoleStream('Sending to ' + contact[`PrimeiroContatoSendable`] + '.').then(message => {
                ws.broadcast("messageFromBackend", message);
            })

            if (options.filePath) {
                await venomClient.sendFile(contact['PrimeiroContatoSendable'], options.filePath, options.fileName, templatedMessage);
            } else {
                await venomClient.sendText(contact['PrimeiroContatoSendable'], templatedMessage)
            }

            if (options.audioPath) {
                await venomClient.sendPtt(contact['PrimeiroContatoSendable'], options.audioPath);
            }

            counter = counter + 1;

            util.consoleStream(`Mensagem enviada para: ${contact['PrimeiroNome']}.`).then(message => {
                ws.broadcast("messageFromBackend", message);
            })


            if ((options.contacts.length - 1) !== counter) {

                util.consoleStream(`Sending next message within ${options.delay} seconds...`).then(message => {
                    ws.broadcast("messageFromBackend", message);
                })

                await new Promise(resolve => setTimeout(resolve, millisecondsDelay));

            }
        }

        finnishDispatching()

        function finnishDispatching (cb) {

            if (cb) cb();

            util.consoleStream(`Mensagens enviadas com sucesso!`).then(message => {
                ws.broadcast("messageFromBackend", message);
            })

            isSeondingMessages = false;
            cancelSendingMessagesRequested = false;

            ws.broadcast("signalFromBackend", 'messagesDispatchFinnished');
        }

    } catch (error) {

        console.error('Erro ao enviar mensagens:', error);

        isSeondingMessages = false;
        cancelSendingMessagesRequested = false;

        return 'Erro ao enviar mensagens';
        
    }
}

module.exports = backendMethods;
