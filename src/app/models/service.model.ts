export interface Service {
  id: number;
  name: string;
  description: string;
  duration: string;
  price: string;
  category: string;
}

export const NAIL_SERVICE_CATALOG: Service[] = [
  {
    id: 1,
    name: 'Dry E-file Manicure technique + Hard Gel Extension',
    description: 'Gel color, Gels build the shape, Extension, Gel polish permanent + Russian manicure (Cuticle cleaning)',
    price: '$100',
    duration: '2h 30m',
    category: 'Extensions'
  },
  {
    id: 2,
    name: 'Dry E-file Manicure technique + Gel polish (Shellac)',
    description: 'Russian manicure Dry E-file Manicure technique with color gel polish',
    price: '$70',
    duration: '2h',
    category: 'Manicure'
  },
  {
    id: 3,
    name: 'Pedicure combo technique + Gel polish (Shellac)',
    description: 'Pedicure cleaning with color gel polish',
    price: '$80',
    duration: '2h',
    category: 'Pedicure'
  },
  {
    id: 4,
    name: 'Pedicure combo technique (without any polish)',
    description: 'No polish, just cleaning',
    price: '$60',
    duration: '1h 15m',
    category: 'Pedicure'
  },
  {
    id: 5,
    name: 'Dry E-file Manicure technique (without any polish)',
    description: 'No polish, just cleaning cuticle',
    price: '$50',
    duration: '1h',
    category: 'Manicure'
  },
  {
    id: 6,
    name: 'Russian classic soak-off technique Manicure (without any polish)',
    description: 'No polish, just cleaning cuticle',
    price: '$50',
    duration: '1h',
    category: 'Manicure'
  },
  {
    id: 7,
    name: 'Nail Polish Permanent',
    description: 'Gel polish, Shellac, Nail polish permanent',
    price: '$20',
    duration: '1h',
    category: 'Polish'
  },
  {
    id: 8,
    name: 'Gel polish removal',
    description: 'Gel polish removal which liquid or machine',
    price: '$15',
    duration: '30m',
    category: 'Removal'
  },
  {
    id: 9,
    name: 'Gel extension removal',
    description: 'Gel extension removal which a machine',
    price: '$20',
    duration: '1h',
    category: 'Removal'
  },
  {
    id: 10,
    name: 'Nail Polish regular',
    description: 'Regular Nail polish',
    price: '$10',
    duration: '30m',
    category: 'Polish'
  }
];
