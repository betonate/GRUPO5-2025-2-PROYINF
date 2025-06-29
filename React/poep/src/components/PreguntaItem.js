import React, { useState } from 'react';

// Este componente es reutilizable para mostrar una pregunta
const PreguntaItem = ({ pregunta, onSelect, isSelected }) => {
    const [expandida, setExpandida] = useState(false);

    // Maneja el click en el li para expandir/colapsar
    const handleExpand = (e) => {
        // Evita que el li se expanda si se hizo click en el checkbox
        if (e.target.type !== 'checkbox') {
            setExpandida(!expandida);
        }
    };

    return (
        <li onClick={handleExpand} style={{ cursor: 'pointer', border: '1px solid #ccc', margin: '8px 0', padding: '10px', listStyle: 'none', borderRadius: '5px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* El checkbox solo aparece si se pasa la función onSelect */}
                {onSelect && (
                    <input 
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onSelect(pregunta.id_pregunta)}
                        style={{ width: '20px', height: '20px' }}
                    />
                )}
                <span>{pregunta.enunciado}</span>
            </div>
            
            {expandida && (
                <div style={{ marginTop: '15px', paddingLeft: '20px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                    <p><strong>Alternativas:</strong></p>
                    <ul style={{ listStyleType: 'upper-alpha', paddingLeft: '20px' }}>
                        <li style={{ color: pregunta.respuesta_correcta === 'a' ? 'green' : 'black', fontWeight: pregunta.respuesta_correcta === 'a' ? 'bold' : 'normal' }}>{pregunta.opcion_a}</li>
                        <li style={{ color: pregunta.respuesta_correcta === 'b' ? 'green' : 'black', fontWeight: pregunta.respuesta_correcta === 'b' ? 'bold' : 'normal' }}>{pregunta.opcion_b}</li>
                        <li style={{ color: pregunta.respuesta_correcta === 'c' ? 'green' : 'black', fontWeight: pregunta.respuesta_correcta === 'c' ? 'bold' : 'normal' }}>{pregunta.opcion_c}</li>
                        <li style={{ color: pregunta.respuesta_correcta === 'd' ? 'green' : 'black', fontWeight: pregunta.respuesta_correcta === 'd' ? 'bold' : 'normal' }}>{pregunta.opcion_d}</li>
                        <li style={{ color: pregunta.respuesta_correcta === 'e' ? 'green' : 'black', fontWeight: pregunta.respuesta_correcta === 'e' ? 'bold' : 'normal' }}>{pregunta.opcion_e}</li>
                    </ul>
                </div>
            )}
        </li>
    );
};

export default PreguntaItem;