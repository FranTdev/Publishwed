# PostWeb1 Backend

Este es el backend oficial del proyecto PostWeb1, encargado de de proveer las funcionalidades completas de red social, manejar la autenticación segura, la publicación de mensajes en un muro (feed) y el sistema de comentarios con permisos propietarios.

Está desarrollado en **Python** utilizando **FastAPI** por su alto rendimiento y estructuración moderna asincrónica, operando junto a **PostgreSQL** mediante **SQLAlchemy** para el diseño de bases de datos relacionales robustas, ORM y validación de esquemas (Pydantic). 

## 🚀 Funcionalidades Completas

1. **Sistema de Autenticación**:
   - Registro de usuarios con nombres, correos electrónicos y contraseñas (hasheadas de forma segura).
   - Inicio de sesión mediante OAuth2 estándar (Login Form-Data devolviendo un `access_token` JWT cifrado).
   - Ruta segura protegida para recuperar la sesión activa del usuario.

2. **Muro de Mensajes (Feed)**:
   - Capacidad de obtener todos los mensajes publicados, de manera decendente (del más nuevo al más antiguo).
   - Publicación de un nuevo mensaje asociada irremediablemente al usuario conectado (Token/Sesión).
   - Edición o Eliminación de mensajes **(Estrictamente permitida tan solo a los dueños o autores del mensaje original)**.

3. **Sistema de Comentarios**:
   - Dejar comentarios en mensajes particulares de los usuarios.
   - Listar comentarios ordenadamente en cada hilo de mensaje.
   - Edición o Eliminación de comentarios **(Una vez más, estrictamente validadando que el ID del que ejecuta el verbo HTTP y el ID del creador coincidan)**.

4. **Diagramado Base de Datos**:
   - `users`: id, name, password_hash, email, created_at.
   - `messages`: id, user_id, message, created_at, updated_at.
   - `comments`: id, message_id, user_id, comment, created_at, updated_at.

El Backend también implementa configuraciones de CORS (`CORSMiddleware`) permitiendo explícitamente ser consumido desde el frontend (Vite React), e incorpora relaciones estrictas de bases de datos `cascade="all, delete-orphan"` asegurando la integridad de datos si un recurso grande (como un usuario) es borrado.

## 🛠️ Instalación y Uso

Se requiere contar con Python 3.10 o superior y un servidor PostgreSQL corriendo localmente o en remoto. 

1. **Instalar Dependencias**
```bash
pip install -r requirements.txt
```

2. **Variables de Entorno**
Asegúrate de tener en la raíz del backend un archivo `.env` conteniendo tus credenciales de PostgreSQL:
```env
DB_USER=postgres
DB_PASSWORD=tu_contraseña
DB_NAME=Test
DB_HOST=localhost
DB_PORT=5432
```

3. **Despliegue del Servidor**
Ejecuta tu servidor de backend expuesto localmente con recarga en caliente (en caso de realizar más desarrollos):
```bash
uvicorn app.main:app --reload
```
Por defecto, correrá en http://127.0.0.1:8000. 

## 🧪 Integración del Frontend
El Frontend asociado fue desarrollado en **React** con **Vite** y **Tailwind v4**, diseñado con un estado de Auth Global y un flujo limpio, y consume transparentemente esta API. ¡Visita la documentación generada en http://127.0.0.1:8000/docs para probar los flujos Swagger!
