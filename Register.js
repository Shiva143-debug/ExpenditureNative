import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, Button, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { TextInput } from 'react-native-paper';
import axios from 'axios';
// import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';


const Register = () => {
    const [formData, setFormData] = useState({ fullName: '', email: '', mobileNo: '', address: '' });
    const [formErrors, setFormErrors] = useState({});
    const [touchedFields, setTouchedFields] = useState({});
    const [loading, setLoading] = useState(false);

    // const handleChange = (e) => {
    //     const { name, value } = e.target;
    //     setFormData({ ...formData, [name]: value });
    // };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouchedFields({ ...touchedFields, [name]: true });
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
        if (!formData.mobileNo) errors.mobileNo = 'Phone number is required';
        if (formData.mobileNo.length > 10) errors.mobileNo = 'Phone number must be 10 digits only';
        if (!formData.address) errors.address = 'Address is required';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const values = {
            full_name: formData.fullName,
            email: formData.email,
            mobile_no: formData.mobileNo,
            address: formData.address,
        };

        if (validateForm()) {
            setLoading(true);

            axios.post("https://exciting-spice-armadillo.glitch.me/register", values)
                .then(res => {
                    console.log(res);
                    Toast.show({ type: 'success', position: 'top', text1: 'Success', text2: 'User Account Created successfully', });
                    setTimeout(() => {
                        // navigation.navigate("Login");
                    }, 1000);
                })
                .catch(err => {
                    console.log(err);
                    Toast.show({ type: 'error', position: 'top', text1: 'Error', text2: 'Email already exists. Please use a different email address.', });
                })
                .finally(() => setLoading(false));
        }
    };

    const signInClick = () => {
        navigation.navigate("Login");
    };

    useEffect(() => {
        validateForm();
    }, [formData]);

    return (
        <View style={styles.container}>
            <Toast />
            <Image source={{ uri: 'https://res.cloudinary.com/dxgbxchqm/image/upload/v1735649616/register_qziayq.jpg' }} style={styles.logo} />
            <Text style={styles.heading}>Register!!</Text>
            <View style={styles.formSection}>
                <View>
                    <View>
                        <View style={styles.inputContainer}>
                            <TextInput mode="outlined" label="Full Name" style={styles.input} value={formData.fullName} placeholder="Enter Full Name" onChangeText={(text) => setFormData({ ...formData, fullName: text })} onBlur={handleBlur} right={<TextInput.Icon icon="eye" />} />
                            {touchedFields.fullName && formErrors.fullName && <Text style={styles.errorText}>{formErrors.fullName}</Text>}

                            <TextInput mode="outlined" label="Email" style={styles.input} value={formData.email} placeholder="Enter Email" onChangeText={(text) => setFormData({ ...formData, email: text })} onBlur={handleBlur} right={<TextInput.Icon icon="eye" />} />
                            {touchedFields.email && formErrors.email && <Text style={styles.errorText}>{formErrors.email}</Text>}

                            <TextInput mode="outlined" label="Mobile Number" style={styles.input} value={formData.mobileNo} placeholder="Enter Mobile Number" onChangeText={(text) => setFormData({ ...formData, mobileNo: text })} onBlur={handleBlur} right={<TextInput.Icon icon="eye" />} keyboardType="phone-pad" />
                            {touchedFields.mobile_no && formErrors.mobile_no && <Text style={styles.errorText}>{formErrors.mobileNo}</Text>}

                            <TextInput mode="outlined" label="Address" style={styles.input} value={formData.address} placeholder="Enter Address" onChangeText={(text) => setFormData({ ...formData, address: text })} onBlur={handleBlur} right={<TextInput.Icon icon="eye" />} />
                            {touchedFields.address && formErrors.address && <Text style={styles.errorText}>{formErrors.address}</Text>}

                            <Button title={loading ? 'Loading...' : 'Create your free account'} onPress={handleFormSubmit} disabled={loading} />
                            <Text>Already have an account?
                                <TouchableOpacity onPress={signInClick}>
                                    <Text style={styles.signInText}>  Sign In</Text>
                                </TouchableOpacity>
                            </Text>
                        </View>
                    </View>
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
        paddingTop:10,
        color: "purple"
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
    },
    checkboxContainer: {
        marginVertical: 10,
    },
    linkText: {
        color: 'blue',
    },
    logo: {
        width: '100%',
        height: '30%',
    },
});

export default Register;
