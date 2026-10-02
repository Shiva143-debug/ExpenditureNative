import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../context/AuthContext';
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../theme/useTheme';
import { loginUser } from '../../services/apiService';
import { ActivityIndicator, TextInput } from 'react-native-paper';


const Login = ({ navigation }) => {
    const { login } = useAuth();
    const { isDark, colors, toggleTheme } = useTheme();

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

    const validateForm = useCallback(() => {
        const errors = {};
        if (!formData.loginEmail) errors.loginEmail = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.loginEmail)) errors.loginEmail = 'Email is invalid';
        if (!formData.password) errors.password = 'Password is required';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    }, [formData]);

    const handleSubmit = async () => {
        if (!validateForm()) return;

        const loginData = {
            loginEmail: formData.loginEmail,
            password: formData.password
        };

        try {
            setLoading(true);

            const response = await loginUser(loginData);

            if (!response.status) {
                Toast.show({
                    type: 'error',
                    position: 'top',
                    text1: 'Error',
                    text2: response.message || 'Invalid email or password'
                });
                setFormData(prev => ({ ...prev, password: '' }));
                return;
            }

            const body = response.data;
            const inner = body?.data ?? body;
            const token = inner?.token || body?.token;
            if (!token) {
                Toast.show({
                    type: 'error',
                    position: 'top',
                    text1: 'Error',
                    text2: 'Invalid email or password'
                });
                setFormData(prev => ({ ...prev, password: '' }));
                return;
            }

            Toast.show({
                type: 'success',
                position: 'top',
                text1: 'Success',
                text2: response.message || 'Login successful'
            });

            // ✅ clear inputs
            setFormData({ loginEmail: '', password: '' });
            setTouchedFields({});

            login(token, inner?.user ?? null);

        } catch (error) {
            Toast.show({
                type: 'error',
                position: 'top',
                text1: 'Error',
                text2: 'Invalid email or password'
            });
            // ✅ clear password on error
            setFormData(prev => ({ ...prev, password: '' }));
        } finally {
            setLoading(false);
        }
    };


    const handleSignupClick = () => {
        navigation.navigate('Register');
    };

    useEffect(() => {
        validateForm();
    }, [validateForm]);

    return (
        <ThemedView style={styles.container}>
            <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
                <Icon name={isDark ? 'light-mode' : 'dark-mode'} size={26} color={colors.textPrimary} />
            </TouchableOpacity>
            <Image source={{ uri: 'https://res.cloudinary.com/dxgbxchqm/image/upload/v1735652028/loginimage_blnefc.jpg' }} style={styles.logo} />
            <ScrollView
                contentContainerStyle={styles.formSection}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <Text style={[styles.heading, { color: colors.textPrimary }]}>Log In!!</Text>
                <View style={styles.inputContainer}>
                    <TextInput mode="outlined" label="Email" style={styles.input} theme={inputTheme} value={formData.loginEmail} onChangeText={(text) => handleChange('loginEmail', text)}
                        onBlur={() => handleBlur('loginEmail')} error={touchedFields.loginEmail && formErrors.loginEmail} placeholder="Enter your email " keyboardType="email-address" />
                    {touchedFields.loginEmail && formErrors.loginEmail && <Text style={styles.errorText}>{formErrors.loginEmail}</Text>}

                    <TextInput mode="outlined" label="Password" style={styles.input} theme={inputTheme} value={formData.password} onChangeText={(text) => handleChange('password', text)} onBlur={() => handleBlur('password')}
                        error={touchedFields.password && formErrors.password} placeholder="Enter your password" secureTextEntry />
                    {touchedFields.password && formErrors.password && <Text style={styles.errorText}>{formErrors.password}</Text>}

                    {/* <Button title={loading ? 'Loading...' : 'Log In'} onPress={handleSubmit} disabled={loading} /> */}
                    <TouchableOpacity
                        style={[styles.loginButton, { backgroundColor: colors.primary }, loading && styles.disabledButton]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.loginButtonText}>Log In</Text>
                        )}
                    </TouchableOpacity>
                    {!loading &&
                        <ThemedText style={styles.BottomText}>Don't have an account?
                            <ThemedText onPress={handleSignupClick}>
                                <Text style={[styles.signupText, { color: colors.primary }]}> Register</Text>
                            </ThemedText>
                        </ThemedText>
                    }
                </View>
            </ScrollView>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: '#fff',

    },
    logo: {
        width: '100%',
        height: '40%',
    },
    heading: {
        padding: 10,
        fontSize: 24,
        fontWeight: 'bold',
        // paddingLeft: 10,
        // paddingTop: 10,
        alignSelf: 'flex-start',
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
    formSection: {
        // marginTop: 5,
        alignItems: 'center',
        paddingLeft: 15,
        paddingRight: 15,
        flexGrow: 1,
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
    },
    inputContainer: {
        width: '100%',
        marginVertical: 10,
    },
    BottomText: {
        paddingTop: 10
    },
    loginButton: {
        paddingVertical: 12,
        height: 48,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    },
    disabledButton: {
        opacity: 0.7
    }

});

export default Login;