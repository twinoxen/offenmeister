/**
 * Bundled seed content: languages, language pairs, frequency-ordered
 * collections, and cloze sentences. Loaded idempotently by `seed.run`.
 *
 * Each sentence's `clozeWord` must appear verbatim as a whole word in `text`;
 * the loader derives render tokens, the blank position, and frequency rank.
 */

export interface SeedLanguage {
  code: string
  name: string
  nativeName: string
  flag: string
}

export interface SeedSentence {
  text: string
  clozeWord: string
  translation: string
  distractors: string[]
  hint?: string
}

export interface SeedCollection {
  slug: string
  name: string
  description: string
  sentences: SeedSentence[]
}

export interface SeedPair {
  slug: string
  name: string
  targetCode: string
  baseCode: string
  collections: SeedCollection[]
}

export const LANGUAGES: SeedLanguage[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
]

const SPANISH: SeedSentence[] = [
  { text: 'Yo no sé.', clozeWord: 'sé', translation: "I don't know.", distractors: ['soy', 'veo', 'voy'], hint: 'saber — to know' },
  { text: '¿Dónde está el baño?', clozeWord: 'está', translation: 'Where is the bathroom?', distractors: ['estoy', 'es', 'son'] },
  { text: 'Quiero un vaso de agua.', clozeWord: 'agua', translation: 'I want a glass of water.', distractors: ['leche', 'vino', 'café'] },
  { text: 'Ella tiene dos hermanos.', clozeWord: 'tiene', translation: 'She has two brothers.', distractors: ['tengo', 'tienen', 'tenía'] },
  { text: 'Hoy hace mucho calor.', clozeWord: 'calor', translation: 'Today it is very hot.', distractors: ['frío', 'viento', 'sol'] },
  { text: 'Nosotros vamos a la playa.', clozeWord: 'playa', translation: 'We are going to the beach.', distractors: ['montaña', 'ciudad', 'casa'] },
  { text: 'El niño come una manzana.', clozeWord: 'manzana', translation: 'The boy eats an apple.', distractors: ['naranja', 'pera', 'uva'] },
  { text: 'Necesito comprar pan.', clozeWord: 'pan', translation: 'I need to buy bread.', distractors: ['leche', 'queso', 'arroz'] },
  { text: 'Mi casa es muy grande.', clozeWord: 'grande', translation: 'My house is very big.', distractors: ['pequeña', 'alta', 'nueva'] },
  { text: 'Me gusta leer libros.', clozeWord: 'libros', translation: 'I like to read books.', distractors: ['cartas', 'revistas', 'periódicos'] },
  { text: 'Vamos a comer a las dos.', clozeWord: 'comer', translation: 'We are going to eat at two.', distractors: ['dormir', 'correr', 'beber'] },
  { text: 'Hace frío en invierno.', clozeWord: 'invierno', translation: 'It is cold in winter.', distractors: ['verano', 'otoño', 'primavera'] },
  { text: 'El perro corre en el parque.', clozeWord: 'perro', translation: 'The dog runs in the park.', distractors: ['gato', 'caballo', 'pájaro'] },
  { text: 'Tengo que estudiar esta noche.', clozeWord: 'estudiar', translation: 'I have to study tonight.', distractors: ['trabajar', 'cocinar', 'limpiar'] },
  { text: 'Ella habla tres idiomas.', clozeWord: 'idiomas', translation: 'She speaks three languages.', distractors: ['palabras', 'libros', 'países'] },
  { text: '¿Cuánto cuesta esto?', clozeWord: 'cuesta', translation: 'How much does this cost?', distractors: ['vale', 'paga', 'tiene'] },
  { text: 'Estoy muy cansado hoy.', clozeWord: 'cansado', translation: 'I am very tired today.', distractors: ['contento', 'enfermo', 'ocupado'] },
  { text: 'Mañana es mi cumpleaños.', clozeWord: 'cumpleaños', translation: 'Tomorrow is my birthday.', distractors: ['trabajo', 'examen', 'viaje'] },
]

