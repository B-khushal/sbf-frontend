import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/use-cart';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { OptimizedImage } from './ui/OptimizedImage';
import { useToast } from './ui/use-toast';
import { Carousel } from './ui/carousel';

interface ProductDetailProps {
  product: {
    _id: string;
    title: string;
    description: string;
    price: number;
    images: string[];
    category: string;
    countInStock: number;
    discount?: number;
    details?: Map<string, string>;
  };
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    if (quantity > product.countInStock) {
      toast({
        title: "Error",
        description: "Selected quantity exceeds available stock",
        variant: "destructive"
      });
      return;
    }

    addToCart({
      _id: product._id,
      title: product.title,
      price: product.price,
      image: product.images[0],
      quantity: quantity,
      countInStock: product.countInStock,
      discount: product.discount
    });

    toast({
      title: "Success",
      description: "Product added to cart",
    });

    navigate('/cart');
  };

  const discountedPrice = product.discount 
    ? product.price - (product.price * product.discount / 100)
    : product.price;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative">
          <Carousel className="w-full">
            {product.images.map((image, index) => (
              <div key={index} className="relative h-[400px]">
                <OptimizedImage
                  src={image}
                  alt={`${product.title} - Image ${index + 1}`}
                  className="object-contain w-full h-full"
                />
              </div>
            ))}
          </Carousel>
        </div>

        <div className="space-y-6">
          <h1 className="text-3xl font-bold">{product.title}</h1>
          
          <div className="flex items-center space-x-4">
            {product.discount ? (
              <>
                <span className="text-2xl font-bold text-green-600">
                  ₹{discountedPrice.toFixed(2)}
                </span>
                <span className="text-lg text-gray-500 line-through">
                  ₹{product.price.toFixed(2)}
                </span>
                <span className="text-sm text-red-500">
                  ({product.discount}% off)
                </span>
              </>
            ) : (
              <span className="text-2xl font-bold">₹{product.price.toFixed(2)}</span>
            )}
          </div>

          <div className="space-y-4">
            <p className="text-gray-600">{product.description}</p>
            
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium">Quantity:</label>
              <select
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="border rounded p-2"
              >
                {[...Array(Math.min(10, product.countInStock))].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>

            <Button
              onClick={handleAddToCart}
              disabled={product.countInStock === 0}
              className="w-full md:w-auto"
            >
              {product.countInStock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </Button>
          </div>

          {product.details && product.details.size > 0 && (
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-3">Product Details</h3>
              <div className="space-y-2">
                {Array.from(product.details.entries()).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-2 gap-2">
                    <span className="text-gray-600">{key}:</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
