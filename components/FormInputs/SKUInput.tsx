import { generateSimpleSKU } from '@/lib/generateSKU';
import React, { useState } from 'react';

interface SKUGeneratorProps {
  name: string;
}

export const SKUGenerator: React.FC<SKUGeneratorProps> = ({ name }) => {
  const [sku, setSku] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSku(e.target.value);
  };

  const copyToClipboard = async (): Promise<void> => {
    if (sku) {
      try {
        await navigator.clipboard.writeText(sku);
        alert('SKU copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy SKU:', err);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        SKU Generator
      </h2>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="sku-input"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Product SKU
          </label>
          <input
            id="sku-input"
            type="text"
            value={sku}
            onChange={handleInputChange}
            placeholder="Generated SKU will appear here..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setSku(generateSimpleSKU(9, "DBAKES"))}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generate SKU
          </button>

          {/* {sku && (
            <button
              onClick={copyToClipboard}
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              title="Copy to clipboard"
            >
              📋
            </button>
          )} */}
        </div>

        {sku && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">
              <strong>Generated SKU:</strong> {sku}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SKUGenerator;