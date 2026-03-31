import { useCallback, useEffect, useMemo, useState } from "react";
import { BarChart3, CheckCircle2, ClipboardCheck, PlusCircle, Sparkles, XCircle } from "lucide-react";
import { creatorModeApi, type CreatorAnalytics, type CreatorContentType, type CreatorTemplate, type CreatorTemplateStatus } from "@/api";
import WinterNightBackground from "@/components/WinterNightBackground";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import CreatorBlockEditor from "@/features/creator-mode/components/CreatorBlockEditor";
import CreatorCanvas from "@/features/creator-mode/components/CreatorCanvas";
import CreatorMetricCard from "@/features/creator-mode/components/CreatorMetricCard";
import {
  createDefaultBlock,
  createDefaultDocument,
  moveBlock,
  parseCreatorDocument,
  serializeCreatorDocument,
} from "@/features/creator-mode/builder";
import type { CreatorBlock } from "@/features/creator-mode/types";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface EditorMeta {
  title: string;
  summary: string;
  contentType: CreatorContentType;
  jlptLevel: string;
  tags: string;
  estimatedMinutes: number;
}

const DEFAULT_EDITOR_META: EditorMeta = {
  title: "",
  summary: "",
  contentType: "MINI_LESSON",
  jlptLevel: "N5",
  tags: "",
  estimatedMinutes: 12,
};

const STATUS_STYLES: Record<CreatorTemplateStatus, string> = {
  DRAFT: "bg-slate-500/20 text-slate-200 border-slate-400/40",
  PENDING_REVIEW: "bg-amber-500/20 text-amber-200 border-amber-400/40",
  APPROVED: "bg-emerald-500/20 text-emerald-200 border-emerald-400/40",
  REJECTED: "bg-red-500/20 text-red-200 border-red-400/40",
  PUBLISHED: "bg-sky-500/20 text-sky-200 border-sky-400/40",
};

