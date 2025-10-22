import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';

const SupplyingHome = () => {
  const navigate = useNavigate();
  const t = useTranslation();

  const actions = [
    {
      id: 1,
      title: t.giveProducts,
      icon: '📤',
      action: () => navigate('/supplying/give')
    },
    {
      id: 2,
      title: t.givenProductsList,
      icon: '📋',
      action: () => navigate('/supplying/history')
    }
  ];

  const handleGoBack = () => {
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-3 flex items-center">
          <button
            onClick={handleGoBack}
            className="mr-4 text-2xl text-gray-600 hover:text-gray-900
              w-12 h-12 rounded-lg hover:bg-gray-100 flex items-center justify-center
              transition-colors"
          >
            ←
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">{t.supplying}</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-12 py-16">
        <div className="grid grid-cols-2 gap-10">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={action.action}
              className="bg-white border-2 border-gray-200 hover:border-gray-900 rounded-lg p-12
                flex flex-col items-center justify-center transition-colors h-80"
            >
              <div className="text-8xl mb-6">{action.icon}</div>
              <h3 className="text-2xl font-medium text-gray-900">{action.title}</h3>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SupplyingHome;
