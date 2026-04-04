import { Fragment, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpenCheck,
  Bot,
  Brain,
  Check,
  Clock3,
  Languages,
  MessageSquarePlus,
  PencilLine,
  RefreshCcw,
  SendHorizontal,
  Sparkles,
  Square,
  Trash2,
  WandSparkles,
  X,
} from "lucide-react";
import { aiChatApi, type AiChatConversation, type AiChatHistoryItem, type AiChatMode } from "@/api";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { MetricCard, PageHeader, PageSection } from "@/components/layout/UserPage";
import KaorukoMascot from "@/components/KaorukoMascot";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

type ChatRole = "assistant" | "user";
type ChatMode = AiChatMode;

type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  timestamp: string;
};

type MarkdownBlock =
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "unordered-list"; items: string[] }
  | { type: "ordered-list"; items: string[] }
  | { type: "code"; code: string; language?: string };

const MAX_CONTEXT_MESSAGES = 12;
const EMPTY_ASSISTANT_MESSAGE = " ";

const STARTER_PROMPTS = [
  "Make me a 15-minute N5 study plan for today",
  "Explain the difference between wa and ga",
  "Give me a simple Japanese self-introduction",
  "Break down this sentence: Nihongo o benkyo shiteimasu",
];

const MODE_META: Record<
  ChatMode,
  {
    label: string;
    description: string;
  }
> = {
  coach: {
    label: "Study Coach",
    description: "Plans short sessions, revision steps, and next actions.",
  },
  grammar: {
    label: "Grammar Lab",
    description: "Explains patterns with structure, examples, and notes.",
  },
  conversation: {
    label: "Conversation",
    description: "Helps you draft natural phrases and mini dialogues.",
  },
};

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    timestamp: new Date().toISOString(),
    text:
      "Xin chao, minh la Yukihon AI. Ban co the hoi ngu phap, xin ke hoach hoc ngan, hoac nho minh viet cau tra loi tieng Nhat tu nhien hon.",
  },
];

const formatTime = (timestamp: string) =>
  new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));

const formatConversationTime = (timestamp: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));

const extractApiErrorMessage = (error: unknown) => {
  if (!(error instanceof Error)) {
    return "AI chat is temporarily unavailable. Please try again.";
  }

  try {
    const parsed = JSON.parse(error.message) as { message?: string };
    if (typeof parsed.message === "string" && parsed.message.trim()) {
      return parsed.message;
    }
  } catch {
    // ignore JSON parse failures and fall back to the raw message
  }

  return error.message || "AI chat is temporarily unavailable. Please try again.";
};

const toUiMessage = (message: AiChatHistoryItem): ChatMessage => ({
  id: `history-${message.id}`,
  role: message.role,
  text: message.text,
  timestamp: message.createdAt,
});

const sortConversations = (items: AiChatConversation[]) =>
  [...items].sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());

const renderInlineMarkdown = (text: string) => {
  const codeSegments = text.split(/(`[^`]+`)/g);

  return codeSegments.map((segment, segmentIndex) => {
    if (segment.startsWith("`") && segment.endsWith("`")) {
      return (
        <code
          key={`code-${segmentIndex}`}
          className="rounded-md bg-background/70 px-1.5 py-0.5 font-mono text-[0.9em] text-primary"
        >
          {segment.slice(1, -1)}
        </code>
      );
    }

    const boldSegments = segment.split(/(\*\*[^*]+\*\*)/g);
    return (
      <Fragment key={`text-${segmentIndex}`}>
        {boldSegments.map((part, partIndex) =>
          part.startsWith("**") && part.endsWith("**") ? (
            <strong key={`bold-${segmentIndex}-${partIndex}`} className="font-semibold text-foreground">
              {part.slice(2, -2)}
            </strong>
          ) : (
            <Fragment key={`plain-${segmentIndex}-${partIndex}`}>{part}</Fragment>
          )
        )}
      </Fragment>
    );
  });
};

const parseMarkdownBlocks = (text: string): MarkdownBlock[] => {
  const lines = text.replace(/\r/g, "").split("\n");
  const blocks: MarkdownBlock[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    if (trimmed.startsWith("```")) {
      const language = trimmed.slice(3).trim() || undefined;
      index += 1;
      const codeLines: string[] = [];

      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        codeLines.push(lines[index]);
        index += 1;
      }

      if (index < lines.length) {
        index += 1;
      }

      blocks.push({
        type: "code",
        code: codeLines.join("\n"),
        language,
      });
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.*)$/);
    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: headingMatch[1].length as 1 | 2 | 3,
        text: headingMatch[2],
      });
      index += 1;
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^[-*]\s+/, ""));
        index += 1;
      }
      blocks.push({ type: "unordered-list", items });
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+\.\s+/, ""));
        index += 1;
      }
      blocks.push({ type: "ordered-list", items });
      continue;
    }

    const paragraphLines: string[] = [];
    while (index < lines.length) {
      const candidate = lines[index];
      const candidateTrimmed = candidate.trim();

      if (
        !candidateTrimmed ||
        candidateTrimmed.startsWith("```") ||
        /^(#{1,3})\s+/.test(candidateTrimmed) ||
        /^[-*]\s+/.test(candidateTrimmed) ||
        /^\d+\.\s+/.test(candidateTrimmed)
      ) {
        break;
      }

      paragraphLines.push(candidateTrimmed);
      index += 1;
    }

    blocks.push({
      type: "paragraph",
      text: paragraphLines.join(" "),
    });
  }

  return blocks;
};

