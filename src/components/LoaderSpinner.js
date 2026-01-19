import React from 'react';
import { Modal, View, Text, ActivityIndicator, StyleSheet } from 'react-native';

const LoaderSpinner = ({ shouldLoad }) => {
  return (
    <Modal
      visible={shouldLoad}
      transparent
      animationType="fade"
    >
      <View style={styles.modalBackground}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
});

export default LoaderSpinner;
