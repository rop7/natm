var util = {}

util.templateString = function (template, data) {
    return template.replace(/\{\{(.*?)\}\}/g, (match, key) => {
        return key.trim() in data ? data[key.trim()] : match;
    });
}

util.cleanCollectionPrototype = (collection) => {
    return collection.map(item => deepClone(item));
}

util.removeDuplicates = (collection, key) => {
    const seen = new Set();
    return collection.filter(item => {
        const value = item[key];
        if (seen.has(value)) {
            return false; // Já existe, remove
        }
        seen.add(value);
        return true; // Mantém no array final
    });
}

util.generateSixDigitId = () => {
    // Gera um número aleatório entre 100000 e 999999
    const id = Math.floor(100000 + Math.random() * 900000);
    return id.toString(); // Converte para string (opcional)
}

util.sleep = (ms) => new Promise((res) => setTimeout(res, ms));

util.secondsToMilliseconds = (seconds) => {
    return seconds * 1000;
}

util.consoleStream = (...args) => {

   let message = ' → ' +  args

   console.log(message)

   return {
        then: cb => {
            if (cb) cb(message)
        }
   }
}
util.notify = (text) => {

    window.Toastify({
        
        text,
        duration: 3000,
        // destination: "https://github.com/apvarun/toastify-js",
        close: true,
        gravity: "bottom", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover

      }).showToast();
}

function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

if (typeof window === 'undefined') {
    module.exports = util;
} else {
    if (typeof module !== 'undefined') {
        window.util = util;
    }
}



