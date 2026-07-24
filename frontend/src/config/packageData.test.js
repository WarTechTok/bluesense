import { getCapacityFeeInfo } from './packageData';

describe('getCapacityFeeInfo', () => {
  it('returns no extra fee when guest count is within capacity', () => {
    const packageObj = { maxCapacity: 20 };

    expect(getCapacityFeeInfo(packageObj, 20)).toEqual({
      extraGuestCount: 0,
      extraGuestCharge: 0,
      isOverCapacity: false,
    });
  });

  it('returns an extra fee when guest count exceeds capacity', () => {
    const packageObj = { maxCapacity: 20 };

    expect(getCapacityFeeInfo(packageObj, 23)).toEqual({
      extraGuestCount: 3,
      extraGuestCharge: 450,
      isOverCapacity: true,
    });
  });
});
