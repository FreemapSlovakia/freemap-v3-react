# UI conventions

Conventions for react-bootstrap UI so new code looks like the rest of the app.
Derived from how the codebase already uses these components, not invented.

## Button variants

`variant` encodes the button's **role**, not its color or its surface. The same
role gets the same variant whether the button sits in a modal, a side panel, or
a floating toolbar over the map.

| Role | Variant | Use for |
| --- | --- | --- |
| **Dismiss** | `dark` | The close / cancel / hide button — the one with `<FaTimes />` that closes a modal (`onClick={close}`, often `+ <kbd>Esc</kbd>`) or dismisses a map-overlay toolbar (`setActiveModal(null)`, `selectFeature(null)`, …). This is what makes the close button read as "the X". |
| **Primary action** | `primary` | The one main confirm / submit / CTA of a form or footer. At most one prominent per surface (e.g. a `type="submit"` Save). |
| **Neutral action** | `secondary` | Everything else: secondary actions, `Dropdown.Toggle`, action buttons in selection/drawing toolbars, the default for `ResponsiveActions`. When in doubt, this is the default. |
| **Destructive** | `danger` | Delete / Remove / Cancel-download and other irreversible actions. **Solid, not `outline-danger`.** Also turns the packed `ResponsiveActions` dropdown item red. |
| **Toggle** | `outline-primary` | `ToggleButton` / `ToggleButtonGroup` members — bootstrap fills them solid-primary when checked. For a lone `active`-driven toggle button, use `primary` when active and `outline-primary` when not. |
| **Upsell / notice** | `warning` | Premium prompts, support/donate CTAs, attention notices. Keep rare — it's an attention color. |
| **Inline text link** | `link` | A button that should read as a hyperlink inside prose or a dense row. |

### Toggle state vs. pointer state

Toggling is signalled by the fill: `outline-primary` toggles fill solid primary
when on, `secondary` toggles go near-black (`.btn-secondary.active` in
`bootstrap-override.css`). For that to read at all, hover and focus must never
reach for the same fill — stock Bootstrap paints `:hover` and `:focus-visible`
with exactly the `.active` colors, which makes an off-but-hovered button
indistinguishable from an on one (and leaves a tapped button looking on until
the touch device drops its emulated hover). `bootstrap-override.css` therefore
splits the two channels:

- **off + hover/focus** → a subtle tint (`--bs-*-bg-subtle`), never the fill.
- **on + hover** → the fill, darkened one step, so a toggled button still reacts.
- Focus rings and `:active` press feedback are left to Bootstrap.

Use `:focus-visible`, not `:focus`, in any button-state CSS: `:focus` sticks
after a click or tap and repaints the button long after the pointer has left.

Since color is the only cue, a lone `active`-driven toggle also gets
`aria-pressed` (react-bootstrap's `active` prop only adds the class) — see the
tool pill in `ToolMenu`.

### Notes & accepted exceptions

- **`dark` means dismiss, not "on the map".** Action buttons that happen to sit
  in a map-overlay toolbar (e.g. the drawing selection toolbars) are `secondary`;
  only the toolbar's close/hide button is `dark`.
- **`outline-*` is for toggles**, not for "a quieter button". A quieter button is
  `secondary`. The toggle pattern is `isSelected ? 'secondary' : 'outline-secondary'`
  (see `IconPicker`) or `outline-primary` on `ToggleButton` groups.
- **Avoid `success` / `info` / `light` for buttons.** They exist as a couple of
  deliberate one-offs (e.g. the green "add shading" `DropdownButton`, the
  input-like key field in `ShortcutRecorder`); don't reach for them for ordinary
  actions. `success` / `info` are fine on `<Alert>`.
- A `dark` button is occasionally used for a non-dismiss navigation that visually
  belongs next to the close button (e.g. "go to watched devices" in a form
  footer). Treat that as the rare exception, not the rule.
