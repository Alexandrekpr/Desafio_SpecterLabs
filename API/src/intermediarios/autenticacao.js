const jwt = require('jsonwebtoken');
const senhaJwt = require('../senhajwt');
const pool = require('../conexão');

const verificarUsuarioLogado = async (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(401).json({ mensagem: "não autorizado" })
    };

    const token = authorization.split(' ')[1]

    try {
        const { id } = jwt.verify(token, senhaJwt);

        const conta = await pool.query(
            'select * from contas where id = $1',
            [id]
        );

        if (!conta) {
            return res.status(404).json({ mensagem: 'Conta não existe' })
        };

        req.conta = conta.rows[0].id

        next()
    } catch (error) {
        return res.status(401).json(error.message)
    }
};

module.exports = verificarUsuarioLogado