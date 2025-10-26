import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { useKeyboard } from '../context/KeyboardContext';
import useAuthStore from '../store/authStore';
import { createDressOrder, getReadyDresses, getUSDExchangeRate } from '../services/salonApi';
import { getImageUrl } from '../services/api';
import ExchangeCalculator from '../components/ExchangeCalculator';
import SalonSelectionModal from '../components/SalonSelectionModal';
import DressSelectionModal from '../components/DressSelectionModal';

const SalonOrderPlacement = () => {
  const navigate = useNavigate();
  const t = useTranslation();
  const { showKeyboard } = useKeyboard();
  const { user } = useAuthStore();

  // Selected items
  const [selectedDress, setSelectedDress] = useState(null);
  const [selectedSalon, setSelectedSalon] = useState(null);

  // Bride information
  const [brideName, setBrideName] = useState('');
  const [bridePhone, setBridePhone] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [shoulderMeasurement, setShoulderMeasurement] = useState('');

  // Custom order details
  const [desiredColor, setDesiredColor] = useState('');
  const [desiredSize, setDesiredSize] = useState('');
  const [designNotes, setDesignNotes] = useState('');
  const [orderCompleteDate, setOrderCompleteDate] = useState('');

  // Payment
  const [totalOrderSum, setTotalOrderSum] = useState(0);
  const [salonMustPay, setSalonMustPay] = useState(0);
  const [salonPaidUsd, setSalonPaidUsd] = useState(0);
  const [salonPaidUzs, setSalonPaidUzs] = useState(0);

  // Calculator tool (separate from payment)
  const [calcUsd, setCalcUsd] = useState(0);
  const [calcUzs, setCalcUzs] = useState(0);

  // Delivery & passport
  const [bridePassportTaken, setBridePassportTaken] = useState(false);
  const [mustBeDeliveredBride, setMustBeDeliveredBride] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState('');

  // UI state
  const [exchangeRate, setExchangeRate] = useState(0);
  const [exchangeLoading, setExchangeLoading] = useState(false);
  const [showDressModal, setShowDressModal] = useState(false);
  const [showSalonModal, setShowSalonModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchExchangeRate();
  }, []);

  // Auto-populate dress details when selected
  useEffect(() => {
    if (selectedDress) {
      setDesiredColor(selectedDress.dress_color || '');
      setShoulderMeasurement(selectedDress.shleft_olchami || '');
    }
  }, [selectedDress]);

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

  const handleDressSelected = (dresses) => {
    if (dresses.length > 0) {
      setSelectedDress(dresses[0]);
      setShowDressModal(false);
    }
  };

  const calculateSalonPayment = () => {
    // Return payment in the currency being used
    return salonPaidUsd > 0 ? salonPaidUsd : salonPaidUzs;
  };

  const calculateSalonDebt = () => {
    const mustPayInCurrency = salonPaidUzs > 0 ? salonMustPay : salonMustPay;
    return Math.max(0, mustPayInCurrency - calculateSalonPayment());
  };

  const handleSave = async () => {
    // Validation
    if (!selectedDress) {
      setError(t.selectDress || "Ko'ylak tanlang");
      return;
    }

    if (!selectedSalon) {
      setError(t.selectSalonFirst || 'Avval salon tanlang');
      return;
    }

    if (!brideName.trim()) {
      setError(t.brideName + ' is required');
      return;
    }

    if (!bridePhone.trim()) {
      setError(t.phoneNumber + ' is required');
      return;
    }

    if (!weddingDate) {
      setError(t.weddingDate + ' is required');
      return;
    }

    if (!shoulderMeasurement) {
      setError(t.shoulderMeasurement + ' is required');
      return;
    }

    if (!desiredColor || !desiredSize) {
      setError('Color and Size are required');
      return;
    }

    if (!orderCompleteDate) {
      setError('Order completion date is required');
      return;
    }

    if (!totalOrderSum || !salonMustPay) {
      setError('Total order sum and salon payment amount are required');
      return;
    }

    if (mustBeDeliveredBride && !deliveryDate) {
      setError('Delivery date is required when delivery is needed');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const orderData = {
        base_dress_id: selectedDress.id,
        customer_salon_id: selectedSalon.id,
        bride_name: brideName,
        bride_phone: bridePhone,
        wedding_date: weddingDate,
        shleft_olchami: shoulderMeasurement,
        color: desiredColor,
        dress_size: desiredSize,
        description: designNotes || '',
        total_order_summ: totalOrderSum,
        salon_must_pay: salonMustPay,
        salon_paid_money_usd: salonPaidUsd,
        salon_paid_money_uzs: salonPaidUzs,
        central_bank_usd_course: exchangeRate,
        order_complate_date: orderCompleteDate,
        bride_passport_taken: bridePassportTaken,
        must_be_delivered_bride: mustBeDeliveredBride,
        must_be_delivered: mustBeDeliveredBride,
        delivery_date: mustBeDeliveredBride ? deliveryDate : null,
        created_by_user: user.id
      };

      console.log('📋 Creating Dress Order:', orderData);

      await createDressOrder(orderData);

      alert(t.successMessage || 'Muvaffaqiyatli saqlandi!');
      navigate('/salon/home');
    } catch (err) {
      console.error('❌ Failed to create dress order:', err);
      setError(err.response?.data?.message || t.errorMessage || 'Xatolik yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('uz-UZ').format(price || 0) + ' UZS';
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
              {t.salonOrderPlacement || 'Buyurtma qilish'}
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

        {/* Step 1: Select Base Dress Template */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            1. {t.selectDress || "Ko'ylak tanlash"} *
          </h2>

          {!selectedDress ? (
            <button
              onClick={() => setShowDressModal(true)}
              className="w-full h-14 border-2 border-gray-200 rounded-lg
                text-gray-600 font-medium
                active:scale-[0.98] active:border-blue-500 transition-all"
            >
              + {t.selectDress || "Ko'ylak tanlash"}
            </button>
          ) : (
            <div className="border-2 border-gray-200 rounded-lg p-4">
              <div className="flex gap-4">
                <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {selectedDress.dress_image ? (
                    <img
                      src={getImageUrl(selectedDress.dress_image)}
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

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
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
                  <p className="text-sm text-gray-600">
                    {t.price || 'Narxi'}: {formatPrice(selectedDress.dress_price)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Bride Information */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            2. {t.brideName || 'Kelin'} ma'lumotlari *
          </h2>

          <div className="space-y-4">
            {/* Bride Name */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                {t.brideName || 'Kelin ismi'} *
              </label>
              <input
                type="text"
                value={brideName}
                onChange={(e) => setBrideName(e.target.value)}
                onFocus={() => showKeyboard('text', brideName, setBrideName, () => {})}
                onClick={() => showKeyboard('text', brideName, setBrideName, () => {})}
                className="w-full h-14 px-4 rounded-lg border-2 border-gray-200 text-lg
                  focus:border-blue-500 transition-all"
                placeholder={t.brideName || 'Kelin ismi'}
              />
            </div>

            {/* Bride Phone */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                {t.phoneNumber || 'Telefon raqami'} *
              </label>
              <input
                type="number"
                value={bridePhone}
                onChange={(e) => setBridePhone(e.target.value)}
                onFocus={() => showKeyboard('number', bridePhone, setBridePhone, () => {})}
                onClick={() => showKeyboard('number', bridePhone, setBridePhone, () => {})}
                className="w-full h-14 px-4 rounded-lg border-2 border-gray-200 text-lg
                  focus:border-blue-500 transition-all"
                placeholder="998901234567"
              />
            </div>

            {/* Wedding Date */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                {t.weddingDate || "To'y sanasi"} *
              </label>
              <input
                type="date"
                value={weddingDate}
                onChange={(e) => setWeddingDate(e.target.value)}
                className="w-full h-14 px-4 rounded-lg border-2 border-gray-200 text-lg
                  active:border-blue-500 transition-all"
              />
            </div>

            {/* Shoulder Measurement */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                {t.shoulderMeasurement || "Shleft o'lchami"} *
              </label>
              <input
                type="text"
                value={shoulderMeasurement}
                onChange={(e) => setShoulderMeasurement(e.target.value)}
                onFocus={() => showKeyboard('text', shoulderMeasurement, setShoulderMeasurement, () => {})}
                onClick={() => showKeyboard('text', shoulderMeasurement, setShoulderMeasurement, () => {})}
                className="w-full h-14 px-4 rounded-lg border-2 border-gray-200 text-lg
                  focus:border-blue-500 transition-all"
                placeholder={t.shoulderMeasurement || "Shleft o'lchami"}
              />
            </div>

            {/* Bride Passport Taken */}
            <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={bridePassportTaken}
                onChange={(e) => setBridePassportTaken(e.target.checked)}
                className="w-6 h-6 rounded border-2 border-gray-300"
              />
              <span className="text-lg text-gray-900">
                Kelin passporti olindi
              </span>
            </label>
          </div>
        </div>

        {/* Step 3: Salon Selection */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            3. {t.selectSalon || 'Salon tanlash'} *
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

        {/* Step 4: Custom Order Details */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            4. Buyurtma tafsilotlari *
          </h2>

          <div className="space-y-4">
            {/* Desired Color */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                {t.color || 'Rang'} *
              </label>
              <input
                type="text"
                value={desiredColor}
                onChange={(e) => setDesiredColor(e.target.value)}
                onFocus={() => showKeyboard('text', desiredColor, setDesiredColor, () => {})}
                onClick={() => showKeyboard('text', desiredColor, setDesiredColor, () => {})}
                className="w-full h-14 px-4 rounded-lg border-2 border-gray-200 text-lg
                  focus:border-blue-500 transition-all"
                placeholder={t.color || 'Rang'}
              />
            </div>

            {/* Desired Size */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                {t.size || "O'lchami"} *
              </label>
              <input
                type="text"
                value={desiredSize}
                onChange={(e) => setDesiredSize(e.target.value)}
                onFocus={() => showKeyboard('text', desiredSize, setDesiredSize, () => {})}
                onClick={() => showKeyboard('text', desiredSize, setDesiredSize, () => {})}
                className="w-full h-14 px-4 rounded-lg border-2 border-gray-200 text-lg
                  focus:border-blue-500 transition-all"
                placeholder={t.size || "O'lchami"}
              />
            </div>

            {/* Order Complete Date */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Buyurtma tayyor bo'lish sanasi *
              </label>
              <input
                type="date"
                value={orderCompleteDate}
                onChange={(e) => setOrderCompleteDate(e.target.value)}
                className="w-full h-14 px-4 rounded-lg border-2 border-gray-200 text-lg
                  active:border-blue-500 transition-all"
              />
            </div>

            {/* Design Notes */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                {t.description || 'Tavsif'} ({t.optional || 'Ixtiyoriy'})
              </label>
              <textarea
                value={designNotes}
                onChange={(e) => setDesignNotes(e.target.value)}
                onFocus={() => showKeyboard('text', designNotes, setDesignNotes, () => {})}
                onClick={() => showKeyboard('text', designNotes, setDesignNotes, () => {})}
                className="w-full h-32 px-4 py-3 rounded-lg border-2 border-gray-200 text-lg
                  focus:border-blue-500 transition-all resize-none"
                placeholder="Maxsus dizayn talablari..."
              />
            </div>
          </div>
        </div>

        {/* Step 5: Payment Details */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            5. To'lov ma'lumotlari *
          </h2>

          <div className="space-y-4">
            {/* Total Order Sum */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Umumiy buyurtma summasi (UZS) *
              </label>
              <input
                type="number"
                value={totalOrderSum}
                onChange={(e) => setTotalOrderSum(Number(e.target.value) || 0)}
                onFocus={() => showKeyboard('number', String(totalOrderSum), (val) => setTotalOrderSum(Number(val)), () => {})}
                onClick={() => showKeyboard('number', String(totalOrderSum), (val) => setTotalOrderSum(Number(val)), () => {})}
                className="w-full h-14 px-4 rounded-lg border-2 border-gray-200 text-lg
                  focus:border-blue-500 transition-all"
                placeholder="0"
              />
            </div>

            {/* Salon Must Pay */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Salon to'lashi kerak (UZS) *
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
            </div>

            {/* Salon Paid */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Salon to'lagan pul
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* USD Input */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">USD</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={salonPaidUsd || ''}
                      onChange={(e) => setSalonPaidUsd(Number(e.target.value) || 0)}
                      onFocus={() => {
                        showKeyboard('number', salonPaidUsd?.toString() || '', (value) => {
                          const numValue = value === '' ? 0 : parseInt(value, 10);
                          setSalonPaidUsd(numValue);
                        }, () => {});
                      }}
                      onClick={() => {
                        showKeyboard('number', salonPaidUsd?.toString() || '', (value) => {
                          const numValue = value === '' ? 0 : parseInt(value, 10);
                          setSalonPaidUsd(numValue);
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
                      value={salonPaidUzs || ''}
                      onChange={(e) => setSalonPaidUzs(Number(e.target.value) || 0)}
                      onFocus={() => {
                        showKeyboard('number', salonPaidUzs?.toString() || '', (value) => {
                          const numValue = value === '' ? 0 : parseInt(value, 10);
                          setSalonPaidUzs(numValue);
                        }, () => {});
                      }}
                      onClick={() => {
                        showKeyboard('number', salonPaidUzs?.toString() || '', (value) => {
                          const numValue = value === '' ? 0 : parseInt(value, 10);
                          setSalonPaidUzs(numValue);
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

            {/* Salon Debt Summary */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-base">
                <span className="text-gray-600">To'lashi kerak:</span>
                <span className="font-semibold">{formatPrice(salonMustPay)}</span>
              </div>
              <div className="flex justify-between text-base">
                <span className="text-gray-600">To'landi:</span>
                <span className="font-semibold text-green-600">{formatPrice(calculateSalonPayment())}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-300">
                <span className="text-gray-900 font-medium">Qarz:</span>
                <span className="font-bold text-red-600">{formatPrice(calculateSalonDebt())}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Currency Calculator Tool */}
        <div className="bg-blue-50 rounded-2xl border-2 border-blue-200 p-6 shadow-md">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            💱 Valyuta kalkulyatori
          </h3>
          <p className="text-sm text-blue-700 mb-4">
            Valyutalarni hisoblash uchun yordamchi vosita
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

        {/* Step 6: Delivery Options */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            6. Yetkazib berish
          </h2>

          <div className="space-y-4">
            {/* Bride Delivery Needed */}
            <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={mustBeDeliveredBride}
                onChange={(e) => setMustBeDeliveredBride(e.target.checked)}
                className="w-6 h-6 rounded border-2 border-gray-300"
              />
              <span className="text-lg text-gray-900">
                Kelinga yetkazib berish kerak
              </span>
            </label>

            {mustBeDeliveredBride && (
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  {t.brideDeliveryDate || 'Kelinga yetkazish sanasi'} *
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

export default SalonOrderPlacement;
