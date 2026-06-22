import { useCallback, useEffect, useMemo, useState } from "react";
import { BookOpen, Check, GitBranch, Plus, RefreshCw, Save, Trash2 } from "lucide-react";

import { storyModeApi, type StoryModeAdminStory } from "@/api";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type {
  StoryCheckpointOption,
  StoryDifficultyLevel,
  StoryGrammarNote,
  StorySegment,
} from "@/data/storyMode";

const LEVELS = ["N5", "N4", "N3", "N2", "N1"];
const DIFFICULTIES: StoryDifficultyLevel[] = ["EASY", "STANDARD", "HARD"];

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const createBlankOption = (): StoryCheckpointOption => ({
  id: `option-${Date.now()}`,
  label: "New option",
});

const createBlankGrammar = (): StoryGrammarNote => ({
  pattern: "〜",
  title: "Grammar note",
  explanation: "Explain how this pattern works in the segment.",
});

const createBlankSegment = (index: number): StorySegment => ({
  id: `segment-${index + 1}`,
  title: `Segment ${index + 1}`,
  sceneHint: "Scene hint",
  japaneseText: "日本語の本文をここに入力します。",
  translation: "Nhập bản dịch hoặc gợi ý đọc hiểu ở đây.",
  vocabQueries: [],
  grammar: [createBlankGrammar()],
  checkpoint: {
    mode: "quiz",
    question: "Checkpoint question",
    options: [
      { id: "a", label: "Option A" },
      { id: "b", label: "Option B" },
    ],
    correctOptionId: "a",
    explanation: "Explain why this answer is correct.",
  },
});

const createBlankStory = (): StoryModeAdminStory => {
  const firstSegment = createBlankSegment(0);
  return {
    storyKey: `story-${Date.now()}`,
    title: "New Story",
    subtitle: "Short learner-facing subtitle",
    description: "Describe the story path, learning goal, and expected outcome.",
    jlptLevel: "N5",
    estimatedMinutes: 12,
    tone: "Calm",
    coverLabel: "Story",
    entrySegmentId: firstSegment.id,
    published: false,
    segments: [firstSegment],
  };
};

const normalizeForSave = (story: StoryModeAdminStory): StoryModeAdminStory => ({
  ...story,
  storyKey: slugify(story.storyKey || story.title),
  entrySegmentId: story.entrySegmentId || story.segments[0]?.id || "segment-1",
  estimatedMinutes: Number(story.estimatedMinutes) || 10,
  segments: story.segments.map((segment, index) => ({
    ...segment,
    id: segment.id || `segment-${index + 1}`,
    checkpoint: {
      mode: segment.checkpoint.mode || "quiz",
      question: segment.checkpoint.question || "Checkpoint question",
      options:
        segment.checkpoint.options.length > 0 ? segment.checkpoint.options : [createBlankOption()],
      correctOptionId:
        segment.checkpoint.mode === "branch"
          ? segment.checkpoint.correctOptionId
          : segment.checkpoint.correctOptionId || segment.checkpoint.options[0]?.id,
      explanation: segment.checkpoint.explanation || "",
      questionByDifficulty: segment.checkpoint.questionByDifficulty,
      optionsByDifficulty: segment.checkpoint.optionsByDifficulty,
      explanationByDifficulty: segment.checkpoint.explanationByDifficulty,
    },
  })),
});

