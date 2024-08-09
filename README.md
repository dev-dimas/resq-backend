# Resq Backend

<p align="center">
<img src="https://github.com/dev-dimas/resq-backend/blob/master/assets/android-chrome-512x512.png?raw=true" width="200" height="200" style="padding-bottom: 15px" />
</p>

Welcome to the Resq Backend repository! This project serves as the backbone of the Resq service, a platform dedicated to connecting leftover food sellers with potential buyers. Leftover food refers to items that need to be sold quickly as they are nearing their expiration date. In a world where food waste is a pressing issue, Resq provides an innovative solution to reduce waste by making leftover food accessible to those nearby, while also benefiting both sellers and buyers.

## Table of Contents

1. [Introduction](#introduction)

2. [Features](#features)

3. [Tech Stack](#tech-stack)

4. [Installation](#installation)

5. [Configuration](#configuration)

6. [Usage](#usage)

7. [Haversine Formula](#haversine-formula)

8. [API Documentation](#api-documentation)

9. [Best Practices](#best-practices)

## Introduction

Resq is a service that bridges the gap between leftover food sellers and buyers. By utilizing geolocation and the Haversine formula, Resq allows users to find leftover food within a 25 km radius. This not only helps in reducing food waste but also offers a cost-effective option for consumers.

The backend of Resq is built with modern and robust technologies like NestJS, Prisma, and Bcrypt, ensuring a secure, scalable, and maintainable system.

## Features

- 🔐 User Authentication & Authorization: Secure user login with hashed passwords using Bcrypt.

- 🌏 Geolocation-Based Search: Calculate distances between sellers and buyers within a 25 km radius using the Haversine formula.

- ✅ Data Validation: Strong data validation with Zod to ensure API request integrity.

- 🖼️ Image Processing: Use Blurhash for efficient and aesthetic image previews.

- ⌚ Time Management: Handle date and time operations seamlessly with DayJS.

- 🧑‍💻 Code Quality: Ensure clean and consistent code with Prettier and ESLint.

- 🚀 Performance: Fast and optimized development build with SWC.

## Tech Stack

- NestJS: A progressive Node.js framework for building efficient, reliable, and scalable server-side applications.

- Prisma: Next-generation ORM for Node.js and TypeScript that makes database access easy with an auto-generated query builder.

- Bcrypt: Password hashing library that enhances security by storing hashed and salted passwords.

- Blurhash: Encodes images into a small, compact, and visually similar representation for efficient previews.

- DayJS: Lightweight JavaScript library for manipulating dates and times, with a modern API.

- Zod: TypeScript-first schema declaration and validation library.

- Prettier: Code formatter that enforces a consistent style by parsing your code and reprinting it.

- SWC: A super fast Rust-based platform to compile TypeScript / JavaScript.

## Installation

To get started with Resq Backend, follow these steps:

1. Clone the repository

```bash
git  clone  https://github.com/dev-dimas/resq-backend.git
```

```bash
cd  resq-backend
```

2. Install dependencies

```bash
npm  install
```

3. Set up your environment variables:

   Copy `.env.example` to `.env` and fill in your configuration details.

4. Run the database migrations :

```bash
npx prisma migrate dev
```

5. Start the development server:

```bash
npm run start:dev
```

## Configuration

The application requires several environment variables to function properly. Below is a list of the key variables you need to set up in your .env file:

- `DATABASE_URL`: The connection string for your database.
- `EXPO_ACCESS_TOKEN`: Your expo token for send mobile notification
- `ADMIN_PASSWORD`: The password for admin account
- `SELLER_DUMMY_PASSWORD`: The password for dummy seller
- `IS_NEED_UPDATE_SEED_DATA`: The boolean within string format, <i>`"true"`</i> or <i>`"false"`</i>, where determine the dummy data should be re-initiate on startup.

## Usage

After setting up the environment and starting the server, you can interact with the API via tools like Postman, through your frontend application, or directly through Swagger Documentation at root url, i.e `http://localhost:3000`.

## Haversine Formula

The Haversine formula is utilized in Resq to calculate the great-circle distance between two points on a sphere, given their longitudes and latitudes. This is particularly useful for determining the proximity of leftover food sellers to potential buyers within a defined radius (25 km). You can read more about haversine formula [here](https://en.wikipedia.org/wiki/Haversine_formula).

## API Documentation

The API documentation is crucial for understanding how to interact with Resq Backend. This project use Swagger to create API Documentation. After you start the server, you can find detailed API endpoints, request and response formats, and usage examples in the root url.

## Best Practices

- Security: Always ensure that sensitive data like passwords are hashed before storage.
- Validation: Use Zod to validate incoming data to prevent injection attacks and ensure data integrity.
- Code Style: Follow the guidelines enforced by Prettier and ESLint for consistent and clean code.
