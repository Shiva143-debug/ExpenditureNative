import React, { useRef, useEffect } from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import { Canvas } from 'react-native-canvas';

const ImageWithBlueLeft = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const drawImage = async (canvas) => {
      const ctx = canvas.getContext('2d');
      const { width, height } = canvas;

      // Draw blue section on the left
      ctx.fillStyle = 'blue';
      ctx.fillRect(0, 0, width / 2, height);

      // Draw image on the right side
      const img = new Image();
      img.src = 'https://res.cloudinary.com/dxgbxchqm/image/upload/v1735804863/available_cterqk.webp';
      img.onload = () => {
        ctx.drawImage(img, width / 2, 0, width / 2, height);
      };
    };

    if (canvasRef.current) {
      drawImage(canvasRef.current);
    }
  }, ['https://res.cloudinary.com/dxgbxchqm/image/upload/v1735804863/available_cterqk.webp']);

  return (
    <View style={styles.container}>
      <Canvas ref={canvasRef} style={styles.canvas} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 300, // Set the desired height
    width: '100%',
  },
  canvas: {
    width: '100%',
    height: '100%',
  },
});

export default ImageWithBlueLeft;
