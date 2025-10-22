import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { getOrderDetails, markOrderReady } from '../services/factoryManagerApi';
import { getImageUrl } from '../services/api';

const OrderDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const t = useTranslation();

  const [activeTab, setActiveTab] = useState('order'); // 'order' or 'gallery'
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completingProcess, setCompletingProcess] = useState(false);

  // Fullscreen image viewer state
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);
  const [allImages, setAllImages] = useState([]);

  // Confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Success/Error modal states
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getOrderDetails(id);
      setOrderData(data);

      // Detailed logging for debugging
      console.log('📋 ============ ORDER DETAILS ============');
      console.log('🆔 Order ID:', data.id);
      console.log('🔢 Order Number:', data.order_number);
      console.log('👗 Dress Name:', data.dress_name);
      console.log('📏 Shleft Size:', data.shleft_size);
      console.log('🎨 Dress Color:', data.dress_color);
      console.log('💰 Base Price:', data.base_price);
      console.log('📝 Description:', data.description);
      console.log('🖼️ Dress Images:', data.dress_images);
      console.log('🖼️ Order Dress Images:', data.order_dress_images);
      console.log('👰 Bride Data:', data.bride_data);
      console.log('🏪 Salon Data:', data.salon_data);
      console.log('✅ Accepted:', data.accepted);
      console.log('🎯 Ready:', data.ready);
      console.log('📅 Created At:', data.created_at);
      console.log('');
      console.log('🔍 ============ LOOKING FOR FIELDS ============');
      console.log('❓ debt_date field:', data.debt_date);
      console.log('❓ delivery field:', data.delivery);
      console.log('❓ must_be_delivered field:', data.must_be_delivered);
      console.log('❓ delivery_date field:', data.delivery_date);
      console.log('========================================');
      console.log('📦 Full Response Object:', data);
    } catch (err) {
      console.error('❌ Failed to fetch order details:', err);
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteProcessClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmComplete = async () => {
    if (!orderData?.id) return;

    setShowConfirmModal(false);
    setCompletingProcess(true);

    try {
      await markOrderReady(orderData.id, true);
      console.log('✅ Order marked as ready:', orderData.id);

      // Show success message
      setShowSuccess(true);
    } catch (err) {
      console.error('❌ Failed to mark order as ready:', err);
      setErrorMessage(t.errorMessage || 'Failed to mark order as ready');
      setShowError(true);
    } finally {
      setCompletingProcess(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    navigate('/factory-manager/home');
  };

  const handleCancelComplete = () => {
    setShowConfirmModal(false);
  };

  const handleGoBack = () => {
    navigate('/factory-manager/home');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '--';
    const date = new Date(dateString);
    // Add 5 hours for Tashkent timezone (UTC+5)
    const tashkentTime = new Date(date.getTime() + (5 * 60 * 60 * 1000));
    const day = String(tashkentTime.getDate()).padStart(2, '0');
    const month = String(tashkentTime.getMonth() + 1).padStart(2, '0');
    const year = tashkentTime.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const formatPhoneDisplay = (phone) => {
    if (!phone) return '--';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 12) {
      return `+${cleaned.slice(0,3)} ${cleaned.slice(3,5)} ${cleaned.slice(5,8)} ${cleaned.slice(8,10)} ${cleaned.slice(10,12)}`;
    }
    return phone;
  };

  // Fullscreen image navigation
  const handlePrevImage = () => {
    const newIndex = fullscreenIndex > 0 ? fullscreenIndex - 1 : allImages.length - 1;
    setFullscreenIndex(newIndex);
    setFullscreenImage(allImages[newIndex]);
  };

  const handleNextImage = () => {
    const newIndex = fullscreenIndex < allImages.length - 1 ? fullscreenIndex + 1 : 0;
    setFullscreenIndex(newIndex);
    setFullscreenImage(allImages[newIndex]);
  };

  const handleCloseFullscreen = () => {
    setFullscreenImage(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-8 py-3 flex items-center">
            <button
              onClick={handleGoBack}
              className="mr-4 text-2xl text-gray-600 active:text-gray-900
                w-12 h-12 rounded-lg active:bg-gray-100 flex items-center justify-center
                transition-colors"
            >
              ←
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">{t.orderDetails}</h1>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-8 py-10">
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center">
            <div className="text-red-600 text-lg">{error || 'Order not found'}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-3 flex items-center">
          <button
            onClick={handleGoBack}
            className="mr-4 text-2xl text-gray-600 active:text-gray-900
              w-12 h-12 rounded-lg active:bg-gray-100 flex items-center justify-center
              transition-colors"
          >
            ←
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">{t.orderDetails}</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-10">
        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('order')}
            className={`flex-1 h-14 rounded-xl font-medium text-lg transition-all
              ${activeTab === 'order'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white border-2 border-gray-200 text-gray-700 active:scale-[0.98]'
              }`}
          >
            {t.order}
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`flex-1 h-14 rounded-xl font-medium text-lg transition-all
              ${activeTab === 'gallery'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white border-2 border-gray-200 text-gray-700 active:scale-[0.98]'
              }`}
          >
            {t.gallery}
          </button>
        </div>

        {/* Order Tab Content */}
        {activeTab === 'order' && (
          <div className="space-y-6">
            {/* Card 1: Dress Details */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-md">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-4 border-b-2 border-gray-100">
                {t.dressDetails}
              </h2>
              <div className="space-y-4">
                {/* Dress Name */}
                <div>
                  <div className="text-sm text-gray-500 mb-1">{t.dressName}</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {orderData.dress_name || '--'}
                  </div>
                </div>

                {/* Shoulder Measurement */}
                <div>
                  <div className="text-sm text-gray-500 mb-1">{t.shoulderMeasurement}</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {orderData.shleft_size || '--'}
                  </div>
                </div>

                {/* Color */}
                <div>
                  <div className="text-sm text-gray-500 mb-1">{t.color}</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {orderData.dress_color || '--'}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <div className="text-sm text-gray-500 mb-1">{t.description}</div>
                  <div className="text-lg text-gray-900">
                    {orderData.description || '--'}
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Salon Details */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-md">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-4 border-b-2 border-gray-100">
                {t.salonDetails}
              </h2>
              <div className="space-y-4">
                {/* Salon Name */}
                <div>
                  <div className="text-sm text-gray-500 mb-1">{t.salonName}</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {orderData.salon_data?.salon_name || '--'}
                  </div>
                </div>

                {/* Salon Phone - Formatted */}
                <div>
                  <div className="text-sm text-gray-500 mb-1">{t.salonPhone}</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatPhoneDisplay(orderData.salon_data?.customer_phone)}
                  </div>
                </div>

                {/* Debt Giving Date */}
                <div>
                  <div className="text-sm text-gray-500 mb-1">{t.debtGivingDate}</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatDate(orderData.salon_data?.date_gives_debt_salon)}
                  </div>
                </div>

                {/* Delivery Needed */}
                <div>
                  <div className="text-sm text-gray-500 mb-1">{t.deliveryNeeded}</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {orderData.salon_data?.delivery_date_salon ? t.yes : t.no}
                  </div>
                </div>

                {/* Bride/Salon Delivery Date */}
                <div>
                  <div className="text-sm text-gray-500 mb-1">{t.brideDeliveryDate}</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatDate(orderData.salon_data?.delivery_date_salon)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Gallery Tab Content */}
        {activeTab === 'gallery' && (
          <div>
            {(() => {
              // Combine dress_images and order_dress_images
              const imagesList = [
                ...(orderData.dress_images || []),
                ...(orderData.order_dress_images || [])
              ];

              // Update allImages state when images change
              if (imagesList.length !== allImages.length) {
                setAllImages(imagesList);
              }

              return imagesList.length > 0 ? (
                <div className="grid grid-cols-2 gap-6">
                  {imagesList.map((image, index) => (
                    <div
                      key={index}
                      className="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-md
                        cursor-pointer active:scale-[0.98] transition-transform"
                      onClick={() => {
                        setFullscreenIndex(index);
                        setFullscreenImage(image);
                      }}
                    >
                      <img
                        src={getImageUrl(image)}
                        alt={`Order image ${index + 1}`}
                        className="w-full h-96 object-cover rounded-lg active:opacity-80 transition-opacity"
                        onError={(e) => {
                          console.error('❌ Image failed to load:', image);
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23ddd" width="400" height="400"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-12 text-center">
                  <div className="text-gray-500 text-xl">{t.noImages}</div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Process Completed Button */}
        <div className="mt-8">
          <button
            onClick={handleCompleteProcessClick}
            disabled={completingProcess}
            className={`w-full h-16 rounded-xl font-semibold text-xl transition-all
              ${completingProcess
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 text-white shadow-md active:scale-[0.98] active:bg-green-700'
              }`}
          >
            {completingProcess ? 'Processing...' : t.processCompleted}
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-8"
          onClick={handleCancelComplete}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 text-center">
              {t.deleteConfirm}
            </h2>
            <p className="text-lg text-gray-600 mb-8 text-center">
              {t.processCompleted}?
            </p>

            <div className="flex gap-4">
              <button
                onClick={handleCancelComplete}
                className="flex-1 h-14 rounded-xl border-2 border-gray-200 text-gray-700
                  font-semibold text-lg active:scale-[0.98] transition-all"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleConfirmComplete}
                className="flex-1 h-14 rounded-xl bg-green-600 text-white
                  font-semibold text-lg shadow-md active:scale-[0.98] active:bg-green-700 transition-all"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Image Viewer Modal */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={handleCloseFullscreen}
        >
          {/* Close Button */}
          <button
            onClick={handleCloseFullscreen}
            className="absolute top-4 right-4 w-14 h-14 rounded-full bg-white/10
              flex items-center justify-center text-white text-3xl font-bold
              active:bg-white/20 transition-colors z-10"
          >
            ✕
          </button>

          {/* Image Counter */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2
            bg-white/10 px-6 py-3 rounded-full text-white text-lg font-semibold">
            {fullscreenIndex + 1} / {allImages.length}
          </div>

          {/* Previous Button */}
          {allImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrevImage();
              }}
              className="absolute left-4 top-1/2 transform -translate-y-1/2
                w-16 h-32 bg-white/10 rounded-lg flex items-center justify-center
                text-white text-4xl font-bold active:bg-white/20 transition-colors"
            >
              ‹
            </button>
          )}

          {/* Main Image */}
          <img
            src={getImageUrl(fullscreenImage)}
            alt={`Fullscreen image ${fullscreenIndex + 1}`}
            className="max-w-[90%] max-h-[90%] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Next Button */}
          {allImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNextImage();
              }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2
                w-16 h-32 bg-white/10 rounded-lg flex items-center justify-center
                text-white text-4xl font-bold active:bg-white/20 transition-colors"
            >
              ›
            </button>
          )}
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-8"
          onClick={handleSuccessClose}
        >
          <div
            className="bg-white rounded-lg max-w-md w-full p-10 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-8xl mb-6">✅</div>
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">
              {t.successTitle || 'Success'}
            </h2>
            <p className="text-xl text-gray-600 mb-10">
              {t.successMessage || 'Operation completed successfully'}
            </p>
            <button
              onClick={handleSuccessClose}
              className="w-full h-14 text-xl font-medium rounded-lg
                bg-gray-900 text-white hover:bg-gray-700 transition-colors"
            >
              {t.close}
            </button>
          </div>
        </div>
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

export default OrderDetails;
