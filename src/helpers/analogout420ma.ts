// Calibration math for the 4-20mA output module (MCP4725, full scale
// 23 mA at code 4095). Mirrors smartpi/server/repository/modules/analogout420ma.go
// and smartpi/config/analogout_calibration.go in the SmartPi backend; the
// fit itself is the same as for the 0-10V module.

export { fitCalibration, parseMeasurement } from './analogout010v';
export type { Calibration } from './analogout010v';

const FULL_SCALE_MA = 23;

// Same limit as the backend (AnalogOutCalibration.ValidateCurrent).
export const MAX_OFFSET_MA = 1;

// The two set points: the ends of the range, both reachable with headroom.
export const CAL420MA_POINTS = [4, 20];

// Nominal (uncalibrated) output current of a DAC code, in mA - see
// nominalVoltage in analogout010v.ts for why the fit uses this rather than
// the requested current.
export function nominalCurrent(dacvalue: number): number {
  return (dacvalue * FULL_SCALE_MA) / 4095;
}
