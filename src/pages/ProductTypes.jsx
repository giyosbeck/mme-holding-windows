import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import useLanguageStore from '../store/languageStore';
import { getProductCategories } from '../services/productApi';

const ProductTypes = () => {
  const navigate = useNavigate();
  const t = useTranslation();
  const { language } = useLanguageStore();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getProductCategories();
        console.log('Categories response:', data);
        console.log('Total categories:', data.length);
        setCategories(data);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        console.error('Error response:', err.response?.data);
        setError('Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleTypeClick = (typeId) => {
    navigate(`/inventory/products/${typeId}`);
  };

  const handleGoBack = () => {
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-3 flex items-center">
          <button
            onClick={handleGoBack}
            className="mr-4 text-2xl text-gray-600 hover:text-gray-900
              w-12 h-12 rounded-lg hover:bg-gray-100 flex items-center justify-center
              transition-colors"
          >
            ←
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">{t.productTypes}</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-10">
        {loading ? (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-500">Loading...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-2xl text-red-500">{error}</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-500">{t.noProducts}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleTypeClick(category.id)}
                className="bg-white border-2 border-gray-200 shadow-md
                  rounded-2xl p-8 text-left transition-all h-32 flex items-center
                  active:scale-[0.98] active:border-blue-500"
              >
                <h3 className="text-2xl font-semibold text-gray-900">
                  {category.category_name}
                </h3>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductTypes;
