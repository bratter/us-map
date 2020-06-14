import { geoConicEqualArea, geoEquirectangular } from 'd3-geo';
import { Inset } from './types';

/** Full list of inset FIPS codes */
export const insetFips = ['02', '15', '72', '78', '66', '69', '60'];

/** Collated boundary, projection, and meta data for projection insets */
export const insetData: Inset[] = [
  {
    id: '02',
    name: 'Alaska',
    type: 'state',
    fips: ['02'],
    codes: ['AK'],
    projection: geoConicEqualArea().rotate([154, 0]).center([-2, 58.5]).parallels([55, 65]),
    translate: [-0.337, 0.214],
    extent: [[-0.4655, 0.123], [-0.239, 0.262]],
    scale: 0.35,
  },
  {
    id: '15',
    name: 'Hawaii',
    type: 'state',
    fips: ['15'],
    codes: ['HI'],
    projection: geoConicEqualArea().rotate([157, 0]).center([-3, 19.9]).parallels([8, 18]),
    translate: [-0.225, 0.227],
    extent: [[-0.239, 0.169], [-0.127, 0.262]],
    scale: 1,
  },
  {
    id: '72,78',
    name: 'Puerto Rico and US Virgin Islands',
    type: 'insular area',
    fips: ['72', '78'],
    codes: ['PR', 'VI'],
    projection: geoConicEqualArea().rotate([66, 0]).center([0, 18]).parallels([8, 18]),
    translate: [0.350, 0.239],
    extent: [[0.310, 0.214], [0.385, 0.262]],
    scale: 1,
  },
  {
    id: '60',
    name: 'American Samoa',
    type: 'insular area',
    fips: ['60'],
    codes: ['AS'],
    projection: geoEquirectangular().rotate([173, 14]),
    translate: [-0.475, 0.098],
    extent: [[-0.4655, 0.083], [-0.390, 0.123]],
    scale: 1,
  },
  {
    id: '66,69',
    name: 'Guam and Northern Mariana Islands',
    type: 'insular area',
    fips: ['66', '69'],
    codes: ['GU', 'MP'],
    projection: geoEquirectangular().rotate([-145, -16.8]),
    translate: [-0.433, 0.011],
    extent: [[-0.4655, -0.037], [-0.390, 0.083]],
    scale: 1,
  },
];
