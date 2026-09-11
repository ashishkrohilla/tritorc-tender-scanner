import React, { useRef, useState } from 'react';

const ALLOWED_TYPES = ['.pdf', '.docx'];

function isAllowed(file) {
  const name = file.name.toLowerCase();
  return ALLOWED_TYPES.some((ext) => name.endsWith(ext));
}

export default function UploadForm({ onScan, loading }) {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  function addFiles(fileList) {
    const incoming = Array.from(fileList);
    const rejected = incoming.filter((f) => !isAllowed(f));
    const accepted = incoming.filter(isAllowed);

    if (rejected.length > 0) {
      setError(`Skipped unsupported file(s): ${rejected.map((f) => f.name).join(', ')}. Only PDF/DOCX allowed.`);
    } else {
      setError('');
    }

    setFiles((prev) => [...prev, ...accepted]);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragActive(false);
    addFiles(e.dataTransfer.files);
  }

  function removeFile(index) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (files.length === 0) {
      setError('Please add at least one PDF or DOCX file.');
      return;
    }
    onScan(files);
  }

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <div
        className={`dropzone ${dragActive ? 'dropzone-active' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <p className="dropzone-title">Drag &amp; drop tender/SOW files here</p>
        <p className="dropzone-subtitle">or click to browse (.pdf / .docx)</p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx"
          multiple
          hidden
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {error && <p className="error-text">{error}</p>}

      {files.length > 0 && (
        <ul className="file-list">
          {files.map((file, i) => (
            <li key={`${file.name}-${i}`}>
              <span>{file.name}</span>
              <button type="button" className="remove-btn" onClick={() => removeFile(i)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <button type="submit" className="scan-btn" disabled={loading}>
        {loading ? 'Scanning…' : `Scan ${files.length > 0 ? `(${files.length})` : ''}`}
      </button>
    </form>
  );
}
