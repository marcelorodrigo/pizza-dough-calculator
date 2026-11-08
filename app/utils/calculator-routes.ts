export const calculatorRoutes = [
  { path: '/', label: 'Recipe', navTitle: 'Recipe calculator', navDetail: 'Build your dough', number: '01' },
  { path: '/tools/flour-strength', label: 'Flour strength', navTitle: 'Flour strength', navDetail: 'Blend by W value', number: '02' },
  { path: '/tools/tin-mass', label: 'Tin mass', navTitle: 'Tin dough mass', navDetail: 'Size your pan', number: '03' },
  { path: '/tools/water-temperature', label: 'Water temp', navTitle: 'Water temperature', navDetail: 'Dial in your mix', number: '04' }
] as const
