import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Import wake-up service to prevent backend from sleeping
import './services/wakeUpService'

// Import performance optimizations
import { initializePerformanceOptimizations } from './utils/performance'

// Initialize performance optimizations
initializePerformanceOptimizations();

createRoot(document.getElementById("root")!).render(<App />);
