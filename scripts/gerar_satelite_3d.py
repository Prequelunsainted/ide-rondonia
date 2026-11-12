"""Baixa a imagem de satélite (Esri World Imagery) em lon/lat cobrindo RO + margem
e grava os limites no mesmo sistema de coordenadas de ro-data.js (px do mapa 1000 x 827.6)."""
import json, math, os, sys, urllib.request

src, site = sys.argv[1], sys.argv[2]
g = json.load(open(os.path.join(src, 'mun.geojson'), encoding='utf-8'))
pts = []
for f in g['features']:
    geom = f['geometry']
    polys = geom['coordinates'] if geom['type'] == 'MultiPolygon' else [geom['coordinates']]
    for poly in polys:
        for ring in poly:
            pts += ring
lon0, lon1 = min(p[0] for p in pts), max(p[0] for p in pts)
lat0, lat1 = min(p[1] for p in pts), max(p[1] for p in pts)

# mesma projeção do build_data.py
kx = math.cos(math.radians(-10.9))
minx = lon0 * kx
miny = -lat1
scale = 1000 / ((lon1 - lon0) * kx)

def px(lon, lat):
    return ((lon * kx - minx) * scale, (-lat - miny) * scale)

m = 0.9  # margem em graus
b = (lon0 - m * 1.6, lat0 - m, lon1 + m * 1.6, lat1 + m)
W = 2048
H = round(W * (b[3] - b[1]) / (b[2] - b[0]))
url = ('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export'
       f'?bbox={b[0]},{b[1]},{b[2]},{b[3]}&bboxSR=4326&imageSR=4326&size={W},{H}&format=jpg&f=image')
req = urllib.request.Request(url, headers={'User-Agent': 'landing-build'})
out = os.path.join(site, 'assets', 'satelite-ro-3d.jpg')
with urllib.request.urlopen(req, timeout=90) as r, open(out, 'wb') as fh:
    fh.write(r.read())
x0, y0 = px(b[0], b[3])
x1, y1 = px(b[2], b[1])
info = {'x0': round(x0, 2), 'y0': round(y0, 2), 'x1': round(x1, 2), 'y1': round(y1, 2), 'w': W, 'h': H}
print(info, os.path.getsize(out))
open(os.path.join(site, 'assets', 'ro-sat.js'), 'w', encoding='utf-8').write(
    '/* Limites da imagem de satélite (Esri, Maxar, Earthstar Geographics) nas coordenadas do mapa. */\n'
    'window.RO_SAT = ' + json.dumps(info) + ';\n')
