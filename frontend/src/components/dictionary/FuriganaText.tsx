import type { FuriganaToken } from "@/api/dictionaryApi";

/** Renders furigana tokens as ruby text (reading above kanji); plain text where no reading. */
const FuriganaText = ({ tokens, className }: { tokens?: FuriganaToken[]; className?: string }) => (
  <span className={className}>
    {tokens?.map((t, i) =>
      t.ruby ? (
        <ruby key={i} className="leading-loose">
          {t.text}
          <rt className="text-[0.55em] font-normal text-muted-foreground">{t.ruby}</rt>
        </ruby>
      ) : (
        <span key={i}>{t.text}</span>
      )
    )}
  </span>
);

export default FuriganaText;
