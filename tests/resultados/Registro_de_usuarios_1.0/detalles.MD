Dentro de los 2 test realizados y solicitados por endpoint, para este endpoint se obtuve un error en el segundo test, puesto a que se deberia 

| Caso de prueba | Input       | Salida Esperada | Contexto de Ejecución |
| -------------- | ----------- | --------------- | --------------------- |
| #1             | Crear un usuario correctamente | Crea el usuario correctamente y se recibe el codigo HTTP 201 | Se revisa que los datos rellenados por el formulario esten dentro de las clases de equivalencia validas |
| #2             | Crear usuario con un email invalido | El formulario rechaza el correo devolviendo un error HTTP 400 | Se revisa que el formulario sea capaz de detectar correos que tengan un formato invalido (Ejemplo: El correo no tiene un "@")|
