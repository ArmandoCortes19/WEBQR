import { useState } from 'react';
import { Upload, Zap, Tag, Download, AlertCircle, CheckCircle } from 'lucide-react';
import ExcelUploader from './components/ExcelUploader';
import QRGenerator from './components/QRGenerator';
import LabelCreator from './components/LabelCreator';

function App() {
  const [step, setStep] = useState('upload'); // upload, generate, labels
  const [uploadedData, setUploadedData] = useState(null);
  const [generatedQRs, setGeneratedQRs] = useState(null);
  const [message, setMessage] = useState(null);

  const handleUploadComplete = (data) => {
    setUploadedData(data);
    setStep('generate');
    showMessage('Archivo cargado correctamente', 'success');
  };

  const handleQRGenerated = (qrData) => {
    setGeneratedQRs(qrData);
    setStep('labels');
    showMessage('Códigos QR generados correctamente', 'success');
  };

  const handleReset = () => {
    setStep('upload');
    setUploadedData(null);
    setGeneratedQRs(null);
  };

  const showMessage = (text, type = 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">WEBQR</h1>
            </div>
            <p className="text-gray-600">Generador de Códigos QR desde Excel</p>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {[
              { id: 'upload', label: 'Cargar Excel', icon: Upload },
              { id: 'generate', label: 'Generar QR', icon: Zap },
              { id: 'labels', label: 'Crear Etiquetas', icon: Tag },
            ].map((s, idx) => {
              const Icon = s.icon;
              const isActive = step === s.id;
              const isCompleted =
                (s.id === 'upload' && uploadedData) ||
                (s.id === 'generate' && generatedQRs) ||
                false;

              return (
                <div key={s.id} className="flex items-center flex-1">
                  <button
                    onClick={() => {
                      if (s.id === 'upload' || isCompleted) setStep(s.id);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white'
                        : isCompleted
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {s.label}
                  </button>
                  {idx < 2 && (
                    <div className="flex-1 h-1 mx-2 bg-gray-200 rounded">
                      {isCompleted && (
                        <div className="h-full bg-green-500 rounded"></div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div
            className={`flex items-center gap-3 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-100 text-green-800'
                : message.type === 'error'
                ? 'bg-red-100 text-red-800'
                : 'bg-blue-100 text-blue-800'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{message.text}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {step === 'upload' && (
          <ExcelUploader
            onComplete={handleUploadComplete}
            onError={(err) => showMessage(err, 'error')}
          />
        )}

        {step === 'generate' && uploadedData && (
          <QRGenerator
            data={uploadedData}
            onComplete={handleQRGenerated}
            onError={(err) => showMessage(err, 'error')}
            onBack={() => setStep('upload')}
          />
        )}

        {step === 'labels' && generatedQRs && (
          <LabelCreator
            qrData={generatedQRs}
            originalData={uploadedData}
            onError={(err) => showMessage(err, 'error')}
            onReset={handleReset}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p>© 2024 WEBQR. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
