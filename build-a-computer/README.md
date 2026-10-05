# Build a Computer

`index.html` — a drag-and-drop matching game for identifying the physical
components inside a computer case, built up over several rounds of design
feedback. This README documents not just what the code does today but the
requirements and decisions behind it — read it before changing the page,
the same way `fetch_decode_execute/README.md` documents the reasoning
behind `student_cpu.html` rather than just its current behaviour.

## Current status

All 7 components (motherboard, CPU, fan, RAM ×2 slots, NIC ×5 slots,
PSU, HDD) place, quiz, seat with a correctly-oriented installed picture,
and trigger the full power-on sequence. Power/data cabling between PSU,
HDD and the motherboard is built and animates on power-up. No known open
bugs — everything below was found, fixed, and re-verified against the
running page (not just the code) before being called done.

**Resolved**: the fan's tray tile used to read bigger than the PSU's,
because the fan's `slot` padded the CPU socket by ~6 units on every side
to keep its mount holes (fixed at a 7/64 fraction of the fan's own box —
see `motherboardDiagram()`) clear of it. That padding was nearly double
what's mechanically needed (~3.3 horizontal / ~2.8 vertical minimum to
just clear the holes). Tightened to a 4-unit pad on all sides —
`slot:{left:6.5,top:8,width:31.5,height:28}` — which still clears the
mount holes with a visible margin (verified live: holes land clearly
outside the CPU socket on screen) and brings the fan's tray tile down to
~match the PSU's.

