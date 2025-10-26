import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import useLanguageStore from '../store/languageStore';
import useHideStore from '../store/hideStore';
import useUsageStore from '../store/usageStore';
import { getProductsByCategory } from '../services/productApi';
import { getImageUrl } from '../services/api';
import RestockModal from '../components/RestockModal';
import EditProductModal from '../components/EditProductModal';
import { useKeyboard } from '../context/KeyboardContext';

const ProductList = () => {
  const navigate = useNavigate();
  const { typeId } = useParams();
  const t = useTranslation();
  const { language } = useLanguageStore();
  const { showKeyboard } = useKeyboard();
  const { hideProduct, unhideProduct, isProductHidden, isCategoryHidden, shouldHideProduct } = useHideStore();
  const { getProductUsage } = useUsageStore();

  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [showHidden, setShowHidden] = useState(false);
  const [sortMode, setSortMode] = useState('usage');
  const [restockModal, setRestockModal] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [confirmHideProduct, setConfirmHideProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoryName, setCategoryName] = useState('');

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');

      try {
        // Fetch with large limit to get all products (API uses pagination)
        const response = await getProductsByCategory(typeId, 1000, 0, searchQuery);
        console.log('Products response:', response);
        console.log('First product:', response.products?.[0]);
        setProducts(response.products || []);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [typeId, searchQuery]);

  const handleGoBack = () => {
    navigate('/inventory/types');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  };

  const formatPrice = (price) => {
    return '$' + new Intl.NumberFormat('en-US').format(price);
  };

  const refreshProducts = async () => {
    try {
      const response = await getProductsByCategory(typeId, 1000, 0, searchQuery);
      setProducts(response.products || []);
    } catch (err) {
      console.error('Failed to refresh products:', err);
    }
  };

  const handleRestock = (product) => {
    setRestockModal(product);
  };

  const handleRestockSave = async () => {
    setRestockModal(null);
    await refreshProducts();
  };

  const handleEdit = (product) => {
    setEditModal(product);
  };

  const handleEditSave = async () => {
    setEditModal(null);
    await refreshProducts();
  };

  const handleDelete = async () => {
    setEditModal(null);
    await refreshProducts();
  };

  const handleToggleHide = (productId, e) => {
    e.stopPropagation();
    if (isProductHidden(productId)) {
      unhideProduct(productId);
    } else {
      // Show confirmation dialog
      setConfirmHideProduct(productId);
    }
  };

  const handleConfirmHide = () => {
    if (confirmHideProduct) {
      hideProduct(confirmHideProduct);
      setConfirmHideProduct(null);
    }
  };

  const filteredProducts = showHidden
    ? products
    : products.filter(prod => !shouldHideProduct(prod.id, typeId));

  // Apply sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortMode === 'usage') {
      return getProductUsage(b.id) - getProductUsage(a.id);
    } else if (sortMode === 'alphabetical') {
      return a.product_name.localeCompare(b.product_name);
    }
    return 0;
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

  const categoryIsHidden = isCategoryHidden(parseInt(typeId));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
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
            <h1 className="text-2xl font-semibold text-gray-900">
              {categoryName || t.products}
            </h1>
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

        {/* Search Bar */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-8 py-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                showKeyboard('text', searchQuery, setSearchQuery, () => {});
              }}
              onClick={() => {
                showKeyboard('text', searchQuery, setSearchQuery, () => {});
              }}
              placeholder={t.searchProducts}
              className="w-full h-16 border-2 border-gray-300 rounded-xl px-6 text-xl
                focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Category Hidden Notice */}
        {categoryIsHidden && (
          <div className="bg-yellow-50 border-b border-yellow-200">
            <div className="max-w-7xl mx-auto px-8 py-4">
              <p className="text-xl text-yellow-800 font-medium">
                ⚠️ {t.categoryHidden}
              </p>
            </div>
          </div>
        )}
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
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-500">{t.noProducts}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            {sortedProducts.map((product) => {
              const isHidden = shouldHideProduct(product.id, typeId);
              return (
                <div
                  key={product.id}
                  className={`bg-white border-2 rounded-2xl p-6 shadow-md transition-all ${
                    isHidden
                      ? 'border-gray-300 opacity-60'
                      : 'border-gray-200'
                  }`}
                >
                  {/* Product Image & Name */}
                  <div className="flex items-center mb-4 pb-4 border-b-2 border-gray-100">
                    <div className="w-28 h-28 flex-shrink-0 mr-5">
                      {product.product_image ? (
                        <img
                          src={getImageUrl(product.product_image)}
                          alt={product.product_name}
                          className="w-full h-full object-cover rounded-xl shadow-sm"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full flex items-center justify-center text-7xl bg-gray-50 rounded-xl ${product.product_image ? 'hidden' : 'flex'}`}>
                        📦
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-semibold text-gray-900 leading-snug">
                        {product.product_name}
                      </h3>
                      {isHidden && showHidden && (
                        <span className="inline-block mt-2 px-3 py-1 bg-gray-200 text-gray-600 text-sm rounded-lg">
                          {t.hidden}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="space-y-4 mb-6">
                    {/* Price */}
                    <div className="flex justify-between items-center">
                      <span className="text-xl text-gray-500">{t.price}:</span>
                      <span className="text-2xl font-semibold text-gray-900">
                        {formatPrice(product.product_price)}
                      </span>
                    </div>

                    {/* Stock */}
                    <div className="flex justify-between items-center">
                      <span className="text-xl text-gray-500">{t.stock}:</span>
                      <span className="text-2xl font-semibold text-blue-600">
                        {product.product_count} {product.unit_of_measure}
                      </span>
                    </div>
                  </div>

                  {/* Edit Mode Buttons */}
                  {isEditMode && (
                    <div className="space-y-3 pt-4 border-t-2 border-gray-100">
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleRestock(product)}
                          className="flex-1 h-14 text-lg font-medium rounded-xl
                            bg-white border-2 border-gray-300 text-gray-700
                            active:scale-95 active:border-blue-500 transition-all"
                        >
                          {t.restock}
                        </button>
                        <button
                          onClick={() => handleEdit(product)}
                          className="flex-1 h-14 text-lg font-medium rounded-xl
                            bg-gray-900 text-white active:scale-95 transition-all"
                        >
                          {t.change}
                        </button>
                      </div>
                      <button
                        onClick={(e) => handleToggleHide(product.id, e)}
                        className={`w-full h-14 text-lg font-medium rounded-xl border-2
                          transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 ${
                          isProductHidden(product.id)
                            ? 'bg-green-500 text-white border-green-500 active:bg-green-600'
                            : 'bg-white text-gray-600 border-gray-300 active:border-gray-400'
                        }`}
                      >
                        <span className="text-xl">{isProductHidden(product.id) ? '👁️' : '🗑️'}</span>
                        <span>{isProductHidden(product.id) ? t.unhide : t.hide}</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {restockModal && (
        <RestockModal
          product={restockModal}
          onClose={() => setRestockModal(null)}
          onSave={handleRestockSave}
        />
      )}

      {editModal && (
        <EditProductModal
          product={editModal}
          onClose={() => setEditModal(null)}
          onSave={handleEditSave}
          onDelete={handleDelete}
        />
      )}

      {/* Confirmation Modal */}
      {confirmHideProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-8 shadow-xl">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              {t.hideConfirm}
            </h2>
            <div className="flex gap-4">
              <button
                onClick={() => setConfirmHideProduct(null)}
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

export default ProductList;
