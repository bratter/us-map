/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { insetFips } from '../projection/insets-data';

export const scopes = {
  all: insetFips,
  states: insetFips.filter(d => +d < 60),
  lower48: [] as string[],
  exclude: (fips: string[]) => insetFips.filter(d => !fips.includes(d)),
  include: (fips: string[]) => insetFips.filter(d => fips.includes(d)),
}
