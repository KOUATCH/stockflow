<!-- converted from melto_bakery_comprehensive_recipe_book.xlsx -->

## Sheet: Sources
| Sources |
| --- |
| Audit trail and external benchmark assumptions |
| Status | Source | Role / use |
| Ingested | E:\retail management systems\Bakery recipes   melto 2026.xlsx | Recipe quantities, ingredient costs, selling prices, portion weights, cached formulas |
| Benchmark | KitchenCost recipe-costing guide: https://kitchencost.app/en/blog/recipe-costing/ | Recipe costing formulas, cost-per-serving, menu price = cost / target food cost, and the warning that food cost excludes labor/overhead. |
| Benchmark | Sage restaurant prime-cost benchmark: https://www.sage.com/en-us/blog/restaurant-prime-costs/ | Prime cost, food cost, and labor cost benchmark ranges for operating context. |
| Benchmark | RestaurantOwner prime-cost reference: https://www.restaurantowner.com/prime.pdf | Prime cost threshold context and why food cost alone is not enough. |
| Assumption | Target ingredient food cost | 0.35 |
| Assumption | Target ingredient gross margin | 0.65 |
| Warning | Contribution margin currently equals ingredient gross profit | Labor, packaging, overhead, waste, and sales volume are missing from the source workbook |
## Sheet: Profitability Matrix
| Profitability Matrix |
| --- |
| Sortable SKU economics, target prices, and portion fixes |
| Recipe | Category | Label | Portion | Price | Ingredient COGS | Gross Profit | GM % | Food Cost % | Target Price @35% FC | Price Gap | Max Profitable Weight | Break-even Units/Batch | Status | Recommended Action | Key Ingredient | Price Source | Weight Source |
| New bageutte | bread |  | 500 | 200 | 181.28 | 18.72 | 0.0936 | 0.9064 | 517.95 | 317.95 | 193.07 | 1.09 | Red | Reformulate + reprice | flour | New bageutte!B18 | New bageutte!C18 |
| Banh Mi | bread |  | 500 | 200 | 153.79 | 46.21 | 0.2311 | 0.7689 | 439.39 | 239.39 | 227.59 | 16.19 | Red | Reformulate + reprice | flour | Banh Mi!B18 | Banh Mi!C18 |
| gateau | cake/gateau |  | 90 | 100 | 70.85 | 29.15 | 0.2915 | 0.7085 | 202.43 | 102.43 | 44.46 | 313.95 | Red | Reformulate + reprice | frying oil | gateau!B22 | gateau!C22 |
| gateau | cake/gateau |  | 90 | 100 | 70.85 | 29.15 | 0.2915 | 0.7085 | 202.43 | 102.43 | 44.46 | 313.95 | Red | Reformulate + reprice | frying oil | gateau!B23 | gateau!C23 |
| gateau | cake/gateau |  | 900 | 1000 | 708.51 | 291.49 | 0.2915 | 0.7085 | 2024.31 | 1024.31 | 444.6 | 31.39 | Red | Reformulate + reprice | frying oil | gateau!B24 | gateau!C24 |
| professinal Buns | buns |  | 95 | 100 | 70.59 | 29.41 | 0.2941 | 0.7059 | 201.67 | 101.67 | 47.11 | 103.32 | Red | Resize portion + reprice | flour | professinal Buns!B23 | professinal Buns!C23 |
| professinal Buns | buns |  | 140 | 150 | 104.02 | 45.98 | 0.3065 | 0.6935 | 297.2 | 147.2 | 70.66 | 68.88 | Red | Resize portion + reprice | flour | professinal Buns!B24 | professinal Buns!C24 |
| Melto | biscuit/sweet |  | 45 | 50 | 34.66 | 15.34 | 0.3068 | 0.6932 | 99.03 | 49.03 | 22.72 | 115.38 | Red | Reformulate + reprice | Butter | Melto!B17 | Melto!C17 |
| baguette | bread |  | 200 | 100 | 68.39 | 31.61 | 0.3161 | 0.6839 | 195.41 | 95.41 | 102.35 | 33.82 | Red | Reformulate + reprice | flour | baguette!B17 | baguette!C17 |
| Short bread | biscuit/sweet |  | 45 | 50 | 33.98 | 16.02 | 0.3204 | 0.6796 | 97.09 | 47.09 | 23.17 | 59.66 | Red | Reformulate + reprice | Butter | Short bread!B18 | Short bread!C18 |
| Melto1 | biscuit/sweet |  | 45 | 50 | 33.91 | 16.09 | 0.3217 | 0.6783 | 96.89 | 46.89 | 23.22 | 113.65 | Red | Reformulate + reprice | Butter | Melto1!B17 | Melto1!C17 |
| Brioche Professionel | bread |  | 800 | 1000 | 654.93 | 345.07 | 0.3451 | 0.6549 | 1871.24 | 871.24 | 427.52 | 8.8 | Red | Resize portion + reprice | flour | Brioche Professionel!B21 | Brioche Professionel!C21 |
| gateau | cake/gateau |  | 81 | 100 | 63.77 | 36.23 | 0.3623 | 0.6377 | 182.19 | 82.19 | 44.46 | 313.95 | Red | Reformulate + reprice | frying oil | gateau!B21 | gateau!C21 |
| choko bread | bread |  | 100 | 100 | 63.48 | 36.52 | 0.3652 | 0.6348 | 181.37 | 81.37 | 55.14 | 53.22 | Red | Reprice | flour | choko bread!B20 | choko bread!C20 |
| Fish Pie | pastry/savory |  | 85 | 100 | 62.31 | 37.69 | 0.3769 | 0.6231 | 178.04 | 78.04 | 47.74 | 41.79 | Red | Reprice | Butter | Fish Pie!B22 | Fish Pie!C22 |
| Danisa biscuits | biscuit/sweet |  | 850 | 1000 | 619.14 | 380.86 | 0.3809 | 0.6191 | 1768.97 | 768.97 | 480.51 | 5.12 | Red | Reprice | flour | Danisa biscuits!B23 | Danisa biscuits!C23 |
| Brioche Professionel | bread |  | 220 | 300 | 180.11 | 119.89 | 0.3996 | 0.6004 | 514.59 | 214.59 | 128.26 | 29.34 | Red | Resize portion + reprice | flour | Brioche Professionel!B20 | Brioche Professionel!C20 |
| professinal Buns | buns |  | 800 | 1000 | 594.41 | 405.59 | 0.4056 | 0.5944 | 1698.31 | 698.31 | 471.06 | 10.33 | Red | Resize portion + reprice | flour | professinal Buns!B25 | professinal Buns!C25 |
| Short bread | biscuit/sweet | cupcakes | 38 | 50 | 28.7 | 21.3 | 0.4261 | 0.5739 | 81.99 | 31.99 | 23.17 | 59.66 | Red | Reformulate + reprice | Butter | Short bread!B17 | Short bread!C17 |
| Brioche Professionel | bread |  | 70 | 100 | 57.31 | 42.69 | 0.4269 | 0.5731 | 163.73 | 63.73 | 42.75 | 88.01 | Red | Resize portion + reprice | flour | Brioche Professionel!B19 | Brioche Professionel!C19 |
| choko bread | bread |  | 90 | 100 | 57.13 | 42.87 | 0.4287 | 0.5713 | 163.23 | 63.23 | 55.14 | 53.22 | Red | Reprice | flour | choko bread!B22 | choko bread!C22 |
| cake marbre | cake/gateau |  | 50 | 100 | 56.58 | 43.42 | 0.4342 | 0.5658 | 161.66 | 61.66 | 30.93 | 59.15 | Red | Reprice | Butter | cake marbre!B21 | cake marbre!C21 |
| Sheet3 | other |  | 144 | 125 | 68.53 | 56.47 | 0.4517 | 0.5483 | 195.81 | 70.81 | 91.93 | 73.29 | Red | Reprice | flour | Sheet3!B21 | Sheet3!C21 |
| Ice Cream | ice cream |  | 45 | 50 | 27.17 | 22.83 | 0.4565 | 0.5435 | 77.64 | 27.64 | 28.98 | 187.2 | Red | Reprice | Powdered Milk | Ice Cream!B15 | Ice Cream!C15 |
| YUMMY BREAD | bread |  | 144 | 125 | 66.56 | 58.44 | 0.4675 | 0.5325 | 190.18 | 65.18 | 94.65 | 97.07 | Red | Reprice | flour | YUMMY BREAD!B21 | YUMMY BREAD!C21 |
| BUNS SPECIAL | buns |  | 800 | 1000 | 529.12 | 470.88 | 0.4709 | 0.5291 | 1511.76 | 511.76 | 529.18 | 9.87 | Red | Reprice | flour | BUNS SPECIAL!B20 | BUNS SPECIAL!C20 |
| Melto1 | biscuit/sweet | cupcakes | 35 | 50 | 26.38 | 23.62 | 0.4725 | 0.5275 | 75.36 | 25.36 | 23.22 | 113.65 | Red | Reformulate + reprice | Butter | Melto1!B16 | Melto1!C16 |
| Melto | biscuit/sweet | cupcakes | 34 | 50 | 26.19 | 23.81 | 0.4763 | 0.5237 | 74.82 | 24.82 | 22.72 | 115.38 | Red | Reformulate + reprice | Butter | Melto!B16 | Melto!C16 |
| CAKE NOW | cake/gateau |  | 60 | 100 | 51.87 | 48.13 | 0.4813 | 0.5187 | 148.2 | 48.2 | 40.49 | 61.38 | Red | Reprice | Egg | CAKE NOW!B18 | CAKE NOW!C18 |
| NEW BRIOCHE | bread |  | 82 | 100 | 51.63 | 48.37 | 0.4837 | 0.5163 | 147.52 | 47.52 | 55.59 | 108.38 | Red | Reprice | flour | NEW BRIOCHE!B21 | NEW BRIOCHE!C21 |
| brioche | bread |  | 82 | 100 | 51.18 | 48.82 | 0.4882 | 0.5118 | 146.24 | 46.24 | 56.07 | 108.61 | Red | Reprice | flour | brioche!B21 | brioche!C21 |
| Danisa biscuits | biscuit/sweet |  | 140 | 200 | 101.98 | 98.02 | 0.4901 | 0.5099 | 291.36 | 91.36 | 96.1 | 25.59 | Red | Reprice | flour | Danisa biscuits!B24 | Danisa biscuits!C24 |
| Danisa biscuits | biscuit/sweet |  | 700 | 1000 | 509.88 | 490.12 | 0.4901 | 0.5099 | 1456.8 | 456.8 | 480.51 | 5.12 | Red | Reprice | flour | Danisa biscuits!B25 | Danisa biscuits!C25 |
| brioche | bread |  | 160 | 200 | 99.87 | 100.13 | 0.5006 | 0.4994 | 285.35 | 85.35 | 112.14 | 54.31 | Yellow | Reprice | flour | brioche!B22 | brioche!C22 |
| Delice | biscuit/sweet |  | 700 | 1000 | 497.8 | 502.2 | 0.5022 | 0.4978 | 1422.29 | 422.29 | 492.17 | 4.83 | Yellow | Reprice | flour | Delice!B23 | Delice!C23 |
| Delice | biscuit/sweet |  | 140 | 200 | 99.56 | 100.44 | 0.5022 | 0.4978 | 284.46 | 84.46 | 98.43 | 24.13 | Yellow | Reprice | flour | Delice!B24 | Delice!C24 |
| Delice | biscuit/sweet |  | 700 | 1000 | 497.8 | 502.2 | 0.5022 | 0.4978 | 1422.29 | 422.29 | 492.17 | 4.83 | Yellow | Reprice | flour | Delice!B25 | Delice!C25 |
| Universal bread | bread |  | 90 | 100 | 49.74 | 50.26 | 0.5026 | 0.4974 | 142.12 | 42.12 | 63.33 | 277.28 | Yellow | Reprice | frying oil | Universal bread!B21 | Universal bread!C21 |
| Universal bread | bread |  | 90 | 100 | 49.74 | 50.26 | 0.5026 | 0.4974 | 142.12 | 42.12 | 63.33 | 277.28 | Yellow | Reprice | frying oil | Universal bread!B22 | Universal bread!C22 |
| Universal bread | bread |  | 900 | 1000 | 497.41 | 502.59 | 0.5026 | 0.4974 | 1421.16 | 421.16 | 633.28 | 27.73 | Yellow | Reprice | frying oil | Universal bread!B23 | Universal bread!C23 |
| Galette | pastry/savory |  | 79 | 100 | 49.3 | 50.7 | 0.507 | 0.493 | 140.87 | 40.87 | 56.08 | 106.06 | Yellow | Reprice | flour | Galette!B22 | Galette!C22 |
| Kouatchoua gato | cake/gateau |  | 90 | 100 | 48.88 | 51.12 | 0.5112 | 0.4888 | 139.65 | 39.65 | 64.45 | 275.4 | Yellow | Reprice | flour | Kouatchoua gato!B21 | Kouatchoua gato!C21 |
| Kouatchoua gato | cake/gateau |  | 90 | 100 | 48.88 | 51.12 | 0.5112 | 0.4888 | 139.65 | 39.65 | 64.45 | 275.4 | Yellow | Reprice | flour | Kouatchoua gato!B22 | Kouatchoua gato!C22 |
| Kouatchoua gato | cake/gateau |  | 900 | 1000 | 488.78 | 511.22 | 0.5112 | 0.4888 | 1396.51 | 396.51 | 644.46 | 27.54 | Yellow | Reprice | flour | Kouatchoua gato!B23 | Kouatchoua gato!C23 |
| Cake Prof | cake/gateau |  | 57 | 100 | 48.62 | 51.38 | 0.5138 | 0.4862 | 138.9 | 38.9 | 41.04 | 66.95 | Yellow | Reprice | Egg | Cake Prof!B17 | Cake Prof!C17 |
| BUNS SPECIAL | buns |  | 220 | 300 | 145.51 | 154.49 | 0.515 | 0.485 | 415.74 | 115.74 | 158.75 | 32.89 | Yellow | Reprice | flour | BUNS SPECIAL!B19 | BUNS SPECIAL!C19 |
| Okinawa | biscuit/sweet |  | 80 | 100 | 47.93 | 52.07 | 0.5207 | 0.4793 | 136.95 | 36.95 | 58.41 | 44.34 | Yellow | Reprice | flour | Okinawa!B16 | Okinawa!C16 |
| Okinawa | biscuit/sweet |  | 80 | 100 | 47.93 | 52.07 | 0.5207 | 0.4793 | 136.95 | 36.95 | 58.41 | 44.34 | Yellow | Reprice | flour | Okinawa!B17 | Okinawa!C17 |
| Fish Pie | pastry/savory |  | 65 | 100 | 47.65 | 52.35 | 0.5235 | 0.4765 | 136.15 | 36.15 | 47.74 | 41.79 | Yellow | Reprice | Butter | Fish Pie!B23 | Fish Pie!C23 |
| Sheet3 | other |  | 500 | 500 | 237.96 | 262.04 | 0.5241 | 0.4759 | 679.89 | 179.89 | 367.71 | 18.32 | Yellow | Reprice | flour | Sheet3!B22 | Sheet3!C22 |
| New bageutte | bread |  | 65 | 50 | 23.57 | 26.43 | 0.5287 | 0.4713 | 67.33 | 17.33 | 48.27 | 4.37 | Yellow | Reformulate + reprice | flour | New bageutte!B19 | New bageutte!C19 |
| choko bread | bread |  | 220 | 300 | 139.65 | 160.35 | 0.5345 | 0.4655 | 399.01 | 99.01 | 165.41 | 17.74 | Yellow | Reprice | flour | choko bread!B21 | choko bread!C21 |
| cake marbre | cake/gateau |  | 60 | 150 | 67.9 | 82.1 | 0.5474 | 0.4526 | 193.99 | 43.99 | 46.39 | 39.43 | Yellow | Reprice | Butter | cake marbre!B20 | cake marbre!C20 |
| Universal bread | bread |  | 81.4 | 100 | 44.99 | 55.01 | 0.5501 | 0.4499 | 128.54 | 28.54 | 63.33 | 277.28 | Yellow | Reprice | frying oil | Universal bread!B20 | Universal bread!C20 |
| Best Chinchin | fried/snack |  | 500 | 1000 | 445.97 | 554.03 | 0.554 | 0.446 | 1274.21 | 274.21 | 392.4 | 53.83 | Yellow | Reprice | oil | Best Chinchin!B21 | Best Chinchin!C21 |
| baguette | bread |  | 65 | 50 | 22.23 | 27.77 | 0.5554 | 0.4446 | 63.51 | 13.51 | 51.18 | 67.64 | Yellow | Reformulate + reprice | flour | baguette!B18 | baguette!C18 |
| YUMMY BREAD | bread |  | 144 | 150 | 66.56 | 83.44 | 0.5562 | 0.4438 | 190.18 | 40.18 | 113.58 | 80.89 | Yellow | Reprice | flour | YUMMY BREAD!B20 | YUMMY BREAD!C20 |
| Kouatchoua gato | cake/gateau |  | 81.4 | 100 | 44.21 | 55.79 | 0.5579 | 0.4421 | 126.31 | 26.31 | 64.45 | 275.4 | Yellow | Reprice | flour | Kouatchoua gato!B20 | Kouatchoua gato!C20 |
| Sheet3 | other |  | 139 | 150 | 66.15 | 83.85 | 0.559 | 0.441 | 189.01 | 39.01 | 110.31 | 61.08 | Yellow | Reprice | flour | Sheet3!B23 | Sheet3!C23 |
| NEW BRIOCHE | bread |  | 140 | 200 | 88.15 | 111.85 | 0.5592 | 0.4408 | 251.86 | 51.86 | 111.17 | 54.19 | Yellow | Reprice | flour | NEW BRIOCHE!B22 | NEW BRIOCHE!C22 |
| NEW BRIOCHE | bread |  | 700 | 1000 | 440.76 | 559.24 | 0.5592 | 0.4408 | 1259.32 | 259.32 | 555.85 | 10.84 | Yellow | Reprice | flour | NEW BRIOCHE!B23 | NEW BRIOCHE!C23 |
| NGALA BREAD | bread |  | 90 | 100 | 43.93 | 56.07 | 0.5607 | 0.4393 | 125.52 | 25.52 | 71.7 | 75.32 | Yellow | Reprice | flour | NGALA BREAD!C20 | NGALA BREAD!D20 |
| Galette | pastry/savory |  | 140 | 200 | 87.37 | 112.63 | 0.5631 | 0.4369 | 249.64 | 49.64 | 112.16 | 53.03 | Yellow | Reprice | flour | Galette!B23 | Galette!C23 |
| Galette | pastry/savory |  | 700 | 1000 | 436.86 | 563.14 | 0.5631 | 0.4369 | 1248.18 | 248.18 | 560.81 | 10.61 | Yellow | Reprice | flour | Galette!B24 | Galette!C24 |
| brioche | bread |  | 700 | 1000 | 436.94 | 563.06 | 0.5631 | 0.4369 | 1248.41 | 248.41 | 560.71 | 10.86 | Yellow | Reprice | flour | brioche!B23 | brioche!C23 |
| YUMMY BREAD | bread |  | 139 | 150 | 64.25 | 85.75 | 0.5717 | 0.4283 | 183.58 | 33.58 | 113.58 | 80.89 | Yellow | Reprice | flour | YUMMY BREAD!B22 | YUMMY BREAD!C22 |
| Pain au lait | bread |  | 136 | 150 | 64.13 | 85.87 | 0.5725 | 0.4275 | 183.22 | 33.22 | 111.34 | 64.31 | Yellow | Reprice | flour | Pain au lait!B23 | Pain au lait!C23 |
| Zebree | biscuit/sweet |  | 190 | 250 | 106.85 | 143.15 | 0.5726 | 0.4274 | 305.27 | 55.27 | 155.6 | 41.62 | Yellow | Reprice | flour | Zebree!B23 | Zebree!C23 |
| Donuts | fried/snack |  | 40 | 50 | 21.27 | 28.73 | 0.5746 | 0.4254 | 60.77 | 10.77 | 32.91 | 291.94 | Yellow | Reprice | oil | Donuts!B18 | Donuts!C18 |
| Ice Cream | ice cream | cupcakes | 70 | 100 | 42.27 | 57.73 | 0.5773 | 0.4227 | 120.77 | 20.77 | 57.96 | 93.6 | Yellow | Reprice | Powdered Milk | Ice Cream!B14 | Ice Cream!C14 |
| buns new look | buns |  | 95 | 100 | 41.87 | 58.13 | 0.5813 | 0.4187 | 119.63 | 19.63 | 79.41 | 43.5 | Yellow | Reprice | flour | buns new look!C20 | buns new look!D20 |
| Zebree | biscuit/sweet |  | 370 | 500 | 208.07 | 291.93 | 0.5839 | 0.4161 | 594.48 | 94.48 | 311.2 | 20.81 | Yellow | Reprice | flour | Zebree!B22 | Zebree!C22 |
| Best Chinchin | fried/snack |  | 45 | 100 | 40.14 | 59.86 | 0.5986 | 0.4014 | 114.68 | 14.68 | 39.24 | 538.29 | Yellow | Reprice | oil | Best Chinchin!B19 | Best Chinchin!C19 |
| Best Chinchin | fried/snack |  | 225 | 500 | 200.69 | 299.31 | 0.5986 | 0.4014 | 573.4 | 73.4 | 196.2 | 107.66 | Yellow | Reprice | oil | Best Chinchin!B20 | Best Chinchin!C20 |
| Banh Mi | bread |  | 65 | 50 | 19.99 | 30.01 | 0.6002 | 0.3998 | 57.12 | 7.12 | 56.9 | 64.78 | Yellow | Reformulate + reprice | flour | Banh Mi!B19 | Banh Mi!C19 |
| Zebree | biscuit/sweet |  | 700 | 1000 | 393.64 | 606.36 | 0.6064 | 0.3936 | 1124.69 | 124.69 | 622.39 | 10.41 | Yellow | Reprice | flour | Zebree!B24 | Zebree!C24 |
| Cake Prof | cake/gateau | cupcakes | 230 | 500 | 196.17 | 303.83 | 0.6077 | 0.3923 | 560.48 | 60.48 | 205.18 | 13.39 | Yellow | Reprice | Egg | Cake Prof!B16 | Cake Prof!C16 |
| CAKE NOW | cake/gateau | cupcakes | 220 | 500 | 190.19 | 309.81 | 0.6196 | 0.3804 | 543.41 | 43.41 | 202.43 | 12.28 | Yellow | Reprice | Egg | CAKE NOW!B17 | CAKE NOW!C17 |
| Pain au lait | bread |  | 800 | 1000 | 377.21 | 622.79 | 0.6228 | 0.3772 | 1077.75 | 77.75 | 742.28 | 9.65 | Yellow | Reprice | flour | Pain au lait!B25 | Pain au lait!C25 |
| Pancake | cake/gateau |  | 60 | 100 | 37.72 | 62.28 | 0.6228 | 0.3772 | 107.78 | 7.78 | 55.67 | 49.52 | Yellow | Reprice | milk | Pancake!B19 | Pancake!C19 |
| BUNS SPECIAL | buns |  | 55 | 100 | 36.38 | 63.62 | 0.6362 | 0.3638 | 103.93 | 3.93 | 52.92 | 98.68 | Yellow | Reprice | flour | BUNS SPECIAL!B18 | BUNS SPECIAL!C18 |
| Croissant | pastry/savory |  | 190 | 250 | 88.52 | 161.48 | 0.6459 | 0.3541 | 252.93 | 2.93 | 187.8 | 12.28 | Yellow | Reprice | flour | Croissant!B19 | Croissant!C19 |
| Sugar Balls | fried/snack |  | 80 | 100 | 33.76 | 66.24 | 0.6624 | 0.3376 | 96.46 | -3.54 | 82.94 | 71.78 | Green | Renegotiate ingredient | flour | Sugar Balls!B18 | Sugar Balls!C18 |
| Sugar Balls | fried/snack |  | 80 | 100 | 33.76 | 66.24 | 0.6624 | 0.3376 | 96.46 | -3.54 | 82.94 | 71.78 | Green | Renegotiate ingredient | flour | Sugar Balls!B19 | Sugar Balls!C19 |
| Chinchin | fried/snack |  | 45 | 100 | 32.99 | 67.01 | 0.6701 | 0.3299 | 94.26 | -5.74 | 47.74 | 44.48 | Green | Renegotiate ingredient | egg | Chinchin!B19 | Chinchin!C19 |
| New bageutte | bread |  | 90 | 100 | 32.63 | 67.37 | 0.6737 | 0.3263 | 93.23 | -6.77 | 96.53 | 2.18 | Green | Reformulate + reprice | flour | New bageutte!B17 | New bageutte!C17 |
| Croissant | pastry/savory |  | 700 | 1000 | 326.14 | 673.86 | 0.6739 | 0.3261 | 931.84 | -68.16 | 751.2 | 3.07 | Green | Reprice | flour | Croissant!B20 | Croissant!C20 |
| Chinchin | fried/snack |  | 220 | 500 | 161.3 | 338.7 | 0.6774 | 0.3226 | 460.85 | -39.15 | 238.69 | 8.9 | Green | Renegotiate ingredient | egg | Chinchin!B21 | Chinchin!C21 |
| New bread | bread |  | 90 | 100 | 31.79 | 68.21 | 0.6821 | 0.3179 | 90.83 | -9.17 | 99.08 | 85.34 | Green | Renegotiate ingredient | flour | New bread!C20 | New bread!D20 |
| Pancake | cake/gateau |  | 50 | 100 | 31.44 | 68.56 | 0.6856 | 0.3144 | 89.82 | -10.18 | 55.67 | 49.52 | Green | Reprice | milk | Pancake!B20 | Pancake!C20 |
| Pain au lait | bread |  | 200 | 300 | 94.3 | 205.7 | 0.6857 | 0.3143 | 269.44 | -30.56 | 222.69 | 32.15 | Green | Reprice | flour | Pain au lait!B24 | Pain au lait!C24 |
| baguette | bread |  | 90 | 100 | 30.78 | 69.22 | 0.6922 | 0.3078 | 87.93 | -12.07 | 102.35 | 33.82 | Green | Reformulate + reprice | flour | baguette!B16 | baguette!C16 |
| Chinchin | fried/snack |  | 40 | 100 | 29.33 | 70.67 | 0.7067 | 0.2933 | 83.79 | -16.21 | 47.74 | 44.48 | Green | Renegotiate ingredient | egg | Chinchin!B20 | Chinchin!C20 |
| Banh Mi | bread |  | 90 | 100 | 27.68 | 72.32 | 0.7232 | 0.2768 | 79.09 | -20.91 | 113.79 | 32.39 | Green | Reformulate + reprice | flour | Banh Mi!B17 | Banh Mi!C17 |
| Donuts | fried/snack |  | 22 | 50 | 11.7 | 38.3 | 0.766 | 0.234 | 33.43 | -16.57 | 32.91 | 291.94 | Green | Reprice | oil | Donuts!B19 | Donuts!C19 |
| Fish Pie | pastry/savory |  | 150 | 500 | 109.96 | 390.04 | 0.7801 | 0.2199 | 314.18 | -185.82 | 238.71 | 8.36 | Green | Reprice | Butter | Fish Pie!B24 | Fish Pie!C24 |
| Croissant | pastry/savory |  | 45 | 100 | 20.97 | 79.03 | 0.7903 | 0.2097 | 59.9 | -40.1 | 75.12 | 30.7 | Green | Reprice | flour | Croissant!B18 | Croissant!C18 |
| Okinawa | biscuit/sweet |  | 150 | 500 | 89.88 | 410.12 | 0.8202 | 0.1798 | 256.79 | -243.21 | 292.07 | 8.87 | Green | Reprice | flour | Okinawa!B18 | Okinawa!C18 |
| Donuts | fried/snack |  | 150 | 500 | 79.77 | 420.23 | 0.8405 | 0.1595 | 227.9 | -272.1 | 329.09 | 29.19 | Green | Reprice | oil | Donuts!B20 | Donuts!C20 |
| Sugar Balls | fried/snack |  | 150 | 500 | 63.3 | 436.7 | 0.8734 | 0.1266 | 180.86 | -319.14 | 414.69 | 14.36 | Green | Renegotiate ingredient | flour | Sugar Balls!B20 | Sugar Balls!C20 |
## Sheet: Dashboard
| Dashboard |
| --- |
| Portfolio health, quick wins, and priority risks |
| Metric | Value |  |  |  |  |  | Status | SKU Count |
| Recipes parsed | 37 |  |  |  |  |  | Red | 33 |
| Saleable SKU rows | 100 |  |  |  |  |  | Yellow | 49 |
| Red SKUs (<50% GM) | 33 |  |  |  |  |  | Green | 18 |
| Yellow SKUs (50-65% GM) | 49 |
| Green SKUs (>=65% GM) | 18 |
| Recipes with top-2 ingredient risk | 30 |
| Workbook formula errors | 18 |
| Top Quick Wins | Recipe | Action | Worst GM % | Target Price Gap | Source |
| 1 | gateau | Reformulate + reprice | 0.2915 | 1024.31 | gateau!B24, gateau!C24 |
| 2 | Brioche Professionel | Resize portion + reprice | 0.3451 | 871.24 | Brioche Professionel!B21, Brioche Professionel!C21 |
| 3 | Danisa biscuits | Reprice | 0.3809 | 768.97 | Danisa biscuits!B23, Danisa biscuits!C23 |
| 4 | professinal Buns | Resize portion + reprice | 0.4056 | 698.31 | professinal Buns!B25, professinal Buns!C25 |
| 5 | BUNS SPECIAL | Reprice | 0.4709 | 511.76 | BUNS SPECIAL!B20, BUNS SPECIAL!C20 |
| 6 | Danisa biscuits | Reprice | 0.4901 | 456.8 | Danisa biscuits!B25, Danisa biscuits!C25 |
| 7 | Delice | Reprice | 0.5022 | 422.29 | Delice!B23, Delice!C23 |
| 8 | Delice | Reprice | 0.5022 | 422.29 | Delice!B25, Delice!C25 |
| 9 | Universal bread | Reprice | 0.5026 | 421.16 | Universal bread!B23, Universal bread!C23 |
| 10 | Kouatchoua gato | Reprice | 0.5112 | 396.51 | Kouatchoua gato!B23, Kouatchoua gato!C23 |
## Sheet: Recipes Index
| Recipes Index |
| --- |
| One row per recipe with economics and recommended action |
| Recipe | Category | Base Mass | Base Cost | Ingredient Lines | SKU Rows | Top-2 Cost Share | Worst GM % | Worst Price Gap | Action | Reason |
| baguette | bread | 9890 | 3382 | 5 | 3 | 0.8941 | 0.3161 | 95.41 | Reformulate + reprice | Worst SKU is 31.6% GM and top-2 ingredients drive 89.4% of base cost. |
| New bageutte | bread | 602 | 218.27 | 6 | 3 | 0.9301 | 0.0936 | 317.95 | Reformulate + reprice | Worst SKU is 9.4% GM and top-2 ingredients drive 93.0% of base cost. |
| Banh Mi | bread | 10530 | 3238.75 | 6 | 3 | 0.9078 | 0.2311 | 239.39 | Reformulate + reprice | Worst SKU is 23.1% GM and top-2 ingredients drive 90.8% of base cost. |
| cake marbre | cake/gateau | 5227 | 5914.94 | 10 | 2 | 0.6706 | 0.4342 | 61.66 | Reprice | Raise worst SKU to target price or reduce portion to 30.93g for 65% GM. |
| gateau | cake/gateau | 39880 | 31394.74 | 12 | 4 | 0.8202 | 0.2915 | 1024.31 | Reformulate + reprice | Worst SKU is 29.1% GM and top-2 ingredients drive 82.0% of base cost. |
| Kouatchoua gato | cake/gateau | 50710 | 27540.05 | 11 | 4 | 0.7662 | 0.5112 | 39.65 | Reprice | Raise worst SKU to target price or reduce portion to 64.45g for 65% GM. |
| BUNS SPECIAL | buns | 14920 | 9868.04 | 9 | 3 | 0.7499 | 0.4709 | 511.76 | Reprice | Raise worst SKU to target price or reduce portion to 529.18g for 65% GM. |
| buns new look | buns | 9870 | 4349.97 | 9 | 1 | 0.7666 | 0.5813 | 19.63 | Reprice | Raise worst SKU to target price or reduce portion to 79.41g for 65% GM. |
| YUMMY BREAD | bread | 26250 | 12134 | 10 | 3 | 0.6506 | 0.4675 | 65.18 | Reprice | Raise worst SKU to target price or reduce portion to 94.65g for 65% GM. |
| Donuts | fried/snack | 27450 | 14597.07 | 9 | 3 | 0.7632 | 0.5746 | 10.77 | Reprice | Raise worst SKU to target price or reduce portion to 32.91g for 65% GM. |
| Fish Pie | pastry/savory | 5700 | 4178.65 | 12 | 3 | 0.6643 | 0.3769 | 78.04 | Reprice | Raise worst SKU to target price or reduce portion to 47.74g for 65% GM. |
| Galette | pastry/savory | 16995 | 10606.44 | 12 | 3 | 0.5647 | 0.507 | 40.87 | Reprice | Raise worst SKU to target price or reduce portion to 56.08g for 65% GM. |
| New bread | bread | 24160 | 8534.43 | 9 | 1 | 0.8337 | 0.6821 | -9.17 | Renegotiate ingredient | Margin is acceptable but top-2 ingredients drive 83.4% of base cost. |
| NGALA BREAD | bread | 15430 | 7531.89 | 9 | 1 | 0.7444 | 0.5607 | 25.52 | Reprice | Raise worst SKU to target price or reduce portion to 71.70g for 65% GM. |
| Pain au lait | bread | 20457 | 9645.83 | 13 | 3 | 0.6535 | 0.5725 | 33.22 | Reprice | Raise worst SKU to target price or reduce portion to 111.34g for 65% GM. |
| NEW BRIOCHE | bread | 17213 | 10838.38 | 11 | 3 | 0.6789 | 0.4837 | 47.52 | Reprice | Raise worst SKU to target price or reduce portion to 55.59g for 65% GM. |
| Brioche Professionel | bread | 10750 | 8800.68 | 9 | 3 | 0.5447 | 0.3451 | 871.24 | Resize portion + reprice | Worst SKU is 34.5% GM; current portion is too large for the price. |
| professinal Buns | buns | 13905 | 10331.56 | 13 | 3 | 0.5499 | 0.2941 | 101.67 | Resize portion + reprice | Worst SKU is 29.4% GM; current portion is too large for the price. |
| brioche | bread | 17400 | 10861.15 | 11 | 3 | 0.6775 | 0.4882 | 46.24 | Reprice | Raise worst SKU to target price or reduce portion to 56.07g for 65% GM. |
| choko bread | bread | 8384 | 5322.09 | 11 | 3 | 0.6388 | 0.3652 | 81.37 | Reprice | Raise worst SKU to target price or reduce portion to 55.14g for 65% GM. |
| Cake Prof | cake/gateau | 7850 | 6695.29 | 5 | 2 | 0.646 | 0.5138 | 38.9 | Reprice | Raise worst SKU to target price or reduce portion to 41.04g for 65% GM. |
| Pancake | cake/gateau | 7876 | 4951.94 | 9 | 2 | 0.7051 | 0.6228 | 7.78 | Reprice | Raise worst SKU to target price or reduce portion to 55.67g for 65% GM. |
| Chinchin | fried/snack | 6067 | 4448.14 | 9 | 3 | 0.6996 | 0.6701 | -5.74 | Renegotiate ingredient | Margin is acceptable but top-2 ingredients drive 70.0% of base cost. |
| Best Chinchin | fried/snack | 60350 | 53829.08 | 10 | 3 | 0.6109 | 0.554 | 274.21 | Reprice | Raise worst SKU to target price or reduce portion to 392.40g for 65% GM. |
| Sugar Balls | fried/snack | 17010 | 7178.32 | 8 | 3 | 0.7611 | 0.6624 | -3.54 | Renegotiate ingredient | Margin is acceptable but top-2 ingredients drive 76.1% of base cost. |
| Delice | biscuit/sweet | 6785 | 4825.11 | 13 | 3 | 0.5207 | 0.5022 | 422.29 | Reprice | Raise worst SKU to target price or reduce portion to 492.17g for 65% GM. |
| Danisa biscuits | biscuit/sweet | 7027 | 5118.47 | 13 | 3 | 0.4909 | 0.3809 | 768.97 | Reprice | Raise worst SKU to target price or reduce portion to 480.51g for 65% GM. |
| Okinawa | biscuit/sweet | 7400 | 4433.91 | 7 | 3 | 0.7961 | 0.5207 | 36.95 | Reprice | Raise worst SKU to target price or reduce portion to 58.41g for 65% GM. |
| CAKE NOW | cake/gateau | 7100 | 6138.07 | 6 | 2 | 0.6481 | 0.4813 | 48.2 | Reprice | Raise worst SKU to target price or reduce portion to 40.49g for 65% GM. |
| Short bread | biscuit/sweet | 3950 | 2982.88 | 7 | 2 | 0.7051 | 0.3204 | 47.09 | Reformulate + reprice | Worst SKU is 32.0% GM and top-2 ingredients drive 70.5% of base cost. |
| Melto | biscuit/sweet | 7490 | 5768.87 | 6 | 2 | 0.7655 | 0.3068 | 49.03 | Reformulate + reprice | Worst SKU is 30.7% GM and top-2 ingredients drive 76.6% of base cost. |
| Ice Cream | ice cream | 15500 | 9360 | 5 | 2 | 0.6496 | 0.4565 | 27.64 | Reprice | Raise worst SKU to target price or reduce portion to 28.98g for 65% GM. |
| Melto1 | biscuit/sweet | 7540 | 5682.32 | 6 | 2 | 0.7772 | 0.3217 | 46.89 | Reformulate + reprice | Worst SKU is 32.2% GM and top-2 ingredients drive 77.7% of base cost. |
| Zebree | biscuit/sweet | 18505 | 10406.22 | 12 | 3 | 0.5756 | 0.5726 | 55.27 | Reprice | Raise worst SKU to target price or reduce portion to 155.60g for 65% GM. |
| Croissant | pastry/savory | 6590 | 3070.41 | 8 | 3 | 0.8354 | 0.6459 | 2.93 | Reprice | Raise worst SKU to target price or reduce portion to 187.80g for 65% GM. |
| Universal bread | bread | 50170 | 27727.7 | 11 | 4 | 0.7898 | 0.5026 | 42.12 | Reprice | Raise worst SKU to target price or reduce portion to 63.33g for 65% GM. |
| Sheet3 | other | 19250 | 9161.49 | 11 | 3 | 0.5745 | 0.4517 | 70.81 | Reprice | Raise worst SKU to target price or reduce portion to 91.93g for 65% GM. |
## Sheet: All Ingredients
| All Ingredients |
| --- |
| Recipe-level ingredient quantities, costs, and concentration risk |
| Recipe | Category | Ingredient | Ingredient Group | Qty | Cost | % Recipe Cost | Risk | Qty Source | Cost Source |
| baguette | bread | flour | flour | 6000 | 2520 | 0.7451 | High | baguette!D5 | baguette!E5 |
| baguette | bread | yeast | yeast | 120 | 336 | 0.0993 | Normal | baguette!D6 | baguette!E6 |
| baguette | bread | salt | salt | 90 | 18.5 | 0.0055 | Normal | baguette!D7 | baguette!E7 |
| baguette | bread | water | water | 3500 | 3.5 | 0.001 | Normal | baguette!D8 | baguette!E8 |
| baguette | bread | improver | improver | 180 | 504 | 0.149 | Normal | baguette!D9 | baguette!E9 |
| New bageutte | bread | flour | flour | 350 | 147 | 0.6735 | High | New bageutte!F5 | New bageutte!G5 |
| New bageutte | bread | yeast | yeast | 2 | 5.6 | 0.0257 | Normal | New bageutte!F6 | New bageutte!G6 |
| New bageutte | bread | sugar | sugar | 10 | 7.4 | 0.0339 | Normal | New bageutte!F7 | New bageutte!G7 |
| New bageutte | bread | salt | salt | 10 | 2.06 | 0.0094 | Normal | New bageutte!F8 | New bageutte!G8 |
| New bageutte | bread | water | water | 210 | 0.21 | 0.001 | Normal | New bageutte!F9 | New bageutte!G9 |
| New bageutte | bread | improver | improver | 20 | 56 | 0.2566 | Medium | New bageutte!F10 | New bageutte!G10 |
| Banh Mi | bread | flour | flour | 6000 | 2520 | 0.7781 | High | Banh Mi!F5 | Banh Mi!G5 |
| Banh Mi | bread | yeast | yeast | 90 | 252 | 0.0778 | Normal | Banh Mi!F6 | Banh Mi!G6 |
| Banh Mi | bread | sugar | sugar | 45 | 33.3 | 0.0103 | Normal | Banh Mi!F7 | Banh Mi!G7 |
| Banh Mi | bread | salt | salt | 45 | 9.25 | 0.0029 | Normal | Banh Mi!F8 | Banh Mi!G8 |
| Banh Mi | bread | water | water | 4200 | 4.2 | 0.0013 | Normal | Banh Mi!F9 | Banh Mi!G9 |
| Banh Mi | bread | improver | improver | 150 | 420 | 0.1297 | Normal | Banh Mi!F10 | Banh Mi!G10 |
| cake marbre | cake/gateau | flour | flour | 2000 | 1040 | 0.1758 | Medium | cake marbre!D5 | cake marbre!E5 |
| cake marbre | cake/gateau | baking powder | baking powder | 70 | 161 | 0.0272 | Normal | cake marbre!D6 | cake marbre!E6 |
| cake marbre | cake/gateau | salt | salt | 20 | 3.78 | 0.0006 | Normal | cake marbre!D7 | cake marbre!E7 |
| cake marbre | cake/gateau | Nut Meg | nutmeg | 10 | 250 | 0.0423 | Normal | cake marbre!D8 | cake marbre!E8 |
| cake marbre | cake/gateau | water | water | 1100 | 16.5 | 0.0028 | Normal | cake marbre!D9 | cake marbre!E9 |
| cake marbre | cake/gateau | Egg | egg | 360 | 1666.67 | 0.2818 | Medium | cake marbre!D10 | cake marbre!E10 |
| cake marbre | cake/gateau | Butter | butter | 1000 | 2300 | 0.3888 | High | cake marbre!D11 | cake marbre!E11 |
| cake marbre | cake/gateau | sugar | sugar | 650 | 416 | 0.0703 | Normal | cake marbre!D12 | cake marbre!E12 |
| cake marbre | cake/gateau | improver | improver | 5 | 15 | 0.0025 | Normal | cake marbre!D13 | cake marbre!E13 |
| cake marbre | cake/gateau | milk | milk | 12 | 46 | 0.0078 | Normal | cake marbre!D14 | cake marbre!E14 |
| gateau | cake/gateau | flour | flour | 25000 | 10500 | 0.3345 | High | gateau!D5 | gateau!E5 |
| gateau | cake/gateau | Butter | butter | 1300 | 780 | 0.0248 | Normal | gateau!D6 | gateau!E6 |
| gateau | cake/gateau | sugar | sugar | 1600 | 1024 | 0.0326 | Normal | gateau!D7 | gateau!E7 |
| gateau | cake/gateau | Conc Milk | milk | 950 | 1170 | 0.0373 | Normal | gateau!D8 | gateau!E8 |
| gateau | cake/gateau | egg | egg | 200 | 740.74 | 0.0236 | Normal | gateau!D9 | gateau!E9 |
| gateau | cake/gateau | salt | salt | 270 | 55.5 | 0.0018 | Normal | gateau!D10 | gateau!E10 |
| gateau | cake/gateau | improver | improver | 170 | 476 | 0.0152 | Normal | gateau!D11 | gateau!E11 |
| gateau | cake/gateau | yeast | yeast | 170 | 476 | 0.0152 | Normal | gateau!D12 | gateau!E12 |
| gateau | cake/gateau | water | water | 10000 | 10 | 0.0003 | Normal | gateau!D13 | gateau!E13 |
| gateau | cake/gateau | Nutmeg | nutmeg | 40 | 360 | 0.0115 | Normal | gateau!D14 | gateau!E14 |
| gateau | cake/gateau | baking powder | baking powder | 170 | 552.5 | 0.0176 | Normal | gateau!D15 | gateau!E15 |
| gateau | cake/gateau | frying oil | oil | 10 | 15250 | 0.4858 | High | gateau!D16 | gateau!E16 |
| Kouatchoua gato | cake/gateau | flour | flour | 27000 | 11340 | 0.4118 | High | Kouatchoua gato!D5 | Kouatchoua gato!E5 |
| Kouatchoua gato | cake/gateau | Butter | butter | 1300 | 1642.11 | 0.0596 | Normal | Kouatchoua gato!D6 | Kouatchoua gato!E6 |
| Kouatchoua gato | cake/gateau | sugar | sugar | 1700 | 1088 | 0.0395 | Normal | Kouatchoua gato!D7 | Kouatchoua gato!E7 |
| Kouatchoua gato | cake/gateau | Conc Milk | milk | 1000 | 1170 | 0.0425 | Normal | Kouatchoua gato!D8 | Kouatchoua gato!E8 |
| Kouatchoua gato | cake/gateau | egg | egg | 1000 | 1333.33 | 0.0484 | Normal | Kouatchoua gato!D9 | Kouatchoua gato!E9 |
| Kouatchoua gato | cake/gateau | salt | salt | 290 | 59.61 | 0.0022 | Normal | Kouatchoua gato!D10 | Kouatchoua gato!E10 |
| Kouatchoua gato | cake/gateau | improver | improver | 140 | 392 | 0.0142 | Normal | Kouatchoua gato!D11 | Kouatchoua gato!E11 |
| Kouatchoua gato | cake/gateau | yeast | yeast | 130 | 364 | 0.0132 | Normal | Kouatchoua gato!D12 | Kouatchoua gato!E12 |
| Kouatchoua gato | cake/gateau | water | water | 10000 | 1 | 0 | Normal | Kouatchoua gato!D13 | Kouatchoua gato!E13 |
| Kouatchoua gato | cake/gateau | baking powder | baking powder | 150 | 390 | 0.0142 | Normal | Kouatchoua gato!D14 | Kouatchoua gato!E14 |
| Kouatchoua gato | cake/gateau | frying oil | oil | 8000 | 9760 | 0.3544 | High | Kouatchoua gato!D15 | Kouatchoua gato!E15 |
| BUNS SPECIAL | buns | flour | flour | 10000 | 4200 | 0.4256 | High | BUNS SPECIAL!D5 | BUNS SPECIAL!E5 |
| BUNS SPECIAL | buns | Butter | butter | 450 | 568.42 | 0.0576 | Normal | BUNS SPECIAL!D6 | BUNS SPECIAL!E6 |
| BUNS SPECIAL | buns | sugar | sugar | 350 | 224 | 0.0227 | Normal | BUNS SPECIAL!D7 | BUNS SPECIAL!E7 |
| BUNS SPECIAL | buns | powder milk | milk | 1000 | 3200 | 0.3243 | High | BUNS SPECIAL!D8 | BUNS SPECIAL!E8 |
| BUNS SPECIAL | buns | egg | egg | 220 | 814.81 | 0.0826 | Normal | BUNS SPECIAL!D9 | BUNS SPECIAL!E9 |
| BUNS SPECIAL | buns | salt | salt | 100 | 20.56 | 0.0021 | Normal | BUNS SPECIAL!D10 | BUNS SPECIAL!E10 |
| BUNS SPECIAL | buns | improver | improver | 150 | 420 | 0.0426 | Normal | BUNS SPECIAL!D11 | BUNS SPECIAL!E11 |
| BUNS SPECIAL | buns | yeast | yeast | 150 | 420 | 0.0426 | Normal | BUNS SPECIAL!D12 | BUNS SPECIAL!E12 |
| BUNS SPECIAL | buns | water | water | 2500 | 0.25 | 0 | Normal | BUNS SPECIAL!D13 | BUNS SPECIAL!E13 |
| buns new look | buns | flour | flour | 6000 | 2520 | 0.5793 | High | buns new look!D5 | buns new look!E5 |
| buns new look | buns | Butter | butter | 300 | 378.95 | 0.0871 | Normal | buns new look!D6 | buns new look!E6 |
| buns new look | buns | sugar | sugar | 50 | 32 | 0.0074 | Normal | buns new look!D7 | buns new look!E7 |
| buns new look | buns | conc milk | milk | 500 | 23.4 | 0.0054 | Normal | buns new look!D8 | buns new look!E8 |
| buns new look | buns | egg | egg | 220 | 814.81 | 0.1873 | Medium | buns new look!D9 | buns new look!E9 |
| buns new look | buns | salt | salt | 100 | 20.56 | 0.0047 | Normal | buns new look!D10 | buns new look!E10 |
| buns new look | buns | improver | improver | 100 | 280 | 0.0644 | Normal | buns new look!D11 | buns new look!E11 |
| buns new look | buns | yeast | yeast | 100 | 280 | 0.0644 | Normal | buns new look!D12 | buns new look!E12 |
| buns new look | buns | water | water | 2500 | 0.25 | 0.0001 | Normal | buns new look!D13 | buns new look!E13 |
| YUMMY BREAD | bread | flour | flour | 15000 | 6000 | 0.4945 | High | YUMMY BREAD!D5 | YUMMY BREAD!E5 |
| YUMMY BREAD | bread | Butter | butter | 1500 | 1894.74 | 0.1562 | Medium | YUMMY BREAD!D6 | YUMMY BREAD!E6 |
| YUMMY BREAD | bread | sugar | sugar | 1500 | 960 | 0.0791 | Normal | YUMMY BREAD!D7 | YUMMY BREAD!E7 |
| YUMMY BREAD | bread | Milk | milk | 1000 | 1170 | 0.0964 | Normal | YUMMY BREAD!D8 | YUMMY BREAD!E8 |
| YUMMY BREAD | bread | egg | egg | 750 | 1000 | 0.0824 | Normal | YUMMY BREAD!D9 | YUMMY BREAD!E9 |
| YUMMY BREAD | bread | salt | salt | 120 | 24.67 | 0.002 | Normal | YUMMY BREAD!D10 | YUMMY BREAD!E10 |
| YUMMY BREAD | bread | improver | improver | 120 | 336 | 0.0277 | Normal | YUMMY BREAD!D11 | YUMMY BREAD!E11 |
| YUMMY BREAD | bread | yeast | yeast | 160 | 448 | 0.0369 | Normal | YUMMY BREAD!D12 | YUMMY BREAD!E12 |
| YUMMY BREAD | bread | water | water | 6000 | 0.6 | 0 | Normal | YUMMY BREAD!D13 | YUMMY BREAD!E13 |
| YUMMY BREAD | bread | EDC | edc | 100 | 300 | 0.0247 | Normal | YUMMY BREAD!D14 | YUMMY BREAD!E14 |
| Donuts | fried/snack | flour | flour | 12000 | 5040 | 0.3453 | High | Donuts!D5 | Donuts!E5 |
| Donuts | fried/snack | baking powder | baking powder | 190 | 494 | 0.0338 | Normal | Donuts!D6 | Donuts!E6 |
| Donuts | fried/snack | milk | milk | 500 | 585 | 0.0401 | Normal | Donuts!D7 | Donuts!E7 |
| Donuts | fried/snack | salt | salt | 120 | 24.67 | 0.0017 | Normal | Donuts!D8 | Donuts!E8 |
| Donuts | fried/snack | Sugar | sugar | 1200 | 768 | 0.0526 | Normal | Donuts!D9 | Donuts!E9 |
| Donuts | fried/snack | Improver | improver | 90 | 252 | 0.0173 | Normal | Donuts!D10 | Donuts!E10 |
| Donuts | fried/snack | eggs | egg | 1000 | 1333.33 | 0.0913 | Normal | Donuts!D11 | Donuts!E11 |
| Donuts | fried/snack | water | water | 7350 | 0.07 | 0 | Normal | Donuts!D12 | Donuts!E12 |
| Donuts | fried/snack | oil | oil | 5000 | 6100 | 0.4179 | High | Donuts!D13 | Donuts!E13 |
| Fish Pie | pastry/savory | flour | flour | 3000 | 1260 | 0.3015 | High | Fish Pie!D5 | Fish Pie!E5 |
| Fish Pie | pastry/savory | baking powder | baking powder | 50 | 130 | 0.0311 | Normal | Fish Pie!D6 | Fish Pie!E6 |
| Fish Pie | pastry/savory | Butter | butter | 1200 | 1515.79 | 0.3627 | High | Fish Pie!D7 | Fish Pie!E7 |
| Fish Pie | pastry/savory | Improver | improver | 40 | 104 | 0.0249 | Normal | Fish Pie!D8 | Fish Pie!E8 |
| Fish Pie | pastry/savory | fish | fish | 400 | 480 | 0.1149 | Normal | Fish Pie!D9 | Fish Pie!E9 |
| Fish Pie | pastry/savory | carrots | carrots | 200 | 171.43 | 0.041 | Normal | Fish Pie!D10 | Fish Pie!E10 |
| Fish Pie | pastry/savory | Green beans | green beans | 100 | 20 | 0.0048 | Normal | Fish Pie!D11 | Fish Pie!E11 |
| Fish Pie | pastry/savory | peppers | peppers | 10 | 4 | 0.001 | Normal | Fish Pie!D12 | Fish Pie!E12 |
| Fish Pie | pastry/savory | onions | onions | 100 | 200 | 0.0479 | Normal | Fish Pie!D13 | Fish Pie!E13 |
| Fish Pie | pastry/savory | irish | irish | 300 | 171.43 | 0.041 | Normal | Fish Pie!D14 | Fish Pie!E14 |
| Fish Pie | pastry/savory | oil | oil | 100 | 122 | 0.0292 | Normal | Fish Pie!D15 | Fish Pie!E15 |
| Fish Pie | pastry/savory | cabbage | cabbage | 200 |  |  | Normal | Fish Pie!D16 | Fish Pie!E16 |
| Galette | pastry/savory | flour | flour | 10000 | 4200 | 0.396 | High | Galette!D5 | Galette!E5 |
| Galette | pastry/savory | Butter | butter | 1000 | 1263.16 | 0.1191 | Normal | Galette!D6 | Galette!E6 |
| Galette | pastry/savory | sugar | sugar | 1000 | 640 | 0.0603 | Normal | Galette!D7 | Galette!E7 |
| Galette | pastry/savory | Milk | milk | 800 | 936 | 0.0882 | Normal | Galette!D8 | Galette!E8 |
| Galette | pastry/savory | egg | egg | 750 | 1000 | 0.0943 | Normal | Galette!D9 | Galette!E9 |
| Galette | pastry/savory | salt | salt | 110 | 22.61 | 0.0021 | Normal | Galette!D10 | Galette!E10 |
| Galette | pastry/savory | improver | improver | 100 | 280 | 0.0264 | Normal | Galette!D11 | Galette!E11 |
| Galette | pastry/savory | yeast | yeast | 80 | 224 | 0.0211 | Normal | Galette!D12 | Galette!E12 |
| Galette | pastry/savory | water | water | 2000 | 0.2 | 0 | Normal | Galette!D13 | Galette!E13 |
| Galette | pastry/savory | baking powder | baking powder | 80 | 26 | 0.0025 | Normal | Galette!D14 | Galette!E14 |
| Galette | pastry/savory | Chocolate | chocolate | 1000 | 1789.47 | 0.1687 | Medium | Galette!D15 | Galette!E15 |
| Galette | pastry/savory | EDC | edc | 75 | 225 | 0.0212 | Normal | Galette!D16 | Galette!E16 |
| New bread | bread | flour | flour | 15000 | 6300 | 0.7382 | High | New bread!D5 | New bread!E5 |
| New bread | bread | Butter | butter | 600 | 757.89 | 0.0888 | Normal | New bread!D6 | New bread!E6 |
| New bread | bread | sugar | sugar | 100 | 64 | 0.0075 | Normal | New bread!D7 | New bread!E7 |
| New bread | bread | conc milk | milk | 950 | 44.46 | 0.0052 | Normal | New bread!D8 | New bread!E8 |
| New bread | bread | egg | egg | 220 | 814.81 | 0.0955 | Normal | New bread!D9 | New bread!E9 |
| New bread | bread | salt | salt | 100 | 20.56 | 0.0024 | Normal | New bread!D10 | New bread!E10 |
| New bread | bread | improver | improver | 100 | 280 | 0.0328 | Normal | New bread!D11 | New bread!E11 |
| New bread | bread | yeast | yeast | 90 | 252 | 0.0295 | Normal | New bread!D12 | New bread!E12 |
| New bread | bread | water | water | 7000 | 0.7 | 0.0001 | Normal | New bread!D13 | New bread!E13 |
| NGALA BREAD | bread | flour | flour | 8500 | 3570 | 0.474 | High | NGALA BREAD!D5 | NGALA BREAD!E5 |
| NGALA BREAD | bread | Butter | butter | 1000 | 1263.16 | 0.1677 | Medium | NGALA BREAD!D6 | NGALA BREAD!E6 |
| NGALA BREAD | bread | sugar | sugar | 100 | 64 | 0.0085 | Normal | NGALA BREAD!D7 | NGALA BREAD!E7 |
| NGALA BREAD | bread | conc milk | milk | 1000 | 46.8 | 0.0062 | Normal | NGALA BREAD!D8 | NGALA BREAD!E8 |
| NGALA BREAD | bread | egg | egg | 550 | 2037.04 | 0.2705 | Medium | NGALA BREAD!D9 | NGALA BREAD!E9 |
| NGALA BREAD | bread | salt | salt | 90 | 18.5 | 0.0025 | Normal | NGALA BREAD!D10 | NGALA BREAD!E10 |
| NGALA BREAD | bread | improver | improver | 100 | 280 | 0.0372 | Normal | NGALA BREAD!D11 | NGALA BREAD!E11 |
| NGALA BREAD | bread | yeast | yeast | 90 | 252 | 0.0335 | Normal | NGALA BREAD!D12 | NGALA BREAD!E12 |
| NGALA BREAD | bread | water | water | 4000 | 0.4 | 0.0001 | Normal | NGALA BREAD!D13 | NGALA BREAD!E13 |
| Pain au lait | bread | flour | flour | 12000 | 5040 | 0.5225 | High | Pain au lait!D5 | Pain au lait!E5 |
| Pain au lait | bread | Butter | butter | 1000 | 1263.16 | 0.131 | Normal | Pain au lait!D6 | Pain au lait!E6 |
| Pain au lait | bread | sugar | sugar | 1100 | 704 | 0.073 | Normal | Pain au lait!D7 | Pain au lait!E7 |
| Pain au lait | bread | Milk | milk | 950 | 1111.5 | 0.1152 | Normal | Pain au lait!D8 | Pain au lait!E8 |
| Pain au lait | bread | egg | egg | 300 | 400 | 0.0415 | Normal | Pain au lait!D9 | Pain au lait!E9 |
| Pain au lait | bread | salt | salt | 85 | 17.47 | 0.0018 | Normal | Pain au lait!D10 | Pain au lait!E10 |
| Pain au lait | bread | improver | improver | 100 | 280 | 0.029 | Normal | Pain au lait!D11 | Pain au lait!E11 |
| Pain au lait | bread | yeast | yeast | 80 | 224 | 0.0232 | Normal | Pain au lait!D12 | Pain au lait!E12 |
| Pain au lait | bread | water | water | 4500 | 0.45 | 0 | Normal | Pain au lait!D13 | Pain au lait!E13 |
| Pain au lait | bread | Oil | oil | 300 | 366 | 0.0379 | Normal | Pain au lait!D14 | Pain au lait!E14 |
| Pain au lait | bread | Milk tantalizer | milk | 5 | 56.25 | 0.0058 | Normal | Pain au lait!D15 | Pain au lait!E15 |
| Pain au lait | bread | EDC | edc | 25 | 75 | 0.0078 | Normal | Pain au lait!D16 | Pain au lait!E16 |
| Pain au lait | bread | Nutmeg | nutmeg | 12 | 108 | 0.0112 | Normal | Pain au lait!D17 | Pain au lait!E17 |
| NEW BRIOCHE | bread | flour | flour | 10000 | 4200 | 0.3875 | High | NEW BRIOCHE!D5 | NEW BRIOCHE!E5 |
| NEW BRIOCHE | bread | Butter | butter | 2500 | 3157.89 | 0.2914 | Medium | NEW BRIOCHE!D6 | NEW BRIOCHE!E6 |
| NEW BRIOCHE | bread | sugar | sugar | 1500 | 960 | 0.0886 | Normal | NEW BRIOCHE!D7 | NEW BRIOCHE!E7 |
| NEW BRIOCHE | bread | Milk | milk | 800 | 936 | 0.0864 | Normal | NEW BRIOCHE!D8 | NEW BRIOCHE!E8 |
| NEW BRIOCHE | bread | egg | egg | 500 | 666.67 | 0.0615 | Normal | NEW BRIOCHE!D9 | NEW BRIOCHE!E9 |
| NEW BRIOCHE | bread | salt | salt | 120 | 24.67 | 0.0023 | Normal | NEW BRIOCHE!D10 | NEW BRIOCHE!E10 |
| NEW BRIOCHE | bread | improver | improver | 120 | 336 | 0.031 | Normal | NEW BRIOCHE!D11 | NEW BRIOCHE!E11 |
| NEW BRIOCHE | bread | yeast | yeast | 140 | 392 | 0.0362 | Normal | NEW BRIOCHE!D12 | NEW BRIOCHE!E12 |
| NEW BRIOCHE | bread | water | water | 1500 | 0.15 | 0 | Normal | NEW BRIOCHE!D13 | NEW BRIOCHE!E13 |
| NEW BRIOCHE | bread | Milk tantalizer | milk | 8 | 90 | 0.0083 | Normal | NEW BRIOCHE!D14 | NEW BRIOCHE!E14 |
| NEW BRIOCHE | bread | EDC | edc | 25 | 75 | 0.0069 | Normal | NEW BRIOCHE!D15 | NEW BRIOCHE!E15 |
| Brioche Professionel | bread | flour | flour | 6000 | 2520 | 0.2863 | Medium | Brioche Professionel!D5 | Brioche Professionel!E5 |
| Brioche Professionel | bread | Butter | butter | 1800 | 2273.68 | 0.2584 | Medium | Brioche Professionel!D6 | Brioche Professionel!E6 |
| Brioche Professionel | bread | sugar | sugar | 800 | 512 | 0.0582 | Normal | Brioche Professionel!D7 | Brioche Professionel!E7 |
| Brioche Professionel | bread | CONC MILK | milk | 1000 | 1170 | 0.1329 | Normal | Brioche Professionel!D8 | Brioche Professionel!E8 |
| Brioche Professionel | bread | egg | egg | 800 | 1066.67 | 0.1212 | Normal | Brioche Professionel!D9 | Brioche Professionel!E9 |
| Brioche Professionel | bread | salt | salt | 60 | 12.33 | 0.0014 | Normal | Brioche Professionel!D10 | Brioche Professionel!E10 |
| Brioche Professionel | bread | improver | improver | 100 | 280 | 0.0318 | Normal | Brioche Professionel!D11 | Brioche Professionel!E11 |
| Brioche Professionel | bread | yeast | yeast | 120 | 336 | 0.0382 | Normal | Brioche Professionel!D12 | Brioche Professionel!E12 |
| Brioche Professionel | bread | Nutmeg | nutmeg | 70 | 630 | 0.0716 | Normal | Brioche Professionel!D13 | Brioche Professionel!E13 |
| professinal Buns | buns | flour | flour | 10000 | 4200 | 0.4065 | High | professinal Buns!D5 | professinal Buns!E5 |
| professinal Buns | buns | Butter | butter | 1000 | 1263.16 | 0.1223 | Normal | professinal Buns!D6 | professinal Buns!E6 |
| professinal Buns | buns | sugar | sugar | 800 | 512 | 0.0496 | Normal | professinal Buns!D7 | professinal Buns!E7 |
| professinal Buns | buns | CONC MILK | milk | 700 | 819 | 0.0793 | Normal | professinal Buns!D8 | professinal Buns!E8 |
| professinal Buns | buns | egg | egg | 400 | 1481.48 | 0.1434 | Normal | professinal Buns!D9 | professinal Buns!E9 |
| professinal Buns | buns | salt | salt | 70 | 14.39 | 0.0014 | Normal | professinal Buns!D10 | professinal Buns!E10 |
| professinal Buns | buns | improver | improver | 100 | 280 | 0.0271 | Normal | professinal Buns!D11 | professinal Buns!E11 |
| professinal Buns | buns | yeast | yeast | 110 | 308 | 0.0298 | Normal | professinal Buns!D12 | professinal Buns!E12 |
| professinal Buns | buns | water | water | 300 | 0.03 | 0 | Normal | professinal Buns!D13 | professinal Buns!E13 |
| professinal Buns | buns | EDC | edc | 25 | 75 | 0.0073 | Normal | professinal Buns!D14 | professinal Buns!E14 |
| professinal Buns | buns | Milk tantalizer | milk | 50 | 562.5 | 0.0544 | Normal | professinal Buns!D15 | professinal Buns!E15 |
| professinal Buns | buns | Oil | oil | 300 | 366 | 0.0354 | Normal | professinal Buns!D16 | professinal Buns!E16 |
| professinal Buns | buns | Nutmeg | nutmeg | 50 | 450 | 0.0436 | Normal | professinal Buns!D17 | professinal Buns!E17 |
| brioche | bread | flour | flour | 10000 | 4200 | 0.3867 | High | brioche!D5 | brioche!E5 |
| brioche | bread | Butter | butter | 2500 | 3157.89 | 0.2908 | Medium | brioche!D6 | brioche!E6 |
| brioche | bread | sugar | sugar | 1500 | 960 | 0.0884 | Normal | brioche!D7 | brioche!E7 |
| brioche | bread | Milk | milk | 800 | 936 | 0.0862 | Normal | brioche!D8 | brioche!E8 |
| brioche | bread | egg | egg | 500 | 666.67 | 0.0614 | Normal | brioche!D9 | brioche!E9 |
| brioche | bread | salt | salt | 120 | 24.67 | 0.0023 | Normal | brioche!D10 | brioche!E10 |
| brioche | bread | improver | improver | 100 | 280 | 0.0258 | Normal | brioche!D11 | brioche!E11 |
| brioche | bread | yeast | yeast | 140 | 392 | 0.0361 | Normal | brioche!D12 | brioche!E12 |
| brioche | bread | water | water | 1700 | 0.17 | 0 | Normal | brioche!D13 | brioche!E13 |
| brioche | bread | Milk tantalizer | milk | 15 | 168.75 | 0.0155 | Normal | brioche!D14 | brioche!E14 |
| brioche | bread | EDC | edc | 25 | 75 | 0.0069 | Normal | brioche!D15 | brioche!E15 |
| choko bread | bread | flour | flour | 5000 | 2500 | 0.4697 | High | choko bread!D5 | choko bread!E5 |
| choko bread | bread | Butter | butter | 200 | 294.74 | 0.0554 | Normal | choko bread!D6 | choko bread!E6 |
| choko bread | bread | sugar | sugar | 300 | 210 | 0.0395 | Normal | choko bread!D7 | choko bread!E7 |
| choko bread | bread | Milk | milk | 100 | 300 | 0.0564 | Normal | choko bread!D8 | choko bread!E8 |
| choko bread | bread | egg | egg | 200 | 851.85 | 0.1601 | Medium | choko bread!D9 | choko bread!E9 |
| choko bread | bread | salt | salt | 45 | 8.5 | 0.0016 | Normal | choko bread!D10 | choko bread!E10 |
| choko bread | bread | improver | improver | 20 | 60 | 0.0113 | Normal | choko bread!D11 | choko bread!E11 |
| choko bread | bread | yeast | yeast | 14 | 42 | 0.0079 | Normal | choko bread!D12 | choko bread!E12 |
| choko bread | bread | water | water | 2000 | 30 | 0.0056 | Normal | choko bread!D13 | choko bread!E13 |
| choko bread | bread | Nutmeg | nutmeg | 5 | 125 | 0.0235 | Normal | choko bread!D14 | choko bread!E14 |
| choko bread | bread | choclate | choclate | 500 | 900 | 0.1691 | Medium | choko bread!D15 | choko bread!E15 |
| Cake Prof | cake/gateau | flour | flour | 3500 | 1470 | 0.2196 | Medium | Cake Prof!D5 | Cake Prof!E5 |
| Cake Prof | cake/gateau | baking powder | baking powder | 100 | 260 | 0.0388 | Normal | Cake Prof!D6 | Cake Prof!E6 |
| Cake Prof | cake/gateau | Egg | egg | 1750 | 2430.56 | 0.363 | High | Cake Prof!D7 | Cake Prof!E7 |
| Cake Prof | cake/gateau | Butter | butter | 1500 | 1894.74 | 0.283 | Medium | Cake Prof!D8 | Cake Prof!E8 |
| Cake Prof | cake/gateau | sugar | sugar | 1000 | 640 | 0.0956 | Normal | Cake Prof!D9 | Cake Prof!E9 |
| Pancake | cake/gateau | flour | flour | 2000 | 1000 | 0.2019 | Medium | Pancake!D5 | Pancake!E5 |
| Pancake | cake/gateau | yeast | yeast | 30 | 69 | 0.0139 | Normal | Pancake!D6 | Pancake!E6 |
| Pancake | cake/gateau | salt | salt | 20 | 3.78 | 0.0008 | Normal | Pancake!D7 | Pancake!E7 |
| Pancake | cake/gateau | Nut Meg | nutmeg | 20 | 500 | 0.101 | Normal | Pancake!D8 | Pancake!E8 |
| Pancake | cake/gateau | water | water | 4500 | 67.5 | 0.0136 | Normal | Pancake!D9 | Pancake!E9 |
| Pancake | cake/gateau | Egg | egg | 36 | 153.33 | 0.031 | Normal | Pancake!D10 | Pancake!E10 |
| Pancake | cake/gateau | sugar | sugar | 600 | 600 | 0.1212 | Normal | Pancake!D11 | Pancake!E11 |
| Pancake | cake/gateau | improver | improver | 20 | 66.67 | 0.0135 | Normal | Pancake!D12 | Pancake!E12 |
| Pancake | cake/gateau | milk | milk | 650 | 2491.67 | 0.5032 | High | Pancake!D13 | Pancake!E13 |
| Chinchin | fried/snack | flour | flour | 3600 | 1512 | 0.3399 | High | Chinchin!D5 | Chinchin!E5 |
| Chinchin | fried/snack | baking powder | baking powder | 70 | 182 | 0.0409 | Normal | Chinchin!D6 | Chinchin!E6 |
| Chinchin | fried/snack | nut meg | nutmeg | 5 | 45 | 0.0101 | Normal | Chinchin!D7 | Chinchin!E7 |
| Chinchin | fried/snack | sugar | sugar | 650 | 416 | 0.0935 | Normal | Chinchin!D8 | Chinchin!E8 |
| Chinchin | fried/snack | Butter | butter | 450 | 568.42 | 0.1278 | Normal | Chinchin!D9 | Chinchin!E9 |
| Chinchin | fried/snack | egg | egg | 1200 | 1600 | 0.3597 | High | Chinchin!D10 | Chinchin!E10 |
| Chinchin | fried/snack | salt | salt | 50 | 10.28 | 0.0023 | Normal | Chinchin!D11 | Chinchin!E11 |
| Chinchin | fried/snack | improver | improver | 40 | 112 | 0.0252 | Normal | Chinchin!D12 | Chinchin!E12 |
| Chinchin | fried/snack | oil | oil | 2 | 2.44 | 0.0005 | Normal | Chinchin!D13 | Chinchin!E13 |
| Best Chinchin | fried/snack | flour | flour | 25000 | 10500 | 0.1951 | Medium | Best Chinchin!D5 | Best Chinchin!E5 |
| Best Chinchin | fried/snack | baking powder | baking powder | 500 | 1300 | 0.0242 | Normal | Best Chinchin!D6 | Best Chinchin!E6 |
| Best Chinchin | fried/snack | nut meg | nutmeg | 50 | 450 | 0.0084 | Normal | Best Chinchin!D7 | Best Chinchin!E7 |
| Best Chinchin | fried/snack | sugar | sugar | 4500 | 2880 | 0.0535 | Normal | Best Chinchin!D8 | Best Chinchin!E8 |
| Best Chinchin | fried/snack | Butter | butter | 4000 | 5052.63 | 0.0939 | Normal | Best Chinchin!D9 | Best Chinchin!E9 |
| Best Chinchin | fried/snack | egg | egg | 10500 | 14583.33 | 0.2709 | Medium | Best Chinchin!D10 | Best Chinchin!E10 |
| Best Chinchin | fried/snack | salt | salt | 200 | 41.11 | 0.0008 | Normal | Best Chinchin!D11 | Best Chinchin!E11 |
| Best Chinchin | fried/snack | Improver | improver | 200 | 234 | 0.0043 | Normal | Best Chinchin!D12 | Best Chinchin!E12 |
| Best Chinchin | fried/snack | oil | oil | 400 | 488 | 0.0091 | Normal | Best Chinchin!D13 | Best Chinchin!E13 |
| Best Chinchin | fried/snack | oil | oil | 15000 | 18300 | 0.34 | High | Best Chinchin!D14 | Best Chinchin!E14 |
| Sugar Balls | fried/snack | flour | flour | 10000 | 4200 | 0.5851 | High | Sugar Balls!D5 | Sugar Balls!E5 |
| Sugar Balls | fried/snack | baking powder | baking powder | 110 | 286 | 0.0398 | Normal | Sugar Balls!D6 | Sugar Balls!E6 |
| Sugar Balls | fried/snack | sugar | sugar | 1000 | 640 | 0.0892 | Normal | Sugar Balls!D7 | Sugar Balls!E7 |
| Sugar Balls | fried/snack | Butter | butter | 1000 | 1263.16 | 0.176 | Medium | Sugar Balls!D8 | Sugar Balls!E8 |
| Sugar Balls | fried/snack | salt | salt | 120 | 24.67 | 0.0034 | Normal | Sugar Balls!D9 | Sugar Balls!E9 |
| Sugar Balls | fried/snack | Cold Water | water | 4500 | 4.5 | 0.0006 | Normal | Sugar Balls!D10 | Sugar Balls!E10 |
| Sugar Balls | fried/snack | Improver | improver | 120 | 312 | 0.0435 | Normal | Sugar Balls!D11 | Sugar Balls!E11 |
| Sugar Balls | fried/snack | yeast | yeast | 160 | 448 | 0.0624 | Normal | Sugar Balls!D12 | Sugar Balls!E12 |
| Delice | biscuit/sweet | flour | flour | 3000 | 1260 | 0.2611 | Medium | Delice!D5 | Delice!E5 |
| Delice | biscuit/sweet | Butter | butter | 500 | 631.58 | 0.1309 | Normal | Delice!D6 | Delice!E6 |
| Delice | biscuit/sweet | sugar | sugar | 300 | 192 | 0.0398 | Normal | Delice!D7 | Delice!E7 |
| Delice | biscuit/sweet | Milk | milk | 250 | 292.5 | 0.0606 | Normal | Delice!D8 | Delice!E8 |
| Delice | biscuit/sweet | egg | egg | 250 | 333.33 | 0.0691 | Normal | Delice!D9 | Delice!E9 |
| Delice | biscuit/sweet | salt | salt | 35 | 7.19 | 0.0015 | Normal | Delice!D10 | Delice!E10 |
| Delice | biscuit/sweet | improver | improver | 40 | 112 | 0.0232 | Normal | Delice!D11 | Delice!E11 |
| Delice | biscuit/sweet | yeast | yeast | 30 | 84 | 0.0174 | Normal | Delice!D12 | Delice!E12 |
| Delice | biscuit/sweet | water | water | 1200 | 0.12 | 0 | Normal | Delice!D13 | Delice!E13 |
| Delice | biscuit/sweet | baking powder | baking powder | 30 | 9.75 | 0.002 | Normal | Delice!D14 | Delice!E14 |
| Delice | biscuit/sweet | Chocolate | chocolate | 700 | 1252.63 | 0.2596 | Medium | Delice!D15 | Delice!E15 |
| Delice | biscuit/sweet | honey | honey | 400 | 500 | 0.1036 | Normal | Delice!D16 | Delice!E16 |
| Delice | biscuit/sweet | EDC | edc | 50 | 150 | 0.0311 | Normal | Delice!D17 | Delice!E17 |
| Danisa biscuits | biscuit/sweet | flour | flour | 3000 | 1260 | 0.2462 | Medium | Danisa biscuits!D5 | Danisa biscuits!E5 |
| Danisa biscuits | biscuit/sweet | Butter | butter | 500 | 631.58 | 0.1234 | Normal | Danisa biscuits!D6 | Danisa biscuits!E6 |
| Danisa biscuits | biscuit/sweet | sugar | sugar | 300 | 192 | 0.0375 | Normal | Danisa biscuits!D7 | Danisa biscuits!E7 |
| Danisa biscuits | biscuit/sweet | Milk | milk | 250 | 292.5 | 0.0571 | Normal | Danisa biscuits!D8 | Danisa biscuits!E8 |
| Danisa biscuits | biscuit/sweet | egg | egg | 200 | 266.67 | 0.0521 | Normal | Danisa biscuits!D9 | Danisa biscuits!E9 |
| Danisa biscuits | biscuit/sweet | salt | salt | 35 | 7.19 | 0.0014 | Normal | Danisa biscuits!D10 | Danisa biscuits!E10 |
| Danisa biscuits | biscuit/sweet | improver | improver | 40 | 112 | 0.0219 | Normal | Danisa biscuits!D11 | Danisa biscuits!E11 |
| Danisa biscuits | biscuit/sweet | yeast | yeast | 25 | 70 | 0.0137 | Normal | Danisa biscuits!D12 | Danisa biscuits!E12 |
| Danisa biscuits | biscuit/sweet | water | water | 1200 | 0.12 | 0 | Normal | Danisa biscuits!D13 | Danisa biscuits!E13 |
| Danisa biscuits | biscuit/sweet | baking powder | baking powder | 27 | 8.78 | 0.0017 | Normal | Danisa biscuits!D14 | Danisa biscuits!E14 |
| Danisa biscuits | biscuit/sweet | Chocolate | chocolate | 700 | 1252.63 | 0.2447 | Medium | Danisa biscuits!D15 | Danisa biscuits!E15 |
| Danisa biscuits | biscuit/sweet | honey | honey | 700 | 875 | 0.1709 | Medium | Danisa biscuits!D16 | Danisa biscuits!E16 |
| Danisa biscuits | biscuit/sweet | EDC | edc | 50 | 150 | 0.0293 | Normal | Danisa biscuits!D17 | Danisa biscuits!E17 |
| Okinawa | biscuit/sweet | flour | flour | 5500 | 2310 | 0.521 | High | Okinawa!D5 | Okinawa!E5 |
| Okinawa | biscuit/sweet | baking powder | baking powder | 100 | 260 | 0.0586 | Normal | Okinawa!D6 | Okinawa!E6 |
| Okinawa | biscuit/sweet | sugar | sugar | 500 | 320 | 0.0722 | Normal | Okinawa!D7 | Okinawa!E7 |
| Okinawa | biscuit/sweet | egg | egg | 200 | 252.63 | 0.057 | Normal | Okinawa!D8 | Okinawa!E8 |
| Okinawa | biscuit/sweet | salt | salt | 50 | 10.28 | 0.0023 | Normal | Okinawa!D9 | Okinawa!E9 |
| Okinawa | biscuit/sweet | oil | oil | 50 | 61 | 0.0138 | Normal | Okinawa!D10 | Okinawa!E10 |
| Okinawa | biscuit/sweet | frying oil | oil | 1000 | 1220 | 0.2752 | Medium | Okinawa!D11 | Okinawa!E11 |
| CAKE NOW | cake/gateau | flour | flour | 3000 | 1260 | 0.2053 | Medium | CAKE NOW!D5 | CAKE NOW!E5 |
| CAKE NOW | cake/gateau | baking powder | baking powder | 100 | 260 | 0.0424 | Normal | CAKE NOW!D6 | CAKE NOW!E6 |
| CAKE NOW | cake/gateau | Egg | egg | 1500 | 2083.33 | 0.3394 | High | CAKE NOW!D7 | CAKE NOW!E7 |
| CAKE NOW | cake/gateau | water | water |  |  |  | Normal | CAKE NOW!D8 | CAKE NOW!E8 |
| CAKE NOW | cake/gateau | Butter | butter | 1500 | 1894.74 | 0.3087 | High | CAKE NOW!D9 | CAKE NOW!E9 |
| CAKE NOW | cake/gateau | sugar | sugar | 1000 | 640 | 0.1043 | Normal | CAKE NOW!D10 | CAKE NOW!E10 |
| Short bread | biscuit/sweet | flour | flour | 2000 | 840 | 0.2816 | Medium | Short bread!D5 | Short bread!E5 |
| Short bread | biscuit/sweet | Butter | butter | 1000 | 1263.16 | 0.4235 | High | Short bread!D6 | Short bread!E6 |
| Short bread | biscuit/sweet | icing sugar | sugar | 100 | 220 | 0.0738 | Normal | Short bread!D7 | Short bread!E7 |
| Short bread | biscuit/sweet | egg | egg | 100 | 138.89 | 0.0466 | Normal | Short bread!D8 | Short bread!E8 |
| Short bread | biscuit/sweet | milk | milk | 200 | 234 | 0.0784 | Normal | Short bread!D9 | Short bread!E9 |
| Short bread | biscuit/sweet | sugar | sugar | 400 | 256 | 0.0858 | Normal | Short bread!D10 | Short bread!E10 |
| Short bread | biscuit/sweet | salt | salt | 150 | 30.83 | 0.0103 | Normal | Short bread!D11 | Short bread!E11 |
| Melto | biscuit/sweet | flour | flour | 4500 | 1890 | 0.3276 | High | Melto!D5 | Melto!E5 |
| Melto | biscuit/sweet | Butter | butter | 2000 | 2526.32 | 0.4379 | High | Melto!D6 | Melto!E6 |
| Melto | biscuit/sweet | icing sugar | sugar | 400 | 880 | 0.1525 | Medium | Melto!D7 | Melto!E7 |
| Melto | biscuit/sweet | egg | egg | 150 | 208.33 | 0.0361 | Normal | Melto!D8 | Melto!E8 |
| Melto | biscuit/sweet | sugar | sugar | 400 | 256 | 0.0444 | Normal | Melto!D9 | Melto!E9 |
| Melto | biscuit/sweet | salt | salt | 40 | 8.22 | 0.0014 | Normal | Melto!D10 | Melto!E10 |
| Ice Cream | ice cream | Stabilizer | stabilizer | 200 | 2560 | 0.2735 | Medium | Ice Cream!D5 | Ice Cream!E5 |
| Ice Cream | ice cream | Powdered Milk | powdered milk | 1100 | 3520 | 0.3761 | High | Ice Cream!D6 | Ice Cream!E6 |
| Ice Cream | ice cream | Sugar | sugar | 2000 | 1280 | 0.1368 | Normal | Ice Cream!D7 | Ice Cream!E7 |
| Ice Cream | ice cream | Water | water | 12000 | 0 | 0 | Normal | Ice Cream!D8 | Ice Cream!E8 |
| Ice Cream | ice cream | others | others | 200 | 2000 | 0.2137 | Medium | Ice Cream!D9 | Ice Cream!E9 |
| Melto1 | biscuit/sweet | flour | flour | 4500 | 1890 | 0.3326 | High | Melto1!D5 | Melto1!E5 |
| Melto1 | biscuit/sweet | Butter | butter | 2000 | 2526.32 | 0.4446 | High | Melto1!D6 | Melto1!E6 |
| Melto1 | biscuit/sweet | icing sugar | sugar | 300 | 660 | 0.1161 | Normal | Melto1!D7 | Melto1!E7 |
| Melto1 | biscuit/sweet | egg | egg | 200 | 277.78 | 0.0489 | Normal | Melto1!D8 | Melto1!E8 |
| Melto1 | biscuit/sweet | sugar | sugar | 500 | 320 | 0.0563 | Normal | Melto1!D9 | Melto1!E9 |
| Melto1 | biscuit/sweet | salt | salt | 40 | 8.22 | 0.0014 | Normal | Melto1!D10 | Melto1!E10 |
| Zebree | biscuit/sweet | flour | flour | 10000 | 4200 | 0.4036 | High | Zebree!D5 | Zebree!E5 |
| Zebree | biscuit/sweet | Butter | butter | 1000 | 1263.16 | 0.1214 | Normal | Zebree!D6 | Zebree!E6 |
| Zebree | biscuit/sweet | sugar | sugar | 1000 | 640 | 0.0615 | Normal | Zebree!D7 | Zebree!E7 |
| Zebree | biscuit/sweet | Milk | milk | 800 | 936 | 0.0899 | Normal | Zebree!D8 | Zebree!E8 |
| Zebree | biscuit/sweet | egg | egg | 750 | 1000 | 0.0961 | Normal | Zebree!D9 | Zebree!E9 |
| Zebree | biscuit/sweet | salt | salt | 110 | 22.61 | 0.0022 | Normal | Zebree!D10 | Zebree!E10 |
| Zebree | biscuit/sweet | improver | improver | 100 | 280 | 0.0269 | Normal | Zebree!D11 | Zebree!E11 |
| Zebree | biscuit/sweet | yeast | yeast | 85 | 238 | 0.0229 | Normal | Zebree!D12 | Zebree!E12 |
| Zebree | biscuit/sweet | water | water | 3500 | 0.35 | 0 | Normal | Zebree!D13 | Zebree!E13 |
| Zebree | biscuit/sweet | baking powder | baking powder | 85 | 27.63 | 0.0027 | Normal | Zebree!D14 | Zebree!E14 |
| Zebree | biscuit/sweet | EDC | edc | 75 | 9 | 0.0009 | Normal | Zebree!D15 | Zebree!E15 |
| Zebree | biscuit/sweet | Chocolate | chocolate | 1000 | 1789.47 | 0.172 | Medium | Zebree!D16 | Zebree!E16 |
| Croissant | pastry/savory | flour | flour | 3100 | 1302 | 0.424 | High | Croissant!D5 | Croissant!E5 |
| Croissant | pastry/savory | Butter | butter | 1000 | 1263.16 | 0.4114 | High | Croissant!D6 | Croissant!E6 |
| Croissant | pastry/savory | sugar | sugar | 300 | 192 | 0.0625 | Normal | Croissant!D7 | Croissant!E7 |
| Croissant | pastry/savory | salt | salt | 30 | 6.17 | 0.002 | Normal | Croissant!D8 | Croissant!E8 |
| Croissant | pastry/savory | egg | egg | 100 | 138.89 | 0.0452 | Normal | Croissant!D9 | Croissant!E9 |
| Croissant | pastry/savory | improver | improver | 30 | 84 | 0.0274 | Normal | Croissant!D10 | Croissant!E10 |
| Croissant | pastry/savory | yeast | yeast | 30 | 84 | 0.0274 | Normal | Croissant!D11 | Croissant!E11 |
| Croissant | pastry/savory | water | water | 2000 | 0.2 | 0.0001 | Normal | Croissant!D12 | Croissant!E12 |
| Universal bread | bread | flour | flour | 26000 | 10920 | 0.3938 | High | Universal bread!D5 | Universal bread!E5 |
| Universal bread | bread | Butter | butter | 1400 | 1768.42 | 0.0638 | Normal | Universal bread!D6 | Universal bread!E6 |
| Universal bread | bread | sugar | sugar | 1700 | 1088 | 0.0392 | Normal | Universal bread!D7 | Universal bread!E7 |
| Universal bread | bread | Conc Milk | milk | 800 | 936 | 0.0338 | Normal | Universal bread!D8 | Universal bread!E8 |
| Universal bread | bread | egg | egg | 500 | 666.67 | 0.024 | Normal | Universal bread!D9 | Universal bread!E9 |
| Universal bread | bread | salt | salt | 290 | 59.61 | 0.0021 | Normal | Universal bread!D10 | Universal bread!E10 |
| Universal bread | bread | improver | improver | 130 | 364 | 0.0131 | Normal | Universal bread!D11 | Universal bread!E11 |
| Universal bread | bread | yeast | yeast | 170 | 476 | 0.0172 | Normal | Universal bread!D12 | Universal bread!E12 |
| Universal bread | bread | water | water | 10000 | 1 | 0 | Normal | Universal bread!D13 | Universal bread!E13 |
| Universal bread | bread | baking powder | baking powder | 180 | 468 | 0.0169 | Normal | Universal bread!D14 | Universal bread!E14 |
| Universal bread | bread | frying oil | oil | 9000 | 10980 | 0.396 | High | Universal bread!D15 | Universal bread!E15 |
| Sheet3 | other | flour | flour | 10000 | 4000 | 0.4366 | High | Sheet3!D5 | Sheet3!E5 |
| Sheet3 | other | Butter | butter | 1000 | 1263.16 | 0.1379 | Normal | Sheet3!D6 | Sheet3!E6 |
| Sheet3 | other | sugar | sugar | 1000 | 640 | 0.0699 | Normal | Sheet3!D7 | Sheet3!E7 |
| Sheet3 | other | Milk | milk | 850 | 994.5 | 0.1086 | Normal | Sheet3!D8 | Sheet3!E8 |
| Sheet3 | other | egg | egg | 500 | 666.67 | 0.0728 | Normal | Sheet3!D9 | Sheet3!E9 |
| Sheet3 | other | salt | salt | 120 | 24.67 | 0.0027 | Normal | Sheet3!D10 | Sheet3!E10 |
| Sheet3 | other | improver | improver | 120 | 336 | 0.0367 | Normal | Sheet3!D11 | Sheet3!E11 |
| Sheet3 | other | yeast | yeast | 160 | 448 | 0.0489 | Normal | Sheet3!D12 | Sheet3!E12 |
| Sheet3 | other | water | water | 5000 | 0.5 | 0.0001 | Normal | Sheet3!D13 | Sheet3!E13 |
| Sheet3 | other | Oil | oil | 400 | 488 | 0.0533 | Normal | Sheet3!D14 | Sheet3!E14 |
| Sheet3 | other | EDC | edc | 100 | 300 | 0.0327 | Normal | Sheet3!D15 | Sheet3!E15 |
## Sheet: Raw Material Index
| Raw Material Index |
| --- |
| Supplier cost index from the workbook raw material sheet |
| Ingredient | Package Cost | Package Weight | Unit Cost | Source |
| Flour | 21000 | 50000 | 0.42 |  COST rRAW MATERIAL!B4:D4 |
| Sugar | 32000 | 50000 | 0.64 |  COST rRAW MATERIAL!B5:D5 |
| salt | 3700 | 18000 | 0.205556 |  COST rRAW MATERIAL!B6:D6 |
| butter | 12000 | 9500 | 1.263158 |  COST rRAW MATERIAL!B7:D7 |
| oil | 30500 | 25000 | 1.22 |  COST rRAW MATERIAL!B8:D8 |
| yeast | 1400 | 500 | 2.8 |  COST rRAW MATERIAL!B9:D9 |
| baking powder | 1300 | 500 | 2.6 |  COST rRAW MATERIAL!B10:D10 |
| egg carton | 25000 | 18000 | 1.388889 |  COST rRAW MATERIAL!B11:D11 |
| improver | 1400 | 500 | 2.8 |  COST rRAW MATERIAL!B12:D12 |
| egg tray | 2000 | 1500 | 1.333333 |  COST rRAW MATERIAL!B13:D13 |
| NUTMEG | 9000 | 1000 | 9 |  COST rRAW MATERIAL!B14:D14 |
| milk | 1170 | 1000 | 1.17 |  COST rRAW MATERIAL!B15:D15 |
| water | 1 | 10000 | 0.0001 |  COST rRAW MATERIAL!B16:D16 |
| powder milk | 80000 | 25000 | 3.2 |  COST rRAW MATERIAL!B17:D17 |
| Milk tantalizer | 45000 | 4000 | 11.25 |  COST rRAW MATERIAL!B18:D18 |
| EDC | 3000 | 1000 | 3 |  COST rRAW MATERIAL!B19:D19 |
| BUTTER 2 | 12000 | 9500 | 1.263158 |  COST rRAW MATERIAL!B20:D20 |
| Chocolate | 17000 | 9500 | 1.789474 |  COST rRAW MATERIAL!B21:D21 |
| fish | 24000 | 20000 | 1.2 |  COST rRAW MATERIAL!B22:D22 |
| carrots | 600 | 700 | 0.857143 |  COST rRAW MATERIAL!B23:D23 |
| Green beans | 200 | 1000 | 0.2 |  COST rRAW MATERIAL!B24:D24 |
| peppers | 200 | 500 | 0.4 |  COST rRAW MATERIAL!B25:D25 |
| onions | 100 | 50 | 2 |  COST rRAW MATERIAL!B26:D26 |
| irish | 4000 | 7000 | 0.571429 |  COST rRAW MATERIAL!B27:D27 |
| honey | 10000 | 8000 | 1.25 |  COST rRAW MATERIAL!B29:D29 |
| Icing Sugar | 1100 | 500 | 2.2 |  COST rRAW MATERIAL!B30:D30 |
| stabilizer | 3200 | 250 | 12.8 |  COST rRAW MATERIAL!B32:D32 |
| flour Bir | 20000 | 50000 | 0.4 |  COST rRAW MATERIAL!B36:D36 |
## Sheet: Purchasing Priorities
| Purchasing Priorities |
| --- |
| Ingredient consolidation and supplier negotiation targets |
| Ingredient Group | Recipe Count | Base Spend | Base Qty | Control | Recipes |
| flour | 36 | 133631 | 317550 | Bid/renegotiate this week | BUNS SPECIAL, Banh Mi, Best Chinchin, Brioche Professionel, CAKE NOW, Cake Prof, Chinchin, Croissant, Danisa biscuits, Delice, Donuts, Fish Pie, Galette, Kouatchoua gato, Melto, Melto1, NEW BRIOCHE, NGALA BREAD, New bageutte, New bread, Okinawa, Pain au lait, Pancake, Sheet3, Short bread, Sugar Balls, Universal bread, YUMMY BREAD, Zebree, baguette, brioche, buns new look, cake marbre, choko bread, gateau, professinal Buns |
| oil | 11 | 63503.44 | 39562 | Bid/renegotiate this week | Best Chinchin, Chinchin, Donuts, Fish Pie, Kouatchoua gato, Okinawa, Pain au lait, Sheet3, Universal bread, gateau, professinal Buns |
| butter | 30 | 47585.26 | 37500 | Bid/renegotiate this week | BUNS SPECIAL, Best Chinchin, Brioche Professionel, CAKE NOW, Cake Prof, Chinchin, Croissant, Danisa biscuits, Delice, Fish Pie, Galette, Kouatchoua gato, Melto, Melto1, NEW BRIOCHE, NGALA BREAD, New bread, Pain au lait, Sheet3, Short bread, Sugar Balls, Universal bread, YUMMY BREAD, Zebree, brioche, buns new look, cake marbre, choko bread, gateau, professinal Buns |
| egg | 31 | 41489.3 | 25906 | Bid/renegotiate this week | BUNS SPECIAL, Best Chinchin, Brioche Professionel, CAKE NOW, Cake Prof, Chinchin, Croissant, Danisa biscuits, Delice, Donuts, Galette, Kouatchoua gato, Melto, Melto1, NEW BRIOCHE, NGALA BREAD, New bread, Okinawa, Pain au lait, Pancake, Sheet3, Short bread, Universal bread, YUMMY BREAD, Zebree, brioche, buns new look, cake marbre, choko bread, gateau, professinal Buns |
| sugar | 35 | 22130.7 | 32255 | Bid/renegotiate this week | BUNS SPECIAL, Banh Mi, Best Chinchin, Brioche Professionel, CAKE NOW, Cake Prof, Chinchin, Croissant, Danisa biscuits, Delice, Donuts, Galette, Ice Cream, Kouatchoua gato, Melto, Melto1, NEW BRIOCHE, NGALA BREAD, New bageutte, New bread, Okinawa, Pain au lait, Pancake, Sheet3, Short bread, Sugar Balls, Universal bread, YUMMY BREAD, Zebree, brioche, buns new look, cake marbre, choko bread, gateau, professinal Buns |
| milk | 23 | 20718.83 | 15940 | Bid/renegotiate this week | BUNS SPECIAL, Brioche Professionel, Danisa biscuits, Delice, Donuts, Galette, Kouatchoua gato, NEW BRIOCHE, NGALA BREAD, New bread, Pain au lait, Pancake, Sheet3, Short bread, Universal bread, YUMMY BREAD, Zebree, brioche, buns new look, cake marbre, choko bread, gateau, professinal Buns |
| improver | 30 | 7623.67 | 2845 | Bid/renegotiate this week | BUNS SPECIAL, Banh Mi, Best Chinchin, Brioche Professionel, Chinchin, Croissant, Danisa biscuits, Delice, Donuts, Fish Pie, Galette, Kouatchoua gato, NEW BRIOCHE, NGALA BREAD, New bageutte, New bread, Pain au lait, Pancake, Sheet3, Sugar Balls, Universal bread, YUMMY BREAD, Zebree, baguette, brioche, buns new look, cake marbre, choko bread, gateau, professinal Buns |
| yeast | 25 | 6920.6 | 2476 | Bid/renegotiate this week | BUNS SPECIAL, Banh Mi, Brioche Professionel, Croissant, Danisa biscuits, Delice, Galette, Kouatchoua gato, NEW BRIOCHE, NGALA BREAD, New bageutte, New bread, Pain au lait, Pancake, Sheet3, Sugar Balls, Universal bread, YUMMY BREAD, Zebree, baguette, brioche, buns new look, choko bread, gateau, professinal Buns |
| chocolate | 4 | 6084.21 | 3400 | Monitor / standardize pack | Danisa biscuits, Delice, Galette, Zebree |
| baking powder | 16 | 4815.65 | 2012 | Bid/renegotiate this week | Best Chinchin, CAKE NOW, Cake Prof, Chinchin, Danisa biscuits, Delice, Donuts, Fish Pie, Galette, Kouatchoua gato, Okinawa, Sugar Balls, Universal bread, Zebree, cake marbre, gateau |
| powdered milk | 1 | 3520 | 1100 | Monitor / standardize pack | Ice Cream |
| nutmeg | 9 | 2918 | 262 | Bid/renegotiate this week | Best Chinchin, Brioche Professionel, Chinchin, Pain au lait, Pancake, cake marbre, choko bread, gateau, professinal Buns |
| stabilizer | 1 | 2560 | 200 | Monitor / standardize pack | Ice Cream |
| others | 1 | 2000 | 200 | Monitor / standardize pack | Ice Cream |
| edc | 10 | 1434 | 550 | Bid/renegotiate this week | Danisa biscuits, Delice, Galette, NEW BRIOCHE, Pain au lait, Sheet3, YUMMY BREAD, Zebree, brioche, professinal Buns |
| honey | 2 | 1375 | 1100 | Monitor / standardize pack | Danisa biscuits, Delice |
| choclate | 1 | 900 | 500 | Monitor / standardize pack | choko bread |
| salt | 33 | 667.67 | 3255 | Bid/renegotiate this week | BUNS SPECIAL, Banh Mi, Best Chinchin, Brioche Professionel, Chinchin, Croissant, Danisa biscuits, Delice, Donuts, Galette, Kouatchoua gato, Melto, Melto1, NEW BRIOCHE, NGALA BREAD, New bageutte, New bread, Okinawa, Pain au lait, Pancake, Sheet3, Short bread, Sugar Balls, Universal bread, YUMMY BREAD, Zebree, baguette, brioche, buns new look, cake marbre, choko bread, gateau, professinal Buns |
| fish | 1 | 480 | 400 | Monitor / standardize pack | Fish Pie |
| onions | 1 | 200 | 100 | Monitor / standardize pack | Fish Pie |
| carrots | 1 | 171.43 | 200 | Monitor / standardize pack | Fish Pie |
| irish | 1 | 171.43 | 300 | Monitor / standardize pack | Fish Pie |
| water | 28 | 142.97 | 114260 | Bid/renegotiate this week | BUNS SPECIAL, Banh Mi, CAKE NOW, Croissant, Danisa biscuits, Delice, Donuts, Galette, Ice Cream, Kouatchoua gato, NEW BRIOCHE, NGALA BREAD, New bageutte, New bread, Pain au lait, Pancake, Sheet3, Sugar Balls, Universal bread, YUMMY BREAD, Zebree, baguette, brioche, buns new look, cake marbre, choko bread, gateau, professinal Buns |
| green beans | 1 | 20 | 100 | Monitor / standardize pack | Fish Pie |
| peppers | 1 | 4 | 10 | Monitor / standardize pack | Fish Pie |
| cabbage | 1 | 0 | 200 | Monitor / standardize pack | Fish Pie |
## Sheet: Data Completion
| Data Completion |
| --- |
| Fields needed to turn ingredient costing into full COGS |
| Recipe | Labor Minutes | Loaded Labor Rate | Packaging / Unit | Overhead / Batch | Actual Good Units | Waste Units | Owner | Due Date |
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
## Sheet: Formula Flags
| Formula Flags |
| --- |
| Workbook formula errors and data hygiene issues to fix |
| Flag | Detail | Action |
| Workbook Formula Errors | BUNS SPECIAL!E23=#REF!, BUNS SPECIAL!F23=#REF!, BUNS SPECIAL!G23=#REF!, BUNS SPECIAL!H23=#REF!, buns new look!F24=#REF!, buns new look!H24=#REF!, buns new look!F25=#REF!, buns new look!H25=#REF!, Donuts!H20=#REF!, Donuts!L20=#REF!, New bread!F24=#REF!, New bread!H24=#REF!, New bread!F25=#REF!, New bread!H25=#REF!, NGALA BREAD!F24=#REF!, NGALA BREAD!H24=#REF!, NGALA BREAD!F25=#REF!, NGALA BREAD!H25=#REF! | Repair #REF! cells before using workbook profit rows |
| Possible Duplicate / Template | Sheet3 | Confirm whether active recipe, then rename or archive |
| Raw Sheet Hygiene | Credential/payment-looking strings were excluded from this workbook | Remove unrelated confidential text from the source workbook |
## Sheet: Assumptions
| Assumptions |
| --- |
| Model assumptions that should be replaced with operating data |
| Assumption | Value | Replacement Needed |
| Target food cost | 0.35 | Used for target price and max profitable portion weight; replace with your department-specific target |
| Target gross margin | 0.65 | Ingredient-only target; labor and overhead are missing |
| Base recipe | First quantity/cost pair after item column | Workbook has multiple scaled columns; add selected-batch flags |
| Units | Workbook-native weight unit, treated as grams in display | Confirm unit of measure per recipe |
| Contribution margin | Equals gross profit | Add variable labor, packaging, and overhead to calculate true contribution |
| Demand elasticity | Not modeled | Add POS volume before/after price changes |
## Sheet: baguette
| baguette |
| --- |
| Recipe card, costing, target price, sensitivity, and action checklist |
| Field | Value | Source / note |
| Category | bread | Inferred from recipe name |
| Base Batch Mass | 9890 | baguette!D5 + baguette!D6 + baguette!D7 + baguette!D8 + baguette!D9 |
| Base Ingredient Cost | 3382 | baguette!E5 + baguette!E6 + baguette!E7 + baguette!E8 + baguette!E9 |
| Recommended Action | Reformulate + reprice | Worst SKU is 31.6% GM and top-2 ingredients drive 89.4% of base cost. |
| Top-2 Ingredient Share | 0.8941 | Base ingredient cost rows |
| Highest-Cost Ingredient | flour (2520) | baguette!E5 |
| Missing COGS Fields | labor, packaging, overhead, actual yield, waste, daily volume | Complete before treating COGS as final |
| Ingredient | Qty | Cost | % Cost | Risk | Source |
| flour | 6000 | 2520 | 0.7451 | High | baguette!D5; baguette!E5 |
| improver | 180 | 504 | 0.149 | Normal | baguette!D9; baguette!E9 |
| yeast | 120 | 336 | 0.0993 | Normal | baguette!D6; baguette!E6 |
| salt | 90 | 18.5 | 0.0055 | Normal | baguette!D7; baguette!E7 |
| water | 3500 | 3.5 | 0.001 | Normal | baguette!D8; baguette!E8 |
| Portion | Price | COGS | Gross Profit | GM % | Food Cost % | Target Price | Price Gap | Max Weight | Break-even Units | Source |
| 90 | 100 | 30.78 | 69.22 | 0.6922 | 0.3078 | 87.93 | -12.07 | 102.35 | 33.82 | baguette!B16; baguette!C16 |
| 200 | 100 | 68.39 | 31.61 | 0.3161 | 0.6839 | 195.41 | 95.41 | 102.35 | 33.82 | baguette!B17; baguette!C17 |
| 65 | 50 | 22.23 | 27.77 | 0.5554 | 0.4446 | 63.51 | 13.51 | 51.18 | 67.64 | baguette!B18; baguette!C18 |
| Portion | Key Ingredient | GM after +10% | GM after +25% | Action |
| 90 | flour | 0.6693 | 0.6349 | Monitor / absorb short term |
| 200 | flour | 0.2651 | 0.1887 | Raise price immediately |
| 65 | flour | 0.5223 | 0.4726 | Raise price immediately |
| Standard Production Method | Template step |
| Assumption | Validate process, times, temperatures, and proof/bake/fry controls with production team |
| Step | Scale ingredients exactly; separate flour, yeast, salt, sugar, fat, and improver until mixing. |
| Step | Mix dry ingredients, add liquids gradually, develop dough until smooth and elastic. |
| Step | Bulk ferment, divide by target weight, round, rest, shape, proof, bake, cool fully, then package. |
## Sheet: New bageutte
| New bageutte |
| --- |
| Recipe card, costing, target price, sensitivity, and action checklist |
| Field | Value | Source / note |
| Category | bread | Inferred from recipe name |
| Base Batch Mass | 602 | New bageutte!F5 + New bageutte!F6 + New bageutte!F7 + New bageutte!F8 + New bageutte!F9 + New bageutte!F10 |
| Base Ingredient Cost | 218.27 | New bageutte!G5 + New bageutte!G6 + New bageutte!G7 + New bageutte!G8 + New bageutte!G9 + New bageutte!G10 |
| Recommended Action | Reformulate + reprice | Worst SKU is 9.4% GM and top-2 ingredients drive 93.0% of base cost. |
| Top-2 Ingredient Share | 0.9301 | Base ingredient cost rows |
| Highest-Cost Ingredient | flour (147) | New bageutte!G5 |
| Missing COGS Fields | labor, packaging, overhead, actual yield, waste, daily volume | Complete before treating COGS as final |
| Ingredient | Qty | Cost | % Cost | Risk | Source |
| flour | 350 | 147 | 0.6735 | High | New bageutte!F5; New bageutte!G5 |
| improver | 20 | 56 | 0.2566 | Medium | New bageutte!F10; New bageutte!G10 |
| sugar | 10 | 7.4 | 0.0339 | Normal | New bageutte!F7; New bageutte!G7 |
| yeast | 2 | 5.6 | 0.0257 | Normal | New bageutte!F6; New bageutte!G6 |
| salt | 10 | 2.06 | 0.0094 | Normal | New bageutte!F8; New bageutte!G8 |
| water | 210 | 0.21 | 0.001 | Normal | New bageutte!F9; New bageutte!G9 |
| Portion | Price | COGS | Gross Profit | GM % | Food Cost % | Target Price | Price Gap | Max Weight | Break-even Units | Source |
| 90 | 100 | 32.63 | 67.37 | 0.6737 | 0.3263 | 93.23 | -6.77 | 96.53 | 2.18 | New bageutte!B17; New bageutte!C17 |
| 500 | 200 | 181.28 | 18.72 | 0.0936 | 0.9064 | 517.95 | 317.95 | 193.07 | 1.09 | New bageutte!B18; New bageutte!C18 |
| 65 | 50 | 23.57 | 26.43 | 0.5287 | 0.4713 | 67.33 | 17.33 | 48.27 | 4.37 | New bageutte!B19; New bageutte!C19 |
| Portion | Key Ingredient | GM after +10% | GM after +25% | Action |
| 90 | flour | 0.6517 | 0.6187 | Monitor / absorb short term |
| 500 | flour | 0.0325 | -0.059 | Raise price immediately |
| 65 | flour | 0.4969 | 0.4493 | Raise price immediately |
| Standard Production Method | Template step |
| Assumption | Validate process, times, temperatures, and proof/bake/fry controls with production team |
| Step | Scale ingredients exactly; separate flour, yeast, salt, sugar, fat, and improver until mixing. |
| Step | Mix dry ingredients, add liquids gradually, develop dough until smooth and elastic. |
| Step | Bulk ferment, divide by target weight, round, rest, shape, proof, bake, cool fully, then package. |
## Sheet: Banh Mi
| Banh Mi |
| --- |
| Recipe card, costing, target price, sensitivity, and action checklist |
| Field | Value | Source / note |
| Category | bread | Inferred from recipe name |
| Base Batch Mass | 10530 | Banh Mi!F5 + Banh Mi!F6 + Banh Mi!F7 + Banh Mi!F8 + Banh Mi!F9 + Banh Mi!F10 |
| Base Ingredient Cost | 3238.75 | Banh Mi!G5 + Banh Mi!G6 + Banh Mi!G7 + Banh Mi!G8 + Banh Mi!G9 + Banh Mi!G10 |
| Recommended Action | Reformulate + reprice | Worst SKU is 23.1% GM and top-2 ingredients drive 90.8% of base cost. |
| Top-2 Ingredient Share | 0.9078 | Base ingredient cost rows |
| Highest-Cost Ingredient | flour (2520) | Banh Mi!G5 |
| Missing COGS Fields | labor, packaging, overhead, actual yield, waste, daily volume | Complete before treating COGS as final |
| Ingredient | Qty | Cost | % Cost | Risk | Source |
| flour | 6000 | 2520 | 0.7781 | High | Banh Mi!F5; Banh Mi!G5 |
| improver | 150 | 420 | 0.1297 | Normal | Banh Mi!F10; Banh Mi!G10 |
| yeast | 90 | 252 | 0.0778 | Normal | Banh Mi!F6; Banh Mi!G6 |
| sugar | 45 | 33.3 | 0.0103 | Normal | Banh Mi!F7; Banh Mi!G7 |
| salt | 45 | 9.25 | 0.0029 | Normal | Banh Mi!F8; Banh Mi!G8 |
| water | 4200 | 4.2 | 0.0013 | Normal | Banh Mi!F9; Banh Mi!G9 |
| Portion | Price | COGS | Gross Profit | GM % | Food Cost % | Target Price | Price Gap | Max Weight | Break-even Units | Source |
| 90 | 100 | 27.68 | 72.32 | 0.7232 | 0.2768 | 79.09 | -20.91 | 113.79 | 32.39 | Banh Mi!B17; Banh Mi!C17 |
| 500 | 200 | 153.79 | 46.21 | 0.2311 | 0.7689 | 439.39 | 239.39 | 227.59 | 16.19 | Banh Mi!B18; Banh Mi!C18 |
| 65 | 50 | 19.99 | 30.01 | 0.6002 | 0.3998 | 57.12 | 7.12 | 56.9 | 64.78 | Banh Mi!B19; Banh Mi!C19 |
| Portion | Key Ingredient | GM after +10% | GM after +25% | Action |
| 90 | flour | 0.7016 | 0.6693 | Monitor / absorb short term |
| 500 | flour | 0.1712 | 0.0815 | Raise price immediately |
| 65 | flour | 0.569 | 0.5224 | Monitor / absorb short term |
| Standard Production Method | Template step |
| Assumption | Validate process, times, temperatures, and proof/bake/fry controls with production team |
| Step | Scale ingredients exactly; separate flour, yeast, salt, sugar, fat, and improver until mixing. |
| Step | Mix dry ingredients, add liquids gradually, develop dough until smooth and elastic. |
| Step | Bulk ferment, divide by target weight, round, rest, shape, proof, bake, cool fully, then package. |
## Sheet: cake marbre
| cake marbre |
| --- |
| Recipe card, costing, target price, sensitivity, and action checklist |
| Field | Value | Source / note |
| Category | cake/gateau | Inferred from recipe name |
| Base Batch Mass | 5227 | cake marbre!D5 + cake marbre!D6 + cake marbre!D7 + cake marbre!D8 + cake marbre!D9 + cake marbre!D10 + cake marbre!D11 + cake marbre!D12 + cake marbre!D13 + cake marbre!D14 |
| Base Ingredient Cost | 5914.94 | cake marbre!E5 + cake marbre!E6 + cake marbre!E7 + cake marbre!E8 + cake marbre!E9 + cake marbre!E10 + cake marbre!E11 + cake marbre!E12 + cake marbre!E13 + cake marbre!E14 |
| Recommended Action | Reprice | Raise worst SKU to target price or reduce portion to 30.93g for 65% GM. |
| Top-2 Ingredient Share | 0.6706 | Base ingredient cost rows |
| Highest-Cost Ingredient | Butter (2300) | cake marbre!E11 |
| Missing COGS Fields | labor, packaging, overhead, actual yield, waste, daily volume | Complete before treating COGS as final |
| Ingredient | Qty | Cost | % Cost | Risk | Source |
| Butter | 1000 | 2300 | 0.3888 | High | cake marbre!D11; cake marbre!E11 |
| Egg | 360 | 1666.67 | 0.2818 | Medium | cake marbre!D10; cake marbre!E10 |
| flour | 2000 | 1040 | 0.1758 | Medium | cake marbre!D5; cake marbre!E5 |
| sugar | 650 | 416 | 0.0703 | Normal | cake marbre!D12; cake marbre!E12 |
| Nut Meg | 10 | 250 | 0.0423 | Normal | cake marbre!D8; cake marbre!E8 |
| baking powder | 70 | 161 | 0.0272 | Normal | cake marbre!D6; cake marbre!E6 |
| milk | 12 | 46 | 0.0078 | Normal | cake marbre!D14; cake marbre!E14 |
| water | 1100 | 16.5 | 0.0028 | Normal | cake marbre!D9; cake marbre!E9 |
| improver | 5 | 15 | 0.0025 | Normal | cake marbre!D13; cake marbre!E13 |
| salt | 20 | 3.78 | 0.0006 | Normal | cake marbre!D7; cake marbre!E7 |
| Portion | Price | COGS | Gross Profit | GM % | Food Cost % | Target Price | Price Gap | Max Weight | Break-even Units | Source |
| 60 | 150 | 67.9 | 82.1 | 0.5474 | 0.4526 | 193.99 | 43.99 | 46.39 | 39.43 | cake marbre!B20; cake marbre!C20 |
| 50 | 100 | 56.58 | 43.42 | 0.4342 | 0.5658 | 161.66 | 61.66 | 30.93 | 59.15 | cake marbre!B21; cake marbre!C21 |
| Portion | Key Ingredient | GM after +10% | GM after +25% | Action |
| 60 | Butter | 0.5298 | 0.5034 | Monitor / absorb short term |
| 50 | Butter | 0.4122 | 0.3792 | Raise price immediately |
| Standard Production Method | Template step |
| Assumption | Validate process, times, temperatures, and proof/bake/fry controls with production team |
| Step | Cream fat and sugar or use house cake method; add eggs/liquids slowly. |
| Step | Fold dry ingredients gently, portion by weight, bake until set, cool fully. |
| Step | Track batter weight, baked weight, trim, and final saleable pieces. |
## Sheet: gateau
| gateau |
| --- |
| Recipe card, costing, target price, sensitivity, and action checklist |
| Field | Value | Source / note |
| Category | cake/gateau | Inferred from recipe name |
| Base Batch Mass | 39880 | gateau!D5 + gateau!D6 + gateau!D7 + gateau!D8 + gateau!D9 + gateau!D10 + gateau!D11 + gateau!D12 + gateau!D13 + gateau!D14 + gateau!D15 + gateau!D16 |
| Base Ingredient Cost | 31394.74 | gateau!E5 + gateau!E6 + gateau!E7 + gateau!E8 + gateau!E9 + gateau!E10 + gateau!E11 + gateau!E12 + gateau!E13 + gateau!E14 + gateau!E15 + gateau!E16 |
| Recommended Action | Reformulate + reprice | Worst SKU is 29.1% GM and top-2 ingredients drive 82.0% of base cost. |
| Top-2 Ingredient Share | 0.8202 | Base ingredient cost rows |
| Highest-Cost Ingredient | frying oil (15250) | gateau!E16 |
| Missing COGS Fields | labor, packaging, overhead, actual yield, waste, daily volume | Complete before treating COGS as final |
| Ingredient | Qty | Cost | % Cost | Risk | Source |
| frying oil | 10 | 15250 | 0.4858 | High | gateau!D16; gateau!E16 |
| flour | 25000 | 10500 | 0.3345 | High | gateau!D5; gateau!E5 |
| Conc Milk | 950 | 1170 | 0.0373 | Normal | gateau!D8; gateau!E8 |
| sugar | 1600 | 1024 | 0.0326 | Normal | gateau!D7; gateau!E7 |
| Butter | 1300 | 780 | 0.0248 | Normal | gateau!D6; gateau!E6 |
| egg | 200 | 740.74 | 0.0236 | Normal | gateau!D9; gateau!E9 |
| baking powder | 170 | 552.5 | 0.0176 | Normal | gateau!D15; gateau!E15 |
| improver | 170 | 476 | 0.0152 | Normal | gateau!D11; gateau!E11 |
| yeast | 170 | 476 | 0.0152 | Normal | gateau!D12; gateau!E12 |
| Nutmeg | 40 | 360 | 0.0115 | Normal | gateau!D14; gateau!E14 |
| salt | 270 | 55.5 | 0.0018 | Normal | gateau!D10; gateau!E10 |
| water | 10000 | 10 | 0.0003 | Normal | gateau!D13; gateau!E13 |
| Portion | Price | COGS | Gross Profit | GM % | Food Cost % | Target Price | Price Gap | Max Weight | Break-even Units | Source |
| 81 | 100 | 63.77 | 36.23 | 0.3623 | 0.6377 | 182.19 | 82.19 | 44.46 | 313.95 | gateau!B21; gateau!C21 |
| 90 | 100 | 70.85 | 29.15 | 0.2915 | 0.7085 | 202.43 | 102.43 | 44.46 | 313.95 | gateau!B22; gateau!C22 |
| 90 | 100 | 70.85 | 29.15 | 0.2915 | 0.7085 | 202.43 | 102.43 | 44.46 | 313.95 | gateau!B23; gateau!C23 |
| 900 | 1000 | 708.51 | 291.49 | 0.2915 | 0.7085 | 2024.31 | 1024.31 | 444.6 | 31.39 | gateau!B24; gateau!C24 |
| Portion | Key Ingredient | GM after +10% | GM after +25% | Action |
| 81 | frying oil | 0.3314 | 0.2849 | Raise price immediately |
| 90 | frying oil | 0.2571 | 0.2055 | Raise price immediately |
| 90 | frying oil | 0.2571 | 0.2055 | Raise price immediately |
| 900 | frying oil | 0.2571 | 0.2055 | Raise price immediately |
| Standard Production Method | Template step |
| Assumption | Validate process, times, temperatures, and proof/bake/fry controls with production team |
| Step | Cream fat and sugar or use house cake method; add eggs/liquids slowly. |
| Step | Fold dry ingredients gently, portion by weight, bake until set, cool fully. |
| Step | Track batter weight, baked weight, trim, and final saleable pieces. |
## Sheet: Kouatchoua gato
| Kouatchoua gato |
| --- |
| Recipe card, costing, target price, sensitivity, and action checklist |
| Field | Value | Source / note |
| Category | cake/gateau | Inferred from recipe name |
| Base Batch Mass | 50710 | Kouatchoua gato!D5 + Kouatchoua gato!D6 + Kouatchoua gato!D7 + Kouatchoua gato!D8 + Kouatchoua gato!D9 + Kouatchoua gato!D10 + Kouatchoua gato!D11 + Kouatchoua gato!D12 + Kouatchoua gato!D13 + Kouatchoua gato!D14 + Kouatchoua gato!D15 |
| Base Ingredient Cost | 27540.05 | Kouatchoua gato!E5 + Kouatchoua gato!E6 + Kouatchoua gato!E7 + Kouatchoua gato!E8 + Kouatchoua gato!E9 + Kouatchoua gato!E10 + Kouatchoua gato!E11 + Kouatchoua gato!E12 + Kouatchoua gato!E13 + Kouatchoua gato!E14 + Kouatchoua gato!E15 |
| Recommended Action | Reprice | Raise worst SKU to target price or reduce portion to 64.45g for 65% GM. |
| Top-2 Ingredient Share | 0.7662 | Base ingredient cost rows |
| Highest-Cost Ingredient | flour (11340) | Kouatchoua gato!E5 |
| Missing COGS Fields | labor, packaging, overhead, actual yield, waste, daily volume | Complete before treating COGS as final |
| Ingredient | Qty | Cost | % Cost | Risk | Source |
| flour | 27000 | 11340 | 0.4118 | High | Kouatchoua gato!D5; Kouatchoua gato!E5 |
| frying oil | 8000 | 9760 | 0.3544 | High | Kouatchoua gato!D15; Kouatchoua gato!E15 |
| Butter | 1300 | 1642.11 | 0.0596 | Normal | Kouatchoua gato!D6; Kouatchoua gato!E6 |
| egg | 1000 | 1333.33 | 0.0484 | Normal | Kouatchoua gato!D9; Kouatchoua gato!E9 |
| Conc Milk | 1000 | 1170 | 0.0425 | Normal | Kouatchoua gato!D8; Kouatchoua gato!E8 |
| sugar | 1700 | 1088 | 0.0395 | Normal | Kouatchoua gato!D7; Kouatchoua gato!E7 |
| improver | 140 | 392 | 0.0142 | Normal | Kouatchoua gato!D11; Kouatchoua gato!E11 |
| baking powder | 150 | 390 | 0.0142 | Normal | Kouatchoua gato!D14; Kouatchoua gato!E14 |
| yeast | 130 | 364 | 0.0132 | Normal | Kouatchoua gato!D12; Kouatchoua gato!E12 |
| salt | 290 | 59.61 | 0.0022 | Normal | Kouatchoua gato!D10; Kouatchoua gato!E10 |
| water | 10000 | 1 | 0 | Normal | Kouatchoua gato!D13; Kouatchoua gato!E13 |
| Portion | Price | COGS | Gross Profit | GM % | Food Cost % | Target Price | Price Gap | Max Weight | Break-even Units | Source |
| 81.4 | 100 | 44.21 | 55.79 | 0.5579 | 0.4421 | 126.31 | 26.31 | 64.45 | 275.4 | Kouatchoua gato!B20; Kouatchoua gato!C20 |
| 90 | 100 | 48.88 | 51.12 | 0.5112 | 0.4888 | 139.65 | 39.65 | 64.45 | 275.4 | Kouatchoua gato!B21; Kouatchoua gato!C21 |
| 90 | 100 | 48.88 | 51.12 | 0.5112 | 0.4888 | 139.65 | 39.65 | 64.45 | 275.4 | Kouatchoua gato!B22; Kouatchoua gato!C22 |
| 900 | 1000 | 488.78 | 511.22 | 0.5112 | 0.4888 | 1396.51 | 396.51 | 644.46 | 27.54 | Kouatchoua gato!B23; Kouatchoua gato!C23 |
| Portion | Key Ingredient | GM after +10% | GM after +25% | Action |
| 81.4 | flour | 0.5397 | 0.5124 | Monitor / absorb short term |
| 90 | flour | 0.4911 | 0.4609 | Raise price immediately |
| 90 | flour | 0.4911 | 0.4609 | Raise price immediately |
| 900 | flour | 0.4911 | 0.4609 | Raise price immediately |
| Standard Production Method | Template step |
| Assumption | Validate process, times, temperatures, and proof/bake/fry controls with production team |
| Step | Cream fat and sugar or use house cake method; add eggs/liquids slowly. |
| Step | Fold dry ingredients gently, portion by weight, bake until set, cool fully. |
| Step | Track batter weight, baked weight, trim, and final saleable pieces. |
## Sheet: BUNS SPECIAL
| BUNS SPECIAL |
| --- |
| Recipe card, costing, target price, sensitivity, and action checklist |
| Field | Value | Source / note |
| Category | buns | Inferred from recipe name |
| Base Batch Mass | 14920 | BUNS SPECIAL!D5 + BUNS SPECIAL!D6 + BUNS SPECIAL!D7 + BUNS SPECIAL!D8 + BUNS SPECIAL!D9 + BUNS SPECIAL!D10 + BUNS SPECIAL!D11 + BUNS SPECIAL!D12 + BUNS SPECIAL!D13 |
| Base Ingredient Cost | 9868.04 | BUNS SPECIAL!E5 + BUNS SPECIAL!E6 + BUNS SPECIAL!E7 + BUNS SPECIAL!E8 + BUNS SPECIAL!E9 + BUNS SPECIAL!E10 + BUNS SPECIAL!E11 + BUNS SPECIAL!E12 + BUNS SPECIAL!E13 |
| Recommended Action | Reprice | Raise worst SKU to target price or reduce portion to 529.18g for 65% GM. |
| Top-2 Ingredient Share | 0.7499 | Base ingredient cost rows |
| Highest-Cost Ingredient | flour (4200) | BUNS SPECIAL!E5 |
| Missing COGS Fields | labor, packaging, overhead, actual yield, waste, daily volume | Complete before treating COGS as final |
| Ingredient | Qty | Cost | % Cost | Risk | Source |
| flour | 10000 | 4200 | 0.4256 | High | BUNS SPECIAL!D5; BUNS SPECIAL!E5 |
| powder milk | 1000 | 3200 | 0.3243 | High | BUNS SPECIAL!D8; BUNS SPECIAL!E8 |
| egg | 220 | 814.81 | 0.0826 | Normal | BUNS SPECIAL!D9; BUNS SPECIAL!E9 |
| Butter | 450 | 568.42 | 0.0576 | Normal | BUNS SPECIAL!D6; BUNS SPECIAL!E6 |
| improver | 150 | 420 | 0.0426 | Normal | BUNS SPECIAL!D11; BUNS SPECIAL!E11 |
| yeast | 150 | 420 | 0.0426 | Normal | BUNS SPECIAL!D12; BUNS SPECIAL!E12 |
| sugar | 350 | 224 | 0.0227 | Normal | BUNS SPECIAL!D7; BUNS SPECIAL!E7 |
| salt | 100 | 20.56 | 0.0021 | Normal | BUNS SPECIAL!D10; BUNS SPECIAL!E10 |
| water | 2500 | 0.25 | 0 | Normal | BUNS SPECIAL!D13; BUNS SPECIAL!E13 |
| Portion | Price | COGS | Gross Profit | GM % | Food Cost % | Target Price | Price Gap | Max Weight | Break-even Units | Source |
| 55 | 100 | 36.38 | 63.62 | 0.6362 | 0.3638 | 103.93 | 3.93 | 52.92 | 98.68 | BUNS SPECIAL!B18; BUNS SPECIAL!C18 |
| 220 | 300 | 145.51 | 154.49 | 0.515 | 0.485 | 415.74 | 115.74 | 158.75 | 32.89 | BUNS SPECIAL!B19; BUNS SPECIAL!C19 |
| 800 | 1000 | 529.12 | 470.88 | 0.4709 | 0.5291 | 1511.76 | 511.76 | 529.18 | 9.87 | BUNS SPECIAL!B20; BUNS SPECIAL!C20 |
| Portion | Key Ingredient | GM after +10% | GM after +25% | Action |
| 55 | flour | 0.6207 | 0.5975 | Monitor / absorb short term |
| 220 | flour | 0.4943 | 0.4634 | Raise price immediately |
| 800 | flour | 0.4484 | 0.4146 | Raise price immediately |
| Standard Production Method | Template step |
| Assumption | Validate process, times, temperatures, and proof/bake/fry controls with production team |
| Step | Scale and mix as enriched dough; add fat after initial hydration where needed. |
| Step | Divide to target weight, round tightly, proof consistently, bake/fry to house standard. |
| Step | Count saleable pieces after cooling, not before, to capture shrink and breakage. |
## Sheet: buns new look
| buns new look |
| --- |
| Recipe card, costing, target price, sensitivity, and action checklist |
| Field | Value | Source / note |
| Category | buns | Inferred from recipe name |
| Base Batch Mass | 9870 | buns new look!D5 + buns new look!D6 + buns new look!D7 + buns new look!D8 + buns new look!D9 + buns new look!D10 + buns new look!D11 + buns new look!D12 + buns new look!D13 |
| Base Ingredient Cost | 4349.97 | buns new look!E5 + buns new look!E6 + buns new look!E7 + buns new look!E8 + buns new look!E9 + buns new look!E10 + buns new look!E11 + buns new look!E12 + buns new look!E13 |
| Recommended Action | Reprice | Raise worst SKU to target price or reduce portion to 79.41g for 65% GM. |
| Top-2 Ingredient Share | 0.7666 | Base ingredient cost rows |
| Highest-Cost Ingredient | flour (2520) | buns new look!E5 |
| Missing COGS Fields | labor, packaging, overhead, actual yield, waste, daily volume | Complete before treating COGS as final |
| Ingredient | Qty | Cost | % Cost | Risk | Source |
| flour | 6000 | 2520 | 0.5793 | High | buns new look!D5; buns new look!E5 |
| egg | 220 | 814.81 | 0.1873 | Medium | buns new look!D9; buns new look!E9 |
| Butter | 300 | 378.95 | 0.0871 | Normal | buns new look!D6; buns new look!E6 |
| improver | 100 | 280 | 0.0644 | Normal | buns new look!D11; buns new look!E11 |
| yeast | 100 | 280 | 0.0644 | Normal | buns new look!D12; buns new look!E12 |
| sugar | 50 | 32 | 0.0074 | Normal | buns new look!D7; buns new look!E7 |
| conc milk | 500 | 23.4 | 0.0054 | Normal | buns new look!D8; buns new look!E8 |
| salt | 100 | 20.56 | 0.0047 | Normal | buns new look!D10; buns new look!E10 |
| water | 2500 | 0.25 | 0.0001 | Normal | buns new look!D13; buns new look!E13 |
| Portion | Price | COGS | Gross Profit | GM % | Food Cost % | Target Price | Price Gap | Max Weight | Break-even Units | Source |
| 95 | 100 | 41.87 | 58.13 | 0.5813 | 0.4187 | 119.63 | 19.63 | 79.41 | 43.5 | buns new look!C20; buns new look!D20 |
| Portion | Key Ingredient | GM after +10% | GM after +25% | Action |
| 95 | flour | 0.5571 | 0.5207 | Monitor / absorb short term |
| Standard Production Method | Template step |
| Assumption | Validate process, times, temperatures, and proof/bake/fry controls with production team |
| Step | Scale and mix as enriched dough; add fat after initial hydration where needed. |
| Step | Divide to target weight, round tightly, proof consistently, bake/fry to house standard. |
| Step | Count saleable pieces after cooling, not before, to capture shrink and breakage. |
## Sheet: YUMMY BREAD
| YUMMY BREAD |
| --- |
| Recipe card, costing, target price, sensitivity, and action checklist |
| Field | Value | Source / note |
| Category | bread | Inferred from recipe name |
| Base Batch Mass | 26250 | YUMMY BREAD!D5 + YUMMY BREAD!D6 + YUMMY BREAD!D7 + YUMMY BREAD!D8 + YUMMY BREAD!D9 + YUMMY BREAD!D10 + YUMMY BREAD!D11 + YUMMY BREAD!D12 + YUMMY BREAD!D13 + YUMMY BREAD!D14 |
| Base Ingredient Cost | 12134 | YUMMY BREAD!E5 + YUMMY BREAD!E6 + YUMMY BREAD!E7 + YUMMY BREAD!E8 + YUMMY BREAD!E9 + YUMMY BREAD!E10 + YUMMY BREAD!E11 + YUMMY BREAD!E12 + YUMMY BREAD!E13 + YUMMY BREAD!E14 |
| Recommended Action | Reprice | Raise worst SKU to target price or reduce portion to 94.65g for 65% GM. |
| Top-2 Ingredient Share | 0.6506 | Base ingredient cost rows |
| Highest-Cost Ingredient | flour (6000) | YUMMY BREAD!E5 |
| Missing COGS Fields | labor, packaging, overhead, actual yield, waste, daily volume | Complete before treating COGS as final |
| Ingredient | Qty | Cost | % Cost | Risk | Source |
| flour | 15000 | 6000 | 0.4945 | High | YUMMY BREAD!D5; YUMMY BREAD!E5 |
| Butter | 1500 | 1894.74 | 0.1562 | Medium | YUMMY BREAD!D6; YUMMY BREAD!E6 |
| Milk | 1000 | 1170 | 0.0964 | Normal | YUMMY BREAD!D8; YUMMY BREAD!E8 |
| egg | 750 | 1000 | 0.0824 | Normal | YUMMY BREAD!D9; YUMMY BREAD!E9 |
| sugar | 1500 | 960 | 0.0791 | Normal | YUMMY BREAD!D7; YUMMY BREAD!E7 |
| yeast | 160 | 448 | 0.0369 | Normal | YUMMY BREAD!D12; YUMMY BREAD!E12 |
| improver | 120 | 336 | 0.0277 | Normal | YUMMY BREAD!D11; YUMMY BREAD!E11 |
| EDC | 100 | 300 | 0.0247 | Normal | YUMMY BREAD!D14; YUMMY BREAD!E14 |
| salt | 120 | 24.67 | 0.002 | Normal | YUMMY BREAD!D10; YUMMY BREAD!E10 |
| water | 6000 | 0.6 | 0 | Normal | YUMMY BREAD!D13; YUMMY BREAD!E13 |
| Portion | Price | COGS | Gross Profit | GM % | Food Cost % | Target Price | Price Gap | Max Weight | Break-even Units | Source |
| 144 | 150 | 66.56 | 83.44 | 0.5562 | 0.4438 | 190.18 | 40.18 | 113.58 | 80.89 | YUMMY BREAD!B20; YUMMY BREAD!C20 |
| 144 | 125 | 66.56 | 58.44 | 0.4675 | 0.5325 | 190.18 | 65.18 | 94.65 | 97.07 | YUMMY BREAD!B21; YUMMY BREAD!C21 |
| 139 | 150 | 64.25 | 85.75 | 0.5717 | 0.4283 | 183.58 | 33.58 | 113.58 | 80.89 | YUMMY BREAD!B22; YUMMY BREAD!C22 |
| Portion | Key Ingredient | GM after +10% | GM after +25% | Action |
| 144 | flour | 0.5343 | 0.5014 | Monitor / absorb short term |
| 144 | flour | 0.4412 | 0.4017 | Raise price immediately |
| 139 | flour | 0.5505 | 0.5187 | Monitor / absorb short term |
| Standard Production Method | Template step |
| Assumption | Validate process, times, temperatures, and proof/bake/fry controls with production team |
| Step | Scale ingredients exactly; separate flour, yeast, salt, sugar, fat, and improver until mixing. |
| Step | Mix dry ingredients, add liquids gradually, develop dough until smooth and elastic. |
| Step | Bulk ferment, divide by target weight, round, rest, shape, proof, bake, cool fully, then package. |
## Sheet: Donuts
| Donuts |
| --- |
| Recipe card, costing, target price, sensitivity, and action checklist |
| Field | Value | Source / note |
| Category | fried/snack | Inferred from recipe name |
| Base Batch Mass | 27450 | Donuts!D5 + Donuts!D6 + Donuts!D7 + Donuts!D8 + Donuts!D9 + Donuts!D10 + Donuts!D11 + Donuts!D12 + Donuts!D13 |
| Base Ingredient Cost | 14597.07 | Donuts!E5 + Donuts!E6 + Donuts!E7 + Donuts!E8 + Donuts!E9 + Donuts!E10 + Donuts!E11 + Donuts!E12 + Donuts!E13 |
| Recommended Action | Reprice | Raise worst SKU to target price or reduce portion to 32.91g for 65% GM. |
| Top-2 Ingredient Share | 0.7632 | Base ingredient cost rows |
| Highest-Cost Ingredient | oil (6100) | Donuts!E13 |
| Missing COGS Fields | labor, packaging, overhead, actual yield, waste, daily volume | Complete before treating COGS as final |
| Ingredient | Qty | Cost | % Cost | Risk | Source |
| oil | 5000 | 6100 | 0.4179 | High | Donuts!D13; Donuts!E13 |
| flour | 12000 | 5040 | 0.3453 | High | Donuts!D5; Donuts!E5 |
| eggs | 1000 | 1333.33 | 0.0913 | Normal | Donuts!D11; Donuts!E11 |
| Sugar | 1200 | 768 | 0.0526 | Normal | Donuts!D9; Donuts!E9 |
| milk | 500 | 585 | 0.0401 | Normal | Donuts!D7; Donuts!E7 |
| baking powder | 190 | 494 | 0.0338 | Normal | Donuts!D6; Donuts!E6 |
| Improver | 90 | 252 | 0.0173 | Normal | Donuts!D10; Donuts!E10 |
| salt | 120 | 24.67 | 0.0017 | Normal | Donuts!D8; Donuts!E8 |
| water | 7350 | 0.07 | 0 | Normal | Donuts!D12; Donuts!E12 |
| Portion | Price | COGS | Gross Profit | GM % | Food Cost % | Target Price | Price Gap | Max Weight | Break-even Units | Source |
| 40 | 50 | 21.27 | 28.73 | 0.5746 | 0.4254 | 60.77 | 10.77 | 32.91 | 291.94 | Donuts!B18; Donuts!C18 |
| 22 | 50 | 11.7 | 38.3 | 0.766 | 0.234 | 33.43 | -16.57 | 32.91 | 291.94 | Donuts!B19; Donuts!C19 |
| 150 | 500 | 79.77 | 420.23 | 0.8405 | 0.1595 | 227.9 | -272.1 | 329.09 | 29.19 | Donuts!B20; Donuts!C20 |
| Portion | Key Ingredient | GM after +10% | GM after +25% | Action |
| 40 | oil | 0.5568 | 0.5301 | Monitor / absorb short term |
| 22 | oil | 0.7562 | 0.7416 | Monitor / absorb short term |
| 150 | oil | 0.8338 | 0.8238 | Monitor / absorb short term |
| Standard Production Method | Template step |
| Assumption | Validate process, times, temperatures, and proof/bake/fry controls with production team |
| Step | Mix dough/batter to consistent hydration and rest where required. |
| Step | Portion/cut by target weight, fry in controlled oil, drain fully before packing. |
| Step | Track oil usage and discard schedule as separate process loss. |
## Sheet: Fish Pie
| Fish Pie |
| --- |
| Recipe card, costing, target price, sensitivity, and action checklist |
| Field | Value | Source / note |
| Category | pastry/savory | Inferred from recipe name |
| Base Batch Mass | 5700 | Fish Pie!D5 + Fish Pie!D6 + Fish Pie!D7 + Fish Pie!D8 + Fish Pie!D9 + Fish Pie!D10 + Fish Pie!D11 + Fish Pie!D12 + Fish Pie!D13 + Fish Pie!D14 + Fish Pie!D15 + Fish Pie!D16 |
| Base Ingredient Cost | 4178.65 | Fish Pie!E5 + Fish Pie!E6 + Fish Pie!E7 + Fish Pie!E8 + Fish Pie!E9 + Fish Pie!E10 + Fish Pie!E11 + Fish Pie!E12 + Fish Pie!E13 + Fish Pie!E14 + Fish Pie!E15 |
| Recommended Action | Reprice | Raise worst SKU to target price or reduce portion to 47.74g for 65% GM. |
| Top-2 Ingredient Share | 0.6643 | Base ingredient cost rows |
| Highest-Cost Ingredient | Butter (1515.79) | Fish Pie!E7 |
| Missing COGS Fields | labor, packaging, overhead, actual yield, waste, daily volume | Complete before treating COGS as final |
| Ingredient | Qty | Cost | % Cost | Risk | Source |
| Butter | 1200 | 1515.79 | 0.3627 | High | Fish Pie!D7; Fish Pie!E7 |
| flour | 3000 | 1260 | 0.3015 | High | Fish Pie!D5; Fish Pie!E5 |
| fish | 400 | 480 | 0.1149 | Normal | Fish Pie!D9; Fish Pie!E9 |
| onions | 100 | 200 | 0.0479 | Normal | Fish Pie!D13; Fish Pie!E13 |
| carrots | 200 | 171.43 | 0.041 | Normal | Fish Pie!D10; Fish Pie!E10 |
| irish | 300 | 171.43 | 0.041 | Normal | Fish Pie!D14; Fish Pie!E14 |
| baking powder | 50 | 130 | 0.0311 | Normal | Fish Pie!D6; Fish Pie!E6 |
| oil | 100 | 122 | 0.0292 | Normal | Fish Pie!D15; Fish Pie!E15 |
| Improver | 40 | 104 | 0.0249 | Normal | Fish Pie!D8; Fish Pie!E8 |
| Green beans | 100 | 20 | 0.0048 | Normal | Fish Pie!D11; Fish Pie!E11 |
| peppers | 10 | 4 | 0.001 | Normal | Fish Pie!D12; Fish Pie!E12 |
| cabbage | 200 |  |  | Normal | Fish Pie!D16; Fish Pie!E16 |
| Portion | Price | COGS | Gross Profit | GM % | Food Cost % | Target Price | Price Gap | Max Weight | Break-even Units | Source |
| 85 | 100 | 62.31 | 37.69 | 0.3769 | 0.6231 | 178.04 | 78.04 | 47.74 | 41.79 | Fish Pie!B22; Fish Pie!C22 |
| 65 | 100 | 47.65 | 52.35 | 0.5235 | 0.4765 | 136.15 | 36.15 | 47.74 | 41.79 | Fish Pie!B23; Fish Pie!C23 |
| 150 | 500 | 109.96 | 390.04 | 0.7801 | 0.2199 | 314.18 | -185.82 | 238.71 | 8.36 | Fish Pie!B24; Fish Pie!C24 |
| Portion | Key Ingredient | GM after +10% | GM after +25% | Action |
| 85 | Butter | 0.3543 | 0.3204 | Raise price immediately |
| 65 | Butter | 0.5062 | 0.4803 | Raise price immediately |
| 150 | Butter | 0.7721 | 0.7601 | Monitor / absorb short term |
| Standard Production Method | Template step |
| Assumption | Validate process, times, temperatures, and proof/bake/fry controls with production team |
| Step | Prepare dough and filling separately; weigh filling per piece. |
| Step | Seal, proof/rest where required, bake/fry, cool, and count intact saleable pieces. |
| Step | Track filling waste and broken/leaking pieces. |
## Sheet: Galette
| Galette |
| --- |
| Recipe card, costing, target price, sensitivity, and action checklist |
| Field | Value | Source / note |
| Category | pastry/savory | Inferred from recipe name |
| Base Batch Mass | 16995 | Galette!D5 + Galette!D6 + Galette!D7 + Galette!D8 + Galette!D9 + Galette!D10 + Galette!D11 + Galette!D12 + Galette!D13 + Galette!D14 + Galette!D15 + Galette!D16 |
| Base Ingredient Cost | 10606.44 | Galette!E5 + Galette!E6 + Galette!E7 + Galette!E8 + Galette!E9 + Galette!E10 + Galette!E11 + Galette!E12 + Galette!E13 + Galette!E14 + Galette!E15 + Galette!E16 |
| Recommended Action | Reprice | Raise worst SKU to target price or reduce portion to 56.08g for 65% GM. |
| Top-2 Ingredient Share | 0.5647 | Base ingredient cost rows |
| Highest-Cost Ingredient | flour (4200) | Galette!E5 |
| Missing COGS Fields | labor, packaging, overhead, actual yield, waste, daily volume | Complete before treating COGS as final |
| Ingredient | Qty | Cost | % Cost | Risk | Source |
| flour | 10000 | 4200 | 0.396 | High | Galette!D5; Galette!E5 |
| Chocolate | 1000 | 1789.47 | 0.1687 | Medium | Galette!D15; Galette!E15 |
| Butter | 1000 | 1263.16 | 0.1191 | Normal | Galette!D6; Galette!E6 |
| egg | 750 | 1000 | 0.0943 | Normal | Galette!D9; Galette!E9 |
| Milk | 800 | 936 | 0.0882 | Normal | Galette!D8; Galette!E8 |
| sugar | 1000 | 640 | 0.0603 | Normal | Galette!D7; Galette!E7 |
| improver | 100 | 280 | 0.0264 | Normal | Galette!D11; Galette!E11 |
| EDC | 75 | 225 | 0.0212 | Normal | Galette!D16; Galette!E16 |
| yeast | 80 | 224 | 0.0211 | Normal | Galette!D12; Galette!E12 |
| baking powder | 80 | 26 | 0.0025 | Normal | Galette!D14; Galette!E14 |
| salt | 110 | 22.61 | 0.0021 | Normal | Galette!D10; Galette!E10 |
| water | 2000 | 0.2 | 0 | Normal | Galette!D13; Galette!E13 |
| Portion | Price | COGS | Gross Profit | GM % | Food Cost % | Target Price | Price Gap | Max Weight | Break-even Units | Source |
| 79 | 100 | 49.3 | 50.7 | 0.507 | 0.493 | 140.87 | 40.87 | 56.08 | 106.06 | Galette!B22; Galette!C22 |
| 140 | 200 | 87.37 | 112.63 | 0.5631 | 0.4369 | 249.64 | 49.64 | 112.16 | 53.03 | Galette!B23; Galette!C23 |
| 700 | 1000 | 436.86 | 563.14 | 0.5631 | 0.4369 | 1248.18 | 248.18 | 560.81 | 10.61 | Galette!B24; Galette!C24 |
| Portion | Key Ingredient | GM after +10% | GM after +25% | Action |
| 79 | flour | 0.4874 | 0.4582 | Raise price immediately |
| 140 | flour | 0.5458 | 0.5199 | Monitor / absorb short term |
| 700 | flour | 0.5458 | 0.5199 | Monitor / absorb short term |
| Standard Production Method | Template step |
| Assumption | Validate process, times, temperatures, and proof/bake/fry controls with production team |
| Step | Prepare dough and filling separately; weigh filling per piece. |
| Step | Seal, proof/rest where required, bake/fry, cool, and count intact saleable pieces. |
| Step | Track filling waste and broken/leaking pieces. |
## Sheet: New bread
| New bread |
| --- |
| Recipe card, costing, target price, sensitivity, and action checklist |
| Field | Value | Source / note |
| Category | bread | Inferred from recipe name |
| Base Batch Mass | 24160 | New bread!D5 + New bread!D6 + New bread!D7 + New bread!D8 + New bread!D9 + New bread!D10 + New bread!D11 + New bread!D12 + New bread!D13 |
| Base Ingredient Cost | 8534.43 | New bread!E5 + New bread!E6 + New bread!E7 + New bread!E8 + New bread!E9 + New bread!E10 + New bread!E11 + New bread!E12 + New bread!E13 |
| Recommended Action | Renegotiate ingredient | Margin is acceptable but top-2 ingredients drive 83.4% of base cost. |
| Top-2 Ingredient Share | 0.8337 | Base ingredient cost rows |
| Highest-Cost Ingredient | flour (6300) | New bread!E5 |
| Missing COGS Fields | labor, packaging, overhead, actual yield, waste, daily volume | Complete before treating COGS as final |
| Ingredient | Qty | Cost | % Cost | Risk | Source |
| flour | 15000 | 6300 | 0.7382 | High | New bread!D5; New bread!E5 |
| egg | 220 | 814.81 | 0.0955 | Normal | New bread!D9; New bread!E9 |
| Butter | 600 | 757.89 | 0.0888 | Normal | New bread!D6; New bread!E6 |
| improver | 100 | 280 | 0.0328 | Normal | New bread!D11; New bread!E11 |
| yeast | 90 | 252 | 0.0295 | Normal | New bread!D12; New bread!E12 |
| sugar | 100 | 64 | 0.0075 | Normal | New bread!D7; New bread!E7 |
| conc milk | 950 | 44.46 | 0.0052 | Normal | New bread!D8; New bread!E8 |
| salt | 100 | 20.56 | 0.0024 | Normal | New bread!D10; New bread!E10 |
| water | 7000 | 0.7 | 0.0001 | Normal | New bread!D13; New bread!E13 |
| Portion | Price | COGS | Gross Profit | GM % | Food Cost % | Target Price | Price Gap | Max Weight | Break-even Units | Source |
| 90 | 100 | 31.79 | 68.21 | 0.6821 | 0.3179 | 90.83 | -9.17 | 99.08 | 85.34 | New bread!C20; New bread!D20 |
| Portion | Key Ingredient | GM after +10% | GM after +25% | Action |
| 90 | flour | 0.6586 | 0.6234 | Monitor / absorb short term |
| Standard Production Method | Template step |
| Assumption | Validate process, times, temperatures, and proof/bake/fry controls with production team |
| Step | Scale ingredients exactly; separate flour, yeast, salt, sugar, fat, and improver until mixing. |
| Step | Mix dry ingredients, add liquids gradually, develop dough until smooth and elastic. |
| Step | Bulk ferment, divide by target weight, round, rest, shape, proof, bake, cool fully, then package. |
## Sheet: NGALA BREAD
| NGALA BREAD |
| --- |
| Recipe card, costing, target price, sensitivity, and action checklist |
| Field | Value | Source / note |
| Category | bread | Inferred from recipe name |
| Base Batch Mass | 15430 | NGALA BREAD!D5 + NGALA BREAD!D6 + NGALA BREAD!D7 + NGALA BREAD!D8 + NGALA BREAD!D9 + NGALA BREAD!D10 + NGALA BREAD!D11 + NGALA BREAD!D12 + NGALA BREAD!D13 |
| Base Ingredient Cost | 7531.89 | NGALA BREAD!E5 + NGALA BREAD!E6 + NGALA BREAD!E7 + NGALA BREAD!E8 + NGALA BREAD!E9 + NGALA BREAD!E10 + NGALA BREAD!E11 + NGALA BREAD!E12 + NGALA BREAD!E13 |
| Recommended Action | Reprice | Raise worst SKU to target price or reduce portion to 71.70g for 65% GM. |
| Top-2 Ingredient Share | 0.7444 | Base ingredient cost rows |
| Highest-Cost Ingredient | flour (3570) | NGALA BREAD!E5 |
| Missing COGS Fields | labor, packaging, overhead, actual yield, waste, daily volume | Complete before treating COGS as final |
| Ingredient | Qty | Cost | % Cost | Risk | Source |
| flour | 8500 | 3570 | 0.474 | High | NGALA BREAD!D5; NGALA BREAD!E5 |
| egg | 550 | 2037.04 | 0.2705 | Medium | NGALA BREAD!D9; NGALA BREAD!E9 |
| Butter | 1000 | 1263.16 | 0.1677 | Medium | NGALA BREAD!D6; NGALA BREAD!E6 |
| improver | 100 | 280 | 0.0372 | Normal | NGALA BREAD!D11; NGALA BREAD!E11 |
| yeast | 90 | 252 | 0.0335 | Normal | NGALA BREAD!D12; NGALA BREAD!E12 |
| sugar | 100 | 64 | 0.0085 | Normal | NGALA BREAD!D7; NGALA BREAD!E7 |
| conc milk | 1000 | 46.8 | 0.0062 | Normal | NGALA BREAD!D8; NGALA BREAD!E8 |
| salt | 90 | 18.5 | 0.0025 | Normal | NGALA BREAD!D10; NGALA BREAD!E10 |
| water | 4000 | 0.4 | 0.0001 | Normal | NGALA BREAD!D13; NGALA BREAD!E13 |
| Portion | Price | COGS | Gross Profit | GM % | Food Cost % | Target Price | Price Gap | Max Weight | Break-even Units | Source |
| 90 | 100 | 43.93 | 56.07 | 0.5607 | 0.4393 | 125.52 | 25.52 | 71.7 | 75.32 | NGALA BREAD!C20; NGALA BREAD!D20 |
| Portion | Key Ingredient | GM after +10% | GM after +25% | Action |
| 90 | flour | 0.5399 | 0.5086 | Monitor / absorb short term |
| Standard Production Method | Template step |
| Assumption | Validate process, times, temperatures, and proof/bake/fry controls with production team |
| Step | Scale ingredients exactly; separate flour, yeast, salt, sugar, fat, and improver until mixing. |
| Step | Mix dry ingredients, add liquids gradually, develop dough until smooth and elastic. |
| Step | Bulk ferment, divide by target weight, round, rest, shape, proof, bake, cool fully, then package. |
## Sheet: Pain au lait
| Pain au lait |
| --- |
| Recipe card, costing, target price, sensitivity, and action checklist |
| Field | Value | Source / note |
| Category | bread | Inferred from recipe name |
| Base Batch Mass | 20457 | Pain au lait!D5 + Pain au lait!D6 + Pain au lait!D7 + Pain au lait!D8 + Pain au lait!D9 + Pain au lait!D10 + Pain au lait!D11 + Pain au lait!D12 + Pain au lait!D13 + Pain au lait!D14 + Pain au lait!D15 + Pain au lait!D16 + Pain au lait!D17 |
| Base Ingredient Cost | 9645.83 | Pain au lait!E5 + Pain au lait!E6 + Pain au lait!E7 + Pain au lait!E8 + Pain au lait!E9 + Pain au lait!E10 + Pain au lait!E11 + Pain au lait!E12 + Pain au lait!E13 + Pain au lait!E14 + Pain au lait!E15 + Pain au lait!E16 + Pain au lait!E17 |
| Recommended Action | Reprice | Raise worst SKU to target price or reduce portion to 111.34g for 65% GM. |
| Top-2 Ingredient Share | 0.6535 | Base ingredient cost rows |
| Highest-Cost Ingredient | flour (5040) | Pain au lait!E5 |
| Missing COGS Fields | labor, packaging, overhead, actual yield, waste, daily volume | Complete before treating COGS as final |
| Ingredient | Qty | Cost | % Cost | Risk | Source |
| flour | 12000 | 5040 | 0.5225 | High | Pain au lait!D5; Pain au lait!E5 |
| Butter | 1000 | 1263.16 | 0.131 | Normal | Pain au lait!D6; Pain au lait!E6 |
| Milk | 950 | 1111.5 | 0.1152 | Normal | Pain au lait!D8; Pain au lait!E8 |
| sugar | 1100 | 704 | 0.073 | Normal | Pain au lait!D7; Pain au lait!E7 |
| egg | 300 | 400 | 0.0415 | Normal | Pain au lait!D9; Pain au lait!E9 |
| Oil | 300 | 366 | 0.0379 | Normal | Pain au lait!D14; Pain au lait!E14 |
| improver | 100 | 280 | 0.029 | Normal | Pain au lait!D11; Pain au lait!E11 |
| yeast | 80 | 224 | 0.0232 | Normal | Pain au lait!D12; Pain au lait!E12 |
| Nutmeg | 12 | 108 | 0.0112 | Normal | Pain au lait!D17; Pain au lait!E17 |
| EDC | 25 | 75 | 0.0078 | Normal | Pain au lait!D16; Pain au lait!E16 |
| Milk tantalizer | 5 | 56.25 | 0.0058 | Normal | Pain au lait!D15; Pain au lait!E15 |
| salt | 85 | 17.47 | 0.0018 | Normal | Pain au lait!D10; Pain au lait!E10 |
| water | 4500 | 0.45 | 0 | Normal | Pain au lait!D13; Pain au lait!E13 |
| Portion | Price | COGS | Gross Profit | GM % | Food Cost % | Target Price | Price Gap | Max Weight | Break-even Units | Source |
| 136 | 150 | 64.13 | 85.87 | 0.5725 | 0.4275 | 183.22 | 33.22 | 111.34 | 64.31 | Pain au lait!B23; Pain au lait!C23 |
| 200 | 300 | 94.3 | 205.7 | 0.6857 | 0.3143 | 269.44 | -30.56 | 222.69 | 32.15 | Pain au lait!B24; Pain au lait!C24 |
| 800 | 1000 | 377.21 | 622.79 | 0.6228 | 0.3772 | 1077.75 | 77.75 | 742.28 | 9.65 | Pain au lait!B25; Pain au lait!C25 |
| Portion | Key Ingredient | GM after +10% | GM after +25% | Action |
| 136 | flour | 0.5502 | 0.5166 | Monitor / absorb short term |
| 200 | flour | 0.6692 | 0.6446 | Monitor / absorb short term |
| 800 | flour | 0.6031 | 0.5735 | Monitor / absorb short term |
| Standard Production Method | Template step |
| Assumption | Validate process, times, temperatures, and proof/bake/fry controls with production team |
| Step | Scale ingredients exactly; separate flour, yeast, salt, sugar, fat, and improver until mixing. |
| Step | Mix dry ingredients, add liquids gradually, develop dough until smooth and elastic. |
| Step | Bulk ferment, divide by target weight, round, rest, shape, proof, bake, cool fully, then package. |
## Sheet: NEW BRIOCHE
| NEW BRIOCHE |
| --- |
| Recipe card, costing, target price, sensitivity, and action checklist |
| Field | Value | Source / note |
| Category | bread | Inferred from recipe name |
| Base Batch Mass | 17213 | NEW BRIOCHE!D5 + NEW BRIOCHE!D6 + NEW BRIOCHE!D7 + NEW BRIOCHE!D8 + NEW BRIOCHE!D9 + NEW BRIOCHE!D10 + NEW BRIOCHE!D11 + NEW BRIOCHE!D12 + NEW BRIOCHE!D13 + NEW BRIOCHE!D14 + NEW BRIOCHE!D15 |
| Base Ingredient Cost | 10838.38 | NEW BRIOCHE!E5 + NEW BRIOCHE!E6 + NEW BRIOCHE!E7 + NEW BRIOCHE!E8 + NEW BRIOCHE!E9 + NEW BRIOCHE!E10 + NEW BRIOCHE!E11 + NEW BRIOCHE!E12 + NEW BRIOCHE!E13 + NEW BRIOCHE!E14 + NEW BRIOCHE!E15 |
| Recommended Action | Reprice | Raise worst SKU to target price or reduce portion to 55.59g for 65% GM. |
| Top-2 Ingredient Share | 0.6789 | Base ingredient cost rows |
| Highest-Cost Ingredient | flour (4200) | NEW BRIOCHE!E5 |
| Missing COGS Fields | labor, packaging, overhead, actual yield, waste, daily volume | Complete before treating COGS as final |
| Ingredient | Qty | Cost | % Cost | Risk | Source |
| flour | 10000 | 4200 | 0.3875 | High | NEW BRIOCHE!D5; NEW BRIOCHE!E5 |
| Butter | 2500 | 3157.89 | 0.2914 | Medium | NEW BRIOCHE!D6; NEW BRIOCHE!E6 |
| sugar | 1500 | 960 | 0.0886 | Normal | NEW BRIOCHE!D7; NEW BRIOCHE!E7 |
| Milk | 800 | 936 | 0.0864 | Normal | NEW BRIOCHE!D8; NEW BRIOCHE!E8 |
| egg | 500 | 666.67 | 0.0615 | Normal | NEW BRIOCHE!D9; NEW BRIOCHE!E9 |
| yeast | 140 | 392 | 0.0362 | Normal | NEW BRIOCHE!D12; NEW BRIOCHE!E12 |
| improver | 120 | 336 | 0.031 | Normal | NEW BRIOCHE!D11; NEW BRIOCHE!E11 |
| Milk tantalizer | 8 | 90 | 0.0083 | Normal | NEW BRIOCHE!D14; NEW BRIOCHE!E14 |
| EDC | 25 | 75 | 0.0069 | Normal | NEW BRIOCHE!D15; NEW BRIOCHE!E15 |
| salt | 120 | 24.67 | 0.0023 | Normal | NEW BRIOCHE!D10; NEW BRIOCHE!E10 |
| water | 1500 | 0.15 | 0 | Normal | NEW BRIOCHE!D13; NEW BRIOCHE!E13 |
| Portion | Price | COGS | Gross Profit | GM % | Food Cost % | Target Price | Price Gap | Max Weight | Break-even Units | Source |
| 82 | 100 | 51.63 | 48.37 | 0.4837 | 0.5163 | 147.52 | 47.52 | 55.59 | 108.38 | NEW BRIOCHE!B21; NEW BRIOCHE!C21 |
| 140 | 200 | 88.15 | 111.85 | 0.5592 | 0.4408 | 251.86 | 51.86 | 111.17 | 54.19 | NEW BRIOCHE!B22; NEW BRIOCHE!C22 |
| 700 | 1000 | 440.76 | 559.24 | 0.5592 | 0.4408 | 1259.32 | 259.32 | 555.85 | 10.84 | NEW BRIOCHE!B23; NEW BRIOCHE!C23 |
| Portion | Key Ingredient | GM after +10% | GM after +25% | Action |
| 82 | flour | 0.4637 | 0.4337 | Raise price immediately |
| 140 | flour | 0.5422 | 0.5165 | Monitor / absorb short term |
| 700 | flour | 0.5422 | 0.5165 | Monitor / absorb short term |
| Standard Production Method | Template step |
| Assumption | Validate process, times, temperatures, and proof/bake/fry controls with production team |
| Step | Scale ingredients exactly; separate flour, yeast, salt, sugar, fat, and improver until mixing. |
| Step | Mix dry ingredients, add liquids gradually, develop dough until smooth and elastic. |
| Step | Bulk ferment, divide by target weight, round, rest, shape, proof, bake, cool fully, then package. |
## Sheet: Brioche Professionel
| Brioche Professionel |
| --- |
| Recipe card, costing, target price, sensitivity, and action checklist |
| Field | Value | Source / note |
| Category | bread | Inferred from recipe name |
| Base Batch Mass | 10750 | Brioche Professionel!D5 + Brioche Professionel!D6 + Brioche Professionel!D7 + Brioche Professionel!D8 + Brioche Professionel!D9 + Brioche Professionel!D10 + Brioche Professionel!D11 + Brioche Professionel!D12 + Brioche Professionel!D13 |
| Base Ingredient Cost | 8800.68 | Brioche Professionel!E5 + Brioche Professionel!E6 + Brioche Professionel!E7 + Brioche Professionel!E8 + Brioche Professionel!E9 + Brioche Professionel!E10 + Brioche Professionel!E11 + Brioche Professionel!E12 + Brioche Professionel!E13 |
| Recommended Action | Resize portion + reprice | Worst SKU is 34.5% GM; current portion is too large for the price. |
| Top-2 Ingredient Share | 0.5447 | Base ingredient cost rows |
| Highest-Cost Ingredient | flour (2520) | Brioche Professionel!E5 |
| Missing COGS Fields | labor, packaging, overhead, actual yield, waste, daily volume | Complete before treating COGS as final |
| Ingredient | Qty | Cost | % Cost | Risk | Source |
| flour | 6000 | 2520 | 0.2863 | Medium | Brioche Professionel!D5; Brioche Professionel!E5 |
| Butter | 1800 | 2273.68 | 0.2584 | Medium | Brioche Professionel!D6; Brioche Professionel!E6 |
| CONC MILK | 1000 | 1170 | 0.1329 | Normal | Brioche Professionel!D8; Brioche Professionel!E8 |
| egg | 800 | 1066.67 | 0.1212 | Normal | Brioche Professionel!D9; Brioche Professionel!E9 |
| Nutmeg | 70 | 630 | 0.0716 | Normal | Brioche Professionel!D13; Brioche Professionel!E13 |
| sugar | 800 | 512 | 0.0582 | Normal | Brioche Professionel!D7; Brioche Professionel!E7 |
| yeast | 120 | 336 | 0.0382 | Normal | Brioche Professionel!D12; Brioche Professionel!E12 |
| improver | 100 | 280 | 0.0318 | Normal | Brioche Professionel!D11; Brioche Professionel!E11 |
| salt | 60 | 12.33 | 0.0014 | Normal | Brioche Professionel!D10; Brioche Professionel!E10 |
| Portion | Price | COGS | Gross Profit | GM % | Food Cost % | Target Price | Price Gap | Max Weight | Break-even Units | Source |
| 70 | 100 | 57.31 | 42.69 | 0.4269 | 0.5731 | 163.73 | 63.73 | 42.75 | 88.01 | Brioche Professionel!B19; Brioche Professionel!C19 |
| 220 | 300 | 180.11 | 119.89 | 0.3996 | 0.6004 | 514.59 | 214.59 | 128.26 | 29.34 | Brioche Professionel!B20; Brioche Professionel!C20 |
| 800 | 1000 | 654.93 | 345.07 | 0.3451 | 0.6549 | 1871.24 | 871.24 | 427.52 | 8.8 | Brioche Professionel!B21; Brioche Professionel!C21 |
| Portion | Key Ingredient | GM after +10% | GM after +25% | Action |
| 70 | flour | 0.4105 | 0.3859 | Raise price immediately |
| 220 | flour | 0.3825 | 0.3567 | Raise price immediately |
| 800 | flour | 0.3263 | 0.2982 | Raise price immediately |
| Standard Production Method | Template step |
| Assumption | Validate process, times, temperatures, and proof/bake/fry controls with production team |
| Step | Scale ingredients exactly; separate flour, yeast, salt, sugar, fat, and improver until mixing. |
| Step | Mix dry ingredients, add liquids gradually, develop dough until smooth and elastic. |
| Step | Bulk ferment, divide by target weight, round, rest, shape, proof, bake, cool fully, then package. |
## Sheet: professinal Buns
| professinal Buns |
| --- |
| Recipe card, costing, target price, sensitivity, and action checklist |
| Field | Value | Source / note |
| Category | buns | Inferred from recipe name |
| Base Batch Mass | 13905 | professinal Buns!D5 + professinal Buns!D6 + professinal Buns!D7 + professinal Buns!D8 + professinal Buns!D9 + professinal Buns!D10 + professinal Buns!D11 + professinal Buns!D12 + professinal Buns!D13 + professinal Buns!D14 + professinal Buns!D15 + professinal Buns!D16 + professinal Buns!D17 |
| Base Ingredient Cost | 10331.56 | professinal Buns!E5 + professinal Buns!E6 + professinal Buns!E7 + professinal Buns!E8 + professinal Buns!E9 + professinal Buns!E10 + professinal Buns!E11 + professinal Buns!E12 + professinal Buns!E13 + professinal Buns!E14 + professinal Buns!E15 + professinal Buns!E16 + professinal Buns!E17 |
| Recommended Action | Resize portion + reprice | Worst SKU is 29.4% GM; current portion is too large for the price. |
| Top-2 Ingredient Share | 0.5499 | Base ingredient cost rows |
| Highest-Cost Ingredient | flour (4200) | professinal Buns!E5 |
| Missing COGS Fields | labor, packaging, overhead, actual yield, waste, daily volume | Complete before treating COGS as final |
| Ingredient | Qty | Cost | % Cost | Risk | Source |
| flour | 10000 | 4200 | 0.4065 | High | professinal Buns!D5; professinal Buns!E5 |
| egg | 400 | 1481.48 | 0.1434 | Normal | professinal Buns!D9; professinal Buns!E9 |
| Butter | 1000 | 1263.16 | 0.1223 | Normal | professinal Buns!D6; professinal Buns!E6 |
| CONC MILK | 700 | 819 | 0.0793 | Normal | professinal Buns!D8; professinal Buns!E8 |
| Milk tantalizer | 50 | 562.5 | 0.0544 | Normal | professinal Buns!D15; professinal Buns!E15 |
| sugar | 800 | 512 | 0.0496 | Normal | professinal Buns!D7; professinal Buns!E7 |
| Nutmeg | 50 | 450 | 0.0436 | Normal | professinal Buns!D17; professinal Buns!E17 |
| Oil | 300 | 366 | 0.0354 | Normal | professinal Buns!D16; professinal Buns!E16 |
| yeast | 110 | 308 | 0.0298 | Normal | professinal Buns!D12; professinal Buns!E12 |
| improver | 100 | 280 | 0.0271 | Normal | professinal Buns!D11; professinal Buns!E11 |
| EDC | 25 | 75 | 0.0073 | Normal | professinal Buns!D14; professinal Buns!E14 |
| salt | 70 | 14.39 | 0.0014 | Normal | professinal Buns!D10; professinal Buns!E10 |
| water | 300 | 0.03 | 0 | Normal | professinal Buns!D13; professinal Buns!E13 |
| Portion | Price | COGS | Gross Profit | GM % | Food Cost % | Target Price | Price Gap | Max Weight | Break-even Units | Source |
| 95 | 100 | 70.59 | 29.41 | 0.2941 | 0.7059 | 201.67 | 101.67 | 47.11 | 103.32 | professinal Buns!B23; professinal Buns!C23 |
| 140 | 150 | 104.02 | 45.98 | 0.3065 | 0.6935 | 297.2 | 147.2 | 70.66 | 68.88 | professinal Buns!B24; professinal Buns!C24 |
| 800 | 1000 | 594.41 | 405.59 | 0.4056 | 0.5944 | 1698.31 | 698.31 | 471.06 | 10.33 | professinal Buns!B25; professinal Buns!C25 |
| Portion | Key Ingredient | GM after +10% | GM after +25% | Action |
| 95 | flour | 0.2654 | 0.2224 | Raise price immediately |
| 140 | flour | 0.2783 | 0.236 | Raise price immediately |
| 800 | flour | 0.3814 | 0.3452 | Raise price immediately |
| Standard Production Method | Template step |
| Assumption | Validate process, times, temperatures, and proof/bake/fry controls with production team |
| Step | Scale and mix as enriched dough; add fat after initial hydration where needed. |
| Step | Divide to target weight, round tightly, proof consistently, bake/fry to house standard. |
| Step | Count saleable pieces after cooling, not before, to capture shrink and breakage. |
## Sheet: brioche
| brioche |
| --- |
| Recipe card, costing, target price, sensitivity, and action checklist |
| Field | Value | Source / note |
| Category | bread | Inferred from recipe name |
| Base Batch Mass | 17400 | brioche!D5 + brioche!D6 + brioche!D7 + brioche!D8 + brioche!D9 + brioche!D10 + brioche!D11 + brioche!D12 + brioche!D13 + brioche!D14 + brioche!D15 |
| Base Ingredient Cost | 10861.15 | brioche!E5 + brioche!E6 + brioche!E7 + brioche!E8 + brioche!E9 + brioche!E10 + brioche!E11 + brioche!E12 + brioche!E13 + brioche!E14 + brioche!E15 |
| Recommended Action | Reprice | Raise worst SKU to target price or reduce portion to 56.07g for 65% GM. |
| Top-2 Ingredient Share | 0.6775 | Base ingredient cost rows |
| Highest-Cost Ingredient | flour (4200) | brioche!E5 |
| Missing COGS Fields | labor, packaging, overhead, actual yield, waste, daily volume | Complete before treating COGS as final |
| Ingredient | Qty | Cost | % Cost | Risk | Source |
| flour | 10000 | 4200 | 0.3867 | High | brioche!D5; brioche!E5 |
| Butter | 2500 | 3157.89 | 0.2908 | Medium | brioche!D6; brioche!E6 |
| sugar | 1500 | 960 | 0.0884 | Normal | brioche!D7; brioche!E7 |
| Milk | 800 | 936 | 0.0862 | Normal | brioche!D8; brioche!E8 |
| egg | 500 | 666.67 | 0.0614 | Normal | brioche!D9; brioche!E9 |
| yeast | 140 | 392 | 0.0361 | Normal | brioche!D12; brioche!E12 |
| improver | 100 | 280 | 0.0258 | Normal | brioche!D11; brioche!E11 |
| Milk tantalizer | 15 | 168.75 | 0.0155 | Normal | brioche!D14; brioche!E14 |
| EDC | 25 | 75 | 0.0069 | Normal | brioche!D15; brioche!E15 |
| salt | 120 | 24.67 | 0.0023 | Normal | brioche!D10; brioche!E10 |
| water | 1700 | 0.17 | 0 | Normal | brioche!D13; brioche!E13 |
| Portion | Price | COGS | Gross Profit | GM % | Food Cost % | Target Price | Price Gap | Max Weight | Break-even Units | Source |
| 82 | 100 | 51.18 | 48.82 | 0.4882 | 0.5118 | 146.24 | 46.24 | 56.07 | 108.61 | brioche!B21; brioche!C21 |
| 160 | 200 | 99.87 | 100.13 | 0.5006 | 0.4994 | 285.35 | 85.35 | 112.14 | 54.31 | brioche!B22; brioche!C22 |
| 700 | 1000 | 436.94 | 563.06 | 0.5631 | 0.4369 | 1248.41 | 248.41 | 560.71 | 10.86 | brioche!B23; brioche!C23 |
| Portion | Key Ingredient | GM after +10% | GM after +25% | Action |
| 82 | flour | 0.4684 | 0.4387 | Raise price immediately |
| 160 | flour | 0.4813 | 0.4524 | Raise price immediately |
| 700 | flour | 0.5462 | 0.5208 | Monitor / absorb short term |
| Standard Production Method | Template step |
| Assumption | Validate process, times, temperatures, and proof/bake/fry controls with production team |
| Step | Scale ingredients exactly; separate flour, yeast, salt, sugar, fat, and improver until mixing. |
| Step | Mix dry ingredients, add liquids gradually, develop dough until smooth and elastic. |
| Step | Bulk ferment, divide by target weight, round, rest, shape, proof, bake, cool fully, then package. |
## Sheet: choko bread
| choko bread |
| --- |
| Recipe card, costing, target price, sensitivity, and action checklist |
| Field | Value | Source / note |
| Category | bread | Inferred from recipe name |
| Base Batch Mass | 8384 | choko bread!D5 + choko bread!D6 + choko bread!D7 + choko bread!D8 + choko bread!D9 + choko bread!D10 + choko bread!D11 + choko bread!D12 + choko bread!D13 + choko bread!D14 + choko bread!D15 |
| Base Ingredient Cost | 5322.09 | choko bread!E5 + choko bread!E6 + choko bread!E7 + choko bread!E8 + choko bread!E9 + choko bread!E10 + choko bread!E11 + choko bread!E12 + choko bread!E13 + choko bread!E14 + choko bread!E15 |
| Recommended Action | Reprice | Raise worst SKU to target price or reduce portion to 55.14g for 65% GM. |
| Top-2 Ingredient Share | 0.6388 | Base ingredient cost rows |
| Highest-Cost Ingredient | flour (2500) | choko bread!E5 |
| Missing COGS Fields | labor, packaging, overhead, actual yield, waste, daily volume | Complete before treating COGS as final |
| Ingredient | Qty | Cost | % Cost | Risk | Source |
| flour | 5000 | 2500 | 0.4697 | High | choko bread!D5; choko bread!E5 |
| choclate | 500 | 900 | 0.1691 | Medium | choko bread!D15; choko bread!E15 |
| egg | 200 | 851.85 | 0.1601 | Medium | choko bread!D9; choko bread!E9 |
| Milk | 100 | 300 | 0.0564 | Normal | choko bread!D8; choko bread!E8 |
| Butter | 200 | 294.74 | 0.0554 | Normal | choko bread!D6; choko bread!E6 |
| sugar | 300 | 210 | 0.0395 | Normal | choko bread!D7; choko bread!E7 |
| Nutmeg | 5 | 125 | 0.0235 | Normal | choko bread!D14; choko bread!E14 |
| improver | 20 | 60 | 0.0113 | Normal | choko bread!D11; choko bread!E11 |
| yeast | 14 | 42 | 0.0079 | Normal | choko bread!D12; choko bread!E12 |
| water | 2000 | 30 | 0.0056 | Normal | choko bread!D13; choko bread!E13 |
| salt | 45 | 8.5 | 0.0016 | Normal | choko bread!D10; choko bread!E10 |
| Portion | Price | COGS | Gross Profit | GM % | Food Cost % | Target Price | Price Gap | Max Weight | Break-even Units | Source |
| 100 | 100 | 63.48 | 36.52 | 0.3652 | 0.6348 | 181.37 | 81.37 | 55.14 | 53.22 | choko bread!B20; choko bread!C20 |
| 220 | 300 | 139.65 | 160.35 | 0.5345 | 0.4655 | 399.01 | 99.01 | 165.41 | 17.74 | choko bread!B21; choko bread!C21 |
| 90 | 100 | 57.13 | 42.87 | 0.4287 | 0.5713 | 163.23 | 63.23 | 55.14 | 53.22 | choko bread!B22; choko bread!C22 |
| Portion | Key Ingredient | GM after +10% | GM after +25% | Action |
| 100 | flour | 0.3354 | 0.2907 | Raise price immediately |
| 220 | flour | 0.5126 | 0.4798 | Raise price immediately |
| 90 | flour | 0.4019 | 0.3616 | Raise price immediately |
| Standard Production Method | Template step |
| Assumption | Validate process, times, temperatures, and proof/bake/fry controls with production team |
| Step | Scale ingredients exactly; separate flour, yeast, salt, sugar, fat, and improver until mixing. |
| Step | Mix dry ingredients, add liquids gradually, develop dough until smooth and elastic. |
| Step | Bulk ferment, divide by target weight, round, rest, shape, proof, bake, cool fully, then package. |
## Sheet: Cake Prof
| Cake Prof |
| --- |
| Recipe card, costing, target price, sensitivity, and action checklist |
| Field | Value | Source / note |
| Category | cake/gateau | Inferred from recipe name |
| Base Batch Mass | 7850 | Cake Prof!D5 + Cake Prof!D6 + Cake Prof!D7 + Cake Prof!D8 + Cake Prof!D9 |
| Base Ingredient Cost | 6695.29 | Cake Prof!E5 + Cake Prof!E6 + Cake Prof!E7 + Cake Prof!E8 + Cake Prof!E9 |
| Recommended Action | Reprice | Raise worst SKU to target price or reduce portion to 41.04g for 65% GM. |
| Top-2 Ingredient Share | 0.646 | Base ingredient cost rows |
| Highest-Cost Ingredient | Egg (2430.56) | Cake Prof!E7 |
| Missing COGS Fields | labor, packaging, overhead, actual yield, waste, daily volume | Complete before treating COGS as final |
| Ingredient | Qty | Cost | % Cost | Risk | Source |
| Egg | 1750 | 2430.56 | 0.363 | High | Cake Prof!D7; Cake Prof!E7 |
| Butter | 1500 | 1894.74 | 0.283 | Medium | Cake Prof!D8; Cake Prof!E8 |
| flour | 3500 | 1470 | 0.2196 | Medium | Cake Prof!D5; Cake Prof!E5 |
| sugar | 1000 | 640 | 0.0956 | Normal | Cake Prof!D9; Cake Prof!E9 |
| baking powder | 100 | 260 | 0.0388 | Normal | Cake Prof!D6; Cake Prof!E6 |
| Portion | Price | COGS | Gross Profit | GM % | Food Cost % | Target Price | Price Gap | Max Weight | Break-even Units | Source |
| 230 | 500 | 196.17 | 303.83 | 0.6077 | 0.3923 | 560.48 | 60.48 | 205.18 | 13.39 | Cake Prof!B16; Cake Prof!C16 |
| 57 | 100 | 48.62 | 51.38 | 0.5138 | 0.4862 | 138.9 | 38.9 | 41.04 | 66.95 | Cake Prof!B17; Cake Prof!C17 |
| Portion | Key Ingredient | GM after +10% | GM after +25% | Action |
| 230 | Egg | 0.5934 | 0.5721 | Monitor / absorb short term |
| 57 | Egg | 0.4962 | 0.4697 | Raise price immediately |
| Standard Production Method | Template step |
| Assumption | Validate process, times, temperatures, and proof/bake/fry controls with production team |
| Step | Cream fat and sugar or use house cake method; add eggs/liquids slowly. |
| Step | Fold dry ingredients gently, portion by weight, bake until set, cool fully. |
| Step | Track batter weight, baked weight, trim, and final saleable pieces. |
## Sheet: Pancake
| Pancake |
| --- |
| Recipe card, costing, target price, sensitivity, and action checklist |
| Field | Value | Source / note |
| Category | cake/gateau | Inferred from recipe name |
| Base Batch Mass | 7876 | Pancake!D5 + Pancake!D6 + Pancake!D7 + Pancake!D8 + Pancake!D9 + Pancake!D10 + Pancake!D11 + Pancake!D12 + Pancake!D13 |
| Base Ingredient Cost | 4951.94 | Pancake!E5 + Pancake!E6 + Pancake!E7 + Pancake!E8 + Pancake!E9 + Pancake!E10 + Pancake!E11 + Pancake!E12 + Pancake!E13 |
| Recommended Action | Reprice | Raise worst SKU to target price or reduce portion to 55.67g for 65% GM. |
| Top-2 Ingredient Share | 0.7051 | Base ingredient cost rows |
| Highest-Cost Ingredient | milk (2491.67) | Pancake!E13 |
| Missing COGS Fields | labor, packaging, overhead, actual yield, waste, daily volume | Complete before treating COGS as final |
| Ingredient | Qty | Cost | % Cost | Risk | Source |
| milk | 650 | 2491.67 | 0.5032 | High | Pancake!D13; Pancake!E13 |
| flour | 2000 | 1000 | 0.2019 | Medium | Pancake!D5; Pancake!E5 |
| sugar | 600 | 600 | 0.1212 | Normal | Pancake!D11; Pancake!E11 |
| Nut Meg | 20 | 500 | 0.101 | Normal | Pancake!D8; Pancake!E8 |
| Egg | 36 | 153.33 | 0.031 | Normal | Pancake!D10; Pancake!E10 |
| yeast | 30 | 69 | 0.0139 | Normal | Pancake!D6; Pancake!E6 |
| water | 4500 | 67.5 | 0.0136 | Normal | Pancake!D9; Pancake!E9 |
| improver | 20 | 66.67 | 0.0135 | Normal | Pancake!D12; Pancake!E12 |
| salt | 20 | 3.78 | 0.0008 | Normal | Pancake!D7; Pancake!E7 |
| Portion | Price | COGS | Gross Profit | GM % | Food Cost % | Target Price | Price Gap | Max Weight | Break-even Units | Source |
| 60 | 100 | 37.72 | 62.28 | 0.6228 | 0.3772 | 107.78 | 7.78 | 55.67 | 49.52 | Pancake!B19; Pancake!C19 |
| 50 | 100 | 31.44 | 68.56 | 0.6856 | 0.3144 | 89.82 | -10.18 | 55.67 | 49.52 | Pancake!B20; Pancake!C20 |
| Portion | Key Ingredient | GM after +10% | GM after +25% | Action |
| 60 | milk | 0.6038 | 0.5753 | Monitor / absorb short term |
| 50 | milk | 0.6698 | 0.6461 | Monitor / absorb short term |
| Standard Production Method | Template step |
| Assumption | Validate process, times, temperatures, and proof/bake/fry controls with production team |
| Step | Cream fat and sugar or use house cake method; add eggs/liquids slowly. |
| Step | Fold dry ingredients gently, portion by weight, bake until set, cool fully. |
| Step | Track batter weight, baked weight, trim, and final saleable pieces. |
## Sheet: Chinchin
| Chinchin |
| --- |
| Recipe card, costing, target price, sensitivity, and action checklist |
| Field | Value | Source / note |
| Category | fried/snack | Inferred from recipe name |
| Base Batch Mass | 6067 | Chinchin!D5 + Chinchin!D6 + Chinchin!D7 + Chinchin!D8 + Chinchin!D9 + Chinchin!D10 + Chinchin!D11 + Chinchin!D12 + Chinchin!D13 |
| Base Ingredient Cost | 4448.14 | Chinchin!E5 + Chinchin!E6 + Chinchin!E7 + Chinchin!E8 + Chinchin!E9 + Chinchin!E10 + Chinchin!E11 + Chinchin!E12 + Chinchin!E13 |
| Recommended Action | Renegotiate ingredient | Margin is acceptable but top-2 ingredients drive 70.0% of base cost. |
| Top-2 Ingredient Share | 0.6996 | Base ingredient cost rows |
| Highest-Cost Ingredient | egg (1600) | Chinchin!E10 |
| Missing COGS Fields | labor, packaging, overhead, actual yield, waste, daily volume | Complete before treating COGS as final |
| Ingredient | Qty | Cost | % Cost | Risk | Source |
| egg | 1200 | 1600 | 0.3597 | High | Chinchin!D10; Chinchin!E10 |
| flour | 3600 | 1512 | 0.3399 | High | Chinchin!D5; Chinchin!E5 |
| Butter | 450 | 568.42 | 0.1278 | Normal | Chinchin!D9; Chinchin!E9 |
| sugar | 650 | 416 | 0.0935 | Normal | Chinchin!D8; Chinchin!E8 |
| baking powder | 70 | 182 | 0.0409 | Normal | Chinchin!D6; Chinchin!E6 |
| improver | 40 | 112 | 0.0252 | Normal | Chinchin!D12; Chinchin!E12 |
| nut meg | 5 | 45 | 0.0101 | Normal | Chinchin!D7; Chinchin!E7 |
| salt | 50 | 10.28 | 0.0023 | Normal | Chinchin!D11; Chinchin!E11 |
| oil | 2 | 2.44 | 0.0005 | Normal | Chinchin!D13; Chinchin!E13 |
| Portion | Price | COGS | Gross Profit | GM % | Food Cost % | Target Price | Price Gap | Max Weight | Break-even Units | Source |
| 45 | 100 | 32.99 | 67.01 | 0.6701 | 0.3299 | 94.26 | -5.74 | 47.74 | 44.48 | Chinchin!B19; Chinchin!C19 |
| 40 | 100 | 29.33 | 70.67 | 0.7067 | 0.2933 | 83.79 | -16.21 | 47.74 | 44.48 | Chinchin!B20; Chinchin!C20 |
| 220 | 500 | 161.3 | 338.7 | 0.6774 | 0.3226 | 460.85 | -39.15 | 238.69 | 8.9 | Chinchin!B21; Chinchin!C21 |
| Portion | Key Ingredient | GM after +10% | GM after +25% | Action |
| 45 | egg | 0.6582 | 0.6404 | Monitor / absorb short term |
| 40 | egg | 0.6962 | 0.6804 | Monitor / absorb short term |
| 220 | egg | 0.6658 | 0.6484 | Monitor / absorb short term |
| Standard Production Method | Template step |
| Assumption | Validate process, times, temperatures, and proof/bake/fry controls with production team |
| Step | Mix dough/batter to consistent hydration and rest where required. |
| Step | Portion/cut by target weight, fry in controlled oil, drain fully before packing. |
| Step | Track oil usage and discard schedule as separate process loss. |
## Sheet: Best Chinchin
| Best Chinchin |
| --- |
| Recipe card, costing, target price, sensitivity, and action checklist |
| Field | Value | Source / note |
| Category | fried/snack | Inferred from recipe name |
| Base Batch Mass | 60350 | Best Chinchin!D5 + Best Chinchin!D6 + Best Chinchin!D7 + Best Chinchin!D8 + Best Chinchin!D9 + Best Chinchin!D10 + Best Chinchin!D11 + Best Chinchin!D12 + Best Chinchin!D13 + Best Chinchin!D14 |
| Base Ingredient Cost | 53829.08 | Best Chinchin!E5 + Best Chinchin!E6 + Best Chinchin!E7 + Best Chinchin!E8 + Best Chinchin!E9 + Best Chinchin!E10 + Best Chinchin!E11 + Best Chinchin!E12 + Best Chinchin!E13 + Best Chinchin!E14 |
| Recommended Action | Reprice | Raise worst SKU to target price or reduce portion to 392.40g for 65% GM. |
| Top-2 Ingredient Share | 0.6109 | Base ingredient cost rows |
| Highest-Cost Ingredient | oil (18300) | Best Chinchin!E14 |
| Missing COGS Fields | labor, packaging, overhead, actual yield, waste, daily volume | Complete before treating COGS as final |
| Ingredient | Qty | Cost | % Cost | Risk | Source |
| oil | 15000 | 18300 | 0.34 | High | Best Chinchin!D14; Best Chinchin!E14 |
| egg | 10500 | 14583.33 | 0.2709 | Medium | Best Chinchin!D10; Best Chinchin!E10 |
| flour | 25000 | 10500 | 0.1951 | Medium | Best Chinchin!D5; Best Chinchin!E5 |
| Butter | 4000 | 5052.63 | 0.0939 | Normal | Best Chinchin!D9; Best Chinchin!E9 |
| sugar | 4500 | 2880 | 0.0535 | Normal | Best Chinchin!D8; Best Chinchin!E8 |
| baking powder | 500 | 1300 | 0.0242 | Normal | Best Chinchin!D6; Best Chinchin!E6 |
| oil | 400 | 488 | 0.0091 | Normal | Best Chinchin!D13; Best Chinchin!E13 |
| nut meg | 50 | 450 | 0.0084 | Normal | Best Chinchin!D7; Best Chinchin!E7 |
| Improver | 200 | 234 | 0.0043 | Normal | Best Chinchin!D12; Best Chinchin!E12 |
| salt | 200 | 41.11 | 0.0008 | Normal | Best Chinchin!D11; Best Chinchin!E11 |
| Portion | Price | COGS | Gross Profit | GM % | Food Cost % | Target Price | Price Gap | Max Weight | Break-even Units | Source |
| 45 | 100 | 40.14 | 59.86 | 0.5986 | 0.4014 | 114.68 | 14.68 | 39.24 | 538.29 | Best Chinchin!B19; Best Chinchin!C19 |
| 225 | 500 | 200.69 | 299.31 | 0.5986 | 0.4014 | 573.4 | 73.4 | 196.2 | 107.66 | Best Chinchin!B20; Best Chinchin!C20 |
| 500 | 1000 | 445.97 | 554.03 | 0.554 | 0.446 | 1274.21 | 274.21 | 392.4 | 53.83 | Best Chinchin!B21; Best Chinchin!C21 |
| Portion | Key Ingredient | GM after +10% | GM after +25% | Action |
| 45 | oil | 0.585 | 0.5645 | Monitor / absorb short term |
| 225 | oil | 0.585 | 0.5645 | Monitor / absorb short term |
| 500 | oil | 0.5389 | 0.5161 | Monitor / absorb short term |
| Standard Production Method | Template step |
| Assumption | Validate process, times, temperatures, and proof/bake/fry controls with production team |
| Step | Mix dough/batter to consistent hydration and rest where required. |
| Step | Portion/cut by target weight, fry in controlled oil, drain fully before packing. |
| Step | Track oil usage and discard schedule as separate process loss. |
## Sheet: Sugar Balls
| Sugar Balls |
| --- |
| Recipe card, costing, target price, sensitivity, and action checklist |
| Field | Value | Source / note |
| Category | fried/snack | Inferred from recipe name |
| Base Batch Mass | 17010 | Sugar Balls!D5 + Sugar Balls!D6 + Sugar Balls!D7 + Sugar Balls!D8 + Sugar Balls!D9 + Sugar Balls!D10 + Sugar Balls!D11 + Sugar Balls!D12 |
| Base Ingredient Cost | 7178.32 | Sugar Balls!E5 + Sugar Balls!E6 + Sugar Balls!E7 + Sugar Balls!E8 + Sugar Balls!E9 + Sugar Balls!E10 + Sugar Balls!E11 + Sugar Balls!E12 |
| Recommended Action | Renegotiate ingredient | Margin is acceptable but top-2 ingredients drive 76.1% of base cost. |
| Top-2 Ingredient Share | 0.7611 | Base ingredient cost rows |
| Highest-Cost Ingredient | flour (4200) | Sugar Balls!E5 |
| Missing COGS Fields | labor, packaging, overhead, actual yield, waste, daily volume | Complete before treating COGS as final |
| Ingredient | Qty | Cost | % Cost | Risk | Source |
| flour | 10000 | 4200 | 0.5851 | High | Sugar Balls!D5; Sugar Balls!E5 |
| Butter | 1000 | 1263.16 | 0.176 | Medium | Sugar Balls!D8; Sugar Balls!E8 |
| sugar | 1000 | 640 | 0.0892 | Normal | Sugar Balls!D7; Sugar Balls!E7 |
| yeast | 160 | 448 | 0.0624 | Normal | Sugar Balls!D12; Sugar Balls!E12 |
| Improver | 120 | 312 | 0.0435 | Normal | Sugar Balls!D11; Sugar Balls!E11 |
| baking powder | 110 | 286 | 0.0398 | Normal | Sugar Balls!D6; Sugar Balls!E6 |
| salt | 120 | 24.67 | 0.0034 | Normal | Sugar Balls!D9; Sugar Balls!E9 |
| Cold Water | 4500 | 4.5 | 0.0006 | Normal | Sugar Balls!D10; Sugar Balls!E10 |
| Portion | Price | COGS | Gross Profit | GM % | Food Cost % | Target Price | Price Gap | Max Weight | Break-even Units | Source |
| 80 | 100 | 33.76 | 66.24 | 0.6624 | 0.3376 | 96.46 | -3.54 | 82.94 | 71.78 | Sugar Balls!B18; Sugar Balls!C18 |
| 80 | 100 | 33.76 | 66.24 | 0.6624 | 0.3376 | 96.46 | -3.54 | 82.94 | 71.78 | Sugar Balls!B19; Sugar Balls!C19 |
| 150 | 500 | 63.3 | 436.7 | 0.8734 | 0.1266 | 180.86 | -319.14 | 414.69 | 14.36 | Sugar Balls!B20; Sugar Balls!C20 |
| Portion | Key Ingredient | GM after +10% | GM after +25% | Action |
| 80 | flour | 0.6426 | 0.613 | Monitor / absorb short term |
| 80 | flour | 0.6426 | 0.613 | Monitor / absorb short term |
| 150 | flour | 0.866 | 0.8549 | Monitor / absorb short term |
| Standard Production Method | Template step |
| Assumption | Validate process, times, temperatures, and proof/bake/fry controls with production team |
| Step | Mix dough/batter to consistent hydration and rest where required. |
| Step | Portion/cut by target weight, fry in controlled oil, drain fully before packing. |
| Step | Track oil usage and discard schedule as separate process loss. |
## Sheet: Delice
| Delice |
| --- |
| Recipe card, costing, target price, sensitivity, and action checklist |
| Field | Value | Source / note |
| Category | biscuit/sweet | Inferred from recipe name |
| Base Batch Mass | 6785 | Delice!D5 + Delice!D6 + Delice!D7 + Delice!D8 + Delice!D9 + Delice!D10 + Delice!D11 + Delice!D12 + Delice!D13 + Delice!D14 + Delice!D15 + Delice!D16 + Delice!D17 |
| Base Ingredient Cost | 4825.11 | Delice!E5 + Delice!E6 + Delice!E7 + Delice!E8 + Delice!E9 + Delice!E10 + Delice!E11 + Delice!E12 + Delice!E13 + Delice!E14 + Delice!E15 + Delice!E16 + Delice!E17 |
| Recommended Action | Reprice | Raise worst SKU to target price or reduce portion to 492.17g for 65% GM. |
| Top-2 Ingredient Share | 0.5207 | Base ingredient cost rows |
| Highest-Cost Ingredient | flour (1260) | Delice!E5 |
| Missing COGS Fields | labor, packaging, overhead, actual yield, waste, daily volume | Complete before treating COGS as final |
| Ingredient | Qty | Cost | % Cost | Risk | Source |
| flour | 3000 | 1260 | 0.2611 | Medium | Delice!D5; Delice!E5 |
| Chocolate | 700 | 1252.63 | 0.2596 | Medium | Delice!D15; Delice!E15 |
| Butter | 500 | 631.58 | 0.1309 | Normal | Delice!D6; Delice!E6 |
| honey | 400 | 500 | 0.1036 | Normal | Delice!D16; Delice!E16 |
| egg | 250 | 333.33 | 0.0691 | Normal | Delice!D9; Delice!E9 |
| Milk | 250 | 292.5 | 0.0606 | Normal | Delice!D8; Delice!E8 |
| sugar | 300 | 192 | 0.0398 | Normal | Delice!D7; Delice!E7 |
| EDC | 50 | 150 | 0.0311 | Normal | Delice!D17; Delice!E17 |
| improver | 40 | 112 | 0.0232 | Normal | Delice!D11; Delice!E11 |
| yeast | 30 | 84 | 0.0174 | Normal | Delice!D12; Delice!E12 |
| baking powder | 30 | 9.75 | 0.002 | Normal | Delice!D14; Delice!E14 |
| salt | 35 | 7.19 | 0.0015 | Normal | Delice!D10; Delice!E10 |
| water | 1200 | 0.12 | 0 | Normal | Delice!D13; Delice!E13 |
| Portion | Price | COGS | Gross Profit | GM % | Food Cost % | Target Price | Price Gap | Max Weight | Break-even Units | Source |
| 700 | 1000 | 497.8 | 502.2 | 0.5022 | 0.4978 | 1422.29 | 422.29 | 492.17 | 4.83 | Delice!B23; Delice!C23 |
| 140 | 200 | 99.56 | 100.44 | 0.5022 | 0.4978 | 284.46 | 84.46 | 98.43 | 24.13 | Delice!B24; Delice!C24 |
| 700 | 1000 | 497.8 | 502.2 | 0.5022 | 0.4978 | 1422.29 | 422.29 | 492.17 | 4.83 | Delice!B25; Delice!C25 |
| Portion | Key Ingredient | GM after +10% | GM after +25% | Action |
| 700 | flour | 0.4892 | 0.4697 | Raise price immediately |
| 140 | flour | 0.4892 | 0.4697 | Raise price immediately |
| 700 | flour | 0.4892 | 0.4697 | Raise price immediately |
| Standard Production Method | Template step |
| Assumption | Validate process, times, temperatures, and proof/bake/fry controls with production team |
| Step | Mix dough until uniform; avoid overworking after flour addition. |
| Step | Bake/fry to house standard, cool fully, then pack by weight or count. |
| Step | Track broken pieces, trim, and underweight packs. |
## Sheet: Danisa biscuits
| Danisa biscuits |
| --- |
| Recipe card, costing, target price, sensitivity, and action checklist |
| Field | Value | Source / note |
| Category | biscuit/sweet | Inferred from recipe name |
| Base Batch Mass | 7027 | Danisa biscuits!D5 + Danisa biscuits!D6 + Danisa biscuits!D7 + Danisa biscuits!D8 + Danisa biscuits!D9 + Danisa biscuits!D10 + Danisa biscuits!D11 + Danisa biscuits!D12 + Danisa biscuits!D13 + Danisa biscuits!D14 + Danisa biscuits!D15 + Danisa biscuits!D16 + Danisa biscuits!D17 |
| Base Ingredient Cost | 5118.47 | Danisa biscuits!E5 + Danisa biscuits!E6 + Danisa biscuits!E7 + Danisa biscuits!E8 + Danisa biscuits!E9 + Danisa biscuits!E10 + Danisa biscuits!E11 + Danisa biscuits!E12 + Danisa biscuits!E13 + Danisa biscuits!E14 + Danisa biscuits!E15 + Danisa biscuits!E16 + Danisa biscuits!E17 |
| Recommended Action | Reprice | Raise worst SKU to target price or reduce portion to 480.51g for 65% GM. |
| Top-2 Ingredient Share | 0.4909 | Base ingredient cost rows |
| Highest-Cost Ingredient | flour (1260) | Danisa biscuits!E5 |
| Missing COGS Fields | labor, packaging, overhead, actual yield, waste, daily volume | Complete before treating COGS as final |
| Ingredient | Qty | Cost | % Cost | Risk | Source |
| flour | 3000 | 1260 | 0.2462 | Medium | Danisa biscuits!D5; Danisa biscuits!E5 |
| Chocolate | 700 | 1252.63 | 0.2447 | Medium | Danisa biscuits!D15; Danisa biscuits!E15 |
| honey | 700 | 875 | 0.1709 | Medium | Danisa biscuits!D16; Danisa biscuits!E16 |
| Butter | 500 | 631.58 | 0.1234 | Normal | Danisa biscuits!D6; Danisa biscuits!E6 |
| Milk | 250 | 292.5 | 0.0571 | Normal | Danisa biscuits!D8; Danisa biscuits!E8 |
| egg | 200 | 266.67 | 0.0521 | Normal | Danisa biscuits!D9; Danisa biscuits!E9 |
| sugar | 300 | 192 | 0.0375 | Normal | Danisa biscuits!D7; Danisa biscuits!E7 |
| EDC | 50 | 150 | 0.0293 | Normal | Danisa biscuits!D17; Danisa biscuits!E17 |
| improver | 40 | 112 | 0.0219 | Normal | Danisa biscuits!D11; Danisa biscuits!E11 |
| yeast | 25 | 70 | 0.0137 | Normal | Danisa biscuits!D12; Danisa biscuits!E12 |
| baking powder | 27 | 8.78 | 0.0017 | Normal | Danisa biscuits!D14; Danisa biscuits!E14 |
| salt | 35 | 7.19 | 0.0014 | Normal | Danisa biscuits!D10; Danisa biscuits!E10 |
| water | 1200 | 0.12 | 0 | Normal | Danisa biscuits!D13; Danisa biscuits!E13 |
| Portion | Price | COGS | Gross Profit | GM % | Food Cost % | Target Price | Price Gap | Max Weight | Break-even Units | Source |
| 850 | 1000 | 619.14 | 380.86 | 0.3809 | 0.6191 | 1768.97 | 768.97 | 480.51 | 5.12 | Danisa biscuits!B23; Danisa biscuits!C23 |
| 140 | 200 | 101.98 | 98.02 | 0.4901 | 0.5099 | 291.36 | 91.36 | 96.1 | 25.59 | Danisa biscuits!B24; Danisa biscuits!C24 |
| 700 | 1000 | 509.88 | 490.12 | 0.4901 | 0.5099 | 1456.8 | 456.8 | 480.51 | 5.12 | Danisa biscuits!B25; Danisa biscuits!C25 |
| Portion | Key Ingredient | GM after +10% | GM after +25% | Action |
| 850 | flour | 0.3656 | 0.3428 | Raise price immediately |
| 140 | flour | 0.4776 | 0.4587 | Raise price immediately |
| 700 | flour | 0.4776 | 0.4587 | Raise price immediately |
| Standard Production Method | Template step |
| Assumption | Validate process, times, temperatures, and proof/bake/fry controls with production team |
| Step | Mix dough until uniform; avoid overworking after flour addition. |
| Step | Bake/fry to house standard, cool fully, then pack by weight or count. |
| Step | Track broken pieces, trim, and underweight packs. |
## Sheet: Okinawa
| Okinawa |
| --- |
| Recipe card, costing, target price, sensitivity, and action checklist |
| Field | Value | Source / note |
| Category | biscuit/sweet | Inferred from recipe name |
| Base Batch Mass | 7400 | Okinawa!D5 + Okinawa!D6 + Okinawa!D7 + Okinawa!D8 + Okinawa!D9 + Okinawa!D10 + Okinawa!D11 |
| Base Ingredient Cost | 4433.91 | Okinawa!E5 + Okinawa!E6 + Okinawa!E7 + Okinawa!E8 + Okinawa!E9 + Okinawa!E10 + Okinawa!E11 |
| Recommended Action | Reprice | Raise worst SKU to target price or reduce portion to 58.41g for 65% GM. |
| Top-2 Ingredient Share | 0.7961 | Base ingredient cost rows |
| Highest-Cost Ingredient | flour (2310) | Okinawa!E5 |
| Missing COGS Fields | labor, packaging, overhead, actual yield, waste, daily volume | Complete before treating COGS as final |
| Ingredient | Qty | Cost | % Cost | Risk | Source |
| flour | 5500 | 2310 | 0.521 | High | Okinawa!D5; Okinawa!E5 |
| frying oil | 1000 | 1220 | 0.2752 | Medium | Okinawa!D11; Okinawa!E11 |
| sugar | 500 | 320 | 0.0722 | Normal | Okinawa!D7; Okinawa!E7 |
| baking powder | 100 | 260 | 0.0586 | Normal | Okinawa!D6; Okinawa!E6 |
| egg | 200 | 252.63 | 0.057 | Normal | Okinawa!D8; Okinawa!E8 |
| oil | 50 | 61 | 0.0138 | Normal | Okinawa!D10; Okinawa!E10 |
| salt | 50 | 10.28 | 0.0023 | Normal | Okinawa!D9; Okinawa!E9 |
| Portion | Price | COGS | Gross Profit | GM % | Food Cost % | Target Price | Price Gap | Max Weight | Break-even Units | Source |
| 80 | 100 | 47.93 | 52.07 | 0.5207 | 0.4793 | 136.95 | 36.95 | 58.41 | 44.34 | Okinawa!B16; Okinawa!C16 |
| 80 | 100 | 47.93 | 52.07 | 0.5207 | 0.4793 | 136.95 | 36.95 | 58.41 | 44.34 | Okinawa!B17; Okinawa!C17 |
| 150 | 500 | 89.88 | 410.12 | 0.8202 | 0.1798 | 256.79 | -243.21 | 292.07 | 8.87 | Okinawa!B18; Okinawa!C18 |
| Portion | Key Ingredient | GM after +10% | GM after +25% | Action |
| 80 | flour | 0.4957 | 0.4582 | Raise price immediately |
| 80 | flour | 0.4957 | 0.4582 | Raise price immediately |
| 150 | flour | 0.8109 | 0.7968 | Monitor / absorb short term |
| Standard Production Method | Template step |
| Assumption | Validate process, times, temperatures, and proof/bake/fry controls with production team |
| Step | Mix dough until uniform; avoid overworking after flour addition. |
| Step | Bake/fry to house standard, cool fully, then pack by weight or count. |
| Step | Track broken pieces, trim, and underweight packs. |
## Sheet: CAKE NOW
| CAKE NOW |
| --- |
| Recipe card, costing, target price, sensitivity, and action checklist |
| Field | Value | Source / note |
| Category | cake/gateau | Inferred from recipe name |
| Base Batch Mass | 7100 | CAKE NOW!D5 + CAKE NOW!D6 + CAKE NOW!D7 + CAKE NOW!D9 + CAKE NOW!D10 |
| Base Ingredient Cost | 6138.07 | CAKE NOW!E5 + CAKE NOW!E6 + CAKE NOW!E7 + CAKE NOW!E9 + CAKE NOW!E10 |
| Recommended Action | Reprice | Raise worst SKU to target price or reduce portion to 40.49g for 65% GM. |
| Top-2 Ingredient Share | 0.6481 | Base ingredient cost rows |
| Highest-Cost Ingredient | Egg (2083.33) | CAKE NOW!E7 |
| Missing COGS Fields | labor, packaging, overhead, actual yield, waste, daily volume | Complete before treating COGS as final |
| Ingredient | Qty | Cost | % Cost | Risk | Source |
| Egg | 1500 | 2083.33 | 0.3394 | High | CAKE NOW!D7; CAKE NOW!E7 |
| Butter | 1500 | 1894.74 | 0.3087 | High | CAKE NOW!D9; CAKE NOW!E9 |
| flour | 3000 | 1260 | 0.2053 | Medium | CAKE NOW!D5; CAKE NOW!E5 |
| sugar | 1000 | 640 | 0.1043 | Normal | CAKE NOW!D10; CAKE NOW!E10 |
| baking powder | 100 | 260 | 0.0424 | Normal | CAKE NOW!D6; CAKE NOW!E6 |
| water |  |  |  | Normal | CAKE NOW!D8; CAKE NOW!E8 |
| Portion | Price | COGS | Gross Profit | GM % | Food Cost % | Target Price | Price Gap | Max Weight | Break-even Units | Source |
| 220 | 500 | 190.19 | 309.81 | 0.6196 | 0.3804 | 543.41 | 43.41 | 202.43 | 12.28 | CAKE NOW!B17; CAKE NOW!C17 |
| 60 | 100 | 51.87 | 48.13 | 0.4813 | 0.5187 | 148.2 | 48.2 | 40.49 | 61.38 | CAKE NOW!B18; CAKE NOW!C18 |
| Portion | Key Ingredient | GM after +10% | GM after +25% | Action |
| 220 | Egg | 0.6067 | 0.5873 | Monitor / absorb short term |
| 60 | Egg | 0.4637 | 0.4373 | Raise price immediately |
| Standard Production Method | Template step |
| Assumption | Validate process, times, temperatures, and proof/bake/fry controls with production team |
| Step | Cream fat and sugar or use house cake method; add eggs/liquids slowly. |
| Step | Fold dry ingredients gently, portion by weight, bake until set, cool fully. |
| Step | Track batter weight, baked weight, trim, and final saleable pieces. |
## Sheet: Short bread
| Short bread |
| --- |
| Recipe card, costing, target price, sensitivity, and action checklist |
| Field | Value | Source / note |
| Category | biscuit/sweet | Inferred from recipe name |
| Base Batch Mass | 3950 | Short bread!D5 + Short bread!D6 + Short bread!D7 + Short bread!D8 + Short bread!D9 + Short bread!D10 + Short bread!D11 |
| Base Ingredient Cost | 2982.88 | Short bread!E5 + Short bread!E6 + Short bread!E7 + Short bread!E8 + Short bread!E9 + Short bread!E10 + Short bread!E11 |
| Recommended Action | Reformulate + reprice | Worst SKU is 32.0% GM and top-2 ingredients drive 70.5% of base cost. |
| Top-2 Ingredient Share | 0.7051 | Base ingredient cost rows |
| Highest-Cost Ingredient | Butter (1263.16) | Short bread!E6 |
| Missing COGS Fields | labor, packaging, overhead, actual yield, waste, daily volume | Complete before treating COGS as final |
| Ingredient | Qty | Cost | % Cost | Risk | Source |
| Butter | 1000 | 1263.16 | 0.4235 | High | Short bread!D6; Short bread!E6 |
| flour | 2000 | 840 | 0.2816 | Medium | Short bread!D5; Short bread!E5 |
| sugar | 400 | 256 | 0.0858 | Normal | Short bread!D10; Short bread!E10 |
| milk | 200 | 234 | 0.0784 | Normal | Short bread!D9; Short bread!E9 |
| icing sugar | 100 | 220 | 0.0738 | Normal | Short bread!D7; Short bread!E7 |
| egg | 100 | 138.89 | 0.0466 | Normal | Short bread!D8; Short bread!E8 |
| salt | 150 | 30.83 | 0.0103 | Normal | Short bread!D11; Short bread!E11 |
| Portion | Price | COGS | Gross Profit | GM % | Food Cost % | Target Price | Price Gap | Max Weight | Break-even Units | Source |
| 38 | 50 | 28.7 | 21.3 | 0.4261 | 0.5739 | 81.99 | 31.99 | 23.17 | 59.66 | Short bread!B17; Short bread!C17 |
| 45 | 50 | 33.98 | 16.02 | 0.3204 | 0.6796 | 97.09 | 47.09 | 23.17 | 59.66 | Short bread!B18; Short bread!C18 |
| Portion | Key Ingredient | GM after +10% | GM after +25% | Action |
| 38 | Butter | 0.4018 | 0.3653 | Raise price immediately |
| 45 | Butter | 0.2916 | 0.2484 | Raise price immediately |
| Standard Production Method | Template step |
| Assumption | Validate process, times, temperatures, and proof/bake/fry controls with production team |
| Step | Mix dough until uniform; avoid overworking after flour addition. |
| Step | Bake/fry to house standard, cool fully, then pack by weight or count. |
| Step | Track broken pieces, trim, and underweight packs. |
## Sheet: Melto
| Melto |
| --- |
| Recipe card, costing, target price, sensitivity, and action checklist |
| Field | Value | Source / note |
| Category | biscuit/sweet | Inferred from recipe name |
| Base Batch Mass | 7490 | Melto!D5 + Melto!D6 + Melto!D7 + Melto!D8 + Melto!D9 + Melto!D10 |
| Base Ingredient Cost | 5768.87 | Melto!E5 + Melto!E6 + Melto!E7 + Melto!E8 + Melto!E9 + Melto!E10 |
| Recommended Action | Reformulate + reprice | Worst SKU is 30.7% GM and top-2 ingredients drive 76.6% of base cost. |
| Top-2 Ingredient Share | 0.7655 | Base ingredient cost rows |
| Highest-Cost Ingredient | Butter (2526.32) | Melto!E6 |
| Missing COGS Fields | labor, packaging, overhead, actual yield, waste, daily volume | Complete before treating COGS as final |
| Ingredient | Qty | Cost | % Cost | Risk | Source |
| Butter | 2000 | 2526.32 | 0.4379 | High | Melto!D6; Melto!E6 |
| flour | 4500 | 1890 | 0.3276 | High | Melto!D5; Melto!E5 |
| icing sugar | 400 | 880 | 0.1525 | Medium | Melto!D7; Melto!E7 |
| sugar | 400 | 256 | 0.0444 | Normal | Melto!D9; Melto!E9 |
| egg | 150 | 208.33 | 0.0361 | Normal | Melto!D8; Melto!E8 |
| salt | 40 | 8.22 | 0.0014 | Normal | Melto!D10; Melto!E10 |
| Portion | Price | COGS | Gross Profit | GM % | Food Cost % | Target Price | Price Gap | Max Weight | Break-even Units | Source |
| 34 | 50 | 26.19 | 23.81 | 0.4763 | 0.5237 | 74.82 | 24.82 | 22.72 | 115.38 | Melto!B16; Melto!C16 |
| 45 | 50 | 34.66 | 15.34 | 0.3068 | 0.6932 | 99.03 | 49.03 | 22.72 | 115.38 | Melto!B17; Melto!C17 |
| Portion | Key Ingredient | GM after +10% | GM after +25% | Action |
| 34 | Butter | 0.4533 | 0.4189 | Raise price immediately |
| 45 | Butter | 0.2765 | 0.2309 | Raise price immediately |
| Standard Production Method | Template step |
| Assumption | Validate process, times, temperatures, and proof/bake/fry controls with production team |
| Step | Mix dough until uniform; avoid overworking after flour addition. |
| Step | Bake/fry to house standard, cool fully, then pack by weight or count. |
| Step | Track broken pieces, trim, and underweight packs. |
## Sheet: Ice Cream
| Ice Cream |
| --- |
| Recipe card, costing, target price, sensitivity, and action checklist |
| Field | Value | Source / note |
| Category | ice cream | Inferred from recipe name |
| Base Batch Mass | 15500 | Ice Cream!D5 + Ice Cream!D6 + Ice Cream!D7 + Ice Cream!D8 + Ice Cream!D9 |
| Base Ingredient Cost | 9360 | Ice Cream!E5 + Ice Cream!E6 + Ice Cream!E7 + Ice Cream!E8 + Ice Cream!E9 |
| Recommended Action | Reprice | Raise worst SKU to target price or reduce portion to 28.98g for 65% GM. |
| Top-2 Ingredient Share | 0.6496 | Base ingredient cost rows |
| Highest-Cost Ingredient | Powdered Milk (3520) | Ice Cream!E6 |
| Missing COGS Fields | labor, packaging, overhead, actual yield, waste, daily volume | Complete before treating COGS as final |
| Ingredient | Qty | Cost | % Cost | Risk | Source |
| Powdered Milk | 1100 | 3520 | 0.3761 | High | Ice Cream!D6; Ice Cream!E6 |
| Stabilizer | 200 | 2560 | 0.2735 | Medium | Ice Cream!D5; Ice Cream!E5 |
| others | 200 | 2000 | 0.2137 | Medium | Ice Cream!D9; Ice Cream!E9 |
| Sugar | 2000 | 1280 | 0.1368 | Normal | Ice Cream!D7; Ice Cream!E7 |
| Water | 12000 | 0 | 0 | Normal | Ice Cream!D8; Ice Cream!E8 |
| Portion | Price | COGS | Gross Profit | GM % | Food Cost % | Target Price | Price Gap | Max Weight | Break-even Units | Source |
| 70 | 100 | 42.27 | 57.73 | 0.5773 | 0.4227 | 120.77 | 20.77 | 57.96 | 93.6 | Ice Cream!B14; Ice Cream!C14 |
| 45 | 50 | 27.17 | 22.83 | 0.4565 | 0.5435 | 77.64 | 27.64 | 28.98 | 187.2 | Ice Cream!B15; Ice Cream!C15 |
| Portion | Key Ingredient | GM after +10% | GM after +25% | Action |
| 70 | Powdered Milk | 0.5614 | 0.5375 | Monitor / absorb short term |
| 45 | Powdered Milk | 0.4361 | 0.4054 | Raise price immediately |
| Standard Production Method | Template step |
| Assumption | Validate process, times, temperatures, and proof/bake/fry controls with production team |
| Step | Confirm recipe units, freezing loss, and churn yield before production. |
| Step | Batch, freeze/churn by house process, then measure final saleable volume/weight. |
| Step | Track container loss and temperature-related shrink. |
## Sheet: Melto1
| Melto1 |
| --- |
| Recipe card, costing, target price, sensitivity, and action checklist |
| Field | Value | Source / note |
| Category | biscuit/sweet | Inferred from recipe name |
| Base Batch Mass | 7540 | Melto1!D5 + Melto1!D6 + Melto1!D7 + Melto1!D8 + Melto1!D9 + Melto1!D10 |
| Base Ingredient Cost | 5682.32 | Melto1!E5 + Melto1!E6 + Melto1!E7 + Melto1!E8 + Melto1!E9 + Melto1!E10 |
| Recommended Action | Reformulate + reprice | Worst SKU is 32.2% GM and top-2 ingredients drive 77.7% of base cost. |
| Top-2 Ingredient Share | 0.7772 | Base ingredient cost rows |
| Highest-Cost Ingredient | Butter (2526.32) | Melto1!E6 |
| Missing COGS Fields | labor, packaging, overhead, actual yield, waste, daily volume | Complete before treating COGS as final |
| Ingredient | Qty | Cost | % Cost | Risk | Source |
| Butter | 2000 | 2526.32 | 0.4446 | High | Melto1!D6; Melto1!E6 |
| flour | 4500 | 1890 | 0.3326 | High | Melto1!D5; Melto1!E5 |
| icing sugar | 300 | 660 | 0.1161 | Normal | Melto1!D7; Melto1!E7 |
| sugar | 500 | 320 | 0.0563 | Normal | Melto1!D9; Melto1!E9 |
| egg | 200 | 277.78 | 0.0489 | Normal | Melto1!D8; Melto1!E8 |
| salt | 40 | 8.22 | 0.0014 | Normal | Melto1!D10; Melto1!E10 |
| Portion | Price | COGS | Gross Profit | GM % | Food Cost % | Target Price | Price Gap | Max Weight | Break-even Units | Source |
| 35 | 50 | 26.38 | 23.62 | 0.4725 | 0.5275 | 75.36 | 25.36 | 23.22 | 113.65 | Melto1!B16; Melto1!C16 |
| 45 | 50 | 33.91 | 16.09 | 0.3217 | 0.6783 | 96.89 | 46.89 | 23.22 | 113.65 | Melto1!B17; Melto1!C17 |
| Portion | Key Ingredient | GM after +10% | GM after +25% | Action |
| 35 | Butter | 0.449 | 0.4138 | Raise price immediately |
| 45 | Butter | 0.2916 | 0.2464 | Raise price immediately |
| Standard Production Method | Template step |
| Assumption | Validate process, times, temperatures, and proof/bake/fry controls with production team |
| Step | Mix dough until uniform; avoid overworking after flour addition. |
| Step | Bake/fry to house standard, cool fully, then pack by weight or count. |
| Step | Track broken pieces, trim, and underweight packs. |
## Sheet: Zebree
| Zebree |
| --- |
| Recipe card, costing, target price, sensitivity, and action checklist |
| Field | Value | Source / note |
| Category | biscuit/sweet | Inferred from recipe name |
| Base Batch Mass | 18505 | Zebree!D5 + Zebree!D6 + Zebree!D7 + Zebree!D8 + Zebree!D9 + Zebree!D10 + Zebree!D11 + Zebree!D12 + Zebree!D13 + Zebree!D14 + Zebree!D15 + Zebree!D16 |
| Base Ingredient Cost | 10406.22 | Zebree!E5 + Zebree!E6 + Zebree!E7 + Zebree!E8 + Zebree!E9 + Zebree!E10 + Zebree!E11 + Zebree!E12 + Zebree!E13 + Zebree!E14 + Zebree!E15 + Zebree!E16 |
| Recommended Action | Reprice | Raise worst SKU to target price or reduce portion to 155.60g for 65% GM. |
| Top-2 Ingredient Share | 0.5756 | Base ingredient cost rows |
| Highest-Cost Ingredient | flour (4200) | Zebree!E5 |
| Missing COGS Fields | labor, packaging, overhead, actual yield, waste, daily volume | Complete before treating COGS as final |
| Ingredient | Qty | Cost | % Cost | Risk | Source |
| flour | 10000 | 4200 | 0.4036 | High | Zebree!D5; Zebree!E5 |
| Chocolate | 1000 | 1789.47 | 0.172 | Medium | Zebree!D16; Zebree!E16 |
| Butter | 1000 | 1263.16 | 0.1214 | Normal | Zebree!D6; Zebree!E6 |
| egg | 750 | 1000 | 0.0961 | Normal | Zebree!D9; Zebree!E9 |
| Milk | 800 | 936 | 0.0899 | Normal | Zebree!D8; Zebree!E8 |
| sugar | 1000 | 640 | 0.0615 | Normal | Zebree!D7; Zebree!E7 |
| improver | 100 | 280 | 0.0269 | Normal | Zebree!D11; Zebree!E11 |
| yeast | 85 | 238 | 0.0229 | Normal | Zebree!D12; Zebree!E12 |
| baking powder | 85 | 27.63 | 0.0027 | Normal | Zebree!D14; Zebree!E14 |
| salt | 110 | 22.61 | 0.0022 | Normal | Zebree!D10; Zebree!E10 |
| EDC | 75 | 9 | 0.0009 | Normal | Zebree!D15; Zebree!E15 |
| water | 3500 | 0.35 | 0 | Normal | Zebree!D13; Zebree!E13 |
| Portion | Price | COGS | Gross Profit | GM % | Food Cost % | Target Price | Price Gap | Max Weight | Break-even Units | Source |
| 370 | 500 | 208.07 | 291.93 | 0.5839 | 0.4161 | 594.48 | 94.48 | 311.2 | 20.81 | Zebree!B22; Zebree!C22 |
| 190 | 250 | 106.85 | 143.15 | 0.5726 | 0.4274 | 305.27 | 55.27 | 155.6 | 41.62 | Zebree!B23; Zebree!C23 |
| 700 | 1000 | 393.64 | 606.36 | 0.6064 | 0.3936 | 1124.69 | 124.69 | 622.39 | 10.41 | Zebree!B24; Zebree!C24 |
| Portion | Key Ingredient | GM after +10% | GM after +25% | Action |
| 370 | flour | 0.5671 | 0.5419 | Monitor / absorb short term |
| 190 | flour | 0.5554 | 0.5295 | Monitor / absorb short term |
| 700 | flour | 0.5905 | 0.5666 | Monitor / absorb short term |
| Standard Production Method | Template step |
| Assumption | Validate process, times, temperatures, and proof/bake/fry controls with production team |
| Step | Mix dough until uniform; avoid overworking after flour addition. |
| Step | Bake/fry to house standard, cool fully, then pack by weight or count. |
| Step | Track broken pieces, trim, and underweight packs. |
## Sheet: Croissant
| Croissant |
| --- |
| Recipe card, costing, target price, sensitivity, and action checklist |
| Field | Value | Source / note |
| Category | pastry/savory | Inferred from recipe name |
| Base Batch Mass | 6590 | Croissant!D5 + Croissant!D6 + Croissant!D7 + Croissant!D8 + Croissant!D9 + Croissant!D10 + Croissant!D11 + Croissant!D12 |
| Base Ingredient Cost | 3070.41 | Croissant!E5 + Croissant!E6 + Croissant!E7 + Croissant!E8 + Croissant!E9 + Croissant!E10 + Croissant!E11 + Croissant!E12 |
| Recommended Action | Reprice | Raise worst SKU to target price or reduce portion to 187.80g for 65% GM. |
| Top-2 Ingredient Share | 0.8354 | Base ingredient cost rows |
| Highest-Cost Ingredient | flour (1302) | Croissant!E5 |
| Missing COGS Fields | labor, packaging, overhead, actual yield, waste, daily volume | Complete before treating COGS as final |
| Ingredient | Qty | Cost | % Cost | Risk | Source |
| flour | 3100 | 1302 | 0.424 | High | Croissant!D5; Croissant!E5 |
| Butter | 1000 | 1263.16 | 0.4114 | High | Croissant!D6; Croissant!E6 |
| sugar | 300 | 192 | 0.0625 | Normal | Croissant!D7; Croissant!E7 |
| egg | 100 | 138.89 | 0.0452 | Normal | Croissant!D9; Croissant!E9 |
| improver | 30 | 84 | 0.0274 | Normal | Croissant!D10; Croissant!E10 |
| yeast | 30 | 84 | 0.0274 | Normal | Croissant!D11; Croissant!E11 |
| salt | 30 | 6.17 | 0.002 | Normal | Croissant!D8; Croissant!E8 |
| water | 2000 | 0.2 | 0.0001 | Normal | Croissant!D12; Croissant!E12 |
| Portion | Price | COGS | Gross Profit | GM % | Food Cost % | Target Price | Price Gap | Max Weight | Break-even Units | Source |
| 45 | 100 | 20.97 | 79.03 | 0.7903 | 0.2097 | 59.9 | -40.1 | 75.12 | 30.7 | Croissant!B18; Croissant!C18 |
| 190 | 250 | 88.52 | 161.48 | 0.6459 | 0.3541 | 252.93 | 2.93 | 187.8 | 12.28 | Croissant!B19; Croissant!C19 |
| 700 | 1000 | 326.14 | 673.86 | 0.6739 | 0.3261 | 931.84 | -68.16 | 751.2 | 3.07 | Croissant!B20; Croissant!C20 |
| Portion | Key Ingredient | GM after +10% | GM after +25% | Action |
| 45 | flour | 0.7814 | 0.7681 | Monitor / absorb short term |
| 190 | flour | 0.6309 | 0.6084 | Monitor / absorb short term |
| 700 | flour | 0.66 | 0.6393 | Monitor / absorb short term |
| Standard Production Method | Template step |
| Assumption | Validate process, times, temperatures, and proof/bake/fry controls with production team |
| Step | Prepare dough and filling separately; weigh filling per piece. |
| Step | Seal, proof/rest where required, bake/fry, cool, and count intact saleable pieces. |
| Step | Track filling waste and broken/leaking pieces. |
## Sheet: Universal bread
| Universal bread |
| --- |
| Recipe card, costing, target price, sensitivity, and action checklist |
| Field | Value | Source / note |
| Category | bread | Inferred from recipe name |
| Base Batch Mass | 50170 | Universal bread!D5 + Universal bread!D6 + Universal bread!D7 + Universal bread!D8 + Universal bread!D9 + Universal bread!D10 + Universal bread!D11 + Universal bread!D12 + Universal bread!D13 + Universal bread!D14 + Universal bread!D15 |
| Base Ingredient Cost | 27727.7 | Universal bread!E5 + Universal bread!E6 + Universal bread!E7 + Universal bread!E8 + Universal bread!E9 + Universal bread!E10 + Universal bread!E11 + Universal bread!E12 + Universal bread!E13 + Universal bread!E14 + Universal bread!E15 |
| Recommended Action | Reprice | Raise worst SKU to target price or reduce portion to 63.33g for 65% GM. |
| Top-2 Ingredient Share | 0.7898 | Base ingredient cost rows |
| Highest-Cost Ingredient | frying oil (10980) | Universal bread!E15 |
| Missing COGS Fields | labor, packaging, overhead, actual yield, waste, daily volume | Complete before treating COGS as final |
| Ingredient | Qty | Cost | % Cost | Risk | Source |
| frying oil | 9000 | 10980 | 0.396 | High | Universal bread!D15; Universal bread!E15 |
| flour | 26000 | 10920 | 0.3938 | High | Universal bread!D5; Universal bread!E5 |
| Butter | 1400 | 1768.42 | 0.0638 | Normal | Universal bread!D6; Universal bread!E6 |
| sugar | 1700 | 1088 | 0.0392 | Normal | Universal bread!D7; Universal bread!E7 |
| Conc Milk | 800 | 936 | 0.0338 | Normal | Universal bread!D8; Universal bread!E8 |
| egg | 500 | 666.67 | 0.024 | Normal | Universal bread!D9; Universal bread!E9 |
| yeast | 170 | 476 | 0.0172 | Normal | Universal bread!D12; Universal bread!E12 |
| baking powder | 180 | 468 | 0.0169 | Normal | Universal bread!D14; Universal bread!E14 |
| improver | 130 | 364 | 0.0131 | Normal | Universal bread!D11; Universal bread!E11 |
| salt | 290 | 59.61 | 0.0021 | Normal | Universal bread!D10; Universal bread!E10 |
| water | 10000 | 1 | 0 | Normal | Universal bread!D13; Universal bread!E13 |
| Portion | Price | COGS | Gross Profit | GM % | Food Cost % | Target Price | Price Gap | Max Weight | Break-even Units | Source |
| 81.4 | 100 | 44.99 | 55.01 | 0.5501 | 0.4499 | 128.54 | 28.54 | 63.33 | 277.28 | Universal bread!B20; Universal bread!C20 |
| 90 | 100 | 49.74 | 50.26 | 0.5026 | 0.4974 | 142.12 | 42.12 | 63.33 | 277.28 | Universal bread!B21; Universal bread!C21 |
| 90 | 100 | 49.74 | 50.26 | 0.5026 | 0.4974 | 142.12 | 42.12 | 63.33 | 277.28 | Universal bread!B22; Universal bread!C22 |
| 900 | 1000 | 497.41 | 502.59 | 0.5026 | 0.4974 | 1421.16 | 421.16 | 633.28 | 27.73 | Universal bread!B23; Universal bread!C23 |
| Portion | Key Ingredient | GM after +10% | GM after +25% | Action |
| 81.4 | frying oil | 0.5323 | 0.5056 | Monitor / absorb short term |
| 90 | frying oil | 0.4829 | 0.4534 | Raise price immediately |
| 90 | frying oil | 0.4829 | 0.4534 | Raise price immediately |
| 900 | frying oil | 0.4829 | 0.4534 | Raise price immediately |
| Standard Production Method | Template step |
| Assumption | Validate process, times, temperatures, and proof/bake/fry controls with production team |
| Step | Scale ingredients exactly; separate flour, yeast, salt, sugar, fat, and improver until mixing. |
| Step | Mix dry ingredients, add liquids gradually, develop dough until smooth and elastic. |
| Step | Bulk ferment, divide by target weight, round, rest, shape, proof, bake, cool fully, then package. |
## Sheet: Sheet3
| Sheet3 |
| --- |
| Recipe card, costing, target price, sensitivity, and action checklist |
| Field | Value | Source / note |
| Category | other | Inferred from recipe name |
| Base Batch Mass | 19250 | Sheet3!D5 + Sheet3!D6 + Sheet3!D7 + Sheet3!D8 + Sheet3!D9 + Sheet3!D10 + Sheet3!D11 + Sheet3!D12 + Sheet3!D13 + Sheet3!D14 + Sheet3!D15 |
| Base Ingredient Cost | 9161.49 | Sheet3!E5 + Sheet3!E6 + Sheet3!E7 + Sheet3!E8 + Sheet3!E9 + Sheet3!E10 + Sheet3!E11 + Sheet3!E12 + Sheet3!E13 + Sheet3!E14 + Sheet3!E15 |
| Recommended Action | Reprice | Raise worst SKU to target price or reduce portion to 91.93g for 65% GM. |
| Top-2 Ingredient Share | 0.5745 | Base ingredient cost rows |
| Highest-Cost Ingredient | flour (4000) | Sheet3!E5 |
| Missing COGS Fields | labor, packaging, overhead, actual yield, waste, daily volume | Complete before treating COGS as final |
| Ingredient | Qty | Cost | % Cost | Risk | Source |
| flour | 10000 | 4000 | 0.4366 | High | Sheet3!D5; Sheet3!E5 |
| Butter | 1000 | 1263.16 | 0.1379 | Normal | Sheet3!D6; Sheet3!E6 |
| Milk | 850 | 994.5 | 0.1086 | Normal | Sheet3!D8; Sheet3!E8 |
| egg | 500 | 666.67 | 0.0728 | Normal | Sheet3!D9; Sheet3!E9 |
| sugar | 1000 | 640 | 0.0699 | Normal | Sheet3!D7; Sheet3!E7 |
| Oil | 400 | 488 | 0.0533 | Normal | Sheet3!D14; Sheet3!E14 |
| yeast | 160 | 448 | 0.0489 | Normal | Sheet3!D12; Sheet3!E12 |
| improver | 120 | 336 | 0.0367 | Normal | Sheet3!D11; Sheet3!E11 |
| EDC | 100 | 300 | 0.0327 | Normal | Sheet3!D15; Sheet3!E15 |
| salt | 120 | 24.67 | 0.0027 | Normal | Sheet3!D10; Sheet3!E10 |
| water | 5000 | 0.5 | 0.0001 | Normal | Sheet3!D13; Sheet3!E13 |
| Portion | Price | COGS | Gross Profit | GM % | Food Cost % | Target Price | Price Gap | Max Weight | Break-even Units | Source |
| 144 | 125 | 68.53 | 56.47 | 0.4517 | 0.5483 | 195.81 | 70.81 | 91.93 | 73.29 | Sheet3!B21; Sheet3!C21 |
| 500 | 500 | 237.96 | 262.04 | 0.5241 | 0.4759 | 679.89 | 179.89 | 367.71 | 18.32 | Sheet3!B22; Sheet3!C22 |
| 139 | 150 | 66.15 | 83.85 | 0.559 | 0.441 | 189.01 | 39.01 | 110.31 | 61.08 | Sheet3!B23; Sheet3!C23 |
| Portion | Key Ingredient | GM after +10% | GM after +25% | Action |
| 144 | flour | 0.4278 | 0.3919 | Raise price immediately |
| 500 | flour | 0.5033 | 0.4721 | Raise price immediately |
| 139 | flour | 0.5397 | 0.5108 | Monitor / absorb short term |
| Standard Production Method | Template step |
| Assumption | Validate process, times, temperatures, and proof/bake/fry controls with production team |
| Step | Add house method steps, temperatures, times, and yield checkpoints. |