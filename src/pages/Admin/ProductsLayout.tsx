import React from "react";
import { Outlet } from "react-router-dom";

const ProductsLayout: React.FC = () => {
  return (
    <div className="w-full">
      <Outlet />
    </div>
  );
};

export default ProductsLayout;
