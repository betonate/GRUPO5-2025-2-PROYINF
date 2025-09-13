import React, { useEffect, useState } from "react";
import { api } from "../../services/api";
import { useNavigate } from "react-router-dom";

const EnsayosPorDificultadPage = () => {
  const [ensayos, setEnsayos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.getEnsayosOrdenadosPorDificultad() // 🔹 necesitas definir este endpoint en tu backend o en `services/api.js`
      .then(res => setEnsayos(res.data))
      .catch(err => console.error("Error al cargar ensayos:", err));
      console.log("Llegamos aquí");
  }, []);

return (
  <div style={{ padding: "20px" }}>
    <h2>Ensayos ordenados por dificultad</h2>
    {ensayos.length > 0 ? (
      <ul>
        {ensayos.map((ensayo) => (
          <li key={ensayo.id_ensayo}>
            <p>Ensayo: {ensayo.id_ensayo} - Materia: {ensayo.id_materia} - Dificultad: {ensayo.tiempo_minutos}</p>
          </li>
        ))}
      </ul>
    ) : (
      <p>No hay ensayos disponibles en este momento.</p>
    )}
  </div>
);
};

export default EnsayosPorDificultadPage;

