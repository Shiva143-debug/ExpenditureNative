import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const DefaultLockInfo = ({ palette, message }) => {
  const [show, setShow] = useState(false);
  const iconColor = palette?.textSecondary || '#94a3b8';

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => setShow((v) => !v)}
        style={styles.iconWrap}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Icon name="info-outline" size={20} color={iconColor} />
      </TouchableOpacity>
      {show && (
        <View style={[styles.tooltip, { backgroundColor: palette?.tooltipBg || '#0f172a' }]}>
          <Text style={styles.tooltipText}>{message}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  iconWrap: {
    padding: 6,
  },
  tooltip: {
    position: 'absolute',
    top: 38,
    right: 0,
    width: 180,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    zIndex: 100,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  tooltipText: {
    color: '#ffffff',
    fontSize: 12,
    lineHeight: 16,
  },
});

export default DefaultLockInfo;
