import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="h-screen w-full flex items-center justify-center bg-gray-50 text-gray-900">Cargando...</div>;
    }

    return user ? <Outlet /> : <Navigate to="/login" replace />;
};
