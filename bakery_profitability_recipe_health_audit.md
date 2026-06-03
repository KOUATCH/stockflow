# Bakery Profitability and Recipe-Health Audit

## Ingested Files
| Status | File | Size | Modified | Notes |
|---|---:|---:|---:|---|
| Ingested | `E:\retail management systems\Bakery recipes   melto 2026.xlsx` | 133,759 bytes | 2026-05-31T10:18:59 | Workbook containing recipe tabs, raw material cost sheet, price/weight rows, and military collection record. |
| Excluded | `E:\retail management systems\~$Bakery recipes   melto 2026.xlsx` | 165 bytes | 2026-03-07T15:29:11 | Excel temporary lock/owner file; not a data source. |

| Workbook sheet | Ingest role |
|---|---|
| `baguette` | Recipe/BOM + price/weight rows |
| `New bageutte` | Recipe/BOM + price/weight rows |
| `Banh Mi` | Recipe/BOM + price/weight rows |
| `cake marbre` | Recipe/BOM + price/weight rows |
| `gateau` | Recipe/BOM + price/weight rows |
| `Kouatchoua gato` | Recipe/BOM + price/weight rows |
| ` COST rRAW MATERIAL` | Ingredient cost sheet |
| `BUNS SPECIAL` | Recipe/BOM + price/weight rows |
| `buns new look` | Recipe/BOM + price/weight rows |
| `YUMMY BREAD` | Recipe/BOM + price/weight rows |
| `Donuts` | Recipe/BOM + price/weight rows |
| `Fish Pie` | Recipe/BOM + price/weight rows |
| `Galette` | Recipe/BOM + price/weight rows |
| `New bread` | Recipe/BOM + price/weight rows |
| `NGALA BREAD` | Recipe/BOM + price/weight rows |
| `Pain au lait` | Recipe/BOM + price/weight rows |
| `NEW BRIOCHE` | Recipe/BOM + price/weight rows |
| `Brioche Professionel` | Recipe/BOM + price/weight rows |
| `professinal Buns` | Recipe/BOM + price/weight rows |
| `brioche` | Recipe/BOM + price/weight rows |
| `choko bread` | Recipe/BOM + price/weight rows |
| `Cake Prof` | Recipe/BOM + price/weight rows |
| `Pancake` | Recipe/BOM + price/weight rows |
| `Chinchin` | Recipe/BOM + price/weight rows |
| `Best Chinchin` | Recipe/BOM + price/weight rows |
| `Sugar Balls` | Recipe/BOM + price/weight rows |
| `Delice` | Recipe/BOM + price/weight rows |
| `Danisa biscuits` | Recipe/BOM + price/weight rows |
| `Okinawa` | Recipe/BOM + price/weight rows |
| `CAKE NOW` | Recipe/BOM + price/weight rows |
| `Short bread` | Recipe/BOM + price/weight rows |
| `Melto` | Recipe/BOM + price/weight rows |
| `Ice Cream` | Recipe/BOM + price/weight rows |
| `Melto1` | Recipe/BOM + price/weight rows |
| `Zebree` | Recipe/BOM + price/weight rows |
| `Croissant` | Recipe/BOM + price/weight rows |
| `Universal bread` | Recipe/BOM + price/weight rows |
| `Sheet3` | Recipe/BOM + price/weight rows |
| `Millitary Records` | Ancillary sales/flour collection record; no recipe BOM |

## Executive Summary
- 37 recipe/BOM sheets and 100 saleable price/portion rows were audited from `Bakery recipes   melto 2026.xlsx`; no separate CSV/XLS/TSV business data files were found in the recursive data-artifact scan beyond this workbook.
- Portfolio margin status: 33 red SKUs below 50% GM, 49 yellow SKUs at 50-65% GM, and 18 green SKUs above 65% GM, calculated from workbook ingredient cost and price/weight cells.
- Worst priced SKU: `New bageutte (500g @ 200.00)` at 9.4% GM, with ingredient COGS/unit 181.28 vs price 200.00; source `New bageutte!B18`, `New bageutte!C18` and base recipe cells in `Bakery recipes   melto 2026.xlsx`.
- 30 recipes have top-2 ingredient concentration above 60% of ingredient cost; flour, butter/oil, egg, and sugar dominate purchasing exposure across the workbook.
- Every audited recipe is missing labor minutes, loaded labor rate, packaging cost, overhead allocation, actual yield, waste/shrinkage logs, and daily fixed-cost/volume data; full COGS, contribution margin, daily break-even, and true shrink-adjusted margin are therefore not fully auditable.

## Portfolio Health Scorecard
| Recipe / SKU | COGS/unit | Price | GM $ | Contribution margin/unit | GM % | Food cost % | Break-even units/batch | Verdict | Source |
|---|---:|---:|---:|---:|---:|---:|---:|:---:|---|
| New bageutte (500g @ 200.00) | 181.28 | 200.00 | 18.72 | 18.72 | 9.4% | 90.6% | 1.09 | 🔴 | `New bageutte!B18`, `New bageutte!C18`, base `New bageutte` ingredient rows |
| Banh Mi (500g @ 200.00) | 153.79 | 200.00 | 46.21 | 46.21 | 23.1% | 76.9% | 16.19 | 🔴 | `Banh Mi!B18`, `Banh Mi!C18`, base `Banh Mi` ingredient rows |
| gateau (900g @ 1,000) | 708.51 | 1,000 | 291.49 | 291.49 | 29.1% | 70.9% | 31.39 | 🔴 | `gateau!B24`, `gateau!C24`, base `gateau` ingredient rows |
| gateau (90g @ 100.00) | 70.85 | 100.00 | 29.15 | 29.15 | 29.1% | 70.9% | 313.95 | 🔴 | `gateau!B22`, `gateau!C22`, base `gateau` ingredient rows |
| gateau (90g @ 100.00) | 70.85 | 100.00 | 29.15 | 29.15 | 29.1% | 70.9% | 313.95 | 🔴 | `gateau!B23`, `gateau!C23`, base `gateau` ingredient rows |
| professinal Buns (95g @ 100.00) | 70.59 | 100.00 | 29.41 | 29.41 | 29.4% | 70.6% | 103.32 | 🔴 | `professinal Buns!B23`, `professinal Buns!C23`, base `professinal Buns` ingredient rows |
| professinal Buns (140g @ 150.00) | 104.02 | 150.00 | 45.98 | 45.98 | 30.7% | 69.3% | 68.88 | 🔴 | `professinal Buns!B24`, `professinal Buns!C24`, base `professinal Buns` ingredient rows |
| Melto (45g @ 50.00) | 34.66 | 50.00 | 15.34 | 15.34 | 30.7% | 69.3% | 115.38 | 🔴 | `Melto!B17`, `Melto!C17`, base `Melto` ingredient rows |
| baguette (200g @ 100.00) | 68.39 | 100.00 | 31.61 | 31.61 | 31.6% | 68.4% | 33.82 | 🔴 | `baguette!B17`, `baguette!C17`, base `baguette` ingredient rows |
| Short bread (45g @ 50.00) | 33.98 | 50.00 | 16.02 | 16.02 | 32.0% | 68.0% | 59.66 | 🔴 | `Short bread!B18`, `Short bread!C18`, base `Short bread` ingredient rows |
| Melto1 (45g @ 50.00) | 33.91 | 50.00 | 16.09 | 16.09 | 32.2% | 67.8% | 113.65 | 🔴 | `Melto1!B17`, `Melto1!C17`, base `Melto1` ingredient rows |
| Brioche Professionel (800g @ 1,000) | 654.93 | 1,000 | 345.07 | 345.07 | 34.5% | 65.5% | 8.80 | 🔴 | `Brioche Professionel!B21`, `Brioche Professionel!C21`, base `Brioche Professionel` ingredient rows |
| gateau (81g @ 100.00) | 63.77 | 100.00 | 36.23 | 36.23 | 36.2% | 63.8% | 313.95 | 🔴 | `gateau!B21`, `gateau!C21`, base `gateau` ingredient rows |
| choko bread (100g @ 100.00) | 63.48 | 100.00 | 36.52 | 36.52 | 36.5% | 63.5% | 53.22 | 🔴 | `choko bread!B20`, `choko bread!C20`, base `choko bread` ingredient rows |
| Fish Pie (85g @ 100.00) | 62.31 | 100.00 | 37.69 | 37.69 | 37.7% | 62.3% | 41.79 | 🔴 | `Fish Pie!B22`, `Fish Pie!C22`, base `Fish Pie` ingredient rows |
| Danisa biscuits (850g @ 1,000) | 619.14 | 1,000 | 380.86 | 380.86 | 38.1% | 61.9% | 5.12 | 🔴 | `Danisa biscuits!B23`, `Danisa biscuits!C23`, base `Danisa biscuits` ingredient rows |
| Brioche Professionel (220g @ 300.00) | 180.11 | 300.00 | 119.89 | 119.89 | 40.0% | 60.0% | 29.34 | 🔴 | `Brioche Professionel!B20`, `Brioche Professionel!C20`, base `Brioche Professionel` ingredient rows |
| professinal Buns (800g @ 1,000) | 594.41 | 1,000 | 405.59 | 405.59 | 40.6% | 59.4% | 10.33 | 🔴 | `professinal Buns!B25`, `professinal Buns!C25`, base `professinal Buns` ingredient rows |
| Short bread (38g @ 50.00) | 28.70 | 50.00 | 21.30 | 21.30 | 42.6% | 57.4% | 59.66 | 🔴 | `Short bread!B17`, `Short bread!C17`, base `Short bread` ingredient rows |
| Brioche Professionel (70g @ 100.00) | 57.31 | 100.00 | 42.69 | 42.69 | 42.7% | 57.3% | 88.01 | 🔴 | `Brioche Professionel!B19`, `Brioche Professionel!C19`, base `Brioche Professionel` ingredient rows |
| choko bread (90g @ 100.00) | 57.13 | 100.00 | 42.87 | 42.87 | 42.9% | 57.1% | 53.22 | 🔴 | `choko bread!B22`, `choko bread!C22`, base `choko bread` ingredient rows |
| cake marbre (50g @ 100.00) | 56.58 | 100.00 | 43.42 | 43.42 | 43.4% | 56.6% | 59.15 | 🔴 | `cake marbre!B21`, `cake marbre!C21`, base `cake marbre` ingredient rows |
| Sheet3 (144g @ 125.00) | 68.53 | 125.00 | 56.47 | 56.47 | 45.2% | 54.8% | 73.29 | 🔴 | `Sheet3!B21`, `Sheet3!C21`, base `Sheet3` ingredient rows |
| Ice Cream (45g @ 50.00) | 27.17 | 50.00 | 22.83 | 22.83 | 45.7% | 54.3% | 187.20 | 🔴 | `Ice Cream!B15`, `Ice Cream!C15`, base `Ice Cream` ingredient rows |
| YUMMY BREAD (144g @ 125.00) | 66.56 | 125.00 | 58.44 | 58.44 | 46.7% | 53.3% | 97.07 | 🔴 | `YUMMY BREAD!B21`, `YUMMY BREAD!C21`, base `YUMMY BREAD` ingredient rows |
| BUNS SPECIAL (800g @ 1,000) | 529.12 | 1,000 | 470.88 | 470.88 | 47.1% | 52.9% | 9.87 | 🔴 | `BUNS SPECIAL!B20`, `BUNS SPECIAL!C20`, base `BUNS SPECIAL` ingredient rows |
| Melto1 (35g @ 50.00) | 26.38 | 50.00 | 23.62 | 23.62 | 47.2% | 52.8% | 113.65 | 🔴 | `Melto1!B16`, `Melto1!C16`, base `Melto1` ingredient rows |
| Melto (34g @ 50.00) | 26.19 | 50.00 | 23.81 | 23.81 | 47.6% | 52.4% | 115.38 | 🔴 | `Melto!B16`, `Melto!C16`, base `Melto` ingredient rows |
| CAKE NOW (60g @ 100.00) | 51.87 | 100.00 | 48.13 | 48.13 | 48.1% | 51.9% | 61.38 | 🔴 | `CAKE NOW!B18`, `CAKE NOW!C18`, base `CAKE NOW` ingredient rows |
| NEW BRIOCHE (82g @ 100.00) | 51.63 | 100.00 | 48.37 | 48.37 | 48.4% | 51.6% | 108.38 | 🔴 | `NEW BRIOCHE!B21`, `NEW BRIOCHE!C21`, base `NEW BRIOCHE` ingredient rows |
| brioche (82g @ 100.00) | 51.18 | 100.00 | 48.82 | 48.82 | 48.8% | 51.2% | 108.61 | 🔴 | `brioche!B21`, `brioche!C21`, base `brioche` ingredient rows |
| Danisa biscuits (140g @ 200.00) | 101.98 | 200.00 | 98.02 | 98.02 | 49.0% | 51.0% | 25.59 | 🔴 | `Danisa biscuits!B24`, `Danisa biscuits!C24`, base `Danisa biscuits` ingredient rows |
| Danisa biscuits (700g @ 1,000) | 509.88 | 1,000 | 490.12 | 490.12 | 49.0% | 51.0% | 5.12 | 🔴 | `Danisa biscuits!B25`, `Danisa biscuits!C25`, base `Danisa biscuits` ingredient rows |
| brioche (160g @ 200.00) | 99.87 | 200.00 | 100.13 | 100.13 | 50.1% | 49.9% | 54.31 | 🟡 | `brioche!B22`, `brioche!C22`, base `brioche` ingredient rows |
| Delice (700g @ 1,000) | 497.80 | 1,000 | 502.20 | 502.20 | 50.2% | 49.8% | 4.83 | 🟡 | `Delice!B23`, `Delice!C23`, base `Delice` ingredient rows |
| Delice (700g @ 1,000) | 497.80 | 1,000 | 502.20 | 502.20 | 50.2% | 49.8% | 4.83 | 🟡 | `Delice!B25`, `Delice!C25`, base `Delice` ingredient rows |
| Delice (140g @ 200.00) | 99.56 | 200.00 | 100.44 | 100.44 | 50.2% | 49.8% | 24.13 | 🟡 | `Delice!B24`, `Delice!C24`, base `Delice` ingredient rows |
| Universal bread (90g @ 100.00) | 49.74 | 100.00 | 50.26 | 50.26 | 50.3% | 49.7% | 277.28 | 🟡 | `Universal bread!B21`, `Universal bread!C21`, base `Universal bread` ingredient rows |
| Universal bread (90g @ 100.00) | 49.74 | 100.00 | 50.26 | 50.26 | 50.3% | 49.7% | 277.28 | 🟡 | `Universal bread!B22`, `Universal bread!C22`, base `Universal bread` ingredient rows |
| Universal bread (900g @ 1,000) | 497.41 | 1,000 | 502.59 | 502.59 | 50.3% | 49.7% | 27.73 | 🟡 | `Universal bread!B23`, `Universal bread!C23`, base `Universal bread` ingredient rows |
| Galette (79g @ 100.00) | 49.30 | 100.00 | 50.70 | 50.70 | 50.7% | 49.3% | 106.06 | 🟡 | `Galette!B22`, `Galette!C22`, base `Galette` ingredient rows |
| Kouatchoua gato (90g @ 100.00) | 48.88 | 100.00 | 51.12 | 51.12 | 51.1% | 48.9% | 275.40 | 🟡 | `Kouatchoua gato!B21`, `Kouatchoua gato!C21`, base `Kouatchoua gato` ingredient rows |
| Kouatchoua gato (90g @ 100.00) | 48.88 | 100.00 | 51.12 | 51.12 | 51.1% | 48.9% | 275.40 | 🟡 | `Kouatchoua gato!B22`, `Kouatchoua gato!C22`, base `Kouatchoua gato` ingredient rows |
| Kouatchoua gato (900g @ 1,000) | 488.78 | 1,000 | 511.22 | 511.22 | 51.1% | 48.9% | 27.54 | 🟡 | `Kouatchoua gato!B23`, `Kouatchoua gato!C23`, base `Kouatchoua gato` ingredient rows |
| Cake Prof (57g @ 100.00) | 48.62 | 100.00 | 51.38 | 51.38 | 51.4% | 48.6% | 66.95 | 🟡 | `Cake Prof!B17`, `Cake Prof!C17`, base `Cake Prof` ingredient rows |
| BUNS SPECIAL (220g @ 300.00) | 145.51 | 300.00 | 154.49 | 154.49 | 51.5% | 48.5% | 32.89 | 🟡 | `BUNS SPECIAL!B19`, `BUNS SPECIAL!C19`, base `BUNS SPECIAL` ingredient rows |
| Okinawa (80g @ 100.00) | 47.93 | 100.00 | 52.07 | 52.07 | 52.1% | 47.9% | 44.34 | 🟡 | `Okinawa!B16`, `Okinawa!C16`, base `Okinawa` ingredient rows |
| Okinawa (80g @ 100.00) | 47.93 | 100.00 | 52.07 | 52.07 | 52.1% | 47.9% | 44.34 | 🟡 | `Okinawa!B17`, `Okinawa!C17`, base `Okinawa` ingredient rows |
| Fish Pie (65g @ 100.00) | 47.65 | 100.00 | 52.35 | 52.35 | 52.3% | 47.7% | 41.79 | 🟡 | `Fish Pie!B23`, `Fish Pie!C23`, base `Fish Pie` ingredient rows |
| Sheet3 (500g @ 500.00) | 237.96 | 500.00 | 262.04 | 262.04 | 52.4% | 47.6% | 18.32 | 🟡 | `Sheet3!B22`, `Sheet3!C22`, base `Sheet3` ingredient rows |
| New bageutte (65g @ 50.00) | 23.57 | 50.00 | 26.43 | 26.43 | 52.9% | 47.1% | 4.37 | 🟡 | `New bageutte!B19`, `New bageutte!C19`, base `New bageutte` ingredient rows |
| choko bread (220g @ 300.00) | 139.65 | 300.00 | 160.35 | 160.35 | 53.4% | 46.6% | 17.74 | 🟡 | `choko bread!B21`, `choko bread!C21`, base `choko bread` ingredient rows |
| cake marbre (60g @ 150.00) | 67.90 | 150.00 | 82.10 | 82.10 | 54.7% | 45.3% | 39.43 | 🟡 | `cake marbre!B20`, `cake marbre!C20`, base `cake marbre` ingredient rows |
| Universal bread (81.40g @ 100.00) | 44.99 | 100.00 | 55.01 | 55.01 | 55.0% | 45.0% | 277.28 | 🟡 | `Universal bread!B20`, `Universal bread!C20`, base `Universal bread` ingredient rows |
| Best Chinchin (500g @ 1,000) | 445.97 | 1,000 | 554.03 | 554.03 | 55.4% | 44.6% | 53.83 | 🟡 | `Best Chinchin!B21`, `Best Chinchin!C21`, base `Best Chinchin` ingredient rows |
| baguette (65g @ 50.00) | 22.23 | 50.00 | 27.77 | 27.77 | 55.5% | 44.5% | 67.64 | 🟡 | `baguette!B18`, `baguette!C18`, base `baguette` ingredient rows |
| YUMMY BREAD (144g @ 150.00) | 66.56 | 150.00 | 83.44 | 83.44 | 55.6% | 44.4% | 80.89 | 🟡 | `YUMMY BREAD!B20`, `YUMMY BREAD!C20`, base `YUMMY BREAD` ingredient rows |
| Kouatchoua gato (81.40g @ 100.00) | 44.21 | 100.00 | 55.79 | 55.79 | 55.8% | 44.2% | 275.40 | 🟡 | `Kouatchoua gato!B20`, `Kouatchoua gato!C20`, base `Kouatchoua gato` ingredient rows |
| Sheet3 (139g @ 150.00) | 66.15 | 150.00 | 83.85 | 83.85 | 55.9% | 44.1% | 61.08 | 🟡 | `Sheet3!B23`, `Sheet3!C23`, base `Sheet3` ingredient rows |
| NEW BRIOCHE (140g @ 200.00) | 88.15 | 200.00 | 111.85 | 111.85 | 55.9% | 44.1% | 54.19 | 🟡 | `NEW BRIOCHE!B22`, `NEW BRIOCHE!C22`, base `NEW BRIOCHE` ingredient rows |
| NEW BRIOCHE (700g @ 1,000) | 440.76 | 1,000 | 559.24 | 559.24 | 55.9% | 44.1% | 10.84 | 🟡 | `NEW BRIOCHE!B23`, `NEW BRIOCHE!C23`, base `NEW BRIOCHE` ingredient rows |
| NGALA BREAD | 43.93 | 100.00 | 56.07 | 56.07 | 56.1% | 43.9% | 75.32 | 🟡 | `NGALA BREAD!C20`, `NGALA BREAD!D20`, base `NGALA BREAD` ingredient rows |
| brioche (700g @ 1,000) | 436.94 | 1,000 | 563.06 | 563.06 | 56.3% | 43.7% | 10.86 | 🟡 | `brioche!B23`, `brioche!C23`, base `brioche` ingredient rows |
| Galette (700g @ 1,000) | 436.86 | 1,000 | 563.14 | 563.14 | 56.3% | 43.7% | 10.61 | 🟡 | `Galette!B24`, `Galette!C24`, base `Galette` ingredient rows |
| Galette (140g @ 200.00) | 87.37 | 200.00 | 112.63 | 112.63 | 56.3% | 43.7% | 53.03 | 🟡 | `Galette!B23`, `Galette!C23`, base `Galette` ingredient rows |
| YUMMY BREAD (139g @ 150.00) | 64.25 | 150.00 | 85.75 | 85.75 | 57.2% | 42.8% | 80.89 | 🟡 | `YUMMY BREAD!B22`, `YUMMY BREAD!C22`, base `YUMMY BREAD` ingredient rows |
| Pain au lait (136g @ 150.00) | 64.13 | 150.00 | 85.87 | 85.87 | 57.2% | 42.8% | 64.31 | 🟡 | `Pain au lait!B23`, `Pain au lait!C23`, base `Pain au lait` ingredient rows |
| Zebree (190g @ 250.00) | 106.85 | 250.00 | 143.15 | 143.15 | 57.3% | 42.7% | 41.62 | 🟡 | `Zebree!B23`, `Zebree!C23`, base `Zebree` ingredient rows |
| Donuts (40g @ 50.00) | 21.27 | 50.00 | 28.73 | 28.73 | 57.5% | 42.5% | 291.94 | 🟡 | `Donuts!B18`, `Donuts!C18`, base `Donuts` ingredient rows |
| Ice Cream (70g @ 100.00) | 42.27 | 100.00 | 57.73 | 57.73 | 57.7% | 42.3% | 93.60 | 🟡 | `Ice Cream!B14`, `Ice Cream!C14`, base `Ice Cream` ingredient rows |
| buns new look | 41.87 | 100.00 | 58.13 | 58.13 | 58.1% | 41.9% | 43.50 | 🟡 | `buns new look!C20`, `buns new look!D20`, base `buns new look` ingredient rows |
| Zebree (370g @ 500.00) | 208.07 | 500.00 | 291.93 | 291.93 | 58.4% | 41.6% | 20.81 | 🟡 | `Zebree!B22`, `Zebree!C22`, base `Zebree` ingredient rows |
| Best Chinchin (45g @ 100.00) | 40.14 | 100.00 | 59.86 | 59.86 | 59.9% | 40.1% | 538.29 | 🟡 | `Best Chinchin!B19`, `Best Chinchin!C19`, base `Best Chinchin` ingredient rows |
| Best Chinchin (225g @ 500.00) | 200.69 | 500.00 | 299.31 | 299.31 | 59.9% | 40.1% | 107.66 | 🟡 | `Best Chinchin!B20`, `Best Chinchin!C20`, base `Best Chinchin` ingredient rows |
| Banh Mi (65g @ 50.00) | 19.99 | 50.00 | 30.01 | 30.01 | 60.0% | 40.0% | 64.78 | 🟡 | `Banh Mi!B19`, `Banh Mi!C19`, base `Banh Mi` ingredient rows |
| Zebree (700g @ 1,000) | 393.64 | 1,000 | 606.36 | 606.36 | 60.6% | 39.4% | 10.41 | 🟡 | `Zebree!B24`, `Zebree!C24`, base `Zebree` ingredient rows |
| Cake Prof (230g @ 500.00) | 196.17 | 500.00 | 303.83 | 303.83 | 60.8% | 39.2% | 13.39 | 🟡 | `Cake Prof!B16`, `Cake Prof!C16`, base `Cake Prof` ingredient rows |
| CAKE NOW (220g @ 500.00) | 190.19 | 500.00 | 309.81 | 309.81 | 62.0% | 38.0% | 12.28 | 🟡 | `CAKE NOW!B17`, `CAKE NOW!C17`, base `CAKE NOW` ingredient rows |
| Pancake (60g @ 100.00) | 37.72 | 100.00 | 62.28 | 62.28 | 62.3% | 37.7% | 49.52 | 🟡 | `Pancake!B19`, `Pancake!C19`, base `Pancake` ingredient rows |
| Pain au lait (800g @ 1,000) | 377.21 | 1,000 | 622.79 | 622.79 | 62.3% | 37.7% | 9.65 | 🟡 | `Pain au lait!B25`, `Pain au lait!C25`, base `Pain au lait` ingredient rows |
| BUNS SPECIAL (55g @ 100.00) | 36.38 | 100.00 | 63.62 | 63.62 | 63.6% | 36.4% | 98.68 | 🟡 | `BUNS SPECIAL!B18`, `BUNS SPECIAL!C18`, base `BUNS SPECIAL` ingredient rows |
| Croissant (190g @ 250.00) | 88.52 | 250.00 | 161.48 | 161.48 | 64.6% | 35.4% | 12.28 | 🟡 | `Croissant!B19`, `Croissant!C19`, base `Croissant` ingredient rows |
| Sugar Balls (80g @ 100.00) | 33.76 | 100.00 | 66.24 | 66.24 | 66.2% | 33.8% | 71.78 | 🟢 | `Sugar Balls!B18`, `Sugar Balls!C18`, base `Sugar Balls` ingredient rows |
| Sugar Balls (80g @ 100.00) | 33.76 | 100.00 | 66.24 | 66.24 | 66.2% | 33.8% | 71.78 | 🟢 | `Sugar Balls!B19`, `Sugar Balls!C19`, base `Sugar Balls` ingredient rows |
| Chinchin (45g @ 100.00) | 32.99 | 100.00 | 67.01 | 67.01 | 67.0% | 33.0% | 44.48 | 🟢 | `Chinchin!B19`, `Chinchin!C19`, base `Chinchin` ingredient rows |
| New bageutte (90g @ 100.00) | 32.63 | 100.00 | 67.37 | 67.37 | 67.4% | 32.6% | 2.18 | 🟢 | `New bageutte!B17`, `New bageutte!C17`, base `New bageutte` ingredient rows |
| Croissant (700g @ 1,000) | 326.14 | 1,000 | 673.86 | 673.86 | 67.4% | 32.6% | 3.07 | 🟢 | `Croissant!B20`, `Croissant!C20`, base `Croissant` ingredient rows |
| Chinchin (220g @ 500.00) | 161.30 | 500.00 | 338.70 | 338.70 | 67.7% | 32.3% | 8.90 | 🟢 | `Chinchin!B21`, `Chinchin!C21`, base `Chinchin` ingredient rows |
| New bread | 31.79 | 100.00 | 68.21 | 68.21 | 68.2% | 31.8% | 85.34 | 🟢 | `New bread!C20`, `New bread!D20`, base `New bread` ingredient rows |
| Pancake (50g @ 100.00) | 31.44 | 100.00 | 68.56 | 68.56 | 68.6% | 31.4% | 49.52 | 🟢 | `Pancake!B20`, `Pancake!C20`, base `Pancake` ingredient rows |
| Pain au lait (200g @ 300.00) | 94.30 | 300.00 | 205.70 | 205.70 | 68.6% | 31.4% | 32.15 | 🟢 | `Pain au lait!B24`, `Pain au lait!C24`, base `Pain au lait` ingredient rows |
| baguette (90g @ 100.00) | 30.78 | 100.00 | 69.22 | 69.22 | 69.2% | 30.8% | 33.82 | 🟢 | `baguette!B16`, `baguette!C16`, base `baguette` ingredient rows |
| Chinchin (40g @ 100.00) | 29.33 | 100.00 | 70.67 | 70.67 | 70.7% | 29.3% | 44.48 | 🟢 | `Chinchin!B20`, `Chinchin!C20`, base `Chinchin` ingredient rows |
| Banh Mi (90g @ 100.00) | 27.68 | 100.00 | 72.32 | 72.32 | 72.3% | 27.7% | 32.39 | 🟢 | `Banh Mi!B17`, `Banh Mi!C17`, base `Banh Mi` ingredient rows |
| Donuts (22g @ 50.00) | 11.70 | 50.00 | 38.30 | 38.30 | 76.6% | 23.4% | 291.94 | 🟢 | `Donuts!B19`, `Donuts!C19`, base `Donuts` ingredient rows |
| Fish Pie (150g @ 500.00) | 109.96 | 500.00 | 390.04 | 390.04 | 78.0% | 22.0% | 8.36 | 🟢 | `Fish Pie!B24`, `Fish Pie!C24`, base `Fish Pie` ingredient rows |
| Croissant (45g @ 100.00) | 20.97 | 100.00 | 79.03 | 79.03 | 79.0% | 21.0% | 30.70 | 🟢 | `Croissant!B18`, `Croissant!C18`, base `Croissant` ingredient rows |
| Okinawa (150g @ 500.00) | 89.88 | 500.00 | 410.12 | 410.12 | 82.0% | 18.0% | 8.87 | 🟢 | `Okinawa!B18`, `Okinawa!C18`, base `Okinawa` ingredient rows |
| Donuts (150g @ 500.00) | 79.77 | 500.00 | 420.23 | 420.23 | 84.0% | 16.0% | 29.19 | 🟢 | `Donuts!B20`, `Donuts!C20`, base `Donuts` ingredient rows |
| Sugar Balls (150g @ 500.00) | 63.30 | 500.00 | 436.70 | 436.70 | 87.3% | 12.7% | 14.36 | 🟢 | `Sugar Balls!B20`, `Sugar Balls!C20`, base `Sugar Balls` ingredient rows |

