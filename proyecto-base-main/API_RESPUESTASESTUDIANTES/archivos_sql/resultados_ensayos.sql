USE BD09_RESPUESTASESTUDIANTES;

CREATE TABLE IF NOT EXISTS Ensayo (
    id_ensayo INT PRIMARY KEY,
    materia VARCHAR(100),
    n_preguntas INT
);

CREATE TABLE IF NOT EXISTS Resultado (
    id_resultado INT PRIMARY KEY,
    id_ensayo INT,
    Estudiante VARCHAR(100),
    Puntaje INT,
    Fecha DATE,
    tiempo_resolucion INT;
    FOREIGN KEY (id_ensayo) REFERENCES Ensayo(id_ensayo)
);