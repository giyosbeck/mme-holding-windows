import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { useKeyboard } from '../context/KeyboardContext';
import { getFiftyFiftyWithoutSalon, connectSalonToFiftyFifty, getUSDExchangeRate } from '../services/salonApi';
import SalonSelectionModal from '../components/SalonSelectionModal';

const FiftyFiftyNoSalon = () => {
  const navigate = useNavigate();
  const t = useTranslation();
  const { showKeyboard } = useKeyboard();

  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Attachment modal state
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [selectedSalon, setSelectedSalon] = useState(null);
  const [salonMustPay, setSalonMustPay] = useState(0);
  const [salonPaidUsd, setSalonPaidUsd] = useState(0);
  const [salonPaidUzs, setSalonPaidUzs] = useState(0);
  const [description, setDescription] = useState('');
  const [exchangeRate, setExchangeRate] = useState(0);
  const [exchangeLoading, setExchangeLoading] = useState(false);
  const [attaching, setAttaching] = useState(false);
  const [showSalonModal, setShowSalonModal] = useState(false);

  useEffect(() => {
    fetchSales();
    fetchExchangeRate();
  }, []);

  const fetchSales = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getFiftyFiftyWithoutSalon(100, 0);
      setSales(data || []);
      console.log('🔗 50/50 Sales Without Salon:', data);
    } catch (err) {
      console.error('❌ Failed to fetch sales:', err);
      setError('Failed to load sales');
    } finally {
      setLoading(false);
    }
  };

  const fetchExchangeRate = async () => {
    setExchangeLoading(true);
    try {
      const response = await getUSDExchangeRate();
      setExchangeRate(response.usd_rate || 0);
    } catch (err) {
      console.error('❌ Failed to fetch exchange rate:', err);
    } finally {
      setExchangeLoading(false);
    }
  };

  const handleSaleClick = (sale) => {
    setSelectedSale(sale);
    setSelectedSalon(null);
    setSalonMustPay(0);
    setSalonPaidUsd(0);
    setSalonPaidUzs(0);
    setDescription('');
    setShowAttachModal(true);
  };

  const handleAttachSalon = async () => {
    if (!selectedSalon) {
      alert(t.selectSalonFirst || 'Avval salon tanlang');
      return;
    }

    setAttaching(true);

    try {
      await connectSalonToFiftyFifty(selectedSale.id, selectedSalon.id);

      alert(t.successMessage || 'Muvaffaqiyatli saqlandi!');
      setShowAttachModal(false);
      fetchSales(); // Reload list
    } catch (err) {
      console.error('❌ Failed to attach salon:', err);
      alert(t.errorMessage || 'Xatolik yuz berdi');
    } finally {
      setAttaching(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('uz-UZ').format(price || 0) + ' UZS';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '--';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gray-900 mb-4"></div>
          <p className="text-xl text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

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
              {t.salonFiftyFiftyNoSalon || "50/50 salon yo'qlar"}
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

      {/* Sales Count */}
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="text-lg text-gray-600">
          {t.total || 'Jami'}: <span className="font-semibold">{sales.length}</span>
        </div>
      </div>

      {/* Sales List */}
      <div className="max-w-7xl mx-auto px-8 pb-8">
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center text-red-600 mb-6">
            {error}
          </div>
        )}

        {sales.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-16 text-center shadow-md">
            <div className="text-6xl mb-6">🔗</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t.noSalesWithoutSalon || "50/50 sotuv topilmadi"}
            </h2>
            <p className="text-lg text-gray-600">
              {t.noSalesWithoutSalonDesc || "Barcha 50/50 sotuvlar salonga biriktirilgan"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sales.map((sale) => (
              <button
                key={sale.id}
                onClick={() => handleSaleClick(sale)}
                className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-md
                  transition-all active:scale-[0.98] active:border-blue-500 text-left"
              >
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-600">{t.brideName || 'Kelin ismi'}:</span>
                    <p className="text-xl font-semibold text-gray-900">{sale.bride_name}</p>
                  </div>

                  <div>
                    <span className="text-sm text-gray-600">{t.dressName || "Ko'ylak nomi"}:</span>
                    <p className="text-lg font-medium text-gray-900">{sale.dress_name}</p>
                  </div>

                  <div>
                    <span className="text-sm text-gray-600">{t.color || 'Rang'}:</span>
                    <p className="text-base text-gray-900">{sale.dress_color}</p>
                  </div>

                  <div>
                    <span className="text-sm text-gray-600">{t.totalPrice || 'Umumiy narx'}:</span>
                    <p className="text-lg font-semibold text-green-600">
                      {formatPrice(sale.total_price)}
                    </p>
                  </div>

                  <div className="text-sm text-gray-500 pt-2 border-t border-gray-200">
                    📅 {formatDate(sale.created_at)}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                  <span className="text-blue-600 font-medium">
                    🔗 {t.attachSalon || 'Salon biriktirish'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Attach Salon Modal */}
      {showAttachModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-8">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="border-b border-gray-200 p-6 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-2xl font-semibold text-gray-900">
                {t.attachSalon || 'Salon biriktirish'}
              </h2>
              <button
                onClick={() => setShowAttachModal(false)}
                className="w-12 h-12 rounded-full bg-gray-100 text-gray-600
                  flex items-center justify-center text-xl
                  active:scale-[0.98] active:bg-gray-200 transition-all"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Sale Info */}
              <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                <p className="text-sm text-gray-600 mb-1">{t.brideName || 'Kelin ismi'}:</p>
                <p className="text-lg font-semibold text-gray-900">{selectedSale?.bride_name}</p>
                <p className="text-sm text-gray-600 mt-2">{t.dressName || "Ko'ylak"}:</p>
                <p className="text-base text-gray-900">{selectedSale?.dress_name}</p>
              </div>

              {/* Salon Selection */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  {t.selectSalon || 'Salon tanlash'} *
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
                    + {t.selectSalon || 'Salon tanlash'}
                  </button>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  {t.description || 'Tavsif'} ({t.optional || 'Ixtiyoriy'})
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onFocus={() => showKeyboard('text', description, setDescription, () => {})}
                  onClick={() => showKeyboard('text', description, setDescription, () => {})}
                  className="w-full h-32 px-4 py-3 rounded-lg border-2 border-gray-200 text-lg
                    focus:border-blue-500 transition-all resize-none"
                  placeholder={t.enterDescription || 'Tavsif kiriting'}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-6 flex gap-4">
              <button
                onClick={() => setShowAttachModal(false)}
                disabled={attaching}
                className="flex-1 h-14 border-2 border-gray-200 text-gray-700 rounded-lg
                  font-medium active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {t.cancel || 'Bekor qilish'}
              </button>
              <button
                onClick={handleAttachSalon}
                disabled={attaching || !selectedSalon}
                className="flex-1 h-14 bg-blue-500 text-white rounded-lg font-medium
                  active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {attaching ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    {t.saving || 'Saqlanmoqda...'}
                  </span>
                ) : (
                  t.attachSalon || 'Salon biriktirish'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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

export default FiftyFiftyNoSalon;
