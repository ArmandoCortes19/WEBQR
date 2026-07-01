# Frontend - WEBQR

Interfaz web moderna para generar códigos QR masivos desde archivos Excel y crear etiquetas personalizadas.

## 📋 Características

- **Carga de archivos Excel**: Soporta .xlsx, .xls y .csv
- **Generación de QR en lote**: Crea múltiples códigos QR simultáneamente
- **Configuración flexible**: Personaliza tamaños, fuentes y formatos
- **Múltiples formatos de salida**: PDF, PNG e SVG
- **Interfaz intuitiva**: Diseño moderno y responsivo con Tailwind CSS
- **Vista previa en tiempo real**: Visualiza cambios antes de descargar

## 🛠️ Stack Tecnológico

- **React 18**: Biblioteca de UI
- **Vite**: Empaquetador moderno
- **Tailwind CSS**: Estilos utilitarios
- **Axios**: Cliente HTTP
- **Lucide Icons**: Iconografía moderna

## 📁 Estructura de Carpetas

```
frontend/
├── src/
│   ├── components/
│   │   ├── ExcelUploader.jsx      # Componente de carga de archivos
│   │   ├── QRGenerator.jsx        # Configuración de generación QR
│   │   └── LabelCreator.jsx       # Creador de etiquetas
│   ├── App.jsx                    # Componente principal
│   ├── main.jsx                   # Entrada de React
│   └── index.css                  # Estilos globales
├── index.html                     # HTML principal
├── package.json                   # Dependencias
├── vite.config.js                 # Configuración de Vite
└── tailwind.config.js             # Configuración de Tailwind
```

## 🚀 Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Compilar para producción
npm run build

# Vista previa de build
npm run preview
```

## 📦 Componentes

### ExcelUploader
Permite cargar archivos Excel y visualizar los datos:
- Validación de formato de archivo
- Preview de columnas disponibles
- Vista previa de primeros registros

**Props:**
- `onComplete`: Callback cuando se carga archivo exitosamente
- `onError`: Callback para errores

### QRGenerator
Configura la generación de códigos QR:
- Selecciona la columna para codificar
- Visualiza preview de valores a codificar
- Genera múltiples QR simultáneamente

**Props:**
- `data`: Datos del archivo cargado
- `onComplete`: Callback con QR generados
- `onError`: Callback para errores
- `onBack`: Volver al paso anterior

### LabelCreator
Crea y descarga etiquetas personalizadas:
- Selecciona formato (PDF, PNG, SVG)
- Configura dimensiones de etiquetas
- Personaliza tamaño de QR
- Opción de mostrar texto
- Vista previa en tiempo real
- Descarga etiquetas

**Props:**
- `qrData`: Códigos QR generados
- `originalData`: Datos originales del Excel
- `onError`: Callback para errores
- `onReset`: Volver al inicio

## 🎨 Estilos

Usa Tailwind CSS para estilos consistentes. Colores principales:
- Indigo: `#4f46e5` - Acciones principales
- Verde: `#22c55e` - Confirmaciones
- Rojo: `#ef4444` - Errores
- Gris: `#6b7280` - Textos secundarios

## 🔌 APIs Esperadas

El frontend espera los siguientes endpoints:

- `POST /api/upload` - Carga y procesa archivo Excel
- `POST /api/qr/generate-batch` - Genera códigos QR en lote
- `POST /api/labels/generate` - Genera y descarga etiquetas

## 📱 Responsividad

- Diseño mobile-first
- Breakpoints: sm, md, lg, xl, 2xl
- Adaptativo para pantallas pequeñas

## 🔧 Variables de Entorno

Crea un archivo `.env` en la raíz del frontend:

```env
VITE_API_URL=http://localhost:3000
```

## 📝 Notas de Desarrollo

- Usa componentes funcionales con Hooks
- Manejo de estado con `useState`
- Efectos con `useEffect`
- Referencias con `useRef`
- Validación de entrada en cliente y servidor

## 🐛 Debugging

- Abre DevTools: F12
- Inspecciona network para ver requests
- Usa console para logs
- Verifica componentes en React DevTools

## 📚 Recursos Útiles

- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Vite Guide](https://vitejs.dev)
- [Axios Documentation](https://axios-http.com)
- [Lucide Icons](https://lucide.dev)
