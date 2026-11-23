import sys, os, math
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

FONT, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
f = TTFont(FONT); gs = f.getGlyphSet(); cm = f.getBestCmap()
TRACK = -30   # -0.03em ako v aplikácii
XH = 544

def glyph_path(ch, dx, dy=0, scale=1.0):
    g = cm[ord(ch)]
    pen = SVGPathPen(gs)
    gs[g].draw(TransformPen(pen, (scale, 0, 0, -scale, dx, dy)))
    return pen.getCommands(), gs[g].width * scale

# Palety (dekoratívne farby — text nesie písmo, kocky sú ozdoba)
PAL = {
  # inšpirované dievčatkom: veža z kociek zelená–modrá–ružová + žlté vlasy
  "dievca": ["#6FBA47", "#7C83F7", "#FF7A8E", "#F5C518", "#FF526E"],
  # paleta aplikácie (PSD): tyrkys, amber, koral + zelená z mapy
  "app":    ["#5DC2D6", "#F5AD1D", "#FF526E", "#8CC56E", "#7C83F7"],
}
INK = "#1f1a16"; CORAL = "#d6264a"; CREAM = "#fbf7ee"

def cube(x, y, s, color, rot=0, r=None):
    r = s * 0.16 if r is None else r
    cx, cy = x + s/2, y + s/2
    t = f' transform="rotate({rot:.1f} {cx:.1f} {cy:.1f})"' if rot else ""
    return f'<rect x="{x:.1f}" y="{y:.1f}" width="{s:.1f}" height="{s:.1f}" rx="{r:.1f}" fill="{color}"{t}/>'

def i_size(n, gap):
    return (XH - (n-1)*gap) / n

def i_cubes(x0, base, colors, gap=10, rots=(0,0,0,0), offs=(0,0,0,0), dot_rot=-14, dot_lift=78, dot_dx=0, stem_w=131, n=4):
    s = i_size(n, gap)
    s = min(s, stem_w + 6) if n == 4 else s
    parts = []
    y = base
    for k in range(n):
        y -= s
        parts.append(cube(x0 + (stem_w - s)/2 + offs[k], y, s, colors[k], rots[k]))
        y -= gap
    ydot = base - XH - dot_lift - s
    parts.append(cube(x0 + (stem_w - s)/2 + dot_dx, ydot, s, colors[n], dot_rot))
    return "\n".join(parts), ydot

def wordmark(text_color, colors, **kw):
    """vráti (svg_inner, width, top, bottom) v jednotkách písma, základná čiara y=0"""
    x = 0; out = []
    top = 0
    for ch in "kutisko":
        if ch == "i":
            n = kw.get("n", 4); extra = 0
            if n != 4:
                extra = max(0, i_size(n, kw.get("gap", 10)) - 131)
            lsb = 61 + 16 + extra/2   # o kúsok viac vzduchu okolo kociek
            inner, ydot = i_cubes(x + lsb, 0, colors, **kw)
            out.append(inner); top = min(top, ydot - 20)
            x += 252 + 32 + extra + TRACK
        else:
            d, w = glyph_path(ch, x)
            out.append(f'<path d="{d}" fill="{text_color}"/>')
            x += w + TRACK
    width = x - TRACK
    return "\n".join(out), width, min(top, -757), 12

def svg_doc(inner, w, h, vb, bg=None, title="KUTISKO"):
    b = f'<rect x="{vb[0]}" y="{vb[1]}" width="{vb[2]}" height="{vb[3]}" fill="{bg}"/>' if bg else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="{" ".join(f"{v:.1f}" for v in vb)}" role="img" aria-label="{title}">'
            f'<title>{title}</title>{b}{inner}</svg>\n')

