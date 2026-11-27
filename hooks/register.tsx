import type { Register, ThemeResult, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'

// Night Circuit: a neon night-city look. Blue-black panels, a hazard-yellow
// accent, and cyan / red / green / amber as signal colors. Dark only: the idea
// is a city at night, so there is no daytime half.
const YELLOW = '#f7e600'
const CYAN = '#16d6f0'
const RED = '#ff2d55'
const GREEN = '#22e08f'
const AMBER = '#ff9d1c'
const MAGENTA = '#e389ff'
const EDGE = '#7df3ff'

const SCENE_NAME = 'night-circuit'

const { theme, problems } = makeColors({
  label: 'Night Circuit',
  only: 'dark',
  contrast: 'more',
  // Code is colored from these: keywords yellow, strings green, literals cyan,
  // names red, variables amber.
  roles: { accent: YELLOW, danger: RED, success: GREEN, warning: AMBER, pro: CYAN },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#090a10',
        // Boxes: cards, panels and menus are a deep navy, a step apart from
        // the blue-black page, so each reads as a lit panel.
        'surface-1': '#0c1120',
        'surface-2': '#101829',
        'surface-3': '#141d31',
        'text-primary': '#e9f6f4',
        'text-secondary': '#b4cbcd',
        'text-muted': '#8aa3a8',
      },
      // Every border, focus ring and track is this color at low opacity, so
      // the edge of each box is a cyan line instead of a gray one.
      stops: { 0: EDGE },
    },
    git: {
      added: GREEN,
      removed: RED,
      modified: CYAN,
      merged: MAGENTA,
      closed: '#ff6b86',
      conflicting: AMBER,
      draft: '#8aa3a8',
    },
  },
})

// HOW THE DESKTOP APP DRAWS A BACKDROP (read from its live code, Nov 2026).
//
// Only a short allowlist of built-in scenes may animate inside the frame.
// Every other scene is drawn STILL there (the app removes every animation and
// SMIL element), and its motion is played by the app's own player: the same
// markup shown as an image, given the window's width and height. The player
// takes a drawing only if:
//   - it is well-formed XML made of plain SVG shapes, gradients, patterns,
//     clip paths, text and <style>;
//   - its CSS has no @media rule other than prefers-reduced-motion or
//     prefers-color-scheme. Window-size rules (min-width, aspect-ratio) get
//     the whole drawing refused, and it then never moves;
//   - it has no viewport units, backslashes, external urls, or the
//     shape-rendering / vector-effect properties.
// While it plays, the app samples it every frame and stops it for good if it
// flashes (a pixel changing brightness four times within a second, over a
// quarter of a 341 x 256 pixel area) or costs more than 5.5 ms a frame.
//
// So this drawing has no viewBox and no size rules. One unit is one pixel, and
// everything hangs from the window's edges through nested <svg> elements
// placed with percentages: x="100%" is the right edge, y="100%" the bottom.
//
// The sidebar and the right panel sit on top of the backdrop, so the frame is
// drawn around the middle column: a red side just right of the sidebar, a
// yellow side just left of the right panel.
const SIDEBAR_PX = 288
const RIGHT_PANEL_PX = 313
// The frame's parts are drawn in art units; this is how many pixels one is.
const UNIT = 1.85

// One corner bracket of the frame: a thick chamfered wedge, its cyan glitch
// ghost, a thin inner line and the light that runs along it. Drawn for a
// top-left corner; `flip` mirrors it for a bottom one.
const corner = (color: string, flip: boolean, late: boolean): string => {
  const b = late ? ' b' : ''
  const wedge = '5,58 5,24 23,6 72,6 72,11 25.1,11 10,26.1 10,58'
  const inner = 'M16 70V30L30 16H80'

  return `<g${flip ? ' transform="scale(1,-1)"' : ''}>
<polygon class="ghost${b}" points="${wedge}" fill="${CYAN}"/>
<polygon class="wedge${b}" points="${wedge}" fill="${color}"/>
<path d="${inner}" fill="none" stroke="${color}" stroke-width=".8" opacity=".5"/>
<path class="run${b}" d="${inner}" pathLength="100" fill="none" stroke="${color}" stroke-width="2" stroke-dasharray="14 86"/>
</g>`
}

