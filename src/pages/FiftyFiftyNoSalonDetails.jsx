import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { useKeyboard } from '../context/KeyboardContext';
import { getFiftyFiftyNoSalonDetails, connectSalonToFiftyFifty, getUSDExchangeRate } from '../services/salonApi';
import { getImageUrl } from '../services/api';
import SalonSelectionModal from '../components/SalonSelectionModal';
import FullscreenImageViewer from '../components/FullscreenImageViewer';

const FiftyFiftyNoSalonDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const t = useTranslation();
  const { showKeyboard } = useKeyboard();


  const [saleData, setSaleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('gallery'); // 'gallery' or 'about'

  // Image viewer state
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Attach salon modal state
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [showSalonModal, setShowSalonModal] = useState(false);
  const [selectedSalon, setSelectedSalon] = useState(null);
  const [salonMustPay, setSalonMustPay] = useState(0);
  const [exchangeRate, setExchangeRate] = useState(0);
  const [moneySalonUsd, setMoneySalonUsd] = useState('');
  const [moneySalonUzs, setMoneySalonUzs] = useState('');
  const [dateGivesDebt, setDateGivesDebt] = useState('');
  const [description, setDescription] = useState('');
  const [attaching, setAttaching] = useState(false);

  useEffect(() => {
    fetchSaleDetails();
    fetchExchangeRate();
  }, [id]);

  const fetchSaleDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getFiftyFiftyNoSalonDetails(id);
      setSaleData(data);

      // Calculate salon must pay: sold_price - bride_must_pay
      if (data.given_money_bride) {
        const salonMust = data.sold_price - data.given_money_bride.bride_must_pay;
        setSalonMustPay(salonMust);
      }

      console.log('🔗 50/50 Sale Without Salon Details Response:', data);
      console.log('📋 Available fields:', Object.keys(data));
    } catch (err) {
      console.error('❌ Failed to fetch sale details:', err);
      setError('Failed to load sale details');
    } finally {
      setLoading(false);
    }
  };

  const fetchExchangeRate = async () => {
    try {
      const response = await getUSDExchangeRate();
      setExchangeRate(response.usd_rate || 0);
    } catch (err) {
      console.error('❌ Failed to fetch exchange rate:', err);
    }
  };

  const handleImageClick = (index) => {
    setCurrentImageIndex(index);
    setFullscreenImage(true);
  };

  const handleAttachSalon = async () => {
    if (!selectedSalon) {
      alert(t.selectSalonFirst || 'Avval salon tanlang');
      return;
    }

    // Validate payment amounts
    const usd = parseFloat(moneySalonUsd) || 0;
    const uzs = parseFloat(moneySalonUzs) || 0;
    const totalPaidUsd = usd + (uzs / exchangeRate);

    if (totalPaidUsd > salonMustPay) {
      alert(t.overpaymentError || "Siz keragidan ko'p to'layapsiz!");
      return;
    }

    // Check if debt date is required (when not paying in full)
    if (totalPaidUsd < salonMustPay && !dateGivesDebt) {
      alert(t.debtDateRequired || "To'liq to'lanmasa, qarz sanasini kiriting");
      return;
    }

    setAttaching(true);

    try {
      const data = {
        sale50_id: id,
        customer_salon_id: selectedSalon.id,
        salon_must_pay: salonMustPay,
        central_bank_usd_course: exchangeRate,
        money_salon_usd: usd,
        money_salon_uzs: uzs,
        date_gives_debt: dateGivesDebt || undefined,
        description: description || ''
      };

      await connectSalonToFiftyFifty(data);
      alert(t.successMessage || 'Muvaffaqiyatli saqlandi!');
      navigate('/salon/fifty-fifty-no-salon');
    } catch (err) {
      console.error('❌ Failed to attach salon:', err);
      alert(t.errorMessage || 'Xatolik yuz berdi');
    } finally {
      setAttaching(false);
    }
  };

  const formatPrice = (price) => {
    return '$' + new Intl.NumberFormat('en-US').format(price || 0);
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

  if (error || !saleData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6">⚠️</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">{error || 'Sale not found'}</h2>
          <button
            onClick={() => navigate('/salon/fifty-fifty-no-salon')}
            className="h-14 px-8 bg-gray-900 text-white rounded-lg active:scale-[0.98] transition-all"
          >
            {t.back || 'Orqaga'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-3 flex justify-between items-center">
          <button
            onClick={() => navigate('/salon/fifty-fifty-no-salon')}
            className="text-2xl font-semibold text-gray-900 flex items-center gap-2
              active:scale-95 transition-transform"
          >
            ← {t.saleDetails || 'Sotuv tafsilotlari'}
          </button>

          <button
            onClick={() => navigate('/profile')}
            className="w-14 h-14 rounded-full bg-gray-900 active:bg-gray-700
              flex items-center justify-center text-2xl transition-colors"
          >
            👤
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-6">
        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-md
              ${activeTab === 'gallery'
                ? 'bg-blue-600 text-white'
                : 'bg-white border-2 border-gray-200 text-gray-700 active:scale-[0.98] active:border-blue-500'
              }`}
          >
            {t.gallery || 'Gallery'}
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-md
              ${activeTab === 'about'
                ? 'bg-blue-600 text-white'
                : 'bg-white border-2 border-gray-200 text-gray-700 active:scale-[0.98] active:border-blue-500'
              }`}
          >
            {t.about || 'About'}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'gallery' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {saleData.dress_images && saleData.dress_images.length > 0 ? (
              saleData.dress_images.map((image, index) => (
                <div
                  key={index}
                  className="relative bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-md group"
                >
                  <div
                    className="h-96 cursor-pointer"
                    onClick={() => handleImageClick(index)}
                  >
                    <img
                      src={getImageUrl(image)}
                      alt={`${saleData.dress_name} - ${index + 1}`}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-white rounded-2xl border-2 border-gray-200 p-16 text-center">
                <div className="text-6xl mb-6">📷</div>
                <p className="text-xl text-gray-600">{t.noImages || 'Rasmlar mavjud emas'}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'about' && (
          <div className="space-y-6">
            {/* Sale Details Card */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-md">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {t.saleInformation || "Sotuv ma'lumotlari"}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bride Name */}
                <div>
                  <span className="text-gray-600">{t.brideName || 'Kelin ismi'}:</span>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {saleData.bride_name}
                  </p>
                </div>

                {/* Dress Name */}
                <div>
                  <span className="text-gray-600">{t.dressName || "Ko'ylak nomi"}:</span>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {saleData.dress_name}
                  </p>
                </div>

                {/* Color */}
                <div>
                  <span className="text-gray-600">{t.color || 'Rang'}:</span>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {saleData.dress_color}
                  </p>
                </div>

                {/* Shleft Size */}
                <div>
                  <span className="text-gray-600">{t.size || "Shleft o'lchami"}:</span>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {saleData.shleft_size}
                  </p>
                </div>

                {/* Base/Production Price */}
                <div>
                  <span className="text-gray-600">{t.basePrice || 'Ishlab chiqarish narxi'}:</span>
                  <p className="text-lg font-semibold text-blue-600 mt-1">
                    {formatPrice(saleData.base_price)}
                  </p>
                </div>

                {/* Sold Price */}
                <div>
                  <span className="text-gray-600">{t.soldPrice || 'Sotilgan narxi'}:</span>
                  <p className="text-lg font-semibold text-green-600 mt-1">
                    {formatPrice(saleData.sold_price)}
                  </p>
                </div>

                {/* Money Bride Gave */}
                {saleData.given_money_bride && (
                  <div>
                    <span className="text-gray-600">{t.moneyBrideGave || 'Kelin bergan pul'}:</span>
                    <p className="text-lg font-semibold text-green-600 mt-1">
                      {formatPrice(saleData.given_money_bride.given_money_bride)}
                    </p>
                  </div>
                )}

                {/* Bride Remaining Debt (Qolgan pul) */}
                {saleData.given_money_bride && (
                  <div>
                    <span className="text-gray-600">{t.brideRemainingDebt || 'Qolgan pul (kelin qarzi)'}:</span>
                    <p className="text-lg font-semibold text-red-600 mt-1">
                      {formatPrice(saleData.given_money_bride.bride_must_pay - saleData.given_money_bride.given_money_bride)}
                    </p>
                  </div>
                )}

                {/* Sold Date */}
                <div>
                  <span className="text-gray-600">{t.soldDate || 'Sotilgan sana'}:</span>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {formatDate(saleData.sold_created)}
                  </p>
                </div>

                {/* Dress Author */}
                <div>
                  <span className="text-gray-600">{t.author || 'Muallif'}:</span>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {saleData.dress_author || '--'}
                  </p>
                </div>

                {/* Who Added Dress */}
                <div>
                  <span className="text-gray-600">{t.addedBy || 'Kim qoshgan'}:</span>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {saleData.dress_created_by || '--'}
                  </p>
                </div>

                {/* Dress Created Date */}
                <div>
                  <span className="text-gray-600">{t.dressCreatedDate || "Ko'ylak kiritilgan sana"}:</span>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {formatDate(saleData.dress_created_at)}
                  </p>
                </div>

                {/* Description */}
                {saleData.description && (
                  <div className="md:col-span-2">
                    <span className="text-gray-600">{t.description || 'Tavsif'}:</span>
                    <p className="text-lg text-gray-900 mt-1">
                      {saleData.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Attach Salon Button - Outside Tabs */}
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setShowAttachModal(true)}
            className="w-full max-w-md h-14 bg-blue-500 text-white rounded-lg font-medium text-lg
              active:scale-[0.98] transition-all shadow-md"
          >
            {t.attachSalon || 'Salon biriktirish'}
          </button>
        </div>
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
                <p className="text-lg font-semibold text-gray-900">{saleData.bride_name}</p>
                <p className="text-sm text-gray-600 mt-2">{t.dressName || "Ko'ylak"}:</p>
                <p className="text-base text-gray-900">{saleData.dress_name}</p>
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

              {/* Salon Must Pay (Display Only) */}
              <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                <p className="text-sm text-blue-600 mb-1">{t.salonMustPay || 'Salon berishi kerak'}:</p>
                <p className="text-xl font-bold text-blue-900">${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(salonMustPay)}</p>
              </div>

              {/* Exchange Rate (Display Only) */}
              <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                <p className="text-sm text-gray-600 mb-1">{t.exchangeRate || 'Markaziy bank kursi'}:</p>
                <p className="text-lg font-semibold text-gray-900">1 USD = {new Intl.NumberFormat('uz-UZ').format(exchangeRate)} UZS</p>
              </div>

              {/* Money Salon USD */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  {t.moneySalonUsd || 'Salon bergan pul (USD)'}
                </label>
                <input
                  type="number"
                  value={moneySalonUsd}
                  onChange={(e) => setMoneySalonUsd(e.target.value)}
                  onFocus={(e) => {
                    e.target.blur();
                    showKeyboard('decimal', moneySalonUsd, setMoneySalonUsd, () => {});
                  }}
                  onClick={() => showKeyboard('decimal', moneySalonUsd, setMoneySalonUsd, () => {})}
                  className="w-full h-14 px-4 rounded-lg border-2 border-gray-200 text-lg
                    focus:border-blue-500 transition-all cursor-pointer"
                  placeholder="0.00"
                />
              </div>

              {/* Money Salon UZS */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  {t.moneySalonUzs || 'Salon bergan pul (UZS)'}
                </label>
                <input
                  type="number"
                  value={moneySalonUzs}
                  onChange={(e) => setMoneySalonUzs(e.target.value)}
                  onFocus={(e) => {
                    e.target.blur();
                    showKeyboard('number', moneySalonUzs, setMoneySalonUzs, () => {});
                  }}
                  onClick={() => showKeyboard('number', moneySalonUzs, setMoneySalonUzs, () => {})}
                  className="w-full h-14 px-4 rounded-lg border-2 border-gray-200 text-lg
                    focus:border-blue-500 transition-all cursor-pointer"
                  placeholder="0"
                />
              </div>

              {/* Date Gives Debt (Optional) */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  {t.dateGivesDebt || 'Qarz berish sanasi'} ({t.optional || 'Ixtiyoriy'})
                </label>
                <input
                  type="date"
                  value={dateGivesDebt}
                  onChange={(e) => setDateGivesDebt(e.target.value)}
                  className="w-full h-14 px-4 rounded-lg border-2 border-gray-200 text-lg
                    focus:border-blue-500 transition-all"
                />
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

      {/* Fullscreen Image Viewer with Zoom */}
      {fullscreenImage && (
        <FullscreenImageViewer
          images={saleData.dress_images}
          currentIndex={currentImageIndex}
          onClose={() => setFullscreenImage(false)}
          onNavigate={setCurrentImageIndex}
        />
      )}
    </div>
  );
};

export default FiftyFiftyNoSalonDetails;
