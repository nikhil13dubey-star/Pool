"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { EMOJI_DECK } from "@/lib/games/emoji-deck";
import { TABOO_DECKS } from "@/lib/games/taboo-decks";
import {
  DEFAULT_SETTINGS,
  type GameId,
  type GameSettings,
  type Team,
} from "@/lib/games/types";

type Phase =
  | "home"
  | "teams"
  | "settings"
  | "deck"
  | "handoff"
  | "ready"
  | "play"
  | "summary"
  | "winner";
interface Card {
  id: string;
  emoji?: string;
  answer?: string;
  target?: string;
  banned?: string[];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function GamesClient({ memberNames }: { memberNames: string[] }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("home");
  const [game, setGame] = useState<GameId>("emoji");
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [deckKey, setDeckKey] = useState<string>("mixed");
  const [teams, setTeams] = useState<Team[]>([
    { name: "Team 1", score: 0 },
    { name: "Team 2", score: 0 },
  ]);

  // session
  const [turnIndex, setTurnIndex] = useState(0);
  const [turnsTaken, setTurnsTaken] = useState(0);
  const [pool, setPool] = useState<Card[]>([]);
  const [idx, setIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [skipsUsed, setSkipsUsed] = useState(0);
  const [roundPoints, setRoundPoints] = useState(0);
  const [fouls, setFouls] = useState(0);
  const [reveal, setReveal] = useState(false);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);

  // seed teams from trip members (split alternately)
  function seedFromTrip() {
    const t: Team[] = [
      { name: "Team 1", score: 0 },
      { name: "Team 2", score: 0 },
    ];
    setTeams(t);
  }

  const buildPool = useCallback((): Card[] => {
    if (game === "emoji")
      return shuffle(
        EMOJI_DECK.map((c) => ({ id: c.id, emoji: c.emoji, answer: c.answer })),
      );
    const decks =
      deckKey === "mixed" ? TABOO_DECKS : TABOO_DECKS.filter((d) => d.key === deckKey);
    const all = decks.flatMap((d) => d.cards);
    return shuffle(all.map((c) => ({ id: c.id, target: c.target, banned: c.banned })));
  }, [game, deckKey]);

  function startGame() {
    setTeams((ts) => ts.map((t) => ({ ...t, score: 0 })));
    setTurnIndex(0);
    setTurnsTaken(0);
    setPool(buildPool());
    setIdx(0);
    setPhase("handoff");
  }

  function beginTurn() {
    setTimeLeft(settings.timer);
    setSkipsUsed(0);
    setRoundPoints(0);
    setFouls(0);
    setReveal(false);
    setPhase("ready");
  }

  // countdown 3-2-1 then play
  const [count, setCount] = useState(3);
  useEffect(() => {
    if (phase !== "ready") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCount(3);
    let c = 3;
    const t = setInterval(() => {
      c -= 1;
      if (c <= 0) {
        clearInterval(t);
        setPhase("play");
      } else setCount(c);
    }, 700);
    return () => clearInterval(t);
  }, [phase]);

  // round timer
  useEffect(() => {
    if (phase !== "play") return;
    tick.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (tick.current) clearInterval(tick.current);
          setPhase("summary");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (tick.current) clearInterval(tick.current);
    };
  }, [phase]);

  const card = pool.length ? pool[idx % pool.length] : null;
  const next = () => {
    setReveal(false);
    setIdx((i) => i + 1);
  };

  function gotIt() {
    setTeams((ts) =>
      ts.map((t, i) => (i === turnIndex ? { ...t, score: t.score + 1 } : t)),
    );
    setRoundPoints((p) => p + 1);
    next();
  }
  function pass() {
    if (skipsUsed >= settings.skips) return;
    setSkipsUsed((s) => s + 1);
    next();
  }
  function buzz() {
    setFouls((f) => f + 1);
    if (settings.penalty) {
      setTeams((ts) =>
        ts.map((t, i) => (i === turnIndex ? { ...t, score: t.score - 1 } : t)),
      );
      setRoundPoints((p) => p - 1);
    }
    next();
  }

