import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { useKeyboard } from '../context/KeyboardContext';
import { useDebounce } from '../hooks/useDebounce';
import { getFiftyFiftyWithoutSalon } from '../services/salonApi';
import { getImageUrl } from '../services/api';

const FiftyFiftyNoSalon = () => {
  const navigate = useNavigate();
  const t = useTranslation();
  const { showKeyboard } = useKeyboard();

  const [salesGrouped, setSalesGrouped] = useState({});
  const [totalCount, setTotalCount] = useState(0);
  const [totalSalesUsd, setTotalSalesUsd] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Image viewer state
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentImages, setCurrentImages] = useState([]);

  // Debounce search query to reduce re-renders (optimization for weak PC)
  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    fetchSales();
  }, []);

  // Memoized filtered data (optimization for weak PC)
  const filteredGrouped = useMemo(() => {
    if (!debouncedSearch.trim()) {
      return salesGrouped;
    }

    const query = debouncedSearch.toLowerCase();
    const filtered = {};

    // Filter sales within each date group
    Object.keys(salesGrouped).forEach(date => {
      const salesForDate = salesGrouped[date].filter(sale => {
        const brideName = sale.bride_name?.toLowerCase() || '';
        const dressName = sale.dress_name?.toLowerCase() || '';
        const dressColor = sale.dress_color?.toLowerCase() || '';

        return brideName.includes(query) ||
               dressName.includes(query) ||
               dressColor.includes(query);
      });

      if (salesForDate.length > 0) {
        filtered[date] = salesForDate;
      }
    });

    return filtered;
  }, [debouncedSearch, salesGrouped]);

  const fetchSales = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getFiftyFiftyWithoutSalon(100, 0);

      // Keep date-grouped structure
      if (response?.data && typeof response.data === 'object') {
        setSalesGrouped(response.data);
        setTotalCount(response?.count || 0);
        setTotalSalesUsd(response?.total_sales_usd || 0);
      }

      console.log('🔗 50/50 Sales Without Salon:', response);
    } catch (err) {
      console.error('❌ Failed to fetch sales:', err);
      setError('Failed to load sales');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '--';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  // Memoized image handlers (optimization for weak PC)
  const handleImageClick = useCallback((images, index) => {
    setCurrentImages(images);
    setCurrentImageIndex(index);
    setFullscreenImage(images[index]);
  }, []);

  const handlePrevImage = useCallback((e) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => {
      const newIndex = prev === 0 ? currentImages.length - 1 : prev - 1;
      setFullscreenImage(currentImages[newIndex]);
      return newIndex;
    });
  }, [currentImages]);

  const handleNextImage = useCallback((e) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => {
      const newIndex = prev === currentImages.length - 1 ? 0 : prev + 1;
      setFullscreenImage(currentImages[newIndex]);
      return newIndex;
    });
  }, [currentImages]);

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

      {/* Search and Count */}
      <div className="max-w-7xl mx-auto px-8 py-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => showKeyboard('text', searchQuery, setSearchQuery, () => {})}
          onClick={() => showKeyboard('text', searchQuery, setSearchQuery, () => {})}
          placeholder={t.search || 'Qidirish'}
          className="w-full h-14 px-6 rounded-lg border-2 border-gray-200 text-lg
            focus:border-blue-500 transition-all shadow-sm"
        />

        <div className="mt-4 flex items-center gap-6 text-lg text-gray-600">
          <div>
            {t.total || 'Jami'}: <span className="font-semibold text-gray-900">{totalCount}</span>
          </div>
          {totalSalesUsd > 0 && (
            <div className="text-green-600">
              💵 ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalSalesUsd)}
            </div>
          )}
        </div>
      </div>

      {/* Sales List */}
      <div className="max-w-7xl mx-auto px-8 pb-8">
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center text-red-600 mb-6">
            {error}
          </div>
        )}

        {Object.keys(filteredGrouped).length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-16 text-center shadow-md">
            <div className="text-6xl mb-6">🔗</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t.noSalesWithoutSalon || "50/50 sotuv topilmadi"}
            </h2>
            <p className="text-lg text-gray-600">
              {searchQuery ? t.tryDifferentSearch || 'Boshqa qidiruv amalga oshiring' : t.noSalesWithoutSalonDesc || "Barcha 50/50 sotuvlar salonga biriktirilgan"}
            </p>
          </div>
        ) : (
          Object.entries(filteredGrouped).map(([date, salesForDate]) => (
            <div key={date} className="mb-10">
              {/* Date Header */}
              <h2 className="text-xl font-semibold text-gray-700 mb-4 pl-2">
                📅 {date}
              </h2>

              {/* Sales Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {salesForDate.map((sale) => (
                  <div
                    key={sale.id}
                    onClick={() => navigate(`/salon/fifty-fifty-no-salon/${sale.id}`)}
                    className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-md
                      transition-all active:scale-[0.98] active:border-blue-500 cursor-pointer"
                  >
                    {/* Image */}
                    <div className="relative h-80 bg-gray-100">
                      {sale.dress_image && sale.dress_image[0] ? (
                        <img
                          src={getImageUrl(sale.dress_image[0])}
                          alt={sale.dress_name}
                          loading="lazy"
                          className="w-full h-full object-cover"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleImageClick(sale.dress_image, 0);
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl">
                          👗
                        </div>
                      )}

                      {/* Multiple Images Indicator */}
                      {sale.dress_image && sale.dress_image.length > 1 && (
                        <div className="absolute bottom-3 right-3 bg-black bg-opacity-60 text-white px-3 py-1 rounded-lg text-sm">
                          +{sale.dress_image.length - 1}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {sale.dress_name}
                      </h3>

                      <div className="space-y-2 text-gray-600">
                        <div className="flex items-center gap-2">
                          <span className="text-base">🎨 {t.color || 'Rang'}:</span>
                          <span className="font-medium">{sale.dress_color}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-base">📏 {t.size || "O'lchami"}:</span>
                          <span className="font-medium">{sale.dress_shleft_size}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-base">💰 {t.price || 'Narxi'}:</span>
                          <span className="font-semibold text-green-600">
                            ${new Intl.NumberFormat('en-US').format(sale.dress_price)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Fullscreen Image Modal */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center"
          onClick={() => setFullscreenImage(null)}
        >
          <button
            onClick={() => setFullscreenImage(null)}
            className="absolute top-6 right-6 w-14 h-14 rounded-full bg-white text-black
              flex items-center justify-center text-2xl z-10
              active:scale-[0.98] transition-all"
          >
            ✕
          </button>

          {currentImages.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-6 w-14 h-14 rounded-full bg-white text-black
                  flex items-center justify-center text-2xl z-10
                  active:scale-[0.98] transition-all"
              >
                ←
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-6 w-14 h-14 rounded-full bg-white text-black
                  flex items-center justify-center text-2xl z-10
                  active:scale-[0.98] transition-all"
              >
                →
              </button>
            </>
          )}

          <img
            src={getImageUrl(fullscreenImage)}
            alt="Fullscreen"
            className="max-w-[90%] max-h-[90%] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {currentImages.length > 1 && (
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2
              bg-white bg-opacity-90 px-4 py-2 rounded-full text-black">
              {currentImageIndex + 1} / {currentImages.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FiftyFiftyNoSalon;
