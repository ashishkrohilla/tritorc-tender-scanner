const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Extracts raw text from a PDF or DOCX file on disk.
 * @param {string} filePath - path to the uploaded (temp) file
 * @param {string} originalName - original filename, used to detect extension
 * @returns {Promise<string>} extracted plain text
 */
async function extractText(filePath, originalName) {
  const ext = path.extname(originalName).toLowerCase();
  const buffer = fs.readFileSync(filePath);

  if (ext === '.pdf') {
    const data = await pdfParse(buffer);
    return data.text || '';
  }

  if (ext === '.docx') {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || '';
  }

  throw new Error(`Unsupported file type: ${ext}. Only .pdf and .docx are supported.`);
}

module.exports = extractText;
