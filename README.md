# SBF Florist - Frontend

A modern, responsive e-commerce platform for SBF Florist, built with React, TypeScript, and Tailwind CSS.

## 🚀 Live Demo

- **Frontend**: https://www.sbflorist.in
- **Backend API**: https://sbf-backend.onrender.com

## 📦 Repositories

- **Frontend**: [https://github.com/B-khushal/sbf-frontend](https://github.com/B-khushal/sbf-frontend)
- **Backend**: [https://github.com/B-khushal/sbf-backend](https://github.com/B-khushal/sbf-backend)

## 🛠️ Development Setup

### Prerequisites

- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Getting Started

```sh
# Step 1: Clone the repository
git clone https://github.com/B-khushal/sbf-frontend.git

# Step 2: Navigate to the project directory
cd sbf-frontend

# Step 3: Install dependencies
npm install

# Step 4: Create environment file
cp .env.example .env

# Step 5: Configure environment variables (see Environment Configuration below)

# Step 6: Start the development server
npm run dev
```

## 🌍 Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# API Configuration
VITE_API_URL=https://sbf-backend.onrender.com/api

# Upload/Image Configuration  
VITE_UPLOADS_URL=https://sbf-backend.onrender.com/uploads

# App Configuration
VITE_APP_NAME=SBF Florist
VITE_APP_VERSION=1.0.0
```

### Local Development
For local development, use:
```env
VITE_API_URL=http://localhost:5000/api
VITE_UPLOADS_URL=http://localhost:5000/uploads
```

## 🛠️ Tech Stack

This project is built with modern web technologies:

- **⚡ Vite** - Fast build tool and dev server
- **🔷 TypeScript** - Type safety and better developer experience
- **⚛️ React** - UI library with hooks and modern patterns
- **🎨 Tailwind CSS** - Utility-first CSS framework
- **🧩 shadcn-ui** - High-quality accessible components
- **📱 Responsive Design** - Mobile-first approach
- **🔒 Authentication** - JWT-based user authentication
- **🛒 E-commerce Features** - Cart, checkout, orders, admin panel

## 🚀 Deployment

### Frontend (Render Static Site)
1. Connect your GitHub repository to Render
2. Set the build command: `npm run build`
3. Set the publish directory: `dist`
4. Add environment variables in Render dashboard
5. Deploy!

### Environment Variables for Production
```env
VITE_API_URL=https://sbf-backend.onrender.com/api
VITE_UPLOADS_URL=https://sbf-backend.onrender.com/uploads
```

## 📁 Project Structure

```
src/
├── components/        # Reusable UI components
├── pages/            # Page components and routes
├── contexts/         # React context providers
├── hooks/            # Custom React hooks
├── services/         # API services and external integrations
├── utils/            # Utility functions
├── types/            # TypeScript type definitions
└── styles/           # Global styles and Tailwind config
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Related Links

- **Backend Repository**: [https://github.com/B-khushal/sbf-backend](https://github.com/B-khushal/sbf-backend)
- **Live Website**: [https://www.sbflorist.in](https://www.sbflorist.in)
- **API Documentation**: [https://sbf-backend.onrender.com/health](https://sbf-backend.onrender.com/health)
