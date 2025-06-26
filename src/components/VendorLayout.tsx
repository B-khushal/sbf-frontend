import React from 'react';
import VendorNavbar from './VendorNavbar';

interface VendorLayoutProps {
  children: React.ReactNode;
}

const VendorLayout: React.FC<VendorLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <VendorNavbar />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default VendorLayout;