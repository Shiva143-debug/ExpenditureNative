import {StyleSheet} from 'react-native';

// Layout primitives shared by every screen in the app. These were previously
// re-declared in each screen's own StyleSheet.

export const commonStyles = StyleSheet.create({
  container: {flex: 1},
  row: {flexDirection: 'row', alignItems: 'center'},
  flexOne: {flex: 1},

  // Screen scaffolding: gradient header, search bar, scrollable list.
  headerSection: {paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10},
  searchSection: {paddingHorizontal: 16, paddingBottom: 10},
  searchInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  listContainer: {paddingHorizontal: 16, paddingTop: 4, paddingBottom: 100},

  // Empty state.
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 70,
  },
  emptyText: {fontSize: 16, fontWeight: '500', marginTop: 12, textAlign: 'center'},

  // Search field with a leading icon.
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {marginRight: 8},
});
