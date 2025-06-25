import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Páginas del estudiante
import StudentPage from './pages/Student/StudentPage';
import RespuestaExamen from './pages/Student/RespuestaExamen';
import ListaEnsayos from './pages/Student/ListaEnsayos';
import VerResultado from './pages/Student/VerResultado';

// Páginas del profesor
import TeacherPage from './pages/Teacher/TeacherPage';
import SelectSubject from './pages/Teacher/SelectSubject';
import QuestionBank from './pages/Teacher/QuestionBank';
import CreateQuestion from './pages/Teacher/CreateQuestion';
import CreateExam from './pages/Teacher/CreateExam';

// Página del analista
import AnalystPage from './pages/Analyst/AnalystPage';

// Tester
import EndpointTester from './test/EndpointTester';
import StudentEndpointTester from './test/StudentEndpointTester';

function App() {
  return (
    <Router>
      <div style={{ padding: 20 }}>
        <h1>Plataforma PAES</h1>
        <Routes>
          {/* Estudiante */}
          <Route path="/student" element={<StudentPage />} />
          <Route path="/student/exams" element={<ListaEnsayos />} />
          <Route path="/student/answer/:examId" element={<RespuestaExamen />} />
          <Route path="/student/result/:resultId" element={<VerResultado />} />

          {/* Profesor */}
          <Route path="/teacher" element={<TeacherPage />} />
          <Route path="/teacher/create-question" element={<CreateQuestion />} />
          <Route path="/teacher/create-exam" element={<CreateExam />} />
          <Route path="/teacher/select-subject" element={<SelectSubject />} />
          <Route path="/teacher/question-bank/:subject" element={<QuestionBank />} />

          {/* Analista */}
          <Route path="/analyst" element={<AnalystPage />} />

          {/* Endpoint tester */}
          <Route path="/tester" element={<EndpointTester />} />
          <Route path="/testerStudent" element={<StudentEndpointTester />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