  // advance after a round summary
  function afterSummary() {
    const taken = turnsTaken + 1;
    setTurnsTaken(taken);
    const totalTurns = settings.rounds * teams.length;
    const targetHit =
      settings.mode === "target" && teams.some((t) => t.score >= settings.target);
    const roundsDone = settings.mode === "rounds" && taken >= totalTurns;
    if (targetHit || roundsDone) {
      setPhase("winner");
    } else {
      setTurnIndex(taken % teams.length);
      setPhase("handoff");
    }
  }

  const sorted = useMemo(() => [...teams].sort((a, b) => b.score - a.score), [teams]);
  const winner = sorted[0];
  const tie = sorted.length > 1 && sorted[0].score === sorted[1].score;

  // ── shells ──
  const shell = (children: React.ReactNode) => (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        paddingTop: "env(safe-area-inset-top)",
      }}
    >
      {children}
    </div>
  );

  // HOME — normal page (keeps the tab bar visible); gameplay goes full-screen
  if (phase === "home")
    return (
      <div
        style={{
          padding: "16px 18px 130px",
          display: "flex",
          flexDirection: "column",
          minHeight: "100svh",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, minHeight: 44 }}>
          <button onClick={() => router.back()} style={iconBtn}>
            <Chevron />
          </button>
          <span style={{ fontSize: 17, fontWeight: 600 }}>Trip Games</span>
        </div>
        <p style={{ color: "var(--muted)", fontSize: 14, margin: "4px 0 18px" }}>
          One phone, passed around. Team vs team. Fully offline.
        </p>
        <button
          className="gcard-game"
          onClick={() => {
            setGame("emoji");
            seedFromTrip();
            setPhase("teams");
          }}
        >
          <div style={{ fontSize: 40 }}>🎬</div>
          <div>
            <div style={gTitle}>Bollywood Emoji</div>
            <div style={gSub}>Decode the emoji → name the film</div>
          </div>
        </button>
        <button
          className="gcard-game"
          onClick={() => {
            setGame("taboo");
            seedFromTrip();
            setPhase("teams");
          }}
        >
          <div style={{ fontSize: 40 }}>🙊</div>
          <div>
            <div style={gTitle}>Desi Taboo</div>
            <div style={gSub}>Describe it without the banned words</div>
          </div>
        </button>
      </div>
    );

  // TEAMS
  if (phase === "teams")
    return shell(
      <Scroll
        title="Teams"
        onBack={() => setPhase("home")}
        cta="Next"
        onCta={() => setPhase("settings")}
      >
        <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 14 }}>
          Split into 2 teams. {memberNames.length > 0 ? "Your trip members:" : ""}
        </p>
        {memberNames.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
            {memberNames.map((n) => (
              <span key={n} className="chip">
                {n}
              </span>
            ))}
          </div>
        )}
        {teams.map((t, i) => (
          <input
            key={i}
            className="input"
            style={{ marginBottom: 10 }}
            value={t.name}
            onChange={(e) =>
              setTeams((ts) =>
                ts.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)),
              )
            }
            maxLength={20}
          />
        ))}
        <p style={{ color: "var(--faint)", fontSize: 13, marginTop: 4 }}>
          Decide who&apos;s on which team out loud — the phone just keeps score.
        </p>
      </Scroll>,
    );

  // SETTINGS
  if (phase === "settings")
    return shell(
      <Scroll
        title="Settings"
        onBack={() => setPhase("teams")}
        cta="Next"
        onCta={() => setPhase(game === "taboo" ? "deck" : "handoff")}
        onCtaAlt={game === "taboo" ? undefined : startGame}
      >
        <Row label="Round timer">
          <Stepper
            value={settings.timer}
            step={15}
            min={30}
            max={120}
            suffix="s"
            onChange={(v) => setSettings((s) => ({ ...s, timer: v }))}
          />
        </Row>
        <Row label="Rounds / team">
          <Stepper
            value={settings.rounds}
            step={1}
            min={1}
            max={10}
            onChange={(v) => setSettings((s) => ({ ...s, rounds: v }))}
          />
        </Row>
        <Row label="Skips / round">
          <Stepper
            value={settings.skips}
            step={1}
            min={0}
            max={9}
            onChange={(v) => setSettings((s) => ({ ...s, skips: v }))}
          />
        </Row>
        {game === "taboo" && (
          <Row label="Penalty on buzz (−1)">
            <Toggle
              on={settings.penalty}
              onClick={() => setSettings((s) => ({ ...s, penalty: !s.penalty }))}
            />
          </Row>
        )}
      </Scroll>,
    );

  // DECK (taboo)
  if (phase === "deck")
    return shell(
      <Scroll
        title="Pick a deck"
        onBack={() => setPhase("settings")}
        cta="Start game"
        onCta={startGame}
      >
        <button
          className={`deck-row${deckKey === "mixed" ? " on" : ""}`}
          onClick={() => setDeckKey("mixed")}
        >
          <span style={{ flex: 1 }}>🎲 Mixed (all decks)</span>
          <span className="muted">
            {TABOO_DECKS.reduce((n, d) => n + d.cards.length, 0)}
          </span>
        </button>
        {TABOO_DECKS.map((d) => (
          <button
            key={d.key}
            className={`deck-row${deckKey === d.key ? " on" : ""}`}
            onClick={() => setDeckKey(d.key)}
          >
            <span style={{ flex: 1 }}>{d.name}</span>
            <span className="muted">{d.cards.length}</span>
          </button>
        ))}
      </Scroll>,
    );

  // HANDOFF
  if (phase === "handoff")
    return shell(
      <div style={center}>
        <div
          style={{
            fontSize: 13,
            letterSpacing: ".12em",
            textTransform: "uppercase",
            color: "var(--muted)",
          }}
        >
          Pass the phone to
        </div>
        <div
          style={{
            fontSize: 40,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            margin: "10px 0 6px",
            textAlign: "center",
          }}
        >
          {teams[turnIndex].name}
        </div>
        {game === "taboo" && !settings.honour && (
          <div
            style={{
              color: "var(--muted)",
              fontSize: 14,
              textAlign: "center",
              maxWidth: 280,
            }}
          >
            One player from the other team watches the screen to catch banned words.
          </div>
        )}
        <button
          className="btn btn-primary"
          style={{ maxWidth: 280, marginTop: 30 }}
          onClick={beginTurn}
        >
          We&apos;re ready
        </button>
      </div>,
    );

  // READY countdown
  if (phase === "ready")
    return shell(
      <div style={center}>
        <div style={{ fontSize: 120, fontWeight: 800, color: "var(--accent)" }}>
          {count}
        </div>
      </div>,
    );

  // PLAY
  if (phase === "play" && card)
    return shell(
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 20px",
          }}
        >
          <span style={{ color: "var(--muted)", fontWeight: 600 }}>
            {teams[turnIndex].name} · {roundPoints}
          </span>
          <span
            className="num"
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: timeLeft <= 10 ? "var(--neg)" : "var(--ink)",
            }}
          >
            {timeLeft}s
          </span>
          <span style={{ color: "var(--muted)", fontSize: 14 }}>
            skips {settings.skips - skipsUsed}
          </span>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 24px",
            textAlign: "center",
          }}
        >
          {game === "emoji" ? (
            <>
              <div style={{ fontSize: 72, lineHeight: 1.3 }}>{card.emoji}</div>
              {reveal && (
                <div
                  style={{
                    marginTop: 18,
                    fontSize: 22,
                    fontWeight: 700,
                    color: "var(--accent)",
                  }}
                >
                  {card.answer}
                </div>
              )}
              <button
                className="btn-text"
                style={{ marginTop: 16 }}
                onClick={() => setReveal((r) => !r)}
              >
                {reveal ? "Hide" : "Reveal answer"}
              </button>
            </>
          ) : (
            <>
              <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.02em" }}>
                {card.target}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  marginTop: 22,
                }}
              >
                {card.banned?.map((b) => (
                  <div
                    key={b}
                    style={{ fontSize: 18, color: "var(--neg)", fontWeight: 600 }}
                  >
                    {b}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div
          style={{
            padding: "0 18px calc(20px + env(safe-area-inset-bottom))",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {game === "taboo" && (
            <button
              className="btn"
              style={{ background: "rgba(255,90,70,0.14)", color: "#ff7a5c" }}
              onClick={buzz}
            >
              🚨 Buzz — banned word!
            </button>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn btn-ghost"
              style={{ flex: 1 }}
              onClick={pass}
              disabled={skipsUsed >= settings.skips}
            >
              Pass
            </button>
            <button className="btn btn-primary" style={{ flex: 2 }} onClick={gotIt}>
              Got it ✓
            </button>
          </div>
        </div>
      </div>,
    );

  // SUMMARY
  if (phase === "summary")
    return shell(
      <div style={center}>
        <div className="cap">{teams[turnIndex].name} scored</div>
        <div style={{ fontSize: 72, fontWeight: 800, color: "var(--accent)" }}>
          {roundPoints}
        </div>
        {game === "taboo" && fouls > 0 && (
          <div style={{ color: "var(--neg)" }}>
            {fouls} foul{fouls > 1 ? "s" : ""}
          </div>
        )}
        <div
          className="card"
          style={{ width: "100%", maxWidth: 320, marginTop: 24, padding: "6px 0" }}
        >
          {sorted.map((t) => (
            <div key={t.name} className="row">
              <span style={{ flex: 1 }}>{t.name}</span>
              <span className="num" style={{ fontWeight: 700 }}>
                {t.score}
              </span>
            </div>
          ))}
        </div>
        <button
          className="btn btn-primary"
          style={{ maxWidth: 320, marginTop: 24 }}
          onClick={afterSummary}
        >
          Continue
        </button>
      </div>,
    );

  // WINNER
  if (phase === "winner")
    return shell(
      <div style={center}>
        <div style={{ fontSize: 64 }}>🏆</div>
        <div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>
          {tie ? "It's a tie!" : `${winner.name} win!`}
        </div>
        <div
          className="card"
          style={{ width: "100%", maxWidth: 320, marginTop: 22, padding: "6px 0" }}
        >
          {sorted.map((t) => (
            <div key={t.name} className="row">
              <span style={{ flex: 1 }}>{t.name}</span>
              <span className="num" style={{ fontWeight: 700 }}>
                {t.score}
              </span>
            </div>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 24,
            width: "100%",
            maxWidth: 320,
          }}
        >
          <button
            className="btn btn-ghost"
            style={{ flex: 1 }}
            onClick={() => setPhase("home")}
          >
            New game
          </button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={startGame}>
            Rematch
          </button>
        </div>
      </div>,
    );

  return shell(
    <div style={center}>
      <span className="muted">Loading…</span>
    </div>,
  );
}

/* ── small UI helpers ── */
const iconBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  display: "flex",
};
const center: React.CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
  gap: 6,
};
const gTitle: React.CSSProperties = { fontSize: 19, fontWeight: 700 };
const gSub: React.CSSProperties = { fontSize: 13, color: "var(--muted)", marginTop: 2 };

function Chevron() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--accent)"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function Scroll({
  title,
  onBack,
  cta,
  onCta,
  onCtaAlt,
  children,
}: {
  title: string;
  onBack: () => void;
  cta: string;
  onCta: () => void;
  onCtaAlt?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "16px 18px 8px",
          minHeight: 44,
        }}
      >
        <button onClick={onBack} style={iconBtn}>
          <Chevron />
        </button>
        <span style={{ fontSize: 17, fontWeight: 600 }}>{title}</span>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 18px" }}>{children}</div>
      <div style={{ padding: "12px 18px calc(16px + env(safe-area-inset-bottom))" }}>
        <button className="btn btn-primary" onClick={onCtaAlt ?? onCta}>
          {cta}
        </button>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 0",
        borderBottom: "1px solid var(--stroke)",
      }}
    >
      <span style={{ fontSize: 16 }}>{label}</span>
      {children}
    </div>
  );
}

function Stepper({
  value,
  step,
  min,
  max,
  suffix,
  onChange,
}: {
  value: number;
  step: number;
  min: number;
  max: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  const btn: React.CSSProperties = {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.08)",
    border: "none",
    color: "var(--ink)",
    fontSize: 18,
    cursor: "pointer",
  };
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <button style={btn} onClick={() => onChange(Math.max(min, value - step))}>
        −
      </button>
      <span
        className="num"
        style={{ minWidth: 44, textAlign: "center", fontWeight: 700 }}
      >
        {value}
        {suffix ?? ""}
      </span>
      <button style={btn} onClick={() => onChange(Math.min(max, value + step))}>
        +
      </button>
    </span>
  );
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 46,
        height: 28,
        borderRadius: 99,
        border: "none",
        cursor: "pointer",
        background: on ? "var(--accent)" : "rgba(255,255,255,0.15)",
        position: "relative",
        transition: "background .15s",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: on ? 21 : 3,
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: "#fff",
          transition: "left .15s",
        }}
      />
    </button>
  );
}
