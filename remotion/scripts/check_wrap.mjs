#!/usr/bin/env node
/**
 * 离线体检字幕断行：不渲染，直接把四期旁白逐句断行打印出来，
 * 标出「劈词」「两行长度差太大」「掉到三行」的位置。
 *
 *   node scripts/check_wrap.mjs episodes/ep002-... episodes/ep003-...
 */
import {execFileSync} from "node:child_process";
import {readFileSync, mkdirSync, writeFileSync} from "node:fs";
import {dirname, join, resolve} from "node:path";
import {fileURLToPath} from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const repo = resolve(root, "..");
const tmp = join(root, "out", "wrapcheck");
mkdirSync(tmp, {recursive: true});

const bundle = join(tmp, "wrap.mjs");
execFileSync(join(root, "node_modules", ".bin", "esbuild"), [
  join(root, "src", "wrap.ts"),
  "--bundle", "--format=esm", "--platform=node", `--outfile=${bundle}`,
], {stdio: "inherit"});
writeFileSync(join(tmp, "package.json"), '{"type":"module"}\n');

const {wrapRows, widthOf, splitWords} = await import(bundle);

const SUB = {w: 732, fs: 46};
const per = (fs) => SUB.w / fs - 0.3;

let bad = 0;
for (const ep of process.argv.slice(2)) {
  const sp = resolve(repo, ep, "script.json");
  const script = JSON.parse(readFileSync(sp, "utf-8"));
  console.log(`\n=== ${ep}`);
  for (const b of script.beats) {
    for (const c of b.subs ?? b.clauses) {
      let fs = SUB.fs;
      let rows = wrapRows(c.text, per(fs));
      while (rows.length > 2 && fs > 36) {
        fs -= 2;
        rows = wrapRows(c.text, per(fs));
      }
      const split = splitWords(rows, c.text);
      const w = rows.map(widthOf);
      const uneven = rows.length === 2 && Math.max(...w) / Math.max(1, Math.min(...w)) > 1.75;
      const flag = [rows.length > 2 ? "三行" : "", split.length ? `劈词:${split.join("/")}` : "", uneven ? `长度差${w.map((x) => x.toFixed(1)).join(":")}` : "", fs < SUB.fs ? `缩字${fs}` : ""]
        .filter(Boolean).join(" ");
      if (flag) bad++;
      console.log(`  ${flag ? "!" : " "} ${rows.join(" ⏎ ")}${flag ? `   [${flag}]` : ""}`);
    }
  }
}
console.log(`\n共 ${bad} 处需要注意`);
