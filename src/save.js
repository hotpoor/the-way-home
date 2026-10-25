export const KEY = 'the-way-home.save.v1';
export function validate(s) {
  if (!s || s.version !== 1 || !Number.isFinite(s.x) || s.x < 70 || s.x > 1510 || !Number.isInteger(s.hits) || s.hits < 0 || s.hits > 3 || !Array.isArray(s.collected) || new Set(s.collected).size !== s.collected.length || s.collected.some(n => !Number.isInteger(n) || n < 0 || n > 2 || n >= s.hits) || typeof s.complete !== 'boolean' || (s.complete && s.collected.length !== 3)) throw new Error('这份存档格式不正确');
  return { version: 1, x: s.x, hits: s.hits, collected: [...s.collected], complete: s.complete, started: Boolean(s.started) };
}
export function fresh() { return { version: 1, x: 320, hits: 0, collected: [], complete: false, started: false }; }
export function read(storage) { try { const raw = storage.getItem(KEY); return raw ? validate(JSON.parse(raw)) : fresh(); } catch { return fresh(); } }
export function write(storage, state) { try { storage.setItem(KEY, JSON.stringify(validate(state))); return true; } catch { return false; } }
