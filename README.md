# Observability Core - Frontend

This repository contains the source code for the frontend dashboard of the "Observability Core" project. It is a Single Page Application (SPA) built with React and TypeScript.

The application communicates with the [backend service's](https://github.com/auzienko/observability-core-backend) REST API to display monitoring data, visualize metrics, and trigger actions like load tests.

## Features

-   Real-time dashboard showing the status of all monitored services.
-   Detailed view for each service with historical performance charts.
-   Interactive interface for initiating and viewing load test results.
-   Secure login and role-based access control.
-   Modern, responsive UI built with Material-UI.

## Tech Stack

-   **Framework/Library:** React 18, TypeScript
-   **State Management:** Redux Toolkit
-   **Routing:** React Router
-   **HTTP Client:** Axios
-   **UI Components:** Material-UI (MUI)
-   **Charts:** Chart.js
-   **Build Tool:** Vite
-   **Deployment:** Docker + Nginx

## Running the Frontend (Development Mode)

This will run the frontend in development mode with hot-reloading. **Note:** This requires the backend service to be running separately and CORS to be correctly configured on the backend.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/auzienko/observability-core-frontend.git
    cd observability-core-frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173` (or another port specified by Vite).

## Running via Docker

To run the full system, including this frontend, please refer to the `docker-compose.yml` and instructions in the [observability-core-backend](https://github.com/auzienko/observability-core-backend) repository. The Compose file will pull the pre-built Docker image of this frontend from GHCR.

## CI/CD Pipeline

A GitHub Actions workflow is configured to automatically build the application, create a production-ready Docker image, and publish it to GitHub Container Registry at `ghcr.io/auzienko/observability-core-frontend:latest` on every push to the `main` branch.