'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

// Three.js コンポーネントはSSR無効で読み込み
const GLBViewer = dynamic(() => import('@/components/GLBViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-gray-900 rounded-lg flex items-center justify-center">
      <div className="text-white">Loading viewer...</div>
    </div>
  ),
});

export default function ViewerPage() {
  const [modelUid, setModelUid] = useState('0db8365fd0c44938b666345ef0f99d6d');
  const [inputUid, setInputUid] = useState('0db8365fd0c44938b666345ef0f99d6d');

  const handleLoad = () => {
    if (inputUid.trim()) {
      setModelUid(inputUid.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLoad();
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Sketchfab GLB Viewer</h1>

      <div className="mb-6 flex gap-4">
        <input
          type="text"
          value={inputUid}
          onChange={(e) => setInputUid(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter Sketchfab Model UID"
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
        <button
          onClick={handleLoad}
          className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors"
        >
          Load Model
        </button>
      </div>

      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        <p>
          Model UID: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{modelUid}</code>
        </p>
        <p className="mt-2">
          Sketchfab URL から UID を取得: <code>https://sketchfab.com/3d-models/[name]-<strong>[UID]</strong></code>
        </p>
      </div>

      <GLBViewer modelUid={modelUid} />
    </main>
  );
}
