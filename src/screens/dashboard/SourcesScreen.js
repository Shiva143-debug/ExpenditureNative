import React, {useCallback} from 'react';
import {Alert} from 'react-native';

import ManageListScreen from '../../components/ManageListScreen';
import {getIncomeSourceIcon} from '../../theme/entityIcons';
import {
  getIncomeSources,
  addIncomeSource,
  deleteIncomeSource,
  updateIncomeSource,
} from '../../services/apiService';

const SourcesScreen = () => {
  // The original screen had no navigation — selecting a source just alerted.
  const handleSelect = useCallback(
    source => Alert.alert('Source Selected', `Selected: ${source.sourceName}`),
    [],
  );

  const handleUpdate = useCallback(
    (source, newName) => updateIncomeSource(source.id, {sourceName: newName}),
    [],
  );

  const handleRemove = useCallback(source => deleteIncomeSource(source.id), []);

  return (
    <ManageListScreen
      accentKey="sources"
      headerGradient={['#34d399', '#059669']}
      title="Income Sources"
      subtitle="Manage your income sources"
      searchPlaceholder="Search sources..."
      emptyIcon="account-balance"
      emptyLabel="No sources found"
      addTitle="Add Source"
      editTitle="Edit Source"
      confirmAddLabel="Save"
      lockedMessage="This is a default income source. You cannot edit or delete it."
      deleteTitle="Delete Source"
      deleteMessage={label => `Are you sure you want to delete "${label}"?`}
      getLabel={item => item.sourceName}
      getIcon={item => getIncomeSourceIcon(item)}
      iconSize={28}
      showDefaultChip
      cancelTextFromPalette
      titleFromPalette
      inputBackgroundFromPalette
      inputPlaceholder="Enter source name"
      fetchItems={getIncomeSources}
      createPayload={name => addIncomeSource({sourceName: name})}
      onUpdate={handleUpdate}
      onRemove={handleRemove}
      onSelect={handleSelect}
    />
  );
};

export default SourcesScreen;
