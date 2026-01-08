# Scheduling Application (Calendly Clone)

A full-stack scheduling application that allows users to create event types, set availability, and let others book meetings with them. Built with React, Node.js, and MySQL.

## 🚀 Tech Stack

### Frontend
- **Framework**: React (Vite)
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM (v7)
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database Driver**: mysql2 (Promise-based)
- **Utilities**: dotenv, cors

### Database
- **System**: MySQL
- **Schema**: Relational (Schedules, EventTypes, Bookings, Availability)

## 📂 Project Structure

```
/
├── Backend/              # Express Server
│   ├── database/         # SQL Schema and Seeds
│   ├── src/
│   │   ├── config/       # DB and Env Config
│   │   ├── modules/      # Feature-based architecture (Bookings, EventTypes)
│   │   ├── routes.js     # Main Router
│   │   └── server.js     # Entry Point
│   └── package.json
│
└── Frontend/             # React Application
    ├── src/
    │   ├── components/   # UI Components
    │   ├── pages/        # Route Pages
    │   ├── services/     # API Service Layer
    │   └── App.jsx
    └── package.json
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v18+)
- MySQL Server (v8.0+)
- npm

### 1. Database Setup
1. Log in to your MySQL server.
2. Create a new database (e.g., `scaler_scheduler`).
3. Run the schema script to create tables:
   ```bash
   mysql -u <user> -p scaler_scheduler < Backend/database/schema.sql
   ```
4. (Optional) Populate with seed data:
   ```bash
   mysql -u <user> -p scaler_scheduler < Backend/database/seed.sql
   ```
   *Note: This seed file contains default schedules and event types.*

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `Backend` root with your database credentials:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=scaler_scheduler
   DB_PORT=3306
   ```
4. Start the server:
   ```bash
   npm run dev
   ```
   *The server will run on http://localhost:3000*

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *The application will be available at http://localhost:5173*

## 💡 Key Features
- **Event Type Management**: Create unique booking links with custom durations, descriptions, and locations.
- **Availability Management**: Set weekly availability slots and specific date overrides.
- **Public Booking Page**: External users can select slots based on real-time availability.
- **Validations**: Automatically prevents double bookings and conflicting slots.
- **Dashboard**: View upcoming, upcoming, and past meetings.
- **Cancel/Delete**: Functionality to manage scheduled bookings.

## 📝 Assumptions & Design Decisions
- **Timezones**: Dates are stored in MySQL as `DATETIME` (UTC face-value). The frontend handles local time display. Some logic explicitly avoids timezone shifting to ensure "9:00 AM" means "9:00 AM" regardless of where the user is (simplified "floating time" model for this assignment).
- **Authentication**: Currently, the system assumes a single "Host" user.
- **Architecture**: The backend uses a feature-based folder structure (Modules pattern) for better scalability.

## 📄 License
ISC
