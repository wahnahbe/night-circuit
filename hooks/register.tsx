import type { Register, ThemeSetArgs } from 'claude-code'

// Night Circuit: a neon night-city frame behind the chat in the Claude desktop
// app. The theme sends a backdrop only, with no palette: the desktop app (as
// of Nov 27 2026) paints a theme's own colors as solid panels over its
// backdrop, so a palette hides the frame entirely. Anthropic's own
// theme-examples send a backdrop alone too. The app keeps its own colors and
// frosts its panels over the frame.
const YELLOW = '#f7e600'
const CYAN = '#16d6f0'
const RED = '#ff2d55'
const MAGENTA = '#e389ff'

const SCENE_NAME = 'night-circuit'

// HOW THE DESKTOP APP DRAWS A BACKDROP (Nov 2026).
//
// The scene follows the shape of Anthropic's theme-examples scenes: one root
// <svg> with a viewBox, width and height 100% and preserveAspectRatio
// "slice", animated with CSS only, with no nested <svg>, no overflow and no
// SMIL <animate>. An earlier version without those was not drawn at all.
// Custom scenes are played as an image by the app's own player, which also
// refuses @media rules other than prefers-reduced-motion and
// prefers-color-scheme, viewport units, backslashes, external urls and the
// shape-rendering / vector-effect properties. It stops a scene for good if it
// flashes or costs more than about 5.5 ms a frame.
//
// The viewBox is 1700 x 900, close to a desktop window's shape, so "slice"
// crops little. The sidebar and the right panel sit on top of the backdrop,
// so the frame is drawn around the middle column: a red side just right of
// the sidebar, a yellow side just left of the right panel.
const W = 1700
const H = 900
const LEFT_X = 252
const RIGHT_X = 1416
// The frame's parts are drawn in art units; this is how many viewBox units one is.
const UNIT = 1.65

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
<rect class="drop${b}" x="6" y="-50" width="3" height="40" fill="${color}"/>
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

// Where each side of the frame hangs, at the art-unit scale (mirrored on the
// right), for its top and its bottom.
const leftTop = `translate(${LEFT_X},0) scale(${UNIT})`
const leftBottom = `translate(${LEFT_X},${H}) scale(${UNIT})`
const rightTop = `translate(${RIGHT_X},0) scale(${-UNIT},${UNIT})`
const rightBottom = `translate(${RIGHT_X},${H}) scale(${-UNIT},${UNIT})`

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
const SCENE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
<style>
.drop{animation:drop 6s linear infinite}
.drop.b{animation-duration:7.5s}
@keyframes drop{from{transform:translateY(0)}to{transform:translateY(1250px)}}
.scan{animation:scan 12s linear infinite}
@keyframes scan{from{transform:translateY(-10px)}to{transform:translateY(${H + 160}px)}}
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
@media (prefers-reduced-motion:reduce){.run,.ghost,.tear,.flash,.drop,.scan{display:none}.march,.seek,.pulse,.wedge,.breathe,.jolt{animation:none}}
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
<rect width="${W}" height="${H}" fill="#07080d"/>
<rect width="${W}" height="${H}" fill="url(#grid)" opacity=".07"/>
<circle cx="${LEFT_X}" cy="0" r="400" fill="url(#glowM)"/>
<circle class="breathe b" cx="${LEFT_X}" cy="${H}" r="630" fill="url(#glowR)"/>
<circle class="breathe" cx="${RIGHT_X}" cy="0" r="630" fill="url(#glowY)"/>
<circle cx="${RIGHT_X}" cy="${H}" r="480" fill="url(#glowC)"/>
<g class="scan"><rect y="-150" width="${W}" height="150" fill="url(#beam)"/><rect y="0" width="${W}" height="1.6" fill="${CYAN}" opacity=".4"/></g>
<g class="jolt">
<g transform="${leftTop}">${sideTop(RED, MAGENTA, false)}</g>
<g transform="${leftBottom}">${sideBottom(RED, false)}</g>
<g transform="${rightTop}">${sideTop(YELLOW, YELLOW, true)}</g>
<g transform="${rightBottom}">${sideBottom(YELLOW, true)}</g>
</g>
<rect class="flash" width="${W}" height="${H}" fill="${CYAN}"/>
<rect class="tear" x="0" y="${0.12 * H}" width="${W}" height="22" fill="${CYAN}"/>
<rect class="tear b" x="${0.26 * W}" y="${0.27 * H}" width="${0.74 * W}" height="7" fill="${RED}"/>
<rect class="tear c" x="0" y="${0.43 * H}" width="${0.62 * W}" height="30" fill="${CYAN}"/>
<rect class="tear" x="${0.14 * W}" y="${0.61 * H}" width="${0.86 * W}" height="9" fill="${YELLOW}"/>
<rect class="tear b" x="0" y="${0.77 * H}" width="${W}" height="15" fill="${MAGENTA}"/>
<rect class="tear c" x="${0.38 * W}" y="${0.9 * H}" width="${0.62 * W}" height="6" fill="${CYAN}"/>
</svg>`

// The scene's name goes under two names, as Anthropic's theme-examples does:
// Claude Code 2.1.330 and later read `scene`, earlier builds read `id` (and
// refuse a backdrop without it). Each build drops the member it doesn't know.
// A light navy frost keeps the words over the frame readable.
const LOOK = {
  backdrop: { scene: SCENE_NAME, id: SCENE_NAME, glass: { blur: 5, tint: '#0a0f1c', opacity: 0.6 } },
} as unknown as ThemeSetArgs

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    try {
      const set = await $.theme.set(LOOK)

      if (!set.isDrawn) {
        $.ui.status(set.reason)
      }
    } catch (err) {
      $.ui.log(`Night Circuit: the backdrop was refused (${err instanceof Error ? err.message : String(err)}).`)
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
