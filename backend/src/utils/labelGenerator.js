import PDFDocument from 'pdfkit';
import JSZip from 'jszip';
import QRCode from 'qrcode';
import sharp from 'sharp';

/**
 * Genera etiquetas en formato PDF
 * @param {Array} qrCodes - Array de códigos QR
 * @param {Array} data - Datos originales
 * @param {Object} config - Configuración de etiquetas
 * @returns {Promise<Buffer>} Buffer del PDF
 */
export const generateLabelsPDF = async (qrCodes, data, config) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: [config.labelWidth * 2.834645669, config.labelHeight * 2.834645669],
        margin: 10,
        orientation: config.orientation === 'landscape' ? 'l' : 'p',
      });

      const buffers = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });

      // Agregar etiquetas
      for (let i = 0; i < qrCodes.length; i++) {
        if (i > 0) doc.addPage();

        const qr = qrCodes[i];
        const row = data[i];

        // QR Code
        const qrBuffer = await QRCode.toBuffer(qr.text, {
          errorCorrectionLevel: 'H',
          type: 'image/png',
          width: config.qrSize * 2.834645669,
        });

        const qrSize = config.qrSize * 2.834645669;
        const pageWidth = config.labelWidth * 2.834645669;
        const qrX = (pageWidth - qrSize) / 2;

        doc.image(qrBuffer, qrX, 20, { width: qrSize });

        // Text
        if (config.showText && config.textColumn) {
          const textY = 20 + qrSize + 10;
          const text = String(row[config.textColumn] || '');

          doc.fontSize(config.fontSize);
          doc.text(text, 10, textY, {
            width: pageWidth - 20,
            align: 'center',
          });
        }
      }

      doc.end();
    } catch (error) {
      reject(new Error(`Error generando PDF: ${error.message}`));
    }
  });
};

/**
 * Genera etiquetas en formato PNG (múltiples archivos en ZIP)
 * @param {Array} qrCodes - Array de códigos QR
 * @param {Array} data - Datos originales
 * @param {Object} config - Configuración de etiquetas
 * @returns {Promise<Buffer>} Buffer del ZIP
 */
export const generateLabelsPNG = async (qrCodes, data, config) => {
  try {
    const zip = new JSZip();

    for (let i = 0; i < qrCodes.length; i++) {
      const qr = qrCodes[i];
      const row = data[i];

      // Crear imagen PNG
      let imageData = await QRCode.toBuffer(qr.text, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        width: config.qrSize * 4,
      });

      // Si hay que mostrar texto, agregarlo a la imagen
      if (config.showText && config.textColumn) {
        const text = String(row[config.textColumn] || '');
        const textHeight = 50;
        const totalHeight = config.qrSize * 4 + textHeight;

        // Crear imagen con texto
        const svg = `
          <svg width="${config.qrSize * 4}" height="${totalHeight}" xmlns="http://www.w3.org/2000/svg">
            <image width="${config.qrSize * 4}" height="${config.qrSize * 4}" href="data:image/png;base64,${imageData.toString('base64')}" />
            <text x="${config.qrSize * 2}" y="${config.qrSize * 4 + 30}" font-size="${config.fontSize * 2}" text-anchor="middle" font-family="Arial">${text}</text>
          </svg>
        `;

        imageData = await sharp(Buffer.from(svg)).png().toBuffer();
      }

      const filename = `etiqueta_${i + 1}_${qr.text}.png`;
      zip.file(filename, imageData);
    }

    return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  } catch (error) {
    throw new Error(`Error generando PNG: ${error.message}`);
  }
};

/**
 * Genera etiquetas en formato SVG
 * @param {Array} qrCodes - Array de códigos QR
 * @param {Array} data - Datos originales
 * @param {Object} config - Configuración de etiquetas
 * @returns {Promise<Buffer>} Buffer del SVG
 */
export const generateLabelsSVG = async (qrCodes, data, config) => {
  try {
    let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${config.labelWidth} ${config.labelHeight}">
`;

    for (let i = 0; i < qrCodes.length; i++) {
      const qr = qrCodes[i];
      const row = data[i];

      // Crear QR SVG
      const qrBuffer = await QRCode.toBuffer(qr.text, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
      });

      svgContent += `
  <!-- Etiqueta ${i + 1} -->
  <g>
    <image x="${(config.labelWidth - config.qrSize) / 2}" y="10" width="${config.qrSize}" height="${config.qrSize}" href="data:image/png;base64,${qrBuffer.toString('base64')}" />
`;

      if (config.showText && config.textColumn) {
        const text = String(row[config.textColumn] || '');
        svgContent += `
    <text x="${config.labelWidth / 2}" y="${20 + config.qrSize + 10}" font-size="${config.fontSize}" text-anchor="middle" font-family="Arial">${text}</text>
`;
      }

      svgContent += `
  </g>
`;
    }

    svgContent += `
</svg>
`;

    return Buffer.from(svgContent);
  } catch (error) {
    throw new Error(`Error generando SVG: ${error.message}`);
  }
};
