# Local Events Backend Server

A robust Express.js backend server for managing local events, built with Node.js, Express, and PostgreSQL. This server provides a RESTful API with authentication and authorization features.

## Features

- 🔐 Authentication using JWT and Passport.js
- 👥 User management with role-based access control
- 📝 Post/Event management system
- ❤️ Like functionality for posts
- 🔍 Search functionality for posts
- 🛡️ Secure password handling with bcrypt
- 🌐 CORS enabled for cross-origin requests

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT, Passport.js
- **Security**: bcryptjs
- **CORS**: cors middleware

## Project Structure

```
server/
├── config/         # Configuration files
├── db/            # Database related files
├── middleware/    # Custom middleware
├── public/        # Static files
├── src/           # Source code
├── index.js       # Main application file
└── queries.js     # Database queries
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user

### Posts
- `GET /posts` - Get all posts
- `GET /posts/search` - Search posts
- `GET /posts/:id` - Get post by ID
- `POST /posts` - Create a new post
- `PUT /posts/:id` - Update a post
- `DELETE /posts/:id` - Delete a post
- `POST /posts/:id/like` - Toggle like on a post

### Users (Protected)
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create a new user (admin only)
- `PUT /users/:id` - Update a user (admin only)
- `DELETE /users/:id` - Delete a user (admin only)

## Getting Started

### Prerequisites
- Node.js
- PostgreSQL
- Yarn or npm

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd server
```

2. Install dependencies
```bash
yarn install
# or
npm install
```

3. Set up environment variables
Create a `.env` file with the following variables:
```
PORT=3000
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
```

4. Start the server
```bash
yarn start
# or
npm start
```

## Security Features

- JWT-based authentication
- Role-based access control
- Password hashing with bcrypt
- CORS protection
- Request logging
- Error handling middleware

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

Atul Ubarhande
