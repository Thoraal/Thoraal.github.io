// Se ejecuta durante la actualización del sitio. El token sólo se envía a Banxico.
import { readFile, writeFile } from 'node:fs/promises';

const file = process.argv[2];
const token = process.env.BANXICO_TOKEN;
if (!file || !token) throw new Error('Se requieren la ruta del historial y BANXICO_TOKEN.');
const previous = JSON.parse(await readFile(file, 'utf8'));
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City',
  year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const start = new Date(previous.hasta + 'T00:00:00Z');
start.setUTCDate(start.getUTCDate() - 30);
const from = start.toISOString().slice(0, 10);
const url = 'https://www.banxico.org.mx/SieAPIRest/service/v1/series/SF60653/datos/' + from + '/' + today + '/';
const response = await fetch(url, { headers: { 'Bmx-Token': token }, redirect: 'error', signal: AbortSignal.timeout(30000) });
if (!response.ok) throw new Error('Banxico respondió con estado ' + response.status);
const series = (await response.json()).bmx?.series?.find(s => s.idSerie === 'SF60653');
if (!series?.datos?.length) throw new Error('Banxico devolvió una serie vacía.');
const tasas = { ...previous.tasas };
for (const { fecha, dato } of series.datos) {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(fecha)) throw new Error('Fecha inesperada');
  const date = fecha.split('/').reverse().join('-');
  if (date < from || date > today) throw new Error('Fecha fuera del intervalo solicitado');
  if (dato === 'N/E' || dato === 'N/D') { delete tasas[date]; continue; }
  if (!/^\d+(\.\d+)?$/.test(dato) || !(Number(dato) > 0)) throw new Error('Tasa inesperada');
  tasas[date] = dato;
}
const dates = Object.keys(tasas).sort();
const result = { serie: 'SF60653', desde: dates[0], hasta: dates.at(-1),
  tasas: Object.fromEntries(dates.map(date => [date, tasas[date]])) };
await writeFile(file, JSON.stringify(result) + '\n');