const AdminCreatorMode = () => {
  const { isAdmin, isTeacher, isReviewer } = useAuth();
  const { toast } = useToast();

  const isAdminUser = isAdmin();
  const isTeacherUser = isTeacher();
  const isReviewerUser = isReviewer();
  const canManageTemplates = isTeacherUser || isAdminUser;
  const canReviewAsAdmin = isAdminUser;
  const canReviewAsReviewer = isReviewerUser;
  const canAccessReviewQueue = canReviewAsAdmin || canReviewAsReviewer;

  const [templates, setTemplates] = useState<CreatorTemplate[]>([]);
  const [reviewQueue, setReviewQueue] = useState<CreatorTemplate[]>([]);
  const [analytics, setAnalytics] = useState<CreatorAnalytics | null>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTemplateId, setActiveTemplateId] = useState<number | null>(null);
  const [selectedTab, setSelectedTab] = useState("studio");

  const [editorMeta, setEditorMeta] = useState<EditorMeta>(DEFAULT_EDITOR_META);
  const [blocks, setBlocks] = useState<CreatorBlock[]>(createDefaultDocument().blocks);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(blocks[0]?.id ?? null);
  const [reviewNotes, setReviewNotes] = useState<Record<number, string>>({});

  const [templateFilter, setTemplateFilter] = useState<CreatorTemplateStatus | "ALL">("ALL");

  const selectedBlock = useMemo(
    () => blocks.find((block) => block.id === selectedBlockId) ?? null,
    [blocks, selectedBlockId]
  );

  const filteredTemplates = useMemo(() => {
    if (templateFilter === "ALL") {
      return templates;
    }
    return templates.filter((template) => template.status === templateFilter);
  }, [templateFilter, templates]);

  const resetEditor = useCallback(() => {
    const defaultDocument = createDefaultDocument();
    setActiveTemplateId(null);
    setEditorMeta(DEFAULT_EDITOR_META);
    setBlocks(defaultDocument.blocks);
    setSelectedBlockId(defaultDocument.blocks[0]?.id ?? null);
  }, []);

  const hydrateFromTemplate = useCallback((template: CreatorTemplate) => {
    const parsed = parseCreatorDocument(template.builderJson);
    setActiveTemplateId(template.id);
    setEditorMeta({
      title: template.title,
      summary: template.summary ?? "",
      contentType: template.contentType,
      jlptLevel: template.jlptLevel,
      tags: template.tags ?? "",
      estimatedMinutes: template.estimatedMinutes,
    });
    setBlocks(parsed.blocks);
    setSelectedBlockId(parsed.blocks[0]?.id ?? null);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [templatesData, analyticsData] = await Promise.all([
        creatorModeApi.getTemplates(),
        creatorModeApi.getAnalytics(),
      ]);

      setTemplates(templatesData);
      setAnalytics(analyticsData);

      if (canReviewAsAdmin) {
        const queueData = await creatorModeApi.getAdminQueue();
        setReviewQueue(queueData);
      } else if (canReviewAsReviewer) {
        const queueData = await creatorModeApi.getReviewerQueue();
        setReviewQueue(queueData);
      } else {
        setReviewQueue([]);
      }
    } catch {
      toast({
        title: "Creator mode load failed",
        description: "Could not load creator templates and analytics.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [canReviewAsAdmin, canReviewAsReviewer, toast]);

  useEffect(() => {
    if (!canAccessReviewQueue && selectedTab === "review") {
      setSelectedTab(canManageTemplates ? "studio" : "analytics");
      return;
    }

    if (!canManageTemplates && selectedTab === "studio") {
      setSelectedTab(canAccessReviewQueue ? "review" : "analytics");
    }
  }, [canAccessReviewQueue, canManageTemplates, selectedTab]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleAddBlock = useCallback((type: CreatorBlock["type"]) => {
    const next = createDefaultBlock(type);
    setBlocks((previous) => [...previous, next]);
    setSelectedBlockId(next.id);
  }, []);

  const handleMoveBlock = useCallback((fromIndex: number, toIndex: number) => {
    setBlocks((previous) => moveBlock(previous, fromIndex, toIndex));
  }, []);

  const handleDeleteBlock = useCallback((blockId: string) => {
    setBlocks((previous) => {
      const next = previous.filter((block) => block.id !== blockId);
      if (next.length === 0) {
        const fallback = createDefaultBlock("SCENE");
        setSelectedBlockId(fallback.id);
        return [fallback];
      }
      if (selectedBlockId === blockId) {
        setSelectedBlockId(next[0].id);
      }
      return next;
    });
  }, [selectedBlockId]);

  const handleUpdateBlock = useCallback((blockId: string, updates: Partial<CreatorBlock>) => {
    setBlocks((previous) => previous.map((block) => (block.id === blockId ? { ...block, ...updates } : block)));
  }, []);

  const buildPayload = useCallback(() => ({
    title: editorMeta.title.trim(),
    summary: editorMeta.summary.trim(),
    contentType: editorMeta.contentType,
    jlptLevel: editorMeta.jlptLevel,
    tags: editorMeta.tags.trim(),
    estimatedMinutes: editorMeta.estimatedMinutes,
    builderJson: serializeCreatorDocument({ version: 1, blocks }),
  }), [blocks, editorMeta]);

  const saveDraft = useCallback(async () => {
    if (!editorMeta.title.trim()) {
      toast({ title: "Missing title", description: "Please enter a title before saving.", variant: "destructive" });
      return;
    }

    try {
      setSaving(true);
      const payload = buildPayload();
      const saved = activeTemplateId
        ? await creatorModeApi.updateTemplate(activeTemplateId, payload)
        : await creatorModeApi.createTemplate(payload);

      setActiveTemplateId(saved.id);
      toast({ title: "Draft saved", description: "Creator template has been saved." });
      await loadData();
    } catch {
      toast({ title: "Save failed", description: "Could not save this creator draft.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }, [activeTemplateId, buildPayload, editorMeta.title, loadData, toast]);

  const submitCurrentTemplate = useCallback(async () => {
    try {
      let templateId = activeTemplateId;

      if (!templateId) {
        const payload = buildPayload();
        const created = await creatorModeApi.createTemplate(payload);
        templateId = created.id;
        setActiveTemplateId(created.id);
      }

      await creatorModeApi.submitForReview(templateId);
      toast({ title: "Submitted", description: "Template is now in review queue." });
      await loadData();
    } catch {
      toast({ title: "Submit failed", description: "Could not submit template for review.", variant: "destructive" });
    }
  }, [activeTemplateId, buildPayload, loadData, toast]);

  const reviewAsReviewer = useCallback(async (templateId: number, decision: "APPROVED" | "REJECTED") => {
    try {
      await creatorModeApi.reviewerDecision(templateId, {
        decision,
        reviewNote: reviewNotes[templateId] ?? "",
      });
      toast({ title: "Reviewer decision saved", description: `Template status changed to ${decision}.` });
      await loadData();
    } catch {
      toast({ title: "Reviewer action failed", description: "Could not update reviewer decision.", variant: "destructive" });
    }
  }, [loadData, reviewNotes, toast]);

  const reviewAsAdmin = useCallback(async (templateId: number, decision: "PUBLISHED" | "REJECTED") => {
    try {
      await creatorModeApi.adminDecision(templateId, {
        decision,
        reviewNote: reviewNotes[templateId] ?? "",
      });
      toast({ title: "Admin decision saved", description: `Template status changed to ${decision}.` });
      await loadData();
    } catch {
      toast({ title: "Admin action failed", description: "Could not update admin decision.", variant: "destructive" });
    }
  }, [loadData, reviewNotes, toast]);

  const logPlaytest = useCallback(async () => {
    if (!activeTemplateId) {
      toast({ title: "No template selected", description: "Save a draft first to log metrics.", variant: "destructive" });
      return;
    }

    try {
      await creatorModeApi.recordMetrics(activeTemplateId, {
        attempts: 20,
        completions: 14,
        averageScore: 81,
      });
      toast({ title: "Metrics updated", description: "Sample playtest metrics were recorded." });
      await loadData();
    } catch {
      toast({ title: "Metrics failed", description: "Could not record playtest metrics.", variant: "destructive" });
    }
  }, [activeTemplateId, loadData, toast]);

  return (
    <DashboardLayout>
      <div className="relative min-h-screen">
        <WinterNightBackground snowCount={14} sparkleCount={8} intensity="light" />

        <div className="relative z-10 container mx-auto max-w-7xl px-4 py-8">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 p-3">
                <Sparkles className="h-8 w-8 text-emerald-300" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-foreground">Creator Mode Studio</h1>
                <p className="text-muted-foreground">Keo tha mini-lesson, quiz, story branch. Duyet noi dung va theo doi hieu qua tai mot noi.</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {canManageTemplates && (
                <Button variant="outline" onClick={resetEditor}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Draft
                </Button>
              )}
              <Button variant="outline" onClick={() => void loadData()} disabled={loading}>
                <BarChart3 className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>

          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
            <TabsList className={`grid w-full ${canManageTemplates && canAccessReviewQueue ? "grid-cols-3" : "grid-cols-2"} bg-card/70`}>
              {canManageTemplates && <TabsTrigger value="studio">Studio</TabsTrigger>}
              {canAccessReviewQueue && (
                <TabsTrigger value="review">{canReviewAsAdmin ? "Admin Queue" : "Review Queue"}</TabsTrigger>
              )}
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {canManageTemplates && (
            <TabsContent value="studio" className="space-y-6">
              <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
                <Card className="border-border/70 bg-card/70">
                  <CardHeader>
                    <CardTitle className="text-base">Template Setup</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={editorMeta.title}
                        onChange={(event) => setEditorMeta((previous) => ({ ...previous, title: event.target.value }))}
                        className="bg-background/60"
                        placeholder="N4 ordering food roleplay"
                      />
                    </div>

                    <div>
                      <Label>Content Type</Label>
                      <Select
                        value={editorMeta.contentType}
                        onValueChange={(value) => setEditorMeta((previous) => ({ ...previous, contentType: value as CreatorContentType }))}
                      >
                        <SelectTrigger className="bg-background/60">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MINI_LESSON">Mini Lesson</SelectItem>
                          <SelectItem value="QUIZ">Quiz</SelectItem>
                          <SelectItem value="STORY_BRANCH">Story Branch</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>JLPT Level</Label>
                      <Select
                        value={editorMeta.jlptLevel}
                        onValueChange={(value) => setEditorMeta((previous) => ({ ...previous, jlptLevel: value }))}
                      >
                        <SelectTrigger className="bg-background/60">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["N5", "N4", "N3", "N2", "N1"].map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Estimated Minutes</Label>
                      <Input
                        type="number"
                        min={3}
                        max={120}
                        value={editorMeta.estimatedMinutes}
                        onChange={(event) => {
                          const next = Number.parseInt(event.target.value, 10);
                          setEditorMeta((previous) => ({
                            ...previous,
                            estimatedMinutes: Number.isNaN(next) ? previous.estimatedMinutes : Math.max(3, Math.min(120, next)),
                          }));
                        }}
                        className="bg-background/60"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label>Summary</Label>
                      <Textarea
                        value={editorMeta.summary}
                        onChange={(event) => setEditorMeta((previous) => ({ ...previous, summary: event.target.value }))}
                        className="bg-background/60"
                        placeholder="Muc tieu bai hoc va outcomes cho nguoi hoc"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label>Tags</Label>
                      <Input
                        value={editorMeta.tags}
                        onChange={(event) => setEditorMeta((previous) => ({ ...previous, tags: event.target.value }))}
                        className="bg-background/60"
                        placeholder="restaurant, keigo, speaking"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/70 bg-card/70">
                  <CardHeader>
                    <CardTitle className="text-base">Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full" onClick={() => void saveDraft()} disabled={saving}>
                      <ClipboardCheck className="mr-2 h-4 w-4" />
                      Save Draft
                    </Button>
                    <Button variant="secondary" className="w-full" onClick={() => void submitCurrentTemplate()}>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Submit For Review
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => void logPlaytest()}>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Log Sample Playtest
                    </Button>
                    {activeTemplateId && (
                      <p className="text-xs text-muted-foreground">
                        Active template ID: {activeTemplateId}. You can switch between drafts below.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
                <CreatorCanvas
                  blocks={blocks}
                  selectedBlockId={selectedBlockId}
                  onSelectBlock={setSelectedBlockId}
                  onAddBlock={handleAddBlock}
                  onMoveBlock={handleMoveBlock}
                  onDeleteBlock={handleDeleteBlock}
                />

                <Card className="border-border/70 bg-card/70">
                  <CardHeader>
                    <CardTitle className="text-base">Block Editor</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CreatorBlockEditor block={selectedBlock} onUpdate={handleUpdateBlock} />
                  </CardContent>
                </Card>
              </div>

              <Card className="border-border/70 bg-card/70">
                <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <CardTitle className="text-base">Draft Library</CardTitle>
                  <Select value={templateFilter} onValueChange={(value) => setTemplateFilter(value as CreatorTemplateStatus | "ALL")}>
                    <SelectTrigger className="w-[220px] bg-background/60">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All statuses</SelectItem>
                      {(["DRAFT", "PENDING_REVIEW", "APPROVED", "REJECTED", "PUBLISHED"] as const).map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardHeader>
                <CardContent className="space-y-2">
                  {filteredTemplates.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => hydrateFromTemplate(template)}
                      className="flex w-full items-center justify-between rounded-lg border border-border bg-background/50 px-3 py-3 text-left hover:bg-background/70"
                    >
                      <div>
                        <p className="font-medium text-foreground">{template.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {template.contentType} • {template.jlptLevel} • Updated {new Date(template.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline" className={STATUS_STYLES[template.status]}>
                        {template.status}
                      </Badge>
                    </button>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
            )}

            {canAccessReviewQueue && (
              <TabsContent value="review" className="space-y-4">
              <Card className="border-border/70 bg-card/70">
                <CardHeader>
                  <CardTitle className="text-base">
                    {canReviewAsAdmin ? "Admin Approval Queue" : "Reviewer Queue"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {reviewQueue.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      {canReviewAsAdmin ? "No templates waiting for admin approval." : "No templates waiting for reviewer approval."}
                    </p>
                  )}

                  {reviewQueue.map((template) => (
                    <div key={template.id} className="rounded-xl border border-border bg-background/50 p-4">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-semibold text-foreground">{template.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {template.contentType} • {template.jlptLevel} • by {template.createdByDisplayName ?? "Unknown"}
                          </p>
                        </div>
                        <Badge variant="outline" className={STATUS_STYLES[template.status]}>
                          {template.status}
                        </Badge>
                      </div>

                      <Textarea
                        value={reviewNotes[template.id] ?? ""}
                        onChange={(event) => setReviewNotes((previous) => ({ ...previous, [template.id]: event.target.value }))}
                        className="mb-3 bg-background/60"
                        placeholder="Review note for creator"
                      />

                      <div className="flex flex-wrap gap-2">
                        {canReviewAsAdmin ? (
                          <>
                            <Button size="sm" variant="secondary" onClick={() => void reviewAsAdmin(template.id, "PUBLISHED")}>
                              Publish
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => void reviewAsAdmin(template.id, "REJECTED")}>
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button size="sm" onClick={() => void reviewAsReviewer(template.id, "APPROVED")}>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Approve To Admin
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => void reviewAsReviewer(template.id, "REJECTED")}>
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              </TabsContent>
            )}

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <CreatorMetricCard
                  title="Templates"
                  value={analytics?.totalTemplates ?? 0}
                  hint={`${analytics?.drafts ?? 0} draft • ${analytics?.pendingReview ?? 0} pending`}
                />
                <CreatorMetricCard
                  title="Completion Rate"
                  value={`${analytics?.completionRate ?? 0}%`}
                  hint={`${analytics?.totalCompletions ?? 0} completions / ${analytics?.totalUsage ?? 0} attempts`}
                />
                <CreatorMetricCard
                  title="Average Score"
                  value={analytics?.averageScore ?? 0}
                  hint="Average creator-template score"
                />
                <CreatorMetricCard
                  title="Published"
                  value={analytics?.published ?? 0}
                  hint={`${analytics?.approved ?? 0} approved • ${analytics?.rejected ?? 0} rejected`}
                />
              </div>

              <Card className="border-border/70 bg-card/70">
                <CardHeader>
                  <CardTitle className="text-base">Top Performing Templates</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Usage</TableHead>
                        <TableHead className="text-right">Completion</TableHead>
                        <TableHead className="text-right">Avg Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(analytics?.topTemplates ?? []).map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.title}</TableCell>
                          <TableCell>{item.contentType}</TableCell>
                          <TableCell className="text-right">{item.usageCount}</TableCell>
                          <TableCell className="text-right">{item.completionRate}%</TableCell>
                          <TableCell className="text-right">{item.averageScore}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminCreatorMode;
