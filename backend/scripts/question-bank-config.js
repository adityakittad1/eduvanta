/**
 * Copyright (c) 2026 Aditya Kittad. All Rights Reserved.
 * Eduvanta - Multi-Tenant School ERP and Digital Campus Platform
 *
 * Master Question Bank Generator (Classes 1-10)
 * Generates 100 questions per subject-class combination with strict difficulty and type distribution.
 */

const fs = require('fs');
const path = require('path');

// Classes & Subjects configuration
const CONFIG = [
  // Classes 1-10: Mathematics (10 x 100 = 1000)
  ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(c => ({ classNum: c, subject: 'Mathematics', subjectCode: 'MATH' })),
  // Classes 1-10: Science / EVS (10 x 100 = 1000)
  ...[1, 2, 3, 4].map(c => ({ classNum: c, subject: 'Environmental Studies', subjectCode: 'EVS' })),
  ...[5, 6, 7, 8, 9, 10].map(c => ({ classNum: c, subject: 'Science', subjectCode: 'SCI' })),
  // Classes 1-10: English (10 x 100 = 1000)
  ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(c => ({ classNum: c, subject: 'English', subjectCode: 'ENG' })),
  // Classes 6-10: Social Studies (5 x 100 = 500)
  ...[6, 7, 8, 9, 10].map(c => ({ classNum: c, subject: 'Social Science', subjectCode: 'SOC' })),
  // Classes 1-5: Hindi (5 x 100 = 500)
  ...[1, 2, 3, 4, 5].map(c => ({ classNum: c, subject: 'Hindi', subjectCode: 'HIN' })),
];

console.log(`Generating Question Bank for ${CONFIG.length} subject-class combinations (${CONFIG.length * 100} questions)...`);

