ACES Techfest Hackathon v7.0
Team: AIUS Knights

# KindSpace

# Features

Comment on posts: Users can add comments (kindwords) to posts.

Replies: Users can reply to comments.

Toxicity Filtering: Toxic comments are blocked by Perspective API.

Read More: Long comments are truncated, with the option to expand and view more.

Delete Comments and Replies: Users can delete their own comments and replies.


# Tech Stack

Frontend: React, Typescript, Tailwind

Backend: Nodejs, Firebase Firestone

Bundler: Vite

Development Environment: Replit

Hate/Toxicity Filtering: Perspective API (Google Cloud)

Authentication: Firebase Authentication


# Setup Instructions

## Prerequisites

### Make sure to have the following installed:

Node.js (v14+ recommended)

npm

### Clone the Repository

### Install Dependencies

npm install

### Environment Variables

This application requires specific environment variables to function correctly. On Replit, Secrets Manager is used to securely store these variables. Locally, you can use a .env file.

### Required Variables

VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
PERSPECTIVE_KEY

# Setting Up Environment Variables

## On Replit

Open your project.

Click on the Secrets Manager (🔒 icon in the left sidebar).

Add the required environment variables mentioned above.

## Locally

## Create a .env file in the root directory.

Add the following content:

API_KEY=your_api_key_here

Install dotenv to load the .env file during development:

npm install dotenv

Import dotenv in your vite.config.ts or main.tsx file:

import 'dotenv/config';

## Development

## Running the Application

To start the development server:

npm run dev

The app will be available at http://localhost:5173.

## Building for Production

To create a production build:

npm run build

The build artifacts will be in the dist/ folder.

## Preview Production Build

To preview the production build locally:

npm run preview

## Deployment

Deploying on Replit

Push your repository to GitHub.

Import the repository to Replit.

Ensure environment variables are set in the Secrets Manager.

Start the application by running:

npm run dev

### Deploying to Other Platforms

For deployment to services like Netlify, Vercel, or AWS:

Create a production build using npm run build.

Deploy the dist/ folder to your hosting platform.

Ensure all environment variables are set in the hosting platform's settings.