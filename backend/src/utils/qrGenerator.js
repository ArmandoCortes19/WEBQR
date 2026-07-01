import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

/**
 * Genera un código QR
 * @param {string} text - Texto a codificar
 * @param {Object} options - Opciones de QR
 * @returns {Promise<string>} Data URL del QR
 */
export const generateQR = async (text, options = {}) => {
  try {
    const defaultOptions = {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 1,
      width: 300,
      ...options,
    };

    const qrDataUrl = await QRCode.toDataURL(String(text), defaultOptions);
    return qrDataUrl;
  } catch (error) {
    throw new Error(`Error generando QR: ${error.message}`);
  }
};

/**
 * Genera múltiples QR en lote
 * @param {Array} data - Array de objetos con los datos
 * @param {string} textColumn - Columna a usar para el texto del QR
 * @returns {Promise<Array>} Array de códigos QR generados
 */
export const generateQRBatch = async (data, textColumn) => {
  try {
    if (!data || data.length === 0) {
      throw new Error('No hay datos para generar QR');
    }

    if (!textColumn) {
      throw new Error('Debes especificar una columna');
    }

    const qrCodes = await Promise.all(
      data.map(async (row) => {
        const text = String(row[textColumn] || '');
        const qrDataUrl = await generateQR(text);
        return {
          id: uuidv4(),
          qrDataUrl,
          text,
          originalRow: row,
        };
      })
    );

    return qrCodes;
  } catch (error) {
    throw new Error(`Error generando lote de QR: ${error.message}`);
  }
};

/**
 * Genera QR como buffer PNG
 * @param {string} text - Texto a codificar
 * @returns {Promise<Buffer>} Buffer PNG del QR
 */
export const generateQRBuffer = async (text) => {
  try {
    const buffer = await QRCode.toBuffer(String(text), {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 1,
      width: 300,
    });
    return buffer;
  } catch (error) {
    throw new Error(`Error generando buffer QR: ${error.message}`);
  }
};
