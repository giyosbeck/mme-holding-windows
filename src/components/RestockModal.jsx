import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { addProductInventory } from '../services/productApi';
import { useKeyboard } from '../context/KeyboardContext';

const RestockModal = ({ product, onClose, onSave }) => {
  const t = useTranslation();
  const { showKeyboard } = useKeyboard();
  const [price, setPrice] = useState(product.product_price_usd || 0);
  const [amount, setAmount] = useState('');
  const [receivedDate, setReceivedDate] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!amount || amount <= 0) {
      setError('Please enter valid amount');
      return;
    }

    if (!price || price <= 0) {
      setError('Please enter valid price');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await addProductInventory(
        product.id,
        parseFloat(amount),
        parseFloat(price),
        receivedDate
      );
      onSave(); // Refresh the product list
    } catch (err) {
      console.error('Failed to restock product:', err);
      setError(err.response?.data?.message || 'Failed to restock product');
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50 p-8"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-2xl w-full p-10"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-3xl font-semibold text-gray-900 mb-10">
          {t.restockProduct}
        </h2>

        {/* Price */}
        <div className="mb-8">
          <label className="block text-gray-700 mb-2 text-xl">{t.price}</label>
          <input
            type="text"
            value={price}
            readOnly
            onFocus={(e) => {
              e.target.blur();
              showKeyboard('decimal', price.toString(), setPrice, () => {});
            }}
            onClick={() => {
              showKeyboard('decimal', price.toString(), setPrice, () => {});
            }}
            className="w-full border-2 border-gray-300 rounded-lg p-4 text-xl
              focus:border-gray-900 focus:outline-none cursor-pointer"
            placeholder="0.00"
          />
        </div>

        {/* Amount */}
        <div className="mb-8">
          <label className="block text-gray-700 mb-2 text-xl">{t.amount}</label>
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
            className="w-full border-2 border-gray-300 rounded-lg p-4 text-xl
              focus:border-gray-900 focus:outline-none cursor-pointer"
            placeholder={product.unit_of_measure || 'units'}
          />
        </div>

        {/* Received Date */}
        <div className="mb-8">
          <label className="block text-gray-700 mb-2 text-xl">{t.receivedDate}</label>
          <input
            type="datetime-local"
            value={receivedDate}
            onChange={(e) => setReceivedDate(e.target.value)}
            className="w-full border-2 border-gray-300 rounded-lg p-4 text-xl
              focus:border-gray-900 focus:outline-none"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8">
            <p className="text-red-600 text-lg">{error}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-4">
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
      </div>
    </div>
  );
};

export default RestockModal;
