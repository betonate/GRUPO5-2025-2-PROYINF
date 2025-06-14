import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import StudentPage from './pages/Student/StudentPage';
import TeacherPage from './pages/Teacher/TeacherPage';
import AnalystPage from './pages/Analyst/AnalystPage';
import SelectSubject from './pages/Teacher/SelectSubject';
import QuestionBank from './pages/Teacher/QuestionBank';
import CreateQuestion from './pages/Teacher/CreateQuestion';
import CreateExam from './pages/Teacher/CreateExam';
import EndpointTester from './test/EndpointTester';


function App() {
  return (
    <Router>
      <div style={{ padding: 20 }}>
        <h1>Plataforma PAES</h1>
        <nav style={{ marginBottom: 20 }}>
        </nav>
        <Routes>
          <Route path="/student" element={<StudentPage />} />
          <Route path="/teacher/*" element={<TeacherPage />} />
          <Route path="/analyst" element={<AnalystPage />} />
          <Route path="/teacher" element={<TeacherPage />} />
          <Route path="/teacher/create-question" element={<CreateQuestion />} />
          <Route path="/teacher/create-exam" element={<CreateExam />} />
          <Route path="/teacher/select-subject" element={<SelectSubject />} />
          <Route path="/teacher/question-bank/:subject" element={<QuestionBank />} />
          <Route path="/tester" element={<EndpointTester />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
