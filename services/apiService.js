import axios from 'axios';

// Base URL for all API calls
// https://backend-exp-1.onrender.com
// https://exciting-spice-armadillo.glitch.me
const BASE_URL = 'https://backend-exp-1.onrender.com';

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Error handler helper
const handleError = (error, customMessage = 'An error occurred') => {
  console.error(`${customMessage}:`, error);
  throw error;
};

// ==================== EXPENSE RELATED API CALLS ====================


export const getExpenseCosts = async (userId) => {
  try {
    const response = await api.get(`/getExpenseCost/${userId}`);
    return response.data;
  } catch (error) {
    handleError(error, 'Error fetching expense costs');
  }
};


export const getFilteredExpenses = async (userId, month, year) => {
  try {
    const allExpenses = await getExpenseCosts(userId);

    if (Array.isArray(allExpenses)) {
      // Filter by selected month and year
      const filteredByDate = allExpenses.filter(item => {
        const date = new Date(item.p_date);
        return (
          date.getMonth() + 1 === month && // getMonth() is 0-based
          date.getFullYear() === year
        );
      });

      // Sort filtered data by date (descending)
      return filteredByDate.sort(
        (a, b) => new Date(b.p_date) - new Date(a.p_date)
      );
    }

    return [];
  } catch (error) {
    handleError(error, 'Error filtering expenses');
    return [];
  }
};


export const addExpense = async (expenseData) => {
  try {
    const response = await api.post('/postExpenseData', expenseData);
    return response.data;
  } catch (error) {
    handleError(error, 'Error adding expense');
  }
};

// ==================== CATEGORY RELATED API CALLS ====================

export const getCategories = async (userId) => {
  try {
    const response = await api.get(`/categories/${userId}`);
    return response.data;
  } catch (error) {
    handleError(error, 'Error fetching categories');
  }
};


export const addCategory = async (userId, category) => {
  try {
    const response = await api.post('/addshopcategory', { id: userId, category });
    return response.data;
  } catch (error) {
    handleError(error, 'Error adding category');
  }
};

export const getCategoryReport = async (userId) => {
  try {
    const response = await api.get(`/getCategories/${userId}`);
    return response.data;
  } catch (error) {
    handleError(error, 'Error fetching category report');
  }
};

// ==================== PRODUCT RELATED API CALLS ====================




export const addProduct = async (userId, category, product) => {
  try {
    const response = await api.post('/addproduct', {
      id: userId,
      category,
      product,
    });
    return response.data;
  } catch (error) {
    handleError(error, 'Error adding product');
  }
};

// ==================== SOURCE/INCOME RELATED API CALLS ====================


export const getIncomeSources = async (userId, month, year) => {
  try {
    const response = await api.get(`/getSource/${userId}/${month}/${year}`);
    return response.data;
  } catch (error) {
    handleError(error, 'Error fetching income sources');
  }
};


export const getAllSourceData = async (userId) => {
  try {
    const response = await api.get(`/getSourceData/${userId}`);
    return response.data;
  } catch (error) {
    handleError(error, 'Error fetching source data');
  }
};


export const getDefaultSources = async (userId) => {
  try {
    const response = await api.get(`/getdefaultsources/${userId}`);
    return response.data;
  } catch (error) {
    handleError(error, 'Error fetching default sources');
  }
};


export const addSource = async (sourceData) => {
  try {
    const response = await api.post('/addSource', sourceData);
    return response.data;
  } catch (error) {
    handleError(error, 'Error adding source');
  }
};


export const addDefaultSource = async (sourceData) => {
  try {
    const response = await api.post('/adddefaultsource', sourceData);
    return response.data;
  } catch (error) {
    handleError(error, 'Error adding default source');
  }
};

// ==================== USER RELATED API CALLS ====================


export const registerUser = async (userData) => {
  try {
    console.log('Registering user with data:', userData);
    const response = await api.post('/register', userData);
    return response.data;
  } catch (error) {
    handleError(error, 'Error registering user');
  }
};


export const loginUser = async (loginData) => {
  try {
    console.log('Login Data:', loginData);
    const response = await api.post('/login', loginData);
    return response.data;
  } catch (error) {
    handleError(error.message, 'Error logging in');
  }
};

// ==================== SAVINGS RELATED API CALLS ====================

export const getSavingsData = async (userId) => {
  try {
    const response = await api.get(`/savings/${userId}`);
    return response.data;
  } catch (error) {
    handleError(error, 'Error fetching savings');
  }
};

export const getSavingsDataByMonthYear = async (userId, month, year) => {
  try {
    const response = await api.get(`/getSavings/${userId}/${month}/${year}`);
    return response.data;
  } catch (error) {
    handleError(error, 'Error fetching savings');
  }
};

export const deleteSaving = async (savingId, id) => {
  try {
    const response = await api.delete(`/savings/${savingId}/${id}`);
    return response.data;
  } catch (error) {
    handleError(error, 'Error deleting saving');
  }
};

export const addSaving = async (savingData) => {
  try {
    const response = await api.post('/addSavings', savingData);
    return response.data;
  } catch (error) {
    handleError(error, 'Error adding saving');
  }
};

// ==================== SOURCE/INCOME DELETE API CALL ====================

export const deleteSource = async (sourceId, userId) => {
  try {
    const response = await api.delete(`/deleteSource/${sourceId}/${userId}`);
    return response.data;
  } catch (error) {
    handleError(error, 'Error deleting source');
  }
};

// ==================== PRODUCT DELETE API CALL ====================

export const deleteProduct = async (productId, userId) => {
  try {
    const response = await api.delete(`/deleteProducts/${productId}/${userId}`);
    return response.data;
  } catch (error) {
    handleError(error, 'Error deleting product');
  }
};

// ==================== CATEGORY DELETE API CALL ====================

export const deleteCategory = async (categoryId, userId) => {
  try {
    const response = await api.delete(`/deleteCategories/${categoryId}/${userId}`);
    return response.data;
  } catch (error) {
    handleError(error, 'Error deleting category');
  }
};

// ==================== EXPENSE DELETE API CALL ====================

export const deleteExpense = async (expenseId, userId) => {
  try {
    const response = await api.delete(`/deleteExpence/${expenseId}/${userId}`);
    return response.data;
  } catch (error) {
    handleError(error, 'Error deleting expense');
  }
};

// ==================== CATEGORIES AND PRODUCTS COMBINED API CALL ====================
export const getProducts = async (userId, categoryName) => {
  try {
    const response = await api.get(`/products?category=${categoryName}&user_id=${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};


export const getAllCategoriesAndProducts = async (userId) => {
  try {
    const response = await api.get(`/getCategoriesAndProducts/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching categories and products:', error);
    throw error;
  }
};

// Export a default object with all API functions
export default {
  // Expense related
  getExpenseCosts,
  getFilteredExpenses,
  addExpense,

  // Category related
  getCategories,
  addCategory,
  getCategoryReport,

  // Product related
  getProducts,
  addProduct,

  // Categories and Products combined
  getAllCategoriesAndProducts,

  // Source/Income related
  getIncomeSources,
  getAllSourceData,
  getDefaultSources,
  addSource,
  addDefaultSource,
  deleteSource,

  // User related
  registerUser,
  loginUser,

  //Savings related
  getSavingsData,
  getSavingsDataByMonthYear,
  deleteSaving,
  addSaving,

  // Delete related
  deleteExpense,
  deleteProduct,
  deleteCategory,
};
