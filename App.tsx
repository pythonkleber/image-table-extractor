
import React, { useState, useCallback } from 'react';
import ImageUploader from './components/ImageUploader';
import DataTable from './components/DataTable';
import { extractTableFromImage } from './services/geminiService';
import type { TableData } from './types';

const App: React.FC = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [tableData, setTableData] = useState<TableData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const resetState = useCallback(() => {
    setImagePreview(null);
    setTableData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  const handleImageSelect = useCallback(async (file: File) => {
    resetState();
    setIsLoading(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const data = await extractTableFromImage(file);
      setTableData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [resetState]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <main className="max-w-7xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">
            Image Table Extractor
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-600">
            Instantly convert tables from images into spreadsheet-ready data.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Column: Uploader & Image Preview */}
          <div className="space-y-6 lg:sticky lg:top-8">
            <h2 className="text-2xl font-semibold text-gray-800">1. Upload Your Image</h2>
            {!imagePreview && <ImageUploader onImageSelect={handleImageSelect} isLoading={isLoading} />}
            {imagePreview && (
              <div className="bg-white p-4 rounded-lg shadow-lg animate-fade-in">
                <img src={imagePreview} alt="Uploaded table preview" className="w-full h-auto rounded-md object-contain max-h-[60vh]" />
              </div>
            )}
          </div>

          {/* Right Column: Results */}
          <div className="space-y-6">
             <h2 className="text-2xl font-semibold text-gray-800">2. Get Your Data</h2>
             <div className="min-h-[300px] flex items-center justify-center">
                {isLoading && !imagePreview && (
                  <div className="text-center text-gray-500">
                    <p>Select an image to begin.</p>
                  </div>
                )}
                {isLoading && imagePreview && (
                   <div className="flex flex-col items-center justify-center text-center text-gray-600">
                      <svg className="animate-spin h-12 w-12 text-indigo-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p className="text-xl font-medium">Analyzing table...</p>
                      <p className="text-sm">The AI is working its magic.</p>
                  </div>
                )}
                {!isLoading && error && (
                  <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-lg shadow-md w-full text-center animate-fade-in">
                    <h3 className="font-bold text-lg mb-2">Extraction Failed</h3>
                    <p className="mb-4">{error}</p>
                    <button
                        onClick={resetState}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        Try Again
                    </button>
                  </div>
                )}
                {!isLoading && !error && tableData && <DataTable data={tableData} onReset={resetState} />}
                {!isLoading && !error && !tableData && !imagePreview && (
                  <div className="text-center text-gray-500 p-6 border-2 border-dashed border-gray-300 rounded-lg w-full">
                    <p>Your extracted table will appear here.</p>
                  </div>
                )}
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
