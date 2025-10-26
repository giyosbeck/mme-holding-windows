import api from './api';

/**
 * Salon API Service
 * All API calls for SALON role (role code "3")
 */

// ============================================
// DRESS MANAGEMENT APIs
// ============================================

/**
 * Get all dresses ordered by date
 * @returns {Promise} Array of dresses grouped by date
 */
export const getAllDressesOrderedByDate = async () => {
  try {
    const response = await api.get('/dress/ordered-by-date');
    console.log('👗 Dresses by Date:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch dresses:', error);
    throw error;
  }
};

/**
 * Get all dresses
 * @returns {Promise} Array of all dresses
 */
export const getAllDresses = async () => {
  try {
    const response = await api.get('/dress/all');
    console.log('👗 All Dresses:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch dresses:', error);
    throw error;
  }
};

/**
 * Get dress details by ID
 * @param {string} id - Dress ID
 * @returns {Promise} Dress details object
 */
export const getDressById = async (id) => {
  try {
    const response = await api.get(`/dress/${id}`);
    console.log('📋 Dress Details:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch dress details:', error);
    throw error;
  }
};

/**
 * Create a new dress
 * @param {Object} dressData - Dress information
 * @returns {Promise} Created dress object
 */
export const createDress = async (dressData) => {
  try {
    const response = await api.post('/dress/create', dressData);
    console.log('✅ Dress Created:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to create dress:', error);
    throw error;
  }
};

/**
 * Update existing dress
 * @param {Object} dressData - Updated dress information
 * @returns {Promise} Updated dress object
 */
export const updateDress = async (dressData) => {
  try {
    const response = await api.put('/dress/update', dressData);
    console.log('✅ Dress Updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to update dress:', error);
    throw error;
  }
};

/**
 * Delete a dress
 * @param {string} id - Dress ID
 * @returns {Promise} Response object
 */
export const deleteDress = async (id) => {
  try {
    const response = await api.delete('/dress/delete', {
      params: { id }
    });
    console.log('✅ Dress Deleted:', id);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to delete dress:', error);
    throw error;
  }
};

/**
 * Delete a specific image from dress
 * @param {string} id - Dress ID
 * @param {string} imageURL - Image URL to delete
 * @returns {Promise} Response object
 */
export const deleteDressImage = async (id, imageURL) => {
  try {
    const response = await api.delete('/dress/delete-image', {
      params: { id, imageURL }
    });
    console.log('✅ Dress Image Deleted');
    return response.data;
  } catch (error) {
    console.error('❌ Failed to delete dress image:', error);
    throw error;
  }
};

/**
 * Get available dress colors
 * @returns {Promise} Array of color objects
 */
export const getDressColors = async () => {
  try {
    const response = await api.get('/dress/colors');
    console.log('🎨 Dress Colors:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch dress colors:', error);
    throw error;
  }
};

/**
 * Get all dress authors/designers
 * @returns {Promise} Array of author objects
 */
export const getDressAuthors = async () => {
  try {
    const response = await api.get('/dress/authors');
    console.log('👥 Dress Authors:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch dress authors:', error);
    throw error;
  }
};

/**
 * Get ready dresses for orders
 * @returns {Promise} Array of ready dresses
 */
export const getReadyDresses = async () => {
  try {
    const response = await api.get('/dress-order/ready/all');
    console.log('✅ Ready Dresses:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch ready dresses:', error);
    throw error;
  }
};

// ============================================
// SALON (CUSTOMER) MANAGEMENT APIs
// ============================================

/**
 * Get all salons
 * @returns {Promise} Array of salon objects
 */
export const getAllSalons = async () => {
  try {
    const response = await api.get('/salon/all');
    console.log('🏪 All Salons:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch salons:', error);
    throw error;
  }
};

/**
 * Get salon details by ID
 * @param {string} salonID - Salon ID
 * @returns {Promise} Salon details with statistics
 */
export const getSalonDetails = async (salonID) => {
  try {
    const response = await api.get(`/salon/all/${salonID}/`);
    console.log('📋 Salon Details:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch salon details:', error);
    throw error;
  }
};

/**
 * Create a new salon
 * @param {Object} salonData - Salon information
 * @returns {Promise} Created salon object
 */
export const createSalon = async (salonData) => {
  try {
    const response = await api.post('/salon/create', salonData);
    console.log('✅ Salon Created:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to create salon:', error);
    throw error;
  }
};

// ============================================
// SIMPLE SALE APIs
// ============================================

/**
 * Create a simple sale
 * @param {Object} saleData - Sale information
 * @returns {Promise} Created sale object
 */
export const createSimpleSale = async (saleData) => {
  try {
    const response = await api.post('/simple-sale/create', saleData);
    console.log('✅ Simple Sale Created:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to create simple sale:', error);
    throw error;
  }
};

