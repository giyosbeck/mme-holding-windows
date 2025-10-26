import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import useAuthStore from '../store/authStore';

const SalonHome = () => {
  const navigate = useNavigate();
  const t = useTranslation();
  const { user } = useAuthStore();

  const salesActions = [
    {
      id: 1,
      title: t.salonDressList || 'Koylaklar royxati',
      icon: '👗',
      path: '/salon/dresses',
      description: t.salonDressListDesc || 'View all dresses'
    },
    {
      id: 2,
      title: t.salonList || 'Salonlar royxati',
      icon: '🏪',
      path: '/salon/salons',
      description: t.salonListDesc || 'Manage salons'
    },
    {
      id: 3,
      title: t.salonOrderPlacement || 'Buyurtma qilish',
      icon: '📋',
      path: '/salon/order-placement',
      description: t.salonOrderPlacementDesc || 'Create order'
    },
    {
      id: 4,
      title: t.salonSimpleSale || 'Oddiy sotuv',
      icon: '💰',
      path: '/salon/simple-sale',
      description: t.salonSimpleSaleDesc || 'Simple sale'
    },
    {
      id: 5,
      title: t.salonFiftyFiftySale || '50/50 sotuv',
      icon: '🤝',
      path: '/salon/fifty-fifty-sale',
      description: t.salonFiftyFiftySaleDesc || '50/50 sale'
    },
    {
      id: 6,
      title: t.salonAccessorySale || 'Aksessuar sotish',
      icon: '💍',
      path: '/salon/accessory-sale',
      description: t.salonAccessorySaleDesc || 'Sell accessories'
    },
    {
      id: 7,
      title: t.salonFiftyFiftyNoSalon || "50/50 salon yo'qlar",
      icon: '🔗',
      path: '/salon/fifty-fifty-no-salon',
      description: t.salonFiftyFiftyNoSalonDesc || 'Attach salon to 50/50'
    },
    {
      id: 8,
      title: t.salonShipments || "Jonatmalar royxati",
      icon: '📦',
      path: '/salon/shipments',
      description: t.salonShipmentsDesc || 'Shipments list'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            {t.salon || 'Salon'}
          </h1>

          {/* Navigation Links */}
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/salon/home')}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium shadow-md"
            >
              {t.sales || 'Sotuv'}
            </button>
            <button
              onClick={() => navigate('/salon/statistics')}
              className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-medium
                active:scale-[0.98] active:border-blue-500 transition-all"
            >
              {t.statistics || 'Statistika'}
            </button>
            <button
              onClick={() => navigate('/salon/reports')}
              className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-medium
                active:scale-[0.98] active:border-blue-500 transition-all"
            >
              {t.reports || 'Hisobot'}
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

      {/* Main Content - Sales Actions Grid */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {salesActions.map((action) => (
            <button
              key={action.id}
              onClick={() => navigate(action.path)}
              className="bg-white border-2 border-gray-200 rounded-2xl p-8
                shadow-md transition-all text-left
                active:scale-[0.98] active:border-blue-500
                hover:shadow-lg"
            >
              <div className="text-5xl mb-4">{action.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {action.title}
              </h3>
              <p className="text-sm text-gray-600">
                {action.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SalonHome;
