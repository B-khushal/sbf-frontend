import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductDetail from '@/components/ProductDetail';
import ProductGrid from '@/components/ProductGrid';
import useCart from '@/hooks/use-cart';
import api from '@/services/api';
import productService, { ProductData } from '@/services/productService';

type Product = ProductData & {
  _id: string;
};

const ProductPage = () => {
  const { id, productId } = useParams<{ id?: string; productId?: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { 
    addToCart, 
  } = useCart();
  
  // Use either id or productId parameter
  const actualId = id || productId;

  const fetchProduct = async () => {
    try {
      setLoading(true);
      // Fetch product using productService (includes care instructions)
      const productData = await productService.getProductById(actualId!);
      setProduct(productData);
      console.log("ProductPage - Product with care instructions:", productData);
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
    // Scroll to top with smooth behavior when product changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [actualId, navigate]);

  const handleAddToCart = (item: {
    id: string;
    productId: string;
    title: string;
    price: number;
    originalPrice: number;
    image: string;
    quantity: number;
    selectedVariant?: {
      label: string;
      price: number;
      stock: number;
    };
    customizations?: any;
  }) => {
    try {
      const cartItem = {
        _id: item.id,
        id: item.id,
        productId: item.productId,
        title: item.title,
        price: item.price,
        originalPrice: item.originalPrice,
        image: item.image,
        quantity: item.quantity,
        category: product?.category || '',
        discount: product?.discount || 0,
        images: product?.images || [item.image],
        description: product?.description || '',
        details: product?.details || [],
        careInstructions: product?.careInstructions || [],
        isNewArrival: product?.isNewArrival || false,
        isFeatured: product?.isFeatured || false,
        selectedVariant: item.selectedVariant,
        customizations: item.customizations
      };
      
      addToCart(cartItem);
      
      // Redirect to cart page after successful addition
      setTimeout(() => {
        navigate('/cart');
      }, 1000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  // If no product and not loading, redirect to shop (this should rarely happen due to the redirect in useEffect)
  if (!product) {
    navigate('/shop', { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <ProductDetail product={product} onAddToCart={handleAddToCart} onReviewSubmit={fetchProduct} />
      </main>
    </div>
  );
};

export default ProductPage;
