import React, { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import SEOHead from "@/components/seo/SEOHead";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Home, ShoppingBag, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    console.warn(
      "404 Not Found: Access to non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <SEOHead
        title="404: Page Not Found | Spring Blossoms Florist"
        description="The flower bouquet, cake, or page you are looking for is unavailable or has been moved."
        noindex={true}
        noIndex={true}
      />

      <Navigation />

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="max-w-md w-full text-center space-y-6 bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-slate-200">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-50 text-rose-600 mb-2">
            <Search className="w-8 h-8" />
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">404</h1>
          <h2 className="text-xl font-bold text-slate-800">Page Not Found</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            The floral arrangement, occasion collection, or URL you requested does not exist or may have been updated.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="default" className="bg-rose-600 hover:bg-rose-700 text-white">
              <Link to="/shop" className="inline-flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                Browse Catalog
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/" className="inline-flex items-center gap-2">
                <Home className="w-4 h-4" />
                Return to Home
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
