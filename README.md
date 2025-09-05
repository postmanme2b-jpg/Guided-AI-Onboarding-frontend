# AI-Powered Challenge Onboarding Wizard - Frontend

This is the frontend for the AI-Powered Challenge Onboarding Wizard, a multi-step user interface built with Next.js and Tailwind CSS. This application provides a seamless, guided experience for users to define and launch innovation challenges, powered by an AI assistant.

## Features

- **Multi-Step Wizard UI**: A 9-step guided process for challenge creation.
- **Interactive AI Chat**: Real-time, conversational problem scoping in Step 1.
- **Dynamic AI Recommendations**: AI-powered suggestions for every step of the process.
- **Polished User Experience**: Includes a modern theme, skeleton loaders, and global notifications.
- **Responsive Design**: Fully usable on both desktop and mobile devices.

## Tech Stack

- **Framework**: Next.js
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Hooks (useState, useEffect)
- **Real-time Communication**: WebSocket API for chat functionality

## Getting Started

### 1. Prerequisites

- Node.js (v18 or later)
- npm, yarn, or pnpm
- The backend server must be running first.

### 2. Installation

Clone the repository and navigate into the frontend directory. Then, install the required dependencies:

```bash
npm install
```

### 3. Running the Development Server

Once the dependencies are installed and the backend server is running on `http://localhost:8000`, you can start the frontend development server:

```bash
npm run dev
```

Open `http://localhost:3000` with your browser to see the application.

## Connection to Backend

This frontend application is designed to communicate with its companion FastAPI backend. It uses:

- A WebSocket connection to `ws://localhost:8000/ws` for the real-time chat in Step 1.
- HTTP POST requests to various endpoints under `http://localhost:8000/api/` to fetch AI recommendations for all subsequent steps.

If you deploy the backend to a service like Render.com, you must update the URLs in the frontend code to point to your live backend URL.