// A column of slanted hazard bars, 8 apart.
const bars = (x: number, y: number, count: number, fill: string): string => {
  let out = ''

  for (let i = 0; i < count; i++) {
    const top = y + i * 8

    out += `<polygon points="${x},${top + 5} ${x + 11},${top} ${x + 11},${top + 4} ${x},${top + 9}" fill="${fill}"/>`
  }

  return out
}

// A ruler running down: short ticks, a longer one every fifth.
const ruler = (x: number, y: number, count: number, stroke: string): string => {
  let out = ''

  for (let i = 0; i < count; i++) {
    out += `<line x1="${x}" y1="${y + i * 6}" x2="${x + (i % 5 === 0 ? 7 : 3.5)}" y2="${y + i * 6}" stroke="${stroke}" stroke-width=".8"/>`
  }

  return out
}

// A column of small lights that blink one after another.
const lights = (x: number, y: number, color: string): string => {
  let out = ''

  for (let i = 0; i < 5; i++) {
    out += `<rect class="pulse d${i}" x="${x}" y="${y + i * 9}" width="5.5" height="5.5" fill="${i === 4 ? CYAN : color}"/>`
  }

  return out
}

// The top of one side, drawn as a left side whose x = 0 is the panel's edge
// and y = 0 the top of the backdrop: the rail, a light dropping down it, the
// top bracket, marching hazard bars and the blinking lights.
const sideTop = (color: string, detail: string, late: boolean): string => {
  const b = late ? ' b' : ''

  return `<g transform="translate(4,0)">
<rect x="0" y="0" width="54" height="3000" fill="url(#gridU)" opacity=".22"/>
<path d="M7.5 0V3000" stroke="${color}" stroke-width=".8" opacity=".4"/>
<rect x="6" y="-50" width="3" height="40" fill="${color}"><animate attributeName="y" from="-50" to="1200" dur="${late ? '7.5s' : '6s'}" repeatCount="indefinite"/></rect>
${corner(color, false, late)}
<g clip-path="url(#barsTop)" opacity=".9"><g class="march${b}">${bars(16, 76, 9, detail)}</g></g>
${lights(17, 170, color)}
</g>`
}

// The bottom of one side, whose y = 0 is the bottom of the backdrop: the
// bottom bracket and a ruler with a pointer sliding along it.
const sideBottom = (color: string, late: boolean): string => {
  const b = late ? ' b' : ''

  return `<g transform="translate(4,0)">
${corner(color, true, !late)}
<g opacity=".75">${ruler(16, -160, 13, CYAN)}</g>
<polygon class="seek${b}" points="26,-163 26,-157 32,-160" fill="${CYAN}"/>
</g>`
}

// Where each corner of the frame hangs: the window edge it is measured from,
// then the panel it clears, then the art-unit scale (mirrored on the right).
const LEFT = `translate(${SIDEBAR_PX},0)`
const RIGHT = `translate(${-RIGHT_PANEL_PX},0)`
const leftArt = `${LEFT} scale(${UNIT})`
const rightArt = `${RIGHT} scale(${-UNIT},${UNIT})`

