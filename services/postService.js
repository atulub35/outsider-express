const pool = require('../config/database');

const getAllPosts = async (userId = null, query = null) => {
    let sqlQuery = `
        SELECT p.*, u.name as author_name,
               (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
               EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = $1) as is_liked
        FROM posts p
        JOIN users u ON p.user_id = u.id
    `;
    let params = [userId];

    if (query) {
        sqlQuery += ` WHERE p.title ILIKE $2 OR p.content ILIKE $2`;
        params.push(`%${query}%`);
    }

    sqlQuery += ` ORDER BY p.created_at DESC`;

    const result = await pool.query(sqlQuery, params);
    return result.rows;
};

const getPostById = async (id, userId = null) => {
    const result = await pool.query(`
        SELECT p.*, u.name as author_name,
               (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
               EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = $1) as is_liked
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.id = $2
    `, [userId, id]);
    
    return result.rows[0];
};

const createPost = async (title, content, userId) => {
    const result = await pool.query(
        'INSERT INTO posts (title, content, user_id) VALUES ($1, $2, $3) RETURNING *',
        [title, content, userId]
    );
    return result.rows[0];
};

const updatePost = async (id, title, content) => {
    const result = await pool.query(
        'UPDATE posts SET title = $1, content = $2 WHERE id = $3 RETURNING *',
        [title, content, id]
    );
    return result.rows[0];
};

const deletePost = async (id) => {
    await pool.query('DELETE FROM posts WHERE id = $1', [id]);
};

const getPostOwner = async (id) => {
    const result = await pool.query('SELECT user_id FROM posts WHERE id = $1', [id]);
    return result.rows[0]?.user_id;
};

const toggleLike = async (postId, userId) => {
    // Check if like exists
    const existingLike = await pool.query(
        'SELECT id FROM likes WHERE post_id = $1 AND user_id = $2',
        [postId, userId]
    );

    if (existingLike.rows.length > 0) {
        // Unlike
        await pool.query(
            'DELETE FROM likes WHERE post_id = $1 AND user_id = $2',
            [postId, userId]
        );
        return { action: 'unliked' };
    } else {
        // Like
        await pool.query(
            'INSERT INTO likes (post_id, user_id) VALUES ($1, $2)',
            [postId, userId]
        );
        return { action: 'liked' };
    }
};

module.exports = {
    getAllPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost,
    getPostOwner,
    toggleLike
};