## Per-Recipe Deep Dives
### baguette
- Category: bread; base batch mass 9,890 and ingredient cost 3,382 from first quantity/cost pair in `Bakery recipes   melto 2026.xlsx`.
- Missing fields: labor minutes/rate, packaging cost, overhead allocation, actual yield, waste/shrinkage, daily fixed cost, daily sales volume.
- Concentration: top ingredient `flour` plus next ingredient = 89.4% of base ingredient cost.

| Ingredient | Qty | Cost | % ingredient cost | Source |
|---|---:|---:|---:|---|
| flour | 6,000 | 2,520 | 74.5% | `baguette!D5`, `baguette!E5` |
| improver | 180 | 504.00 | 14.9% | `baguette!D9`, `baguette!E9` |
| yeast | 120 | 336.00 | 9.9% | `baguette!D6`, `baguette!E6` |
| salt | 90 | 18.50 | 0.5% | `baguette!D7`, `baguette!E7` |
| water | 3,500 | 3.50 | 0.1% | `baguette!D8`, `baguette!E8` |

| SKU / portion | Theoretical yield | Price | Ingredient COGS/unit | Labor/unit | Packaging+OH/unit | Total auditable COGS/unit | Contribution margin/unit | GM % | Food cost flag | Break-even/batch | Source |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---:|---|
| 90g @ 100.00 | 109.89 | 100.00 | 30.78 | missing | missing | 30.78 | 69.22 | 69.2% | OK 25-35% | 33.82 | `baguette!B16`, `baguette!C16` |
| 200g @ 100.00 | 49.45 | 100.00 | 68.39 | missing | missing | 68.39 | 31.61 | 31.6% | Outside 25-35% | 33.82 | `baguette!B17`, `baguette!C17` |
| 65g @ 50.00 | 152.15 | 50.00 | 22.23 | missing | missing | 22.23 | 27.77 | 55.5% | Outside 25-35% | 67.64 | `baguette!B18`, `baguette!C18` |

| Sensitivity: key ingredient +10% / +25% | Margin $ after +10% | GM % after +10% | Margin $ after +25% | GM % after +25% | Source |
|---|---:|---:|---:|---:|---|
| 90g @ 100.00; key `flour` | 66.93 | 66.9% | 63.49 | 63.5% | `baguette!E5`, `baguette!B16`, `baguette!C16` |
| 200g @ 100.00; key `flour` | 26.51 | 26.5% | 18.87 | 18.9% | `baguette!E5`, `baguette!B17`, `baguette!C17` |
| 65g @ 50.00; key `flour` | 26.12 | 52.2% | 23.63 | 47.3% | `baguette!E5`, `baguette!B18`, `baguette!C18` |

### New bageutte
- Category: other; base batch mass 602 and ingredient cost 218.27 from first quantity/cost pair in `Bakery recipes   melto 2026.xlsx`.
- Missing fields: labor minutes/rate, packaging cost, overhead allocation, actual yield, waste/shrinkage, daily fixed cost, daily sales volume.
- Concentration: top ingredient `flour` plus next ingredient = 93.0% of base ingredient cost.

| Ingredient | Qty | Cost | % ingredient cost | Source |
|---|---:|---:|---:|---|
| flour | 350 | 147.00 | 67.3% | `New bageutte!F5`, `New bageutte!G5` |
| improver | 20 | 56.00 | 25.7% | `New bageutte!F10`, `New bageutte!G10` |
| sugar | 10 | 7.40 | 3.4% | `New bageutte!F7`, `New bageutte!G7` |
| yeast | 2 | 5.60 | 2.6% | `New bageutte!F6`, `New bageutte!G6` |
| salt | 10 | 2.06 | 0.9% | `New bageutte!F8`, `New bageutte!G8` |
| water | 210 | 0.21 | 0.1% | `New bageutte!F9`, `New bageutte!G9` |

| SKU / portion | Theoretical yield | Price | Ingredient COGS/unit | Labor/unit | Packaging+OH/unit | Total auditable COGS/unit | Contribution margin/unit | GM % | Food cost flag | Break-even/batch | Source |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---:|---|
| 90g @ 100.00 | 6.69 | 100.00 | 32.63 | missing | missing | 32.63 | 67.37 | 67.4% | OK 25-35% | 2.18 | `New bageutte!B17`, `New bageutte!C17` |
| 500g @ 200.00 | 1.20 | 200.00 | 181.28 | missing | missing | 181.28 | 18.72 | 9.4% | Outside 25-35% | 1.09 | `New bageutte!B18`, `New bageutte!C18` |
| 65g @ 50.00 | 9.26 | 50.00 | 23.57 | missing | missing | 23.57 | 26.43 | 52.9% | Outside 25-35% | 4.37 | `New bageutte!B19`, `New bageutte!C19` |

| Sensitivity: key ingredient +10% / +25% | Margin $ after +10% | GM % after +10% | Margin $ after +25% | GM % after +25% | Source |
|---|---:|---:|---:|---:|---|
| 90g @ 100.00; key `flour` | 65.17 | 65.2% | 61.87 | 61.9% | `New bageutte!G5`, `New bageutte!B17`, `New bageutte!C17` |
| 500g @ 200.00; key `flour` | 6.51 | 3.3% | -11.81 | -5.9% | `New bageutte!G5`, `New bageutte!B18`, `New bageutte!C18` |
| 65g @ 50.00; key `flour` | 24.85 | 49.7% | 22.47 | 44.9% | `New bageutte!G5`, `New bageutte!B19`, `New bageutte!C19` |

### Banh Mi
- Category: bread; base batch mass 10,530 and ingredient cost 3,239 from first quantity/cost pair in `Bakery recipes   melto 2026.xlsx`.
- Missing fields: labor minutes/rate, packaging cost, overhead allocation, actual yield, waste/shrinkage, daily fixed cost, daily sales volume.
- Concentration: top ingredient `flour` plus next ingredient = 90.8% of base ingredient cost.

| Ingredient | Qty | Cost | % ingredient cost | Source |
|---|---:|---:|---:|---|
| flour | 6,000 | 2,520 | 77.8% | `Banh Mi!F5`, `Banh Mi!G5` |
| improver | 150 | 420.00 | 13.0% | `Banh Mi!F10`, `Banh Mi!G10` |
| yeast | 90 | 252.00 | 7.8% | `Banh Mi!F6`, `Banh Mi!G6` |
| sugar | 45 | 33.30 | 1.0% | `Banh Mi!F7`, `Banh Mi!G7` |
| salt | 45 | 9.25 | 0.3% | `Banh Mi!F8`, `Banh Mi!G8` |
| water | 4,200 | 4.20 | 0.1% | `Banh Mi!F9`, `Banh Mi!G9` |

| SKU / portion | Theoretical yield | Price | Ingredient COGS/unit | Labor/unit | Packaging+OH/unit | Total auditable COGS/unit | Contribution margin/unit | GM % | Food cost flag | Break-even/batch | Source |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---:|---|
| 90g @ 100.00 | 117 | 100.00 | 27.68 | missing | missing | 27.68 | 72.32 | 72.3% | OK 25-35% | 32.39 | `Banh Mi!B17`, `Banh Mi!C17` |
| 500g @ 200.00 | 21.06 | 200.00 | 153.79 | missing | missing | 153.79 | 46.21 | 23.1% | Outside 25-35% | 16.19 | `Banh Mi!B18`, `Banh Mi!C18` |
| 65g @ 50.00 | 162 | 50.00 | 19.99 | missing | missing | 19.99 | 30.01 | 60.0% | Outside 25-35% | 64.78 | `Banh Mi!B19`, `Banh Mi!C19` |

| Sensitivity: key ingredient +10% / +25% | Margin $ after +10% | GM % after +10% | Margin $ after +25% | GM % after +25% | Source |
|---|---:|---:|---:|---:|---|
| 90g @ 100.00; key `flour` | 70.16 | 70.2% | 66.93 | 66.9% | `Banh Mi!G5`, `Banh Mi!B17`, `Banh Mi!C17` |
| 500g @ 200.00; key `flour` | 34.25 | 17.1% | 16.30 | 8.1% | `Banh Mi!G5`, `Banh Mi!B18`, `Banh Mi!C18` |
| 65g @ 50.00; key `flour` | 28.45 | 56.9% | 26.12 | 52.2% | `Banh Mi!G5`, `Banh Mi!B19`, `Banh Mi!C19` |

### cake marbre
- Category: cake/gateau; base batch mass 5,227 and ingredient cost 5,915 from first quantity/cost pair in `Bakery recipes   melto 2026.xlsx`.
- Missing fields: labor minutes/rate, packaging cost, overhead allocation, actual yield, waste/shrinkage, daily fixed cost, daily sales volume.
- Concentration: top ingredient `Butter` plus next ingredient = 67.1% of base ingredient cost.

| Ingredient | Qty | Cost | % ingredient cost | Source |
|---|---:|---:|---:|---|
| Butter | 1,000 | 2,300 | 38.9% | `cake marbre!D11`, `cake marbre!E11` |
| Egg | 360 | 1,667 | 28.2% | `cake marbre!D10`, `cake marbre!E10` |
| flour | 2,000 | 1,040 | 17.6% | `cake marbre!D5`, `cake marbre!E5` |
| sugar | 650 | 416.00 | 7.0% | `cake marbre!D12`, `cake marbre!E12` |
| Nut Meg | 10 | 250.00 | 4.2% | `cake marbre!D8`, `cake marbre!E8` |
| baking powder | 70 | 161.00 | 2.7% | `cake marbre!D6`, `cake marbre!E6` |
| milk | 12 | 46.00 | 0.8% | `cake marbre!D14`, `cake marbre!E14` |
| water | 1,100 | 16.50 | 0.3% | `cake marbre!D9`, `cake marbre!E9` |
| improver | 5 | 15.00 | 0.3% | `cake marbre!D13`, `cake marbre!E13` |
| salt | 20 | 3.78 | 0.1% | `cake marbre!D7`, `cake marbre!E7` |

| SKU / portion | Theoretical yield | Price | Ingredient COGS/unit | Labor/unit | Packaging+OH/unit | Total auditable COGS/unit | Contribution margin/unit | GM % | Food cost flag | Break-even/batch | Source |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---:|---|
| 60g @ 150.00 | 87.12 | 150.00 | 67.90 | missing | missing | 67.90 | 82.10 | 54.7% | Outside 25-35% | 39.43 | `cake marbre!B20`, `cake marbre!C20` |
| 50g @ 100.00 | 104.54 | 100.00 | 56.58 | missing | missing | 56.58 | 43.42 | 43.4% | Outside 25-35% | 59.15 | `cake marbre!B21`, `cake marbre!C21` |

| Sensitivity: key ingredient +10% / +25% | Margin $ after +10% | GM % after +10% | Margin $ after +25% | GM % after +25% | Source |
|---|---:|---:|---:|---:|---|
| 60g @ 150.00; key `Butter` | 79.46 | 53.0% | 75.50 | 50.3% | `cake marbre!E11`, `cake marbre!B20`, `cake marbre!C20` |
| 50g @ 100.00; key `Butter` | 41.22 | 41.2% | 37.92 | 37.9% | `cake marbre!E11`, `cake marbre!B21`, `cake marbre!C21` |

### gateau
- Category: cake/gateau; base batch mass 39,880 and ingredient cost 31,395 from first quantity/cost pair in `Bakery recipes   melto 2026.xlsx`.
- Missing fields: labor minutes/rate, packaging cost, overhead allocation, actual yield, waste/shrinkage, daily fixed cost, daily sales volume.
- Concentration: top ingredient `frying oil` plus next ingredient = 82.0% of base ingredient cost.

