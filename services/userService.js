const pool = require('../config/database');
const { hashPassword, comparePassword } = require('../config/auth');

const findUserByEmail = async (email) => {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
};

const findUserById = async (id) => {
    const result = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [id]);
    return result.rows[0];
};

const getAllUsers = async () => {
    const result = await pool.query('SELECT id, name, email FROM users ORDER BY id ASC');
    return result.rows;
};

const createUser = async (name, email, password = null) => {
    if (password) {
        const hashedPassword = await hashPassword(password);
        const result = await pool.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
            [name, email, hashedPassword]
        );
        return result.rows[0];
    } else {
        const result = await pool.query(
            'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id, name, email',
            [name, email]
        );
        return result.rows[0];
    }
};

const updateUser = async (id, name, email) => {
    const result = await pool.query(
        'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING id, name, email',
        [name, email, id]
    );
    return result.rows[0];
};

const deleteUser = async (id) => {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    return result.rows[0];
};

const verifyPassword = async (password, hashedPassword) => {
    return comparePassword(password, hashedPassword);
};

module.exports = {
    findUserByEmail,
    findUserById,
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    verifyPassword
};

