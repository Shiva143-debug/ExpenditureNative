import React from 'react';
import {View, TouchableOpacity, ActivityIndicator, StyleSheet} from 'react-native';

import ThemedText from './ThemedText';
import {OVERLAY} from '../theme/colors';

/**
 * Dialog rendered *inside* the screen tree as an absolutely positioned overlay.
 *
 * This is deliberately not a RN <Modal>: the category / product / source
 * screens render their dialog inside the screen's own view hierarchy, and
 * switching to <Modal> would change how the Android back button and the iOS
 * modal presentation behave.
 */
const InTreeDialog = ({
  visible = true,
  overlayColor = OVERLAY.backdrop,
  containerColor,
  borderColor = OVERLAY.hairline,
  width = '82%',
  children,
}) => {
  if (!visible) {
    return null;
  }

  return (
    <View style={[styles.overlay, {backgroundColor: overlayColor}]}>
      <View
        style={[
          styles.dialog,
          {width},
          containerColor ? {backgroundColor: containerColor} : null,
          {borderColor},
        ]}>
        {children}
      </View>
    </View>
  );
};

/** Centred title used by the manage-screen dialogs. */
export const DialogTitle = ({children, color}) => (
  <ThemedText style={[styles.title, color ? {color} : null]}>{children}</ThemedText>
);

/** Cancel / save row for the manage-screen dialogs. */
export const DialogFooter = ({
  onCancel,
  onConfirm,
  cancelLabel = 'Cancel',
  confirmLabel = 'Save',
  cancelBackground = OVERLAY.cancel,
  cancelColor,
  confirmColor,
  confirmDisabled = false,
}) => (
  <View style={styles.buttons}>
    <TouchableOpacity
      style={[styles.action, styles.cancel, {backgroundColor: cancelBackground}]}
      onPress={onCancel}
      disabled={confirmDisabled}>
      <ThemedText style={[styles.actionText, cancelColor ? {color: cancelColor} : null]}>
        {cancelLabel}
      </ThemedText>
    </TouchableOpacity>

    <TouchableOpacity
      style={[styles.action, styles.save, {backgroundColor: confirmColor}]}
      onPress={onConfirm}
      disabled={confirmDisabled}>
      <ThemedText style={styles.saveText}>{confirmLabel}</ThemedText>
    </TouchableOpacity>
  </View>
);

/** Spinner overlay shown inside the dialog while a request is in flight. */
export const DialogBusy = ({color}) => (
  <View style={styles.busy} pointerEvents="auto">
    <ActivityIndicator size="large" color={color} />
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  dialog: {
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.12,
    shadowRadius: 30,
  },
  title: {fontSize: 20, fontWeight: '700', marginBottom: 18, textAlign: 'center'},
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 22,
  },
  buttons: {flexDirection: 'row', justifyContent: 'space-between'},
  action: {flex: 1, padding: 13, borderRadius: 12, alignItems: 'center'},
  cancel: {marginRight: 10},
  save: {marginLeft: 10},
  actionText: {fontSize: 16, fontWeight: '600'},
  saveText: {fontSize: 16, color: '#fff', fontWeight: '700'},
  busy: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: OVERLAY.dialogBusy,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
});

export default InTreeDialog;
