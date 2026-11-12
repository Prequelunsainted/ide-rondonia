"""Gera site/assets/ro-series.js com as séries anuais de Rondônia usadas no gráfico 3D.

Uso:
    py scripts/gerar_series.py dados/ibge site/assets/ro-series.js

Entrada: pib-serie.json e boi-serie.json (ver baixar_ibge.py).
Saída: window.RO_SERIES = { pib: [[ano, reais], ...], boi: [[ano, cabeças], ...] }
O PIB vem do IBGE em mil reais e é convertido para reais.
"""
import json
import os
import sys


def serie(caminho, mult=1):
    d = json.load(open(caminho, encoding="utf-8"))
    pares = d[0]["resultados"][0]["series"][0]["serie"].items()
    return [[int(ano), float(valor) * mult] for ano, valor in pares]


def main():
    origem, destino = sys.argv[1], sys.argv[2]
    dados = {
        "pib": serie(os.path.join(origem, "pib-serie.json"), 1000),
        "boi": serie(os.path.join(origem, "boi-serie.json")),
    }
    with open(destino, "w", encoding="utf-8") as fh:
        fh.write("/* Séries de Rondônia (IBGE): PIB a preços correntes em reais (tabela 5938) "
                 "e rebanho bovino em cabeças (PPM, tabela 3939). */\n")
        fh.write("window.RO_SERIES = " + json.dumps(dados, separators=(",", ":")) + ";\n")
    print("PIB", dados["pib"][0], "→", dados["pib"][-1])
    print("Rebanho", dados["boi"][0], "→", dados["boi"][-1])


if __name__ == "__main__":
    main()
