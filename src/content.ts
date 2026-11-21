import type { DayKey } from './utils/khanLogic';

export type Lang = 'ar' | 'fr';

export interface ResponsivePhoto {
  src: string;
  srcSet: string;
  width: number;
  height: number;
  altAr: string;
  altFr: string;
}

export interface OptionalMenuItem {
  nameAr: string;
  nameFr: string;
  price: string;
}

export interface ReviewItem {
  id: string;
  author: string;
  lang: 'en' | 'fr';
  quote: string;
  underlineWords: string[];
}

export interface VideoReelItem {
  id: 'a' | 'b';
  src: string;
  poster: string;
  width: number;
  height: number;
  labelAr: string;
  labelFr: string;
}

export interface GameTilePhoto {
  pairId: string;
  src: string;
  srcSet: string;
  imgClassName?: string;
  altAr: string;
  altFr: string;
}

export const BRAND_DATA = {
  nameAr: 'الخَّان',
  nameLat: 'ELKHAN',
  eyebrow: 'COFFEE & BRUNCH · EL BIAR, ALGER',
  address: "BT N°01, Résidence Chabani, 08 Chemin de Val d'Hydra, El Biar 16000, Alger",
  phoneDisplay: '0552 85 06 96',
  phoneHref: 'tel:+213552850696',
  instagramHandle: '@elkhancoffeeshop',
  instagramUrl: 'https://instagram.com/elkhancoffeeshop',
  mapsUrl: 'https://maps.app.goo.gl/Ff61BEv6fCTCUn818',
  mapsEmbedUrl:
    'https://www.google.com/maps?q=BT+N+01,+Residence+Chabani,+08+Chemin+de+Val+d+Hydra,+El+Biar+16000,+Alger&output=embed',
  googleRating: '4,7',
  googleReviewCount: 226,
  averageSpendAr: 'متوسط الإنفاق للشخص حسب زوّار Google: 1000–2000 دج',
  averageSpendFr: 'Dépense moyenne par personne selon les visiteurs Google : 1000–2000 DA',
  hoursSummary: [
    {
      key: 'weekdays' as const,
      days: ['sat', 'sun', 'mon', 'tue', 'wed', 'thu'] as DayKey[],
      labelAr: 'السبت – الخميس',
      labelFr: 'Samedi – Jeudi',
      time: '10:00 – 21:00',
    },
    {
      key: 'friday' as const,
      days: ['fri'] as DayKey[],
      labelAr: 'الجمعة',
      labelFr: 'Vendredi',
      time: '15:00 – 22:00',
    },
  ],
  themesMentioned: [
    { key: 'music' as const, ar: 'موسيقى', fr: 'musique', count: 23, reviewIndex: 2 },
    { key: 'croissant' as const, ar: 'كرواسون', fr: 'croissant', count: 17, reviewIndex: null },
    { key: 'service' as const, ar: 'خدمة', fr: 'serveur', count: 9, reviewIndex: 1 },
    { key: 'decor' as const, ar: 'ديكور', fr: 'décoration', count: 7, reviewIndex: 2 },
  ],
};

