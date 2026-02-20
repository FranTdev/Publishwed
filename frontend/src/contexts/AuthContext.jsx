import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getAuthToken, setAuthToken, removeAuthToken } from '../lib/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = getAuthToken();
            if (token) {
                try {
                    const userData = await api.getMe();
                    setUser(userData);
                } catch (error) {
                    console.error("Failed to load user:", error);
                    removeAuthToken();
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = async (email, password) => {
        const formData = new FormData();
        formData.append('username', email);
        formData.append('password', password);

        // Attempt successful login
        const data = await api.login(formData);
        setAuthToken(data.access_token);

        // Fetch and store user info
        const userData = await api.getMe();
        setUser(userData);
        return userData;
    };

    const register = async (user_name, email, password) => {
        return await api.register({ user_name, email, password });
    };

    const logout = () => {
        removeAuthToken();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
