# PharmaGuard Backend API

This is the backend server for the PharmaGuard dual-website system.

## Features

- RESTful API with Express.js
- WebSocket real-time communication
- PostgreSQL database with Prisma ORM
- JWT authentication with role-based access
- File upload handling for VCF files
- Comprehensive logging and error handling
- Health monitoring endpoints

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/pharmaguard
JWT_SECRET=your-super-secret-key
```

4. Initialize and run database migrations:
```bash
npx prisma migrate dev
```

5. Start the development server:
```bash
npm run dev
```

## Scripts

- `npm run dev` - Start development server with auto-reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run test` - Run tests (if any)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user profile

### Analysis
- `POST /api/analysis/upload` - Upload VCF file for analysis
- `GET /api/analysis/:id` - Get analysis results
- `GET /api/analysis` - List all analyses (patient/clinician filtered)
- `DELETE /api/analysis/:id` - Delete analysis

### Patients
- `GET /api/patients` - List all patients (clinician only)
- `GET /api/patients/:id` - Get patient details
- `GET /api/patients/:id/analyses` - Get patient analyses

### Reports
- `GET /api/reports/:id` - Get detailed report
- `POST /api/reports/generate` - Generate new report

### Health
- `GET /health` - Health check endpoint

## WebSocket Events

- `analysis:created` - New analysis initiated
- `analysis:completed` - Analysis completed with results
- `analysis:error` - Analysis failed
- `user:connected` - User connected to WebSocket
- `activity:log` - New activity log entry

## Folder Structure

```
src/
├── api/          # API route handlers
├── auth/         # Authentication system
├── database/     # Database connection and models
├── ml/           # ML pipeline modules
├── utils/        # Utility functions
├── websocket/    # WebSocket configuration
└── server.ts     # Main server file
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | HTTP server port | 3000 |
| WEBSOCKET_PORT | WebSocket server port | 3001 |
| DATABASE_URL | PostgreSQL connection string | |
| JWT_SECRET | JWT signing secret | |
| JWT_EXPIRES_IN | Access token expiry | 24h |
| REFRESH_TOKEN_SECRET | Refresh token secret | |
| REFRESH_TOKEN_EXPIRES_IN | Refresh token expiry | 7d |
| PATIENT_PORTAL_URL | Patient portal frontend URL | |
| HOSPITAL_PORTAL_URL | Hospital portal frontend URL | |
| UPLOAD_DIR | File upload directory | ./uploads |
| LOG_LEVEL | Logging level | info |
| RATE_LIMIT_WINDOW | Rate limiting window (minutes) | 15 |
| RATE_LIMIT_MAX | Max requests per window | 100 |