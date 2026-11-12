"""Projeta a malha municipal de RO (IBGE) para SVG e junta os indicadores do IBGE."""
import json, math, sys, os

src = sys.argv[1]
out = sys.argv[2]
g = json.load(open(os.path.join(src, 'mun.geojson'), encoding='utf-8'))
nomes = {str(m['id']): m['nome'] for m in json.load(open(os.path.join(src, 'nomes.json'), encoding='utf-8'))}

def serie(fname):
    d = json.load(open(os.path.join(src, fname), encoding='utf-8'))
    res = {}
    ano = None
    for s in d[0]['resultados'][0]['series']:
        (k, v), = s['serie'].items()
        ano = k
        try:
            res[s['localidade']['id']] = float(v)
        except ValueError:
            res[s['localidade']['id']] = None
    return res, ano

pop, ano_pop = serie('pop.json')
pib, ano_pib = serie('pib.json')
boi, ano_boi = serie('boi.json')
area, ano_area = serie('area.json')

# projeção equiretangular com correção do cosseno na latitude média
lat0 = -10.9
kx = math.cos(math.radians(lat0))
allpts = []
for f in g['features']:
    geom = f['geometry']
    polys = geom['coordinates'] if geom['type'] == 'MultiPolygon' else [geom['coordinates']]
    for poly in polys:
        for ring in poly:
            allpts += ring
xs = [p[0] * kx for p in allpts]
ys = [-p[1] for p in allpts]
minx, maxx, miny, maxy = min(xs), max(xs), min(ys), max(ys)
W = 1000
scale = W / (maxx - minx)
H = (maxy - miny) * scale

def proj(p):
    return ((p[0] * kx - minx) * scale, (-p[1] - miny) * scale)

def simplify(pts, tol=0.9):
    # Douglas-Peucker
    if len(pts) < 4:
        return pts
    def rec(a, b):
        (x1, y1), (x2, y2) = pts[a], pts[b]
        dx, dy = x2 - x1, y2 - y1
        L = math.hypot(dx, dy) or 1e-9
        best, idx = 0, None
        for i in range(a + 1, b):
            x0, y0 = pts[i]
            d = abs(dy * x0 - dx * y0 + x2 * y1 - y2 * x1) / L
            if d > best:
                best, idx = d, i
        if best > tol and idx is not None:
            return rec(a, idx)[:-1] + rec(idx, b)
        return [pts[a], pts[b]]
    return rec(0, len(pts) - 1)

muns = []
for f in g['features']:
    cod = str(f['properties'].get('codarea'))
    geom = f['geometry']
    polys = geom['coordinates'] if geom['type'] == 'MultiPolygon' else [geom['coordinates']]
    d = []
    cx = cy = n = 0
    for poly in polys:
        for ring in poly:
            raw = [proj(p) for p in ring]
            h = len(raw) // 2
            pts = simplify(raw[:h + 1])[:-1] + simplify(raw[h:])
            for x, y in pts:
                cx += x; cy += y; n += 1
            d.append('M' + 'L'.join(f'{x:.1f} {y:.1f}' for x, y in pts) + 'Z')
    muns.append({
        'id': cod,
        'nome': nomes.get(cod, cod),
        'd': ''.join(d),
        'c': [round(cx / n, 1), round(cy / n, 1)],
        'pop': pop.get(cod),
        'pib': pib.get(cod),
        'boi': boi.get(cod),
        'area': area.get(cod),
    })

meta = {
    'w': W, 'h': round(H, 1),
    'anos': {'pop': ano_pop, 'pib': ano_pib, 'boi': ano_boi, 'area': ano_area},
    'total': {
        'pop': sum(m['pop'] or 0 for m in muns),
        'pib': sum(m['pib'] or 0 for m in muns),
        'boi': sum(m['boi'] or 0 for m in muns),
        'area': sum(m['area'] or 0 for m in muns),
    },
    'n': len(muns),
}
# ponto de Porto Velho (lon/lat aproximados da sede) projetado
meta['pvh'] = [round(v, 1) for v in proj((-63.90, -8.76))]
with open(out, 'w', encoding='utf-8') as fh:
    fh.write('/* Gerado de dados públicos do IBGE: malha municipal (API de malhas v3), '
             f'Censo {ano_pop}, PIB dos Municípios {ano_pib}, PPM {ano_boi}, área territorial {ano_area}. */\n')
    fh.write('window.RO = ' + json.dumps({'meta': meta, 'muns': muns}, ensure_ascii=False, separators=(',', ':')) + ';\n')
print(meta)
print('bytes', os.path.getsize(out))