**Resolved**: tray tiles no longer scale real case size down — a tray
tile is now the real case size (see "Tray tile sizing" in Architecture).
Getting every tile to actually land on that, measured live for all 7
parts, took two separate fixes: `tileSize()` was scaling by a
`TRAY_SCALE`/`TRAY_MAX_PX` constant that's now gone entirely, and
`CASE_REF_W` (the reference size "real" pixel units are computed
against) was a hardcoded `540` that didn't account for `caseOuter`'s own
padding+border eating 36px out of that before `caseInner` ever sees it —
overstating every part's real size by ~7%. Both are fixed: `tileSize()`
returns `realSlotSize(id)` directly (minus the tile's own fixed
border+padding chrome, `TILE_CHROME_PX`, so the *rendered* tile — not
just its content box — comes out to the exact case pixel size), and
`CASE_REF_W`/`CASE_REF_H` are read live from `caseInner`'s own
`getBoundingClientRect()` instead of a hand-copied number. One
side-effect fix went with it: `.buildArea` (the flex row holding the
case and the tray) needed `align-items:flex-start` — without it, a
tray tall enough to hold true-size tiles (previously just the
motherboard's own ~573px) stretched the case to match it via flex's
default `align-items:stretch`.

**Resolved**: RAM's tray tile was a near-invisible ~9px-wide sliver even
once sized correctly, because its real case footprint is ~9:1 (thin and
tall, how it's actually mounted) while its identify picture (`icon('ram')`)
is drawn lying down — wide, pins along the bottom, the standard teaching
image. Rather than rotating that wide picture 90° to cram it into a box
shaped for the other orientation (the old approach), `tileDisplaySize(id)`
now swaps the *tile's own* width/height for RAM so the box matches the
icon's natural orientation, then triples just the short side
(`RAM_SHORT_SIDE_BOOST`) since even swapped, 244×27 is too thin to read.
This is the one explicit, named, on-request exception to "tray size is
exactly the real case size" — every other part is untouched (see "Tray
tile sizing" in Architecture).

**Resolved**: NIC's tray tile read as the wrong size against the rest of
the tray — a second named, on-request exception alongside RAM's. Boosted
25% (`NIC_BOOST`) on its real size, applied before `TRAY_SHRINK` (same
order as RAM's boost — a flat percentage of the real size, not of the
already-shrunk tray tile).

**On top of all of the above**: every tray tile is shrunk by a flat,
uniform `TRAY_SHRINK` (2/3), applied last in `tileDisplaySize()` — after
the real-size match and RAM's swap+boost, not instead of them. It's a
tray-only, on-request scale-down (the case is untouched); every part
shrinks by the same fraction, so the "tray size is exactly the real case
size" relationship from above still holds at 2/3 scale, not just at 1:1.

Next concrete steps, if picking this up fresh, are the "Ideas to explore
next time" list at the bottom — nothing there is started.

## How it plays

- The case starts empty. Only the motherboard, PSU and HDD bays show a
  dashed outline before anything's placed — coloured to match the part
  that belongs there. Nothing else is highlighted.
- The **motherboard** goes in first. It can't be placed if a loose part
  is currently sitting where it would land (see "mistakes" below) — move
  it clear first.
- Before the motherboard is placed, any part can be dropped loosely
  anywhere in the case ("dumped") — no precision required. This is a
  deliberate mistake path: students can try fitting things before the
  board's ready, see it just sits there unfitted, and pick it back up.
  Once the motherboard **is** placed, dumping stops — every part needs
  its real slot from then on.
- Once the motherboard's in, its own picture already shows the CPU
  socket, RAM slot(s), expansion slot(s) and fan mounting holes — the
  same picture the motherboard uses everywhere (tray tile, quiz icon,
  seated in the case). Nothing is drawn as a separate highlight on top.
- Fitting a part into its slot (click-to-select-then-click, or drag)
  triggers two quick multiple-choice questions — its correct name, then
  its correct definition — before it's accepted.
- **Fan before CPU** is possible on purpose (real life: you can do this,
  but you'd have to take the fan back off to fix it) — it then blocks
  the CPU until the fan is removed again.
- The **NIC** has five independent, identically-sized expansion slots
  (stacked vertically like a real row of slot brackets) — any of them is
  a valid fit.
- Any placed or loose part can be removed by dragging it to the tray or
  hitting its ✕.
- Tray tiles aren't uniform — each is sized from that part's own real
  footprint on the board/case, scaled by one shared factor, so a part
  that's bigger on the board is bigger in the tray too.
- Once PSU, HDD and the motherboard are all placed, power and data
  cables appear between them (PSU↔motherboard, PSU↔HDD, HDD↔motherboard)
  — each only once both of its own two endpoints are actually placed.
- On 7/7 completion, the case "powers on" (fan spins, case LEDs pulse,
  motherboard trace lines animate, the power/data cables and a third
  SATA→CPU trace pulse too) and a summary banner recaps every component.
  "Build Again"/"Reset" restart the game.

## Components covered

Motherboard, Central Processing Unit (CPU), Cooling Fan, RAM (Random
Access Memory), Network Interface Card (NIC), Power Supply Unit (PSU),
Hard Disk Drive (HDD).

## Design requirements and decisions

These were established (and in several cases reversed, then re-confirmed)
across a long series of feedback rounds. Treat them as settled unless a
future request explicitly revisits one — several of the reversals below
happened because an earlier turn mis-generalised a request; re-read the
actual wording carefully before changing behaviour in this list again.

- **No drop-zone UI chrome.** No colour-coded highlight boxes, no text
  captions ("CPU socket", etc.) drawn over the board. The affordance for
  where a part goes has to live in the art itself: correct shape, correct
  size, correct notches, and colour baked into the socket/bay drawing —
  not a CSS overlay sitting on top of it.
- **Tray and board show the same picture.** A part's tray tile, its quiz
  identification icon, and its appearance once seated all come from the
  same drawing function wherever that's physically sensible. The
  motherboard specifically uses one function (`motherboardDiagram()`)
  everywhere — it used to show a bare PCB in the tray and only grow its
  sockets once placed in the case, which was the opposite of the point.
- **Tray tiles are proportional, not uniform**, and specifically
  proportional to each part's *real board/case footprint* — not to some
  abstract "nice icon size". This was tried both ways; true-footprint
  proportion is the settled answer.
- **Free-form "dump anywhere" is pre-motherboard only.** Once the
  motherboard's placed, every part needs its real slot — no more loose
  parking. (This flipped at least twice during the session before
  settling here — the loose/free-form mechanic is specifically about
  letting students make the "I put stuff in before the board" mistake,
  not a general low-precision mode.)
- **The motherboard can be blocked from going in** by a loose part
  sitting in its footprint — you can't screw a board down through
  something already in the case.
- **CPU socket is a solid block with a pin-hole grid**, not a dashed
  outline — it should read as a receptacle you drop the chip *into*.
  It's deliberately sized very slightly smaller than the CPU component
  itself (54/60 vs 56/60 units in the same design frame) so the chip
  always fully covers it rather than relying on the two staying exactly
  equal.
- **Fan mount is four screw holes**, not a dashed mounting zone. Their
  position is derived directly from the CPU socket's own corners plus a
  fixed offset, and — critically — from the *same fraction of the fan's
  own drop-target box* that the fan icon's own screw circles use, so the
  holes and the fan's own screws are mathematically guaranteed to land in
  the same place once it's fitted, not just "roughly near" it.
- **RAM has two pictures on purpose.** The tray/quiz "identify" picture is
  the classic textbook view — lying on its long side, gold pins along one
  edge, off-centre notch — kept because it's how students will see RAM
  drawn elsewhere. Rotated 90° to fill its (tall) tray tile rather than
  shrinking to a sliver. Once seated on the board it switches to an
  edge-on "installed" picture — a plugged-in DIMM's gold contacts are
  down inside the slot, out of view, so the installed picture shows no
  pins at all; what you actually see is the thin PCB edge, with the
  memory chip packages (mounted flat on the module's two faces, not its
  edge) bulging out past that thin edge on both sides. An earlier version
  of this picture still showed the connector pins along the bottom, and
  drew the chips as bands running across the full width of the card
  (effectively "over the top" of the PCB edge) rather than as side
  bulges — both wrong for an edge-on, plugged-in view.
- **RAM has two real slots, not one real plus a decorative duplicate.**
  Originally the board drew a second RAM slot next to the real one purely
  for looks — it couldn't actually be filled. It now uses the same
  `extraSlots` mechanism as the NIC's five expansion slots: either DIMM
  slot is a real, independently-clickable target, and `placedAt['ram']`
  records whichever one the student actually used. Narrowed from 8% to
  5.5% of the case each (freeing the room for a second slot without
  widening the board), and `ramSlot()`'s own contact strip was widened
  to read as filling that narrower channel rather than a thin centre
  band with dead grey space either side.
- **Five expansion slots, all the same size** — not one wide slot with
  decorative divider lines standing in for "multiple slots" (tried first,
  rejected as not a real mechanic), not side-by-side (tried second,
  rejected as "bizarre" placement), and no longer two differently-sized
  slots either (an earlier, since-reversed decision modelled a long x16
  slot plus a short one — dropped in favour of uniform size, closer to a
  real board's row of identical PCIe x1 slots, and simpler for "the NIC
  can go in any of them" to actually mean *any*). All five are real,
  independently-clickable targets via the same `extraSlots` mechanism as
  RAM's two slots — not one slot plus four decorative duplicates. Stacked
  below the fan (which bottoms out at the board's own `top:6, height:32`)
  down to just above the board's bottom edge, without the motherboard
  itself growing to fit them.
- **Expansion slots and the NIC card are flush against the motherboard's
  own left edge** (`left:2`, same as the motherboard's own slot), not
  floating in the middle of the board — that left edge is standing in
  for the case's back panel, which is where a card's bracket actually
  has to reach. `expansionSlot()`'s dashed "ghost box" above the slot
  channel (a leftover from an earlier, since-abandoned drop-zone-highlight
  design) was also removed — it wasn't marking anything once the baked
  socket art became the only placement affordance. `nic()`'s own bracket
  was widened to protrude past the card's left edge the same way
  `expansionSlot()`'s bracket tab already did (both now use the same
  negative-x protrusion), so the card doesn't look like it's floating at
  a different depth than its own socket once both sit flush against the
  case's back edge.
- **The NIC has an edge-on "installed" picture too, same idea as RAM's.**
  It used to reuse its lying-flat "identify" picture (full card face,
  bracket block, gold edge connector) once installed, just like RAM used
  to — wrong for the same reason: a card standing up in a slot shows you
  its thin edge from above, not its full face, and its gold connector is
  down in the slot out of view. `nicBoard()` draws that thin edge instead
  — a narrow horizontal bar with the bracket at the left end and small
  component blocks poking up/down past the bar at intervals — the same
  "thin edge, chips poke out past it, no visible pins" language as
  `ramBoard()`, just rotated to the NIC's horizontal slot axis instead of
  RAM's vertical one.
- **The installed HDD exposes two distinct connector sockets — data and
  power — not one generic pin block.** A real drive has a data connector
  (narrow, keyed) and a separate, wider power connector side by side on
  its back edge; `hddInstalled()` now draws both as real dark sockets
  (`#hddDataSlot`, `#hddPowerSlot`) rather than one unlabelled gold-pin
  rectangle, so a future power cable and a future data cable each have
  their own real target to visually plug into instead of sharing one.
- **Power and data cables are drawn between real components, once both
  real endpoints are placed — not pre-drawn guide lines.** PSU↔motherboard
  and PSU↔HDD are power cables (a black-sheathed/gold-core look); HDD↔
  motherboard is a data cable (flat red SATA-style look). Each only
  renders once both of its endpoints are actually placed (`placed['psu']
  && placed['motherboard']`, etc.) — consistent with "no drop-zone UI
  chrome" elsewhere in this game: cables are a consequence of what's been
  built, not a wiring diagram shown up front. The motherboard got two new
  baked connector marks for this (`MOBO_POWER_CONN_LOCAL`,
  `MOBO_SATA_CONN_LOCAL` in `motherboardDiagram()`), colour-matched
  (stroke) to PSU and HDD respectively, same affordance language as every
  other socket on the board. See "Architecture" below for how the cable
  endpoints are computed and kept in sync with the art they have to land
  on.
- **Cables are curved, not right-angled — that distinction is deliberate.**
  The power-on trace paths (above) are etched copper on a rigid board, so
  sharp right angles read correctly for them; a physical cable has slack
  in it, so routing it with the same ruler-straight elbow logic read as
  "drawn with a ruler," not as a cable. `cableCurvePath()` uses a cubic
  bezier with control points offset from the straight line between the
  two endpoints, giving every cable a visible bow — a different path
  function from `elbowPath()`-style trace routing on purpose, not a
  missed chance to reuse code.
- **Cables end in a visible plug, not a bare line stop.** `cablePlugMark()`
  draws a small coloured rounded-rect at each end of a cable, sized to
  sit just inside the port it's plugged into — added after the first pass
  measured out as geometrically landing inside the right port
  (`getBoundingClientRect()` confirmed it) but still read as "a line
  stopping near a socket" rather than "plugged in" without a plug shape
  to anchor the eye.
- **HDD's exposed data/power sockets were oversized on the first pass**
  — the data port was 57% of its row's own height, the power port 64%,
  together eating over a quarter of the drive's visible face. Both
  shrunk substantially (see `hddInstalled()`); their centres didn't move,
  so `HDD_DATA_SLOT_LOCAL`/`HDD_POWER_SLOT_LOCAL` (and the cables routed
  to them) didn't need to change, only the plug markers' own size
  needed a matching trim — the data plug in particular was initially
  taller than its own (now narrower) port, which looked like it
  overflowed the socket it was supposedly plugged into.
- **The SATA<->CPU trace is a third baked trace path, completing the data
  cable's journey onto the board.** The physical HDD<->motherboard cable
  (above) ends at the SATA port; this trace continues from that same
  port to the CPU, using the same `tracePaths` mechanism as the CPU<->RAM
  and NIC<->CPU traces. On power-up, this trace *and* the physical cables
  themselves (`.cablePowerInner`, `.cableData`) share the same
  `tracePulse` dash animation, so a cable and the trace it hands off to
  read as one continuous moving signal rather than a static cable feeding
  an animated board.
- **Cables ending on the motherboard get a fixed horizontal "lead-in"
  approach, not a direct line to the connector's centre.** The ATX power
  and SATA marks are small boxes right at the board's edge; a cable
  arriving at their exact centre from whatever angle the source happens
  to sit at could clip past a corner instead of visibly entering the
  socket — true even though the endpoint was, by measurement, inside the
  box. `motherboardConnEntryPath()` always routes the last stretch as a
  short, perfectly horizontal segment from just outside the mark into its
  centre, regardless of where the rest of the cable came from, so the
  final approach always reads as a clean insertion. HDD's own two ports
  don't need this — their cables already approach them correctly without
  it.
- **The power cable's own "powered" colour has to differ from both the
  red data cable and the yellow trace pulse already on the board** — a
  light blue (`#4cc9f0`) is used only while `.caseOuter.powered`, so the
  cable reads as a normal gold-cored cable when off and an unambiguous
  third colour ("electricity") once powered, never mistaken for either
  of the other two moving signals.
- **The fan's four mount holes must land clear of the CPU socket, not
  touching or overlapping it.** They're still derived from the same
  fraction of the fan's own drop-target box that the fan icon's own screw
  circles use (see "Architecture" below) — that invariant didn't change —
  but the fan slot itself used to pad the CPU slot by only ~3% on most
  sides and almost 0% on the bottom, so the bottom two holes landed
  inside the CPU socket rather than outside it. The fan slot now pads the
  CPU slot evenly (~6%) on all four sides, which was enough margin for
  all four holes to clear the socket with room to spare — confirmed with
  `getBoundingClientRect()` overlap checks, not eyeballed.
- **The power-on trace animation routes between real components, not a
  decorative squiggle.** `ComponentIcons.motherboard()` takes an optional
  `tracePaths` array; `motherboardDiagram()` computes two real elbow
  routes — CPU↔RAM and NIC↔CPU — from the actual baked socket positions
  and passes them in, so the pulsing "lights" on power-up trace an
  actual (simplified) data path instead of an arbitrary one that just
  happened to look fine. Falls back to the old decorative paths if no
  `tracePaths` are given, for any future standalone caller.
- **HDD bay art keeps its three stacked rows — that part was always
  good.** An earlier pass in this series tried "fixing" the mismatch
  between the 3-row empty-bay art and the single installed drive by
  collapsing `hddBay()` down to one row; that was the wrong fix and was
  reverted. The three rows are a real cage with real spare bays, not
  decoration, and should keep reading that way whether or not a drive is
  fitted. The actual mismatch was that the *installed* picture reused
  `storage()`'s top-down platter view (sized to the whole 3-row box),
  so the one drive the game has visually swallowed all three rows at
  once instead of sitting in one of them. Fixed with a dedicated
  `hddInstalled()` picture instead: the same 3-row cage, with the top
  row holding a drive drawn front-on (spindle/screw face, a connector
  block on the right) to match that one row's own thin, wide
  proportions, and the other two rows left showing as empty bays. The
  HDD's own slot rectangle never changed — only which picture renders
  inside it once placed. A real multi-bay HDD cage (extending
  `extraSlots` to HDD, letting a second/third drive be an actual target)
  remains a deferred idea, not built here — see "Ideas to explore next
  time".
- **The motherboard fills more of the case** (62% × 93% of the case,
  tighter margins) than it originally did — but **the case container
  itself is never resized** to achieve this. If a future change makes the
  case look bigger, that's almost certainly a different bug (see the
  tray-tile-sizing incident below), not an intentional case resize.
- **Component art stays as JS-returned SVG strings** in
  `shared/component-icons.js` (one function per component) rather than
  standalone `.svg` files, for now — explicitly a "keep as-is for now,
  fine to revisit long-term" call, not a rejection of the idea.
- Explicitly **rejected**: silkscreen-style micro-labels baked into the
  board art ("labels not required") and a decorative, non-functional
  graphics-card slot (added, then removed during the socket rework).
- Explicitly **deferred, not built**: separate visual "profiles" per
  component depending on the angle/orientation it's inserted at — flagged
  early on as "thinking for later," distinct from RAM's two-picture
  treatment above (which *was* requested).

## Architecture

- **`shared/component-icons.js`** — one function per component, each
  returning a self-contained `<svg>...</svg>` string. Filled-component
  functions (`cpu()`, `ram()`, `ramBoard()`, `storage()`, `psu()`,
  `fan()`, `nic()`) take an optional `color` for per-instance tinting
  (used by `computer_shop/index.html` too, which shares this file).
  Empty socket/bay functions (`cpuSocket()`, `ramSlot()`,
  `expansionSlot()`, `fanMount()`, `psuBay()`, `hddBay()`,
  `motherboardBay()`) also take `color`, tinted to match the part that
  belongs there, baked into the drawing rather than applied as a CSS
  overlay.
  - **Every icon's own `<svg>` tag carries `preserveAspectRatio="none"`.**
    This matters: without it, an icon whose design proportions don't
    happen to match the box it's rendered into gets letterboxed (shrunk,
    centred, gaps showing) instead of filling it. This was missing
    everywhere except `motherboard()`/`motherboardBay()` for most of the
    session and caused real, measured bugs — the installed RAM picture
    was filling only 52% of its slot's height, HDD only 58% — see
    "Bugs found the hard way" below.
- **`build_a_computer/index.html`** — the game itself.
  - `components[]` is the single source of truth for every part's
    case-relative slot rectangle (`{left, top, width, height}` as % of
    the case). Tray tile size, the real interactive hit-zone, and the
    board's baked socket art all derive from this one rectangle —
    nothing hand-positions the same part twice in two different places.
  - Multi-slot parts (currently just `nic`) carry a primary `slot` plus
    an `extraSlots` array; `slotRectsFor()` returns all valid rects for a
    part, and a module-level `placedAt` map records which specific rect
    a part actually landed in, so the filled render (and future removal)
    uses the right one.
  - `motherboardLocalRect()`/`motherboardLocal()` convert a case-relative
    rect into the motherboard's own local drawing coordinates (its
    `viewBox="0 0 100 128"` space); `motherboardDiagram()` uses these to
    bake the CPU socket, RAM slot(s), expansion slot(s) and fan holes
    directly onto the board picture at the exact position their real
    hit-zone will occupy.
  - `icon('motherboard')` returns `motherboardDiagram()` — the same
    function used for the board's filled slot — so the tray tile and
    quiz icon are pixel-identical to the seated appearance. This works
    because `motherboardDiagram()` only reads static `components[]` data,
    never `placed` state.
  - `motherboardLocalToCase()` is the inverse of `motherboardLocalRect()`
    — converts a point in the board's own local drawing coordinates back
    to case-%. Needed because the motherboard's power/SATA connector
    marks are only known in local coordinates (same frame
    `motherboardDiagram()` already draws everything else in), but
    `cableOverlay()` has to route cables to them in case-% space, the
    same coordinate system every slot div is positioned in.
    `partLocalToCase()` does the equivalent for PSU's cable-exit point
    and HDD's `#hddDataSlot`/`#hddPowerSlot` centres, which are known in
    *their own* icon's design coordinates
    (`PSU_CABLE_EXIT_LOCAL`/`HDD_DATA_SLOT_LOCAL`/`HDD_POWER_SLOT_LOCAL`)
    rather than the motherboard's. Keeping each connector's position as
    one named constant next to the icon function that draws it — instead
    of inlining the numbers again at the call site — is what keeps the
    visual mark and the cable endpoint from drifting apart if that icon's
    layout ever changes.
  - `cableOverlay()` draws power/data cables as a single absolutely-
    positioned `<svg viewBox="0 0 100 100" preserveAspectRatio="none">`
    over the whole case (`.cableOverlay`, `z-index:4` — above every slot,
    not just the `dumpZone` — see "a cable can be geometrically perfect
    and still invisible" in "Bugs found the hard way" for why it has to
    be this high), using plain case-% coordinates directly as path
    points. A cable only renders once both of its real endpoints are
    placed; `cableCurvePath()` routes it as a soft bezier (see the
    "cables are curved, not right-angled" design decision above for why
    that's a different function from `elbowPath()`'s trace routing, not
    shared code); `motherboardConnEntryPath()` overrides that for the
    two cables ending on the motherboard, with a fixed horizontal final
    approach into the small ATX/SATA marks.
  - Alignment depends on **no padding** between a filled part's slot
    div and its drawn icon (`.iconWrap.noPad`, applied to every placed
    part, not just the motherboard) — the baked socket math assumes the
    filled icon fills its slot edge-to-edge. Getting this wrong was the
    second bug found the hard way (see below).
  - z-index for the two empty slots that fully overlap (fan's drop
    target fully contains the CPU's) is **dynamic**: whichever part is
    actually selected or being dragged wins the overlap, rather than a
    fixed stacking order — needed so *both* "CPU first" and the
    deliberate "fan first" mistake are reachable by clicking the obvious
    centre spot.
  - **A tray tile is the real case size — not a scaled-down miniature of
    it.** `tileSize(id)` returns `realSlotSize(id)` directly (minus
    `TILE_CHROME_PX`, the tile's own fixed border+padding, subtracted so
    the tile's *rendered* footprint — border and padding included, i.e.
    what `getBoundingClientRect()` actually reports — comes out to the
    exact case pixel size, not the content box alone). There used to be a
    `TRAY_SCALE`/`TRAY_MAX_PX` step that scaled every tile down to fit a
    compact sidebar column; it's gone, on explicit instruction — tray
    size must equal case size, full stop, not "proportional to it by one
    constant." One structural consequence of that: the tray column is now
    routinely taller than the case (the motherboard's own tile is as
    tall as its real on-screen footprint, ~540px), so `.buildArea` needs
    `align-items:flex-start` — without it, flexbox's default
    `align-items:stretch` stretches the case to match the taller tray
    column, which doesn't just look wrong, it **breaks `CASE_REF_W/H`'s
    own live measurement** (see below) by inflating the very box that
    measurement reads from.
  - **RAM is the one deliberate exception to "tray size is exactly the
    real case size," on explicit request, for legibility.** `icon('ram')`
    is drawn lying down (the standard wide "stick of RAM" teaching
    picture, pins along the bottom) but RAM's real slot is a tall narrow
    upright one — so `tileDisplaySize(id)` swaps width/height for RAM's
    *tile* (not the icon) so the box matches the icon's natural
    orientation instead of rotating the icon 90° to cram it into a box
    shaped for the other orientation (the old approach: see the removed
    `.rotated` CSS class and `setIdentifyIcon`'s old `w,h` params in git
    history). Swapped, RAM's real footprint is still ~9:1 (244×27) — too
    thin a strip to read as anything, pins included — so
    `RAM_SHORT_SIDE_BOOST` (3) multiplies just the short side on top of
    the swap. Every other part still gets the literal, unmodified real
    size; this is the one named, documented exception, not a quiet
    regression back to the old per-part tray tuning this file spent a
    whole session removing.
  - **`CASE_REF_W`/`CASE_REF_H` are read live from `caseInner`'s own
    `getBoundingClientRect()`**, not a hardcoded guess at `caseOuter`'s
    CSS width. They used to be `540` / `540*8/7` — a hand-copy of
    `caseOuter`'s declared CSS `width:540px`, which doesn't account for
    `caseOuter`'s own 14px padding + 4px border (both sides) eating 36px
    out of that before `caseInner` — and therefore every `slot` — ever
    sees it. That overstated every part's "real" pixel size by ~7%,
    tray tiles included, in a way that's invisible until you actually
    measure a tray tile against its placed case counterpart (the formula
    looked internally consistent; it just wasn't consistent with the
    page). The fix removes the second number entirely — there's exactly
    one definition of "how big the case's content area is" (the CSS),
    and both the real case rendering and the tray both read it, instead
    of one reading the CSS and the other reading a copy of it that could
    (and did) drift.
  - Old history, kept for context: a string of increasingly complicated
    tray-sizing fixes — scale-from-smallest (blew up the motherboard), a
    floor-boost for thin parts (blew up RAM's height instead), a clamp
    against the motherboard's own tile size, a margin on that clamp, a
    `trayFootprint` escape hatch to hand-tune individual parts — each
    fixed the specific comparison it targeted and broke, or left broken,
    a different one, because each was its own extra rule with its own
    blind spot. None of that is back. The corollary still holds: **if a
    tray comparison looks wrong, the fix is to change that part's
    `slot`** — its real footprint in the case — **never to add a
    tray-only number.** PSU's `slot` was deliberately enlarged from
    `{28,24}` to `{31,27}` for exactly this reason, and the fan's `slot`
    pads the CPU socket out just far enough for its mount holes to clear
    it (see the fan's own comment) — tightened to the smallest padding
    that still clears the holes with a visible margin.

## Testing: how we verify

There's no test framework for this lesson (or the repo generally).
Verification is manual-but-scripted, via `tools/browser/browser.mjs`
driving a real Chromium instance over CDP (`ks3-chrome` launches it;
`KS3_CDP_URL` overrides the default port if needed) — screenshots for
visual checks, `eval` for reading live DOM/JS state and taking precise
`getBoundingClientRect()` measurements.

**Lesson learned this session, stated plainly**: looking only at the
specific element just changed is not enough. Two of the biggest bugs this
session — the tray tile ballooning to near case-size, and every icon
except the motherboard silently letterboxing inside its slot — were both
sitting in plain view on a full-page screenshot the whole time, just not
in the part of the page being actively checked. Claimed alignment/sizing
fixes were also wrong twice from doing the geometry by hand without
measuring the actual rendered result — **prefer
`getBoundingClientRect()` comparisons over eyeballing or hand-computed
coordinates whenever the claim is "X lines up with Y" or "X is the same
size as Y".**

**A later session had the same lesson again, in a sharper form**: a
tray-sizing "fix" was declared done twice on the strength of values this
page's own code had computed (`.style.width`, then hand-derived
arithmetic re-deriving what the clamp *should* produce) — without ever
loading the page and reading `getBoundingClientRect()` on the actual
tile elements. Both times the real rendered page disagreed with the
reasoning: `.style.width` isn't the rendered size (`.tile`'s own padding
and border add a flat +16px nothing in the sizing math accounts for),
and a formula that's correct in isolation can still be wrong once you
see what calls it a second time with different inputs (the motherboard
clamped-against-itself bug). **Numbers computed by the code under test
are not a substitute for measuring the code under test running** — if
the claim is "tile A is now smaller than tile B," the only thing that
actually settles it is `document.getElementById(...).getBoundingClientRect()`
on both, in the browser, after the change, every time — not what the
sizing function should theoretically return.

Regression checklist, re-run after any change to `build_a_computer/
index.html` or `shared/component-icons.js`:

1. **Fresh, empty tray screenshot** — full page, before placing anything.
   This is specifically where the tray-tile-blowup bug was sitting
   unnoticed for multiple commits.
2. Motherboard placement, screenshot the board — socket/hole art visible
   and positioned correctly, no leftover drop-zone chrome.
3. CPU placement — must work despite the fan's fully-overlapping hit-zone
   (z-index regression risk).
4. **Fan-before-CPU**: select fan, click/drop it before CPU exists →
   quiz should open. Complete it, then try CPU → should be blocked with
   the "fan is in the way" message. Then `resetGame()` and confirm the
   normal CPU-first order still works from a clean state (don't trust a
   single manual test sequence — re-test from a fresh reset).
5. Drag-to-remove, for both a placed part and a loose one.
6. Dumping: works before the motherboard is placed, refused after (check
   the toast message on both drag-drop and click paths).
7. Motherboard placement blocked when a loose part sits in its footprint;
   confirm it becomes placeable again once that part is moved to the
   tray.
8. Full 7/7 completion — banner shows, `caseOuter` gets the `powered`
   class, fan animation + LED pulse + trace pulse are actually active
   (check `getComputedStyle(...).animationName`, not just that the class
   was added).
9. Pixel-measure anything claimed to "cover" or "line up with" something
   else — outer `<svg>` bounding boxes are *not* reliable for this (they
   always fill their CSS box regardless of internal letterboxing); query
   an actual drawn element inside (a `<rect>`, `<circle>`) and compare
   that.
10. Cables: place PSU + motherboard only — the power cable between them
    should appear, no others. Add HDD — the PSU↔HDD power cable and the
    HDD↔motherboard data cable should both appear. Remove any one of the
    three parts and confirm its cable(s) disappear again (cables are
    driven by `placed[]`, not drawn once-and-cached).
11. Reset game state (`resetGame()`) before finishing up.
12. Spot-check `computer_shop/index.html` too — it imports the same
    `shared/component-icons.js`, so icon-level changes affect it even
    though this checklist is written for `build_a_computer`.

## Bugs found the hard way (keep in mind before touching sizing/layout)

- **RAM slot's own contact-strip too thin to read**: `ramSlot()`'s pins
  and key notch were always structurally correct (a gap in the pin row
  plus an explicit notch cutout, same as the installed `ram()`/
  `ramBoard()` pictures), and already colour-coded to the part the same
  way the expansion slot's teeth are tinted blue for the NIC — but the
  contact strip they live in was sized at 10% of the slot's own height,
  a proportion copied from a much shorter, wider reference shape. On the
  RAM slot's own tall, narrow real on-board box that 10% band compresses
  to a sliver too thin to read as a row of teeth at all, next to the
  expansion slot's teeth-row (27% of a much shorter shape) which reads
  clearly. First mistaken for an unrelated bug — a stray decorative gold
  "surface-mount chip" row baked into the generic `motherboard()`
  background art happens to sit inside the decorative second RAM slot's
  footprint and was wrongly blamed before actually isolating `ramSlot()`
  on its own at true on-board size and comparing it next to
  `expansionSlot()` the same way.

  The first fix only grew the strip (still 27% of the slot's height) —
  still wrong, because the row of ridge marks still ran perpendicular to
  the slot's own long axis (spread left-to-right, each tick a tall
  vertical bar) exactly like the expansion slot's row does. That's
  correct *for the expansion slot*, because its own long axis is
  horizontal — the row runs along it. The RAM slot's long axis is
  vertical, so its row needs to run along *that* axis instead: spread
  top-to-bottom, each ridge a short horizontal bar, in a strip running
  the slot's full length down one side rather than a band across its
  width. Fixed by rebuilding `ramSlot()`'s contact strip as a vertical
  column with the notch as a gap partway down it — the general rule is
  "the ridge row runs parallel to the slot's own long axis," not
  "ridges are always vertical ticks spread horizontally" copied
  unchanged from the one slot shape already built. Verify by rendering
  both slot icons standalone at their true real on-board aspect ratio,
  side by side, and checking the row direction actually matches each
  slot's own orientation — not just that *a* comb/notch exists.
- **Dump zone shadowed by the motherboard's own placeholder**: the
  motherboard's pre-placement dashed outline (`slot-motherboard`) covers
  62%×93% of the case and sat on top of the `dumpZone` div in click/drop
  order. Clicking or dropping any *other* selected part inside that area
  hit `onSlotClick`/`onSlotDrop` first, which rejected it with "That part
  doesn't fit there" instead of falling through to a free-form dump — so
  "dump anywhere in the case" pre-motherboard actually only worked in the
  narrow margins outside the motherboard/PSU/HDD placeholders. Worse,
  this made the "motherboard blocked by a loose part in its footprint"
  check (`canPlace('motherboard')`) unreachable, since a loose part could
  never land inside that footprint to begin with. Fixed by having
  `onSlotClick`/`onSlotDrop` fall through to `dumpAt()` when the
  selected/dropped part doesn't match the slot and `canDump()` is true,
  instead of always showing the mismatch toast. Caught by checking
  `document.elementFromPoint()` at the center of the case pre-motherboard
  — it resolved to `slot-motherboard`, not `dumpZone`.
- **Tray tile blowup**: scaling every tray tile so the *smallest*
  footprint anywhere hits a floor size works fine until the size spread
  between the smallest and largest part gets large — then the same scale
  factor applied to the largest part (the motherboard) blows its tile up
  toward case-size. Read initially as "the case got bigger" even though
  `.caseOuter`'s CSS was never touched — verify container size directly
  with `getBoundingClientRect()` before assuming a container regressed.
- **Universal letterboxing**: every icon but `motherboard()`/
  `motherboardBay()` was missing `preserveAspectRatio="none"`, so any
  icon whose own design aspect ratio didn't match its container was
  rendering undersized with gaps instead of filling it. Silent and easy
  to miss because it *looks* like "the icon is just drawn a bit small",
  not like an obvious bug.
- **Padding vs. no-padding mismatch**: the motherboard's baked socket
  positions are computed assuming the filled icon on top of them fills
  its slot with zero padding. Every other placed part rendered through
  an `iconWrap` with 6% padding. Both existed independently and looked
  individually reasonable; together they meant every socket/part pairing
  was subtly misaligned, worst (most visible) for the fan's four discrete
  corner holes, present but harder to spot for solid shapes like the CPU.
- **Slot aspect ratio vs. icon design aspect ratio**: a `components[]`
  slot rectangle chosen without checking its *real pixel aspect ratio*
  (case width and height aren't equal, so % width ≠ % height in real
  pixels) against the icon's own design `viewBox` aspect will distort
  once icons stop letterboxing. HDD's slot (28% × 22%) was never actually
  proportioned to match its own icon (100:56) — fixed by adjusting the
  slot, not by reintroducing letterboxing.
- **The entire tray-sizing saga, five rounds of patches, ended by deleting
  all of it.** In order: scale-from-smallest blew up the motherboard;
  scale-from-largest-plus-floor-boost blew up RAM's height instead;
  capping only the longest axis against the motherboard let NIC tie its
  width; capping both axes let NIC and RAM tie it exactly anyway;
  excluding the margin wasn't applied to the motherboard's own repeated
  `tileSize()` calls, so the clamp clamped the reference tile against
  itself; a `TRAY_MARGIN` fixed the ties but wasn't a big enough gap at
  actual ~40-170px tile scale to read as different by eye; hand-tuned
  `trayFootprint` overrides for RAM/fan/PSU fixed *that*, pushed further
  twice more, and still wasn't grounded in anything but "a number that
  happened to look right in one screenshot." Every one of these was a
  real fix for the specific comparison it targeted, verified with
  `getBoundingClientRect()` on the actual rendered page each time — and
  every one left a different comparison broken, because each was its own
  extra rule bolted onto the last, with its own untested blind spot.
  **The fix that actually ended it was being told to stop patching the
  formula and use the real case proportions as the only source of
  truth.** `tileSize()` is now one line — real footprint, times one
  shared scale factor, nothing else (see "Architecture" above). There is
  no floor to boost against, no margin to tune, no per-part override
  field. A tile's tray size is *exactly* its case size, scaled down,
  which makes most of the specific bugs above structurally impossible
  now (there's nothing left that could independently distort one axis)
  — but it also means the lever for "part X should look bigger in the
  tray" is now **only** "give part X a bigger real `slot` in the case,"
  never a tray-only number. PSU's `slot` was enlarged from `{28,24}` to
  `{31,27}` specifically so it would read as bigger than the CPU — that
  was always the right lever, even back when `trayFootprint` also
  existed as a wrong one sitting next to it.
- **Cable drawn correctly, invisible anyway — z-index, not geometry**:
  the data cable's path endpoint measured out as landing dead-centre
  inside the SATA connector mark (`getScreenCTM()`-transformed path
  point compared against the mark's own `getBoundingClientRect()`,
  matching almost exactly) — and yet on screen the cable visibly stopped
  short of the motherboard entirely, with a gap. The geometry was never
  wrong. `.cableOverlay` was `z-index:1`, *below* the filled motherboard
  and HDD slots (`z-index:2`/`3`), which have solid/opaque backgrounds —
  so the whole stretch of cable passing "under" either of those slots'
  bounding boxes was being silently painted behind them, including the
  final segment that reached the connector mark (which is only visible
  because it's baked into the *slot's own* SVG, drawn on top). Only the
  open stretch of cable crossing bare case background stayed visible,
  making it look like the cable simply stopped. Fixed by raising
  `.cableOverlay` to `z-index:4`, above every slot. The lesson isn't
  "z-index was wrong" so much as **a path can be geometrically perfect
  and still be the wrong fix if you only checked where it *ends*, not
  what's drawn on top of it along the way** — same family of bug as the
  padding-vs-no-padding and letterboxing incidents below: the gap is
  between "the coordinates are correct" and "the pixels you see are
  correct," and nothing announces which layer broke the link.
- **Fixed z-index for a part whose hit-zone fully contains another's**:
  breaks whichever part is underneath for as long as the covering part
  isn't placed yet. Needs to be resolved dynamically (by what's currently
  selected/dragged), not by a fixed "which one is generally on top" rule.

### The general technique behind all four of the above

Every one of these bugs is really the same underlying trap, worth
knowing as a pattern rather than four unrelated fixes: **any layer
between "where I defined the coordinates" and "what pixels actually
render" can silently break the link, and none of them announce
themselves.** Concretely, for a nested SVG stack like this one: a
`<svg viewBox>` defaults to `preserveAspectRatio="meet"` (letterbox), not
fill; CSS `padding` on a wrapping element shifts content without
resizing it in a way that's invisible unless you check both sides of a
"these should align" claim; and a percentage-based slot rectangle has a
*real* pixel aspect ratio that depends on the container's own aspect
ratio (this repo's case is 7:8, not square) — eyeballing the percentages
doesn't tell you the real ratio. A coordinate-system audit up front (list
every nested `<svg>`/wrapper between the source data and the pixels, and
what each one's sizing attributes actually resolve to) would have caught
all four in one pass instead of one bug report at a time. Worth doing
that audit *before* the next round of layout changes here, not after.

## Ideas to explore next time (not requested yet — check before building)

- **Data-movement lights, beyond the existing power-on trace pulse.**
  Still open. The current `tracePulse` (CPU<->RAM, NIC<->CPU, SATA<->CPU,
  plus the physical power/data cables — see "Design requirements and
  decisions" above) is a single power-on animation that activates all at
  once on 7/7 completion, not a live, per-action data-activity indicator
  during gameplay (e.g. "lights travel down the cable the instant the
  HDD is placed," independent of whether the build is finished). Whether
  that's wanted, and whether it's the same mechanism extended or
  something new, is still open. **Tried and reverted once already, same
  session, never committed**: a per-pair "live" variant (each
  trace/cable pulsing as soon as its own two endpoints were placed,
  scoped to `.caseInner` so the tray tile's and quiz modal's own copies
  of the motherboard picture didn't also start pulsing) was built,
  worked correctly, and was then explicitly asked to be reverted back to
  the single 7/7 pulse — not a bug, a decision, just not what was
  wanted on reflection. Worth noting for next time: `ComponentIcons.
  motherboard()` took a second `traceActive` param (parallel array to
  `tracePaths`), `cableOverlay()`'s cable paths got a `live` class
  (always true the moment a cable is drawn, since a cable only exists
  once both its endpoints do), and the CSS swapped `.caseOuter.powered
  .tracePulse`/`.cablePowerInner`/`.cableData` for `.caseInner
  .tracePulse.live`/`.cablePowerInner.live`/`.cableData.live` — all of
  that is gone now, not just disabled.
- **Semi-automate the regression checklist.** Right now it's ~10 manual
  `browser.mjs eval`/`screenshot` calls typed out by hand each session.
  A small script in `tools/browser/` (e.g.
  `check-build-a-computer.mjs`) that drives through placement,
  measures the key bounding-box relationships, and prints pass/fail
  would make the checklist above actually cheap to re-run instead of
  something that has to be remembered and retyped.
- **Visual regression baseline.** Save a reference screenshot (or set of
  them — empty tray, motherboard placed, full build) and diff future
  screenshots against it. Would have caught the tray-blowup and
  letterboxing regressions immediately rather than requiring the user to
  spot them.
- **Extend the multi-slot pattern (`extraSlots`) to the HDD bay.** It's
  already drawn as three stacked rows suggesting room for more than one
  drive, but only one drive ever exists in the game — the NIC's
  `extraSlots` mechanism built this session could make a second/third
  drive a real, valid target the same way NIC's second slot is.
- **Revisit the decorative GPU slot.** Removed during the socket rework
  for being awkwardly placed; the motherboard has more room now (62%×93%
  of the case) that it didn't have when the slot was first attempted —
  worth another pass if more board realism is wanted.
- **Colour-as-primary-affordance may need a second cue.** Per the
  settled decision above, where a part goes is now signalled almost
  entirely by baked-in shape/colour matching (tray tile border colour ↔
  socket tint), with no text labels. Worth checking this reads for
  colour-blind students — a shape-only or position-only fallback cue
  might be worth adding if that's a real concern for the target
  classroom.
- **Touch/tablet reliability.** The build-drag-and-drop uses the native
  HTML5 DnD API (`draggable`, `dragstart`/`dragover`/`drop`), which is
  historically unreliable on touch devices — click-to-select-then-click
  is the fallback already built in, but neither path has been tested on
  an actual tablet. Worth checking if students will use iPads/Chromebook
  touchscreens for this.
- **`computer_shop/index.html` consistency pass.** It shares
  `shared/component-icons.js` and benefited incidentally from this
  session's icon fixes (letterboxing, colour tinting), but hasn't had the
  same direct attention to its own layout/interaction as
  `build_a_computer` — worth a dedicated look if it's getting similar
  classroom use.
- No open **bugs** as of the last commit in this series — everything
  under "Bugs found the hard way" was found, fixed, and re-verified via
  the checklist. The items above are unrequested exploration ideas, not
  known defects — confirm scope before building any of them (see
  "Design requirements and decisions").
- The "different profile per insertion angle" idea remains explicitly
  deferred (see Design requirements above) — don't build it without a
  fresh explicit request.
- Moving component art from JS functions to standalone `.svg` files
  remains an explicitly-deferred, not-rejected, future direction.
- No automated test suite exists; the regression checklist above is
  manual (run via `tools/browser/browser.mjs`) and has to be re-run by
  hand — there's nothing that runs it automatically on a change (see
  "semi-automate the regression checklist" above).

## Files

- `index.html` — self-contained (inline `<style>`/`<script>`), no
  external dependencies, except the shared icon library.
- `../shared/component-icons.js` — icon library shared with
  `computer_shop/index.html`; see "Architecture" above.
- `jhn_logo.jpg` — this lesson's own copy of the school logo.

Links back to `../fetch_decode_execute/teacher_fde.html` as the "KS3
Computing tasks" hub.
