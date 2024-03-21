const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    port: 5433,
    user: 'postgres',
    password: '123456',
    database: 'contas_desafio_spectrem'
})

module.exports = pool