VARIANTS = {
  "A-rovna-veza": dict(text=INK, pal="dievca", kw=dict()),
  "B-hrava-veza": dict(text=INK, pal="dievca", kw=dict(rots=(0,-4,3,-6), offs=(0,4,-3,6), dot_rot=-18, dot_dx=10)),
  "C-farby-appky": dict(text=INK, pal="app", kw=dict(gap=14, rots=(0,3,-3,5), offs=(0,-3,3,-4), dot_rot=14, dot_dx=-6)),
  "D-koralove-pismo": dict(text=CORAL, pal="app", kw=dict(rots=(0,-3,2,-4), offs=(0,3,-2,4), dot_rot=-16)),
}
# D: koralové písmo -> kocky bez koralovej, aby nesplývali
VARIANTS["D-koralove-pismo"]["colors"] = ["#5DC2D6", "#F5AD1D", "#8CC56E", "#7C83F7", "#5DC2D6"]

meta = {}
for name, v in VARIANTS.items():
    colors = v.get("colors", PAL[v["pal"]])
    inner, w, top, bot = wordmark(v["text"], colors, **v["kw"])
    pad = 40
    vb = (-pad, top - pad, w + 2*pad, (bot - top) + 2*pad)
    open(f"{OUT}/logo-{name}.svg", "w").write(svg_doc(inner, round(vb[2]/2), round(vb[3]/2), vb))
    meta[name] = (inner, vb)

# biela verzia na tmavé/farebné pozadie (variant B)
inner, w, top, bot = wordmark("#ffffff", PAL["dievca"], **VARIANTS["B-hrava-veza"]["kw"])
vb = (-40, top-40, w+80, bot-top+80)
open(f"{OUT}/logo-B-hrava-veza-biela.svg", "w").write(svg_doc(inner, round(vb[2]/2), round(vb[3]/2), vb))

# ---------- Ikony 1024×1024 (maskable: obsah v kruhu Ø ~800 px) ----------
def icon_i(colors, bg, kw, name, k_color=None):
    # „i“ z kociek, voliteľne s písmenom k
    s_unit = 1.0
    if k_color:
        d, wk = glyph_path("k", 0)
        n = kw.get("n", 4); sz = i_size(n, kw.get("gap", 10)); extra = max(0, sz-131) if n != 4 else 0
        stem_x = wk + TRACK + 61 + extra/2
        cubes, ydot = i_cubes(stem_x, 0, colors, **kw)
        inner = f'<path d="{d}" fill="{k_color}"/>' + cubes
        x0, x1 = 61, stem_x + 131 + extra/2 + 12
    else:
        n = kw.get("n", 4); sz = i_size(n, kw.get("gap", 10)); half = max(sz, 137)/2
        cubes, ydot = i_cubes(0, 0, colors, **kw)
        inner = cubes; x0, x1 = 65.5 - half - 12, 65.5 + half + 12
    y0, y1 = ydot - 10, 0
    cw, ch = x1 - x0, y1 - y0
    # zmestiť do kruhu Ø 760 (rezerva voči 800)
    diag = math.hypot(cw, ch)
    sc = 740 / diag
    tx = 512 - (x0 + cw/2) * sc; ty = 512 - (y0 + ch/2) * sc
    body = f'<rect width="1024" height="1024" fill="{bg}"/><g transform="translate({tx:.1f} {ty:.1f}) scale({sc:.4f})">{inner}</g>'
    open(f"{OUT}/ikona-{name}.svg", "w").write(
        f'<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024" role="img" aria-label="KUTISKO"><title>KUTISKO</title>{body}</svg>\n')

icon_i(PAL["dievca"], CREAM, VARIANTS["B-hrava-veza"]["kw"], "1-i-krem")
icon_i(PAL["dievca"], CREAM, VARIANTS["B-hrava-veza"]["kw"], "2-ki-krem", k_color=INK)
icon_i(PAL["dievca"], INK, VARIANTS["B-hrava-veza"]["kw"], "3-i-tmava")
icon_i(["#ffffff"]*4 + ["#F5C518"], "#FF526E", VARIANTS["B-hrava-veza"]["kw"], "4-i-koral")

