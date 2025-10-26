import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { getAllSalons } from '../services/salonApi';
import { getImageUrl } from '../services/api';
import { useKeyboard } from '../context/KeyboardContext';

const SalonsList = () => {
  const navigate = useNavigate();
  const t = useTranslation();
  const { showKeyboard } = useKeyboard();

  const [salons, setSalons] = useState([]);
  const [filteredSalons, setFilteredSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchSalons();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSalons(salons);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = salons.filter(salon => {
      const salonName = salon.salon_name?.toLowerCase() || '';
      const customerName = salon.customer_name?.toLowerCase() || '';

      return salonName.includes(query) || customerName.includes(query);
    });

    setFilteredSalons(filtered);
  }, [searchQuery, salons]);

  const fetchSalons = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getAllSalons();
      setSalons(data || []);
      setFilteredSalons(data || []);
      console.log('🏪 Fetched Salons:', data);
    } catch (err) {
      console.error('❌ Failed to fetch salons:', err);
      setError('Failed to load salons');
    } finally {
      setLoading(false);
    }
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
              {t.salonList || 'Salonlar royxati'}
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

      {/* Search, Add Button, and Count */}
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="flex gap-4 mb-4">
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
            className="flex-1 h-14 px-6 rounded-lg border-2 border-gray-200 text-lg
              cursor-pointer active:border-blue-500 transition-all shadow-sm"
          />

          <button
            onClick={() => {
              // TODO: Navigate to add salon page
              alert('Add salon functionality coming soon');
            }}
            className="w-14 h-14 rounded-lg bg-blue-500 text-white text-2xl
              flex items-center justify-center shadow-md
              active:scale-[0.98] transition-all"
          >
            +
          </button>
        </div>

        <div className="text-lg text-gray-600">
          {t.totalSalons || 'Jami'}: <span className="font-semibold">{filteredSalons.length}</span>
        </div>
      </div>

      {/* Salons Grid */}
      <div className="max-w-7xl mx-auto px-8 pb-8">
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center text-red-600 mb-6">
            {error}
          </div>
        )}

        {filteredSalons.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-16 text-center shadow-md">
            <div className="text-6xl mb-6">🏪</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t.noSalons || 'Salonlar topilmadi'}
            </h2>
            <p className="text-lg text-gray-600">
              {searchQuery ? t.tryDifferentSearch || 'Boshqa qidiruv amalga oshiring' : t.noSalonsYet || 'Hozircha salonlar mavjud emas'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSalons.map((salon) => (
              <button
                key={salon.id}
                onClick={() => navigate(`/salon/salon/${salon.id}`)}
                className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-md
                  transition-all active:scale-[0.98] active:border-blue-500 text-left"
              >
                {/* Salon Image */}
                <div className="relative h-48 bg-gray-100">
                  {salon.salon_image ? (
                    <img
                      src={getImageUrl(salon.salon_image)}
                      alt={salon.salon_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                      🏪
                    </div>
                  )}
                </div>

                {/* Salon Info */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {salon.salon_name}
                  </h3>

                  <div className="space-y-2 text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="text-base">👤 {t.salonOwner || 'Salonchi'}:</span>
                      <span className="font-medium">{salon.customer_name || '--'}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SalonsList;
