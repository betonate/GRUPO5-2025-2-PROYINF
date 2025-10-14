Dentro de los 2 test realizados y solicitados por endpoint, para este endpoint se obtuve un error en el segundo test, puesto a que se espera que el formulario no permita colocar alternativas repetidas, cosa que termino pasando finalmente.

| Caso de prueba | Input       | Salida Esperada | Contexto de Ejecución |
| -------------- | ----------- | --------------- | --------------------- |
| #1             | Crear una pregunta en el formato correcto | Se crea la pregunta y se devuelve el codigo HTTP 201 | Se prueba que el sistema pueda crear la pregunta y almacenarla correctamente en la BD |

| #2             | Crear pregunta con alternativas repetidas | El sistema avisa que 2 alternativas son las mismas, por ende, estan repetidas y retorna HTTP 409 | Se revisa que el sistema sea capaz de detectar inputs repetidos y devuelva error |
