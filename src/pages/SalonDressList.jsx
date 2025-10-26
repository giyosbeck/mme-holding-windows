import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { getAllDressesOrderedByDate } from '../services/salonApi';
import { getImageUrl } from '../services/api';
import { useKeyboard } from '../context/KeyboardContext';

const SalonDressList = () => {
  const navigate = useNavigate();
  const t = useTranslation();
  const { showKeyboard } = useKeyboard();

  const [dressesGrouped, setDressesGrouped] = useState({});
  const [allDresses, setAllDresses] = useState([]);
  const [filteredGrouped, setFilteredGrouped] = useState({});
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentDressImages, setCurrentDressImages] = useState([]);

  useEffect(() => {
    fetchDresses();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredGrouped(dressesGrouped);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = {};

    // Filter dresses within each date group
    Object.keys(dressesGrouped).forEach(date => {
      const dressesForDate = dressesGrouped[date].filter(dress => {
        const dressName = dress.dress_name?.toLowerCase() || '';
        const dressColor = dress.dress_color?.toLowerCase() || '';
        const dressAuthor = dress.dress_author?.toLowerCase() || '';

        return dressName.includes(query) ||
               dressColor.includes(query) ||
               dressAuthor.includes(query);
      });

      if (dressesForDate.length > 0) {
        filtered[date] = dressesForDate;
      }
    });

    setFilteredGrouped(filtered);
  }, [searchQuery, dressesGrouped]);

  const fetchDresses = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getAllDressesOrderedByDate();
      console.log('👗 Fetched Dresses Response:', response);

      if (response && response.data) {
        setDressesGrouped(response.data);
        setFilteredGrouped(response.data);
        setTotalCount(response.count || 0);

        // Flatten for total count
        const flattened = Object.values(response.data).flat();
        setAllDresses(flattened);
      }
    } catch (err) {
      console.error('❌ Failed to fetch dresses:', err);
      setError('Failed to load dresses');
    } finally {
      setLoading(false);
    }
  };

  // Use filteredGrouped directly - no need to re-group
  const groupedDresses = filteredGrouped;

  const handleImageClick = (images, index) => {
    setCurrentDressImages(images);
    setCurrentImageIndex(index);
    setFullscreenImage(images[index]);
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    const newIndex = currentImageIndex === 0 ? currentDressImages.length - 1 : currentImageIndex - 1;
    setCurrentImageIndex(newIndex);
    setFullscreenImage(currentDressImages[newIndex]);
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    const newIndex = currentImageIndex === currentDressImages.length - 1 ? 0 : currentImageIndex + 1;
    setCurrentImageIndex(newIndex);
    setFullscreenImage(currentDressImages[newIndex]);
  };

  const formatPrice = (price) => {
    return '$' + new Intl.NumberFormat('en-US').format(price);
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
              {t.salonDressList || 'Koylaklar royxati'}
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
          readOnly
          onFocus={(e) => {
            e.target.blur();
            showKeyboard('text', searchQuery, setSearchQuery, () => {});
          }}
          onClick={() => showKeyboard('text', searchQuery, setSearchQuery, () => {})}
          placeholder={t.search || 'Qidirish'}
          className="w-full h-14 px-6 rounded-lg border-2 border-gray-200 text-lg
            cursor-pointer active:border-blue-500 transition-all shadow-sm"
        />

        <div className="mt-4 text-lg text-gray-600">
          {t.totalDresses || 'Jami'}: <span className="font-semibold">
            {Object.values(filteredGrouped).flat().length}
          </span>
        </div>
      </div>

      {/* Dresses Grouped by Date */}
      <div className="max-w-7xl mx-auto px-8 pb-8">
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center text-red-600 mb-6">
            {error}
          </div>
        )}

        {Object.keys(groupedDresses).length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-16 text-center shadow-md">
            <div className="text-6xl mb-6">👗</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t.noDresses || 'Koylak topilmadi'}
            </h2>
            <p className="text-lg text-gray-600">
              {searchQuery ? t.tryDifferentSearch || 'Boshqa qidiruv amalga oshiring' : t.noDressesYet || 'Hozircha koylaklar mavjud emas'}
            </p>
          </div>
        ) : (
          Object.entries(groupedDresses).map(([date, dressesForDate]) => (
            <div key={date} className="mb-10">
              {/* Date Header */}
              <h2 className="text-xl font-semibold text-gray-700 mb-4 pl-2">
                📅 {date}
              </h2>

              {/* Dresses Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dressesForDate.map((dress) => (
                  <div
                    key={dress.id}
                    className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-md
                      transition-all active:scale-[0.98] active:border-blue-500 cursor-pointer"
                    onClick={() => navigate(`/salon/dress/${dress.id}`)}
                  >
                    {/* Image */}
                    <div className="relative h-80 bg-gray-100">
                      {dress.dress_image && dress.dress_image[0] ? (
                        <img
                          src={getImageUrl(dress.dress_image[0])}
                          alt={dress.dress_name}
                          className="w-full h-full object-cover"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleImageClick(dress.dress_image, 0);
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl">
                          👗
                        </div>
                      )}

                      {/* Multiple Images Indicator */}
                      {dress.dress_image && dress.dress_image.length > 1 && (
                        <div className="absolute bottom-3 right-3 bg-black bg-opacity-60 text-white px-3 py-1 rounded-lg text-sm">
                          +{dress.dress_image.length - 1}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {dress.dress_name}
                      </h3>

                      <div className="space-y-2 text-gray-600">
                        <div className="flex items-center gap-2">
                          <span className="text-base">🎨 {t.color || 'Rang'}:</span>
                          <span className="font-medium">{dress.dress_color}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-base">📏 {t.size || "O'lchami"}:</span>
                          <span className="font-medium">{dress.dress_shleft_size}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-base">💰 {t.price || 'Narxi'}:</span>
                          <span className="font-semibold text-green-600">
                            {formatPrice(dress.dress_price)}
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

          {currentDressImages.length > 1 && (
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

          {currentDressImages.length > 1 && (
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2
              bg-white bg-opacity-90 px-4 py-2 rounded-full text-black">
              {currentImageIndex + 1} / {currentDressImages.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SalonDressList;
