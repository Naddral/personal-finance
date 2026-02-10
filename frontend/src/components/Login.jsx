import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';

import './Login.css';

const Login = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const handleSuccess = async (credentialResponse) => {
        try {
            const { credential } = credentialResponse;
            // Send token to backend
            const res = await axios.post('http://localhost:5000/api/auth/google', {
                token: credential
            }, { withCredentials: true });

            // Store user data/token (in this simple version we rely on backend session or response)
            // Ideally backend returns a session cookie or JWT. 
            // For now let's assume backend sets a session cookie or returns user info.

            console.log('Login success:', res.data);
            navigate('/dashboard');
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    const handleError = () => {
        console.log('Login Failed');
    };

    return (
        <div className="login-container">
            <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                <LanguageSelector />
            </div>
            <div className="login-card">
                <h1 className="login-title">
                    Personal Finance Experience
                </h1>
                <p className="login-subtitle">
                    {t('login.subtitle')}
                </p>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <GoogleLogin
                        onSuccess={handleSuccess}
                        onError={handleError}
                        useOneTap
                        theme="filled_black"
                        shape="pill"
                    />
                </div>
            </div>
        </div>
    );
};

export default Login;
