/**
 * AZ-словарь. Термины сверены с docs/i18n-glossary.md
 * (artspace.az, qgallery.net, Wikipedia AZ, ecaz.az).
 * Форма ключей контролируется типом Dictionary из en.ts.
 */

import type { Dictionary } from "./en";

export const az: Dictionary = {
  meta: {
    siteTitle: "ROOM — Müasir Sənət Məkanı",
    titleTemplate: "%s — ROOM",
    description:
      "ROOM Bakıda müasir sənət məkanıdır — burada sənət, şərab və mədəniyyət sərgilər, rəssamlar və seçilmiş görüşlər vasitəsilə bir araya gəlir.",
    ogDescription:
      "Bakıda sənət, şərab və mədəniyyətin sərgilər, rəssamlar və seçilmiş görüşlər vasitəsilə bir araya gəldiyi müasir sənət məkanı.",
  },

  nav: {
    gallery: "Qalereya",
    artists: "Rəssamlar",
    events: "Tədbirlər",
    about: "Haqqımızda",
    contact: "Əlaqə",
    openNav: "Naviqasiyanı aç",
    closeNav: "Naviqasiyanı bağla",
    switchLabel: "Dili dəyiş",
  },

  footer: {
    rights: "Bütün hüquqlar qorunur.",
    copyright:
      "Bütün şəkillər və məzmun müəllif hüquqları ilə qorunur. İcazəsiz surət çıxarma, çoxaltma və ya yayım qadağandır və qanunvericiliyə uyğun məsuliyyətə səbəb ola bilər.",
  },

  home: {
    typewriter: ["Qalereya.", "Sərgilər.", "Platforma."] as string[],
    nowShowing: "Hazırda nümayişdə",
    kickerCurrent: "Cari tədbir",
    kickerPast: "Keçmiş tədbir",
    kickerUpcoming: "Yaxınlaşan tədbir",
    kickerEvents: "Tədbirlər",
    kickerCollection: "Kolleksiya",
    explore: "Kəşf edin",
    exploreMeta: "Rəssamlarımızın seçilmiş əsərləri",
    allEvents: "Bütün tədbirlər",
    artistsTitle: "Rəssamlar",
    artistsCopy:
      "Bioqrafiyalar, yaradıcılıq bəyanatları və portfoliolardan ibarət fərdi yaradıcılıq.",
    allArtists: "Bütün rəssamlar",
    aboutTitle: "Haqqımızda",
    aboutP1:
      "ROOM müasir sənət və mədəniyyət məkanıdır — burada sənət, insanlar, ideyalar və təcrübələr bir araya gəlir.",
    aboutP2:
      "ROOM rəssamları, sərgiləri, tədbirləri və daim inkişaf edən əsər seçimini müasir sənəti gündəlik həyatla birləşdirən məkanda bir araya gətirir.",
    aboutP3:
      "Ənənəvi qalereya kimi fəaliyyət göstərmək əvəzinə, ROOM rəssamlar və tamaşaçılar üçün görüşmək, yeni perspektivlər kəşf etmək və sənətlə fərqli şəkildə məşğul olmaq üçün açıq mühit yaradır.",
    aboutP4:
      "Sərgilər, rəssamlarla əməkdaşlıq, çıxışlar və mədəni tədbirlər vasitəsilə ROOM sənət mübadiləsi və mənalı əlaqələr üçün dinamik platforma yaratmağı hədəfləyir.",
    connectTitle: "Gəlin əlaqə saxlayaq",
    contactBtn: "Əlaqə",
    roomInteriorAlt: "Məkan interyeri",
    onDisplay: "Hazırda ROOM-da nümayişdə",
    allGallery: "Bütün əsərlər",
    goToArtwork: (n: number) => `${n}-li əsərə keç`,
  },

  gallery: {
    kicker: "Əsərlər",
    title: "Qalereya",
    inCollection: (n: number) => `Kolleksiyada ${n} əsər var`,
    filterArtist: "Rəssam",
    filterFormat: "Format",
    filterSize: "Ölçü",
    filterPrice: "Qiymət",
    all: "Hamısı",
    landscape: "Üfüqi",
    square: "Kvadrat",
    portrait: "Şaquli",
    small: "Kiçik",
    medium: "Orta",
    large: "Böyük",
    priceUnder: "1 000 AZN-dək",
    priceMid1: "1 000 – 3 000 AZN",
    priceMid2: "3 000 – 5 000 AZN",
    priceOver: "5 000 AZN-dən yuxarı",
    count: (n: number) => `${n} əsər`,
    pageOf: (page: number, total: number) => `səhifə ${page} / ${total}`,
    empty: "Seçilmiş filtrlərə uyğun əsər tapılmadı.",
    pagination: "Qalereya səhifələməsi",
    prevPage: "Əvvəlki səhifə",
    nextPage: "Növbəti səhifə",
    goToPage: (n: number) => `Səhifə ${n}`,
    viewArtwork: "Əsərə bax",
    scrollHint: "Sürüşdürün",
    skip: "Keç",
    skipToNext: "Növbəti əsərə keç",
    onDisplayTitle: "ROOM-da hazırda nümayişdə olan əsərlər",
  },

  artwork: {
    dimensions: "Ölçü",
    availability: "Mövcudluq",
    price: "Qiymət",
    inquireWhatsapp: "WhatsApp-da maraqlanın",
    showMagnifier: "Lupanı göstər",
    hideMagnifier: "Lupanı gizlət",
    openFull: (title: string) => `${title} tam ölçüdə aç`,
    prevArtwork: (title: string) => `Əvvəlki əsər: ${title}`,
    nextArtwork: (title: string) => `Növbəti əsər: ${title}`,
    fallbackArtist: "ROOM rəssamı",
    available: "Satışda",
    reserved: "Rezerv edilib",
    privateCollection: "Şəxsi kolleksiya",
  },

  artists: {
    kicker: "ROOM rəssamlar bazası",
    title: "Rəssamlar",
    copy: "İşlədiyimiz rəssamlar, fərdi profillər, bəyanatlar və portfoliolar.",
    viewArtist: "Rəssama bax",
    artworks: "Əsərlər",
    goTo: (name: string) => `${name} keç`,
  },

  events: {
    kicker: "Tədbirlər",
    title: "ROOM-da tədbirlər",
    nowShowing: "Hazırda nümayişdə",
    upcoming: "Yaxınlaşan",
    past: "Keçmiş",
    pastArchive: "Arxiv",
    viewEvent: "Tədbirə bax",
    allEvents: "Bütün tədbirlər",
    noImage: "Şəkil yoxdur",
    goTo: (n: number) => `${n}-li tədbirə keç`,
    noCurrent: "Cari tədbir yoxdur",
    noUpcoming: "Yaxınlaşan tədbir yoxdur",
    noPast: "Keçmiş tədbir yoxdur",
  },

  about: {
    title: "Haqqımızda",
    visionTitle: "Baxış",
    visionP1:
      "Sənətin gündəlik mədəni həyatın təbii hissəsinə çevrildiyi açıq və inkişaf edən məkan yaratmaq.",
    visionP2:
      "ROOM rəssamların, tamaşaçıların, ideyaların və yaradıcı ifadənin müxtəlif formalarının bir araya gəldiyi, kəşf, dialoq və əməkdaşlıq imkanları yaradan bir icma təsəvvür edir.",
    missionTitle: "Missiya",
    missionP1:
      "Missiyamız rəssamları dəstəkləmək, müasir sənəti daha əlçatan etmək və insanlara sənəti kəşf etmək və onunla məşğul olmaq üçün mənalı imkanlar yaratmaqdır.",
    missionP2:
      "Sərgilər, tədbirlər, rəssamlarla əməkdaşlıq və rəqəmsal platformamız vasitəsilə ROOM rəssamları və tamaşaçıları birləşdirir, yeni ideyalar və mədəni mübadilə üçün məkan yaradır.",
    moreTitle: "Daha çox əsərə baxın",
    moreP1: "Hazırda nümayişdə olan əsərlərdən başqa nəsə axtarırsınız?",
    moreP2:
      "Saytımızda və məkanda təqdim olunan seçim rəssamların yaradıcılığının və mövcud əsərlərin yalnız bir hissəsidir.",
    moreP3:
      "Rəssamın əlavə əsərlərinə baxmaqda və ya hazırda nümayişdə olmayan digər əsərləri araşdırmaqda maraqlısınızsa, bizimlə əlaqə saxlayın. Məmnuniyyətlə əlavə məlumat verəcəyik və tələbə uyğun mövcud əsərləri təqdim edəcəyik.",
    moreP4:
      "Əsərlərlə bağlı sorğular üçün bizimlə WhatsApp vasitəsilə əlaqə saxlayın.",
  },

  contact: {
    title: "Gəlin əlaqə saxlayaq",
    copy: "Əməkdaşlıq, tədbirlər, rəssam təklifləri, tərəfdaşlıq və fərdi baxışlar üçün.",
    visitUs: "Bizi ziyarət edin",
    namePlaceholder: "Ad",
    emailPlaceholder: "E-poçt",
    subjectPlaceholder: "Mövzu",
    messagePlaceholder: "Mesaj",
    send: "Mesaj göndər",
    thankYou: "Təşəkkür edirik!",
    sent: "Mesajınız göndərildi. Tezliklə sizinlə əlaqə saxlayacağıq.",
    errValidation: "Zəhmət olmasa, tələb olunan sahələri və onların uzunluğunu yoxlayın.",
    errRateLimit: "Zəhmət olmasa, başqa mesaj göndərməzdən bir neçə dəqiqə gözləyin.",
    errNotConfigured: "E-poçt xidməti quraşdırılmayıb.",
    errSend: "Mesajı göndərmək mümkün olmadı. Zəhmət olmasa, sonra yenidən cəhd edin.",
  },

  whatsapp: {
    artworkInquiry: (title: string, year: string) =>
      `Salam ROOM, "${title}"${year ? ` (${year})` : ""} barədə maraqlanmaq istərdim.`,
    contactMessage: (subject: string) =>
      `Salam ROOM, ${subject} barədə danışmaq istərdim.`,
    subjectCollab: "əməkdaşlıq",
  },

  ui: {
    scrollToTop: "Yuxarı qalx",
    close: "Bağla",
    previous: "Əvvəlki",
    next: "Növbəti",
  },

  notFound: {
    kicker: "404",
    title: "Səhifə tapılmadı",
    copy: "Axtardığınız səhifə mövcud deyil və ya köçürülüb.",
    back: "Ana səhifəyə qayıt",
  },

  errorPage: {
    kicker: "Xəta",
    title: "Bir şey səhv getdi",
    copy: "Gözlənilməz xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin və ya ana səhifəyə qayıdın.",
    retry: "Yenidən cəhd edin",
    back: "Ana səhifəyə qayıt",
  },

  loading: "Yüklənir...",

  pages: {
    artworkNotFound: "Əsər tapılmadı",
    artistNotFound: "Rəssam tapılmadı",
    eventNotFound: "Tədbir tapılmadı",
  },
};
