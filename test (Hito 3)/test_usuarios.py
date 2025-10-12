# tests/test.py

import unittest
import requests
import json
import time

USUARIOS_URL = "http://127.0.0.1:8082/usuarios"


class TestUsuariosAPI(unittest.TestCase):
    """Clase de pruebas para el endpoint de Usuarios."""

    @classmethod
    def setUpClass(cls):
        print("\nIniciando pruebas para el endpoint de Usuarios...")
        cls.usuarios_url = USUARIOS_URL

    @classmethod
    def tearDownClass(cls):
        print("Finalizando pruebas para el endpoint de Usuarios.")

    def test_1_crear_usuario_exitoso(self):
        """Prueba la creación de un nuevo usuario con datos válidos."""
        unique_email = f"jorge.valido_{int(time.time())}@mail.com"
        
        payload = {
            "id_usuario": unique_email,
            "nombre_completo": "Jorge de Prueba",
            "contrasena": "PasswordValida123!",
            "rol": "estudiante",
            "id_institucion": "col_sanjuan_01" 
        }
        headers = {'Content-Type': 'application/json'}
        
        response = requests.post(self.usuarios_url, data=json.dumps(payload), headers=headers)
        
        self.assertEqual(response.status_code, 201, f"Error: Se esperaba 201 pero se obtuvo {response.status_code}. Respuesta: {response.text}")
        print("test_1_crear_usuario_exitoso: [PASS]")

    def test_2_crear_usuario_email_invalido(self):
        """Prueba la creación de un usuario con un formato de correo electrónico incorrecto."""
        unique_email = f"jorge.invalido_{int(time.time())}mailcom"
        
        payload = {
            "id_usuario": unique_email, 
            "nombre_completo": "Jorge de Prueba",
            "contrasena": "PasswordValida123!",
            "rol": "estudiante",
            "id_institucion": "col_sanjuan_01"
        }
        headers = {'Content-Type': 'application/json'}

        response = requests.post(self.usuarios_url, data=json.dumps(payload), headers=headers)
        
        self.assertEqual(response.status_code, 400, f"Error: Se esperaba 400 (o un error) pero se obtuvo {response.status_code}. Respuesta: {response.text}")
        print("test_2_crear_usuario_email_invalido: [PASS]")

if __name__ == '__main__':
    unittest.main()