| Ingredient | Qty | Cost | % ingredient cost | Source |
|---|---:|---:|---:|---|
| frying oil | 10 | 15,250 | 48.6% | `gateau!D16`, `gateau!E16` |
| flour | 25,000 | 10,500 | 33.4% | `gateau!D5`, `gateau!E5` |
| Conc Milk | 950 | 1,170 | 3.7% | `gateau!D8`, `gateau!E8` |
| sugar | 1,600 | 1,024 | 3.3% | `gateau!D7`, `gateau!E7` |
| Butter | 1,300 | 780.00 | 2.5% | `gateau!D6`, `gateau!E6` |
| egg | 200 | 740.74 | 2.4% | `gateau!D9`, `gateau!E9` |
| baking powder | 170 | 552.50 | 1.8% | `gateau!D15`, `gateau!E15` |
| improver | 170 | 476.00 | 1.5% | `gateau!D11`, `gateau!E11` |
| yeast | 170 | 476.00 | 1.5% | `gateau!D12`, `gateau!E12` |
| Nutmeg | 40 | 360.00 | 1.1% | `gateau!D14`, `gateau!E14` |
| salt | 270 | 55.50 | 0.2% | `gateau!D10`, `gateau!E10` |
| water | 10,000 | 10.00 | 0.0% | `gateau!D13`, `gateau!E13` |

| SKU / portion | Theoretical yield | Price | Ingredient COGS/unit | Labor/unit | Packaging+OH/unit | Total auditable COGS/unit | Contribution margin/unit | GM % | Food cost flag | Break-even/batch | Source |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---:|---|
| 81g @ 100.00 | 492.35 | 100.00 | 63.77 | missing | missing | 63.77 | 36.23 | 36.2% | Outside 25-35% | 313.95 | `gateau!B21`, `gateau!C21` |
| 90g @ 100.00 | 443.11 | 100.00 | 70.85 | missing | missing | 70.85 | 29.15 | 29.1% | Outside 25-35% | 313.95 | `gateau!B22`, `gateau!C22` |
| 90g @ 100.00 | 443.11 | 100.00 | 70.85 | missing | missing | 70.85 | 29.15 | 29.1% | Outside 25-35% | 313.95 | `gateau!B23`, `gateau!C23` |
| 900g @ 1,000 | 44.31 | 1,000 | 708.51 | missing | missing | 708.51 | 291.49 | 29.1% | Outside 25-35% | 31.39 | `gateau!B24`, `gateau!C24` |

| Sensitivity: key ingredient +10% / +25% | Margin $ after +10% | GM % after +10% | Margin $ after +25% | GM % after +25% | Source |
|---|---:|---:|---:|---:|---|
| 81g @ 100.00; key `frying oil` | 33.14 | 33.1% | 28.49 | 28.5% | `gateau!E16`, `gateau!B21`, `gateau!C21` |
| 90g @ 100.00; key `frying oil` | 25.71 | 25.7% | 20.55 | 20.5% | `gateau!E16`, `gateau!B22`, `gateau!C22` |
| 90g @ 100.00; key `frying oil` | 25.71 | 25.7% | 20.55 | 20.5% | `gateau!E16`, `gateau!B23`, `gateau!C23` |
| 900g @ 1,000; key `frying oil` | 257.08 | 25.7% | 205.45 | 20.5% | `gateau!E16`, `gateau!B24`, `gateau!C24` |

### Kouatchoua gato
- Category: cake/gateau; base batch mass 50,710 and ingredient cost 27,540 from first quantity/cost pair in `Bakery recipes   melto 2026.xlsx`.
- Missing fields: labor minutes/rate, packaging cost, overhead allocation, actual yield, waste/shrinkage, daily fixed cost, daily sales volume.
- Concentration: top ingredient `flour` plus next ingredient = 76.6% of base ingredient cost.

| Ingredient | Qty | Cost | % ingredient cost | Source |
|---|---:|---:|---:|---|
| flour | 27,000 | 11,340 | 41.2% | `Kouatchoua gato!D5`, `Kouatchoua gato!E5` |
| frying oil | 8,000 | 9,760 | 35.4% | `Kouatchoua gato!D15`, `Kouatchoua gato!E15` |
| Butter | 1,300 | 1,642 | 6.0% | `Kouatchoua gato!D6`, `Kouatchoua gato!E6` |
| egg | 1,000 | 1,333 | 4.8% | `Kouatchoua gato!D9`, `Kouatchoua gato!E9` |
| Conc Milk | 1,000 | 1,170 | 4.2% | `Kouatchoua gato!D8`, `Kouatchoua gato!E8` |
| sugar | 1,700 | 1,088 | 4.0% | `Kouatchoua gato!D7`, `Kouatchoua gato!E7` |
| improver | 140 | 392.00 | 1.4% | `Kouatchoua gato!D11`, `Kouatchoua gato!E11` |
| baking powder | 150 | 390.00 | 1.4% | `Kouatchoua gato!D14`, `Kouatchoua gato!E14` |
| yeast | 130 | 364.00 | 1.3% | `Kouatchoua gato!D12`, `Kouatchoua gato!E12` |
| salt | 290 | 59.61 | 0.2% | `Kouatchoua gato!D10`, `Kouatchoua gato!E10` |
| water | 10,000 | 1.00 | 0.0% | `Kouatchoua gato!D13`, `Kouatchoua gato!E13` |

| SKU / portion | Theoretical yield | Price | Ingredient COGS/unit | Labor/unit | Packaging+OH/unit | Total auditable COGS/unit | Contribution margin/unit | GM % | Food cost flag | Break-even/batch | Source |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---:|---|
| 81.40g @ 100.00 | 622.97 | 100.00 | 44.21 | missing | missing | 44.21 | 55.79 | 55.8% | Outside 25-35% | 275.40 | `Kouatchoua gato!B20`, `Kouatchoua gato!C20` |
| 90g @ 100.00 | 563.44 | 100.00 | 48.88 | missing | missing | 48.88 | 51.12 | 51.1% | Outside 25-35% | 275.40 | `Kouatchoua gato!B21`, `Kouatchoua gato!C21` |
| 90g @ 100.00 | 563.44 | 100.00 | 48.88 | missing | missing | 48.88 | 51.12 | 51.1% | Outside 25-35% | 275.40 | `Kouatchoua gato!B22`, `Kouatchoua gato!C22` |
| 900g @ 1,000 | 56.34 | 1,000 | 488.78 | missing | missing | 488.78 | 511.22 | 51.1% | Outside 25-35% | 27.54 | `Kouatchoua gato!B23`, `Kouatchoua gato!C23` |

| Sensitivity: key ingredient +10% / +25% | Margin $ after +10% | GM % after +10% | Margin $ after +25% | GM % after +25% | Source |
|---|---:|---:|---:|---:|---|
| 81.40g @ 100.00; key `flour` | 53.97 | 54.0% | 51.24 | 51.2% | `Kouatchoua gato!E5`, `Kouatchoua gato!B20`, `Kouatchoua gato!C20` |
| 90g @ 100.00; key `flour` | 49.11 | 49.1% | 46.09 | 46.1% | `Kouatchoua gato!E5`, `Kouatchoua gato!B21`, `Kouatchoua gato!C21` |
| 90g @ 100.00; key `flour` | 49.11 | 49.1% | 46.09 | 46.1% | `Kouatchoua gato!E5`, `Kouatchoua gato!B22`, `Kouatchoua gato!C22` |
| 900g @ 1,000; key `flour` | 491.09 | 49.1% | 460.90 | 46.1% | `Kouatchoua gato!E5`, `Kouatchoua gato!B23`, `Kouatchoua gato!C23` |

### BUNS SPECIAL
- Category: buns; base batch mass 14,920 and ingredient cost 9,868 from first quantity/cost pair in `Bakery recipes   melto 2026.xlsx`.
- Missing fields: labor minutes/rate, packaging cost, overhead allocation, actual yield, waste/shrinkage, daily fixed cost, daily sales volume.
- Concentration: top ingredient `flour` plus next ingredient = 75.0% of base ingredient cost.

| Ingredient | Qty | Cost | % ingredient cost | Source |
|---|---:|---:|---:|---|
| flour | 10,000 | 4,200 | 42.6% | `BUNS SPECIAL!D5`, `BUNS SPECIAL!E5` |
| powder milk | 1,000 | 3,200 | 32.4% | `BUNS SPECIAL!D8`, `BUNS SPECIAL!E8` |
| egg | 220 | 814.81 | 8.3% | `BUNS SPECIAL!D9`, `BUNS SPECIAL!E9` |
| Butter | 450 | 568.42 | 5.8% | `BUNS SPECIAL!D6`, `BUNS SPECIAL!E6` |
| improver | 150 | 420.00 | 4.3% | `BUNS SPECIAL!D11`, `BUNS SPECIAL!E11` |
| yeast | 150 | 420.00 | 4.3% | `BUNS SPECIAL!D12`, `BUNS SPECIAL!E12` |
| sugar | 350 | 224.00 | 2.3% | `BUNS SPECIAL!D7`, `BUNS SPECIAL!E7` |
| salt | 100 | 20.56 | 0.2% | `BUNS SPECIAL!D10`, `BUNS SPECIAL!E10` |
| water | 2,500 | 0.25 | 0.0% | `BUNS SPECIAL!D13`, `BUNS SPECIAL!E13` |

| SKU / portion | Theoretical yield | Price | Ingredient COGS/unit | Labor/unit | Packaging+OH/unit | Total auditable COGS/unit | Contribution margin/unit | GM % | Food cost flag | Break-even/batch | Source |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---:|---|
| 55g @ 100.00 | 271.27 | 100.00 | 36.38 | missing | missing | 36.38 | 63.62 | 63.6% | Outside 25-35% | 98.68 | `BUNS SPECIAL!B18`, `BUNS SPECIAL!C18` |
| 220g @ 300.00 | 67.82 | 300.00 | 145.51 | missing | missing | 145.51 | 154.49 | 51.5% | Outside 25-35% | 32.89 | `BUNS SPECIAL!B19`, `BUNS SPECIAL!C19` |
| 800g @ 1,000 | 18.65 | 1,000 | 529.12 | missing | missing | 529.12 | 470.88 | 47.1% | Outside 25-35% | 9.87 | `BUNS SPECIAL!B20`, `BUNS SPECIAL!C20` |

| Sensitivity: key ingredient +10% / +25% | Margin $ after +10% | GM % after +10% | Margin $ after +25% | GM % after +25% | Source |
|---|---:|---:|---:|---:|---|
| 55g @ 100.00; key `flour` | 62.07 | 62.1% | 59.75 | 59.8% | `BUNS SPECIAL!E5`, `BUNS SPECIAL!B18`, `BUNS SPECIAL!C18` |
| 220g @ 300.00; key `flour` | 148.30 | 49.4% | 139.01 | 46.3% | `BUNS SPECIAL!E5`, `BUNS SPECIAL!B19`, `BUNS SPECIAL!C19` |
| 800g @ 1,000; key `flour` | 448.36 | 44.8% | 414.58 | 41.5% | `BUNS SPECIAL!E5`, `BUNS SPECIAL!B20`, `BUNS SPECIAL!C20` |

### buns new look
- Category: buns; base batch mass 9,870 and ingredient cost 4,350 from first quantity/cost pair in `Bakery recipes   melto 2026.xlsx`.
- Missing fields: labor minutes/rate, packaging cost, overhead allocation, actual yield, waste/shrinkage, daily fixed cost, daily sales volume.
- Concentration: top ingredient `flour` plus next ingredient = 76.7% of base ingredient cost.

| Ingredient | Qty | Cost | % ingredient cost | Source |
|---|---:|---:|---:|---|
| flour | 6,000 | 2,520 | 57.9% | `buns new look!D5`, `buns new look!E5` |
| egg | 220 | 814.81 | 18.7% | `buns new look!D9`, `buns new look!E9` |
| Butter | 300 | 378.95 | 8.7% | `buns new look!D6`, `buns new look!E6` |
| improver | 100 | 280.00 | 6.4% | `buns new look!D11`, `buns new look!E11` |
| yeast | 100 | 280.00 | 6.4% | `buns new look!D12`, `buns new look!E12` |
| sugar | 50 | 32.00 | 0.7% | `buns new look!D7`, `buns new look!E7` |
| conc milk | 500 | 23.40 | 0.5% | `buns new look!D8`, `buns new look!E8` |
| salt | 100 | 20.56 | 0.5% | `buns new look!D10`, `buns new look!E10` |
| water | 2,500 | 0.25 | 0.0% | `buns new look!D13`, `buns new look!E13` |

| SKU / portion | Theoretical yield | Price | Ingredient COGS/unit | Labor/unit | Packaging+OH/unit | Total auditable COGS/unit | Contribution margin/unit | GM % | Food cost flag | Break-even/batch | Source |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---:|---|
| 95g @ 100.00 | 103.89 | 100.00 | 41.87 | missing | missing | 41.87 | 58.13 | 58.1% | Outside 25-35% | 43.50 | `buns new look!C20`, `buns new look!D20` |

| Sensitivity: key ingredient +10% / +25% | Margin $ after +10% | GM % after +10% | Margin $ after +25% | GM % after +25% | Source |
|---|---:|---:|---:|---:|---|
| 95g @ 100.00; key `flour` | 55.71 | 55.7% | 52.07 | 52.1% | `buns new look!E5`, `buns new look!C20`, `buns new look!D20` |

### YUMMY BREAD
- Category: bread; base batch mass 26,250 and ingredient cost 12,134 from first quantity/cost pair in `Bakery recipes   melto 2026.xlsx`.
- Missing fields: labor minutes/rate, packaging cost, overhead allocation, actual yield, waste/shrinkage, daily fixed cost, daily sales volume.
- Concentration: top ingredient `flour` plus next ingredient = 65.1% of base ingredient cost.

| Ingredient | Qty | Cost | % ingredient cost | Source |
|---|---:|---:|---:|---|
| flour | 15,000 | 6,000 | 49.4% | `YUMMY BREAD!D5`, `YUMMY BREAD!E5` |
| Butter | 1,500 | 1,895 | 15.6% | `YUMMY BREAD!D6`, `YUMMY BREAD!E6` |
| Milk | 1,000 | 1,170 | 9.6% | `YUMMY BREAD!D8`, `YUMMY BREAD!E8` |
| egg | 750 | 1,000 | 8.2% | `YUMMY BREAD!D9`, `YUMMY BREAD!E9` |
| sugar | 1,500 | 960.00 | 7.9% | `YUMMY BREAD!D7`, `YUMMY BREAD!E7` |
| yeast | 160 | 448.00 | 3.7% | `YUMMY BREAD!D12`, `YUMMY BREAD!E12` |
| improver | 120 | 336.00 | 2.8% | `YUMMY BREAD!D11`, `YUMMY BREAD!E11` |
| EDC | 100 | 300.00 | 2.5% | `YUMMY BREAD!D14`, `YUMMY BREAD!E14` |
| salt | 120 | 24.67 | 0.2% | `YUMMY BREAD!D10`, `YUMMY BREAD!E10` |
| water | 6,000 | 0.60 | 0.0% | `YUMMY BREAD!D13`, `YUMMY BREAD!E13` |

| SKU / portion | Theoretical yield | Price | Ingredient COGS/unit | Labor/unit | Packaging+OH/unit | Total auditable COGS/unit | Contribution margin/unit | GM % | Food cost flag | Break-even/batch | Source |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---:|---|
| 144g @ 150.00 | 182.29 | 150.00 | 66.56 | missing | missing | 66.56 | 83.44 | 55.6% | Outside 25-35% | 80.89 | `YUMMY BREAD!B20`, `YUMMY BREAD!C20` |
| 144g @ 125.00 | 182.29 | 125.00 | 66.56 | missing | missing | 66.56 | 58.44 | 46.7% | Outside 25-35% | 97.07 | `YUMMY BREAD!B21`, `YUMMY BREAD!C21` |
| 139g @ 150.00 | 188.85 | 150.00 | 64.25 | missing | missing | 64.25 | 85.75 | 57.2% | Outside 25-35% | 80.89 | `YUMMY BREAD!B22`, `YUMMY BREAD!C22` |

| Sensitivity: key ingredient +10% / +25% | Margin $ after +10% | GM % after +10% | Margin $ after +25% | GM % after +25% | Source |
|---|---:|---:|---:|---:|---|
| 144g @ 150.00; key `flour` | 80.14 | 53.4% | 75.21 | 50.1% | `YUMMY BREAD!E5`, `YUMMY BREAD!B20`, `YUMMY BREAD!C20` |
| 144g @ 125.00; key `flour` | 55.14 | 44.1% | 50.21 | 40.2% | `YUMMY BREAD!E5`, `YUMMY BREAD!B21`, `YUMMY BREAD!C21` |
| 139g @ 150.00; key `flour` | 82.57 | 55.0% | 77.80 | 51.9% | `YUMMY BREAD!E5`, `YUMMY BREAD!B22`, `YUMMY BREAD!C22` |

### Donuts
- Category: fried/snack; base batch mass 27,450 and ingredient cost 14,597 from first quantity/cost pair in `Bakery recipes   melto 2026.xlsx`.
- Missing fields: labor minutes/rate, packaging cost, overhead allocation, actual yield, waste/shrinkage, daily fixed cost, daily sales volume.
- Concentration: top ingredient `oil` plus next ingredient = 76.3% of base ingredient cost.

| Ingredient | Qty | Cost | % ingredient cost | Source |
|---|---:|---:|---:|---|
| oil | 5,000 | 6,100 | 41.8% | `Donuts!D13`, `Donuts!E13` |
| flour | 12,000 | 5,040 | 34.5% | `Donuts!D5`, `Donuts!E5` |
| eggs | 1,000 | 1,333 | 9.1% | `Donuts!D11`, `Donuts!E11` |
| Sugar | 1,200 | 768.00 | 5.3% | `Donuts!D9`, `Donuts!E9` |
| milk | 500 | 585.00 | 4.0% | `Donuts!D7`, `Donuts!E7` |
| baking powder | 190 | 494.00 | 3.4% | `Donuts!D6`, `Donuts!E6` |
| Improver | 90 | 252.00 | 1.7% | `Donuts!D10`, `Donuts!E10` |
| salt | 120 | 24.67 | 0.2% | `Donuts!D8`, `Donuts!E8` |
| water | 7,350 | 0.07 | 0.0% | `Donuts!D12`, `Donuts!E12` |

| SKU / portion | Theoretical yield | Price | Ingredient COGS/unit | Labor/unit | Packaging+OH/unit | Total auditable COGS/unit | Contribution margin/unit | GM % | Food cost flag | Break-even/batch | Source |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---:|---|
| 40g @ 50.00 | 686.25 | 50.00 | 21.27 | missing | missing | 21.27 | 28.73 | 57.5% | Outside 25-35% | 291.94 | `Donuts!B18`, `Donuts!C18` |
| 22g @ 50.00 | 1,248 | 50.00 | 11.70 | missing | missing | 11.70 | 38.30 | 76.6% | Outside 25-35% | 291.94 | `Donuts!B19`, `Donuts!C19` |
| 150g @ 500.00 | 183 | 500.00 | 79.77 | missing | missing | 79.77 | 420.23 | 84.0% | Outside 25-35% | 29.19 | `Donuts!B20`, `Donuts!C20` |

| Sensitivity: key ingredient +10% / +25% | Margin $ after +10% | GM % after +10% | Margin $ after +25% | GM % after +25% | Source |
|---|---:|---:|---:|---:|---|
| 40g @ 50.00; key `oil` | 27.84 | 55.7% | 26.51 | 53.0% | `Donuts!E13`, `Donuts!B18`, `Donuts!C18` |
| 22g @ 50.00; key `oil` | 37.81 | 75.6% | 37.08 | 74.2% | `Donuts!E13`, `Donuts!B19`, `Donuts!C19` |
| 150g @ 500.00; key `oil` | 416.90 | 83.4% | 411.90 | 82.4% | `Donuts!E13`, `Donuts!B20`, `Donuts!C20` |

### Fish Pie
- Category: pastry/savory; base batch mass 5,700 and ingredient cost 4,179 from first quantity/cost pair in `Bakery recipes   melto 2026.xlsx`.
- Missing fields: labor minutes/rate, packaging cost, overhead allocation, actual yield, waste/shrinkage, daily fixed cost, daily sales volume.
- Concentration: top ingredient `Butter` plus next ingredient = 66.4% of base ingredient cost.

| Ingredient | Qty | Cost | % ingredient cost | Source |
|---|---:|---:|---:|---|
| Butter | 1,200 | 1,516 | 36.3% | `Fish Pie!D7`, `Fish Pie!E7` |
| flour | 3,000 | 1,260 | 30.2% | `Fish Pie!D5`, `Fish Pie!E5` |
| fish | 400 | 480.00 | 11.5% | `Fish Pie!D9`, `Fish Pie!E9` |
| onions | 100 | 200.00 | 4.8% | `Fish Pie!D13`, `Fish Pie!E13` |
| carrots | 200 | 171.43 | 4.1% | `Fish Pie!D10`, `Fish Pie!E10` |
| irish | 300 | 171.43 | 4.1% | `Fish Pie!D14`, `Fish Pie!E14` |
| baking powder | 50 | 130.00 | 3.1% | `Fish Pie!D6`, `Fish Pie!E6` |
| oil | 100 | 122.00 | 2.9% | `Fish Pie!D15`, `Fish Pie!E15` |
| Improver | 40 | 104.00 | 2.5% | `Fish Pie!D8`, `Fish Pie!E8` |
| Green beans | 100 | 20.00 | 0.5% | `Fish Pie!D11`, `Fish Pie!E11` |
| peppers | 10 | 4.00 | 0.1% | `Fish Pie!D12`, `Fish Pie!E12` |
| cabbage | 200 | n/a | 0.0% | `Fish Pie!D16`, `Fish Pie!E16` |

