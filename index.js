const cors = require('cors');
const express = require('express')
const bodyParser = require('body-parser')
const passport = require('passport')
const app = express()
const port = process.env.PORT || 3000
const db = require('./queries')
const { authenticate, authorize } = require('./middleware/auth')

// Store request timestamps for RPS calculation
let requestTimestamps = [];
const MAX_TIMESTAMPS = 1000; // Keep last 1000 requests

// Middleware
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(passport.initialize())

// Request logging and metrics tracking middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`)
    
    // Track request timestamp for metrics
    const now = Date.now();
    requestTimestamps.push(now);
    
    // Remove timestamps older than 1 second
    requestTimestamps = requestTimestamps.filter(timestamp => 
        now - timestamp <= 1000
    );
    
    // Keep only the last MAX_TIMESTAMPS
    if (requestTimestamps.length > MAX_TIMESTAMPS) {
        requestTimestamps = requestTimestamps.slice(-MAX_TIMESTAMPS);
    }
    
    next();
})

// Routes
app.get('/', (request, response) => {
    response.json({ info: 'Node.js, Express, and Postgres API' })
})

// Metrics endpoint
app.get('/api/metrics', db.getMetrics)

// Public routes
app.post('/auth/register', db.registerUser)
app.post('/auth/login', db.loginUser)

// Post routes
app.get('/posts', authenticate, db.getPosts)
app.get('/posts/:id', authenticate, db.getPostById)
app.post('/posts', authenticate, db.createPost)
app.put('/posts/:id', authenticate, db.updatePost)
app.delete('/posts/:id', authenticate, db.deletePost)
app.post('/posts/:id/like', authenticate, db.toggleLike)

// Protected routes
app.get('/users', authenticate, db.getUsers)
app.get('/users/:id', authenticate, db.getUserById)
app.post('/users', authenticate, authorize(['admin']), db.createUser)
app.put('/users/:id', authenticate, authorize(['admin']), db.updateUser)
app.delete('/users/:id', authenticate, authorize(['admin']), db.deleteUser)

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({ error: 'Something went wrong!' })
})

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' })
})

app.listen(port, () => {
    console.log(`App running on port ${port}.`)
})

// app.get('/', (req, res) => {
//       res.send('Hello from our server!')
// })
