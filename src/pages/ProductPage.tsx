import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import ProductDetail from '@/components/ProductDetail';
import ProductGrid from '@/components/ProductGrid';
import Footer from '@/components/Footer';
import Cart from '@/components/Cart';
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
    items, 
    itemCount, 
    isCartOpen, 
    addItem, 
    openCart, 
    closeCart, 
    updateItemQuantity, 
    removeItem 
  } = useCart();
  
  // Use either id or productId parameter
  const actualId = id || productId;

  useEffect(() => {
    if (!actualId) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        // Fetch product using productService (includes care instructions)
        const productData = await productService.getProductById(actualId);
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
        navigate('/not-found');
      } finally {
        setLoading(false);
      }
    };

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
    addItem(item);
    setTimeout(() => openCart(), 300);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center">Product not found</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation cartItemCount={itemCount} />
      
      <main className="flex-1">
        <ProductDetail product={product} onAddToCart={handleAddToCart} />
        
        {relatedProducts.length > 0 && (
          <ProductGrid 
            products={relatedProducts} 
            title="You Might Also Like"
            subtitle="Similar products you may be interested in"
            className="bg-muted/30"
          />
        )}
      </main>
      
      <Footer />
      
      <Cart 
        items={items} 
        isOpen={isCartOpen} 
        onClose={closeCart}
        onUpdateQuantity={updateItemQuantity}
        onRemoveItem={removeItem}
      />
    </div>
  );
};

export default ProductPage;
