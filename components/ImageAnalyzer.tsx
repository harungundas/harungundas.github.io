import React, { useState } from 'react';
import ImageUploader from './ImageUploader';
import { analyzeImage } from '../services/geminiService';
import { Spinner } from './icons/Spinner';

const ImageAnalyzer: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (file: File) => {
    setImageFile(file);
    setImageUrl(URL.createObjectURL(file));
    setAnalysis(null);
    setError(null);
  };
  
  const handleAnalyze = async () => {
    if (!imageFile) {
        setError('Lütfen önce bir resim yükleyin.');
        return;
    }
    
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    
    try {
        const result = await analyzeImage(imageFile);
        setAnalysis(result);
    } catch (e) {
        setError((e as Error).message);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <ImageUploader onImageUpload={handleImageUpload} title="Analiz Edilecek Görseli Yükle" />
      
      {imageFile && (
        <div className="text-center">
            <button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-lg text-white bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
            >
                {isLoading ? 'Analiz Ediliyor...' : 'Görseli Analiz Et'}
            </button>
        </div>
      )}
      
      {error && <p className="text-red-400 text-sm text-center">{error}</p>}

      {isLoading && (
        <div className="flex justify-center items-center h-40">
            <Spinner />
        </div>
      )}

      {analysis && (
        <div className="bg-black/20 border border-white/10 p-6 rounded-lg shadow-inner">
            <h3 className="text-xl font-semibold mb-3 text-cyan-300">AI Analizi</h3>
            <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{analysis}</p>
        </div>
      )}
    </div>
  );
};

export default ImageAnalyzer;
