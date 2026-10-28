#!/usr/bin/env python3
"""生成事实核查签字页：单文件 HTML，离线可开，勾完导出 JSON 再回填 script.json。

用法:
  python3 pipeline/factcheck_page.py ep002-blood-sugar-report ep003-hypertension \
      ep004-lipid-report -o review/factcheck-signoff.html

签字回填:
  python3 pipeline/apply_signoff.py factcheck-signoff-2026-10-28.json
"""
import argparse
import json
import re
from difflib import SequenceMatcher
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CLEAN = re.compile(r"[^\u4e00-\u9fa5A-Za-z0-9]")


def norm(text):
    return CLEAN.sub("", text or "")


def mmss(seconds):
    seconds = max(0, int(round(seconds)))
    return f"{seconds // 60:02d}:{seconds % 60:02d}"


def locate(beats, text):
    """把一条 sources 挂到最像的那一拍上，给出时间点与屏幕字幕，方便对着画面核。"""
    target = norm(text)
    if not target:
        return {"t": "", "beat": "", "ratio": 0.0, "screen": []}
    best = {"t": "", "beat": "", "ratio": 0.0, "screen": []}
    for beat in beats:
        lines = [line.get("text", "") if isinstance(line, dict) else str(line)
                 for line in beat.get("lines") or []]
        for screen in lines:
            ratio = SequenceMatcher(None, target, norm(screen)).ratio()
            if ratio > best["ratio"]:
                best = {"t": mmss(beat.get("start", 0)), "beat": beat.get("id", ""),
                        "ratio": ratio, "screen": lines}
    if best["ratio"] < 0.45:
        best["t"] = ""
    return best


def collect(slugs):
    episodes = []
    for slug in slugs:
        path = ROOT / "episodes" / slug / "script.json"
        script = json.loads(path.read_text("utf-8"))
        beats = script.get("beats") or []
        items = []
        for idx, item in enumerate(script.get("sources") or [], 1):
            if not isinstance(item, dict) or "claim" not in item:
                continue
            hit = locate(beats, item.get("conclusion") or item.get("claim"))
            items.append({
                "idx": idx,
                "verdict": item.get("verdict", ""),
                "claim": item.get("claim", ""),
                "conclusion": item.get("conclusion", ""),
                "source": item.get("source", ""),
                "quote": item.get("quote", ""),
                "url": item.get("url", ""),
                "conflict": item.get("conflict", ""),
                "analogy": item.get("analogy", ""),
                "reviewer": item.get("reviewer", ""),
                "t": hit["t"],
                "beat": hit["beat"],
                "screen": hit["screen"],
            })
        episodes.append({
            "slug": slug,
            "label": f"第 {int(slug[2:5])} 期",
            "title": script.get("title", slug),
            "items": items,
        })
    return episodes


