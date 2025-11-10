
import React, { useState, useRef } from 'react';
import ImageUploader from './ImageUploader';
import { editImage, dataURLtoFile, generateFunnySuggestion } from '../services/geminiService';
import { Spinner } from './icons/Spinner';
import { DownloadIcon } from './icons/DownloadIcon';
import { DragHandleIcon } from './icons/DragHandleIcon';
import { UndoIcon } from './icons/UndoIcon';
import { RedoIcon } from './icons/RedoIcon';
import { LightbulbIcon } from './icons/LightbulbIcon';

// Funny Icons
import { GooglyEyesIcon } from './icons/GooglyEyesIcon';
import { DistortIcon } from './icons/DistortIcon';
import { CartoonIcon } from './icons/CartoonIcon';
import { PixelateIcon } from './icons/PixelateIcon';
import { ColorSwapIcon } from './icons/ColorSwapIcon';
import { MemeifyIcon } from './icons/MemeifyIcon';
import { GlitchIcon } from './icons/GlitchIcon';
import { VintageIcon } from './icons/VintageIcon';
import { SketchIcon } from './icons/SketchIcon';
import { CyberpunkIcon } from './icons/CyberpunkIcon';
import { JokeGlassesIcon } from './icons/JokeGlassesIcon';
import { GiantNoseIcon } from './icons/GiantNoseIcon';
import { AnimeEyesIcon } from './icons/AnimeEyesIcon';
import { FisheyeIcon } from './icons/FisheyeIcon';
import { BabyFaceIcon } from './icons/BabyFaceIcon';
import { OldAgeIcon } from './icons/OldAgeIcon';
import { ZombieIcon } from './icons/ZombieIcon';
import { AlienEyesIcon } from './icons/AlienEyesIcon';
import { RobotFaceIcon } from './icons/RobotFaceIcon';
import { CaricatureIcon } from './icons/CaricatureIcon';
import { MirrorIcon } from './icons/MirrorIcon';
import { PuffyCheeksIcon } from './icons/PuffyCheeksIcon';

// Aesthetic Icons
import { SkinSmootherIcon } from './icons/SkinSmootherIcon';
import { WrinkleRemovalIcon } from './icons/WrinkleRemovalIcon';
import { AcneRemovalIcon } from './icons/AcneRemovalIcon';
import { TeethWhiteningIcon } from './icons/TeethWhiteningIcon';
import { EyeBrighteningIcon } from './icons/EyeBrighteningIcon';
import { FaceSlimmingIcon } from './icons/FaceSlimmingIcon';
import { NoseJobIcon } from './icons/NoseJobIcon';
import { LipPlumpingIcon } from './icons/LipPlumpingIcon';
import { JawlineContourIcon } from './icons/JawlineContourIcon';
import { BurnTreatmentIcon } from './icons/BurnTreatmentIcon';
import { ScarRemovalIcon } from './icons/ScarRemovalIcon';
import { DoubleChinRemovalIcon } from './icons/DoubleChinRemovalIcon';


type GeneratorType = 'realistic' | 'funny';

interface ImageEditorProps {
  defaultGeneratorType: GeneratorType;
}

interface EditLayer {
  id: number;
  originalImageFile: File;
  originalImageUrl: string;
  editedImageUrl: string | null;
  prompt: string;
  notes: string;
  generatorType: GeneratorType;
  isLoading: boolean;
  isSuggestionLoading: boolean;
  error: string | null;
  isComplete: boolean;
  selectedEffects: string[];
}

