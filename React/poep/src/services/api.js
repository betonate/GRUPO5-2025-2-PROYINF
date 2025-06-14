import axios from 'axios';

const API_URL = 'http://localhost:8080';

export const api = {
  // Preguntas
  getQuestionsBySubject: (subject) => axios.get(`${API_URL}/preguntas/${subject}`),
  createQuestion: (questionData) => axios.post(`${API_URL}/preguntas`, questionData),

  // Ensayos
  createExam: (examData) => axios.post(`${API_URL}/ensayos`, examData),
  getExamsByTeacher: (teacherId) => axios.get(`${API_URL}/ensayos/${teacherId}`)
};