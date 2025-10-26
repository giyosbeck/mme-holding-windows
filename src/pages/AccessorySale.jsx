import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { useKeyboard } from '../context/KeyboardContext';
import { createAccessorySale, getUSDExchangeRate } from '../services/salonApi';
import ExchangeCalculator from '../components/ExchangeCalculator';

const AccessorySale = () => {
  const navigate = useNavigate();
  const t = useTranslation();
  const { showKeyboard } = useKeyboard();

  // Form state
  const [accessoryName, setAccessoryName] = useState('');
  const [priceUsd, setPriceUsd] = useState(0);
  const [priceUzs, setPriceUzs] = useState(0);

  // Calculator tool
  const [calcUsd, setCalcUsd] = useState(0);
  const [calcUzs, setCalcUzs] = useState(0);

  // UI state
  const [exchangeRate, setExchangeRate] = useState(0);
  const [exchangeLoading, setExchangeLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchExchangeRate();
  }, []);

  const fetchExchangeRate = async () => {
    setExchangeLoading(true);
    try {
      const response = await getUSDExchangeRate();
      setExchangeRate(response.usd_rate || 0);
      console.log('💵 Exchange Rate:', response.usd_rate);
    } catch (err) {
      console.error('❌ Failed to fetch exchange rate:', err);
      setError('Failed to load exchange rate');
    } finally {
      setExchangeLoading(false);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!accessoryName.trim()) {
      setError(t.accessoryNameRequired || 'Aksessuar nomini kiriting');
      return;
    }

    if (priceUsd === 0 && priceUzs === 0) {
      setError(t.priceRequired || 'Narxini kiriting');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const saleData = {
        accessory_name: accessoryName,
        accessory_money_usd: priceUsd,
        accessory_money_uzs: priceUzs,
        central_bank_usd_course: exchangeRate
      };

      console.log('💍 Creating Accessory Sale:', saleData);

      await createAccessorySale(saleData);

      // Success - navigate back
      alert(t.successMessage || 'Muvaffaqiyatli saqlandi!');
      navigate('/salon/home');
    } catch (err) {
      console.error('❌ Failed to create accessory sale:', err);
      setError(err.response?.data?.message || t.errorMessage || 'Xatolik yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/salon/home')}
              className="w-14 h-14 rounded-full border-2 border-gray-200
                flex items-center justify-center text-2xl
                active:scale-[0.98] active:border-blue-500 transition-all"
            >
              ←
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">
              {t.salonAccessorySale || 'Aksessuar sotish'}
            </h1>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="w-14 h-14 rounded-full bg-gray-900
              flex items-center justify-center text-2xl
              active:scale-[0.98] transition-all"
          >
            👤
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-8 py-8 space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-red-600">
            {error}
          </div>
        )}

        {/* Accessory Name */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-md">
          <label className="block text-gray-700 font-medium mb-2">
            {t.accessoryName || 'Aksessuar nomi'}
          </label>
          <input
            type="text"
            value={accessoryName}
            readOnly
            onFocus={(e) => {
              e.target.blur();
              showKeyboard('text', accessoryName, setAccessoryName, () => {});
            }}
            onClick={() => showKeyboard('text', accessoryName, setAccessoryName, () => {})}
            className="w-full h-14 px-4 rounded-lg border-2 border-gray-200 text-lg
              cursor-pointer active:border-blue-500 transition-all"
            placeholder={t.enterAccessoryName || 'Aksessuar nomini kiriting'}
          />
        </div>

        {/* Accessory Price */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {t.accessoryPrice || 'Aksessuar narxi'}
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            USD yoki UZS kiriting (ikkalasini ham kiritishingiz mumkin)
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* USD Input */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">USD</label>
              <div className="relative">
                <input
                  type="text"
                  value={priceUsd || ''}
                  readOnly
                  onFocus={(e) => {
                    e.target.blur();
                    showKeyboard('number', priceUsd?.toString() || '', (value) => {
                      const numValue = value === '' ? 0 : parseInt(value, 10);
                      setPriceUsd(numValue);
                    }, () => {});
                  }}
                  onClick={() => showKeyboard('number', priceUsd?.toString() || '', (value) => {
                    const numValue = value === '' ? 0 : parseInt(value, 10);
                    setPriceUsd(numValue);
                  }, () => {})}
                  className="w-full h-14 px-4 pr-12 rounded-lg border-2 border-gray-200
                    text-lg font-semibold cursor-pointer active:border-blue-500 transition-all"
                  placeholder="0"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  $
                </div>
              </div>
            </div>

            {/* UZS Input */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">UZS</label>
              <div className="relative">
                <input
                  type="text"
                  value={priceUzs ? new Intl.NumberFormat('uz-UZ').format(priceUzs) : ''}
                  readOnly
                  onFocus={(e) => {
                    e.target.blur();
                    showKeyboard('number', priceUzs?.toString() || '', (value) => {
                      const numValue = value === '' ? 0 : parseInt(value, 10);
                      setPriceUzs(numValue);
                    }, () => {});
                  }}
                  onClick={() => showKeyboard('number', priceUzs?.toString() || '', (value) => {
                    const numValue = value === '' ? 0 : parseInt(value, 10);
                    setPriceUzs(numValue);
                  }, () => {})}
                  className="w-full h-14 px-4 pr-16 rounded-lg border-2 border-gray-200
                    text-lg font-semibold cursor-pointer active:border-blue-500 transition-all"
                  placeholder="0"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium text-sm">
                  so'm
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Currency Calculator Tool */}
        <div className="bg-blue-50 rounded-2xl border-2 border-blue-200 p-6 shadow-md">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            💱 {t.currencyCalculator || 'Valyuta kalkulyatori'}
          </h3>
          <p className="text-sm text-blue-700 mb-4">
            {t.calculatorHelper || 'Valyutalarni hisoblash uchun yordamchi vosita'}
          </p>
          <ExchangeCalculator
            exchangeRate={exchangeRate}
            usdValue={calcUsd}
            uzsValue={calcUzs}
            onUsdChange={setCalcUsd}
            onUzsChange={setCalcUzs}
            loading={exchangeLoading}
          />
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-16 bg-blue-500 text-white text-xl font-medium rounded-lg
            active:scale-[0.98] transition-all shadow-md
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full" />
              {t.saving || 'Saqlanmoqda...'}
            </span>
          ) : (
            t.save || 'Saqlash'
          )}
        </button>
      </div>
    </div>
  );
};

export default AccessorySale;
