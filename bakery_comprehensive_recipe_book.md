# Melto Bakery Comprehensive Recipe Book and Profit Playbook

## Source Register
| Status | Source | Modified | Role |
|---|---|---:|---|
| Ingested | `E:\retail management systems\Bakery recipes   melto 2026.xlsx` | 2026-05-31T10:18:59 | Recipe/BOM sheets, raw ingredient costs, selling prices, portion weights, cached formulas. |
| Excluded | `E:\retail management systems\~$Bakery recipes   melto 2026.xlsx` | 2026-03-07T15:29:11 | Excel temporary lock file; not a business-data source. |
| Benchmark | [KitchenCost recipe-costing guide](https://kitchencost.app/en/blog/recipe-costing/) | current web reference checked 2026-05-31 | Recipe costing formulas, cost-per-serving, menu price = cost / target food cost, and the warning that food cost excludes labor/overhead. |
| Benchmark | [Sage restaurant prime-cost benchmark](https://www.sage.com/en-us/blog/restaurant-prime-costs/) | current web reference checked 2026-05-31 | Prime cost, food cost, and labor cost benchmark ranges for operating context. |
| Benchmark | [RestaurantOwner prime-cost reference](https://www.restaurantowner.com/prime.pdf) | current web reference checked 2026-05-31 | Prime cost threshold context and why food cost alone is not enough. |

## How To Use This Book
- Treat workbook cells as source-of-truth for ingredient quantities, costs, prices, and portion weights.
- Treat any method, benchmark, target price, and profit action as a draft operating control until validated by production tests.
- Target economics in this book use 35% ingredient food cost / 65% ingredient gross margin because labor, packaging, overhead, and waste are not in the workbook.
- Contribution margin currently equals ingredient gross profit because variable labor, packaging, and overhead are missing.
- Break-even units are ingredient-cost break-even per base batch only; daily break-even needs fixed costs and daily volume.

## Portfolio Summary
| Metric | Result | Source |
|---|---:|---|
| Recipe/BOM sheets parsed | 37 | Workbook sheet list in `Bakery recipes   melto 2026.xlsx` |
| Saleable SKU/portion rows parsed | 100 | Price/weight tables in recipe sheets |
| Red margin SKUs below 50% GM | 33 | Calculated from ingredient COGS and sale price cells |
| Yellow margin SKUs at 50-65% GM | 49 | Calculated from ingredient COGS and sale price cells |
| Green margin SKUs at or above 65% GM | 18 | Calculated from ingredient COGS and sale price cells |
| Recipes with top-2 ingredient concentration above 60% | 30 | Ingredient cost rows in recipe sheets |
| Cached workbook formula errors found | 18 | Workbook cached cell values |

## Master Profitability Matrix
| Recipe / SKU | Category | Price | Portion | Ingredient COGS | GM % | Food cost % | Target price @35% FC | Gap | Max weight at current price | Action | Source |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| New bageutte 500g | bread | 200.00 | 500g | 181.28 | 🔴 9.4% | 90.6% | 517.95 | 317.95 | 193.07g | Reformulate + reprice | `New bageutte!B18`, `New bageutte!C18` + base ingredient rows |
| Banh Mi 500g | bread | 200.00 | 500g | 153.79 | 🔴 23.1% | 76.9% | 439.39 | 239.39 | 227.59g | Reformulate + reprice | `Banh Mi!B18`, `Banh Mi!C18` + base ingredient rows |
| gateau 900g | cake/gateau | 1,000 | 900g | 708.51 | 🔴 29.1% | 70.9% | 2,024 | 1,024 | 444.60g | Reformulate + reprice | `gateau!B24`, `gateau!C24` + base ingredient rows |
| gateau 90g | cake/gateau | 100.00 | 90g | 70.85 | 🔴 29.1% | 70.9% | 202.43 | 102.43 | 44.46g | Reformulate + reprice | `gateau!B22`, `gateau!C22` + base ingredient rows |
| gateau 90g | cake/gateau | 100.00 | 90g | 70.85 | 🔴 29.1% | 70.9% | 202.43 | 102.43 | 44.46g | Reformulate + reprice | `gateau!B23`, `gateau!C23` + base ingredient rows |
| professinal Buns 95g | buns | 100.00 | 95g | 70.59 | 🔴 29.4% | 70.6% | 201.67 | 101.67 | 47.11g | Resize portion + reprice | `professinal Buns!B23`, `professinal Buns!C23` + base ingredient rows |
| professinal Buns 140g | buns | 150.00 | 140g | 104.02 | 🔴 30.7% | 69.3% | 297.20 | 147.20 | 70.66g | Resize portion + reprice | `professinal Buns!B24`, `professinal Buns!C24` + base ingredient rows |
| Melto 45g | biscuit/sweet | 50.00 | 45g | 34.66 | 🔴 30.7% | 69.3% | 99.03 | 49.03 | 22.72g | Reformulate + reprice | `Melto!B17`, `Melto!C17` + base ingredient rows |
| baguette 200g | bread | 100.00 | 200g | 68.39 | 🔴 31.6% | 68.4% | 195.41 | 95.41 | 102.35g | Reformulate + reprice | `baguette!B17`, `baguette!C17` + base ingredient rows |
| Short bread 45g | biscuit/sweet | 50.00 | 45g | 33.98 | 🔴 32.0% | 68.0% | 97.09 | 47.09 | 23.17g | Reformulate + reprice | `Short bread!B18`, `Short bread!C18` + base ingredient rows |
| Melto1 45g | biscuit/sweet | 50.00 | 45g | 33.91 | 🔴 32.2% | 67.8% | 96.89 | 46.89 | 23.22g | Reformulate + reprice | `Melto1!B17`, `Melto1!C17` + base ingredient rows |
| Brioche Professionel 800g | bread | 1,000 | 800g | 654.93 | 🔴 34.5% | 65.5% | 1,871 | 871.24 | 427.52g | Resize portion + reprice | `Brioche Professionel!B21`, `Brioche Professionel!C21` + base ingredient rows |
| gateau 81g | cake/gateau | 100.00 | 81g | 63.77 | 🔴 36.2% | 63.8% | 182.19 | 82.19 | 44.46g | Reformulate + reprice | `gateau!B21`, `gateau!C21` + base ingredient rows |
| choko bread 100g | bread | 100.00 | 100g | 63.48 | 🔴 36.5% | 63.5% | 181.37 | 81.37 | 55.14g | Reprice | `choko bread!B20`, `choko bread!C20` + base ingredient rows |
| Fish Pie 85g | pastry/savory | 100.00 | 85g | 62.31 | 🔴 37.7% | 62.3% | 178.04 | 78.04 | 47.74g | Reprice | `Fish Pie!B22`, `Fish Pie!C22` + base ingredient rows |
| Danisa biscuits 850g | biscuit/sweet | 1,000 | 850g | 619.14 | 🔴 38.1% | 61.9% | 1,769 | 768.97 | 480.51g | Reprice | `Danisa biscuits!B23`, `Danisa biscuits!C23` + base ingredient rows |
| Brioche Professionel 220g | bread | 300.00 | 220g | 180.11 | 🔴 40.0% | 60.0% | 514.59 | 214.59 | 128.26g | Resize portion + reprice | `Brioche Professionel!B20`, `Brioche Professionel!C20` + base ingredient rows |
| professinal Buns 800g | buns | 1,000 | 800g | 594.41 | 🔴 40.6% | 59.4% | 1,698 | 698.31 | 471.06g | Resize portion + reprice | `professinal Buns!B25`, `professinal Buns!C25` + base ingredient rows |
| Short bread 38g | biscuit/sweet | 50.00 | 38g | 28.70 | 🔴 42.6% | 57.4% | 81.99 | 31.99 | 23.17g | Reformulate + reprice | `Short bread!B17`, `Short bread!C17` + base ingredient rows |
| Brioche Professionel 70g | bread | 100.00 | 70g | 57.31 | 🔴 42.7% | 57.3% | 163.73 | 63.73 | 42.75g | Resize portion + reprice | `Brioche Professionel!B19`, `Brioche Professionel!C19` + base ingredient rows |
| choko bread 90g | bread | 100.00 | 90g | 57.13 | 🔴 42.9% | 57.1% | 163.23 | 63.23 | 55.14g | Reprice | `choko bread!B22`, `choko bread!C22` + base ingredient rows |
| cake marbre 50g | cake/gateau | 100.00 | 50g | 56.58 | 🔴 43.4% | 56.6% | 161.66 | 61.66 | 30.93g | Reprice | `cake marbre!B21`, `cake marbre!C21` + base ingredient rows |
| Sheet3 144g | other | 125.00 | 144g | 68.53 | 🔴 45.2% | 54.8% | 195.81 | 70.81 | 91.93g | Reprice | `Sheet3!B21`, `Sheet3!C21` + base ingredient rows |
| Ice Cream 45g | ice cream | 50.00 | 45g | 27.17 | 🔴 45.7% | 54.3% | 77.64 | 27.64 | 28.98g | Reprice | `Ice Cream!B15`, `Ice Cream!C15` + base ingredient rows |
| YUMMY BREAD 144g | bread | 125.00 | 144g | 66.56 | 🔴 46.7% | 53.3% | 190.18 | 65.18 | 94.65g | Reprice | `YUMMY BREAD!B21`, `YUMMY BREAD!C21` + base ingredient rows |
| BUNS SPECIAL 800g | buns | 1,000 | 800g | 529.12 | 🔴 47.1% | 52.9% | 1,512 | 511.76 | 529.18g | Reprice | `BUNS SPECIAL!B20`, `BUNS SPECIAL!C20` + base ingredient rows |
| Melto1 35g | biscuit/sweet | 50.00 | 35g | 26.38 | 🔴 47.2% | 52.8% | 75.36 | 25.36 | 23.22g | Reformulate + reprice | `Melto1!B16`, `Melto1!C16` + base ingredient rows |
| Melto 34g | biscuit/sweet | 50.00 | 34g | 26.19 | 🔴 47.6% | 52.4% | 74.82 | 24.82 | 22.72g | Reformulate + reprice | `Melto!B16`, `Melto!C16` + base ingredient rows |
| CAKE NOW 60g | cake/gateau | 100.00 | 60g | 51.87 | 🔴 48.1% | 51.9% | 148.20 | 48.20 | 40.49g | Reprice | `CAKE NOW!B18`, `CAKE NOW!C18` + base ingredient rows |
| NEW BRIOCHE 82g | bread | 100.00 | 82g | 51.63 | 🔴 48.4% | 51.6% | 147.52 | 47.52 | 55.59g | Reprice | `NEW BRIOCHE!B21`, `NEW BRIOCHE!C21` + base ingredient rows |
| brioche 82g | bread | 100.00 | 82g | 51.18 | 🔴 48.8% | 51.2% | 146.24 | 46.24 | 56.07g | Reprice | `brioche!B21`, `brioche!C21` + base ingredient rows |
| Danisa biscuits 140g | biscuit/sweet | 200.00 | 140g | 101.98 | 🔴 49.0% | 51.0% | 291.36 | 91.36 | 96.10g | Reprice | `Danisa biscuits!B24`, `Danisa biscuits!C24` + base ingredient rows |
| Danisa biscuits 700g | biscuit/sweet | 1,000 | 700g | 509.88 | 🔴 49.0% | 51.0% | 1,457 | 456.80 | 480.51g | Reprice | `Danisa biscuits!B25`, `Danisa biscuits!C25` + base ingredient rows |
| brioche 160g | bread | 200.00 | 160g | 99.87 | 🟡 50.1% | 49.9% | 285.35 | 85.35 | 112.14g | Reprice | `brioche!B22`, `brioche!C22` + base ingredient rows |
| Delice 700g | biscuit/sweet | 1,000 | 700g | 497.80 | 🟡 50.2% | 49.8% | 1,422 | 422.29 | 492.17g | Reprice | `Delice!B23`, `Delice!C23` + base ingredient rows |
| Delice 700g | biscuit/sweet | 1,000 | 700g | 497.80 | 🟡 50.2% | 49.8% | 1,422 | 422.29 | 492.17g | Reprice | `Delice!B25`, `Delice!C25` + base ingredient rows |
| Delice 140g | biscuit/sweet | 200.00 | 140g | 99.56 | 🟡 50.2% | 49.8% | 284.46 | 84.46 | 98.43g | Reprice | `Delice!B24`, `Delice!C24` + base ingredient rows |
| Universal bread 90g | bread | 100.00 | 90g | 49.74 | 🟡 50.3% | 49.7% | 142.12 | 42.12 | 63.33g | Reprice | `Universal bread!B21`, `Universal bread!C21` + base ingredient rows |
| Universal bread 90g | bread | 100.00 | 90g | 49.74 | 🟡 50.3% | 49.7% | 142.12 | 42.12 | 63.33g | Reprice | `Universal bread!B22`, `Universal bread!C22` + base ingredient rows |
| Universal bread 900g | bread | 1,000 | 900g | 497.41 | 🟡 50.3% | 49.7% | 1,421 | 421.16 | 633.28g | Reprice | `Universal bread!B23`, `Universal bread!C23` + base ingredient rows |
| Galette 79g | pastry/savory | 100.00 | 79g | 49.30 | 🟡 50.7% | 49.3% | 140.87 | 40.87 | 56.08g | Reprice | `Galette!B22`, `Galette!C22` + base ingredient rows |
| Kouatchoua gato 90g | cake/gateau | 100.00 | 90g | 48.88 | 🟡 51.1% | 48.9% | 139.65 | 39.65 | 64.45g | Reprice | `Kouatchoua gato!B21`, `Kouatchoua gato!C21` + base ingredient rows |
| Kouatchoua gato 90g | cake/gateau | 100.00 | 90g | 48.88 | 🟡 51.1% | 48.9% | 139.65 | 39.65 | 64.45g | Reprice | `Kouatchoua gato!B22`, `Kouatchoua gato!C22` + base ingredient rows |
| Kouatchoua gato 900g | cake/gateau | 1,000 | 900g | 488.78 | 🟡 51.1% | 48.9% | 1,397 | 396.51 | 644.46g | Reprice | `Kouatchoua gato!B23`, `Kouatchoua gato!C23` + base ingredient rows |
| Cake Prof 57g | cake/gateau | 100.00 | 57g | 48.62 | 🟡 51.4% | 48.6% | 138.90 | 38.90 | 41.04g | Reprice | `Cake Prof!B17`, `Cake Prof!C17` + base ingredient rows |
| BUNS SPECIAL 220g | buns | 300.00 | 220g | 145.51 | 🟡 51.5% | 48.5% | 415.74 | 115.74 | 158.75g | Reprice | `BUNS SPECIAL!B19`, `BUNS SPECIAL!C19` + base ingredient rows |
| Okinawa 80g | biscuit/sweet | 100.00 | 80g | 47.93 | 🟡 52.1% | 47.9% | 136.95 | 36.95 | 58.41g | Reprice | `Okinawa!B16`, `Okinawa!C16` + base ingredient rows |
| Okinawa 80g | biscuit/sweet | 100.00 | 80g | 47.93 | 🟡 52.1% | 47.9% | 136.95 | 36.95 | 58.41g | Reprice | `Okinawa!B17`, `Okinawa!C17` + base ingredient rows |
| Fish Pie 65g | pastry/savory | 100.00 | 65g | 47.65 | 🟡 52.3% | 47.7% | 136.15 | 36.15 | 47.74g | Reprice | `Fish Pie!B23`, `Fish Pie!C23` + base ingredient rows |
| Sheet3 500g | other | 500.00 | 500g | 237.96 | 🟡 52.4% | 47.6% | 679.89 | 179.89 | 367.71g | Reprice | `Sheet3!B22`, `Sheet3!C22` + base ingredient rows |
| New bageutte 65g | bread | 50.00 | 65g | 23.57 | 🟡 52.9% | 47.1% | 67.33 | 17.33 | 48.27g | Reformulate + reprice | `New bageutte!B19`, `New bageutte!C19` + base ingredient rows |
| choko bread 220g | bread | 300.00 | 220g | 139.65 | 🟡 53.4% | 46.6% | 399.01 | 99.01 | 165.41g | Reprice | `choko bread!B21`, `choko bread!C21` + base ingredient rows |
| cake marbre 60g | cake/gateau | 150.00 | 60g | 67.90 | 🟡 54.7% | 45.3% | 193.99 | 43.99 | 46.39g | Reprice | `cake marbre!B20`, `cake marbre!C20` + base ingredient rows |
| Universal bread 81.40g | bread | 100.00 | 81.40g | 44.99 | 🟡 55.0% | 45.0% | 128.54 | 28.54 | 63.33g | Reprice | `Universal bread!B20`, `Universal bread!C20` + base ingredient rows |
| Best Chinchin 500g | fried/snack | 1,000 | 500g | 445.97 | 🟡 55.4% | 44.6% | 1,274 | 274.21 | 392.40g | Reprice | `Best Chinchin!B21`, `Best Chinchin!C21` + base ingredient rows |
| baguette 65g | bread | 50.00 | 65g | 22.23 | 🟡 55.5% | 44.5% | 63.51 | 13.51 | 51.18g | Reformulate + reprice | `baguette!B18`, `baguette!C18` + base ingredient rows |
| YUMMY BREAD 144g | bread | 150.00 | 144g | 66.56 | 🟡 55.6% | 44.4% | 190.18 | 40.18 | 113.58g | Reprice | `YUMMY BREAD!B20`, `YUMMY BREAD!C20` + base ingredient rows |
| Kouatchoua gato 81.40g | cake/gateau | 100.00 | 81.40g | 44.21 | 🟡 55.8% | 44.2% | 126.31 | 26.31 | 64.45g | Reprice | `Kouatchoua gato!B20`, `Kouatchoua gato!C20` + base ingredient rows |
| Sheet3 139g | other | 150.00 | 139g | 66.15 | 🟡 55.9% | 44.1% | 189.01 | 39.01 | 110.31g | Reprice | `Sheet3!B23`, `Sheet3!C23` + base ingredient rows |
| NEW BRIOCHE 140g | bread | 200.00 | 140g | 88.15 | 🟡 55.9% | 44.1% | 251.86 | 51.86 | 111.17g | Reprice | `NEW BRIOCHE!B22`, `NEW BRIOCHE!C22` + base ingredient rows |
| NEW BRIOCHE 700g | bread | 1,000 | 700g | 440.76 | 🟡 55.9% | 44.1% | 1,259 | 259.32 | 555.85g | Reprice | `NEW BRIOCHE!B23`, `NEW BRIOCHE!C23` + base ingredient rows |
| NGALA BREAD 90g | bread | 100.00 | 90g | 43.93 | 🟡 56.1% | 43.9% | 125.52 | 25.52 | 71.70g | Reprice | `NGALA BREAD!C20`, `NGALA BREAD!D20` + base ingredient rows |
| brioche 700g | bread | 1,000 | 700g | 436.94 | 🟡 56.3% | 43.7% | 1,248 | 248.41 | 560.71g | Reprice | `brioche!B23`, `brioche!C23` + base ingredient rows |
| Galette 700g | pastry/savory | 1,000 | 700g | 436.86 | 🟡 56.3% | 43.7% | 1,248 | 248.18 | 560.81g | Reprice | `Galette!B24`, `Galette!C24` + base ingredient rows |
| Galette 140g | pastry/savory | 200.00 | 140g | 87.37 | 🟡 56.3% | 43.7% | 249.64 | 49.64 | 112.16g | Reprice | `Galette!B23`, `Galette!C23` + base ingredient rows |
| YUMMY BREAD 139g | bread | 150.00 | 139g | 64.25 | 🟡 57.2% | 42.8% | 183.58 | 33.58 | 113.58g | Reprice | `YUMMY BREAD!B22`, `YUMMY BREAD!C22` + base ingredient rows |
| Pain au lait 136g | bread | 150.00 | 136g | 64.13 | 🟡 57.2% | 42.8% | 183.22 | 33.22 | 111.34g | Reprice | `Pain au lait!B23`, `Pain au lait!C23` + base ingredient rows |
| Zebree 190g | biscuit/sweet | 250.00 | 190g | 106.85 | 🟡 57.3% | 42.7% | 305.27 | 55.27 | 155.60g | Reprice | `Zebree!B23`, `Zebree!C23` + base ingredient rows |
| Donuts 40g | fried/snack | 50.00 | 40g | 21.27 | 🟡 57.5% | 42.5% | 60.77 | 10.77 | 32.91g | Reprice | `Donuts!B18`, `Donuts!C18` + base ingredient rows |
| Ice Cream 70g | ice cream | 100.00 | 70g | 42.27 | 🟡 57.7% | 42.3% | 120.77 | 20.77 | 57.96g | Reprice | `Ice Cream!B14`, `Ice Cream!C14` + base ingredient rows |
| buns new look 95g | buns | 100.00 | 95g | 41.87 | 🟡 58.1% | 41.9% | 119.63 | 19.63 | 79.41g | Reprice | `buns new look!C20`, `buns new look!D20` + base ingredient rows |
| Zebree 370g | biscuit/sweet | 500.00 | 370g | 208.07 | 🟡 58.4% | 41.6% | 594.48 | 94.48 | 311.20g | Reprice | `Zebree!B22`, `Zebree!C22` + base ingredient rows |
| Best Chinchin 45g | fried/snack | 100.00 | 45g | 40.14 | 🟡 59.9% | 40.1% | 114.68 | 14.68 | 39.24g | Reprice | `Best Chinchin!B19`, `Best Chinchin!C19` + base ingredient rows |
| Best Chinchin 225g | fried/snack | 500.00 | 225g | 200.69 | 🟡 59.9% | 40.1% | 573.40 | 73.40 | 196.20g | Reprice | `Best Chinchin!B20`, `Best Chinchin!C20` + base ingredient rows |
| Banh Mi 65g | bread | 50.00 | 65g | 19.99 | 🟡 60.0% | 40.0% | 57.12 | 7.12 | 56.90g | Reformulate + reprice | `Banh Mi!B19`, `Banh Mi!C19` + base ingredient rows |
| Zebree 700g | biscuit/sweet | 1,000 | 700g | 393.64 | 🟡 60.6% | 39.4% | 1,125 | 124.69 | 622.39g | Reprice | `Zebree!B24`, `Zebree!C24` + base ingredient rows |
| Cake Prof 230g | cake/gateau | 500.00 | 230g | 196.17 | 🟡 60.8% | 39.2% | 560.48 | 60.48 | 205.18g | Reprice | `Cake Prof!B16`, `Cake Prof!C16` + base ingredient rows |
| CAKE NOW 220g | cake/gateau | 500.00 | 220g | 190.19 | 🟡 62.0% | 38.0% | 543.41 | 43.41 | 202.43g | Reprice | `CAKE NOW!B17`, `CAKE NOW!C17` + base ingredient rows |
| Pancake 60g | cake/gateau | 100.00 | 60g | 37.72 | 🟡 62.3% | 37.7% | 107.78 | 7.78 | 55.67g | Reprice | `Pancake!B19`, `Pancake!C19` + base ingredient rows |
| Pain au lait 800g | bread | 1,000 | 800g | 377.21 | 🟡 62.3% | 37.7% | 1,078 | 77.75 | 742.28g | Reprice | `Pain au lait!B25`, `Pain au lait!C25` + base ingredient rows |
| BUNS SPECIAL 55g | buns | 100.00 | 55g | 36.38 | 🟡 63.6% | 36.4% | 103.93 | 3.93 | 52.92g | Reprice | `BUNS SPECIAL!B18`, `BUNS SPECIAL!C18` + base ingredient rows |
| Croissant 190g | pastry/savory | 250.00 | 190g | 88.52 | 🟡 64.6% | 35.4% | 252.93 | 2.93 | 187.80g | Reprice | `Croissant!B19`, `Croissant!C19` + base ingredient rows |
| Sugar Balls 80g | fried/snack | 100.00 | 80g | 33.76 | 🟢 66.2% | 33.8% | 96.46 | -3.54 | 82.94g | Renegotiate ingredient | `Sugar Balls!B18`, `Sugar Balls!C18` + base ingredient rows |
| Sugar Balls 80g | fried/snack | 100.00 | 80g | 33.76 | 🟢 66.2% | 33.8% | 96.46 | -3.54 | 82.94g | Renegotiate ingredient | `Sugar Balls!B19`, `Sugar Balls!C19` + base ingredient rows |
| Chinchin 45g | fried/snack | 100.00 | 45g | 32.99 | 🟢 67.0% | 33.0% | 94.26 | -5.74 | 47.74g | Renegotiate ingredient | `Chinchin!B19`, `Chinchin!C19` + base ingredient rows |
| New bageutte 90g | bread | 100.00 | 90g | 32.63 | 🟢 67.4% | 32.6% | 93.23 | -6.77 | 96.53g | Reformulate + reprice | `New bageutte!B17`, `New bageutte!C17` + base ingredient rows |
| Croissant 700g | pastry/savory | 1,000 | 700g | 326.14 | 🟢 67.4% | 32.6% | 931.84 | -68.16 | 751.20g | Reprice | `Croissant!B20`, `Croissant!C20` + base ingredient rows |
| Chinchin 220g | fried/snack | 500.00 | 220g | 161.30 | 🟢 67.7% | 32.3% | 460.85 | -39.15 | 238.69g | Renegotiate ingredient | `Chinchin!B21`, `Chinchin!C21` + base ingredient rows |
| New bread 90g | bread | 100.00 | 90g | 31.79 | 🟢 68.2% | 31.8% | 90.83 | -9.17 | 99.08g | Renegotiate ingredient | `New bread!C20`, `New bread!D20` + base ingredient rows |
| Pancake 50g | cake/gateau | 100.00 | 50g | 31.44 | 🟢 68.6% | 31.4% | 89.82 | -10.18 | 55.67g | Reprice | `Pancake!B20`, `Pancake!C20` + base ingredient rows |
| Pain au lait 200g | bread | 300.00 | 200g | 94.30 | 🟢 68.6% | 31.4% | 269.44 | -30.56 | 222.69g | Reprice | `Pain au lait!B24`, `Pain au lait!C24` + base ingredient rows |
| baguette 90g | bread | 100.00 | 90g | 30.78 | 🟢 69.2% | 30.8% | 87.93 | -12.07 | 102.35g | Reformulate + reprice | `baguette!B16`, `baguette!C16` + base ingredient rows |
| Chinchin 40g | fried/snack | 100.00 | 40g | 29.33 | 🟢 70.7% | 29.3% | 83.79 | -16.21 | 47.74g | Renegotiate ingredient | `Chinchin!B20`, `Chinchin!C20` + base ingredient rows |
| Banh Mi 90g | bread | 100.00 | 90g | 27.68 | 🟢 72.3% | 27.7% | 79.09 | -20.91 | 113.79g | Reformulate + reprice | `Banh Mi!B17`, `Banh Mi!C17` + base ingredient rows |
| Donuts 22g | fried/snack | 50.00 | 22g | 11.70 | 🟢 76.6% | 23.4% | 33.43 | -16.57 | 32.91g | Reprice | `Donuts!B19`, `Donuts!C19` + base ingredient rows |
| Fish Pie 150g | pastry/savory | 500.00 | 150g | 109.96 | 🟢 78.0% | 22.0% | 314.18 | -185.82 | 238.71g | Reprice | `Fish Pie!B24`, `Fish Pie!C24` + base ingredient rows |
| Croissant 45g | pastry/savory | 100.00 | 45g | 20.97 | 🟢 79.0% | 21.0% | 59.90 | -40.10 | 75.12g | Reprice | `Croissant!B18`, `Croissant!C18` + base ingredient rows |
| Okinawa 150g | biscuit/sweet | 500.00 | 150g | 89.88 | 🟢 82.0% | 18.0% | 256.79 | -243.21 | 292.07g | Reprice | `Okinawa!B18`, `Okinawa!C18` + base ingredient rows |
| Donuts 150g | fried/snack | 500.00 | 150g | 79.77 | 🟢 84.0% | 16.0% | 227.90 | -272.10 | 329.09g | Reprice | `Donuts!B20`, `Donuts!C20` + base ingredient rows |
| Sugar Balls 150g | fried/snack | 500.00 | 150g | 63.30 | 🟢 87.3% | 12.7% | 180.86 | -319.14 | 414.69g | Renegotiate ingredient | `Sugar Balls!B20`, `Sugar Balls!C20` + base ingredient rows |

## Raw Material Cost Index
| Ingredient | Package cost | Package weight | Unit cost | Source |
|---|---:|---:|---:|---|
| Flour | 21,000 | 50,000 | 0.42 | ` COST rRAW MATERIAL!B4:D4` |
| Sugar | 32,000 | 50,000 | 0.64 | ` COST rRAW MATERIAL!B5:D5` |
| salt | 3,700 | 18,000 | 0.21 | ` COST rRAW MATERIAL!B6:D6` |
| butter | 12,000 | 9,500 | 1.26 | ` COST rRAW MATERIAL!B7:D7` |
| oil | 30,500 | 25,000 | 1.22 | ` COST rRAW MATERIAL!B8:D8` |
| yeast | 1,400 | 500 | 2.80 | ` COST rRAW MATERIAL!B9:D9` |
| baking powder | 1,300 | 500 | 2.60 | ` COST rRAW MATERIAL!B10:D10` |
| egg carton | 25,000 | 18,000 | 1.39 | ` COST rRAW MATERIAL!B11:D11` |
| improver | 1,400 | 500 | 2.80 | ` COST rRAW MATERIAL!B12:D12` |
| egg tray | 2,000 | 1,500 | 1.33 | ` COST rRAW MATERIAL!B13:D13` |
| NUTMEG | 9,000 | 1,000 | 9.00 | ` COST rRAW MATERIAL!B14:D14` |
| milk | 1,170 | 1,000 | 1.17 | ` COST rRAW MATERIAL!B15:D15` |
| water | 1.00 | 10,000 | 0.00 | ` COST rRAW MATERIAL!B16:D16` |
| powder milk | 80,000 | 25,000 | 3.20 | ` COST rRAW MATERIAL!B17:D17` |
| Milk tantalizer | 45,000 | 4,000 | 11.25 | ` COST rRAW MATERIAL!B18:D18` |
| EDC | 3,000 | 1,000 | 3.00 | ` COST rRAW MATERIAL!B19:D19` |
| BUTTER 2 | 12,000 | 9,500 | 1.26 | ` COST rRAW MATERIAL!B20:D20` |
| Chocolate | 17,000 | 9,500 | 1.79 | ` COST rRAW MATERIAL!B21:D21` |
| fish | 24,000 | 20,000 | 1.20 | ` COST rRAW MATERIAL!B22:D22` |
| carrots | 600.00 | 700 | 0.86 | ` COST rRAW MATERIAL!B23:D23` |
| Green beans | 200.00 | 1,000 | 0.20 | ` COST rRAW MATERIAL!B24:D24` |
| peppers | 200.00 | 500 | 0.40 | ` COST rRAW MATERIAL!B25:D25` |
| onions | 100.00 | 50 | 2.00 | ` COST rRAW MATERIAL!B26:D26` |
| irish | 4,000 | 7,000 | 0.57 | ` COST rRAW MATERIAL!B27:D27` |
| honey | 10,000 | 8,000 | 1.25 | ` COST rRAW MATERIAL!B29:D29` |
| Icing Sugar | 1,100 | 500 | 2.20 | ` COST rRAW MATERIAL!B30:D30` |
| stabilizer | 3,200 | 250 | 12.80 | ` COST rRAW MATERIAL!B32:D32` |
| flour Bir | 20,000 | 50,000 | 0.40 | ` COST rRAW MATERIAL!B36:D36` |

## Purchasing Consolidation Priorities
| Ingredient group | Recipes using it | Base-batch spend | Base-batch quantity | Recommended control |
|---|---:|---:|---:|---|
| flour | 36 | 133,631 | 317,550 | Bid/renegotiate this week |
| oil | 11 | 63,503 | 39,562 | Bid/renegotiate this week |
| butter | 30 | 47,585 | 37,500 | Bid/renegotiate this week |
| egg | 31 | 41,489 | 25,906 | Bid/renegotiate this week |
| sugar | 35 | 22,131 | 32,255 | Bid/renegotiate this week |
| milk | 23 | 20,719 | 15,940 | Bid/renegotiate this week |
| improver | 30 | 7,624 | 2,845 | Bid/renegotiate this week |
| yeast | 25 | 6,921 | 2,476 | Bid/renegotiate this week |
| chocolate | 4 | 6,084 | 3,400 | Monitor and standardize pack size |
| baking powder | 16 | 4,816 | 2,012 | Bid/renegotiate this week |
| powdered milk | 1 | 3,520 | 1,100 | Monitor and standardize pack size |
| nutmeg | 9 | 2,918 | 262 | Bid/renegotiate this week |
| stabilizer | 1 | 2,560 | 200 | Monitor and standardize pack size |
| others | 1 | 2,000 | 200 | Monitor and standardize pack size |
| edc | 10 | 1,434 | 550 | Bid/renegotiate this week |
| honey | 2 | 1,375 | 1,100 | Monitor and standardize pack size |
| choclate | 1 | 900.00 | 500 | Monitor and standardize pack size |
| salt | 33 | 667.67 | 3,255 | Bid/renegotiate this week |
| fish | 1 | 480.00 | 400 | Monitor and standardize pack size |
| onions | 1 | 200.00 | 100 | Monitor and standardize pack size |

## Recipe Cards
### baguette
| Field | Value | Source / note |
|---|---|---|
| Category | bread | Inferred from recipe name |
| Base batch mass | 9,890 | `baguette!D5 + baguette!D6 + baguette!D7 + baguette!D8 + baguette!D9` |
| Base ingredient cost | 3,382 | `baguette!E5 + baguette!E6 + baguette!E7 + baguette!E8 + baguette!E9` |
| Current verdict | Reformulate + reprice | Worst SKU is 31.6% GM and top-2 ingredients drive 89.4% of base cost. |
| Top-2 ingredient concentration | 89.4% | Base ingredient cost table |
| Highest-cost ingredient | flour (2,520) | `baguette!E5` |
| Missing data to complete COGS | labor minutes/rate; packaging; overhead; actual yield; waste/shrinkage; daily volume | Add these before treating total COGS as final |

#### Ingredients
| Ingredient | Qty | Ingredient cost | % of base cost | Cost-risk note | Source |
|---|---:|---:|---:|---|---|
| flour | 6,000 | 2,520 | 74.5% | High | `baguette!D5`, `baguette!E5` |
| improver | 180 | 504.00 | 14.9% | Normal | `baguette!D9`, `baguette!E9` |
| yeast | 120 | 336.00 | 9.9% | Normal | `baguette!D6`, `baguette!E6` |
| salt | 90 | 18.50 | 0.5% | Normal | `baguette!D7`, `baguette!E7` |
| water | 3,500 | 3.50 | 0.1% | Normal | `baguette!D8`, `baguette!E8` |

#### Saleable Portions and Profit Targets
| Portion | Current price | Ingredient COGS | Gross profit | GM % | Food cost % | Target price @35% FC | Price lift needed | Max weight at current price | Break-even units / base batch | Source |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 90g | 100.00 | 30.78 | 69.22 | 🟢 69.2% | 30.8% | 87.93 | -12.07 | 102.35g | 33.82 | `baguette!B16`, `baguette!C16` |
| 200g | 100.00 | 68.39 | 31.61 | 🔴 31.6% | 68.4% | 195.41 | 95.41 | 102.35g | 33.82 | `baguette!B17`, `baguette!C17` |
| 65g | 50.00 | 22.23 | 27.77 | 🟡 55.5% | 44.5% | 63.51 | 13.51 | 51.18g | 67.64 | `baguette!B18`, `baguette!C18` |

#### Ingredient Inflation Sensitivity
| Portion | Key ingredient | GM after key +10% | GM after key +25% | Profit action if spike happens | Source |
|---:|---|---:|---:|---|---|
| 90g | flour | 66.9% | 63.5% | Monitor / absorb short term | `baguette!E5`, `baguette!B16`, `baguette!C16` |
| 200g | flour | 26.5% | 18.9% | Raise price immediately | `baguette!E5`, `baguette!B17`, `baguette!C17` |
| 65g | flour | 52.2% | 47.3% | Raise price immediately | `baguette!E5`, `baguette!B18`, `baguette!C18` |

#### Standard Production Method
⚠️ assumption: method steps are professional operating templates, not sourced from the workbook. Validate with your baker before production.
1. Scale ingredients exactly from the recipe card; keep flour, yeast, salt, sugar, fat, and improver separate until mixing.
2. Mix dry ingredients, add water/liquids gradually, then develop dough until smooth and elastic.
3. Bulk ferment until dough shows visible rise; divide by target portion weight, round, rest, shape, proof, bake, cool fully, then package.

#### Profit Improvement Checklist
- Set target selling price from the table above, or resize to the listed max weight at current price.
- Record actual good units after cooling/packing and compare to theoretical yield.
- Add labor minutes by step, packaging per unit, and overhead allocation per batch.
- Review top ingredient supplier price and minimum-order quantity.
- If formula errors exist in this sheet, repair workbook formulas before relying on workbook profit rows.

### New bageutte
| Field | Value | Source / note |
|---|---|---|
| Category | bread | Inferred from recipe name |
| Base batch mass | 602 | `New bageutte!F5 + New bageutte!F6 + New bageutte!F7 + New bageutte!F8 + New bageutte!F9 + New bageutte!F10` |
| Base ingredient cost | 218.27 | `New bageutte!G5 + New bageutte!G6 + New bageutte!G7 + New bageutte!G8 + New bageutte!G9 + New bageutte!G10` |
| Current verdict | Reformulate + reprice | Worst SKU is 9.4% GM and top-2 ingredients drive 93.0% of base cost. |
| Top-2 ingredient concentration | 93.0% | Base ingredient cost table |
| Highest-cost ingredient | flour (147.00) | `New bageutte!G5` |
| Missing data to complete COGS | labor minutes/rate; packaging; overhead; actual yield; waste/shrinkage; daily volume | Add these before treating total COGS as final |

#### Ingredients
| Ingredient | Qty | Ingredient cost | % of base cost | Cost-risk note | Source |
|---|---:|---:|---:|---|---|
| flour | 350 | 147.00 | 67.3% | High | `New bageutte!F5`, `New bageutte!G5` |
| improver | 20 | 56.00 | 25.7% | Medium | `New bageutte!F10`, `New bageutte!G10` |
| sugar | 10 | 7.40 | 3.4% | Normal | `New bageutte!F7`, `New bageutte!G7` |
| yeast | 2 | 5.60 | 2.6% | Normal | `New bageutte!F6`, `New bageutte!G6` |
| salt | 10 | 2.06 | 0.9% | Normal | `New bageutte!F8`, `New bageutte!G8` |
| water | 210 | 0.21 | 0.1% | Normal | `New bageutte!F9`, `New bageutte!G9` |

#### Saleable Portions and Profit Targets
| Portion | Current price | Ingredient COGS | Gross profit | GM % | Food cost % | Target price @35% FC | Price lift needed | Max weight at current price | Break-even units / base batch | Source |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 90g | 100.00 | 32.63 | 67.37 | 🟢 67.4% | 32.6% | 93.23 | -6.77 | 96.53g | 2.18 | `New bageutte!B17`, `New bageutte!C17` |
| 500g | 200.00 | 181.28 | 18.72 | 🔴 9.4% | 90.6% | 517.95 | 317.95 | 193.07g | 1.09 | `New bageutte!B18`, `New bageutte!C18` |
| 65g | 50.00 | 23.57 | 26.43 | 🟡 52.9% | 47.1% | 67.33 | 17.33 | 48.27g | 4.37 | `New bageutte!B19`, `New bageutte!C19` |

#### Ingredient Inflation Sensitivity
| Portion | Key ingredient | GM after key +10% | GM after key +25% | Profit action if spike happens | Source |
|---:|---|---:|---:|---|---|
| 90g | flour | 65.2% | 61.9% | Monitor / absorb short term | `New bageutte!G5`, `New bageutte!B17`, `New bageutte!C17` |
| 500g | flour | 3.3% | -5.9% | Raise price immediately | `New bageutte!G5`, `New bageutte!B18`, `New bageutte!C18` |
| 65g | flour | 49.7% | 44.9% | Raise price immediately | `New bageutte!G5`, `New bageutte!B19`, `New bageutte!C19` |

#### Standard Production Method
⚠️ assumption: method steps are professional operating templates, not sourced from the workbook. Validate with your baker before production.
1. Scale ingredients exactly from the recipe card; keep flour, yeast, salt, sugar, fat, and improver separate until mixing.
2. Mix dry ingredients, add water/liquids gradually, then develop dough until smooth and elastic.
3. Bulk ferment until dough shows visible rise; divide by target portion weight, round, rest, shape, proof, bake, cool fully, then package.

#### Profit Improvement Checklist
- Set target selling price from the table above, or resize to the listed max weight at current price.
- Record actual good units after cooling/packing and compare to theoretical yield.
- Add labor minutes by step, packaging per unit, and overhead allocation per batch.
- Review top ingredient supplier price and minimum-order quantity.
- If formula errors exist in this sheet, repair workbook formulas before relying on workbook profit rows.

### Banh Mi
| Field | Value | Source / note |
|---|---|---|
| Category | bread | Inferred from recipe name |
| Base batch mass | 10,530 | `Banh Mi!F5 + Banh Mi!F6 + Banh Mi!F7 + Banh Mi!F8 + Banh Mi!F9 + Banh Mi!F10` |
| Base ingredient cost | 3,239 | `Banh Mi!G5 + Banh Mi!G6 + Banh Mi!G7 + Banh Mi!G8 + Banh Mi!G9 + Banh Mi!G10` |
| Current verdict | Reformulate + reprice | Worst SKU is 23.1% GM and top-2 ingredients drive 90.8% of base cost. |
| Top-2 ingredient concentration | 90.8% | Base ingredient cost table |
| Highest-cost ingredient | flour (2,520) | `Banh Mi!G5` |
| Missing data to complete COGS | labor minutes/rate; packaging; overhead; actual yield; waste/shrinkage; daily volume | Add these before treating total COGS as final |

#### Ingredients
| Ingredient | Qty | Ingredient cost | % of base cost | Cost-risk note | Source |
|---|---:|---:|---:|---|---|
| flour | 6,000 | 2,520 | 77.8% | High | `Banh Mi!F5`, `Banh Mi!G5` |
| improver | 150 | 420.00 | 13.0% | Normal | `Banh Mi!F10`, `Banh Mi!G10` |
| yeast | 90 | 252.00 | 7.8% | Normal | `Banh Mi!F6`, `Banh Mi!G6` |
| sugar | 45 | 33.30 | 1.0% | Normal | `Banh Mi!F7`, `Banh Mi!G7` |
| salt | 45 | 9.25 | 0.3% | Normal | `Banh Mi!F8`, `Banh Mi!G8` |
| water | 4,200 | 4.20 | 0.1% | Normal | `Banh Mi!F9`, `Banh Mi!G9` |

#### Saleable Portions and Profit Targets
| Portion | Current price | Ingredient COGS | Gross profit | GM % | Food cost % | Target price @35% FC | Price lift needed | Max weight at current price | Break-even units / base batch | Source |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 90g | 100.00 | 27.68 | 72.32 | 🟢 72.3% | 27.7% | 79.09 | -20.91 | 113.79g | 32.39 | `Banh Mi!B17`, `Banh Mi!C17` |
| 500g | 200.00 | 153.79 | 46.21 | 🔴 23.1% | 76.9% | 439.39 | 239.39 | 227.59g | 16.19 | `Banh Mi!B18`, `Banh Mi!C18` |
| 65g | 50.00 | 19.99 | 30.01 | 🟡 60.0% | 40.0% | 57.12 | 7.12 | 56.90g | 64.78 | `Banh Mi!B19`, `Banh Mi!C19` |

#### Ingredient Inflation Sensitivity
| Portion | Key ingredient | GM after key +10% | GM after key +25% | Profit action if spike happens | Source |
|---:|---|---:|---:|---|---|
| 90g | flour | 70.2% | 66.9% | Monitor / absorb short term | `Banh Mi!G5`, `Banh Mi!B17`, `Banh Mi!C17` |
| 500g | flour | 17.1% | 8.1% | Raise price immediately | `Banh Mi!G5`, `Banh Mi!B18`, `Banh Mi!C18` |
| 65g | flour | 56.9% | 52.2% | Monitor / absorb short term | `Banh Mi!G5`, `Banh Mi!B19`, `Banh Mi!C19` |

#### Standard Production Method
⚠️ assumption: method steps are professional operating templates, not sourced from the workbook. Validate with your baker before production.
1. Scale ingredients exactly from the recipe card; keep flour, yeast, salt, sugar, fat, and improver separate until mixing.
2. Mix dry ingredients, add water/liquids gradually, then develop dough until smooth and elastic.
3. Bulk ferment until dough shows visible rise; divide by target portion weight, round, rest, shape, proof, bake, cool fully, then package.

#### Profit Improvement Checklist
- Set target selling price from the table above, or resize to the listed max weight at current price.
- Record actual good units after cooling/packing and compare to theoretical yield.
- Add labor minutes by step, packaging per unit, and overhead allocation per batch.
- Review top ingredient supplier price and minimum-order quantity.
- If formula errors exist in this sheet, repair workbook formulas before relying on workbook profit rows.

### cake marbre
| Field | Value | Source / note |
|---|---|---|
| Category | cake/gateau | Inferred from recipe name |
| Base batch mass | 5,227 | `cake marbre!D5 + cake marbre!D6 + cake marbre!D7 + cake marbre!D8 + cake marbre!D9 + cake marbre!D10 + cake marbre!D11 + cake marbre!D12 + cake marbre!D13 + cake marbre!D14` |
| Base ingredient cost | 5,915 | `cake marbre!E5 + cake marbre!E6 + cake marbre!E7 + cake marbre!E8 + cake marbre!E9 + cake marbre!E10 + cake marbre!E11 + cake marbre!E12 + cake marbre!E13 + cake marbre!E14` |
| Current verdict | Reprice | Raise worst SKU to target price or reduce portion to 30.93g for 65% GM. |
| Top-2 ingredient concentration | 67.1% | Base ingredient cost table |
| Highest-cost ingredient | Butter (2,300) | `cake marbre!E11` |
| Missing data to complete COGS | labor minutes/rate; packaging; overhead; actual yield; waste/shrinkage; daily volume | Add these before treating total COGS as final |

#### Ingredients
| Ingredient | Qty | Ingredient cost | % of base cost | Cost-risk note | Source |
|---|---:|---:|---:|---|---|
| Butter | 1,000 | 2,300 | 38.9% | High | `cake marbre!D11`, `cake marbre!E11` |
| Egg | 360 | 1,667 | 28.2% | Medium | `cake marbre!D10`, `cake marbre!E10` |
| flour | 2,000 | 1,040 | 17.6% | Medium | `cake marbre!D5`, `cake marbre!E5` |
| sugar | 650 | 416.00 | 7.0% | Normal | `cake marbre!D12`, `cake marbre!E12` |
| Nut Meg | 10 | 250.00 | 4.2% | Normal | `cake marbre!D8`, `cake marbre!E8` |
| baking powder | 70 | 161.00 | 2.7% | Normal | `cake marbre!D6`, `cake marbre!E6` |
| milk | 12 | 46.00 | 0.8% | Normal | `cake marbre!D14`, `cake marbre!E14` |
| water | 1,100 | 16.50 | 0.3% | Normal | `cake marbre!D9`, `cake marbre!E9` |
| improver | 5 | 15.00 | 0.3% | Normal | `cake marbre!D13`, `cake marbre!E13` |
| salt | 20 | 3.78 | 0.1% | Normal | `cake marbre!D7`, `cake marbre!E7` |

#### Saleable Portions and Profit Targets
| Portion | Current price | Ingredient COGS | Gross profit | GM % | Food cost % | Target price @35% FC | Price lift needed | Max weight at current price | Break-even units / base batch | Source |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 60g | 150.00 | 67.90 | 82.10 | 🟡 54.7% | 45.3% | 193.99 | 43.99 | 46.39g | 39.43 | `cake marbre!B20`, `cake marbre!C20` |
| 50g | 100.00 | 56.58 | 43.42 | 🔴 43.4% | 56.6% | 161.66 | 61.66 | 30.93g | 59.15 | `cake marbre!B21`, `cake marbre!C21` |

#### Ingredient Inflation Sensitivity
| Portion | Key ingredient | GM after key +10% | GM after key +25% | Profit action if spike happens | Source |
|---:|---|---:|---:|---|---|
| 60g | Butter | 53.0% | 50.3% | Monitor / absorb short term | `cake marbre!E11`, `cake marbre!B20`, `cake marbre!C20` |
| 50g | Butter | 41.2% | 37.9% | Raise price immediately | `cake marbre!E11`, `cake marbre!B21`, `cake marbre!C21` |

#### Standard Production Method
⚠️ assumption: method steps are professional operating templates, not sourced from the workbook. Validate with your baker before production.
1. Cream fat and sugar or mix according to house cake method; add eggs/liquids slowly to avoid splitting.
2. Fold dry ingredients gently, portion by weight, bake until set, cool fully before cutting or packing.
3. Track batter weight, baked weight, trim, and final saleable pieces for yield control.

#### Profit Improvement Checklist
- Set target selling price from the table above, or resize to the listed max weight at current price.
- Record actual good units after cooling/packing and compare to theoretical yield.
- Add labor minutes by step, packaging per unit, and overhead allocation per batch.
- Review top ingredient supplier price and minimum-order quantity.
- If formula errors exist in this sheet, repair workbook formulas before relying on workbook profit rows.

### gateau
| Field | Value | Source / note |
|---|---|---|
| Category | cake/gateau | Inferred from recipe name |
| Base batch mass | 39,880 | `gateau!D5 + gateau!D6 + gateau!D7 + gateau!D8 + gateau!D9 + gateau!D10 + gateau!D11 + gateau!D12 + gateau!D13 + gateau!D14 + gateau!D15 + gateau!D16` |
| Base ingredient cost | 31,395 | `gateau!E5 + gateau!E6 + gateau!E7 + gateau!E8 + gateau!E9 + gateau!E10 + gateau!E11 + gateau!E12 + gateau!E13 + gateau!E14 + gateau!E15 + gateau!E16` |
| Current verdict | Reformulate + reprice | Worst SKU is 29.1% GM and top-2 ingredients drive 82.0% of base cost. |
| Top-2 ingredient concentration | 82.0% | Base ingredient cost table |
| Highest-cost ingredient | frying oil (15,250) | `gateau!E16` |
| Missing data to complete COGS | labor minutes/rate; packaging; overhead; actual yield; waste/shrinkage; daily volume | Add these before treating total COGS as final |

#### Ingredients
| Ingredient | Qty | Ingredient cost | % of base cost | Cost-risk note | Source |
|---|---:|---:|---:|---|---|
| frying oil | 10 | 15,250 | 48.6% | High | `gateau!D16`, `gateau!E16` |
| flour | 25,000 | 10,500 | 33.4% | High | `gateau!D5`, `gateau!E5` |
| Conc Milk | 950 | 1,170 | 3.7% | Normal | `gateau!D8`, `gateau!E8` |
| sugar | 1,600 | 1,024 | 3.3% | Normal | `gateau!D7`, `gateau!E7` |
| Butter | 1,300 | 780.00 | 2.5% | Normal | `gateau!D6`, `gateau!E6` |
| egg | 200 | 740.74 | 2.4% | Normal | `gateau!D9`, `gateau!E9` |
| baking powder | 170 | 552.50 | 1.8% | Normal | `gateau!D15`, `gateau!E15` |
| improver | 170 | 476.00 | 1.5% | Normal | `gateau!D11`, `gateau!E11` |
| yeast | 170 | 476.00 | 1.5% | Normal | `gateau!D12`, `gateau!E12` |
| Nutmeg | 40 | 360.00 | 1.1% | Normal | `gateau!D14`, `gateau!E14` |
| salt | 270 | 55.50 | 0.2% | Normal | `gateau!D10`, `gateau!E10` |
| water | 10,000 | 10.00 | 0.0% | Normal | `gateau!D13`, `gateau!E13` |

#### Saleable Portions and Profit Targets
| Portion | Current price | Ingredient COGS | Gross profit | GM % | Food cost % | Target price @35% FC | Price lift needed | Max weight at current price | Break-even units / base batch | Source |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 81g | 100.00 | 63.77 | 36.23 | 🔴 36.2% | 63.8% | 182.19 | 82.19 | 44.46g | 313.95 | `gateau!B21`, `gateau!C21` |
| 90g | 100.00 | 70.85 | 29.15 | 🔴 29.1% | 70.9% | 202.43 | 102.43 | 44.46g | 313.95 | `gateau!B22`, `gateau!C22` |
| 90g | 100.00 | 70.85 | 29.15 | 🔴 29.1% | 70.9% | 202.43 | 102.43 | 44.46g | 313.95 | `gateau!B23`, `gateau!C23` |
| 900g | 1,000 | 708.51 | 291.49 | 🔴 29.1% | 70.9% | 2,024 | 1,024 | 444.60g | 31.39 | `gateau!B24`, `gateau!C24` |

#### Ingredient Inflation Sensitivity
| Portion | Key ingredient | GM after key +10% | GM after key +25% | Profit action if spike happens | Source |
|---:|---|---:|---:|---|---|
| 81g | frying oil | 33.1% | 28.5% | Raise price immediately | `gateau!E16`, `gateau!B21`, `gateau!C21` |
| 90g | frying oil | 25.7% | 20.5% | Raise price immediately | `gateau!E16`, `gateau!B22`, `gateau!C22` |
| 90g | frying oil | 25.7% | 20.5% | Raise price immediately | `gateau!E16`, `gateau!B23`, `gateau!C23` |
| 900g | frying oil | 25.7% | 20.5% | Raise price immediately | `gateau!E16`, `gateau!B24`, `gateau!C24` |

#### Standard Production Method
⚠️ assumption: method steps are professional operating templates, not sourced from the workbook. Validate with your baker before production.
1. Cream fat and sugar or mix according to house cake method; add eggs/liquids slowly to avoid splitting.
2. Fold dry ingredients gently, portion by weight, bake until set, cool fully before cutting or packing.
3. Track batter weight, baked weight, trim, and final saleable pieces for yield control.

#### Profit Improvement Checklist
- Set target selling price from the table above, or resize to the listed max weight at current price.
- Record actual good units after cooling/packing and compare to theoretical yield.
- Add labor minutes by step, packaging per unit, and overhead allocation per batch.
- Review top ingredient supplier price and minimum-order quantity.
- If formula errors exist in this sheet, repair workbook formulas before relying on workbook profit rows.

### Kouatchoua gato
| Field | Value | Source / note |
|---|---|---|
| Category | cake/gateau | Inferred from recipe name |
| Base batch mass | 50,710 | `Kouatchoua gato!D5 + Kouatchoua gato!D6 + Kouatchoua gato!D7 + Kouatchoua gato!D8 + Kouatchoua gato!D9 + Kouatchoua gato!D10 + Kouatchoua gato!D11 + Kouatchoua gato!D12 + Kouatchoua gato!D13 + Kouatchoua gato!D14 + Kouatchoua gato!D15` |
| Base ingredient cost | 27,540 | `Kouatchoua gato!E5 + Kouatchoua gato!E6 + Kouatchoua gato!E7 + Kouatchoua gato!E8 + Kouatchoua gato!E9 + Kouatchoua gato!E10 + Kouatchoua gato!E11 + Kouatchoua gato!E12 + Kouatchoua gato!E13 + Kouatchoua gato!E14 + Kouatchoua gato!E15` |
| Current verdict | Reprice | Raise worst SKU to target price or reduce portion to 64.45g for 65% GM. |
| Top-2 ingredient concentration | 76.6% | Base ingredient cost table |
| Highest-cost ingredient | flour (11,340) | `Kouatchoua gato!E5` |
| Missing data to complete COGS | labor minutes/rate; packaging; overhead; actual yield; waste/shrinkage; daily volume | Add these before treating total COGS as final |

#### Ingredients
| Ingredient | Qty | Ingredient cost | % of base cost | Cost-risk note | Source |
|---|---:|---:|---:|---|---|
| flour | 27,000 | 11,340 | 41.2% | High | `Kouatchoua gato!D5`, `Kouatchoua gato!E5` |
| frying oil | 8,000 | 9,760 | 35.4% | High | `Kouatchoua gato!D15`, `Kouatchoua gato!E15` |
| Butter | 1,300 | 1,642 | 6.0% | Normal | `Kouatchoua gato!D6`, `Kouatchoua gato!E6` |
| egg | 1,000 | 1,333 | 4.8% | Normal | `Kouatchoua gato!D9`, `Kouatchoua gato!E9` |
| Conc Milk | 1,000 | 1,170 | 4.2% | Normal | `Kouatchoua gato!D8`, `Kouatchoua gato!E8` |
| sugar | 1,700 | 1,088 | 4.0% | Normal | `Kouatchoua gato!D7`, `Kouatchoua gato!E7` |
| improver | 140 | 392.00 | 1.4% | Normal | `Kouatchoua gato!D11`, `Kouatchoua gato!E11` |
| baking powder | 150 | 390.00 | 1.4% | Normal | `Kouatchoua gato!D14`, `Kouatchoua gato!E14` |
| yeast | 130 | 364.00 | 1.3% | Normal | `Kouatchoua gato!D12`, `Kouatchoua gato!E12` |
| salt | 290 | 59.61 | 0.2% | Normal | `Kouatchoua gato!D10`, `Kouatchoua gato!E10` |
| water | 10,000 | 1.00 | 0.0% | Normal | `Kouatchoua gato!D13`, `Kouatchoua gato!E13` |

#### Saleable Portions and Profit Targets
| Portion | Current price | Ingredient COGS | Gross profit | GM % | Food cost % | Target price @35% FC | Price lift needed | Max weight at current price | Break-even units / base batch | Source |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 81.40g | 100.00 | 44.21 | 55.79 | 🟡 55.8% | 44.2% | 126.31 | 26.31 | 64.45g | 275.40 | `Kouatchoua gato!B20`, `Kouatchoua gato!C20` |
| 90g | 100.00 | 48.88 | 51.12 | 🟡 51.1% | 48.9% | 139.65 | 39.65 | 64.45g | 275.40 | `Kouatchoua gato!B21`, `Kouatchoua gato!C21` |
| 90g | 100.00 | 48.88 | 51.12 | 🟡 51.1% | 48.9% | 139.65 | 39.65 | 64.45g | 275.40 | `Kouatchoua gato!B22`, `Kouatchoua gato!C22` |
| 900g | 1,000 | 488.78 | 511.22 | 🟡 51.1% | 48.9% | 1,397 | 396.51 | 644.46g | 27.54 | `Kouatchoua gato!B23`, `Kouatchoua gato!C23` |

#### Ingredient Inflation Sensitivity
| Portion | Key ingredient | GM after key +10% | GM after key +25% | Profit action if spike happens | Source |
|---:|---|---:|---:|---|---|
| 81.40g | flour | 54.0% | 51.2% | Monitor / absorb short term | `Kouatchoua gato!E5`, `Kouatchoua gato!B20`, `Kouatchoua gato!C20` |
| 90g | flour | 49.1% | 46.1% | Raise price immediately | `Kouatchoua gato!E5`, `Kouatchoua gato!B21`, `Kouatchoua gato!C21` |
| 90g | flour | 49.1% | 46.1% | Raise price immediately | `Kouatchoua gato!E5`, `Kouatchoua gato!B22`, `Kouatchoua gato!C22` |
| 900g | flour | 49.1% | 46.1% | Raise price immediately | `Kouatchoua gato!E5`, `Kouatchoua gato!B23`, `Kouatchoua gato!C23` |

#### Standard Production Method
⚠️ assumption: method steps are professional operating templates, not sourced from the workbook. Validate with your baker before production.
1. Cream fat and sugar or mix according to house cake method; add eggs/liquids slowly to avoid splitting.
2. Fold dry ingredients gently, portion by weight, bake until set, cool fully before cutting or packing.
3. Track batter weight, baked weight, trim, and final saleable pieces for yield control.

#### Profit Improvement Checklist
- Set target selling price from the table above, or resize to the listed max weight at current price.
- Record actual good units after cooling/packing and compare to theoretical yield.
- Add labor minutes by step, packaging per unit, and overhead allocation per batch.
- Review top ingredient supplier price and minimum-order quantity.
- If formula errors exist in this sheet, repair workbook formulas before relying on workbook profit rows.

### BUNS SPECIAL
| Field | Value | Source / note |
|---|---|---|
| Category | buns | Inferred from recipe name |
| Base batch mass | 14,920 | `BUNS SPECIAL!D5 + BUNS SPECIAL!D6 + BUNS SPECIAL!D7 + BUNS SPECIAL!D8 + BUNS SPECIAL!D9 + BUNS SPECIAL!D10 + BUNS SPECIAL!D11 + BUNS SPECIAL!D12 + BUNS SPECIAL!D13` |
| Base ingredient cost | 9,868 | `BUNS SPECIAL!E5 + BUNS SPECIAL!E6 + BUNS SPECIAL!E7 + BUNS SPECIAL!E8 + BUNS SPECIAL!E9 + BUNS SPECIAL!E10 + BUNS SPECIAL!E11 + BUNS SPECIAL!E12 + BUNS SPECIAL!E13` |
| Current verdict | Reprice | Raise worst SKU to target price or reduce portion to 529.18g for 65% GM. |
| Top-2 ingredient concentration | 75.0% | Base ingredient cost table |
| Highest-cost ingredient | flour (4,200) | `BUNS SPECIAL!E5` |
| Missing data to complete COGS | labor minutes/rate; packaging; overhead; actual yield; waste/shrinkage; daily volume | Add these before treating total COGS as final |

#### Ingredients
| Ingredient | Qty | Ingredient cost | % of base cost | Cost-risk note | Source |
|---|---:|---:|---:|---|---|
| flour | 10,000 | 4,200 | 42.6% | High | `BUNS SPECIAL!D5`, `BUNS SPECIAL!E5` |
| powder milk | 1,000 | 3,200 | 32.4% | High | `BUNS SPECIAL!D8`, `BUNS SPECIAL!E8` |
| egg | 220 | 814.81 | 8.3% | Normal | `BUNS SPECIAL!D9`, `BUNS SPECIAL!E9` |
| Butter | 450 | 568.42 | 5.8% | Normal | `BUNS SPECIAL!D6`, `BUNS SPECIAL!E6` |
| improver | 150 | 420.00 | 4.3% | Normal | `BUNS SPECIAL!D11`, `BUNS SPECIAL!E11` |
| yeast | 150 | 420.00 | 4.3% | Normal | `BUNS SPECIAL!D12`, `BUNS SPECIAL!E12` |
| sugar | 350 | 224.00 | 2.3% | Normal | `BUNS SPECIAL!D7`, `BUNS SPECIAL!E7` |
| salt | 100 | 20.56 | 0.2% | Normal | `BUNS SPECIAL!D10`, `BUNS SPECIAL!E10` |
| water | 2,500 | 0.25 | 0.0% | Normal | `BUNS SPECIAL!D13`, `BUNS SPECIAL!E13` |

#### Saleable Portions and Profit Targets
| Portion | Current price | Ingredient COGS | Gross profit | GM % | Food cost % | Target price @35% FC | Price lift needed | Max weight at current price | Break-even units / base batch | Source |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 55g | 100.00 | 36.38 | 63.62 | 🟡 63.6% | 36.4% | 103.93 | 3.93 | 52.92g | 98.68 | `BUNS SPECIAL!B18`, `BUNS SPECIAL!C18` |
| 220g | 300.00 | 145.51 | 154.49 | 🟡 51.5% | 48.5% | 415.74 | 115.74 | 158.75g | 32.89 | `BUNS SPECIAL!B19`, `BUNS SPECIAL!C19` |
| 800g | 1,000 | 529.12 | 470.88 | 🔴 47.1% | 52.9% | 1,512 | 511.76 | 529.18g | 9.87 | `BUNS SPECIAL!B20`, `BUNS SPECIAL!C20` |

#### Ingredient Inflation Sensitivity
| Portion | Key ingredient | GM after key +10% | GM after key +25% | Profit action if spike happens | Source |
|---:|---|---:|---:|---|---|
| 55g | flour | 62.1% | 59.8% | Monitor / absorb short term | `BUNS SPECIAL!E5`, `BUNS SPECIAL!B18`, `BUNS SPECIAL!C18` |
| 220g | flour | 49.4% | 46.3% | Raise price immediately | `BUNS SPECIAL!E5`, `BUNS SPECIAL!B19`, `BUNS SPECIAL!C19` |
| 800g | flour | 44.8% | 41.5% | Raise price immediately | `BUNS SPECIAL!E5`, `BUNS SPECIAL!B20`, `BUNS SPECIAL!C20` |

#### Standard Production Method
⚠️ assumption: method steps are professional operating templates, not sourced from the workbook. Validate with your baker before production.
1. Scale and mix as enriched dough; add fat after initial hydration if dough development is weak.
2. Divide to target portion weight, round tightly, proof consistently, bake/fry according to house standard, cool, then package.
3. Track piece count against theoretical yield after cooling, not before, because shrink and breakage affect saleable units.

#### Profit Improvement Checklist
- Set target selling price from the table above, or resize to the listed max weight at current price.
- Record actual good units after cooling/packing and compare to theoretical yield.
- Add labor minutes by step, packaging per unit, and overhead allocation per batch.
- Review top ingredient supplier price and minimum-order quantity.
- If formula errors exist in this sheet, repair workbook formulas before relying on workbook profit rows.

### buns new look
| Field | Value | Source / note |
|---|---|---|
| Category | buns | Inferred from recipe name |
| Base batch mass | 9,870 | `buns new look!D5 + buns new look!D6 + buns new look!D7 + buns new look!D8 + buns new look!D9 + buns new look!D10 + buns new look!D11 + buns new look!D12 + buns new look!D13` |
| Base ingredient cost | 4,350 | `buns new look!E5 + buns new look!E6 + buns new look!E7 + buns new look!E8 + buns new look!E9 + buns new look!E10 + buns new look!E11 + buns new look!E12 + buns new look!E13` |
| Current verdict | Reprice | Raise worst SKU to target price or reduce portion to 79.41g for 65% GM. |
| Top-2 ingredient concentration | 76.7% | Base ingredient cost table |
| Highest-cost ingredient | flour (2,520) | `buns new look!E5` |
| Missing data to complete COGS | labor minutes/rate; packaging; overhead; actual yield; waste/shrinkage; daily volume | Add these before treating total COGS as final |

#### Ingredients
| Ingredient | Qty | Ingredient cost | % of base cost | Cost-risk note | Source |
|---|---:|---:|---:|---|---|
| flour | 6,000 | 2,520 | 57.9% | High | `buns new look!D5`, `buns new look!E5` |
| egg | 220 | 814.81 | 18.7% | Medium | `buns new look!D9`, `buns new look!E9` |
| Butter | 300 | 378.95 | 8.7% | Normal | `buns new look!D6`, `buns new look!E6` |
| improver | 100 | 280.00 | 6.4% | Normal | `buns new look!D11`, `buns new look!E11` |
| yeast | 100 | 280.00 | 6.4% | Normal | `buns new look!D12`, `buns new look!E12` |
| sugar | 50 | 32.00 | 0.7% | Normal | `buns new look!D7`, `buns new look!E7` |
| conc milk | 500 | 23.40 | 0.5% | Normal | `buns new look!D8`, `buns new look!E8` |
| salt | 100 | 20.56 | 0.5% | Normal | `buns new look!D10`, `buns new look!E10` |
| water | 2,500 | 0.25 | 0.0% | Normal | `buns new look!D13`, `buns new look!E13` |

#### Saleable Portions and Profit Targets
| Portion | Current price | Ingredient COGS | Gross profit | GM % | Food cost % | Target price @35% FC | Price lift needed | Max weight at current price | Break-even units / base batch | Source |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 95g | 100.00 | 41.87 | 58.13 | 🟡 58.1% | 41.9% | 119.63 | 19.63 | 79.41g | 43.50 | `buns new look!C20`, `buns new look!D20` |

#### Ingredient Inflation Sensitivity
| Portion | Key ingredient | GM after key +10% | GM after key +25% | Profit action if spike happens | Source |
|---:|---|---:|---:|---|---|
| 95g | flour | 55.7% | 52.1% | Monitor / absorb short term | `buns new look!E5`, `buns new look!C20`, `buns new look!D20` |

#### Standard Production Method
⚠️ assumption: method steps are professional operating templates, not sourced from the workbook. Validate with your baker before production.
1. Scale and mix as enriched dough; add fat after initial hydration if dough development is weak.
2. Divide to target portion weight, round tightly, proof consistently, bake/fry according to house standard, cool, then package.
3. Track piece count against theoretical yield after cooling, not before, because shrink and breakage affect saleable units.

#### Profit Improvement Checklist
- Set target selling price from the table above, or resize to the listed max weight at current price.
- Record actual good units after cooling/packing and compare to theoretical yield.
- Add labor minutes by step, packaging per unit, and overhead allocation per batch.
- Review top ingredient supplier price and minimum-order quantity.
- If formula errors exist in this sheet, repair workbook formulas before relying on workbook profit rows.

### YUMMY BREAD
| Field | Value | Source / note |
|---|---|---|
| Category | bread | Inferred from recipe name |
| Base batch mass | 26,250 | `YUMMY BREAD!D5 + YUMMY BREAD!D6 + YUMMY BREAD!D7 + YUMMY BREAD!D8 + YUMMY BREAD!D9 + YUMMY BREAD!D10 + YUMMY BREAD!D11 + YUMMY BREAD!D12 + YUMMY BREAD!D13 + YUMMY BREAD!D14` |
| Base ingredient cost | 12,134 | `YUMMY BREAD!E5 + YUMMY BREAD!E6 + YUMMY BREAD!E7 + YUMMY BREAD!E8 + YUMMY BREAD!E9 + YUMMY BREAD!E10 + YUMMY BREAD!E11 + YUMMY BREAD!E12 + YUMMY BREAD!E13 + YUMMY BREAD!E14` |
| Current verdict | Reprice | Raise worst SKU to target price or reduce portion to 94.65g for 65% GM. |
| Top-2 ingredient concentration | 65.1% | Base ingredient cost table |
| Highest-cost ingredient | flour (6,000) | `YUMMY BREAD!E5` |
| Missing data to complete COGS | labor minutes/rate; packaging; overhead; actual yield; waste/shrinkage; daily volume | Add these before treating total COGS as final |

#### Ingredients
| Ingredient | Qty | Ingredient cost | % of base cost | Cost-risk note | Source |
|---|---:|---:|---:|---|---|
| flour | 15,000 | 6,000 | 49.4% | High | `YUMMY BREAD!D5`, `YUMMY BREAD!E5` |
| Butter | 1,500 | 1,895 | 15.6% | Medium | `YUMMY BREAD!D6`, `YUMMY BREAD!E6` |
| Milk | 1,000 | 1,170 | 9.6% | Normal | `YUMMY BREAD!D8`, `YUMMY BREAD!E8` |
| egg | 750 | 1,000 | 8.2% | Normal | `YUMMY BREAD!D9`, `YUMMY BREAD!E9` |
| sugar | 1,500 | 960.00 | 7.9% | Normal | `YUMMY BREAD!D7`, `YUMMY BREAD!E7` |
| yeast | 160 | 448.00 | 3.7% | Normal | `YUMMY BREAD!D12`, `YUMMY BREAD!E12` |
| improver | 120 | 336.00 | 2.8% | Normal | `YUMMY BREAD!D11`, `YUMMY BREAD!E11` |
| EDC | 100 | 300.00 | 2.5% | Normal | `YUMMY BREAD!D14`, `YUMMY BREAD!E14` |
| salt | 120 | 24.67 | 0.2% | Normal | `YUMMY BREAD!D10`, `YUMMY BREAD!E10` |
| water | 6,000 | 0.60 | 0.0% | Normal | `YUMMY BREAD!D13`, `YUMMY BREAD!E13` |

#### Saleable Portions and Profit Targets
| Portion | Current price | Ingredient COGS | Gross profit | GM % | Food cost % | Target price @35% FC | Price lift needed | Max weight at current price | Break-even units / base batch | Source |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 144g | 150.00 | 66.56 | 83.44 | 🟡 55.6% | 44.4% | 190.18 | 40.18 | 113.58g | 80.89 | `YUMMY BREAD!B20`, `YUMMY BREAD!C20` |
| 144g | 125.00 | 66.56 | 58.44 | 🔴 46.7% | 53.3% | 190.18 | 65.18 | 94.65g | 97.07 | `YUMMY BREAD!B21`, `YUMMY BREAD!C21` |
| 139g | 150.00 | 64.25 | 85.75 | 🟡 57.2% | 42.8% | 183.58 | 33.58 | 113.58g | 80.89 | `YUMMY BREAD!B22`, `YUMMY BREAD!C22` |

#### Ingredient Inflation Sensitivity
| Portion | Key ingredient | GM after key +10% | GM after key +25% | Profit action if spike happens | Source |
|---:|---|---:|---:|---|---|
| 144g | flour | 53.4% | 50.1% | Monitor / absorb short term | `YUMMY BREAD!E5`, `YUMMY BREAD!B20`, `YUMMY BREAD!C20` |
| 144g | flour | 44.1% | 40.2% | Raise price immediately | `YUMMY BREAD!E5`, `YUMMY BREAD!B21`, `YUMMY BREAD!C21` |
| 139g | flour | 55.0% | 51.9% | Monitor / absorb short term | `YUMMY BREAD!E5`, `YUMMY BREAD!B22`, `YUMMY BREAD!C22` |

#### Standard Production Method
⚠️ assumption: method steps are professional operating templates, not sourced from the workbook. Validate with your baker before production.
1. Scale ingredients exactly from the recipe card; keep flour, yeast, salt, sugar, fat, and improver separate until mixing.
2. Mix dry ingredients, add water/liquids gradually, then develop dough until smooth and elastic.
3. Bulk ferment until dough shows visible rise; divide by target portion weight, round, rest, shape, proof, bake, cool fully, then package.

#### Profit Improvement Checklist
- Set target selling price from the table above, or resize to the listed max weight at current price.
- Record actual good units after cooling/packing and compare to theoretical yield.
- Add labor minutes by step, packaging per unit, and overhead allocation per batch.
- Review top ingredient supplier price and minimum-order quantity.
- If formula errors exist in this sheet, repair workbook formulas before relying on workbook profit rows.

### Donuts
| Field | Value | Source / note |
|---|---|---|
| Category | fried/snack | Inferred from recipe name |
| Base batch mass | 27,450 | `Donuts!D5 + Donuts!D6 + Donuts!D7 + Donuts!D8 + Donuts!D9 + Donuts!D10 + Donuts!D11 + Donuts!D12 + Donuts!D13` |
| Base ingredient cost | 14,597 | `Donuts!E5 + Donuts!E6 + Donuts!E7 + Donuts!E8 + Donuts!E9 + Donuts!E10 + Donuts!E11 + Donuts!E12 + Donuts!E13` |
| Current verdict | Reprice | Raise worst SKU to target price or reduce portion to 32.91g for 65% GM. |
| Top-2 ingredient concentration | 76.3% | Base ingredient cost table |
| Highest-cost ingredient | oil (6,100) | `Donuts!E13` |
| Missing data to complete COGS | labor minutes/rate; packaging; overhead; actual yield; waste/shrinkage; daily volume | Add these before treating total COGS as final |

#### Ingredients
| Ingredient | Qty | Ingredient cost | % of base cost | Cost-risk note | Source |
|---|---:|---:|---:|---|---|
| oil | 5,000 | 6,100 | 41.8% | High | `Donuts!D13`, `Donuts!E13` |
| flour | 12,000 | 5,040 | 34.5% | High | `Donuts!D5`, `Donuts!E5` |
| eggs | 1,000 | 1,333 | 9.1% | Normal | `Donuts!D11`, `Donuts!E11` |
| Sugar | 1,200 | 768.00 | 5.3% | Normal | `Donuts!D9`, `Donuts!E9` |
| milk | 500 | 585.00 | 4.0% | Normal | `Donuts!D7`, `Donuts!E7` |
| baking powder | 190 | 494.00 | 3.4% | Normal | `Donuts!D6`, `Donuts!E6` |
| Improver | 90 | 252.00 | 1.7% | Normal | `Donuts!D10`, `Donuts!E10` |
| salt | 120 | 24.67 | 0.2% | Normal | `Donuts!D8`, `Donuts!E8` |
| water | 7,350 | 0.07 | 0.0% | Normal | `Donuts!D12`, `Donuts!E12` |

#### Saleable Portions and Profit Targets
| Portion | Current price | Ingredient COGS | Gross profit | GM % | Food cost % | Target price @35% FC | Price lift needed | Max weight at current price | Break-even units / base batch | Source |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 40g | 50.00 | 21.27 | 28.73 | 🟡 57.5% | 42.5% | 60.77 | 10.77 | 32.91g | 291.94 | `Donuts!B18`, `Donuts!C18` |
| 22g | 50.00 | 11.70 | 38.30 | 🟢 76.6% | 23.4% | 33.43 | -16.57 | 32.91g | 291.94 | `Donuts!B19`, `Donuts!C19` |
| 150g | 500.00 | 79.77 | 420.23 | 🟢 84.0% | 16.0% | 227.90 | -272.10 | 329.09g | 29.19 | `Donuts!B20`, `Donuts!C20` |

#### Ingredient Inflation Sensitivity
| Portion | Key ingredient | GM after key +10% | GM after key +25% | Profit action if spike happens | Source |
|---:|---|---:|---:|---|---|
| 40g | oil | 55.7% | 53.0% | Monitor / absorb short term | `Donuts!E13`, `Donuts!B18`, `Donuts!C18` |
| 22g | oil | 75.6% | 74.2% | Monitor / absorb short term | `Donuts!E13`, `Donuts!B19`, `Donuts!C19` |
| 150g | oil | 83.4% | 82.4% | Monitor / absorb short term | `Donuts!E13`, `Donuts!B20`, `Donuts!C20` |

#### Standard Production Method
⚠️ assumption: method steps are professional operating templates, not sourced from the workbook. Validate with your baker before production.
1. Mix dough/batter to consistent hydration, rest where required, portion or cut by target sale weight.
2. Fry in controlled oil; drain fully before weighing and packing so oil pickup is visible in yield records.
3. Track oil usage and discard schedule separately because current workbook treats oil as an ingredient but not a process loss.

#### Profit Improvement Checklist
- Set target selling price from the table above, or resize to the listed max weight at current price.
- Record actual good units after cooling/packing and compare to theoretical yield.
- Add labor minutes by step, packaging per unit, and overhead allocation per batch.
- Review top ingredient supplier price and minimum-order quantity.
- If formula errors exist in this sheet, repair workbook formulas before relying on workbook profit rows.

### Fish Pie
| Field | Value | Source / note |
|---|---|---|
| Category | pastry/savory | Inferred from recipe name |
| Base batch mass | 5,700 | `Fish Pie!D5 + Fish Pie!D6 + Fish Pie!D7 + Fish Pie!D8 + Fish Pie!D9 + Fish Pie!D10 + Fish Pie!D11 + Fish Pie!D12 + Fish Pie!D13 + Fish Pie!D14 + Fish Pie!D15 + Fish Pie!D16` |
| Base ingredient cost | 4,179 | `Fish Pie!E5 + Fish Pie!E6 + Fish Pie!E7 + Fish Pie!E8 + Fish Pie!E9 + Fish Pie!E10 + Fish Pie!E11 + Fish Pie!E12 + Fish Pie!E13 + Fish Pie!E14 + Fish Pie!E15` |
| Current verdict | Reprice | Raise worst SKU to target price or reduce portion to 47.74g for 65% GM. |
| Top-2 ingredient concentration | 66.4% | Base ingredient cost table |
| Highest-cost ingredient | Butter (1,516) | `Fish Pie!E7` |
| Missing data to complete COGS | labor minutes/rate; packaging; overhead; actual yield; waste/shrinkage; daily volume | Add these before treating total COGS as final |

#### Ingredients
| Ingredient | Qty | Ingredient cost | % of base cost | Cost-risk note | Source |
|---|---:|---:|---:|---|---|
| Butter | 1,200 | 1,516 | 36.3% | High | `Fish Pie!D7`, `Fish Pie!E7` |
| flour | 3,000 | 1,260 | 30.2% | High | `Fish Pie!D5`, `Fish Pie!E5` |
| fish | 400 | 480.00 | 11.5% | Normal | `Fish Pie!D9`, `Fish Pie!E9` |
| onions | 100 | 200.00 | 4.8% | Normal | `Fish Pie!D13`, `Fish Pie!E13` |
| carrots | 200 | 171.43 | 4.1% | Normal | `Fish Pie!D10`, `Fish Pie!E10` |
| irish | 300 | 171.43 | 4.1% | Normal | `Fish Pie!D14`, `Fish Pie!E14` |
| baking powder | 50 | 130.00 | 3.1% | Normal | `Fish Pie!D6`, `Fish Pie!E6` |
| oil | 100 | 122.00 | 2.9% | Normal | `Fish Pie!D15`, `Fish Pie!E15` |
| Improver | 40 | 104.00 | 2.5% | Normal | `Fish Pie!D8`, `Fish Pie!E8` |
| Green beans | 100 | 20.00 | 0.5% | Normal | `Fish Pie!D11`, `Fish Pie!E11` |
| peppers | 10 | 4.00 | 0.1% | Normal | `Fish Pie!D12`, `Fish Pie!E12` |
| cabbage | 200 | n/a | 0.0% | Normal | `Fish Pie!D16`, `Fish Pie!E16` |

#### Saleable Portions and Profit Targets
| Portion | Current price | Ingredient COGS | Gross profit | GM % | Food cost % | Target price @35% FC | Price lift needed | Max weight at current price | Break-even units / base batch | Source |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 85g | 100.00 | 62.31 | 37.69 | 🔴 37.7% | 62.3% | 178.04 | 78.04 | 47.74g | 41.79 | `Fish Pie!B22`, `Fish Pie!C22` |
| 65g | 100.00 | 47.65 | 52.35 | 🟡 52.3% | 47.7% | 136.15 | 36.15 | 47.74g | 41.79 | `Fish Pie!B23`, `Fish Pie!C23` |
| 150g | 500.00 | 109.96 | 390.04 | 🟢 78.0% | 22.0% | 314.18 | -185.82 | 238.71g | 8.36 | `Fish Pie!B24`, `Fish Pie!C24` |

#### Ingredient Inflation Sensitivity
| Portion | Key ingredient | GM after key +10% | GM after key +25% | Profit action if spike happens | Source |
|---:|---|---:|---:|---|---|
| 85g | Butter | 35.4% | 32.0% | Raise price immediately | `Fish Pie!E7`, `Fish Pie!B22`, `Fish Pie!C22` |
| 65g | Butter | 50.6% | 48.0% | Raise price immediately | `Fish Pie!E7`, `Fish Pie!B23`, `Fish Pie!C23` |
| 150g | Butter | 77.2% | 76.0% | Monitor / absorb short term | `Fish Pie!E7`, `Fish Pie!B24`, `Fish Pie!C24` |

#### Standard Production Method
⚠️ assumption: method steps are professional operating templates, not sourced from the workbook. Validate with your baker before production.
1. Prepare dough and filling separately; weigh filling per piece to control cost and consistency.
2. Seal, proof/rest where required, bake/fry, cool, then count only intact saleable pieces.
3. Track filling waste and broken/leaking pieces because savory items have higher hidden loss risk.

#### Profit Improvement Checklist
- Set target selling price from the table above, or resize to the listed max weight at current price.
- Record actual good units after cooling/packing and compare to theoretical yield.
- Add labor minutes by step, packaging per unit, and overhead allocation per batch.
- Review top ingredient supplier price and minimum-order quantity.
- If formula errors exist in this sheet, repair workbook formulas before relying on workbook profit rows.

### Galette
| Field | Value | Source / note |
|---|---|---|
| Category | pastry/savory | Inferred from recipe name |
| Base batch mass | 16,995 | `Galette!D5 + Galette!D6 + Galette!D7 + Galette!D8 + Galette!D9 + Galette!D10 + Galette!D11 + Galette!D12 + Galette!D13 + Galette!D14 + Galette!D15 + Galette!D16` |
| Base ingredient cost | 10,606 | `Galette!E5 + Galette!E6 + Galette!E7 + Galette!E8 + Galette!E9 + Galette!E10 + Galette!E11 + Galette!E12 + Galette!E13 + Galette!E14 + Galette!E15 + Galette!E16` |
| Current verdict | Reprice | Raise worst SKU to target price or reduce portion to 56.08g for 65% GM. |
| Top-2 ingredient concentration | 56.5% | Base ingredient cost table |
| Highest-cost ingredient | flour (4,200) | `Galette!E5` |
| Missing data to complete COGS | labor minutes/rate; packaging; overhead; actual yield; waste/shrinkage; daily volume | Add these before treating total COGS as final |

#### Ingredients
| Ingredient | Qty | Ingredient cost | % of base cost | Cost-risk note | Source |
|---|---:|---:|---:|---|---|
| flour | 10,000 | 4,200 | 39.6% | High | `Galette!D5`, `Galette!E5` |
| Chocolate | 1,000 | 1,789 | 16.9% | Medium | `Galette!D15`, `Galette!E15` |
| Butter | 1,000 | 1,263 | 11.9% | Normal | `Galette!D6`, `Galette!E6` |
| egg | 750 | 1,000 | 9.4% | Normal | `Galette!D9`, `Galette!E9` |
| Milk | 800 | 936.00 | 8.8% | Normal | `Galette!D8`, `Galette!E8` |
| sugar | 1,000 | 640.00 | 6.0% | Normal | `Galette!D7`, `Galette!E7` |
| improver | 100 | 280.00 | 2.6% | Normal | `Galette!D11`, `Galette!E11` |
| EDC | 75 | 225.00 | 2.1% | Normal | `Galette!D16`, `Galette!E16` |
| yeast | 80 | 224.00 | 2.1% | Normal | `Galette!D12`, `Galette!E12` |
| baking powder | 80 | 26.00 | 0.2% | Normal | `Galette!D14`, `Galette!E14` |
| salt | 110 | 22.61 | 0.2% | Normal | `Galette!D10`, `Galette!E10` |
| water | 2,000 | 0.20 | 0.0% | Normal | `Galette!D13`, `Galette!E13` |

#### Saleable Portions and Profit Targets
| Portion | Current price | Ingredient COGS | Gross profit | GM % | Food cost % | Target price @35% FC | Price lift needed | Max weight at current price | Break-even units / base batch | Source |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 79g | 100.00 | 49.30 | 50.70 | 🟡 50.7% | 49.3% | 140.87 | 40.87 | 56.08g | 106.06 | `Galette!B22`, `Galette!C22` |
| 140g | 200.00 | 87.37 | 112.63 | 🟡 56.3% | 43.7% | 249.64 | 49.64 | 112.16g | 53.03 | `Galette!B23`, `Galette!C23` |
| 700g | 1,000 | 436.86 | 563.14 | 🟡 56.3% | 43.7% | 1,248 | 248.18 | 560.81g | 10.61 | `Galette!B24`, `Galette!C24` |

#### Ingredient Inflation Sensitivity
| Portion | Key ingredient | GM after key +10% | GM after key +25% | Profit action if spike happens | Source |
|---:|---|---:|---:|---|---|
| 79g | flour | 48.7% | 45.8% | Raise price immediately | `Galette!E5`, `Galette!B22`, `Galette!C22` |
| 140g | flour | 54.6% | 52.0% | Monitor / absorb short term | `Galette!E5`, `Galette!B23`, `Galette!C23` |
| 700g | flour | 54.6% | 52.0% | Monitor / absorb short term | `Galette!E5`, `Galette!B24`, `Galette!C24` |

#### Standard Production Method
⚠️ assumption: method steps are professional operating templates, not sourced from the workbook. Validate with your baker before production.
1. Prepare dough and filling separately; weigh filling per piece to control cost and consistency.
2. Seal, proof/rest where required, bake/fry, cool, then count only intact saleable pieces.
3. Track filling waste and broken/leaking pieces because savory items have higher hidden loss risk.

#### Profit Improvement Checklist
- Set target selling price from the table above, or resize to the listed max weight at current price.
- Record actual good units after cooling/packing and compare to theoretical yield.
- Add labor minutes by step, packaging per unit, and overhead allocation per batch.
- Review top ingredient supplier price and minimum-order quantity.
- If formula errors exist in this sheet, repair workbook formulas before relying on workbook profit rows.

### New bread
| Field | Value | Source / note |
|---|---|---|
| Category | bread | Inferred from recipe name |
| Base batch mass | 24,160 | `New bread!D5 + New bread!D6 + New bread!D7 + New bread!D8 + New bread!D9 + New bread!D10 + New bread!D11 + New bread!D12 + New bread!D13` |
| Base ingredient cost | 8,534 | `New bread!E5 + New bread!E6 + New bread!E7 + New bread!E8 + New bread!E9 + New bread!E10 + New bread!E11 + New bread!E12 + New bread!E13` |
| Current verdict | Renegotiate ingredient | Margin is acceptable but top-2 ingredients drive 83.4% of base cost. |
| Top-2 ingredient concentration | 83.4% | Base ingredient cost table |
| Highest-cost ingredient | flour (6,300) | `New bread!E5` |
| Missing data to complete COGS | labor minutes/rate; packaging; overhead; actual yield; waste/shrinkage; daily volume | Add these before treating total COGS as final |

#### Ingredients
| Ingredient | Qty | Ingredient cost | % of base cost | Cost-risk note | Source |
|---|---:|---:|---:|---|---|
| flour | 15,000 | 6,300 | 73.8% | High | `New bread!D5`, `New bread!E5` |
| egg | 220 | 814.81 | 9.5% | Normal | `New bread!D9`, `New bread!E9` |
| Butter | 600 | 757.89 | 8.9% | Normal | `New bread!D6`, `New bread!E6` |
| improver | 100 | 280.00 | 3.3% | Normal | `New bread!D11`, `New bread!E11` |
| yeast | 90 | 252.00 | 3.0% | Normal | `New bread!D12`, `New bread!E12` |
| sugar | 100 | 64.00 | 0.7% | Normal | `New bread!D7`, `New bread!E7` |
| conc milk | 950 | 44.46 | 0.5% | Normal | `New bread!D8`, `New bread!E8` |
| salt | 100 | 20.56 | 0.2% | Normal | `New bread!D10`, `New bread!E10` |
| water | 7,000 | 0.70 | 0.0% | Normal | `New bread!D13`, `New bread!E13` |

#### Saleable Portions and Profit Targets
| Portion | Current price | Ingredient COGS | Gross profit | GM % | Food cost % | Target price @35% FC | Price lift needed | Max weight at current price | Break-even units / base batch | Source |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 90g | 100.00 | 31.79 | 68.21 | 🟢 68.2% | 31.8% | 90.83 | -9.17 | 99.08g | 85.34 | `New bread!C20`, `New bread!D20` |

#### Ingredient Inflation Sensitivity
| Portion | Key ingredient | GM after key +10% | GM after key +25% | Profit action if spike happens | Source |
|---:|---|---:|---:|---|---|
| 90g | flour | 65.9% | 62.3% | Monitor / absorb short term | `New bread!E5`, `New bread!C20`, `New bread!D20` |

#### Standard Production Method
⚠️ assumption: method steps are professional operating templates, not sourced from the workbook. Validate with your baker before production.
1. Scale ingredients exactly from the recipe card; keep flour, yeast, salt, sugar, fat, and improver separate until mixing.
2. Mix dry ingredients, add water/liquids gradually, then develop dough until smooth and elastic.
3. Bulk ferment until dough shows visible rise; divide by target portion weight, round, rest, shape, proof, bake, cool fully, then package.

#### Profit Improvement Checklist
- Set target selling price from the table above, or resize to the listed max weight at current price.
- Record actual good units after cooling/packing and compare to theoretical yield.
- Add labor minutes by step, packaging per unit, and overhead allocation per batch.
- Review top ingredient supplier price and minimum-order quantity.
- If formula errors exist in this sheet, repair workbook formulas before relying on workbook profit rows.

### NGALA BREAD
| Field | Value | Source / note |
|---|---|---|
| Category | bread | Inferred from recipe name |
| Base batch mass | 15,430 | `NGALA BREAD!D5 + NGALA BREAD!D6 + NGALA BREAD!D7 + NGALA BREAD!D8 + NGALA BREAD!D9 + NGALA BREAD!D10 + NGALA BREAD!D11 + NGALA BREAD!D12 + NGALA BREAD!D13` |
| Base ingredient cost | 7,532 | `NGALA BREAD!E5 + NGALA BREAD!E6 + NGALA BREAD!E7 + NGALA BREAD!E8 + NGALA BREAD!E9 + NGALA BREAD!E10 + NGALA BREAD!E11 + NGALA BREAD!E12 + NGALA BREAD!E13` |
| Current verdict | Reprice | Raise worst SKU to target price or reduce portion to 71.70g for 65% GM. |
| Top-2 ingredient concentration | 74.4% | Base ingredient cost table |
| Highest-cost ingredient | flour (3,570) | `NGALA BREAD!E5` |
| Missing data to complete COGS | labor minutes/rate; packaging; overhead; actual yield; waste/shrinkage; daily volume | Add these before treating total COGS as final |

#### Ingredients
| Ingredient | Qty | Ingredient cost | % of base cost | Cost-risk note | Source |
|---|---:|---:|---:|---|---|
| flour | 8,500 | 3,570 | 47.4% | High | `NGALA BREAD!D5`, `NGALA BREAD!E5` |
| egg | 550 | 2,037 | 27.0% | Medium | `NGALA BREAD!D9`, `NGALA BREAD!E9` |
| Butter | 1,000 | 1,263 | 16.8% | Medium | `NGALA BREAD!D6`, `NGALA BREAD!E6` |
| improver | 100 | 280.00 | 3.7% | Normal | `NGALA BREAD!D11`, `NGALA BREAD!E11` |
| yeast | 90 | 252.00 | 3.3% | Normal | `NGALA BREAD!D12`, `NGALA BREAD!E12` |
| sugar | 100 | 64.00 | 0.8% | Normal | `NGALA BREAD!D7`, `NGALA BREAD!E7` |
| conc milk | 1,000 | 46.80 | 0.6% | Normal | `NGALA BREAD!D8`, `NGALA BREAD!E8` |
| salt | 90 | 18.50 | 0.2% | Normal | `NGALA BREAD!D10`, `NGALA BREAD!E10` |
| water | 4,000 | 0.40 | 0.0% | Normal | `NGALA BREAD!D13`, `NGALA BREAD!E13` |

#### Saleable Portions and Profit Targets
| Portion | Current price | Ingredient COGS | Gross profit | GM % | Food cost % | Target price @35% FC | Price lift needed | Max weight at current price | Break-even units / base batch | Source |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 90g | 100.00 | 43.93 | 56.07 | 🟡 56.1% | 43.9% | 125.52 | 25.52 | 71.70g | 75.32 | `NGALA BREAD!C20`, `NGALA BREAD!D20` |

#### Ingredient Inflation Sensitivity
| Portion | Key ingredient | GM after key +10% | GM after key +25% | Profit action if spike happens | Source |
|---:|---|---:|---:|---|---|
| 90g | flour | 54.0% | 50.9% | Monitor / absorb short term | `NGALA BREAD!E5`, `NGALA BREAD!C20`, `NGALA BREAD!D20` |

#### Standard Production Method
⚠️ assumption: method steps are professional operating templates, not sourced from the workbook. Validate with your baker before production.
1. Scale ingredients exactly from the recipe card; keep flour, yeast, salt, sugar, fat, and improver separate until mixing.
2. Mix dry ingredients, add water/liquids gradually, then develop dough until smooth and elastic.
3. Bulk ferment until dough shows visible rise; divide by target portion weight, round, rest, shape, proof, bake, cool fully, then package.

#### Profit Improvement Checklist
- Set target selling price from the table above, or resize to the listed max weight at current price.
- Record actual good units after cooling/packing and compare to theoretical yield.
- Add labor minutes by step, packaging per unit, and overhead allocation per batch.
- Review top ingredient supplier price and minimum-order quantity.
- If formula errors exist in this sheet, repair workbook formulas before relying on workbook profit rows.

### Pain au lait
| Field | Value | Source / note |
|---|---|---|
| Category | bread | Inferred from recipe name |
| Base batch mass | 20,457 | `Pain au lait!D5 + Pain au lait!D6 + Pain au lait!D7 + Pain au lait!D8 + Pain au lait!D9 + Pain au lait!D10 + Pain au lait!D11 + Pain au lait!D12 + Pain au lait!D13 + Pain au lait!D14 + Pain au lait!D15 + Pain au lait!D16 + Pain au lait!D17` |
| Base ingredient cost | 9,646 | `Pain au lait!E5 + Pain au lait!E6 + Pain au lait!E7 + Pain au lait!E8 + Pain au lait!E9 + Pain au lait!E10 + Pain au lait!E11 + Pain au lait!E12 + Pain au lait!E13 + Pain au lait!E14 + Pain au lait!E15 + Pain au lait!E16 + Pain au lait!E17` |
| Current verdict | Reprice | Raise worst SKU to target price or reduce portion to 111.34g for 65% GM. |
| Top-2 ingredient concentration | 65.3% | Base ingredient cost table |
| Highest-cost ingredient | flour (5,040) | `Pain au lait!E5` |
| Missing data to complete COGS | labor minutes/rate; packaging; overhead; actual yield; waste/shrinkage; daily volume | Add these before treating total COGS as final |

#### Ingredients
| Ingredient | Qty | Ingredient cost | % of base cost | Cost-risk note | Source |
|---|---:|---:|---:|---|---|
| flour | 12,000 | 5,040 | 52.3% | High | `Pain au lait!D5`, `Pain au lait!E5` |
| Butter | 1,000 | 1,263 | 13.1% | Normal | `Pain au lait!D6`, `Pain au lait!E6` |
| Milk | 950 | 1,112 | 11.5% | Normal | `Pain au lait!D8`, `Pain au lait!E8` |
| sugar | 1,100 | 704.00 | 7.3% | Normal | `Pain au lait!D7`, `Pain au lait!E7` |
| egg | 300 | 400.00 | 4.1% | Normal | `Pain au lait!D9`, `Pain au lait!E9` |
| Oil | 300 | 366.00 | 3.8% | Normal | `Pain au lait!D14`, `Pain au lait!E14` |
| improver | 100 | 280.00 | 2.9% | Normal | `Pain au lait!D11`, `Pain au lait!E11` |
| yeast | 80 | 224.00 | 2.3% | Normal | `Pain au lait!D12`, `Pain au lait!E12` |
| Nutmeg | 12 | 108.00 | 1.1% | Normal | `Pain au lait!D17`, `Pain au lait!E17` |
| EDC | 25 | 75.00 | 0.8% | Normal | `Pain au lait!D16`, `Pain au lait!E16` |
| Milk tantalizer | 5 | 56.25 | 0.6% | Normal | `Pain au lait!D15`, `Pain au lait!E15` |
| salt | 85 | 17.47 | 0.2% | Normal | `Pain au lait!D10`, `Pain au lait!E10` |
| water | 4,500 | 0.45 | 0.0% | Normal | `Pain au lait!D13`, `Pain au lait!E13` |

#### Saleable Portions and Profit Targets
| Portion | Current price | Ingredient COGS | Gross profit | GM % | Food cost % | Target price @35% FC | Price lift needed | Max weight at current price | Break-even units / base batch | Source |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 136g | 150.00 | 64.13 | 85.87 | 🟡 57.2% | 42.8% | 183.22 | 33.22 | 111.34g | 64.31 | `Pain au lait!B23`, `Pain au lait!C23` |
| 200g | 300.00 | 94.30 | 205.70 | 🟢 68.6% | 31.4% | 269.44 | -30.56 | 222.69g | 32.15 | `Pain au lait!B24`, `Pain au lait!C24` |
| 800g | 1,000 | 377.21 | 622.79 | 🟡 62.3% | 37.7% | 1,078 | 77.75 | 742.28g | 9.65 | `Pain au lait!B25`, `Pain au lait!C25` |

#### Ingredient Inflation Sensitivity
| Portion | Key ingredient | GM after key +10% | GM after key +25% | Profit action if spike happens | Source |
|---:|---|---:|---:|---|---|
| 136g | flour | 55.0% | 51.7% | Monitor / absorb short term | `Pain au lait!E5`, `Pain au lait!B23`, `Pain au lait!C23` |
| 200g | flour | 66.9% | 64.5% | Monitor / absorb short term | `Pain au lait!E5`, `Pain au lait!B24`, `Pain au lait!C24` |
| 800g | flour | 60.3% | 57.4% | Monitor / absorb short term | `Pain au lait!E5`, `Pain au lait!B25`, `Pain au lait!C25` |

#### Standard Production Method
⚠️ assumption: method steps are professional operating templates, not sourced from the workbook. Validate with your baker before production.
1. Scale ingredients exactly from the recipe card; keep flour, yeast, salt, sugar, fat, and improver separate until mixing.
2. Mix dry ingredients, add water/liquids gradually, then develop dough until smooth and elastic.
3. Bulk ferment until dough shows visible rise; divide by target portion weight, round, rest, shape, proof, bake, cool fully, then package.

#### Profit Improvement Checklist
- Set target selling price from the table above, or resize to the listed max weight at current price.
- Record actual good units after cooling/packing and compare to theoretical yield.
- Add labor minutes by step, packaging per unit, and overhead allocation per batch.
- Review top ingredient supplier price and minimum-order quantity.
- If formula errors exist in this sheet, repair workbook formulas before relying on workbook profit rows.

### NEW BRIOCHE
| Field | Value | Source / note |
|---|---|---|
| Category | bread | Inferred from recipe name |
| Base batch mass | 17,213 | `NEW BRIOCHE!D5 + NEW BRIOCHE!D6 + NEW BRIOCHE!D7 + NEW BRIOCHE!D8 + NEW BRIOCHE!D9 + NEW BRIOCHE!D10 + NEW BRIOCHE!D11 + NEW BRIOCHE!D12 + NEW BRIOCHE!D13 + NEW BRIOCHE!D14 + NEW BRIOCHE!D15` |
| Base ingredient cost | 10,838 | `NEW BRIOCHE!E5 + NEW BRIOCHE!E6 + NEW BRIOCHE!E7 + NEW BRIOCHE!E8 + NEW BRIOCHE!E9 + NEW BRIOCHE!E10 + NEW BRIOCHE!E11 + NEW BRIOCHE!E12 + NEW BRIOCHE!E13 + NEW BRIOCHE!E14 + NEW BRIOCHE!E15` |
| Current verdict | Reprice | Raise worst SKU to target price or reduce portion to 55.59g for 65% GM. |
| Top-2 ingredient concentration | 67.9% | Base ingredient cost table |
| Highest-cost ingredient | flour (4,200) | `NEW BRIOCHE!E5` |
| Missing data to complete COGS | labor minutes/rate; packaging; overhead; actual yield; waste/shrinkage; daily volume | Add these before treating total COGS as final |

#### Ingredients
| Ingredient | Qty | Ingredient cost | % of base cost | Cost-risk note | Source |
|---|---:|---:|---:|---|---|
| flour | 10,000 | 4,200 | 38.8% | High | `NEW BRIOCHE!D5`, `NEW BRIOCHE!E5` |
| Butter | 2,500 | 3,158 | 29.1% | Medium | `NEW BRIOCHE!D6`, `NEW BRIOCHE!E6` |
| sugar | 1,500 | 960.00 | 8.9% | Normal | `NEW BRIOCHE!D7`, `NEW BRIOCHE!E7` |
| Milk | 800 | 936.00 | 8.6% | Normal | `NEW BRIOCHE!D8`, `NEW BRIOCHE!E8` |
| egg | 500 | 666.67 | 6.2% | Normal | `NEW BRIOCHE!D9`, `NEW BRIOCHE!E9` |
| yeast | 140 | 392.00 | 3.6% | Normal | `NEW BRIOCHE!D12`, `NEW BRIOCHE!E12` |
| improver | 120 | 336.00 | 3.1% | Normal | `NEW BRIOCHE!D11`, `NEW BRIOCHE!E11` |
| Milk tantalizer | 8 | 90.00 | 0.8% | Normal | `NEW BRIOCHE!D14`, `NEW BRIOCHE!E14` |
| EDC | 25 | 75.00 | 0.7% | Normal | `NEW BRIOCHE!D15`, `NEW BRIOCHE!E15` |
| salt | 120 | 24.67 | 0.2% | Normal | `NEW BRIOCHE!D10`, `NEW BRIOCHE!E10` |
| water | 1,500 | 0.15 | 0.0% | Normal | `NEW BRIOCHE!D13`, `NEW BRIOCHE!E13` |

#### Saleable Portions and Profit Targets
| Portion | Current price | Ingredient COGS | Gross profit | GM % | Food cost % | Target price @35% FC | Price lift needed | Max weight at current price | Break-even units / base batch | Source |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 82g | 100.00 | 51.63 | 48.37 | 🔴 48.4% | 51.6% | 147.52 | 47.52 | 55.59g | 108.38 | `NEW BRIOCHE!B21`, `NEW BRIOCHE!C21` |
| 140g | 200.00 | 88.15 | 111.85 | 🟡 55.9% | 44.1% | 251.86 | 51.86 | 111.17g | 54.19 | `NEW BRIOCHE!B22`, `NEW BRIOCHE!C22` |
| 700g | 1,000 | 440.76 | 559.24 | 🟡 55.9% | 44.1% | 1,259 | 259.32 | 555.85g | 10.84 | `NEW BRIOCHE!B23`, `NEW BRIOCHE!C23` |

#### Ingredient Inflation Sensitivity
| Portion | Key ingredient | GM after key +10% | GM after key +25% | Profit action if spike happens | Source |
|---:|---|---:|---:|---|---|
| 82g | flour | 46.4% | 43.4% | Raise price immediately | `NEW BRIOCHE!E5`, `NEW BRIOCHE!B21`, `NEW BRIOCHE!C21` |
| 140g | flour | 54.2% | 51.7% | Monitor / absorb short term | `NEW BRIOCHE!E5`, `NEW BRIOCHE!B22`, `NEW BRIOCHE!C22` |
| 700g | flour | 54.2% | 51.7% | Monitor / absorb short term | `NEW BRIOCHE!E5`, `NEW BRIOCHE!B23`, `NEW BRIOCHE!C23` |

#### Standard Production Method
⚠️ assumption: method steps are professional operating templates, not sourced from the workbook. Validate with your baker before production.
1. Scale ingredients exactly from the recipe card; keep flour, yeast, salt, sugar, fat, and improver separate until mixing.
2. Mix dry ingredients, add water/liquids gradually, then develop dough until smooth and elastic.
3. Bulk ferment until dough shows visible rise; divide by target portion weight, round, rest, shape, proof, bake, cool fully, then package.

#### Profit Improvement Checklist
- Set target selling price from the table above, or resize to the listed max weight at current price.
- Record actual good units after cooling/packing and compare to theoretical yield.
- Add labor minutes by step, packaging per unit, and overhead allocation per batch.
- Review top ingredient supplier price and minimum-order quantity.
- If formula errors exist in this sheet, repair workbook formulas before relying on workbook profit rows.

### Brioche Professionel
| Field | Value | Source / note |
|---|---|---|
| Category | bread | Inferred from recipe name |
| Base batch mass | 10,750 | `Brioche Professionel!D5 + Brioche Professionel!D6 + Brioche Professionel!D7 + Brioche Professionel!D8 + Brioche Professionel!D9 + Brioche Professionel!D10 + Brioche Professionel!D11 + Brioche Professionel!D12 + Brioche Professionel!D13` |
| Base ingredient cost | 8,801 | `Brioche Professionel!E5 + Brioche Professionel!E6 + Brioche Professionel!E7 + Brioche Professionel!E8 + Brioche Professionel!E9 + Brioche Professionel!E10 + Brioche Professionel!E11 + Brioche Professionel!E12 + Brioche Professionel!E13` |
| Current verdict | Resize portion + reprice | Worst SKU is 34.5% GM; current portion is too large for the price. |
| Top-2 ingredient concentration | 54.5% | Base ingredient cost table |
| Highest-cost ingredient | flour (2,520) | `Brioche Professionel!E5` |
| Missing data to complete COGS | labor minutes/rate; packaging; overhead; actual yield; waste/shrinkage; daily volume | Add these before treating total COGS as final |

#### Ingredients
| Ingredient | Qty | Ingredient cost | % of base cost | Cost-risk note | Source |
|---|---:|---:|---:|---|---|
| flour | 6,000 | 2,520 | 28.6% | Medium | `Brioche Professionel!D5`, `Brioche Professionel!E5` |
| Butter | 1,800 | 2,274 | 25.8% | Medium | `Brioche Professionel!D6`, `Brioche Professionel!E6` |
| CONC MILK | 1,000 | 1,170 | 13.3% | Normal | `Brioche Professionel!D8`, `Brioche Professionel!E8` |
| egg | 800 | 1,067 | 12.1% | Normal | `Brioche Professionel!D9`, `Brioche Professionel!E9` |
| Nutmeg | 70 | 630.00 | 7.2% | Normal | `Brioche Professionel!D13`, `Brioche Professionel!E13` |
| sugar | 800 | 512.00 | 5.8% | Normal | `Brioche Professionel!D7`, `Brioche Professionel!E7` |
| yeast | 120 | 336.00 | 3.8% | Normal | `Brioche Professionel!D12`, `Brioche Professionel!E12` |
| improver | 100 | 280.00 | 3.2% | Normal | `Brioche Professionel!D11`, `Brioche Professionel!E11` |
| salt | 60 | 12.33 | 0.1% | Normal | `Brioche Professionel!D10`, `Brioche Professionel!E10` |

#### Saleable Portions and Profit Targets
| Portion | Current price | Ingredient COGS | Gross profit | GM % | Food cost % | Target price @35% FC | Price lift needed | Max weight at current price | Break-even units / base batch | Source |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 70g | 100.00 | 57.31 | 42.69 | 🔴 42.7% | 57.3% | 163.73 | 63.73 | 42.75g | 88.01 | `Brioche Professionel!B19`, `Brioche Professionel!C19` |
| 220g | 300.00 | 180.11 | 119.89 | 🔴 40.0% | 60.0% | 514.59 | 214.59 | 128.26g | 29.34 | `Brioche Professionel!B20`, `Brioche Professionel!C20` |
| 800g | 1,000 | 654.93 | 345.07 | 🔴 34.5% | 65.5% | 1,871 | 871.24 | 427.52g | 8.80 | `Brioche Professionel!B21`, `Brioche Professionel!C21` |

#### Ingredient Inflation Sensitivity
| Portion | Key ingredient | GM after key +10% | GM after key +25% | Profit action if spike happens | Source |
|---:|---|---:|---:|---|---|
| 70g | flour | 41.1% | 38.6% | Raise price immediately | `Brioche Professionel!E5`, `Brioche Professionel!B19`, `Brioche Professionel!C19` |
| 220g | flour | 38.2% | 35.7% | Raise price immediately | `Brioche Professionel!E5`, `Brioche Professionel!B20`, `Brioche Professionel!C20` |
| 800g | flour | 32.6% | 29.8% | Raise price immediately | `Brioche Professionel!E5`, `Brioche Professionel!B21`, `Brioche Professionel!C21` |

#### Standard Production Method
⚠️ assumption: method steps are professional operating templates, not sourced from the workbook. Validate with your baker before production.
1. Scale ingredients exactly from the recipe card; keep flour, yeast, salt, sugar, fat, and improver separate until mixing.
2. Mix dry ingredients, add water/liquids gradually, then develop dough until smooth and elastic.
3. Bulk ferment until dough shows visible rise; divide by target portion weight, round, rest, shape, proof, bake, cool fully, then package.

#### Profit Improvement Checklist
- Set target selling price from the table above, or resize to the listed max weight at current price.
- Record actual good units after cooling/packing and compare to theoretical yield.
- Add labor minutes by step, packaging per unit, and overhead allocation per batch.
- Review top ingredient supplier price and minimum-order quantity.
- If formula errors exist in this sheet, repair workbook formulas before relying on workbook profit rows.

### professinal Buns
| Field | Value | Source / note |
|---|---|---|
| Category | buns | Inferred from recipe name |
| Base batch mass | 13,905 | `professinal Buns!D5 + professinal Buns!D6 + professinal Buns!D7 + professinal Buns!D8 + professinal Buns!D9 + professinal Buns!D10 + professinal Buns!D11 + professinal Buns!D12 + professinal Buns!D13 + professinal Buns!D14 + professinal Buns!D15 + professinal Buns!D16 + professinal Buns!D17` |
| Base ingredient cost | 10,332 | `professinal Buns!E5 + professinal Buns!E6 + professinal Buns!E7 + professinal Buns!E8 + professinal Buns!E9 + professinal Buns!E10 + professinal Buns!E11 + professinal Buns!E12 + professinal Buns!E13 + professinal Buns!E14 + professinal Buns!E15 + professinal Buns!E16 + professinal Buns!E17` |
| Current verdict | Resize portion + reprice | Worst SKU is 29.4% GM; current portion is too large for the price. |
| Top-2 ingredient concentration | 55.0% | Base ingredient cost table |
| Highest-cost ingredient | flour (4,200) | `professinal Buns!E5` |
| Missing data to complete COGS | labor minutes/rate; packaging; overhead; actual yield; waste/shrinkage; daily volume | Add these before treating total COGS as final |

#### Ingredients
| Ingredient | Qty | Ingredient cost | % of base cost | Cost-risk note | Source |
|---|---:|---:|---:|---|---|
| flour | 10,000 | 4,200 | 40.7% | High | `professinal Buns!D5`, `professinal Buns!E5` |
| egg | 400 | 1,481 | 14.3% | Normal | `professinal Buns!D9`, `professinal Buns!E9` |
| Butter | 1,000 | 1,263 | 12.2% | Normal | `professinal Buns!D6`, `professinal Buns!E6` |
| CONC MILK | 700 | 819.00 | 7.9% | Normal | `professinal Buns!D8`, `professinal Buns!E8` |
| Milk tantalizer | 50 | 562.50 | 5.4% | Normal | `professinal Buns!D15`, `professinal Buns!E15` |
| sugar | 800 | 512.00 | 5.0% | Normal | `professinal Buns!D7`, `professinal Buns!E7` |
| Nutmeg | 50 | 450.00 | 4.4% | Normal | `professinal Buns!D17`, `professinal Buns!E17` |
| Oil | 300 | 366.00 | 3.5% | Normal | `professinal Buns!D16`, `professinal Buns!E16` |
| yeast | 110 | 308.00 | 3.0% | Normal | `professinal Buns!D12`, `professinal Buns!E12` |
| improver | 100 | 280.00 | 2.7% | Normal | `professinal Buns!D11`, `professinal Buns!E11` |
| EDC | 25 | 75.00 | 0.7% | Normal | `professinal Buns!D14`, `professinal Buns!E14` |
| salt | 70 | 14.39 | 0.1% | Normal | `professinal Buns!D10`, `professinal Buns!E10` |
| water | 300 | 0.03 | 0.0% | Normal | `professinal Buns!D13`, `professinal Buns!E13` |

#### Saleable Portions and Profit Targets
| Portion | Current price | Ingredient COGS | Gross profit | GM % | Food cost % | Target price @35% FC | Price lift needed | Max weight at current price | Break-even units / base batch | Source |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 95g | 100.00 | 70.59 | 29.41 | 🔴 29.4% | 70.6% | 201.67 | 101.67 | 47.11g | 103.32 | `professinal Buns!B23`, `professinal Buns!C23` |
| 140g | 150.00 | 104.02 | 45.98 | 🔴 30.7% | 69.3% | 297.20 | 147.20 | 70.66g | 68.88 | `professinal Buns!B24`, `professinal Buns!C24` |
| 800g | 1,000 | 594.41 | 405.59 | 🔴 40.6% | 59.4% | 1,698 | 698.31 | 471.06g | 10.33 | `professinal Buns!B25`, `professinal Buns!C25` |

#### Ingredient Inflation Sensitivity
| Portion | Key ingredient | GM after key +10% | GM after key +25% | Profit action if spike happens | Source |
|---:|---|---:|---:|---|---|
| 95g | flour | 26.5% | 22.2% | Raise price immediately | `professinal Buns!E5`, `professinal Buns!B23`, `professinal Buns!C23` |
| 140g | flour | 27.8% | 23.6% | Raise price immediately | `professinal Buns!E5`, `professinal Buns!B24`, `professinal Buns!C24` |
| 800g | flour | 38.1% | 34.5% | Raise price immediately | `professinal Buns!E5`, `professinal Buns!B25`, `professinal Buns!C25` |

#### Standard Production Method
⚠️ assumption: method steps are professional operating templates, not sourced from the workbook. Validate with your baker before production.
1. Scale and mix as enriched dough; add fat after initial hydration if dough development is weak.
2. Divide to target portion weight, round tightly, proof consistently, bake/fry according to house standard, cool, then package.
3. Track piece count against theoretical yield after cooling, not before, because shrink and breakage affect saleable units.

#### Profit Improvement Checklist
- Set target selling price from the table above, or resize to the listed max weight at current price.
- Record actual good units after cooling/packing and compare to theoretical yield.
- Add labor minutes by step, packaging per unit, and overhead allocation per batch.
- Review top ingredient supplier price and minimum-order quantity.
- If formula errors exist in this sheet, repair workbook formulas before relying on workbook profit rows.

### brioche
| Field | Value | Source / note |
|---|---|---|
| Category | bread | Inferred from recipe name |
| Base batch mass | 17,400 | `brioche!D5 + brioche!D6 + brioche!D7 + brioche!D8 + brioche!D9 + brioche!D10 + brioche!D11 + brioche!D12 + brioche!D13 + brioche!D14 + brioche!D15` |
| Base ingredient cost | 10,861 | `brioche!E5 + brioche!E6 + brioche!E7 + brioche!E8 + brioche!E9 + brioche!E10 + brioche!E11 + brioche!E12 + brioche!E13 + brioche!E14 + brioche!E15` |
| Current verdict | Reprice | Raise worst SKU to target price or reduce portion to 56.07g for 65% GM. |
| Top-2 ingredient concentration | 67.7% | Base ingredient cost table |
| Highest-cost ingredient | flour (4,200) | `brioche!E5` |
| Missing data to complete COGS | labor minutes/rate; packaging; overhead; actual yield; waste/shrinkage; daily volume | Add these before treating total COGS as final |

#### Ingredients
| Ingredient | Qty | Ingredient cost | % of base cost | Cost-risk note | Source |
|---|---:|---:|---:|---|---|
| flour | 10,000 | 4,200 | 38.7% | High | `brioche!D5`, `brioche!E5` |
| Butter | 2,500 | 3,158 | 29.1% | Medium | `brioche!D6`, `brioche!E6` |
| sugar | 1,500 | 960.00 | 8.8% | Normal | `brioche!D7`, `brioche!E7` |
| Milk | 800 | 936.00 | 8.6% | Normal | `brioche!D8`, `brioche!E8` |
| egg | 500 | 666.67 | 6.1% | Normal | `brioche!D9`, `brioche!E9` |
| yeast | 140 | 392.00 | 3.6% | Normal | `brioche!D12`, `brioche!E12` |
| improver | 100 | 280.00 | 2.6% | Normal | `brioche!D11`, `brioche!E11` |
| Milk tantalizer | 15 | 168.75 | 1.6% | Normal | `brioche!D14`, `brioche!E14` |
| EDC | 25 | 75.00 | 0.7% | Normal | `brioche!D15`, `brioche!E15` |
| salt | 120 | 24.67 | 0.2% | Normal | `brioche!D10`, `brioche!E10` |
| water | 1,700 | 0.17 | 0.0% | Normal | `brioche!D13`, `brioche!E13` |

#### Saleable Portions and Profit Targets
| Portion | Current price | Ingredient COGS | Gross profit | GM % | Food cost % | Target price @35% FC | Price lift needed | Max weight at current price | Break-even units / base batch | Source |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 82g | 100.00 | 51.18 | 48.82 | 🔴 48.8% | 51.2% | 146.24 | 46.24 | 56.07g | 108.61 | `brioche!B21`, `brioche!C21` |
| 160g | 200.00 | 99.87 | 100.13 | 🟡 50.1% | 49.9% | 285.35 | 85.35 | 112.14g | 54.31 | `brioche!B22`, `brioche!C22` |
| 700g | 1,000 | 436.94 | 563.06 | 🟡 56.3% | 43.7% | 1,248 | 248.41 | 560.71g | 10.86 | `brioche!B23`, `brioche!C23` |

#### Ingredient Inflation Sensitivity
| Portion | Key ingredient | GM after key +10% | GM after key +25% | Profit action if spike happens | Source |
|---:|---|---:|---:|---|---|
| 82g | flour | 46.8% | 43.9% | Raise price immediately | `brioche!E5`, `brioche!B21`, `brioche!C21` |
| 160g | flour | 48.1% | 45.2% | Raise price immediately | `brioche!E5`, `brioche!B22`, `brioche!C22` |
| 700g | flour | 54.6% | 52.1% | Monitor / absorb short term | `brioche!E5`, `brioche!B23`, `brioche!C23` |

#### Standard Production Method
⚠️ assumption: method steps are professional operating templates, not sourced from the workbook. Validate with your baker before production.
1. Scale ingredients exactly from the recipe card; keep flour, yeast, salt, sugar, fat, and improver separate until mixing.
2. Mix dry ingredients, add water/liquids gradually, then develop dough until smooth and elastic.
3. Bulk ferment until dough shows visible rise; divide by target portion weight, round, rest, shape, proof, bake, cool fully, then package.

#### Profit Improvement Checklist
- Set target selling price from the table above, or resize to the listed max weight at current price.
- Record actual good units after cooling/packing and compare to theoretical yield.
- Add labor minutes by step, packaging per unit, and overhead allocation per batch.
- Review top ingredient supplier price and minimum-order quantity.
- If formula errors exist in this sheet, repair workbook formulas before relying on workbook profit rows.

### choko bread
| Field | Value | Source / note |
|---|---|---|
| Category | bread | Inferred from recipe name |
| Base batch mass | 8,384 | `choko bread!D5 + choko bread!D6 + choko bread!D7 + choko bread!D8 + choko bread!D9 + choko bread!D10 + choko bread!D11 + choko bread!D12 + choko bread!D13 + choko bread!D14 + choko bread!D15` |
| Base ingredient cost | 5,322 | `choko bread!E5 + choko bread!E6 + choko bread!E7 + choko bread!E8 + choko bread!E9 + choko bread!E10 + choko bread!E11 + choko bread!E12 + choko bread!E13 + choko bread!E14 + choko bread!E15` |
| Current verdict | Reprice | Raise worst SKU to target price or reduce portion to 55.14g for 65% GM. |
| Top-2 ingredient concentration | 63.9% | Base ingredient cost table |
| Highest-cost ingredient | flour (2,500) | `choko bread!E5` |
| Missing data to complete COGS | labor minutes/rate; packaging; overhead; actual yield; waste/shrinkage; daily volume | Add these before treating total COGS as final |

#### Ingredients
| Ingredient | Qty | Ingredient cost | % of base cost | Cost-risk note | Source |
|---|---:|---:|---:|---|---|
| flour | 5,000 | 2,500 | 47.0% | High | `choko bread!D5`, `choko bread!E5` |
| choclate | 500 | 900.00 | 16.9% | Medium | `choko bread!D15`, `choko bread!E15` |
| egg | 200 | 851.85 | 16.0% | Medium | `choko bread!D9`, `choko bread!E9` |
| Milk | 100 | 300.00 | 5.6% | Normal | `choko bread!D8`, `choko bread!E8` |
| Butter | 200 | 294.74 | 5.5% | Normal | `choko bread!D6`, `choko bread!E6` |
| sugar | 300 | 210.00 | 3.9% | Normal | `choko bread!D7`, `choko bread!E7` |
| Nutmeg | 5 | 125.00 | 2.3% | Normal | `choko bread!D14`, `choko bread!E14` |
| improver | 20 | 60.00 | 1.1% | Normal | `choko bread!D11`, `choko bread!E11` |
| yeast | 14 | 42.00 | 0.8% | Normal | `choko bread!D12`, `choko bread!E12` |
| water | 2,000 | 30.00 | 0.6% | Normal | `choko bread!D13`, `choko bread!E13` |
| salt | 45 | 8.50 | 0.2% | Normal | `choko bread!D10`, `choko bread!E10` |

#### Saleable Portions and Profit Targets
| Portion | Current price | Ingredient COGS | Gross profit | GM % | Food cost % | Target price @35% FC | Price lift needed | Max weight at current price | Break-even units / base batch | Source |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 100g | 100.00 | 63.48 | 36.52 | 🔴 36.5% | 63.5% | 181.37 | 81.37 | 55.14g | 53.22 | `choko bread!B20`, `choko bread!C20` |
| 220g | 300.00 | 139.65 | 160.35 | 🟡 53.4% | 46.6% | 399.01 | 99.01 | 165.41g | 17.74 | `choko bread!B21`, `choko bread!C21` |
| 90g | 100.00 | 57.13 | 42.87 | 🔴 42.9% | 57.1% | 163.23 | 63.23 | 55.14g | 53.22 | `choko bread!B22`, `choko bread!C22` |

#### Ingredient Inflation Sensitivity
| Portion | Key ingredient | GM after key +10% | GM after key +25% | Profit action if spike happens | Source |
|---:|---|---:|---:|---|---|
| 100g | flour | 33.5% | 29.1% | Raise price immediately | `choko bread!E5`, `choko bread!B20`, `choko bread!C20` |
| 220g | flour | 51.3% | 48.0% | Raise price immediately | `choko bread!E5`, `choko bread!B21`, `choko bread!C21` |
| 90g | flour | 40.2% | 36.2% | Raise price immediately | `choko bread!E5`, `choko bread!B22`, `choko bread!C22` |

#### Standard Production Method
⚠️ assumption: method steps are professional operating templates, not sourced from the workbook. Validate with your baker before production.
1. Scale ingredients exactly from the recipe card; keep flour, yeast, salt, sugar, fat, and improver separate until mixing.
2. Mix dry ingredients, add water/liquids gradually, then develop dough until smooth and elastic.
3. Bulk ferment until dough shows visible rise; divide by target portion weight, round, rest, shape, proof, bake, cool fully, then package.

#### Profit Improvement Checklist
- Set target selling price from the table above, or resize to the listed max weight at current price.
- Record actual good units after cooling/packing and compare to theoretical yield.
- Add labor minutes by step, packaging per unit, and overhead allocation per batch.
- Review top ingredient supplier price and minimum-order quantity.
- If formula errors exist in this sheet, repair workbook formulas before relying on workbook profit rows.

### Cake Prof
| Field | Value | Source / note |
|---|---|---|
| Category | cake/gateau | Inferred from recipe name |
| Base batch mass | 7,850 | `Cake Prof!D5 + Cake Prof!D6 + Cake Prof!D7 + Cake Prof!D8 + Cake Prof!D9` |
| Base ingredient cost | 6,695 | `Cake Prof!E5 + Cake Prof!E6 + Cake Prof!E7 + Cake Prof!E8 + Cake Prof!E9` |
| Current verdict | Reprice | Raise worst SKU to target price or reduce portion to 41.04g for 65% GM. |
| Top-2 ingredient concentration | 64.6% | Base ingredient cost table |
| Highest-cost ingredient | Egg (2,431) | `Cake Prof!E7` |
| Missing data to complete COGS | labor minutes/rate; packaging; overhead; actual yield; waste/shrinkage; daily volume | Add these before treating total COGS as final |

#### Ingredients
| Ingredient | Qty | Ingredient cost | % of base cost | Cost-risk note | Source |
|---|---:|---:|---:|---|---|
| Egg | 1,750 | 2,431 | 36.3% | High | `Cake Prof!D7`, `Cake Prof!E7` |
| Butter | 1,500 | 1,895 | 28.3% | Medium | `Cake Prof!D8`, `Cake Prof!E8` |
| flour | 3,500 | 1,470 | 22.0% | Medium | `Cake Prof!D5`, `Cake Prof!E5` |
| sugar | 1,000 | 640.00 | 9.6% | Normal | `Cake Prof!D9`, `Cake Prof!E9` |
| baking powder | 100 | 260.00 | 3.9% | Normal | `Cake Prof!D6`, `Cake Prof!E6` |

#### Saleable Portions and Profit Targets
| Portion | Current price | Ingredient COGS | Gross profit | GM % | Food cost % | Target price @35% FC | Price lift needed | Max weight at current price | Break-even units / base batch | Source |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 230g | 500.00 | 196.17 | 303.83 | 🟡 60.8% | 39.2% | 560.48 | 60.48 | 205.18g | 13.39 | `Cake Prof!B16`, `Cake Prof!C16` |
| 57g | 100.00 | 48.62 | 51.38 | 🟡 51.4% | 48.6% | 138.90 | 38.90 | 41.04g | 66.95 | `Cake Prof!B17`, `Cake Prof!C17` |

#### Ingredient Inflation Sensitivity
| Portion | Key ingredient | GM after key +10% | GM after key +25% | Profit action if spike happens | Source |
|---:|---|---:|---:|---|---|
| 230g | Egg | 59.3% | 57.2% | Monitor / absorb short term | `Cake Prof!E7`, `Cake Prof!B16`, `Cake Prof!C16` |
| 57g | Egg | 49.6% | 47.0% | Raise price immediately | `Cake Prof!E7`, `Cake Prof!B17`, `Cake Prof!C17` |

#### Standard Production Method
⚠️ assumption: method steps are professional operating templates, not sourced from the workbook. Validate with your baker before production.
1. Cream fat and sugar or mix according to house cake method; add eggs/liquids slowly to avoid splitting.
2. Fold dry ingredients gently, portion by weight, bake until set, cool fully before cutting or packing.
3. Track batter weight, baked weight, trim, and final saleable pieces for yield control.

#### Profit Improvement Checklist
- Set target selling price from the table above, or resize to the listed max weight at current price.
- Record actual good units after cooling/packing and compare to theoretical yield.
- Add labor minutes by step, packaging per unit, and overhead allocation per batch.
- Review top ingredient supplier price and minimum-order quantity.
- If formula errors exist in this sheet, repair workbook formulas before relying on workbook profit rows.

### Pancake
| Field | Value | Source / note |
|---|---|---|
| Category | cake/gateau | Inferred from recipe name |
| Base batch mass | 7,876 | `Pancake!D5 + Pancake!D6 + Pancake!D7 + Pancake!D8 + Pancake!D9 + Pancake!D10 + Pancake!D11 + Pancake!D12 + Pancake!D13` |
| Base ingredient cost | 4,952 | `Pancake!E5 + Pancake!E6 + Pancake!E7 + Pancake!E8 + Pancake!E9 + Pancake!E10 + Pancake!E11 + Pancake!E12 + Pancake!E13` |
| Current verdict | Reprice | Raise worst SKU to target price or reduce portion to 55.67g for 65% GM. |
| Top-2 ingredient concentration | 70.5% | Base ingredient cost table |
| Highest-cost ingredient | milk (2,492) | `Pancake!E13` |
| Missing data to complete COGS | labor minutes/rate; packaging; overhead; actual yield; waste/shrinkage; daily volume | Add these before treating total COGS as final |

#### Ingredients
| Ingredient | Qty | Ingredient cost | % of base cost | Cost-risk note | Source |
|---|---:|---:|---:|---|---|
| milk | 650 | 2,492 | 50.3% | High | `Pancake!D13`, `Pancake!E13` |
| flour | 2,000 | 1,000 | 20.2% | Medium | `Pancake!D5`, `Pancake!E5` |
| sugar | 600 | 600.00 | 12.1% | Normal | `Pancake!D11`, `Pancake!E11` |
| Nut Meg | 20 | 500.00 | 10.1% | Normal | `Pancake!D8`, `Pancake!E8` |
| Egg | 36 | 153.33 | 3.1% | Normal | `Pancake!D10`, `Pancake!E10` |
| yeast | 30 | 69.00 | 1.4% | Normal | `Pancake!D6`, `Pancake!E6` |
| water | 4,500 | 67.50 | 1.4% | Normal | `Pancake!D9`, `Pancake!E9` |
| improver | 20 | 66.67 | 1.3% | Normal | `Pancake!D12`, `Pancake!E12` |
| salt | 20 | 3.78 | 0.1% | Normal | `Pancake!D7`, `Pancake!E7` |

#### Saleable Portions and Profit Targets
| Portion | Current price | Ingredient COGS | Gross profit | GM % | Food cost % | Target price @35% FC | Price lift needed | Max weight at current price | Break-even units / base batch | Source |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 60g | 100.00 | 37.72 | 62.28 | 🟡 62.3% | 37.7% | 107.78 | 7.78 | 55.67g | 49.52 | `Pancake!B19`, `Pancake!C19` |
| 50g | 100.00 | 31.44 | 68.56 | 🟢 68.6% | 31.4% | 89.82 | -10.18 | 55.67g | 49.52 | `Pancake!B20`, `Pancake!C20` |

#### Ingredient Inflation Sensitivity
| Portion | Key ingredient | GM after key +10% | GM after key +25% | Profit action if spike happens | Source |
|---:|---|---:|---:|---|---|
| 60g | milk | 60.4% | 57.5% | Monitor / absorb short term | `Pancake!E13`, `Pancake!B19`, `Pancake!C19` |
| 50g | milk | 67.0% | 64.6% | Monitor / absorb short term | `Pancake!E13`, `Pancake!B20`, `Pancake!C20` |

#### Standard Production Method
⚠️ assumption: method steps are professional operating templates, not sourced from the workbook. Validate with your baker before production.
1. Cream fat and sugar or mix according to house cake method; add eggs/liquids slowly to avoid splitting.
2. Fold dry ingredients gently, portion by weight, bake until set, cool fully before cutting or packing.
3. Track batter weight, baked weight, trim, and final saleable pieces for yield control.

#### Profit Improvement Checklist
- Set target selling price from the table above, or resize to the listed max weight at current price.
- Record actual good units after cooling/packing and compare to theoretical yield.
- Add labor minutes by step, packaging per unit, and overhead allocation per batch.
- Review top ingredient supplier price and minimum-order quantity.
- If formula errors exist in this sheet, repair workbook formulas before relying on workbook profit rows.

### Chinchin
| Field | Value | Source / note |
|---|---|---|
| Category | fried/snack | Inferred from recipe name |
| Base batch mass | 6,067 | `Chinchin!D5 + Chinchin!D6 + Chinchin!D7 + Chinchin!D8 + Chinchin!D9 + Chinchin!D10 + Chinchin!D11 + Chinchin!D12 + Chinchin!D13` |
| Base ingredient cost | 4,448 | `Chinchin!E5 + Chinchin!E6 + Chinchin!E7 + Chinchin!E8 + Chinchin!E9 + Chinchin!E10 + Chinchin!E11 + Chinchin!E12 + Chinchin!E13` |
| Current verdict | Renegotiate ingredient | Margin is acceptable but top-2 ingredients drive 70.0% of base cost. |
| Top-2 ingredient concentration | 70.0% | Base ingredient cost table |
| Highest-cost ingredient | egg (1,600) | `Chinchin!E10` |
| Missing data to complete COGS | labor minutes/rate; packaging; overhead; actual yield; waste/shrinkage; daily volume | Add these before treating total COGS as final |

#### Ingredients
| Ingredient | Qty | Ingredient cost | % of base cost | Cost-risk note | Source |
|---|---:|---:|---:|---|---|
| egg | 1,200 | 1,600 | 36.0% | High | `Chinchin!D10`, `Chinchin!E10` |
| flour | 3,600 | 1,512 | 34.0% | High | `Chinchin!D5`, `Chinchin!E5` |
| Butter | 450 | 568.42 | 12.8% | Normal | `Chinchin!D9`, `Chinchin!E9` |
| sugar | 650 | 416.00 | 9.4% | Normal | `Chinchin!D8`, `Chinchin!E8` |
| baking powder | 70 | 182.00 | 4.1% | Normal | `Chinchin!D6`, `Chinchin!E6` |
| improver | 40 | 112.00 | 2.5% | Normal | `Chinchin!D12`, `Chinchin!E12` |
| nut meg | 5 | 45.00 | 1.0% | Normal | `Chinchin!D7`, `Chinchin!E7` |
| salt | 50 | 10.28 | 0.2% | Normal | `Chinchin!D11`, `Chinchin!E11` |
| oil | 2 | 2.44 | 0.1% | Normal | `Chinchin!D13`, `Chinchin!E13` |

#### Saleable Portions and Profit Targets
| Portion | Current price | Ingredient COGS | Gross profit | GM % | Food cost % | Target price @35% FC | Price lift needed | Max weight at current price | Break-even units / base batch | Source |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 45g | 100.00 | 32.99 | 67.01 | 🟢 67.0% | 33.0% | 94.26 | -5.74 | 47.74g | 44.48 | `Chinchin!B19`, `Chinchin!C19` |
| 40g | 100.00 | 29.33 | 70.67 | 🟢 70.7% | 29.3% | 83.79 | -16.21 | 47.74g | 44.48 | `Chinchin!B20`, `Chinchin!C20` |
| 220g | 500.00 | 161.30 | 338.70 | 🟢 67.7% | 32.3% | 460.85 | -39.15 | 238.69g | 8.90 | `Chinchin!B21`, `Chinchin!C21` |

#### Ingredient Inflation Sensitivity
| Portion | Key ingredient | GM after key +10% | GM after key +25% | Profit action if spike happens | Source |
|---:|---|---:|---:|---|---|
| 45g | egg | 65.8% | 64.0% | Monitor / absorb short term | `Chinchin!E10`, `Chinchin!B19`, `Chinchin!C19` |
| 40g | egg | 69.6% | 68.0% | Monitor / absorb short term | `Chinchin!E10`, `Chinchin!B20`, `Chinchin!C20` |
| 220g | egg | 66.6% | 64.8% | Monitor / absorb short term | `Chinchin!E10`, `Chinchin!B21`, `Chinchin!C21` |

#### Standard Production Method
⚠️ assumption: method steps are professional operating templates, not sourced from the workbook. Validate with your baker before production.
1. Mix dough/batter to consistent hydration, rest where required, portion or cut by target sale weight.
2. Fry in controlled oil; drain fully before weighing and packing so oil pickup is visible in yield records.
3. Track oil usage and discard schedule separately because current workbook treats oil as an ingredient but not a process loss.

#### Profit Improvement Checklist
- Set target selling price from the table above, or resize to the listed max weight at current price.
- Record actual good units after cooling/packing and compare to theoretical yield.
- Add labor minutes by step, packaging per unit, and overhead allocation per batch.
- Review top ingredient supplier price and minimum-order quantity.
- If formula errors exist in this sheet, repair workbook formulas before relying on workbook profit rows.

### Best Chinchin
| Field | Value | Source / note |
|---|---|---|
| Category | fried/snack | Inferred from recipe name |
| Base batch mass | 60,350 | `Best Chinchin!D5 + Best Chinchin!D6 + Best Chinchin!D7 + Best Chinchin!D8 + Best Chinchin!D9 + Best Chinchin!D10 + Best Chinchin!D11 + Best Chinchin!D12 + Best Chinchin!D13 + Best Chinchin!D14` |
| Base ingredient cost | 53,829 | `Best Chinchin!E5 + Best Chinchin!E6 + Best Chinchin!E7 + Best Chinchin!E8 + Best Chinchin!E9 + Best Chinchin!E10 + Best Chinchin!E11 + Best Chinchin!E12 + Best Chinchin!E13 + Best Chinchin!E14` |
| Current verdict | Reprice | Raise worst SKU to target price or reduce portion to 392.40g for 65% GM. |
| Top-2 ingredient concentration | 61.1% | Base ingredient cost table |
| Highest-cost ingredient | oil (18,300) | `Best Chinchin!E14` |
| Missing data to complete COGS | labor minutes/rate; packaging; overhead; actual yield; waste/shrinkage; daily volume | Add these before treating total COGS as final |

#### Ingredients
| Ingredient | Qty | Ingredient cost | % of base cost | Cost-risk note | Source |
|---|---:|---:|---:|---|---|
| oil | 15,000 | 18,300 | 34.0% | High | `Best Chinchin!D14`, `Best Chinchin!E14` |
| egg | 10,500 | 14,583 | 27.1% | Medium | `Best Chinchin!D10`, `Best Chinchin!E10` |
| flour | 25,000 | 10,500 | 19.5% | Medium | `Best Chinchin!D5`, `Best Chinchin!E5` |
| Butter | 4,000 | 5,053 | 9.4% | Normal | `Best Chinchin!D9`, `Best Chinchin!E9` |
| sugar | 4,500 | 2,880 | 5.4% | Normal | `Best Chinchin!D8`, `Best Chinchin!E8` |
| baking powder | 500 | 1,300 | 2.4% | Normal | `Best Chinchin!D6`, `Best Chinchin!E6` |
| oil | 400 | 488.00 | 0.9% | Normal | `Best Chinchin!D13`, `Best Chinchin!E13` |
| nut meg | 50 | 450.00 | 0.8% | Normal | `Best Chinchin!D7`, `Best Chinchin!E7` |
| Improver | 200 | 234.00 | 0.4% | Normal | `Best Chinchin!D12`, `Best Chinchin!E12` |
| salt | 200 | 41.11 | 0.1% | Normal | `Best Chinchin!D11`, `Best Chinchin!E11` |

#### Saleable Portions and Profit Targets
| Portion | Current price | Ingredient COGS | Gross profit | GM % | Food cost % | Target price @35% FC | Price lift needed | Max weight at current price | Break-even units / base batch | Source |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 45g | 100.00 | 40.14 | 59.86 | 🟡 59.9% | 40.1% | 114.68 | 14.68 | 39.24g | 538.29 | `Best Chinchin!B19`, `Best Chinchin!C19` |
| 225g | 500.00 | 200.69 | 299.31 | 🟡 59.9% | 40.1% | 573.40 | 73.40 | 196.20g | 107.66 | `Best Chinchin!B20`, `Best Chinchin!C20` |
| 500g | 1,000 | 445.97 | 554.03 | 🟡 55.4% | 44.6% | 1,274 | 274.21 | 392.40g | 53.83 | `Best Chinchin!B21`, `Best Chinchin!C21` |

#### Ingredient Inflation Sensitivity
| Portion | Key ingredient | GM after key +10% | GM after key +25% | Profit action if spike happens | Source |
|---:|---|---:|---:|---|---|
| 45g | oil | 58.5% | 56.5% | Monitor / absorb short term | `Best Chinchin!E14`, `Best Chinchin!B19`, `Best Chinchin!C19` |
| 225g | oil | 58.5% | 56.5% | Monitor / absorb short term | `Best Chinchin!E14`, `Best Chinchin!B20`, `Best Chinchin!C20` |
| 500g | oil | 53.9% | 51.6% | Monitor / absorb short term | `Best Chinchin!E14`, `Best Chinchin!B21`, `Best Chinchin!C21` |

#### Standard Production Method
⚠️ assumption: method steps are professional operating templates, not sourced from the workbook. Validate with your baker before production.
1. Mix dough/batter to consistent hydration, rest where required, portion or cut by target sale weight.
2. Fry in controlled oil; drain fully before weighing and packing so oil pickup is visible in yield records.
3. Track oil usage and discard schedule separately because current workbook treats oil as an ingredient but not a process loss.

#### Profit Improvement Checklist
- Set target selling price from the table above, or resize to the listed max weight at current price.
- Record actual good units after cooling/packing and compare to theoretical yield.
- Add labor minutes by step, packaging per unit, and overhead allocation per batch.
- Review top ingredient supplier price and minimum-order quantity.
- If formula errors exist in this sheet, repair workbook formulas before relying on workbook profit rows.

### Sugar Balls
| Field | Value | Source / note |
|---|---|---|
| Category | fried/snack | Inferred from recipe name |
| Base batch mass | 17,010 | `Sugar Balls!D5 + Sugar Balls!D6 + Sugar Balls!D7 + Sugar Balls!D8 + Sugar Balls!D9 + Sugar Balls!D10 + Sugar Balls!D11 + Sugar Balls!D12` |
| Base ingredient cost | 7,178 | `Sugar Balls!E5 + Sugar Balls!E6 + Sugar Balls!E7 + Sugar Balls!E8 + Sugar Balls!E9 + Sugar Balls!E10 + Sugar Balls!E11 + Sugar Balls!E12` |
| Current verdict | Renegotiate ingredient | Margin is acceptable but top-2 ingredients drive 76.1% of base cost. |
| Top-2 ingredient concentration | 76.1% | Base ingredient cost table |
| Highest-cost ingredient | flour (4,200) | `Sugar Balls!E5` |
| Missing data to complete COGS | labor minutes/rate; packaging; overhead; actual yield; waste/shrinkage; daily volume | Add these before treating total COGS as final |

#### Ingredients
| Ingredient | Qty | Ingredient cost | % of base cost | Cost-risk note | Source |
|---|---:|---:|---:|---|---|
| flour | 10,000 | 4,200 | 58.5% | High | `Sugar Balls!D5`, `Sugar Balls!E5` |
| Butter | 1,000 | 1,263 | 17.6% | Medium | `Sugar Balls!D8`, `Sugar Balls!E8` |
| sugar | 1,000 | 640.00 | 8.9% | Normal | `Sugar Balls!D7`, `Sugar Balls!E7` |
| yeast | 160 | 448.00 | 6.2% | Normal | `Sugar Balls!D12`, `Sugar Balls!E12` |
| Improver | 120 | 312.00 | 4.3% | Normal | `Sugar Balls!D11`, `Sugar Balls!E11` |
| baking powder | 110 | 286.00 | 4.0% | Normal | `Sugar Balls!D6`, `Sugar Balls!E6` |
| salt | 120 | 24.67 | 0.3% | Normal | `Sugar Balls!D9`, `Sugar Balls!E9` |
| Cold Water | 4,500 | 4.50 | 0.1% | Normal | `Sugar Balls!D10`, `Sugar Balls!E10` |

#### Saleable Portions and Profit Targets
| Portion | Current price | Ingredient COGS | Gross profit | GM % | Food cost % | Target price @35% FC | Price lift needed | Max weight at current price | Break-even units / base batch | Source |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 80g | 100.00 | 33.76 | 66.24 | 🟢 66.2% | 33.8% | 96.46 | -3.54 | 82.94g | 71.78 | `Sugar Balls!B18`, `Sugar Balls!C18` |
| 80g | 100.00 | 33.76 | 66.24 | 🟢 66.2% | 33.8% | 96.46 | -3.54 | 82.94g | 71.78 | `Sugar Balls!B19`, `Sugar Balls!C19` |
| 150g | 500.00 | 63.30 | 436.70 | 🟢 87.3% | 12.7% | 180.86 | -319.14 | 414.69g | 14.36 | `Sugar Balls!B20`, `Sugar Balls!C20` |

#### Ingredient Inflation Sensitivity
| Portion | Key ingredient | GM after key +10% | GM after key +25% | Profit action if spike happens | Source |
|---:|---|---:|---:|---|---|
| 80g | flour | 64.3% | 61.3% | Monitor / absorb short term | `Sugar Balls!E5`, `Sugar Balls!B18`, `Sugar Balls!C18` |
| 80g | flour | 64.3% | 61.3% | Monitor / absorb short term | `Sugar Balls!E5`, `Sugar Balls!B19`, `Sugar Balls!C19` |
| 150g | flour | 86.6% | 85.5% | Monitor / absorb short term | `Sugar Balls!E5`, `Sugar Balls!B20`, `Sugar Balls!C20` |

#### Standard Production Method
⚠️ assumption: method steps are professional operating templates, not sourced from the workbook. Validate with your baker before production.
1. Mix dough/batter to consistent hydration, rest where required, portion or cut by target sale weight.
2. Fry in controlled oil; drain fully before weighing and packing so oil pickup is visible in yield records.
3. Track oil usage and discard schedule separately because current workbook treats oil as an ingredient but not a process loss.

#### Profit Improvement Checklist
- Set target selling price from the table above, or resize to the listed max weight at current price.
- Record actual good units after cooling/packing and compare to theoretical yield.
- Add labor minutes by step, packaging per unit, and overhead allocation per batch.
- Review top ingredient supplier price and minimum-order quantity.
- If formula errors exist in this sheet, repair workbook formulas before relying on workbook profit rows.

### Delice
| Field | Value | Source / note |
|---|---|---|
| Category | biscuit/sweet | Inferred from recipe name |
| Base batch mass | 6,785 | `Delice!D5 + Delice!D6 + Delice!D7 + Delice!D8 + Delice!D9 + Delice!D10 + Delice!D11 + Delice!D12 + Delice!D13 + Delice!D14 + Delice!D15 + Delice!D16 + Delice!D17` |
| Base ingredient cost | 4,825 | `Delice!E5 + Delice!E6 + Delice!E7 + Delice!E8 + Delice!E9 + Delice!E10 + Delice!E11 + Delice!E12 + Delice!E13 + Delice!E14 + Delice!E15 + Delice!E16 + Delice!E17` |
| Current verdict | Reprice | Raise worst SKU to target price or reduce portion to 492.17g for 65% GM. |
| Top-2 ingredient concentration | 52.1% | Base ingredient cost table |
| Highest-cost ingredient | flour (1,260) | `Delice!E5` |
| Missing data to complete COGS | labor minutes/rate; packaging; overhead; actual yield; waste/shrinkage; daily volume | Add these before treating total COGS as final |

#### Ingredients
| Ingredient | Qty | Ingredient cost | % of base cost | Cost-risk note | Source |
|---|---:|---:|---:|---|---|
| flour | 3,000 | 1,260 | 26.1% | Medium | `Delice!D5`, `Delice!E5` |
| Chocolate | 700 | 1,253 | 26.0% | Medium | `Delice!D15`, `Delice!E15` |
| Butter | 500 | 631.58 | 13.1% | Normal | `Delice!D6`, `Delice!E6` |
| honey | 400 | 500.00 | 10.4% | Normal | `Delice!D16`, `Delice!E16` |
| egg | 250 | 333.33 | 6.9% | Normal | `Delice!D9`, `Delice!E9` |
| Milk | 250 | 292.50 | 6.1% | Normal | `Delice!D8`, `Delice!E8` |
| sugar | 300 | 192.00 | 4.0% | Normal | `Delice!D7`, `Delice!E7` |
| EDC | 50 | 150.00 | 3.1% | Normal | `Delice!D17`, `Delice!E17` |
| improver | 40 | 112.00 | 2.3% | Normal | `Delice!D11`, `Delice!E11` |
| yeast | 30 | 84.00 | 1.7% | Normal | `Delice!D12`, `Delice!E12` |
| baking powder | 30 | 9.75 | 0.2% | Normal | `Delice!D14`, `Delice!E14` |
| salt | 35 | 7.19 | 0.1% | Normal | `Delice!D10`, `Delice!E10` |
| water | 1,200 | 0.12 | 0.0% | Normal | `Delice!D13`, `Delice!E13` |

#### Saleable Portions and Profit Targets
| Portion | Current price | Ingredient COGS | Gross profit | GM % | Food cost % | Target price @35% FC | Price lift needed | Max weight at current price | Break-even units / base batch | Source |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 700g | 1,000 | 497.80 | 502.20 | 🟡 50.2% | 49.8% | 1,422 | 422.29 | 492.17g | 4.83 | `Delice!B23`, `Delice!C23` |
| 140g | 200.00 | 99.56 | 100.44 | 🟡 50.2% | 49.8% | 284.46 | 84.46 | 98.43g | 24.13 | `Delice!B24`, `Delice!C24` |
| 700g | 1,000 | 497.80 | 502.20 | 🟡 50.2% | 49.8% | 1,422 | 422.29 | 492.17g | 4.83 | `Delice!B25`, `Delice!C25` |

#### Ingredient Inflation Sensitivity
| Portion | Key ingredient | GM after key +10% | GM after key +25% | Profit action if spike happens | Source |
|---:|---|---:|---:|---|---|
| 700g | flour | 48.9% | 47.0% | Raise price immediately | `Delice!E5`, `Delice!B23`, `Delice!C23` |
| 140g | flour | 48.9% | 47.0% | Raise price immediately | `Delice!E5`, `Delice!B24`, `Delice!C24` |
| 700g | flour | 48.9% | 47.0% | Raise price immediately | `Delice!E5`, `Delice!B25`, `Delice!C25` |

#### Standard Production Method
⚠️ assumption: method steps are professional operating templates, not sourced from the workbook. Validate with your baker before production.
1. Mix dough until uniform, avoid overworking after flour addition, portion or sheet to consistent thickness.
2. Bake/fry according to house standard, cool fully, then pack by weight or count.
3. Track broken pieces, trim, and underweight packs as shrink.

#### Profit Improvement Checklist
- Set target selling price from the table above, or resize to the listed max weight at current price.
- Record actual good units after cooling/packing and compare to theoretical yield.
- Add labor minutes by step, packaging per unit, and overhead allocation per batch.
- Review top ingredient supplier price and minimum-order quantity.
- If formula errors exist in this sheet, repair workbook formulas before relying on workbook profit rows.

### Danisa biscuits
| Field | Value | Source / note |
|---|---|---|
| Category | biscuit/sweet | Inferred from recipe name |
| Base batch mass | 7,027 | `Danisa biscuits!D5 + Danisa biscuits!D6 + Danisa biscuits!D7 + Danisa biscuits!D8 + Danisa biscuits!D9 + Danisa biscuits!D10 + Danisa biscuits!D11 + Danisa biscuits!D12 + Danisa biscuits!D13 + Danisa biscuits!D14 + Danisa biscuits!D15 + Danisa biscuits!D16 + Danisa biscuits!D17` |
| Base ingredient cost | 5,118 | `Danisa biscuits!E5 + Danisa biscuits!E6 + Danisa biscuits!E7 + Danisa biscuits!E8 + Danisa biscuits!E9 + Danisa biscuits!E10 + Danisa biscuits!E11 + Danisa biscuits!E12 + Danisa biscuits!E13 + Danisa biscuits!E14 + Danisa biscuits!E15 + Danisa biscuits!E16 + Danisa biscuits!E17` |
| Current verdict | Reprice | Raise worst SKU to target price or reduce portion to 480.51g for 65% GM. |
| Top-2 ingredient concentration | 49.1% | Base ingredient cost table |
| Highest-cost ingredient | flour (1,260) | `Danisa biscuits!E5` |
| Missing data to complete COGS | labor minutes/rate; packaging; overhead; actual yield; waste/shrinkage; daily volume | Add these before treating total COGS as final |

#### Ingredients
| Ingredient | Qty | Ingredient cost | % of base cost | Cost-risk note | Source |
|---|---:|---:|---:|---|---|
| flour | 3,000 | 1,260 | 24.6% | Medium | `Danisa biscuits!D5`, `Danisa biscuits!E5` |
| Chocolate | 700 | 1,253 | 24.5% | Medium | `Danisa biscuits!D15`, `Danisa biscuits!E15` |
| honey | 700 | 875.00 | 17.1% | Medium | `Danisa biscuits!D16`, `Danisa biscuits!E16` |
| Butter | 500 | 631.58 | 12.3% | Normal | `Danisa biscuits!D6`, `Danisa biscuits!E6` |
| Milk | 250 | 292.50 | 5.7% | Normal | `Danisa biscuits!D8`, `Danisa biscuits!E8` |
| egg | 200 | 266.67 | 5.2% | Normal | `Danisa biscuits!D9`, `Danisa biscuits!E9` |
| sugar | 300 | 192.00 | 3.8% | Normal | `Danisa biscuits!D7`, `Danisa biscuits!E7` |
| EDC | 50 | 150.00 | 2.9% | Normal | `Danisa biscuits!D17`, `Danisa biscuits!E17` |
| improver | 40 | 112.00 | 2.2% | Normal | `Danisa biscuits!D11`, `Danisa biscuits!E11` |
| yeast | 25 | 70.00 | 1.4% | Normal | `Danisa biscuits!D12`, `Danisa biscuits!E12` |
| baking powder | 27 | 8.78 | 0.2% | Normal | `Danisa biscuits!D14`, `Danisa biscuits!E14` |
| salt | 35 | 7.19 | 0.1% | Normal | `Danisa biscuits!D10`, `Danisa biscuits!E10` |
| water | 1,200 | 0.12 | 0.0% | Normal | `Danisa biscuits!D13`, `Danisa biscuits!E13` |

#### Saleable Portions and Profit Targets
| Portion | Current price | Ingredient COGS | Gross profit | GM % | Food cost % | Target price @35% FC | Price lift needed | Max weight at current price | Break-even units / base batch | Source |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 850g | 1,000 | 619.14 | 380.86 | 🔴 38.1% | 61.9% | 1,769 | 768.97 | 480.51g | 5.12 | `Danisa biscuits!B23`, `Danisa biscuits!C23` |
| 140g | 200.00 | 101.98 | 98.02 | 🔴 49.0% | 51.0% | 291.36 | 91.36 | 96.10g | 25.59 | `Danisa biscuits!B24`, `Danisa biscuits!C24` |
| 700g | 1,000 | 509.88 | 490.12 | 🔴 49.0% | 51.0% | 1,457 | 456.80 | 480.51g | 5.12 | `Danisa biscuits!B25`, `Danisa biscuits!C25` |

#### Ingredient Inflation Sensitivity
| Portion | Key ingredient | GM after key +10% | GM after key +25% | Profit action if spike happens | Source |
|---:|---|---:|---:|---|---|
| 850g | flour | 36.6% | 34.3% | Raise price immediately | `Danisa biscuits!E5`, `Danisa biscuits!B23`, `Danisa biscuits!C23` |
| 140g | flour | 47.8% | 45.9% | Raise price immediately | `Danisa biscuits!E5`, `Danisa biscuits!B24`, `Danisa biscuits!C24` |
| 700g | flour | 47.8% | 45.9% | Raise price immediately | `Danisa biscuits!E5`, `Danisa biscuits!B25`, `Danisa biscuits!C25` |

#### Standard Production Method
⚠️ assumption: method steps are professional operating templates, not sourced from the workbook. Validate with your baker before production.
1. Mix dough until uniform, avoid overworking after flour addition, portion or sheet to consistent thickness.
2. Bake/fry according to house standard, cool fully, then pack by weight or count.
3. Track broken pieces, trim, and underweight packs as shrink.

#### Profit Improvement Checklist
- Set target selling price from the table above, or resize to the listed max weight at current price.
- Record actual good units after cooling/packing and compare to theoretical yield.
- Add labor minutes by step, packaging per unit, and overhead allocation per batch.
- Review top ingredient supplier price and minimum-order quantity.
- If formula errors exist in this sheet, repair workbook formulas before relying on workbook profit rows.

### Okinawa
| Field | Value | Source / note |
|---|---|---|
| Category | biscuit/sweet | Inferred from recipe name |
| Base batch mass | 7,400 | `Okinawa!D5 + Okinawa!D6 + Okinawa!D7 + Okinawa!D8 + Okinawa!D9 + Okinawa!D10 + Okinawa!D11` |
| Base ingredient cost | 4,434 | `Okinawa!E5 + Okinawa!E6 + Okinawa!E7 + Okinawa!E8 + Okinawa!E9 + Okinawa!E10 + Okinawa!E11` |
| Current verdict | Reprice | Raise worst SKU to target price or reduce portion to 58.41g for 65% GM. |
| Top-2 ingredient concentration | 79.6% | Base ingredient cost table |
| Highest-cost ingredient | flour (2,310) | `Okinawa!E5` |
| Missing data to complete COGS | labor minutes/rate; packaging; overhead; actual yield; waste/shrinkage; daily volume | Add these before treating total COGS as final |

#### Ingredients
| Ingredient | Qty | Ingredient cost | % of base cost | Cost-risk note | Source |
|---|---:|---:|---:|---|---|
| flour | 5,500 | 2,310 | 52.1% | High | `Okinawa!D5`, `Okinawa!E5` |
| frying oil | 1,000 | 1,220 | 27.5% | Medium | `Okinawa!D11`, `Okinawa!E11` |
| sugar | 500 | 320.00 | 7.2% | Normal | `Okinawa!D7`, `Okinawa!E7` |
| baking powder | 100 | 260.00 | 5.9% | Normal | `Okinawa!D6`, `Okinawa!E6` |
| egg | 200 | 252.63 | 5.7% | Normal | `Okinawa!D8`, `Okinawa!E8` |
| oil | 50 | 61.00 | 1.4% | Normal | `Okinawa!D10`, `Okinawa!E10` |
| salt | 50 | 10.28 | 0.2% | Normal | `Okinawa!D9`, `Okinawa!E9` |

#### Saleable Portions and Profit Targets
| Portion | Current price | Ingredient COGS | Gross profit | GM % | Food cost % | Target price @35% FC | Price lift needed | Max weight at current price | Break-even units / base batch | Source |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 80g | 100.00 | 47.93 | 52.07 | 🟡 52.1% | 47.9% | 136.95 | 36.95 | 58.41g | 44.34 | `Okinawa!B16`, `Okinawa!C16` |
| 80g | 100.00 | 47.93 | 52.07 | 🟡 52.1% | 47.9% | 136.95 | 36.95 | 58.41g | 44.34 | `Okinawa!B17`, `Okinawa!C17` |
| 150g | 500.00 | 89.88 | 410.12 | 🟢 82.0% | 18.0% | 256.79 | -243.21 | 292.07g | 8.87 | `Okinawa!B18`, `Okinawa!C18` |

#### Ingredient Inflation Sensitivity
| Portion | Key ingredient | GM after key +10% | GM after key +25% | Profit action if spike happens | Source |
|---:|---|---:|---:|---|---|
| 80g | flour | 49.6% | 45.8% | Raise price immediately | `Okinawa!E5`, `Okinawa!B16`, `Okinawa!C16` |
| 80g | flour | 49.6% | 45.8% | Raise price immediately | `Okinawa!E5`, `Okinawa!B17`, `Okinawa!C17` |
| 150g | flour | 81.1% | 79.7% | Monitor / absorb short term | `Okinawa!E5`, `Okinawa!B18`, `Okinawa!C18` |

#### Standard Production Method
⚠️ assumption: method steps are professional operating templates, not sourced from the workbook. Validate with your baker before production.
1. Mix dough until uniform, avoid overworking after flour addition, portion or sheet to consistent thickness.
2. Bake/fry according to house standard, cool fully, then pack by weight or count.
3. Track broken pieces, trim, and underweight packs as shrink.

#### Profit Improvement Checklist
- Set target selling price from the table above, or resize to the listed max weight at current price.
- Record actual good units after cooling/packing and compare to theoretical yield.
- Add labor minutes by step, packaging per unit, and overhead allocation per batch.
- Review top ingredient supplier price and minimum-order quantity.
- If formula errors exist in this sheet, repair workbook formulas before relying on workbook profit rows.

### CAKE NOW
| Field | Value | Source / note |
|---|---|---|
| Category | cake/gateau | Inferred from recipe name |
| Base batch mass | 7,100 | `CAKE NOW!D5 + CAKE NOW!D6 + CAKE NOW!D7 + CAKE NOW!D9 + CAKE NOW!D10` |
| Base ingredient cost | 6,138 | `CAKE NOW!E5 + CAKE NOW!E6 + CAKE NOW!E7 + CAKE NOW!E9 + CAKE NOW!E10` |
| Current verdict | Reprice | Raise worst SKU to target price or reduce portion to 40.49g for 65% GM. |
| Top-2 ingredient concentration | 64.8% | Base ingredient cost table |
| Highest-cost ingredient | Egg (2,083) | `CAKE NOW!E7` |
| Missing data to complete COGS | labor minutes/rate; packaging; overhead; actual yield; waste/shrinkage; daily volume | Add these before treating total COGS as final |

#### Ingredients
| Ingredient | Qty | Ingredient cost | % of base cost | Cost-risk note | Source |
|---|---:|---:|---:|---|---|
| Egg | 1,500 | 2,083 | 33.9% | High | `CAKE NOW!D7`, `CAKE NOW!E7` |
| Butter | 1,500 | 1,895 | 30.9% | High | `CAKE NOW!D9`, `CAKE NOW!E9` |
| flour | 3,000 | 1,260 | 20.5% | Medium | `CAKE NOW!D5`, `CAKE NOW!E5` |
| sugar | 1,000 | 640.00 | 10.4% | Normal | `CAKE NOW!D10`, `CAKE NOW!E10` |
| baking powder | 100 | 260.00 | 4.2% | Normal | `CAKE NOW!D6`, `CAKE NOW!E6` |
| water | n/a | n/a | 0.0% | Normal | `CAKE NOW!D8`, `CAKE NOW!E8` |

#### Saleable Portions and Profit Targets
| Portion | Current price | Ingredient COGS | Gross profit | GM % | Food cost % | Target price @35% FC | Price lift needed | Max weight at current price | Break-even units / base batch | Source |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 220g | 500.00 | 190.19 | 309.81 | 🟡 62.0% | 38.0% | 543.41 | 43.41 | 202.43g | 12.28 | `CAKE NOW!B17`, `CAKE NOW!C17` |
| 60g | 100.00 | 51.87 | 48.13 | 🔴 48.1% | 51.9% | 148.20 | 48.20 | 40.49g | 61.38 | `CAKE NOW!B18`, `CAKE NOW!C18` |

#### Ingredient Inflation Sensitivity
| Portion | Key ingredient | GM after key +10% | GM after key +25% | Profit action if spike happens | Source |
|---:|---|---:|---:|---|---|
| 220g | Egg | 60.7% | 58.7% | Monitor / absorb short term | `CAKE NOW!E7`, `CAKE NOW!B17`, `CAKE NOW!C17` |
| 60g | Egg | 46.4% | 43.7% | Raise price immediately | `CAKE NOW!E7`, `CAKE NOW!B18`, `CAKE NOW!C18` |

#### Standard Production Method
⚠️ assumption: method steps are professional operating templates, not sourced from the workbook. Validate with your baker before production.
1. Cream fat and sugar or mix according to house cake method; add eggs/liquids slowly to avoid splitting.
2. Fold dry ingredients gently, portion by weight, bake until set, cool fully before cutting or packing.
3. Track batter weight, baked weight, trim, and final saleable pieces for yield control.

#### Profit Improvement Checklist
- Set target selling price from the table above, or resize to the listed max weight at current price.
- Record actual good units after cooling/packing and compare to theoretical yield.
- Add labor minutes by step, packaging per unit, and overhead allocation per batch.
- Review top ingredient supplier price and minimum-order quantity.
- If formula errors exist in this sheet, repair workbook formulas before relying on workbook profit rows.

### Short bread
| Field | Value | Source / note |
|---|---|---|
| Category | biscuit/sweet | Inferred from recipe name |
| Base batch mass | 3,950 | `Short bread!D5 + Short bread!D6 + Short bread!D7 + Short bread!D8 + Short bread!D9 + Short bread!D10 + Short bread!D11` |
| Base ingredient cost | 2,983 | `Short bread!E5 + Short bread!E6 + Short bread!E7 + Short bread!E8 + Short bread!E9 + Short bread!E10 + Short bread!E11` |
| Current verdict | Reformulate + reprice | Worst SKU is 32.0% GM and top-2 ingredients drive 70.5% of base cost. |
| Top-2 ingredient concentration | 70.5% | Base ingredient cost table |
| Highest-cost ingredient | Butter (1,263) | `Short bread!E6` |
| Missing data to complete COGS | labor minutes/rate; packaging; overhead; actual yield; waste/shrinkage; daily volume | Add these before treating total COGS as final |

#### Ingredients
| Ingredient | Qty | Ingredient cost | % of base cost | Cost-risk note | Source |
|---|---:|---:|---:|---|---|
| Butter | 1,000 | 1,263 | 42.3% | High | `Short bread!D6`, `Short bread!E6` |
| flour | 2,000 | 840.00 | 28.2% | Medium | `Short bread!D5`, `Short bread!E5` |
| sugar | 400 | 256.00 | 8.6% | Normal | `Short bread!D10`, `Short bread!E10` |
| milk | 200 | 234.00 | 7.8% | Normal | `Short bread!D9`, `Short bread!E9` |
| icing sugar | 100 | 220.00 | 7.4% | Normal | `Short bread!D7`, `Short bread!E7` |
| egg | 100 | 138.89 | 4.7% | Normal | `Short bread!D8`, `Short bread!E8` |
| salt | 150 | 30.83 | 1.0% | Normal | `Short bread!D11`, `Short bread!E11` |

#### Saleable Portions and Profit Targets
| Portion | Current price | Ingredient COGS | Gross profit | GM % | Food cost % | Target price @35% FC | Price lift needed | Max weight at current price | Break-even units / base batch | Source |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 38g | 50.00 | 28.70 | 21.30 | 🔴 42.6% | 57.4% | 81.99 | 31.99 | 23.17g | 59.66 | `Short bread!B17`, `Short bread!C17` |
| 45g | 50.00 | 33.98 | 16.02 | 🔴 32.0% | 68.0% | 97.09 | 47.09 | 23.17g | 59.66 | `Short bread!B18`, `Short bread!C18` |

#### Ingredient Inflation Sensitivity
| Portion | Key ingredient | GM after key +10% | GM after key +25% | Profit action if spike happens | Source |
|---:|---|---:|---:|---|---|
| 38g | Butter | 40.2% | 36.5% | Raise price immediately | `Short bread!E6`, `Short bread!B17`, `Short bread!C17` |
| 45g | Butter | 29.2% | 24.8% | Raise price immediately | `Short bread!E6`, `Short bread!B18`, `Short bread!C18` |

#### Standard Production Method
⚠️ assumption: method steps are professional operating templates, not sourced from the workbook. Validate with your baker before production.
1. Mix dough until uniform, avoid overworking after flour addition, portion or sheet to consistent thickness.
2. Bake/fry according to house standard, cool fully, then pack by weight or count.
3. Track broken pieces, trim, and underweight packs as shrink.

#### Profit Improvement Checklist
- Set target selling price from the table above, or resize to the listed max weight at current price.
- Record actual good units after cooling/packing and compare to theoretical yield.
- Add labor minutes by step, packaging per unit, and overhead allocation per batch.
- Review top ingredient supplier price and minimum-order quantity.
- If formula errors exist in this sheet, repair workbook formulas before relying on workbook profit rows.

### Melto
| Field | Value | Source / note |
|---|---|---|
| Category | biscuit/sweet | Inferred from recipe name |
| Base batch mass | 7,490 | `Melto!D5 + Melto!D6 + Melto!D7 + Melto!D8 + Melto!D9 + Melto!D10` |
| Base ingredient cost | 5,769 | `Melto!E5 + Melto!E6 + Melto!E7 + Melto!E8 + Melto!E9 + Melto!E10` |
| Current verdict | Reformulate + reprice | Worst SKU is 30.7% GM and top-2 ingredients drive 76.6% of base cost. |
| Top-2 ingredient concentration | 76.6% | Base ingredient cost table |
| Highest-cost ingredient | Butter (2,526) | `Melto!E6` |
| Missing data to complete COGS | labor minutes/rate; packaging; overhead; actual yield; waste/shrinkage; daily volume | Add these before treating total COGS as final |

#### Ingredients
| Ingredient | Qty | Ingredient cost | % of base cost | Cost-risk note | Source |
|---|---:|---:|---:|---|---|
| Butter | 2,000 | 2,526 | 43.8% | High | `Melto!D6`, `Melto!E6` |
| flour | 4,500 | 1,890 | 32.8% | High | `Melto!D5`, `Melto!E5` |
| icing sugar | 400 | 880.00 | 15.3% | Medium | `Melto!D7`, `Melto!E7` |
| sugar | 400 | 256.00 | 4.4% | Normal | `Melto!D9`, `Melto!E9` |
| egg | 150 | 208.33 | 3.6% | Normal | `Melto!D8`, `Melto!E8` |
| salt | 40 | 8.22 | 0.1% | Normal | `Melto!D10`, `Melto!E10` |

#### Saleable Portions and Profit Targets
| Portion | Current price | Ingredient COGS | Gross profit | GM % | Food cost % | Target price @35% FC | Price lift needed | Max weight at current price | Break-even units / base batch | Source |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 34g | 50.00 | 26.19 | 23.81 | 🔴 47.6% | 52.4% | 74.82 | 24.82 | 22.72g | 115.38 | `Melto!B16`, `Melto!C16` |
| 45g | 50.00 | 34.66 | 15.34 | 🔴 30.7% | 69.3% | 99.03 | 49.03 | 22.72g | 115.38 | `Melto!B17`, `Melto!C17` |

#### Ingredient Inflation Sensitivity
| Portion | Key ingredient | GM after key +10% | GM after key +25% | Profit action if spike happens | Source |
|---:|---|---:|---:|---|---|
| 34g | Butter | 45.3% | 41.9% | Raise price immediately | `Melto!E6`, `Melto!B16`, `Melto!C16` |
| 45g | Butter | 27.6% | 23.1% | Raise price immediately | `Melto!E6`, `Melto!B17`, `Melto!C17` |

#### Standard Production Method
⚠️ assumption: method steps are professional operating templates, not sourced from the workbook. Validate with your baker before production.
1. Mix dough until uniform, avoid overworking after flour addition, portion or sheet to consistent thickness.
2. Bake/fry according to house standard, cool fully, then pack by weight or count.
3. Track broken pieces, trim, and underweight packs as shrink.

#### Profit Improvement Checklist
- Set target selling price from the table above, or resize to the listed max weight at current price.
- Record actual good units after cooling/packing and compare to theoretical yield.
- Add labor minutes by step, packaging per unit, and overhead allocation per batch.
- Review top ingredient supplier price and minimum-order quantity.
- If formula errors exist in this sheet, repair workbook formulas before relying on workbook profit rows.

### Ice Cream
| Field | Value | Source / note |
|---|---|---|
| Category | ice cream | Inferred from recipe name |
| Base batch mass | 15,500 | `Ice Cream!D5 + Ice Cream!D6 + Ice Cream!D7 + Ice Cream!D8 + Ice Cream!D9` |
| Base ingredient cost | 9,360 | `Ice Cream!E5 + Ice Cream!E6 + Ice Cream!E7 + Ice Cream!E8 + Ice Cream!E9` |
| Current verdict | Reprice | Raise worst SKU to target price or reduce portion to 28.98g for 65% GM. |
| Top-2 ingredient concentration | 65.0% | Base ingredient cost table |
| Highest-cost ingredient | Powdered Milk (3,520) | `Ice Cream!E6` |
| Missing data to complete COGS | labor minutes/rate; packaging; overhead; actual yield; waste/shrinkage; daily volume | Add these before treating total COGS as final |

#### Ingredients
| Ingredient | Qty | Ingredient cost | % of base cost | Cost-risk note | Source |
|---|---:|---:|---:|---|---|
| Powdered Milk | 1,100 | 3,520 | 37.6% | High | `Ice Cream!D6`, `Ice Cream!E6` |
| Stabilizer | 200 | 2,560 | 27.4% | Medium | `Ice Cream!D5`, `Ice Cream!E5` |
| others | 200 | 2,000 | 21.4% | Medium | `Ice Cream!D9`, `Ice Cream!E9` |
| Sugar | 2,000 | 1,280 | 13.7% | Normal | `Ice Cream!D7`, `Ice Cream!E7` |
| Water | 12,000 | 0.00 | 0.0% | Normal | `Ice Cream!D8`, `Ice Cream!E8` |

#### Saleable Portions and Profit Targets
| Portion | Current price | Ingredient COGS | Gross profit | GM % | Food cost % | Target price @35% FC | Price lift needed | Max weight at current price | Break-even units / base batch | Source |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 70g | 100.00 | 42.27 | 57.73 | 🟡 57.7% | 42.3% | 120.77 | 20.77 | 57.96g | 93.60 | `Ice Cream!B14`, `Ice Cream!C14` |
| 45g | 50.00 | 27.17 | 22.83 | 🔴 45.7% | 54.3% | 77.64 | 27.64 | 28.98g | 187.20 | `Ice Cream!B15`, `Ice Cream!C15` |

#### Ingredient Inflation Sensitivity
| Portion | Key ingredient | GM after key +10% | GM after key +25% | Profit action if spike happens | Source |
|---:|---|---:|---:|---|---|
| 70g | Powdered Milk | 56.1% | 53.8% | Monitor / absorb short term | `Ice Cream!E6`, `Ice Cream!B14`, `Ice Cream!C14` |
| 45g | Powdered Milk | 43.6% | 40.5% | Raise price immediately | `Ice Cream!E6`, `Ice Cream!B15`, `Ice Cream!C15` |

#### Standard Production Method
⚠️ assumption: method steps are professional operating templates, not sourced from the workbook. Validate with your baker before production.
1. Confirm recipe units before production; current workbook does not provide freezing loss or churn yield.
2. Batch, freeze/churn according to house process, then measure final saleable volume/weight.
3. Track container loss and temperature-related shrink separately.

#### Profit Improvement Checklist
- Set target selling price from the table above, or resize to the listed max weight at current price.
- Record actual good units after cooling/packing and compare to theoretical yield.
- Add labor minutes by step, packaging per unit, and overhead allocation per batch.
- Review top ingredient supplier price and minimum-order quantity.
- If formula errors exist in this sheet, repair workbook formulas before relying on workbook profit rows.

### Melto1
| Field | Value | Source / note |
|---|---|---|
| Category | biscuit/sweet | Inferred from recipe name |
| Base batch mass | 7,540 | `Melto1!D5 + Melto1!D6 + Melto1!D7 + Melto1!D8 + Melto1!D9 + Melto1!D10` |
| Base ingredient cost | 5,682 | `Melto1!E5 + Melto1!E6 + Melto1!E7 + Melto1!E8 + Melto1!E9 + Melto1!E10` |
| Current verdict | Reformulate + reprice | Worst SKU is 32.2% GM and top-2 ingredients drive 77.7% of base cost. |
| Top-2 ingredient concentration | 77.7% | Base ingredient cost table |
| Highest-cost ingredient | Butter (2,526) | `Melto1!E6` |
| Missing data to complete COGS | labor minutes/rate; packaging; overhead; actual yield; waste/shrinkage; daily volume | Add these before treating total COGS as final |

#### Ingredients
| Ingredient | Qty | Ingredient cost | % of base cost | Cost-risk note | Source |
|---|---:|---:|---:|---|---|
| Butter | 2,000 | 2,526 | 44.5% | High | `Melto1!D6`, `Melto1!E6` |
| flour | 4,500 | 1,890 | 33.3% | High | `Melto1!D5`, `Melto1!E5` |
| icing sugar | 300 | 660.00 | 11.6% | Normal | `Melto1!D7`, `Melto1!E7` |
| sugar | 500 | 320.00 | 5.6% | Normal | `Melto1!D9`, `Melto1!E9` |
| egg | 200 | 277.78 | 4.9% | Normal | `Melto1!D8`, `Melto1!E8` |
| salt | 40 | 8.22 | 0.1% | Normal | `Melto1!D10`, `Melto1!E10` |

#### Saleable Portions and Profit Targets
| Portion | Current price | Ingredient COGS | Gross profit | GM % | Food cost % | Target price @35% FC | Price lift needed | Max weight at current price | Break-even units / base batch | Source |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 35g | 50.00 | 26.38 | 23.62 | 🔴 47.2% | 52.8% | 75.36 | 25.36 | 23.22g | 113.65 | `Melto1!B16`, `Melto1!C16` |
| 45g | 50.00 | 33.91 | 16.09 | 🔴 32.2% | 67.8% | 96.89 | 46.89 | 23.22g | 113.65 | `Melto1!B17`, `Melto1!C17` |

#### Ingredient Inflation Sensitivity
| Portion | Key ingredient | GM after key +10% | GM after key +25% | Profit action if spike happens | Source |
|---:|---|---:|---:|---|---|
| 35g | Butter | 44.9% | 41.4% | Raise price immediately | `Melto1!E6`, `Melto1!B16`, `Melto1!C16` |
| 45g | Butter | 29.2% | 24.6% | Raise price immediately | `Melto1!E6`, `Melto1!B17`, `Melto1!C17` |

#### Standard Production Method
⚠️ assumption: method steps are professional operating templates, not sourced from the workbook. Validate with your baker before production.
1. Mix dough until uniform, avoid overworking after flour addition, portion or sheet to consistent thickness.
2. Bake/fry according to house standard, cool fully, then pack by weight or count.
3. Track broken pieces, trim, and underweight packs as shrink.

#### Profit Improvement Checklist
- Set target selling price from the table above, or resize to the listed max weight at current price.
- Record actual good units after cooling/packing and compare to theoretical yield.
- Add labor minutes by step, packaging per unit, and overhead allocation per batch.
- Review top ingredient supplier price and minimum-order quantity.
- If formula errors exist in this sheet, repair workbook formulas before relying on workbook profit rows.

### Zebree
| Field | Value | Source / note |
|---|---|---|
| Category | biscuit/sweet | Inferred from recipe name |
| Base batch mass | 18,505 | `Zebree!D5 + Zebree!D6 + Zebree!D7 + Zebree!D8 + Zebree!D9 + Zebree!D10 + Zebree!D11 + Zebree!D12 + Zebree!D13 + Zebree!D14 + Zebree!D15 + Zebree!D16` |
| Base ingredient cost | 10,406 | `Zebree!E5 + Zebree!E6 + Zebree!E7 + Zebree!E8 + Zebree!E9 + Zebree!E10 + Zebree!E11 + Zebree!E12 + Zebree!E13 + Zebree!E14 + Zebree!E15 + Zebree!E16` |
| Current verdict | Reprice | Raise worst SKU to target price or reduce portion to 155.60g for 65% GM. |
| Top-2 ingredient concentration | 57.6% | Base ingredient cost table |
| Highest-cost ingredient | flour (4,200) | `Zebree!E5` |
| Missing data to complete COGS | labor minutes/rate; packaging; overhead; actual yield; waste/shrinkage; daily volume | Add these before treating total COGS as final |

#### Ingredients
| Ingredient | Qty | Ingredient cost | % of base cost | Cost-risk note | Source |
|---|---:|---:|---:|---|---|
| flour | 10,000 | 4,200 | 40.4% | High | `Zebree!D5`, `Zebree!E5` |
| Chocolate | 1,000 | 1,789 | 17.2% | Medium | `Zebree!D16`, `Zebree!E16` |
| Butter | 1,000 | 1,263 | 12.1% | Normal | `Zebree!D6`, `Zebree!E6` |
| egg | 750 | 1,000 | 9.6% | Normal | `Zebree!D9`, `Zebree!E9` |
| Milk | 800 | 936.00 | 9.0% | Normal | `Zebree!D8`, `Zebree!E8` |
| sugar | 1,000 | 640.00 | 6.2% | Normal | `Zebree!D7`, `Zebree!E7` |
| improver | 100 | 280.00 | 2.7% | Normal | `Zebree!D11`, `Zebree!E11` |
| yeast | 85 | 238.00 | 2.3% | Normal | `Zebree!D12`, `Zebree!E12` |
| baking powder | 85 | 27.62 | 0.3% | Normal | `Zebree!D14`, `Zebree!E14` |
| salt | 110 | 22.61 | 0.2% | Normal | `Zebree!D10`, `Zebree!E10` |
| EDC | 75 | 9.00 | 0.1% | Normal | `Zebree!D15`, `Zebree!E15` |
| water | 3,500 | 0.35 | 0.0% | Normal | `Zebree!D13`, `Zebree!E13` |

#### Saleable Portions and Profit Targets
| Portion | Current price | Ingredient COGS | Gross profit | GM % | Food cost % | Target price @35% FC | Price lift needed | Max weight at current price | Break-even units / base batch | Source |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 370g | 500.00 | 208.07 | 291.93 | 🟡 58.4% | 41.6% | 594.48 | 94.48 | 311.20g | 20.81 | `Zebree!B22`, `Zebree!C22` |
| 190g | 250.00 | 106.85 | 143.15 | 🟡 57.3% | 42.7% | 305.27 | 55.27 | 155.60g | 41.62 | `Zebree!B23`, `Zebree!C23` |
| 700g | 1,000 | 393.64 | 606.36 | 🟡 60.6% | 39.4% | 1,125 | 124.69 | 622.39g | 10.41 | `Zebree!B24`, `Zebree!C24` |

#### Ingredient Inflation Sensitivity
| Portion | Key ingredient | GM after key +10% | GM after key +25% | Profit action if spike happens | Source |
|---:|---|---:|---:|---|---|
| 370g | flour | 56.7% | 54.2% | Monitor / absorb short term | `Zebree!E5`, `Zebree!B22`, `Zebree!C22` |
| 190g | flour | 55.5% | 52.9% | Monitor / absorb short term | `Zebree!E5`, `Zebree!B23`, `Zebree!C23` |
| 700g | flour | 59.0% | 56.7% | Monitor / absorb short term | `Zebree!E5`, `Zebree!B24`, `Zebree!C24` |

#### Standard Production Method
⚠️ assumption: method steps are professional operating templates, not sourced from the workbook. Validate with your baker before production.
1. Mix dough until uniform, avoid overworking after flour addition, portion or sheet to consistent thickness.
2. Bake/fry according to house standard, cool fully, then pack by weight or count.
3. Track broken pieces, trim, and underweight packs as shrink.

#### Profit Improvement Checklist
- Set target selling price from the table above, or resize to the listed max weight at current price.
- Record actual good units after cooling/packing and compare to theoretical yield.
- Add labor minutes by step, packaging per unit, and overhead allocation per batch.
- Review top ingredient supplier price and minimum-order quantity.
- If formula errors exist in this sheet, repair workbook formulas before relying on workbook profit rows.

### Croissant
| Field | Value | Source / note |
|---|---|---|
| Category | pastry/savory | Inferred from recipe name |
| Base batch mass | 6,590 | `Croissant!D5 + Croissant!D6 + Croissant!D7 + Croissant!D8 + Croissant!D9 + Croissant!D10 + Croissant!D11 + Croissant!D12` |
| Base ingredient cost | 3,070 | `Croissant!E5 + Croissant!E6 + Croissant!E7 + Croissant!E8 + Croissant!E9 + Croissant!E10 + Croissant!E11 + Croissant!E12` |
| Current verdict | Reprice | Raise worst SKU to target price or reduce portion to 187.80g for 65% GM. |
| Top-2 ingredient concentration | 83.5% | Base ingredient cost table |
| Highest-cost ingredient | flour (1,302) | `Croissant!E5` |
| Missing data to complete COGS | labor minutes/rate; packaging; overhead; actual yield; waste/shrinkage; daily volume | Add these before treating total COGS as final |

#### Ingredients
| Ingredient | Qty | Ingredient cost | % of base cost | Cost-risk note | Source |
|---|---:|---:|---:|---|---|
| flour | 3,100 | 1,302 | 42.4% | High | `Croissant!D5`, `Croissant!E5` |
| Butter | 1,000 | 1,263 | 41.1% | High | `Croissant!D6`, `Croissant!E6` |
| sugar | 300 | 192.00 | 6.3% | Normal | `Croissant!D7`, `Croissant!E7` |
| egg | 100 | 138.89 | 4.5% | Normal | `Croissant!D9`, `Croissant!E9` |
| improver | 30 | 84.00 | 2.7% | Normal | `Croissant!D10`, `Croissant!E10` |
| yeast | 30 | 84.00 | 2.7% | Normal | `Croissant!D11`, `Croissant!E11` |
| salt | 30 | 6.17 | 0.2% | Normal | `Croissant!D8`, `Croissant!E8` |
| water | 2,000 | 0.20 | 0.0% | Normal | `Croissant!D12`, `Croissant!E12` |

#### Saleable Portions and Profit Targets
| Portion | Current price | Ingredient COGS | Gross profit | GM % | Food cost % | Target price @35% FC | Price lift needed | Max weight at current price | Break-even units / base batch | Source |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 45g | 100.00 | 20.97 | 79.03 | 🟢 79.0% | 21.0% | 59.90 | -40.10 | 75.12g | 30.70 | `Croissant!B18`, `Croissant!C18` |
| 190g | 250.00 | 88.52 | 161.48 | 🟡 64.6% | 35.4% | 252.93 | 2.93 | 187.80g | 12.28 | `Croissant!B19`, `Croissant!C19` |
| 700g | 1,000 | 326.14 | 673.86 | 🟢 67.4% | 32.6% | 931.84 | -68.16 | 751.20g | 3.07 | `Croissant!B20`, `Croissant!C20` |

#### Ingredient Inflation Sensitivity
| Portion | Key ingredient | GM after key +10% | GM after key +25% | Profit action if spike happens | Source |
|---:|---|---:|---:|---|---|
| 45g | flour | 78.1% | 76.8% | Monitor / absorb short term | `Croissant!E5`, `Croissant!B18`, `Croissant!C18` |
| 190g | flour | 63.1% | 60.8% | Monitor / absorb short term | `Croissant!E5`, `Croissant!B19`, `Croissant!C19` |
| 700g | flour | 66.0% | 63.9% | Monitor / absorb short term | `Croissant!E5`, `Croissant!B20`, `Croissant!C20` |

#### Standard Production Method
⚠️ assumption: method steps are professional operating templates, not sourced from the workbook. Validate with your baker before production.
1. Prepare dough and filling separately; weigh filling per piece to control cost and consistency.
2. Seal, proof/rest where required, bake/fry, cool, then count only intact saleable pieces.
3. Track filling waste and broken/leaking pieces because savory items have higher hidden loss risk.

#### Profit Improvement Checklist
- Set target selling price from the table above, or resize to the listed max weight at current price.
- Record actual good units after cooling/packing and compare to theoretical yield.
- Add labor minutes by step, packaging per unit, and overhead allocation per batch.
- Review top ingredient supplier price and minimum-order quantity.
- If formula errors exist in this sheet, repair workbook formulas before relying on workbook profit rows.

### Universal bread
| Field | Value | Source / note |
|---|---|---|
| Category | bread | Inferred from recipe name |
| Base batch mass | 50,170 | `Universal bread!D5 + Universal bread!D6 + Universal bread!D7 + Universal bread!D8 + Universal bread!D9 + Universal bread!D10 + Universal bread!D11 + Universal bread!D12 + Universal bread!D13 + Universal bread!D14 + Universal bread!D15` |
| Base ingredient cost | 27,728 | `Universal bread!E5 + Universal bread!E6 + Universal bread!E7 + Universal bread!E8 + Universal bread!E9 + Universal bread!E10 + Universal bread!E11 + Universal bread!E12 + Universal bread!E13 + Universal bread!E14 + Universal bread!E15` |
| Current verdict | Reprice | Raise worst SKU to target price or reduce portion to 63.33g for 65% GM. |
| Top-2 ingredient concentration | 79.0% | Base ingredient cost table |
| Highest-cost ingredient | frying oil (10,980) | `Universal bread!E15` |
| Missing data to complete COGS | labor minutes/rate; packaging; overhead; actual yield; waste/shrinkage; daily volume | Add these before treating total COGS as final |

#### Ingredients
| Ingredient | Qty | Ingredient cost | % of base cost | Cost-risk note | Source |
|---|---:|---:|---:|---|---|
| frying oil | 9,000 | 10,980 | 39.6% | High | `Universal bread!D15`, `Universal bread!E15` |
| flour | 26,000 | 10,920 | 39.4% | High | `Universal bread!D5`, `Universal bread!E5` |
| Butter | 1,400 | 1,768 | 6.4% | Normal | `Universal bread!D6`, `Universal bread!E6` |
| sugar | 1,700 | 1,088 | 3.9% | Normal | `Universal bread!D7`, `Universal bread!E7` |
| Conc Milk | 800 | 936.00 | 3.4% | Normal | `Universal bread!D8`, `Universal bread!E8` |
| egg | 500 | 666.67 | 2.4% | Normal | `Universal bread!D9`, `Universal bread!E9` |
| yeast | 170 | 476.00 | 1.7% | Normal | `Universal bread!D12`, `Universal bread!E12` |
| baking powder | 180 | 468.00 | 1.7% | Normal | `Universal bread!D14`, `Universal bread!E14` |
| improver | 130 | 364.00 | 1.3% | Normal | `Universal bread!D11`, `Universal bread!E11` |
| salt | 290 | 59.61 | 0.2% | Normal | `Universal bread!D10`, `Universal bread!E10` |
| water | 10,000 | 1.00 | 0.0% | Normal | `Universal bread!D13`, `Universal bread!E13` |

#### Saleable Portions and Profit Targets
| Portion | Current price | Ingredient COGS | Gross profit | GM % | Food cost % | Target price @35% FC | Price lift needed | Max weight at current price | Break-even units / base batch | Source |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 81.40g | 100.00 | 44.99 | 55.01 | 🟡 55.0% | 45.0% | 128.54 | 28.54 | 63.33g | 277.28 | `Universal bread!B20`, `Universal bread!C20` |
| 90g | 100.00 | 49.74 | 50.26 | 🟡 50.3% | 49.7% | 142.12 | 42.12 | 63.33g | 277.28 | `Universal bread!B21`, `Universal bread!C21` |
| 90g | 100.00 | 49.74 | 50.26 | 🟡 50.3% | 49.7% | 142.12 | 42.12 | 63.33g | 277.28 | `Universal bread!B22`, `Universal bread!C22` |
| 900g | 1,000 | 497.41 | 502.59 | 🟡 50.3% | 49.7% | 1,421 | 421.16 | 633.28g | 27.73 | `Universal bread!B23`, `Universal bread!C23` |

#### Ingredient Inflation Sensitivity
| Portion | Key ingredient | GM after key +10% | GM after key +25% | Profit action if spike happens | Source |
|---:|---|---:|---:|---|---|
| 81.40g | frying oil | 53.2% | 50.6% | Monitor / absorb short term | `Universal bread!E15`, `Universal bread!B20`, `Universal bread!C20` |
| 90g | frying oil | 48.3% | 45.3% | Raise price immediately | `Universal bread!E15`, `Universal bread!B21`, `Universal bread!C21` |
| 90g | frying oil | 48.3% | 45.3% | Raise price immediately | `Universal bread!E15`, `Universal bread!B22`, `Universal bread!C22` |
| 900g | frying oil | 48.3% | 45.3% | Raise price immediately | `Universal bread!E15`, `Universal bread!B23`, `Universal bread!C23` |

#### Standard Production Method
⚠️ assumption: method steps are professional operating templates, not sourced from the workbook. Validate with your baker before production.
1. Scale ingredients exactly from the recipe card; keep flour, yeast, salt, sugar, fat, and improver separate until mixing.
2. Mix dry ingredients, add water/liquids gradually, then develop dough until smooth and elastic.
3. Bulk ferment until dough shows visible rise; divide by target portion weight, round, rest, shape, proof, bake, cool fully, then package.

#### Profit Improvement Checklist
- Set target selling price from the table above, or resize to the listed max weight at current price.
- Record actual good units after cooling/packing and compare to theoretical yield.
- Add labor minutes by step, packaging per unit, and overhead allocation per batch.
- Review top ingredient supplier price and minimum-order quantity.
- If formula errors exist in this sheet, repair workbook formulas before relying on workbook profit rows.

### Sheet3
| Field | Value | Source / note |
|---|---|---|
| Category | other | Inferred from recipe name |
| Base batch mass | 19,250 | `Sheet3!D5 + Sheet3!D6 + Sheet3!D7 + Sheet3!D8 + Sheet3!D9 + Sheet3!D10 + Sheet3!D11 + Sheet3!D12 + Sheet3!D13 + Sheet3!D14 + Sheet3!D15` |
| Base ingredient cost | 9,161 | `Sheet3!E5 + Sheet3!E6 + Sheet3!E7 + Sheet3!E8 + Sheet3!E9 + Sheet3!E10 + Sheet3!E11 + Sheet3!E12 + Sheet3!E13 + Sheet3!E14 + Sheet3!E15` |
| Current verdict | Reprice | Raise worst SKU to target price or reduce portion to 91.93g for 65% GM. |
| Top-2 ingredient concentration | 57.4% | Base ingredient cost table |
| Highest-cost ingredient | flour (4,000) | `Sheet3!E5` |
| Missing data to complete COGS | labor minutes/rate; packaging; overhead; actual yield; waste/shrinkage; daily volume | Add these before treating total COGS as final |

#### Ingredients
| Ingredient | Qty | Ingredient cost | % of base cost | Cost-risk note | Source |
|---|---:|---:|---:|---|---|
| flour | 10,000 | 4,000 | 43.7% | High | `Sheet3!D5`, `Sheet3!E5` |
| Butter | 1,000 | 1,263 | 13.8% | Normal | `Sheet3!D6`, `Sheet3!E6` |
| Milk | 850 | 994.50 | 10.9% | Normal | `Sheet3!D8`, `Sheet3!E8` |
| egg | 500 | 666.67 | 7.3% | Normal | `Sheet3!D9`, `Sheet3!E9` |
| sugar | 1,000 | 640.00 | 7.0% | Normal | `Sheet3!D7`, `Sheet3!E7` |
| Oil | 400 | 488.00 | 5.3% | Normal | `Sheet3!D14`, `Sheet3!E14` |
| yeast | 160 | 448.00 | 4.9% | Normal | `Sheet3!D12`, `Sheet3!E12` |
| improver | 120 | 336.00 | 3.7% | Normal | `Sheet3!D11`, `Sheet3!E11` |
| EDC | 100 | 300.00 | 3.3% | Normal | `Sheet3!D15`, `Sheet3!E15` |
| salt | 120 | 24.67 | 0.3% | Normal | `Sheet3!D10`, `Sheet3!E10` |
| water | 5,000 | 0.50 | 0.0% | Normal | `Sheet3!D13`, `Sheet3!E13` |

#### Saleable Portions and Profit Targets
| Portion | Current price | Ingredient COGS | Gross profit | GM % | Food cost % | Target price @35% FC | Price lift needed | Max weight at current price | Break-even units / base batch | Source |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 144g | 125.00 | 68.53 | 56.47 | 🔴 45.2% | 54.8% | 195.81 | 70.81 | 91.93g | 73.29 | `Sheet3!B21`, `Sheet3!C21` |
| 500g | 500.00 | 237.96 | 262.04 | 🟡 52.4% | 47.6% | 679.89 | 179.89 | 367.71g | 18.32 | `Sheet3!B22`, `Sheet3!C22` |
| 139g | 150.00 | 66.15 | 83.85 | 🟡 55.9% | 44.1% | 189.01 | 39.01 | 110.31g | 61.08 | `Sheet3!B23`, `Sheet3!C23` |

#### Ingredient Inflation Sensitivity
| Portion | Key ingredient | GM after key +10% | GM after key +25% | Profit action if spike happens | Source |
|---:|---|---:|---:|---|---|
| 144g | flour | 42.8% | 39.2% | Raise price immediately | `Sheet3!E5`, `Sheet3!B21`, `Sheet3!C21` |
| 500g | flour | 50.3% | 47.2% | Raise price immediately | `Sheet3!E5`, `Sheet3!B22`, `Sheet3!C22` |
| 139g | flour | 54.0% | 51.1% | Monitor / absorb short term | `Sheet3!E5`, `Sheet3!B23`, `Sheet3!C23` |

#### Standard Production Method
⚠️ assumption: method steps are professional operating templates, not sourced from the workbook. Validate with your baker before production.
1. Use the house standard method and add exact process steps, temperatures, times, and yield checkpoints.

#### Profit Improvement Checklist
- Set target selling price from the table above, or resize to the listed max weight at current price.
- Record actual good units after cooling/packing and compare to theoretical yield.
- Add labor minutes by step, packaging per unit, and overhead allocation per batch.
- Review top ingredient supplier price and minimum-order quantity.
- If formula errors exist in this sheet, repair workbook formulas before relying on workbook profit rows.

## Recipe Data Completion Template
| Recipe | Labor minutes | Loaded labor rate | Packaging/unit | Overhead/batch | Actual good units | Waste units | Owner | Due date |
|---|---:|---:|---:|---:|---:|---:|---|---|
| baguette | missing | missing | missing | missing | missing | missing | Production + Finance | next costing cycle |
| New bageutte | missing | missing | missing | missing | missing | missing | Production + Finance | next costing cycle |
| Banh Mi | missing | missing | missing | missing | missing | missing | Production + Finance | next costing cycle |
| cake marbre | missing | missing | missing | missing | missing | missing | Production + Finance | next costing cycle |
| gateau | missing | missing | missing | missing | missing | missing | Production + Finance | next costing cycle |
| Kouatchoua gato | missing | missing | missing | missing | missing | missing | Production + Finance | next costing cycle |
| BUNS SPECIAL | missing | missing | missing | missing | missing | missing | Production + Finance | next costing cycle |
| buns new look | missing | missing | missing | missing | missing | missing | Production + Finance | next costing cycle |
| YUMMY BREAD | missing | missing | missing | missing | missing | missing | Production + Finance | next costing cycle |
| Donuts | missing | missing | missing | missing | missing | missing | Production + Finance | next costing cycle |
| Fish Pie | missing | missing | missing | missing | missing | missing | Production + Finance | next costing cycle |
| Galette | missing | missing | missing | missing | missing | missing | Production + Finance | next costing cycle |
| New bread | missing | missing | missing | missing | missing | missing | Production + Finance | next costing cycle |
| NGALA BREAD | missing | missing | missing | missing | missing | missing | Production + Finance | next costing cycle |
| Pain au lait | missing | missing | missing | missing | missing | missing | Production + Finance | next costing cycle |
| NEW BRIOCHE | missing | missing | missing | missing | missing | missing | Production + Finance | next costing cycle |
| Brioche Professionel | missing | missing | missing | missing | missing | missing | Production + Finance | next costing cycle |
| professinal Buns | missing | missing | missing | missing | missing | missing | Production + Finance | next costing cycle |
| brioche | missing | missing | missing | missing | missing | missing | Production + Finance | next costing cycle |
| choko bread | missing | missing | missing | missing | missing | missing | Production + Finance | next costing cycle |
| Cake Prof | missing | missing | missing | missing | missing | missing | Production + Finance | next costing cycle |
| Pancake | missing | missing | missing | missing | missing | missing | Production + Finance | next costing cycle |
| Chinchin | missing | missing | missing | missing | missing | missing | Production + Finance | next costing cycle |
| Best Chinchin | missing | missing | missing | missing | missing | missing | Production + Finance | next costing cycle |
| Sugar Balls | missing | missing | missing | missing | missing | missing | Production + Finance | next costing cycle |
| Delice | missing | missing | missing | missing | missing | missing | Production + Finance | next costing cycle |
| Danisa biscuits | missing | missing | missing | missing | missing | missing | Production + Finance | next costing cycle |
| Okinawa | missing | missing | missing | missing | missing | missing | Production + Finance | next costing cycle |
| CAKE NOW | missing | missing | missing | missing | missing | missing | Production + Finance | next costing cycle |
| Short bread | missing | missing | missing | missing | missing | missing | Production + Finance | next costing cycle |
| Melto | missing | missing | missing | missing | missing | missing | Production + Finance | next costing cycle |
| Ice Cream | missing | missing | missing | missing | missing | missing | Production + Finance | next costing cycle |
| Melto1 | missing | missing | missing | missing | missing | missing | Production + Finance | next costing cycle |
| Zebree | missing | missing | missing | missing | missing | missing | Production + Finance | next costing cycle |
| Croissant | missing | missing | missing | missing | missing | missing | Production + Finance | next costing cycle |
| Universal bread | missing | missing | missing | missing | missing | missing | Production + Finance | next costing cycle |
| Sheet3 | missing | missing | missing | missing | missing | missing | Production + Finance | next costing cycle |

## Formula and Data Hygiene Flags
| Flag | Detail | Action |
|---|---|---|
| Workbook formula errors | BUNS SPECIAL!E23=#REF!, BUNS SPECIAL!F23=#REF!, BUNS SPECIAL!G23=#REF!, BUNS SPECIAL!H23=#REF!, buns new look!F24=#REF!, buns new look!H24=#REF!, buns new look!F25=#REF!, buns new look!H25=#REF!, Donuts!H20=#REF!, Donuts!L20=#REF!, New bread!F24=#REF!, New bread!H24=#REF!, New bread!F25=#REF!, New bread!H25=#REF!, NGALA BREAD!F24=#REF!, NGALA BREAD!H24=#REF!, NGALA BREAD!F25=#REF!, NGALA BREAD!H25=#REF! | Repair `#REF!` cells before using workbook profit rows. |
| Possible duplicate/template sheet | Sheet3 | Rename or archive after confirming whether it is an active recipe. |
| Non-operational text in raw material sheet | Credential/payment-looking strings were not printed in this book. | Remove secrets or unrelated text from the workbook. |

## Assumptions
| Assumption | Why it was used | What to replace it with |
|---|---|---|
| ⚠️ Target food cost is 35.0% / target ingredient GM is 65.0%. | Bakery/restaurant costing references support using food-cost targets, but your labor and overhead are missing. | Your actual prime-cost model by department and sales channel. |
| ⚠️ Base recipe uses the first quantity/cost pair after the `item` column. | Workbook contains multiple scaled-batch columns with inconsistent labels/formulas. | A selected-batch flag per recipe. |
| ⚠️ Portion weights are treated as grams or workbook-native weight units. | Workbook labels say `weight` but not a formal unit. | Confirm unit of measure for each recipe. |
| ⚠️ Target price ignores demand elasticity. | No sales-volume history or demand curve is present. | POS sales by SKU before/after price changes. |
| ⚠️ Contribution margin equals gross profit. | Labor, packaging, and variable overhead are absent. | Labor minutes, loaded wage, packaging/unit, utility and rent allocation. |
