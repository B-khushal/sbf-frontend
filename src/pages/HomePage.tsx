import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

const HomePage = () => {
  const [showTestingBanner, setShowTestingBanner] = useState(true);
  const [isTestingMode, setIsTestingMode] = useState(false);
  const [error, setError] = useState("");

  // Safely check environment variables
  useEffect(() => {
    try {
      setIsTestingMode(import.meta.env.DEV || import.meta.env.VITE_TESTING_MODE === 'true');
    } catch (error) {
      console.error('Error checking environment:', error);
      setIsTestingMode(true);
      setError("Environment check failed");
    }
  }, []);

  // If there's an error, show it
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50">
      {/* Testing Mode Banner */}
      {isTestingMode && showTestingBanner && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white shadow-lg"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 animate-pulse" />
                <div>
                  <p className="font-bold text-sm sm:text-base">
                    🚧 TESTING MODE - DEVELOPMENT ENVIRONMENT
                  </p>
                  <p className="text-xs sm:text-sm opacity-90">
                    This is a demo/testing environment. Orders and payments are not real.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTestingBanner(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors duration-200"
                aria-label="Close testing banner"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className={`${isTestingMode && showTestingBanner ? 'pt-20 sm:pt-16' : ''} transition-all duration-300`}>
        <main className="w-full">
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center p-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                🌸 Spring Blossoms Florist
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Simplified Homepage - Testing Mode
              </p>
              <p className="text-sm text-gray-500">
                If you can see this, the basic page structure is working.
              </p>
              <div className="mt-8">
                <a 
                  href="/shop" 
                  className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Go to Shop
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HomePage;
