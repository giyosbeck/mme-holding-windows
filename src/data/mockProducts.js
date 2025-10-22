export const productTypes = [
  { id: 1, name: 'Mevalar', nameRu: 'Фрукты' },
  { id: 2, name: 'Sabzavotlar', nameRu: 'Овощи' },
  { id: 3, name: 'Go\'sht mahsulotlari', nameRu: 'Мясные продукты' },
  { id: 4, name: 'Sut mahsulotlari', nameRu: 'Молочные продукты' },
  { id: 5, name: 'Don mahsulotlari', nameRu: 'Зерновые продукты' },
];

export const products = [
  // Fruits
  {
    id: 1,
    typeId: 1,
    name: 'Olma',
    nameRu: 'Яблоки',
    image: '🍎',
    price: 15000,
    stock: 250,
    unit: 'kg',
    receivedDate: '2025-10-15T10:30:00',
    productCode: 'FRT-001',
    warningLimit: 50
  },
  {
    id: 2,
    typeId: 1,
    name: 'Banan',
    nameRu: 'Бананы',
    image: '🍌',
    price: 22000,
    stock: 180,
    unit: 'kg',
    receivedDate: '2025-10-16T09:15:00',
    productCode: 'FRT-002',
    warningLimit: 30
  },
  {
    id: 3,
    typeId: 1,
    name: 'Apelsin',
    nameRu: 'Апельсины',
    image: '🍊',
    price: 18000,
    stock: 320,
    unit: 'kg',
    receivedDate: '2025-10-14T14:20:00',
    productCode: 'FRT-003',
    warningLimit: 50
  },

  // Vegetables
  {
    id: 4,
    typeId: 2,
    name: 'Pomidor',
    nameRu: 'Помидоры',
    image: '🍅',
    price: 12000,
    stock: 400,
    unit: 'kg',
    receivedDate: '2025-10-17T08:00:00',
    productCode: 'VEG-001',
    warningLimit: 100
  },
  {
    id: 5,
    typeId: 2,
    name: 'Bodring',
    nameRu: 'Огурцы',
    image: '🥒',
    price: 10000,
    stock: 350,
    unit: 'kg',
    receivedDate: '2025-10-17T08:00:00',
    productCode: 'VEG-002',
    warningLimit: 80
  },
  {
    id: 6,
    typeId: 2,
    name: 'Kartoshka',
    nameRu: 'Картофель',
    image: '🥔',
    price: 8000,
    stock: 600,
    unit: 'kg',
    receivedDate: '2025-10-13T11:30:00',
    productCode: 'VEG-003',
    warningLimit: 150
  },

  // Meat Products
  {
    id: 7,
    typeId: 3,
    name: 'Mol go\'shti',
    nameRu: 'Говядина',
    image: '🥩',
    price: 85000,
    stock: 150,
    unit: 'kg',
    receivedDate: '2025-10-18T07:00:00',
    productCode: 'MEA-001',
    warningLimit: 30
  },
  {
    id: 8,
    typeId: 3,
    name: 'Tovuq go\'shti',
    nameRu: 'Курица',
    image: '🍗',
    price: 45000,
    stock: 200,
    unit: 'kg',
    receivedDate: '2025-10-18T07:00:00',
    productCode: 'MEA-002',
    warningLimit: 40
  },

  // Dairy Products
  {
    id: 9,
    typeId: 4,
    name: 'Sut',
    nameRu: 'Молоко',
    image: '🥛',
    price: 9000,
    stock: 500,
    unit: 'l',
    receivedDate: '2025-10-19T06:00:00',
    productCode: 'DAI-001',
    warningLimit: 100
  },
  {
    id: 10,
    typeId: 4,
    name: 'Tvorog',
    nameRu: 'Творог',
    image: '🧀',
    price: 25000,
    stock: 120,
    unit: 'kg',
    receivedDate: '2025-10-18T10:00:00',
    productCode: 'DAI-002',
    warningLimit: 25
  },

  // Grains
  {
    id: 11,
    typeId: 5,
    name: 'Guruch',
    nameRu: 'Рис',
    image: '🍚',
    price: 14000,
    stock: 800,
    unit: 'kg',
    receivedDate: '2025-10-10T12:00:00',
    productCode: 'GRA-001',
    warningLimit: 200
  },
  {
    id: 12,
    typeId: 5,
    name: 'Bug\'doy',
    nameRu: 'Пшеница',
    image: '🌾',
    price: 6000,
    stock: 1200,
    unit: 'kg',
    receivedDate: '2025-10-12T13:30:00',
    productCode: 'GRA-002',
    warningLimit: 300
  },
];
