const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const app = express();
const port = process.env.PORT || 3000;

// Import routes
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/users');
const metricsRoutes = require('./routes/metrics');

// Import middleware
const { trackRequest } = require('./middleware/metrics');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());

// Request logging and metrics tracking middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    trackRequest(req, res, next);
});

// Routes
app.get('/', (request, response) => {
    response.json({ info: 'Node.js, Express, and Postgres API' });
});

// API routes
app.use('/auth', authRoutes);
app.use('/posts', postRoutes);
app.use('/users', userRoutes);
app.use('/api/metrics', metricsRoutes);

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
