import { expect, test } from 'claude-code/testing'

// The props are the ones the desktop app sent on Nov 27 2026 (from .diag.log).
const BACKDROP = {
  plugin: 'night-circuit',
  surface: 'desktop',
  component: 'Backdrop',
  props: { scene: 'night-circuit', plugin: 'night-circuit', glass: { blur: 5, opacity: 0.6, tint: '#0a0f1c' } },
} as const

test('the desktop backdrop draws the scene as an Svg', async $ => {
  const ui = await $.ui.mount(BACKDROP)
  const svg = await ui.find({ type: 'Svg' })

  expect(svg).toBeDefined()
  await ui.unmount()
})
