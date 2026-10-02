import {StyleSheet} from 'react-native';

// Form controls. `inputStyles` is the compact set used by the dedicated form
// screens (Expense / Source / Saving); `dialogInputStyles` is the roomier
// variant used inside the list screens' edit dialogs.

export const inputStyles = StyleSheet.create({
  fieldGroup: {marginBottom: 20},
  row: {flexDirection: 'row', gap: 12, marginBottom: 20},
  flexItem: {flex: 1},
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {fontSize: 15, fontWeight: '600', marginBottom: 8},

  input: {
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 0,
    marginVertical: 0,
  },
  textArea: {
    minHeight: 100,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginVertical: 0,
  },

  picker: {borderWidth: 1, borderRadius: 10, height: 46},
  dropdownList: {borderWidth: 1, borderRadius: 10, maxHeight: 240},
  dropdownText: {fontSize: 15},

  dateButton: {paddingVertical: 13, paddingHorizontal: 16, borderWidth: 1, borderRadius: 10},
  dateButtonText: {fontSize: 15, fontWeight: '500', textAlign: 'center'},

  buttonGradient: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
});

export const dialogInputStyles = StyleSheet.create({
  label: {fontSize: 15, fontWeight: '600', marginBottom: 6, marginTop: 12},
  input: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 6,
  },
  picker: {borderWidth: 1, borderRadius: 12, height: 48, marginBottom: 15},
  dropdownList: {borderWidth: 1, borderRadius: 12, maxHeight: 600},
  dropdownText: {fontSize: 15},
  dateButton: {padding: 15, borderRadius: 12, borderWidth: 1, marginBottom: 10},
  dateButtonText: {fontSize: 16, textAlign: 'center'},
});
