/**
 * Bezier
 * @author Colin Duffy
 */
export const Ease = {
  linear:     [0.250, 0.250, 0.750, 0.750],

  inQuad:     [0.550, 0.085, 0.680, 0.530],
  inCubic:    [0.550, 0.055, 0.675, 0.190],
  inQuart:    [0.895, 0.030, 0.685, 0.220],
  inQuint:    [0.755, 0.050, 0.855, 0.060],
  inSine:     [0.470, 0.000, 0.745, 0.715],
  inExpo:     [0.950, 0.050, 0.795, 0.035],
  inCirc:     [0.600, 0.040, 0.980, 0.335],
  inBack:     [0.600, 0.000, 0.735, 0.045],

  outQuad:    [0.250, 0.460, 0.450, 0.940],
  outCubic:   [0.215, 0.610, 0.355, 1.000],
  outQuart:   [0.165, 0.840, 0.440, 1.000],
  outQuint:   [0.230, 1.000, 0.320, 1.000],
  outSine:    [0.390, 0.575, 0.565, 1.000],
  outExpo:    [0.190, 1.000, 0.220, 1.000],
  outCirc:    [0.075, 0.820, 0.165, 1.000],
  outBack:    [0.175, 0.885, 0.320, 1.000],

  inOutQuad:  [0.455, 0.030, 0.515, 0.955],
  inOutCubic: [0.645, 0.045, 0.355, 1.000],
  inOutQuart: [0.770, 0.000, 0.175, 1.000],
  inOutQuint: [0.860, 0.000, 0.070, 1.000],
  inOutSine:  [0.445, 0.050, 0.550, 0.950],
  inOutExpo:  [1.000, 0.000, 0.000, 1.000],
  inOutCirc:  [0.785, 0.135, 0.150, 0.860],
  inOutBack:  [0.680, 0.000, 0.265, 1.000]
};

export function isLinear(x0, y0, x1, y1) {
  return x0 === y0 && x1 === y1;
}

export function curveAt(percent, x0, y0, x1, y1) {
  if (percent <= 0) return 0;
  if (percent >= 1) return 1;
  if (isLinear(x0, y0, x1, y1)) return percent; // linear

  let x0a = 0; // initial x
  let y0a = 0; // initial y
  let x1a = x0; // 1st influence x
  let y1a = y0; // 1st influence y
  let x2a = x1; // 2nd influence x
  let y2a = y1; // 2nd influence y
  let x3a = 1; // final x
  let y3a = 1; // final y

  let A = x3a - 3.0 * x2a + 3.0 * x1a - x0a;
  let B = 3.0 * x2a - 6.0 * x1a + 3.0 * x0a;
  let C = 3.0 * x1a - 3.0 * x0a;
  let D = x0a;

  let E = y3a - 3.0 * y2a + 3.0 * y1a - y0a;
  let F = 3.0 * y2a - 6.0 * y1a + 3.0 * y0a;
  let G = 3.0 * y1a - 3.0 * y0a;
  let H = y0a;

  let current = percent;

  let i, currentx, currentslope;
  for (i = 0; i < 5; i++) {
    currentx = xFromT(current, A, B, C, D);
    currentslope = slopeFromT(current, A, B, C);
    current -= (currentx - percent) * (currentslope);
    current = Math.min(Math.max(current, 0.0), 1.0);
  }

  return yFromT(current, E, F, G, H);
}

export function slopeFromT(t, A, B, C) {
  return 1.0 / (3.0 * A * t * t + 2.0 * B * t + C);
}

export function xFromT(t, A, B, C, D) {
  return A * (t * t * t) + B * (t * t) + C * t + D;
}

export function yFromT(t, E, F, G, H) {
  let tt = t * t;
  return E * (tt * t) + F * tt + G * t + H;
}
