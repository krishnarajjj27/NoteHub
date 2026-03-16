# Notes Sharing Platform using MERN Stack

A full-stack mini project where students can register, login, upload notes, search notes by title/subject, and download files.

## Features

- User registration and login with JWT authentication
- Upload notes with metadata and file attachment
- View all notes with uploader details
- Search notes by title or subject
- Secure file download endpoint
- Professional responsive UI with icon-based navigation

## Tech Stack

- MongoDB
- Express.js
- React.js
- Node.js
- Multer
- JWT

## Project Structure

- client: React frontend
- server: Express + MongoDB backend

## API Endpoints

### Authentication

- POST /api/register
- POST /api/login

### Notes

- POST /api/upload
- GET /api/notes
- GET /api/search?q=yourQuery
- GET /api/download/:id

## Local Setup

1. Install all dependencies:

```bash
npm run install-all
```

2. Configure backend env:

- Copy `server/.env.example` to `server/.env`
- Set values:
  - `MONGO_URI=mongodb://localhost:27017/notes_sharing_platform`
  - `JWT_SECRET=your_strong_secret`
  - `PORT=5000`
  - `CLIENT_URL=http://localhost:3000`

3. Configure frontend env:

- Copy `client/.env.example` to `client/.env`
- Set value:
  - `REACT_APP_API_BASE_URL=http://localhost:5000/api`

4. Run the project:

```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Database Collections

### Users

- _id
- name
- email
- password
- createdAt

### Notes

- _id
- title
- subject
- description
- fileUrl
- uploadedBy
- createdAt

## Viva Summary

The Notes Sharing Platform is a MERN stack web application that enables students to register, login, upload notes in document format, search notes by subject or title, and download shared study materials. React handles the user interface, Node.js and Express provide the backend APIs, and MongoDB stores user and note metadata.