/**
 * Get all simple sales with pagination
 * @param {number} limit - Number of records per page
 * @param {number} offset - Page offset
 * @returns {Promise} Array of simple sales
 */
export const getAllSimpleSales = async (limit = 20, offset = 0) => {
  try {
    const response = await api.get('/simple-sale/all', {
      params: { limit, offset }
    });
    console.log('📋 Simple Sales:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch simple sales:', error);
    throw error;
  }
};

/**
 * Get simple sale details by ID
 * @param {string} id - Simple sale ID
 * @returns {Promise} Simple sale details
 */
export const getSimpleSaleDetails = async (id) => {
  try {
    const response = await api.get(`/simple-sale/${id}`);
    console.log('📋 Simple Sale Details:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch simple sale details:', error);
    throw error;
  }
};

/**
 * Get all simple sale debts
 * @returns {Promise} Array of sales with outstanding debts
 */
export const getSimpleSaleDebts = async () => {
  try {
    const response = await api.get('/simple-sale/debt/all');
    console.log('💰 Simple Sale Debts:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch simple sale debts:', error);
    throw error;
  }
};

/**
 * Pay simple sale debt
 * @param {Object} paymentData - Payment information
 * @returns {Promise} Payment response
 */
export const paySimpleSaleDebt = async (paymentData) => {
  try {
    const response = await api.post('/simple-sale/debt/payment', paymentData);
    console.log('✅ Simple Sale Debt Paid:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to pay simple sale debt:', error);
    throw error;
  }
};

/**
 * Get simple sale payment history
 * @param {string} orderId - Simple sale ID
 * @returns {Promise} Array of payment history
 */
export const getSimpleSalePaymentHistory = async (orderId) => {
  try {
    const response = await api.get(`/simple-sale/debt-history/${orderId}`);
    console.log('📜 Simple Sale Payment History:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch payment history:', error);
    throw error;
  }
};

// ============================================
// 50/50 SALE APIs
// ============================================

/**
 * Create a 50/50 sale
 * @param {Object} saleData - Sale information
 * @returns {Promise} Created sale object
 */
export const createFiftyFiftySale = async (saleData) => {
  try {
    const response = await api.post('/sale5050/create', saleData);
    console.log('✅ 50/50 Sale Created:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to create 50/50 sale:', error);
    throw error;
  }
};

/**
 * Get all 50/50 sales
 * @returns {Promise} Array of 50/50 sales
 */
export const getAllFiftyFiftySales = async () => {
  try {
    const response = await api.get('/sale5050/all');
    console.log('📋 50/50 Sales:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch 50/50 sales:', error);
    throw error;
  }
};

/**
 * Get 50/50 sale details by ID
 * @param {string} id - 50/50 sale ID
 * @returns {Promise} 50/50 sale details
 */
export const getFiftyFiftySaleDetails = async (id) => {
  try {
    const response = await api.get(`/sale5050/${id}`);
    console.log('📋 50/50 Sale Details:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch 50/50 sale details:', error);
    throw error;
  }
};

/**
 * Get all 50/50 debts
 * @returns {Promise} Array of 50/50 sales with outstanding debts
 */
export const getFiftyFiftyDebts = async () => {
  try {
    const response = await api.get('/sale5050/debt/all');
    console.log('💰 50/50 Sale Debts:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch 50/50 debts:', error);
    throw error;
  }
};

/**
 * Pay 50/50 debt
 * @param {Object} paymentData - Payment information
 * @returns {Promise} Payment response
 */
export const payFiftyFiftyDebt = async (paymentData) => {
  try {
    const response = await api.post('/sale5050/debt/payment', paymentData);
    console.log('✅ 50/50 Debt Paid:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to pay 50/50 debt:', error);
    throw error;
  }
};

/**
 * Get 50/50 payment history
 * @param {string} saleId - 50/50 sale ID
 * @returns {Promise} Array of payment history
 */
export const getFiftyFiftyPaymentHistory = async (saleId) => {
  try {
    const response = await api.get('/sale5050/debt-history', {
      params: { search_by: saleId }
    });
    console.log('📜 50/50 Payment History:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch payment history:', error);
    throw error;
  }
};

/**
 * Get 50/50 sales without salon
 * @param {number} limit - Number of records per page
 * @param {number} offset - Page offset
 * @returns {Promise} Array of 50/50 sales without salon
 */
export const getFiftyFiftyWithoutSalon = async (limit = 20, offset = 0) => {
  try {
    const response = await api.get('/sale5050/not-salon', {
      params: { limit, offset }
    });
    console.log('🔍 50/50 Sales Without Salon:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch 50/50 sales without salon:', error);
    throw error;
  }
};

