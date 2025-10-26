import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useKeyboard } from '../context/KeyboardContext';

/**
 * Exchange Calculator Component
 *
 * Provides two-way conversion between USD and UZS using Central Bank exchange rate
 *
 * @param {number} exchangeRate - Current USD to UZS exchange rate
 * @param {number} usdValue - Current USD value
 * @param {number} uzsValue - Current UZS value
 * @param {function} onUsdChange - Callback when USD value changes
 * @param {function} onUzsChange - Callback when UZS value changes
 * @param {boolean} loading - Whether exchange rate is loading
 * @param {string} label - Label for the calculator section
 */
const ExchangeCalculator = ({
  exchangeRate,
  usdValue,
  uzsValue,
  onUsdChange,
  onUzsChange,
  loading = false,
  label
}) => {
  const t = useTranslation();
  const { showKeyboard } = useKeyboard();

  const handleUsdInput = () => {
    showKeyboard('number', usdValue?.toString() || '', (value) => {
      const numValue = value === '' ? 0 : parseInt(value, 10);
      onUsdChange(numValue);

      // Auto-calculate UZS from USD
      if (exchangeRate && numValue) {
        const calculatedUzs = Math.round(numValue * exchangeRate);
        onUzsChange(calculatedUzs);
      } else if (!numValue) {
        onUzsChange(0);
      }
    }, () => {});
  };

  const handleUzsInput = () => {
    showKeyboard('number', uzsValue?.toString() || '', (value) => {
      const numValue = value === '' ? 0 : parseInt(value, 10);
      onUzsChange(numValue);

      // Auto-calculate USD from UZS
      if (exchangeRate && numValue) {
        const calculatedUsd = Math.round(numValue / exchangeRate);
        onUsdChange(calculatedUsd);
      } else if (!numValue) {
        onUsdChange(0);
      }
    }, () => {});
  };

  return (
    <div className="space-y-4">
      {label && (
        <h3 className="text-lg font-semibold text-gray-900">{label}</h3>
      )}

      {/* Exchange Rate Display */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-700 font-medium">
            {t.exchangeRate || 'Markaziy bank kursi'}:
          </span>
          <span className="text-xl font-bold text-blue-600">
            {loading ? (
              <span className="animate-pulse">...</span>
            ) : (
              `1 USD = ${new Intl.NumberFormat('uz-UZ').format(exchangeRate || 0)} UZS`
            )}
          </span>
        </div>
      </div>

      {/* Input Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* USD Input */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            {t.usd || 'USD'}
          </label>
          <div className="relative">
            <input
              type="text"
              value={usdValue || ''}
              readOnly
              onFocus={(e) => {
                e.target.blur();
                handleUsdInput();
              }}
              onClick={handleUsdInput}
              className="w-full h-14 px-4 pr-12 rounded-lg border-2 border-gray-200
                text-lg font-semibold cursor-pointer
                active:border-blue-500 transition-all"
              placeholder="0"
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2
              text-gray-500 font-medium">
              $
            </div>
          </div>
        </div>

        {/* UZS Input */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            {t.uzs || 'UZS'}
          </label>
          <div className="relative">
            <input
              type="text"
              value={uzsValue ? new Intl.NumberFormat('uz-UZ').format(uzsValue) : ''}
              readOnly
              onFocus={(e) => {
                e.target.blur();
                handleUzsInput();
              }}
              onClick={handleUzsInput}
              className="w-full h-14 px-4 pr-16 rounded-lg border-2 border-gray-200
                text-lg font-semibold cursor-pointer
                active:border-blue-500 transition-all"
              placeholder="0"
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2
              text-gray-500 font-medium text-sm">
              so'm
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExchangeCalculator;