// Topics by Subject and Class
const TOPICS = {
  Mathematics: {
    1: ['Counting & Numbers', 'Basic Addition', 'Basic Subtraction', 'Shapes & Space', 'Measurement & Length', 'Patterns', 'Money & Coins', 'Time & Days'],
    2: ['Two-Digit Numbers', 'Addition with Regrouping', 'Subtraction', 'Multiplication Basics', 'Division as Sharing', '2D & 3D Shapes', 'Fractions (Halves & Quarters)', 'Measurement & Capacity'],
    3: ['Three-Digit Numbers', 'Four-Digit Place Value', 'Multiplication Tables', 'Short Division', 'Fractions', 'Time & Clock', 'Money Word Problems', 'Measurement (Kg, Gram, Liter)'],
    4: ['Large Numbers', 'Multi-Digit Multiplication', 'Long Division', 'Factors & Multiples', 'Fraction Operations', 'Decimals Introduction', 'Perimeter of Rectangles', 'Angles & Shapes'],
    5: ['Numbers up to Crores', 'LCM & HCF', 'Fractions & Mixed Numbers', 'Decimals & Operations', 'Area & Perimeter', 'Volume Basics', 'Percentages Basics', 'Symmetry & Patterns'],
    6: ['Knowing Our Numbers', 'Whole Numbers & Integers', 'Fractions & Decimals', 'Introduction to Algebra', 'Ratio & Proportion', 'Basic Geometrical Ideas', 'Mensuration', 'Data Handling'],
    7: ['Integers Operations', 'Fractions & Decimals', 'Simple Linear Equations', 'Lines & Angles', 'The Triangle & Its Properties', 'Comparing Quantities (Profit/Loss)', 'Rational Numbers', 'Exponents & Powers'],
    8: ['Rational Numbers', 'Linear Equations in One Variable', 'Understanding Quadrilaterals', 'Squares & Square Roots', 'Cubes & Cube Roots', 'Compound Interest & Discounts', 'Algebraic Expressions & Identities', 'Mensuration (Solid Figures)'],
    9: ['Number Systems & Irrationals', 'Polynomials & Factorization', 'Coordinate Geometry', 'Linear Equations in Two Variables', 'Lines, Angles & Triangles', 'Quadrilaterals & Circles', 'Heron\'s Formula', 'Surface Areas & Volumes'],
    10: ['Real Numbers & Euclid\'s Lemma', 'Polynomials & Zeroes', 'Pair of Linear Equations', 'Quadratic Equations', 'Arithmetic Progressions', 'Similar Triangles', 'Trigonometry & Identities', 'Heights & Distances', 'Statistics & Probability'],
  },
  'Environmental Studies': {
    1: ['My Family & Relatives', 'My Body & Five Senses', 'Healthy Food Habits', 'Types of Clothes', 'My Home & Rooms', 'Cleanliness & Hygiene', 'Animals around Us', 'Plants and Trees'],
    2: ['Our Neighbourhood', 'Festivals & Celebrations', 'Means of Transport', 'Safety Rules & First Aid', 'Air & Water Sources', 'Seasons & Weather', 'Good Habits & Manners', 'Living & Non-Living Things'],
    3: ['Parts of a Plant', 'Animal Habitats & Diet', 'Water Cycle & Conservation', 'Cooking & Food Sources', 'Work People Do', 'Shelters of Animals', 'Travel & Communication', 'Natural vs Man-made Resources'],
    4: ['Plant Life Cycles', 'Adaptations in Animals', 'Clean Water & Purification', 'Waste Management & Recycling', 'Mapping Our State', 'Community Living & Panchayat', 'Forests & Wildlife', 'Pollution Prevention'],
  },
  Science: {
    5: ['Human Skeletal System', 'Food & Deficiency Diseases', 'States of Matter', 'Force, Energy & Simple Machines', 'Pollution & Conservation', 'Seed Germination & Dispersal', 'Animal Adaptations', 'Moon & Solar System'],
    6: ['Components of Food', 'Sorting Materials into Groups', 'Separation of Substances', 'Getting to Know Plants', 'Body Movements & Joints', 'The Living Organisms & Surroundings', 'Motion & Measurement of Distances', 'Light, Shadows & Reflections'],
    7: ['Nutrition in Plants & Animals', 'Heat & Temperature Transfer', 'Acids, Bases & Salts', 'Physical & Chemical Changes', 'Respiration in Organisms', 'Transportation in Plants & Animals', 'Reproduction in Plants', 'Electric Current & Its Effects'],
    8: ['Crop Production & Management', 'Microorganisms: Friend & Foe', 'Combustion & Flame', 'Conservation of Plants & Animals', 'Reproduction in Animals', 'Force & Pressure', 'Friction & Motion', 'Sound & Acoustics', 'Light & Human Eye'],
    9: ['Matter in Our Surroundings', 'Is Matter Around Us Pure?', 'Atoms and Molecules', 'Structure of the Atom', 'Fundamental Unit of Life (Cell)', 'Tissues: Plant & Animal', 'Motion & Equations of Motion', 'Force and Laws of Motion', 'Gravitation & Floatation', 'Work, Energy & Power'],
    10: ['Chemical Reactions & Equations', 'Acids, Bases and Salts', 'Metals and Non-metals', 'Carbon and its Compounds', 'Life Processes (Nutrition & Respiration)', 'Control and Coordination', 'How do Organisms Reproduce?', 'Heredity & Evolution', 'Light: Reflection & Refraction', 'Human Eye & Colourful World', 'Electricity & Circuits', 'Magnetic Effects of Current'],
  },
  English: {
    1: ['Nouns (Naming Words)', 'Singular and Plural', 'Action Words (Verbs)', 'Pronouns (He, She, It)', 'Describing Words (Adjectives)', 'Opposites & Antonyms', 'Articles (A, An)', 'Prepositions (In, On, Under)'],
    2: ['Proper & Common Nouns', 'Compound Words', 'Helping Verbs (Is, Am, Are)', 'Past Tense Basics', 'Comparatives & Superlatives', 'Rhyming Words', 'Simple Punctuation', 'Reading Comprehension'],
    3: ['Nouns & Genders', 'Pronoun Usage', 'Simple Present & Past', 'Adjectives & Degrees', 'Adverbs of Manner', 'Conjunctions (And, But, Because)', 'Punctuation & Capitalization', 'Prefixes & Suffixes'],
    4: ['Abstract & Collective Nouns', 'Subject-Verb Agreement', 'Tenses: Continuous & Simple', 'Prepositions of Time & Place', 'Direct & Indirect Objects', 'Idioms & Phrases', 'Homophones & Homonyms', 'Synonyms & Vocabulary'],
    5: ['Transitive & Intransitive Verbs', 'Direct & Indirect Speech Basics', 'Active and Passive Voice Intro', 'Types of Sentences (Declarative, Interrogative)', 'Correlative Conjunctions', 'Modifiers & Participles', 'Advanced Prepositions', 'Comprehension & Inference'],
    6: ['Noun Clauses & Phrases', 'Finite and Non-Finite Verbs', 'Modal Auxiliaries (Can, Should, Must)', 'Active & Passive Voice', 'Reported Speech: Statements', 'Relative Clauses (Who, Which)', 'Prepositional Phrases', 'Analytical Vocabulary'],
    7: ['Subject-Verb Concord Advanced', 'Determiners & Quantifiers', 'Gerunds and Infinitives', 'Reported Speech: Imperatives & Questions', 'Conditional Clauses (Types 0, 1, 2)', 'Complex Sentences', 'Formal Letter Writing Conventions', 'Poetic Devices (Metaphor, Simile)'],
    8: ['Advanced Tenses & Perfect Aspect', 'Modals of Deduction & Probability', 'Transformation of Sentences', 'Synthesis of Sentences', 'Direct & Indirect Speech Complete', 'Clauses of Reason & Contrast', 'Idiomatic Expressions', 'Critical Reading Analysis'],
    9: ['Advanced Reported Speech', 'Passive Constructions in Journalism', 'Subjunctive Mood', 'Punctuation & Syntax Nuances', 'Figures of Speech (Personification, Hyperbole)', 'Theme & Tone Identification', 'Persuasive Writing Elements', 'Vocabulary in Context'],
    10: ['Subject-Verb Agreement Edge Cases', 'Reported Speech: Exclamations & Commands', 'Modal Nuances & Ellipsis', 'Parallel Structure & Balance', 'Complex Sentence Synthesis', 'Rhetorical Devices', 'Formal Report & Editorial Analysis', 'Critical Text Evaluation'],
  },
  'Social Science': {
    6: ['What, Where, How and When (Early Humans)', 'From Hunting-Gathering to Growing Food', 'In the Earliest Cities (Indus Valley)', 'The Earth in the Solar System', 'Globe: Latitudes and Longitudes', 'Major Domains of the Earth', 'Understanding Diversity', 'What is Government & Democracy?'],
    7: ['Tracing Changes Through a Thousand Years', 'New Kings and Kingdoms (Cholas, Delhi Sultanate)', 'The Mughal Empire', 'Our Environment & Ecosystems', 'Inside Our Earth (Rock Cycle)', 'Water: Oceans & Currents', 'Role of the Government in Health', 'Growing Up as Boys & Girls (Gender Justice)'],
    8: ['How, When and Where (Colonial Rule)', 'From Trade to Territory (East India Company)', 'When People Rebel: 1857 and After', 'Civilising the Native, Educating the Nation', 'Resources: Natural, Human & Sustainable', 'Agriculture: Major Crops & Farming Types', 'Industries & Classification', 'The Indian Constitution & Secularism', 'Understanding Laws & Judiciary'],
    9: ['The French Revolution', 'Socialism in Europe & Russian Revolution', 'Nazism and the Rise of Hitler', 'India: Size and Location', 'Physical Features of India (Himalayas, Plains)', 'Drainage & River Systems', 'What is Democracy? Why Democracy?', 'Constitutional Design (Indian Constitution)', 'Electoral Politics in India', 'The Story of Village Palampur & Economics'],
    10: ['The Rise of Nationalism in Europe', 'Nationalism in India (Satyagraha & Non-Cooperation)', 'The Making of a Global World', 'Print Culture and the Modern World', 'Resources and Development', 'Water Resources & Multipurpose Dams', 'Agriculture & Food Security', 'Minerals and Energy Resources', 'Power Sharing & Federalism', 'Gender, Religion and Caste', 'Money and Credit', 'Globalization and the Indian Economy'],
  },
  Hindi: {
    1: ['वर्णमाला (स्वर और व्यंजन)', 'दो और तीन अक्षर वाले शब्द', 'मात्राओं की पहचान (आ, इ, ई)', 'सब्जियों और फलों के नाम', 'रंगों के नाम', 'पशु और पक्षियों के नाम', 'गिनती (१ से १०)', 'समान तुक वाले शब्द'],
    2: ['उ, ऊ और ऋ की मात्रा', 'संज्ञा की पहचान (नाम वाले शब्द)', 'लिंग बदलो (पुल्लिंग - स्त्रीलिंग)', 'वचन बदलो (एकवचन - बहुवचन)', 'विलोम शब्द (उलटे अर्थ)', 'गिनती (११ से २०)', 'दिनों और महीनों के नाम', 'वाक्य रचना'],
    3: ['सर्वनाम (मैं, तुम, वह)', 'क्रिया (काम वाले शब्द)', 'विशेषण (गुण बताने वाले शब्द)', 'पर्यायवाची शब्द', 'मुहावरे (सरल)', 'विराम चिह्न का प्रयोग', 'गिनती (२१ से ५०)', 'अनुच्छेद पठन एवं प्रश्न'],
    4: ['काल (वर्तमान, भूत, भविष्य)', 'उपसर्ग और प्रत्यय का परिचय', 'अनेक शब्दों के लिए एक शब्द', 'शुद्ध-अशुद्ध वर्तनी', 'मुहावरों का अर्थ एवं प्रयोग', 'संवाद लेखन के नियम', 'पर्यायवाची एवं विलोम शब्द', 'कहानी बोध'],
    5: ['संज्ञा के भेद (व्यक्तिवाचक, जातिवाचक, भाववाचक)', 'सर्वनाम के भेद', 'कारक और उनके चिह्न (ने, को, से)', 'संधि का प्रारंभिक परिचय', 'लोकोक्तियाँ और कहावतें', 'पत्र लेखन के अंग', 'अपठित गद्यांश बोध', 'सटीक शब्द चयन'],
  }
};

module.exports = { CONFIG, TOPICS };
