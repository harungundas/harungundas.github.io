import React, { useState } from 'react';
import ImageUploader from './ImageUploader';
import { editImage } from '../services/geminiService';
import { Spinner } from './icons/Spinner';

const ImageCleanup: React.FC = () => {
  const [originalImageFile, setOriginalImageFile] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [cleanedImageUrl, setCleanedImageUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (file: File) => {
    setOriginalImageFile(file);
    setOriginalImageUrl(URL.createObjectURL(file));
    setCleanedImageUrl(null);
    setPrompt('');
    setError(null);
  };

  const handleCleanup = async () => {
    if (!originalImageFile || !prompt.trim()) {
      setError('Lütfen bir görsel yükleyin ve neyi temizlemek istediğinizi yazın.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setCleanedImageUrl(null);

    try {
      const result = await editImage(originalImageFile, prompt, 'realistic');
      setCleanedImageUrl(result);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setOriginalImageFile(null);
    setOriginalImageUrl(null);
    setCleanedImageUrl(null);
    setPrompt('');
    setError(null);
    setIsLoading(false);
  };

  if (!originalImageFile || !originalImageUrl) {
    return <ImageUploader onImageUpload={handleImageUpload} title="Temizlenecek Bir Görsel Yükle" />;
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-300 text-center">Orijinal</h3>
          <div className="aspect-square bg-black/20 rounded-lg overflow-hidden shadow-md">
            <img src={originalImageUrl} alt="Original" className="w-full h-full object-contain" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-300 text-center">Temizlenmiş</h3>
          <div className="relative aspect-square bg-black/20 rounded-lg overflow-hidden flex items-center justify-center shadow-md">
            {isLoading && <Spinner />}
            {!isLoading && cleanedImageUrl && <img src={cleanedImageUrl} alt="Cleaned" className="w-full h-full object-contain" />}
            {!isLoading && !cleanedImageUrl && <div className="text-gray-500 text-center p-4">Temizlenmiş görsel burada görünecek</div>}
          </div>
        </div>
      </div>
      
      <div className="space-y-4 max-w-xl mx-auto">
        <div>
          <label htmlFor="cleanup-prompt" className="block text-sm font-medium text-gray-300 mb-2">
            İstenmeyen Nesne veya Kusur
          </label>
          <input
            type="text"
            id="cleanup-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Örn: 'arka plandaki arabayı kaldır', 'yüzdeki lekeyi sil'"
            className="w-full bg-black/20 border border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
            disabled={isLoading}
          />
        </div>

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        
        <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleCleanup}
              disabled={isLoading || !prompt.trim()}
              className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-lg text-white bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
            >
              {isLoading ? 'Temizleniyor...' : 'Görseli Temizle'}
            </button>
             <button
                onClick={handleReset}
                className="w-full sm:w-auto px-6 py-3 border border-white/20 text-base font-medium rounded-md shadow-sm text-gray-300 bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition"
                >
                Baştan Başla
            </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCleanup;
