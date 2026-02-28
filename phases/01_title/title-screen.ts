import * as PIXI from "pixi.js";

/**
 * DUDAEL — Title Screen (PixiJS)
 * Canvas/WebGL via Pixi Application.
 *
 * Notes:
 * - This is intentionally “one file” so you can refactor into your architecture later.
 * - No external assets required. All procedural.
 */

type Phase =
  | "IDLE"
  | "ASH"
  | "SEEP"
  | "HOLD"
  | "SPARK_RUN"
  | "INHALE"
  | "IMPLODE"
  | "DOT_DROP"
  | "DONE";

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOutQuad = (t: number) => 1 - (1 - t) * (1 - t);

function colorLerp(a: number, b: number, t: number) {
  const ar = (a >> 16) & 0xff,
    ag = (a >> 8) & 0xff,
    ab = a & 0xff;
  const br = (b >> 16) & 0xff,
    bg = (b >> 8) & 0xff,
    bb = b & 0xff;
  const rr = Math.round(lerp(ar, br, t));
  const rg = Math.round(lerp(ag, bg, t));
  const rb = Math.round(lerp(ab, bb, t));
  return (rr << 16) | (rg << 8) | rb;
}

function nowMs() {
  return performance.now();
}

/** Hook: swap this to WebAudio or your SFX system */
function bellChime() {
  // Minimal placeholder: console + tiny “tick” using WebAudio if available.
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = 880; // A5-ish (bright)
    g.gain.value = 0.0001;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    const t0 = ctx.currentTime;
    g.gain.exponentialRampToValueAtTime(0.35, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.9);
    o.stop(t0 + 1.0);
  } catch {
    // no-op
  }
}

/** Your world transition hook */
function onEnterDudael() {
  console.log(">> Entering Dudael...");
  // e.g. router.navigate("/dudael") or startGame()
}

