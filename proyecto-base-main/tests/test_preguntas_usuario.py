import unittest
import requests
import json
import time

PREGUNTAS_URL = "http://127.0.0.1:8080/preguntas"

class TestPreguntasAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        print("\nIniciando pruebas para el endpooint de Preguntas")
        cls.preguntas_url = PREGUNTAS_URL

    @classmethod
    def tearDownClass(cls):
        print("Finalizando pruebas para el endpoint de Preguntas.")

    def test_1_crear_preguntas_exitosa(self):
        
        payload = {
            "enunciado": "¿En que año Cristóbal Colón llegó a América?",
            "opcion_a": "1492",
            "opcion_b": "1500",
            "opcion_c": "1510",
            "opcion_d": "1990",
            "opcion_e": "1889",
            "respuesta_correcta": "a",
            "id_materia": "his",
            "eje_tematico": "Historia Universal",
            "dificultad": 3
        }
        headers = {'Content-Type': 'application/json'}
        response = requests.post(self.preguntas_url, data=json.dumps(payload), headers=headers)
        self.assertEqual(response.status_code, 201, f"Error: Se esperaba 201 pero se obtuvo {response.status_code}. Respuesta: {response.text}")
        print("test_1_crear_pregunta_exitosa: [PASS]")
    def test_2_crear_alternativa_repetida(self):
        payload = {
            "enunciado": "¿En que año Chile gaó la copa america?",
            "opcion_a": "2001",
            "opcion_b": "2011",
            "opcion_c": "1990",
            "opcion_d": "2015",
            "opcion_e": "2015",
            "respuesta_correcta": "d",
            "id_materia": "his",
            "eje_tematico": "Historia Universal",
            "dificultad": 3
        }
        headers = {'Content-Type': 'application/json'}
        response = requests.post(self.preguntas_url, data=json.dumps(payload), headers=headers)
        self.assertEqual(response.status_code, 409, f"Error: Se esperaba 409 (Conflicto) pero se obtuvo {response.status_code}. Respuesta: {response.text}")
        print("test_2_crear_pregunta_repetida: [PRUEBA DE DEFECTO EXITOSA]")
if __name__ == '__main__':
    unittest.main()