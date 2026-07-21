import type { SiteData } from "@/lib/types";

export const defaultSiteData: SiteData = {
  settings: {
    whatsappNumber: "994501234567",
    email: "info@roombaku.com",
    phone: "+994 50 123 45 67",
    address: "Nizami St. 85, Baku, Azerbaijan",
    instagram: "https://instagram.com/roombaku",
    facebook: "https://facebook.com/roombaku",
  },
  artists: [
    {
      slug: "aliyev-farid",
      name: "Aliyev Farid",
      role: "Painter",
      portrait: "/assets/artists/farid.jpg",
      bio: "Farid works with layered surfaces, muted pigments, and fragments of urban memory collected around Baku.",
      statement:
        "I treat the canvas as a room where traces can stay visible: touch, silence, distance, and the pressure of time.",
    },
    {
      slug: "gunel-agayeva",
      name: "Gunel Agayeva",
      role: "Mixed media artist",
      portrait: "/assets/artists/gunel.jpg",
      bio: "Gunel combines paper, textile, mineral tones, and archival gestures into quiet material compositions.",
      statement:
        "My practice is about fragile systems: the things we keep, cover, fold, and later rediscover.",
    },
    {
      slug: "orxhan-huseynov",
      name: "Orxhan Huseynov",
      role: "Sculptor",
      portrait: "/assets/artists/orxhan.jpg",
      bio: "Orxhan explores weight, shadow, and imperfect geometry through compact sculptural forms.",
      statement:
        "I look for the moment when a solid object begins to feel temporary, almost like a thought.",
    },
    {
      slug: "sabina-shikhli",
      name: "Sabina Shikhli",
      role: "Photographer",
      portrait: "/assets/artists/sabina.jpg",
      bio: "Sabina creates monochrome studies of interiors, bodies, and transitional city spaces.",
      statement:
        "Photography lets me hold the interval between a place being empty and being remembered.",
    },
    {
      slug: "elnur-babayev",
      name: "Elnur Babayev",
      role: "Painter",
      portrait: "/assets/artists/elnur.jpg",
      bio: "Elnur builds dense atmospheric paintings from smoke-like marks, scraped color, and architectural rhythm.",
      statement:
        "A painting should not explain itself immediately. It should make the viewer adjust their eyes.",
    },
  ],
  artworks: [
    {
      slug: "children",
      title: "Children",
      artistSlug: "aliyev-farid",
      year: "2026",
      dimensions: "140 x 100 cm",
      widthCm: 140,
      heightCm: 100,
      image: "/assets/artworks/children.jpg",
      availability: "Available",
      description: "A striking composition exploring the interplay of childhood memory and portraiture, rendered in warm earthy tones.",
    },
    {
      slug: "head",
      title: "Head",
      artistSlug: "elnur-babayev",
      year: "2026",
      dimensions: "80 x 100 cm",
      widthCm: 80,
      heightCm: 100,
      image: "/assets/artworks/head.jpg",
      availability: "Available",
      description: "An intimate portrait study that captures the essence of human presence through abstracted forms and muted color fields.",
    },
    {
      slug: "ioan",
      title: "Ioan",
      artistSlug: "gunel-agayeva",
      year: "2025",
      dimensions: "70 x 90 cm",
      widthCm: 70,
      heightCm: 90,
      image: "/assets/artworks/ioan.jpg",
      availability: "Available",
      description: "A layered mixed-media work that combines delicate textures with bold gestural marks, creating a dialogue between surface and depth.",
    },
    {
      slug: "sea",
      title: "Sea",
      artistSlug: "sabina-shikhli",
      year: "2026",
      dimensions: "140 x 80 cm",
      widthCm: 140,
      heightCm: 80,
      image: "/assets/artworks/sea.jpg",
      availability: "Available",
      description: "A panoramic seascape that captures the horizon as a liminal space between earth and sky, rendered in subtle gradients.",
    },
    {
      slug: "sky",
      title: "Sky",
      artistSlug: "orxhan-huseynov",
      year: "2026",
      dimensions: "50 x 70 cm",
      widthCm: 50,
      heightCm: 70,
      image: "/assets/artworks/sky.jpg",
      availability: "Reserved",
      description: "A vertical study of the sky as sculptural form — minimal, atmospheric, and emotionally resonant.",
    },
  ],
  exhibitions: [
    {
      slug: "artist-talk-with-elnur",
      title: "Artist Talk with Elnur",
      type: "Event",
      status: "Upcoming",
      date: "15 Jun 2026",
      image: "/assets/events/artist-talk.jpg",
      description:
        "Elnur Babayev discusses his atmospheric painting technique and the rhythm of architectural space.",
    },
    {
      slug: "seven-ya",
      title: "Seven Ya",
      type: "Exhibition",
      status: "Current",
      date: "25 Apr — 25 May 2026",
      image: "/assets/events/seven-ya.jpg",
      description:
        "A focused exhibition on layered identity, family memory, and the symbolic charge of repetition.",
    },
    {
      slug: "memories-of-objects",
      title: "Memories of Objects",
      type: "Exhibition",
      status: "Past",
      date: "Aug 2024",
      image: "/assets/events/memories.jpg",
      description:
        "A past exhibition exploring sculptural fragments, domestic rituals, and objects as carriers of memory.",
    },
  ],
  about: {
    concept:
      "ROOM is a contemporary art space in the heart of Baku where art, wine, and culture come together through exhibitions, talks, and curated encounters.",
    vision:
      "To support contemporary artists and build a thoughtful creative community around collecting, learning, and conversation.",
    identity:
      "Minimal, neutral, atmospheric, and emotionally precise. ROOM places the artwork first and lets the digital experience behave like a gallery visit.",
  },
};