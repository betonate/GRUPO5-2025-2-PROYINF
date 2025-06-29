import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useNavigate, useParams } from 'react-router-dom';

const materiasDisponibles = [
    { id: 'mat_m1', nombre: 'Matemáticas M1' },
    { id: 'mat_m2', nombre: 'Matemáticas M2' },
    { id: 'len', nombre: 'Lenguaje' },
    { id: 'cie', nombre: 'Ciencias' },
    { id: 'his', nombre: 'Historia' }
];

export default function CrearPreguntaPage() {
    const { materiaId } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        enunciado: '',
        opcion_a: '',
        opcion_b: '',
        opcion_c: '',
        opcion_d: '',
        opcion_e: '',
        respuesta_correcta: '',
        id_materia: materiaId || 'mat_m1', // Preselecciona la materia
        eje_tematico: '',
        dificultad: 1,
        foto_url: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'dificultad' ? parseInt(value, 10) : value
        }));
    };

    const handleAdd = async () => {
        if (!formData.enunciado || !formData.opcion_a || !formData.opcion_b || !formData.respuesta_correcta) {
            alert('Por favor, complete al menos el enunciado, las opciones A y B, y la respuesta correcta.');
            return;
        }
        try {
            await api.createQuestion(formData);
            alert('✅ Pregunta creada exitosamente');
            navigate(`/docente/banco-preguntas/${formData.id_materia}`); // Vuelve al banco de la materia correcta
        } catch (error) {
            console.error('Error al crear pregunta:', error);
            alert('Hubo un error al crear la pregunta.');
        }
    };

    return (
        <div style={{ padding: '1rem' }}>
            <h3>Crear Nueva Pregunta</h3>
            <div style={{ display: 'grid', gap: '1rem', maxWidth: '600px' }}>
                <div>
                    <label>Materia:</label>
                    <select name="id_materia" value={formData.id_materia} onChange={handleChange} style={{ width: '100%', padding: '8px' }}>
                        {materiasDisponibles.map(m => (
                            <option key={m.id} value={m.id}>{m.nombre}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>Enunciado:</label>
                    <textarea name="enunciado" value={formData.enunciado} onChange={handleChange} style={{ width: '100%', padding: '8px', minHeight: '80px' }} />
                </div>
                {['a', 'b', 'c', 'd', 'e'].map((opcion) => (
                    <div key={opcion}>
                        <label>Opción {opcion.toUpperCase()}:</label>
                        <input type="text" name={`opcion_${opcion}`} value={formData[`opcion_${opcion}`]} onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
                    </div>
                ))}
                <div>
                    <label>Respuesta Correcta:</label>
                    <select name="respuesta_correcta" value={formData.respuesta_correcta} onChange={handleChange} style={{ width: '100%', padding: '8px' }}>
                        <option value="">Seleccione...</option>
                        {['a', 'b', 'c', 'd', 'e'].map((opcion) => (
                            <option key={opcion} value={opcion}>Opción {opcion.toUpperCase()}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>Eje Temático:</label>
                    <input type="text" name="eje_tematico" value={formData.eje_tematico} onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
                </div>
                <div>
                    <label>Dificultad (1-5):</label>
                    <input type="number" name="dificultad" min="1" max="5" value={formData.dificultad} onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
                </div>
                <div>
                    <label>URL de Imagen (Opcional):</label>
                    <input type="text" name="foto_url" value={formData.foto_url} onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={handleAdd} style={{ flex: 1, padding: '10px 15px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Crear Pregunta
                    </button>
                    <button onClick={() => navigate(`/docente/banco-preguntas/${materiaId}`)} style={{ flex: 1, padding: '10px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Volver
                    </button>
                </div>
            </div>
        </div>
    );
}
