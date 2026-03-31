export type CreatorBlockType = "SCENE" | "DIALOGUE" | "VOCAB_HINT" | "QUIZ_CHECKPOINT" | "BRANCH";

export interface CreatorBlock {
  id: string;
  type: CreatorBlockType;
  heading: string;
  body: string;
  options: string[];
}

export interface CreatorDocument {
  version: 1;
  blocks: CreatorBlock[];
}

export const CREATOR_BLOCK_LABELS: Record<CreatorBlockType, string> = {
  SCENE: "Scene",
  DIALOGUE: "Dialogue",
  VOCAB_HINT: "Vocab Hint",
  QUIZ_CHECKPOINT: "Quiz Checkpoint",
  BRANCH: "Branch Choice",
};

export const CREATOR_BLOCK_TYPES: CreatorBlockType[] = ["SCENE", "DIALOGUE", "VOCAB_HINT", "QUIZ_CHECKPOINT", "BRANCH"];
