'use client';

import { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Center, useProgress, Html } from '@react-three/drei';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface ModelProps {
  url: string;
}

function Loader() {
  const { progress } = useProgress();
  return <Html center>{progress.toFixed(0)}% loaded</Html>;
}

function Model({ url }: ModelProps) {
  const gltf = useLoader(GLTFLoader, url);

  return (
    <Center>
      <primitive object={gltf.scene} />
    </Center>
  );
}

interface GLBViewerProps {
  modelUid: string;
}

interface DownloadResponse {
  url: string;
  size: number;
  expires: number;
}

export default function GLBViewer({ modelUid }: GLBViewerProps) {
  const [error, setError] = useState<string | null>(null);
  const [glbUrl, setGlbUrl] = useState<string | null>(null);
  const [downloadInfo, setDownloadInfo] = useState<DownloadResponse | null>(null);
  const [isLoadingUrl, setIsLoadingUrl] = useState(true);

  useEffect(() => {
    async function fetchGlbUrl() {
      setIsLoadingUrl(true);
      setError(null);
      setGlbUrl(null);

      try {
        const response = await fetch(`/api/sketchfab/download?uid=${modelUid}`);

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to get download URL');
        }

        const data: DownloadResponse = await response.json();
        console.log('Download URL obtained:', data.url.substring(0, 100) + '...');
        setDownloadInfo(data);
        setGlbUrl(data.url);
      } catch (err) {
        console.error('Error fetching URL:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoadingUrl(false);
      }
    }

    fetchGlbUrl();
  }, [modelUid]);

  const handleDownload = async () => {
    if (!glbUrl) return;

    try {
      const response = await fetch(glbUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${modelUid}.glb`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      setError('Download failed');
    }
  };

  if (error) {
    return (
      <div className="w-full h-[600px] bg-gray-900 rounded-lg flex items-center justify-center">
        <div className="text-center text-white p-4">
          <p className="font-bold mb-2 text-red-400">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoadingUrl) {
    return (
      <div className="w-full h-[600px] bg-gray-900 rounded-lg flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p>Getting download URL...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[600px] bg-gray-900 rounded-lg overflow-hidden">
      {glbUrl && (
        <Canvas camera={{ position: [0, 2, 5], fov: 45 }}>
          <color attach="background" args={['#1a1a2e']} />

          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 10, 7.5]} intensity={1} />
          <directionalLight position={[-5, -5, -5]} intensity={0.5} />

          <Suspense fallback={<Loader />}>
            <Model url={glbUrl} />
            <Environment preset="studio" />
          </Suspense>

          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            screenSpacePanning
            minDistance={1}
            maxDistance={20}
          />

          <gridHelper args={[10, 10, 0x444444, 0x222222]} />
        </Canvas>
      )}

      {/* Controls overlay */}
      <div className="absolute bottom-4 left-4 text-white text-sm bg-black/50 px-3 py-2 rounded">
        <p>Left click + drag: Rotate</p>
        <p>Right click + drag: Pan</p>
        <p>Scroll: Zoom</p>
      </div>

      {/* Download button */}
      {glbUrl && (
        <button
          onClick={handleDownload}
          className="absolute top-4 right-4 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded text-sm transition-colors"
        >
          Download GLB
        </button>
      )}

      {/* File size info */}
      {downloadInfo && (
        <div className="absolute top-4 left-4 text-white text-sm bg-black/50 px-3 py-2 rounded">
          Size: {(downloadInfo.size / 1024 / 1024).toFixed(2)} MB
        </div>
      )}
    </div>
  );
}
