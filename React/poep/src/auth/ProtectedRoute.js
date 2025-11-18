import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import PropTypes from 'prop-types';

const ProtectedRoute = ({ roles }) => {
    const token = localStorage.getItem('token');

    if (!token) {
        // Si no hay token, redirige al login
        return <Navigate to="/login" />;
    }

    try {
        const decodedToken = jwtDecode(token);
        // Si se especificaron roles y el rol del usuario no está permitido, redirige
        if (roles && !roles.includes(decodedToken.rol)) {
            return <Navigate to="/unauthorized" />; // O a una página de "no autorizado"
        }
    } catch (error) {
        // Si el token es inválido, limpia y redirige al login
        localStorage.removeItem('token');
        return <Navigate to="/login" />;
    }
    
    // Si todo está bien, muestra el contenido de la ruta protegida
    return <Outlet />;
};

// --- Validación de tipos de props ---
ProtectedRoute.propTypes = {
    roles: PropTypes.arrayOf(PropTypes.string)  // roles debe ser un arreglo de strings
};

//valor por defecto
ProtectedRoute.defaultProps = {
    roles: null
};

export default ProtectedRoute;
