# MongoDB Backend Setup

This project now uses MongoDB for data persistence instead of localStorage.

## 🚀 Quick Start

### For Local Development (MongoDB on your PC)
Your current setup is already working! Skip to step 4.

### For Deployment (MongoDB Atlas - Cloud)
See **DEPLOYMENT_GUIDE.md** in project root for complete Atlas setup.

---

## Setup Instructions

### 1. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# Windows (if MongoDB is installed as a service, it should auto-start)
# Or manually start it:
mongod
```

### 2. Install Backend Dependencies
```bash
cd server
npm install
```

### 3. Configure Database Connection

**For Local Development:**
`.env` file already configured with:
```env
MONGODB_URI=mongodb://localhost:27017/internhub
```

**For Cloud/Deployment:**
1. Create MongoDB Atlas account: https://www.mongodb.com/cloud/atlas/register
2. Create free cluster (M0 tier - 512MB)
3. Get connection string
4. Update `.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/internhub?retryWrites=true&w=majority
```

See **DEPLOYMENT_GUIDE.md** for detailed Atlas setup instructions.

### 4. Seed the Database
Populate the database with initial data (admin user, demo user, internships):
```bash
npm run seed
```

This will create:
- **Admin user:** username=`admin`, password=`suhani123`
- **Demo student:** username=`demo`, password=`demo123`
- **5 sample internships**

### 5. Start the Backend Server
```bash
npm run dev
```

Server will run on http://localhost:5000

### 6. Start the Frontend (in a new terminal)
```bash
# Go back to project root
cd ..
npm run dev
```

Frontend will run on http://localhost:5173

---

## API Endpoints

### Users
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID

### Internships
- `GET /api/internships` - Get all internships
- `GET /api/internships/:id` - Get internship by ID
- `POST /api/internships` - Create internship
- `PUT /api/internships/:id` - Update internship
- `DELETE /api/internships/:id` - Delete internship

### Applications
- `GET /api/applications?userId=:userId` - Get applications (all or by user)
- `GET /api/applications/:id` - Get application by ID
- `POST /api/applications` - Create application
- `PUT /api/applications/:id` - Update application
- `DELETE /api/applications/:id` - Delete application

### Tasks
- `GET /api/tasks?userId=:userId&applicationId=:appId` - Get tasks
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## Database Schema

### User
- username (unique)
- email (unique)
- password (hashed)
- fullName
- role (student/admin)

### Internship
- title
- company
- location
- duration
- stipend
- description
- requirements
- skills
- type
- deadline

### Application
- userId (ref: User)
- internshipId (ref: Internship)
- status (Pending/Under Review/Accepted/Rejected)
- appliedDate
- adminFeedback

### Task
- applicationId (ref: Application)
- userId (ref: User)
- title
- completed
- adminFeedback

## Environment Variables

The `.env` file in the `server` folder contains:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/internhub
NODE_ENV=development
```

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running: `mongod`
- Check if the default port 27017 is available
- Verify MONGODB_URI in `.env` file

### Port Already in Use
- Change PORT in `server/.env` if 5000 is occupied
- Change port in `vite.config.js` if 5173 is occupied

### CORS Issues
- Backend has CORS enabled for all origins
- Make sure both servers are running

## Next Steps

The frontend Context API (`src/context/AppContext.jsx`) needs to be updated to use the new API calls instead of localStorage. This will be done next.
