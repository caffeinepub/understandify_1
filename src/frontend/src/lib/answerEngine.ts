import { type MathQuestion, detectMathQuestion } from "./mathEngine";

export interface AnswerResult {
  subject: string;
  subjectEmoji: string;
  answer: string;
  isMath: boolean;
  mathData?: MathQuestion;
  isFiltered?: boolean;
}

const BLOCKED_WORDS = [
  "violence",
  "kill",
  "murder",
  "blood",
  "gore",
  "sex",
  "porn",
  "adult",
  "drug",
  "alcohol",
  "weapon",
  "bomb",
  "terrorist",
  "hate",
  "racist",
  "suicide",
  "death",
  "naked",
  "nude",
];

function isContentSafe(question: string): boolean {
  const q = question.toLowerCase();
  return !BLOCKED_WORDS.some((word) => q.includes(word));
}

function detectSubject(question: string): { subject: string; emoji: string } {
  const q = question.toLowerCase();

  if (
    /\d+\s*[+\-*/x×÷]\s*\d+|math|add|subtract|multiply|divide|plus|minus|times|fraction|decimal|geometry|algebra|calculus|equation|number|count|sum|product|quotient|percent|angle|triangle|circle|square|rectangle/.test(
      q,
    )
  ) {
    return { subject: "Math", emoji: "🔢" };
  }
  if (
    /science|biology|chemistry|physics|atom|molecule|cell|plant|animal|energy|force|gravity|light|sound|electricity|magnet|experiment|hypothesis|evolution|ecosystem|photosynthesis|dna|gene|planet|star|galaxy|space|universe|solar system|moon|sun|earth|weather|climate|volcano|earthquake/.test(
      q,
    )
  ) {
    return { subject: "Science", emoji: "🔬" };
  }
  if (
    /history|ancient|war|civilization|empire|king|queen|president|revolution|century|bc|ad|medieval|renaissance|world war|independence|constitution|democracy|pharaoh|roman|greek|egyptian|viking|columbus|napoleon|lincoln|gandhi|martin luther/.test(
      q,
    )
  ) {
    return { subject: "History", emoji: "📜" };
  }
  if (
    /geography|country|capital|continent|ocean|river|mountain|desert|forest|map|latitude|longitude|population|climate zone|flag|border|island|peninsula|valley|lake|sea|gulf|bay|africa|asia|europe|america|australia|antarctica/.test(
      q,
    )
  ) {
    return { subject: "Geography", emoji: "🌍" };
  }
  if (
    /english|grammar|spelling|vocabulary|word|sentence|paragraph|essay|poem|story|novel|author|verb|noun|adjective|adverb|pronoun|preposition|conjunction|punctuation|comma|period|apostrophe|synonym|antonym|metaphor|simile|rhyme/.test(
      q,
    )
  ) {
    return { subject: "English", emoji: "📝" };
  }
  if (
    /art|music|painting|drawing|color|instrument|song|dance|theater|drama|sculpture|photography|film|movie|book|literature|culture|language|french|spanish|german|japanese|chinese|arabic/.test(
      q,
    )
  ) {
    return { subject: "Arts & Culture", emoji: "🎨" };
  }
  if (
    /computer|technology|internet|website|app|program|code|robot|artificial intelligence|ai|machine|software|hardware|digital|cyber|network|data|algorithm/.test(
      q,
    )
  ) {
    return { subject: "Technology", emoji: "💻" };
  }
  if (
    /health|body|heart|brain|lung|bone|muscle|vitamin|nutrition|exercise|sleep|hygiene|doctor|medicine|disease|immune|digest|blood|skin|eye|ear|nose|tooth/.test(
      q,
    )
  ) {
    return { subject: "Health & Body", emoji: "❤️" };
  }

  return { subject: "General Knowledge", emoji: "🌟" };
}

