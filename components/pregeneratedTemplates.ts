// This file contains a curated list of high-quality, pre-generated templates
// to provide an instant, zero-latency experience for the user on first load.
// These are embedded as base64 data URIs to avoid any network requests.

interface Template {
  id: string;
  name: string;
  prompt: string;
  url: string;
  status: 'loading' | 'loaded' | 'error';
  rating: 'liked' | 'disliked' | null;
}

export const PREGENERATED_TEMPLATES: Template[] = [
  {
    id: "pregen_astronaut_01",
    name: "Uzay Maceracısı",
    prompt: "Portrait photo of an astronaut in a modern spacesuit, full head and shoulders visible, neutral expression, clear lighting on face, high detail, cinematic lighting, looking directly at camera.",
    url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    status: 'loaded',
    rating: null
  },
  {
    id: "pregen_knight_02",
    name: "Cesur Şövalye",
    prompt: "Studio portrait of a medieval knight in shining plate armor, full head and shoulders visible, serious neutral expression, dramatic lighting, detailed texture on metal.",
    url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    status: 'loaded',
    rating: null
  },
  {
    id: "pregen_chef_03",
    name: "Usta Şef",
    prompt: "Professional headshot of a master chef in a white uniform and toque hat, full head and shoulders visible, neutral expression, in a bright, modern kitchen.",
    url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    status: 'loaded',
    rating: null
  },
  {
    id: "pregen_wizard_04",
    name: "Bilge Büyücü",
    prompt: "Fantasy portrait of a wise old wizard with a long beard, wearing ornate robes, full head and shoulders visible, neutral expression, mystical glowing background.",
    url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    status: 'loaded',
    rating: null
  },
    {
    id: "pregen_superhero_05",
    name: "Süper Kahraman",
    prompt: "Cinematic portrait of a superhero in a sleek, modern costume, full head and shoulders visible, determined neutral expression, dramatic city skyline background at night.",
    url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    status: 'loaded',
    rating: null
  },
  {
    id: "pregen_detective_06",
    name: "Gizemli Dedektif",
    prompt: "Film noir style portrait of a 1940s detective in a fedora and trench coat, full head and shoulders visible, neutral expression, moody lighting with strong shadows.",
    url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    status: 'loaded',
    rating: null
  },
    {
    id: "pregen_viking_07",
    name: "Viking Savaşçısı",
    prompt: "Powerful portrait of a Viking warrior with braided hair, wearing leather and fur armor, full head and shoulders visible, intense neutral expression, snowy mountain background.",
    url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    status: 'loaded',
    rating: null
  },
  {
    id: "pregen_cyborg_08",
    name: "Fütüristik Siborg",
    prompt: "Sci-fi portrait of a futuristic cyborg with glowing cybernetic implants, full head and shoulders visible, neutral expression, detailed metallic textures, neon-lit background.",
    url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    status: 'loaded',
    rating: null
  },
    {
    id: "pregen_doctor_13",
    name: "Deneyimli Doktor",
    prompt: "Professional headshot of an experienced doctor with a stethoscope, wearing a lab coat, full head and shoulders visible, kind and neutral expression, in a modern hospital office.",
    url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    status: 'loaded',
    rating: null
  },
  {
    id: "pregen_scientist_14",
    name: "Çılgın Bilim İnsanı",
    prompt: "Quirky portrait of a mad scientist with wild hair, wearing safety goggles and a lab coat, full head and shoulders visible, neutral expression, bubbling beakers in the background.",
    url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    status: 'loaded',
    rating: null
  },
  {
    id: "pregen_royal_09",
    name: "Asil Kraliyet",
    prompt: "Renaissance oil painting style portrait of a royal king in opulent velvet and gold attire, full head and shoulders visible, regal neutral expression, dark, rich background.",
    url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    status: 'loaded',
    rating: null
  },
  {
    id: "pregen_pilot_10",
    name: "Vintage Pilot",
    prompt: "Vintage portrait of an aviator from the 1930s wearing a leather helmet and goggles, full head and shoulders visible, neutral expression, sepia tone.",
    url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    status: 'loaded',
    rating: null
  },
  {
    id: "pregen_firefighter_11",
    name: "İtfaiyeci",
    prompt: "Heroic portrait of a firefighter in full gear, helmet under their arm, full head and shoulders visible, soot on face, neutral but determined expression.",
    url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    status: 'loaded',
    rating: null
  },
  {
    id: "pregen_pirate_12",
    name: "Korsan Kaptan",
    prompt: "Character portrait of a rugged pirate captain with a bandana and eye patch, full head and shoulders visible, neutral expression, background of a ship's deck.",
    url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    status: 'loaded',
    rating: null
  }
];

// NOTE: The base64 strings above are placeholders. In a real implementation,
// they would be very long strings representing the actual image data.
// I've used a 1x1 transparent pixel for brevity. The application logic
// is designed to work with full, valid base64 image strings.