import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const CategoryMenu = () => {
  return (
    <section className="bg-white border-b sticky top-16 z-30">
      <div className="container mx-auto px-4">
        <div className="flex justify-center overflow-x-auto py-4 scrollbar-hide">
          <div className="flex space-x-6 md:space-x-8 min-w-max">
            {[
              { name: "Flowers", path: "/shop/flowers" },
              { name: "Birthday", path: "/shop/birthday" },
              { name: "Anniversary", path: "/shop/anniversary" },
              { name: "Baskets", path: "/shop/baskets" },
            ].map((category) => (
              <Link
                key={category.path}
                to={category.path}
                className="text-sm font-medium text-gray-700 whitespace-nowrap hover:text-pink-600 transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoryMenu;