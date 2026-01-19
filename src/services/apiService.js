import axios from 'axios';

// Base URL for all API calls
// https://backend-exp-1.onrender.com
// https://exciting-spice-armadillo.glitch.me
const BASE_URL = 'https://backend-exp-1.onrender.com';
// const BASE_URL = "http://192.168.1.62:5000"


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


// ==================== USER RELATED API CALLS ====================



export const registerUser = async (userData) => {
  try {
    const response = await api.post('/register', userData);
    return response.data;
  } catch (error) {
    // 🔥 rethrow backend error so screen can catch it
    throw error;
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

// ==================== EXPENSE RELATED API CALLS ====================

//instead of getting all expenses get only needed
export const getExpenseCosts = async (userId) => {
  try {
    const response = await api.get(`/get-all-expenses/${userId}`);
    return response.data;
  } catch (error) {
    handleError(error, 'Error fetching expense costs');
  }
};

//have to write filter expenses in backend
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
    const response = await api.post('/add-expense', expenseData);
    return response.data;
  } catch (error) {
    handleError(error, 'Error adding expense');
  }
};

export const updateExpense = async (expenseId, payload) => {
  try {
    const res = await api.put(`/update-expense/${expenseId}`, payload);
    return res.data;
  }
  catch (error) {
    handleError(error, 'Error updating expense');
  }
};

export const deleteExpense = async (expenseId, userId) => {
  try {
    const response = await api.delete(`/delete-expence/${expenseId}/${userId}`);
    return response.data;
  } catch (error) {
    handleError(error, 'Error deleting expense');
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
    const response = await api.post('/add-category', { userId, category });
    return response.data;
  } catch (error) {
    return response.data.message;
  }
};

