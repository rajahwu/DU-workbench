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


type EnterHandler = () => void | Promise<void>;

export async function mountTitleScreen(host: HTMLElement, onEnterDudael: EnterHandler = () => {}) {
    const app = new PIXI.Application();

    await app.init({
        resizeTo: host,
        antialias: true,
        backgroundAlpha: 1,
        powerPreference: "high-performance",
    });

    host.style.overflow = "hidden";
    host.appendChild(app.canvas);

    // Root container
    const root = new PIXI.Container();
    app.stage.addChild(root);

    // Constants (define once)
    const COLORS = {
        stoneA: 0x7a7a7a,
        stoneB: 0x5f5f5f,
        vignette: 0x1b1b1b,
        ash: 0x3d3d3d,
        blood: 0x3a0b0b,
        gold: 0xb08a2b,
        goldHot: 0xf5d47a,
        white: 0xffffff,
        black: 0x000000,
    };

    // ===== Helpers =====
    function makeVerticalGradientTexture(w: number, h: number) {
        const c = document.createElement("canvas");
        c.width = Math.max(2, Math.floor(w));
        c.height = Math.max(2, Math.floor(h));
        const g = c.getContext("2d")!;
        const grad = g.createLinearGradient(0, 0, 0, c.height);
        grad.addColorStop(0.0, "#5c5c5c");
        grad.addColorStop(0.45, "#7b7b7b");
        grad.addColorStop(0.55, "#7b7b7b");
        grad.addColorStop(1.0, "#4f4f4f");
        g.fillStyle = grad;
        g.fillRect(0, 0, c.width, c.height);

        const img = g.getImageData(0, 0, c.width, c.height);
        for (let i = 0; i < img.data.length; i += 4) {
            const n = (Math.random() - 0.5) * 10;
            img.data[i] = clamp01((img.data[i] + n) / 255) * 255;
            img.data[i + 1] = clamp01((img.data[i + 1] + n) / 255) * 255;
            img.data[i + 2] = clamp01((img.data[i + 2] + n) / 255) * 255;
        }
        g.putImageData(img, 0, 0);

        return PIXI.Texture.from(c);
    }

    // ===== Create display objects ONCE =====

    // Background
    const bg = new PIXI.Sprite(PIXI.Texture.WHITE);
    bg.anchor.set(0);
    bg.tint = 0xffffff;
    root.addChild(bg);

    let gradTex: PIXI.Texture | null = null;

    // Fog + vignette
    const fog = new PIXI.Graphics();
    root.addChild(fog);

    const vignette = new PIXI.Graphics();
    root.addChild(vignette);

    // Frame bars
    const frame = new PIXI.Container();
    root.addChild(frame);

    const bars = {
        top: new PIXI.Graphics(),
        right: new PIXI.Graphics(),
        bottom: new PIXI.Graphics(),
        left: new PIXI.Graphics(),
    };
    frame.addChild(bars.top, bars.right, bars.bottom, bars.left);

    const lettersLayer = new PIXI.Container();
    frame.addChild(lettersLayer);

    type Glyph = {
        text: PIXI.Text;
        edge: "top" | "right" | "bottom" | "left";
        tEdge: number;
        baseTint: number;
        flare: number;
        seep: number;
    };
    const glyphs: Glyph[] = [];

    // Ash stroke
    const ashStroke = new PIXI.Graphics();
    root.addChild(ashStroke);

    // Spark + trail
    const sparkLayer = new PIXI.Container();
    root.addChild(sparkLayer);

    const trail = new PIXI.Graphics();
    const spark = new PIXI.Graphics();
    sparkLayer.addChild(trail, spark);

    // Overlays
    const whiteWash = new PIXI.Sprite(PIXI.Texture.WHITE);
    whiteWash.alpha = 0;
    whiteWash.tint = COLORS.white;
    root.addChild(whiteWash);

    const blackCover = new PIXI.Sprite(PIXI.Texture.WHITE);
    blackCover.alpha = 0;
    blackCover.tint = COLORS.black;
    root.addChild(blackCover);

    const dot = new PIXI.Graphics();
    dot.visible = false;
    root.addChild(dot);

    // ===== Timeline state (define once) =====
    let phase: Phase = "IDLE";
    let phaseT0 = nowMs();

    function setPhase(p: Phase) {
        phase = p;
        phaseT0 = nowMs();
    }

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

    const BAR = { thickness: 56, inset: 0 };

    // Geometry
    let W = Math.max(1, host.clientWidth);
    let H = Math.max(1, host.clientHeight);

    function edgePoint(edgeT: number) {
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

    // ===== Build / Rebuild visuals (no new objects!) =====
    function rebuild() {
        W = Math.max(1, host.clientWidth);
        H = Math.max(1, host.clientHeight);

        // Resize sprites
        bg.width = W;
        bg.height = H;

        whiteWash.width = W;
        whiteWash.height = H;

        blackCover.width = W;
        blackCover.height = H;

        // Gradient texture (replace safely)
        if (gradTex) gradTex.destroy(true);
        gradTex = makeVerticalGradientTexture(W, H);
        bg.texture = gradTex;

        // Bars
        const t = BAR.thickness;
        bars.top.clear().rect(0, 0, W, t).fill({ color: 0x2a2a2a, alpha: 0.55 });
        bars.bottom.clear().rect(0, H - t, W, t).fill({ color: 0x2a2a2a, alpha: 0.55 });
        bars.left.clear().rect(0, 0, t, H).fill({ color: 0x2a2a2a, alpha: 0.55 });
        bars.right.clear().rect(W - t, 0, t, H).fill({ color: 0x2a2a2a, alpha: 0.55 });

        // Vignette
        vignette.clear();
        const steps = 16;
        for (let i = 0; i < steps; i++) {
            const pad = (i / steps) * 140;
            const a = (i / steps) * 0.12;
            vignette.rect(pad, pad, W - pad * 2, H - pad * 2).stroke({
                width: 2,
                color: COLORS.vignette,
                alpha: a,
            });
        }

        // Fog blobs
        fog.clear();
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
        const segs = 60;
        for (let i = 0; i < segs; i++) {
            const u0 = i / segs;
            const u1 = (i + 1) / segs;
            const x0 = xStart + len * u0;
            const x1 = xStart + len * u1;
            const taper = 1 - Math.pow(u0, 1.8);
            const jitter = (Math.random() - 0.5) * 2.5;
            const h = thickness * taper + jitter;
            const patch = 0.18 + Math.random() * 0.25;
            ashStroke.rect(x0, y - h * 0.5, x1 - x0, h).fill({ color: COLORS.ash, alpha: patch });
        }
        ashStroke.alpha = 0;

        // Letters (recreate texts, but only inside rebuild)
        lettersLayer.removeChildren();
        glyphs.length = 0;

        const font = {
            fontFamily:
                "IBM Plex Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            fontSize: 18,
            letterSpacing: 2,
            fontWeight: "bold" as const,
        };

        const topText = "DUDAEL // OPEN BENEATH";
        const sideText = "NAME CARVED INTO WALLS";
        const bottomText = "THE DESCENT BEGINS";

        function placeGlyphsOnEdge(edge: Glyph["edge"], textStr: string, count: number) {
            const arr = textStr.replace(/\s+/g, " ").split("");
            for (let i = 0; i < count; i++) {
                const ch = arr[i % arr.length];
                const tEdge = (i + 1) / (count + 1);
                const txt = new PIXI.Text({
                    text: ch,
                    style: new PIXI.TextStyle({ ...font, fill: "#2b2b2b" }),
                });
                txt.alpha = 0.55;
                const g: Glyph = { text: txt, edge, tEdge, baseTint: 0x2b2b2b, flare: 0, seep: 0 };
                glyphs.push(g);
                lettersLayer.addChild(txt);
            }
        }

        placeGlyphsOnEdge("top", topText, 24);
        placeGlyphsOnEdge("right", sideText, 18);
        placeGlyphsOnEdge("bottom", bottomText, 24);
        placeGlyphsOnEdge("left", sideText, 18);

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
            } else {
                g.text.x = W - 16;
                g.text.y = lerp(t + 12, H - t - 12, g.tEdge);
                g.text.rotation = Math.PI / 2;
            }
        }

        // Reset visuals that depend on size
        trail.clear();
        spark.clear();
        sparkLayer.alpha = 1;
        dot.clear();
        dot.visible = false;
        dot.y = 0;
        whiteWash.alpha = 0;
        blackCover.alpha = 0;

        setPhase("IDLE");
    }

    rebuild();

    // ===== ResizeObserver (host-aware) =====
    const ro = new ResizeObserver(() => rebuild());
    ro.observe(host);

    // ===== Spark/trail state =====
    const trailPoints: { x: number; y: number; age: number }[] = [];
    const TRAIL_MAX = 100;
    const TRAIL_LIFE = 520;

    let sparkT = 0;

    // ===== Pointer restart handler (removable) =====
    const onPointerDown = () => {
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
    };
    
    host.addEventListener("pointerdown", onPointerDown);

    // ===== Animation loop (unchanged, but uses the ONE set of objects) =====
    const tickerFn = () => {
        const t = nowMs();
        const dt = app.ticker.deltaMS;

        fog.alpha = 0.35 + 0.1 * Math.sin(t * 0.0006);

        const pt = t - phaseT0;

        for (const g of glyphs) {
            const seepTint = colorLerp(g.baseTint, COLORS.blood, g.seep);
            const flareTint = colorLerp(seepTint, COLORS.goldHot, g.flare);
            g.text.tint = flareTint;
            g.flare = Math.max(0, g.flare - dt * 0.0045);
        }

        if (phase === "IDLE" && pt > TIMING.idle) setPhase("ASH");

        if (phase === "ASH") {
            const k = clamp01(pt / TIMING.ash);
            ashStroke.alpha = easeOutQuad(k) * 0.85;
            if (k >= 1) setPhase("SEEP");
        }

        if (phase === "SEEP") {
            const k = clamp01(pt / TIMING.seep);
            const eased = easeInOutCubic(k);

            for (const g of glyphs) {
                let edgeOffset = 0;
                if (g.edge === "top") edgeOffset = 0.0;
                if (g.edge === "right") edgeOffset = 0.18;
                if (g.edge === "bottom") edgeOffset = 0.38;
                if (g.edge === "left") edgeOffset = 0.58;

                const touch = clamp01((eased - edgeOffset - g.tEdge * 0.22) / 0.22);
                g.seep = Math.max(g.seep, touch);
            }
            if (k >= 1) setPhase("HOLD");
        }

        if (phase === "HOLD") {
            if (pt > TIMING.hold) {
                sparkT = 0.0;
                trailPoints.length = 0;
                setPhase("SPARK_RUN");
            }
        }

        if (phase === "SPARK_RUN") {
            const k = clamp01(pt / TIMING.sparkRun);
            sparkT = k;

            const p = edgePoint(sparkT);
            const jitter = 1.2 + 2.6 * Math.sin(t * 0.02);
            const sx = p.x + (Math.random() - 0.5) * jitter;
            const sy = p.y + (Math.random() - 0.5) * jitter;

            trailPoints.push({ x: sx, y: sy, age: 0 });
            if (trailPoints.length > TRAIL_MAX) trailPoints.shift();
            for (const tp of trailPoints) tp.age += dt;

            trail.clear();
            for (let i = 1; i < trailPoints.length; i++) {
                const a0 = trailPoints[i - 1];
                const a1 = trailPoints[i];
                const life = 1 - clamp01(a1.age / TRAIL_LIFE);
                const c1 = colorLerp(COLORS.blood, COLORS.gold, life);
                const c2 = colorLerp(COLORS.black, c1, 0.65);
                const width = 1.5 + 5.0 * life;
                trail.moveTo(a0.x, a0.y).lineTo(a1.x, a1.y).stroke({
                    width,
                    color: c2,
                    alpha: 0.65 * life,
                });
            }

            spark.clear();
            spark.circle(sx, sy, 5.5).fill({ color: COLORS.gold, alpha: 0.95 });
            spark.circle(sx, sy, 2.5).fill({ color: 0x0b0b0b, alpha: 0.95 });

            const pAhead = edgePoint(Math.min(1, sparkT + 0.005));
            const dx = pAhead.x - p.x;
            const dy = pAhead.y - p.y;
            const mag = Math.max(0.001, Math.hypot(dx, dy));
            const ux = dx / mag;
            const uy = dy / mag;
            spark.circle(sx + ux * 7, sy + uy * 7, 1.9).fill({ color: COLORS.white, alpha: 0.95 });

            for (const g of glyphs) {
                let gt = 0;
                if (g.edge === "top") gt = lerp(0.02, 0.23, g.tEdge);
                if (g.edge === "right") gt = lerp(0.27, 0.48, g.tEdge);
                if (g.edge === "bottom") gt = lerp(0.52, 0.73, g.tEdge);
                if (g.edge === "left") gt = lerp(0.77, 0.98, g.tEdge);

                const dist = Math.abs(gt - sparkT);
                if (dist < 0.012) {
                    g.flare = Math.max(g.flare, 1 - dist / 0.012);
                    g.seep = Math.min(1, g.seep + 0.015);
                }
            }

            whiteWash.alpha = 0.08 * k;
            if (k >= 1) setPhase("INHALE");
        }

        if (phase === "INHALE") {
            const k = clamp01(pt / TIMING.inhale);
            const e = easeInOutCubic(k);

            whiteWash.alpha = lerp(0.08, 0.95, e);
            ashStroke.alpha = lerp(0.85, 0, e);

            for (const g of glyphs) {
                g.flare = Math.max(g.flare, 0.7 * e);
                g.seep = Math.min(1, g.seep + 0.004 * e);
            }

            if (k >= 1) {
                bellChime();
                setPhase("IMPLODE");
            }
        }

        if (phase === "IMPLODE") {
            const k = clamp01(pt / TIMING.implode);
            const e = easeInOutCubic(k);

            blackCover.alpha = lerp(0.0, 1.0, e);
            whiteWash.alpha = lerp(0.95, 0.0, e);

            frame.alpha = lerp(1.0, 0.0, e);
            sparkLayer.alpha = lerp(1.0, 0.0, e);
            fog.alpha = lerp(0.35, 0.0, e);

            dot.visible = true;
            dot.clear();
            const cx = W * 0.5;
            const cy = H * 0.5;

            const r = lerp(9, 1.2, e);
            dot.circle(cx, cy, r).fill({ color: COLORS.goldHot, alpha: 1.0 });
            dot.circle(cx, cy, r * 0.55).fill({ color: COLORS.white, alpha: 1.0 });

            if (k >= 1) {
                setPhase("DOT_DROP");
                dot.y = 0;
            }
        }

        if (phase === "DOT_DROP") {
            const k = clamp01(pt / TIMING.dotDrop);
            const e = easeInOutCubic(k);

            const cx = W * 0.5;
            const cy = H * 0.5;
            const drop = lerp(0, H * 0.65, e);

            dot.clear();
            dot.circle(cx, cy + drop, 1.6).fill({ color: COLORS.goldHot, alpha: 1.0 });
            dot.circle(cx, cy + drop, 0.9).fill({ color: COLORS.white, alpha: 1.0 });

            if (k > 0.1) {
                const a = 0.08 * (1 - k);
                dot.circle(cx, cy + drop, 18).stroke({ width: 2, color: COLORS.blood, alpha: a });
            }

            if (k >= 1) {
                setPhase("DONE");
                void onEnterDudael();
            }
        }
    };

    app.ticker.add(tickerFn);
    setPhase("IDLE");

    // ✅ Return cleanup for React unmount
    return () => {
        try {
            host.removeEventListener("pointerdown", onPointerDown);
            ro.disconnect();

            app.ticker.remove(tickerFn);
            app.ticker.stop();

            if (gradTex) gradTex.destroy(true);

            app.destroy(true, { children: true, texture: true, textureSource: true });

            if (app.canvas.parentElement === host) {
                host.removeChild(app.canvas);
            }
        } catch {
            // ignore
        }
    };
}