export const PHOTOS = {
  hero: {
    src: '/images/hero-960.webp',
    srcSet: '/images/hero-480.webp 480w, /images/hero-960.webp 960w',
    width: 960,
    height: 1280,
    altAr: 'طاولة دائرية في مقهى الخان مع بريوش وماتشا وكرواسون وشمعة حمراء وسجاد',
    altFr: 'Table ronde à ElKhan avec brioche, matcha, croissants, bougie rouge et tapis',
  } satisfies ResponsivePhoto,
  storyA: {
    src: '/images/story-damask-960.webp',
    srcSet: '/images/story-damask-480.webp 480w, /images/story-damask-960.webp 960w',
    width: 960,
    height: 1280,
    altAr: 'قاعة الخان بجدران مزخرفة ومصابيح جدارية ومقاعد بلون البوردو',
    altFr: 'Salle ElKhan aux murs à motifs floraux, appliques murales et chaises bordeaux',
  } satisfies ResponsivePhoto,
  storyB: {
    src: '/images/story-walnut-960.webp',
    srcSet: '/images/story-walnut-480.webp 480w, /images/story-walnut-960.webp 960w',
    width: 960,
    height: 1280,
    altAr: 'ألواح خشب داكن وكرسي بذراعين ونبتة خضراء داخل مقهى الخان',
    altFr: 'Boiseries sombres, fauteuil et plante verte à ElKhan',
  } satisfies ResponsivePhoto,
  foodRail: [
    {
      src: '/images/food-salmon-960.webp',
      srcSet: '/images/food-salmon-480.webp 480w, /images/food-salmon-960.webp 960w',
      width: 960,
      height: 1280,
      altAr: 'طبق بريوش وماتشا على طاولة الخان',
      altFr: 'Brioche et matcha sur table à ElKhan',
    },
    {
      src: '/images/food-brie-960.webp',
      srcSet: '/images/food-brie-480.webp 480w, /images/food-brie-960.webp 960w',
      width: 960,
      height: 1280,
      altAr: 'كرواسون على صحن ذهبي اللون في الخان',
      altFr: 'Croissant sur plateau doré à ElKhan',
    },
    {
      src: '/images/food-bastilla-960.webp',
      srcSet: '/images/food-bastilla-480.webp 480w, /images/food-bastilla-960.webp 960w',
      width: 960,
      height: 1190,
      altAr: 'طبق في الخان مع إبريق تقليدي',
      altFr: 'Assiette servie avec théière à ElKhan',
    },
    {
      src: '/images/food-caramel-960.webp',
      srcSet: '/images/food-caramel-480.webp 480w, /images/food-caramel-960.webp 960w',
      width: 960,
      height: 1280,
      altAr: 'كرواسون وعصير وشمعة حمراء في الخان',
      altFr: 'Croissant, jus et bougie rouge à ElKhan',
    },
    {
      src: '/images/food-cookie-960.webp',
      srcSet: '/images/food-cookie-480.webp 480w, /images/food-cookie-960.webp 960w',
      width: 960,
      height: 1280,
      altAr: 'حلوى كوكيز بجانب مزهرية في الخان',
      altFr: 'Douceur sucrée à côté d’un vase à ElKhan',
    },
  ] satisfies ResponsivePhoto[],
  visitInterior: {
    src: '/images/visit-interior-480.webp',
    srcSet: '/images/visit-interior-480.webp 480w',
    width: 480,
    height: 853,
    altAr: 'لقطة من داخل مقهى الخان في الأبيار',
    altFr: "Vue intérieure d'ElKhan à El Biar",
  } satisfies ResponsivePhoto,
  footerCalligraphy: {
    src: '/images/footer-calligraphy-960.webp',
    srcSet: '/images/footer-calligraphy-480.webp 480w, /images/footer-calligraphy-960.webp 960w',
    width: 960,
    height: 1280,
    altAr: 'بطاقة خط عربي باسم الخان على صينية نحاسية',
    altFr: 'Calligraphie arabe ElKhan sur plateau',
  } satisfies ResponsivePhoto,
};

export const VIDEOS: VideoReelItem[] = [
  {
    id: 'a',
    src: '/videos/reel-a.mp4',
    poster: '/videos/reel-a-poster.jpg',
    width: 720,
    height: 960,
    labelAr: 'لحظة من مقهى الخان ١',
    labelFr: 'Moment ElKhan 1',
  },
  {
    id: 'b',
    src: '/videos/reel-b.mp4',
    poster: '/videos/reel-b-poster.jpg',
    width: 720,
    height: 1280,
    labelAr: 'لحظة من مقهى الخان ٢',
    labelFr: 'Moment ElKhan 2',
  },
];

