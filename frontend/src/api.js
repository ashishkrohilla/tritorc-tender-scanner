import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export async function scanDocuments(files) {
  const formData = new FormData();
  files.forEach((file) => formData.append('documents', file));

  const response = await axios.post(`${API_BASE_URL}/api/scan`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data; // { results, excelBase64, fileName }
}

export function downloadExcelFromBase64(base64, fileName) {
  const byteChars = atob(base64);
  const byteNumbers = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName || 'Tender_Scan_Report.xlsx';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
