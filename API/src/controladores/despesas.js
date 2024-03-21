const pool = require('../conexão');

const listarDespesas = async (req, res) => {
    const { pagina, porPagina } = req.query;
    const idDaConta = req.conta;

    try {

        const offset = pagina === 1 ? 0 : (pagina - 1) * porPagina
        const { rows } = await pool.query(
            'select * from despesas where conta_id = $1 order by id asc limit $2 offset $3',
            [idDaConta, porPagina, offset]
        );

        return res.json(rows);

    } catch (error) {
        return res.status(500).json(error.message)
    }
};

const obterDespesa = async (req, res) => {
    const { id } = req.params;
    const idDaConta = req.conta;

    try {

        const { rows, rowCount } = await pool.query(
            'select * from despesas where id = $1',
            [id]
        );

        if (idDaConta != rows[0].conta_id) {
            return res.status(400).json({ mensagem: 'Você só pode visualizar uma despesa que pertence a sua conta!' })
        };

        if (rowCount < 1) {
            return res.status(404).json({ mensagem: 'Despesa não encontrada' })
        };

        return res.json(rows[0]);

    } catch (error) {
        return res.status(500).json(error.message)
    }
};

const cadastrarDespesa = async (req, res) => {
    const { conta_id, nome, descricao, valor } = req.body;
    const idDaConta = req.conta;

    try {

        if (idDaConta != conta_id) {
            return res.status(400).json({ mensagem: 'Você só pode cadastrar uma despesa para sua conta!' })
        };

        const { rows } = await pool.query(
            'insert into despesas (conta_id, nome, descricao, valor) values ($1, $2, $3, $4) returning *',
            [conta_id, nome, descricao, valor]
        );

        return res.status(204).json(rows[0]);

    } catch (error) {
        return res.status(500).json(error.message)
    };

};

const atualizarDespesa = async (req, res) => {
    const { id } = req.params;
    const { conta_id, nome, descricao, valor } = req.body;
    const idDaConta = req.conta;

    try {

        if (idDaConta !== conta_id) {
            return res.status(400).json({ mensagem: 'Você só pode atualizar uma despesa que pertence a sua conta!' })
        };

        const { rowCount } = await pool.query(
            'select * from despesas where id = $1',
            [id]
        );

        if (idDaConta !== conta_id) {
            return res.status(400).json({ mensagem: 'Você só pode atualizar uma despesa que pertence a sua conta!' })
        };

        if (rowCount < 1) {
            return res.status(404).json({ mensagem: 'despesa não encontrada' })
        };

        await pool.query(
            'update despesas set conta_id = $1, nome = $2, descricao = $3, valor = $4 where id = $5',
            [conta_id, nome, descricao, valor, id]
        );

        return res.status(204).send();

    } catch (error) {
        return res.status(500).json(error.message)
    }
};

const excluirDespesa = async (req, res) => {
    const { id } = req.params;
    const idDaConta = req.conta;

    try {

        const { rows, rowCount } = await pool.query(
            'select * from despesas where id = $1',
            [id]
        );

        if (idDaConta != rows[0].conta_id) {
            return res.status(400).json({ mensagem: 'Você só pode deletar uma despesa que pertence a sua conta!' })
        };

        if (rowCount < 1) {
            return res.status(404).json({ mensagem: 'Não existe essa despesa' })
        };

        await pool.query(
            'delete from despesas where id = $1',
            [id]
        );

        return res.status(204).send()

    } catch (error) {
        return res.status(500).json(error.message)
    };
};

module.exports = {
    listarDespesas,
    obterDespesa,
    cadastrarDespesa,
    atualizarDespesa,
    excluirDespesa
}