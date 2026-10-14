export const VIEWBOX_W = 1600;
export const VIEWBOX_H = 900;

export const RHYTHM = 30;
export const OV = 60;

export const MARGIN_LEFT = 120;
export const MARGIN_RIGHT = 1480;

export const X1 = 540;
export const X2 = 1260;

export const HERO_Y = 150;
export const H2_Y = 450;
export const H3_Y = 750;

export const V1_TOP = 40;
export const V1_BOTTOM = H2_Y + OV;
export const V2_TOP = H2_Y - OV;
export const V2_BOTTOM = H3_Y + OV;

export const THIN_LINES_Y = [210, 270, 330, 390];
export const THIN_LINES_X_START = X1;
export const THIN_LINES_X_END = 900;

export const LEFT_THIN_LINES_Y = [510, 570, 630];
export const LEFT_THIN_LINES_X_START = X2;
export const LEFT_THIN_LINES_X_END = 900;

export const WHO_LABEL_POS = { x: 520, y: 330 };
export const HOW_LABEL_POS = { x: 1290, y: 432 };

export const CTA_TITLE_POS = { x: 1236, y: 796 };
export const CTA_SUB_POS = { x: 1236, y: 826 };

export const CONTACT_BASE_X = X1;
export const CONTACT_LINE_HEIGHT = 180;
export const CONTACT_SPACING = 90;

export const STROKE = {
  thick: 2.6,
  hero: 3.4,
  thin: 0.8,
  title: 3.2
};

export const THIN_OPACITY = 0.65;

export const WINDOW = {
  v1: [0.03, 0.15],
  whoLabel: [0.07, 0.13],
  thinRight: (i: number) => [0.07 + i * 0.02, 0.14 + i * 0.02],
  thinRightText: (i: number) => [0.10 + i * 0.02, 0.17 + i * 0.02],
  h2Left: [0.15, 0.17],
  h2Right: [0.16, 0.32],
  v2: [0.26, 0.48],
  howLabel: [0.30, 0.36],
  thinLeft: (i: number) => [0.34 + i * 0.03, 0.41 + i * 0.03],
  thinLeftText: (i: number) => [0.37 + i * 0.03, 0.44 + i * 0.03],
  h3Right: [0.43, 0.45],
  h3Left: [0.44, 0.70],
  contact: (i: number) => [0.58 + i * 0.06, 0.66 + i * 0.06],
  ctaTitle: [0.62, 0.69],
  ctaSub: [0.66, 0.74],
  footer: [0.88, 0.96]
};

export const FONT = {
  title: { family: "Jost", weight: 200, size: 54, textLength: 380 },
  whoLabel: { family: "Jost", weight: 400, size: 14, letterSpacing: "0.3em", textTransform: "uppercase" },
  howLabel: { family: "Jost", weight: 400, size: 14, letterSpacing: "0.3em", textTransform: "uppercase" },
  thinText: { family: "Jost", weight: 300, size: 16 },
  ctaTitle: { family: "Jost", weight: 200, size: 32 },
  ctaSub: { family: "Jost", weight: 300, size: 16 },
  contactLabel: { family: "Jost", weight: 400, size: 14, letterSpacing: "0.3em", textTransform: "uppercase" }
};

export const FONT_FA = {
  thinText: { family: "Vazirmatn", weight: 300, size: 16 },
  ctaTitle: { family: "Vazirmatn", weight: 300, size: 32 },
  ctaSub: { family: "Vazirmatn", weight: 300, size: 16 },
  contactLabel: { family: "Vazirmatn", weight: 400, size: 14 }
};

export const WRAPPER_HEIGHT_VH = 500;
export const INNER_HEIGHT_SVH = 100;

export const TITLE_DRAW_DURATION = 3.2;
export const TITLE_FILL_DURATION = 1.6;
export const HERO_LINE_DRAW_DURATION = 2.0;
export const HERO_LINE_START_DELAY = 3.3;