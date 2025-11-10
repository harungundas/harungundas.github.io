
import React, { useState, useEffect, useRef } from 'react';
import ImageUploader from './ImageUploader';
import { faceMontage, generateFaceMontageTemplates, generateTemplateImage } from '../services/geminiService';
import * as dbService from '../services/dbService';
import { Spinner } from './icons/Spinner';
import { DownloadIcon } from './icons/DownloadIcon';
import { RefreshIcon } from './icons/RefreshIcon';
import { PREGENERATED_TEMPLATES } from './pregeneratedTemplates';

interface Template {
  id: string;
  name: string;
  prompt: string;
  url: string;
  status: 'idle' | 'loading' | 'loaded' | 'error';
  rating: 'liked' | 'disliked' | null;
}


const FaceMontage: React.FC = () => {
  const [sourceImageFile, setSourceImageFile] = useState<File | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);
  const [isLoadingMontage, setIsLoadingMontage] = useState(false);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDbReady, setIsDbReady] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        await dbService.initDB();
        setIsDbReady(true);

        const initialTemplates = PREGENERATED_TEMPLATES.map(t => ({
          ...t,
          url: '',
          status: 'idle' as const,
        }));
        setTemplates(initialTemplates);

        initialTemplates.forEach(async (template) => {
          try {
            const cachedUrl = await dbService.getImage(template.id);
            if (cachedUrl) {
              setTemplates(prev => prev.map(t => t.id === template.id ? { ...t, url: cachedUrl, status: 'loaded' } : t));
            }
          } catch (e) {
             console.error(`Failed to get image ${template.id} from cache`, e);
          }
        });

      } catch (e) {
        console.error("Failed to initialize IndexedDB", e);
        setError("Uygulama veritabanı başlatılamadı. Önbellekleme devre dışı kalabilir.");
      }
    };

    initialize();
  }, []); // Run only on component mount

  const handleImageUpload = (file: File) => {
    setSourceImageFile(file);
    setResultImageUrl(null); // Clear previous result when a new image is uploaded
    setError(null);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleNewFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      handleImageUpload(event.target.files[0]);
    }
    if (event.target) {
      event.target.value = '';
    }
  };


  const handleGenerateIdeas = async () => {
    setIsGeneratingIdeas(true);
    setError(null);
    try {
      const existingNames = templates.map(t => t.name);
      const newTemplateIdeas = await generateFaceMontageTemplates(existingNames);
      const newTemplates: Template[] = newTemplateIdeas.map(idea => ({
        ...idea,
        url: '',
        status: 'idle',
        rating: null,
      }));
      
      setTemplates(prev => [...prev, ...newTemplates]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsGeneratingIdeas(false);
    }
  };
  
  const handleSelectTemplate = async (templateId: string) => {
    setSelectedTemplateId(templateId);
    setError(null); // Clear previous errors on new selection

    const template = templates.find(t => t.id === templateId);

    if (template && template.status === 'idle' && isDbReady) {
      setTemplates(prev => prev.map(t => t.id === templateId ? { ...t, status: 'loading' } : t));
      try {
        const imageUrl = await generateTemplateImage(template.prompt);
        await dbService.saveImage(templateId, imageUrl);
        setTemplates(prev => prev.map(t => t.id === templateId ? { ...t, url: imageUrl, status: 'loaded' } : t));
      } catch (err) {
        console.error(`Failed to generate image for template ${template.name}:`, err);
        const errorMessage = (err as Error).message;
        setTemplates(prev => prev.map(t => t.id === templateId ? { ...t, status: 'error' } : t));
        setError(`'${template.name}' şablonu oluşturulamadı: ${errorMessage}`);
      }
    }
  };


  const handleCreateMontage = async () => {
    const hasCustomPrompt = customPrompt.trim() !== '';
    const hasSelectedTemplate = !!selectedTemplateId;
    
    if (!sourceImageFile) {
        setError('Lütfen önce bir yüz fotoğrafı yükleyin.');
        return;
    }

    if (!hasCustomPrompt && !hasSelectedTemplate) {
        setError('Lütfen bir şablon seçin veya kendi fikrinizi yazın.');
        return;
    }

    let finalPrompt = '';

    if (hasCustomPrompt) {
        finalPrompt = customPrompt.trim();
    } else {
        const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
        if (!selectedTemplate || selectedTemplate.status !== 'loaded') {
            setError('Seçilen şablon henüz hazır değil veya bir hata oluştu. Lütfen yüklenmesini bekleyin veya başka bir şablon seçin.');
            return;
        }
        finalPrompt = selectedTemplate.prompt;
    }

    setIsLoadingMontage(true);
    setError(null);
    setResultImageUrl(null);

    try {
      const result = await faceMontage(sourceImageFile, finalPrompt);
      setResultImageUrl(result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoadingMontage(false);
    }
  };
  
  const handleDownload = () => {
    if (!resultImageUrl) return;
    
    let filename = `yuz-montaji-sonucu.png`;
    const sanitizedCustomPrompt = customPrompt.trim()
        .toLowerCase()
        .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
        .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').slice(0, 50);

    if (sanitizedCustomPrompt) {
        filename = `${sanitizedCustomPrompt}.png`;
    } else {
        const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
        if (selectedTemplate) {
            const sanitizedName = selectedTemplate.name
                .trim()
                .toLowerCase()
                .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-');
            filename = `${sanitizedName}.png`;
        }
    }

    const link = document.createElement('a');
    link.href = resultImageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleStartOver = () => {
    setSelectedTemplateId(null);
    setResultImageUrl(null);
    setCustomPrompt('');
    setError(null);
  };
  
  const isCreateButtonDisabled = () => {
    if (isLoadingMontage || !sourceImageFile) return true;
    if (customPrompt.trim()) return false; // If there's a custom prompt, we can proceed
    if (selectedTemplateId) {
        return templates.find(t => t.id === selectedTemplateId)?.status !== 'loaded';
    }
    return true; // No template and no custom prompt
  };

  return (
    <div className="space-y-8">
      {!resultImageUrl ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
             <div>
                <h3 className="text-lg font-semibold text-gray-200 mb-4">1. Yüzünüzün Olduğu Fotoğraf</h3>
                {sourceImageFile ? (
                    <div className="relative group aspect-square">
                        <img 
                            src={URL.createObjectURL(sourceImageFile)} 
                            alt="Yüklenen yüz" 
                            className="w-full h-full object-contain rounded-lg bg-black/10 border-2 border-dashed border-gray-600"
                        />
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg">
                            <button
                                onClick={triggerFileInput}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md text-white bg-white/10 hover:bg-white/20 transition"
                            >
                                <RefreshIcon />
                                Değiştir
                            </button>
                        </div>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleNewFileSelect}
                        />
                    </div>
                ) : (
                    <ImageUploader onImageUpload={handleImageUpload} title="Yüzünüzün Olduğu Fotoğrafı Yükleyin" />
                )}
            </div>

            <div className="w-full">
               <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-200">2. Bir Şablon Seçin</h3>
                <button
                  onClick={handleGenerateIdeas}
                  disabled={isGeneratingIdeas}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-gray-300 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  title="Yeni şablon fikirleri üret"
                >
                  {isGeneratingIdeas ? <Spinner /> : <RefreshIcon />}
                  <span className="hidden sm:inline">Yeni Fikirler Üret</span>
                </button>
              </div>
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {templates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => handleSelectTemplate(template.id)}
                    disabled={template.status === 'loading'}
                    className={`
                      relative w-full aspect-square rounded-xl overflow-hidden group 
                      transition-all duration-300 ease-in-out transform focus:outline-none 
                      focus-visible:ring-4 focus-visible:ring-cyan-500 focus-visible:ring-opacity-75
                      ${selectedTemplateId === template.id 
                        ? 'scale-105 ring-4 ring-cyan-400 ring-offset-gray-900 ring-offset-2 shadow-2xl' 
                        : 'hover:scale-105 hover:shadow-xl'
                      }
                      ${template.status === 'loaded' 
                        ? 'cursor-pointer shadow-md' 
                        : 'bg-gray-800'
                      }
                      ${template.status === 'idle' ? 'cursor-pointer shadow-md hover:bg-gray-700' : ''}
                      ${template.status === 'loading' ? 'cursor-not-allowed animate-pulse' : ''}
                    `}
                  >
                    {template.status === 'idle' && (
                        <div className="absolute inset-0 bg-black/30"></div>
                    )}
                    {template.status === 'loading' && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Spinner />
                      </div>
                    )}
                    {template.status === 'error' && (
                      <div className="absolute inset-0 bg-red-900/70 flex items-center justify-center text-center text-xs font-bold text-white p-1">
                        Hata
                      </div>
                    )}
                    {template.status === 'loaded' && (
                      <img 
                        src={template.url} 
                        alt={template.name} 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                      />
                    )}
                    <div 
                      className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"
                    /> 
                    <div className="absolute bottom-0 left-0 right-0 p-2 text-left pointer-events-none">
                      <p className="text-white text-xs font-semibold truncate drop-shadow-lg">{template.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4">
             <h3 className="text-lg font-semibold text-gray-200 text-center">3. Montajı Oluştur</h3>
             <div>
                <label htmlFor="custom-prompt" className="block text-sm font-medium text-gray-300 mb-2 text-center">
                    ...veya Kendi Fikrinizi Yazın (Şablonu geçersiz kılar)
                </label>
                <input
                    type="text"
                    id="custom-prompt"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Örn: 'Beni bir rock yıldızı yap' veya 'Bir süper kahraman kostümü giydir'"
                    className="w-full max-w-xl mx-auto block bg-black/20 border border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition text-center"
                    disabled={isLoadingMontage}
                />
            </div>
            
            {error && <p className="text-red-400 text-sm text-center mt-4">{error}</p>}
            
            <div className="text-center pt-2">
                <button
                onClick={handleCreateMontage}
                disabled={isCreateButtonDisabled()}
                className="w-full max-w-md flex justify-center items-center px-6 py-4 border border-transparent text-lg font-medium rounded-md shadow-lg text-white bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                >
                {isLoadingMontage ? 'Montaj Oluşturuluyor...' : 'Montajı Oluştur'}
                </button>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center space-y-6">
          <h2 className="text-3xl font-bold text-cyan-300">İşte Sonuç!</h2>
          <div className="max-w-md mx-auto aspect-square bg-black/20 rounded-lg overflow-hidden shadow-2xl border border-white/10">
            <img src={resultImageUrl} alt="Face montage result" className="w-full h-full object-contain" />
          </div>
          <div className="flex justify-center items-center gap-4">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
            >
              <DownloadIcon />
              İndir
            </button>
            <button
              onClick={handleStartOver}
              className="px-6 py-3 border border-white/20 text-base font-medium rounded-md shadow-sm text-gray-300 bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition"
            >
              Baştan Başla
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FaceMontage;