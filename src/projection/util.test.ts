import { getInsetStates, makeInsets } from './util';
import { insetData } from './insets-data';

const insetFips = ['02', '15', '72', '78', '60', '66', '69'];

describe('getInsetStates()', () => {
  it('should return all of AK, HI, PR, VI, AS, GU, MP when all are passed', () => {
    expect(getInsetStates(insetFips)).toEqual(insetFips);
  });

  // TODO: Include all lower 48 in test 
  it('should not return lower 48', () => {
    const fips = ['01', '06', '36', '56'];
    expect(getInsetStates(fips)).toEqual([]);
  });

  it('should return only the inset states', () => {
    const fips = ['01', '02', '72', '39'];
    expect(getInsetStates(fips)).toEqual(expect.arrayContaining(['02', '72']))
  });
});

describe('makeInsets', () => {
  it('should return an inset for all states when the full set of inset FIPS is passed', () => {
    const insets = makeInsets(insetData, insetFips);
    expect(insets).toHaveLength(5);
  });

  it('should return insets for AK, HI, AS when 02, 15, 60 are passed', () => {
    const result = insetData.filter(d => d.id === 'AK' || d.id === 'HI' || d.id === 'AS');
    const insets = makeInsets(insetData, ['02', '15', '60']);
    
    expect(insets).toHaveLength(3);
    expect(insets).toEqual(expect.arrayContaining(result));
  });

  it('should return inset for PR-VI whwn either 72 or 78 are passed, and GU-MP when 66 or 69 are passed', () => {
    const expPRVI = expect.arrayContaining(insetData.filter(d => d.id === 'PR-VI'));
    expect(makeInsets(insetData, ['72'])).toEqual(expPRVI);
    expect(makeInsets(insetData, ['78'])).toEqual(expPRVI);

    const expGUMP = expect.arrayContaining(insetData.filter(d => d.id === 'GU-MP'));
    expect(makeInsets(insetData, ['66'])).toEqual(expGUMP);
    expect(makeInsets(insetData, ['69'])).toEqual(expGUMP);
  });
});
