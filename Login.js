import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, Button, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { TextInput } from 'react-native-paper';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { useAuth } from './AuthContext';


const Login = ({ navigation }) => {
    const { login } = useAuth();
    const [formData, setFormData] = useState({ loginEmail: '', password: '' });
    const [formErrors, setFormErrors] = useState({});
    const [touchedFields, setTouchedFields] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (name, value) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleBlur = (name) => {
        setTouchedFields({ ...touchedFields, [name]: true });
        validateForm();
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.loginEmail) errors.loginEmail = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.loginEmail)) errors.loginEmail = 'Email is invalid';
        if (!formData.password) errors.password = 'Password is required';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            setLoading(true);
            const loginData = { loginEmail: formData.loginEmail, password: formData.password };

            axios.post('https://exciting-spice-armadillo.glitch.me/login', loginData)
                .then(res => {
                    console.log(res)
                    Toast.show({ type: 'success', position: 'top', text1: 'Success', text2: 'Login successfully' });
                    login(res.data.result.id);
                })
                .catch(err => {
                    Toast.show({ type: 'error', position: 'top', text1: 'Error', text2: 'Invalid email or password' });
                })
                .finally(() => setLoading(false));
        }
    };

    const handleSignupClick = () => {
        navigation.navigate('Register');
    };

    useEffect(() => {
        validateForm();
    }, [formData]);

    return (
        <View style={styles.container}>
            <Toast />
            <Image source={{ uri: 'https://res.cloudinary.com/dxgbxchqm/image/upload/v1735652028/loginimage_blnefc.jpg' }} style={styles.logo} />
            <Text style={styles.heading}>Log In!!</Text>
            <View style={styles.formSection}>
                <View>
                    <View>
                        <View style={styles.inputContainer}>
                            <TextInput mode="outlined" label="Email" style={styles.input} value={formData.loginEmail} onChangeText={(text) => handleChange('loginEmail', text)}
                                onBlur={() => handleBlur('loginEmail')} error={touchedFields.loginEmail && formErrors.loginEmail} placeholder="Enter your email " keyboardType="email-address" />
                            {touchedFields.loginEmail && formErrors.loginEmail && <Text style={styles.errorText}>{formErrors.loginEmail}</Text>}

                            <TextInput mode="outlined" label="Password" style={styles.input} value={formData.password} onChangeText={(text) => handleChange('password', text)} onBlur={() => handleBlur('password')}
                                error={touchedFields.password && formErrors.password} placeholder="Enter your password" secureTextEntry />
                            {touchedFields.password && formErrors.password && <Text style={styles.errorText}>{formErrors.password}</Text>}

                            <Button title={loading ? 'Loading...' : 'Log In'} onPress={handleSubmit} disabled={loading} />

                            <Text style={styles.BottomText}>Don't have an account?
                                <Text onPress={handleSignupClick}>
                                    <Text style={styles.signupText}> Register</Text>
                                </Text>
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
    logo: {
        width: '100%',
        height: '40%',
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        paddingLeft: 20,
        paddingTop: 10,
        color: "purple"
    },
    formSection: {
        marginTop: 5,
        alignItems: 'center',
        padding: 20,
    },
    input: {
        marginBottom: 10,
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        paddingBottom: 10
    },
    signupText: {
        color: 'blue',
    },
    inputContainer: {
        width: '100%',
        marginVertical: 10,
    },
    BottomText: {
        paddingTop: 10
    }
});

export default Login;