const AESTHETIC_EFFECTS = [
    { id: 'skin_smoother', name: 'Cilt Pürüzsüzleştirme', icon: <SkinSmootherIcon />, prompt: "Perform a professional skin smoothing effect. Even out the skin tone and reduce the appearance of minor blemishes and pores, but critically, preserve the natural skin texture to avoid a plastic or artificial look. The result should be subtle and photorealistic." },
    { id: 'wrinkle_removal', name: 'Kırışıklık Giderme', icon: <WrinkleRemovalIcon />, prompt: "Subtly soften the appearance of fine lines and wrinkles, especially around the eyes (crow's feet) and mouth. Do not completely remove them, but rather reduce their depth for a naturally refreshed and more youthful appearance. The skin's texture should be maintained." },
    { id: 'acne_removal', name: 'Akne Giderme', icon: <AcneRemovalIcon />, prompt: "Perform a photorealistic acne removal. Target and remove individual pimples, blackheads, and acne spots, then seamlessly blend the texture and color with the surrounding healthy skin. The final result should look completely natural and untouched." },
    { id: 'teeth_whitening', name: 'Diş Beyazlatma', icon: <TeethWhiteningIcon />, prompt: "Realistically whiten the teeth by a few shades to remove yellowing and stains. Avoid an overly bright, artificial white. The result should be a healthy, natural-looking bright smile." },
    { id: 'eye_brightening', name: 'Göz Beyazlatma', icon: <EyeBrighteningIcon />, prompt: "Subtly enhance the eyes. Gently brighten the whites of the eyes (sclera) to reduce redness and make them look clearer. Add a slight boost to the iris's natural color and a hint of a catchlight to make the eyes appear more vibrant and alive. The effect should be very subtle." },
    { id: 'face_slimming', name: 'Yüz İnceltme', icon: <FaceSlimmingIcon />, prompt: "Perform a very subtle facial slimming. Gently contour the jawline and cheeks to create a slightly more defined appearance. The change must be minimal and preserve the person's natural facial structure and likeness." },
    { id: 'nose_job', name: 'Burun Estetiği', icon: <NoseJobIcon />, prompt: "Perform a subtle and realistic rhinoplasty effect. Make the nose slightly narrower and refine the tip, ensuring the new shape is harmonious with the person's other facial features. The modification should be almost imperceptible." },
    { id: 'lip_plumping', name: 'Dudak Dolgunlaştırma', icon: <LipPlumpingIcon />, prompt: "Subtly increase the volume of the lips to make them appear slightly fuller. Maintain the natural shape and texture of the lips. The effect should be similar to well-applied lip liner, not a surgical procedure." },
    { id: 'jawline_contour', name: 'Çene Hattı Belirginleştirme', icon: <JawlineContourIcon />, prompt: "Subtly enhance and sharpen the jawline. Add a hint of shadow and highlight to create a more defined and chiseled look while remaining completely photorealistic and true to the person's face." },
    { id: 'burn_treatment', name: 'Yanık Tedavisi', icon: <BurnTreatmentIcon />, prompt: "Realistically heal and remove the appearance of a burn scar. Meticulously reconstruct the skin, perfectly matching the original skin texture, pores, and color variations of the surrounding area. The result should be a seamless and undetectable repair." },
    { id: 'scar_removal', name: 'Yara İzi Giderme', icon: <ScarRemovalIcon />, prompt: "Realistically remove a visible scar. Carefully replace the scar tissue with new skin that perfectly matches the texture, color, and lighting of the adjacent skin. The edit should be invisible to the naked eye." },
    { id: 'double_chin_removal', name: 'Gıdı Giderme', icon: <DoubleChinRemovalIcon />, prompt: "Subtly reduce the appearance of a double chin by tightening the skin under the jawline. The goal is to create a cleaner, more defined profile while looking completely natural and not over-edited." },
];

