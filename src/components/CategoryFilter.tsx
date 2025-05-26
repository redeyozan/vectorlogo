import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

type Category = {
  id: string;
  name: string;
  slug: string;
};

type CategoryFilterProps = {
  categories: Category[];
  selectedCategory?: string;
};

const CategoryFilter = ({ categories, selectedCategory }: CategoryFilterProps) => {
  const router = useRouter();

  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-2">
        <Link 
          href="/"
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            !selectedCategory 
              ? 'bg-primary-600 text-white' 
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          All
        </Link>
        
        <Link 
          href="/featured"
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === 'featured' 
              ? 'bg-primary-600 text-white' 
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Featured
        </Link>
        
        {categories.map((category) => (
          <Link 
            key={category.id}
            href={`/category/${category.slug}`}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category.slug 
                ? 'bg-primary-600 text-white' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {category.name}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
