const axios = require('axios');

const instanciaAxios = axios.create({
    baseURL: 'http://viacep.com.br/ws'
});

module.exports = instanciaAxios