package com.hoang.basis.yukihon.system.dictionary.service;

import java.util.Map;

/**
 * Converts Japanese kana (hiragana/katakana) to Hepburn-ish romaji — enough for dictionary search
 * (e.g. "toshokan" → としょかん). Handles youon (きゃ→kya), sokuon (っ→double consonant), chōonpu
 * (ー→repeat vowel) and ん→n. Not a perfect transliterator; unknown chars are dropped.
 */
public final class RomajiConverter {

    private RomajiConverter() {}

    // Youon (digraphs) — checked before single kana.
    private static final Map<String, String> DIGRAPHS = Map.ofEntries(
            Map.entry("きゃ", "kya"),
            Map.entry("きゅ", "kyu"),
            Map.entry("きょ", "kyo"),
            Map.entry("しゃ", "sha"),
            Map.entry("しゅ", "shu"),
            Map.entry("しょ", "sho"),
            Map.entry("ちゃ", "cha"),
            Map.entry("ちゅ", "chu"),
            Map.entry("ちょ", "cho"),
            Map.entry("にゃ", "nya"),
            Map.entry("にゅ", "nyu"),
            Map.entry("にょ", "nyo"),
            Map.entry("ひゃ", "hya"),
            Map.entry("ひゅ", "hyu"),
            Map.entry("ひょ", "hyo"),
            Map.entry("みゃ", "mya"),
            Map.entry("みゅ", "myu"),
            Map.entry("みょ", "myo"),
            Map.entry("りゃ", "rya"),
            Map.entry("りゅ", "ryu"),
            Map.entry("りょ", "ryo"),
            Map.entry("ぎゃ", "gya"),
            Map.entry("ぎゅ", "gyu"),
            Map.entry("ぎょ", "gyo"),
            Map.entry("じゃ", "ja"),
            Map.entry("じゅ", "ju"),
            Map.entry("じょ", "jo"),
            Map.entry("びゃ", "bya"),
            Map.entry("びゅ", "byu"),
            Map.entry("びょ", "byo"),
            Map.entry("ぴゃ", "pya"),
            Map.entry("ぴゅ", "pyu"),
            Map.entry("ぴょ", "pyo"));

    private static final Map<Character, String> SINGLE = buildSingle();

    private static Map<Character, String> buildSingle() {
        Map<Character, String> m = new java.util.HashMap<>();
        String[][] rows = {
            {"あ", "a"},
            {"い", "i"},
            {"う", "u"},
            {"え", "e"},
            {"お", "o"},
            {"か", "ka"},
            {"き", "ki"},
            {"く", "ku"},
            {"け", "ke"},
            {"こ", "ko"},
            {"さ", "sa"},
            {"し", "shi"},
            {"す", "su"},
            {"せ", "se"},
            {"そ", "so"},
            {"た", "ta"},
            {"ち", "chi"},
            {"つ", "tsu"},
            {"て", "te"},
            {"と", "to"},
            {"な", "na"},
            {"に", "ni"},
            {"ぬ", "nu"},
            {"ね", "ne"},
            {"の", "no"},
            {"は", "ha"},
            {"ひ", "hi"},
            {"ふ", "fu"},
            {"へ", "he"},
            {"ほ", "ho"},
            {"ま", "ma"},
            {"み", "mi"},
            {"む", "mu"},
            {"め", "me"},
            {"も", "mo"},
            {"や", "ya"},
            {"ゆ", "yu"},
            {"よ", "yo"},
            {"ら", "ra"},
            {"り", "ri"},
            {"る", "ru"},
            {"れ", "re"},
            {"ろ", "ro"},
            {"わ", "wa"},
            {"を", "o"},
            {"ん", "n"},
            {"が", "ga"},
            {"ぎ", "gi"},
            {"ぐ", "gu"},
            {"げ", "ge"},
            {"ご", "go"},
            {"ざ", "za"},
            {"じ", "ji"},
            {"ず", "zu"},
            {"ぜ", "ze"},
            {"ぞ", "zo"},
            {"だ", "da"},
            {"ぢ", "ji"},
            {"づ", "zu"},
            {"で", "de"},
            {"ど", "do"},
            {"ば", "ba"},
            {"び", "bi"},
            {"ぶ", "bu"},
            {"べ", "be"},
            {"ぼ", "bo"},
            {"ぱ", "pa"},
            {"ぴ", "pi"},
            {"ぷ", "pu"},
            {"ぺ", "pe"},
            {"ぽ", "po"},
            {"ぁ", "a"},
            {"ぃ", "i"},
            {"ぅ", "u"},
            {"ぇ", "e"},
            {"ぉ", "o"}
        };
        for (String[] r : rows) {
            m.put(r[0].charAt(0), r[1]);
        }
        return m;
    }

    public static String toRomaji(String kana) {
        if (kana == null || kana.isBlank()) {
            return null;
        }
        // Normalize katakana → hiragana (keep ー as a marker for long vowels).
        StringBuilder norm = new StringBuilder(kana.length());
        for (char c : kana.toCharArray()) {
            if (c >= 0x30A1 && c <= 0x30F6) {
                norm.append((char) (c - 0x60));
            } else {
                norm.append(c);
            }
        }
        String s = norm.toString();

        StringBuilder out = new StringBuilder();
        boolean geminate = false; // pending っ → double next consonant
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);

            if (c == 'っ') { // sokuon
                geminate = true;
                continue;
            }
            if (c == 'ー') { // chōonpu: repeat previous vowel
                if (out.length() > 0) {
                    out.append(out.charAt(out.length() - 1));
                }
                continue;
            }

            String syllable = null;
            if (i + 1 < s.length()) {
                String pair = s.substring(i, i + 2);
                if (DIGRAPHS.containsKey(pair)) {
                    syllable = DIGRAPHS.get(pair);
                    i++; // consumed the small ya/yu/yo
                }
            }
            if (syllable == null) {
                syllable = SINGLE.get(c);
            }
            if (syllable == null) {
                continue; // skip unknown
            }
            if (geminate && !syllable.isEmpty()) {
                out.append(syllable.charAt(0));
                geminate = false;
            }
            out.append(syllable);
        }
        return out.isEmpty() ? null : out.toString();
    }
}
