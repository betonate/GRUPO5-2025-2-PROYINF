import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

// Auth / comunes
import ProtectedRoute from './auth/ProtectedRoute';
import LoginPage from './pages/LoginPage';

// Docente
import DocenteMenu from './pages/Docente/DocenteMenu';
import SeleccionarMateria from './pages/Docente/SeleccionarMateria';
import EnsayosPage from './pages/Docente/EnsayosPage';
import CrearEnsayoPage from './pages/Docente/CrearEnsayoPage';
import BancoDePreguntasPage from './pages/Docente/BancoDePreguntasPage';
import CrearPreguntaPage from './pages/Docente/CrearPreguntaPage';
import DocenteVerEnsayoPage from './pages/Docente/DocenteVerEnsayoPage';
import DocenteEstadisticasEnsayoPage from './pages/Docente/DocenteEstadisticasEnsayoPage';

// Estudiante
import EstudianteMenu from './pages/Estudiante/EstudianteMenu';
import EstudianteEnsayosPage from './pages/Estudiante/EstudianteEnsayosPage';
import RealizarEnsayoPage from './pages/Estudiante/RealizarEnsayoPage';
import VerResultadoPage from './pages/Estudiante/VerResultadoPage';
import ResultadosRecientesPage from './pages/Estudiante/ResultadosRecientesPage';

// Foro 
import EstudianteForoPage from './pages/Estudiante/Foro/EstudianteForoPage';
import EstudianteForoDetallePage from './pages/Estudiante/Foro/EstudianteForoDetallePage';

// Admin
import UserDashboardPage from './pages/Admin/UserDashboardPage';
import CreateUserPage from './pages/Admin/CreateUserPage';
import AsignarMateria from './pages/Admin/AsignarMateria';

// Directivo
import DirectivoDashboardPage from './pages/Analyst/DirectivoDashboardPage';
import DirectivoVerEnsayoPage from './pages/Analyst/DirectivoVerEnsayoPage';

const HomeRedirect = () => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" />;

  const rol = jwtDecode(token).rol;
  if (rol === 'docente') return <Navigate to="/docente" />;
  if (rol === 'estudiante') return <Navigate to="/estudiante" />;
  if (rol === 'directivo') return <Navigate to="/Directivo/dashboard" />;
  return <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <div style={{ padding: 0 }}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<HomeRedirect />} />

          {/* Docente */}
          <Route element={<ProtectedRoute roles={['docente']} />}>
            <Route path="/docente" element={<DocenteMenu />} />
            <Route path="/docente/seleccionar-materia" element={<SeleccionarMateria />} />
            <Route path="/docente/ensayos/:materiaId" element={<EnsayosPage />} />
            <Route path="/docente/crear-ensayo/:materiaId" element={<CrearEnsayoPage />} />
            <Route path="/docente/banco-preguntas/:materiaId" element={<BancoDePreguntasPage />} />
            <Route path="/docente/crear-pregunta/:materiaId" element={<CrearPreguntaPage />} />
            <Route path="/docente/ensayo/:id_ensayo/ver" element={<DocenteVerEnsayoPage />} />
            <Route path="/docente/estadisticas" element={<DocenteEstadisticasEnsayoPage />} />
            <Route path="/docente/foro" element={<EstudianteForoPage />} />
            <Route path="/docente/foro/:idTopico" element={<EstudianteForoDetallePage />} />

          </Route>

          {/* Estudiante */}
          <Route element={<ProtectedRoute roles={['estudiante']} />}>
            <Route path="/estudiante" element={<EstudianteMenu />} />
            <Route path="/estudiante/ensayos/:materiaId" element={<EstudianteEnsayosPage />} />
            <Route path="/estudiante/realizar-ensayo/:ensayoId" element={<RealizarEnsayoPage />} />
            <Route path="/estudiante/resultado/:resultId" element={<VerResultadoPage />} />
            <Route path="/estudiante/resultados-recientes" element={<ResultadosRecientesPage />} />

            {/* Foro */}
            <Route path="/estudiante/foro" element={<EstudianteForoPage />} />
            <Route path="/estudiante/foro/:idTopico" element={<EstudianteForoDetallePage />} />
          </Route>

          {/* Directivo */}
          <Route element={<ProtectedRoute roles={['directivo']} />}>
            <Route path="/Directivo/dashboard" element={<DirectivoDashboardPage />} />
            <Route path="/Directivo/ensayo/:id_ensayo/ver" element={<DirectivoVerEnsayoPage />} />
          </Route>

          {/* Público / pruebas */}
          <Route path="/admin/dashboard" element={<UserDashboardPage />} />
          <Route path="/admin/create-user" element={<CreateUserPage />} />
	  <Route path="/admin/asignar-materia" element={<AsignarMateria />} />

          {/* General */}
          <Route path="/unauthorized" element={<h2>No tienes permiso para ver esta página.</h2>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
