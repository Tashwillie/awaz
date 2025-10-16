# Local Development Setup

This guide explains how to run the Funnder application locally with the backend and frontend on separate ports.

## Port Configuration

- **Backend (API)**: `localhost:3001`
- **Frontend (Next.js App)**: `localhost:3000`

## Environment Variables

### Frontend (.env.local)
Create a `.env.local` file in the `frontend/` directory with:

```env
# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here
```

### Backend (.env)
Ensure your backend `.env` file has the necessary database and API configurations.

## Running the Application

### Option 1: Run Both Services Separately

**Terminal 1 - Backend:**
```bash
# From project root
npm run dev
# Backend will run on http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
# From frontend directory
cd frontend
npm run dev
# Frontend will run on http://localhost:3000
```

### Option 2: Using Package Manager Scripts

**From project root:**
```bash
# Run backend
npm run dev

# In another terminal, run frontend
cd frontend && npm run dev
```

## API Endpoints

The frontend will make API calls to:
- `http://localhost:3001/api/health`
- `http://localhost:3001/api/places/search`
- `http://localhost:3001/api/demo/*`

## Troubleshooting

### Port Conflicts
If ports 3000 or 3001 are already in use:
1. Kill the processes using those ports
2. Or modify the port numbers in the package.json files

### CORS Issues
If you encounter CORS issues, ensure the backend is properly configured to allow requests from `http://localhost:3000`.

### Environment Variables
Make sure to create the `.env.local` file in the frontend directory with the correct API URL pointing to the backend.

## Development Workflow

1. Start the backend first: `npm run dev` (runs on port 3001)
2. Start the frontend: `cd frontend && npm run dev` (runs on port 3000)
3. Open your browser to `http://localhost:3000`
4. The frontend will automatically connect to the backend API on port 3001
