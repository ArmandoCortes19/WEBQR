import XLSX from 'xlsx';

/**
 * Parsea un archivo Excel y retorna los datos
 * @param {Buffer} fileBuffer - Buffer del archivo
 * @returns {Object} { columns: string[], data: any[] }
 */
export const parseExcel = (fileBuffer) => {
  try {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      throw new Error('El archivo Excel está vacío');
    }

    const columns = Object.keys(data[0]);

    return {
      columns,
      data,
      sheetName,
      rowCount: data.length,
    };
  } catch (error) {
    throw new Error(`Error al procesar el archivo Excel: ${error.message}`);
  }
};

/**
 * Valida el archivo subido
 * @param {Object} file - Objeto de archivo de multer
 * @returns {boolean}
 */
export const isValidExcelFile = (file) => {
  const validMimes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv',
  ];
  return validMimes.includes(file.mimetype) || file.originalname.match(/\.(xlsx|xls|csv)$/i);
};
