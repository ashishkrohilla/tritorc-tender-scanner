import React, { useState } from 'react';
import UploadForm from './components/UploadForm.jsx';
import ResultsTable from './components/ResultsTable.jsx';
import { scanDocuments, downloadExcelFromBase64 } from './api.js';

export default function App() {
  const [results, setResults] = useState([]);
  const [excelData, setExcelData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleScan(files) {
    setLoading(true);
    setError('');
    try {
      const data = await scanDocuments(files);
      setResults(data.results);
      setExcelData({ base64: data.excelBase64, fileName: data.fileName });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to scan documents. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }

  function handleDownload() {
    if (excelData) {
      downloadExcelFromBase64(excelData.base64, excelData.fileName);
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="header-mark">TT</div>
          <div>
            <h1>Tender / SOW Keyword Scanner</h1>
            <p className="subtitle">Upload tender documents to check relevance to Tritorc's bolting &amp; torque product line.</p>
            <p className="header-tag">reads PDF and DOCX, checks 20 keywords, exports a ready-to-share spreadsheet</p>
          </div>
        </div>
      </header>

      <main className="app-main">
        <UploadForm onScan={handleScan} loading={loading} />

        {error && <p className="error-text">{error}</p>}

        {results.length > 0 && (
          <>
            <div className="results-header">
              <h2>Scan Results</h2>
              <button className="download-btn" onClick={handleDownload}>
                Download Excel Report
              </button>
            </div>
            <ResultsTable results={results} />
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>Tritorc — Internal Tool Prototype</p>
      </footer>
    </div>
  );
}
