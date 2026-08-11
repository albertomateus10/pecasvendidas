import openpyxl

wb = openpyxl.load_workbook('venda de peças jan-julho.xlsx', data_only=True)
sheet = wb.active
rows = list(sheet.iter_rows(values_only=True))[2:]

items = {}
for r in rows:
    desc = str(r[4] or '').strip()
    cod = str(r[1] or '').strip()
    qtd = float(r[7] or 0)
    val = float(r[10] or 0)
    
    key = f"{cod} - {desc}" if cod else desc
    if key not in items:
        items[key] = {'qtd': 0, 'val': 0}
    items[key]['qtd'] += qtd
    items[key]['val'] += val

sorted_qtd = sorted(items.items(), key=lambda x: x[1]['qtd'], reverse=True)
print("--- TOP 10 POR QUANTIDADE (CÓDIGO + DESCRIÇÃO) ---")
for k, v in sorted_qtd[:10]:
    print(f"{k:<50} | Qtd: {v['qtd']:<8} | Val: R$ {v['val']:,.2f}")

sorted_val = sorted(items.items(), key=lambda x: x[1]['val'], reverse=True)
print("\n--- TOP 10 POR VALOR (CÓDIGO + DESCRIÇÃO) ---")
for k, v in sorted_val[:10]:
    print(f"{k:<50} | Qtd: {v['qtd']:<8} | Val: R$ {v['val']:,.2f}")
