// Ctrl+` draws a walk polygon on #play and copies the points.
(function () {
  const play = document.getElementById("play");
  if (!play) return;

  const PLAY_W = 1730;
  const PLAY_H = 1143;
  const overlay = document.createElement("canvas");
  overlay.width = PLAY_W;
  overlay.height = PLAY_H;
  overlay.setAttribute("aria-hidden", "true");
  overlay.style.cssText = [
    "position:absolute",
    "inset:0",
    "width:100%",
    "height:100%",
    "z-index:30",
    "display:none",
    "cursor:crosshair",
    "image-rendering:pixelated"
  ].join(";");
  play.appendChild(overlay);

  const ctx = overlay.getContext("2d");
  let on = false;
  let points = [];

  function toPlay(event) {
    const rect = play.getBoundingClientRect();
    return [
      Math.round(((event.clientX - rect.left) / rect.width) * PLAY_W),
      Math.round(((event.clientY - rect.top) / rect.height) * PLAY_H)
    ];
  }

  function draw(hover) {
    ctx.clearRect(0, 0, PLAY_W, PLAY_H);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#f0d48a";
    ctx.fillStyle = "#f0d48a";
    ctx.font = "28px sans-serif";
    ctx.fillText("Polygon  ·  click points  ·  Enter copies  ·  Esc cancels", 24, 40);
    if (!points.length && !hover) return;
    ctx.beginPath();
    points.forEach((point, index) => {
      if (index === 0) ctx.moveTo(point[0], point[1]);
      else ctx.lineTo(point[0], point[1]);
    });
    if (hover) {
      const from = points.length ? points[points.length - 1] : hover;
      if (!points.length) ctx.moveTo(from[0], from[1]);
      else ctx.lineTo(hover[0], hover[1]);
    }
    ctx.stroke();
    for (const point of points) {
      ctx.beginPath();
      ctx.arc(point[0], point[1], points.length && point === points[0] ? 10 : 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function polygonText() {
    return "[\n" + points.map((point) => "  [" + point[0] + ", " + point[1] + "]").join(",\n") + "\n]";
  }

  function copy(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    const area = document.createElement("textarea");
    area.value = text;
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
    return Promise.resolve();
  }

  function finish() {
    if (points.length < 3) return;
    const value = polygonText();
    copy(value).then(() => {
      on = false;
      points = [];
      overlay.style.display = "none";
      ctx.clearRect(0, 0, PLAY_W, PLAY_H);
    });
  }

  function setOn(next) {
    on = next;
    points = [];
    overlay.style.display = on ? "block" : "none";
    if (on) {
      for (const key of ["w", "a", "s", "d"]) {
        window.dispatchEvent(new KeyboardEvent("keyup", { key, bubbles: true }));
      }
      draw();
    } else {
      ctx.clearRect(0, 0, PLAY_W, PLAY_H);
    }
  }

  function toolKey(event) {
    return (event.code === "Backquote" && (event.ctrlKey || event.metaKey) && !event.altKey)
      || event.key === "Escape"
      || event.key === "Enter"
      || event.key === "Backspace"
      || event.code === "Minus"
      || event.code === "Equal"
      || (event.code === "KeyZ" && (event.ctrlKey || event.metaKey) && !event.shiftKey);
  }

  function nudgeScale(direction) {
    const figure = window.actor;
    if (!figure) return;
    const next = Math.max(0.2, Math.round((figure.scale + direction * 0.05) * 100) / 100);
    figure.setScale(next);
    const text = "scale: " + next + "\nplayer_pos: [" + Math.round(figure.x) + ", " + Math.round(figure.y) + "]";
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text);
  }

  // Capture phase, so Walk, Look, and the other verbs never see these events.
  document.addEventListener("keydown", (event) => {
    if (!on || toolKey(event)) return;
    event.preventDefault();
    event.stopPropagation();
  }, true);

  document.addEventListener("click", (event) => {
    if (!on || event.target === overlay) return;
    event.preventDefault();
    event.stopPropagation();
  }, true);

  window.addEventListener("keydown", (event) => {
    if (event.code === "Backquote" && (event.ctrlKey || event.metaKey) && !event.altKey) {
      event.preventDefault();
      setOn(!on);
      return;
    }
    if (!on) return;
    if (event.key === "Escape") {
      event.preventDefault();
      setOn(false);
    } else if (event.key === "Enter") {
      event.preventDefault();
      finish();
    } else if (event.key === "Backspace" || (event.code === "KeyZ" && (event.ctrlKey || event.metaKey))) {
      event.preventDefault();
      points.pop();
      draw();
    } else if (event.code === "Minus") {
      event.preventDefault();
      nudgeScale(-1);
    } else if (event.code === "Equal") {
      event.preventDefault();
      nudgeScale(1);
    }
  });

  overlay.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
  });

  overlay.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const point = toPlay(event);
    if (points.length >= 3) {
      const [x, y] = points[0];
      if (Math.hypot(point[0] - x, point[1] - y) < 22) {
        finish();
        return;
      }
    }
    points.push(point);
    draw();
  });

  overlay.addEventListener("pointermove", (event) => {
    if (on) draw(toPlay(event));
  });
})();
