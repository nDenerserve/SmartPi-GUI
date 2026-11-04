// Calibration math for the 0-10V output module (MCP4728 + amplifier with
// gain 1 + 21k5/10k). Mirrors smartpi/server/repository/modules/analogout010v.go
// and smartpi/config/analogout_calibration.go in the SmartPi backend.

export const AMP_GAIN = 1 + 21.5 / 10; // 3.15
const INTERNAL_VREF = 2.048;
const VDD = 3.3;
const FULL_SCALE = 4096;

// Same plausibility limits as the backend (AnalogOutCalibration.Validate).
export const MAX_GAIN_ERROR = 0.1;
export const MAX_OFFSET = 0.5;

export interface Calibration {
  gain: number;
  offset: number; // V
}

export const IDENTITY: Calibration = { gain: 1, offset: 0 };

// One output as returned by GET/PUT /api/v1/module/analogout010v/{address}.
export interface ChannelStatus {
  channel: number;
  dacvalue: number;
  vref: string; // "internal" | "vdd"
  gain: number; // DAC gain, 1 or 2
}

// Nominal (uncalibrated) terminal voltage for the DAC code a channel reports.
// Calibrating against this rather than against the requested voltage keeps
// the result right even while an old calibration is still active - that
// only changes which code the backend picks, not what a code produces.
export function nominalVoltage(ch: ChannelStatus): number {
  const vref = ch.vref === 'internal' ? INTERNAL_VREF * ch.gain : VDD;
  return Math.min((ch.dacvalue / FULL_SCALE) * vref, VDD) * AMP_GAIN;
}

// Fits measured = gain * nominal + offset through two measurement points.
// Returns null if the points can't give a calibration (same nominal value)
// or the result is implausible (see MAX_GAIN_ERROR/MAX_OFFSET) - almost
// always a typo, a swapped field or a probe on the wrong terminal.
export function fitCalibration(
  nominal1: number, measured1: number,
  nominal2: number, measured2: number,
): Calibration | null {
  if (![nominal1, measured1, nominal2, measured2].every(Number.isFinite)) {
    return null;
  }
  if (Math.abs(nominal2 - nominal1) < 1) {
    return null;
  }
  const gain = (measured2 - measured1) / (nominal2 - nominal1);
  const offset = measured1 - gain * nominal1;
  if (!isPlausible({ gain, offset })) {
    return null;
  }
  return { gain: round(gain, 6), offset: round(offset, 5) };
}

export function isPlausible(c: Calibration): boolean {
  return Math.abs(c.gain - 1) <= MAX_GAIN_ERROR && Math.abs(c.offset) <= MAX_OFFSET;
}

// Parses a measured value as typed by a German or English user: "1,0091"
// and "1.0091" both work. Returns NaN for anything else.
export function parseMeasurement(s: string | number | null | undefined): number {
  if (typeof s === 'number') return s;
  if (s === null || s === undefined) return NaN;
  const t = String(s).trim().replace(',', '.');
  return /^-?\d+(\.\d+)?$/.test(t) ? Number(t) : NaN;
}

function round(v: number, digits: number): number {
  const f = Math.pow(10, digits);
  return Math.round(v * f) / f;
}
