/*
JHN Computing — shared component artwork.
One canonical shape per component type, reused by every page so students
see the same picture in the browser as in class. Each icon's viewBox
matches the component's real proportions (a RAM stick is tall and thin,
a motherboard is the biggest thing on the shelf, a PSU is a stout box) —
never force-stretched to a square. Filled icons draw the component
itself, with the physical details that actually identify it (RAM's
off-centre notch and gold teeth, a CPU's pin-1 triangle, a PSU's cable
bundle, a card's gold edge connector). Socket icons draw the empty
receptacle it plugs into, carrying the same details in outline so the
shape alone says what belongs there.
*/

const ComponentShapes = {
    motherboard: {w:100, h:128},
    cpu: {w:60, h:60},
    ram: {w:100, h:30},
    nic: {w:100, h:30},
    psu: {w:70, h:70},
    hdd: {w:100, h:56},
    ssd: {w:100, h:32},
    fan: {w:64, h:64},
    inputBasic: {w:100, h:58},
    inputTablet: {w:100, h:70},
    monitor: {w:100, h:74}
};

let _iconUid = 0;
function _nextUid(prefix){
    _iconUid += 1;
    return prefix + _iconUid;
}

const ComponentIcons = {

    // `tracePaths`, when given, replaces the default decorative wiring
    // with real routes between this board's own components (computed by
    // the caller from actual socket positions) — so the power-on pulse
    // animation traces an actual CPU<->RAM/NIC data path instead of an
    // arbitrary decorative squiggle that happens to look fine but means
    // nothing. Falls back to the old decorative paths for any caller
    // that doesn't have real component positions to hand (there are none
    // today, but this keeps the function usable standalone).
    motherboard(tracePaths){
        const traces = (tracePaths && tracePaths.length) ? tracePaths : [
            "M 10 10 L 40 10 L 40 18 L 48 18",
            "M 10 60 L 24 60 L 24 96",
            "M 10 106 L 34 106",
            "M 62 96 L 90 96 L 90 70",
            "M 62 104 L 90 104 L 90 112",
            "M 36 66 L 36 90 L 54 90",
            "M 44 70 L 58 70 L 58 82",
            "M 10 46 L 20 46",
            "M 10 52 L 18 52"
        ];
        return `<svg viewBox="0 0 100 128" width="100%" height="100%" preserveAspectRatio="none">
            <path d="M 3 3 L 82 3 L 82 14 L 97 14 L 97 125 L 3 125 Z" fill="#1f6f3f" stroke="#164d2c" stroke-width="1.5"/>
            <g class="tracePulse" stroke="#3fae6a" stroke-width="1" fill="none" opacity="0.75">
                ${traces.map(d=>`<path d="${d}"/>`).join('')}
            </g>
            <g fill="#8a9096" opacity="0.8">
                <circle cx="8" cy="8" r="2"/><circle cx="92" cy="20" r="2"/>
                <circle cx="8" cy="120" r="2"/><circle cx="92" cy="120" r="2"/>
            </g>
            <g fill="#d4af37" opacity="0.85">
                <rect x="86" y="30" width="6" height="3"/><rect x="86" y="35" width="6" height="3"/>
                <rect x="86" y="40" width="6" height="3"/><rect x="86" y="45" width="6" height="3"/>
                <rect x="86" y="50" width="6" height="3"/><rect x="86" y="55" width="6" height="3"/>
            </g>
            <g fill="#8a9096" opacity="0.7">
                <rect x="11" y="24" width="4" height="7" rx="1"/><rect x="17" y="24" width="4" height="7" rx="1"/>
                <rect x="23" y="24" width="4" height="7" rx="1"/>
            </g>
            <rect x="60" y="72" width="16" height="16" rx="2" fill="#0d1b2a" opacity="0.4"/>
            <text x="68" y="82" font-size="6" fill="#3fae6a" text-anchor="middle" opacity="0.7">IC</text>
        </svg>`;
    },

    motherboardBay(color){
        const c = color || '#5a6472';
        return `<svg viewBox="0 0 100 128" width="100%" height="100%" preserveAspectRatio="none">
            <path d="M 3 3 L 82 3 L 82 14 L 97 14 L 97 125 L 3 125 Z" fill="${c}" opacity="0.1"/>
            <path d="M 3 3 L 82 3 L 82 14 L 97 14 L 97 125 L 3 125 Z" fill="none" stroke="${c}" stroke-width="2.5" stroke-dasharray="7 5"/>
        </svg>`;
    },

    cpu(color){
        const grid = [];
        for(let gx=12; gx<=48; gx+=6){
            for(let gy=12; gy<=48; gy+=6){
                grid.push(`<circle cx="${gx}" cy="${gy}" r="0.9" fill="#0d1b2a" opacity="0.3"/>`);
            }
        }
        return `<svg viewBox="0 0 60 60" width="100%" height="100%" preserveAspectRatio="none">
            <rect x="2" y="2" width="56" height="56" rx="2" fill="${color}" stroke="#5a6472" stroke-width="1.5"/>
            <rect x="6" y="6" width="48" height="48" fill="#3a3f47"/>
            ${grid.join('')}
            <rect x="6" y="6" width="48" height="6" fill="#ffffff" opacity="0.06"/>
            <rect x="6" y="48" width="48" height="6" fill="#0d1b2a" opacity="0.25"/>
            <path d="M 2 2 L 14 2 L 2 14 Z" fill="#ffd60a"/>
        </svg>`;
    },

    // A real socket: a solid plastic block punched with a pin-hole grid —
    // something to drop the chip INTO, not a dashed target outline.
    cpuSocket(color){
        const c = color || '#5a6472';
        const holes = [];
        for(let gx=12; gx<=48; gx+=6){
            for(let gy=12; gy<=48; gy+=6){
                holes.push(`<circle cx="${gx}" cy="${gy}" r="1.1" fill="#12161d" opacity="0.85"/>`);
            }
        }
        return `<svg viewBox="0 0 60 60" width="100%" height="100%" preserveAspectRatio="none">
            <rect x="3" y="3" width="54" height="54" rx="2" fill="${c}" stroke="#20242a" stroke-width="2"/>
            <rect x="3" y="3" width="54" height="9" fill="#ffffff" opacity="0.08"/>
            <rect x="9" y="9" width="42" height="42" rx="1" fill="#0d1b2a" opacity="0.35"/>
            ${holes.join('')}
            <path d="M 3 3 L 15 3 L 3 15 Z" fill="#d4af37" opacity="0.9"/>
            <circle cx="7" cy="7" r="1.3" fill="#12161d"/>
            <rect x="51" y="22" width="9" height="16" rx="1.5" fill="#20242a" stroke="${c}" stroke-width="1.5" transform="rotate(18 55.5 30)"/>
        </svg>`;
    },

    // The "identify this component" picture — the classic textbook view: a
    // stick lying on its long side, gold pins running along that bottom
    // edge, with the off-centre notch that stops it going in backwards.
    ram(color){
        const teeth = [];
        for(let tx=5; tx<=91; tx+=3.2){
            if(tx > 55 && tx < 61) continue; // notch gap
            teeth.push(`<rect x="${tx}" y="23" width="1.8" height="6.5" fill="#d4af37"/>`);
        }
        return `<svg viewBox="0 0 100 30" width="100%" height="100%" preserveAspectRatio="none">
            <rect x="2" y="2" width="96" height="26" rx="2" fill="${color}" stroke="#1c3350" stroke-width="1.5"/>
            <rect x="2" y="2" width="96" height="4.5" fill="#ffffff" opacity="0.1"/>
            <g fill="#0d1b2a" opacity="0.35">
                <rect x="9" y="8" width="11" height="11"/><rect x="24" y="8" width="11" height="11"/>
                <rect x="39" y="8" width="11" height="11"/><rect x="65" y="8" width="11" height="11"/>
                <rect x="80" y="8" width="11" height="11"/>
            </g>
            <rect x="2" y="20.5" width="96" height="7.5" rx="1" fill="#14181f"/>
            ${teeth.join('')}
            <rect x="56" y="20.5" width="4.5" height="7.5" fill="${color}"/>
        </svg>`;
    },

    // The "it's fitted on the board" picture — once plugged in, a DIMM
    // sits edge-on: all you actually see is the thin edge of the PCB
    // (its gold contacts are down inside the slot, out of view, same as
    // a real plugged-in module) with the memory chip packages — mounted
    // flat on the module's two FACES, not its edge — bulging out past
    // that thin edge on both sides. Drawing the chips first and the
    // narrow PCB edge on top (covering each chip's middle) is what makes
    // them read as side bulges rather than bands crossing the whole card.
    ramBoard(color){
        const edgeX = 8, edgeW = 10;
        const chipW = 20, chipX = (26 - chipW) / 2;
        const chipY = [6, 22, 38, 54, 70, 84];
        const chips = chipY.map(y=>`<rect x="${chipX}" y="${y}" width="${chipW}" height="9" rx="1" fill="#20242a" opacity="0.9"/>`).join('');
        return `<svg viewBox="0 0 26 100" width="100%" height="100%" preserveAspectRatio="none">
            ${chips}
            <rect x="${edgeX}" y="2" width="${edgeW}" height="96" rx="1.5" fill="${color}" stroke="#16243a" stroke-width="1.5"/>
            <rect x="${edgeX}" y="2" width="${edgeW}" height="8" fill="#ffffff" opacity="0.14"/>
        </svg>`;
    },

    // A real DIMM slot: a solid black channel with the contact strip, key
    // notch and ejector clips — same solid-object language as the expansion
    // slot, not a dashed placeholder outline.
    //
    // The contact strip runs the full length of the channel's own long
    // axis, the same way the expansion slot's strip runs the full length
    // of *its* long axis — just rotated, because this slot's long axis is
    // vertical where the expansion slot's is horizontal. Ridge marks are
    // stacked top-to-bottom here (each one a short horizontal bar) instead
    // of left-to-right (each one a short vertical bar), so the row reads
    // as running the same direction as the slot itself in both cases,
    // rather than perpendicular to it.
    ramSlot(color){
        const c = color || '#5a6472';
        // The contact strip spans almost the full width of the channel
        // (not just a thin centre band) — a real DIMM slot's contacts run
        // nearly edge to edge, and a narrow band read as not "filling"
        // the slot once the channel itself got narrower.
        const stripX = 4, stripW = 18;
        const notchTop = 44, notchBottom = 54;
        const pins = [];
        for(let py=8; py<=90; py+=5.5){
            if(py > notchTop - 3 && py < notchBottom + 1) continue; // notch gap
            pins.push(`<rect x="${stripX + 1}" y="${py}" width="${stripW - 2}" height="2.6" fill="${c}" opacity="0.8"/>`);
        }
        return `<svg viewBox="0 0 26 100" width="100%" height="100%" preserveAspectRatio="none">
            <rect x="2" y="4" width="22" height="92" rx="1.5" fill="#12161d" stroke="${c}" stroke-width="2"/>
            <rect x="${stripX}" y="6" width="${stripW}" height="88" rx="1" fill="#0d1218" stroke="${c}" stroke-width="1.5"/>
            ${pins.join('')}
            <path d="M ${stripX} ${notchTop} L ${stripX + stripW} ${notchTop} L ${stripX + stripW} ${notchBottom} L ${stripX} ${notchBottom} Z" fill="#0d1218" stroke="${c}" stroke-width="1"/>
            <path d="M ${stripX - 2} 2 L ${stripX + stripW + 2} 2 L ${stripX + stripW - 2} 8 L ${stripX + 2} 8 Z" fill="${c}" opacity="0.85"/>
            <path d="M ${stripX - 2} 98 L ${stripX + stripW + 2} 98 L ${stripX + stripW - 2} 92 L ${stripX + 2} 92 Z" fill="${c}" opacity="0.85"/>
        </svg>`;
    },

    storage(type, color){
        if(type === 'SSD'){
            return `<svg viewBox="0 0 100 32" width="100%" height="100%" preserveAspectRatio="none">
                <rect x="2" y="2" width="96" height="28" rx="3" fill="${color}" stroke="#1c3350" stroke-width="1.5"/>
                <rect x="2" y="2" width="96" height="6" fill="#ffffff" opacity="0.08"/>
                <rect x="10" y="12" width="46" height="3" fill="#0d1b2a" opacity="0.4"/>
                <rect x="10" y="19" width="30" height="3" fill="#0d1b2a" opacity="0.3"/>
                <path d="M 92 2 L 98 2 L 98 10 L 94 14 L 92 14 Z" fill="#c9ced3" stroke="#1c3350" stroke-width="1"/>
                <circle cx="8" cy="8" r="1.4" fill="#0d1b2a" opacity="0.4"/>
                <circle cx="92" cy="24" r="1.4" fill="#0d1b2a" opacity="0.4"/>
            </svg>`;
        }
        return `<svg viewBox="0 0 100 56" width="100%" height="100%" preserveAspectRatio="none">
            <rect x="2" y="2" width="96" height="52" rx="3" fill="${color}" stroke="#7d8389" stroke-width="1.5"/>
            <circle cx="34" cy="28" r="20" fill="none" stroke="#9aa1a8" stroke-width="1.5" opacity="0.7"/>
            <circle cx="34" cy="28" r="3" fill="#5a6472"/>
            <rect x="14" y="8" width="26" height="9" rx="1" fill="#eef1f3" stroke="#9aa1a8" stroke-width="0.75"/>
            <path d="M 78 2 L 90 2 L 90 12 L 84 16 L 78 16 Z" fill="#5a6472"/>
            <g fill="#d4af37" opacity="0.9">
                <rect x="80" y="4" width="1.6" height="4"/><rect x="83" y="4" width="1.6" height="4"/>
                <rect x="86" y="4" width="1.6" height="4"/>
            </g>
            <path d="M 88 20 L 98 20 L 98 40 L 92 44 L 88 44 Z" fill="#3a3f47"/>
            <g fill="#d4af37" opacity="0.9">
                <rect x="90" y="22" width="1.6" height="18"/><rect x="93" y="22" width="1.6" height="18"/>
                <rect x="96" y="22" width="1.6" height="18"/>
            </g>
            <circle cx="6" cy="6" r="1.3" fill="#5a6472"/><circle cx="94" cy="50" r="1.3" fill="#5a6472"/>
        </svg>`;
    },

    expansionSlot(color){
        const c = color || '#5a6472';
        const pins = [];
        for(let px=20; px<=96; px+=3.6){
            pins.push(`<rect x="${px}" y="21" width="1.6" height="6" fill="${c}" opacity="0.55"/>`);
        }
        return `<svg viewBox="0 0 100 30" width="100%" height="100%" preserveAspectRatio="none">
            <rect x="0" y="20" width="100" height="8" rx="1.5" fill="#12161d" stroke="${c}" stroke-width="1.5"/>
            <rect x="14" y="20" width="2" height="8" fill="${c}" opacity="0.7"/>
            ${pins.join('')}
            <path d="M -4 0 L 6 0 L 6 16 L 0 20 L -4 20 Z" fill="none" stroke="${c}" stroke-width="1.5" opacity="0.8"/>
        </svg>`;
    },

    psu(color){
        return `<svg viewBox="0 0 70 70" width="100%" height="100%" preserveAspectRatio="none">
            <rect x="2" y="2" width="66" height="66" rx="4" fill="${color}" stroke="#20242a" stroke-width="2"/>
            <rect x="2" y="2" width="66" height="10" fill="#ffffff" opacity="0.05"/>
            <circle cx="35" cy="38" r="21" fill="none" stroke="#7a828c" stroke-width="2"/>
            <circle cx="35" cy="38" r="15" fill="none" stroke="#7a828c" stroke-width="1.4"/>
            <circle cx="35" cy="38" r="9" fill="none" stroke="#7a828c" stroke-width="1"/>
            <g stroke="#7a828c" stroke-width="1.4" opacity="0.8">
                <line x1="10" y1="10" x2="18" y2="10"/><line x1="22" y1="10" x2="30" y2="10"/>
                <line x1="34" y1="10" x2="42" y2="10"/><line x1="46" y1="10" x2="54" y2="10"/>
            </g>
            <rect x="6" y="58" width="11" height="7" rx="1" fill="#12161d"/>
            <g fill="#8a9096"><circle cx="9" cy="60.2" r="0.7"/><circle cx="11.5" cy="60.2" r="0.7"/><circle cx="9" cy="62.8" r="0.7"/></g>
            <rect x="22" y="59" width="9" height="5" rx="1" fill="#12161d"/>
            <path d="M 52 56 Q 58 58 60 66" stroke="#c1121f" stroke-width="1.4" fill="none"/>
            <path d="M 55 55 Q 62 59 64 66" stroke="#12161d" stroke-width="1.4" fill="none"/>
            <path d="M 58 56 Q 65 60 66 66" stroke="#d4af37" stroke-width="1.4" fill="none"/>
        </svg>`;
    },

    psuBay(color){
        const c = color || '#5a6472';
        return `<svg viewBox="0 0 70 70" width="100%" height="100%" preserveAspectRatio="none">
            <rect x="2" y="2" width="66" height="66" rx="4" fill="${c}" opacity="0.1"/>
            <rect x="2" y="2" width="66" height="66" rx="4" fill="none" stroke="${c}" stroke-width="2.5" stroke-dasharray="6 4"/>
            <circle cx="35" cy="38" r="21" fill="none" stroke="${c}" stroke-width="1.4" opacity="0.5"/>
            <circle cx="35" cy="38" r="9" fill="none" stroke="${c}" stroke-width="1" opacity="0.5"/>
            <path d="M 52 56 Q 60 60 64 66" stroke="${c}" stroke-width="1.4" fill="none" opacity="0.6"/>
        </svg>`;
    },

    // Three stacked bay rows — one drive fills the first, but a real cage
    // takes more, so the case doesn't run out of room for them. The slot
    // this fills is sized for one drive's worth of real footprint, so
    // this is deliberately squeezed into a box only as tall as that one
    // drive — that's fine for the EMPTY state (it just reads as "there's
    // a 3-bay cage here"); it's the FILLED state that needs to pick one
    // row rather than stretch across all three — see hddInstalled().
    hddBay(color){
        const c = color || '#5a6472';
        const rowY = [4, 22, 40];
        const rows = rowY.map(y => `
            <rect x="4" y="${y}" width="92" height="14" rx="1.5" fill="${c}" opacity="0.1"/>
            <rect x="4" y="${y}" width="92" height="14" rx="1.5" fill="none" stroke="${c}" stroke-width="1.4" stroke-dasharray="5 3.5" opacity="0.5"/>
            <rect x="4" y="${y+3}" width="3" height="8" fill="${c}" opacity="0.6"/>
            <rect x="93" y="${y+3}" width="3" height="8" fill="${c}" opacity="0.6"/>
            <rect x="82" y="${y+4}" width="8" height="6" rx="0.5" fill="none" stroke="${c}" stroke-width="1" opacity="0.6"/>
        `).join('');
        return `<svg viewBox="0 0 100 56" width="100%" height="100%" preserveAspectRatio="none">
            <rect x="0" y="0" width="100" height="56" rx="3" fill="none" stroke="${c}" stroke-width="2.5" stroke-dasharray="6 4" opacity="0.7"/>
            ${rows}
        </svg>`;
    },

    // The "it's fitted in the bay" picture: the three-row cage from
    // hddBay() stays visible (the other two rows are real spare bays,
    // not just decoration, so they should still read as empty) but the
    // top row now holds a drive — drawn front-on (screw/spindle face,
    // a connector block on the right) to match that row's own thin,
    // wide proportions, not storage()'s top-down platter view stretched
    // to fill all three rows at once.
    hddInstalled(color){
        const c = '#5a6472';
        const rowY = [4, 22, 40];
        const cy = rowY[0] + 7;
        // Real SATA drives put a data connector and a power connector
        // side by side on the back edge — drawn here as two distinct
        // exposed sockets (not one generic pin block) so a future power
        // cable and data cable each have their own real target to plug
        // into, instead of sharing one ambiguous connector.
        // Both connectors shrunk from their first pass — at the old size
        // (data 9x8, power 16x9, against a 14-tall row) they read as
        // nearly half the drive's own face, bigger than a real SATA
        // connector pair looks against a 3.5" drive. Centres unchanged
        // (still y=${cy}) so HDD_DATA_SLOT_LOCAL/HDD_POWER_SLOT_LOCAL in
        // index.html — which cableOverlay() routes cables to — don't
        // need to move, just shrink their own plug markers to match.
        const filledRow = `
            <rect x="4" y="${rowY[0]}" width="92" height="14" rx="1.5" fill="${color}" stroke="#7d8389" stroke-width="1.2"/>
            <circle cx="16" cy="${cy}" r="4.5" fill="none" stroke="#9aa1a8" stroke-width="1"/>
            <circle cx="16" cy="${cy}" r="1.2" fill="#5a6472"/>
            <rect id="hddDataSlot" x="70" y="${cy - 2.5}" width="6" height="5" rx="0.6" fill="#12161d" stroke="#9aa1a8" stroke-width="0.9"/>
            <rect x="72.3" y="${cy - 2.5}" width="1.4" height="5" fill="#9aa1a8" opacity="0.6"/>
            <rect id="hddPowerSlot" x="82" y="${cy - 3}" width="11" height="6" rx="0.6" fill="#12161d" stroke="#9aa1a8" stroke-width="0.9"/>
            <g fill="#d4af37" opacity="0.9">
                <rect x="83.5" y="${cy - 1.8}" width="1.2" height="3.6"/><rect x="86" y="${cy - 1.8}" width="1.2" height="3.6"/>
                <rect x="88.5" y="${cy - 1.8}" width="1.2" height="3.6"/><rect x="91" y="${cy - 1.8}" width="1.2" height="3.6"/>
            </g>
        `;
        const emptyRows = [rowY[1], rowY[2]].map(y => `
            <rect x="4" y="${y}" width="92" height="14" rx="1.5" fill="${c}" opacity="0.1"/>
            <rect x="4" y="${y}" width="92" height="14" rx="1.5" fill="none" stroke="${c}" stroke-width="1.4" stroke-dasharray="5 3.5" opacity="0.5"/>
            <rect x="4" y="${y+3}" width="3" height="8" fill="${c}" opacity="0.6"/>
            <rect x="93" y="${y+3}" width="3" height="8" fill="${c}" opacity="0.6"/>
            <rect x="82" y="${y+4}" width="8" height="6" rx="0.5" fill="none" stroke="${c}" stroke-width="1" opacity="0.6"/>
        `).join('');
        return `<svg viewBox="0 0 100 56" width="100%" height="100%" preserveAspectRatio="none">
            <rect x="0" y="0" width="100" height="56" rx="3" fill="none" stroke="${c}" stroke-width="2.5" stroke-dasharray="6 4" opacity="0.7"/>
            ${filledRow}
            ${emptyRows}
        </svg>`;
    },

    fan(color){
        return `<svg viewBox="0 0 64 64" width="100%" height="100%" preserveAspectRatio="none">
            <rect x="2" y="2" width="60" height="60" rx="8" fill="${color}"/>
            <circle cx="32" cy="32" r="24" fill="#20242a"/>
            <g class="fanBlades" fill="#9aa1a8">
                <path d="M 32 32 Q 30 12 38 10 Q 44 14 32 32 Z" transform="rotate(0 32 32)"/>
                <path d="M 32 32 Q 30 12 38 10 Q 44 14 32 32 Z" transform="rotate(60 32 32)"/>
                <path d="M 32 32 Q 30 12 38 10 Q 44 14 32 32 Z" transform="rotate(120 32 32)"/>
                <path d="M 32 32 Q 30 12 38 10 Q 44 14 32 32 Z" transform="rotate(180 32 32)"/>
                <path d="M 32 32 Q 30 12 38 10 Q 44 14 32 32 Z" transform="rotate(240 32 32)"/>
                <path d="M 32 32 Q 30 12 38 10 Q 44 14 32 32 Z" transform="rotate(300 32 32)"/>
            </g>
            <circle cx="32" cy="32" r="6" fill="#c9ced3"/>
            <circle cx="7" cy="7" r="2.2" fill="#20242a"/><circle cx="57" cy="7" r="2.2" fill="#20242a"/>
            <circle cx="7" cy="57" r="2.2" fill="#20242a"/><circle cx="57" cy="57" r="2.2" fill="#20242a"/>
        </svg>`;
    },

    // Not a mounting zone — a single cooler-bracket screw hole. The caller
    // places four of these just outside the CPU socket's own corners.
    fanMount(color){
        const c = color || '#5a6472';
        return `<svg viewBox="0 0 10 10" width="100%" height="100%" preserveAspectRatio="none">
            <circle cx="5" cy="5" r="4" fill="#12161d" stroke="${c}" stroke-width="1.4"/>
            <circle cx="5" cy="5" r="1.4" fill="${c}" opacity="0.8"/>
        </svg>`;
    },

    // The backplate bracket pokes out past the card's own left edge (x
    // goes negative, same as expansionSlot()'s own bracket tab) — that's
    // the part that pokes out through the case's rear panel, so it needs
    // to protrude the same way the empty socket's bracket already does,
    // or the card reads as sitting at a different depth than its slot
    // once both are flush against the case's back edge.
    nic(color){
        return `<svg viewBox="0 0 100 30" width="100%" height="100%" preserveAspectRatio="none">
            <path d="M 14 2 L 96 2 L 96 24 L 14 24 Z" fill="${color}" stroke="#123a6e" stroke-width="1.5"/>
            <path d="M -4 0 L 14 0 L 14 26 L -4 26 Z" fill="#c9ced3" stroke="#7d8389" stroke-width="1"/>
            <rect x="0" y="4" width="8" height="7" rx="0.5" fill="#20242a"/>
            <rect x="0" y="15" width="8" height="7" rx="0.5" fill="#20242a"/>
            <circle cx="20" cy="6" r="1.4" fill="#70e000"/><circle cx="25" cy="6" r="1.4" fill="#ffd60a"/>
            <g fill="#d4af37">
                <rect x="18" y="24" width="2.2" height="6"/><rect x="22" y="24" width="2.2" height="6"/>
                <rect x="26" y="24" width="2.2" height="6"/><rect x="30" y="24" width="2.2" height="6"/>
                <rect x="34" y="24" width="2.2" height="6"/><rect x="38" y="24" width="2.2" height="6"/>
                <rect x="42" y="24" width="2.2" height="6"/><rect x="46" y="24" width="2.2" height="6"/>
                <rect x="52" y="24" width="2.2" height="6"/><rect x="56" y="24" width="2.2" height="6"/>
                <rect x="60" y="24" width="2.2" height="6"/><rect x="64" y="24" width="2.2" height="6"/>
                <rect x="68" y="24" width="2.2" height="6"/><rect x="72" y="24" width="2.2" height="6"/>
                <rect x="76" y="24" width="2.2" height="6"/><rect x="80" y="24" width="2.2" height="6"/>
            </g>
        </svg>`;
    },

    // The "it's fitted in the slot" picture — same idea as ramBoard()'s
    // edge-on view, just along the slot's horizontal axis instead of
    // RAM's vertical one. A card standing up in a slot shows you its
    // thin edge from above, not the full flat face the identify picture
    // shows — its gold edge connector is down in the slot, out of view,
    // and its components (mounted flat on one face) poke up past that
    // thin edge rather than spreading across the whole card the way the
    // lying-flat identify picture does.
    nicBoard(color){
        // The card's thin edge has to sit exactly where expansionSlot()'s
        // own channel is (y 20-28, near the bottom of the viewBox) — not
        // vertically centred — or the card reads as floating above its
        // slot instead of seated in it. The bracket plate spans from
        // near the top down to that same channel, same as
        // expansionSlot()'s own bracket tab does, and the component
        // blocks poke up from the card edge into the clear space above.
        const barY = 20, barH = 8;
        const chipH = 14, chipY = barY - 10;
        const chipX = [20, 34, 50, 66, 82];
        const chips = chipX.map(x=>`<rect x="${x}" y="${chipY}" width="8" height="${chipH}" rx="1" fill="#20242a" opacity="0.9"/>`).join('');
        return `<svg viewBox="0 0 100 30" width="100%" height="100%" preserveAspectRatio="none">
            ${chips}
            <path d="M -4 ${barY} L 96 ${barY} L 96 ${barY + barH} L -4 ${barY + barH} Z" fill="${color}" stroke="#123a6e" stroke-width="1.5"/>
            <path d="M -4 2 L 10 2 L 10 ${barY + barH} L -4 ${barY + barH} Z" fill="#c9ced3" stroke="#7d8389" stroke-width="0.75"/>
        </svg>`;
    },

    inputBasic(color){
        return `<svg viewBox="0 0 100 58" width="100%" height="100%" preserveAspectRatio="none">
            <rect x="2" y="16" width="62" height="32" rx="4" fill="${color}" stroke="#1c3350" stroke-width="1.5"/>
            <g fill="#0d1b2a" opacity="0.5">
                <rect x="7" y="21" width="5.5" height="5.5"/><rect x="15" y="21" width="5.5" height="5.5"/>
                <rect x="23" y="21" width="5.5" height="5.5"/><rect x="31" y="21" width="5.5" height="5.5"/>
                <rect x="39" y="21" width="5.5" height="5.5"/><rect x="47" y="21" width="5.5" height="5.5"/>
                <rect x="7" y="29" width="5.5" height="5.5"/><rect x="15" y="29" width="5.5" height="5.5"/>
                <rect x="23" y="29" width="22" height="5.5"/><rect x="47" y="29" width="5.5" height="5.5"/>
                <rect x="7" y="37" width="14" height="5.5"/><rect x="24" y="37" width="14" height="5.5"/>
            </g>
            <path d="M 74 10 Q 96 14 96 32 Q 96 50 74 50 Q 70 32 74 10 Z" fill="${color}" stroke="#1c3350" stroke-width="1.5"/>
            <line x1="80" y1="18" x2="80" y2="30" stroke="#0d1b2a" stroke-width="1.4" opacity="0.5"/>
        </svg>`;
    },

    inputTablet(color){
        return `<svg viewBox="0 0 100 70" width="100%" height="100%" preserveAspectRatio="none">
            <rect x="2" y="2" width="82" height="60" rx="5" fill="${color}" stroke="#1c3350" stroke-width="1.5"/>
            <rect x="8" y="8" width="70" height="48" fill="#0d1b2a" opacity="0.18"/>
            <line x1="62" y1="44" x2="84" y2="66" stroke="#0d1b2a" stroke-width="2.5"/>
            <circle cx="84" cy="66" r="3.5" fill="#0d1b2a"/>
        </svg>`;
    },

    monitor(color){
        return `<svg viewBox="0 0 100 74" width="100%" height="100%" preserveAspectRatio="none">
            <rect x="2" y="2" width="96" height="54" rx="4" fill="#2b2f36" stroke="${color}" stroke-width="3.5"/>
            <rect x="8" y="8" width="84" height="42" fill="${color}" opacity="0.35"/>
            <rect x="42" y="56" width="16" height="10" fill="#5a6472"/>
            <rect x="26" y="66" width="48" height="6" rx="3" fill="#5a6472"/>
        </svg>`;
    }

};
