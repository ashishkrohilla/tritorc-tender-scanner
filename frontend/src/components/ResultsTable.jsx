import React from 'react';

const relevanceClass = {
  Yes: 'badge badge-yes',
  Possible: 'badge badge-possible',
  No: 'badge badge-no',
  Error: 'badge badge-error',
};

export default function ResultsTable({ results }) {
  if (!results || results.length === 0) return null;

  return (
    <div className="results-wrapper">
      <table className="results-table">
        <thead>
          <tr>
            <th>Document Name</th>
            <th>Matched Keywords</th>
            <th>Match Count</th>
            <th>Relevance to Tritorc</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r, i) => (
            <tr key={i}>
              <td data-label="Document Name">{r.documentName}</td>
              <td data-label="Matched Keywords">
                {r.matchedKeywords.length > 0 ? r.matchedKeywords.join(', ') : '(none found)'}
              </td>
              <td data-label="Match Count">{r.matchCount}</td>
              <td data-label="Relevance to Tritorc">
                <span className={relevanceClass[r.relevance] || 'badge'}>{r.relevance}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
