/**
 * EN-словарь — эталон структуры. Тип Dictionary выводится из него,
 * поэтому az.ts обязан повторять форму ключей (проверяется компилятором).
 *
 * Динамические строки — функции; статические — строки. Админка остаётся
 * английской и словарями не покрывается.
 */

export const en = {
  meta: {
    siteTitle: "ROOM — Contemporary Art Space",
    titleTemplate: "%s — ROOM",
    description:
      "ROOM is a contemporary art space in Baku where art, wine, and culture come together through exhibitions, artists, and curated encounters.",
    ogDescription:
      "A contemporary art space in Baku where art, wine, and culture come together through exhibitions, artists, and curated encounters.",
  },

  nav: {
    gallery: "Gallery",
    artists: "Artists",
    events: "Events",
    about: "About",
    contact: "Contact",
    openNav: "Open navigation",
    closeNav: "Close navigation",
    switchLabel: "Switch language",
  },

  footer: {
    rights: "All rights reserved.",
    copyright:
      "All images and content are protected by copyright. Unauthorized copying, reproduction, or distribution is prohibited and may be prosecuted under applicable law.",
  },

  home: {
    typewriter: ["Gallery.", "Exhibitions.", "Platform."] as string[],
    nowShowing: "Now showing",
    kickerCurrent: "Current event",
    kickerPast: "Past event",
    kickerUpcoming: "Upcoming event",
    kickerEvents: "Events",
    kickerCollection: "The Collection",
    explore: "Explore",
    exploreMeta: "Curated works by our artists",
    allEvents: "All events",
    artistsTitle: "Artists",
    artistsCopy: "Individual practices with biographies, statements, and portfolios.",
    allArtists: "All artists",
    aboutTitle: "About us",
    aboutP1:
      "ROOM is a contemporary art and cultural space where art, people, ideas, and experiences come together.",
    aboutP2:
      "ROOM brings together artists, exhibitions, events, and a constantly evolving selection of artworks within a space that connects contemporary art with everyday life.",
    aboutP3:
      "Rather than functioning as a traditional gallery, ROOM creates an open environment for artists and audiences to meet, discover new perspectives, and engage with art in different ways.",
    aboutP4:
      "Through exhibitions, artist collaborations, talks, and cultural events, ROOM aims to create a dynamic platform for artistic exchange and meaningful connections.",
    connectTitle: "Let's connect",
    contactBtn: "Contact",
    roomInteriorAlt: "Room interior",
    onDisplay: "Currently on display in Room",
    allGallery: "All gallery",
    goToArtwork: (n: number) => `Go to artwork ${n}`,
  },

  gallery: {
    kicker: "Artworks",
    title: "Gallery",
    inCollection: (n: number) =>
      `${n} artwork${n === 1 ? "" : "s"} in the collection`,
    filterArtist: "Artist",
    filterFormat: "Format",
    filterSize: "Size",
    filterPrice: "Price",
    all: "All",
    landscape: "Landscape",
    square: "Square",
    portrait: "Portrait",
    small: "Small",
    medium: "Medium",
    large: "Large",
    priceUnder: "Under AZN 1,000",
    priceMid1: "AZN 1,000 – 3,000",
    priceMid2: "AZN 3,000 – 5,000",
    priceOver: "Over AZN 5,000",
    count: (n: number) => `${n} artwork${n === 1 ? "" : "s"}`,
    pageOf: (page: number, total: number) => `page ${page} of ${total}`,
    empty: "No artworks match the selected filters.",
    pagination: "Gallery pagination",
    prevPage: "Previous page",
    nextPage: "Next page",
    goToPage: (n: number) => `Page ${n}`,
    viewArtwork: "View artwork",
    scrollHint: "Scroll",
    skip: "Skip",
    skipToNext: "Skip to next artwork",
    onDisplayTitle: "What's currently on display at ROOM",
  },

  artwork: {
    dimensions: "Dimensions",
    availability: "Availability",
    price: "Price",
    inquireWhatsapp: "Inquire on WhatsApp",
    showMagnifier: "Show magnifier",
    hideMagnifier: "Hide magnifier",
    openFull: (title: string) => `Open full-size image of ${title}`,
    prevArtwork: (title: string) => `Previous artwork: ${title}`,
    nextArtwork: (title: string) => `Next artwork: ${title}`,
    fallbackArtist: "ROOM artist",
    available: "Available",
    reserved: "Reserved",
    privateCollection: "Private collection",
  },

  artists: {
    kicker: "Room artist base",
    title: "Artists",
    copy: "Artists we work with, individual profiles, statements, and portfolios.",
    viewArtist: "View artist",
    artworks: "Artworks",
    goTo: (name: string) => `Go to ${name}`,
  },

  events: {
    kicker: "Events",
    title: "Events at ROOM",
    nowShowing: "Now showing",
    upcoming: "Upcoming",
    past: "Past",
    pastArchive: "Past archive",
    viewEvent: "View event",
    allEvents: "All events",
    noImage: "No image",
    goTo: (n: number) => `Go to event ${n}`,
    noCurrent: "No current events",
    noUpcoming: "No upcoming events",
    noPast: "No past events",
  },

  about: {
    title: "About Us",
    visionTitle: "Vision",
    visionP1:
      "To create an open and evolving space where art becomes a natural part of everyday cultural life.",
    visionP2:
      "ROOM envisions a community where artists, audiences, ideas, and different forms of creative expression can come together, creating opportunities for discovery, dialogue, and collaboration.",
    missionTitle: "Mission",
    missionP1:
      "Our mission is to support artists, make contemporary art more accessible, and create meaningful opportunities for people to discover and engage with art.",
    missionP2:
      "Through exhibitions, events, artist collaborations, and our digital platform, ROOM connects artists and audiences while creating a space for new ideas and cultural exchange.",
    moreTitle: "Explore More Works",
    moreP1: "Looking for something beyond the works currently displayed?",
    moreP2:
      "The selection presented on our website and in the space is only part of the artists' practices and available works.",
    moreP3:
      "If you are interested in seeing additional works by an artist, exploring other artworks that are not currently on display, get in touch with us. We will be happy to provide further information and share available works upon request.",
    moreP4: "For artwork enquiries, please contact us via WhatsApp.",
  },

  contact: {
    title: "Let's connect",
    copy: "For collaborations, events, artist proposals, partnerships, and private viewings.",
    visitUs: "Visit us",
    namePlaceholder: "Name",
    emailPlaceholder: "Email",
    subjectPlaceholder: "Subject",
    messagePlaceholder: "Message",
    send: "Send message",
    thankYou: "Thank you!",
    sent: "Your message has been sent. We will get back to you soon.",
    errValidation: "Please check the required fields and their length.",
    errRateLimit: "Please wait a few minutes before sending another message.",
    errNotConfigured: "Email service is not configured.",
    errSend: "Failed to send message. Please try again later.",
  },

  whatsapp: {
    artworkInquiry: (title: string, year: string) =>
      `Hello ROOM, I would like to inquire about "${title}"${year ? ` (${year})` : ""}.`,
    contactMessage: (subject: string) =>
      `Hello ROOM, I would like to discuss ${subject}.`,
    subjectCollab: "collaboration",
  },

  ui: {
    scrollToTop: "Scroll to top",
    close: "Close",
    previous: "Previous",
    next: "Next",
  },

  notFound: {
    kicker: "404",
    title: "Page not found",
    copy: "The page you are looking for doesn't exist or has been moved.",
    back: "Back to home",
  },

  errorPage: {
    kicker: "Error",
    title: "Something went wrong",
    copy: "An unexpected error occurred. Please try again or return to the homepage.",
    retry: "Try again",
    back: "Back to home",
  },

  loading: "Loading...",

  pages: {
    artworkNotFound: "Artwork not found",
    artistNotFound: "Artist not found",
    eventNotFound: "Event not found",
  },
};

export type Dictionary = typeof en;