const FRENCH: SeedSentence[] = [
  { text: 'Je ne sais pas.', clozeWord: 'sais', translation: "I don't know.", distractors: ['suis', 'vais', 'fais'], hint: 'savoir — to know' },
  { text: 'Où est la gare ?', clozeWord: 'gare', translation: 'Where is the train station?', distractors: ['porte', 'rue', 'ville'] },
  { text: 'Je voudrais un café.', clozeWord: 'café', translation: 'I would like a coffee.', distractors: ['thé', 'verre', 'jus'] },
  { text: 'Elle a deux enfants.', clozeWord: 'enfants', translation: 'She has two children.', distractors: ['amis', 'frères', 'chiens'] },
  { text: 'Il fait très chaud aujourd’hui.', clozeWord: 'chaud', translation: 'It is very hot today.', distractors: ['froid', 'beau', 'gris'] },
  { text: 'Nous allons à la plage.', clozeWord: 'plage', translation: 'We are going to the beach.', distractors: ['montagne', 'ville', 'maison'] },
  { text: 'Le garçon mange une pomme.', clozeWord: 'pomme', translation: 'The boy eats an apple.', distractors: ['poire', 'orange', 'banane'] },
  { text: 'Je dois acheter du pain.', clozeWord: 'pain', translation: 'I have to buy bread.', distractors: ['lait', 'fromage', 'riz'] },
  { text: 'Ma maison est très grande.', clozeWord: 'grande', translation: 'My house is very big.', distractors: ['petite', 'belle', 'vieille'] },
  { text: 'J’aime lire des livres.', clozeWord: 'livres', translation: 'I like to read books.', distractors: ['lettres', 'journaux', 'revues'] },
  { text: 'Nous allons manger à midi.', clozeWord: 'manger', translation: 'We are going to eat at noon.', distractors: ['dormir', 'courir', 'boire'] },
  { text: 'Il fait froid en hiver.', clozeWord: 'hiver', translation: 'It is cold in winter.', distractors: ['été', 'automne', 'printemps'] },
  { text: 'Le chien court dans le parc.', clozeWord: 'chien', translation: 'The dog runs in the park.', distractors: ['chat', 'cheval', 'oiseau'] },
  { text: 'Je dois travailler demain.', clozeWord: 'travailler', translation: 'I have to work tomorrow.', distractors: ['étudier', 'cuisiner', 'voyager'] },
  { text: 'Elle parle trois langues.', clozeWord: 'langues', translation: 'She speaks three languages.', distractors: ['mots', 'pays', 'livres'] },
  { text: 'Combien ça coûte ?', clozeWord: 'coûte', translation: 'How much does it cost?', distractors: ['vaut', 'paie', 'fait'] },
  { text: 'Je suis très fatigué.', clozeWord: 'fatigué', translation: 'I am very tired.', distractors: ['content', 'malade', 'occupé'] },
  { text: 'Je voudrais réserver une table.', clozeWord: 'table', translation: 'I would like to reserve a table.', distractors: ['chambre', 'place', 'salle'] },
]