| SKU / portion | Theoretical yield | Price | Ingredient COGS/unit | Labor/unit | Packaging+OH/unit | Total auditable COGS/unit | Contribution margin/unit | GM % | Food cost flag | Break-even/batch | Source |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---:|---|
| 85g @ 100.00 | 67.06 | 100.00 | 62.31 | missing | missing | 62.31 | 37.69 | 37.7% | Outside 25-35% | 41.79 | `Fish Pie!B22`, `Fish Pie!C22` |
| 65g @ 100.00 | 87.69 | 100.00 | 47.65 | missing | missing | 47.65 | 52.35 | 52.3% | Outside 25-35% | 41.79 | `Fish Pie!B23`, `Fish Pie!C23` |
| 150g @ 500.00 | 38 | 500.00 | 109.96 | missing | missing | 109.96 | 390.04 | 78.0% | Outside 25-35% | 8.36 | `Fish Pie!B24`, `Fish Pie!C24` |

| Sensitivity: key ingredient +10% / +25% | Margin $ after +10% | GM % after +10% | Margin $ after +25% | GM % after +25% | Source |
|---|---:|---:|---:|---:|---|
| 85g @ 100.00; key `Butter` | 35.43 | 35.4% | 32.04 | 32.0% | `Fish Pie!E7`, `Fish Pie!B22`, `Fish Pie!C22` |
| 65g @ 100.00; key `Butter` | 50.62 | 50.6% | 48.03 | 48.0% | `Fish Pie!E7`, `Fish Pie!B23`, `Fish Pie!C23` |
| 150g @ 500.00; key `Butter` | 386.05 | 77.2% | 380.06 | 76.0% | `Fish Pie!E7`, `Fish Pie!B24`, `Fish Pie!C24` |

### Galette
- Category: pastry/savory; base batch mass 16,995 and ingredient cost 10,606 from first quantity/cost pair in `Bakery recipes   melto 2026.xlsx`.
- Missing fields: labor minutes/rate, packaging cost, overhead allocation, actual yield, waste/shrinkage, daily fixed cost, daily sales volume.
- Concentration: top ingredient `flour` plus next ingredient = 56.5% of base ingredient cost.

| Ingredient | Qty | Cost | % ingredient cost | Source |
|---|---:|---:|---:|---|
| flour | 10,000 | 4,200 | 39.6% | `Galette!D5`, `Galette!E5` |
| Chocolate | 1,000 | 1,789 | 16.9% | `Galette!D15`, `Galette!E15` |
| Butter | 1,000 | 1,263 | 11.9% | `Galette!D6`, `Galette!E6` |
| egg | 750 | 1,000 | 9.4% | `Galette!D9`, `Galette!E9` |
| Milk | 800 | 936.00 | 8.8% | `Galette!D8`, `Galette!E8` |
| sugar | 1,000 | 640.00 | 6.0% | `Galette!D7`, `Galette!E7` |
| improver | 100 | 280.00 | 2.6% | `Galette!D11`, `Galette!E11` |
| EDC | 75 | 225.00 | 2.1% | `Galette!D16`, `Galette!E16` |
| yeast | 80 | 224.00 | 2.1% | `Galette!D12`, `Galette!E12` |
| baking powder | 80 | 26.00 | 0.2% | `Galette!D14`, `Galette!E14` |
| salt | 110 | 22.61 | 0.2% | `Galette!D10`, `Galette!E10` |
| water | 2,000 | 0.20 | 0.0% | `Galette!D13`, `Galette!E13` |

| SKU / portion | Theoretical yield | Price | Ingredient COGS/unit | Labor/unit | Packaging+OH/unit | Total auditable COGS/unit | Contribution margin/unit | GM % | Food cost flag | Break-even/batch | Source |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---:|---|
| 79g @ 100.00 | 215.13 | 100.00 | 49.30 | missing | missing | 49.30 | 50.70 | 50.7% | Outside 25-35% | 106.06 | `Galette!B22`, `Galette!C22` |
| 140g @ 200.00 | 121.39 | 200.00 | 87.37 | missing | missing | 87.37 | 112.63 | 56.3% | Outside 25-35% | 53.03 | `Galette!B23`, `Galette!C23` |
| 700g @ 1,000 | 24.28 | 1,000 | 436.86 | missing | missing | 436.86 | 563.14 | 56.3% | Outside 25-35% | 10.61 | `Galette!B24`, `Galette!C24` |

| Sensitivity: key ingredient +10% / +25% | Margin $ after +10% | GM % after +10% | Margin $ after +25% | GM % after +25% | Source |
|---|---:|---:|---:|---:|---|
| 79g @ 100.00; key `flour` | 48.74 | 48.7% | 45.82 | 45.8% | `Galette!E5`, `Galette!B22`, `Galette!C22` |
| 140g @ 200.00; key `flour` | 109.17 | 54.6% | 103.98 | 52.0% | `Galette!E5`, `Galette!B23`, `Galette!C23` |
| 700g @ 1,000; key `flour` | 545.84 | 54.6% | 519.89 | 52.0% | `Galette!E5`, `Galette!B24`, `Galette!C24` |

### New bread
- Category: bread; base batch mass 24,160 and ingredient cost 8,534 from first quantity/cost pair in `Bakery recipes   melto 2026.xlsx`.
- Missing fields: labor minutes/rate, packaging cost, overhead allocation, actual yield, waste/shrinkage, daily fixed cost, daily sales volume.
- Concentration: top ingredient `flour` plus next ingredient = 83.4% of base ingredient cost.

| Ingredient | Qty | Cost | % ingredient cost | Source |
|---|---:|---:|---:|---|
| flour | 15,000 | 6,300 | 73.8% | `New bread!D5`, `New bread!E5` |
| egg | 220 | 814.81 | 9.5% | `New bread!D9`, `New bread!E9` |
| Butter | 600 | 757.89 | 8.9% | `New bread!D6`, `New bread!E6` |
| improver | 100 | 280.00 | 3.3% | `New bread!D11`, `New bread!E11` |
| yeast | 90 | 252.00 | 3.0% | `New bread!D12`, `New bread!E12` |
| sugar | 100 | 64.00 | 0.7% | `New bread!D7`, `New bread!E7` |
| conc milk | 950 | 44.46 | 0.5% | `New bread!D8`, `New bread!E8` |
| salt | 100 | 20.56 | 0.2% | `New bread!D10`, `New bread!E10` |
| water | 7,000 | 0.70 | 0.0% | `New bread!D13`, `New bread!E13` |

| SKU / portion | Theoretical yield | Price | Ingredient COGS/unit | Labor/unit | Packaging+OH/unit | Total auditable COGS/unit | Contribution margin/unit | GM % | Food cost flag | Break-even/batch | Source |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---:|---|
| 90g @ 100.00 | 268.44 | 100.00 | 31.79 | missing | missing | 31.79 | 68.21 | 68.2% | OK 25-35% | 85.34 | `New bread!C20`, `New bread!D20` |

| Sensitivity: key ingredient +10% / +25% | Margin $ after +10% | GM % after +10% | Margin $ after +25% | GM % after +25% | Source |
|---|---:|---:|---:|---:|---|
| 90g @ 100.00; key `flour` | 65.86 | 65.9% | 62.34 | 62.3% | `New bread!E5`, `New bread!C20`, `New bread!D20` |

### NGALA BREAD
- Category: bread; base batch mass 15,430 and ingredient cost 7,532 from first quantity/cost pair in `Bakery recipes   melto 2026.xlsx`.
- Missing fields: labor minutes/rate, packaging cost, overhead allocation, actual yield, waste/shrinkage, daily fixed cost, daily sales volume.
- Concentration: top ingredient `flour` plus next ingredient = 74.4% of base ingredient cost.

| Ingredient | Qty | Cost | % ingredient cost | Source |
|---|---:|---:|---:|---|
| flour | 8,500 | 3,570 | 47.4% | `NGALA BREAD!D5`, `NGALA BREAD!E5` |
| egg | 550 | 2,037 | 27.0% | `NGALA BREAD!D9`, `NGALA BREAD!E9` |
| Butter | 1,000 | 1,263 | 16.8% | `NGALA BREAD!D6`, `NGALA BREAD!E6` |
| improver | 100 | 280.00 | 3.7% | `NGALA BREAD!D11`, `NGALA BREAD!E11` |
| yeast | 90 | 252.00 | 3.3% | `NGALA BREAD!D12`, `NGALA BREAD!E12` |
| sugar | 100 | 64.00 | 0.8% | `NGALA BREAD!D7`, `NGALA BREAD!E7` |
| conc milk | 1,000 | 46.80 | 0.6% | `NGALA BREAD!D8`, `NGALA BREAD!E8` |
| salt | 90 | 18.50 | 0.2% | `NGALA BREAD!D10`, `NGALA BREAD!E10` |
| water | 4,000 | 0.40 | 0.0% | `NGALA BREAD!D13`, `NGALA BREAD!E13` |

| SKU / portion | Theoretical yield | Price | Ingredient COGS/unit | Labor/unit | Packaging+OH/unit | Total auditable COGS/unit | Contribution margin/unit | GM % | Food cost flag | Break-even/batch | Source |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---:|---|
| 90g @ 100.00 | 171.44 | 100.00 | 43.93 | missing | missing | 43.93 | 56.07 | 56.1% | Outside 25-35% | 75.32 | `NGALA BREAD!C20`, `NGALA BREAD!D20` |

| Sensitivity: key ingredient +10% / +25% | Margin $ after +10% | GM % after +10% | Margin $ after +25% | GM % after +25% | Source |
|---|---:|---:|---:|---:|---|
| 90g @ 100.00; key `flour` | 53.99 | 54.0% | 50.86 | 50.9% | `NGALA BREAD!E5`, `NGALA BREAD!C20`, `NGALA BREAD!D20` |

### Pain au lait
- Category: bread; base batch mass 20,457 and ingredient cost 9,646 from first quantity/cost pair in `Bakery recipes   melto 2026.xlsx`.
- Missing fields: labor minutes/rate, packaging cost, overhead allocation, actual yield, waste/shrinkage, daily fixed cost, daily sales volume.
- Concentration: top ingredient `flour` plus next ingredient = 65.3% of base ingredient cost.

| Ingredient | Qty | Cost | % ingredient cost | Source |
|---|---:|---:|---:|---|
| flour | 12,000 | 5,040 | 52.3% | `Pain au lait!D5`, `Pain au lait!E5` |
| Butter | 1,000 | 1,263 | 13.1% | `Pain au lait!D6`, `Pain au lait!E6` |
| Milk | 950 | 1,112 | 11.5% | `Pain au lait!D8`, `Pain au lait!E8` |
| sugar | 1,100 | 704.00 | 7.3% | `Pain au lait!D7`, `Pain au lait!E7` |
| egg | 300 | 400.00 | 4.1% | `Pain au lait!D9`, `Pain au lait!E9` |
| Oil | 300 | 366.00 | 3.8% | `Pain au lait!D14`, `Pain au lait!E14` |
| improver | 100 | 280.00 | 2.9% | `Pain au lait!D11`, `Pain au lait!E11` |
| yeast | 80 | 224.00 | 2.3% | `Pain au lait!D12`, `Pain au lait!E12` |
| Nutmeg | 12 | 108.00 | 1.1% | `Pain au lait!D17`, `Pain au lait!E17` |
| EDC | 25 | 75.00 | 0.8% | `Pain au lait!D16`, `Pain au lait!E16` |
| Milk tantalizer | 5 | 56.25 | 0.6% | `Pain au lait!D15`, `Pain au lait!E15` |
| salt | 85 | 17.47 | 0.2% | `Pain au lait!D10`, `Pain au lait!E10` |
| water | 4,500 | 0.45 | 0.0% | `Pain au lait!D13`, `Pain au lait!E13` |

| SKU / portion | Theoretical yield | Price | Ingredient COGS/unit | Labor/unit | Packaging+OH/unit | Total auditable COGS/unit | Contribution margin/unit | GM % | Food cost flag | Break-even/batch | Source |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---:|---|
| 136g @ 150.00 | 150.42 | 150.00 | 64.13 | missing | missing | 64.13 | 85.87 | 57.2% | Outside 25-35% | 64.31 | `Pain au lait!B23`, `Pain au lait!C23` |
| 200g @ 300.00 | 102.28 | 300.00 | 94.30 | missing | missing | 94.30 | 205.70 | 68.6% | OK 25-35% | 32.15 | `Pain au lait!B24`, `Pain au lait!C24` |
| 800g @ 1,000 | 25.57 | 1,000 | 377.21 | missing | missing | 377.21 | 622.79 | 62.3% | Outside 25-35% | 9.65 | `Pain au lait!B25`, `Pain au lait!C25` |

| Sensitivity: key ingredient +10% / +25% | Margin $ after +10% | GM % after +10% | Margin $ after +25% | GM % after +25% | Source |
|---|---:|---:|---:|---:|---|
| 136g @ 150.00; key `flour` | 82.52 | 55.0% | 77.50 | 51.7% | `Pain au lait!E5`, `Pain au lait!B23`, `Pain au lait!C23` |
| 200g @ 300.00; key `flour` | 200.77 | 66.9% | 193.38 | 64.5% | `Pain au lait!E5`, `Pain au lait!B24`, `Pain au lait!C24` |
| 800g @ 1,000; key `flour` | 603.08 | 60.3% | 573.51 | 57.4% | `Pain au lait!E5`, `Pain au lait!B25`, `Pain au lait!C25` |

### NEW BRIOCHE
- Category: bread; base batch mass 17,213 and ingredient cost 10,838 from first quantity/cost pair in `Bakery recipes   melto 2026.xlsx`.
- Missing fields: labor minutes/rate, packaging cost, overhead allocation, actual yield, waste/shrinkage, daily fixed cost, daily sales volume.
- Concentration: top ingredient `flour` plus next ingredient = 67.9% of base ingredient cost.

| Ingredient | Qty | Cost | % ingredient cost | Source |
|---|---:|---:|---:|---|
| flour | 10,000 | 4,200 | 38.8% | `NEW BRIOCHE!D5`, `NEW BRIOCHE!E5` |
| Butter | 2,500 | 3,158 | 29.1% | `NEW BRIOCHE!D6`, `NEW BRIOCHE!E6` |
| sugar | 1,500 | 960.00 | 8.9% | `NEW BRIOCHE!D7`, `NEW BRIOCHE!E7` |
| Milk | 800 | 936.00 | 8.6% | `NEW BRIOCHE!D8`, `NEW BRIOCHE!E8` |
| egg | 500 | 666.67 | 6.2% | `NEW BRIOCHE!D9`, `NEW BRIOCHE!E9` |
| yeast | 140 | 392.00 | 3.6% | `NEW BRIOCHE!D12`, `NEW BRIOCHE!E12` |
| improver | 120 | 336.00 | 3.1% | `NEW BRIOCHE!D11`, `NEW BRIOCHE!E11` |
| Milk tantalizer | 8 | 90.00 | 0.8% | `NEW BRIOCHE!D14`, `NEW BRIOCHE!E14` |
| EDC | 25 | 75.00 | 0.7% | `NEW BRIOCHE!D15`, `NEW BRIOCHE!E15` |
| salt | 120 | 24.67 | 0.2% | `NEW BRIOCHE!D10`, `NEW BRIOCHE!E10` |
| water | 1,500 | 0.15 | 0.0% | `NEW BRIOCHE!D13`, `NEW BRIOCHE!E13` |

| SKU / portion | Theoretical yield | Price | Ingredient COGS/unit | Labor/unit | Packaging+OH/unit | Total auditable COGS/unit | Contribution margin/unit | GM % | Food cost flag | Break-even/batch | Source |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---:|---|
| 82g @ 100.00 | 209.91 | 100.00 | 51.63 | missing | missing | 51.63 | 48.37 | 48.4% | Outside 25-35% | 108.38 | `NEW BRIOCHE!B21`, `NEW BRIOCHE!C21` |
| 140g @ 200.00 | 122.95 | 200.00 | 88.15 | missing | missing | 88.15 | 111.85 | 55.9% | Outside 25-35% | 54.19 | `NEW BRIOCHE!B22`, `NEW BRIOCHE!C22` |
| 700g @ 1,000 | 24.59 | 1,000 | 440.76 | missing | missing | 440.76 | 559.24 | 55.9% | Outside 25-35% | 10.84 | `NEW BRIOCHE!B23`, `NEW BRIOCHE!C23` |

| Sensitivity: key ingredient +10% / +25% | Margin $ after +10% | GM % after +10% | Margin $ after +25% | GM % after +25% | Source |
|---|---:|---:|---:|---:|---|
| 82g @ 100.00; key `flour` | 46.37 | 46.4% | 43.37 | 43.4% | `NEW BRIOCHE!E5`, `NEW BRIOCHE!B21`, `NEW BRIOCHE!C21` |
| 140g @ 200.00; key `flour` | 108.43 | 54.2% | 103.31 | 51.7% | `NEW BRIOCHE!E5`, `NEW BRIOCHE!B22`, `NEW BRIOCHE!C22` |
| 700g @ 1,000; key `flour` | 542.16 | 54.2% | 516.54 | 51.7% | `NEW BRIOCHE!E5`, `NEW BRIOCHE!B23`, `NEW BRIOCHE!C23` |

### Brioche Professionel
- Category: bread; base batch mass 10,750 and ingredient cost 8,801 from first quantity/cost pair in `Bakery recipes   melto 2026.xlsx`.
- Missing fields: labor minutes/rate, packaging cost, overhead allocation, actual yield, waste/shrinkage, daily fixed cost, daily sales volume.
- Concentration: top ingredient `flour` plus next ingredient = 54.5% of base ingredient cost.

| Ingredient | Qty | Cost | % ingredient cost | Source |
|---|---:|---:|---:|---|
| flour | 6,000 | 2,520 | 28.6% | `Brioche Professionel!D5`, `Brioche Professionel!E5` |
| Butter | 1,800 | 2,274 | 25.8% | `Brioche Professionel!D6`, `Brioche Professionel!E6` |
| CONC MILK | 1,000 | 1,170 | 13.3% | `Brioche Professionel!D8`, `Brioche Professionel!E8` |
| egg | 800 | 1,067 | 12.1% | `Brioche Professionel!D9`, `Brioche Professionel!E9` |
| Nutmeg | 70 | 630.00 | 7.2% | `Brioche Professionel!D13`, `Brioche Professionel!E13` |
| sugar | 800 | 512.00 | 5.8% | `Brioche Professionel!D7`, `Brioche Professionel!E7` |
| yeast | 120 | 336.00 | 3.8% | `Brioche Professionel!D12`, `Brioche Professionel!E12` |
| improver | 100 | 280.00 | 3.2% | `Brioche Professionel!D11`, `Brioche Professionel!E11` |
| salt | 60 | 12.33 | 0.1% | `Brioche Professionel!D10`, `Brioche Professionel!E10` |

| SKU / portion | Theoretical yield | Price | Ingredient COGS/unit | Labor/unit | Packaging+OH/unit | Total auditable COGS/unit | Contribution margin/unit | GM % | Food cost flag | Break-even/batch | Source |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---:|---|
| 70g @ 100.00 | 153.57 | 100.00 | 57.31 | missing | missing | 57.31 | 42.69 | 42.7% | Outside 25-35% | 88.01 | `Brioche Professionel!B19`, `Brioche Professionel!C19` |
| 220g @ 300.00 | 48.86 | 300.00 | 180.11 | missing | missing | 180.11 | 119.89 | 40.0% | Outside 25-35% | 29.34 | `Brioche Professionel!B20`, `Brioche Professionel!C20` |
| 800g @ 1,000 | 13.44 | 1,000 | 654.93 | missing | missing | 654.93 | 345.07 | 34.5% | Outside 25-35% | 8.80 | `Brioche Professionel!B21`, `Brioche Professionel!C21` |

| Sensitivity: key ingredient +10% / +25% | Margin $ after +10% | GM % after +10% | Margin $ after +25% | GM % after +25% | Source |
|---|---:|---:|---:|---:|---|
| 70g @ 100.00; key `flour` | 41.05 | 41.1% | 38.59 | 38.6% | `Brioche Professionel!E5`, `Brioche Professionel!B19`, `Brioche Professionel!C19` |
| 220g @ 300.00; key `flour` | 114.74 | 38.2% | 107.00 | 35.7% | `Brioche Professionel!E5`, `Brioche Professionel!B20`, `Brioche Professionel!C20` |
| 800g @ 1,000; key `flour` | 326.31 | 32.6% | 298.18 | 29.8% | `Brioche Professionel!E5`, `Brioche Professionel!B21`, `Brioche Professionel!C21` |

