# MongoDB Atlas Setup for Deployment

Follow these steps to connect your app to MongoDB Atlas (cloud database) for deployment:

## Step 1: Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up for a free account (Free tier gives you 512MB storage)
3. Verify your email

## Step 2: Create a Cluster

1. After login, click **"Build a Database"**
2. Choose **FREE** tier (M0 Sandbox)
3. Select a cloud provider (AWS, Google Cloud, or Azure)
4. Choose a region closest to your users (e.g., Mumbai for India)
5. Click **"Create Cluster"** (takes 1-3 minutes)

## Step 3: Create Database User

1. Go to **"Database Access"** in left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Set username (e.g., `internhub_admin`)
5. Set a strong password (save it!)
6. Set privileges to **"Read and write to any database"**
7. Click **"Add User"**

## Step 4: Whitelist IP Address

1. Go to **"Network Access"** in left sidebar
2. Click **"Add IP Address"**
3. For development: Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - Note: For production, add specific IPs only
4. Click **"Confirm"**

## Step 5: Get Connection String

1. Go to **"Database"** in left sidebar
2. Click **"Connect"** button on your cluster
3. Choose **"Connect your application"**
4. Select **Driver: Node.js** and **Version: 5.5 or later**
5. Copy the connection string, it looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## Step 6: Update Your .env File

1. Open `server/.env`
2. Replace the `MONGODB_URI` with your Atlas connection string
3. Replace `<username>` with your database username
4. Replace `<password>` with your database password
5. Add `/internhub` before the `?` to specify database name

Example:
```env
MONGODB_URI=mongodb+srv://internhub_admin:YourPassword123@cluster0.abc123.mongodb.net/internhub?retryWrites=true&w=majority
```

## Step 7: Test the Connection

```bash
cd server
npm run seed
```

If successful, you'll see:
```
✅ Connected to MongoDB
🗑️  Cleared existing data
✅ Created admin user
✅ Created demo student
✅ Inserted internships data
```

## Step 8: Deploy Your Backend

### Option A: Deploy to Render.com (Recommended - Free)

1. Go to https://render.com/
2. Sign up with GitHub
3. Click **"New +"** → **"Web Service"**
4. Connect your GitHub repository
5. Configure:
   - **Name:** internhub-api
   - **Environment:** Node
   - **Build Command:** `cd server && npm install`
   - **Start Command:** `cd server && npm start`
   - **Add Environment Variable:** 
     - Key: `MONGODB_URI`
     - Value: Your Atlas connection string
6. Click **"Create Web Service"**

### Option B: Deploy to Railway.app (Free)

1. Go to https://railway.app/
2. Sign up with GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select your repository
5. Add environment variables:
   - `MONGODB_URI`: Your Atlas connection string
   - `PORT`: 5000
6. Deploy

### Option C: Deploy to Vercel (For Serverless)

1. Install Vercel CLI: `npm install -g vercel`
2. In project root, create `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server/server.js"
    }
  ],
  "env": {
    "MONGODB_URI": "@mongodb-uri"
  }
}
```
3. Run: `vercel` and follow prompts
4. Add MongoDB URI as secret: `vercel env add MONGODB_URI`

## Step 9: Update Frontend API URL

After deployment, update `src/api/index.js`:

```javascript
const API_URL = import.meta.env.PROD 
  ? 'https://your-backend-url.com/api'  // Your deployed backend URL
  : 'http://localhost:5000/api';         // Local development
```

## Step 10: Deploy Frontend

### Deploy to Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify
1. Go to https://netlify.com/
2. Drag and drop your `dist` folder (after `npm run build`)
3. Or connect GitHub repository

## Troubleshooting

### Connection Error
- Check if IP is whitelisted (0.0.0.0/0 for development)
- Verify username and password in connection string
- Ensure password doesn't contain special characters (URL encode if needed)

### Authentication Failed
- Double-check database user credentials
- Make sure user has correct privileges

### Network Timeout
- Check if MongoDB Atlas cluster is active
- Verify network access settings

## Security Best Practices

1. **Never commit .env file** - Add to .gitignore
2. **Use environment variables** for production
3. **Restrict IP addresses** in production (not 0.0.0.0/0)
4. **Use strong passwords** for database users
5. **Rotate credentials** regularly

## Free Tier Limits

MongoDB Atlas Free Tier (M0):
- 512 MB storage
- Shared RAM
- No backups
- Sufficient for small projects and demos

If you need more, upgrade to paid tiers starting at $9/month.

---

**Need Help?**
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com/
- Render Docs: https://render.com/docs
- Railway Docs: https://docs.railway.app/
