import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { IconButton, Menu, Divider, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from './AuthContext';

const Header = ({ navigation }) => {
     const { logout } = useAuth();
  const [visible, setVisible] = useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const onLogout=()=> logout()

  return (
    <View style={styles.headerContainer}>
      <Icon name="menu" size={30} onPress={openMenu} style={styles.menuIcon}/>
      <Menu visible={visible} onDismiss={closeMenu}
       anchor={<Text onPress={openMenu}>.</Text>}>
        <Menu.Item onPress={() => console.log("profile component")} title="Profile" />
        <Divider />
        <Menu.Item onPress={onLogout} title="Logout" />
      </Menu>
      <Text style={styles.headerTitle}>My App</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#fff',
    elevation: 3, // Shadow effect on Android
  },
  menuIcon: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default Header;
