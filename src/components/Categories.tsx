import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useSettings } from '@/contexts/SettingsContext';

const Categories = () => {
  const { categories, loading } = useSettings();

  if (loading) {
    return (
      <section className="py-16 md:py-24 px-6 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Loading categories...</p>
          </div>
        </div>
      </section>
    );
  }

  // If no categories are available, don't render the section
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-24 px-6 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 relative">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4">
            <div className="text-4xl text-yellow-400">✨</div>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-800 mb-6 pt-8">
            Explore Our <span className="text-yellow-600">Exquisite Range</span>
          </h2>
          <div className="absolute top-0 right-1/2 transform translate-x-32 -translate-y-4">
            <div className="text-4xl text-yellow-400">✨</div>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Browse our curated collection of premium flower arrangements and botanical gifts
          </p>
        </div>
        
        {/* Grid layout that adjusts based on number of categories */}
        <div className={cn(
          "grid gap-4 md:gap-6",
          categories.length <= 3 ? "grid-cols-1 sm:grid-cols-3" :
          categories.length <= 4 ? "grid-cols-2 sm:grid-cols-4" :
          categories.length <= 6 ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6" :
          "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
        )}>
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
};

interface CategoryType {
  id: string;
  name: string;
  description: string;
  image: string;
  link: string;
  enabled: boolean;
  order: number;
}

const CategoryCard = ({ category }: { category: CategoryType }) => {
  return (
    <Link 
      to={category.link}
      className="group relative aspect-square overflow-hidden bg-muted/30 hover-lift rounded-2xl"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full overflow-hidden">
          <img 
            src={category.image}
            alt={category.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/0" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end text-center text-white p-4">
        <h3 className="text-lg font-medium mb-1">{category.name}</h3>
        <p className="text-white/80 text-xs mb-2 line-clamp-1">{category.description}</p>
        <span className="inline-block border-b border-white/40 pb-1 text-xs transition-all duration-300 ease-smooth group-hover:border-white">
          Shop Now
        </span>
      </div>
    </Link>
  );
};

export default Categories;