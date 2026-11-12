"""Baixa da API pública do IBGE (sem chave) todos os dados usados na página.

Uso:
    py scripts/baixar_ibge.py dados/ibge

Gera, na pasta indicada:
    mun.geojson     malha dos 52 municípios de Rondônia (API de malhas v3)
    nomes.json      nomes e códigos dos municípios
    pop.json        população residente, Censo 2022 (SIDRA 4709, variável 93)
    pib.json        PIB a preços correntes, último ano (SIDRA 5938, variável 37)
    boi.json        efetivo de bovinos, último ano (SIDRA 3939, variável 105, rebanho 2670)
    area.json       área territorial, 2022 (SIDRA 4714, variável 6318)
    pib-serie.json  PIB do estado, 2010 a 2023
    boi-serie.json  rebanho bovino do estado, 2010 a 2025
"""
import os
import sys
import urllib.request

BASE = "https://servicodados.ibge.gov.br/api"
MUN = "localidades=N6[N3[11]]"  # todos os municípios de Rondônia (UF 11)
UF = "localidades=N3[11]"       # o estado de Rondônia

ARQUIVOS = {
    "mun.geojson": f"{BASE}/v3/malhas/estados/11?formato=application/vnd.geo+json&qualidade=intermediaria&intrarregiao=municipio",
    "nomes.json": f"{BASE}/v1/localidades/estados/11/municipios",
    "pop.json": f"{BASE}/v3/agregados/4709/periodos/2022/variaveis/93?{MUN}",
    "pib.json": f"{BASE}/v3/agregados/5938/periodos/-1/variaveis/37?{MUN}",
    "boi.json": f"{BASE}/v3/agregados/3939/periodos/-1/variaveis/105?{MUN}&classificacao=79[2670]",
    "area.json": f"{BASE}/v3/agregados/4714/periodos/2022/variaveis/6318?{MUN}",
    "pib-serie.json": f"{BASE}/v3/agregados/5938/periodos/2010-2023/variaveis/37?{UF}",
    "boi-serie.json": f"{BASE}/v3/agregados/3939/periodos/2010-2025/variaveis/105?{UF}&classificacao=79[2670]",
}


def main():
    destino = sys.argv[1] if len(sys.argv) > 1 else "dados/ibge"
    os.makedirs(destino, exist_ok=True)
    for nome, url in ARQUIVOS.items():
        req = urllib.request.Request(url, headers={"User-Agent": "ide-rondonia-landing"})
        with urllib.request.urlopen(req, timeout=90) as r:
            dados = r.read()
        with open(os.path.join(destino, nome), "wb") as fh:
            fh.write(dados)
        print(f"{nome}: {len(dados):,} bytes")


if __name__ == "__main__":
    main()
