-- Add {{image}} / {{audio}} slots (+ media CSS) to the system default BASIC template so cards
-- with attached image/audio render them during study.
UPDATE `flashcard_templates`
SET
  `front_template` = '<div class="yk-front"><div class="yk-term">{{front}}</div><div class="yk-reading">{{reading}}</div>{{audio}}</div>',
  `back_template` = '<div class="yk-back">{{image}}<div class="yk-term">{{front}}</div><div class="yk-reading">{{reading}}</div>{{audio}}<hr class="yk-sep"/><div class="yk-meaning">{{meaning}}</div><div class="yk-yomi">{{onyomi}} {{kunyomi}}</div><div class="yk-example">{{example}}</div><div class="yk-example-tr">{{exampleTranslation}}</div><div class="yk-note">{{note}}</div></div>',
  `styling` = '.yk-front,.yk-back{text-align:center}.yk-term{font-size:2.4rem;font-weight:700;color:#0f172a}.yk-reading{margin-top:.35rem;color:#0284c7;font-size:1rem}.yk-media-img{max-width:220px;max-height:180px;margin:0 auto .6rem;border-radius:12px}.yk-back audio,.yk-front audio{margin-top:.5rem;height:34px}.yk-sep{margin:1rem auto;border:none;border-top:1px solid #e2e8f0;max-width:200px}.yk-meaning{font-size:1.35rem;font-weight:600;color:#0284c7}.yk-yomi{margin-top:.4rem;color:#e11d48;font-size:.95rem}.yk-example{margin-top:.6rem;color:#0f172a}.yk-example-tr{color:#64748b;font-size:.9rem}.yk-note{margin-top:.5rem;color:#7c3aed;font-size:.9rem}.yk-back div:empty,.yk-front div:empty{display:none}'
WHERE `is_system` = 1 AND `is_default` = 1 AND `card_type` = 'BASIC';
