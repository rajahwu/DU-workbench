
## High-level structure

- Monorepo with multiple domains; relevant here is the **web/react_app** client that talks to a shared engine in **@du/phases**. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_80eca0cd-d0a8-4d63-9059-e3363aa9eff0/62757fe3-a07e-438d-a5aa-d0434a30de8b/pasted-text.txt)
- The engine is framework‑agnostic; React app is just one shell over it. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_80eca0cd-d0a8-4d63-9059-e3363aa9eff0/dd1d1b6e-4096-4d1a-bd17-035badbb9c43/pasted-text.txt)

***

## RDX‑related locations

- **web/react_app/src/app**
  - `store.ts`: Redux store wiring.
  - `phaseSlice.ts`: owns the current phase, last error, and a meta snapshot from the engine; exposes `requestTransition` thunk that wraps the engine’s `transition` and should become the only way phases move. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_80eca0cd-d0a8-4d63-9059-e3363aa9eff0/dd1d1b6e-4096-4d1a-bd17-035badbb9c43/pasted-text.txt)
  - `runSlice.ts` (to be added/extended): holds the persistent run state (`RunLedger`): runner, gate lock, depth, alignment, inventory, loop count, etc.

- **phases/**
  - `types.ts`: defines `PhaseId`, packet types (moving to `PhaseWallPacket`), alignment, Gate types, etc. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_80eca0cd-d0a8-4d63-9059-e3363aa9eff0/dd1d1b6e-4096-4d1a-bd17-035badbb9c43/pasted-text.txt)
  - `manager.ts`: engine’s `transition` function and legality map; applies run‑meta side effects (depth, loop, identity lock) via `meta.ts`. This is pure and does not own current phase. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_80eca0cd-d0a8-4d63-9059-e3363aa9eff0/dd1d1b6e-4096-4d1a-bd17-035badbb9c43/pasted-text.txt)
  - `meta.ts`: holds the engine‑side run snapshot (`RunMetaSnapshot`), with helpers like `getRunMeta`, `incDepth`, `incLoop`, `lockIdentity`, `pushPhase`; also `restoreSnapshot`/`hydrateFromSnapshot` for recovery. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_80eca0cd-d0a8-4d63-9059-e3363aa9eff0/dd1d1b6e-4096-4d1a-bd17-035badbb9c43/pasted-text.txt)

- **web/react_app/src/weblite_game/pages/phases/**
  - `01_title/*`: TitleShell and TitleScreen; entry handshake, user → run seed, then calls `requestTransition` (via a packet today, moving to PhaseWall). [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_80eca0cd-d0a8-4d63-9059-e3363aa9eff0/62757fe3-a07e-438d-a5aa-d0434a30de8b/pasted-text.txt)
  - `02_select/*`: SelectShell and SelectScreen; handles Guide/Mode/Vessel sub‑steps, then locks Gate and advances to Staging. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_80eca0cd-d0a8-4d63-9059-e3363aa9eff0/62757fe3-a07e-438d-a5aa-d0434a30de8b/pasted-text.txt)
  - Other phases (`03_staging`, `04_draft`, `05_level`, `06_door`, `07_drop`) use the same pattern: Shell does wiring and calls `requestTransition`, Screen is mostly presentational.

***

## How to inspect behavior

1. **Follow the loop via phaseSlice → manager → meta**
   - Start in `phaseSlice.requestTransition(...)` to see how the UI asks to move from one phase to another. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_80eca0cd-d0a8-4d63-9059-e3363aa9eff0/dd1d1b6e-4096-4d1a-bd17-035badbb9c43/pasted-text.txt)
   - Look at `manager.transition(from, to, packet)` to see legality and what meta side effects fire (depth, loop, identity). [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_80eca0cd-d0a8-4d63-9059-e3363aa9eff0/dd1d1b6e-4096-4d1a-bd17-035badbb9c43/pasted-text.txt)
   - Check `meta.getRunMeta()` and related helpers for what “truth” is being recorded about the run.

2. **Watch for packet vs run‑state boundaries**
   - Old code: `PhasePacket` is built with `buildPacket(from, to, patch)` and sometimes spread (`...prev`), mixing user, identity, gate, alignment, and inventory. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_80eca0cd-d0a8-4d63-9059-e3363aa9eff0/dd1d1b6e-4096-4d1a-bd17-035badbb9c43/pasted-text.txt)
   - New direction: introduce `PhaseWallPacket` (tiny, hop‑only) and a `RunLedger`/`RunMetaSnapshot` for everything persistent; shells should update run slice first, then send a minimal wall packet.

3. **Where to hook new behavior**
   - To add new meta progression: extend `RunMetaSnapshot`/`RunLedger` and add a reducer or meta helper; then call it from `manager.applySideEffects` or from a shell via `runSlice` actions. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_80eca0cd-d0a8-4d63-9059-e3363aa9eff0/dd1d1b6e-4096-4d1a-bd17-035badbb9c43/pasted-text.txt)
   - To add a new phase or sub‑phase: add an entry to `PhaseId`, update `LEGAL` map in `manager.ts`, and create corresponding Shell/Screen in `web/react_app/src/weblite_game/pages/phases`.

***

## Quick mental model

- **Engine (@du/phases)**: owns legality, run meta, and is the canonical record of “what happened this run.”  
- **React app (web/react_app)**: owns UX, local UI state, and mirrors engine meta into Redux slices (`phaseSlice`, `runSlice`).  
- **RDX discipline goal**: PhaseWall packets stay minimal and transient; Redux + engine meta hold all long‑lived identity, parity, and progression.