### professinal Buns
- Category: buns; base batch mass 13,905 and ingredient cost 10,332 from first quantity/cost pair in `Bakery recipes   melto 2026.xlsx`.
- Missing fields: labor minutes/rate, packaging cost, overhead allocation, actual yield, waste/shrinkage, daily fixed cost, daily sales volume.
- Concentration: top ingredient `flour` plus next ingredient = 55.0% of base ingredient cost.

| Ingredient | Qty | Cost | % ingredient cost | Source |
|---|---:|---:|---:|---|
| flour | 10,000 | 4,200 | 40.7% | `professinal Buns!D5`, `professinal Buns!E5` |
| egg | 400 | 1,481 | 14.3% | `professinal Buns!D9`, `professinal Buns!E9` |
| Butter | 1,000 | 1,263 | 12.2% | `professinal Buns!D6`, `professinal Buns!E6` |
| CONC MILK | 700 | 819.00 | 7.9% | `professinal Buns!D8`, `professinal Buns!E8` |
| Milk tantalizer | 50 | 562.50 | 5.4% | `professinal Buns!D15`, `professinal Buns!E15` |
| sugar | 800 | 512.00 | 5.0% | `professinal Buns!D7`, `professinal Buns!E7` |
| Nutmeg | 50 | 450.00 | 4.4% | `professinal Buns!D17`, `professinal Buns!E17` |
| Oil | 300 | 366.00 | 3.5% | `professinal Buns!D16`, `professinal Buns!E16` |
| yeast | 110 | 308.00 | 3.0% | `professinal Buns!D12`, `professinal Buns!E12` |
| improver | 100 | 280.00 | 2.7% | `professinal Buns!D11`, `professinal Buns!E11` |
| EDC | 25 | 75.00 | 0.7% | `professinal Buns!D14`, `professinal Buns!E14` |
| salt | 70 | 14.39 | 0.1% | `professinal Buns!D10`, `professinal Buns!E10` |
| water | 300 | 0.03 | 0.0% | `professinal Buns!D13`, `professinal Buns!E13` |

| SKU / portion | Theoretical yield | Price | Ingredient COGS/unit | Labor/unit | Packaging+OH/unit | Total auditable COGS/unit | Contribution margin/unit | GM % | Food cost flag | Break-even/batch | Source |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---:|---|
| 95g @ 100.00 | 146.37 | 100.00 | 70.59 | missing | missing | 70.59 | 29.41 | 29.4% | Outside 25-35% | 103.32 | `professinal Buns!B23`, `professinal Buns!C23` |
| 140g @ 150.00 | 99.32 | 150.00 | 104.02 | missing | missing | 104.02 | 45.98 | 30.7% | Outside 25-35% | 68.88 | `professinal Buns!B24`, `professinal Buns!C24` |
| 800g @ 1,000 | 17.38 | 1,000 | 594.41 | missing | missing | 594.41 | 405.59 | 40.6% | Outside 25-35% | 10.33 | `professinal Buns!B25`, `professinal Buns!C25` |

| Sensitivity: key ingredient +10% / +25% | Margin $ after +10% | GM % after +10% | Margin $ after +25% | GM % after +25% | Source |
|---|---:|---:|---:|---:|---|
| 95g @ 100.00; key `flour` | 26.54 | 26.5% | 22.24 | 22.2% | `professinal Buns!E5`, `professinal Buns!B23`, `professinal Buns!C23` |
| 140g @ 150.00; key `flour` | 41.75 | 27.8% | 35.41 | 23.6% | `professinal Buns!E5`, `professinal Buns!B24`, `professinal Buns!C24` |
| 800g @ 1,000; key `flour` | 381.43 | 38.1% | 345.18 | 34.5% | `professinal Buns!E5`, `professinal Buns!B25`, `professinal Buns!C25` |

### brioche
- Category: bread; base batch mass 17,400 and ingredient cost 10,861 from first quantity/cost pair in `Bakery recipes   melto 2026.xlsx`.
- Missing fields: labor minutes/rate, packaging cost, overhead allocation, actual yield, waste/shrinkage, daily fixed cost, daily sales volume.
- Concentration: top ingredient `flour` plus next ingredient = 67.7% of base ingredient cost.

| Ingredient | Qty | Cost | % ingredient cost | Source |
|---|---:|---:|---:|---|
| flour | 10,000 | 4,200 | 38.7% | `brioche!D5`, `brioche!E5` |
| Butter | 2,500 | 3,158 | 29.1% | `brioche!D6`, `brioche!E6` |
| sugar | 1,500 | 960.00 | 8.8% | `brioche!D7`, `brioche!E7` |
| Milk | 800 | 936.00 | 8.6% | `brioche!D8`, `brioche!E8` |
| egg | 500 | 666.67 | 6.1% | `brioche!D9`, `brioche!E9` |
| yeast | 140 | 392.00 | 3.6% | `brioche!D12`, `brioche!E12` |
| improver | 100 | 280.00 | 2.6% | `brioche!D11`, `brioche!E11` |
| Milk tantalizer | 15 | 168.75 | 1.6% | `brioche!D14`, `brioche!E14` |
| EDC | 25 | 75.00 | 0.7% | `brioche!D15`, `brioche!E15` |
| salt | 120 | 24.67 | 0.2% | `brioche!D10`, `brioche!E10` |
| water | 1,700 | 0.17 | 0.0% | `brioche!D13`, `brioche!E13` |

| SKU / portion | Theoretical yield | Price | Ingredient COGS/unit | Labor/unit | Packaging+OH/unit | Total auditable COGS/unit | Contribution margin/unit | GM % | Food cost flag | Break-even/batch | Source |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---:|---|
| 82g @ 100.00 | 212.20 | 100.00 | 51.18 | missing | missing | 51.18 | 48.82 | 48.8% | Outside 25-35% | 108.61 | `brioche!B21`, `brioche!C21` |
| 160g @ 200.00 | 108.75 | 200.00 | 99.87 | missing | missing | 99.87 | 100.13 | 50.1% | Outside 25-35% | 54.31 | `brioche!B22`, `brioche!C22` |
| 700g @ 1,000 | 24.86 | 1,000 | 436.94 | missing | missing | 436.94 | 563.06 | 56.3% | Outside 25-35% | 10.86 | `brioche!B23`, `brioche!C23` |

| Sensitivity: key ingredient +10% / +25% | Margin $ after +10% | GM % after +10% | Margin $ after +25% | GM % after +25% | Source |
|---|---:|---:|---:|---:|---|
| 82g @ 100.00; key `flour` | 46.84 | 46.8% | 43.87 | 43.9% | `brioche!E5`, `brioche!B21`, `brioche!C21` |
| 160g @ 200.00; key `flour` | 96.27 | 48.1% | 90.47 | 45.2% | `brioche!E5`, `brioche!B22`, `brioche!C22` |
| 700g @ 1,000; key `flour` | 546.16 | 54.6% | 520.82 | 52.1% | `brioche!E5`, `brioche!B23`, `brioche!C23` |

### choko bread
- Category: bread; base batch mass 8,384 and ingredient cost 5,322 from first quantity/cost pair in `Bakery recipes   melto 2026.xlsx`.
- Missing fields: labor minutes/rate, packaging cost, overhead allocation, actual yield, waste/shrinkage, daily fixed cost, daily sales volume.
- Concentration: top ingredient `flour` plus next ingredient = 63.9% of base ingredient cost.

| Ingredient | Qty | Cost | % ingredient cost | Source |
|---|---:|---:|---:|---|
| flour | 5,000 | 2,500 | 47.0% | `choko bread!D5`, `choko bread!E5` |
| choclate | 500 | 900.00 | 16.9% | `choko bread!D15`, `choko bread!E15` |
| egg | 200 | 851.85 | 16.0% | `choko bread!D9`, `choko bread!E9` |
| Milk | 100 | 300.00 | 5.6% | `choko bread!D8`, `choko bread!E8` |
| Butter | 200 | 294.74 | 5.5% | `choko bread!D6`, `choko bread!E6` |
| sugar | 300 | 210.00 | 3.9% | `choko bread!D7`, `choko bread!E7` |
| Nutmeg | 5 | 125.00 | 2.3% | `choko bread!D14`, `choko bread!E14` |
| improver | 20 | 60.00 | 1.1% | `choko bread!D11`, `choko bread!E11` |
| yeast | 14 | 42.00 | 0.8% | `choko bread!D12`, `choko bread!E12` |
| water | 2,000 | 30.00 | 0.6% | `choko bread!D13`, `choko bread!E13` |
| salt | 45 | 8.50 | 0.2% | `choko bread!D10`, `choko bread!E10` |

| SKU / portion | Theoretical yield | Price | Ingredient COGS/unit | Labor/unit | Packaging+OH/unit | Total auditable COGS/unit | Contribution margin/unit | GM % | Food cost flag | Break-even/batch | Source |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---:|---|
| 100g @ 100.00 | 83.84 | 100.00 | 63.48 | missing | missing | 63.48 | 36.52 | 36.5% | Outside 25-35% | 53.22 | `choko bread!B20`, `choko bread!C20` |
| 220g @ 300.00 | 38.11 | 300.00 | 139.65 | missing | missing | 139.65 | 160.35 | 53.4% | Outside 25-35% | 17.74 | `choko bread!B21`, `choko bread!C21` |
| 90g @ 100.00 | 93.16 | 100.00 | 57.13 | missing | missing | 57.13 | 42.87 | 42.9% | Outside 25-35% | 53.22 | `choko bread!B22`, `choko bread!C22` |

| Sensitivity: key ingredient +10% / +25% | Margin $ after +10% | GM % after +10% | Margin $ after +25% | GM % after +25% | Source |
|---|---:|---:|---:|---:|---|
| 100g @ 100.00; key `flour` | 33.54 | 33.5% | 29.07 | 29.1% | `choko bread!E5`, `choko bread!B20`, `choko bread!C20` |
| 220g @ 300.00; key `flour` | 153.79 | 51.3% | 143.95 | 48.0% | `choko bread!E5`, `choko bread!B21`, `choko bread!C21` |
| 90g @ 100.00; key `flour` | 40.19 | 40.2% | 36.16 | 36.2% | `choko bread!E5`, `choko bread!B22`, `choko bread!C22` |

### Cake Prof
- Category: cake/gateau; base batch mass 7,850 and ingredient cost 6,695 from first quantity/cost pair in `Bakery recipes   melto 2026.xlsx`.
- Missing fields: labor minutes/rate, packaging cost, overhead allocation, actual yield, waste/shrinkage, daily fixed cost, daily sales volume.
- Concentration: top ingredient `Egg` plus next ingredient = 64.6% of base ingredient cost.

| Ingredient | Qty | Cost | % ingredient cost | Source |
|---|---:|---:|---:|---|
| Egg | 1,750 | 2,431 | 36.3% | `Cake Prof!D7`, `Cake Prof!E7` |
| Butter | 1,500 | 1,895 | 28.3% | `Cake Prof!D8`, `Cake Prof!E8` |
| flour | 3,500 | 1,470 | 22.0% | `Cake Prof!D5`, `Cake Prof!E5` |
| sugar | 1,000 | 640.00 | 9.6% | `Cake Prof!D9`, `Cake Prof!E9` |
| baking powder | 100 | 260.00 | 3.9% | `Cake Prof!D6`, `Cake Prof!E6` |

| SKU / portion | Theoretical yield | Price | Ingredient COGS/unit | Labor/unit | Packaging+OH/unit | Total auditable COGS/unit | Contribution margin/unit | GM % | Food cost flag | Break-even/batch | Source |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---:|---|
| 230g @ 500.00 | 34.13 | 500.00 | 196.17 | missing | missing | 196.17 | 303.83 | 60.8% | Outside 25-35% | 13.39 | `Cake Prof!B16`, `Cake Prof!C16` |
| 57g @ 100.00 | 137.72 | 100.00 | 48.62 | missing | missing | 48.62 | 51.38 | 51.4% | Outside 25-35% | 66.95 | `Cake Prof!B17`, `Cake Prof!C17` |

| Sensitivity: key ingredient +10% / +25% | Margin $ after +10% | GM % after +10% | Margin $ after +25% | GM % after +25% | Source |
|---|---:|---:|---:|---:|---|
| 230g @ 500.00; key `Egg` | 296.71 | 59.3% | 286.03 | 57.2% | `Cake Prof!E7`, `Cake Prof!B16`, `Cake Prof!C16` |
| 57g @ 100.00; key `Egg` | 49.62 | 49.6% | 46.97 | 47.0% | `Cake Prof!E7`, `Cake Prof!B17`, `Cake Prof!C17` |

### Pancake
- Category: cake/gateau; base batch mass 7,876 and ingredient cost 4,952 from first quantity/cost pair in `Bakery recipes   melto 2026.xlsx`.
- Missing fields: labor minutes/rate, packaging cost, overhead allocation, actual yield, waste/shrinkage, daily fixed cost, daily sales volume.
- Concentration: top ingredient `milk` plus next ingredient = 70.5% of base ingredient cost.

| Ingredient | Qty | Cost | % ingredient cost | Source |
|---|---:|---:|---:|---|
| milk | 650 | 2,492 | 50.3% | `Pancake!D13`, `Pancake!E13` |
| flour | 2,000 | 1,000 | 20.2% | `Pancake!D5`, `Pancake!E5` |
| sugar | 600 | 600.00 | 12.1% | `Pancake!D11`, `Pancake!E11` |
| Nut Meg | 20 | 500.00 | 10.1% | `Pancake!D8`, `Pancake!E8` |
| Egg | 36 | 153.33 | 3.1% | `Pancake!D10`, `Pancake!E10` |
| yeast | 30 | 69.00 | 1.4% | `Pancake!D6`, `Pancake!E6` |
| water | 4,500 | 67.50 | 1.4% | `Pancake!D9`, `Pancake!E9` |
| improver | 20 | 66.67 | 1.3% | `Pancake!D12`, `Pancake!E12` |
| salt | 20 | 3.78 | 0.1% | `Pancake!D7`, `Pancake!E7` |

| SKU / portion | Theoretical yield | Price | Ingredient COGS/unit | Labor/unit | Packaging+OH/unit | Total auditable COGS/unit | Contribution margin/unit | GM % | Food cost flag | Break-even/batch | Source |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---:|---|
| 60g @ 100.00 | 131.27 | 100.00 | 37.72 | missing | missing | 37.72 | 62.28 | 62.3% | Outside 25-35% | 49.52 | `Pancake!B19`, `Pancake!C19` |
| 50g @ 100.00 | 157.52 | 100.00 | 31.44 | missing | missing | 31.44 | 68.56 | 68.6% | OK 25-35% | 49.52 | `Pancake!B20`, `Pancake!C20` |

| Sensitivity: key ingredient +10% / +25% | Margin $ after +10% | GM % after +10% | Margin $ after +25% | GM % after +25% | Source |
|---|---:|---:|---:|---:|---|
| 60g @ 100.00; key `milk` | 60.38 | 60.4% | 57.53 | 57.5% | `Pancake!E13`, `Pancake!B19`, `Pancake!C19` |
| 50g @ 100.00; key `milk` | 66.98 | 67.0% | 64.61 | 64.6% | `Pancake!E13`, `Pancake!B20`, `Pancake!C20` |

### Chinchin
- Category: fried/snack; base batch mass 6,067 and ingredient cost 4,448 from first quantity/cost pair in `Bakery recipes   melto 2026.xlsx`.
- Missing fields: labor minutes/rate, packaging cost, overhead allocation, actual yield, waste/shrinkage, daily fixed cost, daily sales volume.
- Concentration: top ingredient `egg` plus next ingredient = 70.0% of base ingredient cost.

| Ingredient | Qty | Cost | % ingredient cost | Source |
|---|---:|---:|---:|---|
| egg | 1,200 | 1,600 | 36.0% | `Chinchin!D10`, `Chinchin!E10` |
| flour | 3,600 | 1,512 | 34.0% | `Chinchin!D5`, `Chinchin!E5` |
| Butter | 450 | 568.42 | 12.8% | `Chinchin!D9`, `Chinchin!E9` |
| sugar | 650 | 416.00 | 9.4% | `Chinchin!D8`, `Chinchin!E8` |
| baking powder | 70 | 182.00 | 4.1% | `Chinchin!D6`, `Chinchin!E6` |
| improver | 40 | 112.00 | 2.5% | `Chinchin!D12`, `Chinchin!E12` |
| nut meg | 5 | 45.00 | 1.0% | `Chinchin!D7`, `Chinchin!E7` |
| salt | 50 | 10.28 | 0.2% | `Chinchin!D11`, `Chinchin!E11` |
| oil | 2 | 2.44 | 0.1% | `Chinchin!D13`, `Chinchin!E13` |

| SKU / portion | Theoretical yield | Price | Ingredient COGS/unit | Labor/unit | Packaging+OH/unit | Total auditable COGS/unit | Contribution margin/unit | GM % | Food cost flag | Break-even/batch | Source |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---:|---|
| 45g @ 100.00 | 134.82 | 100.00 | 32.99 | missing | missing | 32.99 | 67.01 | 67.0% | OK 25-35% | 44.48 | `Chinchin!B19`, `Chinchin!C19` |
| 40g @ 100.00 | 151.68 | 100.00 | 29.33 | missing | missing | 29.33 | 70.67 | 70.7% | OK 25-35% | 44.48 | `Chinchin!B20`, `Chinchin!C20` |
| 220g @ 500.00 | 27.58 | 500.00 | 161.30 | missing | missing | 161.30 | 338.70 | 67.7% | OK 25-35% | 8.90 | `Chinchin!B21`, `Chinchin!C21` |

| Sensitivity: key ingredient +10% / +25% | Margin $ after +10% | GM % after +10% | Margin $ after +25% | GM % after +25% | Source |
|---|---:|---:|---:|---:|---|
| 45g @ 100.00; key `egg` | 65.82 | 65.8% | 64.04 | 64.0% | `Chinchin!E10`, `Chinchin!B19`, `Chinchin!C19` |
| 40g @ 100.00; key `egg` | 69.62 | 69.6% | 68.04 | 68.0% | `Chinchin!E10`, `Chinchin!B20`, `Chinchin!C20` |
| 220g @ 500.00; key `egg` | 332.90 | 66.6% | 324.20 | 64.8% | `Chinchin!E10`, `Chinchin!B21`, `Chinchin!C21` |

### Best Chinchin
- Category: fried/snack; base batch mass 60,350 and ingredient cost 53,829 from first quantity/cost pair in `Bakery recipes   melto 2026.xlsx`.
- Missing fields: labor minutes/rate, packaging cost, overhead allocation, actual yield, waste/shrinkage, daily fixed cost, daily sales volume.
- Concentration: top ingredient `oil` plus next ingredient = 61.1% of base ingredient cost.

| Ingredient | Qty | Cost | % ingredient cost | Source |
|---|---:|---:|---:|---|
| oil | 15,000 | 18,300 | 34.0% | `Best Chinchin!D14`, `Best Chinchin!E14` |
| egg | 10,500 | 14,583 | 27.1% | `Best Chinchin!D10`, `Best Chinchin!E10` |
| flour | 25,000 | 10,500 | 19.5% | `Best Chinchin!D5`, `Best Chinchin!E5` |
| Butter | 4,000 | 5,053 | 9.4% | `Best Chinchin!D9`, `Best Chinchin!E9` |
| sugar | 4,500 | 2,880 | 5.4% | `Best Chinchin!D8`, `Best Chinchin!E8` |
| baking powder | 500 | 1,300 | 2.4% | `Best Chinchin!D6`, `Best Chinchin!E6` |
| oil | 400 | 488.00 | 0.9% | `Best Chinchin!D13`, `Best Chinchin!E13` |
| nut meg | 50 | 450.00 | 0.8% | `Best Chinchin!D7`, `Best Chinchin!E7` |
| Improver | 200 | 234.00 | 0.4% | `Best Chinchin!D12`, `Best Chinchin!E12` |
| salt | 200 | 41.11 | 0.1% | `Best Chinchin!D11`, `Best Chinchin!E11` |

| SKU / portion | Theoretical yield | Price | Ingredient COGS/unit | Labor/unit | Packaging+OH/unit | Total auditable COGS/unit | Contribution margin/unit | GM % | Food cost flag | Break-even/batch | Source |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---:|---|
| 45g @ 100.00 | 1,341 | 100.00 | 40.14 | missing | missing | 40.14 | 59.86 | 59.9% | Outside 25-35% | 538.29 | `Best Chinchin!B19`, `Best Chinchin!C19` |
| 225g @ 500.00 | 268.22 | 500.00 | 200.69 | missing | missing | 200.69 | 299.31 | 59.9% | Outside 25-35% | 107.66 | `Best Chinchin!B20`, `Best Chinchin!C20` |
| 500g @ 1,000 | 120.70 | 1,000 | 445.97 | missing | missing | 445.97 | 554.03 | 55.4% | Outside 25-35% | 53.83 | `Best Chinchin!B21`, `Best Chinchin!C21` |

