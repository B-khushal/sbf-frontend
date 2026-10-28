import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductDetail from '@/components/ProductDetail';
import CakeProductDetail from '@/components/cakes/CakeProductDetail';
import ComboProductDetail from '@/components/combos/ComboProductDetail';
import { isCakeProduct } from '@/utils/cakeHelpers';
import { isComboProduct } from '@/utils/comboHelpers';
import ProductGrid from '@/components/ProductGrid';
import useCart from '@/hooks/use-cart';
import api from '@/services/api';
import productService, { ProductData } from '@/services/productService';
import { useAuth } from '@/hooks/use-auth';
import { promptLoginForAddToCart } from '@/utils/cartAuthHelper';
import { trackProductView } from '@/services/activityService';
import { marketingTracker } from '@/services/marketingTracker';
import SEOHead from '@/components/seo/SEOHead';
import ContextualFaq from '@/components/faq/ContextualFaq';

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
  const { user } = useAuth();
  
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

  useEffect(() => {
    if (!product?._id) {
      return;
    }

    void trackProductView(
      product._id,
      product.title,
      `/product/${product._id}`
    );

    marketingTracker.trackProductView({
      id: product._id,
      title: product.title,
      price: product.price,
      category: typeof product.category === 'string' ? product.category : (product.category as any)?.name
    });
  }, [product?._id, product?.title, product?.price]);

  const handleAddToCart = (item: {
    id: string;
    productId: string;
    title: string;
    price: number;
    originalPrice: number;
    image: string;
    quantity: number;
    selectedVariant?: {
      id: string;
      title: string;
      price: number;
    };
    cakeFlavour?: string;
    selectedAddons?: Array<{
      id: string;
      title: string;
      price: number;
    }>;
    customizations?: Record<string, any>;
  }) => {
    try {
      marketingTracker.trackAddToCart({
        id: item.productId || item.id,
        title: item.title,
        price: item.price,
        quantity: item.quantity
      });

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
        isNewArrival: Boolean(
          product?.isNewArrival || (product as ProductData & { isNew?: boolean } | null)?.isNew
        ),
        isFeatured: product?.isFeatured || false,
        selectedVariant: item.selectedVariant,
        customizations: item.customizations
      };
      
      if (!user) {
        promptLoginForAddToCart(navigate, cartItem, window.location.pathname + window.location.search);
        return;
      }

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

  const finalPrice = product.discount && product.discount > 0
    ? Math.round(product.price * (1 - product.discount / 100))
    : product.price;

  const categoryName = typeof product.category === 'string'
    ? product.category
    : (product.category as any)?.name || 'Flowers';

  // Determine relevant flower or gift type
  const giftType = product.flowerType 
    ? `${product.flowerType} Flowers`
    : (categoryName === 'Cakes' ? 'Celebration Cakes' : categoryName === 'Combos' ? 'Flower & Cake Combos' : `${categoryName} Bouquets`);

  // Extract verified product attributes or tags for dynamic description
  const productFeatures = product.shortDescription
    ? product.shortDescription.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
    : (product.flowerType || (product.tags && product.tags.length > 0 ? product.tags.slice(0, 3).join(', ') : giftType.toLowerCase()));

  const productSeoTitle = `${product.title} | ${giftType} in Hyderabad`;
  const productSeoDesc = `Discover ${product.title}, featuring ${productFeatures}. Explore available variants, pricing from ₹${finalPrice}, and express same-day or midnight delivery in Hyderabad from Spring Blossoms Florist.`;

  const primaryImage = (product.images && product.images[0]) || '/images/logo_final.png';

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: productSeoDesc,
    image: (product.images && product.images.length > 0)
      ? product.images.map(img => img.startsWith('/') ? `https://sbflorist.in${img}` : img)
      : ['https://sbflorist.in/images/logo_final.png'],
    sku: String(product._id || actualId),
    offers: {
      '@type': 'Offer',
      url: `https://sbflorist.in/product/${product._id || actualId}`,
      priceCurrency: 'INR',
      price: finalPrice,
      priceValidUntil: '2026-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: (product.stock !== undefined && product.stock <= 0)
        ? 'https://schema.org/OutOfStock'
        : 'https://schema.org/InStock',
      seller: {
        '@type': 'Florist',
        '@id': 'https://sbflorist.in/#business',
        name: 'Spring Blossoms Florist',
        url: 'https://sbflorist.in/'
      }
    }
  };

  const breadcrumbs = [
    { name: 'Home', item: '/' },
    { name: 'Shop', item: '/shop' },
    { name: categoryName, item: `/shop?category=${encodeURIComponent(categoryName)}` },
    { name: product.title, item: `/product/${product._id || actualId}` }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title={productSeoTitle}
        description={productSeoDesc}
        canonical={`/product/${product._id || actualId}`}
        ogType="product"
        ogImage={primaryImage}
        jsonLd={productSchema}
        breadcrumbs={breadcrumbs}
      />
      <main className="flex-1">
        {isComboProduct(product) ? (
          <ComboProductDetail
            product={product as any}
            onAddToCart={handleAddToCart}
            onReviewSubmit={fetchProduct}
          />
        ) : isCakeProduct(product) ? (
          <CakeProductDetail
            product={product as any}
            onAddToCart={handleAddToCart}
            onReviewSubmit={fetchProduct}
          />
        ) : (
          <ProductDetail
            product={product}
            onAddToCart={handleAddToCart}
            onReviewSubmit={fetchProduct}
          />
        )}

        {/* Contextual FAQs for Products */}
        <ContextualFaq
          location="product"
          title="Product, Care & Delivery FAQs"
          subtitle="Helpful information about flower freshness, vase life, delivery scheduling, and care."
          limit={4}
          className="bg-gray-50/60 border-t border-gray-100"
        />
      </main>
    </div>
  );
};

export default ProductPage;