# ---------- 3+1 kocka ----------
P3 = ["#6FBA47", "#7C83F7", "#FF7A8E", "#F5C518"]   # zelená, modrá, ružová + žltá bodka
V3 = {
  "E-3kocky-rovna": dict(text=INK, colors=P3, kw=dict(n=3, gap=12)),
  "F-3kocky-hrava": dict(text=INK, colors=P3, kw=dict(n=3, gap=12, rots=(0,-4,5), offs=(0,6,-4), dot_rot=-16, dot_dx=8)),
  "G-3kocky-koral": dict(text=CORAL, colors=["#5DC2D6","#F5AD1D","#8CC56E","#7C83F7"], kw=dict(n=3, gap=12, rots=(0,3,-4), offs=(0,-4,4), dot_rot=14)),
}
for name, v in V3.items():
    inner, w, top, bot = wordmark(v["text"], v["colors"], **v["kw"])
    vb = (-40, top-40, w+80, bot-top+80)
    open(f"{OUT}/logo-{name}.svg", "w").write(svg_doc(inner, round(vb[2]/2), round(vb[3]/2), vb))
kw3 = V3["F-3kocky-hrava"]["kw"]
inner, w, top, bot = wordmark("#ffffff", P3, **kw3)
vb = (-40, top-40, w+80, bot-top+80)
open(f"{OUT}/logo-F-3kocky-hrava-biela.svg", "w").write(svg_doc(inner, round(vb[2]/2), round(vb[3]/2), vb))
icon_i(P3, CREAM, kw3, "5-i3-krem")
icon_i(P3, CREAM, kw3, "6-ki3-krem", k_color=INK)
icon_i(P3, INK, kw3, "7-i3-tmava")
print("ok", os.listdir(OUT))

# ---------- FINÁL (schválené 2026-11-23): logo G + ikona 6, svetlá aj tmavá ----------
FIN = os.path.join(OUT, "final"); os.makedirs(FIN, exist_ok=True)
G = V3["G-3kocky-koral"]
inner, w, top, bot = wordmark(G["text"], G["colors"], **G["kw"])
vb = (-20, top-20, w+40, bot-top+40)
open(f"{FIN}/logo-kutisko.svg", "w").write(svg_doc(inner, round(vb[2]/4), round(vb[3]/4), vb))
inner, w, top, bot = wordmark("#ffffff", G["colors"], **G["kw"])
open(f"{FIN}/logo-kutisko-tmave.svg", "w").write(svg_doc(inner, round(vb[2]/4), round(vb[3]/4), vb))

def icon_ki(bg, k_color, target_diag=740, radius=0):
    d, wk = glyph_path("k", 0)
    n = kw3.get("n", 4); sz = i_size(n, kw3.get("gap", 10)); extra = max(0, sz-131)
    stem_x = wk + TRACK + 61 + extra/2
    cubes, ydot = i_cubes(stem_x, 0, P3, **kw3)
    x0, x1 = 61, stem_x + 131 + extra/2 + 12
    y0, y1 = ydot - 10, 0
    cw, ch = x1-x0, y1-y0
    sc = target_diag / math.hypot(cw, ch)
    tx = 512 - (x0+cw/2)*sc; ty = 512 - (y0+ch/2)*sc
    return (f'<rect width="1024" height="1024" rx="{radius}" fill="{bg}"/>'
            f'<g transform="translate({tx:.1f} {ty:.1f}) scale({sc:.4f})"><path d="{d}" fill="{k_color}"/>{cubes}</g>')

def icon_svg(body):
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024" role="img" aria-label="KUTISKO"><title>KUTISKO</title>{body}</svg>\n'
open(f"{FIN}/ikona-kutisko.svg", "w").write(icon_svg(icon_ki(CREAM, INK)))
open(f"{FIN}/ikona-kutisko-tmava.svg", "w").write(icon_svg(icon_ki(INK, "#ffffff")))
# favicon: tesnejší výrez + zaoblenie, prepína sa podľa tmavého režimu systému
light = icon_ki(CREAM, INK, 960, 230).replace("<rect ", '<rect class="bg" ').replace(f'fill="{INK}"/>', f'class="k" fill="{INK}"/>', 1)
open(f"{FIN}/icon.svg", "w").write(
  '<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">'
  '<style>@media (prefers-color-scheme: dark){.bg{fill:#1f1a16}.k{fill:#ffffff}}</style>' + light + '</svg>\n')
print("final ok")
