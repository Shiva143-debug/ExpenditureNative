import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL for all API calls
// https://backend-exp-1.onrender.com
// https://exciting-spice-armadillo.glitch.me
// const BASE_URL = 'https://backend-exp-1.onrender.com';
const BASE_URL = 'https://backend-exp.onrender.com';
// const BASE_URL = "http://192.168.1.84:4000"


// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach the auth token to every request
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error attaching auth token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Standard response helpers
// Every API response is normalized to { status, message, data } so callers
// only ever check `response.status`.
// `ok` guarantees the wrapper shape: `status` is derived from the backend's
// own `status` (or `success`) flag, `message` is taken from the backend, and
// `data` holds the raw backend body. `fail` handles thrown/network errors.
const ok = (response) => {
  const body = response.data ?? {};
  const success =
    typeof body?.status === 'boolean'
      ? body.status
      : typeof body?.success === 'boolean'
      ? body.success
      : true;
  // Unwrap one level: if the backend already wraps the payload in `data`,
  // expose that as `data`; otherwise use the body itself (e.g. a raw array).
  const payload = body?.data !== undefined ? body.data : body;
  return {
    status: success,
    message: body?.message ?? '',
    data: payload,
  };
};

const fail = (error, fallbackMessage = 'Something went wrong') => {
  const payload = error?.response?.data;
  const message = payload?.message || error?.message || fallbackMessage;
  return { status: false, message, data: null };
};


// ==================== USER RELATED API CALLS ====================


export const registerUser = async (userData) => {
  try {
    const response = await api.post('/register', userData);
    return ok(response);
  } catch (error) {
    return fail(error, 'Error registering user');
  }
};


export const loginUser = async (loginData) => {
  try {
    const response = await api.post('/login', loginData);
    return ok(response);
  } catch (error) {
    return fail(error, 'Error logging in');
  }
};


// ==================== STATS RELATED API CALLS ====================

// Aggregated income / expense / savings / tax totals for a single month+year.
// Values come back as strings (Postgres numeric), so parse them before use.
export const getStats = async (month, year) => {
  try {
    const response = await api.get(`/get-stats/${month}/${year}`);
    return ok(response);
  } catch (error) {
    return fail(error, 'Error fetching stats');
  }
};

// ==================== EXPENSE RELATED API CALLS ====================

//instead of getting all expenses get only needed
export const getExpenseCosts = async () => {
  try {
    const response = await api.get('/get-all-expenses');
    return ok(response);
  } catch (error) {
    return fail(error, 'Error fetching expense costs');
  }
};

//have to write filter expenses in backend
export const getFilteredExpenses = async (month, year) => {
  try {
    const result = await getExpenseCosts();
    const allExpenses = result?.status ? result.data : [];

    if (Array.isArray(allExpenses)) {
      // Filter by selected month and year
      const filteredByDate = allExpenses.filter(item => {
        const date = new Date(item.pDate);
        return (
          date.getMonth() + 1 === month && // getMonth() is 0-based
          date.getFullYear() === year
        );
      });

      // Sort filtered data by date (descending)
      return filteredByDate.sort(
        (a, b) => new Date(b.pDate) - new Date(a.pDate)
      );
    }

    return [];
  } catch (error) {
    return fail(error, 'Error filtering expenses').data ?? [];
  }
};

export const addExpense = async (expenseData) => {
  try {
    const response = await api.post('/add-expense', expenseData);
    return ok(response);
  } catch (error) {
    return fail(error, 'Error adding expense');
  }
};

export const updateExpense = async (expenseId, payload) => {
  try {
    const res = await api.put(`/update-expense/${expenseId}`, payload);
    return ok(res);
  }
  catch (error) {
    return fail(error, 'Error updating expense');
  }
};

export const deleteExpense = async (expenseId) => {
  try {
    const response = await api.delete(`/delete-expence/${expenseId}`);
    return ok(response);
  } catch (error) {
    return fail(error, 'Error deleting expense');
  }
};


// ==================== CATEGORY RELATED API CALLS ====================

export const getCategories = async () => {
  try {
    const response = await api.get('/categories');
    return ok(response);
  } catch (error) {
    return fail(error, 'Error fetching categories');
  }
};

export const addCategory = async (category) => {
  try {
    const response = await api.post('/add-category', { category });
    return ok(response);
  } catch (error) {
    return fail(error, 'Error adding category');
  }
};

export const updateCategory = async (categoryId, oldCategory, newCategory) => {
  try {
    const res = await api.put(`/update-category/${categoryId}`, {
      oldCategory,
      newCategory
    });
    return ok(res);
  } catch (error) {
    return fail(error, 'Error updating category');
  }
};

export const deleteCategory = async (categoryId) => {
  try {
    const response = await api.delete(`/delete-category/${categoryId}`);
    return ok(response);
  } catch (error) {
    return fail(error, 'Error deleting category');
  }
};



