# Night Circuit

A theme for the Claude desktop app with a neon night-city look: blue-black
panels, a hazard-yellow accent, cyan-edged boxes, and an animated frame around
the conversation (a red rail by the sidebar, a yellow rail by the right panel,
running lights, marching hazard bars, a scan line, and a brief screen glitch
every fifty seconds). Dark mode only. The palette and artwork are original.

It is a Claude Code plugin: one hooks module that sets the app's colors and
draws the backdrop.

## Install

At the prompt of a Claude Code session, type:

```
/plugin install night-circuit --marketplace wahnahbe/night-circuit
```

Answer `y` to add the marketplace, then pick a scope (user, for every
project). Start a new session in the desktop app to see the theme. Turn it on
or off from the plugin list like any other plugin.

On Claude Code 2.1.321 and 2.1.322 the app refuses the backdrop, so the theme
sets its colors alone there. Update Claude Code for the animated frame.

### Running it from a folder (for editing)

To work on the theme, load it straight from a clone instead. The theme is
loaded from wherever this folder lives, so put it somewhere permanent first.

**Windows** (PowerShell):

    git clone https://github.com/wahnahbe/night-circuit.git "$env:USERPROFILE\.claude\mods\night-circuit"
    powershell -ExecutionPolicy Bypass -File "$env:USERPROFILE\.claude\mods\night-circuit\install.ps1"

**Linux / macOS**:

    git clone https://github.com/wahnahbe/night-circuit.git ~/.claude/mods/night-circuit
    ~/.claude/mods/night-circuit/install.sh

Then quit Claude completely and open it again.

The install script only edits `~/.claude/settings.json` (on Windows,
`%USERPROFILE%\.claude\settings.json`): it adds this folder to
`env.CLAUDE_CODE_PLUGIN_DIRS` and sets `CLAUDE_CODE_PLUGIN_DIR_WATCH` to `1` so
the app reloads the theme when its files change. It keeps a one-time backup
next to the file, named `settings.json.bak-before-night-circuit`.

If your Claude sessions on Windows run inside WSL, install it inside WSL with
the Linux steps instead, because that is where those sessions read their
settings.

## Update

Installed as a plugin: `/plugin update night-circuit`, then `/reload-plugins`.

From a folder: `git -C ~/.claude/mods/night-circuit pull`
(Windows: `git -C "$env:USERPROFILE\.claude\mods\night-circuit" pull`). The
app picks the change up by itself; restart it if it does not.

## Remove

Installed as a plugin: `/plugin uninstall night-circuit`.

From a folder: delete the `CLAUDE_CODE_PLUGIN_DIRS` and
`CLAUDE_CODE_PLUGIN_DIR_WATCH` lines from the `env` block of `settings.json`
(or restore the backup), restart Claude, then delete this folder.

## If the backdrop shows but does not move

The app decides whether a backdrop may animate. Check, in this order:

1. **Hardware acceleration is on.** With it off the app draws every backdrop
   still. In the app: Help > Troubleshooting > "Disable Hardware Acceleration"
   must be unticked, then restart.
2. **The system is not asking for reduced motion.** Windows: Settings >
   Accessibility > Visual effects > Animation effects on. GNOME: Settings >
   Accessibility > Seeing > Reduce Animation off.
3. **You changed the drawing.** See the rules below; breaking one makes the app
   refuse to animate the whole backdrop without any error.

## Layout

The frame is positioned for the app with the sidebar and the right panel both
open (`SIDEBAR_PX` and `RIGHT_PANEL_PX` at the top of the scene code in
`hooks/register.tsx`). Those panels sit on top of the backdrop, so anything
drawn under them is hidden. With the sidebar collapsed, the left rail sits
behind the edge of the text.

## Changing it

Everything is in `hooks/register.tsx`: the palette at the top (`makeColors`),
then the backdrop, built as one SVG string.

Rules the desktop app enforces on a custom backdrop, as of November 2026. The
comment at the top of the scene code has the detail.

- No `@media` rules except `prefers-reduced-motion` and `prefers-color-scheme`.
  Window-size rules (`min-width`, `aspect-ratio`) make the app refuse to
  animate the drawing at all.
- No `viewBox` tricks needed: one unit is one pixel, and the drawing is given
  the window's size. Hang things from the right or bottom edge with a nested
  `<svg x="100%" y="100%" overflow="visible">`.
- Plain SVG shapes, gradients, patterns, clip paths, text and `<style>` only.
  No viewport units, backslashes, external or `data:` urls, `shape-rendering`
  or `vector-effect`.
- Nothing may flicker: the app permanently stops a backdrop in which a spot
  changes brightness four times within a second over a noticeable area, or
  one that takes more than about 5 ms a frame to draw.

`hooks/make-colors.js` and `hooks/make-colors.d.ts` are the color helper that
ships with Claude Code's mod tooling, copied in unchanged.
