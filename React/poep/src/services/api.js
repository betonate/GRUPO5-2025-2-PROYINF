import axios from 'axios';

const API_PREGUNTAS = 'http://localhost:8080';
const API_RESPUESTAS = 'http://localhost:8081';
const API_USUARIOS = 'http://localhost:8082';


// Función para obtener el token de localStorage
const getToken = () => localStorage.getItem('token');
// Configuración para incluir el token en las cabeceras
const authHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`
  }
});

export const api = {
  // Autenticación
  login: (credentials) => axios.post(`${API_USUARIOS}/login`, credentials),

  // Docente
  getMateriasByDocente: (docenteId) => axios.get(`${API_USUARIOS}/docentes/${docenteId}/materias`, authHeaders()),
  getCursosByDocente: (docenteId) => axios.get(`${API_USUARIOS}/docentes/${docenteId}/cursos`, authHeaders()),
  getEnsayosByDocente: (docenteId, materiaId) => axios.get(`${API_PREGUNTAS}/ensayos/${docenteId}?materia=${materiaId}`, authHeaders()),
  getEstadisticasDocente: (docenteId, materiaId) => axios.get(`${API_RESPUESTAS}/estadisticas/docente/${docenteId}?materia=${materiaId}`, authHeaders()),
  getEnsayoResultadosDocente: (ensayoId, docenteId) => axios.get(`${API_RESPUESTAS}/docente/ensayo/${ensayoId}/resultados?id_docente=${docenteId}`, authHeaders()),
  createExam: (examData) => axios.post(`${API_PREGUNTAS}/ensayos`, examData, authHeaders()),

  // Estudiante
  getMaterias: () => axios.get(`${API_USUARIOS}/materias`, authHeaders()), // Para el menú
  getCursosByEstudiante: (estudianteId) => axios.get(`${API_USUARIOS}/estudiantes/${estudianteId}/cursos`, authHeaders()),
  getEnsayosByCursos: (cursosIds) => axios.post(`${API_PREGUNTAS}/ensayos/por-cursos`, { cursos_ids: cursosIds }, authHeaders()),
  submitAnswers: (data) => axios.post(`${API_RESPUESTAS}/responder`, data, authHeaders()),
  getResultsByStudent: (studentId) => axios.get(`${API_RESPUESTAS}/resultados/estudiante/${studentId}`, authHeaders()),
  getResultDetails: (resultId) => axios.get(`${API_RESPUESTAS}/resultado/${resultId}`, authHeaders()), // Renombrada para claridad
  getAnswersByResult: (resultId) => axios.get(`${API_RESPUESTAS}/respuestas/${resultId}`, authHeaders()),

  // General
  getQuestionsBySubject: (subjectId) => axios.get(`${API_PREGUNTAS}/preguntas/${subjectId}`, authHeaders()),
  createQuestion: (questionData) => axios.post(`${API_PREGUNTAS}/preguntas`, questionData, authHeaders()),
  getQuestionsFromExam: (examId) => axios.get(`${API_PREGUNTAS}/ensayos/${examId}/preguntas`, authHeaders()),

  // Administración
  getAllUserDetails: () => axios.get(`${API_USUARIOS}/admin/all-user-details`, authHeaders()),
  createUser: (userData) => axios.post(`${API_USUARIOS}/usuarios`, userData, authHeaders()),
  getUsuarios: () => axios.get(`${API_USUARIOS}/usuarios`,authHeaders()),
  getEstadisticasGenerales: () => axios.get(`${API_RESPUESTAS}/estadisticas-generales`, authHeaders()),
  setMateriaUsuario: (materiaData) => axios.post(`${API_USUARIOS}/usuarios/materias`, materiaData,authHeaders())
};