async function boot() {
  // App
  const app = new PIXI.Application();
  await app.init({
    resizeTo: window,
    antialias: true,
    backgroundAlpha: 1,
    powerPreference: "high-performance",
  });
  document.body.style.margin = "0";
  document.body.style.overflow = "hidden";
  document.body.appendChild(app.canvas);

  // Root container
  const root = new PIXI.Container();
  app.stage.addChild(root);

  // Constants
  const COLORS = {
    stoneA: 0x7a7a7a, // center gray
    stoneB: 0x5f5f5f, // edge gray
    vignette: 0x1b1b1b,
    ash: 0x3d3d3d,
    blood: 0x3a0b0b, // blackened red
    gold: 0xb08a2b, // deep dark gold
    goldHot: 0xf5d47a, // flare gold
    white: 0xffffff,
    black: 0x000000,
  };

  // ===== Background: vertical gradient + subtle “condensation” noise =====
  const bg = new PIXI.Sprite(PIXI.Texture.WHITE);
  bg.anchor.set(0);
  bg.tint = 0xffffff;
  root.addChild(bg);

  // Gradient via custom texture drawn to canvas
  function makeVerticalGradientTexture(w: number, h: number) {
    const c = document.createElement("canvas");
    c.width = Math.max(2, Math.floor(w));
    c.height = Math.max(2, Math.floor(h));
    const g = c.getContext("2d")!;
    const grad = g.createLinearGradient(0, 0, 0, c.height);
    // lighter in the center band, darker edges
    grad.addColorStop(0.0, "#5c5c5c");
    grad.addColorStop(0.45, "#7b7b7b");
    grad.addColorStop(0.55, "#7b7b7b");
    grad.addColorStop(1.0, "#4f4f4f");
    g.fillStyle = grad;
    g.fillRect(0, 0, c.width, c.height);

    // add subtle grain
    const img = g.getImageData(0, 0, c.width, c.height);
    for (let i = 0; i < img.data.length; i += 4) {
      const n = (Math.random() - 0.5) * 10; // tiny noise
      img.data[i] = clamp01((img.data[i] + n) / 255) * 255;
      img.data[i + 1] = clamp01((img.data[i + 1] + n) / 255) * 255;
      img.data[i + 2] = clamp01((img.data[i + 2] + n) / 255) * 255;
    }
    g.putImageData(img, 0, 0);

    return PIXI.Texture.from(c);
  }

  let gradTex = makeVerticalGradientTexture(window.innerWidth, window.innerHeight);
  bg.texture = gradTex;

  // Condensation noise overlay (animated alpha drift)
  const fog = new PIXI.Graphics();
  root.addChild(fog);

  // Vignette overlay
  const vignette = new PIXI.Graphics();
  root.addChild(vignette);

  // ===== Frame bars (UI architecture) =====
  const frame = new PIXI.Container();
  root.addChild(frame);

  const bars = {
    top: new PIXI.Graphics(),
    right: new PIXI.Graphics(),
    bottom: new PIXI.Graphics(),
    left: new PIXI.Graphics(),
  };
  frame.addChild(bars.top, bars.right, bars.bottom, bars.left);

  // Letters embedded in bars
  const lettersLayer = new PIXI.Container();
  frame.addChild(lettersLayer);

  // Make a margin “glyph strip” along each bar
  type Glyph = {
    text: PIXI.Text;
    edge: "top" | "right" | "bottom" | "left";
    tEdge: number; // 0..1 along that edge
    baseTint: number;
    flare: number; // 0..1
    seep: number; // 0..1
  };
  const glyphs: Glyph[] = [];

  // ===== Ash stroke =====
  const ashStroke = new PIXI.Graphics();
  root.addChild(ashStroke);

  // ===== Spark + trail =====
  const sparkLayer = new PIXI.Container();
  root.addChild(sparkLayer);

  const trail = new PIXI.Graphics();
  sparkLayer.addChild(trail);

  const spark = new PIXI.Graphics();
  sparkLayer.addChild(spark);

  // ===== Inhale / implosion overlays =====
  const whiteWash = new PIXI.Sprite(PIXI.Texture.WHITE);
  whiteWash.alpha = 0;
  whiteWash.tint = COLORS.white;
  root.addChild(whiteWash);

  const blackCover = new PIXI.Sprite(PIXI.Texture.WHITE);
  blackCover.alpha = 0;
  blackCover.tint = COLORS.black;
  root.addChild(blackCover);

  // Implosion dot
  const dot = new PIXI.Graphics();
  dot.visible = false;
  root.addChild(dot);

  // ===== Timeline state =====
  let phase: Phase = "IDLE";
  let phaseT0 = nowMs();

  function setPhase(p: Phase) {
    phase = p;
    phaseT0 = nowMs();
  }

  // Timing (tweak freely)
  const TIMING = {
    idle: 350,
    ash: 800,
    seep: 1200,
    hold: 350,
    sparkRun: 2400,
    inhale: 450,
    implode: 700,
    dotDrop: 900,
  };

  // Frame geometry
  let W = window.innerWidth;
  let H = window.innerHeight;

  const BAR = {
    thickness: 56,
    inset: 0,
  };

  // Spark path perimeter points helper
  function edgePoint(edgeT: number) {
    // edgeT 0..1 around rectangle perimeter clockwise starting at top-left corner seam
    // segments: top (0..0.25), right (0.25..0.5), bottom (0.5..0.75), left (0.75..1)
    const t = edgeT % 1;
    const x0 = BAR.inset;
    const y0 = BAR.inset;
    const x1 = W - BAR.inset;
    const y1 = H - BAR.inset;

    if (t < 0.25) {
      const u = t / 0.25;
      return { x: lerp(x0, x1, u), y: y0 };
    } else if (t < 0.5) {
      const u = (t - 0.25) / 0.25;
      return { x: x1, y: lerp(y0, y1, u) };
    } else if (t < 0.75) {
      const u = (t - 0.5) / 0.25;
      return { x: lerp(x1, x0, u), y: y1 };
    } else {
      const u = (t - 0.75) / 0.25;
      return { x: x0, y: lerp(y1, y0, u) };
    }
  }

  function rebuild() {
    W = window.innerWidth;
    H = window.innerHeight;

    // Resize sprites
    bg.width = W;
    bg.height = H;

    whiteWash.width = W;
    whiteWash.height = H;

    blackCover.width = W;
    blackCover.height = H;

    // Rebuild gradient texture
    gradTex.destroy(true);
    gradTex = makeVerticalGradientTexture(W, H);
    bg.texture = gradTex;

    // Bars
    const t = BAR.thickness;
    bars.top.clear().rect(0, 0, W, t).fill({ color: 0x2a2a2a, alpha: 0.55 });
    bars.bottom
      .clear()
      .rect(0, H - t, W, t)
      .fill({ color: 0x2a2a2a, alpha: 0.55 });
    bars.left.clear().rect(0, 0, t, H).fill({ color: 0x2a2a2a, alpha: 0.55 });
    bars.right
      .clear()
      .rect(W - t, 0, t, H)
      .fill({ color: 0x2a2a2a, alpha: 0.55 });

    // Vignette (soft)
    vignette.clear();
    // Layered rectangles for a cheap vignette
    const steps = 16;
    for (let i = 0; i < steps; i++) {
      const pad = (i / steps) * 140;
      const a = (i / steps) * 0.12;
      vignette
        .rect(pad, pad, W - pad * 2, H - pad * 2)
        .stroke({ width: 2, color: COLORS.vignette, alpha: a });
    }

    // Fog redraw
    fog.clear();
    // A few translucent blobs that we’ll drift in update
    for (let i = 0; i < 24; i++) {
      const r = 80 + Math.random() * 220;
      const x = Math.random() * W;
      const y = Math.random() * H;
      const a = 0.015 + Math.random() * 0.02;
      fog.circle(x, y, r).fill({ color: 0xffffff, alpha: a });
    }

    // Ash stroke
    ashStroke.clear();
    const y = H * 0.5;
    const xStart = W * 0.22;
    const xEnd = W * 0.78;
    const len = xEnd - xStart;
    const thickness = 14;

    // Build a “finger dragged through ash” band using segments
    const segs = 60;
    for (let i = 0; i < segs; i++) {
      const u0 = i / segs;
      const u1 = (i + 1) / segs;
      const x0 = xStart + len * u0;
      const x1 = xStart + len * u1;

      // Taper out to almost nothing
      const taper = 1 - Math.pow(u0, 1.8);
      const jitter = (Math.random() - 0.5) * 2.5;
      const h = thickness * taper + jitter;

      // Uneven alpha patches
      const patch = 0.18 + Math.random() * 0.25;
      ashStroke
        .rect(x0, y - h * 0.5, x1 - x0, h)
        .fill({ color: COLORS.ash, alpha: patch });
    }
    ashStroke.alpha = 0; // fade in later

    // Letters
    lettersLayer.removeChildren();
    glyphs.length = 0;

    const font = {
      fontFamily: "IBM Plex Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      fontSize: 18,
      letterSpacing: 2,
      fontWeight: "600",
    };

    // Phrase fragments (you can replace with DUDAEL / lore runes / etc.)
    const topText = "DUDAEL // OPEN BENEATH";
    const sideText = "NAME CARVED INTO WALLS";
    const bottomText = "THE DESCENT BEGINS";

    function placeGlyphsOnEdge(edge: Glyph["edge"], textStr: string, count: number) {
      const chars = textStr.replace(/\s+/g, " ");
      const arr = chars.split("");

      for (let i = 0; i < count; i++) {
        const ch = arr[i % arr.length];
        const tEdge = (i + 1) / (count + 1);

        const txt = new PIXI.Text({
          text: ch,
          style: new PIXI.TextStyle({
            ...font,
            fill: "#2b2b2b", // start hidden in gray
          }),
        });

        txt.alpha = 0.55; // embedded
        txt.rotation = 0;

        const baseTint = 0x2b2b2b;

        const g: Glyph = { text: txt, edge, tEdge, baseTint, flare: 0, seep: 0 };
        glyphs.push(g);
        lettersLayer.addChild(txt);
      }
    }

    placeGlyphsOnEdge("top", topText, 24);
    placeGlyphsOnEdge("right", sideText, 18);
    placeGlyphsOnEdge("bottom", bottomText, 24);
    placeGlyphsOnEdge("left", sideText, 18);

    // Position glyphs along bars
    for (const g of glyphs) {
      const t = BAR.thickness;
      if (g.edge === "top") {
        g.text.x = lerp(t + 12, W - t - 12, g.tEdge);
        g.text.y = 16;
      } else if (g.edge === "bottom") {
        g.text.x = lerp(t + 12, W - t - 12, g.tEdge);
        g.text.y = H - 30;
      } else if (g.edge === "left") {
        g.text.x = 16;
        g.text.y = lerp(t + 12, H - t - 12, g.tEdge);
        g.text.rotation = -Math.PI / 2;
      } else if (g.edge === "right") {
        g.text.x = W - 16;
        g.text.y = lerp(t + 12, H - t - 12, g.tEdge);
        g.text.rotation = Math.PI / 2;
      }
    }

    // Reset spark visuals
    trail.clear();
    spark.clear();
    sparkLayer.alpha = 1;

    dot.clear();
    dot.visible = false;
    dot.y = 0;

    // Reset overlays
    whiteWash.alpha = 0;
    blackCover.alpha = 0;

    // Reset phase
    setPhase("IDLE");
  }

  rebuild();
  window.addEventListener("resize", rebuild);

  // ===== Spark + trail state =====
  const trailPoints: { x: number; y: number; age: number }[] = [];
  const TRAIL_MAX = 100;
  const TRAIL_LIFE = 520; // ms

  // Spark travel
  let sparkT = 0; // 0..1 around perimeter
  let lastSparkT = 0;

  // ===== Animation loop =====
  app.ticker.add(() => {
    const t = nowMs();
    const dt = app.ticker.deltaMS;

    // Fog drift (subtle life)
    fog.alpha = 0.35 + 0.1 * Math.sin(t * 0.0006);

    // Phase time
    const pt = t - phaseT0;

    // Update letters color each frame
    for (const g of glyphs) {
      // seep reveals blood
      const seepTint = colorLerp(g.baseTint, COLORS.blood, g.seep);
      // flare pushes to gold
      const flareTint = colorLerp(seepTint, COLORS.goldHot, g.flare);
      g.text.tint = flareTint;

      // decay flare
      g.flare = Math.max(0, g.flare - dt * 0.0045);
    }

    // Timeline
    if (phase === "IDLE") {
      // Stay dead gray. No ash yet.
      if (pt > TIMING.idle) setPhase("ASH");
    }

    if (phase === "ASH") {
      const k = clamp01(pt / TIMING.ash);
      ashStroke.alpha = easeOutQuad(k) * 0.85; // stroke appears
      if (k >= 1) setPhase("SEEP");
    }

    if (phase === "SEEP") {
      // Letters seep in edge order: top first, then right, bottom, left
      const k = clamp01(pt / TIMING.seep);
      const eased = easeInOutCubic(k);

      for (const g of glyphs) {
        let edgeOffset = 0;
        if (g.edge === "top") edgeOffset = 0.0;
        if (g.edge === "right") edgeOffset = 0.18;
        if (g.edge === "bottom") edgeOffset = 0.38;
        if (g.edge === "left") edgeOffset = 0.58;

        // touch individually like fingers pressing wounds
        const touch = clamp01((eased - edgeOffset - g.tEdge * 0.22) / 0.22);
        g.seep = Math.max(g.seep, touch);
      }

      if (k >= 1) setPhase("HOLD");
    }

    if (phase === "HOLD") {
      // One breath: gray + ash + blood text.
      if (pt > TIMING.hold) {
        // spark ignites at top-left seam
        sparkT = 0.0;
        lastSparkT = sparkT;
        trailPoints.length = 0;
        setPhase("SPARK_RUN");
      }
    }

    if (phase === "SPARK_RUN") {
      const k = clamp01(pt / TIMING.sparkRun);
      // Spark moves around once
      sparkT = k;

      // Position (with jagged jitter)
      const p = edgePoint(sparkT);
      const jitter = 1.2 + 2.6 * Math.sin(t * 0.02);
      const jx = (Math.random() - 0.5) * jitter;
      const jy = (Math.random() - 0.5) * jitter;

      const sx = p.x + jx;
      const sy = p.y + jy;

      // Add to trail
      trailPoints.push({ x: sx, y: sy, age: 0 });
      if (trailPoints.length > TRAIL_MAX) trailPoints.shift();

      // Age trail
      for (const tp of trailPoints) tp.age += dt;

      // Draw trail: black -> gold -> red -> dark (cheap gradient via segments)
      trail.clear();
      for (let i = 1; i < trailPoints.length; i++) {
        const a0 = trailPoints[i - 1];
        const a1 = trailPoints[i];
        const life = 1 - clamp01(a1.age / TRAIL_LIFE);

        // segment color ramp
        const c1 = colorLerp(COLORS.blood, COLORS.gold, life);
        const c2 = colorLerp(COLORS.black, c1, 0.65);

        const width = 1.5 + 5.0 * life;
        trail
          .moveTo(a0.x, a0.y)
          .lineTo(a1.x, a1.y)
          .stroke({ width, color: c2, alpha: 0.65 * life });
      }

      // Draw spark: gold core + white tip
      spark.clear();
      // gold “compressed” dot
      spark.circle(sx, sy, 5.5).fill({ color: COLORS.gold, alpha: 0.95 });
      // dark core
      spark.circle(sx, sy, 2.5).fill({ color: 0x0b0b0b, alpha: 0.95 });
      // white tip “ahead” (directional hint)
      const pAhead = edgePoint(Math.min(1, sparkT + 0.005));
      const dx = pAhead.x - p.x;
      const dy = pAhead.y - p.y;
      const mag = Math.max(0.001, Math.hypot(dx, dy));
      const ux = dx / mag;
      const uy = dy / mag;
      spark.circle(sx + ux * 7, sy + uy * 7, 1.9).fill({ color: COLORS.white, alpha: 0.95 });

      // Letter flare when spark passes near their edge position
      for (const g of glyphs) {
        // Map each glyph to a perimeter t coordinate
        let gt = 0;
        if (g.edge === "top") gt = lerp(0.02, 0.23, g.tEdge);
        if (g.edge === "right") gt = lerp(0.27, 0.48, g.tEdge);
        if (g.edge === "bottom") gt = lerp(0.52, 0.73, g.tEdge);
        if (g.edge === "left") gt = lerp(0.77, 0.98, g.tEdge);

        const dist = Math.abs(gt - sparkT);
        if (dist < 0.012) {
          g.flare = Math.max(g.flare, 1 - dist / 0.012);
          // also “settle darker than before” by slightly increasing seep (deeper blood)
          g.seep = Math.min(1, g.seep + 0.015);
        }
      }

      // As spark heats bars, we slightly brighten the whole scene
      whiteWash.alpha = 0.0 + 0.08 * k;

      if (k >= 1) setPhase("INHALE");
    }

    if (phase === "INHALE") {
      const k = clamp01(pt / TIMING.inhale);
      const e = easeInOutCubic(k);

      // Pull luminance upward (screen inhaling)
      whiteWash.alpha = lerp(0.08, 0.95, e);
      // Ash stroke disappears into brightness
      ashStroke.alpha = lerp(0.85, 0, e);

      // Letters glow toward white briefly
      for (const g of glyphs) {
        g.flare = Math.max(g.flare, 0.7 * e);
        g.seep = Math.min(1, g.seep + 0.004 * e);
      }

      if (k >= 1) {
        // Consecration bell at peak
        bellChime();
        setPhase("IMPLODE");
      }
    }

    if (phase === "IMPLODE") {
      const k = clamp01(pt / TIMING.implode);
      const e = easeInOutCubic(k);

      // Edges go black first: cover increases while white wash collapses
      blackCover.alpha = lerp(0.0, 1.0, e);
      whiteWash.alpha = lerp(0.95, 0.0, e);

      // Shrink everything visually by fading it out while dot emerges
      frame.alpha = lerp(1.0, 0.0, e);
      sparkLayer.alpha = lerp(1.0, 0.0, e);
      fog.alpha = lerp(0.35, 0.0, e);

      // Dot at center where ash stroke was
      dot.visible = true;
      dot.clear();
      const cx = W * 0.5;
      const cy = H * 0.5;

      // compress to smaller-than-pixel feeling: radius shrinks
      const r = lerp(9, 1.2, e);
      dot.circle(cx, cy, r).fill({ color: COLORS.goldHot, alpha: 1.0 });
      dot.circle(cx, cy, r * 0.55).fill({ color: COLORS.white, alpha: 1.0 });

      if (k >= 1) {
        setPhase("DOT_DROP");
        // Prep drop
        dot.y = 0;
      }
    }

    if (phase === "DOT_DROP") {
      const k = clamp01(pt / TIMING.dotDrop);
      const e = easeInOutCubic(k);

      // keep black screen, move dot straight down like a stone into a well
      const cx = W * 0.5;
      const cy = H * 0.5;
      const drop = lerp(0, H * 0.65, e);

      dot.clear();
      dot.circle(cx, cy + drop, 1.6).fill({ color: COLORS.goldHot, alpha: 1.0 });
      dot.circle(cx, cy + drop, 0.9).fill({ color: COLORS.white, alpha: 1.0 });

      // Optional: faint “well” hint (subtle)
      if (k > 0.1) {
        const a = 0.08 * (1 - k);
        dot.circle(cx, cy + drop, 18).stroke({ width: 2, color: COLORS.blood, alpha: a });
      }

      if (k >= 1) {
        setPhase("DONE");
        onEnterDudael();
      }
    }
  });

  // Kick it
  setPhase("IDLE");

  // Optional: click to restart for iteration speed
  window.addEventListener("pointerdown", () => {
    // Reset visuals and replay quickly
    frame.alpha = 1;
    fog.alpha = 0.35;
    sparkLayer.alpha = 1;
    ashStroke.alpha = 0;
    whiteWash.alpha = 0;
    blackCover.alpha = 0;
    dot.visible = false;
    for (const g of glyphs) {
      g.seep = 0;
      g.flare = 0;
      g.text.alpha = 0.55;
      g.baseTint = 0x2b2b2b;
    }
    setPhase("IDLE");
  });
}

boot().catch(console.error);