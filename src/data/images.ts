/**
 * Centralized Editorial Photography Collection for THE CLASSIC CRUSH
 * 
 * DESIGN PRINCIPLE:
 * Real editorial cafe photography with:
 * - Natural daylight, window light & gentle shadows
 * - Real cafe tables (wood, marble, ceramic, linen)
 * - Imperfect, candid compositions (coffee next to food, crumbs, hands)
 * - Authentic depth of field, NO plastic/floating AI renders
 * 
 * Easy to replace: update any URL below with the cafe's actual photograph!
 */

export const IMAGES = {
  // Hero: Top-down flat-lay Indian vegetarian bakery & cafe table (golden patties, momos, sandwiches, cold coffee, turquoise table)
  heroSpread: "/hero-indian-cafe.jpg",
  
  // Secondary hero alternative / banner
  heroAtmosphere: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=2000&q=85",

  // Homepage Signatures (Only 4 items on the landing page)
  signatures: {
    // 1. Dark & White Delight: Aesthetic molten chocolate waffle drenched in dark & white ganache
    darkWhiteDelight: "/dark-white-delight.jpg",
    
    // 2. Paneer Pizza: Real stone-baked pizza on a wooden peel, natural angle
    paneerPizza: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=80",
    
    // 3. Cheese Sandwich: Real toasted sandwich cut in halves with melted cheese, crumbs on wooden board
    cheeseSandwich: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=1200&q=80",
    
    // 4. Cold Coffee: Frothy iced coffee in glass beside wooden table with natural light
    coldCoffee: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=1200&q=80",
  },

  // Homepage Story Teaser Image
  storyTeaser: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1400&q=80",

  // Story Page Editorial Images
  story: {
    interiorWindow: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1400&q=80",
    bakeryCounter: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80",
    coffeePrep: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80",
    tableFriends: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
  },

  // Menu Featured Photography (for the dedicated /menu page)
  menu: {
    desserts: "/dark-white-delight.jpg",
    patties: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80",
    pizza: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80",
    sandwich: "https://images.unsplash.com/photo-1554433607-66b5efe9d304?auto=format&fit=crop&w=900&q=80",
    maggie: "https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=900&q=80",
    burger: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80",
    fries: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=80",
    momos: "/momos-platter.jpg",
    beverages: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=900&q=80",
    pastries: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=80",
    cake: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=900&q=80",
    koreanBun: "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=900&q=80",
  },

  // Gallery Editorial Collection
  gallery: [
    {
      url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=85",
      caption: "Overhead cafe table spread with fresh bakes & drinks",
      category: "Table Moments",
      aspect: "landscape",
    },
    {
      url: "/dark-white-delight.jpg",
      caption: "Aesthetic warm chocolate waffle drenched in dark & white ganache",
      category: "Signature Desserts",
      aspect: "landscape",
    },
    {
      url: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80",
      caption: "Sunlit corner by the window, perfect for reading & coffee",
      category: "Cafe Interior",
      aspect: "landscape",
    },
    {
      url: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=1000&q=80",
      caption: "Handcrafted thick cold brew with chocolate drizzle",
      category: "Beverages",
      aspect: "portrait",
    },
    {
      url: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=1000&q=80",
      caption: "Toasted cheese sandwich on rustic wooden cutting board",
      category: "Grilled Bites",
      aspect: "portrait",
    },
    {
      url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=80",
      caption: "Stone-baked paneer pizza with blistered crust & fresh herbs",
      category: "Hot From Oven",
      aspect: "landscape",
    },
    {
      url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1000&q=80",
      caption: "Oven fresh morning puffs and flaky bakery pastries",
      category: "Daily Counter",
      aspect: "portrait",
    },
    {
      url: "/momos-platter.jpg",
      caption: "Steamed & pan-fried hot momos with fiery schezwan & mint chutney",
      category: "Street Comforts",
      aspect: "landscape",
    },
    {
      url: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&w=1000&q=80",
      caption: "Warm brownie cup served with rich chocolate drip",
      category: "Warm Bakes",
      aspect: "portrait",
    },
    {
      url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80",
      caption: "Freshly brewed coffee on aged wooden table with linen",
      category: "Atmosphere",
      aspect: "landscape",
    },
  ],
};
