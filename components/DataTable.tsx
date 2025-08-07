
import React, { useState, useCallback } from 'react';
import type { TableData } from '../types';
import ClipboardIcon from './icons/ClipboardIcon';
import CheckIcon from './icons/CheckIcon';

interface DataTableProps {
  data: TableData;
  onReset: () => void;
}

const DataTable: React.FC<DataTableProps> = ({ data, onReset }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (!data || data.length === 0) return;

    const tsvData = data.map(row => row.join('\t')).join('\n');
    navigator.clipboard.writeText(tsvData).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  }, [data]);
  
  if (!data || data.length === 0) {
    return null;
  }

  const headers = data[0];
  const rows = data.slice(1);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Extracted Data</h2>
        <div className="flex space-x-2">
            <button
              onClick={handleCopy}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
            >
              {isCopied ? (
                <CheckIcon className="w-5 h-5 mr-2" />
              ) : (
                <ClipboardIcon className="w-5 h-5 mr-2" />
              )}
              {isCopied ? 'Copied!' : 'Copy for Spreadsheet'}
            </button>
            <button
                onClick={onReset}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-all duration-200"
            >
                Start Over
            </button>
        </div>
      </div>
      <div className="overflow-x-auto max-h-[60vh] rounded-md border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
       {rows.length === 0 && (
         <div className="text-center py-10 text-gray-500">
            <p>No data rows were extracted from the image.</p>
            <p className="text-sm">Only headers were found.</p>
         </div>
       )}
    </div>
  );
};

export default DataTable;
