export interface Service {
  id: number;
  name: string;
  description: string;
  duration: string;
  price: string;
  category: string;
  icon?: string;
  note?: string;
}

export interface UserInfo {
  name: string;
  lastname: string;
  telephone: string;
  email?: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  endTime?: string;
}

export interface DateTimeData {
  date: Date | null;
  timeSlot: TimeSlot | null;
  notes: string;
}

export interface AppointmentData extends DateTimeData {
  services: Service[];
  user: UserInfo;
}

export const NAIL_SERVICE_CATALOG: Service[] = [
  {
    id: 1,
    name: 'Manicure + Hard Gel Extension',
    description: 'Professional extension and shaping. Includes Ukrainian manicure (E-file technique) and permanent gel polish.',
    price: '$100',
    duration: '2h 30m',
    category: 'Extensions',
    note: 'Previous coating removal is included.'
  },
  {
    id: 2,
    name: 'Manicure + Gel Polish (Shellac)',
    description: 'Combined or E-file Ukrainian manicure with color gel polish.',
    price: '$70',
    duration: '2h',
    category: 'Manicure',
    note: 'Previous coating removal is included.'
  },
  {
    id: 3,
    name: 'Manicure + Builder Gel',
    description: 'Strengthening and leveling the natural nail plate using builder gel and E-file manicure technique.',
    price: '$80',
    duration: '2h',
    category: 'Manicure',
    note: 'Previous coating removal is included.'
  },
  {
    id: 4,
    name: 'Pedicure + Gel Polish (Shellac)',
    description: 'Complete pedicure (E-file or combo) including cuticle care and color gel polish.',
    price: '$80',
    duration: '2h',
    category: 'Pedicure',
    note: 'Previous coating removal is included.'
  },
  {
    id: 5,
    name: 'Manicure (No polish)',
    description: 'Detailed cuticle care using various techniques: E-file, Ukrainian manicure, or soak-off.',
    price: '$50',
    duration: '1h',
    category: 'Manicure'
  },
  {
    id: 6,
    name: 'Pedicure (No polish)',
    description: 'Hygienic foot and toe care using E-file or combined techniques.',
    price: '$60',
    duration: '1h 30m',
    category: 'Pedicure'
  },
  {
    id: 7,
    name: 'Builder Gel',
    description: 'An extra layer of strength for your natural nails. Ideal for those who need more durability or have thin, fragile nails.',
    price: '$30',
    duration: '1h',
    category: 'Extension',
  },
  {
    id: 8,
    name: 'Gel Polish Permanent (Shellac)',
    description: 'Gel polish, Shellac, Nail polish permanent.',
    price: '$20',
    duration: '1h',
    category: 'Polish'
  },
  {
    id: 9,
    name: 'Regular Nail Polish',
    description: 'Application of classic high-quality nail polish for a traditional finish. Perfect for those who prefer a temporary color.',
    price: '$15',
    duration: '30m',
    category: 'Polish'
  },
  {
    id: 10,
    name: 'Nail Art / Design',
    description: 'Custom hand-painted designs, French tip, stickers, or accents to make your manicure unique.',
    price: '$10',
    duration: '20m',
    category: 'Design',
    note: 'Time and price may vary based on complexity.'
  },
  {
    id: 11,
    name: 'Gel Polish Removal',
    description: 'Safe and gentle removal of gel polish (Shellac) using a professional E-file or soak-off method without damaging the natural nail.',
    price: '$20',
    duration: '30m',
    category: 'Removal'
  },
  {
    id: 12,
    name: 'Gel Extension Removal',
    description: 'Careful removal of hard gel or acrylic extensions using a professional machine technique to ensure the health of your natural nail plate.',
    price: '$30',
    duration: '40m',
    category: 'Removal'
  },

];

// export const NAIL_SERVICE_CATALOG_OLDER: Service[] = [
//   {
//     id: 1,
//     name: 'Dry E-file Manicure technique + Hard Gel Extension',
//     description: 'Gel color, Gels build the shape, Extension, Gel polish permanent + Russian manicure (Cuticle cleaning)',
//     price: '$100',
//     duration: '2h 30m',
//     category: 'Extensions'
//   },
//   {
//     id: 2,
//     name: 'Dry E-file Manicure technique + Gel polish (Shellac)',
//     description: 'Russian manicure Dry E-file Manicure technique with color gel polish',
//     price: '$70',
//     duration: '2h',
//     category: 'Manicure'
//   },
//   {
//     id: 3,
//     name: 'Pedicure combo technique + Gel polish (Shellac)',
//     description: 'Pedicure cleaning with color gel polish',
//     price: '$80',
//     duration: '2h',
//     category: 'Pedicure'
//   },
//   {
//     id: 4,
//     name: 'Pedicure combo technique (without any polish)',
//     description: 'No polish, just cleaning',
//     price: '$60',
//     duration: '1h 15m',
//     category: 'Pedicure'
//   },
//   {
//     id: 5,
//     name: 'Dry E-file Manicure technique (without any polish)',
//     description: 'No polish, just cleaning cuticle',
//     price: '$50',
//     duration: '1h',
//     category: 'Manicure'
//   },
//   {
//     id: 6,
//     name: 'Russian classic soak-off technique Manicure (without any polish)',
//     description: 'No polish, just cleaning cuticle',
//     price: '$50',
//     duration: '1h',
//     category: 'Manicure'
//   },
//   {
//     id: 7,
//     name: 'Nail Polish Permanent',
//     description: 'Gel polish, Shellac, Nail polish permanent',
//     price: '$20',
//     duration: '1h',
//     category: 'Polish'
//   },
//   {
//     id: 8,
//     name: 'Gel polish removal',
//     description: 'Gel polish removal which liquid or machine',
//     price: '$15',
//     duration: '30m',
//     category: 'Removal'
//   },
//   {
//     id: 9,
//     name: 'Gel extension removal',
//     description: 'Gel extension removal which a machine',
//     price: '$20',
//     duration: '1h',
//     category: 'Removal'
//   },
//   {
//     id: 10,
//     name: 'Nail Polish regular',
//     description: 'Regular Nail polish',
//     price: '$10',
//     duration: '30m',
//     category: 'Polish'
//   }
// ];
