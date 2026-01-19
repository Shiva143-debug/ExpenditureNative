
import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { ActivityIndicator, TextInput } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import ThemedText from '../../components/ThemedText';
import ThemedView from '../../components/ThemedView';
import { registerUser } from '../../services/apiService';


const Register = ({ navigation }) => {
  const [formData, setFormData] = useState({ fullName: '', email: '', mobileNo: '', address: '' });
  const [formErrors, setFormErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [loading, setLoading] = useState(false);

  const handleBlur = (field) => {
    setTouchedFields({ ...touchedFields, [field]: true });
    validateForm();
  };

  const validateForm = () => {
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
    if (!formData.address) errors.address = 'Address is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const handleFormSubmit = async () => {
    if (!validateForm()) return;

    const values = {
      full_name: formData.fullName,
      email: formData.email,
      mobile_no: formData.mobileNo,
      address: formData.address,
    };

    try {
      setLoading(true);

      const data = await registerUser(values);

      Toast.show({
        type: 'success',
        position: 'top',
        text1: 'Success',
        text2: data.message, // ✅ backend success message
      });

      setFormData({ fullName: '', email: '', mobileNo: '', address: '' });
      setTouchedFields({});

      navigation.navigate('Login');

    } catch (error) {
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Error',
        text2:
          error?.response?.data?.message ||   // ✅ backend error
          error.message ||
          'Something went wrong',
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
  }, [formData]);

  return (
    <ThemedView style={styles.container}>
      <Image source={{ uri: 'https://res.cloudinary.com/dxgbxchqm/image/upload/v1735649616/register_qziayq.jpg' }} style={styles.logo} />
      <Text style={styles.heading}>Register!!</Text>
      <View style={styles.formSection}>
        <View style={styles.inputContainer}>
          <TextInput mode="outlined" label="Full Name" style={styles.input} disabled={loading} value={formData.fullName} placeholder="Enter Full Name" onChangeText={(text) => setFormData({ ...formData, fullName: text })} onBlur={() => handleBlur('fullName')} />
          {touchedFields.fullName && formErrors.fullName && (<Text style={styles.errorText}>{formErrors.fullName}</Text>)}

          <TextInput mode="outlined" label="Email" style={styles.input} disabled={loading} value={formData.email} onChangeText={(text) => setFormData({ ...formData, email: text })} onBlur={() => handleBlur('email')} placeholder="Enter your email" keyboardType="email-address" />
          {touchedFields.email && formErrors.email && (<Text style={styles.errorText}>{formErrors.email}</Text>)}

          <TextInput mode="outlined" label="Mobile Number" style={styles.input} disabled={loading} value={formData.mobileNo} onChangeText={(text) => setFormData({ ...formData, mobileNo: text })} onBlur={() => handleBlur('mobileNo')} placeholder="Enter Mobile Number" keyboardType="phone-pad" />
          {touchedFields.mobileNo && formErrors.mobileNo && (<Text style={styles.errorText}>{formErrors.mobileNo}</Text>)}

          <TextInput mode="outlined" label="Address" style={styles.input} disabled={loading} value={formData.address} onChangeText={(text) => setFormData({ ...formData, address: text })} onBlur={() => handleBlur('address')} placeholder="Enter Address" />
          {touchedFields.address && formErrors.address && (<Text style={styles.errorText}>{formErrors.address}</Text>)}

          <TouchableOpacity
            style={[styles.registerButton, loading && styles.disabledButton]}
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
                <Text style={styles.signInText}>Sign In</Text>
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
    marginTop: 5,
    alignItems: 'center',
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingLeft: 20,
    paddingTop: 10,
    color: 'purple',
  },
  signInText: {
    color: 'blue',
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
    backgroundColor: '#6200EE',
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
