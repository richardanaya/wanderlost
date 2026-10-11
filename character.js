// A character is a set of named animations drawn from a manifest.
// The element's origin is the bottom center of the feet: set x and y
// and the soles stand on that point. Frames are windows on one square
// atlas (see characters/adventurer/character.json).
//
//   const hero = await Character.load("characters/adventurer/character.json");
//   stage.append(hero.element);
//   hero.play("walk").position(200, 400).setScale(0.5);
//   hero.update(deltaSeconds);

// 15-bit lookup: each 8-step RGB cube maps to the nearest palette index.
function colorLut(palette) {
  const lut = new Uint8Array(32768);
  for (let i = 0; i < 32768; i++) {
    const r = (i & 31) * 8 + 4;
    const g = ((i >> 5) & 31) * 8 + 4;
    const b = ((i >> 10) & 31) * 8 + 4;
    let best = 0;
    let bestDist = Infinity;
    for (let p = 0; p < palette.length; p++) {
      const color = palette[p];
      const dr = r - color[0];
      const dg = g - color[1];
      const db = b - color[2];
      const dist = dr * dr + dg * dg + db * db;
      if (dist < bestDist) {
        bestDist = dist;
        best = p;
      }
    }
    lut[i] = best;
  }
  return lut;
}

class Character {
  static async #loadSheet(src) {
    const image = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Could not load " + src));
      img.src = src;
    });
    // Near-pure magenta goes first, including holes between limbs.
    // Then pink that touches that hole, one pixel deep, so the blended
    // outline does not stay magenta. Interior reds are not connected to it.
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = data.data;
    const width = canvas.width;
    const height = canvas.height;
    const count = width * height;

    function isPink(r, g, b) {
      const gap = (r + b) / 2 - g;
      return Math.abs(r - 255) + g + Math.abs(b - 255) < 90
        || (r > 175 && b > 155 && g < 145 && gap > 40 && Math.abs(r - b) < 70);
    }

    for (let i = 0; i < count; i++) {
      const o = i * 4;
      if (pixels[o + 3] === 0) continue;
      const r = pixels[o];
      const g = pixels[o + 1];
      const b = pixels[o + 2];
      if (Math.abs(r - 255) + g + Math.abs(b - 255) < 90) pixels[o + 3] = 0;
    }
    const kill = [];
    for (let i = 0; i < count; i++) {
      if (pixels[i * 4 + 3] !== 0) continue;
      const x = i % width;
      const y = (i - x) / width;
      const neighbors = [];
      if (y > 0) neighbors.push(i - width);
      if (y < height - 1) neighbors.push(i + width);
      if (x > 0) neighbors.push(i - 1);
      if (x < width - 1) neighbors.push(i + 1);
      for (const n of neighbors) {
        const o = n * 4;
        if (pixels[o + 3] === 0) continue;
        if (isPink(pixels[o], pixels[o + 1], pixels[o + 2])) kill.push(n);
      }
    }
    for (const n of kill) pixels[n * 4 + 3] = 0;
    for (let i = 0; i < count; i++) {
      const o = i * 4;
      if (pixels[o + 3] === 0) continue;
      const x = i % width;
      const y = (i - x) / width;
      const touches = (
        (y > 0 && pixels[(i - width) * 4 + 3] === 0)
        || (y < height - 1 && pixels[(i + width) * 4 + 3] === 0)
        || (x > 0 && pixels[(i - 1) * 4 + 3] === 0)
        || (x < width - 1 && pixels[(i + 1) * 4 + 3] === 0)
      );
      if (!touches) continue;
      const r = pixels[o];
      const g = pixels[o + 1];
      const b = pixels[o + 2];
      if (!(r > g && b > g)) continue;
      const excess = Math.max(0, (r + b) / 2 - g - 12);
      pixels[o] = Math.max(0, r - excess);
      pixels[o + 2] = Math.max(0, b - excess);
    }
    for (let i = 0; i < count; i++) {
      if (pixels[i * 4 + 3] === 0) {
        pixels[i * 4] = 0;
        pixels[i * 4 + 1] = 0;
        pixels[i * 4 + 2] = 0;
      }
    }
    // Drop the white grid. A line that is white across the sheet is the grid,
    // not the costume, so it can be cleared even when the clip sits against it.
    const whiteCol = new Uint8Array(width);
    const whiteRow = new Uint8Array(height);
    for (let x = 0; x < width; x++) {
      let n = 0;
      for (let y = 0; y < height; y++) {
        const o = (y * width + x) * 4;
        if (pixels[o] > 240 && pixels[o + 1] > 235 && pixels[o + 2] > 240) n++;
      }
      if (n > height * 0.4) whiteCol[x] = 1;
    }
    for (let y = 0; y < height; y++) {
      let n = 0;
      for (let x = 0; x < width; x++) {
        const o = (y * width + x) * 4;
        if (pixels[o] > 240 && pixels[o + 1] > 235 && pixels[o + 2] > 240) n++;
      }
      if (n > width * 0.4) whiteRow[y] = 1;
    }
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (!whiteCol[x] && !whiteRow[y]) continue;
        const o = (y * width + x) * 4;
        pixels[o] = pixels[o + 1] = pixels[o + 2] = pixels[o + 3] = 0;
      }
    }
    ctx.putImageData(data, 0, 0);
    return canvas;
  }

  static async load(url) {
    const manifest = await fetch(url).then((response) => {
      if (!response.ok) throw new Error("Could not load " + url);
      return response.json();
    });
    if (!manifest.atlas) throw new Error("Character manifest has no atlas: " + url);
    const sheets = { main: await Character.#loadSheet(manifest.atlas.src) };
    if (manifest.extended) sheets.extended = await Character.#loadSheet(manifest.extended.src);
    if (manifest.sheets) {
      for (const [name, sheet] of Object.entries(manifest.sheets)) {
        sheets[name] = await Character.#loadSheet(sheet.src);
      }
    }
    manifest._sheets = sheets;
    return new Character(manifest, sheets.main);
  }

  constructor(manifest, atlas) {
    this.manifest = manifest;
    this.atlas = atlas;
    this.sheets = (manifest && manifest._sheets) || { main: atlas };
    this.x = 0;
    this.y = 0;
    this.scale = 1;
    this.facing = 1;
    this.animationName = null;
    this.animation = null;
    this.frameIndex = 0;
    this.accum = 0;
    this.element = document.createElement("canvas");
    this.element.className = "character";
    this.ctx = this.element.getContext("2d");
  }

  play(name) {
    const animation = this.manifest.animations[name];
    if (!animation) throw new Error("Unknown animation: " + name);
    this.animationName = name;
    this.animation = animation;
    this.frameIndex = 0;
    this.accum = 0;
    this.#show();
    return this;
  }

  position(x, y) {
    this.x = x;
    this.y = y;
    this.#place();
    return this;
  }

  setScale(scale) {
    this.scale = scale;
    if (this.animation) this.#show();
    this.#place();
    return this;
  }

  face(direction) {
    this.facing = direction < 0 ? -1 : 1;
    if (this.animation) this.#show();
    this.#place();
    return this;
  }

  // Snap opaque atlas pixels to a shared [r, g, b] list. Transparent stays empty.
  limitColors(palette) {
    for (const canvas of Object.values(this.sheets)) {
    const ctx = canvas.getContext("2d");
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = data.data;
    const lut = colorLut(palette);
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i + 3] === 0) continue;
      const index = lut[(pixels[i] >> 3) | ((pixels[i + 1] >> 3) << 5) | ((pixels[i + 2] >> 3) << 10)];
      const color = palette[index];
      pixels[i] = color[0];
      pixels[i + 1] = color[1];
      pixels[i + 2] = color[2];
    }
    ctx.putImageData(data, 0, 0);
    }
    if (this.animation) this.#show();
    return this;
  }

  update(dt) {
    const animation = this.animation;
    if (!animation || animation.frames.length < 2) return;
    this.accum += dt;
    const step = 1 / (animation.fps || 8);
    let changed = false;
    while (this.accum >= step) {
      this.accum -= step;
      this.frameIndex += 1;
      if (this.frameIndex >= animation.frames.length) {
        this.frameIndex = animation.loop ? 0 : animation.frames.length - 1;
        if (!animation.loop) this.accum = 0;
      }
      changed = true;
    }
    if (changed) this.#show();
  }

  #show() {
    const id = this.animation.frames[this.frameIndex];
    const frame = this.manifest.frames[id];
    this.frameId = id;
    const inset = 2;
    const sw = frame.w - inset * 2;
    const sh = frame.h - inset * 2;
    const fit = frame.fit || 1;
    const dw = Math.max(1, Math.round(sw * this.scale * fit));
    const dh = Math.max(1, Math.round(sh * this.scale * fit));
    const canvas = this.element;
    if (canvas.width !== dw || canvas.height !== dh) {
      canvas.width = dw;
      canvas.height = dh;
    }
    canvas.style.width = dw + "px";
    canvas.style.height = dh + "px";
    const ax = (frame.ax - inset) / sw * dw;
    const ay = (frame.ay - inset) / sh * dh;
    canvas.style.marginLeft = (this.facing < 0 ? -(dw - ax) : -ax) + "px";
    canvas.style.marginTop = -ay + "px";

    const ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, dw, dh);
    if (this.facing < 0) ctx.setTransform(-1, 0, 0, 1, dw, 0);
    const sheet = this.sheets[frame.sheet || "main"] || this.atlas;
    ctx.drawImage(sheet, frame.x + inset, frame.y + inset, sw, sh, 0, 0, dw, dh);
  }

  #place() {
    this.element.style.left = this.x + "px";
    this.element.style.top = this.y + "px";
  }
}