export const updateCategory = async (categoryId, userId, oldCategory, newCategory) => {
  try {
    const res = await api.put(`/update-category/${categoryId}`, {
      oldCategory,
      newCategory,
      userId
    });
    return res.data;
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
};

export const deleteCategory = async (categoryId, userId) => {
  try {
    const response = await api.delete(`/delete-category/${categoryId}/${userId}`);
    return response.data;
  } catch (error) {
    handleError(error, 'Error deleting category');
  }
};



// ==================== SAVINGS RELATED API CALLS ====================

export const getSavingsData = async (userId) => {
  try {
    const response = await api.get(`/get-savings/${userId}`);
    return response.data;
  } catch (error) {
    handleError(error, 'Error fetching savings');
  }
};

export const getSavingsDataByMonthYear = async (userId, month, year) => {
  try {
    const response = await api.get(`/get-savings-by-month-year/${userId}/${month}/${year}`);
    return response.data;
  } catch (error) {
    handleError(error, 'Error fetching savings');
  }
};

export const addSaving = async (savingData) => {
  try {
    const response = await api.post('/add-savings', savingData);
    return response.data;
  } catch (error) {
    handleError(error, 'Error adding saving');
  }
};

export const updateSavings = async (savingId, payload) => {
  try {
    const res = await api.put(`/update-savings/${savingId}`, payload);
    return res.data;
  } catch (error) {
    console.error("Error updating savings:", error);
    throw error;
  }
};

export const deleteSaving = async (savingId, userId) => {
  try {
    const response = await api.delete(`/delete-saving/${savingId}/${userId}`);
    return response.data;
  } catch (error) {
    handleError(error, 'Error deleting saving');
  }
};

// ==================== EXPENSE_ITEM RELATED API CALLS ====================

export const getExpenseItems = async (userId) => {
  try {
    const response = await api.get(`/get-expense-items/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching expense items:', error);
    throw error;
  }
};

export const getExpenseItemsByCategory = async (userId, categoryName) => {
  try {
    const response = await api.get(`/get-expense-items-by-category?category=${categoryName}&userId=${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching expense items by category:', error);
    throw error;
  }
};

export const addExpenseItem = async (userId, category, expenseName) => {
  try {
    const response = await api.post('/add-expense-item', { id: userId, category, expenseName });
    return response.data;
  } catch (error) {
    handleError(error, 'Error adding expense item');
  }
};

export const updateExpenseItem = async (expenseItemId, userId, newexpenseItem) => {
  try {
    const res = await api.put(`/update-expense-item/${expenseItemId}/${userId}`, { newexpenseItem });
    return res.data;
  } catch (error) {
    console.error('Error updating expense item:', error);
    throw error;
  }
};

export const deleteExpenseItem = async (expenseItemId, userId) => {
  try {
    const response = await api.delete(`/delete-expense-item/${expenseItemId}/${userId}`);
    return response.data;
  } catch (error) {
    handleError(error, 'Error deleting Expense Item');
  }
};

// ==================== INCOME_SOURCE RELATED API CALLS ====================

export const getIncomeSources = async (userId) => {
  try {
    const response = await api.get(`/get-income-sources/${userId}`);
    return response.data;
  } catch (error) {
    handleError(error, 'Error fetching default sources');
  }
};

export const addIncomeSource = async (sourceData) => {
  try {
    const response = await api.post('/add-income-source', sourceData);
    return response.data;
  } catch (error) {
    handleError(error, 'Error adding default source');
  }
};

export const updateIncomeSource = async (sourceId, userId, updatedSource) => {
  try {
    const response = await api.put(`/update-income-source/${sourceId}/${userId}`, updatedSource);
    return response.data;
  } catch (error) {
    handleError(error, 'Error updating source of income');
    throw error;
  }
};

export const deleteIncomeSource = async (sourceId, userId) => {
  try {
    const response = await api.delete(`/delete-income-source/${sourceId}/${userId}`);
    return response.data;
  } catch (error) {
    handleError(error, 'Error deleting source');
  }
};

// ==================== INCOME RELATED API CALLS ====================


export const getIncomeByMonthYear = async (userId, month, year) => {
  try {
    const response = await api.get(`/get-income-by-month-year/${userId}/${month}/${year}`);
    return response.data;
  } catch (error) {
    handleError(error, 'Error fetching income sources');
  }
};

export const getTotalIncomeData = async (userId) => {
  try {
    const response = await api.get(`/get-total-income/${userId}`);
    return response.data;
  } catch (error) {
    handleError(error, 'Error fetching source data');
  }
};

export const addIncome = async (sourceData) => {
  try {
    const response = await api.post('/add-income', sourceData);
    return response.data;
  } catch (error) {
    handleError(error, 'Error adding source');
  }
};

export const updateIncome = async (sourceId, userId, payload) => {
  try {
    const res = await api.put(`/update-income/${sourceId}/${userId}`, payload);
    return res.data;
  }
  catch (error) {
    handleError("Error updating source", error);
  }

  return res.data;
};

export const deleteIncome = async (sourceId, userId) => {
  try {
    const response = await api.delete(`/delete-income/${sourceId}/${userId}`);
    return response.data;
  } catch (error) {
    handleError(error, 'Error deleting source');
  }
};

// Export a default object with all API functions
export default {
  getExpenseCosts,
  getFilteredExpenses,
  addExpense,
  getExpenseItemsByCategory,
  getCategories,
  addCategory,
  updateCategory,
  addExpenseItem,
  updateExpenseItem,
  getExpenseItems,
  getIncomeSources,
  getTotalIncomeData,
  getIncomeSources,
  addIncome,
  updateIncome,
  addIncomeSource,
  updateIncomeSource,
  deleteIncome,
  deleteIncomeSource,
  registerUser,
  loginUser,
  getSavingsData,
  getSavingsDataByMonthYear,
  deleteSaving,
  addSaving,
  updateSavings,
  deleteExpense,
  deleteExpenseItem,
  deleteCategory,
  getIncomeByMonthYear
};