export const REVIEWS: ReviewItem[] = [
  {
    id: 'hadeel',
    author: 'Hadeel',
    lang: 'en',
    quote:
      'A very nice coffee shop, we went there for a meeting with long distance friends the vibes, food, stuff, drinks were so good.',
    underlineWords: ['vibes', 'food', 'drinks'],
  },
  {
    id: 'meriem',
    author: 'Meriem',
    lang: 'fr',
    quote:
      "Une expérience incroyable dans ce coffee shop ! Le café est top, le service irréprochable et l'ambiance donne envie de revenir sans hésiter. Un grand merci et une mention spéciale à Djayza pour son accueil !",
    underlineWords: ['café est top', 'service irréprochable', 'Djayza'],
  },
  {
    id: 'ramzy',
    author: 'Ramzy',
    lang: 'fr',
    quote:
      'Best coffee shop in town ! Le café est excellent et le service orchestré à la perfection. La décoration est sublime, la playlist mérite un 10/10.',
    underlineWords: ['service orchestré', 'décoration est sublime', 'playlist mérite un 10/10'],
  },
];

// Optional menu slot: left empty intentionally; section stays hidden while empty.
export const OPTIONAL_MENU: OptionalMenuItem[] = [];

// Optional game reward slot: null by default; renders nothing while null.
export const GAME_REWARD: { ar: string; fr: string } | null = null;

// 6 memory game pairs using the supplied photos + matcha latte crop from 848307458
export const GAME_PHOTOS: GameTilePhoto[] = [
  {
    pairId: 'salmon',
    src: '/images/food-salmon-960.webp',
    srcSet: '/images/food-salmon-480.webp 480w, /images/food-salmon-960.webp 960w',
    altAr: 'صورة من طاولة الخان ١',
    altFr: 'Photo de table ElKhan 1',
  },
  {
    pairId: 'brie',
    src: '/images/food-brie-960.webp',
    srcSet: '/images/food-brie-480.webp 480w, /images/food-brie-960.webp 960w',
    altAr: 'صورة من طاولة الخان ٢',
    altFr: 'Photo de table ElKhan 2',
  },
  {
    pairId: 'bastilla',
    src: '/images/food-bastilla-960.webp',
    srcSet: '/images/food-bastilla-480.webp 480w, /images/food-bastilla-960.webp 960w',
    altAr: 'صورة من طاولة الخان ٣',
    altFr: 'Photo de table ElKhan 3',
  },
  {
    pairId: 'caramel',
    src: '/images/food-caramel-960.webp',
    srcSet: '/images/food-caramel-480.webp 480w, /images/food-caramel-960.webp 960w',
    altAr: 'صورة من طاولة الخان ٤',
    altFr: 'Photo de table ElKhan 4',
  },
  {
    pairId: 'cookie',
    src: '/images/food-cookie-960.webp',
    srcSet: '/images/food-cookie-480.webp 480w, /images/food-cookie-960.webp 960w',
    altAr: 'صورة من طاولة الخان ٥',
    altFr: 'Photo de table ElKhan 5',
  },
  {
    pairId: 'matcha',
    src: '/images/hero-960.webp',
    srcSet: '/images/hero-480.webp 480w, /images/hero-960.webp 960w',
    imgClassName: 'object-[48%_47%] scale-[2.25]',
    altAr: 'صورة كوب ماتشا في الخان',
    altFr: 'Tasse matcha à ElKhan',
  },
];

