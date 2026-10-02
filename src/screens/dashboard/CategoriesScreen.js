import React, {useCallback} from 'react';
import {useNavigation} from '@react-navigation/native';

import ManageListScreen from '../../components/ManageListScreen';
import {getCategoryIcon} from '../../theme/entityIcons';
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from '../../services/apiService';

// Categories' original `emptyText` was a hard-coded slate rather than the
// palette colour, and its row label had no bottom margin. Both are preserved.
const NO_LABEL_MARGIN = {marginBottom: 0};
const EMPTY_TEXT_COLOR = '#64748b';

const CategoriesScreen = () => {
  const navigation = useNavigation();

  const handleSelect = useCallback(
    category => navigation.navigate('ProductsScreen', {categoryId: category.id}),
    [navigation],
  );

  const handleUpdate = useCallback(
    (category, newName) =>
      updateCategory(category.id, category.category, newName),
    [],
  );

  const handleRemove = useCallback(category => deleteCategory(category.id), []);

  return (
    <ManageListScreen
      accentKey="categories"
      headerGradient={['#fb923c', '#ea580c']}
      title="Categories"
      subtitle="Manage your expense categories"
      searchPlaceholder="Search categories..."
      emptyIcon="category"
      emptyLabel="No categories found"
      addTitle="Add Category"
      editTitle="Update Category"
      confirmAddLabel="Add"
      lockedMessage="This is a default category. You cannot edit or delete it."
      deleteTitle="Delete Category"
      deleteMessage={label => `Are you sure you want to delete "${label}"?`}
      getLabel={item => item.categoryName || item.category}
      getIcon={item => getCategoryIcon(item.categoryName || item.category)}
      iconSize={32}
      labelStyle={NO_LABEL_MARGIN}
      emptyTextColor={EMPTY_TEXT_COLOR}
      inputPlaceholder="Enter category name"
      fetchItems={getCategories}
      createPayload={name => addCategory(name)}
      onUpdate={handleUpdate}
      onRemove={handleRemove}
      onSelect={handleSelect}
    />
  );
};

export default CategoriesScreen;
