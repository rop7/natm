(async () => {

    Neutralino.init()
    
    const osInfo = await Neutralino.computer.getOSInfo(),
          iconPath = await Neutralino.filesystem.getRelativePath(`resources/asset/icon.png`),
          backendePath = await Neutralino.filesystem.getRelativePath(`resources/backend`)

    let backendExecutablePath,
        backendProcessName,
        osSuffixName;

    if (osInfo.name.toLowerCase().includes('win')) {
        osSuffixName = 'win.exe'
        backendProcessName = 'natura-avon-auto-messager-backend-win.exe'
        backendExecutablePath = './natura-avon-auto-messager-backend-win.exe'
    } else {
        osSuffixName = 'linux'
        backendProcessName = 'natura-avon-auto-messager-backend-linux'
        backendExecutablePath = './natura-avon-auto-messager-backend-linux'
    }

    console.log('iconPath', iconPath)
    console.log('osInfo', osInfo.name)
    console.log('backendePath', backendePath)
    console.log('osSuffixName', osSuffixName)
    console.log('backendProcessName', backendProcessName)
    console.log('backendExecutablePath', backendExecutablePath)
    
    // await Neutralino.os.execCommand(`resources/backend/dist/${backendExecutablePath}`, { 
   //     background: true
    // })

    Neutralino.events.on('windowClose', async () => {
        //await Neutralino.os.execCommand(`killall -9 chro; killall ${backendProcessName}`)
        await Neutralino.app.killProcess();
    })

    Neutralino.events.on('appClientDisconnect', async () => {
        //await Neutralino.os.execCommand(`killall -9 chro; killall ${backendProcessName}`)
        await Neutralino.app.killProcess();
    })

    Neutralino.events.on('trayMenuItemClicked', async (trayItemClicked) => {
        if (trayItemClicked.text.toLowerCase() === 'close') {
            //await Neutralino.os.execCommand(`killall -9 chro; killall ${backendProcessName}`)
            await Neutralino.app.killProcess();
        }
    })

    await Neutralino.os.setTray({
        icon: '/resources/asset/icon.png',
        menuItems: [
          {id: "about", text: "About"},
          {text: "-"},
          {id: "quit", text: "Quit"}
        ]
    })

    await window.util.sleep(3000)

    window.appBackend.init();

    await window.util.sleep(3000)

    new Vue({

        el: '#app',
    
        vuetify: new Vuetify({
            theme: { dark: true }
        }),
    
        data: {
    
            environment: true,
            isOfflineDevelopment: false,
            checkWhatsappConnectionError: false,
            messagesFromBackend: [],
            cancelWhatsappSend: false,
            isSeondingMessages: false,
            venomClientConnected: null,
            checkingWhatsappConnection: false,
            opsys: '',
            nodeRuntimePath: '',
            textSearch: '',
            message: '',
            messageDelay: 3,
            addingFilterProperty: "",
            addingFilterValue: "",
            tableData: [],
            tableFilters: [],
            loading: false,
            loadingOverlay: false,
            csvFile: null,
            filePath: null,
            audioPath: null,
            fileName: null,
            audioName: null,
            removeDuplicates: true,
            templatedMessagesList: [],
            tableHeaders: [],
            dialog: {
                isVisible: false,
                dialogRole: "displayMessage",
                cancelButtonText: "",
                confirmButtonText: ""
            }
    
        },
    
        computed: {
    
            tableDataFiltered () {
    
                let res = this.tableData.filter(item => {
                    return this.tableFilters.every(filter => {
                        return item[filter.property] === filter.value;
                    })
                })
    
                if (this.removeDuplicates) {
                    res = window.util.removeDuplicates(res, 'Código')
                }
    
                return res;
    
            },
    
            tableFilterProperties () {
                return this.tableHeaders.filter(header => {
                    if (header.filterable) {
                        return header.value
                    }
                })
            },
    
            tableFilterPropertiesAll () {
                if (this.tableData[0]) {
                    return Object.keys(this.tableData[0])
                }
            },
    
            tableFilterValues () {
    
                const extrairValoresAninhados = (array, propriedade) => {
                    return [...new Set(array.flatMap(item => item[propriedade] || []))];
                }
                
                let filterableValues = extrairValoresAninhados(this.tableData, this.addingFilterProperty)
    
                return filterableValues;
            }
    
        },
    
        methods: {
    
            dispatchCsvInput () {
                this.$refs.csvInput.$el.querySelector('input').click()
            },
    
            appendVariableToTextarea (varr) {
                console.log('varr', varr)
                this.message = this.message + " *{{" + varr + "}}* ";
            },
    
            addTableFilter () {
                
                this.tableFilters.push({
                    property: this.addingFilterProperty,
                    value: this.addingFilterValue,
                    text: this.addingFilterProperty + "/" + this.addingFilterValue
                })
    
                this.tableFilters = this.tableFilters.filter((filter) => {
                    if (typeof filter === 'object') {
                        return filter
                    }
                })
            },
            
            removeTableFilter (removingFilter) {
                this.tableFilters = this.tableFilters.filter((filter) => {
                    return removingFilter.text !== filter.text
                })
            },
    
            async restartApp () {
                if (this.checkWhatsappConnectionError) {
                    await Neutralino.app.restartProcess()
                }
            },
            
            async checkWhatsappConnection () {

                this.checkingWhatsappConnection = true;
    
                if (!this.isOfflineDevelopment) {
    
                    console.log('Is not offline development')

                    const isVenomClientConnected = await window.appBackend.run("checkWhatsappConnection")

                    // expects objects containing error prop
                    if (isVenomClientConnected.error) {
                        
                        this.checkWhatsappConnectionError = isVenomClientConnected.error
                        this.venomClientConnected = false;
                        this.checkingWhatsappConnection = false;
                        
                    } else {

                        // expects boolean
                        this.venomClientConnected = isVenomClientConnected;
                        this.checkingWhatsappConnection = false;
                    }

                    
                } else {
                    
                    console.log('Is offline development')
    
                    this.venomClientConnected = true;
                    this.checkingWhatsappConnection = false;
                }
    
            },
    
            async connectToWhatsapp () {
                this.loadingOverlay = true;
                this.venomClientConnected = await window.appBackend.run("connectToWhatsapp")
                this.loadingOverlay = false;
            },
    
            async requestSendMessagesCancel () {
                await window.appBackend.run("cancelSendMessage")
            },
    
            openSendMessagesConfirmation () {
                this.dialog.dialogRole = 'displayMessage'
                this.dialog.confirmButtonText = "Confirmar"
                this.dialog.cancelButtonText = "Cancelar"
                this.dialog.isVisible = true
            },
    
            openTemplatedMessagesList () {
                this.dialog.dialogRole = 'templatedMessagesList'
                this.dialog.confirmButtonText = "Pronto"
                this.dialog.isVisible = true
            },
    
            saveAsTemplatedMessage () {

                const addinTemplatedMessage = {
                    id: window.util.generateSixDigitId(),
                    text: this.message,
                    date: new Date().toISOString()
                }
    
                window.localStore.add("templatedMessagesList", addinTemplatedMessage)
    
                this.templatedMessagesList = window.localStore.all("templatedMessagesList")

                window.util.notify(`Template de mensagem (${addinTemplatedMessage.id}) salvo.`)
            },
    
            pickATemplatedMessage (chosenTemplatedMessage) {
                
                console.log("Picking templated message from this.templatedMessagesList")
                
                this.message = chosenTemplatedMessage.text
                this.dialog.isVisible = false

                window.util.notify(`Template de mensagem (${chosenTemplatedMessage.id}) escolhido.`)

            },        
    
            sendMessages () {
    
                this.cancelWhatsappSend = false;
                
                if (this.isSeondingMessages) {
                    console.error('Um processo de disparos já está rodando atualmente...')
                    this.handleConsoleMessages('Um processo de disparos já está rodando atualmente...', 'error')
                    return
                }
    
                if (this.tableDataFiltered.length === 0) {
                    console.error('Nenhum contato foi encontrado.')
                    this.handleConsoleMessages('Nenhum contato foi encontrado.', 'error')
                    return
                }
    
                if (this.message.length === 0) {
                    console.error('Campo de mensagem vazio')
                    this.handleConsoleMessages('Campo de mensagem vazio.', 'error')
                    return
                }
                
                if (this.tableData.length === this.tableDataFiltered.length && this.tableFilters.length > 0) {
                    console.error('tableData não está devidamente filtrada.')
                    this.handleConsoleMessages('tableData não está devidamente filtrada.', 'error')
                    return;
                }
    
                console.log("Starting message send within 3 seconds...")
                console.log("this.tableDataFiltered.length", this.tableDataFiltered.length)
    
                if (this.cancelWhatsappSend) {
                    console.log("Message sending cancelled.")
                    return;
                }
    
                this.isSeondingMessages = true;
    
                setTimeout (async () => {
                    
                    let   text = this.message
                            contacts = window.util.cleanCollectionPrototype(this.tableDataFiltered),
                            delay = this.messageDelay,
                            filePath = false,
                            audioPath = false,
                            audioName = false,
                            fileName = false;
    
                    if (this.filePath) {
                        filePath = this.filePath
                        fileName = this.fileName
                    }
    
                    if (this.audioPath) {
                        audioPath = this.audioPath
                        audioName = this.audioName
                    }
    
                    console.log('contacts', contacts)
    
                    await window.appBackend.run("venomClientSendMessage", { 
                        text, 
                        delay,
                        contacts,
                        filePath,
                        audioPath,
                        audioName,
                        fileName
                    });
        
                }, 3000)
            },
    
            handleConsoleMessages(message, from) {
    
                if (from === 'error') {
                    message = '⌀ ' + message;
                }
                
                this.messagesFromBackend.push(message);
    
                this.$nextTick(() => {
                    const container = this.$refs.logContainer;
                    container.scrollTop = container.scrollHeight;
                });
            },
    
            async fileSelect () {

                const envs = await Neutralino.os.getEnvs()

                console.log(envs)

                const fileinfo = await Neutralino.os.showOpenDialog(`Selecione um anexo`, {
                    defaultPath: envs.HOME,
                    filters: [
                        { name: "Tipos de arquivos", extensions: ['*'] }
                    ]
                })

                const filePath = fileinfo[0]

                this.filePath = filePath
                this.fileName = filePath.split("/").pop();
            },
    
            // async audioSelect () {
            //     const audioPath = await window.appBackend.run("selectFile", ['mp3', 'wav', 'avi'])
            //     this.audioPath = audioPath
            //     this.audioName = audioPath.split("/").pop();
            // },
    
            removeFilePathAndName () {
                this.filePath = null
                this.fileName = null
            },
            
            removeAudioPathAndName () {
                this.audioPath = null
                this.audioName = null
            },
    
            parseCsvTableHeaders () {
    
                const mapped = Object.keys(this.tableData[0]).map(key => {
    
                    let value = key,
                        text = key,
                        filterable = false;
    
                    if (key === 'Crédito Disponível') { 
                        text = "Crédito Disp"
                    }
    
                    if (key === 'Pontos Acumulados') { 
                        text = "Pontos Acum."
                    }
    
                    if (key === 'Nível') { 
                        filterable = true;
                    }
    
                    if (key === 'Situação') { 
                        filterable = true;
                    }
    
                    if (key === 'Crédito Disponível') { 
                        filterable = true;
                    }
    
                    if (key === 'Débito') { 
                        filterable = true;
                    }
    
                    if (key === 'Espaço Aberto') { 
                        filterable = true;
                    }
    
                    if (key === 'Espaço com Vendas') { 
                        text = "Espaço c/ Vendas"
                        filterable = true;
                    }
                    
                    if (key === 'CN Iniciante') { 
                        text = "Início"
                        filterable = true;
                    }
    
                    return {
                        text,
                        value,
                        filterable
                    }
                })
    
                const filtered = mapped.filter((header) => {
                    return !window.excludedHeaders.includes(header.value)
                })
    
                return filtered
            },
    
            parseCSV (csv) {
    
                this.loading = true
                
                const reader = new FileReader();
    
                reader.onload = (event) =>  {
    
                    const csvString = event.target.result,
                            result = window.Papa.parse(csvString, {
                        header: true,
                        skipEmptyLines: true
                    })
    
                    let tableData = result.data.map((normalizedCapsObj) => {
    
                        for (const key in normalizedCapsObj) {
    
                            const element = normalizedCapsObj[key]
    
                            if (Object.prototype.hasOwnProperty.call(normalizedCapsObj, key)) {
    
    
                                if (typeof element !== 'number') {
                                    normalizedCapsObj[key] = element.toLowerCase().replaceAll(/\b[a-z]/g, (char) => char.toUpperCase()).replaceAll('NãO', 'Não')
                                }
    
                                if (key === 'Email') {
                                    normalizedCapsObj['E-mail'] = normalizedCapsObj['Email'].toLowerCase()
                                    normalizedCapsObj['Email'] = normalizedCapsObj['Email'].toLowerCase()
                                }
    
                                if (key === 'Débito') {
                                    if (normalizedCapsObj['Débito'] === 'Bloqueada Por DéBito') {
                                        normalizedCapsObj['Débito'] = 'Bloqueada'
                                    } else {
                                        normalizedCapsObj['Débito'] = 'Não'
                                    }
                                }
    
                                if (key === 'Nome') {
                                    normalizedCapsObj['PrimeiroNome'] = normalizedCapsObj['Nome'].split(' ')[0]
                                }
    
                                if (key === 'Contatos') {
                                    
                                    if (!normalizedCapsObj['Contatos'].includes('+')) {
                                        normalizedCapsObj['Contatos'] = '+55 ' + normalizedCapsObj['Contatos']
                                    }
    
                                    normalizedCapsObj['Contatos'] = normalizedCapsObj['Contatos'].toLowerCase().split(',')
                                    normalizedCapsObj['PrimeiroContato'] = normalizedCapsObj['Contatos'][0]
                                    normalizedCapsObj['PrimeiroContatoSendable'] = normalizedCapsObj['Contatos'][0].replaceAll('(', '')
                                                                                                                        .replaceAll(')', '')
                                                                                                                            .replaceAll('+', '')
                                                                                                                                .replaceAll(' ', '')
                                                                                                                                    .replaceAll('-', '') + '@c.us'
                                }
    
                                if (key === 'Situação') {
    
                                    const origVariableValue = normalizedCapsObj[key]
    
                                    if (normalizedCapsObj[key].includes('Inativo'))  {
                                        normalizedCapsObj[key] = 'Inativo'
                                        normalizedCapsObj['Ciclos Inativos'] = parseInt(origVariableValue.replaceAll('Inativo', ''))
                                    }
    
                                    if (normalizedCapsObj[key] === ('Ativo'))  {
                                        normalizedCapsObj['Ciclos Inativos'] = 0
                                    }
                                    
                                } 
                                
                            }
                        }
    
                        return normalizedCapsObj
                    })
    
                    setTimeout(() => {
    
                        let normalizedTableData = window.util.cleanCollectionPrototype(tableData)
    
                        console.log('normalizedTableData', normalizedTableData)
    
                        this.tableData = normalizedTableData
                        this.tableHeaders = this.parseCsvTableHeaders()
                        this.loading = false;
    
                    }, 1500)
                }
    
                reader.readAsText(csv);
    
            }
    
        },
    
        async created () {
    
            this.environment = await window.appBackend.run("getNodeEnvironment")
            this.isOfflineDevelopment = await window.appBackend.run("isOfflineDevelopment")
            this.templatedMessagesList = window.localStore.all("templatedMessagesList")
            
            await this.checkWhatsappConnection()
    
            if (this.environment === 'development') {
                this.message = "hi, {{PrimeiroNome}}, you have {{Pontos Acumulados}} e seu nivel atual e {{Nível}}, situacao {{Situação}}, esta bloqueada por divida ? {{Débito}}. seu primeiro contato {{PrimeiroContato}}"
            }
            
            console.log('this.environment', this.environment)
            console.log('this.isOfflineDevelopment', this.isOfflineDevelopment)
            console.log('this.templatedMessagesList', this.templatedMessagesList)
    
            window.appBackend.on('messageFromBackend', (message) => {
                
                console.log('messageFromBackend', message)
    
                this.handleConsoleMessages(message)
    
            })
    
            window.appBackend.on('signalFromBackend', (signal) => {
    
                console.log('signalFromBackend', signal)
    
                if (signal === 'messagesDispatchFinnished') {
                    this.isSeondingMessages = false;
                }
    
                if (signal === 'messagesDispatchStarted') {
                    this.isSeondingMessages = true;
                }
    
            })
    
        },
    
        watch: {
            
            tableData: {
                handler () {
                    this.$refs.csvInput.$el.querySelector('input').value = null;
                }
            },
    
            tableDataFiltered: {
                handler (newValue) {
                    console.log(`tableDataFiltered`, newValue)
                }
            },
    
            templatedMessagesList: {
                handler (newValue) {
                    console.log(`templatedMessagesList`, newValue)
                }
            }
        }
    }); 

    // Neutralino.os.run(NL_PATH + '/backend/main.js')
    
})()





