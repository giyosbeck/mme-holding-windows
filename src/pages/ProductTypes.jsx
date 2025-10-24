import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import useLanguageStore from '../store/languageStore';
import useHideStore from '../store/hideStore';
import useUsageStore from '../store/usageStore';
import { getProductCategories } from '../services/productApi';
import { capitalizeFirstLetter } from '../utils/textUtils';

const ProductTypes = () => {
  const navigate = useNavigate();
  const t = useTranslation();
  const { language } = useLanguageStore();
  const { hideCategory, unhideCategory, isCategoryHidden } = useHideStore();
  const { getCategoryUsage } = useUsageStore();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showHidden, setShowHidden] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [sortMode, setSortMode] = useState('usage'); // 'usage', 'api-order', 'alphabetical'
  const [confirmHideCategory, setConfirmHideCategory] = useState(null);

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

  const handleToggleHide = (categoryId, e) => {
    e.stopPropagation();
    if (isCategoryHidden(categoryId)) {
      unhideCategory(categoryId);
    } else {
      // Show confirmation dialog
      setConfirmHideCategory(categoryId);
    }
  };

  const handleConfirmHide = () => {
    if (confirmHideCategory) {
      hideCategory(confirmHideCategory);
      setConfirmHideCategory(null);
    }
  };

  const filteredCategories = showHidden
    ? categories
    : categories.filter(cat => !isCategoryHidden(cat.id));

  // Apply sorting
  const sortedCategories = [...filteredCategories].sort((a, b) => {
    if (sortMode === 'usage') {
      return getCategoryUsage(b.id) - getCategoryUsage(a.id); // DESC
    } else if (sortMode === 'alphabetical') {
      return capitalizeFirstLetter(a.category_name).localeCompare(capitalizeFirstLetter(b.category_name));
    }
    return 0; // 'api-order' keeps original order
  });

  const handleCycleSortMode = () => {
    if (sortMode === 'usage') {
      setSortMode('api-order');
    } else if (sortMode === 'api-order') {
      setSortMode('alphabetical');
    } else {
      setSortMode('usage');
    }
  };

  const getSortIcon = () => {
    if (sortMode === 'usage') return '🔥';
    if (sortMode === 'api-order') return '📋';
    return '🔤';
  };

  const getSortLabel = () => {
    if (sortMode === 'usage') return t.sortUsage;
    if (sortMode === 'api-order') return t.sortApiOrder;
    return t.sortAlphabetical;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-3 flex items-center justify-between">
          <div className="flex items-center">
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

          <div className="flex items-center gap-3">
            {/* Sort Toggle */}
            <button
              onClick={handleCycleSortMode}
              className="px-6 h-12 rounded-xl font-medium transition-all shadow-md
                active:scale-[0.98] flex items-center gap-2
                bg-white border-2 border-gray-200 text-gray-700 active:border-blue-500"
            >
              <span className="text-xl">{getSortIcon()}</span>
              <span>{getSortLabel()}</span>
            </button>

            {/* Show Hidden Toggle */}
            <button
              onClick={() => setShowHidden(!showHidden)}
              className={`px-6 h-12 rounded-xl font-medium transition-all shadow-md
                active:scale-[0.98] flex items-center gap-2 ${
                showHidden
                  ? 'bg-blue-500 text-white active:bg-blue-600'
                  : 'bg-white border-2 border-gray-200 text-gray-700 active:border-blue-500'
              }`}
            >
              <span className="text-xl">{showHidden ? '👁️' : '👁️‍🗨️'}</span>
              <span>{showHidden ? t.hideHidden : t.showHidden}</span>
            </button>

            {/* Edit Icon */}
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl
                transition-colors ${isEditMode
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              ✏️
            </button>
          </div>
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
            {sortedCategories.map((category) => {
              const isHidden = isCategoryHidden(category.id);
              return (
                <div key={category.id} className="relative">
                  <button
                    onClick={() => handleTypeClick(category.id)}
                    className={`w-full bg-white border-2 shadow-md
                      rounded-2xl p-8 text-left transition-all h-32 flex items-center justify-between
                      active:scale-[0.98] ${
                      isHidden
                        ? 'border-gray-300 opacity-60'
                        : 'border-gray-200 active:border-blue-500'
                    }`}
                  >
                    <div className="flex-1">
                      <h3 className="text-2xl font-semibold text-gray-900">
                        {capitalizeFirstLetter(category.category_name)}
                      </h3>
                      {isHidden && showHidden && (
                        <span className="inline-block mt-2 px-3 py-1 bg-gray-200 text-gray-600 text-sm rounded-lg">
                          {t.hidden}
                        </span>
                      )}
                    </div>
                    {isEditMode && (
                      <button
                        onClick={(e) => handleToggleHide(category.id, e)}
                        className={`ml-4 w-12 h-12 rounded-xl flex items-center justify-center
                          transition-all shadow-md active:scale-[0.95] border-2 ${
                          isHidden
                            ? 'bg-green-500 text-white border-green-500 active:bg-green-600'
                            : 'bg-white text-gray-600 border-gray-300 active:border-gray-400'
                        }`}
                      >
                        <span className="text-xl">{isHidden ? '👁️' : '🗑️'}</span>
                      </button>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmHideCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-8 shadow-xl">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              {t.hideConfirm}
            </h2>
            <div className="flex gap-4">
              <button
                onClick={() => setConfirmHideCategory(null)}
                className="flex-1 h-14 text-lg font-medium rounded-xl
                  bg-white border-2 border-gray-300 text-gray-700
                  active:scale-95 active:border-blue-500 transition-all"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleConfirmHide}
                className="flex-1 h-14 text-lg font-medium rounded-xl
                  bg-red-500 text-white active:scale-95 active:bg-red-600 transition-all"
              >
                {t.hide}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductTypes;