| Sensitivity: key ingredient +10% / +25% | Margin $ after +10% | GM % after +10% | Margin $ after +25% | GM % after +25% | Source |
|---|---:|---:|---:|---:|---|
| 45g @ 100.00; key `oil` | 58.50 | 58.5% | 56.45 | 56.5% | `Best Chinchin!E14`, `Best Chinchin!B19`, `Best Chinchin!C19` |
| 225g @ 500.00; key `oil` | 292.49 | 58.5% | 282.25 | 56.5% | `Best Chinchin!E14`, `Best Chinchin!B20`, `Best Chinchin!C20` |
| 500g @ 1,000; key `oil` | 538.86 | 53.9% | 516.12 | 51.6% | `Best Chinchin!E14`, `Best Chinchin!B21`, `Best Chinchin!C21` |

### Sugar Balls
- Category: fried/snack; base batch mass 17,010 and ingredient cost 7,178 from first quantity/cost pair in `Bakery recipes   melto 2026.xlsx`.
- Missing fields: labor minutes/rate, packaging cost, overhead allocation, actual yield, waste/shrinkage, daily fixed cost, daily sales volume.
- Concentration: top ingredient `flour` plus next ingredient = 76.1% of base ingredient cost.

| Ingredient | Qty | Cost | % ingredient cost | Source |
|---|---:|---:|---:|---|
| flour | 10,000 | 4,200 | 58.5% | `Sugar Balls!D5`, `Sugar Balls!E5` |
| Butter | 1,000 | 1,263 | 17.6% | `Sugar Balls!D8`, `Sugar Balls!E8` |
| sugar | 1,000 | 640.00 | 8.9% | `Sugar Balls!D7`, `Sugar Balls!E7` |
| yeast | 160 | 448.00 | 6.2% | `Sugar Balls!D12`, `Sugar Balls!E12` |
| Improver | 120 | 312.00 | 4.3% | `Sugar Balls!D11`, `Sugar Balls!E11` |
| baking powder | 110 | 286.00 | 4.0% | `Sugar Balls!D6`, `Sugar Balls!E6` |
| salt | 120 | 24.67 | 0.3% | `Sugar Balls!D9`, `Sugar Balls!E9` |
| Cold Water | 4,500 | 4.50 | 0.1% | `Sugar Balls!D10`, `Sugar Balls!E10` |

| SKU / portion | Theoretical yield | Price | Ingredient COGS/unit | Labor/unit | Packaging+OH/unit | Total auditable COGS/unit | Contribution margin/unit | GM % | Food cost flag | Break-even/batch | Source |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---:|---|
| 80g @ 100.00 | 212.62 | 100.00 | 33.76 | missing | missing | 33.76 | 66.24 | 66.2% | OK 25-35% | 71.78 | `Sugar Balls!B18`, `Sugar Balls!C18` |
| 80g @ 100.00 | 212.62 | 100.00 | 33.76 | missing | missing | 33.76 | 66.24 | 66.2% | OK 25-35% | 71.78 | `Sugar Balls!B19`, `Sugar Balls!C19` |
| 150g @ 500.00 | 113.40 | 500.00 | 63.30 | missing | missing | 63.30 | 436.70 | 87.3% | Outside 25-35% | 14.36 | `Sugar Balls!B20`, `Sugar Balls!C20` |

| Sensitivity: key ingredient +10% / +25% | Margin $ after +10% | GM % after +10% | Margin $ after +25% | GM % after +25% | Source |
|---|---:|---:|---:|---:|---|
| 80g @ 100.00; key `flour` | 64.26 | 64.3% | 61.30 | 61.3% | `Sugar Balls!E5`, `Sugar Balls!B18`, `Sugar Balls!C18` |
| 80g @ 100.00; key `flour` | 64.26 | 64.3% | 61.30 | 61.3% | `Sugar Balls!E5`, `Sugar Balls!B19`, `Sugar Balls!C19` |
| 150g @ 500.00; key `flour` | 433.00 | 86.6% | 427.44 | 85.5% | `Sugar Balls!E5`, `Sugar Balls!B20`, `Sugar Balls!C20` |

### Delice
- Category: biscuit/sweet; base batch mass 6,785 and ingredient cost 4,825 from first quantity/cost pair in `Bakery recipes   melto 2026.xlsx`.
- Missing fields: labor minutes/rate, packaging cost, overhead allocation, actual yield, waste/shrinkage, daily fixed cost, daily sales volume.
- Concentration: top ingredient `flour` plus next ingredient = 52.1% of base ingredient cost.

| Ingredient | Qty | Cost | % ingredient cost | Source |
|---|---:|---:|---:|---|
| flour | 3,000 | 1,260 | 26.1% | `Delice!D5`, `Delice!E5` |
| Chocolate | 700 | 1,253 | 26.0% | `Delice!D15`, `Delice!E15` |
| Butter | 500 | 631.58 | 13.1% | `Delice!D6`, `Delice!E6` |
| honey | 400 | 500.00 | 10.4% | `Delice!D16`, `Delice!E16` |
| egg | 250 | 333.33 | 6.9% | `Delice!D9`, `Delice!E9` |
| Milk | 250 | 292.50 | 6.1% | `Delice!D8`, `Delice!E8` |
| sugar | 300 | 192.00 | 4.0% | `Delice!D7`, `Delice!E7` |
| EDC | 50 | 150.00 | 3.1% | `Delice!D17`, `Delice!E17` |
| improver | 40 | 112.00 | 2.3% | `Delice!D11`, `Delice!E11` |
| yeast | 30 | 84.00 | 1.7% | `Delice!D12`, `Delice!E12` |
| baking powder | 30 | 9.75 | 0.2% | `Delice!D14`, `Delice!E14` |
| salt | 35 | 7.19 | 0.1% | `Delice!D10`, `Delice!E10` |
| water | 1,200 | 0.12 | 0.0% | `Delice!D13`, `Delice!E13` |

| SKU / portion | Theoretical yield | Price | Ingredient COGS/unit | Labor/unit | Packaging+OH/unit | Total auditable COGS/unit | Contribution margin/unit | GM % | Food cost flag | Break-even/batch | Source |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---:|---|
| 700g @ 1,000 | 9.69 | 1,000 | 497.80 | missing | missing | 497.80 | 502.20 | 50.2% | Outside 25-35% | 4.83 | `Delice!B23`, `Delice!C23` |
| 140g @ 200.00 | 48.46 | 200.00 | 99.56 | missing | missing | 99.56 | 100.44 | 50.2% | Outside 25-35% | 24.13 | `Delice!B24`, `Delice!C24` |
| 700g @ 1,000 | 9.69 | 1,000 | 497.80 | missing | missing | 497.80 | 502.20 | 50.2% | Outside 25-35% | 4.83 | `Delice!B25`, `Delice!C25` |

| Sensitivity: key ingredient +10% / +25% | Margin $ after +10% | GM % after +10% | Margin $ after +25% | GM % after +25% | Source |
|---|---:|---:|---:|---:|---|
| 700g @ 1,000; key `flour` | 489.20 | 48.9% | 469.70 | 47.0% | `Delice!E5`, `Delice!B23`, `Delice!C23` |
| 140g @ 200.00; key `flour` | 97.84 | 48.9% | 93.94 | 47.0% | `Delice!E5`, `Delice!B24`, `Delice!C24` |
| 700g @ 1,000; key `flour` | 489.20 | 48.9% | 469.70 | 47.0% | `Delice!E5`, `Delice!B25`, `Delice!C25` |

### Danisa biscuits
- Category: biscuit/sweet; base batch mass 7,027 and ingredient cost 5,118 from first quantity/cost pair in `Bakery recipes   melto 2026.xlsx`.
- Missing fields: labor minutes/rate, packaging cost, overhead allocation, actual yield, waste/shrinkage, daily fixed cost, daily sales volume.
- Concentration: top ingredient `flour` plus next ingredient = 49.1% of base ingredient cost.

| Ingredient | Qty | Cost | % ingredient cost | Source |
|---|---:|---:|---:|---|
| flour | 3,000 | 1,260 | 24.6% | `Danisa biscuits!D5`, `Danisa biscuits!E5` |
| Chocolate | 700 | 1,253 | 24.5% | `Danisa biscuits!D15`, `Danisa biscuits!E15` |
| honey | 700 | 875.00 | 17.1% | `Danisa biscuits!D16`, `Danisa biscuits!E16` |
| Butter | 500 | 631.58 | 12.3% | `Danisa biscuits!D6`, `Danisa biscuits!E6` |
| Milk | 250 | 292.50 | 5.7% | `Danisa biscuits!D8`, `Danisa biscuits!E8` |
| egg | 200 | 266.67 | 5.2% | `Danisa biscuits!D9`, `Danisa biscuits!E9` |
| sugar | 300 | 192.00 | 3.8% | `Danisa biscuits!D7`, `Danisa biscuits!E7` |
| EDC | 50 | 150.00 | 2.9% | `Danisa biscuits!D17`, `Danisa biscuits!E17` |
| improver | 40 | 112.00 | 2.2% | `Danisa biscuits!D11`, `Danisa biscuits!E11` |
| yeast | 25 | 70.00 | 1.4% | `Danisa biscuits!D12`, `Danisa biscuits!E12` |
| baking powder | 27 | 8.78 | 0.2% | `Danisa biscuits!D14`, `Danisa biscuits!E14` |
| salt | 35 | 7.19 | 0.1% | `Danisa biscuits!D10`, `Danisa biscuits!E10` |
| water | 1,200 | 0.12 | 0.0% | `Danisa biscuits!D13`, `Danisa biscuits!E13` |

| SKU / portion | Theoretical yield | Price | Ingredient COGS/unit | Labor/unit | Packaging+OH/unit | Total auditable COGS/unit | Contribution margin/unit | GM % | Food cost flag | Break-even/batch | Source |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---:|---|
| 850g @ 1,000 | 8.27 | 1,000 | 619.14 | missing | missing | 619.14 | 380.86 | 38.1% | Outside 25-35% | 5.12 | `Danisa biscuits!B23`, `Danisa biscuits!C23` |
| 140g @ 200.00 | 50.19 | 200.00 | 101.98 | missing | missing | 101.98 | 98.02 | 49.0% | Outside 25-35% | 25.59 | `Danisa biscuits!B24`, `Danisa biscuits!C24` |
| 700g @ 1,000 | 10.04 | 1,000 | 509.88 | missing | missing | 509.88 | 490.12 | 49.0% | Outside 25-35% | 5.12 | `Danisa biscuits!B25`, `Danisa biscuits!C25` |

| Sensitivity: key ingredient +10% / +25% | Margin $ after +10% | GM % after +10% | Margin $ after +25% | GM % after +25% | Source |
|---|---:|---:|---:|---:|---|
| 850g @ 1,000; key `flour` | 365.62 | 36.6% | 342.76 | 34.3% | `Danisa biscuits!E5`, `Danisa biscuits!B23`, `Danisa biscuits!C23` |
| 140g @ 200.00; key `flour` | 95.51 | 47.8% | 91.75 | 45.9% | `Danisa biscuits!E5`, `Danisa biscuits!B24`, `Danisa biscuits!C24` |
| 700g @ 1,000; key `flour` | 477.57 | 47.8% | 458.74 | 45.9% | `Danisa biscuits!E5`, `Danisa biscuits!B25`, `Danisa biscuits!C25` |

### Okinawa
- Category: biscuit/sweet; base batch mass 7,400 and ingredient cost 4,434 from first quantity/cost pair in `Bakery recipes   melto 2026.xlsx`.
- Missing fields: labor minutes/rate, packaging cost, overhead allocation, actual yield, waste/shrinkage, daily fixed cost, daily sales volume.
- Concentration: top ingredient `flour` plus next ingredient = 79.6% of base ingredient cost.

| Ingredient | Qty | Cost | % ingredient cost | Source |
|---|---:|---:|---:|---|
| flour | 5,500 | 2,310 | 52.1% | `Okinawa!D5`, `Okinawa!E5` |
| frying oil | 1,000 | 1,220 | 27.5% | `Okinawa!D11`, `Okinawa!E11` |
| sugar | 500 | 320.00 | 7.2% | `Okinawa!D7`, `Okinawa!E7` |
| baking powder | 100 | 260.00 | 5.9% | `Okinawa!D6`, `Okinawa!E6` |
| egg | 200 | 252.63 | 5.7% | `Okinawa!D8`, `Okinawa!E8` |
| oil | 50 | 61.00 | 1.4% | `Okinawa!D10`, `Okinawa!E10` |
| salt | 50 | 10.28 | 0.2% | `Okinawa!D9`, `Okinawa!E9` |

| SKU / portion | Theoretical yield | Price | Ingredient COGS/unit | Labor/unit | Packaging+OH/unit | Total auditable COGS/unit | Contribution margin/unit | GM % | Food cost flag | Break-even/batch | Source |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---:|---|
| 80g @ 100.00 | 92.50 | 100.00 | 47.93 | missing | missing | 47.93 | 52.07 | 52.1% | Outside 25-35% | 44.34 | `Okinawa!B16`, `Okinawa!C16` |
| 80g @ 100.00 | 92.50 | 100.00 | 47.93 | missing | missing | 47.93 | 52.07 | 52.1% | Outside 25-35% | 44.34 | `Okinawa!B17`, `Okinawa!C17` |
| 150g @ 500.00 | 49.33 | 500.00 | 89.88 | missing | missing | 89.88 | 410.12 | 82.0% | Outside 25-35% | 8.87 | `Okinawa!B18`, `Okinawa!C18` |

| Sensitivity: key ingredient +10% / +25% | Margin $ after +10% | GM % after +10% | Margin $ after +25% | GM % after +25% | Source |
|---|---:|---:|---:|---:|---|
| 80g @ 100.00; key `flour` | 49.57 | 49.6% | 45.82 | 45.8% | `Okinawa!E5`, `Okinawa!B16`, `Okinawa!C16` |
| 80g @ 100.00; key `flour` | 49.57 | 49.6% | 45.82 | 45.8% | `Okinawa!E5`, `Okinawa!B17`, `Okinawa!C17` |
| 150g @ 500.00; key `flour` | 405.44 | 81.1% | 398.42 | 79.7% | `Okinawa!E5`, `Okinawa!B18`, `Okinawa!C18` |

### CAKE NOW
- Category: cake/gateau; base batch mass 7,100 and ingredient cost 6,138 from first quantity/cost pair in `Bakery recipes   melto 2026.xlsx`.
- Missing fields: labor minutes/rate, packaging cost, overhead allocation, actual yield, waste/shrinkage, daily fixed cost, daily sales volume.
- Concentration: top ingredient `Egg` plus next ingredient = 64.8% of base ingredient cost.

| Ingredient | Qty | Cost | % ingredient cost | Source |
|---|---:|---:|---:|---|
| Egg | 1,500 | 2,083 | 33.9% | `CAKE NOW!D7`, `CAKE NOW!E7` |
| Butter | 1,500 | 1,895 | 30.9% | `CAKE NOW!D9`, `CAKE NOW!E9` |
| flour | 3,000 | 1,260 | 20.5% | `CAKE NOW!D5`, `CAKE NOW!E5` |
| sugar | 1,000 | 640.00 | 10.4% | `CAKE NOW!D10`, `CAKE NOW!E10` |
| baking powder | 100 | 260.00 | 4.2% | `CAKE NOW!D6`, `CAKE NOW!E6` |
| water | n/a | n/a | 0.0% | `CAKE NOW!D8`, `CAKE NOW!E8` |

| SKU / portion | Theoretical yield | Price | Ingredient COGS/unit | Labor/unit | Packaging+OH/unit | Total auditable COGS/unit | Contribution margin/unit | GM % | Food cost flag | Break-even/batch | Source |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---:|---|
| 220g @ 500.00 | 32.27 | 500.00 | 190.19 | missing | missing | 190.19 | 309.81 | 62.0% | Outside 25-35% | 12.28 | `CAKE NOW!B17`, `CAKE NOW!C17` |
| 60g @ 100.00 | 118.33 | 100.00 | 51.87 | missing | missing | 51.87 | 48.13 | 48.1% | Outside 25-35% | 61.38 | `CAKE NOW!B18`, `CAKE NOW!C18` |

| Sensitivity: key ingredient +10% / +25% | Margin $ after +10% | GM % after +10% | Margin $ after +25% | GM % after +25% | Source |
|---|---:|---:|---:|---:|---|
| 220g @ 500.00; key `Egg` | 303.35 | 60.7% | 293.67 | 58.7% | `CAKE NOW!E7`, `CAKE NOW!B17`, `CAKE NOW!C17` |
| 60g @ 100.00; key `Egg` | 46.37 | 46.4% | 43.73 | 43.7% | `CAKE NOW!E7`, `CAKE NOW!B18`, `CAKE NOW!C18` |

### Short bread
- Category: bread; base batch mass 3,950 and ingredient cost 2,983 from first quantity/cost pair in `Bakery recipes   melto 2026.xlsx`.
- Missing fields: labor minutes/rate, packaging cost, overhead allocation, actual yield, waste/shrinkage, daily fixed cost, daily sales volume.
- Concentration: top ingredient `Butter` plus next ingredient = 70.5% of base ingredient cost.

| Ingredient | Qty | Cost | % ingredient cost | Source |
|---|---:|---:|---:|---|
| Butter | 1,000 | 1,263 | 42.3% | `Short bread!D6`, `Short bread!E6` |
| flour | 2,000 | 840.00 | 28.2% | `Short bread!D5`, `Short bread!E5` |
| sugar | 400 | 256.00 | 8.6% | `Short bread!D10`, `Short bread!E10` |
| milk | 200 | 234.00 | 7.8% | `Short bread!D9`, `Short bread!E9` |
| icing sugar | 100 | 220.00 | 7.4% | `Short bread!D7`, `Short bread!E7` |
| egg | 100 | 138.89 | 4.7% | `Short bread!D8`, `Short bread!E8` |
| salt | 150 | 30.83 | 1.0% | `Short bread!D11`, `Short bread!E11` |

| SKU / portion | Theoretical yield | Price | Ingredient COGS/unit | Labor/unit | Packaging+OH/unit | Total auditable COGS/unit | Contribution margin/unit | GM % | Food cost flag | Break-even/batch | Source |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---:|---|
| 38g @ 50.00 | 103.95 | 50.00 | 28.70 | missing | missing | 28.70 | 21.30 | 42.6% | Outside 25-35% | 59.66 | `Short bread!B17`, `Short bread!C17` |
| 45g @ 50.00 | 87.78 | 50.00 | 33.98 | missing | missing | 33.98 | 16.02 | 32.0% | Outside 25-35% | 59.66 | `Short bread!B18`, `Short bread!C18` |

| Sensitivity: key ingredient +10% / +25% | Margin $ after +10% | GM % after +10% | Margin $ after +25% | GM % after +25% | Source |
|---|---:|---:|---:|---:|---|
| 38g @ 50.00; key `Butter` | 20.09 | 40.2% | 18.27 | 36.5% | `Short bread!E6`, `Short bread!B17`, `Short bread!C17` |
| 45g @ 50.00; key `Butter` | 14.58 | 29.2% | 12.42 | 24.8% | `Short bread!E6`, `Short bread!B18`, `Short bread!C18` |

### Melto
- Category: biscuit/sweet; base batch mass 7,490 and ingredient cost 5,769 from first quantity/cost pair in `Bakery recipes   melto 2026.xlsx`.
- Missing fields: labor minutes/rate, packaging cost, overhead allocation, actual yield, waste/shrinkage, daily fixed cost, daily sales volume.
- Concentration: top ingredient `Butter` plus next ingredient = 76.6% of base ingredient cost.

| Ingredient | Qty | Cost | % ingredient cost | Source |
|---|---:|---:|---:|---|
| Butter | 2,000 | 2,526 | 43.8% | `Melto!D6`, `Melto!E6` |
| flour | 4,500 | 1,890 | 32.8% | `Melto!D5`, `Melto!E5` |
| icing sugar | 400 | 880.00 | 15.3% | `Melto!D7`, `Melto!E7` |
| sugar | 400 | 256.00 | 4.4% | `Melto!D9`, `Melto!E9` |
| egg | 150 | 208.33 | 3.6% | `Melto!D8`, `Melto!E8` |
| salt | 40 | 8.22 | 0.1% | `Melto!D10`, `Melto!E10` |

| SKU / portion | Theoretical yield | Price | Ingredient COGS/unit | Labor/unit | Packaging+OH/unit | Total auditable COGS/unit | Contribution margin/unit | GM % | Food cost flag | Break-even/batch | Source |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---:|---|
| 34g @ 50.00 | 220.29 | 50.00 | 26.19 | missing | missing | 26.19 | 23.81 | 47.6% | Outside 25-35% | 115.38 | `Melto!B16`, `Melto!C16` |
| 45g @ 50.00 | 166.44 | 50.00 | 34.66 | missing | missing | 34.66 | 15.34 | 30.7% | Outside 25-35% | 115.38 | `Melto!B17`, `Melto!C17` |

| Sensitivity: key ingredient +10% / +25% | Margin $ after +10% | GM % after +10% | Margin $ after +25% | GM % after +25% | Source |
|---|---:|---:|---:|---:|---|
| 34g @ 50.00; key `Butter` | 22.67 | 45.3% | 20.95 | 41.9% | `Melto!E6`, `Melto!B16`, `Melto!C16` |
| 45g @ 50.00; key `Butter` | 13.82 | 27.6% | 11.55 | 23.1% | `Melto!E6`, `Melto!B17`, `Melto!C17` |

