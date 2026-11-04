import { describe, expect, it } from 'vitest';
import { fitCalibration, nominalVoltage, parseMeasurement } from '../analogout010v';

const ch = (dacvalue: number) => ({ channel: 4, dacvalue, vref: 'internal', gain: 2 });

describe('nominalVoltage', () => {
  it('matches the backend formula (internal 2.048 V x2, amplifier 3.15)', () => {
    expect(nominalVoltage(ch(317))).toBeCloseTo(0.99855, 5);
    expect(nominalVoltage(ch(2857))).toBeCloseTo(8.99955, 5);
  });
  it('uses VDD when the DAC is still on its power-up reference', () => {
    expect(nominalVoltage({ channel: 1, dacvalue: 2048, vref: 'vdd', gain: 1 })).toBeCloseTo(1.65 * 3.15, 5);
  });
});

describe('fitCalibration', () => {
  it('reproduces the hand calibration of output 4 (2026-11-04)', () => {
    const c = fitCalibration(nominalVoltage(ch(317)), 1.0091, nominalVoltage(ch(2857)), 8.992);
    expect(c).not.toBeNull();
    expect(c!.gain).toBeCloseTo(0.997738, 5);
    expect(c!.offset).toBeCloseTo(0.01281, 4);
  });
  it('rejects points too close together', () => {
    expect(fitCalibration(1, 1, 1.5, 1.5)).toBeNull();
  });
  it('rejects implausible results (typo, wrong terminal)', () => {
    expect(fitCalibration(1, 1, 9, 6)).toBeNull(); // gain 0.625
    expect(fitCalibration(1, 2, 9, 10)).toBeNull(); // offset 1 V
    expect(fitCalibration(1, NaN, 9, 9)).toBeNull();
  });
});

describe('parseMeasurement', () => {
  it('accepts comma and point', () => {
    expect(parseMeasurement('1,0091')).toBe(1.0091);
    expect(parseMeasurement(' 8.992 ')).toBe(8.992);
  });
  it('rejects garbage', () => {
    expect(parseMeasurement('')).toBeNaN();
    expect(parseMeasurement('1,0 V')).toBeNaN();
    expect(parseMeasurement(undefined)).toBeNaN();
  });
});
