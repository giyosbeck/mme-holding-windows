import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { getSalonDetails } from '../services/salonApi';
import { getImageUrl } from '../services/api';

const SalonDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const t = useTranslation();

  const [salonData, setSalonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSalonDetails();
  }, [id]);

  const fetchSalonDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getSalonDetails(id);
      setSalonData(data);
      console.log('🏪 Salon Details:', data);
    } catch (err) {
      console.error('❌ Failed to fetch salon details:', err);
      setError('Failed to load salon details');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('uz-UZ').format(price || 0) + ' UZS';
  };

  const formatPhone = (phone) => {
    if (!phone) return '--';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 12 && cleaned.startsWith('998')) {
      return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8, 10)} ${cleaned.slice(10)}`;
    }
    return phone;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '--';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
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

  if (error || !salonData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6">⚠️</div>
          <p className="text-xl text-red-600">{error || 'Salon not found'}</p>
          <button
            onClick={() => navigate('/salon/salons')}
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
              onClick={() => navigate('/salon/salons')}
              className="w-14 h-14 rounded-full border-2 border-gray-200
                flex items-center justify-center text-2xl
                active:scale-[0.98] active:border-blue-500 transition-all"
            >
              ←
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">
              {salonData.salon_name}
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

      <div className="max-w-7xl mx-auto px-8 py-8 space-y-6">
        {/* Salon Image */}
        {salonData.salon_image && (
          <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-md">
            <img
              src={getImageUrl(salonData.salon_image)}
              alt={salonData.salon_name}
              loading="lazy"
              className="w-full h-80 object-cover"
            />
          </div>
        )}

        {/* Top 3 Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Sales */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-md">
            <div className="text-3xl mb-2">💰</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t.totalSales || 'Umumiy savdo'}
            </h3>
            <p className="text-2xl font-bold text-green-600">
              {formatPrice(salonData.salon_total_sale)}
            </p>
          </div>

          {/* Total Debt */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-md">
            <div className="text-3xl mb-2">📊</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t.totalDebt || 'Qarzdorlik'}
            </h3>
            <p className="text-2xl font-bold text-red-600">
              {formatPrice(salonData.salon_debt)}
            </p>
          </div>

          {/* Total Products */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-md">
            <div className="text-3xl mb-2">📦</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t.totalProducts || 'Mahsulotlar'}
            </h3>
            <p className="text-2xl font-bold text-blue-600">
              {salonData.product_count || 0}
            </p>
          </div>
        </div>

        {/* Salon Information Card */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {t.salonInformation || 'Salon ma\'lumotlari'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span className="text-gray-600">{t.salonName || 'Salon nomi'}:</span>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {salonData.salon_name}
              </p>
            </div>

            <div>
              <span className="text-gray-600">{t.salonOwner || 'Salonchi ismi'}:</span>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {salonData.customer_name}
              </p>
            </div>

            <div>
              <span className="text-gray-600">{t.createdDate || 'Kiritilgan sana'}:</span>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {formatDate(salonData.created_at)}
              </p>
            </div>

            <div>
              <span className="text-gray-600">{t.phoneNumber || 'Telefon raqami'}:</span>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {formatPhone(salonData.customer_phone)}
              </p>
            </div>

            {salonData.salon_address && (
              <div className="md:col-span-2">
                <span className="text-gray-600">{t.address || 'Manzil'}:</span>
                <p className="text-lg text-gray-900 mt-1">
                  {salonData.salon_address}
                </p>
              </div>
            )}

            {salonData.description && (
              <div className="md:col-span-2">
                <span className="text-gray-600">{t.description || 'Tavsif'}:</span>
                <p className="text-lg text-gray-900 mt-1">
                  {salonData.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Orders (Buyurtmalar) Card */}
        {salonData.orders && (
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <span>📋</span>
              {t.orders || 'Buyurtmalar'}
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-gray-600 text-sm">{t.dressCount || 'Koylaklar soni'}:</span>
                <p className="text-xl font-semibold text-gray-900 mt-1">
                  {salonData.orders.dress_count || 0}
                </p>
              </div>

              <div>
                <span className="text-gray-600 text-sm">{t.paid || 'To\'landi'}:</span>
                <p className="text-xl font-semibold text-green-600 mt-1">
                  {formatPrice(salonData.orders.payment)}
                </p>
              </div>

              <div>
                <span className="text-gray-600 text-sm">{t.debt || 'Qarz'}:</span>
                <p className="text-xl font-semibold text-red-600 mt-1">
                  {formatPrice(salonData.orders.debt)}
                </p>
              </div>

              <div>
                <span className="text-gray-600 text-sm">{t.totalSale || 'Umumiy'}:</span>
                <p className="text-xl font-semibold text-blue-600 mt-1">
                  {formatPrice(salonData.orders.total_sale)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Simple Sales (Oddiy sotuv) Card */}
        {salonData.simple_sale && (
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <span>💰</span>
              {t.simpleSales || 'Oddiy sotuv'}
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-gray-600 text-sm">{t.dressCount || 'Koylaklar soni'}:</span>
                <p className="text-xl font-semibold text-gray-900 mt-1">
                  {salonData.simple_sale.dress_count || 0}
                </p>
              </div>

              <div>
                <span className="text-gray-600 text-sm">{t.paid || 'To\'landi'}:</span>
                <p className="text-xl font-semibold text-green-600 mt-1">
                  {formatPrice(salonData.simple_sale.payment)}
                </p>
              </div>

              <div>
                <span className="text-gray-600 text-sm">{t.debt || 'Qarz'}:</span>
                <p className="text-xl font-semibold text-red-600 mt-1">
                  {formatPrice(salonData.simple_sale.debt)}
                </p>
              </div>

              <div>
                <span className="text-gray-600 text-sm">{t.totalSale || 'Umumiy'}:</span>
                <p className="text-xl font-semibold text-blue-600 mt-1">
                  {formatPrice(salonData.simple_sale.total_sale)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 50/50 Sales Card */}
        {salonData.sale_5050 && (
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <span>🤝</span>
              {t.fiftyFiftySales || '50/50 sotuv'}
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-gray-600 text-sm">{t.dressCount || 'Koylaklar soni'}:</span>
                <p className="text-xl font-semibold text-gray-900 mt-1">
                  {salonData.sale_5050.dress_count || 0}
                </p>
              </div>

              <div>
                <span className="text-gray-600 text-sm">{t.paid || 'To\'landi'}:</span>
                <p className="text-xl font-semibold text-green-600 mt-1">
                  {formatPrice(salonData.sale_5050.payment)}
                </p>
              </div>

              <div>
                <span className="text-gray-600 text-sm">{t.debt || 'Qarz'}:</span>
                <p className="text-xl font-semibold text-red-600 mt-1">
                  {formatPrice(salonData.sale_5050.debt)}
                </p>
              </div>

              <div>
                <span className="text-gray-600 text-sm">{t.totalSale || 'Umumiy'}:</span>
                <p className="text-xl font-semibold text-blue-600 mt-1">
                  {formatPrice(salonData.sale_5050.total_sale)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Accessories Card */}
        {salonData.accessory && (
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <span>💍</span>
              {t.accessories || 'Aksesuarlar'}
            </h2>

            <div>
              <span className="text-gray-600 text-sm">{t.totalPaid || 'To\'langan pul'}:</span>
              <p className="text-2xl font-semibold text-green-600 mt-2">
                {formatPrice(salonData.accessory.payment)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalonDetails;
