// Merges hand-checked events from a JSON list into events.json, skipping duplicates.
// Usage: node scripts/add-events.mjs <new-events.json>
import { readFileSync, writeFileSync } from 'node:fs';

const feed = JSON.parse(readFileSync('events.json', 'utf8'));
const extra = JSON.parse(readFileSync(process.argv[2], 'utf8'));

const slug = (s) => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const key = (e) => `${e.city}|${e.date}|${slug(e.title).slice(0, 14)}`;
const seen = new Set(feed.events.map(key));
const ids = new Set(feed.events.map((e) => e.id));

let added = 0;
for (const e of extra) {
  const ev = {
    id: `${slug(e.city)}-${e.date}-${slug(e.title)}`.slice(0, 80),
    city: e.city,
    date: e.date,
    start: e.start ?? null,
    end: e.end ?? null,
    title: e.title,
    venue: e.venue,
    address: e.address ?? null,
    price: e.price ?? null,
    tags: e.tags,
    description: e.description,
    descriptionEn: e.descriptionEn,
    url: e.url,
    recurring: e.recurring ?? false,
    confidence: e.recurring ? 'medium' : 'high',
    community: e.community ?? false,
  };
  if (seen.has(key(ev)) || ids.has(ev.id)) continue;
  seen.add(key(ev));
  ids.add(ev.id);
  feed.events.push(ev);
  added++;
}

feed.events.sort((a, b) => a.date.localeCompare(b.date) || (a.start ?? '99').localeCompare(b.start ?? '99'));
writeFileSync('events.json', JSON.stringify(feed, null, 2) + '\n');
console.log('added', added, 'total', feed.events.length);
