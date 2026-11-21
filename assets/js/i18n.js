/* Bhasha — UI strings in English / Hindi / Hinglish (gen-z). Follows the "Learn from" choice. */
(function (root) {
  'use strict';
  var D = {
    en: {
      learn: 'Learn', letters: 'Letters', explore: 'Explore', tutor: 'AI Tutor', quests: 'Progress', profile: 'Profile', settings: 'Settings',
      nowFrom: 'Now learning from', heroKick: 'Today’s vibe', heroSub: 'Pick up where you left off — or wander off the path.',
      exploreTitle: 'Explore', exploreSub: 'Games, live sentences, sounds and stories from the real web. Wander freely.',
      back: '← Back to Explore', live: 'LIVE', refresh: 'Fresh batch', mastery: 'Mastery'
    },
    hi: {
      learn: 'सीखें', letters: 'अक्षर', explore: 'खोजें', tutor: 'AI शिक्षक', quests: 'प्रगति', profile: 'प्रोफ़ाइल', settings: 'सेटिंग्स',
      nowFrom: 'अब सीख रहे हैं', heroKick: 'आज का मूड', heroSub: 'जहाँ छोड़ा था वहीं से शुरू करें — या रास्ता छोड़कर घूमें।',
      exploreTitle: 'खोजें', exploreSub: 'खेल, लाइव वाक्य, आवाज़ें और असली वेब से कहानियाँ। खुलकर घूमें।',
      back: '← वापस खोजें पर', live: 'लाइव', refresh: 'नया सेट', mastery: 'महारत'
    },
    hg: {
      learn: 'Seekho', letters: 'Akshar', explore: 'Explore', tutor: 'AI Guru', quests: 'Progress', profile: 'Profile', settings: 'Settings',
      nowFrom: 'Ab seekh rahe ho', heroKick: 'Aaj ka vibe', heroSub: 'Jahan chhoda tha wahin se shuru kro — ya path chhod ke ghoomo, no cap.',
      exploreTitle: 'Explore kro', exploreSub: 'Games, live sentences, sounds aur real web ki stories. Bindaas ghoomo.',
      back: '← Explore pe wapas', live: 'LIVE', refresh: 'Naya batch', mastery: 'Mastery'
    }
  };
  function lang() { var b = root.TLStore && root.TLStore.get('profile.base'); return D[b] ? b : 'en'; }
  root.TLI18n = { t: function (k) { return (D[lang()][k] || D.en[k] || k); }, lang: lang };
})(window);