TEMPLATE = r"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>事实核查签字台</title>
<style>
:root{
  --paper:#f4eee1; --card:#fffdf7; --ink:#26211c; --muted:#7b7061;
  --line:#e3d8c3; --red:#b0392e; --teal:#2c6b66; --amber:#a5701f; --green:#2f7a4f;
}
*{box-sizing:border-box}
html,body{margin:0}
body{
  background:
    radial-gradient(circle at 12% 8%, #fbf7ee 0%, transparent 42%),
    radial-gradient(circle at 88% 0%, #f7f1e3 0%, transparent 38%),
    var(--paper);
  color:var(--ink);
  font:15px/1.65 -apple-system,"PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif;
  -webkit-font-smoothing:antialiased;
  padding-bottom:80px;
}
a{color:var(--teal);text-decoration:none;border-bottom:1px dashed rgba(44,107,102,.45)}
a:hover{border-bottom-style:solid}
.wrap{max-width:1000px;margin:0 auto;padding:0 20px}

header.top{
  position:sticky;top:0;z-index:20;
  background:rgba(244,238,225,.92);
  backdrop-filter:saturate(140%) blur(10px);
  border-bottom:1px solid var(--line);
}
.top-in{max-width:1000px;margin:0 auto;padding:14px 20px 12px}
.title-row{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap}
h1{font-size:19px;margin:0;letter-spacing:.01em}
h1 .sub{font-size:12.5px;color:var(--muted);font-weight:400;letter-spacing:0}
.bar{margin-top:10px;height:6px;border-radius:99px;background:#e8ddc8;overflow:hidden}
.bar > i{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--teal),#4f9187);transition:width .25s ease}
.stat{display:flex;gap:18px;margin-top:8px;font-size:12.5px;color:var(--muted);flex-wrap:wrap;align-items:center}
.stat b{color:var(--ink);font-variant-numeric:tabular-nums}
.legend{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}

.tabs{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}
.tab{
  border:1px solid var(--line);background:#fbf6ea;color:var(--muted);
  padding:5px 12px;border-radius:99px;font-size:13px;cursor:pointer;
}
.tab.on{background:var(--ink);color:#fbf6ea;border-color:var(--ink)}

main{padding-top:22px}
.lead{
  background:var(--card);border:1px solid var(--line);border-radius:12px;
  padding:14px 16px;font-size:13.5px;color:#4d453a;box-shadow:0 1px 0 rgba(120,100,60,.05);
}
.lead summary{cursor:pointer;font-weight:600;color:var(--ink)}
.lead ol{margin:8px 0 0;padding-left:20px}
.lead li{margin:3px 0}

.epsec{margin:26px 0 8px;display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}
.epsec h2{font-size:15px;margin:0;letter-spacing:.02em}
.epsec span{font-size:12.5px;color:var(--muted)}

.card{
  position:relative;background:var(--card);border:1px solid var(--line);border-radius:12px;
  padding:16px 18px 14px 18px;margin:12px 0;
  box-shadow:0 1px 2px rgba(120,100,60,.06);
  transition:border-color .15s ease,box-shadow .15s ease;
}
.card:hover{border-color:#d6c8ad}
.card[data-done="1"]{border-color:#cfdcca;background:#fdfef9}
.card[data-done="1"]::after{
  content:"已处理";position:absolute;right:-1px;top:-1px;font-size:11px;
  background:var(--green);color:#fff;padding:2px 9px;border-radius:0 12px 0 10px;letter-spacing:.05em;
}
.card[data-act="revise"]{border-color:#e2c6a2}
.card[data-act="revise"]::after{content:"需改文案";background:var(--amber);color:#fff}
.card[data-act="drop"]{border-color:#e0bdb8}
.card[data-act="drop"]::after{content:"建议删去";background:var(--red);color:#fff}
.card[data-done="1"] .pill{margin-right:74px}

.crow{display:flex;align-items:center;gap:10px;font-size:12px;color:var(--muted);margin-bottom:8px}
.no{
  font:600 11.5px/1 ui-monospace,SFMono-Regular,Menlo,monospace;
  color:#8b7f6c;border:1px solid var(--line);border-radius:6px;padding:4px 6px;letter-spacing:.06em;
}
.ep{color:#6a5f50}
.time{font-variant-numeric:tabular-nums;color:#948871}
.pill{
  margin-left:auto;font-size:11.5px;padding:2px 9px;border-radius:99px;border:1px solid transparent;white-space:nowrap;
}
.v-通过{background:#e9f2e7;color:#2f6b3f;border-color:#cfe2cb}
.v-待核查{background:#fbeeda;color:#96621a;border-color:#eed9b4}
.v-常识表述{background:#e7f0f4;color:#2c5f76;border-color:#cbdfe8}
.v-降级为类比{background:#f0ecf6;color:#5b4a80;border-color:#ddd3ea}

h3{font-size:15.5px;line-height:1.55;margin:0 0 10px}
.field{display:flex;gap:10px;margin:6px 0;font-size:13.5px}
.field .k{flex:0 0 76px;color:var(--muted);font-size:12.5px;padding-top:2px}
.field .v{margin:0;flex:1;min-width:0}
.field .v.screen{font-weight:600}
.field .v.sub{color:#5d5449;font-size:13px}
.field .v.src{color:#4d453a}
.field a{font-size:12.5px;white-space:nowrap}
blockquote{
  margin:10px 0 8px;padding:10px 12px;background:#f8f2e4;border-left:3px solid #d8c9a8;
  border-radius:0 8px 8px 0;font-size:13px;color:#4a4237;position:relative;
}
blockquote .qm{
  display:block;font-size:10.5px;letter-spacing:.12em;color:#a3957c;margin-bottom:4px;
}
blockquote.empty{background:#f6f3ec;border-left-color:#ddd5c4;color:#8b8377;font-style:normal}
.warn{
  margin:8px 0 10px;padding:8px 11px;border-radius:8px;background:#fdf4e4;border:1px solid #f0dfc0;
  font-size:12.5px;color:#7a5a20;display:flex;gap:8px;
}
.warn b{flex:0 0 auto;font-weight:600;color:#8a5f16}

.act{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:12px;padding-top:12px;border-top:1px dashed var(--line)}
.btn{
  font:inherit;font-size:13px;padding:6px 13px;border-radius:8px;cursor:pointer;
  border:1px solid #d9cdb6;background:#fbf7ed;color:#4a4237;transition:.12s;
}
.btn:hover{border-color:#c3b394;background:#f7f0e0}
.btn[aria-pressed="true"]{background:var(--ink);border-color:var(--ink);color:#fbf6ea}
.btn[data-a="revise"][aria-pressed="true"]{background:var(--amber);border-color:var(--amber)}
.btn[data-a="drop"][aria-pressed="true"]{background:var(--red);border-color:var(--red)}
.btn[data-a="common"][aria-pressed="true"],.btn[data-a="sign"][aria-pressed="true"]{background:var(--green);border-color:var(--green)}
.note{
  font:inherit;font-size:12.5px;flex:1;min-width:160px;padding:6px 10px;border-radius:8px;
  border:1px solid var(--line);background:#fdfbf4;color:var(--ink);
}
.note:focus{outline:2px solid #cfe0da;outline-offset:1px}

.empty-hint{color:var(--muted);font-size:13.5px;text-align:center;padding:40px 0}

footer.foot{
  position:fixed;left:0;right:0;bottom:0;z-index:30;
  background:rgba(250,246,237,.95);backdrop-filter:blur(10px);border-top:1px solid var(--line);
}
.foot-in{max-width:1000px;margin:0 auto;padding:10px 20px;display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.foot .who{display:flex;gap:8px;align-items:center;font-size:12.5px;color:var(--muted)}
.foot input[type="text"],.foot input[type="date"]{
  font:inherit;font-size:13px;padding:5px 9px;border:1px solid var(--line);border-radius:8px;background:#fff;color:var(--ink);
}
.foot input[type="text"]{width:110px}
.primary{
  margin-left:auto;font:inherit;font-size:13.5px;font-weight:600;padding:8px 18px;border-radius:9px;
  border:1px solid var(--ink);background:var(--ink);color:#fbf6ea;cursor:pointer;
}
.primary:hover{background:#3a332b}
.ghost{font:inherit;font-size:12.5px;padding:6px 11px;border-radius:8px;border:1px solid var(--line);background:#fff;color:var(--muted);cursor:pointer}
.ghost:hover{color:var(--ink);border-color:#c9bb9f}

@media print{
  header.top,footer.foot,.act,.lead{display:none}
  body{background:#fff;padding:0}
  .card{break-inside:avoid;box-shadow:none}
}
</style>
</head>
<body>
<header class="top">
  <div class="top-in">
    <div class="title-row">
      <h1>事实核查签字台 <span class="sub">第 2–4 期 · __COUNT__ 条 · 生成于 __DATE__</span></h1>
    </div>
    <div class="bar"><i id="bar"></i></div>
    <div class="stat">
      <span>已处理 <b id="c-done">0</b>/<b id="c-all">0</b></span>
      <span>签字认可 <b id="c-sign">0</b></span>
      <span>保留为常识 <b id="c-common">0</b></span>
      <span>需改文案 <b id="c-revise">0</b></span>
      <span>建议删去 <b id="c-drop">0</b></span>
    </div>
    <div class="tabs" id="tabs"></div>
  </div>
</header>

<main class="wrap">
  <details class="lead" open>
    <summary>怎么核（每条 20 秒，只判断两件事）</summary>
    <ol>
      <li><b>看原文对不对得上</b>：下面那段「原文摘录」是否真的支持上面的「画面句」。链接就在来源后面，点开可查。</li>
      <li><b>看这话对老人会不会被误读</b>：夸张、绝对、听起来像诊断或用药建议的，点「需改文案」。</li>
      <li>选完点右下角「导出签字文件」，把 json 发给我，我回填 <code>script.json</code> 并重跑质检。</li>
    </ol>
    <p style="margin:8px 0 0;color:#7a6f60;font-size:12.5px">灰色「待核查」的几条是AI没取到原文的：认可就点「保留为常识表述」，我不替它们默认通过。</p>
  </details>
  <div id="list"></div>
</main>

<footer class="foot">
  <div class="foot-in">
    <div class="who">
      签字人 <input id="who" type="text" placeholder="你的名字">
      日期 <input id="when" type="date">
    </div>
    <button class="ghost" id="reset">清空本页记录</button>
    <button class="ghost" id="print">打印 / 存 PDF</button>
    <button class="primary" id="export">导出签字文件</button>
  </div>
</footer>

<script>
const DATA = __DATA__;
const KEY = 'factcheck-signoff-v2';
const ACT_LABEL = {sign:'签字认可', common:'保留为常识表述', revise:'需改文案', drop:'建议删去'};

let state = load();
let filterEp = 'all';
let filterSt = 'all';

function load(){
  try{
    const raw = localStorage.getItem(KEY);
    if(raw) return JSON.parse(raw);
  }catch(e){}
  return {who:'truman', when:today(), decisions:{}};
}
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(state)); }catch(e){} }
function today(){
  const d = new Date(), p = n => String(n).padStart(2,'0');
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`;
}
function keyOf(ep, idx){ return ep + '#' + idx; }

const ALL = [];
DATA.episodes.forEach(ep => ep.items.forEach(it => ALL.push({ep, it})));

function counts(){
  const c = {done:0, sign:0, common:0, revise:0, drop:0, pending:0};
  ALL.forEach(({ep,it}) => {
    if(it.verdict === '待核查') c.pending++;
    const d = state.decisions[keyOf(ep.slug, it.idx)];
    if(!d || !d.a) return;
    c.done++, c[d.a]++;
  });
  return c;
}

function renderTabs(){
  const tabs = [['all','全部期次 ' + ALL.length]];
  DATA.episodes.forEach(ep => tabs.push([ep.slug, ep.label + ' · ' + ep.items.length]));
  const st = [['all','不限状态'],['待核查','只看待核查'],['todo','只看未处理']];
  document.getElementById('tabs').innerHTML = tabs.map(([v,l]) =>
    `<button class="tab ${filterEp===v?'on':''}" data-tab="${v}">${l}</button>`).join('')
    + '<span style="width:10px"></span>'
    + st.map(([v,l]) => `<button class="tab ${filterSt===v?'on':''}" data-st="${v}">${l}</button>`).join('');
}

function render(){
  const host = document.getElementById('list');
  let html = '';
  DATA.episodes.forEach(ep => {
    if(filterEp !== 'all' && filterEp !== ep.slug) return;
    const items = ep.items.filter(it => {
      const d = state.decisions[keyOf(ep.slug,it.idx)];
      if(filterSt === '待核查' && it.verdict !== '待核查') return false;
      if(filterSt === 'todo' && d && d.a) return false;
      return true;
    });
    if(!items.length) return;
    html += `<div class="epsec"><h2>${ep.label}</h2><span>${ep.title}</span></div>`;
    items.forEach(it => html += cardHTML(ep, it));
  });
  host.innerHTML = html || '<p class="empty-hint">这个筛选下没有条目。</p>';
  refresh();
}

function cardHTML(ep, it){
  const key = keyOf(ep.slug, it.idx);
  const d = state.decisions[key] || {};
  const common = it.verdict === '待核查';
  const quote = it.quote
    ? `<blockquote><span class="qm">原文摘录</span>${esc(it.quote)}</blockquote>`
    : `<blockquote class="empty"><span class="qm">原文摘录</span>本轮未取到可直接引用的原文，缺口见下方备注。</blockquote>`;
  const warn = it.conflict ? `<div class="warn"><b>备注</b><div>${esc(it.conflict)}</div></div>` : '';
  const link = it.url ? ` <a href="${esc(it.url)}" target="_blank" rel="noreferrer">打开原文 ↗</a>` : ' <span style="color:#a09383">（无链接）</span>';
  const signed = it.reviewer ? `<span style="color:#2f7a4f">已签：${esc(it.reviewer)}</span>` : '';
  return `<article class="card" data-key="${key}" data-done="${d.a?1:0}" data-act="${d.a||''}">
    <div class="crow">
      <span class="no">${ep.slug.slice(2,5)}·${String(it.idx).padStart(2,'0')}</span>
      <span class="ep">${esc(ep.label)}</span>
      ${it.t ? `<span class="time">画面约 ${it.t}</span>` : ''}
      ${signed}
      <span class="pill v-${it.verdict||'待核查'}">${it.verdict||'待核查'}</span>
    </div>
    <h3>${esc(it.claim)}</h3>
    <div class="field"><span class="k">画面句</span><p class="v screen">${esc(it.conclusion)}</p></div>
    ${(it.screen && it.screen.length) ? `<div class="field"><span class="k">屏幕字幕</span><p class="v sub">${it.screen.map(esc).join(' ／ ')}</p></div>` : ''}
    <div class="field"><span class="k">来源</span><p class="v src">${esc(it.source)}${link}</p></div>
    ${quote}
    ${warn}
    <div class="act">
      <button class="btn" data-a="${common?'common':'sign'}" aria-pressed="${d.a===(common?'common':'sign')}">${common?'保留为常识表述':'签字认可'}</button>
      <button class="btn" data-a="revise" aria-pressed="${d.a==='revise'}">需改文案</button>
      <button class="btn" data-a="drop" aria-pressed="${d.a==='drop'}">建议删去</button>
      <input class="note" placeholder="备注：怎么改，或为什么不同意" value="${esc(d.note||'')}">
    </div>
  </article>`;
}

function esc(s){
  return String(s==null?'':s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function refresh(){
  const c = counts();
  const all = ALL.length;
  const map = {'c-done':c.done,'c-all':all,'c-sign':c.sign,'c-common':c.common,'c-revise':c.revise,'c-drop':c.drop};
  Object.entries(map).forEach(([id,v]) => document.getElementById(id).textContent = v);
  document.getElementById('bar').style.width = (all ? c.done/all*100 : 0) + '%';
  renderTabs();
}

document.addEventListener('click', e => {
  const tab = e.target.closest('[data-tab]');
  if(tab){ filterEp = tab.dataset.tab; render(); return; }
  const st = e.target.closest('[data-st]');
  if(st){ filterSt = st.dataset.st; render(); return; }
  const btn = e.target.closest('.btn[data-a]');
  if(btn){
    const card = btn.closest('.card');
    const key = card.dataset.key;
    const a = btn.dataset.a;
    const cur = state.decisions[key] || {};
    const next = (cur.a === a) ? {...cur, a:null} : {...cur, a};
    state.decisions[key] = next;
    card.dataset.done = next.a ? 1 : 0;
    card.dataset.act = next.a || '';
    card.querySelectorAll('.btn[data-a]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.a === next.a)));
    save(); refresh();
  }
});

document.addEventListener('input', e => {
  if(e.target.classList.contains('note')){
    const card = e.target.closest('.card');
    const key = card.dataset.key;
    state.decisions[key] = {...(state.decisions[key]||{}), note:e.target.value};
    save();
  }
  if(e.target.id === 'who'){ state.who = e.target.value; save(); }
  if(e.target.id === 'when'){ state.when = e.target.value; save(); }
});

document.getElementById('export').addEventListener('click', () => {
  const who = document.getElementById('who').value.trim();
  const when = document.getElementById('when').value;
  if(!who){ alert('先填签字人名字，签字才有意义。'); document.getElementById('who').focus(); return; }
  const decisions = [];
  ALL.forEach(({ep,it}) => {
    const d = state.decisions[keyOf(ep.slug,it.idx)];
    if(d && d.a) decisions.push({episode:ep.slug, idx:it.idx, claim:it.claim, action:d.a, note:(d.note||'').trim()});
  });
  if(!decisions.length){ alert('还没有处理任何一条。'); return; }
  const left = ALL.length - decisions.length;
  if(left > 0 && !confirm(`还有 ${left} 条未处理，仍要导出吗？（未处理的不会签字）`)) return;
  const payload = {reviewer:who, reviewed_at:when, exported_at:new Date().toISOString(), decisions};
  const blob = new Blob([JSON.stringify(payload, null, 2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `factcheck-signoff-${when||today()}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
});

document.getElementById('reset').addEventListener('click', () => {
  if(!confirm('清空本页所有勾选（不影响 script.json）？')) return;
  state.decisions = {}; save(); render();
});
document.getElementById('print').addEventListener('click', () => window.print());

document.getElementById('who').value = state.who || '';
document.getElementById('when').value = state.when || today();
render();
</script>
</body>
</html>
"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("episodes", nargs="+")
    ap.add_argument("-o", "--out", default="review/factcheck-signoff.html")
    args = ap.parse_args()

    episodes = collect(args.episodes)
    total = sum(len(e["items"]) for e in episodes)
    if not total:
        raise SystemExit("这些期没有可签的 sources 条目")
    data = {"episodes": episodes}
    html = (TEMPLATE
            .replace("__DATA__", json.dumps(data, ensure_ascii=False))
            .replace("__COUNT__", str(total))
            .replace("__DATE__", __import__("datetime").date.today().isoformat()))

    out = Path(args.out)
    if not out.is_absolute():
        out = ROOT / out
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(html, encoding="utf-8")

    print(f"已生成 {out}")
    for ep in episodes:
        c = {v: sum(1 for i in ep["items"] if i["verdict"] == v) for v in ("通过", "待核查", "常识表述")}
        print(f"  {ep['label']} {ep['title']}：{len(ep['items'])} 条"
              f"（通过 {c['通过']}，待核查 {c['待核查']}）")
    print(f"共 {total} 条")


if __name__ == "__main__":
    main()