### Ice Cream
- Category: ice cream; base batch mass 15,500 and ingredient cost 9,360 from first quantity/cost pair in `Bakery recipes   melto 2026.xlsx`.
- Missing fields: labor minutes/rate, packaging cost, overhead allocation, actual yield, waste/shrinkage, daily fixed cost, daily sales volume.
- Concentration: top ingredient `Powdered Milk` plus next ingredient = 65.0% of base ingredient cost.

| Ingredient | Qty | Cost | % ingredient cost | Source |
|---|---:|---:|---:|---|
| Powdered Milk | 1,100 | 3,520 | 37.6% | `Ice Cream!D6`, `Ice Cream!E6` |
| Stabilizer | 200 | 2,560 | 27.4% | `Ice Cream!D5`, `Ice Cream!E5` |
| others | 200 | 2,000 | 21.4% | `Ice Cream!D9`, `Ice Cream!E9` |
| Sugar | 2,000 | 1,280 | 13.7% | `Ice Cream!D7`, `Ice Cream!E7` |
| Water | 12,000 | 0.00 | 0.0% | `Ice Cream!D8`, `Ice Cream!E8` |

| SKU / portion | Theoretical yield | Price | Ingredient COGS/unit | Labor/unit | Packaging+OH/unit | Total auditable COGS/unit | Contribution margin/unit | GM % | Food cost flag | Break-even/batch | Source |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---:|---|
| 70g @ 100.00 | 221.43 | 100.00 | 42.27 | missing | missing | 42.27 | 57.73 | 57.7% | Outside 25-35% | 93.60 | `Ice Cream!B14`, `Ice Cream!C14` |
| 45g @ 50.00 | 344.44 | 50.00 | 27.17 | missing | missing | 27.17 | 22.83 | 45.7% | Outside 25-35% | 187.20 | `Ice Cream!B15`, `Ice Cream!C15` |

| Sensitivity: key ingredient +10% / +25% | Margin $ after +10% | GM % after +10% | Margin $ after +25% | GM % after +25% | Source |
|---|---:|---:|---:|---:|---|
| 70g @ 100.00; key `Powdered Milk` | 56.14 | 56.1% | 53.75 | 53.8% | `Ice Cream!E6`, `Ice Cream!B14`, `Ice Cream!C14` |
| 45g @ 50.00; key `Powdered Milk` | 21.80 | 43.6% | 20.27 | 40.5% | `Ice Cream!E6`, `Ice Cream!B15`, `Ice Cream!C15` |

### Melto1
- Category: biscuit/sweet; base batch mass 7,540 and ingredient cost 5,682 from first quantity/cost pair in `Bakery recipes   melto 2026.xlsx`.
- Missing fields: labor minutes/rate, packaging cost, overhead allocation, actual yield, waste/shrinkage, daily fixed cost, daily sales volume.
- Concentration: top ingredient `Butter` plus next ingredient = 77.7% of base ingredient cost.

| Ingredient | Qty | Cost | % ingredient cost | Source |
|---|---:|---:|---:|---|
| Butter | 2,000 | 2,526 | 44.5% | `Melto1!D6`, `Melto1!E6` |
| flour | 4,500 | 1,890 | 33.3% | `Melto1!D5`, `Melto1!E5` |
| icing sugar | 300 | 660.00 | 11.6% | `Melto1!D7`, `Melto1!E7` |
| sugar | 500 | 320.00 | 5.6% | `Melto1!D9`, `Melto1!E9` |
| egg | 200 | 277.78 | 4.9% | `Melto1!D8`, `Melto1!E8` |
| salt | 40 | 8.22 | 0.1% | `Melto1!D10`, `Melto1!E10` |

| SKU / portion | Theoretical yield | Price | Ingredient COGS/unit | Labor/unit | Packaging+OH/unit | Total auditable COGS/unit | Contribution margin/unit | GM % | Food cost flag | Break-even/batch | Source |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---:|---|
| 35g @ 50.00 | 215.43 | 50.00 | 26.38 | missing | missing | 26.38 | 23.62 | 47.2% | Outside 25-35% | 113.65 | `Melto1!B16`, `Melto1!C16` |
| 45g @ 50.00 | 167.56 | 50.00 | 33.91 | missing | missing | 33.91 | 16.09 | 32.2% | Outside 25-35% | 113.65 | `Melto1!B17`, `Melto1!C17` |

| Sensitivity: key ingredient +10% / +25% | Margin $ after +10% | GM % after +10% | Margin $ after +25% | GM % after +25% | Source |
|---|---:|---:|---:|---:|---|
| 35g @ 50.00; key `Butter` | 22.45 | 44.9% | 20.69 | 41.4% | `Melto1!E6`, `Melto1!B16`, `Melto1!C16` |
| 45g @ 50.00; key `Butter` | 14.58 | 29.2% | 12.32 | 24.6% | `Melto1!E6`, `Melto1!B17`, `Melto1!C17` |

### Zebree
- Category: biscuit/sweet; base batch mass 18,505 and ingredient cost 10,406 from first quantity/cost pair in `Bakery recipes   melto 2026.xlsx`.
- Missing fields: labor minutes/rate, packaging cost, overhead allocation, actual yield, waste/shrinkage, daily fixed cost, daily sales volume.
- Concentration: top ingredient `flour` plus next ingredient = 57.6% of base ingredient cost.

| Ingredient | Qty | Cost | % ingredient cost | Source |
|---|---:|---:|---:|---|
| flour | 10,000 | 4,200 | 40.4% | `Zebree!D5`, `Zebree!E5` |
| Chocolate | 1,000 | 1,789 | 17.2% | `Zebree!D16`, `Zebree!E16` |
| Butter | 1,000 | 1,263 | 12.1% | `Zebree!D6`, `Zebree!E6` |
| egg | 750 | 1,000 | 9.6% | `Zebree!D9`, `Zebree!E9` |
| Milk | 800 | 936.00 | 9.0% | `Zebree!D8`, `Zebree!E8` |
| sugar | 1,000 | 640.00 | 6.2% | `Zebree!D7`, `Zebree!E7` |
| improver | 100 | 280.00 | 2.7% | `Zebree!D11`, `Zebree!E11` |
| yeast | 85 | 238.00 | 2.3% | `Zebree!D12`, `Zebree!E12` |
| baking powder | 85 | 27.62 | 0.3% | `Zebree!D14`, `Zebree!E14` |
| salt | 110 | 22.61 | 0.2% | `Zebree!D10`, `Zebree!E10` |
| EDC | 75 | 9.00 | 0.1% | `Zebree!D15`, `Zebree!E15` |
| water | 3,500 | 0.35 | 0.0% | `Zebree!D13`, `Zebree!E13` |

| SKU / portion | Theoretical yield | Price | Ingredient COGS/unit | Labor/unit | Packaging+OH/unit | Total auditable COGS/unit | Contribution margin/unit | GM % | Food cost flag | Break-even/batch | Source |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---:|---|
| 370g @ 500.00 | 50.01 | 500.00 | 208.07 | missing | missing | 208.07 | 291.93 | 58.4% | Outside 25-35% | 20.81 | `Zebree!B22`, `Zebree!C22` |
| 190g @ 250.00 | 97.39 | 250.00 | 106.85 | missing | missing | 106.85 | 143.15 | 57.3% | Outside 25-35% | 41.62 | `Zebree!B23`, `Zebree!C23` |
| 700g @ 1,000 | 26.44 | 1,000 | 393.64 | missing | missing | 393.64 | 606.36 | 60.6% | Outside 25-35% | 10.41 | `Zebree!B24`, `Zebree!C24` |

| Sensitivity: key ingredient +10% / +25% | Margin $ after +10% | GM % after +10% | Margin $ after +25% | GM % after +25% | Source |
|---|---:|---:|---:|---:|---|
| 370g @ 500.00; key `flour` | 283.53 | 56.7% | 270.94 | 54.2% | `Zebree!E5`, `Zebree!B22`, `Zebree!C22` |
| 190g @ 250.00; key `flour` | 138.84 | 55.5% | 132.37 | 52.9% | `Zebree!E5`, `Zebree!B23`, `Zebree!C23` |
| 700g @ 1,000; key `flour` | 590.47 | 59.0% | 566.64 | 56.7% | `Zebree!E5`, `Zebree!B24`, `Zebree!C24` |

### Croissant
- Category: pastry/savory; base batch mass 6,590 and ingredient cost 3,070 from first quantity/cost pair in `Bakery recipes   melto 2026.xlsx`.
- Missing fields: labor minutes/rate, packaging cost, overhead allocation, actual yield, waste/shrinkage, daily fixed cost, daily sales volume.
- Concentration: top ingredient `flour` plus next ingredient = 83.5% of base ingredient cost.

| Ingredient | Qty | Cost | % ingredient cost | Source |
|---|---:|---:|---:|---|
| flour | 3,100 | 1,302 | 42.4% | `Croissant!D5`, `Croissant!E5` |
| Butter | 1,000 | 1,263 | 41.1% | `Croissant!D6`, `Croissant!E6` |
| sugar | 300 | 192.00 | 6.3% | `Croissant!D7`, `Croissant!E7` |
| egg | 100 | 138.89 | 4.5% | `Croissant!D9`, `Croissant!E9` |
| improver | 30 | 84.00 | 2.7% | `Croissant!D10`, `Croissant!E10` |
| yeast | 30 | 84.00 | 2.7% | `Croissant!D11`, `Croissant!E11` |
| salt | 30 | 6.17 | 0.2% | `Croissant!D8`, `Croissant!E8` |
| water | 2,000 | 0.20 | 0.0% | `Croissant!D12`, `Croissant!E12` |

| SKU / portion | Theoretical yield | Price | Ingredient COGS/unit | Labor/unit | Packaging+OH/unit | Total auditable COGS/unit | Contribution margin/unit | GM % | Food cost flag | Break-even/batch | Source |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---:|---|
| 45g @ 100.00 | 146.44 | 100.00 | 20.97 | missing | missing | 20.97 | 79.03 | 79.0% | Outside 25-35% | 30.70 | `Croissant!B18`, `Croissant!C18` |
| 190g @ 250.00 | 34.68 | 250.00 | 88.52 | missing | missing | 88.52 | 161.48 | 64.6% | Outside 25-35% | 12.28 | `Croissant!B19`, `Croissant!C19` |
| 700g @ 1,000 | 9.41 | 1,000 | 326.14 | missing | missing | 326.14 | 673.86 | 67.4% | OK 25-35% | 3.07 | `Croissant!B20`, `Croissant!C20` |

| Sensitivity: key ingredient +10% / +25% | Margin $ after +10% | GM % after +10% | Margin $ after +25% | GM % after +25% | Source |
|---|---:|---:|---:|---:|---|
| 45g @ 100.00; key `flour` | 78.14 | 78.1% | 76.81 | 76.8% | `Croissant!E5`, `Croissant!B18`, `Croissant!C18` |
| 190g @ 250.00; key `flour` | 157.72 | 63.1% | 152.09 | 60.8% | `Croissant!E5`, `Croissant!B19`, `Croissant!C19` |
| 700g @ 1,000; key `flour` | 660.03 | 66.0% | 639.28 | 63.9% | `Croissant!E5`, `Croissant!B20`, `Croissant!C20` |

### Universal bread
- Category: bread; base batch mass 50,170 and ingredient cost 27,728 from first quantity/cost pair in `Bakery recipes   melto 2026.xlsx`.
- Missing fields: labor minutes/rate, packaging cost, overhead allocation, actual yield, waste/shrinkage, daily fixed cost, daily sales volume.
- Concentration: top ingredient `frying oil` plus next ingredient = 79.0% of base ingredient cost.

| Ingredient | Qty | Cost | % ingredient cost | Source |
|---|---:|---:|---:|---|
| frying oil | 9,000 | 10,980 | 39.6% | `Universal bread!D15`, `Universal bread!E15` |
| flour | 26,000 | 10,920 | 39.4% | `Universal bread!D5`, `Universal bread!E5` |
| Butter | 1,400 | 1,768 | 6.4% | `Universal bread!D6`, `Universal bread!E6` |
| sugar | 1,700 | 1,088 | 3.9% | `Universal bread!D7`, `Universal bread!E7` |
| Conc Milk | 800 | 936.00 | 3.4% | `Universal bread!D8`, `Universal bread!E8` |
| egg | 500 | 666.67 | 2.4% | `Universal bread!D9`, `Universal bread!E9` |
| yeast | 170 | 476.00 | 1.7% | `Universal bread!D12`, `Universal bread!E12` |
| baking powder | 180 | 468.00 | 1.7% | `Universal bread!D14`, `Universal bread!E14` |
| improver | 130 | 364.00 | 1.3% | `Universal bread!D11`, `Universal bread!E11` |
| salt | 290 | 59.61 | 0.2% | `Universal bread!D10`, `Universal bread!E10` |
| water | 10,000 | 1.00 | 0.0% | `Universal bread!D13`, `Universal bread!E13` |

| SKU / portion | Theoretical yield | Price | Ingredient COGS/unit | Labor/unit | Packaging+OH/unit | Total auditable COGS/unit | Contribution margin/unit | GM % | Food cost flag | Break-even/batch | Source |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---:|---|
| 81.40g @ 100.00 | 616.34 | 100.00 | 44.99 | missing | missing | 44.99 | 55.01 | 55.0% | Outside 25-35% | 277.28 | `Universal bread!B20`, `Universal bread!C20` |
| 90g @ 100.00 | 557.44 | 100.00 | 49.74 | missing | missing | 49.74 | 50.26 | 50.3% | Outside 25-35% | 277.28 | `Universal bread!B21`, `Universal bread!C21` |
| 90g @ 100.00 | 557.44 | 100.00 | 49.74 | missing | missing | 49.74 | 50.26 | 50.3% | Outside 25-35% | 277.28 | `Universal bread!B22`, `Universal bread!C22` |
| 900g @ 1,000 | 55.74 | 1,000 | 497.41 | missing | missing | 497.41 | 502.59 | 50.3% | Outside 25-35% | 27.73 | `Universal bread!B23`, `Universal bread!C23` |

| Sensitivity: key ingredient +10% / +25% | Margin $ after +10% | GM % after +10% | Margin $ after +25% | GM % after +25% | Source |
|---|---:|---:|---:|---:|---|
| 81.40g @ 100.00; key `frying oil` | 53.23 | 53.2% | 50.56 | 50.6% | `Universal bread!E15`, `Universal bread!B20`, `Universal bread!C20` |
| 90g @ 100.00; key `frying oil` | 48.29 | 48.3% | 45.34 | 45.3% | `Universal bread!E15`, `Universal bread!B21`, `Universal bread!C21` |
| 90g @ 100.00; key `frying oil` | 48.29 | 48.3% | 45.34 | 45.3% | `Universal bread!E15`, `Universal bread!B22`, `Universal bread!C22` |
| 900g @ 1,000; key `frying oil` | 482.90 | 48.3% | 453.35 | 45.3% | `Universal bread!E15`, `Universal bread!B23`, `Universal bread!C23` |

### Sheet3
- Category: other; base batch mass 19,250 and ingredient cost 9,161 from first quantity/cost pair in `Bakery recipes   melto 2026.xlsx`.
- Missing fields: labor minutes/rate, packaging cost, overhead allocation, actual yield, waste/shrinkage, daily fixed cost, daily sales volume.
- Concentration: top ingredient `flour` plus next ingredient = 57.4% of base ingredient cost.

| Ingredient | Qty | Cost | % ingredient cost | Source |
|---|---:|---:|---:|---|
| flour | 10,000 | 4,000 | 43.7% | `Sheet3!D5`, `Sheet3!E5` |
| Butter | 1,000 | 1,263 | 13.8% | `Sheet3!D6`, `Sheet3!E6` |
| Milk | 850 | 994.50 | 10.9% | `Sheet3!D8`, `Sheet3!E8` |
| egg | 500 | 666.67 | 7.3% | `Sheet3!D9`, `Sheet3!E9` |
| sugar | 1,000 | 640.00 | 7.0% | `Sheet3!D7`, `Sheet3!E7` |
| Oil | 400 | 488.00 | 5.3% | `Sheet3!D14`, `Sheet3!E14` |
| yeast | 160 | 448.00 | 4.9% | `Sheet3!D12`, `Sheet3!E12` |
| improver | 120 | 336.00 | 3.7% | `Sheet3!D11`, `Sheet3!E11` |
| EDC | 100 | 300.00 | 3.3% | `Sheet3!D15`, `Sheet3!E15` |
| salt | 120 | 24.67 | 0.3% | `Sheet3!D10`, `Sheet3!E10` |
| water | 5,000 | 0.50 | 0.0% | `Sheet3!D13`, `Sheet3!E13` |

| SKU / portion | Theoretical yield | Price | Ingredient COGS/unit | Labor/unit | Packaging+OH/unit | Total auditable COGS/unit | Contribution margin/unit | GM % | Food cost flag | Break-even/batch | Source |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---:|---|
| 144g @ 125.00 | 133.68 | 125.00 | 68.53 | missing | missing | 68.53 | 56.47 | 45.2% | Outside 25-35% | 73.29 | `Sheet3!B21`, `Sheet3!C21` |
| 500g @ 500.00 | 38.50 | 500.00 | 237.96 | missing | missing | 237.96 | 262.04 | 52.4% | Outside 25-35% | 18.32 | `Sheet3!B22`, `Sheet3!C22` |
| 139g @ 150.00 | 138.49 | 150.00 | 66.15 | missing | missing | 66.15 | 83.85 | 55.9% | Outside 25-35% | 61.08 | `Sheet3!B23`, `Sheet3!C23` |

| Sensitivity: key ingredient +10% / +25% | Margin $ after +10% | GM % after +10% | Margin $ after +25% | GM % after +25% | Source |
|---|---:|---:|---:|---:|---|
| 144g @ 125.00; key `flour` | 53.48 | 42.8% | 48.99 | 39.2% | `Sheet3!E5`, `Sheet3!B21`, `Sheet3!C21` |
| 500g @ 500.00; key `flour` | 251.65 | 50.3% | 236.07 | 47.2% | `Sheet3!E5`, `Sheet3!B22`, `Sheet3!C22` |
| 139g @ 150.00; key `flour` | 80.96 | 54.0% | 76.63 | 51.1% | `Sheet3!E5`, `Sheet3!B23`, `Sheet3!C23` |

## Cross-Recipe Patterns
### Shared Ingredient Risks
| Ingredient group | Recipes using it | Base-batch spend | Base-batch qty | Purchasing action | Source |
|---|---:|---:|---:|---|---|
| flour | 36 | 133,631 | 317,550 | Renegotiate / consolidate supplier terms | Recipe base quantity/cost cells in `Bakery recipes   melto 2026.xlsx` |
| oil | 11 | 63,503 | 39,562 | Renegotiate / consolidate supplier terms | Recipe base quantity/cost cells in `Bakery recipes   melto 2026.xlsx` |
| butter | 30 | 47,585 | 37,500 | Renegotiate / consolidate supplier terms | Recipe base quantity/cost cells in `Bakery recipes   melto 2026.xlsx` |
| egg | 31 | 41,489 | 25,906 | Renegotiate / consolidate supplier terms | Recipe base quantity/cost cells in `Bakery recipes   melto 2026.xlsx` |
| sugar | 35 | 22,131 | 32,255 | Renegotiate / consolidate supplier terms | Recipe base quantity/cost cells in `Bakery recipes   melto 2026.xlsx` |
| milk | 23 | 20,719 | 15,940 | Renegotiate / consolidate supplier terms | Recipe base quantity/cost cells in `Bakery recipes   melto 2026.xlsx` |
| improver | 30 | 7,624 | 2,845 | Renegotiate / consolidate supplier terms | Recipe base quantity/cost cells in `Bakery recipes   melto 2026.xlsx` |
| yeast | 25 | 6,921 | 2,476 | Renegotiate / consolidate supplier terms | Recipe base quantity/cost cells in `Bakery recipes   melto 2026.xlsx` |
| chocolate | 4 | 6,084 | 3,400 | Monitor | Recipe base quantity/cost cells in `Bakery recipes   melto 2026.xlsx` |
| baking powder | 16 | 4,816 | 2,012 | Renegotiate / consolidate supplier terms | Recipe base quantity/cost cells in `Bakery recipes   melto 2026.xlsx` |
| powdered milk | 1 | 3,520 | 1,100 | Monitor | Recipe base quantity/cost cells in `Bakery recipes   melto 2026.xlsx` |
| nutmeg | 9 | 2,918 | 262 | Renegotiate / consolidate supplier terms | Recipe base quantity/cost cells in `Bakery recipes   melto 2026.xlsx` |

