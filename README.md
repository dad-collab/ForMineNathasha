# LOVE.exe 💌

A little surprise from Rohit for his best friend Nathasha.

> “A Little Surprise From Your Best Friend!”

## Phase 1 — what is built

- Full-screen landing: badge, “Hey Nathasha! ❤️”, subtitle, warning line, animated envelope, **OPEN YOUR SURPRISE 💌** button.
- Envelope opens with a floating-heart animation and shows the letter, with **CHALO SHURU KARTE HAIN 😂**.
- Loading screen: “Setting up Nathasha's special experience...” with animated hearts and a progress bar.
- Placeholder screen: “Something interesting is coming, Nathasha! 👀” — ready for Phase 2.
- Progress indicator (Surprise → Letter → Coming soon) + Restart on every screen.
- Footer: “Designed with ❤️ by Rohit — Specially made for Nathasha — Best Friends Forever! 😂”

## Design

Soft blush pink, lavender, cream white, rose pink, light peach. Glassmorphism cards, soft moving gradient, floating hearts / bubbles / stars, subtle desktop cursor sparkles. No neon, no ZINX / VYBEX / Instagram copy.

## Run locally

Open `index.html` in a browser, or serve it:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Phase 2 — Nathasha's Funny Challenge

- Challenge welcome: “Welcome to Nathasha's Test! 😂” → **START MY TEST 😎**
- 7 funny questions, one at a time, with animated answer buttons, a progress bar and question number.
- NO button dodge: a NO answer dodges FOREVER on hover/touch/click with a random funny message, stays inside the visible screen, and can never be pressed — Nathasha must press YES (or the other option). YES and other buttons work normally.
- Phase 3 — Compatibility Calculator: from the Phase 2 result, "CHALO AAGE DEKHTE HAIN" opens the Rohit & Nathasha compatibility check. Two name cards (ROHIT ❤️ / NATHASHA 💗), CALCULATE KARO runs an animated 0–100% counter with funny loading messages, then a random 60–100% score with a band message and 5 random animated stats (Friendship, Pagalpan Compatibility, Understanding, Masti, Nok-Jhok). "EK AUR BAAR CHECK KARO" recalculates with a new random score; "NEXT SURPRISE" goes to the Phase 4 placeholder (Phase 4 NOT built yet).
- After every answer: a funny reaction (answer-specific, sometimes plus a random one) + confetti, then the next question.
- Final screen: “Bas Nathasha, bahut ho gaya! 😂” + Friendship Personality Report — Drama, Innocence, Attitude and Rohit Ko Pareshan Karne Ki Ability, calculated from her answers (just for fun) — plus **CHALO AAGE DEKHTE HAIN 😂** (Phase 3 placeholder, not built yet).
- Answers are stored for the session (in memory + sessionStorage). Restart the challenge any time; the global Restart goes back to the landing page. Phase 1 is unchanged.

## Deploy (GitHub Pages)

Push this folder to a public GitHub repo, then enable **Settings → Pages → Deploy from a branch → main / (root)**.

## Files

- `index.html` — screens + content
- `style.css` — design system (keep this for future phases)
- `script.js` — screen flow, envelope, loading, floating effects
