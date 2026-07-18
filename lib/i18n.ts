export type Locale = "tr" | "en";
export type LocalizedText = Partial<Record<Locale, string>>;

const TURKIC_LANGUAGES = new Set([
  "tr",
  "az",
  "kk",
  "ky",
  "tk",
  "uz",
  "ba",
  "tg",
]);

export function detectLocaleFromAcceptLanguage(acceptLanguage = ""): Locale {
  const candidates = acceptLanguage
    .toLowerCase()
    .split(",")
    .map((entry) => entry.split(";")[0].trim())
    .filter(Boolean);

  for (const candidate of candidates) {
    const base = candidate.split("-")[0];
    if (TURKIC_LANGUAGES.has(base)) return "tr";
    if (base === "en") return "en";
  }

  return "en";
}

export function getLocalizedText(
  value: LocalizedText | string | null | undefined,
  locale: Locale,
  fallback = ""
) {
  if (!value) return fallback;
  if (typeof value === "string") return value;

  return value[locale] ?? value.en ?? value.tr ?? fallback;
}

export function formatLocaleDate(date: string | null | undefined, locale: Locale) {
  if (!date) return locale === "tr" ? "Tarih yok" : "No date";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return locale === "tr" ? "Tarih yok" : "No date";
  }

  return parsed.toLocaleDateString(locale === "tr" ? "tr-TR" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export const navLabels = {
  tr: {
    games: "Oyunlar",
    news: "Haberler",
    developers: "Geliştiriciler",
    careers: "Kariyer",
    support: "Destek",
    about: "Hakkında",
    contact: "İletişim",
  },
  en: {
    games: "Games",
    news: "News",
    developers: "Developers",
    careers: "Careers",
    support: "Support",
    about: "About",
    contact: "Contact",
  },
} as const;

export const heroLabels = {
  tr: {
    eyebrow: "", // boş, kaldırıldı
    headline: "IFGT",
    line1: "Yarat.",
    line2: "Oyna.",
    line3: "İlham ver.",
    exploreGames: "Oyunları keşfet",
    learnMore: "Daha fazlası",
    description:
      "Sevilen oyunlar yapıyoruz.",
    scroll: "Keşfetmek için kaydır",
  },
  en: {
    eyebrow: "", // boş, kaldırıldı
    headline: "IFGT",
    line1: "Create.",
    line2: "Play.",
    line3: "Inspire.",
    exploreGames: "Explore Games",
    learnMore: "Learn More",
    description:
      "We make games people love.",
    scroll: "Scroll to explore",
  },
} as const;

export const homeSectionLabels = {
  tr: {
    featuredEyebrow: "Dünyalarımız",
    featuredTitle: "Unutulmaz olacak şekilde inşa edildi.",
    featuredCopy: "Her evren, peşinden koşulacak bir hisle başlar.",
    allGames: "Tüm oyunlar",
    studioEyebrow: "IFGT tarzı",
    studioTitle: "Teknoloji insanî anın hizmetinde.",
    studioCopy:
      "Bağımsız bir oyun stüdyosu olarak, oyundan daha fazlasını bekleyen bir dünya için daha fazla beceri, daha fazla kalp ve daha fazla buluşma sebebi üretiyoruz.",
    newsEyebrow: "Stüdyo güncesi",
    newsTitle: "En son sinyal.",
    viewNewsroom: "Haber odasını gör",
    announcementsEyebrow: "Duyurular",
    announcementsTitle: "Stüdyo güncellemeleri ve sinyalleri.",
    announcementsCopy: "IFGT ve gelecek sürüm etrafındaki en yeni iletiler.",
    joinEyebrow: "IFGT'de kariyer",
    joinTitle: "Oyuncuların minnettar olacağı bir şey üretin.",
    joinCta: "Açık rolleri gör",
  },
  en: {
    featuredEyebrow: "Our worlds",
    featuredTitle: "Built to be remembered.",
    featuredCopy: "Every universe begins with a feeling worth chasing.",
    allGames: "All games",
    studioEyebrow: "The IFGT way",
    studioTitle: "Technology serves the human moment.",
    studioCopy:
      "We are an independent game studio for a world that expects more from play: more craft, more heart, and more reasons to come together.",
    newsEyebrow: "From the studio",
    newsTitle: "The latest signal.",
    viewNewsroom: "View newsroom",
    announcementsEyebrow: "Announcements",
    announcementsTitle: "Studio updates and signals.",
    announcementsCopy: "The newest dispatches from IFGT and the world around the next release.",
    joinEyebrow: "Careers at IFGT",
    joinTitle: "Make something future players will thank you for.",
    joinCta: "See open roles",
  },
} as const;

export const uiLabels = {
  tr: {
    discover: "Keşfet",
    readStory: "Haberi oku",
    openTrailer: "Fragmanı aç →",
    loadingGame: "Oyun yükleniyor…",
    noGames: "Yakında!",
    noNews: "Yayınlanmış içerik yok",
    noAnnouncements: "Yayınlanmış içerik yok",
    noDeveloperPosts: "Yayınlanmış içerik yok",
    noJobs: "Yayınlanmış içerik yok",
    platforms: "Platformlar",
    videos: "Videolar",
    developerUpdate: "Geliştirici güncellemesi",
    viewVideo: "Video aç",
    playNow: "Şimdi oynat",
    apply: "Başvur",
    loading: "Yükleniyor…",
    gameNotFound: "Oyun bulunamadı.",
    announcement: "Duyuru",
    ifgtId: "IFGT ID",
  },
  en: {
    discover: "Discover",
    readStory: "Read story",
    openTrailer: "Open trailer →",
    loadingGame: "Loading game…",
    noGames: "Coming Soon!",
    noNews: "No published content",
    noAnnouncements: "No published content",
    noDeveloperPosts: "No published content",
    noJobs: "No published content",
    platforms: "Platforms",
    videos: "Videos",
    developerUpdate: "Developer Update",
    viewVideo: "Open video",
    playNow: "Play now",
    apply: "Apply",
    loading: "Loading…",
    gameNotFound: "Game not found.",
    announcement: "Announcement",
    ifgtId: "IFGT ID",
  },
} as const;

export const studioValues = {
  tr: ["Amaçla oyna", "Cesaretle icat et", "Birlikte inşa et", "Dünyaları daha iyi bırak"],
  en: ["Play with purpose", "Invent with courage", "Build together", "Leave worlds better"],
} as const;

export const aboutTimeline = {
  tr: [
    ["2024", "Küçük bağımsız bir ekip büyük bir inançla yola çıktı: oyunlar hâlâ bizi şaşırtabilir."],
    ["2025", "IFGT Studio İstanbul'da kuruldu; oyun, film ve teknoloji dünyasından yapımcılar bir araya geldi."],
    ["2026", "İlk üç dünyamız üretime girdi. Sinyal yayında."],
  ],
  en: [
    ["2024", "A small independent team begins with a big conviction: games can still surprise us."],
    ["2025", "IFGT Studio is founded in Istanbul, bringing together makers from games, film, and technology."],
    ["2026", "Our first three worlds enter production. The signal is live."],
  ],
} as const;

export const pageLabels = {
  tr: {
    about: {
      eyebrow: "IFGT Hakkında",
      title: "Tasarım gereği bağımsız.",
      copy: "İstanbul merkezli, küresel vizyonlu bir oyun stüdyosuyuz; bağlantılı bir dünya için cesur eğlence üretiyoruz.",
      missionEyebrow: "Misyonumuz",
      missionTitle: "Oyunu anlamlı kıl.",
      missionCopy: "Oyuncuların kendilerini kaybedeceği, birbirlerini bulacağı ve ayrılırken yanlarında yeni bir şey taşıyacağı oyunlar yapıyoruz.",
      visionLabel: "Vizyonumuz",
      visionText: "En anlamlı dünyaların birlikte inşa ettiğimiz dünyalar olduğu bir gelecek.",
      storyEyebrow: "Hikayemiz",
      storyTitle: "Uzun vadeli düşünen bir stüdyo.",
      valuesEyebrow: "Değerler",
      valuesTitle: "Bizi dürüst tutan şeyler.",
    },
    games: {
      eyebrow: "Oyunlar",
      title: "Hareket halindeki dünyalar.",
      copy: "Oyunlarımız tek bir soruya dayanır: oyuncular burada başka hiçbir yerde hissedemeyecekleri neyi hissedebilir?",
    },
    news: {
      eyebrow: "Haber odası",
      title: "IFGT'den hikâyeler.",
      copy: "Güncellemeler, fikirler ve yeni nesil oyun deneyimini inşa eden insanlar.",
    },
    newsDetail: {
      back: "Haber odasına dön",
      notFound: "Bu haber bulunamadı.",
    },
    contact: {
      eyebrow: "İletişim",
      title: "Bir sohbet başlatalım.",
      copy: "Medya, iş birlikleri veya samimi bir tanışma için IFGT'de doğru kişi dinliyor.",
      generalInquiries: "Genel sorular",
      studio: "Stüdyo",
      name: "Ad",
      namePlaceholder: "Adınız",
      email: "E-posta",
      emailPlaceholder: "siz@ornek.com",
      subject: "Konu",
      subjectPlaceholder: "Size nasıl yardımcı olabiliriz?",
      message: "Mesaj",
      messagePlaceholder: "Biraz daha anlatın…",
      send: "Mesaj gönder",
      sent: "E-posta uygulamanız açılıyor…",
    },
    careers: {
      eyebrow: "Kariyer",
      title: "Geleceği birlikte inşa edelim.",
      copy: "En iyi iş, yetenekli insanların derinlemesine önemsemeye alan bulduğu yerde olur. Zanaatinizi, merakınızı ve bakış açınızı getirin.",
      sideTitle: "Yapımcılar için kurulmuş bir stüdyo.",
      sideCopy: "Egoyu bırakıp hırsı koruyan, net görüşleri hafif tutan ve işi iyileştirmeye zaman ayıran bir kültür.",
      perk1: "Esnek hibrit çalışma",
      perk2: "Cömert öğrenme desteği",
      perk3: "İlk günden gerçek sahiplik",
      openRoles: "Açık roller",
    },
    support: {
      eyebrow: "Oyuncu desteği",
      title: "Size nasıl yardımcı olabiliriz?",
      copy: "Yanıtları bulun, IFGT ID'nizi yönetin veya destek ekibimizle konuşun.",
      topic1: "IFGT ID ve hesap",
      topic2: "Oyun desteği",
      topic3: "Satın alma ve faturalandırma",
      topic4: "Güvenlik ve gizlilik",
      safeTitle: "Hesabınızı güvende tutun",
      safeCopy: "IFGT ID'nizi güvenli erişim ve güvenilir kurtarma seçenekleriyle koruyun.",
      humanTitle: "İnsan desteği mi lazım?",
      humanCopy: "Destek ekibimiz haftanın yedi günü burada.",
    },
    developers: {
      eyebrow: "Geliştiriciler",
      title: "Yeni dünyaları birlikte inşa edelim.",
      copy: "IFGT Developers; araçlar, yaratıcı iş birlikleri ve oyuncularla buluşacak deneyimler için stüdyonun açık kapısıdır.",
      pillar1Title: "Araçlar ve teknoloji",
      pillar1Copy: "Oyuncu deneyimini hızlandıran, ekiplerin işini sadeleştiren teknolojiye yatırım yapıyoruz.",
      pillar2Title: "Dünyaları birlikte kur",
      pillar2Copy: "Tasarımcı, mühendis, sanatçı ve topluluk ekipleri aynı masada üretir.",
      pillar3Title: "Geleceğe açıl",
      pillar3Copy: "Geliştirici programı, stüdyolar ve yaratıcı ortaklar için yeni kapılar açar.",
      programEyebrow: "IFGT Developer Program",
      programTitle: "Program şu anda hazır hale getiriliyor.",
      programCopy: "Erken erişim, iş birliği fırsatları ve teknik duyurular için IFGT ID ile bağlantıda kal.",
    },
  },
  en: {
    about: {
      eyebrow: "About IFGT",
      title: "Independent by design.",
      copy: "We are a global-minded game studio based in Istanbul, building bold entertainment for a connected world.",
      missionEyebrow: "Our mission",
      missionTitle: "Make play matter.",
      missionCopy: "We make games that invite players to lose themselves, find each other, and leave with something they did not have before.",
      visionLabel: "Our vision",
      visionText: "A future where the most meaningful worlds are the ones we build together.",
      storyEyebrow: "Our story",
      storyTitle: "A studio with a long view.",
      valuesEyebrow: "Values",
      valuesTitle: "What keeps us honest.",
    },
    games: {
      eyebrow: "Games",
      title: "Worlds in motion.",
      copy: "Our games are built around one question: what could players feel here that they cannot feel anywhere else?",
    },
    news: {
      eyebrow: "Newsroom",
      title: "Stories from inside IFGT.",
      copy: "Updates, ideas, and the people making the next generation of play.",
    },
    newsDetail: {
      back: "Back to newsroom",
      notFound: "This story could not be found.",
    },
    contact: {
      eyebrow: "Contact",
      title: "Let's start a conversation.",
      copy: "For media, partnerships, or a thoughtful introduction, the right person at IFGT is listening.",
      generalInquiries: "General inquiries",
      studio: "Studio",
      name: "Name",
      namePlaceholder: "Your name",
      email: "Email",
      emailPlaceholder: "you@example.com",
      subject: "Subject",
      subjectPlaceholder: "What can we help with?",
      message: "Message",
      messagePlaceholder: "Tell us a little more…",
      send: "Send message",
      sent: "Opening your email app…",
    },
    careers: {
      eyebrow: "Careers",
      title: "Come build what's next.",
      copy: "The best work happens when talented people have room to care deeply. Bring your craft, your curiosity, and your point of view.",
      sideTitle: "A studio made for makers.",
      sideCopy: "We value ambition without ego, clear opinions held lightly, and time spent making the work better.",
      perk1: "Flexible hybrid work",
      perk2: "Generous learning support",
      perk3: "Real ownership from day one",
      openRoles: "Open roles",
    },
    support: {
      eyebrow: "Player support",
      title: "How can we help?",
      copy: "Find answers, manage your IFGT ID, or talk to a member of our support team.",
      topic1: "IFGT ID & account",
      topic2: "Game support",
      topic3: "Purchases & billing",
      topic4: "Safety & privacy",
      safeTitle: "Keep your account safe",
      safeCopy: "Protect your IFGT ID with secure access and trusted recovery options.",
      humanTitle: "Need a human?",
      humanCopy: "Our support team is here seven days a week.",
    },
    developers: {
      eyebrow: "Developers",
      title: "Let's build new worlds together.",
      copy: "IFGT Developers is the open gateway for tools, creative partnerships, and the future of play.",
      pillar1Title: "Tools & technology",
      pillar1Copy: "We invest in technology that accelerates player experiences and simplifies team workflows.",
      pillar2Title: "Build worlds together",
      pillar2Copy: "Designers, engineers, artists, and community teams create at the same table.",
      pillar3Title: "Open to the future",
      pillar3Copy: "Our developer program opens new doors for studios and creative partners.",
      programEyebrow: "IFGT Developer Program",
      programTitle: "The program is currently being prepared.",
      programCopy: "Stay connected with IFGT ID for early access, partnership opportunities, and technical announcements.",
    },
  },
} as const;

export const authLabels = {
  tr: {
    back: "IFGT Studio",
    eyebrow: "IFGT ID",
    signUpTitle: "Bir evrenin kapısını aç.",
    signInTitle: "Tekrar hoş geldin.",
    signUpCopy: "IFGT ID ile oyunlarını, topluluğunu ve gelecekteki deneyimlerini tek yerde birleştir.",
    signInCopy: "IFGT dünyalarına devam etmek için giriş yap.",
    email: "E-posta",
    emailPlaceholder: "sen@ornek.com",
    username: "Kullanıcı adı",
    usernamePlaceholder: "ornek_oyuncu",
    usernameRules: "3-20 karakter, sadece küçük harf, rakam ve alt çizgi",
    usernameAvailable: "Kullanıcı adı kullanılabilir!",
    usernameTaken: "Kullanıcı adı zaten alınmış!",
    usernameChecking: "Kontrol ediliyor...",
    password: "Şifre",
    passwordPlaceholder: "En az 6 karakter",
    passwordStrength: "Şifre gücü",
    passwordStrengthWeak: "Zayıf",
    passwordStrengthMedium: "Orta",
    passwordStrengthStrong: "Güçlü",
    passwordConfirm: "Şifre tekrar",
    passwordConfirmPlaceholder: "Şifrenizi tekrar girin",
    passwordMatch: "Şifreler eşleşiyor",
    passwordNoMatch: "Şifreler eşleşmiyor!",
    signUpCta: "IFGT ID oluştur",
    signInCta: "Giriş yap",
    verifyEmail: "Hesabını etkinleştirmek için e-posta kutunu kontrol et.",
    hasAccount: "Zaten IFGT ID'in var mı?",
    noAccount: "IFGT ID'in yok mu?",
    signInLink: "Giriş yap",
    signUpLink: "Hesap oluştur",
  },
  en: {
    back: "IFGT Studio",
    eyebrow: "IFGT ID",
    signUpTitle: "Open the door to a universe.",
    signInTitle: "Welcome back.",
    signUpCopy: "With IFGT ID, bring your games, community, and future experiences together in one place.",
    signInCopy: "Sign in to continue into IFGT worlds.",
    email: "Email",
    emailPlaceholder: "you@example.com",
    username: "Username",
    usernamePlaceholder: "example_player",
    usernameRules: "3-20 characters, lowercase, numbers, and underscore only",
    usernameAvailable: "Username available!",
    usernameTaken: "Username is taken!",
    usernameChecking: "Checking availability...",
    password: "Password",
    passwordPlaceholder: "At least 6 characters",
    passwordStrength: "Password strength",
    passwordStrengthWeak: "Weak",
    passwordStrengthMedium: "Medium",
    passwordStrengthStrong: "Strong",
    passwordConfirm: "Confirm password",
    passwordConfirmPlaceholder: "Confirm your password",
    passwordMatch: "Passwords match",
    passwordNoMatch: "Passwords don't match!",
    signUpCta: "Create IFGT ID",
    signInCta: "Sign in",
    verifyEmail: "Check your inbox to activate your account.",
    hasAccount: "Already have an IFGT ID?",
    noAccount: "Don't have an IFGT ID?",
    signInLink: "Sign in",
    signUpLink: "Create account",
  },
} as const;

export const idLabels = {
  tr: {
    loading: "IFGT ID yükleniyor…",
    setupEyebrow: "IFGT ID",
    setupTitle: "Sana ait bir isim.",
    profileTitle: "IFGT profilini oluştur",
    profileCopy: "Bu kullanıcı adı herkese açık olur. Küçük harf, rakam ve alt çizgi kullanabilirsin.",
    username: "Kullanıcı adı",
    usernamePlaceholder: "ornek_oyuncu",
    usernameTaken: "Bu kullanıcı adı alınmış.",
    saveProfile: "Profili kaydet",
    greeting: "Merhaba",
    accountSafeTitle: "Hesabın güvende.",
    accountSafeCopy: "Oturumun tarayıcıda güvenle kalır. IFGT ID'in tüm oyun ve topluluk deneyimlerinde kullanılacak.",
    playerProfile: "Oyuncu profili",
    libraryTitle: "Oyun kütüphanen",
    libraryCopy: "IFGT oyunları çıktığında burada görünecek.",
    adminPanel: "Admin kontrol paneli",
    signOut: "Çıkış yap",
  },
  en: {
    loading: "Loading IFGT ID…",
    setupEyebrow: "IFGT ID",
    setupTitle: "A name that's yours.",
    profileTitle: "Create your IFGT profile",
    profileCopy: "This username is public. Use lowercase letters, numbers, and underscores.",
    username: "Username",
    usernamePlaceholder: "example_player",
    usernameTaken: "This username is taken.",
    saveProfile: "Save profile",
    greeting: "Hello",
    accountSafeTitle: "Your account is secure.",
    accountSafeCopy: "Your session stays safe in the browser. Your IFGT ID will be used across all game and community experiences.",
    playerProfile: "Player profile",
    libraryTitle: "Your game library",
    libraryCopy: "IFGT games will appear here when they launch.",
    adminPanel: "Admin dashboard",
    signOut: "Sign out",
  },
} as const;

export const notFoundLabels = {
  tr: {
    message: "Bu dünya henüz mevcut değil.",
    home: "Ana sayfaya dön",
  },
  en: {
    message: "This world doesn't exist yet.",
    home: "Return home",
  },
} as const;

export const footerLabels = {
  tr: {
    explore: "Keşfet",
    connect: "Bağlan",
    tagline: "Sevdiğin oyunları yapıyoruz.",
    sayHello: "Merhaba de",
    rights: "© 2026 IFGT Studio. Tüm hakları saklıdır.",
    privacy: "Gizlilik",
    terms: "Şartlar",
    accessibility: "Erişilebilirlik",
  },
  en: {
    explore: "Explore",
    connect: "Connect",
    tagline: "We make games you'll love.",
    sayHello: "Say hello",
    rights: "© 2026 IFGT Studio. All rights reserved.",
    privacy: "Privacy",
    terms: "Terms",
    accessibility: "Accessibility",
  },
} as const;