const knowledgeBase: Record<string, string> = {
  // Science
  "why is the sky blue":
    "🌈 The sky looks blue because of something called **scattering**! When sunlight travels through the air, it bumps into tiny air molecules. Blue light scatters (spreads out) more than other colors, so we see blue everywhere we look up! ✨",
  "what is photosynthesis":
    "🌱 Photosynthesis is how plants make their own food! Plants use **sunlight**, **water**, and **air** (carbon dioxide) to create sugar for energy. As a bonus, they release **oxygen** — the air we breathe! Plants are like little food factories! 🏭",
  "why do we have seasons":
    "🍂 We have seasons because Earth is tilted as it travels around the Sun! When your part of Earth tilts toward the Sun, it's **summer** (more sunlight, warmer). When it tilts away, it's **winter** (less sunlight, colder). Spring and autumn are in between! 🌸❄️",
  "what is gravity":
    "🍎 Gravity is an invisible force that pulls things toward each other! The bigger something is, the stronger its gravity. Earth's gravity keeps us on the ground and stops us from floating away into space! Even the Moon's gravity causes ocean tides! 🌊",
  "how do rainbows form":
    "🌈 Rainbows form when sunlight passes through water droplets in the air! The droplets act like tiny prisms, splitting white light into all its colors: **Red, Orange, Yellow, Green, Blue, Indigo, Violet** — remember ROY G BIV! 🎨",
  "what is the water cycle":
    "💧 The water cycle is how water travels around Earth! Water **evaporates** from oceans and lakes (turns into vapor), rises up and forms **clouds**, then falls back down as **rain or snow**, and flows back to the ocean. It's like a giant recycling system! ♻️",
  "how big is the sun":
    "☀️ The Sun is HUGE! It's so big that about **1.3 million Earths** could fit inside it! The Sun is actually a giant ball of hot gas (mostly hydrogen) that produces energy through nuclear fusion. It's about 150 million kilometers away from Earth! 🌍",
  "what are planets":
    "🪐 Planets are large round objects that orbit (travel around) a star! Our solar system has **8 planets**: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune. Earth is the only planet we know of with life on it! 🌍",
  "what is dna":
    "🧬 DNA is like a **blueprint** or instruction manual for living things! It's found inside almost every cell in your body and contains all the information that makes you uniquely YOU — your eye color, hair color, and so much more! DNA looks like a twisted ladder called a double helix! 🔬",
  "what is an atom":
    "⚛️ An atom is the tiniest building block of everything around you! Everything — your desk, water, air, even you — is made of atoms! Atoms are so small that millions of them could fit on the period at the end of this sentence. Atoms have a **nucleus** in the middle with **electrons** zooming around it! 🌀",

  // History
  "who built the pyramids":
    "🏛️ The ancient **Egyptians** built the pyramids about 4,500 years ago! They were built as tombs for pharaohs (Egyptian kings). The Great Pyramid of Giza was built for Pharaoh Khufu and was the tallest human-made structure for over 3,800 years! Thousands of workers helped build them! 👷",
  "what caused world war 2":
    "📜 World War 2 (1939-1945) started when Germany, led by Adolf Hitler, invaded Poland. Many countries joined to stop Germany and its allies. It was the largest war in history, involving countries from all over the world. It ended when Germany and Japan surrendered to the Allied forces! 🕊️",
  "who was cleopatra":
    "👑 Cleopatra was the last pharaoh (ruler) of ancient Egypt, living about 2,000 years ago! She was very smart and could speak **9 languages**! She was known for her intelligence and political skills. She ruled Egypt and was famous throughout the ancient world! 🌟",
  "what is democracy":
    '🗳️ Democracy is a system of government where **the people get to choose** their leaders by voting! The word comes from Greek words meaning "people" and "rule." In a democracy, everyone\'s vote counts equally. Many countries around the world use democracy today! 🌍',

  // Geography
  "what is the largest country":
    "🌍 **Russia** is the largest country in the world by area! It's so big that it spans 11 time zones — when people in one part of Russia are waking up, people in another part are going to sleep! Russia covers about 17 million square kilometers! 🗺️",
  "what is the longest river":
    "🌊 The **Nile River** in Africa is often called the longest river in the world at about 6,650 kilometers long! It flows through 11 countries and was very important to ancient Egyptian civilization. The **Amazon River** in South America is also very long and carries the most water! 🐊",
  "what is the highest mountain":
    "⛰️ **Mount Everest** is the highest mountain in the world! It's in the Himalayan mountain range between Nepal and Tibet. It stands 8,849 meters (29,032 feet) tall — that's higher than airplanes usually fly! Many brave climbers try to reach its summit each year! 🧗",
  "how many continents are there":
    "🌍 There are **7 continents** on Earth: **Africa, Antarctica, Asia, Australia (Oceania), Europe, North America, and South America**! Asia is the largest continent and Australia is the smallest. Antarctica is the coldest and is mostly covered in ice! 🧊",
  "what is the capital of france":
    '🗼 The capital of France is **Paris**! Paris is famous for the Eiffel Tower, the Louvre museum, and delicious food like croissants and baguettes! It\'s often called the "City of Light" and is one of the most visited cities in the world! 🥐',

  // English
  "what is a noun":
    "📝 A **noun** is a word that names a person, place, thing, or idea! Examples: **dog** (thing), **Paris** (place), **teacher** (person), **happiness** (idea). Nouns are one of the most important parts of speech! Can you think of 5 nouns right now? 🤔",
  "what is a verb":
    '🏃 A **verb** is an action word — it tells us what someone or something does! Examples: **run**, **jump**, **eat**, **think**, **is**, **was**. Every sentence needs a verb! "The cat **sleeps**" — "sleeps" is the verb! 😴',
  "what is a metaphor":
    '🎭 A **metaphor** is when you describe something by saying it IS something else (even though it\'s not literally true)! Example: "Life is a journey" or "The classroom was a zoo!" Metaphors help make writing more interesting and vivid! 🌈',
  "what is a synonym":
    "📚 A **synonym** is a word that means the same (or almost the same) as another word! Examples: **happy** and **joyful**, **big** and **large**, **fast** and **quick**. Using synonyms makes your writing more interesting! 🌟",

  // Technology
  "what is the internet":
    "🌐 The Internet is a giant **network** that connects millions of computers around the world! It lets people share information, send messages, watch videos, and much more. It was invented in the 1960s and has changed how we live, learn, and communicate! 📡",
  "what is artificial intelligence":
    "🤖 Artificial Intelligence (AI) is when computers are programmed to do things that normally require human intelligence — like recognizing faces, understanding speech, playing games, or answering questions! AI learns from lots of data to get better over time! 🧠",
  "how does a computer work":
    "💻 A computer works by following instructions called **programs**! It has a **CPU** (brain) that processes information, **RAM** (short-term memory) for working, **storage** (long-term memory) for saving files, and **input/output** devices like keyboard and screen! Everything is done using 1s and 0s! 🔢",

  // Health
  "why do we need sleep":
    "😴 Sleep is super important for your body and brain! While you sleep, your brain **organizes memories** and your body **repairs itself**. Kids need about **9-11 hours** of sleep each night! Without enough sleep, it's hard to concentrate, learn, and feel happy! 🌙",
  "why do we need to eat vegetables":
    "🥦 Vegetables are packed with **vitamins, minerals, and fiber** that your body needs to grow strong and stay healthy! Different colored vegetables have different nutrients — that's why eating a rainbow of veggies is great! They help your immune system fight off sickness! 💪",
  "how does the heart work":
    "❤️ Your heart is a **muscle** that pumps blood around your body! It beats about **100,000 times every day**! Blood carries oxygen and nutrients to all your organs and muscles. Your heart has 4 chambers that work together like a pump. Exercise makes your heart stronger! 🏃",

  // General
  "what is the meaning of life":
    "🌟 That's a big question that philosophers have thought about for thousands of years! Many people believe the meaning of life is to **be happy, help others, learn new things, and make the world a better place**! What do YOU think gives life meaning? 💭",
  "why is the ocean salty":
    "🌊 The ocean is salty because rivers carry tiny amounts of **salt and minerals** from rocks on land into the sea! Over millions of years, this salt has built up. The ocean also gets salt from underwater volcanoes! The average ocean water is about **3.5% salt** — that's why it tastes so different from drinking water! 🧂",
  "how many stars are in the sky":
    "⭐ There are an **unimaginable** number of stars! In our galaxy (the Milky Way) alone, there are about **200-400 billion stars**! And there are billions of galaxies in the universe! Scientists estimate there are more stars in the universe than grains of sand on all of Earth's beaches! 🏖️",
};

