// Validates events.json against the shape the kweer app reads. Exits 1 on any problem.
import { readFileSync } from 'node:fs';

const CITIES = ['Amsterdam', 'Utrecht', 'Rotterdam', 'Den Haag'];
const feed = JSON.parse(readFileSync(new URL('../events.json', import.meta.url), 'utf8'));
const errors = [];
const ids = new Set();

if (!/^\d{4}-\d{2}-\d{2}$/.test(feed.checkedAt ?? '')) errors.push('checkedAt must be YYYY-MM-DD');
if (!Array.isArray(feed.events)) errors.push('events must be an array');

for (const [i, e] of (feed.events ?? []).entries()) {
  const where = `events[${i}] (${e.id ?? 'no id'})`;
  if (typeof e.id !== 'string' || !/^[a-z0-9-]+$/.test(e.id)) errors.push(`${where}: id must be lowercase kebab-case`);
  if (ids.has(e.id)) errors.push(`${where}: duplicate id`);
  ids.add(e.id);
  if (!CITIES.includes(e.city)) errors.push(`${where}: city must be one of ${CITIES.join(', ')}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(e.date ?? '')) errors.push(`${where}: date must be YYYY-MM-DD`);
  for (const k of ['start', 'end']) {
    if (e[k] !== null && !/^\d{2}:\d{2}$/.test(e[k] ?? '')) errors.push(`${where}: ${k} must be HH:MM or null`);
  }
  for (const k of ['title', 'venue', 'description', 'url']) {
    if (typeof e[k] !== 'string' || !e[k].trim()) errors.push(`${where}: ${k} is required`);
  }
  if (typeof e.url === 'string' && !e.url.startsWith('https://')) errors.push(`${where}: url must be https`);
  for (const k of ['address', 'price']) {
    if (e[k] !== null && typeof e[k] !== 'string') errors.push(`${where}: ${k} must be string or null`);
  }
  if (!Array.isArray(e.tags) || e.tags.some((t) => typeof t !== 'string')) errors.push(`${where}: tags must be strings`);
  if (typeof e.recurring !== 'boolean') errors.push(`${where}: recurring must be boolean`);
  if (!['high', 'medium'].includes(e.confidence)) errors.push(`${where}: confidence must be high or medium`);
  if (typeof e.community !== 'boolean') errors.push(`${where}: community must be boolean`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
const perCity = Object.fromEntries(CITIES.map((c) => [c, feed.events.filter((e) => e.city === c).length]));
console.log(`OK: ${feed.events.length} events`, perCity);
