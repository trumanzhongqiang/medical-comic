export const C = {
  paper: "#F6F0E5",
  paperLight: "#FFFCF5",
  paperShadow: "#E7DCCB",
  ink: "#17324D",
  inkSoft: "#526477",
  coral: "#DF6555",
  coralDark: "#B94B43",
  coralLight: "#F3C7BC",
  teal: "#278C84",
  tealDark: "#1E6865",
  tealLight: "#B9DDD3",
  amber: "#E7AD45",
  amberLight: "#F7DFA0",
  white: "#FFFCF5",
  gray: "#65717B",
};

export const FONT = "'Songti SC','STSong','Songti TC','Noto Serif CJK SC',serif";
export const SANS = "'PingFang SC','Hiragino Sans GB','Heiti SC',sans-serif";

export const FPS = 60;
export const DUR = 116;
export const OFFSET = 0.5804988662;
export const BEAT = 60 / 77;

export const B = (n: number) => OFFSET + n * BEAT;
export const BAR = (n: number) => B(n * 4);
