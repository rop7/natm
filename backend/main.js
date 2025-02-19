const express = require('express')
const cors = require('cors')

const backendMethods = require('./methods.js')

const PORT = 3456;

const app = express();

app.use(express.json());
app.use(cors({
    origin: '*', // Permitir todas as origens
    methods: ['POST'], // Permitir apenas métodos POST
    allowedHeaders: ['Content-Type']
}));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});

console.log('Métodos disponíveis:', Object.keys(backendMethods));

// Criar uma rota para cada método dinamicamente
Object.entries(backendMethods).forEach(([methodName, methodFunction]) => {

    if (typeof methodFunction === 'function') {
    
        app.post(`/${methodName}`, async (req, res) => {
    
            try {
    
                const result = await methodFunction(req.body);
    
                res.json({ success: true, result });
    
            } catch (error) {
                res.status(500).json({ success: 
                    false, error: 
                    error.message 
                })
            }
    
        });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

