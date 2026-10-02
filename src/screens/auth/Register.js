
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { ActivityIndicator, TextInput } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import ThemedText from '../../components/ThemedText';
import ThemedView from '../../components/ThemedView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../theme/useTheme';
import { registerUser } from '../../services/apiService';


const Register = ({ navigation }) => {
  const { colors, isDark, toggleTheme } = useTheme();

  const inputTheme = isDark
    ? {
        colors: {
          primary: '#38bdf8',
          text: '#ffffff',
          placeholder: '#9ca3af',
          surface: 'transparent',
          background: 'transparent',
          onSurface: '#ffffff',
          onSurfaceVariant: '#9ca3af',
          outline: '#555555',
          disabled: '#555555',
        },
      }
    : undefined;

  const [formData, setFormData] = useState({ fullName: '', email: '', mobileNo: '', address: '' });
  const [formErrors, setFormErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [loading, setLoading] = useState(false);

  const handleBlur = (field) => {
    setTouchedFields({ ...touchedFields, [field]: true });
    validateForm();
  };

  const validateForm = useCallback(() => {
    const errors = {};
    if (!formData.fullName) errors.fullName = 'Full name is required';
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    if (!formData.mobileNo) {
      errors.mobileNo = 'Mobile number is required';
    } else if (formData.mobileNo.length !== 10) {
      errors.mobileNo = 'Mobile number must be 10 digits';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);
  const handleFormSubmit = async () => {
    const isValid = validateForm();
    setTouchedFields({fullName: true, email: true, mobileNo: true, address: true});
    if (!isValid) return;

    const values = {
      fullName: formData.fullName,
      email: formData.email,
      mobileNo: formData.mobileNo,
      address: formData.address,
    };

    try {
      setLoading(true);

      const response = await registerUser(values);

      if (!response.status) {
        Toast.show({
          type: 'error',
          position: 'top',
          text1: 'Error',
          text2: response.message || 'Something went wrong',
        });
        return;
      }

      Toast.show({
        type: 'success',
        position: 'top',
        text1: 'Success',
        text2: response.message || 'Registration successful',
      });

      setFormData({ fullName: '', email: '', mobileNo: '', address: '' });
      setTouchedFields({});

      navigation.navigate('Login');

    } catch (error) {
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Error',
        text2: error?.message || 'Something went wrong',
      });
    } finally {
      setLoading(false);
    }
  };


  const signInClick = () => {
    navigation.navigate('Login');
  };

  useEffect(() => {
    validateForm();
  }, [validateForm]);

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
        <Icon name={isDark ? 'light-mode' : 'dark-mode'} size={26} color={colors.textPrimary} />
      </TouchableOpacity>
      <Image source={{ uri: 'https://res.cloudinary.com/dxgbxchqm/image/upload/v1735649616/register_qziayq.jpg' }} style={styles.logo} />
      <Text style={[styles.heading, { color: colors.textPrimary }]}>Register!!</Text>
      <View style={styles.formSection}>
        <View style={styles.inputContainer}>
          <TextInput mode="outlined" label="Full Name" style={styles.input} theme={inputTheme} editable={!loading} value={formData.fullName} placeholder="Enter Full Name" onChangeText={(text) => setFormData({ ...formData, fullName: text })} onBlur={() => handleBlur('fullName')} />
          {touchedFields.fullName && formErrors.fullName && (<Text style={styles.errorText}>{formErrors.fullName}</Text>)}

          <TextInput mode="outlined" label="Email" style={styles.input} theme={inputTheme} editable={!loading} value={formData.email} onChangeText={(text) => setFormData({ ...formData, email: text })} onBlur={() => handleBlur('email')} placeholder="Enter your email" keyboardType="email-address" />
          {touchedFields.email && formErrors.email && (<Text style={styles.errorText}>{formErrors.email}</Text>)}

          <TextInput mode="outlined" label="Mobile Number" style={styles.input} theme={inputTheme} editable={!loading} value={formData.mobileNo} onChangeText={(text) => setFormData({ ...formData, mobileNo: text })} onBlur={() => handleBlur('mobileNo')} placeholder="Enter Mobile Number" keyboardType="phone-pad" />
          {touchedFields.mobileNo && formErrors.mobileNo && (<Text style={styles.errorText}>{formErrors.mobileNo}</Text>)}

          <TextInput mode="outlined" label="Address" style={styles.input} theme={inputTheme} editable={!loading} value={formData.address} onChangeText={(text) => setFormData({ ...formData, address: text })} onBlur={() => handleBlur('address')} placeholder="Enter Address" />
          {touchedFields.address && formErrors.address && (<Text style={styles.errorText}>{formErrors.address}</Text>)}

          <TouchableOpacity
            style={[styles.registerButton, { backgroundColor: colors.primary }, loading && styles.disabledButton]}
            onPress={handleFormSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.registerButtonText}>
                Create your free account
              </Text>
            )}
          </TouchableOpacity>

          {!loading &&
            <ThemedText style={styles.BottomText}> Already have an account?{' '}
              <Text onPress={signInClick}>
                <Text style={[styles.signInText, { color: colors.primary }]}>Sign In</Text>
              </Text>
            </ThemedText>
          }
        </View>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#fff',
  },
  formSection: {
    // marginTop: 5,
    alignItems: 'center',
    paddingLeft: 15,
    paddingRight: 15,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingLeft: 20,
    paddingTop: 10,
  },
  themeToggle: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    padding: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  signInText: {
    paddingTop: 10
  },
  inputContainer: {
    width: '100%',
    marginVertical: 10,
  },
  input: {
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    paddingBottom: 10
  },
  logo: {
    width: '100%',
    height: '30%',
  },
  BottomText: {
    paddingTop: 10
  },
  registerButton: {
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.7,
  },

});

export default Register;