const MarkdownMessage = ({ text, isAssistant }: { text: string; isAssistant: boolean }) => {
  const blocks = parseMarkdownBlocks(text);
  const codeWrapperClass = isAssistant
    ? "border-border/80 bg-background/70 text-foreground"
    : "border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground";
  const codeLabelClass = isAssistant ? "text-muted-foreground" : "text-primary-foreground/70";

  return (
    <div className="space-y-3 text-sm leading-6">
      {blocks.map((block, blockIndex) => {
        if (block.type === "heading") {
          const headingClass =
            block.level === 1
              ? "text-lg font-semibold"
              : block.level === 2
                ? "text-base font-semibold"
                : "text-sm font-semibold uppercase tracking-[0.12em]";

          return (
            <div key={`heading-${blockIndex}`} className={headingClass}>
              {renderInlineMarkdown(block.text)}
            </div>
          );
        }

        if (block.type === "paragraph") {
          return (
            <p key={`paragraph-${blockIndex}`} className="whitespace-pre-wrap">
              {renderInlineMarkdown(block.text)}
            </p>
          );
        }

        if (block.type === "unordered-list") {
          return (
            <ul key={`ul-${blockIndex}`} className="list-disc space-y-1 pl-5">
              {block.items.map((item, itemIndex) => (
                <li key={`ul-item-${blockIndex}-${itemIndex}`}>{renderInlineMarkdown(item)}</li>
              ))}
            </ul>
          );
        }

        if (block.type === "ordered-list") {
          return (
            <ol key={`ol-${blockIndex}`} className="list-decimal space-y-1 pl-5">
              {block.items.map((item, itemIndex) => (
                <li key={`ol-item-${blockIndex}-${itemIndex}`}>{renderInlineMarkdown(item)}</li>
              ))}
            </ol>
          );
        }

        return (
          <div key={`code-${blockIndex}`} className={cn("overflow-hidden rounded-2xl border", codeWrapperClass)}>
            <div className={cn("border-b px-3 py-2 text-[11px] uppercase tracking-[0.18em]", codeLabelClass)}>
              {block.language || "code"}
            </div>
            <pre className="overflow-x-auto px-4 py-3 text-[13px] leading-6">
              <code className="font-mono">{block.code}</code>
            </pre>
          </div>
        );
      })}
    </div>
  );
};

