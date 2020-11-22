import { scopes } from './scopes';

const insetFips = ['02', '15', '72', '78', '66', '69', '60'];

describe('Inset scopes hash', () => {
  it('should have an all member function that contains all inset FIPS', () => {
    expect(scopes.all()).toEqual(insetFips);
  });

  it('should have a states member function that just returns the state FIPS', () => {
    expect(scopes.states()).toEqual(['02', '15']);
  });

  it('should have a lower48 member function that returns an empty array', () => {
    expect(scopes.lower48()).toEqual([]);
  });

  it('should have an exclude member function that excludes specific FIPS', () => {
    expect(scopes.exclude(['72', '78'])).toEqual(['02', '15', '66', '69', '60']);
  });

  it('should have an include member function that includes specific FIPS as an intersection', () => {
    expect(scopes.include(['19', '72', '50', '78'])).toEqual(['72', '78']);
  });
});
