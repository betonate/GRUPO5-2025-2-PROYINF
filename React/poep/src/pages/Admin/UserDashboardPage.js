import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const UserCard = ({ user }) => (
    <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '15px', marginBottom: '15px' }}>
        <h3>{user.nombre_completo} <span style={{ fontSize: '0.9em', color: '#666' }}>({user.rol})</span></h3>
        <p><strong>ID/Email:</strong> {user.id_usuario}</p>
        {user.id_institucion && <p><strong>Institución:</strong> {user.id_institucion}</p>}
        {user.cursos && <p><strong>Cursos Asignados:</strong> {user.cursos}</p>}
        {user.materias && <p><strong>Materias Asignadas:</strong> {user.materias}</p>}
    </div>
);


const UserDashboardPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await api.getAllUserDetails();
                setUsers(res.data);
            } catch (error) {
                console.error("Error al cargar los detalles de los usuarios:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    if (loading) return <p>Cargando datos de usuarios...</p>;

    return (
        <div>
            <h2>Dashboard de Usuarios</h2>
            <p>Aquí puedes ver todos los perfiles creados en el sistema.</p>
            <button onClick={() => navigate('/admin/create-user')}>Crear Nuevo Usuario</button>
            <hr style={{ margin: '20px 0' }}/>
            {users.map(user => (
		<div key={user.id_usuario}>
                	<UserCard key={user.id_usuario} user={user} />
	        	<button onClick={() => navigate('/admin/asignar-materia')}>Asignar materia</button>
		</div>
            ))}
        </div>
    );
};

export default UserDashboardPage;
