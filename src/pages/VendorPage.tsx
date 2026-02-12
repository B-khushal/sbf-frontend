import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VendorPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Store className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Vendor Portal</h1>
          </div>
          <p className="text-gray-600">Manage your store and products</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Register as Vendor</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Join our marketplace and start selling your products to thousands of customers.
              </p>
              <Button onClick={() => navigate('/vendor/register')}>
                Get Started
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Existing Vendors</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Already a vendor? Access your dashboard to manage products and orders.
              </p>
              <Button onClick={() => navigate('/login')}>
                Login to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VendorPage; 