"""Dados do vídeo: municípios de RO em Web Mercator no quadro 1920x1080 + classes por indicador."""
import json, math, os, sys, urllib.request

src, outdir = sys.argv[1], sys.argv[2]
FW, FH = 1920, 1080
R = 6378137.0

def merc(lon, lat):
    return (R * math.radians(lon), R * math.log(math.tan(math.pi / 4 + math.radians(lat) / 2)))

g = json.load(open(os.path.join(src, 'mun.geojson'), encoding='utf-8'))
nomes = {str(m['id']): m['nome'] for m in json.load(open(os.path.join(src, 'nomes.json'), encoding='utf-8'))}

def serie(fname):
    d = json.load(open(os.path.join(src, fname), encoding='utf-8'))
    out = {}
    for s in d[0]['resultados'][0]['series']:
        (k, v), = s['serie'].items()
        try: out[s['localidade']['id']] = float(v)
        except ValueError: pass
    return out

pop, pib, boi = serie('pop.json'), serie('pib.json'), serie('boi.json')

pts = []
for f in g['features']:
    geom = f['geometry']
    polys = geom['coordinates'] if geom['type'] == 'MultiPolygon' else [geom['coordinates']]
    for poly in polys:
        for ring in poly:
            pts += [merc(*p) for p in ring]
mx0, mx1 = min(p[0] for p in pts), max(p[0] for p in pts)
my0, my1 = min(p[1] for p in pts), max(p[1] for p in pts)

# RO ocupa 84% da altura; centro horizontal em x=1150 (sobra espaço à esquerda para a legenda)
mapH = FH * 0.84
s = mapH / (my1 - my0)  # px por metro
cxm, cym = (mx0 + mx1) / 2, (my0 + my1) / 2
CX, CY = 1150, FH / 2
bx0 = cxm - CX / s
bx1 = bx0 + FW / s
by1 = cym + CY / s
by0 = by1 - FH / s

def px(lon, lat):
    x, y = merc(lon, lat)
    return ((x - bx0) * s, (by1 - y) * s)

def simplify(p, tol=0.6):
    if len(p) < 4: return p
    def rec(a, b):
        (x1, y1), (x2, y2) = p[a], p[b]
        dx, dy = x2 - x1, y2 - y1
        L = math.hypot(dx, dy) or 1e-9
        best, idx = 0, None
        for i in range(a + 1, b):
            d = abs(dy * p[i][0] - dx * p[i][1] + x2 * y1 - y2 * x1) / L
            if d > best: best, idx = d, i
        if best > tol and idx is not None:
            return rec(a, idx)[:-1] + rec(idx, b)
        return [p[a], p[b]]
    return rec(0, len(p) - 1)

def classes(vals, n=5):
    v = sorted(x for x in vals.values())
    cuts = [v[int(len(v) * i / n)] for i in range(1, n)]
    return cuts, {k: sum(x >= c for c in cuts) for k, x in vals.items()}

ind = {}
for key, vals in (('pop', pop), ('pib', pib), ('boi', boi)):
    cuts, cl = classes(vals)
    top = max(vals, key=vals.get)
    ind[key] = {'cuts': cuts, 'cls': cl, 'top': top, 'topv': vals[top], 'min': min(vals.values()), 'max': max(vals.values())}

muns = []
for f in g['features']:
    cod = str(f['properties']['codarea'])
    geom = f['geometry']
    polys = geom['coordinates'] if geom['type'] == 'MultiPolygon' else [geom['coordinates']]
    d = []; sx = sy = n = 0
    for poly in polys:
        for ring in poly:
            raw = [px(*q) for q in ring]
            h = len(raw) // 2
            q = simplify(raw[:h + 1])[:-1] + simplify(raw[h:])
            for x, y in q: sx += x; sy += y; n += 1
            d.append('M' + 'L'.join(f'{x:.1f} {y:.1f}' for x, y in q) + 'Z')
    muns.append({'id': cod, 'nome': nomes[cod], 'd': ''.join(d), 'c': [round(sx / n), round(sy / n)],
                 'k': [ind['pop']['cls'][cod], ind['pib']['cls'][cod], ind['boi']['cls'][cod]]})

meta = {k: {kk: vv for kk, vv in v.items() if kk != 'cls'} for k, v in ind.items()}
for k in meta: meta[k]['topNome'] = nomes[meta[k]['top']]
meta['pvhxy'] = [round(v, 1) for v in px(-63.9039, -8.7612)]
json.dump({'muns': muns, 'meta': meta}, open(os.path.join(outdir, 'video-data.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print(json.dumps(meta, ensure_ascii=False, indent=1))

import sys as _s
if '--sem-imagem' in _s.argv: raise SystemExit
url = ('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export'
       f'?bbox={bx0:.1f},{by0:.1f},{bx1:.1f},{by1:.1f}&bboxSR=3857&imageSR=3857&size={FW},{FH}&format=jpg&f=image')
req = urllib.request.Request(url, headers={'User-Agent': 'hyperframes-video-build'})
with urllib.request.urlopen(req, timeout=60) as r, open(os.path.join(outdir, 'satelite-ro.jpg'), 'wb') as fh:
    fh.write(r.read())
print('imagem', os.path.getsize(os.path.join(outdir, 'satelite-ro.jpg')))
