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
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { 
    addItem, 
    openCart, 
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
  );
};

export default ProductPage;
