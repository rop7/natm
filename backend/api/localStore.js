window.localStore = {};

// Função para salvar uma coleção no localStorage
window.localStore.set = function (collectionName, value) {
  try {
    window.localStorage.setItem(collectionName, JSON.stringify(value));
  } catch (error) {
    console.error("Erro ao salvar no localStorage:", error);
  }
};

// Função para obter um item ou toda a coleção do localStorage
window.localStore.get = function (collectionName, itemId = null) {
  try {
    const data = window.localStorage.getItem(collectionName);
    if (!data) return null;

    const collection = JSON.parse(data);

    // Se itemId for fornecido, retorna o item correspondente
    if (itemId !== null) {
      return collection.find(item => item.id === itemId) || null;
    }

    // Caso contrário, retorna toda a coleção
    return collection;
  } catch (error) {
    console.error("Erro ao obter do localStorage:", error);
    return null;
  }
};

// Função para obter todos os itens de uma coleção
window.localStore.all = function (collectionName) {
  return JSON.parse(window.localStorage.getItem(collectionName)) || [];
};

// Função para adicionar um item a uma coleção no localStorage
window.localStore.add = function (collectionName, item) {
  // Verifica se a coleção já existe
  let collection = window.localStore.get(collectionName);

  // Se a coleção não existir, cria uma nova coleção vazia
  if (!collection) {
    collection = [];
  }

  // Adiciona o item à coleção
  collection.push(item);

  // Salva a coleção atualizada no localStorage
  window.localStore.set(collectionName, collection);
};

// Função para remover um item de uma coleção com base no itemId
window.localStore.remove = function (collectionName, itemId) {
  const collection = window.localStore.get(collectionName) || [];
  const updatedCollection = collection.filter(item => item.id !== itemId);
  window.localStore.set(collectionName, updatedCollection);
};

// Função para limpar uma coleção do localStorage
window.localStore.clear = function (collectionName) {
  try {
    window.localStorage.removeItem(collectionName);
  } catch (error) {
    console.error("Erro ao limpar o localStorage:", error);
  }
};