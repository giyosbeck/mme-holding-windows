import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useKeyboard } from '../context/KeyboardContext';
import { updateDress, getDressColors, getDressAuthors } from '../services/factoryManagerApi';

const EditDressModal = ({ dress, onClose, onSuccess }) => {
  const t = useTranslation();
  const { showKeyboard } = useKeyboard();

  const [formData, setFormData] = useState({
    id: dress.id,
    dress_name: dress.dress_name || '',
    dress_shleft_size: dress.dress_shleft_size || '',
    dress_color: dress.dress_color || '',
    dress_author: dress.dress_author || '',
    dress_author_id: dress.dress_author_id || '',
    description: dress.description || '',
    dress_image: dress.dress_image || [],
    dress_price: dress.dress_price || 0,
  });

  const [colors, setColors] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Size options (standard shoulder measurements)
  const sizeOptions = [30, 60, 80, 100, 150, 300];

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    setLoadingData(true);
    try {
      const [colorsData, authorsData] = await Promise.all([
        getDressColors(),
        getDressAuthors()
      ]);

      setColors(colorsData || []);
      setAuthors(authorsData || []);
    } catch (err) {
      console.error('❌ Failed to fetch dropdown data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await updateDress(formData);
      console.log('✅ Dress updated successfully');
      onSuccess();
    } catch (err) {
      console.error('❌ Failed to update dress:', err);
      setErrorMessage('Failed to update dress');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthorChange = (authorId) => {
    const author = authors.find(a => a.id === authorId);
    if (author) {
      setFormData({
        ...formData,
        dress_author: author.name,
        dress_author_id: author.id
      });
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-2xl">
          <h2 className="text-2xl font-semibold text-gray-900">{t.editDress}</h2>
        </div>

        {loadingData ? (
          <div className="p-12 text-center">
            <div className="text-xl text-gray-600">Loading...</div>
          </div>
        ) : (
          <>
            {/* Form Fields */}
            <div className="p-8 space-y-6">
              {/* Dress Name */}
              <div>
                <label className="block text-sm text-gray-500 mb-2">{t.dressName}</label>
                <input
                  type="text"
                  value={formData.dress_name}
                  onChange={(e) => setFormData({ ...formData, dress_name: e.target.value })}
                  onFocus={() => {
                    showKeyboard('text', formData.dress_name, (value) => {
                      setFormData({ ...formData, dress_name: value });
                    }, () => {});
                  }}
                  onClick={() => {
                    showKeyboard('text', formData.dress_name, (value) => {
                      setFormData({ ...formData, dress_name: value });
                    }, () => {});
                  }}
                  className="w-full h-14 px-4 text-lg border-2 border-gray-200 rounded-xl
                    focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Shoulder Measurement */}
              <div>
                <label className="block text-sm text-gray-500 mb-2">{t.shoulderMeasurement}</label>
                <select
                  value={formData.dress_shleft_size}
                  onChange={(e) => setFormData({ ...formData, dress_shleft_size: parseInt(e.target.value) })}
                  className="w-full h-14 px-4 text-lg border-2 border-gray-200 rounded-xl
                    focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                >
                  <option value="">Select size</option>
                  {sizeOptions.map(size => (
                    <option key={size} value={size}>{size} sm</option>
                  ))}
                </select>
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm text-gray-500 mb-2">{t.color}</label>
                <select
                  value={formData.dress_color}
                  onChange={(e) => setFormData({ ...formData, dress_color: e.target.value })}
                  className="w-full h-14 px-4 text-lg border-2 border-gray-200 rounded-xl
                    focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                >
                  <option value="">Select color</option>
                  {colors.map((color, index) => (
                    <option key={index} value={color.dress_color}>{color.dress_color}</option>
                  ))}
                </select>
              </div>

              {/* Author */}
              <div>
                <label className="block text-sm text-gray-500 mb-2">{t.author}</label>
                <select
                  value={formData.dress_author_id}
                  onChange={(e) => handleAuthorChange(e.target.value)}
                  className="w-full h-14 px-4 text-lg border-2 border-gray-200 rounded-xl
                    focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                >
                  <option value="">Select author</option>
                  {authors.map((author) => (
                    <option key={author.id} value={author.id}>
                      {author.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm text-gray-500 mb-2">{t.description}</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  onFocus={() => {
                    showKeyboard('text', formData.description, (value) => {
                      setFormData({ ...formData, description: value });
                    }, () => {});
                  }}
                  onClick={() => {
                    showKeyboard('text', formData.description, (value) => {
                      setFormData({ ...formData, description: value });
                    }, () => {});
                  }}
                  className="w-full h-14 px-4 text-lg border-2 border-gray-200 rounded-xl
                    focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-8 py-6 rounded-b-2xl">
              <div className="flex gap-4">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 py-4 bg-gray-200 text-gray-700 rounded-xl font-semibold text-lg
                    active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg
                    active:scale-[0.98] transition-all shadow-md disabled:opacity-50"
                >
                  {loading ? 'Saving...' : t.save}
                </button>
              </div>
            </div>
          </>
        )}
        </div>
      </div>

      {/* Error Modal */}
      {showError && (
        <div
          className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm flex items-center justify-center p-8"
          onClick={() => setShowError(false)}
        >
          <div
            className="bg-white rounded-lg max-w-md w-full p-10 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-8xl mb-6">❌</div>
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">
              {t.errorTitle || 'Error'}
            </h2>
            <p className="text-xl text-gray-600 mb-10">
              {errorMessage}
            </p>
            <button
              onClick={() => setShowError(false)}
              className="w-full h-14 text-xl font-medium rounded-lg
                bg-gray-900 text-white hover:bg-gray-700 transition-colors"
            >
              {t.close}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default EditDressModal;
