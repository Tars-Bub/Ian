import ChickenPastil from '@/assets/menu/sulit-meals/ChickenPastil.jfif';
import PorkSisig from '@/assets/menu/sulit-meals/PorkSisig.jfif';
import Pares from '@/assets/menu/sulit-meals/Pares.jfif';
import ParesOverload from '@/assets/menu/sulit-meals/ParesOverload.jfif';
import TJHotdog from '@/assets/menu/sulit-meals/TJHotdog.jfif';
import Ham from '@/assets/menu/sulit-meals/Ham.jfif';
import Giniling from '@/assets/menu/sulit-meals/Giniling.jfif';
import Longganisa from '@/assets/menu/silog-meals/Longganisa.jfif';
import LechonKawali from '@/assets/menu/silog-meals/LechonKawali.jfif';
import PorkLiempo from '@/assets/menu/silog-meals/PorkLiempo.jfif';
import Ham1 from '@/assets/menu/silog-meals/Ham1.jfif';
import Embotido from '@/assets/menu/silog-meals/Embotido.jfif';
import Tofu from '@/assets/menu/silog-meals/Tofu.jfif';
import Tapa from '@/assets/menu/silog-meals/Tapa.jfif';
import BurgerSteak from '@/assets/menu/silog-meals/BurgerSteak.jfif';
import Bacon from '@/assets/menu/silog-meals/Bacon.jfif';
import Cordon from '@/assets/menu/silog-meals/Cordon.jfif';
import ChikFing from '@/assets/menu/silog-meals/ChikFing.jfif';
import ChikChop from '@/assets/menu/silog-meals/ChikChop.jfif';
import ChikNug from '@/assets/menu/silog-meals/ChikNug.jfif';
import Tocino from '@/assets/menu/silog-meals/Tocino.jfif';
import Sisig from '@/assets/menu/silog-meals/Sisig.jfif';
import Hung from '@/assets/menu/silog-meals/Hung.jfif';
import skinless from '@/assets/menu/silog-meals/skinless.jfif';
import Luncheon from '@/assets/menu/silog-meals/Luncheon.jfif';
import Bangsi from '@/assets/menu/silog-meals/Bangsi.jfif';



export interface MenuImage {
  id: string;
  name: string;
  imageUrl: string;
  fallbackColor: string;
  emoji: string;
  localImage?: string;
}

