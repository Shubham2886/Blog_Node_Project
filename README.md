Blog Project
This is a blog project built using Node.js and Express.js.

Table of Contents
Introduction
Features
Installation
Usage
API Documentation
Contributing
License
Introduction
This project aims to create a simple blogging platform where users can create, read, update, and delete blogs. It also includes features like commenting on blogs, liking, sharing, and bookmarking them.

Features
User Authentication: Users can register, login, and logout.
Blog Management: Users can create, update, and delete their blogs.
Comments: Users can add, update, and delete comments on blogs.
Likes: Users can like blogs.
Sharing: Users can share blogs.
Bookmarking: Users can bookmark blogs.
User Profile: Users have their profiles showing their activity history.
JWT Authentication: JSON Web Tokens (JWT) are used for user authentication.
Middleware: Middleware functions are implemented for user authentication and authorization.
Error Handling: Error handling is implemented for better user experience.
Installation
Clone the repository:
bash
Copy code
git clone https://github.com/your-username/blog-project.git
Install dependencies:
bash
Copy code
cd blog-project
npm install
Set up environment variables:

Create a .env file in the root directory
Define the required environment variables (e.g., database connection string, JWT secret, SMTP credentials)
Start the server:

sql
Copy code
npm start
Usage
Visit http://localhost:3000 in your web browser to access the blog application.
Register an account or log in if you already have an account.
Create, view, update, or delete your blogs.
Comment on blogs, like, share, or bookmark them.
Explore other users' profiles and their activity history.
API Documentation
Interactions API
Like a blog: POST /blogs/:id/like
Share a blog: POST /blogs/:id/share
Bookmark a blog: POST /blogs/:id/bookmark
Get likes for a blog: GET /blogs/:id/like
Comments API
Add a comment to a blog: POST /blogs/:id/comments
Update a comment on a blog: PATCH /blogs/:id/comments/:comment_id
Delete a comment from a blog: DELETE /blogs/:id/comments/:comment_id
Get all comments for a particular blog: GET /blogs/:blogId/comments
Blogs API
Create a blog: POST /createBlog
Update a blog: PATCH /updateBlog/:id
Delete a blog: DELETE /deleteBlog/:id
Get all blogs: GET /getAllBlogs
Get a blog by ID: GET /getBlogById/:id
Get blogs created by a user: GET /getUserBlog
User Authentication API
Register a user: POST /register
Login: POST /login
Contributing
Contributions are welcome! If you find any bugs or want to suggest new features, please open an issue or submit a pull request.

License
This project is licensed under the MIT License.
