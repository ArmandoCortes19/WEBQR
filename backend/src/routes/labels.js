import express from 'express';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { createCanvas } from 'canvas';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pdfDir = path.join(__dirname, '../../pdfs');
const imagesDir = path.join(__dirname, '../../images');

[pdfDir, imagesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Generar PDF con etiquetas
router.post('/generate-pdf', async (req, res) => {
  try {
    const { data, textColumn, labelFormat = 'avery5160' } = req.body;

    if (!data || !Array.isArray(data) || !textColumn) {
      return res.status(400).json({ error: 'data array and textColumn are required' });
    }

    // Configuraciones de formato Avery 5160
    const labelConfigs = {
      avery5160: {
        pageWidth: 612,
        pageHeight: 792,
        labelWidth: 180,
        labelHeight: 180,
        columnsPerRow: 3,
        rowsPerPage: 3,
        marginLeft: 36,
        marginTop: 36,
        marginRight: 36,
        marginBottom: 36,
      },
      custom: {
        pageWidth: 612,
        pageHeight: 792,
        labelWidth: 200,
        labelHeight: 150,
        columnsPerRow: 3,
        rowsPerPage: 5,
        marginLeft: 30,
        marginTop: 30,
        marginRight: 30,
        marginBottom: 30,
      },
    };

    const config = labelConfigs[labelFormat] || labelConfigs.custom;
    const pdfFileName = `labels-${uuidv4()}.pdf`;
    const pdfPath = path.join(pdfDir, pdfFileName);

    const doc = new PDFDocument({
      size: 'LETTER',
      margin: 0,
    });

    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    let labelIndex = 0;
    let currentRow = 0;
    let currentCol = 0;

    for (const item of data) {
      const text = item[textColumn];
      if (!text) continue;

      // Si alcanzamos el máximo de etiquetas por página, crear nueva página
      if (labelIndex > 0 && labelIndex % (config.rowsPerPage * config.columnsPerRow) === 0) {
        doc.addPage();
        currentRow = 0;
        currentCol = 0;
      }

      const x = config.marginLeft + currentCol * config.labelWidth;
      const y = config.marginTop + currentRow * config.labelHeight;

      // Dibujar borde de la etiqueta
      doc.rect(x, y, config.labelWidth, config.labelHeight).stroke();

      // Generar QR en memoria
      const qrDataUrl = await QRCode.toDataURL(String(text), {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        width: 100,
        margin: 1,
      });

      // Convertir data URL a buffer
      const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, '');
      const qrBuffer = Buffer.from(base64Data, 'base64');

      // Agregar QR a la etiqueta
      const qrSize = 80;
      const qrX = x + 10;
      const qrY = y + 10;
      doc.image(qrBuffer, qrX, qrY, { width: qrSize, height: qrSize });

      // Agregar texto
      const textX = x + qrSize + 15;
      const textY = y + 15;
      const textWidth = config.labelWidth - qrSize - 25;

      doc
        .fontSize(9)
        .text(String(text), textX, textY, {
          width: textWidth,
          align: 'left',
          ellipsis: true,
        });

      currentCol++;
      if (currentCol >= config.columnsPerRow) {
        currentCol = 0;
        currentRow++;
      }
      labelIndex++;
    }

    doc.end();

    stream.on('finish', () => {
      res.json({
        success: true,
        pdfFile: pdfFileName,
        totalLabels: labelIndex,
        message: `PDF generado con ${labelIndex} etiquetas`,
      });
    });

    stream.on('error', (err) => {
      console.error('PDF generation error:', err);
      res.status(500).json({ error: 'Error generating PDF' });
    });
  } catch (error) {
    console.error('Labels error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generar JPG con etiquetas (por página)
router.post('/generate-jpg', async (req, res) => {
  try {
    const { data, textColumn, labelFormat = 'avery5160' } = req.body;

    if (!data || !Array.isArray(data) || !textColumn) {
      return res.status(400).json({ error: 'data array and textColumn are required' });
    }

    const labelConfigs = {
      avery5160: {
        pageWidth: 2550,
        pageHeight: 3300,
        labelWidth: 750,
        labelHeight: 750,
        columnsPerRow: 3,
        rowsPerPage: 3,
        marginLeft: 150,
        marginTop: 150,
        qrSize: 320,
        fontSize: 36,
        dpi: 300,
      },
      custom: {
        pageWidth: 2550,
        pageHeight: 3300,
        labelWidth: 850,
        labelHeight: 620,
        columnsPerRow: 3,
        rowsPerPage: 5,
        marginLeft: 100,
        marginTop: 100,
        qrSize: 280,
        fontSize: 32,
        dpi: 300,
      },
    };

    const config = labelConfigs[labelFormat] || labelConfigs.custom;
    const jpgFiles = [];

    let pageIndex = 0;
    let itemsProcessed = 0;
    let itemsOnCurrentPage = 0;

    const createPage = async (pageItems) => {
      const canvas = createCanvas(config.pageWidth, config.pageHeight);
      const ctx = canvas.getContext('2d');

      // Fondo blanco
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, config.pageWidth, config.pageHeight);

      let row = 0;
      let col = 0;

      for (const item of pageItems) {
        const text = item.text;
        if (!text) continue;

        const x = config.marginLeft + col * config.labelWidth;
        const y = config.marginTop + row * config.labelHeight;

        // Borde de la etiqueta
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, config.labelWidth, config.labelHeight);

        // Generar QR
        const qrDataUrl = await QRCode.toDataURL(String(text), {
          errorCorrectionLevel: 'H',
          type: 'image/png',
          width: config.qrSize / 3,
          margin: 0,
        });

        // Cargar QR en canvas
        const qrImage = await new Promise((resolve, reject) => {
          const img = new (require('canvas').Image)();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = qrDataUrl;
        });

        const qrX = x + 20;
        const qrY = y + 20;
        ctx.drawImage(qrImage, qrX, qrY, config.qrSize, config.qrSize);

        // Texto
        ctx.fillStyle = '#000000';
        ctx.font = `bold ${config.fontSize}px Arial`;
        ctx.textAlign = 'left';
        
        const textX = x + config.qrSize + 30;
        const textY = y + 60;
        const maxWidth = config.labelWidth - config.qrSize - 50;

        // Palabra por palabra para ajustar
        const words = String(text).split(' ');
        let line = '';
        let lineY = textY;

        for (const word of words) {
          const testLine = line + (line ? ' ' : '') + word;
          const metrics = ctx.measureText(testLine);
          
          if (metrics.width > maxWidth && line) {
            ctx.fillText(line, textX, lineY);
            line = word;
            lineY += config.fontSize + 10;
          } else {
            line = testLine;
          }
        }
        if (line) {
          ctx.fillText(line, textX, lineY);
        }

        col++;
        if (col >= config.columnsPerRow) {
          col = 0;
          row++;
        }
      }

      const jpgFileName = `labels-page-${pageIndex}-${uuidv4()}.jpg`;
      const jpgPath = path.join(imagesDir, jpgFileName);

      return new Promise((resolve, reject) => {
        const out = fs.createWriteStream(jpgPath);
        const stream = canvas.createJPEGStream({ quality: 0.95 });
        stream.pipe(out);
        out.on('finish', () => {
          jpgFiles.push({ fileName: jpgFileName, pageIndex });
          resolve();
        });
        out.on('error', reject);
      });
    };

    // Procesar datos
    let currentPageItems = [];
    const itemsPerPage = config.rowsPerPage * config.columnsPerRow;

    for (const item of data) {
      if (!item[textColumn]) continue;

      currentPageItems.push({ text: item[textColumn], ...item });
      itemsProcessed++;

      if (currentPageItems.length === itemsPerPage) {
        await createPage(currentPageItems);
        pageIndex++;
        currentPageItems = [];
      }
    }

    // Última página
    if (currentPageItems.length > 0) {
      await createPage(currentPageItems);
    }

    res.json({
      success: true,
      jpgFiles,
      totalPages: jpgFiles.length,
      totalItems: itemsProcessed,
      message: `${jpgFiles.length} páginas JPG generadas (${itemsProcessed} etiquetas)`,
    });
  } catch (error) {
    console.error('JPG generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Descargar PDF
router.get('/download/pdf/:fileName', (req, res) => {
  try {
    const pdfPath = path.join(pdfDir, req.params.fileName);

    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.download(pdfPath);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Descargar JPG
router.get('/download/jpg/:fileName', (req, res) => {
  try {
    const jpgPath = path.join(imagesDir, req.params.fileName);

    if (!fs.existsSync(jpgPath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.download(jpgPath);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
