const { Pool } = require('pg');
require('dotenv').config();
const { generateToken, hashPassword, comparePassword } = require('./config/auth')

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Authentication functions
const registerUser = async (request, response) => {
    const { username, email, password } = request.body

    if (!username || !email || !password) {
        return response.status(400).json({ error: 'Username, email, and password are required' })
    }

    try {
        const hashedPassword = await hashPassword(password)
        const result = await pool.query(
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
            [username, email, hashedPassword]
        )
        const user = result.rows[0]
        const token = generateToken(user)
        response.status(201).json({ user, token })
    } catch (error) {
        if (error.code === '23505') { // Unique violation
            return response.status(400).json({ error: 'Email or username already exists' })
        }
        response.status(500).json({ error: error.message })
    }
}

const loginUser = async (request, response) => {
    const { email, password } = request.body

    if (!email || !password) {
        return response.status(400).json({ error: 'Email and password are required' })
    }

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
        const user = result.rows[0]

        if (!user) {
            return response.status(401).json({ error: 'Invalid credentials' })
        }

        const isValidPassword = await comparePassword(password, user.password)
        if (!isValidPassword) {
            return response.status(401).json({ error: 'Invalid credentials' })
        }

        const token = generateToken(user)
        response.json({ 
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            },
            token 
        })
    } catch (error) {
        response.status(500).json({ error: error.message })
    }
}

// Existing functions with authentication
const getUsers = (request, response) => {
    pool.query('SELECT id, name, email FROM users ORDER BY id ASC', (error, results) => {
        if (error) {
            return response.status(500).json({ error: error.message })
        }
        response.status(200).json(results.rows)
    })
}

const getUserById = (request, response) => {
    const id = parseInt(request.params.id)
  
    pool.query('SELECT id, name, email FROM users WHERE id = $1', [id], (error, results) => {
        if (error) {
            return response.status(500).json({ error: error.message })
        }
        if (results.rows.length === 0) {
            return response.status(404).json({ error: 'User not found' })
        }
        response.status(200).json(results.rows[0])
    })
}

const createUser = (request, response) => {
    const { name, email } = request.body
  
    if (!name || !email) {
        return response.status(400).json({ error: 'Name and email are required' })
    }

    pool.query('INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id, name, email', [name, email], (error, results) => {
        if (error) {
            return response.status(500).json({ error: error.message })
        }
        response.status(201).json(results.rows[0])
    })
}

const updateUser = (request, response) => {
    const id = parseInt(request.params.id)
    const { name, email } = request.body
  
    if (!name || !email) {
        return response.status(400).json({ error: 'Name and email are required' })
    }

    pool.query(
        'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING id, name, email',
        [name, email, id],
        (error, results) => {
            if (error) {
                return response.status(500).json({ error: error.message })
            }
            if (results.rows.length === 0) {
                return response.status(404).json({ error: 'User not found' })
            }
            response.status(200).json(results.rows[0])
        }
    )
}

const deleteUser = (request, response) => {
    const id = parseInt(request.params.id)
  
    pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id], (error, results) => {
        if (error) {
            return response.status(500).json({ error: error.message })
        }
        if (results.rows.length === 0) {
            return response.status(404).json({ error: 'User not found' })
        }
        response.status(200).json({ message: `User deleted with ID: ${id}` })
    })
}

// Post-related functions
const getPosts = async (request, response) => {
    const { query } = request.query;
    const userId = request.user?.id || null;

    try {
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
        response.status(200).json(result.rows);
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
};

const getPostById = async (request, response) => {
    const id = parseInt(request.params.id);
    try {
        const result = await pool.query(`
            SELECT p.*, u.name as author_name,
                   (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
                   EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = $1) as is_liked
            FROM posts p
            JOIN users u ON p.user_id = u.id
            WHERE p.id = $2
        `, [request.user?.id || null, id]);
        
        if (result.rows.length === 0) {
            return response.status(404).json({ error: 'Post not found' });
        }
        response.status(200).json(result.rows[0]);
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
};

const createPost = async (request, response) => {
    const { title, content } = request.body;
    const userId = request.user.id;

    if (!title || !content) {
        return response.status(400).json({ error: 'Title and content are required' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO posts (title, content, user_id) VALUES ($1, $2, $3) RETURNING *',
            [title, content, userId]
        );
        response.status(201).json(result.rows[0]);
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
};

const updatePost = async (request, response) => {
    const id = parseInt(request.params.id);
    const { title, content } = request.body;
    const userId = request.user.id;

    if (!title || !content) {
        return response.status(400).json({ error: 'Title and content are required' });
    }

    try {
        // First check if the post exists and belongs to the user
        const checkResult = await pool.query(
            'SELECT user_id FROM posts WHERE id = $1',
            [id]
        );

        if (checkResult.rows.length === 0) {
            return response.status(404).json({ error: 'Post not found' });
        }

        if (checkResult.rows[0].user_id !== userId) {
            return response.status(403).json({ error: 'Not authorized to edit this post' });
        }

        const result = await pool.query(
            'UPDATE posts SET title = $1, content = $2 WHERE id = $3 RETURNING *',
            [title, content, id]
        );
        response.status(200).json(result.rows[0]);
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
};

const deletePost = async (request, response) => {
    const id = parseInt(request.params.id);
    const userId = request.user.id;

    try {
        // First check if the post exists and belongs to the user
        const checkResult = await pool.query(
            'SELECT user_id FROM posts WHERE id = $1',
            [id]
        );

        if (checkResult.rows.length === 0) {
            return response.status(404).json({ error: 'Post not found' });
        }

        if (checkResult.rows[0].user_id !== userId) {
            return response.status(403).json({ error: 'Not authorized to delete this post' });
        }

        await pool.query('DELETE FROM posts WHERE id = $1', [id]);
        response.status(200).json({ message: `Post deleted with ID: ${id}` });
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
};

const toggleLike = async (request, response) => {
    const postId = parseInt(request.params.id);
    const userId = request.user.id;

    try {
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
            response.status(200).json({ message: 'Post unliked' });
        } else {
            // Like
            await pool.query(
                'INSERT INTO likes (post_id, user_id) VALUES ($1, $2)',
                [postId, userId]
            );
            response.status(200).json({ message: 'Post liked' });
        }
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost,
    toggleLike,
}