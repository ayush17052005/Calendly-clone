# Scaler Assignment Backend

This is the backend for the Scaler Assignment scheduling application.

## Setup

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Database Setup**
    Ensure you have MySQL installed and running. Create a database named `scaler_scheduler` (or update `.env`).

    Import the schema:
    ```bash
    mysql -u root -p scaler_scheduler < database/schema.sql
    ```

    (Optional) Import seed data:
    ```bash
    mysql -u root -p scaler_scheduler < database/seed.sql
    ```

3.  **Environment Variables**
    Copy `.env.example` to `.env` (if exists) or create valid `.env` file based on provided configuration.

4.  **Run Server**
    ```bash
    npm run dev
    ```

## Project Structure

-   `src/modules`: Contains business logic separated by domain (users, bookings, etc).
-   `src/config`: Database and environment configuration.
-   `src/middlewares`: Express middlewares.
-   `src/utils`: Helper functions.

## API Endpoints

-   `/api/users`
-   `/api/event-types`
-   `/api/availability`
-   `/api/bookings`
