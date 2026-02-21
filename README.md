# 📱 Social Feed Platform (Publishweb)

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

Una aplicación web Full-Stack moderna tipo "red social" donde los usuarios pueden registrarse, iniciar sesión de forma segura, publicar mensajes en un feed general e interactuar comentando las publicaciones de otras personas.

## 🚀 Características Principales

- **Autenticación Segura:** Registro e inicio de sesión utilizando JSON Web Tokens (JWT) y cifrado de contraseñas con bcrypt.
- **Feed Público:** Muro general donde los usuarios pueden ver y crear nuevos mensajes.
- **Interacción Social:** Sistema anidado que permite añadir, editar y eliminar comentarios en publicaciones.
- **Gestión Continua (CRUD):** Los creadores de los posts y comentarios tienen la posibilidad exclusiva de editarlos y eliminarlos.
- **Arquitectura Escalable:** Backend robusto desarrollado en FastAPI y un frontend reactivo ultrarrápido impulsado por Vite.

---

## 🛠️ Tecnologías Utilizadas

### Backend
- **Framework:** FastAPI (Python)
- **Base de Datos:** PostgreSQL
- **ORM:** SQLAlchemy
- **Autenticación:** OAuth2 con JWT (python-jose, passlib)
- **Servidor:** Uvicorn

### Frontend
- **Framework:** React.js con Vite
- **Estilos:** Tailwind CSS
- **Iconos:** Lucide React
- **Comunicación HTTP:** Fetch API manejado por funciones de utilidad (`api.js`)

---

## ⚙️ Instalación y Configuración Local

Sigue estos pasos para desplegar el proyecto en tu entorno de desarrollo local.

### Prerrequisitos
- [Python 3.10+](https://www.python.org/downloads/)
- [Node.js (v18+) y npm](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/download/) instalado y en ejecución.

### 1️⃣ Clonar el repositorio
```bash
git clone <URL_DE_TU_REPOSITORIO>
cd PostWeb1
```

### 2️⃣ Configuración del Backend

Abre una terminal y dirígete a la carpeta del backend:
```bash
cd backend
```

1. **Crear e inicializar el entorno virtual:**
```bash
python -m venv venv
```
*(En Windows)*: `.\venv\Scripts\activate`
*(En Mac/Linux)*: `source venv/bin/activate`

2. **Instalar dependencias:**
```bash
pip install -r requirements.txt
```

3. **Configurar las Variables de Entorno (.env):**
Crea un archivo `.env` en la raíz de la carpeta `backend` configurado con tus credenciales de PostgreSQL. Por ejemplo:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_contraseña_aqui
DB_NAME=postweb_db
```
*(Recuerda crear la base de datos `postweb_db` previamente en tu servidor PostgreSQL, las tablas se generarán solas).*

4. **Arrancar el servidor:**
```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
El servidor backend ahora estará corriendo en `http://127.0.0.1:8000`. Puedes acceder a la documentación interactiva (Swagger) entrando a `http://127.0.0.1:8000/docs`.

### 3️⃣ Configuración del Frontend

Abre **otra** pestaña en tu terminal y dirígete a la carpeta del frontend:
```bash
cd ../frontend
```

1. **Instalar los paquetes de dependencias:**
```bash
npm install
```

2. **Arrancar el entorno de desarrollo:**
```bash
npm run dev
```

El frontend de React ahora estará corriendo en `http://localhost:5173`. Navega a ese enlace en tu explorador.

---

## 🏗️ Estructura del Proyecto

```text
PostWeb1/
│
├── backend/                  # Servidor y base de datos
│   ├── app/
│   │   ├── auth.py           # Configuración de hashing y tokens JWT
│   │   ├── crud.py           # Consultas e inserciones directas a BD
│   │   ├── database.py       # Conexión principal postgres y SQLAlchemy
│   │   ├── main.py           # Punto de entrada de FastAPI y rutas endpoints
│   │   ├── models.py         # Tablas relacionales SQLAlchemy
│   │   └── schemas.py        # Validaciones de request/response en Pydantic
│   ├── requirements.txt      # Paquetes de Python
│   └── .env                  # (Generado por el usuario) Credenciales DB
│
└── frontend/                 # Interfaz de Usuario
    ├── src/
    │   ├── lib/
    │   │   └── api.js        # Lógica centralizada de peticiones Fetch/API
    │   ├── pages/
    │   │   ├── Login.jsx     # Interfaz de Ingreso y Registro
    │   │   └── Feed.jsx      # Panel general de mensajes interactivo
    │   ├── App.jsx           # Enrutamiento React (React Router)
    │   └── main.jsx          # Punto de anclaje de React DOM
    ├── package.json          # Paquetes de Node y scripts
    └── tailwind.config.js    # Módulos y estilos generales
```

---

## 🤝 Contribuciones

Si deseas realizar una mejora técnica en el código de este repositorio, siéntete libre de crear un "Fork" y someter tu "Pull Request". ¡Cualquier cambio constructivo es completamente bienvenido!

---
*Hecho por [Tu Nombre] - Creado para dominar la versatilidad de FastAPI + React.*
