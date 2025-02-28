const ROMAJI_TO_HIRAGANA: Record<string, string> = {
  // Basic hiragana
  a: 'あ', i: 'い', u: 'う', e: 'え', o: 'お',
  ka: 'か', ki: 'き', ku: 'く', ke: 'け', ko: 'こ',
  sa: 'さ', shi: 'し', su: 'す', se: 'せ', so: 'そ',
  ta: 'た', chi: 'ち', tsu: 'つ', te: 'て', to: 'と',
  na: 'な', ni: 'に', nu: 'ぬ', ne: 'ね', no: 'の',
  ha: 'は', hi: 'ひ', fu: 'ふ', he: 'へ', ho: 'ほ',
  ma: 'ま', mi: 'み', mu: 'む', me: 'め', mo: 'も',
  ya: 'や', yu: 'ゆ', yo: 'よ',
  ra: 'ら', ri: 'り', ru: 'る', re: 'れ', ro: 'ろ',
  wa: 'わ', wo: 'を', n: 'ん',
  
  // Dakuten and handakuten
  ga: 'が', gi: 'ぎ', gu: 'ぐ', ge: 'げ', go: 'ご',
  za: 'ざ', ji: 'じ', zu: 'ず', ze: 'ぜ', zo: 'ぞ',
  da: 'だ', di: 'ぢ', du: 'づ', de: 'で', do: 'ど',
  ba: 'ば', bi: 'び', bu: 'ぶ', be: 'べ', bo: 'ぼ',
  pa: 'ぱ', pi: 'ぴ', pu: 'ぷ', pe: 'ぺ', po: 'ぽ',
  
  // Small tsu for double consonants
  kka: 'っか', ssa: 'っさ', tta: 'った', ppa: 'っぱ',
  
  // Common combinations
  kya: 'きゃ', kyu: 'きゅ', kyo: 'きょ',
  sha: 'しゃ', shu: 'しゅ', sho: 'しょ',
  cha: 'ちゃ', chu: 'ちゅ', cho: 'ちょ',
  nya: 'にゃ', nyu: 'にゅ', nyo: 'にょ',
  hya: 'ひゃ', hyu: 'ひゅ', hyo: 'ひょ',
  mya: 'みゃ', myu: 'みゅ', myo: 'みょ',
  rya: 'りゃ', ryu: 'りゅ', ryo: 'りょ',
  gya: 'ぎゃ', gyu: 'ぎゅ', gyo: 'ぎょ',
  ja: 'じゃ', ju: 'じゅ', jo: 'じょ',
  
  // Alternative spellings
  si: 'し', ti: 'ち', tu: 'つ', hu: 'ふ',
  zi: 'じ', 
  
  // Small hiragana
  "xa": "ぁ", "xi": "ぃ", "xu": "ぅ", "xe": "ぇ", "xo": "ぉ",
  "xya": "ゃ", "xyu": "ゅ", "xyo": "ょ",
  "xtsu": "っ", "xtu": "っ",
};

// Function to convert romaji text to hiragana
export const convertRomajiToKana = (text: string): string => {
  if (!text) return '';
  
  let result = '';
  let i = 0;
  const lowerText = text.toLowerCase();
  
  while (i < lowerText.length) {
    // Try to match double consonants (small tsu)
    if (i < lowerText.length - 2 && 
        lowerText[i] === lowerText[i + 1] && 
        "kstpgdjzbh".includes(lowerText[i]) && 
        !["n", "m", "y", "r", "w"].includes(lowerText[i])) {
      result += 'っ';
      i++;
      continue;
    }
    
    // Try to match 3-letter combinations
    if (i < lowerText.length - 2) {
      const chunk = lowerText.slice(i, i + 3);
      if (ROMAJI_TO_HIRAGANA[chunk]) {
        result += ROMAJI_TO_HIRAGANA[chunk];
        i += 3;
        continue;
      }
    }
    
    // Try to match 2-letter combinations
    if (i < lowerText.length - 1) {
      const chunk = lowerText.slice(i, i + 2);
      if (ROMAJI_TO_HIRAGANA[chunk]) {
        result += ROMAJI_TO_HIRAGANA[chunk];
        i += 2;
        continue;
      }
    }
    
    // Try to match single letters
    if (ROMAJI_TO_HIRAGANA[lowerText[i]]) {
      result += ROMAJI_TO_HIRAGANA[lowerText[i]];
    } else {
      // Keep the original character if no match is found
      result += lowerText[i];
    }
    i++;
  }
  
  return result;
};
