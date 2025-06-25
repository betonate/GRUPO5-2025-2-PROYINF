import axios from 'axios';

const API_PREGUNTAS = 'http://localhost:8080';
const API_RESPUESTAS = 'http://localhost:8081';

export const api = {
  // Preguntas
  getQuestionsBySubject: (subject) => axios.get(`${API_PREGUNTAS}/preguntas/${subject}`),
  createQuestion: (questionData) => axios.post(`${API_PREGUNTAS}/preguntas`, questionData),
  getQuestionsFromExam: (examId) => axios.get(`${API_PREGUNTAS}/ensayos/${examId}/preguntas`),
 
  // Ensayos
  createExam: (examData) => axios.post(`${API_PREGUNTAS}/ensayos`, examData),
  getExamsByTeacher: (teacherId) => axios.get(`${API_PREGUNTAS}/ensayos/${teacherId}`),
 
  // Resultados y respuestas
  submitAnswers: (data) => axios.post(`${API_RESPUESTAS}/responder`, data),
  getResultsByStudent: (studentId) => axios.get(`${API_RESPUESTAS}/resultados/estudiante/${studentId}`),
  getResultById: (resultId) => axios.get(`${API_RESPUESTAS}/resultado/${resultId}`), // Nueva función
  getAnswersByResult: (resultId) => axios.get(`${API_RESPUESTAS}/respuestas/${resultId}`)
};