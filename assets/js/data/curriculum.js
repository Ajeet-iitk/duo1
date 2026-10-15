/* =========================================================================
   Bhasha — curriculum data
   Three courses: Tamil (ta), Telugu (te), Gujarati (gu)
   Every learning item carries BOTH an English and a Hindi gloss, so any
   course can be studied from either base language.
   ========================================================================= */
(function (root) {
  'use strict';

  /* Compact tuple -> object. [en, hi, script, roman] */
  function words(code, arr) {
    return arr.map(function (a, i) {
      return {
        id: code + '_' + (i + 1),
        en: a[0],
        hi: a[1],
        script: a[2],
        roman: a[3],
        note: a[4] || ''
      };
    });
  }

  /* Compact tuple -> phrase object. [en, hi, script, roman] */
  function phrases(code, arr) {
    return arr.map(function (a, i) {
      var p = {
        id: code + '_p' + (i + 1),
        en: a[0],
        hi: a[1],
        script: a[2],
        roman: a[3]
      };
      p.tiles = p.script.split(/\s+/);
      return p;
    });
  }

  /* ------------------------------------------------------------------ TA */
  var TAMIL = {
    id: 'ta',
    name: 'Tamil',
    native: 'தமிழ்',
    flag: '🪔',
    speech: 'ta-IN',
    color: '#58CC02',
    roman: 'Romanized Tamil',
    scriptInfo: {
      name: 'Tamil script (தமிழ் எழுத்து)',
      dir: 'left to right',
      blurb:
        'Tamil is written with an abugida: each consonant carries a built-in vowel "a". ' +
        'Vowel signs (matras) attach to consonants to change the vowel, and a dot (virama / pulli) on top ' +
        'silences it. Words in a sentence are separated by spaces, and Tamil is agglutinative — meaning is ' +
        'built by stacking suffixes onto a root. Tamil is an official language of India, Sri Lanka and Singapore.',
      vowelHint: 'Vowels are called உயிர் (uyir, "life") and consonants மெய் (mey, "body").',
      letters: [
        ['அ', 'a', 'like a in "about"'], ['ஆ', 'aa', 'like a in "father"'],
        ['இ', 'i', 'like i in "sit"'], ['ஈ', 'ee', 'like ee in "see"'],
        ['உ', 'u', 'like u in "put"'], ['ஊ', 'uu', 'like oo in "moon"'],
        ['எ', 'e', 'like e in "pen"'], ['ஏ', 'ee', 'like a in "cake"'],
        ['ஐ', 'ai', 'like y in "my"'], ['ஒ', 'o', 'like o in "go"'],
        ['ஓ', 'oo', 'like o in "more"'], ['ஔ', 'au', 'like ou in "cow"'],
        ['க', 'ka', 'k / g'], ['ங', 'nga', 'ng as in "sing"'],
        ['ச', 'cha', 'ch / s'], ['ஞ', 'nya', 'ny as in "canyon"'],
        ['ட', 'ta', 'retroflex t'], ['ண', 'na', 'retroflex n'],
        ['த', 'tha', 'dental th'], ['ந', 'na', 'dental n'],
        ['ப', 'pa', 'p / b'], ['ம', 'ma', 'm'],
        ['ய', 'ya', 'y'], ['ர', 'ra', 'r (soft)'],
        ['ல', 'la', 'l'], ['வ', 'va', 'v / w'],
        ['ழ', 'zha', 'unique Tamil sound, tongue curled back'],
        ['ள', 'lla', 'retroflex l'], ['ற', 'ra', 'hard r'], ['ன', 'na', 'n (special)']
      ]
    },
    units: [
      {
        id: 'ta-u0', title: 'Sounds & Script', subtitle: 'Read your first Tamil letters',
        color: '#1CB0F6', icon: '✏️',
        notes: [
          { title: 'An abugida, not an alphabet', body: 'Every consonant letter already contains the vowel "a": க is "ka", not just "k". Add a vowel sign to change it (கா = kaa), or the pulli dot ் to remove the vowel (க் = k).' },
          { title: 'Long vs short', body: 'Tamil cares about vowel length. எ (e) vs ஏ (ee) are different letters and different sounds. Getting length right matters more than getting the accent right.' }
        ],
        items: words('ta', [
          ['letter "a"', 'अक्षर "अ"', 'அ', 'a'],
          ['letter "aa"', 'अक्षर "आ"', 'ஆ', 'aa'],
          ['letter "i"', 'अक्षर "इ"', 'இ', 'i'],
          ['letter "ee"', 'अक्षर "ई"', 'ஈ', 'ee'],
          ['letter "u"', 'अक्षर "उ"', 'உ', 'u'],
          ['letter "ka"', 'अक्षर "क"', 'க', 'ka'],
          ['letter "ma"', 'अक्षर "म"', 'ம', 'ma'],
          ['letter "va"', 'अक्षर "व"', 'வ', 'va'],
          ['letter "ya"', 'अक्षर "य"', 'ய', 'ya'],
          ['letter "na"', 'अक्षर "न"', 'ந', 'na']
        ]),
        phrases: []
      },
      {
        id: 'ta-u1', title: 'Basics & Greetings', subtitle: 'Say hello and be polite',
        color: '#58CC02', icon: '👋',
        notes: [
          { title: 'வணக்கம் (vanakkam) does a lot', body: 'It means hello, welcome and goodbye all at once. Stack it with a time of day: காலை வணக்கம் (kaalai vanakkam) = good morning, மாலை வணக்கம் (maalai vanakkam) = good evening.' },
          { title: 'Two different "no"s', body: 'இல்லை (illai) answers "is it there? → no" and fails a statement. ஆம் (aam) is a formal yes.' },
          { title: 'Politeness has a plural', body: 'Tamil uses the plural ending -கள் (kal) and verb forms in -ஈர்கள் (-eerkal) when speaking to elders or strangers. எப்படி இருக்கிறீர்கள்? is the respectful "How are you?".' }
        ],
        items: words('ta', [
          ['hello', 'नमस्ते', 'வணக்கம்', 'vanakkam'],
          ['thank you', 'धन्यवाद', 'நன்றி', 'nandri'],
          ['yes', 'हाँ', 'ஆம்', 'aam'],
          ['no', 'नहीं', 'இல்லை', 'illai'],
          ['sorry / excuse me', 'माफ़ कीजिए', 'மன்னிக்கவும்', 'mannikkavum'],
          ['please', 'कृपया', 'தயவுசெய்து', 'thayavu seydhu'],
          ['good morning', 'सुप्रभात', 'காலை வணக்கம்', 'kaalai vanakkam'],
          ['goodbye', 'अलविदा', 'போய் வருகிறேன்', 'poi varukiren']
        ]),
        phrases: phrases('ta', [
          ['How are you?', 'आप कैसे हैं?', 'எப்படி இருக்கிறீர்கள்?', 'eppadi irukkirirkal?'],
          ['My name is Kumar.', 'मेरा नाम कुमार है।', 'என் பெயர் குமார்.', 'en peyar kumaar.']
        ])
      },
      {
        id: 'ta-u2', title: 'People & Family', subtitle: 'Talk about the people you love',
        color: '#CE82FF', icon: '👨‍👩‍👧',
        notes: [
          { title: 'Family words encode age', body: 'Tamil has no plain "brother": அண்ணன் (annan) is an elder brother and தம்பி (thambi) a younger one. அக்கா (akka) is an elder sister, தங்கை (thangai) a younger one.' },
          { title: 'Showing possession with என்', body: 'என் (en) = my, உன் (un) = your (informal), உங்கள் (ungal) = your (polite). என் அம்மா = my mother.' }
        ],
        items: words('ta', [
          ['mother', 'माँ', 'அம்மா', 'amma'],
          ['father', 'पिता', 'அப்பா', 'appa'],
          ['elder brother', 'बड़ा भाई', 'அண்ணன்', 'annan'],
          ['elder sister', 'बड़ी बहन', 'அக்கா', 'akka'],
          ['friend', 'दोस्त', 'நண்பன்', 'nanban'],
          ['child', 'बच्चा', 'குழந்தை', 'kuzhanthai'],
          ['man', 'आदमी', 'ஆண்', 'aan'],
          ['woman', 'औरत', 'பெண்', 'pen'],
          ['family', 'परिवार', 'குடும்பம்', 'kudumbam'],
          ['grandmother', 'दादी', 'பாட்டி', 'paatti']
        ]),
        phrases: phrases('ta', [
          ['This is my mother.', 'यह मेरी माँ है।', 'இது என் அம்மா.', 'idhu en amma.'],
          ['He is my friend.', 'वह मेरा दोस्त है।', 'அவன் என் நண்பன்.', 'avan en nanban.']
        ])
      },
      {
        id: 'ta-u3', title: 'Food & Drink', subtitle: 'Order what you actually want to eat',
        color: '#FF9600', icon: '🍚',
        notes: [
          { title: 'தண்ணீர் vs நீர்', body: 'Everyday spoken Tamil says தண்ணீர் (thanneer) for water. நீர் (neer) is the literary form you will meet in songs.' },
          { title: '"I want" = எனக்கு … வேண்டும்', body: 'Literally "to me … is needed". எனக்கு தண்ணீர் வேண்டும் = I want water. Swap வேண்டும் for வேண்டாம் to say you do not want it.' }
        ],
        items: words('ta', [
          ['water', 'पानी', 'தண்ணீர்', 'thanneer'],
          ['rice / cooked rice', 'चावल', 'சோறு', 'soru'],
          ['milk', 'दूध', 'பால்', 'paal'],
          ['tea', 'चाय', 'தேநீர்', 'theneer'],
          ['coffee', 'कॉफ़ी', 'காபி', 'kaapi'],
          ['food', 'खाना', 'உணவு', 'unavu'],
          ['banana', 'केला', 'வாழைப்பழம்', 'vaazhaipazham'],
          ['sugar', 'चीनी', 'சர்க்கரை', 'sarkkarai'],
          ['idli', 'इडली', 'இட்லி', 'idli'],
          ['dosa', 'डोसा', 'தோசை', 'dosai']
        ]),
        phrases: phrases('ta', [
          ['I want water.', 'मुझे पानी चाहिए।', 'எனக்கு தண்ணீர் வேண்டும்.', 'enakku thanneer vendum.'],
          ['This is milk.', 'यह दूध है।', 'இது பால்.', 'idhu paal.']
        ])
      },
      {
        id: 'ta-u4', title: 'Numbers & Time', subtitle: 'Count and talk about your day',
        color: '#14D4F4', icon: '🔢',
        notes: [
          { title: 'Numbers behave like nouns', body: 'ஒன்று (one), இரண்டு (two) stand alone, but before a noun Tamil often uses the shorter attributive form: ஒரு (oru) வீடு = one house, இரண்டு வீடுகள் = two houses.' },
          { title: 'Indru vs Naalai', body: 'இன்று (indru) = today, நாளை (naalai) = tomorrow, நேற்று (netru) = yesterday. Time words go early in the sentence.' }
        ],
        items: words('ta', [
          ['one', 'एक', 'ஒன்று', 'ondru'],
          ['two', 'दो', 'இரண்டு', 'irandu'],
          ['three', 'तीन', 'மூன்று', 'moondru'],
          ['four', 'चार', 'நான்கு', 'naangu'],
          ['five', 'पाँच', 'ஐந்து', 'aindhu'],
          ['ten', 'दस', 'பத்து', 'pattu'],
          ['today', 'आज', 'இன்று', 'indru'],
          ['tomorrow', 'कल', 'நாளை', 'naalai'],
          ['day', 'दिन', 'நாள்', 'naal'],
          ['time', 'समय', 'நேரம்', 'neram']
        ]),
        phrases: phrases('ta', [
          ['Today is a good day.', 'आज अच्छा दिन है।', 'இன்று நல்ல நாள்.', 'indru nalla naal.'],
          ['I am coming tomorrow.', 'मैं कल आ रहा हूँ।', 'நான் நாளை வருகிறேன்.', 'naan naalai varugiren.']
        ])
      },
      {
        id: 'ta-u5', title: 'Travel & Places', subtitle: 'Find your way around town',
        color: '#FF4B4B', icon: '🛕',
        notes: [
          { title: 'Asking "where?"', body: 'எங்கே (enge) = where. Two natural sentence shapes: கோவில் எங்கே? (temple where?) or … எங்கே இருக்கிறது? (where is …?).' },
          { title: 'The dative -க்கு', body: 'Adding -க்கு to a place means "to": வீட்டிற்கு (veettirku) = to the house. வீட்டில் (veettil) = at home.' }
        ],
        items: words('ta', [
          ['house / home', 'घर', 'வீடு', 'veedu'],
          ['school', 'स्कूल', 'பள்ளி', 'palli'],
          ['market', 'बाज़ार', 'சந்தை', 'sandhai'],
          ['road', 'सड़क', 'சாலை', 'saalai'],
          ['city', 'शहर', 'நகரம்', 'nagaram'],
          ['village', 'गाँव', 'கிராமம்', 'graamam'],
          ['temple', 'मंदिर', 'கோவில்', 'kovil'],
          ['bus', 'बस', 'பஸ்', 'bas'],
          ['train', 'ट्रेन', 'ரயில்', 'rayil'],
          ['hospital', 'अस्पताल', 'மருத்துவமனை', 'maruthuvamanai']
        ]),
        phrases: phrases('ta', [
          ['I am going home.', 'मैं घर जा रहा हूँ।', 'நான் வீட்டிற்கு போகிறேன்.', 'naan veettirku pogiren.'],
          ['Where is the temple?', 'मंदिर कहाँ है?', 'கோவில் எங்கே இருக்கிறது?', 'kovil enge irukkirathu?']
        ])
      },
      {
        id: 'ta-u6', title: 'Everyday Verbs', subtitle: 'The engine room of Tamil',
        color: '#58CC02', icon: '🏃',
        notes: [
          { title: 'The dictionary form ends in a command', body: 'Verb entries are quoted as the singular command: சாப்பிடு (saappidu) "eat!". To build the polite present, add -கிறேன் for "I": நான் சாப்பிடுகிறேன் = I am eating.' },
          { title: 'Verb goes last', body: 'Tamil is Subject–Object–Verb. "I rice eat" is the correct order: நான் சோறு சாப்பிடுகிறேன்.' }
        ],
        items: words('ta', [
          ['to eat', 'खाना', 'சாப்பிடு', 'saappidu'],
          ['to drink', 'पीना', 'குடி', 'kudi'],
          ['to go', 'जाना', 'போ', 'po'],
          ['to come', 'आना', 'வா', 'vaa'],
          ['to read / study', 'पढ़ना', 'படி', 'padi'],
          ['to write', 'लिखना', 'எழுது', 'ezhuthu'],
          ['to speak', 'बोलना', 'பேசு', 'pesu'],
          ['to see / look', 'देखना', 'பார்', 'paar'],
          ['to sleep', 'सोना', 'தூங்கு', 'thoongu'],
          ['to run', 'दौड़ना', 'ஓடு', 'odu']
        ]),
        phrases: phrases('ta', [
          ['I eat rice.', 'मैं चावल खाता हूँ।', 'நான் சோறு சாப்பிடுகிறேன்.', 'naan soru saappidugiren.'],
          ['He reads a book.', 'वह किताब पढ़ता है।', 'அவன் புத்தகம் படிக்கிறான்.', 'avan puthagam padikkiran.']
        ])
      },
      {
        id: 'ta-u7', title: 'Colors & Describing', subtitle: 'Make your sentences bigger',
        color: '#FF86D0', icon: '🎨',
        notes: [
          { title: 'Adjectives sit before the noun', body: 'பெரிய வீடு = big house. Adjectives do not change for gender or number in Tamil — one form, always.' },
          { title: 'Turning adjectives into statements', body: 'Drop the noun and add -து: வீடு பெரியது = the house is big. சிறியது = it is small.' }
        ],
        items: words('ta', [
          ['red', 'लाल', 'சிவப்பு', 'sivappu'],
          ['blue', 'नीला', 'நீலம்', 'neelam'],
          ['green', 'हरा', 'பச்சை', 'pachchai'],
          ['big', 'बड़ा', 'பெரிய', 'periya'],
          ['small', 'छोटा', 'சிறிய', 'siriya'],
          ['good', 'अच्छा', 'நல்ல', 'nalla'],
          ['new', 'नया', 'புதிய', 'puthiya'],
          ['hot', 'गरम', 'சூடான', 'soodana'],
          ['beautiful', 'सुंदर', 'அழகான', 'azhagaana'],
          ['happy', 'खुश', 'சந்தோஷம்', 'santhosham']
        ]),
        phrases: phrases('ta', [
          ['The house is big.', 'घर बड़ा है।', 'வீடு பெரியது.', 'veedu periyathu.'],
          ['I am happy.', 'मैं खुश हूँ।', 'நான் சந்தோஷமாக இருக்கிறேன்.', 'naan santhoshamaaga irukkiren.']
        ])
      },
      {
        id: 'ta-u8', title: 'Everyday Phrases', subtitle: 'Sentences you will actually use',
        color: '#FFC800', icon: '💬',
        notes: [
          { title: '"I don\'t know" is one word', body: 'எனக்குத் தெரியாது (enakkuth theriyathu) literally means "to me it is not known". Very useful, very common.' },
          { title: 'Hunger and thirst are things you "get"', body: 'எனக்குப் பசிக்கிறது = hunger is happening to me. Swap in தாகம் (thaagam) for thirst: எனக்குத் தாகமாக இருக்கிறது.' }
        ],
        items: words('ta', [
          ['I love you', 'मैं तुमसे प्यार करता हूँ', 'நான் உன்னைக் காதலிக்கிறேன்', 'naan unnaik kaadhalikkiren'],
          ['I don\'t know', 'मुझे नहीं पता', 'எனக்குத் தெரியாது', 'enakkuth theriyathu'],
          ['hungry', 'भूखा', 'பசி', 'pasi'],
          ['water please', 'पानी दीजिए', 'தண்ணீர் கொடுங்கள்', 'thanneer kodungal'],
          ['good night', 'शुभ रात्रि', 'இனிய இரவு', 'iniya iravu'],
          ['see you later', 'फिर मिलेंगे', 'பிறகு சந்திப்போம்', 'piraku sandhippom']
        ]),
        phrases: phrases('ta', [
          ['What is your name?', 'आपका नाम क्या है?', 'உங்கள் பெயர் என்ன?', 'ungal peyar enna?'],
          ['I am hungry.', 'मुझे भूख लगी है।', 'எனக்குப் பசிக்கிறது.', 'enakkup pasikkirathu.'],
          ['Please help me.', 'कृपया मेरी मदद करें।', 'தயவுசெய்து எனக்கு உதவுங்கள்.', 'thayavu seydhu enakku udhavungal.']
        ])
      }
    ]
  };

  /* ------------------------------------------------------------------ TE */
  var TELUGU = {
    id: 'te',
    name: 'Telugu',
    native: 'తెలుగు',
    flag: '🌾',
    speech: 'te-IN',
    color: '#1CB0F6',
    roman: 'Romanized Telugu',
    scriptInfo: {
      name: 'Telugu script (తెలుగు లిపి)',
      dir: 'left to right',
      blurb:
        'Telugu is written in a round, flowing abugida often called the "Italian of the East" because almost every word ends in a vowel. ' +
        'Consonants carry a built-in "a"; vowel signs and the virama change it. Telugu is the most spoken Dravidian language ' +
        'and an official language of India.',
      vowelHint: 'Vowels are అచ్చులు (acchulu), consonants హల్లులు (hallulu).',
      letters: [
        ['అ', 'a', 'like a in "about"'], ['ఆ', 'aa', 'like a in "father"'],
        ['ఇ', 'i', 'like i in "sit"'], ['ఈ', 'ee', 'like ee in "see"'],
        ['ఉ', 'u', 'like u in "put"'], ['ఊ', 'oo', 'like oo in "moon"'],
        ['ఎ', 'e', 'like e in "pen"'], ['ఏ', 'ee', 'like a in "cake"'],
        ['ఐ', 'ai', 'like y in "my"'], ['ఒ', 'o', 'like o in "go"'],
        ['ఓ', 'oo', 'like o in "more"'], ['ఔ', 'au', 'like ou in "cow"'],
        ['క', 'ka', 'k'], ['గ', 'ga', 'g'],
        ['చ', 'cha', 'ch'], ['జ', 'ja', 'j'],
        ['ట', 'ta', 'retroflex t'], ['డ', 'da', 'retroflex d'],
        ['త', 'tha', 'dental th'], ['ద', 'da', 'dental d'],
        ['న', 'na', 'n'], ['ప', 'pa', 'p'],
        ['బ', 'ba', 'b'], ['మ', 'ma', 'm'],
        ['య', 'ya', 'y'], ['ర', 'ra', 'r'],
        ['ల', 'la', 'l'], ['వ', 'va', 'v'],
        ['శ', 'sha', 'sh'], ['స', 'sa', 's'], ['హ', 'ha', 'h']
      ]
    },
    units: [
      {
        id: 'te-u0', title: 'Sounds & Script', subtitle: 'Meet the round letters',
        color: '#1CB0F6', icon: '✏️',
        notes: [
          { title: 'Everything ends in a vowel', body: 'Native Telugu words almost always finish with a vowel sound. That is what gives the language its musical rhythm.' },
          { title: 'The ం dot', body: 'The anusvara ం nasalises the vowel before it: నమస్కారం (namaskaaram). You will see it at the end of tons of words.' }
        ],
        items: words('te', [
          ['letter "a"', 'अक्षर "अ"', 'అ', 'a'],
          ['letter "aa"', 'अक्षर "आ"', 'ఆ', 'aa'],
          ['letter "i"', 'अक्षर "इ"', 'ఇ', 'i'],
          ['letter "ee"', 'अक्षर "ई"', 'ఈ', 'ee'],
          ['letter "u"', 'अक्षर "उ"', 'ఉ', 'u'],
          ['letter "ka"', 'अक्षर "क"', 'క', 'ka'],
          ['letter "ma"', 'अक्षर "म"', 'మ', 'ma'],
          ['letter "na"', 'अक्षर "न"', 'న', 'na'],
          ['letter "ra"', 'अक्षर "र"', 'ర', 'ra'],
          ['letter "sa"', 'अक्षर "स"', 'స', 'sa']
        ]),
        phrases: []
      },
      {
        id: 'te-u1', title: 'Basics & Greetings', subtitle: 'Say hello and be polite',
        color: '#58CC02', icon: '👋',
        notes: [
          { title: 'నమస్కారం works everywhere', body: 'Namaskaaram is hello, greetings and a respectful goodbye. On the phone, Telugu speakers often say చెప్పండి (cheppandi, "tell me").' },
          { title: 'Three levels of "you"', body: 'నువ్వు (nuvvu, close friends), మీరు (meeru, polite/plural) and the royal అత్తవారు-style forms. Default to మీరు with strangers and elders.' },
          { title: 'ఎలా ఉన్నారు?', body: 'Literally "how are you (polite)?" Answer: బాగున్నాను (baagunnaanu) = I am fine.' }
        ],
        items: words('te', [
          ['hello', 'नमस्ते', 'నమస్కారం', 'namaskaaram'],
          ['thank you', 'धन्यवाद', 'ధన్యవాదాలు', 'dhanyavaadaalu'],
          ['yes', 'हाँ', 'అవును', 'avunu'],
          ['no', 'नहीं', 'కాదు', 'kaadu'],
          ['sorry / excuse me', 'माफ़ कीजिए', 'క్షమించండి', 'kshaminchandi'],
          ['please', 'कृपया', 'దయచేసి', 'dayachesi'],
          ['good morning', 'सुप्रभात', 'శుభోదయం', 'shubhodayam'],
          ['goodbye', 'अलविदा', 'మళ్ళీ కలుద్దాం', 'malli kaluddaam']
        ]),
        phrases: phrases('te', [
          ['How are you?', 'आप कैसे हैं?', 'మీరు ఎలా ఉన్నారు?', 'meeru ela unnaaru?'],
          ['My name is Kumar.', 'मेरा नाम कुमार है।', 'నా పేరు కుమార్.', 'naa peru kumaar.']
        ])
      },
      {
        id: 'te-u2', title: 'People & Family', subtitle: 'Talk about the people you love',
        color: '#CE82FF', icon: '👨‍👩‍👧',
        notes: [
          { title: 'Elder and younger matter', body: 'అన్న (anna) is elder brother, తమ్ముడు (tammudu) younger brother. అక్క (akka) elder sister, చెల్లి (chelli) younger sister. Using the wrong one sounds odd to a native ear.' },
          { title: 'Naa and Mee', body: 'నా (naa) = my, మీ (mee) = your (polite), నీ (nee) = your (informal). నా పేరు = my name.' }
        ],
        items: words('te', [
          ['mother', 'माँ', 'అమ్మ', 'amma'],
          ['father', 'पिता', 'నాన్న', 'naanna'],
          ['elder brother', 'बड़ा भाई', 'అన్న', 'anna'],
          ['elder sister', 'बड़ी बहन', 'అక్క', 'akka'],
          ['friend', 'दोस्त', 'స్నేహితుడు', 'snehitudu'],
          ['child', 'बच्चा', 'పిల్లవాడు', 'pillavaadu'],
          ['man', 'आदमी', 'పురుషుడు', 'purushudu'],
          ['woman', 'औरत', 'స్త్రీ', 'stree'],
          ['family', 'परिवार', 'కుటుంబం', 'kutumbam'],
          ['grandmother', 'दादी', 'అమ్మమ్మ', 'ammamma']
        ]),
        phrases: phrases('te', [
          ['This is my mother.', 'यह मेरी माँ है।', 'ఇది నా అమ్మ.', 'idi naa amma.'],
          ['He is my friend.', 'वह मेरा दोस्त है।', 'అతను నా స్నేహితుడు.', 'atanu naa snehitudu.']
        ])
      },
      {
        id: 'te-u3', title: 'Food & Drink', subtitle: 'Order what you actually want to eat',
        color: '#FF9600', icon: '🍚',
        notes: [
          { title: '"I want" needs the dative', body: 'నాకు (naaku) = to me. నాకు నీళ్ళు కావాలి = I want water. Swap కావాలి for వద్దు to say you do not want it.' },
          { title: 'అన్నం is the plate, బియ్యం is the sack', body: 'Cooked rice you eat is అన్నం (annam). Raw rice you buy is బియ్యం (biyyam).' }
        ],
        items: words('te', [
          ['water', 'पानी', 'నీళ్ళు', 'neellu'],
          ['rice (cooked)', 'चावल', 'అన్నం', 'annam'],
          ['milk', 'दूध', 'పాలు', 'paalu'],
          ['tea', 'चाय', 'టీ', 'tee'],
          ['coffee', 'कॉफ़ी', 'కాఫీ', 'kaafee'],
          ['food', 'खाना', 'ఆహారం', 'aahaaram'],
          ['banana', 'केला', 'అరటిపండు', 'aratipandu'],
          ['sugar', 'चीनी', 'పంచదార', 'panchadaara'],
          ['idli', 'इडली', 'ఇడ్లీ', 'idlee'],
          ['dosa', 'डोसा', 'దోసె', 'dose']
        ]),
        phrases: phrases('te', [
          ['I want water.', 'मुझे पानी चाहिए।', 'నాకు నీళ్ళు కావాలి.', 'naaku neellu kaavaali.'],
          ['This is milk.', 'यह दूध है।', 'ఇది పాలు.', 'idi paalu.']
        ])
      },
      {
        id: 'te-u4', title: 'Numbers & Time', subtitle: 'Count and talk about your day',
        color: '#14D4F4', icon: '🔢',
        notes: [
          { title: 'Numbers that end in -u', body: 'ఒకటి (one), రెండు (two), మూడు (three). Before a noun they often shorten: ఒక ఇల్లు = one house.' },
          { title: 'Time words go first', body: 'ఈరోజు (today), రేపు (tomorrow), నిన్న (yesterday). Telugu sentence order is Subject–Object–Verb.' }
        ],
        items: words('te', [
          ['one', 'एक', 'ఒకటి', 'okati'],
          ['two', 'दो', 'రెండు', 'rendu'],
          ['three', 'तीन', 'మూడు', 'moodu'],
          ['four', 'चार', 'నాలుగు', 'naalugu'],
          ['five', 'पाँच', 'ఐదు', 'aidu'],
          ['ten', 'दस', 'పది', 'padi'],
          ['today', 'आज', 'ఈరోజు', 'eeroju'],
          ['tomorrow', 'कल', 'రేపు', 'repu'],
          ['day', 'दिन', 'రోజు', 'roju'],
          ['time', 'समय', 'సమయం', 'samayam']
        ]),
        phrases: phrases('te', [
          ['Today is a good day.', 'आज अच्छा दिन है।', 'ఈరోజు మంచి రోజు.', 'eeroju manchi roju.'],
          ['I am coming tomorrow.', 'मैं कल आ रहा हूँ।', 'నేను రేపు వస్తాను.', 'nenu repu vastaanu.']
        ])
      },
      {
        id: 'te-u5', title: 'Travel & Places', subtitle: 'Find your way around town',
        color: '#FF4B4B', icon: '🛕',
        notes: [
          { title: 'Where = ఎక్కడ', body: 'గుడి ఎక్కడ ఉంది? = Where is the temple? The verb ఉంది (undi) means "is / exists" and goes at the end.' },
          { title: 'Ownership with -లో', body: 'Adding -లో means "in": ఇంట్లో (intlo) = at home. Adding -కి means "to": ఇంటికి (intiki) = to the house.' }
        ],
        items: words('te', [
          ['house / home', 'घर', 'ఇల్లు', 'illu'],
          ['school', 'स्कूल', 'బడి', 'badi'],
          ['market', 'बाज़ार', 'సంత', 'santa'],
          ['road', 'सड़क', 'రోడ్డు', 'roḍḍu'],
          ['city', 'शहर', 'నగరం', 'nagaram'],
          ['village', 'गाँव', 'గ్రామం', 'graamam'],
          ['temple', 'मंदिर', 'గుడి', 'gudi'],
          ['bus', 'बस', 'బస్సు', 'bassu'],
          ['train', 'ट्रेन', 'రైలు', 'railu'],
          ['hospital', 'अस्पताल', 'ఆసుపత్రి', 'aasupatri']
        ]),
        phrases: phrases('te', [
          ['I am going home.', 'मैं घर जा रहा हूँ।', 'నేను ఇంటికి వెళ్తున్నాను.', 'nenu intiki veltunnaanu.'],
          ['Where is the temple?', 'मंदिर कहाँ है?', 'గుడి ఎక్కడ ఉంది?', 'gudi ekkada undi?']
        ])
      },
      {
        id: 'te-u6', title: 'Everyday Verbs', subtitle: 'The engine room of Telugu',
        color: '#58CC02', icon: '🏃',
        notes: [
          { title: 'The -డం form', body: 'Verb names end in -డం: తినడం (to eat), వెళ్ళడం (to go). These work like English gerunds — "eating" and "going".' },
          { title: 'Verb goes last', body: 'నేను అన్నం తింటాను = I rice eat. Subject first, verb last, always.' },
          { title: '-ఆను for "I"', body: 'Present tense "I" forms usually end in -ఆను / -తాను: తింటాను (I eat), వస్తాను (I come).' }
        ],
        items: words('te', [
          ['to eat', 'खाना', 'తినడం', 'tinadam'],
          ['to drink', 'पीना', 'తాగడం', 'taagadam'],
          ['to go', 'जाना', 'వెళ్ళడం', 'velladam'],
          ['to come', 'आना', 'రావడం', 'raavadam'],
          ['to read / study', 'पढ़ना', 'చదవడం', 'chadavadam'],
          ['to write', 'लिखना', 'రాయడం', 'raayadam'],
          ['to speak', 'बोलना', 'మాట్లాడడం', 'maatlaadadam'],
          ['to see / look', 'देखना', 'చూడడం', 'choodadam'],
          ['to sleep', 'सोना', 'నిద్రపోవడం', 'nidrapovadam'],
          ['to run', 'दौड़ना', 'పరుగెత్తడం', 'parugettaḍam']
        ]),
        phrases: phrases('te', [
          ['I eat rice.', 'मैं चावल खाता हूँ।', 'నేను అన్నం తింటాను.', 'nenu annam tintaana.'],
          ['He reads a book.', 'वह किताब पढ़ता है।', 'అతను పుస్తకం చదువుతాడు.', 'atanu pustakam chaduvutaadu.']
        ])
      },
      {
        id: 'te-u7', title: 'Colors & Describing', subtitle: 'Make your sentences bigger',
        color: '#FF86D0', icon: '🎨',
        notes: [
          { title: 'Adjective first', body: 'పెద్ద ఇల్లు = big house. సిన్న (small) can become చిన్న in fast speech — both are understood.' },
          { title: 'Colors as nouns', body: 'ఎరుపు (red), నీలం (blue) are nouns, so "the red one" works by adding the noun after: ఎరుపు పువ్వు = red flower.' }
        ],
        items: words('te', [
          ['red', 'लाल', 'ఎరుపు', 'erupu'],
          ['blue', 'नीला', 'నీలం', 'neelam'],
          ['green', 'हरा', 'ఆకుపచ్చ', 'aakupachcha'],
          ['big', 'बड़ा', 'పెద్ద', 'pedda'],
          ['small', 'छोटा', 'చిన్న', 'chinna'],
          ['good', 'अच्छा', 'మంచి', 'manchi'],
          ['new', 'नया', 'కొత్త', 'kotta'],
          ['hot', 'गरम', 'వేడి', 'vedi'],
          ['beautiful', 'सुंदर', 'అందమైన', 'andamaina'],
          ['happy', 'खुश', 'సంతోషం', 'santosham']
        ]),
        phrases: phrases('te', [
          ['The house is big.', 'घर बड़ा है।', 'ఇల్లు పెద్దది.', 'illu peddadi.'],
          ['I am happy.', 'मैं खुश हूँ।', 'నేను సంతోషంగా ఉన్నాను.', 'nenu santoshanga unnaanu.']
        ])
      },
      {
        id: 'te-u8', title: 'Everyday Phrases', subtitle: 'Sentences you will actually use',
        color: '#FFC800', icon: '💬',
        notes: [
          { title: 'Positive and negative verbs differ', body: 'తెలుసు (telusu) = I know, తెలియదు (teliyadu) = I do not know. Telugu often has a completely separate negative verb instead of adding "not".' },
          { title: 'Hunger happens to you', body: 'నాకు ఆకలిగా ఉంది = literally "to me it is hunger-ly". Feelings use the నాకు (to me) pattern.' }
        ],
        items: words('te', [
          ['I love you', 'मैं तुमसे प्यार करता हूँ', 'నేను నిన్ను ప్రేమిస్తున్నాను', 'nenu ninnu premistunnaanu'],
          ['I don\'t know', 'मुझे नहीं पता', 'నాకు తెలియదు', 'naaku teliyadu'],
          ['hungry', 'भूखा', 'ఆకలి', 'aakali'],
          ['water please', 'पानी दीजिए', 'దయచేసి నీళ్ళు ఇవ్వండి', 'dayachesi neellu ivvandi'],
          ['good night', 'शुभ रात्रि', 'శుభరాత్రి', 'shubharaatri'],
          ['see you later', 'फिर मिलेंगे', 'మళ్ళీ కలుద్దాం', 'malli kaluddaam']
        ]),
        phrases: phrases('te', [
          ['What is your name?', 'आपका नाम क्या है?', 'మీ పేరు ఏమిటి?', 'mee peru emiti?'],
          ['I am hungry.', 'मुझे भूख लगी है।', 'నాకు ఆకలిగా ఉంది.', 'naaku aakaligaa undi.'],
          ['Please help me.', 'कृपया मेरी मदद करें।', 'దయచేసి నాకు సహాయం చేయండి.', 'dayachesi naaku sahaayam cheyandi.']
        ])
      }
    ]
  };

  /* ------------------------------------------------------------------ GU */
  var GUJARATI = {
    id: 'gu',
    name: 'Gujarati',
    native: 'ગુજરાતી',
    flag: '🪁',
    speech: 'gu-IN',
    color: '#FF9600',
    roman: 'Romanized Gujarati',
    scriptInfo: {
      name: 'Gujarati script (ગુજરાતી લિપિ)',
      dir: 'left to right',
      blurb:
        'Gujarati is written left to right in a script that is an older cousin of Devanagari — same sounds, but without the ' +
        'horizontal head-line (śirorekhā) running along the top of the letters. Gujarati is Indo-Aryan, so you will recognise ' +
        'plenty of Hindi words, and word order is Subject–Object–Verb.',
      vowelHint: 'Vowels are સ્વર (svar), consonants વ્યંજન (vyanjan).',
      letters: [
        ['અ', 'a', 'like a in "about"'], ['આ', 'aa', 'like a in "father"'],
        ['ઇ', 'i', 'like i in "sit"'], ['ઈ', 'ee', 'like ee in "see"'],
        ['ઉ', 'u', 'like u in "put"'], ['ઊ', 'oo', 'like oo in "moon"'],
        ['એ', 'e', 'like e in "pen"'], ['ઐ', 'ai', 'like y in "my"'],
        ['ઓ', 'o', 'like o in "go"'], ['ઔ', 'au', 'like ou in "cow"'],
        ['ક', 'ka', 'k'], ['ખ', 'kha', 'kh'],
        ['ગ', 'ga', 'g'], ['ઘ', 'gha', 'gh'],
        ['ચ', 'cha', 'ch'], ['જ', 'ja', 'j'],
        ['ટ', 'ta', 'retroflex t'], ['ડ', 'da', 'retroflex d'],
        ['ત', 'ta', 'dental t'], ['દ', 'da', 'dental d'],
        ['ન', 'na', 'n'], ['પ', 'pa', 'p'],
        ['બ', 'ba', 'b'], ['મ', 'ma', 'm'],
        ['ય', 'ya', 'y'], ['ર', 'ra', 'r'],
        ['લ', 'la', 'l'], ['વ', 'va', 'v / w'],
        ['શ', 'sha', 'sh'], ['સ', 'sa', 's'], ['હ', 'ha', 'h']
      ]
    },
    units: [
      {
        id: 'gu-u0', title: 'Sounds & Script', subtitle: 'Devanagari without the top line',
        color: '#1CB0F6', icon: '✏️',
        notes: [
          { title: 'If you know Hindi, you know the sounds', body: 'Gujarati has the same sound inventory as Hindi. The letters just look different. ક = क, મ = म, ર = र.' },
          { title: 'No head-line', body: 'Devanagari letters hang from a horizontal bar. Gujarati letters have no bar, so the shapes look open and round — that is the whole visual difference.' }
        ],
        items: words('gu', [
          ['letter "a"', 'अक्षर "अ"', 'અ', 'a'],
          ['letter "aa"', 'अक्षर "आ"', 'આ', 'aa'],
          ['letter "i"', 'अक्षर "इ"', 'ઇ', 'i'],
          ['letter "ee"', 'अक्षर "ई"', 'ઈ', 'ee'],
          ['letter "u"', 'अक्षर "उ"', 'ઉ', 'u'],
          ['letter "ka"', 'अक्षर "क"', 'ક', 'ka'],
          ['letter "ma"', 'अक्षर "म"', 'મ', 'ma'],
          ['letter "na"', 'अक्षर "न"', 'ન', 'na'],
          ['letter "ra"', 'अक्षर "र"', 'ર', 'ra'],
          ['letter "sa"', 'अक्षर "स"', 'સ', 'sa']
        ]),
        phrases: []
      },
      {
        id: 'gu-u1', title: 'Basics & Greetings', subtitle: 'Say hello and be polite',
        color: '#58CC02', icon: '👋',
        notes: [
          { title: 'નમસ્તે vs નમસ્કાર', body: 'નમસ્તે (namaste) is the everyday hello. નમસ્કાર (namaskaar) is more formal and is also used as a respectful goodbye.' },
          { title: 'Three ways to say you', body: 'તું (tu, very close), તમે (tame, polite and plural), આપ (aap, formal). When in doubt use તમે — so "How are you?" is તમે કેમ છો?' },
          { title: 'છે is the Swiss-army verb', body: 'છે (che) means "is / are / am". મારું નામ … છે = my name is ….' }
        ],
        items: words('gu', [
          ['hello', 'नमस्ते', 'નમસ્તે', 'namaste'],
          ['thank you', 'धन्यवाद', 'આભાર', 'aabhaar'],
          ['yes', 'हाँ', 'હા', 'haa'],
          ['no', 'नहीं', 'ના', 'na'],
          ['sorry / excuse me', 'माफ़ कीजिए', 'માફ કરશો', 'maaf karsho'],
          ['please', 'कृपया', 'કૃપા કરીને', 'krupaa karine'],
          ['good morning', 'सुप्रभात', 'સુપ્રભાત', 'suprabhaat'],
          ['goodbye', 'अलविदा', 'આવજો', 'aavjo']
        ]),
        phrases: phrases('gu', [
          ['How are you?', 'आप कैसे हैं?', 'તમે કેમ છો?', 'tame kem chho?'],
          ['My name is Kumar.', 'मेरा नाम कुमार है।', 'મારું નામ કુમાર છે.', 'maaru naam kumaar che.']
        ])
      },
      {
        id: 'gu-u2', title: 'People & Family', subtitle: 'Talk about the people you love',
        color: '#CE82FF', icon: '👨‍👩‍👧',
        notes: [
          { title: 'Possession with -(ા)રું', body: 'The ending -ું/-રું agrees with the thing owned: મારું નામ = my name (neuter), મારી મા = my mother (feminine), મારો ભાઈ = my brother (masculine).' },
          { title: 'ભાઈ and બહેન are neutral', body: 'Unlike Hindi, ભાઈ and બહેન do not say whether the sibling is older or younger.' }
        ],
        items: words('gu', [
          ['mother', 'माँ', 'મા', 'maa'],
          ['father', 'पिता', 'પિતા', 'pitaa'],
          ['brother', 'भाई', 'ભાઈ', 'bhaai'],
          ['sister', 'बहन', 'બહેન', 'bahen'],
          ['friend', 'दोस्त', 'મિત્ર', 'mitra'],
          ['child', 'बच्चा', 'બાળક', 'baalak'],
          ['man', 'आदमी', 'પુરુષ', 'purush'],
          ['woman', 'औरत', 'સ્ત્રી', 'stree'],
          ['family', 'परिवार', 'પરિવાર', 'parivaar'],
          ['grandmother', 'दादी', 'દાદી', 'daadi']
        ]),
        phrases: phrases('gu', [
          ['This is my mother.', 'यह मेरी माँ है।', 'આ મારી મા છે.', 'aa maari maa che.'],
          ['He is my friend.', 'वह मेरा दोस्त है।', 'તે મારો મિત્ર છે.', 'te maaro mitra che.']
        ])
      },
      {
        id: 'gu-u3', title: 'Food & Drink', subtitle: 'Order what you actually want to eat',
        color: '#FF9600', icon: '🍚',
        notes: [
          { title: '"I want" = મને … જોઈએ', body: 'મને (mane) = to me. મને પાણી જોઈએ = I want water. Plug in any noun you like and it works.' },
          { title: 'ખાવું / પીવું', body: 'Eating and drinking take different verbs: ખાવું (khaavun) for food, પીવું (peevun) for drinks.' }
        ],
        items: words('gu', [
          ['water', 'पानी', 'પાણી', 'paani'],
          ['rice', 'चावल', 'ભાત', 'bhaat'],
          ['milk', 'दूध', 'દૂધ', 'doodh'],
          ['tea', 'चाय', 'ચા', 'chaa'],
          ['coffee', 'कॉफ़ी', 'કોફી', 'kofee'],
          ['food', 'खाना', 'ખોરાક', 'khoraak'],
          ['banana', 'केला', 'કેળું', 'kelun'],
          ['sugar', 'चीनी', 'ખાંડ', 'khaand'],
          ['roti', 'रोटी', 'રોટલી', 'rotli'],
          ['mango', 'आम', 'કેરી', 'keri']
        ]),
        phrases: phrases('gu', [
          ['I want water.', 'मुझे पानी चाहिए।', 'મને પાણી જોઈએ.', 'mane paani joie.'],
          ['This is milk.', 'यह दूध है।', 'આ દૂધ છે.', 'aa doodh che.']
        ])
      },
      {
        id: 'gu-u4', title: 'Numbers & Time', subtitle: 'Count and talk about your day',
        color: '#14D4F4', icon: '🔢',
        notes: [
          { title: 'Numbers borrow from Hindi', body: 'Gujarati numbers like બે (two), ત્રણ (three), ચાર (four) are cousins of Hindi दो, तीन, चार — learn them in pairs and they stick fast.' },
          { title: 'કાલે means both', body: 'કાલે (kaale) can mean yesterday or tomorrow depending on the tense of the verb. ગઈકાલે is specifically yesterday.' }
        ],
        items: words('gu', [
          ['one', 'एक', 'એક', 'ek'],
          ['two', 'दो', 'બે', 'be'],
          ['three', 'तीन', 'ત્રણ', 'tran'],
          ['four', 'चार', 'ચાર', 'chaar'],
          ['five', 'पाँच', 'પાંચ', 'paanch'],
          ['ten', 'दस', 'દસ', 'das'],
          ['today', 'आज', 'આજે', 'aaje'],
          ['tomorrow', 'कल', 'કાલે', 'kaale'],
          ['day', 'दिन', 'દિવસ', 'divas'],
          ['time', 'समय', 'સમય', 'samay']
        ]),
        phrases: phrases('gu', [
          ['Today is a good day.', 'आज अच्छा दिन है।', 'આજે સારો દિવસ છે.', 'aaje saaro divas che.'],
          ['I am coming tomorrow.', 'मैं कल आ रहा हूँ।', 'હું કાલે આવું છું.', 'hun kaale aavun chhun.']
        ])
      },
      {
        id: 'gu-u5', title: 'Travel & Places', subtitle: 'Find your way around town',
        color: '#FF4B4B', icon: '🛕',
        notes: [
          { title: 'Where = ક્યાં', body: 'મંદિર ક્યાં છે? = Where is the temple? છે goes at the end, and ક્યાં comes right before it.' },
          { title: '-માં means inside', body: 'ઘરમાં (gharmaa) = in the house. Many Gujarati speakers also say ઘરે (ghare) for "at home".' }
        ],
        items: words('gu', [
          ['house / home', 'घर', 'ઘર', 'ghar'],
          ['school', 'स्कूल', 'શાળા', 'shaalaa'],
          ['market', 'बाज़ार', 'બજાર', 'bajaar'],
          ['road', 'सड़क', 'રસ્તો', 'rasto'],
          ['city', 'शहर', 'શહેર', 'shaher'],
          ['village', 'गाँव', 'ગામ', 'gaam'],
          ['temple', 'मंदिर', 'મંદિર', 'mandir'],
          ['bus', 'बस', 'બસ', 'bas'],
          ['train', 'ट्रेन', 'ટ્રેન', 'tren'],
          ['hospital', 'अस्पताल', 'દવાખાનું', 'davaakhaanun']
        ]),
        phrases: phrases('gu', [
          ['I am going home.', 'मैं घर जा रहा हूँ।', 'હું ઘરે જાઉં છું.', 'hun ghare jaun chhun.'],
          ['Where is the temple?', 'मंदिर कहाँ है?', 'મંદિર ક્યાં છે?', 'mandir kyaan che?']
        ])
      },
      {
        id: 'gu-u6', title: 'Everyday Verbs', subtitle: 'The engine room of Gujarati',
        color: '#58CC02', icon: '🏃',
        notes: [
          { title: 'Verbs end in -વું in the dictionary', body: 'ખાવું (to eat), જવું (to go). Strip the -વું and you have the root you build tenses from.' },
          { title: 'The present tense is a two-piece verb', body: 'Gujarati uses a participle plus છું/છે/છો: હું જાઉં છું = I am going. The છું must agree with the subject.' },
          { title: 'Verb final', body: 'Subject – Object – Verb. હું ભાત ખાઉં છું = I eat rice.' }
        ],
        items: words('gu', [
          ['to eat', 'खाना', 'ખાવું', 'khaavun'],
          ['to drink', 'पीना', 'પીવું', 'peevun'],
          ['to go', 'जाना', 'જવું', 'javun'],
          ['to come', 'आना', 'આવવું', 'aavavun'],
          ['to read / study', 'पढ़ना', 'વાંચવું', 'vaanchavun'],
          ['to write', 'लिखना', 'લખવું', 'lakhavun'],
          ['to speak', 'बोलना', 'બોલવું', 'bolavun'],
          ['to see / look', 'देखना', 'જોવું', 'jovun'],
          ['to sleep', 'सोना', 'સૂવું', 'soovun'],
          ['to run', 'दौड़ना', 'દોડવું', 'dodavun']
        ]),
        phrases: phrases('gu', [
          ['I eat rice.', 'मैं चावल खाता हूँ।', 'હું ભાત ખાઉં છું.', 'hun bhaat khaaun chhun.'],
          ['He reads a book.', 'वह किताब पढ़ता है।', 'તે પુસ્તક વાંચે છે.', 'te pustak vaanche che.']
        ])
      },
      {
        id: 'gu-u7', title: 'Colors & Describing', subtitle: 'Make your sentences bigger',
        color: '#FF86D0', icon: '🎨',
        notes: [
          { title: 'Adjectives agree', body: 'Unlike Hindi, Gujarati adjectives change with the noun: મોટું ઘર (big house, neuter), મોટો ભાઈ (big brother), મોટી બહેન (big sister).' },
          { title: 'Colors are mostly fixed', body: 'લાલ (red), ભૂરું (blue), લીલું (green). Some inflect, some do not — લાલ stays લાલ for every noun.' }
        ],
        items: words('gu', [
          ['red', 'लाल', 'લાલ', 'laal'],
          ['blue', 'नीला', 'ભૂરું', 'bhoorun'],
          ['green', 'हरा', 'લીલું', 'leelun'],
          ['big', 'बड़ा', 'મોટું', 'motun'],
          ['small', 'छोटा', 'નાનું', 'naanun'],
          ['good', 'अच्छा', 'સારું', 'saarun'],
          ['new', 'नया', 'નવું', 'navun'],
          ['hot', 'गरम', 'ગરમ', 'garam'],
          ['beautiful', 'सुंदर', 'સુંદર', 'sundar'],
          ['happy', 'खुश', 'ખુશ', 'khush']
        ]),
        phrases: phrases('gu', [
          ['The house is big.', 'घर बड़ा है।', 'ઘર મોટું છે.', 'ghar motun che.'],
          ['I am happy.', 'मैं खुश हूँ।', 'હું ખુશ છું.', 'hun khush chhun.']
        ])
      },
      {
        id: 'gu-u8', title: 'Everyday Phrases', subtitle: 'Sentences you will actually use',
        color: '#FFC800', icon: '💬',
        notes: [
          { title: 'નથી negates, ના refuses', body: 'મને ખબર નથી = I do not know. ના is the standalone "no" you say to a question.' },
          { title: 'આવજો is the goodbye', body: 'Literally "keep coming" — the host says it to the guest. The guest replies આવજો too. Very Gujarati.' }
        ],
        items: words('gu', [
          ['I love you', 'मैं तुमसे प्यार करता हूँ', 'હું તને પ્રેમ કરું છું', 'hun tane prem karun chhun'],
          ['I don\'t know', 'मुझे नहीं पता', 'મને ખબર નથી', 'mane khabar nathi'],
          ['hungry', 'भूखा', 'ભૂખ', 'bhookh'],
          ['water please', 'पानी दीजिए', 'કૃપા કરીને પાણી આપો', 'krupaa karine paani aapo'],
          ['good night', 'शुभ रात्रि', 'શુભ રાત્રિ', 'shubh raatri'],
          ['see you later', 'फिर मिलेंगे', 'ફરી મળીશું', 'phari malishun']
        ]),
        phrases: phrases('gu', [
          ['What is your name?', 'आपका नाम क्या है?', 'તમારું નામ શું છે?', 'tamaru naam shun che?'],
          ['I am hungry.', 'मुझे भूख लगी है।', 'મને ભૂખ લાગી છે.', 'mane bhookh laagi che.'],
          ['Please help me.', 'कृपया मेरी मदद करें।', 'કૃપા કરીને મને મદદ કરો.', 'krupaa karine mane madad karo.']
        ])
      }
    ]
  };

  /* --------------------------------------------------------------- END */
  var COURSES = { ta: TAMIL, te: TELUGU, gu: GUJARATI };

  /* Base languages a course can be studied from */
  var BASES = {
    en: { id: 'en', label: 'English', flag: '🇬🇧' },
    hi: { id: 'hi', label: 'हिन्दी', flag: '🇮🇳' }
  };

  /* ------------------------------------------------------------ helpers */
  function allItems(course) {
    var out = [];
    course.units.forEach(function (u) { out = out.concat(u.items); });
    return out;
  }
  function allPhrases(course) {
    var out = [];
    course.units.forEach(function (u) { out = out.concat(u.phrases || []); });
    return out;
  }
  function findItem(course, id) {
    var found = null;
    course.units.some(function (u) {
      return u.items.some(function (i) { if (i.id === id) { found = i; return true; } return false; });
    });
    return found;
  }
  function itemIds(unit) { return unit.items.map(function (i) { return i.id; }); }

  root.TLData = {
    courses: COURSES,
    bases: BASES,
    lessonsPerUnit: 3,
    allItems: allItems,
    allPhrases: allPhrases,
    findItem: findItem,
    itemIds: itemIds,
    unitById: function (course, id) {
      var f = null;
      course.units.forEach(function (u) { if (u.id === id) f = u; });
      return f;
    },
    corpus: function (course, unit, lessonIndex) {
      /* Words available at a given point on the path: earlier units + this one.
         Lesson 0-1: current unit only. Lesson 2+: current unit + light review. */
      var idx = course.units.indexOf(unit);
      var pool = unit.items.slice();
      if (lessonIndex >= 2) {
        course.units.slice(0, idx).forEach(function (u) {
          pool = pool.concat(u.items.slice(0, 4));
        });
      }
      if (idx > 0 && lessonIndex >= 1) {
        pool = pool.concat(course.units[idx - 1].items.slice(0, 3));
      }
      var seen = {};
      return pool.filter(function (i) {
        if (seen[i.id]) return false; seen[i.id] = true; return true;
      });
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
