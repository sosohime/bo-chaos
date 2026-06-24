---
Title: Yuanbo Game CR Growth Loop
Date: 2026-06-23
- Mode: full
Status: active
Owner: Codex
---

## Goal

Use subagent review and browser QA to improve `袁博の极限售后` from a rough Phaser prototype toward a playable management RPG slice, focusing on story causality, growth motivation, UI/game feel, and verification across desktop/mobile.

## Scope

- Astro frontend Yuanbo game under `apps/frontend-astro/src/game/yuanbo/`.
- Yuanbo game page shell under `apps/frontend-astro/src/pages/bo/yuanbo-game.astro` only if needed.
- No backend, no production writes, no unrelated miniapp/admin changes.

## Plan

1. Gather subagent CR for gameplay, UI, and story.
2. Add persistent story/growth state: chapters, route perks, achievements, relationships, locks.
3. Make tasks and Boss react to prior outcomes and inherited problems.
4. Improve readable feedback in task board, quest brief, training, negotiation, and result screens.
5. Verify build, lint, desktop and mobile browser flows.

## Actions

- Spawned three subagent reviews for gameplay/growth, UI/visual feel, and story/boshuo tone.
- Added persistent RPG state fields: `chapter`, `locks`, `relationships`, `storyFlags`, `achievements`, and `perks`.
- Reworked quests into a three-act support-disaster chain with objectives, traits, preferred training lines, resistances, and phase lines.
- Added memory echoes from unresolved issues into quest briefs and negotiation logs.
- Added training milestone perks so growth changes negotiation effects instead of only raising numbers.
- Added customer failure locks, relationship changes, harsher failure costs, Boss docket text, ending achievements, and NG+ cycle difficulty.
- Added daily event choices that can train, clear issues, or trade resources.
- Improved quest board/brief/training/result feedback with route, chapter, perk, delta, and issue summaries.
- Removed runtime white-background Bo cards by using cutout textures; kept original Bo pet art for map and negotiation identity.
- Removed map Bo size pulsing during movement to reduce jitter.
- Fixed dev favicon path in the shared Astro layout to avoid `/retire/bo.ico` 404.

## Evidence

- `pnpm -C apps/frontend-astro build` passed after the gameplay/state changes.
- Mobile browser QA at `390x844`: no horizontal overflow, canvas fills viewport, quest brief and negotiation render inside the screen.
- Browser resource QA: no 4xx responses after fixing the favicon path.
- Subagent CR confirms the old version was only a prototype; this pass specifically addressed story causality, growth, failure pressure, Boss meaning, and feedback.

## Remaining Risk

- Art direction is still mixed because the user requested original Bo pet art directly; a future pass should choose either full sticker-collage style or generate matching pixel assets for every character/prop.
- Automated canvas clicks are fragile; visual screenshots were used for UI verification, while build and resource checks are automated.
