"use client";

interface PinPadProps {
  value: string;
  onChange: (v: string) => void;
  length?: number;
  error?: boolean;
}

export function PinPad({ value, onChange, length = 4, error }: PinPadProps) {
  function press(d: string) {
    if (value.length < length) onChange(value + d);
  }
  function back() {
    onChange(value.slice(0, -1));
  }

  return (
    <div>
      <div className="pin-dots" style={error ? { animation: "shake .3s" } : undefined}>
        {Array.from({ length }).map((_, i) => (
          <span key={i} className={i < value.length ? "filled" : ""} />
        ))}
      </div>

      <div className="keypad" style={{ marginTop: 36 }}>
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <div key={d} className="key" onClick={() => press(d)}>
            {d}
          </div>
        ))}
        <div />
        <div className="key" onClick={() => press("0")}>
          0
        </div>
        <div className="key" onClick={back} aria-label="Delete">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 5H9L3 12l6 7h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1z" />
            <path d="M18 9l-5 6M13 9l5 6" />
          </svg>
        </div>
      </div>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}`}</style>
    </div>
  );
}
