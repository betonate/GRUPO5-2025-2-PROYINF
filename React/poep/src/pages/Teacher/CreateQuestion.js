import React, { useState } from 'react';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function CreateQuestion() {
  const [formData, setFormData] = useState({
    enunciado: '',
    opcion_a: '',
    opcion_b: '',
    opcion_c: '',
    opcion_d: '',
    opcion_e: '',
    respuesta_correcta: '',
    materia: 'Matemáticas',
    eje_tematico: '',
    dificultad: 1,
    foto_url: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'dificultad' ? parseInt(value) : value
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
      navigate('/teacher/select-subject'); // Regresa a una página anterior para que el profe siga trabajando
    } catch (error) {
      console.error('Error al crear pregunta:', error);
      alert('Hubo un error al crear la pregunta. Revisa la consola para más detalles.');
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h3>Crear Nueva Pregunta</h3>
      <div style={{ display: 'grid', gap: '1rem', maxWidth: '600px' }}>
        <div>
          <label>Materia:</label>
          <select name="materia" value={formData.materia} onChange={handleChange} style={{ width: '100%', padding: '8px' }}>
            <option value="Matemáticas">Matemáticas</option>
            <option value="Lenguaje">Lenguaje</option>
            <option value="Ciencias">Ciencias</option>
            <option value="Historia">Historia</option>
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
          <label>Dificultad (1-5):</label>
          <input type="number" name="dificultad" min="1" max="5" value={formData.dificultad} onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
        </div>
        <div>
          <label>URL de Imagen (Opcional):</label>
          <input type="text" name="foto_url" value={formData.foto_url} onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
        </div>
        <button onClick={handleAdd} style={{ padding: '10px 15px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Crear Pregunta
        </button>
      </div>
    </div>
  );
}