const GERMAN: SeedSentence[] = [
  { text: 'Ich weiß es nicht.', clozeWord: 'weiß', translation: "I don't know.", distractors: ['sehe', 'gehe', 'habe'], hint: 'wissen — to know' },
  { text: 'Wo ist der Bahnhof?', clozeWord: 'Bahnhof', translation: 'Where is the train station?', distractors: ['Flughafen', 'Markt', 'Park'] },
  { text: 'Ich möchte ein Glas Wasser.', clozeWord: 'Wasser', translation: 'I would like a glass of water.', distractors: ['Milch', 'Bier', 'Saft'] },
  { text: 'Sie hat zwei Kinder.', clozeWord: 'Kinder', translation: 'She has two children.', distractors: ['Brüder', 'Hunde', 'Freunde'] },
  { text: 'Heute ist es sehr heiß.', clozeWord: 'heiß', translation: 'Today it is very hot.', distractors: ['kalt', 'schön', 'windig'] },
  { text: 'Wir gehen zum Strand.', clozeWord: 'Strand', translation: 'We are going to the beach.', distractors: ['Berg', 'Stadt', 'Haus'] },
  { text: 'Der Junge isst einen Apfel.', clozeWord: 'Apfel', translation: 'The boy eats an apple.', distractors: ['Birne', 'Orange', 'Banane'] },
  { text: 'Ich muss Brot kaufen.', clozeWord: 'Brot', translation: 'I have to buy bread.', distractors: ['Milch', 'Käse', 'Reis'] },
  { text: 'Mein Haus ist sehr groß.', clozeWord: 'groß', translation: 'My house is very big.', distractors: ['klein', 'neu', 'alt'] },
  { text: 'Ich lese gern Bücher.', clozeWord: 'Bücher', translation: 'I like to read books.', distractors: ['Briefe', 'Zeitungen', 'Karten'] },
  { text: 'Wir essen um zwölf Uhr.', clozeWord: 'essen', translation: 'We eat at twelve o’clock.', distractors: ['schlafen', 'laufen', 'trinken'] },
  { text: 'Im Winter ist es kalt.', clozeWord: 'Winter', translation: 'In winter it is cold.', distractors: ['Sommer', 'Herbst', 'Frühling'] },
  { text: 'Der Hund läuft im Park.', clozeWord: 'Hund', translation: 'The dog runs in the park.', distractors: ['Katze', 'Vogel', 'Pferd'] },
  { text: 'Ich muss heute arbeiten.', clozeWord: 'arbeiten', translation: 'I have to work today.', distractors: ['lernen', 'kochen', 'reisen'] },
  { text: 'Sie spricht drei Sprachen.', clozeWord: 'Sprachen', translation: 'She speaks three languages.', distractors: ['Wörter', 'Länder', 'Bücher'] },
  { text: 'Wie viel kostet das?', clozeWord: 'kostet', translation: 'How much does that cost?', distractors: ['zahlt', 'hat', 'macht'] },
  { text: 'Ich bin heute sehr müde.', clozeWord: 'müde', translation: 'I am very tired today.', distractors: ['froh', 'krank', 'beschäftigt'] },
  { text: 'Kannst du mir bitte helfen?', clozeWord: 'helfen', translation: 'Can you help me, please?', distractors: ['sehen', 'kommen', 'warten'] },
]

function splitCollections(
  code: string,
  langName: string,
  sentences: SeedSentence[],
): SeedCollection[] {
  const half = Math.ceil(sentences.length / 2)
  return [
    {
      slug: `${code}-fast-track-1`,
      name: `${langName} Fast Track 1`,
      description: `The most common ${langName} words, in real sentences.`,
      sentences: sentences.slice(0, half),
    },
    {
      slug: `${code}-fast-track-2`,
      name: `${langName} Fast Track 2`,
      description: `More high-frequency ${langName} vocabulary to build on the basics.`,
      sentences: sentences.slice(half),
    },
  ]
}

export const PAIRS: SeedPair[] = [
  {
    slug: 'es-from-en',
    name: 'Spanish from English',
    targetCode: 'es',
    baseCode: 'en',
    collections: splitCollections('es', 'Spanish', SPANISH),
  },
  {
    slug: 'fr-from-en',
    name: 'French from English',
    targetCode: 'fr',
    baseCode: 'en',
    collections: splitCollections('fr', 'French', FRENCH),
  },
  {
    slug: 'de-from-en',
    name: 'German from English',
    targetCode: 'de',
    baseCode: 'en',
    collections: splitCollections('de', 'German', GERMAN),
  },
]
