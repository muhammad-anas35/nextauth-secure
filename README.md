# SecureAuth - Modern Authentication System

A secure, modern authentication system built with React, TypeScript, and Tailwind CSS.

## Features

- 🔐 Secure JWT-based authentication
- 🎨 Modern, responsive UI with dark mode support
- ⚡ Built with Vite for fast development
- 🧩 Component library with shadcn/ui
- 📱 Mobile-friendly design

## Tech Stack

- **Frontend**: React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Build Tool**: Vite
- **Backend**: Supabase

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:8080`

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Project Structure

```
├── public/          # Static assets
├── src/
│   ├── components/  # Reusable UI components
│   ├── pages/       # Page components
│   ├── hooks/       # Custom React hooks
│   ├── lib/         # Utility functions
│   └── main.tsx     # Application entry point
├── supabase/        # Supabase functions
└── index.html       # HTML template
```

## Deployment

Build the project and deploy to your preferred hosting:

```bash
npm run build
```

The `dist` folder will contain your production-ready files.

## License

MIT License
