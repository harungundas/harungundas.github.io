import { GoogleGenAI, Modality, Type } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Utility to convert File to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      } else {
        reject(new Error('Failed to read file as base64 string.'));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

// Utility to convert a data URL to a File object
export const dataURLtoFile = (dataUrl: string, filename: string): File => {
    const arr = dataUrl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) {
        throw new Error('Could not parse mime type from data URL');
    }
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}

export const analyzeImage = async (imageFile: File): Promise<string> => {
  try {
    const base64Data = await fileToBase64(imageFile);
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: imageFile.type,
            },
          },
          {
            text: 'Bu görseli detaylı bir şekilde analiz et ve gördüklerini anlat.',
          },
        ],
      },
    });

    return response.text;
  } catch (error) {
    console.error("Error analyzing image with Gemini:", error);
    throw new Error('Görsel analiz edilirken bir hata oluştu. Lütfen tekrar deneyin.');
  }
};

export const generateFunnySuggestion = async (): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Tek bir cümleyle, bir fotoğraf için komik ve beklenmedik bir düzenleme fikri öner. Sadece düzenleme talimatını yaz. Örneğin: "Saçlarını spagettiden yap" veya "Arka planı şekerleme diyarına dönüştür".',
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error generating funny suggestion:", error);
    throw new Error('Fikir üretilirken bir hata oluştu.');
  }
};


export const editImage = async (imageFile: File, prompt: string, generatorType: 'realistic' | 'funny'): Promise<string> => {
  try {
    const base64Data = await fileToBase64(imageFile);
    
    let enhancedPrompt: string;

    if (generatorType === 'funny') {
      enhancedPrompt = `Perform an exaggerated, funny, and creative edit. The result should be fun and surprising. User's request: "${prompt}"`;
    } else { // 'realistic'
      enhancedPrompt = `Perform a high-quality, photorealistic, and professional edit. User's request: "${prompt}"`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: imageFile.type,
            },
          },
          {
            text: enhancedPrompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const firstPart = response.candidates?.[0]?.content?.parts?.[0];
    if (firstPart && 'inlineData' in firstPart && firstPart.inlineData) {
      const base64ImageBytes = firstPart.inlineData.data;
      const mimeType = firstPart.inlineData.mimeType;
      return `data:${mimeType};base64,${base64ImageBytes}`;
    }
    
    const errorMessage = JSON.stringify(response);
    if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
         throw new Error('Görsel oluşturma hız sınırını aştınız. Lütfen bir dakika bekleyip tekrar deneyin. Sorun devam ederse fatura ayarlarınızı kontrol edin.');
    }
    
    throw new Error('API tarafından bir görsel oluşturulmadı.');
  } catch (error) {
    console.error("Error editing image with Gemini:", error);
     const errorMessage = JSON.stringify(error);
    if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
         throw new Error('Görsel oluşturma hız sınırını aştınız. Lütfen bir dakika bekleyip tekrar deneyin. Sorun devam ederse fatura ayarlarınızı kontrol edin.');
    }
    throw new Error('Görsel düzenlenirken bir hata oluştu. Lütfen tekrar deneyin.');
  }
};

export const faceMontage = async (sourceImageFile: File, templatePrompt: string): Promise<string> => {
  try {
    // A new prompt is constructed to apply the *theme* of the template to the user's photo,
    // while explicitly instructing the model to preserve the user's facial features.
    // This is a more reliable method than a visual-only face swap.
    const finalPrompt = `Apply the following theme to the person in the image: "${templatePrompt}". IMPORTANT: Preserve the original person's facial features and likeness.`;

    // The existing 'editImage' function is reused as it's perfectly suited for this kind of image modification.
    return await editImage(sourceImageFile, finalPrompt, 'realistic');
    
  } catch (error) {
    console.error("Error during face montage with Gemini:", error);
    const errorMessage = JSON.stringify(error);
    if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
         throw new Error('Görsel oluşturma hız sınırını aştınız. Lütfen bir dakika bekleyip tekrar deneyin. Sorun devam ederse fatura ayarlarınızı kontrol edin.');
    }
    throw new Error('Yüz montajı sırasında bir hata oluştu. Lütfen tekrar deneyin.');
  }
};

export const generateFaceMontageTemplates = async (existingTemplateNames: string[] = []): Promise<{id: string, name: string, prompt: string}[]> => {
  try {
    const existingTemplatesPrompt = existingTemplateNames.length > 0
      ? `Mevcut şablonlar şunlardır, lütfen bunları veya çok benzerlerini tekrar etmeyin: ${existingTemplateNames.join(', ')}.`
      : '';

    const prompt = `Bana 12 tane komik ve yaratıcı yüz montajı şablonu fikri ver. Doktor, bilim insanı, sanatçı gibi daha fazla meslek dahil olmak üzere geniş bir tema yelpazesi sun. ${existingTemplatesPrompt} Cevabını şu JSON formatında bir dizi olarak döndür: [{ "id": "string", "name": "string", "prompt": "string" }]. 'name' kullanıcıya gösterilecek Türkçe isim olmalı (örneğin 'Süper Kahraman'). 'prompt' ise bu şablon görselini oluşturmak için kullanılacak, yüz montajı için mükemmel, karakterin tüm kafasının, boynunun ve omuzlarının net bir şekilde göründüğü, öne baktığı bir portre veya vücut fotoğrafı üretecek detaylı İngilizce bir komut olmalı. Yüz ifadesi nötr olmalı ve yüzün üzerine başka bir yüzün kolayca yerleştirilebileceği şekilde açık olmalıdır. (örneğin 'Portrait photo of a superhero, facing forward, full head and shoulders visible, neutral expression, clear lighting on face, high detail, cinematic lighting'). Komutlar, kafasız veya yüzsüz görseller istemekten KAÇINMALIDIR.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              prompt: { type: Type.STRING },
            },
            required: ["id", "name", "prompt"],
          },
        },
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error generating montage templates:", error);
    throw new Error('Şablon fikirleri üretilirken bir hata oluştu.');
  }
};


export const generateTemplateImage = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        const firstPart = response.candidates?.[0]?.content?.parts?.[0];
        if (firstPart && 'inlineData' in firstPart && firstPart.inlineData) {
            const base64ImageBytes = firstPart.inlineData.data;
            const mimeType = firstPart.inlineData.mimeType;
            return `data:${mimeType};base64,${base64ImageBytes}`;
        }
        
        throw new Error('API tarafından bir şablon görseli oluşturulmadı.');

    } catch(error) {
        console.error("Error generating template image:", error);
        
        const errorMessage = JSON.stringify(error);
        if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
             throw new Error('Görsel oluşturma hız sınırını aştınız. Lütfen bir dakika bekleyip tekrar deneyin. Sorun devam ederse fatura ayarlarınızı kontrol edin.');
        }

        throw new Error('Şablon görseli oluşturulamadı.');
    }
};