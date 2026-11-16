// LOVE.exe — Phase 1 + Phase 2. Plain JS, no dependencies, no reloads.
(function () {
  "use strict";

  var screens = {
    landing: document.getElementById("screen-landing"),
    letter: document.getElementById("screen-letter"),
    loading: document.getElementById("screen-loading"),
    coming: document.getElementById("screen-coming"),
    challenge: document.getElementById("screen-challenge"),
    quiz: document.getElementById("screen-quiz"),
    result: document.getElementById("screen-result"),
    compat: document.getElementById("screen-compat"),
    next: document.getElementById("screen-next"),
  };
  var progressItems = Array.prototype.slice.call(document.querySelectorAll("#progress li"));
  var stepFor = { landing: 1, letter: 2, loading: 2, coming: 3, challenge: 4, quiz: 4, result: 4, compat: 4, next: 4 };
  var loadingTimer = null;
  var compatTimer = null, compatMsgTimer = null, compatResultTimer = null;

  function show(name) {
    Object.keys(screens).forEach(function (k) { screens[k].classList.toggle("active", k === name); });
    var step = stepFor[name] || 1;
    progressItems.forEach(function (li) {
      var n = Number(li.getAttribute("data-step"));
      li.classList.toggle("active", n === step);
      li.classList.toggle("done", n < step);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function burstHearts(container) {
    if (!container) return;
    container.innerHTML = "";
    ["💗", "💖", "❤️", "💕", "✨"].forEach(function (ch, i) {
      var s = document.createElement("span");
      s.textContent = ch;
      s.style.setProperty("--dx", ((i - 2) * 34) + "px");
      s.style.left = (50 + (i - 2) * 8) + "%";
      container.appendChild(s);
    });
  }

  function openLetter() {
    var env = document.getElementById("envelopeBtn");
    env.classList.add("open");
    burstHearts(document.getElementById("burst"));
    setTimeout(function () { show("letter"); }, 650);
  }

  function startLoading() {
    show("loading");
    var fill = document.getElementById("loadFill");
    var pct = document.getElementById("loadPct");
    var p = 0;
    clearInterval(loadingTimer);
    loadingTimer = setInterval(function () {
      p = Math.min(100, p + Math.floor(Math.random() * 14) + 6);
      fill.style.width = p + "%";
      pct.textContent = p + "%";
      if (p >= 100) { clearInterval(loadingTimer); setTimeout(function () { show("coming"); }, 350); }
    }, 220);
  }

  function restart() {
    clearInterval(loadingTimer);
    clearInterval(compatTimer);
    clearInterval(compatMsgTimer);
    clearTimeout(compatResultTimer);
    clearTimeout(quizTimer);
    showCompatPanel("compatEntry");
    var fill = document.getElementById("loadFill");
    var pct = document.getElementById("loadPct");
    if (fill) fill.style.width = "0%";
    if (pct) pct.textContent = "0%";
    document.getElementById("envelopeBtn").classList.remove("open");
    quizIndex = 0; answers = [];
    show("landing");
  }

  /* ---------- Phase 2: Nathasha's Funny Challenge ---------- */
  var QUESTIONS = [
    { q: "Nathasha, sach bata... thodi pagal hai na? 😂", options: [
      { t: "Haan, thodi si 😂", r: "Dekha! Khud maan liya 😂", s: { drama: 12, innocence: -6 } },
      { t: "NO 🙄", r: "Nathasha, itna jhoot? 😂", s: { attitude: 14, innocence: 6 } } ] },
    { q: "Do you Love me? 👀", options: [
      { t: "Yes ❤️", r: "Rohit khush ho gaya ❤️", s: { innocence: 12, pareshan: -6 } },
      { t: "NO 🙄", r: "Itni nafrat bhi mat dikhao madam!", s: { attitude: 16, drama: 6 } } ] },
    { q: "Rohit raja jaisa feel hota? 👑", options: [
      { t: "Yes ❤️", r: "Raja Rohit, hajir ho! 👑", s: { innocence: 8, pareshan: -4 } },
      { t: "NO 😭", r: "Rohit is reviewing your answer... 👀", s: { attitude: 10, drama: 8 } } ] },
    { q: "Agar Rohit 2 din message na kare toh notice karegi?", options: [
      { t: "Haan, obviously 👀", r: "Madam, answer recorded successfully!", s: { innocence: 10, pareshan: -6 } },
      { t: "NO 😎", r: "Your attitude has been detected! 😎", s: { attitude: 14, pareshan: 8 } } ] },
    { q: "Roblox mein pitegi ya real life mein? 😂", options: [
      { t: "Snap par 👻", r: "Snap par bhi nahi bachogi! 👻", s: { drama: 12, attitude: 6 } },
      { t: "Roblox mein 🎮", r: "Roblox mein toh Rohit hi jeetega! 🎮", s: { pareshan: 12, drama: 6 } } ] },
    { q: "Rohit ki baaton par kabhi hasi aati bhi hai?", options: [
      { t: "Kabhi kabhi 🤣", r: "Kabhi kabhi hi sahi, hasi toh aati hai! 🤣", s: { innocence: 10, drama: 4 } },
      { t: "Bilkul nahi 😭", r: "Expected answer, not surprised! 🤣", s: { attitude: 12, pareshan: 6 } } ] },
    { q: "Last question... Rohit achha dost hai na?", options: [
      { t: "Haan ❤️", r: "Correct answer! Best friends forever ❤️", s: { innocence: 12, pareshan: -6 } },
      { t: "NO 🙄", r: "Nathasha, itna jhoot? 😂", s: { attitude: 16, drama: 6 } } ] },
  ];
  var DODGE_MESSAGES = [
    "Pakad ke dikhao 😂",
    "NO bhaag gaya! 🤣",
    "Itni nafrat bhi mat dikhao madam!",
    "Rohit ne button ko bhi bhaga diya 😂",
    "Ab kya karogi? 👀",
  ];
  var RANDOM_REACTIONS = [
    "Nathasha, itna jhoot? 😂",
    "Madam, answer recorded successfully!",
    "Rohit is reviewing your answer... 👀",
    "Your attitude has been detected! 😎",
    "Expected answer, not surprised! 🤣",
    "Nathasha's drama level is increasing!",
  ];
  var quizIndex = 0, answers = [], quizTimer = null, quizLocked = false;
  var dodgeCount = 0;

  function showDodgeMessage(text) {
    var reaction = document.getElementById("quizReaction");
    reaction.textContent = text;
    reaction.classList.add("show");
  }

  // NO dodges FOREVER — it can never be pressed, Nathasha must press YES.
  function dodgeNo(btn) {
    dodgeCount++;
    // Dodge far enough that the cursor is no longer over the button, but
    // never outside the visible screen (viewport clamp, not the card —
    // a full-width button cannot move inside its own card).
    // NOTE: transform is absolute, not cumulative — measure the button's
    // layout position first (clear the old transform, same JS tick so no
    // flicker), otherwise the clamp uses the already-dodged rect and the
    // button can end up partly off-screen. The .3s dodge transition must
    // be off while measuring, or getBoundingClientRect() returns the
    // mid-animation position instead of the layout position.
    btn.style.animation = "none"; // entrance animation's fill would override the dodge transform
    btn.style.transition = "none";
    btn.style.transform = "";
    var rect = btn.getBoundingClientRect();
    var dx = (Math.random() < 0.5 ? -1 : 1) * (70 + Math.random() * 80);
    // Down only: NO is the lower option, moving up would cover the YES button above it.
    var dy = 45 + Math.random() * 55;
    var minX = 8 - rect.left;
    var maxX = window.innerWidth - 8 - rect.right;
    var minY = 8 - rect.top;
    var maxY = window.innerHeight - 8 - rect.bottom;
    dx = Math.max(minX, Math.min(maxX, dx));
    dy = Math.max(minY, Math.min(maxY, dy));
    if (maxX - minX < 20) dx = 0;
    if (maxY - minY < 20) dy = 0;
    btn.style.transition = ""; // restore the .3s dodge animation
    btn.style.transform = "translate(" + dx + "px," + dy + "px)";
    showDodgeMessage(DODGE_MESSAGES[Math.floor(Math.random() * DODGE_MESSAGES.length)]);
    return true;
  }

  function confetti() {
    var colors = ["#ff6b9d", "#a78bfa", "#ffd9b8", "#ff8fb8", "#c9b8ff"];
    for (var i = 0; i < 26; i++) {
      var c = document.createElement("span");
      c.className = "confetti";
      c.textContent = ["🎉", "💗", "✨", "⭐"][i % 4];
      c.style.left = (Math.random() * 96 + 2) + "%";
      c.style.fontSize = (Math.random() * 10 + 12) + "px";
      c.style.animationDuration = (Math.random() * 1.4 + 1.6) + "s";
      c.style.color = colors[i % colors.length];
      document.body.appendChild(c);
      (function (el) { setTimeout(function () { el.remove(); }, 3200); })(c);
    }
  }

  function renderQuestion() {
    quizLocked = false;
    dodgeCount = 0;
    var item = QUESTIONS[quizIndex];
    document.getElementById("quizCount").textContent = "Question " + (quizIndex + 1) + " of " + QUESTIONS.length;
    document.getElementById("quizFill").style.width = ((quizIndex) / QUESTIONS.length * 100) + "%";
    document.getElementById("quizQuestion").textContent = item.q;
    var box = document.getElementById("quizOptions");
    box.innerHTML = "";
    var reaction = document.getElementById("quizReaction");
    reaction.textContent = ""; reaction.classList.remove("show");
    item.options.forEach(function (opt, oi) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "opt"; b.textContent = opt.t;
      var isNo = opt.t.indexOf("NO") === 0;
      if (isNo) {
        b.classList.add("dodge-btn");
        b.addEventListener("mouseenter", function () { dodgeNo(b); });
        b.addEventListener("touchstart", function (e) { e.preventDefault(); dodgeNo(b); }, { passive: false });
      }
      b.addEventListener("click", function (e) {
        if (isNo) { e.preventDefault(); dodgeNo(b); return; }
        b.style.transform = "";
        answerQuestion(b, oi);
      });
      box.appendChild(b);
    });
  }

  function answerQuestion(btn, oi) {
    if (quizLocked) return;
    quizLocked = true;
    var item = QUESTIONS[quizIndex];
    var opt = item.options[oi];
    answers.push({ q: item.q, answer: opt.t, scores: opt.s });
    Array.prototype.forEach.call(document.querySelectorAll("#quizOptions .opt"), function (o) { o.disabled = true; });
    btn.classList.add("picked");
    confetti();
    var reaction = document.getElementById("quizReaction");
    var extra = Math.random() < 0.45 ? " " + RANDOM_REACTIONS[Math.floor(Math.random() * RANDOM_REACTIONS.length)] : "";
    reaction.textContent = opt.r + extra;
    reaction.classList.add("show");
    document.getElementById("quizFill").style.width = ((quizIndex + 1) / QUESTIONS.length * 100) + "%";
    clearTimeout(quizTimer);
    quizTimer = setTimeout(function () {
      quizIndex++;
      if (quizIndex < QUESTIONS.length) { renderQuestion(); }
      else { showResult(); }
    }, 1500);
  }

  function clamp(v) { return Math.max(18, Math.min(98, Math.round(v))); }
  function showResult() {
    var base = { drama: 42, innocence: 52, attitude: 46, pareshan: 44 };
    answers.forEach(function (a) {
      Object.keys(a.scores).forEach(function (k) { base[k] += a.scores[k]; });
    });
    var stats = [
      { label: "🎭 Drama Level", value: clamp(base.drama), note: base.drama > 60 ? "Full Bollywood!" : "Control mein hai" },
      { label: "😇 Innocence Level", value: clamp(base.innocence), note: base.innocence > 60 ? "Bilkul innocent!" : "Hmm, shak hai 😂" },
      { label: "😎 Attitude Level", value: clamp(base.attitude), note: base.attitude > 60 ? "Queen vibes 👑" : "Sweet madam" },
      { label: "😂 Rohit Ko Pareshan Karne Ki Ability", value: clamp(base.pareshan), note: base.pareshan > 60 ? "Expert level!" : "Abhi seekh rahi ho" },
    ];
    var box = document.getElementById("resultStats");
    box.innerHTML = "";
    stats.forEach(function (s) {
      var row = document.createElement("div");
      row.className = "stat-row";
      row.innerHTML = '<label><span>' + s.label + '</span><b>' + s.value + '% · ' + s.note + '</b></label>' +
        '<div class="stat-bar"><div class="stat-fill" data-w="' + s.value + '"></div></div>';
      box.appendChild(row);
    });
    try { sessionStorage.setItem("love-exe-answers", JSON.stringify(answers.map(function (a) { return a.answer; }))); } catch (e) {}
    show("result");
    confetti();
    setTimeout(function () {
      Array.prototype.forEach.call(document.querySelectorAll(".stat-fill"), function (f) { f.style.width = f.getAttribute("data-w") + "%"; });
    }, 120);
  }

  function startChallenge() { quizIndex = 0; answers = []; clearTimeout(quizTimer); renderQuestion(); show("quiz"); }

  document.getElementById("challengeBtn").addEventListener("click", function () { show("challenge"); });
  document.getElementById("startTestBtn").addEventListener("click", startChallenge);
  document.getElementById("challengeBackBtn").addEventListener("click", function () { show("coming"); });
  document.getElementById("quizRestartBtn").addEventListener("click", startChallenge);
  document.getElementById("retakeBtn").addEventListener("click", startChallenge);
  document.getElementById("unlockBtn").addEventListener("click", function () { showCompatEntry(); });

  /* ---------- Phase 3: Rohit & Nathasha Compatibility Calculator ---------- */
  var CALC_MESSAGES = [
    "Rohit ka data check ho raha hai...",
    "Nathasha ki settings scan ho rahi hain...",
    "Dono ka pagalpan calculate ho raha hai...",
    "System confused hai 😂",
    "Final result ready!",
  ];
  function showCompatPanel(id) {
    ["compatEntry", "compatCalc", "compatResult"].forEach(function (p) {
      document.getElementById(p).classList.toggle("active", p === id);
    });
  }
  function showCompatEntry() { clearInterval(compatTimer); clearInterval(compatMsgTimer); showCompatPanel("compatEntry"); show("compat"); }
  function compatBand(score) {
    if (score === 100) return "ERROR! Itni compatibility kaise? System hang ho gaya! 🤣";
    if (score >= 91) return "System ko lagta hai tum dono kaafi special dost ho! ❤️";
    if (score >= 81) return "Ye friendship kuch zyada hi interesting hai! 👀";
    if (score >= 71) return "Achhi bonding hai, bas thodi nok-jhok extra hai!";
    return "Thodi understanding ki zarurat hai 😂";
  }
  function randStat() { return 55 + Math.floor(Math.random() * 45); } // 55–99
  function showCompatResult() {
    var score = 60 + Math.floor(Math.random() * 41); // 60–100, different every time
    document.getElementById("compatScore").textContent = score + "%";
    document.getElementById("compatBand").textContent = compatBand(score);
    var stats = [
      { label: "💗 Friendship Level", value: randStat() },
      { label: "😂 Pagalpan Compatibility", value: randStat() },
      { label: "🤝 Understanding Level", value: randStat() },
      { label: "🎉 Masti Percentage", value: randStat() },
      { label: "😤 Nok-Jhok Level", value: randStat() },
    ];
    var box = document.getElementById("compatStats");
    box.innerHTML = "";
    stats.forEach(function (s) {
      var row = document.createElement("div");
      row.className = "stat-row";
      row.innerHTML = '<label><span>' + s.label + '</span><b>' + s.value + '%</b></label>' +
        '<div class="stat-bar"><div class="stat-fill" data-w="' + s.value + '"></div></div>';
      box.appendChild(row);
    });
    try { sessionStorage.setItem("love-exe-compat", String(score)); } catch (e) {}
    showCompatPanel("compatResult");
    show("compat");
    confetti();
    setTimeout(function () {
      Array.prototype.forEach.call(document.querySelectorAll("#compatStats .stat-fill"), function (f) { f.style.width = f.getAttribute("data-w") + "%"; });
    }, 120);
  }
  function runCompatCalc() {
    clearInterval(compatTimer);
    clearInterval(compatMsgTimer);
    clearTimeout(compatResultTimer);
    showCompatPanel("compatCalc");
    show("compat");
    var pct = document.getElementById("compatPct");
    var fill = document.getElementById("compatFill");
    var msg = document.getElementById("compatMsg");
    var p = 0, mi = 0;
    pct.textContent = "0%";
    fill.style.width = "0%";
    msg.textContent = CALC_MESSAGES[0];
    compatMsgTimer = setInterval(function () {
      mi = Math.min(CALC_MESSAGES.length - 1, mi + 1);
      msg.textContent = CALC_MESSAGES[mi];
    }, 700);
    compatTimer = setInterval(function () {
      p = Math.min(100, p + 1 + Math.floor(Math.random() * 3));
      pct.textContent = p + "%";
      fill.style.width = p + "%";
      if (p >= 100) {
        clearInterval(compatTimer);
        clearInterval(compatMsgTimer);
        msg.textContent = CALC_MESSAGES[CALC_MESSAGES.length - 1];
        compatResultTimer = setTimeout(showCompatResult, 600);
      }
    }, 38);
  }
  document.getElementById("compatCalcBtn").addEventListener("click", runCompatCalc);
  document.getElementById("compatAgainBtn").addEventListener("click", runCompatCalc);
  document.getElementById("compatBackBtn").addEventListener("click", function () { show("result"); });
  document.getElementById("compatNextBtn").addEventListener("click", function () { show("next"); });
  document.getElementById("nextBackBtn").addEventListener("click", function () { showCompatPanel("compatResult"); show("compat"); });
  document.getElementById("nextRestartBtn").addEventListener("click", restart);

  document.getElementById("openBtn").addEventListener("click", openLetter);
  document.getElementById("envelopeBtn").addEventListener("click", openLetter);
  document.getElementById("startBtn").addEventListener("click", startLoading);
  document.getElementById("backBtn").addEventListener("click", restart);
  document.getElementById("restartBtn").addEventListener("click", restart);
  document.getElementById("replayBtn").addEventListener("click", restart);
  document.getElementById("readAgainBtn").addEventListener("click", function () { show("letter"); });

  // Floating hearts / bubbles / stars — lightweight, capped, paused when hidden.
  var layer = document.getElementById("floatLayer");
  var chars = ["💗", "💖", "✨", "🫧", "💕", "⭐"];
  function spawnFloat() {
    if (document.hidden || !layer) return;
    if (layer.children.length > 14) return;
    var el = document.createElement("span");
    el.className = "float-item";
    el.textContent = chars[Math.floor(Math.random() * chars.length)];
    el.style.left = (Math.random() * 92 + 2) + "%";
    el.style.fontSize = (Math.random() * 14 + 14) + "px";
    el.style.animationDuration = (Math.random() * 7 + 9) + "s";
    layer.appendChild(el);
    setTimeout(function () { el.remove(); }, 17000);
  }
  for (var i = 0; i < 8; i++) setTimeout(spawnFloat, i * 350);
  setInterval(spawnFloat, 1800);

  // Subtle cursor sparkles — desktop pointers only, throttled.
  var sparkLayer = document.getElementById("cursorSparkles");
  var lastSpark = 0;
  if (window.matchMedia("(pointer: fine)").matches) {
    document.addEventListener("pointermove", function (e) {
      var now = Date.now();
      if (now - lastSpark < 90) return;
      lastSpark = now;
      var s = document.createElement("span");
      s.className = "sparkle";
      s.textContent = Math.random() > 0.5 ? "✨" : "💗";
      s.style.left = e.clientX + "px";
      s.style.top = e.clientY + "px";
      sparkLayer.appendChild(s);
      setTimeout(function () { s.remove(); }, 850);
    });
  }
})();
