// src/services/api.js
import axios from "axios";

const API_PREGUNTAS = "http://localhost:8080";
const API_RESPUESTAS = "http://localhost:8081";
const API_USUARIOS  = "http://localhost:8082";

// === Auth header ===
const getToken = () => localStorage.getItem("token");
const authHeaders = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

// === Cliente unificado ===
export const api = {
  // --------- Autenticación ---------
  login: (credentials) =>
    axios.post(`${API_USUARIOS}/login`, credentials),

  // --------- Docente ---------
  getMateriasByDocente: (docenteId) =>
    axios.get(`${API_USUARIOS}/docentes/${docenteId}/materias`, authHeaders()),

  getCursosByDocente: (docenteId) =>
    axios.get(`${API_USUARIOS}/docentes/${docenteId}/cursos`, authHeaders()),

  // lista de ensayos creados por el docente (servicio PREGUNTAS)
  getEnsayosByDocente: (docenteId, materiaId) =>
    axios.get(
      `${API_PREGUNTAS}/ensayos/${docenteId}${
        materiaId ? `?materia=${encodeURIComponent(materiaId)}` : ""
      }`,
      authHeaders()
    ),


  // Administración
  getUsuarios: () => axios.get(`${API_USUARIOS}/usuarios`,authHeaders()),
  setMateriaUsuario: (materiaData) => axios.post(`${API_USUARIOS}/usuarios/materias`, materiaData,authHeaders())

  // estadísticas a nivel docente (servicio RESPUESTAS)
  getEstadisticasDocente: (docenteId, materiaId) =>
    axios.get(
      `${API_RESPUESTAS}/estadisticas/docente/${docenteId}${
        materiaId ? `?materia=${encodeURIComponent(materiaId)}` : ""
      }`,
      authHeaders()
    ),

  // resultados por ensayo visibles al docente (solo sus cursos)
  getEnsayoResultadosDocente: (ensayoId, docenteId) =>
    axios.get(
      `${API_RESPUESTAS}/docente/ensayo/${ensayoId}/resultados?id_docente=${encodeURIComponent(
        docenteId
      )}`,
      authHeaders()
    ),

  // crear ensayo (servicio PREGUNTAS)
  createExam: (examData) =>
    axios.post(`${API_PREGUNTAS}/ensayos`, examData, authHeaders()),

  // --------- Estudiante ---------
  // Para menús/selects
  getMaterias: () =>
    axios.get(`${API_USUARIOS}/materias`, authHeaders()),

  getCursosByEstudiante: (estudianteId) =>
    axios.get(
      `${API_USUARIOS}/estudiantes/${estudianteId}/cursos`,
      authHeaders()
    ),

  getEnsayosByCursos: (cursosIds) =>
    axios.post(
      `${API_PREGUNTAS}/ensayos/por-cursos`,
      { cursos_ids: cursosIds },
      authHeaders()
    ),

  submitAnswers: (data) =>
    axios.post(`${API_RESPUESTAS}/responder`, data, authHeaders()),

  getResultsByStudent: (studentId) =>
    axios.get(
      `${API_RESPUESTAS}/resultados/estudiante/${studentId}`,
      authHeaders()
    ),

  getResultDetails: (resultId) =>
    axios.get(`${API_RESPUESTAS}/resultado/${resultId}`, authHeaders()),

  getAnswersByResult: (resultId) =>
    axios.get(`${API_RESPUESTAS}/respuestas/${resultId}`, authHeaders()),

  // --------- General (preguntas/ensayos) ---------
  getQuestionsBySubject: (subjectId) =>
    axios.get(`${API_PREGUNTAS}/preguntas/${subjectId}`, authHeaders()),

  createQuestion: (questionData) =>
    axios.post(`${API_PREGUNTAS}/preguntas`, questionData, authHeaders()),

  getQuestionsFromExam: (examId) =>
    axios.get(`${API_PREGUNTAS}/ensayos/${examId}/preguntas`, authHeaders()),

  // --------- Administración / Directivo ---------
  getAllUserDetails: () =>
    axios.get(`${API_USUARIOS}/admin/all-user-details`, authHeaders()),

  createUser: (userData) =>
    axios.post(`${API_USUARIOS}/usuarios`, userData, authHeaders()),

  getEstadisticasGenerales: () =>
    axios.get(`${API_RESPUESTAS}/estadisticas-generales`, authHeaders()),

  // --------- Foro ---------
  getForoTopics: (materiaId) =>
    axios.get(
      `${API_RESPUESTAS}/foro/topics${
        materiaId ? `?materia=${encodeURIComponent(materiaId)}` : ""
      }`,
      authHeaders()
    ),

  createForoTopic: (payload) =>
    axios.post(`${API_RESPUESTAS}/foro/topics`, payload, authHeaders()),

  getForoTopic: (idTopico) =>
    axios.get(`${API_RESPUESTAS}/foro/topics/${idTopico}`, authHeaders()),

  listForoReplies: (idTopico) =>
    axios.get(
      `${API_RESPUESTAS}/foro/topics/${idTopico}/replies`,
      authHeaders()
    ),

  createForoReply: (idTopico, payload) =>
    axios.post(
      `${API_RESPUESTAS}/foro/topics/${idTopico}/replies`,
      payload,
      authHeaders()
    ),

  // --------- Helpers de Estadísticas (selector + detalle) ---------
  // Sidebar: lista para seleccionar ensayo (id, titulo, total_intentos)
  getEnsayosParaSelector: () =>
    axios.get(`${API_RESPUESTAS}/api/estadisticas/ensayos`, authHeaders()),

  // Detalle: resumen + histograma + tabla por pregunta
  getEstadisticasDeEnsayo: (ensayoId, { min, max, step } = {}) => {
    const qs = new URLSearchParams();
    if (min != null) qs.set("min", min);
    if (max != null) qs.set("max", max);
    if (step != null) qs.set("step", step);
    const suf = qs.toString() ? `?${qs}` : "";
    return axios.get(
      `${API_RESPUESTAS}/api/ensayos/${ensayoId}/estadisticas${suf}`,
      authHeaders()
    );
  },
};