export const COPY = {
  nav: [
    { id: 'story', ar: 'المكان', fr: 'Le Lieu' },
    { id: 'table', ar: 'على الطاولة', fr: 'À Table' },
    { id: 'moments', ar: 'لحظات', fr: 'Moments' },
    { id: 'game', ar: 'اللعبة', fr: 'Jeu' },
    { id: 'reviews', ar: 'آراء الضيوف', fr: 'Les Avis' },
    { id: 'visit', ar: 'زورونا', fr: 'Nous Trouver' },
  ],
  actions: {
    directions: { ar: 'الاتجاهات', fr: 'Itinéraire' },
    call: { ar: 'اتصل', fr: 'Appeler' },
    instagram: { ar: 'إنستغرام', fr: 'Instagram' },
    invite: { ar: 'ادعُ صديقًا', fr: 'Inviter un ami' },
    skip: { ar: 'تخطي', fr: 'Passer' },
    menuOpen: { ar: 'القائمة', fr: 'Menu' },
    menuClose: { ar: 'إغلاق', fr: 'Fermer' },
  },
  hero: {
    headlineAr: 'هنا، كل كوب يحمل قصّـة',
    headlineFrCaps: 'CHAQUE TASSE RACONTE UNE HISTOIRE',
    googleSummary: '★ 4,7 · 226 avis Google',
    marqueeText: 'الخان · ELKHAN · COFFEE & BRUNCH ·',
    candleEnableEveningAr: 'إضاءة مسائية',
    candleDisableEveningAr: 'إضاءة النهار',
    candleEnableEveningFr: 'Ambiance du soir',
    candleDisableEveningFr: 'Lumière du jour',
  },
  story: {
    titleAr: 'المكـــان',
    titleFrCaps: 'LE LIEU',
    linesAr: [
      'في الأبيار، على طريق فال دي هيدرا، يفتح الخان أبوابه لقهوةٍ وبرانش على مهل.',
      'جدران بزخارف نباتية ناعمة، وخشب داكن، وثريّات معلّقة، ومقاعد بلون البوردو؛ إضاءة هادئة وألوان دافئة تدعوك إلى الجلوس طويلًا.',
      'على الطاولة قهوة وماتشا، وكرواسون وبريوش وحلويات تُقدَّم على أطباق ذهبية اللون.',
      'وفي تقييمات زوّارنا على Google، تتكرّر أربع كلمات:',
    ],
    keywordsAr: ['الموسيقى', 'الكرواسون', 'الخدمة', 'الديكور'],
    linesFr: [
      "À El Biar, sur le chemin de Val d'Hydra, ElKhan vous accueille pour un café ou un brunch, sans se presser.",
      'Des murs aux motifs floraux, des boiseries sombres, des lustres, des chaises bordeaux : une lumière douce et des tons chauds qui donnent envie de rester.',
      'À table, café et matcha, croissants, brioches et douceurs servis sur des plateaux dorés.',
      'Dans les avis Google, quatre mots reviennent :',
    ],
    keywordsFr: ['la musique', 'les croissants', 'le service', 'la décoration'],
  },
  table: {
    titleAr: 'على الطـاولـة',
    titleFrCaps: 'À TABLE',
    subAr: 'قهوة، ماتشا، كرواسون، بريوش وحلويات',
    subFr: 'Café, matcha, croissants, brioches et douceurs',
    prevAr: 'الصورة السابقة',
    prevFr: 'Image précédente',
    nextAr: 'الصورة التالية',
    nextFr: 'Image suivante',
  },
  moments: {
    titleAr: 'لحظـــات',
    titleFrCaps: 'MOMENTS',
    playAr: 'تشغيل الفيديو',
    playFr: 'Lire la vidéo',
    pauseAr: 'إيقاف الفيديو',
    pauseFr: 'Mettre en pause',
    muteAr: 'كتم الصوت',
    muteFr: 'Couper le son',
    unmuteAr: 'تشغيل الصوت',
    unmuteFr: 'Activer le son',
    fullscreenAr: 'ملء الشاشة',
    fullscreenFr: 'Plein écran',
    prevReelAr: 'المقطع السابق',
    prevReelFr: 'Vidéo précédente',
    nextReelAr: 'المقطع التالي',
    nextReelFr: 'Vidéo suivante',
  },
  game: {
    titleAr: 'اقلب الفنجان',
    titleFrCaps: "MÉMOIRE D'ELKHAN",
    subAr: 'اعثر على الأزواج الستة',
    subFr: 'Retrouvez les six paires',
    movesAr: 'الحركات',
    movesFr: 'Coups',
    timeAr: 'الوقت',
    timeFr: 'Temps',
    bestAr: 'أفضل نتيجة',
    bestFr: 'Meilleur',
    winAr: 'أحسنت!',
    winFrCaps: 'BRAVO !',
    replayAr: 'العب مجددًا',
    replayFr: 'Rejouer',
    shareAr: 'شارك نتيجتك',
    shareFr: 'Partager',
    shareSignature: 'لعبة الخان · El Biar',
    cardHiddenAr: 'بطاقة مخفية رقم',
    cardOpenAr: 'بطاقة مكشوفة رقم',
    cardMatchedAr: 'زوج متطابق',
    cardHiddenFr: 'Carte cachée n°',
    cardOpenFr: 'Carte retournée n°',
    cardMatchedFr: 'Paire trouvée',
    matchLiveAr: 'تطابق صحيح',
    matchLiveFr: 'Paire trouvée',
    mismatchLiveAr: 'غير متطابقين',
    mismatchLiveFr: 'Pas de paire',
    winLiveAr: 'أحسنت! تم العثور على جميع الأزواج الستة',
    winLiveFr: 'Bravo ! Toutes les six paires ont été trouvées',
  },
  reviews: {
    titleAr: 'آراء الضيـــوف',
    titleFrCaps: 'LES AVIS',
    countLabel: '226 avis Google',
    themesHeaderAr: 'ما يذكره الزوار أكثر',
    themesHeaderFr: 'Les mots les plus cités',
    allReviewsAr: 'اقرأ كل التقييمات على Google',
    allReviewsFr: 'Voir tous les avis sur Google',
  },
  visit: {
    titleAr: 'زورونـــا',
    titleFrCaps: 'NOUS TROUVER',
    dialLabelAr: 'ساعات العمل اليوم على قرص ٢٤ ساعة',
    dialLabelFr: "Horaires d'ouverture du jour sur cadran 24h",
    daySelectorAr: 'متى نلتقي؟',
    daySelectorFr: 'On se retrouve quand ?',
    daysOfWeek: [
      { key: 'sat' as DayKey, ar: 'السبت', fr: 'Sam' },
      { key: 'sun' as DayKey, ar: 'الأحد', fr: 'Dim' },
      { key: 'mon' as DayKey, ar: 'الإثنين', fr: 'Lun' },
      { key: 'tue' as DayKey, ar: 'الثلاثاء', fr: 'Mar' },
      { key: 'wed' as DayKey, ar: 'الأربعاء', fr: 'Mer' },
      { key: 'thu' as DayKey, ar: 'الخميس', fr: 'Jeu' },
      { key: 'fri' as DayKey, ar: 'الجمعة', fr: 'Ven' },
    ],
    fallbackMapAr: 'افتح الموقع في خرائط Google',
    fallbackMapFr: 'Ouvrir dans Google Maps',
  },
  postcard: {
    ctaAr: 'احتفظ بذكرى من الخان',
    ctaFr: 'Garder un souvenir',
    chooseAr: 'اختر صورة',
    chooseFr: 'Choisir une photo',
    downloadAr: 'تحميل البطاقة',
    downloadFr: 'Télécharger',
    shareAr: 'مشاركة البطاقة',
    shareFr: 'Partager',
    signatureLabel: 'الخَّان · El Biar',
    closeAr: 'إغلاق',
    closeFr: 'Fermer',
  },
  footer: {
    farewellAr: 'نلقاكم على فنجان',
    farewellFr: "À très vite autour d'un café",
    copyright: '© ElKhan',
    /* SECRET TABLE MESSAGE (editable placeholder): shown after tapping the rosette center dot 5 times */
    secretMessageAr: 'الطاولة السرّية — مساحة مخصّصة لرسالة خاصّة من الخان لضيوفه.',
    secretMessageFr: "Table secrète — espace dédié à un mot particulier d'ElKhan pour ses invités.",
  },
};

