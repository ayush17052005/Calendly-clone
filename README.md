# Scaler Assignment - Scheduling Application

This repository contains the source code for the Appointment Scheduling Application.

## Project Structure

- **Backend**: Node.js/Express server with MySQL database.
- **Frontend**: React application built with Vite.

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MySQL
- npm

### Backend Setup
1. Navigate to `Backend/`
2. Create `.env` file (see `.env.example` if available)
3. Run `npm install`
4. Setup Database:
   ```bash
   mysql -u root -p < database/schema.sql
   mysql -u root -p < database/seed.sql
   ```
5. Start server: `npm run dev`

### Frontend Setup
1. Navigate to `Frontend/`
2. Run `npm install`
3. Start development server: `npm run dev`

## Features
- Dynamic Event Types (15min, 30min, etc)
- Availability Management
- Public Booking Page
- Appointment Scheduling with conflict detection
