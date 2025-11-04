import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const AsignarMateria = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [materias, setMaterias] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        id_usuario: '',
        id_materia: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const resMaterias = await api.getMaterias();
                const resUsuarios = await api.getUsuarios();

                setMaterias(resMaterias.data || []);
                setUsuarios(resUsuarios.data || []);
            } catch (error) {
                console.error("Error cargando datos:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.setMateriaUsuario(formData);
            alert("Materia asignada correctamente ✅");
            navigate("/dashboard"); 
        } catch (error) {
            console.error("Error asignando materia:", error);
            alert("Error al asignar la materia ❌");
        }
    };

    if (loading) return <p>Cargando datos...</p>;

    return (
        <div>
            <h2>Asignar Materia a Usuario</h2>

            <form onSubmit={handleSubmit}>
                <label>Usuario:</label>
                <select
                    name="id_usuario"
                    value={formData.id_usuario}
                    onChange={handleChange}
                    required
                >
                    <option value="">Selecciona un usuario</option>
                    {usuarios.map(u => (
                        <option key={u.id_usuario} value={u.id_usuario}>
                            {u.nombre_completo}
                        </option>
                    ))}
                </select>

                <br /><br />

                <label>Materia:</label>
                <select
                    name="id_materia"
                    value={formData.id_materia}
                    onChange={handleChange}
                    required
                >
                    <option value="">Selecciona una materia</option>
                    {materias.map(m => (
                        <option key={m.id_materia} value={m.id_materia}>
                            {m.nombre_display}
                        </option>
                    ))}
                </select>

                <br /><br />

                <button type="submit">Asignar</button>
            </form>
        </div>
    );
};

export default AsignarMateria;

