import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import useAuthStore from '../store/authStore';
import { getAllOrders } from '../services/factoryManagerApi';
import { getImageUrl } from '../services/api';
import { useKeyboard } from '../context/KeyboardContext';

const FactoryManagerHome = () => {
  const navigate = useNavigate();
  const t = useTranslation();
  const { user } = useAuthStore();
  const { showKeyboard } = useKeyboard();

  // State
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('confirmed'); // 'confirmed' or 'unconfirmed'
  const [confirmedCount, setConfirmedCount] = useState(0);
  const [unconfirmedCount, setUnconfirmedCount] = useState(0);

  // Fetch orders on mount and when tab changes
  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  // Fetch counts for both tabs on mount
  useEffect(() => {
    fetchCounts();
  }, []);

  // Filter orders based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredOrders(orders);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = orders.filter(order => {
      const salonName = order.salon_name?.toLowerCase() || '';
      const dressName = order.dress_name?.toLowerCase() || '';
      const orderNumber = order.order_number?.toString() || '';

      return salonName.includes(query) ||
             dressName.includes(query) ||
             orderNumber.includes(query);
    });

    console.log('🔍 Search Results:', {
      query: searchQuery,
      originalCount: orders.length,
      filteredCount: filtered.length
    });

    setFilteredOrders(filtered);
  }, [searchQuery, orders]);

  const fetchCounts = async () => {
    try {
      // Fetch both confirmed and unconfirmed counts
      const [confirmedData, unconfirmedData] = await Promise.all([
        getAllOrders(true),
        getAllOrders(false)
      ]);

      setConfirmedCount(confirmedData?.length || 0);
      setUnconfirmedCount(unconfirmedData?.length || 0);

      console.log('📊 Tab Counts:', {
        confirmed: confirmedData?.length || 0,
        unconfirmed: unconfirmedData?.length || 0
      });
    } catch (err) {
      console.error('❌ Failed to fetch counts:', err);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      const accepted = activeTab === 'confirmed';
      const data = await getAllOrders(accepted);

      setOrders(data || []);
      setFilteredOrders(data || []);

      // Update count for the active tab
      if (accepted) {
        setConfirmedCount(data?.length || 0);
      } else {
        setUnconfirmedCount(data?.length || 0);
      }

      console.log('📦 Fetched Orders:', {
        tab: activeTab,
        accepted,
        count: data?.length || 0
      });
    } catch (err) {
      console.error('❌ Failed to fetch orders:', err);
      setError('Failed to load orders');
      setOrders([]);
      setFilteredOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Format date and get color based on proximity to today
  const formatDateWithColor = (dateString) => {
    if (!dateString) return { formatted: '--', color: 'text-gray-400' };

    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day

    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Format date as DD.MM.YYYY
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const formatted = `${day}.${month}.${year}`;

    // Determine color
    let color;
    if (diffDays < 0) {
      color = 'text-red-600'; // Past date - red
    } else if (diffDays < 7) {
      color = 'text-orange-500'; // Less than 7 days - orange
    } else {
      color = 'text-green-600'; // More than 7 days - green
    }

    return { formatted, color };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            {t.factoryManager}
          </h1>

          {/* Navigation Links */}
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/factory-manager/home')}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium shadow-md"
            >
              {t.homepage}
            </button>
            <button
              onClick={() => navigate('/factory-manager/statistics')}
              className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-medium
                active:scale-[0.98] active:border-blue-500 transition-all"
            >
              {t.statistics}
            </button>
            <button
              onClick={() => navigate('/factory-manager/reports')}
              className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-medium
                active:scale-[0.98] active:border-blue-500 transition-all"
            >
              {t.reports}
            </button>
          </div>

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
      <div className="max-w-7xl mx-auto px-8 py-10">
        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder={t.searchOrders}
            value={searchQuery}
            readOnly
            onFocus={(e) => {
              e.target.blur(); // Prevent physical keyboard
              showKeyboard('text', searchQuery, setSearchQuery, () => {});
            }}
            onClick={() => {
              showKeyboard('text', searchQuery, setSearchQuery, () => {});
            }}
            className="w-full h-16 px-6 text-lg rounded-xl border-2 border-gray-200
              focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
          />
        </div>

        {/* Tab Selector with Counts */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('confirmed')}
            className={`flex-1 h-14 rounded-xl font-medium text-lg transition-all
              ${activeTab === 'confirmed'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-white border-2 border-gray-200 text-gray-700 active:scale-[0.98]'
              }`}
          >
            {t.confirmed} ({confirmedCount})
          </button>
          <button
            onClick={() => setActiveTab('unconfirmed')}
            className={`flex-1 h-14 rounded-xl font-medium text-lg transition-all
              ${activeTab === 'unconfirmed'
                ? 'bg-orange-600 text-white shadow-md'
                : 'bg-white border-2 border-gray-200 text-gray-700 active:scale-[0.98]'
              }`}
          >
            {t.unconfirmed} ({unconfirmedCount})
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="text-xl text-gray-600">Loading...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center">
            <div className="text-red-600 text-lg">{error}</div>
          </div>
        )}

        {/* No Orders */}
        {!loading && !error && filteredOrders.length === 0 && (
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-12 text-center">
            <div className="text-gray-500 text-xl">{t.noOrders}</div>
          </div>
        )}

        {/* Order Cards Grid */}
        {!loading && !error && filteredOrders.length > 0 && (
          <div className="grid grid-cols-2 gap-6">
            {filteredOrders.map((order) => {
              return (
                <div
                  key={order.id}
                  className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-md
                    active:scale-[0.98] active:border-blue-500 transition-all cursor-pointer"
                  onClick={() => {
                    console.log('📋 Order Clicked:', order);
                    navigate(`/factory-manager/order/${order.id}`);
                  }}
                >
                  {/* Card Content - Horizontal Layout */}
                  <div className="flex items-center gap-5">
                    {/* Dress Image */}
                    <div className="w-32 h-32 flex-shrink-0">
                      {order.dress_image ? (
                        <img
                          src={getImageUrl(order.dress_image)}
                          alt={order.dress_name}
                          className="w-full h-full object-cover rounded-lg"
                          onLoad={() => {
                            console.log('✅ Image loaded:', order.dress_name);
                          }}
                          onError={(e) => {
                            console.error('❌ Image failed to load:', {
                              url: e.target.src,
                              originalPath: order.dress_image
                            });
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-10 h-10 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Order Info */}
                    <div className="flex-1 space-y-2">
                      {/* Dress Name */}
                      <div>
                        <div className="text-sm text-gray-500">{t.dressName}</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {order.dress_name}
                        </div>
                      </div>

                      {/* Order Number */}
                      <div>
                        <div className="text-sm text-gray-500">{t.orderNumber}</div>
                        <div className="text-lg font-semibold text-gray-900">
                          #{order.order_number}
                        </div>
                      </div>

                      {/* Delivery Date with Color */}
                      <div>
                        <div className="text-sm text-gray-500">{t.weddingDate}</div>
                        {(() => {
                          const dateInfo = formatDateWithColor(order.delivery_date);
                          return (
                            <div className={`text-lg font-semibold ${dateInfo.color}`}>
                              {dateInfo.formatted}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FactoryManagerHome;
