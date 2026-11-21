// oz 버전 관리 — 구버전은 절대 지우지 않는다
//   node oz.js list               버전 목록
//   node oz.js save oz3 "메모"     지금 화면(루트)을 oz3 으로 고정 저장 (versions/oz3 + git 태그 oz3) 후 push
//   node oz.js restore oz2        oz2 로 원복 (원복 직전 화면도 자동 보관) 후 push
// 규칙: 같은 이름 덮어쓰기 금지 · versions/ 와 태그는 삭제 금지 · 원복도 "새 커밋"이라 이력은 그대로 남는다
const fs = require('fs'), path = require('path'), { execSync } = require('child_process');
const ROOT = __dirname, VER = path.join(ROOT, 'versions'), LIST = path.join(VER, 'versions.json');
const KEEP = new Set(['.git', 'versions', 'oz.js', 'README-버전관리.md', '.nojekyll', '.gitattributes']);
const git = c => execSync('git ' + c, { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim();
const list = () => fs.existsSync(LIST) ? JSON.parse(fs.readFileSync(LIST, 'utf8')) : [];
const siteFiles = dir => fs.readdirSync(dir).filter(f => !KEEP.has(f) && fs.statSync(path.join(dir, f)).isFile());
const now = () => new Date(Date.now() + 9 * 3600e3).toISOString().replace('T', ' ').slice(0, 16) + ' KST';

function writeIndex(L) {
  fs.writeFileSync(LIST, JSON.stringify(L, null, 2));
  const rows = L.map(v => `<tr><td><b>${v.name}</b></td><td>${v.date}</td><td>${v.note || ''}</td><td><a href="${v.name}/index.html">열기</a></td></tr>`).join('');
  fs.writeFileSync(path.join(VER, 'index.html'), `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>oz 버전 목록</title><style>body{font:16px/1.6 system-ui,sans-serif;margin:24px;color:#1F2A24;background:#FAF8F3}table{border-collapse:collapse;width:100%;max-width:820px}td,th{border-bottom:1px solid #ddd;padding:10px;text-align:left}a{color:#7A701C;font-weight:600}</style></head><body><h1>oz 버전 목록</h1><p>oz1 = 원래 사이트(olivezonemedical.ru) — 이 저장소에서는 바꾸지 않습니다. 아래는 리뉴얼 사이트의 고정 저장본이며 지우지 않습니다.</p><table><tr><th>이름</th><th>저장 시각</th><th>내용</th><th></th></tr>${rows}</table><p><a href="../index.html">지금 화면(oz2 주소)으로</a></p></body></html>`);
}
function save(name, note, push = true) {
  if (!/^oz\d+$|^auto_\d{8}_\d{4}$/.test(name)) throw new Error('이름은 oz3 처럼');
  const L = list();
  if (L.some(v => v.name === name) || fs.existsSync(path.join(VER, name))) throw new Error(name + ' 은(는) 이미 있습니다 — 덮어쓰지 않습니다');
  const dst = path.join(VER, name); fs.mkdirSync(dst, { recursive: true });
  for (const f of siteFiles(ROOT)) fs.copyFileSync(path.join(ROOT, f), path.join(dst, f));
  L.push({ name, date: now(), note: note || '' }); writeIndex(L);
  git('add -A'); git(`commit -q -m "버전 저장: ${name} ${note ? '— ' + note.replace(/"/g, "'") : ''}"`); git(`tag -a ${name} -m "${name}"`);
  if (push) { git('push -q origin main'); git(`push -q origin ${name}`); }
  return name;
}
function restore(name) {
  if (name === 'oz1') { console.log('oz1 은 원래 사이트(olivezonemedical.ru) 그 자체입니다. 이 저장소는 oz1 을 바꾸지 않으므로 원복할 것이 없습니다. 보관본: C:\\AI WORK\\dev\\olivezone-renewal\\archive\\oz1_20261121'); return; }
  const src = path.join(VER, name);
  if (!fs.existsSync(src)) throw new Error(name + ' 저장본이 없습니다. node oz.js list 로 확인');
  // 원복 직전 화면이 어떤 저장본과도 같지 않으면 자동 보관
  const cur = siteFiles(ROOT);
  const same = v => { const d = path.join(VER, v.name); return fs.existsSync(d) && cur.every(f => fs.existsSync(path.join(d, f)) && fs.readFileSync(path.join(d, f)).equals(fs.readFileSync(path.join(ROOT, f)))) && siteFiles(d).length === cur.length; };
  if (!list().some(same)) { const a = 'auto_' + now().slice(0, 16).replace(/[-: ]/g, '').replace(/^(\d{8})(\d{4})$/, '$1_$2'); save(a, name + ' 원복 직전 자동 보관', false); console.log('원복 직전 화면을 ' + a + ' 로 보관'); }
  // 루트를 저장본과 똑같이 (루트 파일은 versions/ 에 남아 있으므로 지워도 구버전은 그대로)
  for (const f of cur) if (!fs.existsSync(path.join(src, f))) fs.unlinkSync(path.join(ROOT, f));
  for (const f of siteFiles(src)) fs.copyFileSync(path.join(src, f), path.join(ROOT, f));
  git('add -A'); git(`commit -q -m "원복: ${name}"`); git('push -q origin main'); git('push -q --tags origin');
  console.log(name + ' 로 원복 완료 → https://petlegend.github.io/olivezone-preview/ (1~2분 뒤 반영)');
}
const [cmd, a, b] = process.argv.slice(2);
try {
  if (cmd === 'save') console.log('저장 완료: ' + save(a, b));
  else if (cmd === 'restore') restore(a);
  else console.log(list().map(v => `${v.name}\t${v.date}\t${v.note}`).join('\n') || '저장본 없음');
} catch (e) { console.error('중지: ' + e.message); process.exit(1); }