const AiChat = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<AiChatConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [mode, setMode] = useState<ChatMode>("coach");
  const [activeModel, setActiveModel] = useState("gpt-5-mini");
  const [conversationLoading, setConversationLoading] = useState(true);
  const [messageLoading, setMessageLoading] = useState(false);
  const [creatingConversation, setCreatingConversation] = useState(false);
  const [conversationActionId, setConversationActionId] = useState<number | null>(null);
  const [renamingConversationId, setRenamingConversationId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const activeConversation = conversations.find((conversation) => conversation.id === activeConversationId) ?? null;
  const filteredConversations = conversations.filter((conversation) =>
    conversation.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadConversations = async () => {
      setConversationLoading(true);
      try {
        const items = sortConversations(await aiChatApi.getConversations());
        if (cancelled) return;
        setConversations(items);
        setActiveConversationId(items[0]?.id ?? null);
      } catch (error) {
        if (cancelled) return;
        setConversations([]);
        setActiveConversationId(null);
        setMessages(INITIAL_MESSAGES);
        toast({
          title: "Could not load chat history",
          description: extractApiErrorMessage(error),
          variant: "destructive",
        });
      } finally {
        if (!cancelled) {
          setConversationLoading(false);
        }
      }
    };

    void loadConversations();

    return () => {
      cancelled = true;
    };
  }, [toast]);

  useEffect(() => {
    let cancelled = false;

    const loadMessages = async () => {
      if (activeConversationId == null) {
        setMessages(INITIAL_MESSAGES);
        setMessageLoading(false);
        return;
      }

      setMessageLoading(true);
      try {
        const history = await aiChatApi.getConversationMessages(activeConversationId);
        if (cancelled) return;

        if (history.length > 0) {
          setMessages(history.map(toUiMessage));
          const latestAssistant = [...history].reverse().find((message) => message.role === "assistant" && message.model);
          if (latestAssistant?.model) {
            setActiveModel(latestAssistant.model);
          }
          const latestMode = [...history].reverse().find((message) => !!message.mode)?.mode;
          if (latestMode) {
            setMode(latestMode);
          }
        } else {
          setMessages(INITIAL_MESSAGES);
        }
      } catch (error) {
        if (cancelled) return;
        setMessages(INITIAL_MESSAGES);
        toast({
          title: "Could not load this conversation",
          description: extractApiErrorMessage(error),
          variant: "destructive",
        });
      } finally {
        if (!cancelled) {
          setMessageLoading(false);
        }
      }
    };

    void loadMessages();

    return () => {
      cancelled = true;
    };
  }, [activeConversationId, toast]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [isTyping, messages]);

  const refreshConversations = async (preferredConversationId?: number | null) => {
    const items = sortConversations(await aiChatApi.getConversations());
    setConversations(items);
    setActiveConversationId((current) => {
      if (preferredConversationId != null && items.some((item) => item.id === preferredConversationId)) {
        return preferredConversationId;
      }
      if (current != null && items.some((item) => item.id === current)) {
        return current;
      }
      return items[0]?.id ?? null;
    });
  };

  const upsertConversation = (conversationId: number, conversationTitle?: string) => {
    const now = new Date().toISOString();
    setConversations((current) => {
      const existing = current.find((conversation) => conversation.id === conversationId);
      const next = existing
        ? current.map((conversation) =>
            conversation.id === conversationId
              ? {
                  ...conversation,
                  title: conversationTitle || conversation.title,
                  updatedAt: now,
                }
              : conversation
          )
        : [
            {
              id: conversationId,
              title: conversationTitle || "New chat",
              createdAt: now,
              updatedAt: now,
            },
            ...current,
          ];

      return sortConversations(next);
    });
  };

  const sendMessage = async (preset?: string) => {
    const value = (preset ?? input).trim();
    if (!value || isTyping) return;

    abortControllerRef.current?.abort();
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const assistantMessageId = `assistant-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: value,
      timestamp: new Date().toISOString(),
    };
    const assistantPlaceholder: ChatMessage = {
      id: assistantMessageId,
      role: "assistant",
      text: EMPTY_ASSISTANT_MESSAGE,
      timestamp: new Date().toISOString(),
    };

    const nextMessages = [...messages, userMessage, assistantPlaceholder];

    setMessages(nextMessages);
    setInput("");
    setIsTyping(true);

    try {
      let streamFailed = false;

      await aiChatApi.streamRespond(
        {
          conversationId: activeConversationId ?? undefined,
          mode,
          messages: nextMessages
            .filter((message) => message.id !== assistantMessageId && message.id !== "welcome")
            .slice(-MAX_CONTEXT_MESSAGES)
            .map((message) => ({
              role: message.role,
              text: message.text,
            })),
        },
        {
          onMeta: ({ model, mode: streamMode, conversationId, conversationTitle }) => {
            if (model) {
              setActiveModel(model);
            }
            if (streamMode) {
              setMode(streamMode);
            }
            if (conversationId) {
              setActiveConversationId(conversationId);
              upsertConversation(conversationId, conversationTitle);
            }
          },
          onDelta: (delta) => {
            setMessages((current) =>
              current.map((message) =>
                message.id === assistantMessageId
                  ? {
                      ...message,
                      text: message.text === EMPTY_ASSISTANT_MESSAGE ? delta : message.text + delta,
                    }
                  : message
              )
            );
          },
          onDone: async ({ model, conversationId, conversationTitle }) => {
            if (model) {
              setActiveModel(model);
            }
            if (conversationId) {
              upsertConversation(conversationId, conversationTitle);
              try {
                await refreshConversations(conversationId);
              } catch {
                // Keep local ordering if the refresh fails.
              }
            }
            setMessages((current) =>
              current.map((message) =>
                message.id === assistantMessageId && message.text === EMPTY_ASSISTANT_MESSAGE
                  ? { ...message, text: "" }
                  : message
              )
            );
          },
          onError: (message) => {
            streamFailed = true;
            setMessages((current) => current.filter((item) => item.id !== assistantMessageId));
            toast({
              title: "AI chat unavailable",
              description: message,
              variant: "destructive",
            });
          },
        },
        {
          signal: abortController.signal,
        }
      );

      if (!streamFailed) {
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantMessageId && message.text === EMPTY_ASSISTANT_MESSAGE
              ? { ...message, text: "" }
              : message
          )
        );
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setMessages((current) => current.filter((item) => item.id !== assistantMessageId || item.text !== EMPTY_ASSISTANT_MESSAGE));
        return;
      }
      setMessages((current) => current.filter((item) => item.id !== assistantMessageId));
      toast({
        title: "AI chat unavailable",
        description: extractApiErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
      setIsTyping(false);
    }
  };

  const stopGenerating = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsTyping(false);
    setMessages((current) => current.filter((item) => item.text !== EMPTY_ASSISTANT_MESSAGE));
  };

  const selectConversation = (conversationId: number) => {
    if (conversationId === activeConversationId) return;
    if (isTyping) {
      stopGenerating();
    }
    setRenamingConversationId(null);
    setRenameValue("");
    setActiveConversationId(conversationId);
  };

  const handleCreateConversation = async () => {
    if (isTyping) {
      stopGenerating();
    }

    setCreatingConversation(true);
    try {
      const conversation = await aiChatApi.createConversation();
      setConversations((current) => sortConversations([conversation, ...current.filter((item) => item.id !== conversation.id)]));
      setActiveConversationId(conversation.id);
      setRenamingConversationId(null);
      setRenameValue("");
      setInput("");
    } catch (error) {
      toast({
        title: "Could not create a new chat",
        description: extractApiErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setCreatingConversation(false);
    }
  };

  const handleStartRename = (conversation: AiChatConversation) => {
    setRenamingConversationId(conversation.id);
    setRenameValue(conversation.title);
  };

  const handleRenameConversation = async (conversationId: number) => {
    const title = renameValue.trim();
    if (!title) {
      toast({
        title: "Conversation title is required",
        description: "Please enter a short name before saving.",
        variant: "destructive",
      });
      return;
    }

    setConversationActionId(conversationId);
    try {
      const updatedConversation = await aiChatApi.renameConversation(conversationId, title);
      setConversations((current) =>
        sortConversations(
          current.map((conversation) => (conversation.id === conversationId ? updatedConversation : conversation))
        )
      );
      setRenamingConversationId(null);
      setRenameValue("");
    } catch (error) {
      toast({
        title: "Could not rename the conversation",
        description: extractApiErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setConversationActionId(null);
    }
  };

  const handleDeleteConversation = async (conversationId: number) => {
    const conversation = conversations.find((item) => item.id === conversationId);
    if (!conversation) return;

    const confirmed = window.confirm(`Delete "${conversation.title}"? This will remove all messages in that chat.`);
    if (!confirmed) return;

    if (activeConversationId === conversationId && isTyping) {
      stopGenerating();
    }

    setConversationActionId(conversationId);
    try {
      await aiChatApi.deleteConversation(conversationId);
      const remaining = conversations.filter((item) => item.id !== conversationId);
      setConversations(remaining);
      setRenamingConversationId((current) => (current === conversationId ? null : current));
      setRenameValue("");
      if (activeConversationId === conversationId) {
        setActiveConversationId(remaining[0]?.id ?? null);
      }
    } catch (error) {
      toast({
        title: "Could not delete the conversation",
        description: extractApiErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setConversationActionId(null);
    }
  };

  const resetChat = () => {
    const clear = async () => {
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
      setIsTyping(false);
      try {
        await aiChatApi.clearHistory();
      } catch {
        // keep UI responsive even if server cleanup fails
      }
      setConversations([]);
      setActiveConversationId(null);
      setRenamingConversationId(null);
      setRenameValue("");
      setMessages(INITIAL_MESSAGES);
    };

    void clear();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  };

  const handleRenameKeyDown = (event: KeyboardEvent<HTMLInputElement>, conversationId: number) => {
    if (event.key === "Enter") {
      event.preventDefault();
      void handleRenameConversation(conversationId);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setRenamingConversationId(null);
      setRenameValue("");
    }
  };

  const userMessages = messages.filter((message) => message.role === "user").length;
  const assistantMessages = messages.filter((message) => message.role === "assistant" && message.id !== "welcome").length;
  const userName = user?.displayName || "Learner";

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1500px]">
        <PageHeader
          icon={<Bot className="h-6 w-6 text-primary" />}
          title="AI Chat"
          description="A focused study chat space for grammar, practice prompts, and compact JLPT coaching."
          eyebrow="Assistant"
          action={
            <>
              <Badge className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-primary hover:bg-primary/10">
                Live via {activeModel}
              </Badge>
              <Button className="rounded-2xl" onClick={resetChat} variant="outline">
                <RefreshCcw className="mr-2 h-4 w-4" />
                Reset all chats
              </Button>
            </>
          }
        />

        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <MetricCard
            label="Session"
            value={`${userMessages} turns`}
            icon={<Sparkles className="h-4 w-4 text-primary" />}
            hint={activeConversation ? `Current thread: ${activeConversation.title}` : "Start a new chat to save a thread."}
          />
          <MetricCard
            label="Assistant"
            value={`${assistantMessages} replies`}
            icon={<Bot className="h-4 w-4 text-sky-500" />}
            hint="Replies now come from the backend OpenAI proxy."
          />
          <MetricCard
            label="Status"
            value={isTyping ? "Thinking" : "Ready"}
            icon={<Clock3 className="h-4 w-4 text-amber-500" />}
            hint="Press Enter to send, Shift + Enter for a new line."
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            <PageSection
              title={activeConversation ? activeConversation.title : "Study conversation"}
              description="Chat bubbles, starter prompts, and a live backend AI response flow."
              className="overflow-hidden p-0"
            >
              <div className="border-b border-border bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 px-4 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  {STARTER_PROMPTS.map((prompt) => (
                    <Button
                      key={prompt}
                      className="rounded-full border-border bg-background/80 text-xs text-foreground/80 hover:bg-background"
                      onClick={() => void sendMessage(prompt)}
                      size="sm"
                      variant="outline"
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="max-h-[620px] min-h-[420px] space-y-4 overflow-y-auto px-4 py-4">
                {(conversationLoading || messageLoading) && !isTyping ? (
                  <div className="flex min-h-[220px] items-center justify-center">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
                  </div>
                ) : null}

                {!conversationLoading && !messageLoading ? (
                  <AnimatePresence initial={false}>
                    {messages.map((message, index) => {
                      const isAssistant = message.role === "assistant";

                      return (
                        <motion.div
                          key={message.id}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn("flex gap-3", isAssistant ? "justify-start" : "justify-end")}
                          initial={{ opacity: 0, y: 12 }}
                          transition={{ delay: index * 0.02 }}
                        >
                          {isAssistant && (
                            <div className="hidden pt-1 sm:block">
                              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                                <Bot className="h-4 w-4" />
                              </div>
                            </div>
                          )}

                          <div
                            className={cn(
                              "max-w-[92%] rounded-[22px] border px-4 py-3 sm:max-w-[78%]",
                              isAssistant
                                ? "border-border bg-card text-foreground"
                                : "border-primary/20 bg-primary text-primary-foreground"
                            )}
                          >
                            <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em]">
                              <span className={isAssistant ? "text-muted-foreground" : "text-primary-foreground/75"}>
                                {isAssistant ? "Yukihon AI" : userName}
                              </span>
                              <span className={isAssistant ? "text-muted-foreground/60" : "text-primary-foreground/60"}>
                                {formatTime(message.timestamp)}
                              </span>
                            </div>
                            {message.text === EMPTY_ASSISTANT_MESSAGE ? (
                              <p className="text-sm leading-6" />
                            ) : (
                              <MarkdownMessage text={message.text} isAssistant={isAssistant} />
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                ) : null}

                {isTyping && messages[messages.length - 1]?.role !== "assistant" && (
                  <motion.div
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3"
                    initial={{ opacity: 0, y: 8 }}
                  >
                    <div className="hidden pt-1 sm:block">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                        <Bot className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="rounded-[22px] border border-border bg-card px-4 py-3">
                      <div className="mb-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        Yukihon AI
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary" />
                        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary animation-delay-200" />
                        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary animation-delay-500" />
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={bottomRef} />
              </div>

              <div className="border-t border-border bg-muted/20 p-4">
                <div className="rounded-[24px] border border-border bg-card p-3">
                  <Textarea
                    className="min-h-[120px] resize-none border-none bg-transparent px-1 text-sm shadow-none focus-visible:ring-0"
                    disabled={messageLoading}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask for a grammar breakdown, a JLPT study plan, or a natural Japanese reply..."
                    value={input}
                  />
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">
                      Current mode: {MODE_META[mode].label}
                    </p>
                    <div className="flex items-center gap-2">
                      {isTyping && (
                        <Button
                          className="rounded-2xl"
                          onClick={stopGenerating}
                          variant="outline"
                        >
                          <Square className="mr-2 h-4 w-4" />
                          Stop generating
                        </Button>
                      )}
                      <Button
                        className="rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90"
                        disabled={!input.trim() || isTyping || messageLoading}
                        onClick={() => void sendMessage()}
                      >
                        <SendHorizontal className="mr-2 h-4 w-4" />
                        Send
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </PageSection>
          </div>

          <div className="space-y-4">
            <PageSection
              title="Conversations"
              description="Rename or remove each saved chat instead of clearing everything."
            >
              <Button
                className="mb-4 w-full rounded-2xl"
                disabled={creatingConversation}
                onClick={() => void handleCreateConversation()}
              >
                <MessageSquarePlus className="mr-2 h-4 w-4" />
                {creatingConversation ? "Creating..." : "New chat"}
              </Button>

              <div className="mb-4">
                <Input
                  className="rounded-2xl"
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search conversations..."
                  value={searchQuery}
                />
              </div>

              <div className="space-y-3">
                {conversationLoading ? (
                  <div className="flex min-h-[160px] items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
                  </div>
                ) : null}

                {!conversationLoading && conversations.length === 0 ? (
                  <div className="rounded-[22px] border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground">
                    No saved chats yet. Start a conversation and it will appear here.
                  </div>
                ) : null}

                {!conversationLoading && conversations.length > 0 && filteredConversations.length === 0 ? (
                  <div className="rounded-[22px] border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground">
                    No conversations match "{searchQuery.trim()}".
                  </div>
                ) : null}

                {!conversationLoading
                  ? filteredConversations.map((conversation) => {
                      const isActive = conversation.id === activeConversationId;
                      const isBusy = conversationActionId === conversation.id;
                      const isRenaming = renamingConversationId === conversation.id;

                      return (
                        <div
                          key={conversation.id}
                          className={cn(
                            "rounded-[22px] border p-3 transition",
                            isActive ? "border-primary/30 bg-primary/10" : "border-border bg-card hover:bg-muted/40"
                          )}
                        >
                          {isRenaming ? (
                            <div className="space-y-3">
                              <Input
                                autoFocus
                                disabled={isBusy}
                                onChange={(event) => setRenameValue(event.target.value)}
                                onKeyDown={(event) => handleRenameKeyDown(event, conversation.id)}
                                value={renameValue}
                              />
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  disabled={isBusy}
                                  onClick={() => {
                                    setRenamingConversationId(null);
                                    setRenameValue("");
                                  }}
                                  size="icon"
                                  variant="ghost"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                                <Button
                                  disabled={isBusy}
                                  onClick={() => void handleRenameConversation(conversation.id)}
                                  size="icon"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <button
                                className="w-full text-left"
                                onClick={() => selectConversation(conversation.id)}
                                type="button"
                              >
                                <div className="flex items-start gap-3">
                                  <div
                                    className={cn(
                                      "flex h-10 w-10 items-center justify-center rounded-2xl",
                                      isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                    )}
                                  >
                                    <Bot className="h-4 w-4" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-foreground">{conversation.title}</p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                      {isActive ? "Current thread" : formatConversationTime(conversation.updatedAt)}
                                    </p>
                                  </div>
                                </div>
                              </button>

                              <div
                                className={cn(
                                  "mt-3 flex items-center justify-end gap-2 transition",
                                  isActive ? "opacity-100" : "opacity-70"
                                )}
                              >
                                <Button
                                  disabled={isBusy}
                                  onClick={() => handleStartRename(conversation)}
                                  size="icon"
                                  variant="ghost"
                                >
                                  <PencilLine className="h-4 w-4" />
                                </Button>
                                <Button
                                  className="text-destructive hover:text-destructive"
                                  disabled={isBusy}
                                  onClick={() => void handleDeleteConversation(conversation.id)}
                                  size="icon"
                                  variant="ghost"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })
                  : null}
              </div>
            </PageSection>

            <PageSection title="Assistant profile" description="A friendly study persona inside the existing Yukihon dashboard style.">
              <div className="rounded-[28px] border border-border bg-gradient-to-br from-primary/10 via-card to-secondary/10 p-4">
                <div className="flex items-center gap-4">
                  <KaorukoMascot mood={isTyping ? "thinking" : "guide"} size="md" />
                  <div>
                    <p className="text-lg font-semibold text-foreground">Yukihon AI</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Short answers, study scaffolding, and sentence support.
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge className="rounded-full border border-sky-500/20 bg-sky-500/10 text-sky-600 hover:bg-sky-500/10">
                    Grammar help
                  </Badge>
                  <Badge className="rounded-full border border-primary/20 bg-primary/10 text-primary hover:bg-primary/10">
                    JLPT coaching
                  </Badge>
                  <Badge className="rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-600 hover:bg-amber-500/10">
                    Sentence drafts
                  </Badge>
                </div>
              </div>
            </PageSection>

            <PageSection title="Modes" description="Switch the vibe of the assistant before sending your next prompt.">
              <div className="space-y-3">
                {(
                  [
                    { key: "coach", icon: WandSparkles },
                    { key: "grammar", icon: Brain },
                    { key: "conversation", icon: Languages },
                  ] as const
                ).map((item) => {
                  const meta = MODE_META[item.key];
                  const Icon = item.icon;
                  const active = mode === item.key;

                  return (
                    <button
                      key={item.key}
                      className={cn(
                        "w-full rounded-[20px] border p-4 text-left transition",
                        active
                          ? "border-primary/30 bg-primary/10"
                          : "border-border bg-card hover:bg-muted/50"
                      )}
                      onClick={() => setMode(item.key)}
                      type="button"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "flex h-11 w-11 items-center justify-center rounded-2xl",
                            active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{meta.label}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{meta.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </PageSection>

            <PageSection title="What to ask" description="Starter directions for the live AI study assistant.">
              <div className="space-y-3">
                <div className="rounded-[20px] border border-border bg-card p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <BookOpenCheck className="h-4 w-4 text-primary" />
                    Study planning
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Ask for a 10-minute or 20-minute revision flow by JLPT level.
                  </p>
                </div>

                <div className="rounded-[20px] border border-border bg-card p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Brain className="h-4 w-4 text-sky-500" />
                    Grammar breakdown
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Send a grammar form and get structure, meaning, and a contrast example.
                  </p>
                </div>

                <div className="rounded-[20px] border border-border bg-card p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Languages className="h-4 w-4 text-amber-500" />
                    Reply drafting
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Describe a scenario and let the bot shape a clean Japanese response.
                  </p>
                </div>
              </div>
            </PageSection>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AiChat;
