// Calm Japanese-flavored bed, synthesized in the Web Audio API.
// Yo scale (D E G A B): a sparse koto figure and a slow shakuhachi
// line over a quiet fifth. Starts on the first click or key.

(function () {
  const BPM = 56;
  const BEAT = 60 / BPM;
  const YO = [62, 64, 67, 69, 71, 74, 76]; // D4 .. E5

  // [beat, scale degree] across a 32-beat koto cycle.
  const kotoScore = [
    [0, 0], [2, 4], [4, 3], [7, 2],
    [8, 1], [10, 5], [12, 4], [14, 0],
    [16, 3], [18, 6], [20, 4], [23, 2],
    [24, 5], [26, 3], [28, 1], [30, 0]
  ];

  // [beat, scale degree, length in beats] across a 64-beat phrase.
  const shakuScore = [
    [0, 5, 6],
    [8, 4, 5],
    [16, 6, 7],
    [24, 3, 6],
    [32, 2, 8],
    [40, 4, 6],
    [48, 1, 7],
    [56, 0, 8]
  ];

  let ctx;
  let master;
  let noiseBuf;
  let started = false;

  function midi(n) {
    return 440 * Math.pow(2, (n - 69) / 12);
  }

  function noiseBuffer() {
    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  function koto(time, freq) {
    const bus = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(2400, time);
    filter.frequency.exponentialRampToValueAtTime(700, time + 1.4);
    filter.Q.value = 0.7;
    bus.connect(filter);
    filter.connect(master);

    [1, 2, 3, 4.16].forEach(function (ratio, i) {
      const level = [0.22, 0.08, 0.035, 0.012][i];
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const f = freq * ratio;
      const decay = i === 0 ? 2.6 : 0.9 - i * 0.12;
      osc.type = "sine";
      osc.frequency.setValueAtTime(f * 1.03, time);
      osc.frequency.exponentialRampToValueAtTime(f, time + 0.07);
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.exponentialRampToValueAtTime(level, time + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + decay);
      osc.connect(gain);
      gain.connect(bus);
      osc.start(time);
      osc.stop(time + decay + 0.05);
    });
  }

  function shaku(time, freq, beats) {
    const dur = beats * BEAT;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const breath = ctx.createBufferSource();
    const breathGain = ctx.createGain();
    const breathFilter = ctx.createBiquadFilter();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq * 1.012, time);
    osc.frequency.exponentialRampToValueAtTime(freq, time + 0.4);
    lfo.frequency.value = 4.5;
    lfoGain.gain.setValueAtTime(0, time);
    lfoGain.gain.linearRampToValueAtTime(freq * 0.006, time + 0.8);
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(0.055, time + 0.55);
    gain.gain.setValueAtTime(0.045, time + dur * 0.62);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

    breath.buffer = noiseBuf;
    breath.loop = true;
    breathFilter.type = "bandpass";
    breathFilter.frequency.value = freq * 2.2;
    breathFilter.Q.value = 1.4;
    breathGain.gain.setValueAtTime(0.0001, time);
    breathGain.gain.linearRampToValueAtTime(0.018, time + 0.4);
    breathGain.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    breath.connect(breathFilter);
    breathFilter.connect(breathGain);
    breathGain.connect(master);

    osc.connect(gain);
    gain.connect(master);
    osc.start(time);
    lfo.start(time);
    breath.start(time);
    osc.stop(time + dur + 0.05);
    lfo.stop(time + dur + 0.05);
    breath.stop(time + dur + 0.05);
  }

  function drone(time) {
    [midi(38), midi(38) * 1.003, midi(45)].forEach(function (freq, i) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.value = i === 2 ? 0.012 : 0.02;
      osc.connect(gain);
      gain.connect(master);
      osc.start(time);
    });
  }

  function arm(origin) {
    const kotoLoop = 32 * BEAT;
    const shakuLoop = 64 * BEAT;
    let kotoAt = 0;
    let shakuAt = 0;

    function kotoTime(index) {
      const ev = kotoScore[index % kotoScore.length];
      const cycle = Math.floor(index / kotoScore.length);
      return origin + cycle * kotoLoop + ev[0] * BEAT;
    }

    function shakuTime(index) {
      const ev = shakuScore[index % shakuScore.length];
      const cycle = Math.floor(index / shakuScore.length);
      return origin + cycle * shakuLoop + ev[0] * BEAT;
    }

    let nextKoto = kotoTime(0);
    let nextShaku = shakuTime(0);

    window.setInterval(function () {
      const horizon = ctx.currentTime + 1.4;
      while (nextKoto < horizon) {
        const ev = kotoScore[kotoAt % kotoScore.length];
        koto(nextKoto, midi(YO[ev[1]]));
        kotoAt += 1;
        nextKoto = kotoTime(kotoAt);
      }
      while (nextShaku < horizon) {
        const ev = shakuScore[shakuAt % shakuScore.length];
        shaku(nextShaku, midi(YO[ev[1]]), ev[2]);
        shakuAt += 1;
        nextShaku = shakuTime(shakuAt);
      }
    }, 400);
  }

  function begin() {
    if (started) {
      if (ctx && ctx.state === "suspended") ctx.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    noiseBuf = noiseBuffer();
    master = ctx.createGain();
    master.gain.value = 0.9;
    const tone = ctx.createBiquadFilter();
    tone.type = "lowpass";
    tone.frequency.value = 3400;
    master.connect(tone);
    tone.connect(ctx.destination);
    started = true;
    const t0 = ctx.currentTime + 0.08;
    drone(t0);
    arm(t0);
  }

  window.addEventListener("pointerdown", begin);
  window.addEventListener("keydown", begin);
})();