const FUNNY_EFFECTS = [
    { id: 'googly_eyes', name: 'Gözleri Şaşı Yap', icon: <GooglyEyesIcon />, prompt: "add googly eyes" },
    { id: 'distort_face', name: 'Yüzü Komikleştir', icon: <DistortIcon />, prompt: "distort the face with a funny face filter" },
    { id: 'cartoonify', name: 'Çizgi Film Filtresi', icon: <CartoonIcon />, prompt: "apply a cartoonish filter" },
    { id: 'pixelate', name: 'Pikselleştir', icon: <PixelateIcon />, prompt: "pixelate the image" },
    { id: 'random_color_swap', name: 'Rastgele Renk Değişimi', icon: <ColorSwapIcon />, prompt: "perform a random, vibrant color swap on the main subjects" },
    { id: 'memeify', name: 'Meme Yap', icon: <MemeifyIcon />, prompt: "turn the image into a classic internet meme, add bold impact font text at the top and bottom. The text should be funny and related to the image." },
    { id: 'glitch_art', name: 'Glitch Sanatı', icon: <GlitchIcon />, prompt: "apply a colorful, digital glitch art effect to the image, with datamoshing and pixel sorting aesthetics" },
    { id: 'vintage_photo', name: 'Vintage Fotoğraf', icon: <VintageIcon />, prompt: "transform the image into a faded, sepia-toned vintage photograph from the early 1900s, with dust and scratches for an authentic look" },
    { id: 'sketch_art', name: 'Eskiz Çizim', icon: <SketchIcon />, prompt: "convert the image into a detailed pencil sketch, as if drawn by an artist, with clear lines and shading" },
    { id: 'cyberpunk_glow', name: 'Cyberpunk Parıltısı', icon: <CyberpunkIcon />, prompt: "reimagine the image with a cyberpunk aesthetic, add vibrant neon glows to edges and highlights, and set it in a dark, futuristic cityscape" },
    { id: 'joke_glasses', name: 'Şaka Gözlüğü', icon: <JokeGlassesIcon />, prompt: "Add classic joke glasses with a fake nose and mustache to the main subject's face." },
    { id: 'giant_nose', name: 'Dev Burun', icon: <GiantNoseIcon />, prompt: "Give the main subject a comically oversized, giant nose." },
    { id: 'anime_eyes', name: 'Anime Gözleri', icon: <AnimeEyesIcon />, prompt: "Replace the eyes of the main subject with huge, sparkling, expressive anime-style eyes." },
    { id: 'fisheye_lens', name: 'Balık Gözü', icon: <FisheyeIcon />, prompt: "Apply a strong fisheye lens effect to the entire image, making it look bulging and distorted from the center." },
    { id: 'baby_face', name: 'Bebek Yüzü', icon: <BabyFaceIcon />, prompt: "Apply a 'baby face' filter to the main subject, giving them smoother skin, larger eyes, and chubby cheeks." },
    { id: 'old_age_filter', name: 'Yaşlılık Filtresi', icon: <OldAgeIcon />, prompt: "Apply a 'old age' filter to the main subject, adding realistic wrinkles, grey hair, and age spots." },
    { id: 'zombie_effect', name: 'Zombi Efekti', icon: <ZombieIcon />, prompt: "Turn the main subject into a funny cartoon zombie with pale green skin, sunken eyes, and a few fake stitches." },
    { id: 'alien_eyes', name: 'Uzaylı Gözleri', icon: <AlienEyesIcon />, prompt: "Replace the main subject's eyes with large, black, almond-shaped alien eyes." },
    { id: 'robot_face', name: 'Robot Yüzü', icon: <RobotFaceIcon />, prompt: "Transform the main subject's face into a robot face, with metallic panels, glowing eyes, and visible circuits." },
    { id: 'caricature', name: 'Karikatürleştirme', icon: <CaricatureIcon />, prompt: "Exaggerate the facial features of the main subject to create a funny artistic caricature drawing." },
    { id: 'mirror_effect', name: 'Ayna Efekti', icon: <MirrorIcon />, prompt: "Mirror the left half of the main subject's face onto the right half, creating a perfectly symmetrical but strange-looking face." },
    { id: 'puffy_cheeks', name: 'Şişirilmiş Yanaklar', icon: <PuffyCheeksIcon />, prompt: "Make the main subject's cheeks comically puffy and swollen, as if their mouth is full of food." },
];