// Using Cloudimage and reliable food image URLs
export const menuImages: Record<string, MenuImage> = {
  // Sulit Meals
  'sm1': { 
  id: 'sm1', 
  name: 'Chicken Pastil', 
  imageUrl: ChickenPastil,          
  fallbackColor: '#FF6B35', 
  emoji: '🍗',
  localImage: ChickenPastil         
},
  'sm2': { 
    id: 'sm2', 
    name: 'Pork Sisig', 
    imageUrl: PorkSisig, 
    fallbackColor: '#FF8C42', 
    emoji: '🐷', 
    localImage: PorkSisig
  },
  'sm3': { 
    id: 'sm3', 
    name: '60 Pesos Pares', 
    imageUrl: Pares, 
    fallbackColor: '#FFA559', 
    emoji: '🍲', 
    localImage: Pares
  },
  'sm4': { 
    id: 'sm4', 
    name: '100 Pesos Overload Pares', 
    imageUrl: ParesOverload, 
    fallbackColor: '#FFB347', 
    emoji: '🍖',
    localImage: ParesOverload
  },
  'sm5': { 
    id: 'sm5', 
    name: 'Tender Juicy Hotdog', 
    imageUrl: TJHotdog, 
    fallbackColor: '#FF6B6B', 
    emoji: '🌭', 
    localImage: TJHotdog
  },
  'sm6': { 
    id: 'sm6', 
    name: 'Sweet Ham', 
    imageUrl: Ham, 
    fallbackColor: '#FF8A8A', 
    emoji: '🍖', 
    localImage: Ham
  },
  'sm7': { 
    id: 'sm7', 
    name: 'Giniling Express', 
    imageUrl: Giniling, 
    fallbackColor: '#FFA07A', 
    emoji: '🍛', 
    localImage: Giniling
  },

  // Silog Meals
  'sl1': { 
    id: 'sl1', 
    name: 'Longganisa Silog', 
    imageUrl: skinless, 
    fallbackColor: '#D4A5A5', 
    emoji: '🌭', 
    localImage: skinless
  },
  'sl2': { 
    id: 'sl2', 
    name: 'Lechon Kawali Silog', 
    imageUrl: LechonKawali, 
    fallbackColor: '#C41E3A', 
    emoji: '🐷', 
    localImage: LechonKawali
  },
  'sl3': { 
    id: 'sl3', 
    name: 'Pork Liempo Silog', 
    imageUrl: PorkLiempo, 
    fallbackColor: '#DC143C', 
    emoji: '🥩', 
    localImage: PorkLiempo
  },
  'sl4': { 
    id: 'sl4', 
    name: 'Sweet Ham (1 pc) Silog', 
    imageUrl: Ham1, 
    fallbackColor: '#FFB6C1', 
    emoji: '🍖', 
    localImage: Ham1
  },
  'sl5': { 
    id: 'sl5', 
    name: 'Embotido Silog', 
    imageUrl: Embotido, 
    fallbackColor: '#CD5C5C', 
    emoji: '🥫' 
  },
  'sl6': { 
    id: 'sl6', 
    name: 'Sizzling Tofu', 
    imageUrl: Tofu, 
    fallbackColor: '#DEB887', 
    emoji: '🥟', 
    localImage: Tofu
  },
  'sl7': { 
    id: 'sl7', 
    name: 'Beef Tapa', 
    imageUrl: Tapa, 
    fallbackColor: '#8B4513', 
    emoji: '🥩', 
    localImage: Tapa
  },
  'sl8': { 
    id: 'sl8', 
    name: 'Burger Steak', 
    imageUrl: BurgerSteak, 
    fallbackColor: '#BC8F6B', 
    emoji: '🍔', 
    localImage: BurgerSteak
  },
  'sl9': { 
    id: 'sl9', 
    name: 'Honey Bacon', 
    imageUrl: Bacon, 
    fallbackColor: '#D2691E', 
    emoji: '🥓', 
    localImage: Bacon
  },
  'sl10': { 
    id: 'sl10', 
    name: 'Cordon Bleu', 
    imageUrl: Cordon, 
    fallbackColor: '#F4A460', 
    emoji: '🍗', 
    localImage: Cordon
  },
  'sl11': { 
    id: 'sl11', 
    name: 'Chicken Fingers (3)', 
    imageUrl: ChikFing, 
    fallbackColor: '#FFD700', 
    emoji: '🍗', 
    localImage: ChikFing
  },
  'sl12': { 
    id: 'sl12', 
    name: 'Chicken Chop', 
    imageUrl: ChikChop, 
    fallbackColor: '#F0E68C', 
    emoji: '🍗', 
    localImage: ChikChop
  },
  'sl13': { 
    id: 'sl13', 
    name: 'Chicken Nuggets (4)', 
    imageUrl: ChikNug, 
    fallbackColor: '#FFE4B5', 
    emoji: '🍗', 
    localImage: ChikNug
  },
  'sl14': { 
    id: 'sl14', 
    name: 'Tocino (Pork/Chicken)', 
    imageUrl: Tocino, 
    fallbackColor: '#FF69B4', 
    emoji: '🥩', 
    localImage: Tocino
  },
  'sl15': { 
    id: 'sl15', 
    name: 'Sisig (Pork/Chicken)', 
    imageUrl: Sisig, 
    fallbackColor: '#FF4500', 
    emoji: '🐷', 
    localImage: Sisig
  },
  'sl16': { 
    id: 'sl16', 
    name: 'Hungarian Sausage', 
    imageUrl: Hung, 
    fallbackColor: '#DC143C', 
    emoji: '🌭',
    localImage: Hung
  },
  'sl17': { 
    id: 'sl17', 
    name: 'Skinless Longganisa', 
    imageUrl: Longganisa, 
    fallbackColor: '#F08080', 
    emoji: '🌭', 
    localImage: Longganisa
  },
  'sl18': { 
    id: 'sl18', 
    name: 'Luncheon Meat', 
    imageUrl: Luncheon, 
    fallbackColor: '#E9967A', 
    emoji: '🥫', 
    localImage: Luncheon
  },
  'sl19': { 
    id: 'sl19', 
    name: 'Boneless Bangus', 
    imageUrl: Bangsi, 
    fallbackColor: '#48D1CC', 
    emoji: '🐟', 
    localImage: Bangsi
  },

  // Rice Toppings
  'rt1': { 
    id: 'rt1', 
    name: 'Fried Chicken Leg Quarter', 
    imageUrl: 'https://cdn.pixabay.com/photo/2016/03/05/19/02/chicken-1238279_640.jpg', 
    fallbackColor: '#D2B48C', 
    emoji: '🍗' 
  },
  'rt2': { 
    id: 'rt2', 
    name: 'Fried Chicken Wings (2)', 
    imageUrl: 'https://cdn.pixabay.com/photo/2016/03/05/19/02/chicken-1238279_640.jpg', 
    fallbackColor: '#CD853F', 
    emoji: '🍗' 
  },
  'rt3': { 
    id: 'rt3', 
    name: 'Fried Chicken Wings (3)', 
    imageUrl: 'https://cdn.pixabay.com/photo/2016/03/05/19/02/chicken-1238279_640.jpg', 
    fallbackColor: '#DEB887', 
    emoji: '🍗' 
  },
  'rt4': { 
    id: 'rt4', 
    name: 'Chicken Pastil with Egg', 
    imageUrl: 'https://cdn.pixabay.com/photo/2016/03/05/19/02/chicken-1238279_640.jpg', 
    fallbackColor: '#FFA07A', 
    emoji: '🍳' 
  },
  'rt5': { 
    id: 'rt5', 
    name: 'Siomai Meal (4)', 
    imageUrl: 'https://cdn.pixabay.com/photo/2019/04/09/15/55/dumplings-4115040_640.jpg', 
    fallbackColor: '#F4A460', 
    emoji: '🥟' 
  },
  'rt6': { 
    id: 'rt6', 
    name: 'Dumplings Meal (4)', 
    imageUrl: 'https://cdn.pixabay.com/photo/2019/04/09/15/55/dumplings-4115040_640.jpg', 
    fallbackColor: '#F0E68C', 
    emoji: '🥟' 
  },
  'rt7': { 
    id: 'rt7', 
    name: 'Lumpiang Shanghai (6)', 
    imageUrl: 'https://cdn.pixabay.com/photo/2018/03/24/08/08/egg-roll-3256351_640.jpg', 
    fallbackColor: '#FFD700', 
    emoji: '🍤' 
  },
  'rt8': { 
    id: 'rt8', 
    name: 'Fish Fillet (4)', 
    imageUrl: 'https://cdn.pixabay.com/photo/2017/07/13/18/29/fish-2500895_640.jpg', 
    fallbackColor: '#48D1CC', 
    emoji: '🐟' 
  },
  'rt9': { 
    id: 'rt9', 
    name: 'Pork Chop', 
    imageUrl: 'https://cdn.pixabay.com/photo/2017/05/07/08/56/pork-2291760_640.jpg', 
    fallbackColor: '#CD5C5C', 
    emoji: '🥩' 
  },
  'rt10': { 
    id: 'rt10', 
    name: 'Beef Pares', 
    imageUrl: 'https://cdn.pixabay.com/photo/2014/10/19/20/59/beef-493343_640.jpg', 
    fallbackColor: '#8B4513', 
    emoji: '🍲' 
  },
  'rt11': { 
    id: 'rt11', 
    name: 'Overload Pares', 
    imageUrl: 'https://cdn.pixabay.com/photo/2014/10/19/20/59/beef-493343_640.jpg', 
    fallbackColor: '#A52A2A', 
    emoji: '🍖' 
  },

  // A La Carte
  'al1': { 
    id: 'al1', 
    name: 'Whole Fried Chicken Oriental', 
    imageUrl: 'https://cdn.pixabay.com/photo/2016/03/05/19/02/chicken-1238279_640.jpg', 
    fallbackColor: '#F4A460', 
    emoji: '🍗' 
  },
  'al2': { 
    id: 'al2', 
    name: 'Half Fried Chicken Oriental', 
    imageUrl: 'https://cdn.pixabay.com/photo/2016/03/05/19/02/chicken-1238279_640.jpg', 
    fallbackColor: '#DEB887', 
    emoji: '🍗' 
  },
  'al3': { 
    id: 'al3', 
    name: 'Chicken Wings (6)', 
    imageUrl: 'https://cdn.pixabay.com/photo/2016/03/05/19/02/chicken-1238279_640.jpg', 
    fallbackColor: '#CD853F', 
    emoji: '🍗' 
  },
  'al4': { 
    id: 'al4', 
    name: 'Chicken Fingers (8)', 
    imageUrl: 'https://cdn.pixabay.com/photo/2016/03/05/19/02/chicken-1238279_640.jpg', 
    fallbackColor: '#FFD700', 
    emoji: '🍗' 
  },
  'al5': { 
    id: 'al5', 
    name: 'Embotido', 
    imageUrl: 'https://cdn.pixabay.com/photo/2020/05/06/15/05/meatloaf-5137220_640.jpg', 
    fallbackColor: '#CD5C5C', 
    emoji: '🥫' 
  },
  'al6': { 
    id: 'al6', 
    name: 'Lechon Kawali', 
    imageUrl: 'https://cdn.pixabay.com/photo/2017/05/07/08/56/pork-2291760_640.jpg', 
    fallbackColor: '#C41E3A', 
    emoji: '🐷' 
  },
  'al7': { 
    id: 'al7', 
    name: 'Fried Liempo', 
    imageUrl: 'https://cdn.pixabay.com/photo/2017/05/07/08/56/pork-2291760_640.jpg', 
    fallbackColor: '#DC143C', 
    emoji: '🥩' 
  },
  'al8': { 
    id: 'al8', 
    name: 'Fried Boneless Bangus', 
    imageUrl: 'https://cdn.pixabay.com/photo/2017/07/13/18/29/fish-2500895_640.jpg', 
    fallbackColor: '#48D1CC', 
    emoji: '🐟' 
  },
  'al9': { 
    id: 'al9', 
    name: 'Sizzling Tokwa', 
    imageUrl: 'https://cdn.pixabay.com/photo/2018/03/21/21/00/tofu-3248369_640.jpg', 
    fallbackColor: '#DEB887', 
    emoji: '🥟' 
  },

  // Finger Foods
  'ff1': { 
    id: 'ff1', 
    name: 'Fish Tofu (12)', 
    imageUrl: 'https://cdn.pixabay.com/photo/2018/03/21/21/00/tofu-3248369_640.jpg', 
    fallbackColor: '#48D1CC', 
    emoji: '🐟' 
  },
  'ff2': { 
    id: 'ff2', 
    name: 'Siomai (10)', 
    imageUrl: 'https://cdn.pixabay.com/photo/2019/04/09/15/55/dumplings-4115040_640.jpg', 
    fallbackColor: '#F4A460', 
    emoji: '🥟' 
  },
  'ff3': { 
    id: 'ff3', 
    name: 'Dumplings (10)', 
    imageUrl: 'https://cdn.pixabay.com/photo/2019/04/09/15/55/dumplings-4115040_640.jpg', 
    fallbackColor: '#F0E68C', 
    emoji: '🥟' 
  },
  'ff4': { 
    id: 'ff4', 
    name: 'Lumpiang Shanghai (12)', 
    imageUrl: 'https://cdn.pixabay.com/photo/2018/03/24/08/08/egg-roll-3256351_640.jpg', 
    fallbackColor: '#FFD700', 
    emoji: '🍤' 
  },
  'ff5': { 
    id: 'ff5', 
    name: 'Lumpiang Togue (3)', 
    imageUrl: 'https://cdn.pixabay.com/photo/2018/03/24/08/08/egg-roll-3256351_640.jpg', 
    fallbackColor: '#FFA07A', 
    emoji: '🌯' 
  },
  'ff6': { 
    id: 'ff6', 
    name: 'Chicken Skin', 
    imageUrl: 'https://cdn.pixabay.com/photo/2016/03/05/19/02/chicken-1238279_640.jpg', 
    fallbackColor: '#CD5C5C', 
    emoji: '🍗' 
  },
  'ff7': { 
    id: 'ff7', 
    name: 'Flavored Fries', 
    imageUrl: 'https://cdn.pixabay.com/photo/2016/08/11/08/04/french-fries-1585288_640.jpg', 
    fallbackColor: '#FFD700', 
    emoji: '🍟' 
  },
};

export const getMenuImage = (itemId: string): MenuImage | null => {
  return menuImages[itemId] || null;
};