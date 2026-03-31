import { CREATOR_BLOCK_LABELS, CREATOR_BLOCK_TYPES, type CreatorBlock, type CreatorBlockType, type CreatorDocument } from "@/features/creator-mode/types";

const makeBlockId = () => `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

export const createDefaultBlock = (type: CreatorBlockType): CreatorBlock => ({
  id: makeBlockId(),
  type,
  heading: CREATOR_BLOCK_LABELS[type],
  body: "",
  options: type === "QUIZ_CHECKPOINT" || type === "BRANCH" ? ["", ""] : [],
});

export const createDefaultDocument = (): CreatorDocument => ({
  version: 1,
  blocks: [createDefaultBlock("SCENE")],
});

const sanitizeBlock = (value: unknown): CreatorBlock | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<CreatorBlock>;
  if (!candidate.id || !candidate.type || !CREATOR_BLOCK_TYPES.includes(candidate.type)) {
    return null;
  }

  return {
    id: String(candidate.id),
    type: candidate.type,
    heading: typeof candidate.heading === "string" ? candidate.heading : CREATOR_BLOCK_LABELS[candidate.type],
    body: typeof candidate.body === "string" ? candidate.body : "",
    options: Array.isArray(candidate.options) ? candidate.options.map((option) => String(option)) : [],
  };
};

export const parseCreatorDocument = (raw: string | null | undefined): CreatorDocument => {
  if (!raw) {
    return createDefaultDocument();
  }

  try {
    const parsed = JSON.parse(raw) as Partial<CreatorDocument>;
    const parsedBlocks = Array.isArray(parsed.blocks)
      ? parsed.blocks.map(sanitizeBlock).filter((block): block is CreatorBlock => Boolean(block))
      : [];

    return {
      version: 1,
      blocks: parsedBlocks.length > 0 ? parsedBlocks : createDefaultDocument().blocks,
    };
  } catch {
    return createDefaultDocument();
  }
};

export const serializeCreatorDocument = (document: CreatorDocument): string => JSON.stringify(document);

export const moveBlock = (blocks: CreatorBlock[], fromIndex: number, toIndex: number): CreatorBlock[] => {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= blocks.length || toIndex >= blocks.length) {
    return blocks;
  }

  const next = [...blocks];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
};