// What moves: a light runs along each bracket and drops down each rail, the
// hazard bars march, the small lights blink in turn, a pointer slides along
// each ruler, the brackets glitch now and then, the glows breathe, and a scan
// line sweeps down. Every fifty seconds the whole screen glitches for a third
// of a second: the frame jolts sideways and thin colored bands tear across,
// each band lighting once so no spot flickers.
//
// Whatever only makes sense in motion (the scan line, the tear bands, the
// ghosts, the dropping lights) rests invisible or off-screen and is shown by
// its animation, so the still drawing the app keeps underneath is a clean
// frame.
const SCENE = `<svg xmlns="http://www.w3.org/2000/svg">
<style>
.jolt{animation:jolt 50s steps(1,end) infinite}
@keyframes jolt{0%,100%{transform:translate(0,0)}62%{transform:translate(-9px,0)}62.216%{transform:translate(7px,1px)}62.432%{transform:translate(-4px,0)}62.648%{transform:translate(0,0)}}
.tear{opacity:0;animation:tearA 50s steps(1,end) infinite}
.tear.b{animation-name:tearB}
.tear.c{animation-name:tearC}
@keyframes tearA{0%,100%{opacity:0}62%{opacity:.5}62.216%{opacity:0}}
@keyframes tearB{0%,100%{opacity:0}62.216%{opacity:.45}62.432%{opacity:0}}
@keyframes tearC{0%,100%{opacity:0}62.432%{opacity:.4}62.648%{opacity:0}}
.flash{opacity:0;animation:flash 50s steps(1,end) infinite}
@keyframes flash{0%,100%{opacity:0}62%{opacity:.05}62.216%{opacity:0}}
.run{animation:run 3.5s linear infinite}
.run.b{animation-duration:4.4s}
@keyframes run{from{stroke-dashoffset:100}to{stroke-dashoffset:0}}
.march{animation:march .8s linear infinite}
.march.b{animation-direction:reverse}
@keyframes march{from{transform:translateY(0)}to{transform:translateY(8px)}}
.seek{animation:seek 4s ease-in-out infinite alternate}
.seek.b{animation-duration:3s}
@keyframes seek{from{transform:translateY(0)}to{transform:translateY(72px)}}
.pulse{animation:pulse 1.8s ease-in-out infinite}
.pulse.d1{animation-delay:.3s}.pulse.d2{animation-delay:.6s}.pulse.d3{animation-delay:.9s}.pulse.d4{animation-delay:1.2s}
@keyframes pulse{0%,100%{opacity:.2}35%{opacity:1}70%{opacity:.2}}
.ghost{opacity:0;animation:ghost 50s steps(1,end) infinite}
.ghost.b{animation-delay:3.2s}
@keyframes ghost{0%,100%{opacity:0}90%{opacity:.75;transform:translate(-5px,0)}90.28%{opacity:0}}
.wedge{animation:wedge 50s steps(1,end) infinite}
.wedge.b{animation-delay:3.2s}
@keyframes wedge{0%,100%{opacity:1}90%{opacity:.5}90.28%{opacity:1}}
.breathe{animation:breathe 7s ease-in-out infinite}
.breathe.b{animation-duration:9s}
@keyframes breathe{0%,100%{opacity:.55}50%{opacity:1}}
@media (prefers-reduced-motion:reduce){.run,.ghost,.tear,.flash{display:none}.march,.seek,.pulse,.wedge,.breathe,.jolt{animation:none}}
</style>
<defs>
<pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0H0V48" fill="none" stroke="${CYAN}" stroke-width="1"/></pattern>
<pattern id="gridU" width="26" height="26" patternUnits="userSpaceOnUse"><path d="M26 0H0V26" fill="none" stroke="${CYAN}" stroke-width=".55"/></pattern>
<radialGradient id="glowY"><stop offset="0" stop-color="${YELLOW}" stop-opacity=".22"/><stop offset="1" stop-color="${YELLOW}" stop-opacity="0"/></radialGradient>
<radialGradient id="glowR"><stop offset="0" stop-color="${RED}" stop-opacity=".24"/><stop offset="1" stop-color="${RED}" stop-opacity="0"/></radialGradient>
<radialGradient id="glowC"><stop offset="0" stop-color="${CYAN}" stop-opacity=".12"/><stop offset="1" stop-color="${CYAN}" stop-opacity="0"/></radialGradient>
<radialGradient id="glowM"><stop offset="0" stop-color="${MAGENTA}" stop-opacity=".1"/><stop offset="1" stop-color="${MAGENTA}" stop-opacity="0"/></radialGradient>
<linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${CYAN}" stop-opacity="0"/><stop offset="1" stop-color="${CYAN}" stop-opacity=".1"/></linearGradient>
<clipPath id="barsTop"><rect x="16" y="78" width="11" height="68"/></clipPath>
</defs>
<rect width="100%" height="100%" fill="#07080d"/>
<rect width="100%" height="100%" fill="url(#grid)" opacity=".07"/>
<g transform="${LEFT}"><circle r="400" fill="url(#glowM)"/></g>
<svg y="100%" overflow="visible"><g transform="${LEFT}"><circle class="breathe b" r="630" fill="url(#glowR)"/></g></svg>
<svg x="100%" overflow="visible"><g transform="${RIGHT}"><circle class="breathe" r="630" fill="url(#glowY)"/></g></svg>
<svg x="100%" y="100%" overflow="visible"><g transform="${RIGHT}"><circle r="480" fill="url(#glowC)"/></g></svg>
<svg y="-16%" width="100%" height="152" overflow="visible"><animate attributeName="y" from="-16%" to="102%" dur="12s" repeatCount="indefinite"/><rect width="100%" height="150" fill="url(#beam)"/><rect y="150" width="100%" height="1.6" fill="${CYAN}" opacity=".4"/></svg>
<g class="jolt">
<g transform="${leftArt}">${sideTop(RED, MAGENTA, false)}</g>
<svg y="100%" overflow="visible"><g transform="${leftArt}">${sideBottom(RED, false)}</g></svg>
<svg x="100%" overflow="visible"><g transform="${rightArt}">${sideTop(YELLOW, YELLOW, true)}</g></svg>
<svg x="100%" y="100%" overflow="visible"><g transform="${rightArt}">${sideBottom(YELLOW, true)}</g></svg>
</g>
<rect class="flash" width="100%" height="100%" fill="${CYAN}"/>
<rect class="tear" x="0" y="12%" width="100%" height="22" fill="${CYAN}"/>
<rect class="tear b" x="26%" y="27%" width="74%" height="7" fill="${RED}"/>
<rect class="tear c" x="0" y="43%" width="62%" height="30" fill="${CYAN}"/>
<rect class="tear" x="14%" y="61%" width="86%" height="9" fill="${YELLOW}"/>
<rect class="tear b" x="0" y="77%" width="100%" height="15" fill="${MAGENTA}"/>
<rect class="tear c" x="38%" y="90%" width="62%" height="6" fill="${CYAN}"/>
</svg>`

