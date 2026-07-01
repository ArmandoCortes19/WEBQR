# WEBQR - Generador de Códigos QR desde Excel

## 📋 Descripción

Aplicación web para:
- 📁 Importar datos desde archivos Excel
- 🏷️ Generar códigos QR masivamente
- 📄 Crear etiquetas personalizadas en PDF o JPG

## 🚀 Características

- ✅ Carga de archivos Excel (.xlsx, .xls)
- ✅ Generación de QR automática
- ✅ Vista previa de códigos QR
- ✅ Descarga de etiquetas en PDF
- ✅ Descarga de etiquetas en JPG (individual o por página)
- ✅ Interfaz moderna y responsiva
- ✅ Almacenamiento de datos en la nube

## 📦 Tecnologías

### Backend
- Node.js + Express
- SQLite/MongoDB
- Libraries: qrcode, xlsx, pdfkit, sharp, jimp

### Frontend
- React + Vite
- TailwindCSS
- Axios para API calls

## 📖 Instalación

### Requisitos previos
- Node.js v16+
- npm o yarn

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 🔧 Configuración

Crea un archivo `.env` en la carpeta backend:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=sqlite://./data/qr.db
```

## 📚 Uso

1. Abre http://localhost:5173
2. Carga un archivo Excel con datos
3. Configura qué columnas usar para el QR
4. Genera los códigos QR
5. Elige descargar en PDF o JPG
6. Descarga las etiquetas

## 📋 Estructura del Proyecto

```
WEBQR/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── models/
│   │   └── utils/
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 📝 Licencia

MIT
