# API Migration Guide

This guide explains how to migrate your components from using direct fetch/axios calls to using the centralized API service.

## Why Use a Centralized API Service?

1. **Consistency**: All API calls follow the same pattern
2. **Maintainability**: If the API endpoints change, you only need to update one file
3. **Error Handling**: Consistent error handling across all API calls
4. **Code Reuse**: Avoid duplicating API call logic in multiple components
5. **Testability**: Easier to mock API calls for testing

## Migration Steps

### Step 1: Import the API Service

Replace direct fetch/axios imports with imports from the API service:

```javascript
// Before
import axios from 'axios';

// After
import { functionName } from './services/apiService';
```

### Step 2: Replace Direct API Calls

Replace direct fetch/axios calls with calls to the API service functions:

#### Example: GET Requests

```javascript
// Before
useEffect(() => {
  setLoading(true);
  fetch(`https://exciting-spice-armadillo.glitch.me/getExpenseCost/${id}`)
    .then(res => res.json())
    .then(data => setExpenceData(data))
    .catch(err => console.log(err))
    .finally(() => {
      setLoading(false);
    });
}, [id]);

// After
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getExpenseCosts(id);
      setExpenceData(data);
    } catch (error) {
      console.error('Error fetching expense data:', error);
      Alert.alert('Error', 'Failed to load expense data');
    } finally {
      setLoading(false);
    }
  };
  
  if (id) {
    fetchData();
  }
}, [id]);
```

#### Example: POST Requests

```javascript
// Before
const handleSubmit = () => {
  const values = { id, source: sourceValue, amount, date };
  axios
    .post("https://exciting-spice-armadillo.glitch.me/addSource", values)
    .then((res) => {
      console.log(res);
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Source added successfully",
        position: "top",
      });
    })
    .catch((err) => {
      console.log(err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to add source",
        position: "top",
      });
    });
};

// After
const handleSubmit = async () => {
  try {
    await addSource(id, sourceValue, amount, date);
    Toast.show({
      type: "success",
      text1: "Success",
      text2: "Source added successfully",
      position: "top",
    });
  } catch (error) {
    console.error('Error adding source:', error);
    Toast.show({
      type: "error",
      text1: "Error",
      text2: "Failed to add source",
      position: "top",
    });
  }
};
```

### Step 3: Update Error Handling

Make sure to add proper error handling for all API calls:

```javascript
try {
  const data = await apiFunction(params);
  // Process successful response
} catch (error) {
  console.error('Error:', error);
  // Show error message to user
  Alert.alert('Error', 'Something went wrong');
}
```

## Components to Update

Here's a list of components that need to be updated to use the API service:

1. ✅ TransactionReports.js
2. ✅ CategoryReport.js
3. ✅ ExpenceReport.js
4. Dashboard.js
5. BalanceList.js
6. Source.js
7. Expence.js
8. Login.js
9. Register.js
10. Product.js
11. IncomeList.js
12. ExpenseByCategoryList.js

## API Functions Available

See the [API Service Documentation](./services/README.md) for a complete list of available API functions.

## Testing

After migrating a component, make sure to test it thoroughly to ensure it works as expected. Check that:

1. Data is loaded correctly
2. Error handling works properly
3. Loading states are managed correctly
4. User feedback is provided when appropriate

## Benefits of This Approach

- **Centralized Error Handling**: All API errors are handled consistently
- **Simplified Component Code**: Components focus on UI logic, not API calls
- **Easier Maintenance**: API changes only need to be updated in one place
- **Better Type Safety**: API functions have clear parameter and return types
- **Improved Readability**: Component code is cleaner and more focused