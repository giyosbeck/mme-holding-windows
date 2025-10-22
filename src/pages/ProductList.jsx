import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import useLanguageStore from '../store/languageStore';
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

  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [restockModal, setRestockModal] = useState(null);
  const [editModal, setEditModal] = useState(null);
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

        {/* Search Bar */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-8 py-6">
            <input
              type="text"
              value={searchQuery}
              readOnly
              onFocus={(e) => {
                e.target.blur();
                showKeyboard('text', searchQuery, setSearchQuery, () => {});
              }}
              onClick={() => {
                showKeyboard('text', searchQuery, setSearchQuery, () => {});
              }}
              placeholder={t.searchProducts}
              className="w-full h-16 border-2 border-gray-300 rounded-xl px-6 text-xl
                focus:border-blue-500 focus:outline-none transition-colors cursor-pointer"
            />
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
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-500">{t.noProducts}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-md transition-all"
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
                  <h3 className="text-2xl font-semibold text-gray-900 leading-snug">
                    {product.product_name}
                  </h3>
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
                  <div className="flex gap-3 pt-4 border-t-2 border-gray-100">
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
                )}
              </div>
            ))}
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
    </div>
  );
};

export default ProductList;
