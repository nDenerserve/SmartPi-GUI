import { describe, expect, it } from 'vitest';
import { fitCalibration, MAX_OFFSET_MA, nominalCurrent } from '../analogout420ma';

describe('nominalCurrent', () => {
  it('matches the backend formula (23 mA full scale)', () => {
    expect(nominalCurrent(712)).toBeCloseTo(3.999, 3);
    expect(nominalCurrent(3561)).toBeCloseTo(20.0, 2);
  });
});

describe('fitCalibration for 4-20mA', () => {
  it('fits gain and offset in mA', () => {
    const n1 = nominalCurrent(712);
    const n2 = nominalCurrent(3561);
    const c = fitCalibration(n1, 1.02 * n1 + 0.1, n2, 1.02 * n2 + 0.1, MAX_OFFSET_MA);
    expect(c).not.toBeNull();
    expect(c!.gain).toBeCloseTo(1.02, 5);
    expect(c!.offset).toBeCloseTo(0.1, 4);
  });
  it('allows offsets up to 1 mA, not more', () => {
    expect(fitCalibration(4, 4.8, 20, 20.8, MAX_OFFSET_MA)).not.toBeNull();
    expect(fitCalibration(4, 5.5, 20, 21.5, MAX_OFFSET_MA)).toBeNull();
  });
});
