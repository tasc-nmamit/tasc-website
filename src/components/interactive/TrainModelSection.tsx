"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

interface Point {
  x: number;
  y: number;
  label: 0 | 1;
}

export default function TrainModelSection() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const logRef = useRef<HTMLDivElement | null>(null);

  // State
  const [points, setPoints] = useState<Point[]>([]);
  const [weights, setWeights] = useState<{ w1: number; w2: number; b: number }>({
    w1: 0,
    w2: 0,
    b: 0,
  });
  const [trained, setTrained] = useState<boolean>(false);
  const [activeClass, setActiveClass] = useState<0 | 1>(0);
  const [epochText, setEpochText] = useState<string>("0/60");
  const [accText, setAccText] = useState<string>("—");
  const [levelText, setLevelText] = useState<string>("—");
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [showAchievement, setShowAchievement] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>(["awaiting training data..."]);

  const W = 560;
  const H = 420;

  // Add Log Entry
  const addLog = useCallback((msg: string) => {
    setLogs((prev) => [...prev, msg]);
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  const colorFor = (label: number) => (label === 0 ? "#8B5CF6" : "#C9A15A");

  // Draw Canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const tctx = canvas.getContext("2d");
    if (!tctx) return;

    tctx.clearRect(0, 0, W, H);

    // Grid lines
    tctx.strokeStyle = "rgba(184,164,227,0.06)";
    tctx.lineWidth = 1;
    for (let gx = 0; gx < W; gx += 40) {
      tctx.beginPath();
      tctx.moveTo(gx, 0);
      tctx.lineTo(gx, H);
      tctx.stroke();
    }
    for (let gy = 0; gy < H; gy += 40) {
      tctx.beginPath();
      tctx.moveTo(0, gy);
      tctx.lineTo(W, gy);
      tctx.stroke();
    }

    // Shading for Decision Boundary
    if (trained) {
      for (let px = 0; px < W; px += 4) {
        for (let py = 0; py < H; py += 4) {
          const nx = px / W;
          const ny = 1 - py / H;
          const z = weights.w1 * nx + weights.w2 * ny + weights.b;
          const p = 1 / (1 + Math.exp(-z));
          const isA = p < 0.5;
          const col = isA ? [139, 92, 246] : [201, 161, 90];
          const alpha = Math.abs(p - 0.5) * 70 + 18;
          tctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${alpha / 255})`;
          tctx.fillRect(px, py, 4, 4);
        }
      }
    }

    // Points
    for (const p of points) {
      tctx.beginPath();
      tctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
      tctx.fillStyle = colorFor(p.label);
      tctx.fill();
      tctx.strokeStyle = "rgba(255,255,255,0.5)";
      tctx.lineWidth = 1.5;
      tctx.stroke();
    }
  }, [points, weights, trained]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Canvas Click
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isTraining) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (W / rect.width);
    const y = (e.clientY - rect.top) * (H / rect.height);

    const newPts = [...points, { x, y, label: activeClass }];
    setPoints(newPts);
    setTrained(false);
    setAccText("—");
    setLevelText("—");
    addLog(`point added → class ${activeClass === 0 ? "Alpha" : "Beta"} @ (${Math.round(x)}, ${Math.round(y)})`);
  };

  // Preset Sample Data
  const handleSampleData = () => {
    if (isTraining) return;
    const samplesA = [[0.15, 0.25], [0.22, 0.4], [0.1, 0.55], [0.3, 0.15], [0.35, 0.5]];
    const samplesB = [[0.7, 0.6], [0.8, 0.4], [0.65, 0.75], [0.85, 0.8], [0.6, 0.5]];

    const newPts: Point[] = [];
    samplesA.forEach(([nx, ny]) => newPts.push({ x: nx * W, y: (1 - ny) * H, label: 0 }));
    samplesB.forEach(([nx, ny]) => newPts.push({ x: nx * W, y: (1 - ny) * H, label: 1 }));

    setPoints(newPts);
    setTrained(false);
    setAccText("—");
    setLevelText("—");
    setEpochText("0/60");
    setShowAchievement(false);
    setLogs(["sample dataset loaded (10 points)"]);
  };

  // Reset
  const handleReset = () => {
    if (isTraining) return;
    setPoints([]);
    setTrained(false);
    setWeights({ w1: 0, w2: 0, b: 0 });
    setAccText("—");
    setLevelText("—");
    setEpochText("0/60");
    setShowAchievement(false);
    setLogs(["reset — awaiting training data..."]);
  };

  // Train Model
  const handleTrain = () => {
    if (isTraining) return;
    const countA = points.filter((p) => p.label === 0).length;
    const countB = points.filter((p) => p.label === 1).length;
    if (countA < 2 || countB < 2) {
      addLog("need at least 2 points per class — add more or load sample data");
      return;
    }

    setIsTraining(true);
    setShowAchievement(false);
    addLog("training started (logistic regression, lr=0.5)");

    const data = points.map((p) => ({ x: p.x / W, y: 1 - p.y / H, label: p.label }));
    let curWeights = { w1: Math.random() - 0.5, w2: Math.random() - 0.5, b: 0 };
    const epochs = 60;
    const lr = 0.5;
    let currentEpoch = 0;

    const reduceMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const interval = setInterval(() => {
      currentEpoch++;
      let gw1 = 0, gw2 = 0, gb = 0;
      for (const d of data) {
        const z = curWeights.w1 * d.x + curWeights.w2 * d.y + curWeights.b;
        const pred = 1 / (1 + Math.exp(-z));
        const err = pred - d.label;
        gw1 += err * d.x;
        gw2 += err * d.y;
        gb += err;
      }
      const n = data.length;
      curWeights.w1 -= (lr * gw1) / n;
      curWeights.w2 -= (lr * gw2) / n;
      curWeights.b -= (lr * gb) / n;

      let correct = 0;
      for (const d of data) {
        const z = curWeights.w1 * d.x + curWeights.w2 * d.y + curWeights.b;
        const pred = 1 / (1 + Math.exp(-z)) >= 0.5 ? 1 : 0;
        if (pred === d.label) correct++;
      }

      const acc = Math.round((correct / n) * 100);
      setEpochText(`${currentEpoch}/${epochs}`);
      setAccText(`${acc}%`);
      setWeights({ ...curWeights });
      setTrained(true);

      if (currentEpoch % 15 === 0 || currentEpoch === epochs) {
        addLog(`epoch ${currentEpoch}/${epochs} — accuracy: ${acc}%`);
      }

      if (currentEpoch >= epochs) {
        clearInterval(interval);
        setIsTraining(false);
        const level = acc >= 95 ? "EXPERT" : acc >= 80 ? "INTERMEDIATE" : "NOVICE";
        setLevelText(level);
        addLog(`training complete — final accuracy ${acc}% — level: ${level}`);
        setShowAchievement(true);
      }
    }, reduceMotion ? 0 : 60);
  };

  return (
    <section className="py-24 px-4 md:px-12 relative min-h-[60vh] max-w-7xl mx-auto">
      {/* Header Tag */}
      <div className="flex items-center gap-3 mb-5 font-mono-tech text-xs text-gold uppercase tracking-widest">
        <span className="w-8 h-px bg-gold/60"></span>
        LAYER 03 — TRAINING GROUND
      </div>

      <h2 className="font-space-grotesk text-3xl md:text-5xl font-bold text-foreground mb-4 max-w-2xl leading-tight">
        Train a classifier. <span className="text-gold">Right here.</span>
      </h2>

      <p className="text-muted-foreground text-sm md:text-base max-w-xl mb-12 font-space-grotesk leading-relaxed">
        This is a real, tiny neural network (a single-layer perceptron) running in your browser.
        Drop points for two classes, hit train, and watch it learn a decision boundary — same idea behind everything TASC builds, just small enough to fit on a page.
      </p>

      {/* Trainer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[560px_1fr] gap-10 items-start">
        
        {/* Left Column: Canvas & Overlay HUD */}
        <div className="relative w-full max-w-[560px]">
          <canvas
            ref={canvasRef}
            width={560}
            height={420}
            onClick={handleCanvasClick}
            className="w-full aspect-[560/420] rounded-2xl border border-brand/30 bg-[#120A22]/55 backdrop-blur-md cursor-crosshair block shadow-2xl"
          />

          {/* Absolute HUD Overlay */}
          <div className="absolute top-3 left-3 right-3 flex justify-between font-mono-tech text-xs text-[#B8A4E3] tracking-wider pointer-events-none select-none bg-background/40 backdrop-blur-sm p-2 rounded-lg border border-brand/20">
            <span>EPOCH: {epochText}</span>
            <span>ACC: {accText}</span>
            <span>LEVEL: {levelText}</span>
          </div>
        </div>

        {/* Right Column: Control Panel */}
        <div className="flex flex-col gap-6">
          
          {/* Step 01: Training Data Selection */}
          <div>
            <div className="font-mono-tech text-xs text-gold uppercase tracking-widest mb-3">
              01 · Place training data
            </div>
            <div className="flex gap-2.5 flex-wrap items-center">
              <button
                onClick={() => setActiveClass(0)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border text-xs font-space-grotesk cursor-pointer transition-all ${
                  activeClass === 0
                    ? "border-brand-accent bg-purple-600/15 text-foreground dark:text-white font-semibold shadow-md"
                    : "border-brand/20 text-muted-foreground hover:border-brand/40 hover:text-foreground"
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]"></span>
                Class Alpha
              </button>

              <button
                onClick={() => setActiveClass(1)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border text-xs font-space-grotesk cursor-pointer transition-all ${
                  activeClass === 1
                    ? "border-gold bg-gold/15 text-gold font-semibold shadow-md"
                    : "border-brand/20 text-muted-foreground hover:border-brand/40 hover:text-foreground"
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#C9A15A]"></span>
                Class Beta
              </button>
            </div>
            <p className="text-xs text-muted-foreground font-space-grotesk mt-2.5">
              Pick a class, then click inside the grid to drop points. Add at least 2 of each.
            </p>
          </div>

          {/* Step 02: Run Training */}
          <div>
            <div className="font-mono-tech text-xs text-gold uppercase tracking-widest mb-3">
              02 · Run training
            </div>
            <div className="flex gap-2.5 flex-wrap items-center">
              <button
                onClick={handleTrain}
                disabled={isTraining}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-space-grotesk text-xs font-semibold text-white bg-gradient-to-b from-[#8B5CF6] to-[#5B35A0] border border-brand-accent shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-purple-500/30 disabled:opacity-50 cursor-pointer"
              >
                {isTraining ? "Training..." : "Train Model"}
              </button>

              <button
                onClick={handleSampleData}
                disabled={isTraining}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-space-grotesk text-xs font-semibold text-foreground bg-transparent border border-brand/30 hover:border-brand-accent hover:bg-brand/10 transition-all cursor-pointer disabled:opacity-50"
              >
                Load Sample Data
              </button>

              <button
                onClick={handleReset}
                disabled={isTraining}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-space-grotesk text-xs font-semibold text-muted-foreground bg-transparent border border-brand/20 hover:border-destructive/40 hover:text-destructive transition-all cursor-pointer disabled:opacity-50"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Step 03: System Log */}
          <div>
            <div className="font-mono-tech text-xs text-gold uppercase tracking-widest mb-3">
              03 · System log
            </div>
            <div
              ref={logRef}
              className="bg-background/80 border border-brand/30 rounded-lg p-3.5 font-mono-tech text-xs text-muted-foreground leading-relaxed max-h-[130px] overflow-y-auto space-y-1 scrollbar-thin shadow-inner"
            >
              {logs.map((logMsg, idx) => (
                <div key={idx} className="text-foreground dark:text-[#B8A4E3]">
                  &gt; {logMsg}
                </div>
              ))}
            </div>
          </div>

          {/* Achievement Banner */}
          <div
            className={`flex items-center gap-2.5 p-3 px-4 rounded-lg border border-gold/40 bg-gold/10 text-gold font-mono-tech text-xs transition-all duration-400 ${
              showAchievement ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
            }`}
          >
            <span className="text-base">🏆</span>
            <span>ACHIEVEMENT UNLOCKED — Model Trained</span>
          </div>

        </div>

      </div>
    </section>
  );
}
