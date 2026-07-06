import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Application, Container, Graphics, Text } from "pixi.js";
import { RotateCcw, Trophy, Waves, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";

export interface GameCard {
  front: string;
  back: string;
  hint?: string;
}

const CATCH_GAP = 66;
const FISH_MARGIN = 64;
const START_X = -50;
const BASE_SPEED = 30; // px / second
const SPEED_RAMP = 2.2; // per correct answer
const KNOCKBACK = 96;
const PENALTY = 60; // shark lunge on give-up
const BEST_KEY = "yukihon_kana_shark_best";

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, "");
/** Accept any of the answers separated by , ; / or Japanese 、 */
const answersOf = (back: string) =>
  back
    .split(/[,;/、]/)
    .map(norm)
    .filter(Boolean);

/**
 * Kana Shark — a typing game fed by a deck's cards: the front is shown, type its reading/answer
 * (the back) to blast the shark back before it reaches you. Standalone (not wired to SRS yet).
 */
const KanaSharkGame = ({ cards, deckTitle }: { cards: GameCard[]; deckTitle: string }) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const appRef = useRef<Application | null>(null);
  const sceneRef = useRef<{
    shark: Container;
    tail: Graphics;
    fish: Container;
    bubbles: Graphics[];
    promptText: Text;
    promptBubble: Graphics;
    danger: Graphics;
  } | null>(null);
  const sim = useRef({
    sharkX: START_X,
    speed: BASE_SPEED,
    shake: 0,
    hop: 0,
    t: 0,
    running: false,
    width: 800,
    height: 300,
  });
  const onOver = useRef<() => void>(() => {});

  const pool = useMemo(() => cards.filter((c) => c.front?.trim() && c.back?.trim()), [cards]);

  const [phase, setPhase] = useState<"intro" | "playing" | "over">("intro");
  const [card, setCard] = useState<GameCard | null>(null);
  const [typed, setTyped] = useState("");
  const [wrong, setWrong] = useState(false);
  const [reveal, setReveal] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [best, setBest] = useState(() => Number(localStorage.getItem(BEST_KEY) || 0));
  const [stats, setStats] = useState({ correct: 0, total: 0 });
  const [danger, setDanger] = useState(0);

  const nextCard = useCallback(() => {
    setCard(pool[Math.floor(Math.random() * pool.length)]);
    setTyped("");
    setWrong(false);
    setReveal(null);
  }, [pool]);

  // ---------- Pixi scene ----------
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let destroyed = false;
    const app = new Application();

    (async () => {
      await app.init({ resizeTo: host, backgroundAlpha: 0, antialias: true });
      if (destroyed) {
        app.destroy(true);
        return;
      }
      host.appendChild(app.canvas);
      appRef.current = app;
      sim.current.width = app.screen.width;
      sim.current.height = app.screen.height;

      const bubbles: Graphics[] = [];
      for (let i = 0; i < 16; i++) {
        const b = new Graphics();
        b.circle(0, 0, 3 + Math.random() * 7).fill({ color: 0xffffff, alpha: 0.12 });
        b.x = Math.random() * app.screen.width;
        b.y = Math.random() * app.screen.height;
        (b as unknown as { vy: number }).vy = 12 + Math.random() * 26;
        app.stage.addChild(b);
        bubbles.push(b);
      }

      const fish = buildFish();
      app.stage.addChild(fish);

      const { shark, tail } = buildShark();
      app.stage.addChild(shark);

      const promptBubble = new Graphics();
      app.stage.addChild(promptBubble);
      const promptText = new Text({
        text: "",
        style: {
          fontFamily: "'Noto Sans JP', system-ui, sans-serif",
          fontSize: 46,
          fontWeight: "700",
          fill: 0x0b3550,
          align: "center",
        },
      });
      promptText.anchor.set(0.5);
      app.stage.addChild(promptText);

      const dangerBar = new Graphics();
      app.stage.addChild(dangerBar);

      sceneRef.current = {
        shark,
        tail,
        fish,
        bubbles,
        promptText,
        promptBubble,
        danger: dangerBar,
      };

      app.ticker.add((ticker) => {
        const s = sim.current;
        s.width = app.screen.width;
        s.height = app.screen.height;
        const dt = Math.min(ticker.deltaMS / 1000, 0.05);
        s.t += dt;
        const fishX = s.width - FISH_MARGIN;

        if (s.running) {
          s.sharkX += s.speed * dt;
          if (s.sharkX >= fishX - CATCH_GAP) {
            s.sharkX = fishX - CATCH_GAP;
            s.running = false;
            onOver.current();
          }
        }

        shark.x = s.sharkX + (s.shake ? (Math.random() - 0.5) * s.shake : 0);
        shark.y = s.height / 2 + Math.sin(s.t * 2) * 6;
        tail.rotation = Math.sin(s.t * 10) * 0.4;
        s.shake *= 0.86;

        s.hop *= 0.9;
        fish.x = fishX;
        fish.y = s.height / 2 - Math.abs(s.hop) + Math.sin(s.t * 3) * 4;

        const px = s.width / 2;
        const py = s.height * 0.32 + Math.sin(s.t * 1.6) * 8;
        promptText.x = px;
        promptText.y = py;
        promptBubble.clear();
        promptBubble.circle(px, py, 52).fill({ color: 0xffffff, alpha: 0.82 });
        promptBubble.circle(px, py, 52).stroke({ color: 0x7cc7f2, width: 3, alpha: 0.9 });

        for (const b of bubbles) {
          b.y -= (b as unknown as { vy: number }).vy * dt;
          if (b.y < -10) {
            b.y = s.height + 10;
            b.x = Math.random() * s.width;
          }
        }

        const frac = Math.max(0, Math.min(1, (s.sharkX - START_X) / (fishX - CATCH_GAP - START_X)));
        dangerBar.clear();
        dangerBar.roundRect(16, 14, s.width - 32, 6, 3).fill({ color: 0xffffff, alpha: 0.15 });
        dangerBar
          .roundRect(16, 14, (s.width - 32) * frac, 6, 3)
          .fill({ color: frac > 0.7 ? 0xff5a6a : frac > 0.4 ? 0xffb020 : 0x39d98a });
      });
    })();

    return () => {
      destroyed = true;
      try {
        appRef.current?.destroy(true);
      } catch {
        /* ignore */
      }
      appRef.current = null;
      sceneRef.current = null;
    };
  }, []);

  // Reflect prompt into the scene
  useEffect(() => {
    if (sceneRef.current && card) {
      const t = sceneRef.current.promptText;
      t.text = card.front;
      t.style.fontSize = card.front.length > 4 ? 30 : 46;
    }
  }, [card]);

  // ---------- Game control ----------
  const start = useCallback(() => {
    sim.current.sharkX = START_X;
    sim.current.speed = BASE_SPEED;
    sim.current.shake = 0;
    sim.current.running = true;
    setScore(0);
    setCombo(0);
    setStats({ correct: 0, total: 0 });
    setDanger(0);
    nextCard();
    setPhase("playing");
    window.setTimeout(() => inputRef.current?.focus(), 60);
  }, [nextCard]);

  const finish = useCallback(() => {
    setPhase("over");
    setScore((sc) => {
      setBest((b) => {
        const next = Math.max(b, sc);
        localStorage.setItem(BEST_KEY, String(next));
        return next;
      });
      return sc;
    });
  }, []);
  onOver.current = finish;

  const handleCorrect = useCallback(() => {
    setStats((s) => ({ correct: s.correct + 1, total: s.total + 1 }));
    setCombo((c) => {
      const nc = c + 1;
      setScore((sc) => sc + 10 + nc * 2);
      return nc;
    });
    sim.current.sharkX = Math.max(START_X, sim.current.sharkX - KNOCKBACK);
    sim.current.speed += SPEED_RAMP;
    sim.current.hop = 16;
    nextCard();
  }, [nextCard]);

  const onType = (value: string) => {
    if (phase !== "playing" || !card) return;
    setTyped(value);
    const answers = answersOf(card.back);
    const t = norm(value);
    if (!t) {
      setWrong(false);
      return;
    }
    if (answers.includes(t)) {
      handleCorrect();
    } else {
      setWrong(!answers.some((a) => a.startsWith(t)));
    }
  };

  const giveUp = () => {
    if (phase !== "playing" || !card) return;
    setStats((s) => ({ correct: s.correct, total: s.total + 1 }));
    setCombo(0);
    sim.current.sharkX += PENALTY;
    sim.current.shake = 12;
    setReveal(card.back);
    window.setTimeout(() => nextCard(), 900);
  };

  // Danger → HUD (~11 fps)
  useEffect(() => {
    if (phase !== "playing") return;
    const id = window.setInterval(() => {
      const s = sim.current;
      const fishX = s.width - FISH_MARGIN;
      setDanger(Math.max(0, Math.min(1, (s.sharkX - START_X) / (fishX - CATCH_GAP - START_X))));
    }, 90);
    return () => window.clearInterval(id);
  }, [phase]);

  const accuracy = stats.total ? Math.round((stats.correct / stats.total) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl border border-border">
        <div
          ref={hostRef}
          className="h-[300px] w-full"
          style={{
            background: "linear-gradient(180deg,#0d5c8c 0%,#0a4a76 42%,#083a5e 78%,#062a45 100%)",
          }}
        />
        <div className="pointer-events-none absolute left-4 right-4 top-6 flex items-center justify-between text-xs font-semibold text-white/90">
          <span className="rounded-full bg-black/25 px-2.5 py-1">
            {score} điểm{combo > 1 ? ` · x${combo}` : ""}
          </span>
          <span className="rounded-full bg-black/25 px-2.5 py-1">
            {danger > 0.7 ? "Nguy hiểm!" : deckTitle}
          </span>
        </div>

        {phase !== "playing" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#062a45]/70 px-4 text-center backdrop-blur-sm">
            {phase === "intro" ? (
              <>
                <Waves className="h-9 w-9 text-sky-200" />
                <p className="text-lg font-bold text-white">Kana Shark</p>
                <p className="max-w-sm text-sm text-sky-100/90">
                  Cá mập đang lao tới! Gõ đúng cách đọc / đáp án của thẻ để bắn nó lùi ra xa. Chậm
                  là bị đớp.
                </p>
                <Button onClick={start} className="mt-1 rounded-xl">
                  Bắt đầu
                </Button>
              </>
            ) : (
              <>
                <Trophy className="h-9 w-9 text-amber-300" />
                <p className="text-lg font-bold text-white">Bị cá mập đớp rồi!</p>
                <div className="flex gap-5 text-sm text-sky-100">
                  <span>
                    Điểm <b className="text-white">{score}</b>
                  </span>
                  <span>
                    Đúng <b className="text-white">{stats.correct}</b>/{stats.total} ({accuracy}%)
                  </span>
                  <span>
                    Kỷ lục <b className="text-white">{best}</b>
                  </span>
                </div>
                <Button onClick={start} className="mt-1 rounded-xl">
                  <RotateCcw className="mr-1.5 h-4 w-4" />
                  Chơi lại
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {phase === "playing" && card && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={typed}
              onChange={(e) => onType(e.target.value)}
              placeholder="Gõ cách đọc / đáp án…"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              className={`h-11 flex-1 rounded-xl border bg-card px-4 text-base text-foreground outline-none transition ${
                reveal
                  ? "border-rose-300"
                  : wrong
                    ? "border-amber-300"
                    : "border-border focus:border-primary/50"
              }`}
            />
            <Button variant="outline" className="h-11 rounded-xl" onClick={giveUp}>
              Bỏ qua
            </Button>
          </div>
          {reveal ? (
            <p className="text-center text-sm text-rose-600">Đáp án: {reveal}</p>
          ) : (
            card.hint && (
              <p className="text-center text-xs text-muted-foreground">Gợi ý: {card.hint}</p>
            )
          )}
          <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Zap className="h-3.5 w-3.5" />
            Gõ càng nhanh, combo càng cao — cá mập càng bị đẩy xa.
          </p>
        </div>
      )}
    </div>
  );
};

function buildShark(): { shark: Container; tail: Graphics } {
  const shark = new Container();

  const tail = new Graphics();
  tail.poly([-52, 0, -78, -22, -72, 0, -78, 22]).fill(0x51697f);
  tail.x = -8;
  shark.addChild(tail);

  const body = new Graphics();
  body.ellipse(0, 0, 58, 27).fill(0x6b7f95);
  body.ellipse(6, 10, 46, 14).fill({ color: 0xc5d4e0, alpha: 0.9 });
  body.poly([-6, -26, 20, -26, 2, -50]).fill(0x51697f);
  body.poly([-4, 18, 18, 18, -6, 40]).fill(0x51697f);
  shark.addChild(body);

  const head = new Graphics();
  head.poly([40, 6, 62, 2, 44, 20]).fill(0x2b3a49);
  for (let i = 0; i < 4; i++) {
    head.poly([42 + i * 5, 8, 46 + i * 5, 8, 44 + i * 5, 14]).fill(0xffffff);
  }
  head.circle(30, -8, 5).fill(0xffffff);
  head.circle(31, -8, 2.5).fill(0x1b2733);
  for (let i = 0; i < 3; i++) {
    head
      .moveTo(8 + i * 7, -12)
      .lineTo(4 + i * 7, 10)
      .stroke({ color: 0x51697f, width: 2 });
  }
  shark.addChild(head);

  return { shark, tail };
}

function buildFish(): Container {
  const fish = new Container();
  const g = new Graphics();
  g.poly([16, 0, 34, -14, 30, 0, 34, 14]).fill(0xf59e42);
  g.ellipse(0, 0, 22, 15).fill(0xf7b267);
  g.poly([-2, -12, 12, -12, -6, -24]).fill(0xf59e42);
  g.circle(-12, -3, 4).fill(0xffffff);
  g.circle(-13, -3, 2).fill(0x1b2733);
  fish.addChild(g);
  return fish;
}

export default KanaSharkGame;
