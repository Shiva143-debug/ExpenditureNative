import {StyleSheet} from 'react-native';

import {ON_GRADIENT, OVERLAY} from '../theme/colors';

// Styles specific to the "manage a named list" screens (Categories, Income
// Sources). These differ from the list/report header styles: the title is 26
// rather than 28, there is a subtitle, and the cards have no elevation.

export const manageStyles = StyleSheet.create({
  // -- gradient header ---------------------------------------------------
  gradientCard: {
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textWrap: {flex: 1, marginRight: 12},
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: ON_GRADIENT.primary,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 13.5,
    color: ON_GRADIENT.muted,
    fontWeight: '500',
  },
  addButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // -- list row ----------------------------------------------------------
  card: {
    borderRadius: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: OVERLAY.hairline,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  leftSection: {flex: 1, flexDirection: 'row', alignItems: 'center'},
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  labelWrap: {flex: 1},
  // Income Sources had a bottom margin here; Categories did not and passes an
  // override that removes it.
  label: {fontSize: 17, fontWeight: '600', marginBottom: 6},
  defaultChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  defaultText: {fontSize: 12.5, fontWeight: '600'},

  rightSection: {flexDirection: 'row', alignItems: 'center', gap: 4},
  actionButton: {padding: 8, borderRadius: 20},

  // -- add / edit dialog -------------------------------------------------
  dialogInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 22,
  },

  // -- ProductsScreen extras ---------------------------------------------
  // The filter dropdown and the dialog's category dropdown each sat in a
  // wrapper with its own zIndex so the list could overlay its siblings.
  filterSection: {paddingHorizontal: 16, paddingBottom: 10, zIndex: 1000},
  dropdownContainer: {marginBottom: 20, zIndex: 2000},
  // The wrapper above supplies the spacing, so the shared picker's own bottom
  // margin has to be cleared to avoid doubling it.
  pickerFlush: {marginBottom: 0},

  // -- empty state -------------------------------------------------------
  // Deliberately not `commonStyles.emptyContainer`: these screens never gave
  // the empty state `flex: 1`, and stretching it changes the layout.
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 70,
  },
  emptyText: {fontSize: 16, marginTop: 12},
});
