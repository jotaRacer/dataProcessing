# dataProcessing

Plataforma para procesamiento y comparación de archivos mediante algoritmos de similitud. Arquitectura desacoplada: API REST en FastAPI (Python) + SPA en React (Vite), orquestada con Docker Compose.

---

## Estructura del proyecto

```
dataProcessing/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── pyproject.toml        # Dependencias (gestionadas con uv)
│   ├── uv.lock
│   ├── main.py               # Entry point: FastAPI app + CORS + routers
│   └── routers/
│       ├── __init__.py
│       └── similarity.py     # Endpoints de similitud
└── frontend/
    ├── Dockerfile
    ├── .dockerignore
    ├── nginx.conf            # Proxy /api/ → backend en producción
    ├── vite.config.js        # Proxy /api/ → backend en desarrollo
    └── src/
        ├── services/
        │   └── api.js        # Cliente HTTP centralizado
        └── App.jsx
```

---

## Levantar el proyecto

### Con Docker (producción)

```bash
docker-compose up --build
```

| Servicio  | URL                    |
|-----------|------------------------|
| Frontend  | http://localhost:3000  |
| Backend   | http://localhost:8000  |
| API Docs  | http://localhost:8000/docs |

### En local (desarrollo)

**Backend:**
```bash
cd backend
uv run uvicorn main:app --reload
# Disponible en http://localhost:8000
```

**Frontend:**
```bash
cd frontend
npm run dev
# Disponible en http://localhost:5173
```

> En desarrollo, Vite redirige `/api/*` → `localhost:8000` automáticamente via el proxy configurado en `vite.config.js`.

---

## Cómo funciona la conexión front ↔ back

```
Frontend (React)
    │
    │  fetch('/api/similarity/compare')
    ▼
Nginx / Vite proxy
    │
    │  http://backend:8000/api/similarity/compare  (Docker)
    │  http://localhost:8000/api/similarity/compare (dev local)
    ▼
FastAPI (Python)
    │
    └── router: /api/similarity/compare  →  similarity.py
```

Todos los endpoints del backend viven bajo `/api/`. El frontend nunca apunta a una URL absoluta; siempre usa rutas relativas (`/api/...`), lo que hace que funcione igual en dev y en Docker sin cambiar ninguna configuración.

---

## Agregar un nuevo endpoint

### 1. Backend — crear el router

Crear `backend/routers/<nombre>.py`:

```python
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class MiRequest(BaseModel):
    campo_a: str
    campo_b: str


class MiResponse(BaseModel):
    resultado: float
    metodo: str


@router.post("/procesar", response_model=MiResponse)
def procesar(body: MiRequest):
    # Tu algoritmo aquí
    return MiResponse(resultado=0.95, metodo="mi_algoritmo")
```

### 2. Backend — registrar el router en `main.py`

```python
from routers import similarity, nombre   # ← importar el nuevo módulo

app.include_router(nombre.router, prefix="/api/nombre", tags=["nombre"])
```

El endpoint queda disponible en `POST /api/nombre/procesar`.

### 3. Frontend — exponer el método en `api.js`

Abrir `frontend/src/services/api.js` y agregar dentro del objeto `api`:

```js
export const api = {
  health: () => request('/health'),
  similarity: { ... },

  nombre: {
    procesar: (campo_a, campo_b) =>
      request('/nombre/procesar', {
        method: 'POST',
        body: JSON.stringify({ campo_a, campo_b }),
      }),
  },
}
```

### 4. Frontend — consumir desde un componente

```jsx
import { api } from './services/api'

async function handleProcesar() {
  const data = await api.nombre.procesar(valorA, valorB)
  console.log(data.resultado)
}
```

---

## Tecnologías

| Capa      | Tecnología         | Versión  |
|-----------|--------------------|----------|
| Backend   | Python             | 3.12     |
| Backend   | FastAPI            | 0.137+   |
| Backend   | Uvicorn            | 0.49+    |
| Backend   | uv (gestor deps)   | latest   |
| Frontend  | React              | 19       |
| Frontend  | Vite               | 8        |
| Proxy     | Nginx              | alpine   |
| Orquesta  | Docker Compose     | v2       |
