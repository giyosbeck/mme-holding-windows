import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import useLanguageStore from '../store/languageStore';
import useUsageStore from '../store/usageStore';
import { createSupply } from '../services/supplyApi';
import { getImageUrl } from '../services/api';
import { useKeyboard } from '../context/KeyboardContext';

const SupplyAmountModal = ({ product, onClose }) => {
  const navigate = useNavigate();
  const t = useTranslation();
  const { language } = useLanguageStore();
  const { showKeyboard } = useKeyboard();
  const { incrementProductUsage, incrementCategoryUsage } = useUsageStore();
  const [amount, setAmount] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Get selection from session storage
  const selection = JSON.parse(sessionStorage.getItem('supplySelection') || '{}');

  const handleSupply = async () => {
    if (!amount || amount <= 0) {
      setErrorMessage(t.errorMessage);
      setShowError(true);
      return;
    }

    // Check if enough stock
    if (parseFloat(amount) > product.product_count) {
      setErrorMessage(t.errorMessage);
      setShowError(true);
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      await createSupply(
        product.id,
        selection.projectId,
        selection.employeeId,
        parseFloat(amount)
      );

      // Track usage on successful supply
      incrementProductUsage(product.id);
      incrementCategoryUsage(product.warehouse_product_category_id);

      setShowSuccess(true);
    } catch (err) {
      console.error('Failed to create supply:', err);
      setErrorMessage(err.response?.data?.message || t.errorMessage);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    onClose();
    // Keep selection alive for multiple supplies to same employee/project
    // Navigate back to product categories
    navigate('/supplying/product-types');
  };

  const handleErrorClose = () => {
    setShowError(false);
  };

  return (
    <>
      {/* Main Modal */}
      {!showSuccess && !showError && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-8"
          onClick={onClose}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full p-10"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-3xl font-semibold text-gray-900 mb-10">
              {t.supply}
            </h2>

            {/* Product Info */}
            <div className="mb-8 p-6 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-20 h-20 flex-shrink-0 mr-4">
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
                  <div className={`w-full h-full flex items-center justify-center text-5xl ${product.product_image ? 'hidden' : 'flex'}`}>
                    📦
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900">
                    {product.product_name}
                  </h3>
                  <p className="text-lg text-gray-600">
                    {t.stock}: {product.product_count} {product.unit_of_measure}
                  </p>
                </div>
              </div>
            </div>

            {/* Amount Input */}
            <div className="mb-10">
              <label className="block text-gray-700 mb-2 text-xl">{t.supplyAmount}</label>
              <input
                type="text"
                value={amount}
                readOnly
                onFocus={(e) => {
                  e.target.blur();
                  showKeyboard('number', amount.toString(), setAmount, () => {});
                }}
                onClick={() => {
                  showKeyboard('number', amount.toString(), setAmount, () => {});
                }}
                disabled={loading}
                className="w-full border-2 border-gray-300 rounded-lg p-4 text-xl
                  focus:border-gray-900 focus:outline-none disabled:bg-gray-100 cursor-pointer"
                placeholder={product.unit_of_measure}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleSupply}
                disabled={loading}
                className={`flex-1 h-14 text-xl font-medium rounded-lg transition-colors
                  ${loading
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-gray-900 text-white hover:bg-gray-700'
                  }`}
              >
                {loading ? 'Supplying...' : t.supply}
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
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50 p-8">
          <div className="bg-white rounded-lg max-w-md w-full p-10 text-center">
            <div className="text-8xl mb-6">✅</div>
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">
              {t.successTitle}
            </h2>
            <p className="text-xl text-gray-600 mb-10">
              {t.successMessage}
            </p>
            <button
              onClick={handleSuccessClose}
              className="w-full h-14 text-xl font-medium rounded-lg
                bg-gray-900 text-white hover:bg-gray-700 transition-colors"
            >
              {t.close}
            </button>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showError && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50 p-8">
          <div className="bg-white rounded-lg max-w-md w-full p-10 text-center">
            <div className="text-8xl mb-6">❌</div>
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">
              {t.errorTitle}
            </h2>
            <p className="text-xl text-gray-600 mb-10">
              {errorMessage || t.errorMessage}
            </p>
            <button
              onClick={handleErrorClose}
              className="w-full h-14 text-xl font-medium rounded-lg
                bg-gray-900 text-white hover:bg-gray-700 transition-colors"
              >
              {t.close}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SupplyAmountModal;
