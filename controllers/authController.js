const userService = require('../services/userService');
const { generateToken } = require('../config/auth');

const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    try {
        const user = await userService.createUser(name, email, password);
        const token = generateToken(user);
        res.status(201).json({ user, token });
    } catch (error) {
        if (error.code === '23505') { // Unique violation
            return res.status(400).json({ error: 'Email or name already exists' });
        }
        res.status(500).json({ error: error.message });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const user = await userService.findUserByEmail(email);

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValidPassword = await userService.verifyPassword(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const token = generateToken(user);
        res.json({ 
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                created_at: user.created_at
            },
            token 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    register,
    login
};

