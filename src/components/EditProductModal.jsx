import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import useLanguageStore from '../store/languageStore';
import { getProductCategories, updateProduct, deleteProduct } from '../services/productApi';
import { getImageUrl } from '../services/api';
import { useKeyboard } from '../context/KeyboardContext';

const EditProductModal = ({ product, onClose, onSave, onDelete }) => {
  const t = useTranslation();
  const { language } = useLanguageStore();
  const { showKeyboard } = useKeyboard();

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    product_name: product.product_name || '',
    warehouse_product_category_id: product.warehouse_product_category_id || '',
    product_code: product.product_code || '',
    product_count_warning_limit: product.product_count_warning_limit || 0,
    product_image: product.product_image || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getProductCategories();
        console.log('Categories response:', data);
        setCategories(data);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };

    fetchCategories();
  }, []);

  const handleSave = async () => {
    if (!formData.product_name || !formData.warehouse_product_category_id) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await updateProduct({
        id: product.id,
        ...formData
      });
      onSave(); // Refresh the product list
    } catch (err) {
      console.error('Failed to update product:', err);
      setError(err.response?.data?.message || 'Failed to update product');
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    setLoading(true);
    setError('');
    setShowDeleteConfirm(false);

    try {
      await deleteProduct(product.id);
      onDelete(); // Refresh the product list
    } catch (err) {
      console.error('Failed to delete product:', err);
      setError(err.response?.data?.message || 'Failed to delete product');
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50 p-8"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-lg max-w-2xl w-full p-10 max-h-screen overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
        <h2 className="text-3xl font-semibold text-gray-900 mb-10">
          {t.editProduct}
        </h2>

        {/* Product Image (not editable) */}
        <div className="mb-8">
          <label className="block text-gray-700 mb-2 text-xl">Image</label>
          <div className="flex justify-center py-4">
            <div className="w-32 h-32">
              {product.product_image ? (
                <img
                  src={getImageUrl(product.product_image)}
                  alt={product.product_name}
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`w-full h-full flex items-center justify-center text-7xl ${product.product_image ? 'hidden' : 'flex'}`}>
                📦
              </div>
            </div>
          </div>
        </div>

        {/* Product Name */}
        <div className="mb-8">
          <label className="block text-gray-700 mb-2 text-xl">{t.productName}</label>
          <input
            type="text"
            value={formData.product_name}
            readOnly
            onFocus={(e) => {
              e.target.blur();
              showKeyboard('text', formData.product_name, (val) => setFormData({ ...formData, product_name: val }), () => {});
            }}
            onClick={() => {
              showKeyboard('text', formData.product_name, (val) => setFormData({ ...formData, product_name: val }), () => {});
            }}
            className="w-full border-2 border-gray-300 rounded-lg p-4 text-xl
              focus:border-gray-900 focus:outline-none cursor-pointer"
          />
        </div>

        {/* Product Type */}
        <div className="mb-8">
          <label className="block text-gray-700 mb-2 text-xl">{t.productType}</label>
          <select
            value={formData.warehouse_product_category_id}
            onChange={(e) => setFormData({ ...formData, warehouse_product_category_id: e.target.value })}
            className="w-full border-2 border-gray-300 rounded-lg p-4 text-xl
              focus:border-gray-900 focus:outline-none"
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.category_name}
              </option>
            ))}
          </select>
        </div>

        {/* Product Code */}
        <div className="mb-8">
          <label className="block text-gray-700 mb-2 text-xl">{t.productCode}</label>
          <input
            type="text"
            value={formData.product_code}
            readOnly
            onFocus={(e) => {
              e.target.blur();
              showKeyboard('text', formData.product_code, (val) => setFormData({ ...formData, product_code: val }), () => {});
            }}
            onClick={() => {
              showKeyboard('text', formData.product_code, (val) => setFormData({ ...formData, product_code: val }), () => {});
            }}
            className="w-full border-2 border-gray-300 rounded-lg p-4 text-xl
              focus:border-gray-900 focus:outline-none cursor-pointer"
          />
        </div>

        {/* Warning Limit */}
        <div className="mb-8">
          <label className="block text-gray-700 mb-2 text-xl">{t.warningLimit}</label>
          <input
            type="text"
            value={formData.product_count_warning_limit}
            readOnly
            onFocus={(e) => {
              e.target.blur();
              showKeyboard('number', formData.product_count_warning_limit.toString(), (val) => setFormData({ ...formData, product_count_warning_limit: parseInt(val) || 0 }), () => {});
            }}
            onClick={() => {
              showKeyboard('number', formData.product_count_warning_limit.toString(), (val) => setFormData({ ...formData, product_count_warning_limit: parseInt(val) || 0 }), () => {});
            }}
            className="w-full border-2 border-gray-300 rounded-lg p-4 text-xl
              focus:border-gray-900 focus:outline-none cursor-pointer"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8">
            <p className="text-red-600 text-lg">{error}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={handleSave}
            disabled={loading}
            className={`flex-1 h-14 text-xl font-medium rounded-lg transition-colors
              ${loading
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-gray-900 text-white hover:bg-gray-700'
              }`}
          >
            {loading ? 'Saving...' : t.save}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 h-14 text-xl font-medium rounded-lg
              border-2 border-gray-300 text-gray-700 hover:border-gray-900 hover:text-gray-900
              transition-colors disabled:opacity-50"
          >
            {t.cancel}
          </button>
        </div>

        {/* Delete Button */}
        <button
          onClick={handleDeleteClick}
          disabled={loading}
          className={`w-full h-14 text-xl font-medium rounded-lg transition-colors
            ${loading
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-red-600 text-white hover:bg-red-700'
            }`}
        >
          {t.delete}
        </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-8"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t.deleteConfirm}
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              {product.product_name}
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={loading}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold
                  active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={loading}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-semibold
                  active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditProductModal;
