import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpenCheck,
  Bot,
  Brain,
  Clock3,
  Languages,
  RefreshCcw,
  SendHorizontal,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { aiChatApi, type AiChatMode } from "@/api";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { MetricCard, PageHeader, PageSection } from "@/components/layout/UserPage";
import KaorukoMascot from "@/components/KaorukoMascot";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

const STORAGE_KEY = "yukihon_ai_chat_messages";
const MAX_CONTEXT_MESSAGES = 12;

const STARTER_PROMPTS = [
  "Make me a 15-minute N5 study plan for today",
  "Explain the difference between は and が",
  "Give me a simple Japanese self-introduction",
  "Break down this sentence: 日本語を勉強しています",
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
      "Xin chào, mình là Yukihon AI. Mình có thể giúp bạn ôn ngữ pháp, lên kế hoạch học ngắn, luyện trả lời tiếng Nhật và giải thích câu theo từng phần.",
  },
];

const formatTime = (timestamp: string) =>
  new Intl.DateTimeFormat("en-GB", {
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

const AiChat = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [mode, setMode] = useState<ChatMode>("coach");
  const [activeModel, setActiveModel] = useState("gpt-5-mini");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as ChatMessage[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        setMessages(parsed);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [isTyping, messages]);

  const sendMessage = async (preset?: string) => {
    const value = (preset ?? input).trim();
    if (!value || isTyping) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: value,
      timestamp: new Date().toISOString(),
    };

    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setIsTyping(true);

    try {
      const response = await aiChatApi.respond({
        mode,
        messages: nextMessages.slice(-MAX_CONTEXT_MESSAGES).map((message) => ({
          role: message.role,
          text: message.text,
        })),
      });

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        text: response.reply,
        timestamp: new Date().toISOString(),
      };

      setMessages((current) => [...current, assistantMessage]);
      setActiveModel(response.model);
    } catch (error) {
      toast({
        title: "AI chat unavailable",
        description: extractApiErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const resetChat = () => {
    setIsTyping(false);
    setMessages(INITIAL_MESSAGES);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  };

  const userMessages = messages.filter((message) => message.role === "user").length;
  const assistantMessages = messages.length - userMessages;
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
                Reset chat
              </Button>
            </>
          }
        />

        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <MetricCard
            label="Session"
            value={`${userMessages} turns`}
            icon={<Sparkles className="h-4 w-4 text-primary" />}
            hint="User prompts sent in this saved thread."
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
              title="Study conversation"
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
                          <p className="whitespace-pre-wrap text-sm leading-6">{message.text}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {isTyping && (
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
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask for a grammar breakdown, a JLPT study plan, or a natural Japanese reply..."
                    value={input}
                  />
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">
                      Current mode: {MODE_META[mode].label}
                    </p>
                    <Button
                      className="rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90"
                      disabled={!input.trim() || isTyping}
                      onClick={() => void sendMessage()}
                    >
                      <SendHorizontal className="mr-2 h-4 w-4" />
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            </PageSection>
          </div>

          <div className="space-y-4">
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