const ImageEditor: React.FC<ImageEditorProps> = ({ defaultGeneratorType }) => {
  const [history, setHistory] = useState<EditLayer[][]>([[]]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);
  const layers = history[currentHistoryIndex];
  
  const draggedIndex = useRef<number | null>(null);
  const dropIndex = useRef<number | null>(null);

  const setLayersWithHistory = (newLayersOrFn: EditLayer[] | ((prevLayers: EditLayer[]) => EditLayer[])) => {
    const currentLayers = history[currentHistoryIndex];
    const newLayers = typeof newLayersOrFn === 'function' ? newLayersOrFn(currentLayers) : newLayersOrFn;
    
    const newHistory = history.slice(0, currentHistoryIndex + 1);
    
    setHistory([...newHistory, newLayers]);
    setCurrentHistoryIndex(newHistory.length);
  };

  const handleImageUpload = (file: File) => {
    const newLayer: EditLayer = {
      id: Date.now(),
      originalImageFile: file,
      originalImageUrl: URL.createObjectURL(file),
      editedImageUrl: null,
      prompt: '',
      notes: '',
      generatorType: defaultGeneratorType,
      isLoading: false,
      isSuggestionLoading: false,
      error: null,
      isComplete: false,
      selectedEffects: [],
    };
    setHistory([[newLayer]]);
    setCurrentHistoryIndex(0);
  };

  const updateLayer = (id: number, updates: Partial<EditLayer>) => {
    setLayersWithHistory(prevLayers =>
      prevLayers.map(layer => (layer.id === id ? { ...layer, ...updates } : layer))
    );
  };

  const handleToggleEffect = (layerId: number, effectId: string) => {
    const layer = layers.find(l => l.id === layerId);
    if (!layer) return;

    const newEffects = layer.selectedEffects.includes(effectId)
        ? layer.selectedEffects.filter(id => id !== effectId)
        : [...layer.selectedEffects, effectId];
    
    updateLayer(layerId, { selectedEffects: newEffects });
  };
  
  const handleGenerate = async (id: number) => {
    const layer = layers.find(l => l.id === id);
    if (!layer) return;

    const hasEffects = layer.selectedEffects.length > 0;
    const hasPrompt = layer.prompt.trim() !== '';

    if (!hasEffects && !hasPrompt) {
        updateLayer(id, { error: 'Lütfen bir düzenleme istemi girin veya bir efekt seçin.' });
        return;
    }
    
    updateLayer(id, { isLoading: true, error: null, editedImageUrl: null });
    
    let finalPrompt = '';
    if (hasEffects) {
        const effectLibrary = layer.generatorType === 'realistic' ? AESTHETIC_EFFECTS : FUNNY_EFFECTS;
        const effectPrompts = layer.selectedEffects
            .map(effectId => effectLibrary.find(e => e.id === effectId)?.prompt)
            .filter(Boolean);
        finalPrompt += `Apply these effects: ${effectPrompts.join(', ')}.`;
    }
    if (hasPrompt) {
        finalPrompt += ` Additional user request: "${layer.prompt}"`;
    }

    try {
        const result = await editImage(layer.originalImageFile, finalPrompt.trim(), layer.generatorType);
        setLayersWithHistory(prevLayers =>
            prevLayers.map(l => l.id === id ? { ...l, editedImageUrl: result, isLoading: false } : l)
        );
    } catch (e) {
        setLayersWithHistory(prevLayers =>
            prevLayers.map(l => l.id === id ? { ...l, error: (e as Error).message, isLoading: false } : l)
        );
    }
  };

  const handleSuggestFunnyIdea = async (id: number) => {
    updateLayer(id, { isSuggestionLoading: true, error: null });
    try {
      const suggestion = await generateFunnySuggestion();
      updateLayer(id, { prompt: suggestion, isSuggestionLoading: false });
    } catch (e) {
      updateLayer(id, { error: (e as Error).message, isSuggestionLoading: false });
    }
  };

  const handleUseThis = (id: number) => {
    const currentLayer = layers.find(l => l.id === id);
    if (!currentLayer || !currentLayer.editedImageUrl) return;
    
    const newFile = dataURLtoFile(currentLayer.editedImageUrl, `layer-${layers.length}.png`);
    
    const newLayer: EditLayer = {
        id: Date.now(),
        originalImageFile: newFile,
        originalImageUrl: currentLayer.editedImageUrl,
        editedImageUrl: null,
        prompt: '',
        notes: '',
        generatorType: defaultGeneratorType,
        isLoading: false,
        isSuggestionLoading: false,
        error: null,
        isComplete: false,
        selectedEffects: [],
    };

    setLayersWithHistory(prevLayers => {
        const updatedLayers = prevLayers.map(l => l.id === id ? { ...l, isComplete: true } : l);
        return [newLayer, ...updatedLayers];
    });
  };
  
  const handleEditAgain = (id: number) => {
     updateLayer(id, { editedImageUrl: null, error: null, isComplete: false });
  };
  
  const handleDownload = (imageUrl: string, layerId: number) => {
    if (!imageUrl) return;
    
    const layer = layers.find(l => l.id === layerId);
    let filename = `duzenlenen-gorsel-${layerId}.png`;

    const sanitizeForFilename = (text: string) => 
        text.trim().toLowerCase()
            .replace(/ğ/g, 'g')
            .replace(/ü/g, 'u')
            .replace(/ş/g, 's')
            .replace(/ı/g, 'i')
            .replace(/ö/g, 'o')
            .replace(/ç/g, 'c')
            .replace(/[^a-z0-9\s-]/g, '') // remove special characters
            .replace(/\s+/g, '-')       // replace spaces with dashes
            .slice(0, 50);              // limit length
    
    if (layer) {
        let namePart = sanitizeForFilename(layer.prompt || layer.notes);
        if (!namePart && layer.selectedEffects.length > 0) {
            const effectLibrary = layer.generatorType === 'realistic' ? AESTHETIC_EFFECTS : FUNNY_EFFECTS;
            const effectNames = layer.selectedEffects
                .map(id => effectLibrary.find(e => e.id === id)?.name || '')
                .join(' ');
            namePart = sanitizeForFilename(effectNames);
        }

        if (namePart) {
            filename = `${namePart}.png`;
        }
    }

    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDragStart = (index: number) => {
    draggedIndex.current = index;
    document.body.style.cursor = 'grabbing';
  };

  const handleDragEnd = () => {
    if (draggedIndex.current !== null && dropIndex.current !== null && draggedIndex.current !== dropIndex.current) {
      const reorderedLayers = [...layers];
      const [draggedLayer] = reorderedLayers.splice(draggedIndex.current, 1);
      reorderedLayers.splice(dropIndex.current, 0, draggedLayer);
      
      for (let i = reorderedLayers.length - 2; i >= 0; i--) {
        const parentLayer = reorderedLayers[i + 1];
        const currentLayer = reorderedLayers[i];

        if (parentLayer.editedImageUrl && parentLayer.isComplete) {
            if (currentLayer.originalImageUrl !== parentLayer.editedImageUrl) {
                currentLayer.originalImageUrl = parentLayer.editedImageUrl;
                currentLayer.originalImageFile = dataURLtoFile(parentLayer.editedImageUrl, `layer-input-${currentLayer.id}.png`);
                currentLayer.editedImageUrl = null;
                currentLayer.isComplete = false;
                currentLayer.isLoading = false;
                currentLayer.error = null;
            }
        } else {
             const baseFile = i === reorderedLayers.length - 1 ? layers[i].originalImageFile : new File([], 'invalid.png', { type: 'image/png' });
             const baseImage = i === reorderedLayers.length - 1 ? layers[i].originalImageUrl : 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

            currentLayer.originalImageUrl = baseImage;
            currentLayer.originalImageFile = baseFile;
            currentLayer.editedImageUrl = null;
            currentLayer.isComplete = false;
            currentLayer.isLoading = false;
            currentLayer.error = i < reorderedLayers.length -1 ? "Üst katman yeniden sıralama sonrası tamamlanmadı. Lütfen önce üst katmanı oluşturun." : null;
        }
      }
      setLayersWithHistory(reorderedLayers);
    }
    draggedIndex.current = null;
    dropIndex.current = null;
    document.body.style.cursor = 'default';
  };
  
  const handleStartOver = () => {
    setHistory([[]]);
    setCurrentHistoryIndex(0);
  };

  const handleUndo = () => {
    if (currentHistoryIndex > 0) {
      setCurrentHistoryIndex(currentHistoryIndex - 1);
    }
  };

  const handleRedo = () => {
    if (currentHistoryIndex < history.length - 1) {
      setCurrentHistoryIndex(currentHistoryIndex - 1);
    }
  };
  
  const canUndo = currentHistoryIndex > 0;
  const canRedo = currentHistoryIndex < history.length - 1;

  const getPlaceholder = (type: GeneratorType) => {
    return 'Efektlerle birleştirmek için ek talimatlar girin...';
  };

  const getFinalImage = () => {
    if (layers.length === 0) return null;
    const topLayer = layers[0];
    if (topLayer.editedImageUrl) {
        return { url: topLayer.editedImageUrl, id: topLayer.id };
    }
    if (!topLayer.editedImageUrl && layers.length > 1 && layers[1].isComplete && layers[1].editedImageUrl) {
         return { url: layers[1].editedImageUrl, id: layers[1].id };
    }
    const initialImage = layers[layers.length - 1];
    return { url: initialImage.originalImageUrl, id: initialImage.id };
  };
  
  const finalImage = getFinalImage();
  
  const getUploaderTitle = () => {
    if (defaultGeneratorType === 'realistic') return 'Başlamak için Bir Görsel Yükle (Estetik)';
    if (defaultGeneratorType === 'funny') return 'Başlamak için Bir Görsel Yükle (Komik)';
    return 'Başlamak için Bir Görsel Yükle';
  }
  
  const renderEffectLibrary = (
      effects: typeof FUNNY_EFFECTS | typeof AESTHETIC_EFFECTS, 
      layer?: EditLayer
    ) => {
    const isEnabled = !!layer;
    return (
        <div className={`grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-9 gap-3 ${!isEnabled ? 'opacity-60' : ''}`}>
            {effects.map(effect => {
                const isSelected = isEnabled && layer.selectedEffects.includes(effect.id);
                return (
                    <button
                        key={effect.id}
                        onClick={() => isEnabled && handleToggleEffect(layer.id, effect.id)}
                        disabled={!isEnabled || layer.isLoading || !!layer.editedImageUrl}
                        className={`flex flex-col items-center justify-center text-center p-2 aspect-square rounded-lg border-2 transition-all duration-200 transform ${isEnabled ? 'hover:-translate-y-1' : 'cursor-not-allowed'}
                            ${isSelected
                                ? 'bg-cyan-500/20 border-cyan-400 shadow-lg'
                                : `bg-black/20 ${isEnabled ? 'hover:border-gray-500' : ''} border-gray-600`
                            } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                    >
                        <div className={`text-3xl mb-1 transition-colors ${isSelected ? 'text-cyan-300' : (defaultGeneratorType === 'funny' ? 'text-pink-400' : 'text-purple-400')}`}>
                            {effect.icon}
                        </div>
                        <span className="text-xs font-medium text-gray-200 leading-tight">{effect.name}</span>
                    </button>
                );
            })}
        </div>
    );
};

  return (
    <div className="space-y-8">
      {layers.length === 0 ? (
        <>
          <ImageUploader onImageUpload={handleImageUpload} title={getUploaderTitle()} />
          <div className="bg-black/20 p-6 rounded-2xl shadow-lg border border-white/10 space-y-4">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Efekt Kütüphanesi (Başlamak için bir görsel yükleyin)
              </label>
              {defaultGeneratorType === 'realistic' && renderEffectLibrary(AESTHETIC_EFFECTS)}
              {defaultGeneratorType === 'funny' && renderEffectLibrary(FUNNY_EFFECTS)}
          </div>
        </>
      ) : (
        <>
          {layers.map((layer, index) => (
            <div 
              key={layer.id} 
              draggable={!layer.isLoading}
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => (dropIndex.current = index)}
              onDragOver={(e) => e.preventDefault()}
              onDragEnd={handleDragEnd}
              className={`bg-black/20 p-6 rounded-2xl shadow-lg border border-white/10 space-y-6 transition-all duration-300
                ${draggedIndex.current === index ? 'opacity-50 scale-95 shadow-2xl' : ''}
                ${dropIndex.current === index && draggedIndex.current !== index && draggedIndex.current !== null && dropIndex.current < draggedIndex.current ? 'border-t-4 border-t-cyan-400' : ''}
                ${dropIndex.current === index && draggedIndex.current !== index && draggedIndex.current !== null && dropIndex.current > draggedIndex.current ? 'border-b-4 border-b-cyan-400' : ''}
              `}
            >
              <div className="flex items-center gap-4">
                <div className="drag-handle cursor-grab" title="Katmanı yeniden sıralamak için sürükle">
                  <DragHandleIcon />
                </div>
                <h2 className="text-xl font-bold text-cyan-300">Düzenleme Katmanı #{layers.length - index}</h2>
              </div>
              
              <div>
                <label htmlFor={`notes-${layer.id}`} className="block text-sm font-medium text-gray-300 mb-2">
                  Katman Notları
                </label>
                <textarea
                  id={`notes-${layer.id}`}
                  value={layer.notes}
                  onChange={(e) => updateLayer(layer.id, { notes: e.target.value })}
                  placeholder="Bu katmanda yapılan değişikliklerle ilgili notlar ekleyin..."
                  className="w-full bg-black/20 border border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition resize-none disabled:bg-gray-700/50 disabled:opacity-70 disabled:cursor-not-allowed"
                  rows={2}
                  disabled={layer.isComplete}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-300">Önce</h3>
                  <div className="aspect-square bg-black/20 rounded-lg overflow-hidden shadow-md">
                    <img src={layer.originalImageUrl} alt="Original" className="w-full h-full object-contain" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-300">Sonra</h3>
                  <div className="relative aspect-square bg-black/20 rounded-lg overflow-hidden flex items-center justify-center shadow-md">
                    {layer.isLoading && <Spinner />}
                    {!layer.isLoading && layer.editedImageUrl && <img src={layer.editedImageUrl} alt="Edited" className="w-full h-full object-contain" />}
                    {!layer.isLoading && !layer.editedImageUrl && <div className="text-gray-500">Düzenlenmiş görsel burada görünecek</div>}
                  </div>
                </div>
              </div>
              
              {!layer.isComplete && (
                <div className="space-y-4">
                  <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Efekt Kütüphanesi (Birden fazla seçilebilir)
                      </label>
                      {layer.generatorType === 'realistic' && renderEffectLibrary(AESTHETIC_EFFECTS, layer)}
                      {layer.generatorType === 'funny' && renderEffectLibrary(FUNNY_EFFECTS, layer)}
                  </div>
                  
                  <div>
                    <label htmlFor={`prompt-${layer.id}`} className="block text-sm font-medium text-gray-300 mb-2">
                      Düzenleme İstemi
                    </label>
                    <div className="flex items-center gap-2">
                        <input
                          type="text"
                          id={`prompt-${layer.id}`}
                          value={layer.prompt}
                          onChange={(e) => updateLayer(layer.id, { prompt: e.target.value })}
                          placeholder={getPlaceholder(layer.generatorType)}
                          className="w-full bg-black/20 border border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                          disabled={layer.isLoading || !!layer.editedImageUrl}
                        />
                        {layer.generatorType === 'funny' && (
                            <button 
                                onClick={() => handleSuggestFunnyIdea(layer.id)}
                                disabled={layer.isSuggestionLoading || layer.isLoading || !!layer.editedImageUrl}
                                className="flex items-center justify-center px-4 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:bg-gray-500/50 disabled:cursor-not-allowed"
                                title="Bana komik bir fikir ver"
                            >
                                {layer.isSuggestionLoading ? <Spinner /> : <LightbulbIcon />}
                            </button>
                        )}
                    </div>
                  </div>

                  {layer.error && <p className="text-red-400 text-sm">{layer.error}</p>}
                  
                  {!layer.editedImageUrl ? (
                    <button
                      onClick={() => handleGenerate(layer.id)}
                      disabled={layer.isLoading || (!layer.prompt.trim() && layer.selectedEffects.length === 0) }
                      className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-lg text-white bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                    >
                      {layer.isLoading ? 'Oluşturuluyor...' : 'Dönüşümü Başlat'}
                    </button>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button onClick={() => handleUseThis(layer.id)} className="w-full sm:w-auto flex-grow justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition">
                        Bunu Kullan ve Devam Et
                      </button>
                       <button 
                        onClick={() => handleDownload(layer.editedImageUrl!, layer.id)}
                        className="w-full sm:w-auto flex justify-center items-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                      >
                          <DownloadIcon />
                          <span className="hidden sm:inline">İndir</span>
                      </button>
                      <button onClick={() => handleEditAgain(layer.id)} className="w-full sm:w-auto px-6 py-3 border border-white/20 text-base font-medium rounded-md shadow-sm text-gray-300 bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition">
                        Tekrar Düzenle
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </>
      )}

      {layers.length > 0 && (
         <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <div className="flex items-center gap-2 bg-black/20 p-2 rounded-lg">
               <button
                  onClick={handleUndo}
                  disabled={!canUndo}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  title="Geri Al"
              >
                  <UndoIcon />
                  <span className="hidden sm:inline">Geri Al</span>
              </button>
               <button
                  onClick={handleRedo}
                  disabled={!canRedo}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  title="İleri Al"
              >
                  <RedoIcon />
                  <span className="hidden sm:inline">İleri Al</span>
              </button>
            </div>
              {finalImage && (
                <button
                  onClick={() => handleDownload(finalImage.url!, finalImage.id)}
                  className="px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition flex justify-center items-center gap-2"
                >
                  <DownloadIcon />
                  <span>Son Görseli İndir</span>
                </button>
              )}
              <button
                  onClick={handleStartOver}
                  className="px-6 py-3 border border-white/20 text-base font-medium rounded-md shadow-sm text-gray-300 bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition"
                  >
                  Baştan Başla
              </button>
         </div>
      )}
    </div>
  );
};

export default ImageEditor;