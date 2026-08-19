# UI conventions

Conventions for react-bootstrap UI so new code looks like the rest of the app.
Derived from how the codebase already uses these components, not invented.

Covered here: [button variants](#button-variants),
[single vs. multiple selection](#single-vs-multiple-selection),
[tokens](#tokens-come-from-bootstrap), [icon sizes](#icon-sizes),
[touch targets](#touch-targets-and-the-marker-primitive),
[spacing](#spacing-the-container-decides), [toolbar outlines](#toolbar-outlines).

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

## Single vs. multiple selection

Whether toggle buttons are **joined** or **separated** is what tells the user how
many of them can be on, so it follows the selection, never the layout:

- **Single selection** — a joined `<ButtonGroup>` of `type="radio"`
  `ToggleButton`s. The shared borders say "exactly one of these".
- **Multiple selection** — separate `type="checkbox"` `ToggleButton`s in a
  `d-flex flex-wrap gap-2`, each independently rounded (see
  `ExportablesSelector`). The gaps say "each of these on its own".

### When a joined group doesn't fit

`.btn-group` is `flex-wrap: nowrap` with no shrink, so a group too wide for its
container pushes the whole surface wider instead of adapting — on a phone that
means a modal wider than the viewport, with the last options cut off. Two ways
out, and the label lengths decide which:

- **A few options** → keep it joined and stack it: `<ButtonGroup vertical={!sm}>`
  with `sm` from `useBreakpointMatches`. `.btn-group-vertical` carries its own
  seam rules, so the joining, the corner rounding and the collapsed borders all
  stay right, and every option stays visible. Don't reach for the `flex-column`
  utilities instead — they flip the axis but leave `.btn-group`'s horizontal
  seam rules in place, which staggers the buttons by a pixel and rounds the
  wrong corners.
- **Many or long options** → it was the wrong control. Use a `Form.Select`
  (a bare `<option value="" />` for "none"), which is a single-choice idiom too,
  so the rule above still holds.

Nothing here wraps a joined group into rows: Bootstrap rounds corners per group,
not per row, so every wrapped row after the first comes out square-cornered.

`MapAreaToggle` takes a third route — `d-flex` plus `fm-ellipsis` on each
button, so the two options split the width and truncate. It reads well because
there are exactly two of them and each stays recognizable clipped. Treat it as
the exception: it costs label text, and with more options, or options that
differ only near the end, it stops being readable.

## Tokens come from Bootstrap

Bootstrap keeps its scales in Sass, and the app's own rules are plain CSS, so
`index.scss` **republishes them as custom properties** rather than letting a
literal be re-typed into a rule. Nothing in `index.css` or a component's CSS
should carry a spacing or size number that Bootstrap already has a name for.

| Token | Derived from | Is |
| --- | --- | --- |
| `--fm-space-0…5` | `$spacers`, key for key | `--fm-space-2` is what `.p-2` / `.gap-2` use |
| `--fm-icon-sm` | `$font-size-sm` | `0.875rem` |
| `--fm-icon` | `$font-size-base` | `1rem` |
| `--fm-icon-lg` | `$h5-font-size` | `1.25rem`, Bootstrap's `.fs-5` step |

Restyle a Bootstrap component through **its own** custom properties, not by
overriding the property it computes. `.fm-badge-action` sets `--bs-btn-font-size`
and `--bs-btn-padding-*`; the coarse-pointer menu row sets
`--bs-dropdown-item-padding-*`. Derive rather than measure where the value is
implied by another: that badge's padding is
`calc((var(--bs-body-line-height) * var(--fm-icon) - var(--fm-icon) - 2 * var(--bs-border-width)) / 2)`
— "whatever is left of the row's line once the glyph and the border have had
theirs" — and a toolbar's hit area is its own height less its own padding.

An outright constant is fair only where nothing implies it: `.fm-icon-wordmark`'s
`400%`, which is what a logotype in a square 24×24 viewBox needs to read as a
word.

## Icon sizes

A react-icons glyph is `1em` of the element it sits in, so **an icon's size is a
font size**. A `.btn`'s icon therefore comes out at 1rem, while a bare glyph
beside the button takes whatever the surrounding text is — which is how a toolbar
ends up reading as two sizes.

Three steps, one utility class each, are the only sizes an icon takes. They are
Bootstrap's own `small` / body / `.fs-5` steps (see Tokens above) as classes
without `!important`, so that a container can size the marks inside it:

| Class | Use for |
| --- | --- |
| `fm-icon-sm` | A mark subordinate to the text it annotates, or one inside a `btn-sm`. |
| `fm-icon` | **The default.** What a `.btn`'s own icon comes out at, and so what a mark in a menu row — where everything is text-sized — has to be. |
| `fm-icon-lg` | A glyph that is the whole control and has nothing to match — the social links in the main menu. Rare. |

### One size in a toolbar, and room instead of size

A bare glyph in a toolbar takes `fm-icon` — **the same size as the icon in the
button beside it**. It's tempting to size it up, since a button's box and padding
give its icon a presence a lone glyph has none of; don't. Two glyphs at two sizes
a few pixels apart read as a mistake, not as a hierarchy.

What the mark gets instead of size is **room**: the hit area below, of which it
keeps a step as visible air. That is what makes it hold its own next to a button.

Don't write a one-off `fontSize`, `fs-*` or `size={…}` for an icon. Two
documented exceptions:

- **`fm-icon-wordmark`** — a logotype drawn as an icon (the Garmin mark) is a
  word, not a glyph, and needs the width of one; a negative block margin in the
  scaled `em` gives back the empty box so the row's height is unchanged.
- **Components that size themselves in pixels** — `Rating`,
  `Azimuth`. Name the constant and tie it to a step (see `GalleryViewerModal`),
  and give an interactive one at least 24px.

## Touch targets and the marker primitive

A glyph carries about 16px of ink. WCAG 2.2 SC 2.5.8 asks for 24×24 CSS px — so a
bare glyph that means something is a target a fingertip cannot reliably land on.
That matters more here than usual: `LongPressTooltip` is the only way these marks
say what they mean on touch, so a target the finger misses removes the
explanation entirely, and for an acting mark the action with it.

**`GlyphMarker`** is the one place that decides all of it — the glyph's size, the
hit area, and pointer events inside a disabled container (a disabled control takes
pointer events away from its content, and the mark is often what says *why* it is
disabled). `OfflineBadge`, `PremiumGem`, `ExperimentalFunction`, `StatusIcon` /
`UnsavedWarningIcon`, `CountryFlag` and `MapSwitchButton`'s layer badges are all
thin wrappers over it. A new mark should be one too, not another hand-rolled
`LongPressTooltip` + `<span>`.

Being one place is also what lets a mark know where it is. `LongPressTooltip`
marks its own body with a context, and a `GlyphMarker` that finds itself in one
renders the glyph alone — no hit area, no second tooltip. So a mark can go in a
tooltip's label without the call site deciding anything: the same
`<OfflineBadge>` or `<CountryFlag>` reads as a mark in a menu row and as a plain
glyph in the tooltip beside it.

### The hit area is invisible

`.fm-marker-target` is one rule: a step of inline padding each side, and a step
of block padding given straight back as margin. **24×32**, the same box the
tool's own head gets from `px-1 py-2 my-n2` — that head is the shape to match.

Not a step more. `py-3` would make it 48px tall, which is taller than a toolbar's
own content box: the overspill lands on the map, so a tap meant for the map hits
the mark instead.

Being real padding rather than an overlay, two marks side by side **tile** — one
can never swallow the other's taps or its tooltip. Where the container already
puts a step between its children, the first of two marks swallows that gap with a
trailing negative margin, so the pair doesn't end up a step *plus* a gap *plus* a
step apart. Every mark keeps the same 24px box that way, and the two boxes meet
edge to edge; dropping the second mark's leading padding instead would close the
same distance but leave it 20px wide against its neighbour's 24.

It hangs off the first mark rather than pulling the second one back because these
containers wrap. At a line break the margin then lands at a line end, where it
only frees up slack; on the second mark it would push it out past the content
edge, on a line where there is no gap to cancel in the first place.

The containers that qualify are the ones whose gap is exactly one step — the
toolbars and a menu row, which set it in CSS, and anything carrying `gap-1`. A
container with no gap at all needs nothing: two marks already tile there.

**The two axes cost differently.** Block padding is free — that direction is the
line's own leading, dead space, and it is given straight back as margin so
nothing moves. Inline padding is not: it is real width, so a mark *does* push its
neighbours a step apart. That is the deal, and it is why the step is one unit and
not two — grow it further and the row visibly reshuffles. Reaching instead of
pushing (padding plus a negative margin) is available where the surrounding text
already supplies the space, but it needs `position-relative` to beat the text
that follows, and it must never reach over another mark.

**A mark brings its own step and no more.** Anything wider is the call site's or
the container's to say — a `gap`, or an `ms-1` where running text wants more air
than the step (see `ElevationValue`). The mark carries no inline *margin*, so a
margin utility on it composes normally, and its own step is padding rather than
margin so the room is room a finger can use.

### The glyph's box

A bare mark's box is `.fm-glyph` — `inline-block` plus `line-height: 0` — and
that is load bearing. The glyph then sits in an ordinary line box, so the mark's
baseline is that line box's, which is the glyph's bottom edge: exactly where an
`<svg>` in the surrounding text sits. **Don't reach for a flex box here.** With
nothing in it that has a baseline of its own it synthesizes one from its own
border box, which the padding has just moved, and the mark rides that much above
the line it annotates. `align-items: baseline` is supposed to fix that and doesn't
reliably, since a replaced item has no baseline either.

### Everything else is a Bootstrap utility

There is no class for "a toolbar head" or "a bare readout in a toolbar" — those
were custom classes hiding three Bootstrap utilities and a `:has()` rule that
guessed what the call site already knew. Write it out instead, where it can be
read without opening a stylesheet:

| Wanted | Written |
| --- | --- |
| A toolbar head (icon + name, its own long-press target) | `align-self-center d-inline-flex align-items-center gap-2 px-1 py-2 my-n2` |
| The same, where the icon is itself a button | drop `px-1 py-2 my-n2` — the button is the target and sits where a button sits |
| A bare readout or hint in a toolbar | `px-1`, or `ps-1` where a mark follows — a toolbar gives its marks a margin of their own |
| A taller target on a phrase in prose | `py-2` — vertical padding on an inline box doesn't move the line |
| A target on a standalone icon link | `p-2 m-n2`, with the row's `gap-3` so the targets meet rather than overlap |
| A mark where the sentence already puts a space after it | `me-n1 position-relative` — reach over that space instead of adding a second one. `position-relative` is the point: inline content that follows paints over an in-flow box, so without it the gap looks right but answers to the sentence rather than to the mark (see `UserChip`). |

## Spacing: the container decides

**One spacing decision per container, never a margin per child.** A toolbar whose
children each carry their own `ms-1` cannot keep an even rhythm, and a mark
inserted between two buttons lands wherever its own class puts it.

These containers own the gap; nothing inside them carries a margin:

| Container | Gap | Where |
| --- | --- | --- |
| `.fm-toolbar` | `0.25rem` | `index.css` |
| `.btn-toolbar` | `0.25rem` | `bootstrap-override.css` — a `gap-*` utility overrides it where a toolbar wants more air (see `Toast`) |
| `.dropdown-item` | `0.25rem` | `bootstrap-override.css`; a wrapping flex row, so a long label still wraps inside its own item |
| `ResponsiveActions` | `gap` prop | its own `d-inline-flex` |

**One gap vocabulary: Bootstrap's `gap-*` utilities.** The project's own
`f-gap-1` / `f-gap-2` are gone; don't reintroduce a parallel set.

Margins on children survive in one place, and it is a different thing: content
appended to **inline running text** — inside a `Form.Label`, a `Form.Check` label,
a `ToggleButton`'s own caption, a sentence — is part of that text, not a control
in a row of controls, and is separated by `ms-1` (or a plain space). Making every
`.btn` and `.form-label` a flex container to avoid that would cost more than it
buys.

That includes a `GlyphMarker`: it carries no inline *margin* of its own, so a
margin utility on it composes normally with its step of padding.

A component that renders a row appearing in several kinds of container lays that
row out itself rather than trusting whichever it lands in — see `MapLayerItem`,
which shows up in a menu item, in a `<select>`-like toggle, and in plain form
text.

## Toolbar outlines

Several toolbars share the top of the screen at once, so an outline on one says
what it is, not merely that it is there. Two exist, both 2px with
`outline-offset: -1px`, and no third should be added lightly:

- **Blue** (`fm-toolbar-selection`) — a selection toolbar: it acts on the feature
  that is selected.
- **Green** (`fm-toolbar-map-click`, bootstrap's `success`) — the toolbar of the tool taking clicks on
  the map, so a click is no longer selecting features. Carried only while the
  tool actually owns the clicks: a picking mode (home location, photo position,
  export area) masks it, and the outline goes with it.

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
