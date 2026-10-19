/* =========================================================
   Gửi Tuyết Mai · 20/10 — script.js
   JavaScript thuần, không phụ thuộc backend hay thư viện.
   ========================================================= */
(() => {
  'use strict';

  /* ============ CẤU HÌNH: chỉnh ở đây ============ */
  const CONFIG = {
    // Để trống '' => trình duyệt tự "đàn" một giai điệu piano nhẹ (không cần file nào).
    // Muốn dùng bản piano của riêng bạn:
    //   - Bỏ file âm thanh vào CÙNG THƯ MỤC với index.html, rồi điền tên file, ví dụ 'piano.mp3'
    //   - Hoặc điền một URL https trỏ thẳng tới file âm thanh hợp lệ (mp3, ogg, m4a, wav).
    // Nếu file/URL lỗi, trang tự quay về nhạc piano tổng hợp.
    musicUrl: '',
    musicVolume: 0.8,   // 0 → 1
    typeDelay: 44,      // ms cho mỗi ký tự khi gõ chữ
    linePause: 650,     // ms nghỉ giữa các dòng
    envelopeOpenMs: 3400 // ms từ lúc bấm phong bì đến khi sang cảnh đầu tiên
  };

  /* ============ NỘI DUNG QUIZ ============ */
  // Mỗi lựa chọn: [nội dung, lời đáp]. Không có đáp án sai.
  const QUIZ = [
    {
      q: 'Nếu chỉ được chọn một, người ta sẽ nhớ điều gì đầu tiên về cậu?',
      opts: [
        ['Sự trách nhiệm đến từng chi tiết', 'Câu này tớ gật gù thật sự. Đúng kiểu Tuyết Mai.'],
        ['Nụ cười hơi ngại ngùng', 'Cái này thì tớ xin phép không bình luận :))'],
        ['Sự chu đáo âm thầm', 'Cậu luôn làm nhiều hơn những gì cậu nói. Tớ có để ý đấy.'],
        ['Dáng đi vội vàng của người đang bận việc', 'Cô gái bận rộn của lớp. Cute thật chứ không đùa.']
      ]
    },
    {
      q: 'Nếu 20/10 được tặng thêm một điều ước nhỏ, cậu chọn gì?',
      opts: [
        ['Một ngày không có deadline', 'Chuẩn luôn. Người trách nhiệm nào cũng xứng đáng có một ngày như vậy.'],
        ['Một ly trà sữa thật ngon', 'Tớ ghi chú lại rồi nhé. Biết đâu sau này có ích :))'],
        ['Một buổi chiều đi dạo thật chậm', 'Nghe yên bình quá. Tớ cũng thích như vậy.'],
        ['Ai đó nhắn: "hôm nay cậu làm tốt lắm"', 'Vậy thì đọc xong lá thư này, coi như điều ước thành thật nhé: hôm nay cậu làm tốt lắm.']
      ]
    },
    {
      q: 'Nếu có một bạn trong lớp muốn thân với cậu hơn một chút, cậu sẽ...',
      opts: [
        ['Vui vẻ chào đón', 'Đây là câu trả lời đáng yêu nhất của buổi tối nay :))'],
        ['Quan sát thêm một thời gian', 'Cẩn thận và hợp lý. Đúng kiểu người có trách nhiệm.'],
        ['Rủ đi uống trà sữa trước đã', 'Nghe có triển vọng đấy :))'],
        ['Hỏi lại: "bạn đó là Bình hả?"', 'Hả... sao cậu đoán nhanh thế :))']
      ]
    }
  ];

  /* ============ TIỆN ÍCH ============ */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const REDUCED = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  const body = document.body;
  const stage = $('#stage');
  const scenes = $$('.scene');
  const env = $('#envelope');

  let current = -1;
  let runId = 0;
  let skip = false;
  let wake = null;
  let envOpened = false;

  function wait(ms) {
    return new Promise((resolve) => {
      let t = null;
      const done = () => {
        clearTimeout(t);
        if (wake === done) wake = null;
        resolve();
      };
      t = setTimeout(done, ms);
      wake = done;
    });
  }

  /* ============ CHUẨN BỊ CHỮ (gõ từng ký tự) ============ */
  function prepareLines() {
    $$('.line').forEach((line) => {
      const text = line.dataset.text || '';
      line.textContent = '';

      const sr = document.createElement('span');
      sr.className = 'sr';
      sr.textContent = text;
      line.appendChild(sr);

      const chars = [];
      text.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          line.appendChild(document.createTextNode(' '));
          return;
        }
        const w = document.createElement('span');
        w.className = 'w';
        w.setAttribute('aria-hidden', 'true');
        Array.from(part).forEach((ch) => {
          const s = document.createElement('span');
          s.className = 'c';
          s.textContent = ch;
          w.appendChild(s);
          chars.push(s);
        });
        line.appendChild(w);
      });
      line._chars = chars;
    });
  }

  async function typeLine(line, id) {
    const chars = line._chars || [];
    let last = null;
    for (let i = 0; i < chars.length; i++) {
      if (id !== runId) return false;
      if (skip || REDUCED) {
        chars.slice(i).forEach((x) => x.classList.add('on'));
        break;
      }
      const c = chars[i];
      if (last) last.classList.remove('cur');
      c.classList.add('on', 'cur');
      last = c;
      const ch = c.textContent;
      let d = CONFIG.typeDelay * (0.7 + Math.random() * 0.6);
      if (ch === ',' || ch === ';') d += 180;
      else if (ch === '.' || ch === '!' || ch === '?' || ch === '…') d += 340;
      await wait(d);
    }
    if (last) last.classList.remove('cur');
    return id === runId;
  }

  function keepInView(el, scene) {
    if (!el || !scene) return;
    const r = el.getBoundingClientRect();
    const limit = window.innerHeight - 96;
    if (r.bottom > limit) {
      scene.scrollBy({ top: r.bottom - limit + 24, behavior: REDUCED ? 'auto' : 'smooth' });
    }
  }

  async function typeScene(scene, id) {
    await wait(REDUCED ? 100 : 1300);
    if (id !== runId) return false;
    const lines = $$('.line', scene);
    for (let i = 0; i < lines.length; i++) {
      if (id !== runId) return false;
      keepInView(lines[i], scene);
      const ok = await typeLine(lines[i], id);
      if (!ok) return false;
      await wait(skip || REDUCED ? 0 : CONFIG.linePause);
    }
    return id === runId;
  }

  /* ============ ĐIỀU HƯỚNG CẢNH ============ */
  function resetScene(sc) {
    sc.classList.remove('done');
    $$('.c', sc).forEach((c) => c.classList.remove('on', 'cur'));
    $$('[data-next]', sc).forEach((b) => b.classList.remove('show'));
    if (sc.dataset.kind === 'quiz') resetQuiz();
  }

  function goTo(index) {
    if (index < 0 || index >= scenes.length) return;
    runId++;
    skip = false;
    if (wake) wake();
    if (current >= 0) scenes[current].classList.remove('active');
    current = index;

    const sc = scenes[index];
    resetScene(sc);
    sc.scrollTop = 0;
    sc.classList.add('active');

    const id = runId;
    const kind = sc.dataset.kind;
    if (kind === 'story') storyFlow(sc, id);
    else if (kind === 'quiz') quizFlow(sc, id);
    else if (kind === 'letter') letterFlow(sc, id);
  }

  async function storyFlow(sc, id) {
    const ok = await typeScene(sc, id);
    if (!ok || id !== runId) return;
    $$('[data-next]', sc).forEach((b) => b.classList.add('show'));
    sc.classList.add('done');
    keepInView($('[data-next]', sc), sc);
  }

  async function letterFlow(sc, id) {
    const ok = await typeScene(sc, id);
    if (!ok || id !== runId) return;
    sc.classList.add('done');
    setTimeout(() => { if (id === runId) keepInView($('.fin', sc), sc); }, 600);
  }

  /* ============ QUIZ ============ */
  const quizBox = $('#quizBox');
  const qCount = $('#qCount');
  const qText = $('#qText');
  const qOpts = $('#qOpts');
  const qFb = $('#qFeedback');
  const qNext = $('#qNext');
  let qi = 0;
  let answered = false;

  qText.setAttribute('tabindex', '-1');

  function resetQuiz() {
    qi = 0;
    answered = false;
    quizBox.classList.remove('show');
    qOpts.textContent = '';
    qFb.textContent = '';
    qFb.classList.remove('show');
    qNext.classList.remove('show');
  }

  function renderQuestion() {
    const item = QUIZ[qi];
    answered = false;
    qCount.textContent = 'Câu ' + (qi + 1) + ' / ' + QUIZ.length;
    qText.textContent = item.q;
    qOpts.textContent = '';
    qFb.textContent = '';
    qFb.classList.remove('show');
    qNext.classList.remove('show');
    item.opts.forEach(([label, reply]) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'opt';
      b.textContent = label;
      b.addEventListener('click', () => pick(b, reply));
      qOpts.appendChild(b);
    });
  }

  function pick(btn, reply) {
    if (answered) return;
    answered = true;
    $$('.opt', qOpts).forEach((o) => o.classList.add(o === btn ? 'picked' : 'dim'));
    qFb.textContent = reply;
    qFb.classList.add('show');
    qNext.textContent = qi === QUIZ.length - 1 ? 'mở thư →' : 'câu tiếp theo →';
    qNext.classList.add('show');
    keepInView(qNext, scenes[current]);
  }

  qNext.addEventListener('click', () => {
    if (qi < QUIZ.length - 1) {
      qi++;
      renderQuestion();
      qText.focus({ preventScroll: true });
    } else {
      goTo(current + 1);
    }
  });

  async function quizFlow(sc, id) {
    const ok = await typeScene(sc, id);
    if (!ok || id !== runId) return;
    renderQuestion();
    quizBox.classList.add('show');
    setTimeout(() => { if (id === runId) keepInView(quizBox, sc); }, 400);
  }

  /* ============ PHONG BÌ ============ */
  function openEnvelope() {
    if (envOpened) return;
    envOpened = true;
    Music.start();
    body.classList.add('started');
    body.classList.add('letterbox');
    env.classList.add('open');
    env.removeAttribute('tabindex');
    env.setAttribute('aria-expanded', 'true');

    const total = REDUCED ? 800 : CONFIG.envelopeOpenMs;
    setTimeout(() => env.classList.add('zoom'), Math.max(400, total - 1700));
    setTimeout(() => goTo(1), total);
  }

  env.addEventListener('click', openEnvelope);
  env.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openEnvelope();
    }
  });

  /* ============ CHẠM ĐỂ BỎ QUA HIỆU ỨNG GÕ ============ */
  stage.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button, .envelope, a')) return;
    skip = true;
    if (wake) wake();
  });

  stage.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-next]');
    if (btn) goTo(current + 1);
  });

  /* ============ XEM LẠI ============ */
  $('#replay').addEventListener('click', () => {
    envOpened = false;
    env.classList.remove('open', 'zoom');
    env.removeAttribute('aria-expanded');
    env.setAttribute('tabindex', '0');
    body.classList.remove('letterbox');
    goTo(0);
  });

  /* ============ NHẠC ============ */
  const Music = (() => {
    let ctx = null;
    let master = null;
    let wet = null;
    let timer = null;
    let started = false;
    let muted = false;
    let synthOn = false;
    let fileEl = null;
    let nextTime = 0;
    let step = 0;

    const EIGHTH = 60 / 64 / 2; // 64 bpm, mỗi bước là một nốt móc đơn
    const LEVEL = () => CONFIG.musicVolume * 0.7;

    // Am F C G | Am F C G
    const CHORDS = [
      { bass: 45, arp: [57, 60, 64, 69] },
      { bass: 41, arp: [57, 60, 65, 69] },
      { bass: 48, arp: [55, 60, 64, 67] },
      { bass: 43, arp: [55, 59, 62, 67] },
      { bass: 45, arp: [57, 60, 64, 69] },
      { bass: 41, arp: [57, 60, 65, 69] },
      { bass: 48, arp: [55, 60, 64, 67] },
      { bass: 43, arp: [55, 59, 62, 67] }
    ];
    const ARP = [0, 2, 1, 3, 2, 3, 1, 2];
    // Mỗi phần tử: [vị trí (nốt móc), nốt MIDI, độ dài (nốt móc)]
    const MELODY = [
      [[0, 76, 3], [4, 74, 2], [6, 72, 2]],
      [[0, 72, 4], [4, 69, 3]],
      [[0, 67, 2], [2, 72, 2], [4, 76, 4]],
      [[0, 74, 6]],
      [[0, 79, 2], [2, 76, 2], [4, 72, 4]],
      [[0, 77, 3], [4, 76, 2], [6, 72, 2]],
      [[0, 76, 2], [2, 74, 2], [4, 72, 4]],
      [[0, 71, 4], [4, 74, 4]]
    ];

    const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

    function makeImpulse() {
      const rate = ctx.sampleRate;
      const len = Math.floor(rate * 2.6);
      const buf = ctx.createBuffer(2, len, rate);
      for (let c = 0; c < 2; c++) {
        const d = buf.getChannelData(c);
        for (let i = 0; i < len; i++) {
          d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.4);
        }
      }
      return buf;
    }

    function ensureCtx() {
      if (ctx) return ctx;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      try {
        ctx = new AC();
      } catch (e) {
        ctx = null;
        return null;
      }
      master = ctx.createGain();
      master.gain.value = 0;
      const comp = ctx.createDynamicsCompressor();
      master.connect(comp);
      comp.connect(ctx.destination);

      const conv = ctx.createConvolver();
      conv.buffer = makeImpulse();
      wet = ctx.createGain();
      wet.gain.value = 0.38;
      wet.connect(conv);
      conv.connect(master);
      return ctx;
    }

    function note(midi, when, dur, vel) {
      const f = mtof(midi);
      const g = ctx.createGain();
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = Math.min(6000, f * 6 + 800);

      [[1, 1], [2, 0.38], [3, 0.14]].forEach(([mult, amp]) => {
        const o = ctx.createOscillator();
        o.type = mult === 1 ? 'triangle' : 'sine';
        o.frequency.value = f * mult * (1 + (Math.random() - 0.5) * 0.0008);
        const og = ctx.createGain();
        og.gain.value = amp;
        o.connect(og);
        og.connect(lp);
        o.start(when);
        o.stop(when + dur + 0.2);
      });

      lp.connect(g);
      g.gain.setValueAtTime(0.0001, when);
      g.gain.linearRampToValueAtTime(vel * 0.22, when + 0.006);
      g.gain.exponentialRampToValueAtTime(vel * 0.07, when + 0.35);
      g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
      g.connect(master);
      g.connect(wet);
    }

    function scheduleStep(s, t) {
      const bar = Math.floor(s / 8) % 8;
      const pos = s % 8;
      const ch = CHORDS[bar];
      const human = () => (Math.random() - 0.5) * 0.012;

      if (pos === 0) note(ch.bass, t, 3.4, 0.8);
      if (pos === 4) note(ch.bass + 12, t + human(), 2.2, 0.4);
      note(ch.arp[ARP[pos]], t + human(), 1.9, 0.35 + Math.random() * 0.15);
      MELODY[bar].forEach(([p, m, len]) => {
        if (p === pos) note(m, t + human(), len * EIGHTH * 1.7 + 0.6, 0.7);
      });
    }

    function pump() {
      if (!ctx) return;
      if (nextTime < ctx.currentTime) nextTime = ctx.currentTime + 0.05;
      while (nextTime < ctx.currentTime + 0.4) {
        scheduleStep(step, nextTime);
        step++;
        nextTime += EIGHTH;
      }
    }

    function startSynth() {
      if (synthOn) return;
      if (!ensureCtx()) return;
      synthOn = true;
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      nextTime = ctx.currentTime + 0.4;
      step = 0;
      timer = setInterval(pump, 70);
      if (!muted) master.gain.setTargetAtTime(LEVEL(), ctx.currentTime, 1.6);
    }

    function fadeFile(to, ms) {
      if (!fileEl) return;
      const el = fileEl;
      const from = el.volume;
      const t0 = performance.now();
      (function f(now) {
        const k = Math.min(1, (now - t0) / ms);
        el.volume = Math.max(0, Math.min(1, from + (to - from) * k));
        if (k < 1) requestAnimationFrame(f);
      })(t0);
    }

    function fallbackToSynth() {
      if (synthOn) return;
      fileEl = null;
      startSynth();
    }

    function start() {
      if (started) return;
      started = true;

      if (CONFIG.musicUrl) {
        try {
          const el = new Audio();
          el.loop = true;
          el.preload = 'auto';
          el.volume = 0;
          el.addEventListener('error', fallbackToSynth, { once: true });
          el.src = CONFIG.musicUrl;
          fileEl = el;
          const p = el.play();
          if (p && p.then) {
            p.then(() => fadeFile(CONFIG.musicVolume, 3000)).catch(fallbackToSynth);
          }
          return;
        } catch (e) {
          fileEl = null;
        }
      }
      startSynth();
    }

    function setMuted(m) {
      muted = m;
      if (fileEl) {
        if (m) fileEl.pause();
        else fileEl.play().catch(() => {});
        return;
      }
      if (!ctx) return;
      if (m) {
        master.gain.setTargetAtTime(0, ctx.currentTime, 0.25);
        setTimeout(() => {
          if (muted && ctx.state === 'running') ctx.suspend().catch(() => {});
        }, 900);
      } else {
        ctx.resume().catch(() => {});
        master.gain.setTargetAtTime(LEVEL(), ctx.currentTime, 0.5);
      }
    }

    function resumeIfNeeded() {
      if (!started || muted || document.hidden) return;
      if (fileEl) {
        if (fileEl.paused) fileEl.play().catch(() => {});
      } else if (ctx && ctx.state !== 'running') {
        ctx.resume().catch(() => {});
      }
    }

    // Tự dừng khi chuyển tab, tiếp tục khi quay lại.
    document.addEventListener('visibilitychange', () => {
      if (!started) return;
      if (document.hidden) {
        if (fileEl) fileEl.pause();
        else if (ctx && ctx.state === 'running') ctx.suspend().catch(() => {});
      } else {
        resumeIfNeeded();
      }
    });
    // Một số trình duyệt chỉ cho phát lại sau thao tác chạm.
    document.addEventListener('pointerdown', resumeIfNeeded, { passive: true });

    return { start, setMuted, isMuted: () => muted };
  })();

  const sndBtn = $('#soundBtn');
  sndBtn.addEventListener('click', () => {
    const m = !Music.isMuted();
    Music.setMuted(m);
    sndBtn.classList.toggle('off', m);
    sndBtn.setAttribute('aria-pressed', String(!m));
    sndBtn.setAttribute('aria-label', m ? 'Bật nhạc' : 'Tắt nhạc');
  });

  /* ============ BỤI SÁNG (canvas) ============ */
  function initDust() {
    const cv = $('#dust');
    if (!cv || REDUCED) return;
    const g = cv.getContext('2d');
    if (!g) return;

    let W = 0;
    let H = 0;
    let P = [];

    const spawn = (first) => ({
      x: Math.random() * W,
      y: first ? Math.random() * H : H + 12,
      r: 0.7 + Math.random() * 2,
      vy: 0.1 + Math.random() * 0.28,
      vx: (Math.random() - 0.5) * 0.14,
      a: 0.18 + Math.random() * 0.4,
      ph: Math.random() * 6.283,
      sp: 0.01 + Math.random() * 0.02
    });

    function resize() {
      const d = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      cv.width = Math.round(W * d);
      cv.height = Math.round(H * d);
      cv.style.width = W + 'px';
      cv.style.height = H + 'px';
      g.setTransform(d, 0, 0, d, 0, 0);
      const n = Math.max(16, Math.min(64, Math.round((W * H) / 24000)));
      P = Array.from({ length: n }, () => spawn(true));
    }

    function frame() {
      g.clearRect(0, 0, W, H);
      for (const p of P) {
        p.ph += p.sp;
        p.x += p.vx + Math.sin(p.ph) * 0.18;
        p.y -= p.vy;
        if (p.y < -12 || p.x < -12 || p.x > W + 12) Object.assign(p, spawn(false));
        const al = p.a * (0.55 + 0.45 * Math.sin(p.ph * 2.3));
        g.beginPath();
        g.fillStyle = 'rgba(201,160,92,' + al.toFixed(3) + ')';
        g.arc(p.x, p.y, p.r, 0, 6.2832);
        g.fill();
        g.beginPath();
        g.fillStyle = 'rgba(235,200,140,' + (al * 0.22).toFixed(3) + ')';
        g.arc(p.x, p.y, p.r * 4, 0, 6.2832);
        g.fill();
      }
      requestAnimationFrame(frame);
    }

    let rt = null;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(resize, 200);
    });
    resize();
    requestAnimationFrame(frame);
  }

  /* ============ KHỞI CHẠY ============ */
  prepareLines();
  initDust();
  goTo(0);
})();
