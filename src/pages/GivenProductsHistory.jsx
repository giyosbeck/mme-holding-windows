import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import useLanguageStore from '../store/languageStore';
import ReturnProductModal from '../components/ReturnProductModal';
import { getSupplyProjects, getProductsByProjectId, cancelSupply } from '../services/supplyApi';
import { getImageUrl } from '../services/api';
import { useKeyboard } from '../context/KeyboardContext';

const GivenProductsHistory = () => {
  const navigate = useNavigate();
  const t = useTranslation();
  const { language } = useLanguageStore();
  const { showKeyboard } = useKeyboard();

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectProducts, setProjectProducts] = useState([]);
  const [selectedProductForReturn, setSelectedProductForReturn] = useState(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [productSearchQuery, setProductSearchQuery] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await getSupplyProjects();
        console.log('Supply projects:', data);
        console.log('First project:', data?.[0]);
        setProjects(data);
      } catch (err) {
        console.error('Failed to fetch supply projects:', err);
        setError('Failed to load supply history');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Fetch products when project is selected
  useEffect(() => {
    if (!selectedProject) {
      setProjectProducts([]);
      return;
    }

    const fetchProducts = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await getProductsByProjectId(selectedProject.project_id);
        console.log('Project products:', data);
        console.log('First product:', data?.[0]);
        setProjectProducts(data);
      } catch (err) {
        console.error('Failed to fetch project products:', err);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedProject]);

  const handleGoBack = () => {
    if (selectedProject) {
      setSelectedProject(null);
      setProductSearchQuery(''); // Clear product search when going back
    } else {
      navigate('/supplying');
    }
  };

  const handleProjectClick = (project) => {
    console.log('Selected project:', project);
    setSelectedProject(project);
    setProductSearchQuery(''); // Clear product search when selecting new project
  };

  const handleCancelTransaction = async (product) => {
    if (!product) return;

    try {
      await cancelSupply(product.supply_id);
      alert('Transaction cancelled successfully');
      // Refresh products list
      const data = await getProductsByProjectId(selectedProject.project_id);
      setProjectProducts(data);
    } catch (err) {
      console.error('Failed to cancel supply:', err);
      alert('Failed to cancel transaction');
    }
  };

  const handleReturnProduct = (product) => {
    setSelectedProductForReturn(product);
    setShowReturnModal(true);
  };

  const handleReturnSuccess = async () => {
    setShowReturnModal(false);
    setSelectedProductForReturn(null);
    // Refresh products list
    try {
      const data = await getProductsByProjectId(selectedProject.project_id);
      setProjectProducts(data);
    } catch (err) {
      console.error('Failed to refresh products:', err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  };

  // Filter projects based on search query
  const filteredProjects = projects.filter((project) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      project.project_name?.toLowerCase().includes(query) ||
      project.project_type?.toLowerCase().includes(query)
    );
  });

  // Filter products based on search query
  const filteredProducts = projectProducts.filter((product) => {
    if (!productSearchQuery) return true;
    const query = productSearchQuery.toLowerCase();
    return product.product_name?.toLowerCase().includes(query);
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-8 py-3 flex items-center">
            <button
              onClick={handleGoBack}
              className="mr-4 text-2xl text-gray-600 hover:text-gray-900
                w-12 h-12 rounded-lg hover:bg-gray-100 flex items-center justify-center
                transition-colors"
            >
              ←
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">{t.givenProductsList}</h1>
          </div>
        </div>

        {/* Search Bar - only show when viewing projects list */}
        {!selectedProject && (
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-12 py-8">
              <input
                type="text"
                value={searchQuery}
                readOnly
                onFocus={(e) => {
                  e.target.blur();
                  showKeyboard('text', searchQuery, setSearchQuery, () => {});
                }}
                onClick={() => {
                  showKeyboard('text', searchQuery, setSearchQuery, () => {});
                }}
                placeholder={t.searchProducts}
                className="w-full border-2 border-gray-300 rounded-lg p-4 text-xl
                  focus:border-gray-900 focus:outline-none cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Product Search Bar - only show when viewing products in a project */}
        {selectedProject && (
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-12 py-8">
              <input
                type="text"
                value={productSearchQuery}
                readOnly
                onFocus={(e) => {
                  e.target.blur();
                  showKeyboard('text', productSearchQuery, setProductSearchQuery, () => {});
                }}
                onClick={() => {
                  showKeyboard('text', productSearchQuery, setProductSearchQuery, () => {});
                }}
                placeholder={t.searchProducts}
                className="w-full border-2 border-gray-300 rounded-lg p-4 text-xl
                  focus:border-gray-900 focus:outline-none cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-12 py-16">
        {loading ? (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-500">Loading...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-2xl text-red-500">{error}</p>
          </div>
        ) : selectedProject ? (
          /* Product Cards View - Show all products with full details */
          filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-2xl text-gray-500">
                {productSearchQuery ? 'No products found matching your search' : t.noProducts}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-12">
              {filteredProducts.map((product) => (
                <div
                  key={product.supply_id}
                  className="bg-white border-2 border-gray-500 rounded-lg p-12 shadow-sm"
                >
                  <div className="flex items-start mb-10 pb-10 border-b border-gray-200">
                    <div className="w-28 h-28 flex-shrink-0 mr-8">
                      {product.product_image ? (
                        <img
                          src={getImageUrl(product.product_image)}
                          alt={product.product_name}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full flex items-center justify-center text-6xl ${product.product_image ? 'hidden' : 'flex'}`}>
                        📦
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                        {product.product_name}
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-8 mb-10">
                    {/* Given Amount */}
                    <div className="flex justify-between items-center">
                      <span className="text-xl text-gray-600">{t.givenAmount}:</span>
                      <span className="text-xl font-medium text-gray-900">
                        {product.product_count}
                      </span>
                    </div>

                    {/* Given Date */}
                    <div className="flex justify-between items-center">
                      <span className="text-xl text-gray-600">{t.givenDate}:</span>
                      <span className="text-xl font-medium text-gray-900">
                        {formatDate(product.given_at)}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="flex justify-between items-center">
                      <span className="text-xl text-gray-600">{t.status}:</span>
                      <span className="text-xl font-medium text-gray-900">
                        {product.status === 'pending' ? t.statusWaiting : t.statusReceived}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons based on status */}
                  {product.status === 'pending' ? (
                    <button
                      onClick={() => handleCancelTransaction(product)}
                      className="w-full h-16 text-xl font-medium rounded-lg
                        border-2 border-red-500 text-red-500 hover:bg-red-50 transition-colors"
                    >
                      {t.cancelTransaction}
                    </button>
                  ) : product.status === 'accepted' ? (
                    <button
                      onClick={() => handleReturnProduct(product)}
                      className="w-full h-16 text-xl font-medium rounded-lg
                        bg-gray-900 text-white hover:bg-gray-700 transition-colors"
                    >
                      {t.returnProducts}
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          )
        ) : (
          /* Project List View */
          filteredProjects.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-2xl text-gray-500">
                {searchQuery ? 'No projects found matching your search' : 'No supply projects found'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredProjects.map((project) => (
                <button
                  key={project.project_id}
                  onClick={() => handleProjectClick(project)}
                  className="w-full bg-white border-2 border-gray-200 hover:border-gray-900
                    rounded-lg p-8 flex items-center transition-colors text-left"
                >
                  <div className="w-24 h-24 flex-shrink-0 mr-8">
                    {project.image ? (
                      <img
                        src={getImageUrl(project.image)}
                        alt={project.project_name}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full flex items-center justify-center text-6xl ${project.image ? 'hidden' : 'flex'}`}>
                      📁
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900">
                      {project.project_name}
                    </h3>
                    {project.project_type && (
                      <p className="text-lg text-gray-600 mt-2">
                        {project.project_type}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )
        )}
      </div>

      {/* Return Product Modal */}
      {showReturnModal && selectedProductForReturn && (
        <ReturnProductModal
          product={selectedProductForReturn}
          onClose={() => {
            setShowReturnModal(false);
            setSelectedProductForReturn(null);
          }}
          onSuccess={handleReturnSuccess}
        />
      )}
    </div>
  );
};

export default GivenProductsHistory;
