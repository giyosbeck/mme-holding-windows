import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { useKeyboard } from '../context/KeyboardContext';
import useAuthStore from '../store/authStore';
import { createSimpleSale, getUSDExchangeRate, getDressColors } from '../services/salonApi';
import { getImageUrl } from '../services/api';
import ExchangeCalculator from '../components/ExchangeCalculator';
import SalonSelectionModal from '../components/SalonSelectionModal';
import DressSelectionModal from '../components/DressSelectionModal';

const SimpleSale = () => {
  const navigate = useNavigate();
  const t = useTranslation();
  const { showKeyboard } = useKeyboard();
  const { user } = useAuthStore();

  // Selected items
  const [selectedDresses, setSelectedDresses] = useState([]);
  const [selectedSalon, setSelectedSalon] = useState(null);

  // Dress details (indexed by dress.id)
  const [dressDetails, setDressDetails] = useState({});

  // Available colors and sizes
  const [availableColors, setAvailableColors] = useState([]);
  const standardSizes = [30, 60, 80, 100, 150, 300];

  // Delivery options
  const [deliveryNeeded, setDeliveryNeeded] = useState(false);
  const [brideDeliveryDate, setBrideDeliveryDate] = useState('');

  // Payment
  const [paymentUsd, setPaymentUsd] = useState(0);
  const [paymentUzs, setPaymentUzs] = useState(0);

  // Calculator tool (separate from payment)
  const [calcUsd, setCalcUsd] = useState(0);
  const [calcUzs, setCalcUzs] = useState(0);

  // UI state
  const [exchangeRate, setExchangeRate] = useState(0);
  const [exchangeLoading, setExchangeLoading] = useState(false);
  const [showDressModal, setShowDressModal] = useState(false);
  const [showSalonModal, setShowSalonModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchExchangeRate();
    fetchColors();
  }, []);

  const fetchExchangeRate = async () => {
    setExchangeLoading(true);
    try {
      const response = await getUSDExchangeRate();
      setExchangeRate(response.usd_rate || 0);
    } catch (err) {
      console.error('❌ Failed to fetch exchange rate:', err);
      setError('Failed to load exchange rate');
    } finally {
      setExchangeLoading(false);
    }
  };

  const fetchColors = async () => {
    try {
      const colors = await getDressColors();
      setAvailableColors(colors || []);
      console.log('🎨 Available Colors:', colors);
    } catch (err) {
      console.error('❌ Failed to fetch colors:', err);
    }
  };

  const handleDressesSelected = (dresses) => {
    setSelectedDresses(dresses);

    // Initialize dress details for new selections
    const newDetails = { ...dressDetails };
    dresses.forEach(dress => {
      if (!newDetails[dress.id]) {
        newDetails[dress.id] = {
          color: dress.dress_color || '',
          size: dress.dress_shleft_size || '',
          price: dress.dress_price || 0
        };
      }
    });
    setDressDetails(newDetails);
    setShowDressModal(false);
  };

  const updateDressDetail = (dressId, field, value) => {
    setDressDetails(prev => ({
      ...prev,
      [dressId]: {
        ...prev[dressId],
        [field]: value
      }
    }));
  };

  const removeDress = (dressId) => {
    setSelectedDresses(prev => prev.filter(d => d.id !== dressId));
    const newDetails = { ...dressDetails };
    delete newDetails[dressId];
    setDressDetails(newDetails);
  };

  const calculateTotalPrice = () => {
    const totalUsd = selectedDresses.reduce((sum, dress) => {
      const details = dressDetails[dress.id];
      return sum + (details?.price || 0);
    }, 0);

    // If paying in UZS, convert to UZS, otherwise keep in USD
    if (paymentUzs > 0) {
      return Math.round(totalUsd * exchangeRate);
    }
    return totalUsd;
  };

  const calculateTotalPayment = () => {
    // Return payment in the currency being used
    return paymentUsd > 0 ? paymentUsd : paymentUzs;
  };

  const calculateDebt = () => {
    return Math.max(0, calculateTotalPrice() - calculateTotalPayment());
  };

  const handleSave = async () => {
    // Validation
    if (selectedDresses.length === 0) {
      setError(t.selectDress || "Ko'ylak tanlang");
      return;
    }

    if (!selectedSalon) {
      setError(t.selectSalonFirst || 'Avval salon tanlang');
      return;
    }

    // Check if all dresses have required details
    for (const dress of selectedDresses) {
      const details = dressDetails[dress.id];
      if (!details?.color || !details?.size || !details?.price) {
        setError(`${dress.dress_name}: Color, Size, and Price are required`);
        return;
      }
    }

    if (deliveryNeeded && !brideDeliveryDate) {
      setError('Bride delivery date is required when delivery is needed');
      return;
    }

    setSaving(true);
    setError('');

    try {
      // Prepare arrays for API
      const dress_ids = selectedDresses.map(d => d.id);
      const dress_colors = selectedDresses.map(d => dressDetails[d.id].color);
      const dress_sizes = selectedDresses.map(d => dressDetails[d.id].size);
      const dress_prices = selectedDresses.map(d => dressDetails[d.id].price);

      const saleData = {
        dress_ids,
        dress_colors,
        dress_sizes,
        dress_prices,
        customer_salon_id: selectedSalon.id,
        delivery_needed: deliveryNeeded,
        bride_delivery_date: deliveryNeeded ? brideDeliveryDate : null,
        money_usd: paymentUsd,
        money_uzs: paymentUzs,
        central_bank_usd_course: exchangeRate,
        created_by_user: user.id
      };

      console.log('💰 Creating Simple Sale:', saleData);

      await createSimpleSale(saleData);

      alert(t.successMessage || 'Muvaffaqiyatli saqlandi!');
      navigate('/salon/home');
    } catch (err) {
      console.error('❌ Failed to create simple sale:', err);
      setError(err.response?.data?.message || t.errorMessage || 'Xatolik yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  const formatPrice = (price) => {
    // Format based on payment currency
    if (paymentUzs > 0) {
      return new Intl.NumberFormat('uz-UZ').format(price || 0) + ' UZS';
    }
    return '$' + new Intl.NumberFormat('en-US').format(price || 0);
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
              {t.salonSimpleSale || 'Oddiy sotuv'}
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
      <div className="max-w-7xl mx-auto px-8 py-8 space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-red-600">
            {error}
          </div>
        )}

        {/* Step 1: Select Dresses */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              1. {t.selectDress || "Ko'ylak tanlang"}
            </h2>
            <button
              onClick={() => setShowDressModal(true)}
              className="px-6 h-12 bg-blue-500 text-white rounded-lg font-medium
                active:scale-[0.98] transition-all"
            >
              + {t.selectDress || "Ko'ylak tanlash"}
            </button>
          </div>

          {selectedDresses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {t.selectDress || "Ko'ylak tanlang"}
            </div>
          ) : (
            <div className="space-y-4">
              {selectedDresses.map((dress) => (
                <div
                  key={dress.id}
                  className="border-2 border-gray-200 rounded-lg p-4"
                >
                  <div className="flex gap-4">
                    {/* Dress Image */}
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {dress.dress_image && dress.dress_image[0] ? (
                        <img
                          src={getImageUrl(dress.dress_image[0])}
                          alt={dress.dress_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">
                          👗
                        </div>
                      )}
                    </div>

                    {/* Dress Details Form */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {dress.dress_name}
                        </h3>
                        <button
                          onClick={() => removeDress(dress.id)}
                          className="w-10 h-10 rounded-lg bg-red-500 text-white
                            flex items-center justify-center
                            active:scale-[0.98] transition-all"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        {/* Color */}
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            {t.color || 'Rang'} *
                          </label>
                          <select
                            value={dressDetails[dress.id]?.color || ''}
                            onChange={(e) => updateDressDetail(dress.id, 'color', e.target.value)}
                            className="w-full h-12 px-3 rounded-lg border-2 border-gray-200
                              active:border-blue-500 transition-all bg-white"
                          >
                            <option value="">{t.selectColor || 'Rang tanlang'}</option>
                            {availableColors.map((colorObj, idx) => (
                              <option key={idx} value={colorObj.dress_color}>
                                {colorObj.dress_color}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Size */}
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            {t.size || "O'lchami"} (sm) *
                          </label>
                          <select
                            value={dressDetails[dress.id]?.size || ''}
                            onChange={(e) => updateDressDetail(dress.id, 'size', Number(e.target.value))}
                            className="w-full h-12 px-3 rounded-lg border-2 border-gray-200
                              active:border-blue-500 transition-all bg-white"
                          >
                            <option value="">{t.selectSize || "O'lcham tanlang"}</option>
                            {standardSizes.map((size) => (
                              <option key={size} value={size}>
                                {size} sm
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Price */}
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            {t.price || 'Narxi'} (USD) *
                          </label>
                          <input
                            type="text"
                            value={dressDetails[dress.id]?.price || ''}
                            readOnly
                            onFocus={(e) => {
                              e.target.blur();
                              showKeyboard(
                                'number',
                                String(dressDetails[dress.id]?.price || ''),
                                (value) => updateDressDetail(dress.id, 'price', Number(value)),
                                () => {}
                              );
                            }}
                            onClick={() =>
                              showKeyboard(
                                'number',
                                String(dressDetails[dress.id]?.price || ''),
                                (value) => updateDressDetail(dress.id, 'price', Number(value)),
                                () => {}
                              )
                            }
                            className="w-full h-12 px-3 rounded-lg border-2 border-gray-200
                              cursor-pointer active:border-blue-500 transition-all"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Step 2: Select Salon */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            2. {t.selectSalon || 'Salon tanlash'} *
          </h2>
          {selectedSalon ? (
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{selectedSalon.salon_name}</p>
                <p className="text-sm text-gray-600">{selectedSalon.customer_name}</p>
              </div>
              <button
                onClick={() => setSelectedSalon(null)}
                className="w-12 h-12 rounded-lg bg-red-500 text-white
                  flex items-center justify-center
                  active:scale-[0.98] transition-all"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSalonModal(true)}
              className="w-full h-14 border-2 border-gray-200 rounded-lg
                text-gray-600 font-medium
                active:scale-[0.98] active:border-blue-500 transition-all"
            >
              + {t.selectSalon || 'Salon tanlash'}
            </button>
          )}
        </div>

        {/* Step 3: Delivery Options */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            3. {t.deliveryNeeded || 'Yetkazib berish'}
          </h2>

          {/* Delivery Needed Checkbox */}
          <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer mb-4">
            <input
              type="checkbox"
              checked={deliveryNeeded}
              onChange={(e) => setDeliveryNeeded(e.target.checked)}
              className="w-6 h-6 rounded border-2 border-gray-300"
            />
            <span className="text-lg text-gray-900">
              {t.deliveryNeeded || 'Yetkazib berish kerak'}
            </span>
          </label>

          {deliveryNeeded && (
            <div className="space-y-4">
              {/* Bride Delivery Date */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  {t.brideDeliveryDate || 'Kelinga yetkazish sanasi'} *
                </label>
                <input
                  type="date"
                  value={brideDeliveryDate}
                  onChange={(e) => setBrideDeliveryDate(e.target.value)}
                  className="w-full h-14 px-4 rounded-lg border-2 border-gray-200 text-lg
                    active:border-blue-500 transition-all"
                />
              </div>
            </div>
          )}
        </div>

        {/* Step 4: Payment */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            4. {t.paymentAmount || "To'langan pul"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* USD Payment Input */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                {t.usd || 'USD'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={paymentUsd || ''}
                  readOnly
                  onFocus={(e) => {
                    e.target.blur();
                    showKeyboard('number', paymentUsd?.toString() || '', (value) => {
                      const numValue = value === '' ? 0 : parseInt(value, 10);
                      setPaymentUsd(numValue);
                    }, () => {});
                  }}
                  onClick={() => {
                    showKeyboard('number', paymentUsd?.toString() || '', (value) => {
                      const numValue = value === '' ? 0 : parseInt(value, 10);
                      setPaymentUsd(numValue);
                    }, () => {});
                  }}
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

            {/* UZS Payment Input */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                {t.uzs || 'UZS'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={paymentUzs ? new Intl.NumberFormat('uz-UZ').format(paymentUzs) : ''}
                  readOnly
                  onFocus={(e) => {
                    e.target.blur();
                    showKeyboard('number', paymentUzs?.toString() || '', (value) => {
                      const numValue = value === '' ? 0 : parseInt(value, 10);
                      setPaymentUzs(numValue);
                    }, () => {});
                  }}
                  onClick={() => {
                    showKeyboard('number', paymentUzs?.toString() || '', (value) => {
                      const numValue = value === '' ? 0 : parseInt(value, 10);
                      setPaymentUzs(numValue);
                    }, () => {});
                  }}
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

        {/* Summary */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {t.total || 'Jami'}
          </h2>
          <div className="space-y-3 text-lg">
            <div className="flex justify-between">
              <span className="text-gray-600">{t.totalPrice || 'Umumiy narx'}:</span>
              <span className="font-semibold text-gray-900">{formatPrice(calculateTotalPrice())}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t.paid || "To'landi"}:</span>
              <span className="font-semibold text-green-600">{formatPrice(calculateTotalPayment())}</span>
            </div>
            <div className="flex justify-between pt-3 border-t-2 border-gray-200">
              <span className="text-gray-900 font-medium">{t.debt || 'Qarz'}:</span>
              <span className="font-bold text-red-600">{formatPrice(calculateDebt())}</span>
            </div>
          </div>
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
            t.confirm || 'Tasdiqlash'
          )}
        </button>
      </div>

      {/* Dress Selection Modal */}
      <DressSelectionModal
        isOpen={showDressModal}
        onClose={() => setShowDressModal(false)}
        onSelect={handleDressesSelected}
        multiSelect={true}
        initialSelected={selectedDresses}
      />

      {/* Salon Selection Modal */}
      <SalonSelectionModal
        isOpen={showSalonModal}
        onClose={() => setShowSalonModal(false)}
        onSelect={(salon) => {
          setSelectedSalon(salon);
          setShowSalonModal(false);
        }}
      />
    </div>
  );
};

export default SimpleSale;