/**
 * Get 50/50 sale without salon details by ID
 * @param {string} id - Sale ID
 * @returns {Promise} Sale details object
 */
export const getFiftyFiftyNoSalonDetails = async (id) => {
  try {
    const response = await api.get(`/sale5050/not-salon/${id}`);
    console.log('📋 50/50 Sale Without Salon Details:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch 50/50 sale without salon details:', error);
    throw error;
  }
};

/**
 * Connect salon to 50/50 sale
 * @param {Object} data - Connection data
 * @param {string} data.sale50_id - 50/50 sale ID
 * @param {string} data.customer_salon_id - Salon ID to connect
 * @param {number} data.salon_must_pay - Amount salon must pay
 * @param {number} data.central_bank_usd_course - USD exchange rate
 * @param {number} data.money_salon_usd - Amount paid in USD
 * @param {number} data.money_salon_uzs - Amount paid in UZS
 * @param {string} data.date_gives_debt - Debt payment date (optional)
 * @param {string} data.description - Description
 * @returns {Promise} Response object
 */
export const connectSalonToFiftyFifty = async (data) => {
  try {
    const response = await api.put('/sale5050/connect-salon', data);
    console.log('✅ Salon Connected to 50/50 Sale:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to connect salon:', error);
    throw error;
  }
};

// ============================================
// ACCESSORY SALE APIs
// ============================================

/**
 * Create an accessory sale
 * @param {Object} saleData - Accessory sale information
 * @returns {Promise} Created sale object
 */
export const createAccessorySale = async (saleData) => {
  try {
    const response = await api.post('/accessory/create', saleData);
    console.log('✅ Accessory Sale Created:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to create accessory sale:', error);
    throw error;
  }
};

/**
 * Get all sold accessories with pagination
 * @param {number} limit - Number of records per page
 * @param {number} offset - Page offset
 * @returns {Promise} Array of sold accessories
 */
export const getAllSoldAccessories = async (limit = 20, offset = 0) => {
  try {
    const response = await api.get('/accessory/sold', {
      params: { limit, offset }
    });
    console.log('📋 Sold Accessories:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch sold accessories:', error);
    throw error;
  }
};

// ============================================
// DRESS ORDER APIs
// ============================================

/**
 * Create a dress order (new version)
 * @param {Object} orderData - Order information
 * @returns {Promise} Created order object
 */
export const createDressOrder = async (orderData) => {
  try {
    const response = await api.post('/dress-order/create-new', orderData);
    console.log('✅ Dress Order Created:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to create dress order:', error);
    throw error;
  }
};

/**
 * Get all dress order debts
 * @returns {Promise} Array of orders with outstanding debts
 */
export const getDressOrderDebts = async () => {
  try {
    const response = await api.get('/dress-order/debt/all');
    console.log('💰 Dress Order Debts:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch dress order debts:', error);
    throw error;
  }
};

/**
 * Get dress order payment history
 * @param {string} orderID - Order ID
 * @returns {Promise} Array of payment history
 */
export const getDressOrderPaymentHistory = async (orderID) => {
  try {
    const response = await api.get(`/dress-order/payment/history/${orderID}`);
    console.log('📜 Dress Order Payment History:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch payment history:', error);
    throw error;
  }
};

/**
 * Pay dress order debt
 * @param {Object} paymentData - Payment information
 * @returns {Promise} Payment response
 */
export const payDressOrderDebt = async (paymentData) => {
  try {
    const response = await api.post('/dress-order/payment', paymentData);
    console.log('✅ Dress Order Debt Paid:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to pay dress order debt:', error);
    throw error;
  }
};

// ============================================
// REPORT APIs
// ============================================

/**
 * Get salon detail report
 * @param {string} user_id - User ID
 * @returns {Promise} Detailed report object
 */
export const getSalonDetailReport = async (user_id) => {
  try {
    const response = await api.get('/report/salon-details', {
      params: { user_id }
    });
    console.log('📊 Salon Detail Report:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch salon detail report:', error);
    throw error;
  }
};

/**
 * Get salon general report
 * @param {string} from - Start date (yyyy-MM-dd)
 * @param {string} to - End date (yyyy-MM-dd)
 * @returns {Promise} General report object
 */
export const getSalonGeneralReport = async (from, to) => {
  try {
    const response = await api.get('/report/salon-general', {
      params: { from, to }
    });
    console.log('📊 Salon General Report:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch salon general report:', error);
    throw error;
  }
};

// ============================================
// UTILITY APIs
// ============================================

/**
 * Get current USD exchange rate from Central Bank
 * @returns {Promise} Exchange rate object
 */
export const getUSDExchangeRate = async () => {
  try {
    const response = await api.get('/other/central-bank-usd-rate');
    console.log('💵 USD Exchange Rate:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch USD exchange rate:', error);
    throw error;
  }
};
