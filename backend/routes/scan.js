const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const extractText = require('../utils/extractText');
const { matchKeywords, getRelevance } = require('../utils/keywordMatch');
const generateExcelReport = require('../utils/generateExcel');

const router = express.Router();

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  dest: uploadDir,
  fileFilter: (req, file, cb) => {
    const allowedExt = ['.pdf', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExt.includes(ext)) {
      return cb(new Error('Only PDF and DOCX files are allowed'));
    }
    cb(null, true);
  },
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB per file
});

// POST /api/scan  (multipart/form-data, field name: "documents")
router.post('/', upload.array('documents', 10), async (req, res) => {
  try {
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded. Attach at least one PDF or DOCX.' });
    }

    const results = [];

    for (const file of files) {
      try {
        const text = await extractText(file.path, file.originalname);
        const matchedKeywords = matchKeywords(text);
        const matchCount = matchedKeywords.length;
        const relevance = getRelevance(matchCount);

        results.push({
          documentName: file.originalname,
          matchedKeywords,
          matchCount,
          relevance,
        });
      } catch (err) {
        results.push({
          documentName: file.originalname,
          matchedKeywords: [],
          matchCount: 0,
          relevance: 'Error',
          error: err.message,
        });
      } finally {
        fs.unlink(file.path, () => {});
      }
    }

    const excelBuffer = await generateExcelReport(results);

    res.json({
      results,
      excelBase64: excelBuffer.toString('base64'),
      fileName: `Tender_Scan_Report_${Date.now()}.xlsx`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong while scanning the documents.' });
  }
});

module.exports = router;
