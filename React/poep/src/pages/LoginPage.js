import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import './LoginPage.css'; 

const LoginPage = () => {
    const [id_usuario, setIdUsuario] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await api.login({ id_usuario, contrasena });
            localStorage.setItem('token', response.data.token);
            navigate('/');
        } catch (err) {
            setError('Credenciales incorrectas. Por favor, intente de nuevo.');
            console.error(err);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>Iniciar Sesión</h2>
                <form onSubmit={handleLogin}>
                    <div>
                        <label>Correo:</label>
                        <input type="email" value={id_usuario} onChange={(e) => setIdUsuario(e.target.value)} required />
                    </div>
                    <div>
                        <label>Contraseña:</label>
                        <input type="password" value={contrasena} onChange={(e) => setContrasena(e.target.value)} required />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit">Entrar</button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