function findKnowledgeBaseAnswer(question: string): string | null {
  const q = question.toLowerCase().trim().replace(/[?!.]/g, "");

  for (const [key, answer] of Object.entries(knowledgeBase)) {
    if (q.includes(key) || key.includes(q)) {
      return answer;
    }
  }

  // Fuzzy matching - check if most words match
  const qWords = q.split(" ").filter((w) => w.length > 3);
  for (const [key, answer] of Object.entries(knowledgeBase)) {
    const keyWords = key.split(" ").filter((w) => w.length > 3);
    const matchCount = qWords.filter((w) => keyWords.includes(w)).length;
    if (matchCount >= 2 && matchCount >= qWords.length * 0.5) {
      return answer;
    }
  }

  return null;
}

function generateGenericAnswer(
  _question: string,
  subject: string,
  _emoji: string,
): string {
  const templates: Record<string, string[]> = {
    Math: [
      "🔢 Great math question! Let me help you think through this step by step. Math is all about patterns and problem-solving. Try breaking the problem into smaller parts! 💡",
    ],
    Science: [
      "🔬 Wonderful science question! Science helps us understand how the world works. Scientists ask questions just like you and then do experiments to find answers! Keep being curious! 🌟",
      "⚗️ That's a fascinating science question! The natural world is full of amazing things to discover. Scientists spend their whole lives exploring questions like yours! 🔭",
    ],
    History: [
      "📜 Great history question! History helps us learn from the past and understand how the world became the way it is today. Every event in history has a cause and effect! 🌍",
    ],
    Geography: [
      "🌍 Excellent geography question! Our planet is an amazing place with so many different landscapes, countries, and cultures. Geography helps us understand where things are and why! 🗺️",
    ],
    English: [
      "📝 Great English question! Language is how we communicate and share ideas. English has over 170,000 words — there's always something new to learn! 📚",
    ],
    Technology: [
      "💻 Awesome technology question! Technology is changing our world every day. The people who build technology are called engineers and programmers — maybe you'll be one someday! 🚀",
    ],
    "Health & Body": [
      "❤️ Great health question! Your body is an amazing machine with trillions of cells all working together. Taking care of your body helps you feel great and do all the things you love! 💪",
    ],
    "Arts & Culture": [
      "🎨 Wonderful question about arts and culture! Art, music, and culture help us express ourselves and connect with others. Every culture has its own beautiful traditions! 🌈",
    ],
    "General Knowledge": [
      "🌟 What a curious question! The world is full of amazing things to discover. Keep asking questions — that's how all great scientists, explorers, and inventors started! 🚀",
      "💡 Great question! Curiosity is the first step to learning. The more questions you ask, the smarter you become! Keep exploring! ⭐",
    ],
  };

  const subjectTemplates = templates[subject] || templates["General Knowledge"];
  return subjectTemplates[Math.floor(Math.random() * subjectTemplates.length)];
}

export function processQuestion(question: string): AnswerResult {
  if (!isContentSafe(question)) {
    return {
      subject: "Safety",
      subjectEmoji: "🛡️",
      answer:
        "🛡️ Oops! That question isn't something I can help with. Let's stick to fun learning topics like science, math, history, and more! Ask me something else! 😊",
      isMath: false,
      isFiltered: true,
    };
  }

  const mathData = detectMathQuestion(question);
  const { subject, emoji } = detectSubject(question);

  if (mathData.isMath && mathData.expression !== undefined) {
    return {
      subject: "Math",
      subjectEmoji: "🔢",
      answer: "",
      isMath: true,
      mathData,
    };
  }

  const kbAnswer = findKnowledgeBaseAnswer(question);
  const answer = kbAnswer || generateGenericAnswer(question, subject, emoji);

  return {
    subject,
    subjectEmoji: emoji,
    answer,
    isMath: false,
  };
}
