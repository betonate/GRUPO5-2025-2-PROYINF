USE BD09_RESPUESTASESTUDIANTES;

CREATE TABLE IF NOT EXISTS Resultado (
  id_resultado INT AUTO_INCREMENT PRIMARY KEY,
  id_estudiante VARCHAR(100) NOT NULL,
  id_ensayo INT NOT NULL,
  fecha DATE NOT NULL,
  tiempo_resolucion INT NOT NULL,
  puntaje INT
);

CREATE TABLE IF NOT EXISTS Respuesta (
  id_resultado INT,
  id_pregunta INT,
  respuesta_dada CHAR(1),
  PRIMARY KEY (id_resultado, id_pregunta),
  FOREIGN KEY (id_resultado) REFERENCES Resultado(id_resultado) ON DELETE CASCADE
);