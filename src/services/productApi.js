import api from './api';

/**
 * Product Management API Services
 */

// Get all product categories
export const getProductCategories = async () => {
  const response = await api.get('/product-category/all');
  return response.data;
};

// Create product category
export const createProductCategory = async (name) => {
  const response = await api.post('/product-category/create', { name });
  return response.data;
};

// Create product name
export const createProductName = async (name, categoryId) => {
  const response = await api.post('/product-name/create', {
    name,
    warehouse_product_category_id: categoryId
  });
  return response.data;
};

// Get all products with pagination and search
export const getAllProducts = async (limit, offset, search = '') => {
  const response = await api.get('/product/all', {
    params: {
      limit,
      offset,
      search
    }
  });
  return response.data;
};

// Get products by category ID with pagination and search
export const getProductsByCategory = async (categoryId, limit, offset, search = '') => {
  const response = await api.get(`/product/${categoryId}`, {
    params: {
      limit,
      offset,
      search
    }
  });
  return response.data;
};

// Create new product
export const createProduct = async (productData) => {
  const response = await api.post('/product/create', productData);
  return response.data;
};

// Update product
export const updateProduct = async (productData) => {
  const response = await api.put('/product/update', productData);
  return response.data;
};

// Delete product
export const deleteProduct = async (productId) => {
  const response = await api.delete('/product/one', {
    params: { id: productId }
  });
  return response.data;
};

// Add inventory to product (restock)
export const addProductInventory = async (productId, count, price, createdAt = null) => {
  const payload = {
    id: productId,
    product_count: count,
    product_price: price
  };

  if (createdAt) {
    payload.created_at = createdAt;
  }

  const response = await api.post('/product/add', payload);
  return response.data;
};

// Use/consume product from inventory
export const useProduct = async (productId, count) => {
  const response = await api.put('/product/use', {
    id: productId,
    productCount: count
  });
  return response.data;
};
