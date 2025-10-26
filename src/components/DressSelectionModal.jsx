import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { getAllDresses } from '../services/salonApi';
import { getImageUrl } from '../services/api';
import { useKeyboard } from '../context/KeyboardContext';

/**
 * Dress Selection Modal Component
 *
 * @param {boolean} isOpen - Whether modal is visible
 * @param {function} onClose - Close modal callback
 * @param {function} onSelect - Selection callback (receives array of selected dresses)
 * @param {boolean} multiSelect - Enable multi-select mode (default: false)
 * @param {array} selectedDresses - Already selected dresses (for multi-select)
 */
const DressSelectionModal = ({
  isOpen,
  onClose,
  onSelect,
  multiSelect = false,
  selectedDresses = []
}) => {
  const t = useTranslation();
  const { showKeyboard } = useKeyboard();

  const [dresses, setDresses] = useState([]);
  const [filteredDresses, setFilteredDresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState(multiSelect ? selectedDresses : null);

  useEffect(() => {
    if (isOpen) {
      fetchDresses();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredDresses(dresses);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = dresses.filter(dress => {
      const dressName = dress.dress_name?.toLowerCase() || '';
      const dressColor = dress.dress_color?.toLowerCase() || '';
      return dressName.includes(query) || dressColor.includes(query);
    });

    setFilteredDresses(filtered);
  }, [searchQuery, dresses]);

  const fetchDresses = async () => {
    setLoading(true);
    try {
      const data = await getAllDresses();
      setDresses(data || []);
      setFilteredDresses(data || []);
    } catch (err) {
      console.error('❌ Failed to fetch dresses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDressClick = (dress) => {
    if (multiSelect) {
      // Check if already selected
      const isSelected = selected.some(d => d.id === dress.id);

      if (isSelected) {
        // Remove from selection
        setSelected(selected.filter(d => d.id !== dress.id));
      } else {
        // Add to selection
        setSelected([...selected, dress]);
      }
    } else {
      // Single select - immediately return and close
      onSelect([dress]);
      onClose();
    }
  };

  const handleConfirmSelection = () => {
    if (multiSelect && selected.length > 0) {
      onSelect(selected);
      onClose();
    }
  };

  const formatPrice = (price) => {
    return '$' + new Intl.NumberFormat('en-US').format(price);
  };

  const isDressSelected = (dressId) => {
    if (!multiSelect) return false;
    return selected.some(d => d.id === dressId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">
            {t.selectDress || "Ko'ylak tanlang"}
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

          {multiSelect && selected.length > 0 && (
            <div className="mt-4 text-lg text-gray-600">
              {t.selected || 'Tanlangan'}: <span className="font-semibold">{selected.length}</span>
            </div>
          )}
        </div>

        {/* Dresses Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gray-900"></div>
            </div>
          ) : filteredDresses.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">👗</div>
              <p className="text-xl text-gray-600">
                {t.noDresses || "Ko'ylaklar topilmadi"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDresses.map((dress) => {
                const isSelected = isDressSelected(dress.id);

                return (
                  <button
                    key={dress.id}
                    onClick={() => handleDressClick(dress)}
                    className={`bg-white rounded-2xl overflow-hidden shadow-md
                      transition-all active:scale-[0.98] text-left
                      ${isSelected
                        ? 'border-4 border-blue-500 shadow-lg'
                        : 'border-2 border-gray-200 active:border-blue-500'
                      }`}
                  >
                    {/* Image */}
                    <div className="relative h-64 bg-gray-100">
                      {dress.dress_image && dress.dress_image[0] ? (
                        <img
                          src={getImageUrl(dress.dress_image[0])}
                          alt={dress.dress_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl">
                          👗
                        </div>
                      )}

                      {/* Selection Indicator */}
                      {multiSelect && isSelected && (
                        <div className="absolute top-3 right-3 w-10 h-10 rounded-full
                          bg-blue-500 flex items-center justify-center text-white text-xl">
                          ✓
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {dress.dress_name}
                      </h3>

                      <div className="space-y-1 text-sm text-gray-600">
                        <div>🎨 {dress.dress_color}</div>
                        <div>📏 {t.size || "O'lchami"}: {dress.dress_shleft_size}</div>
                        <div className="font-semibold text-green-600">
                          💰 {formatPrice(dress.dress_price)}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer - Only show for multi-select */}
        {multiSelect && (
          <div className="border-t border-gray-200 p-6 flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 h-14 border-2 border-gray-200 text-gray-700 rounded-lg
                font-medium active:scale-[0.98] transition-all"
            >
              {t.cancel || 'Bekor qilish'}
            </button>
            <button
              onClick={handleConfirmSelection}
              disabled={selected.length === 0}
              className="flex-1 h-14 bg-blue-500 text-white rounded-lg font-medium
                active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t.confirm || 'Tasdiqlash'} ({selected.length})
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DressSelectionModal;