### Concentration Risk
| Recipe | Top-2 cost share | Top ingredient | Verdict | Source |
|---|---:|---|---|---|
| New bageutte | 93.0% | flour | 🔴 | `New bageutte!G5` |
| Banh Mi | 90.8% | flour | 🔴 | `Banh Mi!G5` |
| baguette | 89.4% | flour | 🔴 | `baguette!E5` |
| Croissant | 83.5% | flour | 🔴 | `Croissant!E5` |
| New bread | 83.4% | flour | 🔴 | `New bread!E5` |
| gateau | 82.0% | frying oil | 🔴 | `gateau!E16` |
| Okinawa | 79.6% | flour | 🔴 | `Okinawa!E5` |
| Universal bread | 79.0% | frying oil | 🔴 | `Universal bread!E15` |
| Melto1 | 77.7% | Butter | 🔴 | `Melto1!E6` |
| buns new look | 76.7% | flour | 🔴 | `buns new look!E5` |
| Kouatchoua gato | 76.6% | flour | 🔴 | `Kouatchoua gato!E5` |
| Melto | 76.6% | Butter | 🔴 | `Melto!E6` |
| Donuts | 76.3% | oil | 🔴 | `Donuts!E13` |
| Sugar Balls | 76.1% | flour | 🔴 | `Sugar Balls!E5` |
| BUNS SPECIAL | 75.0% | flour | 🟡 | `BUNS SPECIAL!E5` |
| NGALA BREAD | 74.4% | flour | 🟡 | `NGALA BREAD!E5` |
| Pancake | 70.5% | milk | 🟡 | `Pancake!E13` |
| Short bread | 70.5% | Butter | 🟡 | `Short bread!E6` |
| Chinchin | 70.0% | egg | 🟡 | `Chinchin!E10` |
| NEW BRIOCHE | 67.9% | flour | 🟡 | `NEW BRIOCHE!E5` |
| brioche | 67.7% | flour | 🟡 | `brioche!E5` |
| cake marbre | 67.1% | Butter | 🟡 | `cake marbre!E11` |
| Fish Pie | 66.4% | Butter | 🟡 | `Fish Pie!E7` |
| Pain au lait | 65.3% | flour | 🟡 | `Pain au lait!E5` |
| YUMMY BREAD | 65.1% | flour | 🟡 | `YUMMY BREAD!E5` |
| Ice Cream | 65.0% | Powdered Milk | 🟡 | `Ice Cream!E6` |
| CAKE NOW | 64.8% | Egg | 🟡 | `CAKE NOW!E7` |
| Cake Prof | 64.6% | Egg | 🟡 | `Cake Prof!E7` |
| choko bread | 63.9% | flour | 🟡 | `choko bread!E5` |
| Best Chinchin | 61.1% | oil | 🟡 | `Best Chinchin!E14` |

### Underpriced vs Workbook Peers
| SKU | Category | Price/gram | Category median price/gram | GM % | Source |
|---|---|---:|---:|---:|---|
| New bageutte (500g @ 200.00) | other | 0.400 | 0.934 | 9.4% | `New bageutte!B18`, `New bageutte!C18` |
| Banh Mi (500g @ 200.00) | bread | 0.400 | 1.111 | 23.1% | `Banh Mi!B18`, `Banh Mi!C18` |
| gateau (900g @ 1,000) | cake/gateau | 1.111 | 1.451 | 29.1% | `gateau!B24`, `gateau!C24` |
| gateau (90g @ 100.00) | cake/gateau | 1.111 | 1.451 | 29.1% | `gateau!B22`, `gateau!C22` |
| gateau (90g @ 100.00) | cake/gateau | 1.111 | 1.451 | 29.1% | `gateau!B23`, `gateau!C23` |
| professinal Buns (95g @ 100.00) | buns | 1.053 | 1.250 | 29.4% | `professinal Buns!B23`, `professinal Buns!C23` |
| Melto (45g @ 50.00) | biscuit/sweet | 1.111 | 1.429 | 30.7% | `Melto!B17`, `Melto!C17` |
| baguette (200g @ 100.00) | bread | 0.500 | 1.111 | 31.6% | `baguette!B17`, `baguette!C17` |
| Melto1 (45g @ 50.00) | biscuit/sweet | 1.111 | 1.429 | 32.2% | `Melto1!B17`, `Melto1!C17` |
| Fish Pie (85g @ 100.00) | pastry/savory | 1.176 | 1.429 | 37.7% | `Fish Pie!B22`, `Fish Pie!C22` |
| Danisa biscuits (850g @ 1,000) | biscuit/sweet | 1.176 | 1.429 | 38.1% | `Danisa biscuits!B23`, `Danisa biscuits!C23` |
| YUMMY BREAD (144g @ 125.00) | bread | 0.868 | 1.111 | 46.7% | `YUMMY BREAD!B21`, `YUMMY BREAD!C21` |
| Kouatchoua gato (90g @ 100.00) | cake/gateau | 1.111 | 1.451 | 51.1% | `Kouatchoua gato!B21`, `Kouatchoua gato!C21` |
| Kouatchoua gato (90g @ 100.00) | cake/gateau | 1.111 | 1.451 | 51.1% | `Kouatchoua gato!B22`, `Kouatchoua gato!C22` |
| Kouatchoua gato (900g @ 1,000) | cake/gateau | 1.111 | 1.451 | 51.1% | `Kouatchoua gato!B23`, `Kouatchoua gato!C23` |
| New bageutte (65g @ 50.00) | other | 0.769 | 0.934 | 52.9% | `New bageutte!B19`, `New bageutte!C19` |
| baguette (65g @ 50.00) | bread | 0.769 | 1.111 | 55.5% | `baguette!B18`, `baguette!C18` |
| Kouatchoua gato (81.40g @ 100.00) | cake/gateau | 1.229 | 1.451 | 55.8% | `Kouatchoua gato!B20`, `Kouatchoua gato!C20` |
| Donuts (40g @ 50.00) | fried/snack | 1.250 | 2.222 | 57.5% | `Donuts!B18`, `Donuts!C18` |
| buns new look | buns | 1.053 | 1.250 | 58.1% | `buns new look!C20`, `buns new look!D20` |

### Labor, Yield, and Waste Exposure
| Pattern | Recipes / SKUs | Impact | Source |
|---|---|---|---|
| Hidden labor risk | Pain au lait, professinal Buns, Delice, Danisa biscuits, gateau, Fish Pie, Galette, Zebree | 12+ ingredient lines suggest more handling, but labor minutes are absent; margins are ingredient-only. | Ingredient rows in `Bakery recipes   melto 2026.xlsx` |
| Low theoretical yield / high portion risk | New bageutte (500g @ 200.00), New bageutte (90g @ 100.00), Danisa biscuits (850g @ 1,000), New bageutte (65g @ 50.00), Croissant (700g @ 1,000), Delice (700g @ 1,000), Delice (700g @ 1,000), Danisa biscuits (700g @ 1,000) | Waste on these SKUs hurts batch margin fastest because each lost unit carries high COGS. Actual waste is missing. | Price/weight rows and base mass/cost cells in `Bakery recipes   melto 2026.xlsx` |
| Formula/data integrity | 18 cached formula error cells found: BUNS SPECIAL!E23=#REF!, BUNS SPECIAL!F23=#REF!, BUNS SPECIAL!G23=#REF!, BUNS SPECIAL!H23=#REF!, buns new look!F24=#REF!, buns new look!H24=#REF!, buns new look!F25=#REF!, buns new look!H25=#REF! | Workbook profit outputs include errors/variant inconsistencies; audit recomputed from source ingredient and price/weight cells. | Workbook cached cell values |

## Prioritized Action Plan
| Rank | Action | Recipe | Effort | Projected $ lift/unit | Projected $ lift/base batch | Owner | Basis | Source |
|---:|---|---|---|---:|---:|---|---|---|
| 1 | Reformulate | gateau | Medium | 1,024 | 45,388 | Finance/Pricing | Target 65% GM on worst SKU 900g; current GM 29.1% | `Bakery recipes   melto 2026.xlsx`; calculated from scorecard source cells |
| 2 | Reprice | Best Chinchin | Low | 274.21 | 33,097 | Finance/Pricing | Move worst SKU 500g from 55.4% to 65% GM | `Bakery recipes   melto 2026.xlsx`; calculated from scorecard source cells |
| 3 | Reprice | Universal bread | Low | 42.12 | 23,478 | Finance/Pricing | Move worst SKU 90g from 50.3% to 65% GM | `Bakery recipes   melto 2026.xlsx`; calculated from scorecard source cells |
| 4 | Reprice | Kouatchoua gato | Low | 39.65 | 22,341 | Finance/Pricing | Move worst SKU 90g from 51.1% to 65% GM | `Bakery recipes   melto 2026.xlsx`; calculated from scorecard source cells |
| 5 | Resize portion | professinal Buns | Medium | 101.67 | 14,882 | Finance/Pricing | Current price would need >50% lift for 65% GM on 95g SKU | `Bakery recipes   melto 2026.xlsx`; calculated from scorecard source cells |
| 6 | Reprice | YUMMY BREAD | Low | 65.18 | 11,882 | Finance/Pricing | Move worst SKU 144g from 46.7% to 65% GM | `Bakery recipes   melto 2026.xlsx`; calculated from scorecard source cells |
| 7 | Resize portion | Brioche Professionel | Medium | 871.24 | 11,707 | Finance/Pricing | Current price would need >50% lift for 65% GM on 800g SKU | `Bakery recipes   melto 2026.xlsx`; calculated from scorecard source cells |
| 8 | Reprice | NEW BRIOCHE | Low | 47.52 | 9,975 | Finance/Pricing | Move worst SKU 82g from 48.4% to 65% GM | `Bakery recipes   melto 2026.xlsx`; calculated from scorecard source cells |
| 9 | Reprice | brioche | Low | 46.24 | 9,812 | Finance/Pricing | Move worst SKU 82g from 48.8% to 65% GM | `Bakery recipes   melto 2026.xlsx`; calculated from scorecard source cells |
| 10 | Reprice | BUNS SPECIAL | Low | 511.76 | 9,544 | Finance/Pricing | Move worst SKU 800g from 47.1% to 65% GM | `Bakery recipes   melto 2026.xlsx`; calculated from scorecard source cells |
| 11 | Reprice | Ice Cream | Low | 27.64 | 9,521 | Finance/Pricing | Move worst SKU 45g from 45.7% to 65% GM | `Bakery recipes   melto 2026.xlsx`; calculated from scorecard source cells |
| 12 | Reprice | Sheet3 | Low | 70.81 | 9,466 | Finance/Pricing | Move worst SKU 144g from 45.2% to 65% GM | `Bakery recipes   melto 2026.xlsx`; calculated from scorecard source cells |
| 13 | Reprice | Galette | Low | 40.87 | 8,791 | Finance/Pricing | Move worst SKU 79g from 50.7% to 65% GM | `Bakery recipes   melto 2026.xlsx`; calculated from scorecard source cells |
| 14 | Reformulate | Melto | Medium | 49.03 | 8,160 | Finance/Pricing | Target 65% GM on worst SKU 45g; current GM 30.7% | `Bakery recipes   melto 2026.xlsx`; calculated from scorecard source cells |
| 15 | Reformulate | Melto1 | Medium | 46.89 | 7,857 | Finance/Pricing | Target 65% GM on worst SKU 45g; current GM 32.2% | `Bakery recipes   melto 2026.xlsx`; calculated from scorecard source cells |
| 16 | Reprice | Donuts | Low | 10.77 | 7,393 | Finance/Pricing | Move worst SKU 40g from 57.5% to 65% GM | `Bakery recipes   melto 2026.xlsx`; calculated from scorecard source cells |
| 17 | Reprice | choko bread | Low | 81.37 | 6,822 | Finance/Pricing | Move worst SKU 100g from 36.5% to 65% GM | `Bakery recipes   melto 2026.xlsx`; calculated from scorecard source cells |
| 18 | Reprice | cake marbre | Low | 61.66 | 6,446 | Finance/Pricing | Move worst SKU 50g from 43.4% to 65% GM | `Bakery recipes   melto 2026.xlsx`; calculated from scorecard source cells |
| 19 | Reprice | Danisa biscuits | Low | 768.97 | 6,357 | Finance/Pricing | Move worst SKU 850g from 38.1% to 65% GM | `Bakery recipes   melto 2026.xlsx`; calculated from scorecard source cells |
| 20 | Reprice | CAKE NOW | Low | 48.20 | 5,704 | Finance/Pricing | Move worst SKU 60g from 48.1% to 65% GM | `Bakery recipes   melto 2026.xlsx`; calculated from scorecard source cells |
| 21 | Reprice | Zebree | Low | 55.27 | 5,383 | Finance/Pricing | Move worst SKU 190g from 57.3% to 65% GM | `Bakery recipes   melto 2026.xlsx`; calculated from scorecard source cells |
| 22 | Reprice | Cake Prof | Low | 38.90 | 5,357 | Finance/Pricing | Move worst SKU 57g from 51.4% to 65% GM | `Bakery recipes   melto 2026.xlsx`; calculated from scorecard source cells |
| 23 | Reprice | Fish Pie | Low | 78.04 | 5,233 | Finance/Pricing | Move worst SKU 85g from 37.7% to 65% GM | `Bakery recipes   melto 2026.xlsx`; calculated from scorecard source cells |
| 24 | Reformulate | Banh Mi | Medium | 239.39 | 5,042 | Finance/Pricing | Target 65% GM on worst SKU 500g; current GM 23.1% | `Bakery recipes   melto 2026.xlsx`; calculated from scorecard source cells |
| 25 | Reprice | Pain au lait | Low | 33.22 | 4,997 | Finance/Pricing | Move worst SKU 136g from 57.2% to 65% GM | `Bakery recipes   melto 2026.xlsx`; calculated from scorecard source cells |
| 26 | Reformulate | baguette | Medium | 95.41 | 4,718 | Finance/Pricing | Target 65% GM on worst SKU 200g; current GM 31.6% | `Bakery recipes   melto 2026.xlsx`; calculated from scorecard source cells |
| 27 | Reprice | NGALA BREAD | Low | 25.52 | 4,375 | Finance/Pricing | Move worst SKU 90g from 56.1% to 65% GM | `Bakery recipes   melto 2026.xlsx`; calculated from scorecard source cells |
| 28 | Reformulate | Short bread | Medium | 47.09 | 4,134 | Finance/Pricing | Target 65% GM on worst SKU 45g; current GM 32.0% | `Bakery recipes   melto 2026.xlsx`; calculated from scorecard source cells |
| 29 | Reprice | Delice | Low | 422.29 | 4,093 | Finance/Pricing | Move worst SKU 700g from 50.2% to 65% GM | `Bakery recipes   melto 2026.xlsx`; calculated from scorecard source cells |
| 30 | Reprice | Okinawa | Low | 36.95 | 3,418 | Finance/Pricing | Move worst SKU 80g from 52.1% to 65% GM | `Bakery recipes   melto 2026.xlsx`; calculated from scorecard source cells |
| 31 | Reprice | buns new look | Low | 19.63 | 2,039 | Finance/Pricing | Move worst SKU 95g from 58.1% to 65% GM | `Bakery recipes   melto 2026.xlsx`; calculated from scorecard source cells |
| 32 | Reprice | Pancake | Low | 7.78 | 1,022 | Finance/Pricing | Move worst SKU 60g from 62.3% to 65% GM | `Bakery recipes   melto 2026.xlsx`; calculated from scorecard source cells |
| 33 | Renegotiate ingredient | New bread | Medium | 2.35 | 630.00 | Purchasing | Top-2 ingredients are 83.4% of base cost | `Bakery recipes   melto 2026.xlsx`; calculated from scorecard source cells |
| 34 | Renegotiate ingredient | Sugar Balls | Medium | 1.98 | 420.00 | Purchasing | Top-2 ingredients are 76.1% of base cost | `Bakery recipes   melto 2026.xlsx`; calculated from scorecard source cells |
| 35 | Reformulate | New bageutte | Medium | 317.95 | 382.82 | Finance/Pricing | Target 65% GM on worst SKU 500g; current GM 9.4% | `Bakery recipes   melto 2026.xlsx`; calculated from scorecard source cells |
| 36 | Renegotiate ingredient | Chinchin | Medium | 1.19 | 160.00 | Purchasing | Top-2 ingredients are 70.0% of base cost | `Bakery recipes   melto 2026.xlsx`; calculated from scorecard source cells |
| 37 | Reprice | Croissant | Low | 2.93 | 101.56 | Finance/Pricing | Move worst SKU 190g from 64.6% to 65% GM | `Bakery recipes   melto 2026.xlsx`; calculated from scorecard source cells |

### Top 5 Quick Wins This Week
| Quick win | Action | Recipe | Projected $ lift/base batch | Why now | Source |
|---:|---|---|---:|---|---|
| 1 | Reformulate | gateau | 45,388 | Target 65% GM on worst SKU 900g; current GM 29.1% | `Bakery recipes   melto 2026.xlsx`; calculated from scorecard source cells |
| 2 | Reprice | Best Chinchin | 33,097 | Move worst SKU 500g from 55.4% to 65% GM | `Bakery recipes   melto 2026.xlsx`; calculated from scorecard source cells |
| 3 | Reprice | Universal bread | 23,478 | Move worst SKU 90g from 50.3% to 65% GM | `Bakery recipes   melto 2026.xlsx`; calculated from scorecard source cells |
| 4 | Reprice | Kouatchoua gato | 22,341 | Move worst SKU 90g from 51.1% to 65% GM | `Bakery recipes   melto 2026.xlsx`; calculated from scorecard source cells |
| 5 | Resize portion | professinal Buns | 14,882 | Current price would need >50% lift for 65% GM on 95g SKU | `Bakery recipes   melto 2026.xlsx`; calculated from scorecard source cells |

## Data Gaps & Assumptions
| Type | Item | Impact | Fix required |
|---|---|---|---|
| ⚠️ assumption | Currency is the workbook native currency; no ISO currency label appears in source. | All $/unit and $/batch lifts use workbook currency units. | Add explicit currency and tax treatment. |
| ⚠️ assumption | Base batch uses the first quantity/cost pair under each recipe `item` table. | Scaled batch formulas in workbook are inconsistent, so this keeps calculations traceable. | Add a selected-batch flag per recipe. |
| ⚠️ assumption | Contribution margin equals gross margin because variable labor, packaging, delivery, commissions, and overhead are missing. | Contribution margin is overstated wherever those costs exist. | Add labor minutes, loaded labor rate, packaging/unit, and variable overhead/unit. |
| ⚠️ assumption | Reprice recommendations target 65% gross margin; action lift assumes one full theoretical base batch sells at the listed price/weight and demand does not change. | Ranked $ impact is per batch, not per month/year. | Add SKU sales volume, days produced/month, and demand elasticity history. |
| ⚠️ assumption | Renegotiation impact assumes 10% lower cost on the top ingredient only. | Actual savings depend on supplier contracts and order volume. | Add supplier, MOQ, contract price, and purchase history. |
| Missing field | Labor minutes and loaded labor rate absent on every recipe. | Full COGS and hidden labor bottlenecks cannot be quantified. | Add labor minutes by process step and hourly loaded wage. |
| Missing field | Packaging cost absent on every recipe. | COGS/unit understated, especially small-unit snacks. | Add packaging SKU and cost/unit. |
| Missing field | Overhead allocation absent on every recipe. | Total COGS, contribution margin, and fixed-cost break-even are incomplete. | Add overhead allocation method per batch or per labor hour. |
| Missing field | Actual yield, waste, and shrinkage logs absent. | Yield variance and true shrink-adjusted margin cannot be calculated. | Add theoretical yield, actual good units, scrap/rework, and reason codes per batch. |
| Missing field | Daily fixed cost and daily production/sales volume absent. | Daily break-even cannot be calculated without guessing. | Add rent/utilities/salaried labor/day and units sold/day by SKU. |
| Missing/stale risk | Raw material cost sheet has no effective date per item. | Cost freshness cannot be tested even though file modified date is current. | Add last purchase date, supplier, invoice number, and unit of measure. |
| Missing raw-cost data | cabbage, Milk tantalizer, vanilla, colorant | Recipes using these items are partially unauditable if referenced. | Complete cost and package-weight cells in ` COST rRAW MATERIAL`. |
| Data hygiene | Raw material sheet contains non-operational credential/payment-looking text that was excluded from analysis. | Confidential data risk and audit noise. | Remove secrets/payment strings from the workbook. |
| Formula errors | BUNS SPECIAL!E23=#REF!, BUNS SPECIAL!F23=#REF!, BUNS SPECIAL!G23=#REF!, BUNS SPECIAL!H23=#REF!, buns new look!F24=#REF!, buns new look!H24=#REF!, buns new look!F25=#REF!, buns new look!H25=#REF!, Donuts!H20=#REF!, Donuts!L20=#REF!, New bread!F24=#REF!, New bread!H24=#REF! | Workbook profit rows are unreliable where `#REF!` appears. | Repair broken formula references before next audit. |

## Field-Level Flags Applied to Every Recipe
| Field | Status |
|---|---|
| Ingredient cost | Present for parsed recipe rows; source cells cited in each deep dive. |
| Batch size / theoretical mass | Present as ingredient quantity totals from parsed recipe rows; source cells cited in each deep dive. |
| Sale price | Present where price/weight rows exist; missing rows are explicitly flagged. |
| Labor minutes | Missing. |
| Loaded labor rate | Missing. |
| Packaging cost | Missing. |
| Overhead allocation | Missing. |
| Actual yield | Missing. |
| Waste / shrinkage | Missing. |
