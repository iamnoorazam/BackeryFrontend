// Central source of truth for category presentation across the app.
// Keeps bakery ("food") and boutique ("fashion") categories consistent
// in the Navbar, Home, CategoryPage and ProductCard.

export const FASHION_CATEGORIES = ["Kurti", "Lehenga", "Saree", "Gown", "Tshirt"];

export const isFashionCategory = (name) =>
  !!name && FASHION_CATEGORIES.some((c) => c.toLowerCase() === String(name).toLowerCase());

// Pretty labels for category names.
export const displayNames = {
  // Bakery / Food
  Cake: "Cakes",
  Burger: "Burgers",
  Pizza: "Pizza",
  Momos: "Momos",
  Biryani: "Biryani",
  Coldrink: "Cold Drinks",
  "Egg Rolls": "Egg Rolls",
  Fruit: "Fruits",
  // Boutique / Fashion
  Kurti: "Kurtis",
  Lehenga: "Lehengas",
  Saree: "Sarees",
  Gown: "Gowns",
  Tshirt: "T-Shirts & Tops",
};

export const getDisplayName = (name) => displayNames[name] || name;

// Rich metadata for category landing pages.
export const categoryMeta = {
  // ===== Bakery =====
  Cake: {
    icon: "🎂", gradient: "from-pink-600 to-rose-700",
    desc: "Sweeten Your Moments with Delicious Cakes",
    longDesc: "Birthday cakes, chocolate cakes, fruit cakes, pastries and more made fresh for every celebration.",
    cta: "Order Cake Now",
  },
  Burger: {
    icon: "🍔", gradient: "from-amber-600 to-orange-700",
    desc: "Juicy Burgers for Every Craving",
    longDesc: "Cheesy, crispy, spicy, loaded burgers made fresh and delivered fast.",
    cta: "Order Burger Now",
  },
  Pizza: {
    icon: "🍕", gradient: "from-[#D2691E] to-[#C41E3A]",
    desc: "Authentic Wood-Fired Pizzas",
    longDesc: "Freshly baked pizzas with premium toppings, cheese burst crusts & combo deals.",
    cta: "Order Pizza Now",
  },
  Momos: {
    icon: "🥟", gradient: "from-emerald-600 to-teal-700",
    desc: "Steamed & Fried Momos for Every Mood",
    longDesc: "Veg, chicken, paneer, tandoori, schezwan momos served with spicy dips.",
    cta: "Order Momos Now",
  },
  Biryani: {
    icon: "🍚", gradient: "from-yellow-600 to-orange-700",
    desc: "Fragrant Biryani Made with Love",
    longDesc: "Chicken, mutton, veg, egg biryani — slow-cooked with aromatic spices.",
    cta: "Order Biryani Now",
  },
  Coldrink: {
    icon: "🥤", gradient: "from-sky-600 to-cyan-700",
    desc: "Chilled Drinks to Beat the Heat",
    longDesc: "Soft drinks, shakes, juices, mocktails & refreshing beverages for every thirst.",
    cta: "Order Drinks Now",
  },
  "Egg Rolls": {
    icon: "🌯", gradient: "from-red-600 to-rose-700",
    desc: "Crispy Egg Rolls with Spicy Fillings",
    longDesc: "Classic, double egg, chicken, paneer, cheese rolls with chutney dips.",
    cta: "Order Rolls Now",
  },
  Fruit: {
    icon: "🍇", gradient: "from-green-600 to-emerald-700",
    desc: "Fresh & Juicy Fruits for a Healthy Life",
    longDesc: "Handpicked apples, mangoes, bananas, oranges, grapes & more — farm-fresh and full of natural sweetness.",
    cta: "Order Fruits Now",
  },
  // ===== Boutique / Fashion =====
  Kurti: {
    icon: "👗", gradient: "from-rose-500 to-[#9E2B5E]",
    desc: "Handcrafted Kurtis for Everyday Grace",
    longDesc: "Cotton, rayon, chikankari & designer kurtis in sizes S–XL — elegant, breathable and effortlessly stylish.",
    cta: "Shop Kurtis",
  },
  Lehenga: {
    icon: "✨", gradient: "from-[#7B2C5E] to-[#B8860B]",
    desc: "Regal Lehengas for Weddings & Festivities",
    longDesc: "Bridal, festive & party lehengas with intricate embroidery, rich fabrics and matching dupattas.",
    cta: "Shop Lehengas",
  },
  Saree: {
    icon: "🥻", gradient: "from-[#8E2457] to-[#C9873F]",
    desc: "Timeless Sarees, Draped in Elegance",
    longDesc: "Kanjivaram, Banarasi, georgette & handloom sarees for every occasion — from daily wear to grand celebrations.",
    cta: "Shop Sarees",
  },
  Gown: {
    icon: "👑", gradient: "from-[#5B2A86] to-[#B76E79]",
    desc: "Evening & Party Gowns That Turn Heads",
    longDesc: "Flared, Anarkali, ruffle & velvet gowns designed to make every entrance unforgettable.",
    cta: "Shop Gowns",
  },
  Tshirt: {
    icon: "👚", gradient: "from-[#3E7CB1] to-[#B76E79]",
    desc: "Everyday T-Shirts & Tops in Premium Cotton",
    longDesc: "Soft, breathable and stylish tees, crops & tops for a comfortable, effortless everyday wardrobe.",
    cta: "Shop T-Shirts",
  },
};
