const pool = require('../conexão');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const senhaJwt = require('../senhajwt');
const instanciaAxios = require('./axios');


const listarContas = async (req, res) => {
    try {

        const { rows } = await pool.query(
            'select * from contas order by id asc'
        );

        return res.json(rows);
    } catch (error) {
        return res.status(500).json({ mensagem: 'erro interno do servidor' })
    }
};

const obterConta = async (req, res) => {
    const { id } = req.params;

    try {

        const { rows, rowCount } = await pool.query(
            'select * from contas where id = $1',
            [id]
        );

        if (rowCount < 1) {
            return res.status(404).json({ mensagem: 'Conta não encontrada' })
        };

        return res.json(rows[0])

    } catch (error) {
        return res.status(500).json(error.message)
    }
};

const cadastrarConta = async (req, res) => {
    const { nome, email, senha, cep } = req.body;

    try {

        const { data } = await instanciaAxios.get(`/${cep}/json/`);
        const enderecoCep = data.logradouro + ", " + data.bairro + ", " + data.localidade + ", " + data.uf;
        const senhaCriptografada = await bcrypt.hash(senha, 10);

        const { rows } = await pool.query(
            'insert into contas (nome, email, senha, cep, endereco) values ($1, $2, $3, $4, $5) returning *',
            [nome, email, senhaCriptografada, cep, enderecoCep]
        );

        return res.status(204).json(rows[0]);

    } catch (error) {
        return res.status(500).json(error.message)
    };
};

const alterarConta = async (req, res) => {
    const { id } = req.params;
    const { nome, email, senha, cep } = req.body;
    const idDaConta = req.conta;

    try {

        const { rowCount } = await pool.query(
            'select * from contas where id = $1',
            [id]
        );

        if (idDaConta != id) {
            return res.status(400).json({ mensagem: 'Você só pode atualizar uma conta em que você esteja conectado' })
        };

        if (rowCount < 1) {
            return res.status(404).json({ mensagem: 'Conta não encontrada' })
        };

        const { data } = await instanciaAxios.get(`/${cep}/json/`);
        const enderecoCep = data.logradouro + ", " + data.bairro + ", " + data.localidade + ", " + data.uf;
        const senhaCriptografada = await bcrypt.hash(senha, 10);

        await pool.query(
            'update contas set nome = $1, email = $2, senha = $3, cep = $4, endereco = $5 where id = $6',
            [nome, email, senhaCriptografada, cep, enderecoCep, id]
        );

        return res.status(204).send()

    } catch (error) {
        return res.status(500).json(error.message)
    }
};

const excluirConta = async (req, res) => {
    const { id } = req.params;
    const idDaConta = req.conta;

    try {

        const { rows, rowCount } = await pool.query(
            'select * from contas where id = $1',
            [id]
        );

        if (idDaConta != id) {
            return res.status(400).json({ mensagem: 'Você só pode deletar uma conta em que você esteja conectado' })
        };

        if (rowCount < 1) {
            return res.status(404).json({ mensagem: 'Conta não encontrada' })
        };

        await pool.query('delete from contas where id = $1', [id])

        return res.status(204).send()

    } catch (error) {
        return res.statu(500).json({ mensagem: 'Erro interno do servidor' })
    };
};

const login = async (req, res) => {
    const { email, senha } = req.body;

    try {
        const conta = await pool.query(
            'select * from contas where email = $1', [email]
        );

        if (conta.rowCount < 1) {
            return res.status(404).json({ mensagem: 'Email ou Senha incorreta' })
        };

        const senhaValida = await bcrypt.compare(senha, conta.rows[0].senha)

        if (!senhaValida) {
            return res.status(400).json({ mensagem: 'Email ou Senha incorreta' })
        };

        const token = jwt.sign({ id: conta.rows[0].id }, senhaJwt, { expiresIn: '8h' })

        const { senha: _, ...contaLogada } = conta.rows[0]

        return res.json({ Conta: contaLogada, token })

    } catch (error) {
        return res.status(500).json(error.message)
    }
};

module.exports = {
    listarContas,
    obterConta,
    cadastrarConta,
    alterarConta,
    excluirConta,
    login
};