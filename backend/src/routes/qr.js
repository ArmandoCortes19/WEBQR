import express from 'express';
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const qrDir = path.join(__dirname, '../../qrcodes');
if (!fs.existsSync(qrDir)) {
  fs.mkdirSync(qrDir, { recursive: true });
}

// Generar QR individual
router.post('/generate', async (req, res) => {
  try {
    const { text, format = 'png' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const qrFileName = `${uuidv4()}.${format}`;
    const qrPath = path.join(qrDir, qrFileName);

    await QRCode.toFile(qrPath, text, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    // Convertir a base64 para enviar en respuesta
    const qrBase64 = fs.readFileSync(qrPath, { encoding: 'base64' });

    res.json({
      success: true,
      qrCode: `data:image/png;base64,${qrBase64}`,
      fileName: qrFileName,
    });
  } catch (error) {
    console.error('QR generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generar múltiples QR
router.post('/generate-batch', async (req, res) => {
  try {
    const { data, textColumn } = req.body;

    if (!data || !Array.isArray(data) || !textColumn) {
      return res.status(400).json({ error: 'data array and textColumn are required' });
    }

    const qrCodes = [];

    for (const item of data) {
      const text = item[textColumn];
      if (!text) continue;

      const qrFileName = `${uuidv4()}.png`;
      const qrPath = path.join(qrDir, qrFileName);

      await QRCode.toFile(qrPath, String(text), {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        width: 300,
        margin: 1,
      });

      const qrBase64 = fs.readFileSync(qrPath, { encoding: 'base64' });

      qrCodes.push({
        ...item,
        qrCode: `data:image/png;base64,${qrBase64}`,
        fileName: qrFileName,
      });
    }

    res.json({
      success: true,
      totalGenerated: qrCodes.length,
      qrCodes,
    });
  } catch (error) {
    console.error('Batch QR generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
