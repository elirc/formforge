# Sprint 14 bundle evidence

Local Vite production output after route splitting:

| Asset | Raw | Gzip |
| --- | ---: | ---: |
| Main JavaScript | 414.90 kB | 125.38 kB |
| Analytics route chunk | 3.95 kB | 1.03 kB |
| CSS | 19.99 kB | 4.86 kB |

The gate sums raw JavaScript and fails above 450 KiB; CSS fails above 30 KiB. The analytics module’s separate chunk proves the split boundary exists. These local build artifacts do not establish network latency, parse time, Core Web Vitals, or production cache behavior.