const LOOK: ThemeSetArgs = {
  colors: theme,
  // A light navy frost: the frame and its motion still show through a panel
  // that lets the backdrop through, and the words over it keep their contrast.
  backdrop: { scene: SCENE_NAME, glass: { blur: 5, tint: '#0a0f1c', opacity: 0.6 } },
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    // The one kind of problem that stops Desktop painting the colors at all.
    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))

    if (unpainted !== undefined) {
      $.ui.toast(unpainted)
    }
    // Claude Code 2.1.321 and 2.1.322 throw on any backdrop ("id is 1 to 64 of
    // letters, digits, _ or - (host check)"), which threw away the colors too.
    // On a throw, set the colors alone so those builds still get the palette.
    let set: ThemeResult

    try {
      set = await $.theme.set(LOOK)
    } catch (err) {
      set = await $.theme.set({ colors: LOOK.colors })
      $.ui.log(`Night Circuit: backdrop refused (${err instanceof Error ? err.message : String(err)}); colors only.`)
    }

    if (!set.isDrawn) {
      $.ui.status(set.reason)
    }

    return next(e)
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if (e.surface !== 'desktop' && e.surface !== 'mobile') {
      return next(e)
    }
    if (e.props.scene !== SCENE_NAME) {
      return next(e)
    }
    const { Svg } = $.ui.resolve(e)

    return <Svg source={SCENE} alt="A dark frame around the conversation: a red rail on the left, a yellow rail on the right, angular corner brackets and a slow cyan scan line" isInteractive />
  })
}
