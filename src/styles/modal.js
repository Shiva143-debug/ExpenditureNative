import {StyleSheet} from 'react-native';

import {OVERLAY} from '../theme/colors';

// Centered dialog used for add/edit flows across the list screens.

export const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: OVERLAY.backdrop,
    padding: 20,
  },
  container: {
    width: '100%',
    borderRadius: 20,
    padding: 22,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {fontSize: 20, fontWeight: 'bold'},

  buttons: {flexDirection: 'row', justifyContent: 'space-between', marginTop: 20},
  button: {padding: 13, borderRadius: 12, flex: 1},
  cancel: {marginRight: 10, alignItems: 'center'},
  confirm: {marginLeft: 10, alignItems: 'center'},
  buttonText: {fontSize: 16, fontWeight: '600'},
  confirmText: {fontSize: 16, color: '#fff', fontWeight: '700'},

  closeButton: {padding: 4},
  bordered: {borderWidth: 1},

  // Shown over a dialog while a request is in flight.
  busy: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: OVERLAY.dialogBusy,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
