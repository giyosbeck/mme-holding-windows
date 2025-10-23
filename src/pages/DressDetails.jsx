import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { getDressById, deleteDress } from '../services/factoryManagerApi';
import { getImageUrl } from '../services/api';
import EditDressModal from '../components/EditDressModal';

const DressDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const t = useTranslation();

  const [activeTab, setActiveTab] = useState('about'); // 'about' or 'gallery'
  const [dressData, setDressData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
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

  // Format date with Tashkent timezone (+5 UTC)
  const formatDate = (dateString) => {
    if (!dateString) return '--';
    const date = new Date(dateString);
    const tashkentTime = new Date(date.getTime() + (5 * 60 * 60 * 1000));
    const day = String(tashkentTime.getDate()).padStart(2, '0');
    const month = String(tashkentTime.getMonth() + 1).padStart(2, '0');
    const year = tashkentTime.getFullYear();
    return `${day}.${month}.${year}`;
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

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteDress(id);
      console.log('✅ Dress Deleted');
      navigate('/factory-manager/dresses');
    } catch (err) {
      console.error('❌ Failed to delete dress:', err);
      setErrorMessage('Failed to delete dress');
      setShowError(true);
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    fetchDressDetails(); // Reload data
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error || !dressData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-600">{error || 'Dress not found'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-3 flex justify-between items-center">
          <button
            onClick={() => navigate('/factory-manager/dresses')}
            className="text-2xl font-semibold text-gray-900 flex items-center gap-2
              active:scale-95 transition-transform"
          >
            ← {t.dressDetails || 'Dress Details'}
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
            onClick={() => setActiveTab('about')}
            className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-md
              ${activeTab === 'about'
                ? 'bg-blue-600 text-white'
                : 'bg-white border-2 border-gray-200 text-gray-700 active:scale-[0.98] active:border-blue-500'
              }`}
          >
            {t.aboutDress}
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-md
              ${activeTab === 'gallery'
                ? 'bg-blue-600 text-white'
                : 'bg-white border-2 border-gray-200 text-gray-700 active:scale-[0.98] active:border-blue-500'
              }`}
          >
            {t.gallery}
          </button>
        </div>

        {/* About Dress Tab */}
        {activeTab === 'about' && (
          <>
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-md mb-6">
              <div className="space-y-6">
                {/* Dress Name */}
                <div className="flex justify-between items-start pb-6 border-b-2 border-gray-100">
                  <div className="text-sm text-gray-500">{t.dressName}</div>
                  <div className="text-lg font-semibold text-gray-900 text-right max-w-md">
                    {dressData.dress_name || '--'}
                  </div>
                </div>

                {/* Added Date */}
                <div className="flex justify-between items-start pb-6 border-b-2 border-gray-100">
                  <div className="text-sm text-gray-500">{t.addedDate}</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatDate(dressData.created_at)}
                  </div>
                </div>

                {/* Shoulder Measurement */}
                <div className="flex justify-between items-start pb-6 border-b-2 border-gray-100">
                  <div className="text-sm text-gray-500">{t.shoulderMeasurement}</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {dressData.dress_shleft_size || '--'} sm
                  </div>
                </div>

                {/* Color */}
                <div className="flex justify-between items-start pb-6 border-b-2 border-gray-100">
                  <div className="text-sm text-gray-500">{t.color}</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {dressData.dress_color || '--'}
                  </div>
                </div>

                {/* Who Added */}
                <div className="flex justify-between items-start pb-6 border-b-2 border-gray-100">
                  <div className="text-sm text-gray-500">{t.whoAdded}</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {dressData.added_by || '--'}
                  </div>
                </div>

                {/* Author */}
                <div className="flex justify-between items-start pb-6 border-b-2 border-gray-100">
                  <div className="text-sm text-gray-500">{t.author}</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {dressData.dress_author || '--'}
                  </div>
                </div>

                {/* Description */}
                <div className="flex justify-between items-start">
                  <div className="text-sm text-gray-500">{t.description}</div>
                  <div className="text-lg font-semibold text-gray-900 text-right max-w-md">
                    {dressData.description || '--'}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex-1 py-4 bg-red-600 text-white rounded-xl font-semibold text-lg
                  active:scale-[0.98] transition-all shadow-md"
              >
                {t.deleteDress}
              </button>
              <button
                onClick={() => setShowEditModal(true)}
                className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg
                  active:scale-[0.98] transition-all shadow-md"
              >
                {t.editDress}
              </button>
            </div>
          </>
        )}

        {/* Gallery Tab */}
        {activeTab === 'gallery' && (
          <div>
            {dressData.dress_image && dressData.dress_image.length > 0 ? (
              <div className="grid grid-cols-3 gap-6">
                {dressData.dress_image.map((image, index) => (
                  <div
                    key={index}
                    onClick={() => handleImageClick(index)}
                    className="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-md
                      active:scale-[0.98] active:border-blue-500 transition-all cursor-pointer"
                  >
                    <img
                      src={getImageUrl(image)}
                      alt={`Dress ${index + 1}`}
                      className="w-full h-80 object-cover rounded-xl"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-12 text-center shadow-md">
                <div className="text-6xl mb-6">📷</div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  {t.noImages}
                </h2>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fullscreen Image Viewer */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setFullscreenImage(null)}
        >
          {/* Previous Button */}
          <button
            onClick={handlePrevImage}
            className="absolute left-8 text-white text-6xl font-bold
              active:scale-90 transition-transform"
          >
            ‹
          </button>

          {/* Image */}
          <img
            src={getImageUrl(fullscreenImage)}
            alt="Fullscreen"
            className="max-w-[90%] max-h-[90%] object-contain"
          />

          {/* Next Button */}
          <button
            onClick={handleNextImage}
            className="absolute right-8 text-white text-6xl font-bold
              active:scale-90 transition-transform"
          >
            ›
          </button>

          {/* Close Button */}
          <button
            onClick={() => setFullscreenImage(null)}
            className="absolute top-8 right-8 text-white text-4xl font-bold
              active:scale-90 transition-transform"
          >
            ✕
          </button>

          {/* Image Counter */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2
            bg-black/50 text-white px-6 py-3 rounded-xl text-lg">
            {currentImageIndex + 1} / {dressData.dress_image.length}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t.deleteConfirm}
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              {dressData.dress_name}
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold
                  active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-semibold
                  active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    {t.deleting || 'Deleting...'}
                  </span>
                ) : (
                  'OK'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <EditDressModal
          dress={dressData}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Error Modal */}
      {showError && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-8"
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
    </div>
  );
};

export default DressDetails;
