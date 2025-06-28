import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, X, ArrowLeft } from 'lucide-react';
import ProductDetail from '@/components/ProductDetail';
import ProductGrid from '@/components/ProductGrid';
import useCart from '@/hooks/use-cart';
import api from '@/services/api';
import productService, { ProductData } from '@/services/productService';
import { Button } from '@/components/ui/button';

type Product = ProductData & {
  _id: string;
};

const ProductPage = () => {
  const { id, productId } = useParams<{ id?: string; productId?: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { 
    addItem, 
    openCart, 
  } = useCart();
  
  // Testing mode banner state
  const [showTestingBanner, setShowTestingBanner] = useState(true);
  
  // Check if we're in development/testing mode
  const isTestingMode = import.meta.env.DEV || import.meta.env.VITE_TESTING_MODE === 'true';

  // Use either id or productId parameter
  const actualId = id || productId;

  const fetchProduct = async () => {
    try {
      setLoading(true);
      // Fetch product using productService (includes care instructions)
      const productData = await productService.getProductById(actualId!);
      setProduct(productData);
      console.log("ProductPage - Product with care instructions:", productData);

      // Fetch related products
      const relatedResponse = await api.get(`/products?category=${productData.category}`);
      setRelatedProducts(
        relatedResponse.data.products
          .filter((p: Product) => p._id !== actualId)
          .slice(0, 4)
      );
    } catch (error) {
      console.error("Error fetching product:", error);
      // Redirect to shop instead of showing not found
      navigate('/shop', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If no valid ID is provided, redirect to shop immediately
    if (!actualId || actualId.trim() === '') {
      navigate('/shop', { replace: true });
      return;
    }

    fetchProduct();
    window.scrollTo(0, 0);
  }, [actualId, navigate]);

  const handleAddToCart = (item: {
    id: string;
    productId: string;
    title: string;
    price: number;
    originalPrice: number;
    image: string;
    quantity: number;
  }) => {
    try {
      const success = addItem({
        id: item.id,
        productId: item.productId,
        title: item.title,
        price: item.price,
        originalPrice: item.originalPrice,
        image: item.image,
      }, item.quantity);
      
      if (success) {
        setTimeout(() => openCart(), 300);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // If no product and not loading, redirect to shop (this should rarely happen due to the redirect in useEffect)
  if (!product) {
    navigate('/shop', { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Testing Mode Banner for Product/Review Testing */}
      {isTestingMode && showTestingBanner && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 animate-pulse" />
                <div>
                  <p className="font-bold text-xs sm:text-sm">
                    🧪 REVIEW TESTING MODE
                  </p>
                  <p className="text-xs opacity-90">
                    Review submission is in testing. Debug info available in console.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTestingBanner(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors duration-200"
                aria-label="Close testing banner"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className={`${isTestingMode && showTestingBanner ? 'pt-16 sm:pt-14' : ''} transition-all duration-300`}>
        <div className="min-h-screen flex flex-col">
          
          <main className="flex-1">
            <ProductDetail product={product} onAddToCart={handleAddToCart} onReviewSubmit={fetchProduct} />
            
            {relatedProducts.length > 0 && (
              <ProductGrid 
                products={relatedProducts} 
                title="You Might Also Like"
                subtitle="Similar products you may be interested in"
                className="bg-muted/30"
              />
            )}
          </main>
          
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
