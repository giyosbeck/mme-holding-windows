export const roles = [
  { id: 1, name: 'Ombor xodimi', nameRu: 'Складской работник' },
  { id: 2, name: 'Sotuvchi', nameRu: 'Продавец' },
  { id: 3, name: 'Yuk tashuvchi', nameRu: 'Грузчик' },
  { id: 4, name: 'Menejer', nameRu: 'Менеджер' },
];

export const employees = [
  // Warehouse workers
  { id: 1, roleId: 1, name: 'Aziz Karimov', nameRu: 'Азиз Каримов' },
  { id: 2, roleId: 1, name: 'Sardor Toshmatov', nameRu: 'Сардор Тошматов' },
  { id: 3, roleId: 1, name: 'DilshodRahimov', nameRu: 'Дилшод Рахимов' },

  // Sellers
  { id: 4, roleId: 2, name: 'Nigora Yusupova', nameRu: 'Нигора Юсупова' },
  { id: 5, roleId: 2, name: 'Malika Azimova', nameRu: 'Малика Азимова' },
  { id: 6, roleId: 2, name: 'Shoira Nurmatova', nameRu: 'Шоира Нурматова' },

  // Loaders
  { id: 7, roleId: 3, name: 'Bobur Hamidov', nameRu: 'Бобур Хамидов' },
  { id: 8, roleId: 3, name: 'Jasur Mirzaev', nameRu: 'Жасур Мирзаев' },

  // Managers
  { id: 9, roleId: 4, name: 'Sherzod Sultonov', nameRu: 'Шерзод Султонов' },
  { id: 10, roleId: 4, name: 'Akmal Umarov', nameRu: 'Акмал Умаров' },
];

export const workCategories = [
  { id: 1, name: 'Savdo', nameRu: 'Торговля' },
  { id: 2, name: 'Yuk tashish', nameRu: 'Перевозка' },
  { id: 3, name: 'Saqlash', nameRu: 'Хранение' },
  { id: 4, name: 'Boshqaruv', nameRu: 'Управление' },
];

// Track given products
export const givenProducts = [];
