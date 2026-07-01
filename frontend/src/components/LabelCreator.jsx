import { useState } from 'react';
import axios from 'axios';
import { Download, Loader, AlertCircle, Tag, RotateCcw } from 'lucide-react';

function LabelCreator({ qrData, originalData, onError, onReset }) {
  const [loading, setLoading] = useState(false);
  const [format, setFormat] = useState('pdf'); // pdf, png, svg
  const [labelConfig, setLabelConfig] = useState({
    labelWidth: 100,
    labelHeight: 100,
    qrSize: 80,
    showText: true,
    textColumn: originalData?.columns[0] || '',
    fontSize: 12,
    orientation: 'portrait',
  });

  const handleDownload = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        '/api/labels/generate',
        {
          qrData: qrData.qrCodes,
          originalData: originalData.data,
          config: labelConfig,
          format,
        },
        {
          responseType: 'blob',
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `etiquetas_qr.${format === 'pdf' ? 'pdf' : format === 'png' ? 'zip' : 'svg'}`
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      onError(error.response?.data?.error || 'Error al descargar etiquetas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Configurar Etiquetas
            </h2>

            {/* Format Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Formato de salida:
              </label>
              <div className="flex gap-3">
                {[
                  { id: 'pdf', label: 'PDF (Recomendado para imprimir)', icon: '📄' },
                  { id: 'png', label: 'PNG (Imágenes individuales)', icon: '🖼️' },
                  { id: 'svg', label: 'SVG (Vectorial)', icon: '📐' },
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    onClick={() => setFormat(fmt.id)}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                      format === fmt.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {fmt.icon} {fmt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dimensions */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Ancho etiqueta (mm):
                </label>
                <input
                  type="number"
                  value={labelConfig.labelWidth}
                  onChange={(e) =>
                    setLabelConfig({
                      ...labelConfig,
                      labelWidth: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Alto etiqueta (mm):
                </label>
                <input
                  type="number"
                  value={labelConfig.labelHeight}
                  onChange={(e) =>
                    setLabelConfig({
                      ...labelConfig,
                      labelHeight: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* QR Size */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Tamaño QR (mm):
              </label>
              <input
                type="number"
                value={labelConfig.qrSize}
                onChange={(e) =>
                  setLabelConfig({
                    ...labelConfig,
                    qrSize: parseInt(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="range"
                min="20"
                max="150"
                value={labelConfig.qrSize}
                onChange={(e) =>
                  setLabelConfig({
                    ...labelConfig,
                    qrSize: parseInt(e.target.value),
                  })
                }
                className="w-full"
              />
            </div>

            {/* Text Configuration */}
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={labelConfig.showText}
                  onChange={(e) =>
                    setLabelConfig({
                      ...labelConfig,
                      showText: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  Mostrar texto bajo QR
                </span>
              </label>
            </div>

            {labelConfig.showText && (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Columna para mostrar como texto:
                  </label>
                  <select
                    value={labelConfig.textColumn}
                    onChange={(e) =>
                      setLabelConfig({
                        ...labelConfig,
                        textColumn: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    {originalData?.columns.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Tamaño de fuente (pt):
                  </label>
                  <input
                    type="number"
                    value={labelConfig.fontSize}
                    onChange={(e) =>
                      setLabelConfig({
                        ...labelConfig,
                        fontSize: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </>
            )}

            {/* Orientation */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Orientación:
              </label>
              <div className="flex gap-3">
                {[
                  { id: 'portrait', label: '📄 Vertical' },
                  { id: 'landscape', label: '📋 Horizontal' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() =>
                      setLabelConfig({
                        ...labelConfig,
                        orientation: opt.id,
                      })
                    }
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                      labelConfig.orientation === opt.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Información:</p>
              <p>
                Se generarán {qrData.qrCodes.length} etiquetas con códigos QR.
                Puedes ajustar el tamaño y formato según tus necesidades de impresión.
              </p>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4 h-fit sticky top-6">
          <h3 className="text-lg font-bold text-gray-900">Vista Previa</h3>

          {/* Preview Label */}
          <div
            style={{
              width: `${Math.min(labelConfig.labelWidth * 2.5, 200)}px`,
              height: `${Math.min(labelConfig.labelHeight * 2.5, 200)}px`,
              border: '2px solid #ddd',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              padding: '8px',
            }}
            className="mx-auto bg-gray-50 rounded"
          >
            {/* QR Preview */}
            <div
              style={{
                width: `${Math.min(labelConfig.qrSize * 2.5, 120)}px`,
                height: `${Math.min(labelConfig.qrSize * 2.5, 120)}px`,
              }}
              className="bg-gradient-to-br from-gray-200 to-gray-300 rounded flex items-center justify-center"
            >
              <div className="text-xs text-gray-500">QR</div>
            </div>

            {/* Text Preview */}
            {labelConfig.showText && (
              <div
                style={{ fontSize: `${labelConfig.fontSize * 0.8}px` }}
                className="text-xs text-gray-600 text-center line-clamp-2 max-w-full"
              >
                Texto aquí
              </div>
            )}
          </div>

          <div className="space-y-2 text-xs text-gray-600">
            <p>
              <strong>Tamaño:</strong> {labelConfig.labelWidth}mm × {labelConfig.labelHeight}mm
            </p>
            <p>
              <strong>QR:</strong> {labelConfig.qrSize}mm
            </p>
            <p>
              <strong>Formato:</strong> {format.toUpperCase()}
            </p>
            <p>
              <strong>Etiquetas:</strong> {qrData.qrCodes.length}
            </p>
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              loading
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Descargar Etiquetas
              </>
            )}
          </button>

          {/* Reset Button */}
          <button
            onClick={onReset}
            className="w-full flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all"
          >
            <RotateCcw className="w-5 h-5" />
            Comenzar de nuevo
          </button>
        </div>
      </div>
    </div>
  );
}

export default LabelCreator;
