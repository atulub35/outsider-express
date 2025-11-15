const postService = require('../services/postService');

const getPosts = async (req, res) => {
    const { query } = req.query;
    const userId = req.user?.id || null;

    try {
        const posts = await postService.getAllPosts(userId, query);
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to fetch posts',
            details: error.message 
        });
    }
};

const getPostById = async (req, res) => {
    const id = parseInt(req.params.id);
    const userId = req.user?.id || null;
    
    try {
        const post = await postService.getPostById(id, userId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createPost = async (req, res) => {
    const { title, content } = req.body;
    const userId = req.user.id;

    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
    }

    try {
        const post = await postService.createPost(title, content, userId);
        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updatePost = async (req, res) => {
    const id = parseInt(req.params.id);
    const { title, content } = req.body;
    const userId = req.user.id;

    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
    }

    try {
        const ownerId = await postService.getPostOwner(id);
        if (!ownerId) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (ownerId !== userId) {
            return res.status(403).json({ error: 'Not authorized to edit this post' });
        }

        const post = await postService.updatePost(id, title, content);
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deletePost = async (req, res) => {
    const id = parseInt(req.params.id);
    const userId = req.user.id;

    try {
        const ownerId = await postService.getPostOwner(id);
        if (!ownerId) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (ownerId !== userId) {
            return res.status(403).json({ error: 'Not authorized to delete this post' });
        }

        await postService.deletePost(id);
        res.status(200).json({ message: `Post deleted with ID: ${id}` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const toggleLike = async (req, res) => {
    const postId = parseInt(req.params.id);
    const userId = req.user.id;

    try {
        const result = await postService.toggleLike(postId, userId);
        const message = result.action === 'liked' ? 'Post liked' : 'Post unliked';
        res.status(200).json({ message });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost,
    toggleLike
};

