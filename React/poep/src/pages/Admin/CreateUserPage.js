import React, { useState } from 'react';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const CreateUserPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        id_usuario: '',
        nombre_completo: '',
        contrasena: '',
        rol: 'estudiante', // Rol por defecto
        id_institucion: 'col_sanjuan_01' // Institución por defecto
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.id_usuario || !formData.nombre_completo || !formData.contrasena || !formData.rol) {
            alert("Por favor, complete todos los campos requeridos.");
            return;
        }

        try {
            await api.createUser(formData);
            alert(`¡Usuario ${formData.rol} creado exitosamente!`);
            navigate('/admin/dashboard');
        } catch (error) {
            console.error("Error al crear el usuario:", error);
            alert("Hubo un error al crear el usuario. Revisa la consola.");
        }
    };

    return (
        <div>
            <h2>Crear Nuevo Usuario</h2>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', maxWidth: '500px' }}>
                <div>
                    <label>Email (ID de Usuario):</label>
                    <input type="email" name="id_usuario" value={formData.id_usuario} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
                </div>
                <div>
                    <label>Nombre Completo:</label>
                    <input type="text" name="nombre_completo" value={formData.nombre_completo} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
                </div>
                <div>
                    <label>Contraseña:</label>
                    <input type="password" name="contrasena" value={formData.contrasena} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
                </div>
                <div>
                    <label>Rol:</label>
                    <select name="rol" value={formData.rol} onChange={handleChange} style={{ width: '100%', padding: '8px' }}>
                        <option value="estudiante">Estudiante</option>
                        <option value="docente">Docente</option>
                        <option value="directivo">Directivo</option>
                    </select>
                </div>
                {formData.rol !== 'directivo' && (
                    <div>
                        <label>ID Institución:</label>
                        <input type="text" name="id_institucion" value={formData.id_institucion} onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
                    </div>
                )}
                <div>
                    <button type="submit" style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white' }}>Crear Usuario</button>
                    <button type="button" onClick={() => navigate('/admin/dashboard')} style={{ marginLeft: '10px' }}>Volver al Dashboard</button>
                </div>
            </form>
        </div>
    );
};

export default CreateUserPage;
