import { SelectableContent } from "./form-shared";

export const getOptionLabel = (item: SelectableContent) =>
  item.title || item.kanji || item.pattern || item.meaning || `#${item.id ?? "new"}`;
