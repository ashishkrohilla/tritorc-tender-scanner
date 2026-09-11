const ExcelJS = require('exceljs');

/**
 * Builds the downloadable .xlsx report — one row per scanned document.
 * @param {Array<{documentName:string, matchedKeywords:string[], matchCount:number, relevance:string}>} results
 * @returns {Promise<Buffer>}
 */
async function generateExcelReport(results) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Tritorc Tender Scanner';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Tender Scan Report');

  sheet.columns = [
    { header: 'Document Name', key: 'documentName', width: 38 },
    { header: 'Matched Keywords', key: 'matchedKeywords', width: 55 },
    { header: 'Match Count', key: 'matchCount', width: 14 },
    { header: 'Relevance to Tritorc', key: 'relevance', width: 20 },
  ];

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1F4E78' },
  };

  results.forEach((r) => {
    const row = sheet.addRow({
      documentName: r.documentName,
      matchedKeywords: r.matchedKeywords.join(', ') || '(none found)',
      matchCount: r.matchCount,
      relevance: r.relevance,
    });

    // Simple colour cue on the verdict cell
    const relevanceCell = row.getCell('relevance');
    const colorMap = { Yes: 'FFC6EFCE', Possible: 'FFFFEB9C', No: 'FFFFC7CE' };
    if (colorMap[r.relevance]) {
      relevanceCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: colorMap[r.relevance] },
      };
    }
  });

  sheet.autoFilter = { from: 'A1', to: 'D1' };

  return workbook.xlsx.writeBuffer();
}

module.exports = generateExcelReport;
