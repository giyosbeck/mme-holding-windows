import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { useKeyboard } from '../context/KeyboardContext';
import { getAllDresses } from '../services/factoryManagerApi';
import { getImageUrl } from '../services/api';

const DressesList = () => {
  const navigate = useNavigate();
  const t = useTranslation();
  const { showKeyboard } = useKeyboard();

  const [dresses, setDresses] = useState([]);
  const [filteredDresses, setFilteredDresses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDresses();
  }, []);

  useEffect(() => {
    // Filter dresses based on search query
    if (!searchQuery.trim()) {
      setFilteredDresses(dresses);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = dresses.filter(dress =>
      dress.dress_name?.toLowerCase().includes(query) ||
      dress.dress_color?.toLowerCase().includes(query)
    );
    setFilteredDresses(filtered);
  }, [searchQuery, dresses]);

  const fetchDresses = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getAllDresses();
      setDresses(data || []);
      setFilteredDresses(data || []);
      console.log('👗 Dresses loaded:', data?.length || 0);
    } catch (err) {
      console.error('❌ Failed to fetch dresses:', err);
      setError('Failed to load dresses');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-3 flex justify-between items-center">
          <button
            onClick={() => navigate('/factory-manager/reports')}
            className="text-2xl font-semibold text-gray-900 flex items-center gap-2
              active:scale-95 transition-transform"
          >
            ← {t.dressesInShop}
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
        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => showKeyboard('text', searchQuery, setSearchQuery, () => {})}
            onClick={() => {
              showKeyboard('text', searchQuery, setSearchQuery, () => {});
            }}
            placeholder={t.search}
            className="w-full h-16 px-6 text-lg border-2 border-gray-200 rounded-xl
              focus:outline-none focus:border-blue-500 transition-colors
              bg-white shadow-sm"
          />
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-8 text-center">
            <div className="text-red-600 text-lg">{error}</div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-20">
            <div className="text-xl text-gray-600">Loading...</div>
          </div>
        ) : (
          <>
            {/* Dresses Grid */}
            {filteredDresses.length > 0 ? (
              <div className="grid grid-cols-3 gap-6">
                {filteredDresses.map((dress) => (
                  <div
                    key={dress.id}
                    onClick={() => navigate(`/factory-manager/dress/${dress.id}`)}
                    className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-md
                      active:scale-[0.98] active:border-blue-500 transition-all cursor-pointer"
                  >
                    {/* Dress Image */}
                    <div className="mb-4">
                      {dress.dress_image && dress.dress_image.length > 0 ? (
                        <img
                          src={getImageUrl(dress.dress_image[0])}
                          alt={dress.dress_name}
                          className="w-full h-64 object-cover rounded-xl"
                        />
                      ) : (
                        <div className="w-full h-64 bg-gray-100 rounded-xl flex items-center justify-center">
                          <span className="text-6xl">👗</span>
                        </div>
                      )}
                    </div>

                    {/* Dress Details */}
                    <div className="space-y-3">
                      {/* Dress Name */}
                      <div>
                        <div className="text-sm text-gray-500 mb-1">{t.dressName}</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {dress.dress_name || '--'}
                        </div>
                      </div>

                      {/* Color and Shoulder Measurement */}
                      <div>
                        <div className="text-sm text-gray-500 mb-1">{t.color} / {t.shoulderMeasurement}</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {dress.dress_color || '--'} - {dress.dress_shleft_size || '--'} sm
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* No Dresses State */
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-12 text-center shadow-md">
                <div className="text-6xl mb-6">👗</div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  {t.noDresses}
                </h2>
                <p className="text-xl text-gray-600">
                  {searchQuery ? t.searchProducts : t.noDresses}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DressesList;
