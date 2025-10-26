import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { getAllSalons } from '../services/salonApi';
import { getImageUrl } from '../services/api';
import { useKeyboard } from '../context/KeyboardContext';

/**
 * Salon Selection Modal Component
 *
 * @param {boolean} isOpen - Whether modal is visible
 * @param {function} onClose - Close modal callback
 * @param {function} onSelect - Selection callback (receives selected salon)
 */
const SalonSelectionModal = ({
  isOpen,
  onClose,
  onSelect
}) => {
  const t = useTranslation();
  const { showKeyboard } = useKeyboard();

  const [salons, setSalons] = useState([]);
  const [filteredSalons, setFilteredSalons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchSalons();
    }
  }, [isOpen]);

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
    try {
      const data = await getAllSalons();
      setSalons(data || []);
      setFilteredSalons(data || []);
    } catch (err) {
      console.error('❌ Failed to fetch salons:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSalonClick = (salon) => {
    onSelect(salon);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">
            {t.selectSalon || "Salon tanlang"}
          </h2>
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-gray-100 text-gray-600
              flex items-center justify-center text-xl
              active:scale-[0.98] active:bg-gray-200 transition-all"
          >
            ✕
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              showKeyboard('text', searchQuery, setSearchQuery, () => {});
            }}
            onClick={() => showKeyboard('text', searchQuery, setSearchQuery, () => {})}
            placeholder={t.search || 'Qidirish'}
            className="w-full h-14 px-6 rounded-lg border-2 border-gray-200 text-lg
              focus:border-blue-500 transition-all"
          />

          <div className="mt-4 text-lg text-gray-600">
            {t.totalSalons || 'Jami'}: <span className="font-semibold">{filteredSalons.length}</span>
          </div>
        </div>

        {/* Salons Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gray-900"></div>
            </div>
          ) : filteredSalons.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🏪</div>
              <p className="text-xl text-gray-600">
                {t.noSalons || "Salonlar topilmadi"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSalons.map((salon) => (
                <button
                  key={salon.id}
                  onClick={() => handleSalonClick(salon)}
                  className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-md
                    transition-all active:scale-[0.98] active:border-blue-500 text-left"
                >
                  {/* Salon Image */}
                  <div className="relative h-40 bg-gray-100">
                    {salon.salon_image ? (
                      <img
                        src={getImageUrl(salon.salon_image)}
                        alt={salon.salon_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">
                        🏪
                      </div>
                    )}
                  </div>

                  {/* Salon Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {salon.salon_name}
                    </h3>

                    <div className="text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <span>👤</span>
                        <span>{salon.customer_name || '--'}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalonSelectionModal;