const AdminStoryMode = () => {
  const { toast } = useToast();
  const [stories, setStories] = useState<StoryModeAdminStory[]>([]);
  const [activeStory, setActiveStory] = useState<StoryModeAdminStory>(createBlankStory);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const activeSegment = activeStory.segments[activeSegmentIndex] ?? activeStory.segments[0];
  const publishedCount = useMemo(
    () => stories.filter((story) => story.published).length,
    [stories]
  );

  const loadStories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await storyModeApi.admin.getStories();
      setStories(data);
      if (data.length > 0) {
        setActiveStory(data[0]);
        setActiveSegmentIndex(0);
      }
    } catch {
      toast({
        title: "Không tải được StoryMode",
        description: "Vui lòng kiểm tra quyền admin hoặc backend.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadStories();
  }, [loadStories]);

  const updateStory = (patch: Partial<StoryModeAdminStory>) => {
    setActiveStory((previous) => ({ ...previous, ...patch }));
  };

  const updateSegment = (index: number, patch: Partial<StorySegment>) => {
    setActiveStory((previous) => ({
      ...previous,
      segments: previous.segments.map((segment, segmentIndex) =>
        segmentIndex === index ? { ...segment, ...patch } : segment
      ),
    }));
  };

  const updateCheckpoint = (patch: Partial<StorySegment["checkpoint"]>) => {
    updateSegment(activeSegmentIndex, {
      checkpoint: {
        ...activeSegment.checkpoint,
        ...patch,
      },
    });
  };

  const updateOption = (optionIndex: number, patch: Partial<StoryCheckpointOption>) => {
    updateCheckpoint({
      options: activeSegment.checkpoint.options.map((option, index) =>
        index === optionIndex ? { ...option, ...patch } : option
      ),
    });
  };

  const addSegment = () => {
    const next = createBlankSegment(activeStory.segments.length);
    setActiveStory((previous) => ({
      ...previous,
      segments: [...previous.segments, next],
    }));
    setActiveSegmentIndex(activeStory.segments.length);
  };

  const deleteSegment = (index: number) => {
    if (activeStory.segments.length <= 1) {
      toast({
        title: "Cần ít nhất một đoạn",
        description: "Story phải có tối thiểu một segment.",
        variant: "destructive",
      });
      return;
    }

    setActiveStory((previous) => {
      const nextSegments = previous.segments.filter((_, segmentIndex) => segmentIndex !== index);
      return {
        ...previous,
        entrySegmentId: nextSegments.some((segment) => segment.id === previous.entrySegmentId)
          ? previous.entrySegmentId
          : nextSegments[0].id,
        segments: nextSegments,
      };
    });
    setActiveSegmentIndex(0);
  };

  const saveStory = async () => {
    const payload = normalizeForSave(activeStory);

    try {
      setSaving(true);
      const saved =
        payload.id && typeof payload.id === "number"
          ? await storyModeApi.admin.updateStory(payload.id, payload)
          : await storyModeApi.admin.createStory(payload);

      setActiveStory(saved);
      setActiveSegmentIndex(0);
      toast({ title: "Đã lưu StoryMode", description: `${saved.title} đã được lưu trên backend.` });
      await loadStories();
    } catch {
      toast({
        title: "Không lưu được story",
        description: "Kiểm tra story key trùng, segment thiếu hoặc quyền admin.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteStory = async (story: StoryModeAdminStory) => {
    if (!story.id || typeof story.id !== "number") {
      setActiveStory(createBlankStory());
      setActiveSegmentIndex(0);
      return;
    }

    try {
      await storyModeApi.admin.deleteStory(story.id);
      toast({ title: "Đã xóa story", description: `${story.title} đã được gỡ khỏi backend.` });
      await loadStories();
    } catch {
      toast({
        title: "Không xóa được story",
        description: "Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1520px] py-2">
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3">
              <GitBranch className="h-8 w-8 text-rose-500" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground">StoryMode Admin</h1>
              <p className="text-muted-foreground">
                Quản lý story, segment, checkpoint, branch option, grammar và trạng thái publish.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => void loadStories()} disabled={loading}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setActiveStory(createBlankStory());
                setActiveSegmentIndex(0);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Story
            </Button>
            <Button onClick={() => void saveStory()} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Story"}
            </Button>
          </div>
        </div>

        <div className="mb-4 grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Stories</p>
              <p className="mt-2 text-3xl font-semibold">{stories.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Published</p>
              <p className="mt-2 text-3xl font-semibold">{publishedCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Segments in editor</p>
              <p className="mt-2 text-3xl font-semibold">{activeStory.segments.length}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Story Library</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {stories.length === 0 && (
                <p className="text-sm text-muted-foreground">Chưa có story trong backend.</p>
              )}
              {stories.map((story) => (
                <button
                  key={story.id ?? story.storyKey}
                  className={`w-full rounded-xl border p-3 text-left transition ${
                    story.id === activeStory.id
                      ? "border-rose-200 bg-rose-50"
                      : "border-border bg-background hover:bg-muted/50"
                  }`}
                  onClick={() => {
                    setActiveStory(story);
                    setActiveSegmentIndex(0);
                  }}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-foreground">{story.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{story.storyKey}</p>
                    </div>
                    <Badge variant="outline">{story.published ? "Published" : "Draft"}</Badge>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Story Setup</CardTitle>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => void deleteStory(activeStory)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Story key</Label>
                  <Input
                    value={activeStory.storyKey}
                    onChange={(event) => updateStory({ storyKey: event.target.value })}
                  />
                </div>
                <div>
                  <Label>Title</Label>
                  <Input
                    value={activeStory.title}
                    onChange={(event) => updateStory({ title: event.target.value })}
                  />
                </div>
                <div>
                  <Label>Subtitle</Label>
                  <Input
                    value={activeStory.subtitle}
                    onChange={(event) => updateStory({ subtitle: event.target.value })}
                  />
                </div>
                <div>
                  <Label>JLPT</Label>
                  <Select
                    value={activeStory.jlptLevel}
                    onValueChange={(value) => updateStory({ jlptLevel: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEVELS.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Estimated minutes</Label>
                  <Input
                    type="number"
                    value={activeStory.estimatedMinutes}
                    onChange={(event) =>
                      updateStory({ estimatedMinutes: Number(event.target.value) })
                    }
                  />
                </div>
                <div>
                  <Label>Entry segment</Label>
                  <Select
                    value={activeStory.entrySegmentId}
                    onValueChange={(value) => updateStory({ entrySegmentId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {activeStory.segments.map((segment) => (
                        <SelectItem key={segment.id} value={segment.id}>
                          {segment.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tone</Label>
                  <Input
                    value={activeStory.tone}
                    onChange={(event) => updateStory({ tone: event.target.value })}
                  />
                </div>
                <div>
                  <Label>Cover label</Label>
                  <Input
                    value={activeStory.coverLabel}
                    onChange={(event) => updateStory({ coverLabel: event.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    value={activeStory.description}
                    onChange={(event) => updateStory({ description: event.target.value })}
                  />
                </div>
                <div className="md:col-span-2 flex flex-wrap gap-2">
                  <Button
                    variant={activeStory.published ? "default" : "outline"}
                    onClick={() => updateStory({ published: !activeStory.published })}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    {activeStory.published ? "Published" : "Mark as published"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Segments</CardTitle>
                <Button size="sm" onClick={addSegment}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Segment
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {activeStory.segments.map((segment, index) => (
                    <Button
                      key={segment.id}
                      size="sm"
                      variant={index === activeSegmentIndex ? "default" : "outline"}
                      onClick={() => setActiveSegmentIndex(index)}
                    >
                      {segment.title}
                    </Button>
                  ))}
                </div>

                {activeSegment && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>Segment ID</Label>
                      <Input
                        value={activeSegment.id}
                        onChange={(event) =>
                          updateSegment(activeSegmentIndex, { id: event.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={activeSegment.title}
                        onChange={(event) =>
                          updateSegment(activeSegmentIndex, { title: event.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Scene hint</Label>
                      <Input
                        value={activeSegment.sceneHint}
                        onChange={(event) =>
                          updateSegment(activeSegmentIndex, { sceneHint: event.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Next segment</Label>
                      <Input
                        value={activeSegment.nextSegmentId ?? ""}
                        onChange={(event) =>
                          updateSegment(activeSegmentIndex, {
                            nextSegmentId: event.target.value || undefined,
                          })
                        }
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Japanese text</Label>
                      <Textarea
                        className="min-h-28 text-lg leading-8"
                        value={activeSegment.japaneseText}
                        onChange={(event) =>
                          updateSegment(activeSegmentIndex, { japaneseText: event.target.value })
                        }
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Translation</Label>
                      <Textarea
                        value={activeSegment.translation}
                        onChange={(event) =>
                          updateSegment(activeSegmentIndex, { translation: event.target.value })
                        }
                      />
                    </div>
                    {DIFFICULTIES.map((difficulty) => (
                      <div key={difficulty}>
                        <Label>{difficulty} translation override</Label>
                        <Input
                          value={activeSegment.translationByDifficulty?.[difficulty] ?? ""}
                          onChange={(event) =>
                            updateSegment(activeSegmentIndex, {
                              translationByDifficulty: {
                                ...(activeSegment.translationByDifficulty ?? {}),
                                [difficulty]: event.target.value,
                              },
                            })
                          }
                        />
                      </div>
                    ))}
                    <div className="md:col-span-2">
                      <Label>Vocab queries, one per line</Label>
                      <Textarea
                        value={(activeSegment.vocabQueries ?? []).join("\n")}
                        onChange={(event) =>
                          updateSegment(activeSegmentIndex, {
                            vocabQueries: event.target.value
                              .split("\n")
                              .map((item) => item.trim())
                              .filter(Boolean),
                          })
                        }
                      />
                    </div>
                    <div className="md:col-span-2 flex justify-end">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteSegment(activeSegmentIndex)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Segment
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {activeSegment && (
              <div className="grid gap-4 xl:grid-cols-2">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">Grammar Notes</CardTitle>
                    <Button
                      size="sm"
                      onClick={() =>
                        updateSegment(activeSegmentIndex, {
                          grammar: [...activeSegment.grammar, createBlankGrammar()],
                        })
                      }
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {activeSegment.grammar.map((item, index) => (
                      <div
                        key={`${item.pattern}-${index}`}
                        className="rounded-xl border border-border p-3"
                      >
                        <Label>Pattern</Label>
                        <Input
                          value={item.pattern}
                          onChange={(event) =>
                            updateSegment(activeSegmentIndex, {
                              grammar: activeSegment.grammar.map((grammar, grammarIndex) =>
                                grammarIndex === index
                                  ? { ...grammar, pattern: event.target.value }
                                  : grammar
                              ),
                            })
                          }
                        />
                        <Label className="mt-3 block">Title</Label>
                        <Input
                          value={item.title}
                          onChange={(event) =>
                            updateSegment(activeSegmentIndex, {
                              grammar: activeSegment.grammar.map((grammar, grammarIndex) =>
                                grammarIndex === index
                                  ? { ...grammar, title: event.target.value }
                                  : grammar
                              ),
                            })
                          }
                        />
                        <Label className="mt-3 block">Explanation</Label>
                        <Textarea
                          value={item.explanation}
                          onChange={(event) =>
                            updateSegment(activeSegmentIndex, {
                              grammar: activeSegment.grammar.map((grammar, grammarIndex) =>
                                grammarIndex === index
                                  ? { ...grammar, explanation: event.target.value }
                                  : grammar
                              ),
                            })
                          }
                        />
                        <Button
                          className="mt-3"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            updateSegment(activeSegmentIndex, {
                              grammar: activeSegment.grammar.filter(
                                (_, grammarIndex) => grammarIndex !== index
                              ),
                            })
                          }
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">Checkpoint</CardTitle>
                    <Select
                      value={activeSegment.checkpoint.mode ?? "quiz"}
                      onValueChange={(value) =>
                        updateCheckpoint({ mode: value as "quiz" | "branch" })
                      }
                    >
                      <SelectTrigger className="w-[160px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="quiz">Quiz</SelectItem>
                        <SelectItem value="branch">Branch</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Question</Label>
                      <Textarea
                        value={activeSegment.checkpoint.question}
                        onChange={(event) => updateCheckpoint({ question: event.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Correct option ID</Label>
                      <Input
                        value={activeSegment.checkpoint.correctOptionId ?? ""}
                        onChange={(event) =>
                          updateCheckpoint({ correctOptionId: event.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Explanation</Label>
                      <Textarea
                        value={activeSegment.checkpoint.explanation}
                        onChange={(event) => updateCheckpoint({ explanation: event.target.value })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">Options</p>
                      <Button
                        size="sm"
                        onClick={() =>
                          updateCheckpoint({
                            options: [...activeSegment.checkpoint.options, createBlankOption()],
                          })
                        }
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Option
                      </Button>
                    </div>
                    {activeSegment.checkpoint.options.map((option, index) => (
                      <div
                        key={`${option.id}-${index}`}
                        className="rounded-xl border border-border p-3"
                      >
                        <div className="grid gap-3 md:grid-cols-2">
                          <div>
                            <Label>Option ID</Label>
                            <Input
                              value={option.id}
                              onChange={(event) => updateOption(index, { id: event.target.value })}
                            />
                          </div>
                          <div>
                            <Label>Label</Label>
                            <Input
                              value={option.label}
                              onChange={(event) =>
                                updateOption(index, { label: event.target.value })
                              }
                            />
                          </div>
                          <div>
                            <Label>Next segment</Label>
                            <Input
                              value={option.nextSegmentId ?? ""}
                              onChange={(event) =>
                                updateOption(index, {
                                  nextSegmentId: event.target.value || undefined,
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label>Difficulty impact</Label>
                            <Select
                              value={option.difficultyImpact ?? "NEUTRAL"}
                              onValueChange={(value) =>
                                updateOption(index, {
                                  difficultyImpact:
                                    value as StoryCheckpointOption["difficultyImpact"],
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="NEUTRAL">NEUTRAL</SelectItem>
                                <SelectItem value="EASE_UP">EASE_UP</SelectItem>
                                <SelectItem value="EASE_DOWN">EASE_DOWN</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="md:col-span-2">
                            <Label>Response</Label>
                            <Textarea
                              value={option.response ?? ""}
                              onChange={(event) =>
                                updateOption(index, { response: event.target.value })
                              }
                            />
                          </div>
                        </div>
                        <Button
                          className="mt-3"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            updateCheckpoint({
                              options: activeSegment.checkpoint.options.filter(
                                (_, optionIndex) => optionIndex !== index
                              ),
                            })
                          }
                        >
                          Remove option
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminStoryMode;
