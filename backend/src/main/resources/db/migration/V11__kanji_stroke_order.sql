-- D3: stroke-order (KanjiVG SVG), component/radical breakdown, and frequency rank for kanji.
ALTER TABLE `kanji_info`
  ADD COLUMN `frequency` INT NULL,
  ADD COLUMN `stroke_svg` LONGTEXT NULL,
  ADD COLUMN `components` VARCHAR(500) NULL;
