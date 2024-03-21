const express = require('express');
const contas = require('./controladores/contas.js');
const despesas = require('./controladores/despesas.js');
const verificarUsuarioLogado = require('./intermediarios/autenticacao.js')

const rotas = express();

rotas.post('/contas', contas.cadastrarConta);
rotas.post('/login', contas.login);

rotas.use(verificarUsuarioLogado);

rotas.get('/contas', contas.listarContas);
rotas.get('/contas/:id', contas.obterConta);
rotas.put('/contas/:id', contas.alterarConta);
rotas.delete('/contas/:id', contas.excluirConta);

rotas.get('/despesas', despesas.listarDespesas);
rotas.get('/despesas/:id', despesas.obterDespesa);
rotas.post('/despesas', despesas.cadastrarDespesa);
rotas.put('/despesas/:id', despesas.atualizarDespesa);
rotas.delete('/despesas/:id', despesas.excluirDespesa);

module.exports = rotas