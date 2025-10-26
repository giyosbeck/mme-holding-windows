import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { getDressById, deleteDress, deleteDressImage } from '../services/salonApi';
import { getImageUrl } from '../services/api';

const SalonDressDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const t = useTranslation();

  const [activeTab, setActiveTab] = useState('gallery'); // 'gallery' or 'about'
  const [dressData, setDressData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteImageModal, setShowDeleteImageModal] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchDressDetails();
  }, [id]);

  const fetchDressDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getDressById(id);
      setDressData(data);
      console.log('👗 Dress Data Loaded:', data);
    } catch (err) {
      console.error('❌ Failed to fetch dress details:', err);
      setError('Failed to load dress details');
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

  const formatPrice = (price) => {
    return '$' + new Intl.NumberFormat('en-US').format(price);
  };

  const handleImageClick = (index) => {
    setCurrentImageIndex(index);
    setFullscreenImage(dressData.dress_image[index]);
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    const newIndex = currentImageIndex === 0 ? dressData.dress_image.length - 1 : currentImageIndex - 1;
    setCurrentImageIndex(newIndex);
    setFullscreenImage(dressData.dress_image[newIndex]);
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    const newIndex = currentImageIndex === dressData.dress_image.length - 1 ? 0 : currentImageIndex + 1;
    setCurrentImageIndex(newIndex);
    setFullscreenImage(dressData.dress_image[newIndex]);
  };

  const handleDeleteImage = async () => {
    if (!imageToDelete) return;

    setDeleting(true);
    try {
      await deleteDressImage(id, imageToDelete);
      console.log('✅ Image Deleted');
      // Reload dress details
      await fetchDressDetails();
      setShowDeleteImageModal(false);
      setImageToDelete(null);
    } catch (err) {
      console.error('❌ Failed to delete image:', err);
      alert('Failed to delete image');
    } finally {
      setDeleting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteDress(id);
      console.log('✅ Dress Deleted');
      navigate('/salon/dresses');
    } catch (err) {
      console.error('❌ Failed to delete dress:', err);
      alert('Failed to delete dress');
      setDeleting(false);
      setShowDeleteModal(false);
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

  if (error || !dressData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6">⚠️</div>
          <p className="text-xl text-red-600">{error || 'Dress not found'}</p>
          <button
            onClick={() => navigate('/salon/dresses')}
            className="mt-6 px-8 h-14 bg-gray-900 text-white rounded-lg
              active:scale-[0.98] transition-all"
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
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/salon/dresses')}
              className="w-14 h-14 rounded-full border-2 border-gray-200
                flex items-center justify-center text-2xl
                active:scale-[0.98] active:border-blue-500 transition-all"
            >
              ←
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">
              {dressData.dress_name}
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

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-8 pt-6">
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

        {activeTab === 'gallery' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dressData.dress_image && dressData.dress_image.length > 0 ? (
              dressData.dress_image.map((image, index) => (
                <div
                  key={index}
                  className="relative bg-white rounded-2xl border-2 border-gray-200 overflow-hidden
                    shadow-md group"
                >
                  <div
                    className="h-96 cursor-pointer"
                    onClick={() => handleImageClick(index)}
                  >
                    <img
                      src={getImageUrl(image)}
                      alt={`${dressData.dress_name} - ${index + 1}`}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => {
                      setImageToDelete(image);
                      setShowDeleteImageModal(true);
                    }}
                    className="absolute top-4 right-4 w-12 h-12 bg-red-500 text-white rounded-full
                      flex items-center justify-center text-xl shadow-lg
                      active:scale-[0.98] transition-all opacity-90 hover:opacity-100"
                  >
                    🗑️
                  </button>
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
            {/* Info Card */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-md">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {t.dressInformation || "Ko'ylak ma'lumotlari"}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <span className="text-gray-600">{t.dressName || "Ko'ylak nomi"}:</span>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {dressData.dress_name}
                  </p>
                </div>

                <div>
                  <span className="text-gray-600">{t.price || 'Narxi'}:</span>
                  <p className="text-lg font-semibold text-green-600 mt-1">
                    {formatPrice(dressData.dress_price)}
                  </p>
                </div>

                <div>
                  <span className="text-gray-600">{t.createdDate || 'Kiritilgan sana'}:</span>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {formatDate(dressData.created_at)}
                  </p>
                </div>

                <div>
                  <span className="text-gray-600">{t.size || "O'lchami"}:</span>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {dressData.dress_shleft_size}
                  </p>
                </div>

                <div>
                  <span className="text-gray-600">{t.color || 'Rang'}:</span>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {dressData.dress_color}
                  </p>
                </div>

                <div>
                  <span className="text-gray-600">{t.author || 'Muallif'}:</span>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {dressData.dress_author || '--'}
                  </p>
                </div>

                {dressData.description && (
                  <div className="md:col-span-2">
                    <span className="text-gray-600">{t.description || 'Tavsif'}:</span>
                    <p className="text-lg text-gray-900 mt-1">
                      {dressData.description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteModal(true)}
                disabled={deleting}
                className="flex-1 h-14 bg-red-500 text-white rounded-lg font-medium
                  active:scale-[0.98] transition-all shadow-md disabled:opacity-50"
              >
                {deleting ? t.deleting || "O'chirilmoqda..." : t.delete || "O'chirish"}
              </button>

              <button
                onClick={() => {
                  // TODO: Navigate to edit page
                  alert('Edit functionality coming soon');
                }}
                className="flex-1 h-14 bg-blue-500 text-white rounded-lg font-medium
                  active:scale-[0.98] transition-all shadow-md"
              >
                {t.edit || 'Tahrirlash'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Dress Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-8">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {t.deleteConfirm || "Rostdan ham o'chirmoqchimisiz?"}
              </h2>
              <p className="text-gray-600">
                {t.deleteConfirmDesc || "Bu amalni qaytarib bo'lmaydi"}
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 h-14 border-2 border-gray-200 text-gray-700 rounded-lg
                  font-medium active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {t.cancel || 'Bekor qilish'}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 h-14 bg-red-500 text-white rounded-lg font-medium
                  active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {deleting ? t.deleting || "O'chirilmoqda..." : t.delete || "O'chirish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Image Confirmation Modal */}
      {showDeleteImageModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-8">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🗑️</div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {t.deleteImageConfirm || "Rasmni o'chirmoqchimisiz?"}
              </h2>
              <p className="text-gray-600">
                {t.deleteConfirmDesc || "Bu amalni qaytarib bo'lmaydi"}
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowDeleteImageModal(false);
                  setImageToDelete(null);
                }}
                disabled={deleting}
                className="flex-1 h-14 border-2 border-gray-200 text-gray-700 rounded-lg
                  font-medium active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {t.cancel || 'Bekor qilish'}
              </button>
              <button
                onClick={handleDeleteImage}
                disabled={deleting}
                className="flex-1 h-14 bg-red-500 text-white rounded-lg font-medium
                  active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {deleting ? t.deleting || "O'chirilmoqda..." : t.delete || "O'chirish"}
              </button>
            </div>
          </div>
        </div>
      )}

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

          {dressData.dress_image.length > 1 && (
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

          {dressData.dress_image.length > 1 && (
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2
              bg-white bg-opacity-90 px-4 py-2 rounded-full text-black">
              {currentImageIndex + 1} / {dressData.dress_image.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SalonDressDetails;
