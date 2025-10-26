import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { useKeyboard } from '../context/KeyboardContext';
import useAuthStore from '../store/authStore';
import { createFiftyFiftySale, getUSDExchangeRate, getDressColors } from '../services/salonApi';
import { getImageUrl } from '../services/api';
import ExchangeCalculator from '../components/ExchangeCalculator';
import SalonSelectionModal from '../components/SalonSelectionModal';
import DressSelectionModal from '../components/DressSelectionModal';

const FiftyFiftySale = () => {
  const navigate = useNavigate();
  const t = useTranslation();
  const { showKeyboard } = useKeyboard();
  const { user } = useAuthStore();

  // Dress selection
  const [selectedDress, setSelectedDress] = useState(null);
  const [dressColor, setDressColor] = useState('');
  const [dressSize, setDressSize] = useState('');
  const [basePrice, setBasePrice] = useState(0); // Original price
  const [dressPrice, setDressPrice] = useState(0); // Current/final price

  // Available options
  const [availableColors, setAvailableColors] = useState([]);
  const standardSizes = [30, 60, 80, 100, 150, 300];

  // Bride info
  const [brideName, setBrideName] = useState('');
  const [brideMustPay, setBrideMustPay] = useState(0);
  const [brideGivenMoneyUsd, setBrideGivenMoneyUsd] = useState(0);
  const [brideGivenMoneyUzs, setBrideGivenMoneyUzs] = useState(0);

  // Salon participation
  const [salonMustPay, setSalonMustPay] = useState(0);
  const [selectedSalon, setSelectedSalon] = useState(null);
  const [salonGivenMoneyUsd, setSalonGivenMoneyUsd] = useState(0);
  const [salonGivenMoneyUzs, setSalonGivenMoneyUzs] = useState(0);

  // Additional options
  const [passportTaken, setPassportTaken] = useState(false);
  const [deliveryNeeded, setDeliveryNeeded] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [description, setDescription] = useState('');

  // Calculator tool (separate from payments)
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

  // Auto-populate dress details when dress is selected
  useEffect(() => {
    if (selectedDress) {
      setDressColor(selectedDress.dress_color || '');
      setDressSize(selectedDress.dress_shleft_size || '');
      setBasePrice(selectedDress.dress_price || 0);
      setDressPrice(selectedDress.dress_price || 0);
    }
  }, [selectedDress]);

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

  const fetchColors = async () => {
    try {
      const colors = await getDressColors();
      setAvailableColors(colors || []);
    } catch (err) {
      console.error('❌ Failed to fetch colors:', err);
    }
  };

  const handleDressSelected = (dresses) => {
    if (dresses.length > 0) {
      setSelectedDress(dresses[0]); // Only take first one for 50/50
      setShowDressModal(false);
    }
  };

  // Calculate bride given money (in USD equivalent)
  const getBrideGivenTotalUsd = () => {
    return brideGivenMoneyUsd + (brideGivenMoneyUzs / (exchangeRate || 1));
  };

  // Calculate salon given money (in USD equivalent)
  const getSalonGivenTotalUsd = () => {
    return salonGivenMoneyUsd + (salonGivenMoneyUzs / (exchangeRate || 1));
  };

  // Check if bride has debt
  const brideHasDebt = () => {
    return getBrideGivenTotalUsd() < brideMustPay;
  };

  // Check if salon has debt
  const salonHasDebt = () => {
    if (salonMustPay === 0) return false;
    return getSalonGivenTotalUsd() < salonMustPay;
  };

  // Calculate bride debt
  const calculateBrideDebt = () => {
    const givenInUsd = getBrideGivenTotalUsd();
    return Math.max(0, brideMustPay - givenInUsd);
  };

  // Calculate salon debt
  const calculateSalonDebt = () => {
    if (salonMustPay === 0) return 0;
    const givenInUsd = getSalonGivenTotalUsd();
    return Math.max(0, salonMustPay - givenInUsd);
  };

  // Calculate total paid (in USD)
  const calculateTotalPaid = () => {
    return getBrideGivenTotalUsd() + getSalonGivenTotalUsd();
  };

  // Calculate total debt (in USD)
  const calculateTotalDebt = () => {
    return calculateBrideDebt() + calculateSalonDebt();
  };

  // Format bride payment in the currency they used
  const formatBridePayment = () => {
    if (brideGivenMoneyUzs > 0) {
      return new Intl.NumberFormat('uz-UZ').format(brideGivenMoneyUzs) + ' UZS';
    }
    return '$' + new Intl.NumberFormat('en-US').format(brideGivenMoneyUsd);
  };

  // Format salon payment in the currency they used
  const formatSalonPayment = () => {
    if (salonGivenMoneyUzs > 0) {
      return new Intl.NumberFormat('uz-UZ').format(salonGivenMoneyUzs) + ' UZS';
    }
    return '$' + new Intl.NumberFormat('en-US').format(salonGivenMoneyUsd);
  };

  const handleSave = async () => {
    // Validation
    if (!selectedDress) {
      setError("Ko'ylak tanlang");
      return;
    }

    if (!dressColor) {
      setError("Ko'ylak rangini tanlang");
      return;
    }

    if (!dressSize) {
      setError("Ko'ylak o'lchamini tanlang");
      return;
    }

    if (!dressPrice || dressPrice === 0) {
      setError("Ko'ylak narxini kiriting");
      return;
    }

    if (!brideName.trim()) {
      setError('Kelin ismini kiriting');
      return;
    }

    if (brideMustPay === 0) {
      setError('Kelin beradigan pul miqdorini kiriting');
      return;
    }

    if (brideGivenMoneyUsd === 0 && brideGivenMoneyUzs === 0) {
      setError('Kelin bergan pul miqdorini kiriting');
      return;
    }

    // Validate total: brideMustPay + salonMustPay should equal dressPrice
    const totalMustPay = brideMustPay + salonMustPay;
    if (Math.abs(totalMustPay - dressPrice) > 0.01) {
      setError(`Xatolik: Kelin va salon beradigan pul (${totalMustPay}$) ko'ylak narxiga (${dressPrice}$) teng bo'lishi kerak!`);
      return;
    }

    // If salon participates
    if (salonMustPay > 0) {
      if (!selectedSalon) {
        setError('Salonni tanlang');
        return;
      }

      if (salonGivenMoneyUsd === 0 && salonGivenMoneyUzs === 0) {
        setError('Salon bergan pul miqdorini kiriting');
        return;
      }
    }

    if (deliveryNeeded && !deliveryDate) {
      setError('Yetkazish sanasini kiriting');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const saleData = {
        dress_id: selectedDress.id,
        dress_name: selectedDress.dress_name,
        dress_color: dressColor,
        shleft_size: dressSize,
        base_price: basePrice,
        price: dressPrice,
        bride_name: brideName,
        bride_passport_taken: passportTaken,
        bride_must_be_delivered: deliveryNeeded,
        money_bride_usd: brideGivenMoneyUsd,
        money_bride_uzs: brideGivenMoneyUzs,
        bride_must_pay: brideMustPay,
        customer_salon_id: salonMustPay > 0 ? selectedSalon?.id : null,
        money_salon_usd: salonMustPay > 0 ? salonGivenMoneyUsd : 0,
        money_salon_uzs: salonMustPay > 0 ? salonGivenMoneyUzs : 0,
        salon_must_pay: salonMustPay,
        delivery_date: deliveryNeeded ? deliveryDate : null,
        date_gives_debt_bride: brideHasDebt() ? null : null, // TODO: Add debt date input if needed
        date_gives_debt_salon: salonHasDebt() ? null : null, // TODO: Add debt date input if needed
        central_bank_usd_course: exchangeRate,
        created_by_user: user.id,
        description: description || ''
      };

      console.log('🤝 Creating 50/50 Sale:', saleData);

      await createFiftyFiftySale(saleData);

      alert(t.successMessage || 'Muvaffaqiyatli saqlandi!');
      navigate('/salon/home');
    } catch (err) {
      console.error('❌ Failed to create 50/50 sale:', err);
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
              {t.salonFiftyFiftySale || '50/50 sotuv'}
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

        {/* Dress Selection */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Ko'ylak tanlash *
          </h2>

          {!selectedDress ? (
            <button
              onClick={() => setShowDressModal(true)}
              className="w-full h-14 border-2 border-gray-200 rounded-lg
                text-gray-600 font-medium
                active:scale-[0.98] active:border-blue-500 transition-all"
            >
              + Ko'ylak tanlash
            </button>
          ) : (
            <div className="border-2 border-gray-200 rounded-lg p-4">
              <div className="flex gap-4">
                {/* Dress Image */}
                <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {selectedDress.dress_image && selectedDress.dress_image[0] ? (
                    <img
                      src={getImageUrl(selectedDress.dress_image[0])}
                      alt={selectedDress.dress_name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      👗
                    </div>
                  )}
                </div>

                {/* Dress Details */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {selectedDress.dress_name}
                    </h3>
                    <button
                      onClick={() => setSelectedDress(null)}
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
                      <label className="block text-sm text-gray-600 mb-1">Rang *</label>
                      <select
                        value={dressColor}
                        onChange={(e) => setDressColor(e.target.value)}
                        className="w-full h-12 px-3 rounded-lg border-2 border-gray-200
                          active:border-blue-500 transition-all bg-white"
                      >
                        <option value="">Tanlang</option>
                        {availableColors.map((colorObj, idx) => (
                          <option key={idx} value={colorObj.dress_color}>
                            {colorObj.dress_color}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Size */}
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">O'lchami (sm) *</label>
                      <select
                        value={dressSize}
                        onChange={(e) => setDressSize(Number(e.target.value))}
                        className="w-full h-12 px-3 rounded-lg border-2 border-gray-200
                          active:border-blue-500 transition-all bg-white"
                      >
                        <option value="">Tanlang</option>
                        {standardSizes.map((size) => (
                          <option key={size} value={size}>
                            {size} sm
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Price */}
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Narxi (USD) *</label>
                      <input
                        type="number"
                        value={dressPrice}
                        onChange={(e) => setDressPrice(Number(e.target.value) || 0)}
                        onFocus={() => showKeyboard('number', String(dressPrice), (val) => setDressPrice(Number(val)), () => {})}
                        onClick={() => showKeyboard('number', String(dressPrice), (val) => setDressPrice(Number(val)), () => {})}
                        className="w-full h-12 px-3 rounded-lg border-2 border-gray-200
                          focus:border-blue-500 transition-all"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bride Information */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Kelin ma'lumotlari
          </h2>

          <div className="space-y-4">
            {/* Bride Name */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Kelin ismi *
              </label>
              <input
                type="text"
                value={brideName}
                onChange={(e) => setBrideName(e.target.value)}
                onFocus={() => showKeyboard('text', brideName, setBrideName, () => {})}
                onClick={() => showKeyboard('text', brideName, setBrideName, () => {})}
                className="w-full h-14 px-4 rounded-lg border-2 border-gray-200 text-lg
                  focus:border-blue-500 transition-all"
                placeholder="Kelin ismi"
              />
            </div>

            {/* Bride Must Pay */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Kelin beradigan pul (USD) *
              </label>
              <input
                type="number"
                value={brideMustPay}
                onChange={(e) => setBrideMustPay(Number(e.target.value) || 0)}
                onFocus={() => showKeyboard('number', String(brideMustPay), (val) => setBrideMustPay(Number(val)), () => {})}
                onClick={() => showKeyboard('number', String(brideMustPay), (val) => setBrideMustPay(Number(val)), () => {})}
                className="w-full h-14 px-4 rounded-lg border-2 border-gray-200 text-lg
                  focus:border-blue-500 transition-all"
                placeholder="0"
              />
            </div>

            {/* Bride Given Money */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Kelin bergan pul *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* USD Input */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">USD</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={brideGivenMoneyUsd || ''}
                      onChange={(e) => setBrideGivenMoneyUsd(Number(e.target.value) || 0)}
                      onFocus={() => {
                        showKeyboard('number', brideGivenMoneyUsd?.toString() || '', (value) => {
                          const numValue = value === '' ? 0 : parseInt(value, 10);
                          setBrideGivenMoneyUsd(numValue);
                        }, () => {});
                      }}
                      onClick={() => {
                        showKeyboard('number', brideGivenMoneyUsd?.toString() || '', (value) => {
                          const numValue = value === '' ? 0 : parseInt(value, 10);
                          setBrideGivenMoneyUsd(numValue);
                        }, () => {});
                      }}
                      className="w-full h-14 px-4 pr-12 rounded-lg border-2 border-gray-200
                        text-lg font-semibold focus:border-blue-500 transition-all"
                      placeholder="0"
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                      $
                    </div>
                  </div>
                </div>

                {/* UZS Input */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">UZS</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={brideGivenMoneyUzs || ''}
                      onChange={(e) => setBrideGivenMoneyUzs(Number(e.target.value) || 0)}
                      onFocus={() => {
                        showKeyboard('number', brideGivenMoneyUzs?.toString() || '', (value) => {
                          const numValue = value === '' ? 0 : parseInt(value, 10);
                          setBrideGivenMoneyUzs(numValue);
                        }, () => {});
                      }}
                      onClick={() => {
                        showKeyboard('number', brideGivenMoneyUzs?.toString() || '', (value) => {
                          const numValue = value === '' ? 0 : parseInt(value, 10);
                          setBrideGivenMoneyUzs(numValue);
                        }, () => {});
                      }}
                      className="w-full h-14 px-4 pr-16 rounded-lg border-2 border-gray-200
                        text-lg font-semibold focus:border-blue-500 transition-all"
                      placeholder="0"
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium text-sm">
                      so'm
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Salon Participation */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Salon ishtiroki
          </h2>

          {/* Salon Must Pay Input */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Salon beradigan pul (USD)
            </label>
            <input
              type="number"
              value={salonMustPay}
              onChange={(e) => setSalonMustPay(Number(e.target.value) || 0)}
              onFocus={() => showKeyboard('number', String(salonMustPay), (val) => setSalonMustPay(Number(val)), () => {})}
              onClick={() => showKeyboard('number', String(salonMustPay), (val) => setSalonMustPay(Number(val)), () => {})}
              className="w-full h-14 px-4 rounded-lg border-2 border-gray-200 text-lg
                focus:border-blue-500 transition-all"
              placeholder="0"
            />
            <p className="text-sm text-gray-600 mt-2">
              0 dan katta bo'lsa, salon ma'lumotlari ko'rinadi
            </p>
          </div>

          {/* Salon Details (Only show if salonMustPay > 0) */}
          {salonMustPay > 0 && (
            <div className="space-y-4 pt-4 border-t-2 border-gray-200">
              {/* Salon Selection */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Salon *
                </label>
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
                    + Salon tanlash
                  </button>
                )}
              </div>

              {/* Salon Given Money */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Salon bergan pul *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* USD Input */}
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">USD</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={salonGivenMoneyUsd || ''}
                        onChange={(e) => setSalonGivenMoneyUsd(Number(e.target.value) || 0)}
                        onFocus={() => {
                          showKeyboard('number', salonGivenMoneyUsd?.toString() || '', (value) => {
                            const numValue = value === '' ? 0 : parseInt(value, 10);
                            setSalonGivenMoneyUsd(numValue);
                          }, () => {});
                        }}
                        onClick={() => {
                          showKeyboard('number', salonGivenMoneyUsd?.toString() || '', (value) => {
                            const numValue = value === '' ? 0 : parseInt(value, 10);
                            setSalonGivenMoneyUsd(numValue);
                          }, () => {});
                        }}
                        className="w-full h-14 px-4 pr-12 rounded-lg border-2 border-gray-200
                          text-lg font-semibold focus:border-blue-500 transition-all"
                        placeholder="0"
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                        $
                      </div>
                    </div>
                  </div>

                  {/* UZS Input */}
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">UZS</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={salonGivenMoneyUzs || ''}
                        onChange={(e) => setSalonGivenMoneyUzs(Number(e.target.value) || 0)}
                        onFocus={() => {
                          showKeyboard('number', salonGivenMoneyUzs?.toString() || '', (value) => {
                            const numValue = value === '' ? 0 : parseInt(value, 10);
                            setSalonGivenMoneyUzs(numValue);
                          }, () => {});
                        }}
                        onClick={() => {
                          showKeyboard('number', salonGivenMoneyUzs?.toString() || '', (value) => {
                            const numValue = value === '' ? 0 : parseInt(value, 10);
                            setSalonGivenMoneyUzs(numValue);
                          }, () => {});
                        }}
                        className="w-full h-14 px-4 pr-16 rounded-lg border-2 border-gray-200
                          text-lg font-semibold focus:border-blue-500 transition-all"
                        placeholder="0"
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium text-sm">
                        so'm
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Additional Options */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Qo'shimcha ma'lumotlar
          </h2>

          <div className="space-y-4">
            {/* Passport Checkbox */}
            <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={passportTaken}
                onChange={(e) => setPassportTaken(e.target.checked)}
                className="w-6 h-6 rounded border-2 border-gray-300"
              />
              <span className="text-lg text-gray-900">
                Kelin passporti olindi
              </span>
            </label>

            {/* Delivery Checkbox */}
            <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={deliveryNeeded}
                onChange={(e) => setDeliveryNeeded(e.target.checked)}
                className="w-6 h-6 rounded border-2 border-gray-300"
              />
              <span className="text-lg text-gray-900">
                Yetkazib berish kerak
              </span>
            </label>

            {/* Delivery Date (only if delivery needed) */}
            {deliveryNeeded && (
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Yetkazish sanasi *
                </label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full h-14 px-4 rounded-lg border-2 border-gray-200 text-lg
                    active:border-blue-500 transition-all"
                />
              </div>
            )}
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
            {/* Dress Price */}
            <div className="flex justify-between">
              <span className="text-gray-600">Ko'ylak narxi:</span>
              <span className="font-semibold text-gray-900">
                ${new Intl.NumberFormat('en-US').format(dressPrice)}
              </span>
            </div>

            {/* Bride Payment */}
            <div className="flex justify-between">
              <span className="text-gray-600">Kelin to'ladi:</span>
              <span className="font-semibold text-green-600">
                {formatBridePayment()}
              </span>
            </div>

            {/* Bride Debt */}
            <div className="flex justify-between">
              <span className="text-gray-600">Kelin qarzi:</span>
              <span className="font-semibold text-red-600">
                ${new Intl.NumberFormat('en-US').format(calculateBrideDebt())}
              </span>
            </div>

            {/* Salon Payment & Debt (only if salon participates) */}
            {salonMustPay > 0 && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Salon to'ladi:</span>
                  <span className="font-semibold text-green-600">
                    {formatSalonPayment()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Salon qarzi:</span>
                  <span className="font-semibold text-red-600">
                    ${new Intl.NumberFormat('en-US').format(calculateSalonDebt())}
                  </span>
                </div>
              </>
            )}

            {/* Totals */}
            <div className="flex justify-between pt-3 border-t-2 border-gray-200">
              <span className="text-gray-900 font-medium">Jami to'landi:</span>
              <span className="font-bold text-green-600">
                ${new Intl.NumberFormat('en-US').format(calculateTotalPaid())}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-900 font-medium">{t.debt || 'Jami qarz'}:</span>
              <span className="font-bold text-red-600">
                ${new Intl.NumberFormat('en-US').format(calculateTotalDebt())}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-md">
          <label className="block text-gray-700 font-medium mb-2">
            Izoh (Ixtiyoriy)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onFocus={() => showKeyboard('text', description, setDescription, () => {})}
            onClick={() => showKeyboard('text', description, setDescription, () => {})}
            className="w-full h-32 px-4 py-3 rounded-lg border-2 border-gray-200 text-lg
              focus:border-blue-500 transition-all resize-none"
            placeholder="Izoh yozing..."
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
            t.confirm || 'Tasdiqlash'
          )}
        </button>
      </div>

      {/* Dress Selection Modal (single select) */}
      <DressSelectionModal
        isOpen={showDressModal}
        onClose={() => setShowDressModal(false)}
        onSelect={handleDressSelected}
        multiSelect={false}
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

export default FiftyFiftySale;