// ==================== SAVINGS RELATED API CALLS ====================

export const getSavingsData = async () => {
  try {
    const response = await api.get('/get-savings');
    return ok(response);
  } catch (error) {
    return fail(error, 'Error fetching savings');
  }
};

export const addSaving = async (savingData) => {
  try {
    const response = await api.post('/add-savings', savingData);
    return ok(response);
  } catch (error) {
    return fail(error, 'Error adding saving');
  }
};

export const updateSavings = async (savingId, payload) => {
  try {
    const res = await api.put(`/update-savings/${savingId}`, payload);
    return ok(res);
  } catch (error) {
    return fail(error, 'Error updating savings');
  }
};

export const deleteSaving = async (savingId) => {
  try {
    const response = await api.delete(`/delete-saving/${savingId}`);
    return ok(response);
  } catch (error) {
    return fail(error, 'Error deleting saving');
  }
};

// ==================== EXPENSE_ITEM RELATED API CALLS ====================

export const getExpenseItems = async () => {
  try {
    const response = await api.get('/get-expense-items');
    return ok(response);
  } catch (error) {
    return fail(error, 'Error fetching expense items');
  }
};

export const getExpenseItemsByCategory = async (categoryId) => {
  try {
    const response = await api.get(`/get-expense-items-by-category?categoryId=${categoryId}`);
    return ok(response);
  } catch (error) {
    return fail(error, 'Error fetching expense items by category');
  }
};

export const addExpenseItem = async (categoryId, expenseName) => {
  try {
    const response = await api.post('/add-expense-item', { categoryId, expenseName });
    return ok(response);
  } catch (error) {
    return fail(error, 'Error adding expense item');
  }
};

export const updateExpenseItem = async (expenseItemId, newexpenseItem) => {
  try {
    const res = await api.put(`/update-expense-item/${expenseItemId}`, { newexpenseItem });
    return ok(res);
  } catch (error) {
    return fail(error, 'Error updating expense item');
  }
};

export const deleteExpenseItem = async (expenseItemId) => {
  try {
    const response = await api.delete(`/delete-expense-item/${expenseItemId}`);
    return ok(response);
  } catch (error) {
    return fail(error, 'Error deleting Expense Item');
  }
};

// ==================== INCOME_SOURCE RELATED API CALLS ====================

export const getIncomeSources = async () => {
  try {
    const response = await api.get('/get-income-sources');
    return ok(response);
  } catch (error) {
    return fail(error, 'Error fetching default sources');
  }
};

export const addIncomeSource = async (sourceData) => {
  try {
    const response = await api.post('/add-income-source', sourceData);
    return ok(response);
  } catch (error) {
    return fail(error, 'Error adding default source');
  }
};

export const updateIncomeSource = async (sourceId, updatedSource) => {
  try {
    const response = await api.put(`/update-income-source/${sourceId}`, updatedSource);
    return ok(response);
  } catch (error) {
    return fail(error, 'Error updating source of income');
  }
};

export const deleteIncomeSource = async (sourceId) => {
  try {
    const response = await api.delete(`/delete-income-source/${sourceId}`);
    return ok(response);
  } catch (error) {
    return fail(error, 'Error deleting source');
  }
};

// ==================== INCOME RELATED API CALLS ====================


export const getIncomeByMonthYear = async (month, year) => {
  try {
    const response = await api.get(`/get-income-by-month-year/${month}/${year}`);
    return ok(response);
  } catch (error) {
    return fail(error, 'Error fetching income sources');
  }
};

export const getTotalIncomeData = async () => {
  try {
    const response = await api.get('/get-total-income');
    return ok(response);
  } catch (error) {
    return fail(error, 'Error fetching source data');
  }
};

export const addIncome = async (sourceData) => {
  try {
    const response = await api.post('/add-income', sourceData);
    return ok(response);
  } catch (error) {
    return fail(error, 'Error adding source');
  }
};

export const updateIncome = async (id, payload) => {
  try {
    const res = await api.put(`/update-income/${id}`, payload);
    return ok(res);
  } catch (error) {
    return fail(error, 'Error updating source');
  }
};

export const deleteIncome = async (sourceId) => {
  try {
    const response = await api.delete(`/delete-income/${sourceId}`);
    return ok(response);
  } catch (error) {
    return fail(error, 'Error deleting source');
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
  addIncome,
  updateIncome,
  addIncomeSource,
  updateIncomeSource,
  deleteIncome,
  deleteIncomeSource,
  registerUser,
  loginUser,
  getSavingsData,
  deleteSaving,
  addSaving,
  updateSavings,
  deleteExpense,
  deleteExpenseItem,
  deleteCategory,
  getIncomeByMonthYear,
  getStats,
};
