import { useState, useRef } from 'react';
import axios from 'axios';
import { Upload, File, AlertCircle, Loader } from 'lucide-react';

function ExcelUploader({ onComplete, onError }) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (file) => {
    if (!file) return;

    // Validar tipo de archivo
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
    ];

    if (!validTypes.includes(file.type)) {
      onError('Por favor carga un archivo Excel (.xlsx, .xls) o CSV válido');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setPreview(response.data);
      onComplete(response.data);
    } catch (error) {
      onError(error.response?.data?.error || 'Error al cargar el archivo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-indigo-300 rounded-lg p-12 text-center cursor-pointer hover:border-indigo-600 hover:bg-indigo-50 transition-all"
      >
        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader className="w-12 h-12 text-indigo-600 animate-spin" />
            <p className="text-lg font-medium text-gray-700">Cargando archivo...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Upload className="w-12 h-12 text-indigo-600" />
            <div>
              <p className="text-lg font-medium text-gray-900">
                Arrastra tu archivo Excel aquí
              </p>
              <p className="text-sm text-gray-500">o haz clic para seleccionar</p>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Formatos soportados: .xlsx, .xls, .csv
            </p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={(e) => handleFileSelect(e.target.files?.[0])}
          className="hidden"
        />
      </div>

      {/* Preview */}
      {preview && (
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4 fade-in">
          <div className="flex items-center gap-3">
            <File className="w-6 h-6 text-indigo-600" />
            <div>
              <p className="font-medium text-gray-900">{preview.fileName}</p>
              <p className="text-sm text-gray-500">
                {preview.totalRows} filas encontradas
              </p>
            </div>
          </div>

          {/* Columnas disponibles */}
          <div className="border-t pt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Columnas disponibles:
            </p>
            <div className="flex flex-wrap gap-2">
              {preview.columns.map((col) => (
                <span
                  key={col}
                  className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                >
                  {col}
                </span>
              ))}
            </div>
          </div>

          {/* Preview de datos */}
          <div className="border-t pt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Vista previa de datos:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    {preview.columns.slice(0, 5).map((col) => (
                      <th key={col} className="px-3 py-2 text-left font-medium">
                        {col}
                      </th>
                    ))}
                    {preview.columns.length > 5 && (
                      <th className="px-3 py-2 text-left text-gray-500">
                        +{preview.columns.length - 5} más
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {preview.data.slice(0, 3).map((row, idx) => (
                    <tr key={idx} className="border-t">
                      {preview.columns.slice(0, 5).map((col) => (
                        <td key={col} className="px-3 py-2 text-gray-700">
                          {String(row[col] || '-').substring(0, 20)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExcelUploader;
