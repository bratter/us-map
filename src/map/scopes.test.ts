import { scopes } from './scopes';

const insetFips = ['02', '15', '72', '78', '66', '69', '60'];

describe('Inset scopes hash', () => {
  it('should have an all member that contains all inset FIPS', () => {
    expect(scopes.all).toEqual(insetFips);
  });

  it('should have a states member that just returns the state FIPS', () => {
    expect(scopes.states).toEqual(['02', '15']);
  });

  it('should have a lower48 member that returns an empty array', () => {
    expect(scopes.lower48).toEqual([]);
  });

  it('should have an exclude member that is a function to exclude specific FIPS', () => {
    expect(scopes.exclude(['72', '78'])).toEqual(['02', '15', '66', '69', '60']);
  });

  it('should have an include member that is a function to include specific FIPS as an intersection', () => {
    expect(scopes.include(['19', '72', '50', '78'])).toEqual(['72', '78']);
  });
});
