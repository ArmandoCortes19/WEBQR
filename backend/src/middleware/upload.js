import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv',
  ];
  const allowedExtensions = ['.xlsx', '.xls', '.csv'];

  const ext = path.extname(file.originalname).toLowerCase();
  const isValidMime = allowedMimes.includes(file.mimetype);
  const isValidExt = allowedExtensions.includes(ext);

  if (isValidMime || isValidExt) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos Excel (.xlsx, .xls) o CSV'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export default upload;
