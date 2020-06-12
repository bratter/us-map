import { Inset, Point } from './types';

export const EPSILON = 1e-6;
export const SCALE = 1100;
export const VIEWBOX: Point = [1024, 576];

/**
 * Filters an array of 2-digit string state FIPS codes to only retain those relevant for insets.
 * This function retains all entries in the current (as at 2020) official FIPS code list other than
 * the contiguous lower 48 states. 
 *  
 * @param stateIds Array of 2-digit FIPS code string identifiers
 */
export const getInsetStates = (stateIds: string[]): string[] =>
  stateIds.filter(id => id === '02' || id === '15' || +id >= 60);

  /**
   * Return filtered array of inset objects with projections and other settings based on the passed
   * array of state FIPS codes. Returns all insets where any of the FIPS codes are present on the
   * `fips` member of the Inset.
   * 
   * @param insetData Array of inset objects
   * @param insetStates Array of state FIPS codes
   */
export const makeInsets = (insetData: Inset[], insetStates: string[]): Inset[] => insetData
  .filter(d => insetStates.some(v => d.fips.includes(v)))
  .map(d => ({ ...d, point: undefined}));
