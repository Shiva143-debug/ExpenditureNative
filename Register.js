
import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { TextInput } from 'react-native-paper';
import axios from 'axios';
import Toast from 'react-native-toast-message';

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

  const handleFormSubmit = () => {
    const values = {
      full_name: formData.fullName,
      email: formData.email,
      mobile_no: formData.mobileNo,
      address: formData.address,
    };

    if (validateForm()) {
      setLoading(true);
      axios
        .post("https://exciting-spice-armadillo.glitch.me/register", values)
        .then((res) => {
          console.log(res);
          Toast.show({ type: 'success', position: 'top', text1: 'Success', text2: 'User Account Created successfully. Check your email for Password.'});
          navigation.navigate('Login');
        })
        .catch((err) => {
          console.log(err);
          Toast.show({  type: 'error',  position: 'top',  text1: 'Error',  text2: 'Email already exists. Please use a different email address.', });
        })
        .finally(() => setLoading(false));
    }
  };

  const signInClick = () => {
    navigation.navigate('Login');
  };

  useEffect(() => {
    validateForm();
  }, [formData]);

  return (
    <View style={styles.container}>
      <Toast />
      <Image source={{ uri: 'https://res.cloudinary.com/dxgbxchqm/image/upload/v1735649616/register_qziayq.jpg' }} style={styles.logo}/>
      <Text style={styles.heading}>Register!!</Text>
      <View style={styles.formSection}>
        <View style={styles.inputContainer}>
          <TextInput  mode="outlined" label="Full Name" style={styles.input} value={formData.fullName} placeholder="Enter Full Name" onChangeText={(text) => setFormData({ ...formData, fullName: text })} onBlur={() => handleBlur('fullName')}/>
          {touchedFields.fullName && formErrors.fullName && (<Text style={styles.errorText}>{formErrors.fullName}</Text>)}
          
          <TextInput mode="outlined" label="Email" style={styles.input} value={formData.email} onChangeText={(text) => setFormData({ ...formData, email: text })} onBlur={() => handleBlur('email')} placeholder="Enter your email" keyboardType="email-address" />
          {touchedFields.email && formErrors.email && (<Text style={styles.errorText}>{formErrors.email}</Text>)}

          <TextInput  mode="outlined"  label="Mobile Number"  style={styles.input}  value={formData.mobileNo}  onChangeText={(text) => setFormData({ ...formData, mobileNo: text })}  onBlur={() => handleBlur('mobileNo')} placeholder="Enter Mobile Number"  keyboardType="phone-pad" />
          {touchedFields.mobileNo && formErrors.mobileNo && (<Text style={styles.errorText}>{formErrors.mobileNo}</Text>)}

          <TextInput mode="outlined" label="Address"style={styles.input} value={formData.address} onChangeText={(text) => setFormData({ ...formData, address: text })} onBlur={() => handleBlur('address')} placeholder="Enter Address" />
          {touchedFields.address && formErrors.address && (<Text style={styles.errorText}>{formErrors.address}</Text>)}

          <Button title={loading ? 'Creating...' : 'Create your free account'} onPress={handleFormSubmit} disabled={loading}/>
          <Text style={styles.BottomText}> Already have an account?{' '}
            <Text onPress={signInClick}>
              <Text style={styles.signInText}>Sign In</Text>
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    paddingTop:10
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
    paddingBottom:10
  },
  logo: {
    width: '100%',
    height: '30%',
  },
  BottomText:{
    paddingTop:10
  }
});

export default Register;
