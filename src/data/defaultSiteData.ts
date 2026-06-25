import type { SiteData } from "@/lib/types";

export const defaultSiteData: SiteData = {
  settings: {
    brand: "ROOM",
    locale: "en",
    whatsappNumber: "994501234567",
    email: "info@roombaku.com",
    phone: "+994 50 123 45 67",
    address: "Nizami St. 85, Baku, Azerbaijan",
    instagram: "https://instagram.com/roombaku",
    facebook: "https://facebook.com/roombaku",
  },
  home: {
    eyebrow: "Contemporary art space in Baku",
    headline: "Art lives here",
    intro:
      "ROOM is a contemporary gallery and cultural platform shaped around artists, collectors, exhibitions, and slow encounters with art.",
    heroImage: "/assets/interiors/hero-gallery.jpg",
    currentExhibitionSlug: "seven-ya",
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
    {
      slug: "nargis-mammadova",
      name: "Nargis Mammadova",
      role: "Installation artist",
      portrait: "/assets/artists/nargis.jpg",
      bio: "Nargis works across objects, scent, light, and installation to build intimate environments.",
      statement:
        "I am interested in rooms as emotional containers: what they allow, hide, and transform.",
    },
  ],
  artworks: [
    {
      slug: "seven-ya-study",
      title: "Seven Ya Study",
      artistSlug: "aliyev-farid",
      year: "2026",
      medium: "Oil and mineral pigment on canvas",
      category: "Painting",
      dimensions: "140 x 180 cm",
      image: "/assets/artworks/artwork-1.jpg",
      availability: "Available",
      description:
        "A large atmospheric work from the Seven Ya cycle, balancing dark mineral surfaces with warm flashes of exposed ground.",
    },
    {
      slug: "quiet-object",
      title: "Quiet Object",
      artistSlug: "orxhan-huseynov",
      year: "2025",
      medium: "Patinated plaster and stone dust",
      category: "Sculpture",
      dimensions: "48 x 36 x 30 cm",
      image: "/assets/artworks/artwork-2.jpg",
      availability: "Available",
      description:
        "A compact sculptural form made for close viewing, with a surface that shifts between archaeological and domestic.",
    },
    {
      slug: "baku-interior",
      title: "Baku Interior",
      artistSlug: "sabina-shikhli",
      year: "2026",
      medium: "Archival pigment print",
      category: "Photography",
      dimensions: "70 x 90 cm",
      image: "/assets/artworks/artwork-3.jpg",
      availability: "Reserved",
      description:
        "A photographic work about low light, interior silence, and the city sensed through rooms rather than streets.",
    },
    {
      slug: "folded-archive",
      title: "Folded Archive",
      artistSlug: "gunel-agayeva",
      year: "2025",
      medium: "Paper, textile, graphite",
      category: "Mixed media",
      dimensions: "100 x 120 cm",
      image: "/assets/artworks/artwork-4.jpg",
      availability: "Available",
      description:
        "A tactile composition built from layered paper and fabric, with marks that suggest private notes and erased maps.",
    },
    {
      slug: "after-hours",
      title: "After Hours",
      artistSlug: "elnur-babayev",
      year: "2026",
      medium: "Acrylic and ash on canvas",
      category: "Painting",
      dimensions: "160 x 130 cm",
      image: "/assets/artworks/artwork-5.jpg",
      availability: "Private collection",
      description:
        "A dense painting that turns the gallery atmosphere into a field of scraped color, reflection, and suspended light.",
    },
    {
      slug: "room-for-memory",
      title: "Room for Memory",
      artistSlug: "nargis-mammadova",
      year: "2026",
      medium: "Installation study, mixed materials",
      category: "Installation",
      dimensions: "Variable",
      image: "/assets/artworks/artwork-6.jpg",
      availability: "Available",
      description:
        "A study for an installation that treats memory as a physical arrangement of objects, shadows, and thresholds.",
    },
  ],
  exhibitions: [
    {
      slug: "seven-ya",
      title: "Seven Ya",
      type: "Exhibition",
      status: "Upcoming",
      date: "25 Apr - 25 May 2026",
      image: "/assets/events/seven-ya.jpg",
      description:
        "A focused exhibition on layered identity, family memory, and the symbolic charge of repetition.",
    },
    {
      slug: "artist-talk-with-gunel",
      title: "Artist Talk with Gunel",
      type: "Event",
      status: "Upcoming",
      date: "8 Jun 2026",
      image: "/assets/events/artist-talk.jpg",
      description:
        "An evening conversation about process, material research, and the role of intimate archives in contemporary practice.",
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
    image: "/assets/interiors/about-room.jpg",
  },
};
