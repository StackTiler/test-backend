# Codebase Architecture

This document provides a detailed overview of the codebase architecture, including the project structure, key components, and request flow.

## Project Structure

The codebase is organized into the following directories:

- **`src`**: Contains the core application logic.
  - **`config`**: Manages environment variables and database connections.
  - **`controller`**: Handles incoming requests and sends responses.
  - **`helpers`**: Provides helper functions and utilities.
  - **`interfaces`**: Defines TypeScript interfaces for data structures.
  - **`middlewares`**: Contains middleware for request processing.
  - **`model`**: Defines the data models for the application.
  - **`repositories`**: Handles data access and manipulation.
  - **`routes`**: Defines the application's endpoints.
  - **`schema`**: Defines the validation schemas for incoming data.
  - **`services`**: Contains the business logic of the application.
  - **`utils`**: Provides utility functions.
  - **`app.ts`**: The main application file.
  - **`server.ts`**: The entry point of the application.
- **`infra`**: Contains infrastructure-related files.
- **`logs`**: Stores application logs.
- **`uploads`**: Stores uploaded files.

## Key Components

### `server.ts`

The `server.ts` file is the entry point of the application. It creates an instance of the `KumudMangement` class from `app.ts` and starts the server.

### `app.ts`

The `app.ts` file is the core of the application. It initializes the Express server, sets up middleware, and connects to the database. The `KumudMangement` class is responsible for the following:

- **Middleware**: Configures middleware for security, CORS, and body parsing.
- **Static files**: Serves static files from the `uploads` directory.
- **Database**: Connects to the MongoDB database using the `MongooseConnection` class.
- **Routes**: Initializes the application's routes using the `RouteManager` class.

### `config`

The `config` directory contains the following files:

- **`env.config.ts`**: Manages environment variables using `zod` and `dotenv`.
- **`database.connection.ts`**: Manages the database connection using a singleton pattern.

### `routes`

The `routes` directory defines the application's endpoints. The `route-manager.route.ts` file is responsible for initializing all routes. The routes are organized into subdirectories based on their version.

## Request Flow

1. A request is sent to the server.
2. The request is processed by the middleware in `app.ts`.
3. The request is routed to the appropriate controller by the `RouteManager`.
4. The controller processes the request and sends a response.
5. The response is sent back to the client.
