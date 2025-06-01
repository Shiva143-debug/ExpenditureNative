# API Service Documentation

This document explains how to use the centralized API service for the Expenditure Native application.

## Overview

The `apiService.js` file provides a centralized location for all API calls in the application. It uses Axios for HTTP requests and provides consistent error handling.

## How to Use

### Import the API Service

```javascript
// Import specific functions
import { getFilteredExpenses, addExpense } from './services/apiService';

// Or import the entire API service
import apiService from './services/apiService';
```

### Available API Functions

#### Expense Related

- `getExpenseCosts(userId)` - Get all expense costs for a user
- `getFilteredExpenses(userId, month, year)` - Get expenses filtered by month and year
- `addExpense(expenseData)` - Add a new expense

#### Category Related

- `getCategories(userId)` - Get all categories for a user
- `addCategory(userId, category)` - Add a new category
- `getCategoryReport(userId)` - Get category report data

#### Product Related

- `getProducts(userId, category)` - Get products for a specific category and user
- `addProduct(userId, category, product)` - Add a new product

#### Source/Income Related

- `getIncomeSources(userId, month, year)` - Get income sources for a specific month and year
- `getAllSourceData(userId)` - Get all source data for a user
- `getDefaultSources(userId)` - Get default sources for a user
- `addSource(userId, source, amount, date)` - Add a new income source
- `addDefaultSource(userId, sourceName)` - Add a new default source

#### User Related

- `registerUser(userData)` - Register a new user
- `loginUser(loginEmail, password)` - Login a user

## Example Usage

### Fetching Data

```javascript
import React, { useEffect, useState } from 'react';
import { getFilteredExpenses } from './services/apiService';

const MyComponent = ({ userId }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getFilteredExpenses(userId, 5, 2023); // May 2023
        setExpenses(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [userId]);
  
  // Rest of component...
};
```

### Adding Data

```javascript
import { addExpense } from './services/apiService';
import Toast from 'react-native-toast-message';

const handleSubmit = async () => {
  try {
    const expenseData = {
      id: userId,
      category: selectedCategory,
      product: selectedProduct,
      cost: amount,
      description: description,
      p_date: date
    };
    
    await addExpense(expenseData);
    Toast.show({ 
      type: "success", 
      text1: "Success", 
      text2: "Expense added successfully" 
    });
    
    // Reset form or navigate away
  } catch (error) {
    Toast.show({ 
      type: "error", 
      text1: "Error", 
      text2: "Failed to add expense" 
    });
  }
};
```

## Error Handling

All API functions include error handling. If an API call fails, the error will be logged to the console and thrown, allowing you to catch it in your component.

```javascript
try {
  const data = await getFilteredExpenses(userId, month, year);
  // Process data
} catch (error) {
  // Handle error
  Alert.alert('Error', 'Failed to load expense data');
}
```