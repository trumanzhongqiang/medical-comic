/**
 * 字幕断行：按真实字宽量行，只在「标点之后 / 虚词之前」下刀，
 * 并且不许把一整个词从中间劈开（数量、血压、低密度……）。
 *
 * 单独成文件，是为了不渲染也能批量体检断行结果。
 */

const PUNC = "，、；：。！？";
const SOFT = "是也在把对给让都就而但还从向被比";

/** 词表：断在这些词中间一律算「劈词」，只有在别无选择时才允许。 */
const GUARD = [
  // 血脂 / 血糖 / 血压
  "血压", "血糖", "血脂", "血管", "血液", "血里", "高压", "低压", "压力", "血压计",
  "血管壁", "胆固醇", "甘油三酯", "低密度", "高密度", "脂蛋白", "血脂报告",
  "胰岛素", "糖化", "血红蛋白", "空腹", "餐后", "耐量", "试验", "胰腺炎", "肝硬化",
  "脂肪", "脂肪酸", "肝脏", "肝细胞", "肝功能", "脂肪肝", "纤维化", "弹性", "成像",
  "血小板", "炎症", "斑块", "动脉", "心脏", "心率", "剂量", "他汀",
  // 量词 / 数量
  "两个", "三个", "四个", "四项", "两条", "两类", "两种", "两边", "个数", "数量",
  "一次", "两遍", "一半", "一点", "一些", "一两", "多少", "少数", "多数", "部分",
  "数量级", "时间段", "百分点",
  // 动作 / 方位补语
  "下去", "上去", "起来", "出来", "进来", "出去", "进去", "下来", "上来", "过来",
  "回来", "往前", "往后", "往上", "往下", "更严", "更宽",
  // 科普常用词
  "医生", "医嘱", "指南", "检查", "复查", "体检", "测量", "读数", "数值", "指标",
  "报告", "结论", "原因", "情况", "整体", "风险", "结果", "程度", "标准", "范围",
  "目标", "原因", "代谢", "合成", "分解", "积存", "评估", "判断", "调整", "建议",
  "中国", "医院", "家庭", "诊室", "袖带", "上臂", "椅背", "坐姿",
  "饮食", "运动", "强度", "体重", "腰围", "主食", "饮料", "力量", "训练", "热量",
  "时间", "小时", "分钟", "半年", "一年", "五天", "七天",
  "葡萄糖", "糖水", "水分", "高点", "低点", "最高", "最低", "以后", "以上", "以下",
  "之间", "左右", "前面", "后面", "里面", "外面", "上面", "下面", "中心", "通路",
  "百分之", "一半", "总量", "总量", "包含", "关系", "方向", "程度", "损伤",
  "运动", "训练", "力量", "睡眠", "吸烟", "喝酒", "饮酒", "戒烟",
  "减少", "增加", "降低", "升高", "下降", "超标", "超重", "正常", "异常",
];

const isDigit = (ch: string) => /[0-9.%]/.test(ch);

/** 按真实字宽算行宽：汉字 1，标点 1，数字和字母 0.56，空格 0.34。 */
export const UNITS = (ch: string): number => {
  if (/[\u3400-\u9fff]/.test(ch)) return 1;
  if ("，。、；：！？“”‘’（）《》—…·".includes(ch)) return 1;
  if (ch === " ") return 0.34;
  return 0.56;
};

export const widthOf = (s: string) => [...s].reduce((a, c) => a + UNITS(c), 0);

/** 在第 i 个字之前下刀，会不会把词劈开。 */
const splitsWord = (s: string, i: number): boolean => {
  for (const g of GUARD) {
    let at = s.indexOf(g);
    while (at >= 0) {
      if (at < i && i < at + g.length) return true;
      at = s.indexOf(g, at + 1);
    }
  }
  return false;
};

/**
 * 断点代价：两行等长是底分，标点之后几乎不加价，虚词之前少加，
 * 别处硬断加价；劈词、单字行、行首虚词一律重罚。
 */
const costOf = (s: string, chars: string[], before: number[], i: number): number => {
  const mid = widthOf(s) / 2;
  let c = Math.abs(before[i] - mid);
  if (PUNC.includes(chars[i - 1])) c += 0;
  else if (SOFT.includes(chars[i])) c += 1.2;
  else c += 8;
  if (splitsWord(s, i)) c += 80;
  // 「最 / 更 / 很 / 太 / 超」后面几乎一定跟同一个词，不在此下刀
  if ("最更很太超过".includes(chars[i - 1])) c += 40;
  if (i <= 1 || chars.length - i <= 1) c += 80;
  // 行首是「的 / 了」，或把「的 / 了」甩到下一行开头，读着别扭
  if ("的了".includes(chars[i])) c += 3.5;
  if ("，。、；：".includes(chars[i])) c += 6;
  return c;
};

/** 一行放不下时选断点：等长、不劈词、尽量落在标点或虚词处。 */
export const pickBreak = (s: string, per: number): number => {
  const chars = [...s];
  const total = widthOf(s);
  const before: number[] = [];
  let acc = 0;
  for (const c of chars) {
    before.push(acc);
    acc += UNITS(c);
  }
  const pool: number[] = [];
  for (let i = 2; i < chars.length - 1; i++) if (before[i] <= per) pool.push(i);
  if (!pool.length) return 1;
  let best = pool[0];
  let bestCost = Infinity;
  for (const i of pool) {
    const c = costOf(s, chars, before, i);
    if (c < bestCost) {
      bestCost = c;
      best = i;
    }
  }
  if (isDigit(chars[best - 1]) && isDigit(chars[best])) best -= 1;
  return Math.max(1, best);
};

export const wrapRows = (text: string, per: number): string[] => {
  const rows: string[] = [];
  let rest = text;
  let guard = 0;
  while (widthOf(rest) > per + 0.2 && guard++ < 4) {
    const cut = pickBreak(rest, per);
    rows.push([...rest].slice(0, cut).join(""));
    rest = [...rest].slice(cut).join("");
  }
  if (rest) rows.push(rest);
  // 行尾不留标点：断行本身就表示停顿
  return rows.slice(0, 3).map((r) => r.replace(/[，、；：]$/, "").trim());
};

/** 给体检脚本用：返回所有被劈开的词（按原句定位断点，跳过被裁掉的行尾标点）。 */
export const splitWords = (rows: string[], text: string): string[] => {
  const out: string[] = [];
  let pos = 0;
  for (let k = 0; k + 1 < rows.length; k++) {
    const at = text.indexOf(rows[k], pos);
    if (at < 0) break;
    let b = at + rows[k].length;
    while (b < text.length && "，、；： ".includes(text[b])) b++;
    for (const g of GUARD) {
      let p = text.indexOf(g);
      while (p >= 0) {
        if (p < b && b < p + g.length) out.push(g);
        p = text.indexOf(g, p + 1);
      }
    }
    pos = b;
  }
  return out;
};

/** 调试用：把一行句子里每个断点的代价打出来。 */
export const __debug = (s: string, per: number) => {
  const chars = [...s];
  const before: number[] = [];
  let acc = 0;
  for (const c of chars) { before.push(acc); acc += UNITS(c); }
  return chars.map((c, i) => ({
    i, c, before: before[i], split: splitsWord(s, i),
    cost: i >= 2 && i <= chars.length - 2 && before[i] <= per ? costOf(s, chars, before, i) : null,
  }));
};
