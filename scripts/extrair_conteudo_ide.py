"""Lista temas, textos, links e painéis do config.json público do app ArcGIS Experience Builder da IDE.

Uso:
    curl -o dados/config-ide.json https://geo.sedec.ro.gov.br/cdn/1/config.json
    py scripts/extrair_conteudo_ide.py dados/config-ide.json
"""
import json, sys, re, html
sys.stdout.reconfigure(encoding="utf-8")
c = json.load(open(sys.argv[1], encoding='utf-8'))
print("title:", c['attributes'].get('title'))
print("theme:", c.get('theme'), json.dumps(c.get('customTheme'), ensure_ascii=False)[:600])
print("header:", json.dumps(c.get('header'), ensure_ascii=False)[:300])

def clean(t):
    t = re.sub(r'<[^>]+>', ' ', t)
    return html.unescape(re.sub(r'\s+', ' ', t)).strip()

def walk(o, path, out):
    if isinstance(o, dict):
        for k, v in o.items():
            walk(v, path + [k], out)
    elif isinstance(o, list):
        for i, v in enumerate(o):
            walk(v, path + [str(i)], out)
    elif isinstance(o, str):
        k = path[-1] if path else ''
        if k in ('text', 'label', 'title', 'tooltip', 'value', 'expression', 'expressionId', 'linkTo', 'url', 'value_', 'src', 'href', 'description') or 'http' in o:
            out.append((k, o))

for wid, w in c['widgets'].items():
    out = []
    walk(w.get('config') or {}, [], out)
    items = []
    for k, v in out:
        t = clean(v) if k != 'url' else v
        if t and len(t) > 1 and not t.startswith('${appResourceUrl}'):
            items.append(f"{k}={t[:300]}")
    if items:
        print(f"\n## {w.get('label')} [{w.get('uri','').split('/')[-2]}]")
        for s in dict.fromkeys(items):
            print("  ", s)
