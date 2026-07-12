/* Dot-matrix renderer for Technicalities 2.0.
 *
 * Two jobs:
 *   1. The homepage hero — a simulated flip-dot display that "boots up" and
 *      spells the site title, with ambient shimmer and a cursor-reactive field.
 *   2. Small 5×7 glyph badges next to each index row (first letter of the post).
 *
 * No dependencies. Everything is plain canvas 2D.
 */
(function () {
    "use strict";

    /* 5×7 pixel font (classic HD44780-style). Each glyph is 7 rows of 5 bits. */
    var FONT = {
        "A": [0x0E, 0x11, 0x11, 0x1F, 0x11, 0x11, 0x11],
        "B": [0x1E, 0x11, 0x11, 0x1E, 0x11, 0x11, 0x1E],
        "C": [0x0E, 0x11, 0x10, 0x10, 0x10, 0x11, 0x0E],
        "D": [0x1E, 0x11, 0x11, 0x11, 0x11, 0x11, 0x1E],
        "E": [0x1F, 0x10, 0x10, 0x1E, 0x10, 0x10, 0x1F],
        "F": [0x1F, 0x10, 0x10, 0x1E, 0x10, 0x10, 0x10],
        "G": [0x0E, 0x11, 0x10, 0x13, 0x11, 0x11, 0x0F],
        "H": [0x11, 0x11, 0x11, 0x1F, 0x11, 0x11, 0x11],
        "I": [0x0E, 0x04, 0x04, 0x04, 0x04, 0x04, 0x0E],
        "J": [0x07, 0x02, 0x02, 0x02, 0x02, 0x12, 0x0C],
        "K": [0x11, 0x12, 0x14, 0x18, 0x14, 0x12, 0x11],
        "L": [0x10, 0x10, 0x10, 0x10, 0x10, 0x10, 0x1F],
        "M": [0x11, 0x1B, 0x15, 0x15, 0x11, 0x11, 0x11],
        "N": [0x11, 0x19, 0x15, 0x13, 0x11, 0x11, 0x11],
        "O": [0x0E, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0E],
        "P": [0x1E, 0x11, 0x11, 0x1E, 0x10, 0x10, 0x10],
        "Q": [0x0E, 0x11, 0x11, 0x11, 0x15, 0x12, 0x0D],
        "R": [0x1E, 0x11, 0x11, 0x1E, 0x14, 0x12, 0x11],
        "S": [0x0F, 0x10, 0x10, 0x0E, 0x01, 0x01, 0x1E],
        "T": [0x1F, 0x04, 0x04, 0x04, 0x04, 0x04, 0x04],
        "U": [0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0E],
        "V": [0x11, 0x11, 0x11, 0x11, 0x11, 0x0A, 0x04],
        "W": [0x11, 0x11, 0x11, 0x15, 0x15, 0x15, 0x0A],
        "X": [0x11, 0x11, 0x0A, 0x04, 0x0A, 0x11, 0x11],
        "Y": [0x11, 0x11, 0x0A, 0x04, 0x04, 0x04, 0x04],
        "Z": [0x1F, 0x01, 0x02, 0x04, 0x08, 0x10, 0x1F],
        "0": [0x0E, 0x11, 0x13, 0x15, 0x19, 0x11, 0x0E],
        "1": [0x04, 0x0C, 0x04, 0x04, 0x04, 0x04, 0x0E],
        "2": [0x0E, 0x11, 0x01, 0x02, 0x04, 0x08, 0x1F],
        "3": [0x1E, 0x01, 0x01, 0x0E, 0x01, 0x01, 0x1E],
        "4": [0x02, 0x06, 0x0A, 0x12, 0x1F, 0x02, 0x02],
        "5": [0x1F, 0x10, 0x1E, 0x01, 0x01, 0x11, 0x0E],
        "6": [0x06, 0x08, 0x10, 0x1E, 0x11, 0x11, 0x0E],
        "7": [0x1F, 0x01, 0x02, 0x04, 0x08, 0x08, 0x08],
        "8": [0x0E, 0x11, 0x11, 0x0E, 0x11, 0x11, 0x0E],
        "9": [0x0E, 0x11, 0x11, 0x0F, 0x01, 0x02, 0x0C],
        ".": [0x00, 0x00, 0x00, 0x00, 0x00, 0x0C, 0x0C],
        "-": [0x00, 0x00, 0x00, 0x0E, 0x00, 0x00, 0x00],
        ":": [0x00, 0x0C, 0x0C, 0x00, 0x0C, 0x0C, 0x00],
        "/": [0x01, 0x01, 0x02, 0x04, 0x08, 0x10, 0x10],
        " ": [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]
    };

    var GLYPH_ROWS = 7;
    var GLYPH_COLS = 5;
    var CHAR_PITCH = GLYPH_COLS + 1; // one blank column between characters

    var AMBER = { red: 255, green: 170, blue: 51 };
    var BONE = { red: 228, green: 223, blue: 211 };

    var reducedMotion =
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        window.location.hash === "#static";

    function rgba(color, alpha) {
        return "rgba(" + color.red + "," + color.green + "," + color.blue + "," + alpha + ")";
    }

    /* ---------------------------------------------------------------------
     * Hero matrix
     * ------------------------------------------------------------------- */

    function buildHero(container) {
        var canvas = container.querySelector("canvas");
        if (!canvas) {
            canvas = document.createElement("canvas");
            container.appendChild(canvas);
        }
        var context = canvas.getContext("2d");
        var text = (container.getAttribute("data-text") || "").toUpperCase();
        var splitAttr = container.getAttribute("data-split") || text;
        var splitLines = splitAttr.toUpperCase().split("|");

        var grid = null;          // { cols, rows, pitch, dots[] }
        var bootStart = null;     // timestamp when the boot sweep began
        var booted = reducedMotion;
        var pointer = { x: -9999, y: -9999 };
        var animationHandle = null;

        function layout() {
            var width = container.clientWidth;
            if (width === 0) { return; }

            // Try the whole title on one line; fall back to the split lines.
            var lines = [text];
            var padCols = 4;
            var oneLineCols = text.length * CHAR_PITCH - 1 + padCols * 2;
            if (width / oneLineCols < 7) {
                lines = splitLines;
            }

            var maxLineChars = 0;
            for (var lineIdx = 0; lineIdx < lines.length; lineIdx++) {
                maxLineChars = Math.max(maxLineChars, lines[lineIdx].length);
            }

            var neededCols = maxLineChars * CHAR_PITCH - 1 + padCols * 2;
            var pitch = Math.min(13, width / neededCols);
            var cols = Math.floor(width / pitch);

            var padRows = 5;
            var lineGap = 3;
            var rows = padRows * 2 +
                lines.length * GLYPH_ROWS +
                (lines.length - 1) * lineGap;

            // Which dots are "on": rasterise each line centred horizontally.
            var lit = {};
            for (var lineNum = 0; lineNum < lines.length; lineNum++) {
                var line = lines[lineNum];
                var lineCols = line.length * CHAR_PITCH - 1;
                var startCol = Math.floor((cols - lineCols) / 2);
                var startRow = padRows + lineNum * (GLYPH_ROWS + lineGap);
                for (var charIdx = 0; charIdx < line.length; charIdx++) {
                    var glyph = FONT[line.charAt(charIdx)] || FONT[" "];
                    for (var rowIdx = 0; rowIdx < GLYPH_ROWS; rowIdx++) {
                        for (var colIdx = 0; colIdx < GLYPH_COLS; colIdx++) {
                            if (glyph[rowIdx] & (1 << (GLYPH_COLS - 1 - colIdx))) {
                                var gridCol = startCol + charIdx * CHAR_PITCH + colIdx;
                                lit[(startRow + rowIdx) * cols + gridCol] = true;
                            }
                        }
                    }
                }
            }

            var dots = [];
            for (var row = 0; row < rows; row++) {
                for (var col = 0; col < cols; col++) {
                    dots.push({
                        col: col,
                        row: row,
                        on: !!lit[row * cols + col],
                        phase: Math.random() * Math.PI * 2,
                        jitter: Math.random() * 140
                    });
                }
            }

            grid = { cols: cols, rows: rows, pitch: pitch, dots: dots };

            var devicePixelRatio = window.devicePixelRatio || 1;
            var cssHeight = rows * pitch;
            canvas.width = Math.round(width * devicePixelRatio);
            canvas.height = Math.round(cssHeight * devicePixelRatio);
            canvas.style.height = cssHeight + "px";
            container.style.minHeight = cssHeight + "px";
            context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
        }

        function draw(timestamp) {
            if (!grid) { return; }
            var pitch = grid.pitch;
            var radius = pitch * 0.32;
            var sweepDurationMs = 1300;
            var sweepX = booted
                ? Infinity
                : ((timestamp - bootStart) / sweepDurationMs) * (grid.cols * pitch + 200);

            context.clearRect(0, 0, canvas.width, canvas.height);

            var timeSeconds = timestamp / 1000;
            var pointerRadius = pitch * 8;

            for (var dotIdx = 0; dotIdx < grid.dots.length; dotIdx++) {
                var dot = grid.dots[dotIdx];
                var dotX = dot.col * pitch + pitch / 2;
                var dotY = dot.row * pitch + pitch / 2;

                // Boot: dots to the right of the sweep are dark; dots just
                // behind it flicker for ~120ms before settling.
                var settled = booted;
                var flickering = false;
                if (!booted) {
                    var behind = sweepX - dotX - dot.jitter;
                    if (behind < 0) {
                        continue; // not reached yet
                    }
                    if (behind < 120) {
                        flickering = true;
                    } else {
                        settled = true;
                    }
                }

                var isOn = flickering ? Math.random() < 0.4 : (settled && dot.on);

                // Cursor field: nearby dots brighten and drift outward.
                var boost = 0;
                var offsetX = 0;
                var offsetY = 0;
                if (booted && !reducedMotion) {
                    var deltaX = dotX - pointer.x;
                    var deltaY = dotY - pointer.y;
                    var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                    if (distance < pointerRadius) {
                        boost = 1 - distance / pointerRadius;
                        var push = boost * boost * pitch * 0.45;
                        if (distance > 0.001) {
                            offsetX = (deltaX / distance) * push;
                            offsetY = (deltaY / distance) * push;
                        }
                    }
                }

                var alpha;
                var color;
                if (isOn) {
                    var pulse = reducedMotion ? 0 : Math.sin(timeSeconds * 1.4 + dot.phase) * 0.06;
                    alpha = 0.88 + pulse + boost * 0.12;
                    color = AMBER;
                    // Soft halo behind lit dots
                    context.fillStyle = rgba(AMBER, 0.10 + boost * 0.10);
                    context.beginPath();
                    context.arc(dotX + offsetX, dotY + offsetY, radius * 2.1, 0, Math.PI * 2);
                    context.fill();
                } else {
                    var shimmer = reducedMotion ? 0 : Math.sin(timeSeconds * 0.8 + dot.phase) * 0.03;
                    alpha = 0.07 + shimmer + boost * 0.5;
                    color = boost > 0.02 ? AMBER : BONE;
                }

                context.fillStyle = rgba(color, Math.max(0, Math.min(1, alpha)));
                context.beginPath();
                context.arc(dotX + offsetX, dotY + offsetY, radius * (1 + boost * 0.25), 0, Math.PI * 2);
                context.fill();
            }

            if (!booted && sweepX > grid.cols * pitch + 400) {
                booted = true;
            }
        }

        function loop(timestamp) {
            if (bootStart === null) { bootStart = timestamp; }
            draw(timestamp);
            animationHandle = window.requestAnimationFrame(loop);
        }

        function start() {
            layout();
            container.classList.add("is-live");
            if (reducedMotion) {
                booted = true;
                draw(0);
                return;
            }
            animationHandle = window.requestAnimationFrame(loop);
        }

        container.addEventListener("pointermove", function (event) {
            var bounds = canvas.getBoundingClientRect();
            pointer.x = event.clientX - bounds.left;
            pointer.y = event.clientY - bounds.top;
        });

        container.addEventListener("pointerleave", function () {
            pointer.x = -9999;
            pointer.y = -9999;
        });

        var resizeTimer = null;
        window.addEventListener("resize", function () {
            window.clearTimeout(resizeTimer);
            resizeTimer = window.setTimeout(function () {
                booted = true; // don't replay the boot on resize
                layout();
                if (reducedMotion) { draw(0); }
            }, 150);
        });

        document.addEventListener("visibilitychange", function () {
            if (reducedMotion) { return; }
            if (document.hidden && animationHandle !== null) {
                window.cancelAnimationFrame(animationHandle);
                animationHandle = null;
            } else if (!document.hidden && animationHandle === null) {
                animationHandle = window.requestAnimationFrame(loop);
            }
        });

        start();
    }

    /* ---------------------------------------------------------------------
     * Index glyph badges
     * ------------------------------------------------------------------- */

    function drawGlyph(canvas, character, litColor, litAlpha) {
        var context = canvas.getContext("2d");
        var devicePixelRatio = window.devicePixelRatio || 1;
        var cssWidth = canvas.clientWidth || 25;
        var cssHeight = canvas.clientHeight || 35;
        canvas.width = cssWidth * devicePixelRatio;
        canvas.height = cssHeight * devicePixelRatio;
        context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

        var pitch = cssWidth / GLYPH_COLS;
        var radius = pitch * 0.3;
        var glyph = FONT[character] || FONT[" "];

        context.clearRect(0, 0, cssWidth, cssHeight);
        for (var rowIdx = 0; rowIdx < GLYPH_ROWS; rowIdx++) {
            for (var colIdx = 0; colIdx < GLYPH_COLS; colIdx++) {
                var on = !!(glyph[rowIdx] & (1 << (GLYPH_COLS - 1 - colIdx)));
                context.fillStyle = on
                    ? rgba(litColor, litAlpha)
                    : rgba(BONE, 0.06);
                context.beginPath();
                context.arc(
                    colIdx * pitch + pitch / 2,
                    rowIdx * pitch + pitch / 2,
                    radius, 0, Math.PI * 2
                );
                context.fill();
            }
        }
    }

    function buildBadges() {
        var badges = document.querySelectorAll("canvas.log-glyph");
        for (var badgeIdx = 0; badgeIdx < badges.length; badgeIdx++) {
            (function (canvas) {
                var character = (canvas.getAttribute("data-char") || " ").toUpperCase();
                if (!FONT[character]) { character = " "; }

                drawGlyph(canvas, character, BONE, 0.55);

                var row = canvas.closest("a") || canvas;
                var flickerTimer = null;

                row.addEventListener("mouseenter", function () {
                    if (reducedMotion) {
                        drawGlyph(canvas, character, AMBER, 0.95);
                        return;
                    }
                    var flickerCount = 0;
                    window.clearInterval(flickerTimer);
                    flickerTimer = window.setInterval(function () {
                        flickerCount++;
                        drawGlyph(canvas, character, AMBER, 0.4 + Math.random() * 0.6);
                        if (flickerCount >= 5) {
                            window.clearInterval(flickerTimer);
                            drawGlyph(canvas, character, AMBER, 0.95);
                        }
                    }, 45);
                });

                row.addEventListener("mouseleave", function () {
                    window.clearInterval(flickerTimer);
                    drawGlyph(canvas, character, BONE, 0.55);
                });
            })(badges[badgeIdx]);
        }
    }

    function init() {
        var hero = document.querySelector(".matrix[data-text]");
        if (hero) { buildHero(hero); }
        buildBadges();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
