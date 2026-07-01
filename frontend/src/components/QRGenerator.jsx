import { useState } from 'react';
import axios from 'axios';
import { Zap, Loader, AlertCircle, Download, ArrowLeft } from 'lucide-react';

function QRGenerator({ data, onComplete, onError, onBack }) {
  const [loading, setLoading] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState(data.columns[0] || '');

  const handleGenerateQR = async () => {
    if (!selectedColumn) {
      onError('Por favor selecciona una columna');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/qr/generate-batch', {
        data: data.data,
        textColumn: selectedColumn,
      });

      onComplete(response.data);
    } catch (error) {
      onError(error.response?.data?.error || 'Error al generar códigos QR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
      >
        <ArrowLeft className="w-5 h-5" />
        Volver al paso anterior
      </button>

      {/* Configuration Card */}
      <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Configurar Generación de QR
          </h2>
          <p className="text-gray-600">
            Selecciona la columna que será codificada en los códigos QR
          </p>
        </div>

        {/* Column Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Columna para codificar en QR:
          </label>
          <select
            value={selectedColumn}
            onChange={(e) => setSelectedColumn(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">-- Selecciona una columna --</option>
            {data.columns.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
        </div>

        {/* Preview of what will be encoded */}
        {selectedColumn && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium text-blue-900">
              Se codificarán {data.data.length} códigos QR con los valores de la columna "{selectedColumn}":
            </p>
            <div className="flex flex-wrap gap-2">
              {data.data.slice(0, 5).map((row, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-white text-blue-700 text-xs rounded border border-blue-200"
                >
                  {String(row[selectedColumn] || 'vacío')}
                </span>
              ))}
              {data.data.length > 5 && (
                <span className="px-2 py-1 text-gray-500 text-xs">
                  +{data.data.length - 5} más
                </span>
              )}
            </div>
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerateQR}
          disabled={!selectedColumn || loading}
          className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            loading || !selectedColumn
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Generando {data.data.length} códigos QR...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              Generar Códigos QR
            </>
          )}
        </button>

        {/* Info */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium">Nota:</p>
            <p>
              Se generarán {data.data.length} códigos QR. Este proceso puede tomar
              unos momentos dependiendo de la cantidad de datos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QRGenerator;
