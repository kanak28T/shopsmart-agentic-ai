// ShopSmart AI — Product Catalog (64 products, prices in INR ₹)
// Images use Unsplash stable photo IDs; ProductCard falls back to a deterministic
// picsum image if any URL fails to load.

const img = (id) =>
  `https://images.unsplash.com/photo-${id}?w=500&q=80&auto=format&fit=crop`;

export const CATEGORIES = [
  "All",
  "Audio",
  "Camera",
  "Lighting",
  "Computing",
  "Outdoor",
  "Fitness",
  "Gaming",
  "Photography",
  "Office",
  "Travel",
];

export const PRODUCTS = [
  // ---------------- Audio (10) ----------------
  { id: "aud-01", name: "Shure SM7B Vocal Microphone", category: "Audio", subcategory: "microphone", price: 33000, rating: 4.8, reviews: 2143, image: img("1590602847861-f357a9332bbc"), description: "Professional cardioid dynamic mic for broadcast and podcasting.", tags: ["microphone", "audio", "podcasting"] },
  { id: "aud-02", name: "Rode NT-USB Condenser Mic", category: "Audio", subcategory: "microphone", price: 14000, rating: 4.6, reviews: 1320, image: img("1583394838336-acd977031acc"), description: "Studio-quality USB condenser microphone with pop filter.", tags: ["microphone", "audio", "podcasting"] },
  { id: "aud-03", name: "Audio-Technica AT2020", category: "Audio", subcategory: "microphone", price: 8200, rating: 4.7, reviews: 3811, image: img("1590602847861-f357a9332bbc"), description: "Side-address cardioid condenser mic for project studios.", tags: ["microphone", "audio", "podcasting"] },
  { id: "aud-04", name: "Focusrite Scarlett 2i2 Interface", category: "Audio", subcategory: "audio_interface", price: 15700, rating: 4.8, reviews: 5210, image: img("1610468295237-7b3e8b0c7b9e"), description: "2-in/2-out USB audio interface with preamps.", tags: ["audio_interface", "audio", "podcasting"] },
  { id: "aud-05", name: "PreSonus AudioBox USB 96", category: "Audio", subcategory: "audio_interface", price: 10700, rating: 4.5, reviews: 980, image: img("1610468295237-7b3e8b0c7b9e"), description: "Simple 2x2 USB recording interface for beginners.", tags: ["audio_interface", "audio", "podcasting"] },
  { id: "aud-06", name: "Beyerdynamic DT 770 Pro", category: "Audio", subcategory: "headphones", price: 13200, rating: 4.7, reviews: 4202, image: img("1505740420928-5e560c06d30e"), description: "Closed-back studio headphones, 80-ohm.", tags: ["headphones", "audio", "podcasting"] },
  { id: "aud-07", name: "Sony MDR-7506 Monitor Headphones", category: "Audio", subcategory: "headphones", price: 8200, rating: 4.8, reviews: 6233, image: img("1505740420928-5e560c06d30e"), description: "Closed-back dynamic monitor headphones.", tags: ["headphones", "audio", "podcasting"] },
  { id: "aud-08", name: "Rode PSA1 Boom Arm", category: "Audio", subcategory: "boom_arm", price: 9000, rating: 4.7, reviews: 1890, image: img("1580319361471-1c77b3f4f4d3"), description: "Dual-axis suspension broadcast boom arm.", tags: ["boom_arm", "audio", "podcasting"] },
  { id: "aud-09", name: "Auponic Metal Pop Filter", category: "Audio", subcategory: "pop_filter", price: 2000, rating: 4.5, reviews: 760, image: img("1610468295237-7b3e8b0c7b9e"), description: "Double-layer mesh pop filter for vocal recording.", tags: ["pop_filter", "audio", "podcasting"] },
  { id: "aud-10", name: "AmazonBasics XLR Cable 15ft", category: "Audio", subcategory: "xlr_cable", price: 1200, rating: 4.4, reviews: 2104, image: img("1516280440617-447e7e7e7e7e"), description: "Balanced 3-pin XLR male-to-female microphone cable.", tags: ["xlr_cable", "audio", "podcasting"] },

  // ---------------- Camera (6) ----------------
  { id: "cam-01", name: "Logitech C920x Webcam", category: "Camera", subcategory: "webcam", price: 6600, rating: 4.6, reviews: 8421, image: img("1521334884684-d80222895362"), description: "1080p HD webcam with auto-focus and stereo mic.", tags: ["webcam", "camera", "content_creation"] },
  { id: "cam-02", name: "Sony ZV-E10 Mirrorless Camera", category: "Camera", subcategory: "mirrorless_camera", price: 58000, rating: 4.7, reviews: 1190, image: img("1502920917128-1aa1c70e2bf7"), description: "APS-C vlog camera with interchangeable lens.", tags: ["mirrorless_camera", "camera", "content_creation"] },
  { id: "cam-03", name: "Canon EOS R50 Body", category: "Camera", subcategory: "mirrorless_camera", price: 56000, rating: 4.6, reviews: 870, image: img("1502920917128-1aa1c70e2bf7"), description: "24MP entry-level mirrorless with 4K video.", tags: ["mirrorless_camera", "camera", "content_creation"] },
  { id: "cam-04", name: "GoPro HERO12 Black", category: "Camera", subcategory: "action_camera", price: 33000, rating: 4.7, reviews: 1540, image: img("1502920917128-1aa1c70e2bf7"), description: "Waterproof action camera with 5.3K video.", tags: ["action_camera", "camera", "content_creation"] },
  { id: "cam-05", name: "Insta360 Link 4K Webcam", category: "Camera", subcategory: "webcam", price: 24800, rating: 4.5, reviews: 410, image: img("1521334884684-d80222895362"), description: "4K gimbal webcam with AI tracking.", tags: ["webcam", "camera", "content_creation"] },
  { id: "cam-06", name: "Panasonic Lumix G100", category: "Camera", subcategory: "mirrorless_camera", price: 41200, rating: 4.4, reviews: 530, image: img("1502920917128-1aa1c70e2bf7"), description: "Compact mirrorless built for vlogging.", tags: ["mirrorless_camera", "camera", "content_creation"] },

  // ---------------- Lighting (5) ----------------
  { id: "lit-01", name: "Elgato Key Light", category: "Lighting", subcategory: "key_light", price: 16500, rating: 4.7, reviews: 2210, image: img("1565849807714-c65b82f6c7df"), description: "App-controlled LED key light, 2500 lumens.", tags: ["key_light", "lighting", "content_creation"] },
  { id: "lit-02", name: "Ulanzi 18\" Ring Light", category: "Lighting", subcategory: "ring_light", price: 7400, rating: 4.5, reviews: 1340, image: img("1565849807714-c65b82f6c7df"), description: "Bi-color LED ring light with phone mount.", tags: ["ring_light", "lighting", "content_creation"] },
  { id: "lit-03", name: "Aputure Amaran 100d", category: "Lighting", subcategory: "led_panel", price: 13200, rating: 4.6, reviews: 720, image: img("1565849807714-c65b82f6c7df"), description: "Daylight LED panel with Bowens mount.", tags: ["led_panel", "lighting", "content_creation"] },
  { id: "lit-04", name: "GVM 2-Pack RGB Light Bars", category: "Lighting", subcategory: "led_panel", price: 9900, rating: 4.4, reviews: 690, image: img("1565849807714-c65b82f6c7df"), description: "App-controlled RGB tube lights, pair.", tags: ["led_panel", "lighting", "content_creation"] },
  { id: "lit-05", name: "Neewer Softbox Lighting Kit", category: "Lighting", subcategory: "softbox", price: 11500, rating: 4.5, reviews: 1980, image: img("1565849807714-c65b82f6c7df"), description: "2-softbox continuous lighting kit with stands.", tags: ["softbox", "lighting", "content_creation"] },

  // ---------------- Computing (6) ----------------
  { id: "cmp-01", name: "Raspberry Pi 4 Model B (4GB)", category: "Computing", subcategory: "single_board", price: 4600, rating: 4.7, reviews: 3204, image: img("1623419201815-2e2e2c6e2f4e"), description: "Quad-core single-board computer, 4GB RAM.", tags: ["single_board", "computing", "diy"] },
  { id: "cmp-02", name: "Arduino Uno Rev3 Kit", category: "Computing", subcategory: "single_board", price: 7400, rating: 4.6, reviews: 2510, image: img("1623419201815-2e2e2c6e2f4e"), description: "Starter kit with Uno board and components.", tags: ["single_board", "computing", "diy"] },
  { id: "cmp-03", name: "Samsung T7 Portable SSD 1TB", category: "Computing", subcategory: "storage", price: 8200, rating: 4.8, reviews: 5410, image: img("1591488321c3c7b1e1b1b1e"), description: "USB 3.2 external SSD, 1050 MB/s.", tags: ["storage", "computing"] },
  { id: "cmp-04", name: "Crucial 16GB DDR4 RAM", category: "Computing", subcategory: "memory", price: 3600, rating: 4.7, reviews: 4120, image: img("1591488321c3c7b1e1b1e"), description: "3200MHz SO-DIMM laptop memory module.", tags: ["memory", "computing"] },
  { id: "cmp-05", name: "Anker PowerCore 20000mAh", category: "Computing", subcategory: "power", price: 3200, rating: 4.8, reviews: 9821, image: img("1609592424476-9d5e7b3c3c3e"), description: "High-speed portable power bank, USB-C.", tags: ["power", "computing"] },
  { id: "cmp-06", name: "Intel NUC 12 Mini PC", category: "Computing", subcategory: "mini_pc", price: 45600, rating: 4.4, reviews: 410, image: img("1623419201815-2e2e2c6e2f4e"), description: "Compact mini PC with i5, 16GB RAM.", tags: ["mini_pc", "computing"] },

  // ---------------- Outdoor (8) ----------------
  { id: "out-01", name: "Osprey Atmos 65L Backpack", category: "Outdoor", subcategory: "backpack", price: 22400, rating: 4.8, reviews: 1820, image: img("1553062407-98eeb64c6a62"), description: "Men's backpacking pack with Anti-Gravity suspension.", tags: ["backpack", "outdoor", "backpacking"] },
  { id: "out-02", name: "Cascade Mountain Trekking Poles", category: "Outdoor", subcategory: "trekking_poles", price: 3200, rating: 4.6, reviews: 3210, image: img("1551632811-911a4f4f4f4e"), description: "Lightweight aluminum telescoping poles, pair.", tags: ["trekking_poles", "outdoor", "backpacking"] },
  { id: "out-03", name: "Coleman North Rim 0°F Sleeping Bag", category: "Outdoor", subcategory: "sleeping_bag", price: 9900, rating: 4.6, reviews: 1410, image: img("1504280390367-361c66d1348e"), description: "Cold-weather mummy bag rated to 0°F.", tags: ["sleeping_bag", "outdoor", "backpacking"] },
  { id: "out-04", name: "Sawyer Squeeze Water Filter", category: "Outdoor", subcategory: "water_filter", price: 3100, rating: 4.8, reviews: 6210, image: img("1607330289064-408e3e3c3c3e"), description: "0.1-micron hollow-fiber water filtration.", tags: ["water_filter", "outdoor", "backpacking"] },
  { id: "out-05", name: "MSR PocketRocket 2 Stove", category: "Outdoor", subcategory: "camping_stove", price: 3700, rating: 4.7, reviews: 2890, image: img("1504280390367-361c66d1348e"), description: "Ultralight canister camping stove.", tags: ["camping_stove", "outdoor", "backpacking"] },
  { id: "out-06", name: "Petzl Tikka Headlamp", category: "Outdoor", subcategory: "headlamp", price: 2400, rating: 4.6, reviews: 3110, image: img("1565086858480-9e4f4f4f4f4e"), description: "350-lumen compact LED headlamp.", tags: ["headlamp", "outdoor", "backpacking"] },
  { id: "out-07", name: "Coleman Sundome 4 Tent", category: "Outdoor", subcategory: "tent", price: 8200, rating: 4.6, reviews: 4120, image: img("1504280390367-361c66d1348e"), description: "4-person dome tent, weather-resistant.", tags: ["tent", "outdoor", "backpacking"] },
  { id: "out-08", name: "ENO DoubleNest Hammock", category: "Outdoor", subcategory: "hammock", price: 5700, rating: 4.8, reviews: 5210, image: img("1504280390367-361c66d1348e"), description: "Lightweight portable parachute hammock.", tags: ["hammock", "outdoor", "backpacking"] },

  // ---------------- Fitness (7) ----------------
  { id: "fit-01", name: "Garmin Fenix 7 GPS Watch", category: "Fitness", subcategory: "gps_watch", price: 58000, rating: 4.8, reviews: 1610, image: img("1523275335684-37898b6baf30"), description: "Multisport GPS smartwatch with solar charging.", tags: ["gps_watch", "fitness", "home_gym"] },
  { id: "fit-02", name: "Theragun Prime Massage Gun", category: "Fitness", subcategory: "massage_gun", price: 24800, rating: 4.7, reviews: 2310, image: img("1583454110551-3c7b3e3c3c3e"), description: "Quiet percussive therapy device, 4 attachments.", tags: ["massage_gun", "fitness", "home_gym"] },
  { id: "fit-03", name: "Fit Simplify Resistance Bands", category: "Fitness", subcategory: "resistance_bands", price: 1700, rating: 4.6, reviews: 8821, image: img("1517836357463-d2676c3c3c3e"), description: "5-band loop set with carry bag.", tags: ["resistance_bands", "fitness", "home_gym"] },
  { id: "fit-04", name: "Bowflex SelectTech 552 Dumbbells", category: "Fitness", subcategory: "dumbbells", price: 35600, rating: 4.8, reviews: 3410, image: img("1517836357463-d2676c3c3c3e"), description: "Adjustable dumbbells, 5-52.5 lbs per pair.", tags: ["dumbbells", "fitness", "home_gym"] },
  { id: "fit-05", name: "Manduka PRO Yoga Mat", category: "Fitness", subcategory: "yoga_mat", price: 11400, rating: 4.7, reviews: 2910, image: img("1518310383802-740c3c3c3c3e"), description: "Dense cushioned yoga mat, lifetime guarantee.", tags: ["yoga_mat", "fitness", "home_gym"] },
  { id: "fit-06", name: "Optimum Gold Standard Whey 5lb", category: "Fitness", subcategory: "protein_powder", price: 6600, rating: 4.8, reviews: 7210, image: img("1599448333c3c7b1e1b1b1e"), description: "24g protein per serving whey isolate blend.", tags: ["protein_powder", "fitness", "home_gym"] },
  { id: "fit-07", name: "TriggerPoint GRID Foam Roller", category: "Fitness", subcategory: "foam_roller", price: 2800, rating: 4.7, reviews: 4210, image: img("1518310383802-740c3c3c3c3e"), description: "Textured foam roller for muscle recovery.", tags: ["foam_roller", "fitness", "home_gym"] },

  // ---------------- Gaming (5) ----------------
  { id: "gam-01", name: "SteelSeries Arctis Nova 7 Headset", category: "Gaming", subcategory: "gaming_headset", price: 12400, rating: 4.6, reviews: 2310, image: img("1505740420928-5e560c06d30e"), description: "Wireless multi-platform gaming headset.", tags: ["gaming_headset", "gaming", "gaming_rig"] },
  { id: "gam-02", name: "Elgato HD60 X Capture Card", category: "Gaming", subcategory: "capture_card", price: 16600, rating: 4.6, reviews: 1310, image: img("1521334884684-d80222895362"), description: "4K30 / 1080p60 USB capture card.", tags: ["capture_card", "gaming", "gaming_rig"] },
  { id: "gam-03", name: "LG UltraGear 27\" 165Hz Monitor", category: "Gaming", subcategory: "gaming_monitor", price: 27300, rating: 4.7, reviews: 1810, image: img("1527443224154-c4a39c3c3c3e"), description: "QHD IPS gaming monitor, 1ms, G-Sync.", tags: ["gaming_monitor", "gaming", "gaming_rig"] },
  { id: "gam-04", name: "Razer Huntsman Keyboard", category: "Gaming", subcategory: "keyboard", price: 10700, rating: 4.6, reviews: 2210, image: img("1587829743061-f7da0d3c3c3e"), description: "Optical mechanical gaming keyboard.", tags: ["keyboard", "gaming", "gaming_rig"] },
  { id: "gam-05", name: "Logitech G Pro X Mouse", category: "Gaming", subcategory: "mouse", price: 6600, rating: 4.7, reviews: 3410, image: img("1527814050087-379381547c3c"), description: "LIGHTSPEED wireless esports mouse.", tags: ["mouse", "gaming", "gaming_rig"] },

  // ---------------- Photography (6) ----------------
  { id: "pho-01", name: "Peak Design Camera Backpack 30L", category: "Photography", subcategory: "camera_bag", price: 23200, rating: 4.8, reviews: 1810, image: img("1553062407-98eeb64c6a62"), description: "Everyday backpack with origami dividers.", tags: ["camera_bag", "photography", "content_creation"] },
  { id: "pho-02", name: "Manfrotto Befree Advanced Tripod", category: "Photography", subcategory: "tripod", price: 14000, rating: 4.7, reviews: 2010, image: img("1502920917128-1aa1c70e2bf7"), description: "Lightweight travel tripod, 8lb load.", tags: ["tripod", "photography", "content_creation"] },
  { id: "pho-03", name: "SanDisk Extreme PRO SD 128GB", category: "Photography", subcategory: "sd_card", price: 4100, rating: 4.8, reviews: 9210, image: img("1591488321c3c7b1e1b1b1e"), description: "UHS-I V30 200MB/s SD card.", tags: ["sd_card", "photography", "content_creation"] },
  { id: "pho-04", name: "Sigma 35mm f/1.4 Art Lens", category: "Photography", subcategory: "lens", price: 74600, rating: 4.8, reviews: 1110, image: img("1516035034384-f1d1e3c014a9"), description: "Fast prime Art-series lens for full-frame.", tags: ["lens", "photography", "content_creation"] },
  { id: "pho-05", name: "DJI RS 3 Mini Gimbal", category: "Photography", subcategory: "gimbal", price: 30600, rating: 4.6, reviews: 710, image: img("1502920917128-1aa1c70e2bf7"), description: "3-axis stabilizer for mirrorless cameras.", tags: ["gimbal", "photography", "content_creation"] },
  { id: "pho-06", name: "Altura Photo Lens Cleaning Kit", category: "Photography", subcategory: "accessory", price: 1600, rating: 4.5, reviews: 5210, image: img("1516035034384-f1d1e3c014a9"), description: "Cleaning pen, blower, cloth and solution.", tags: ["accessory", "photography", "content_creation"] },

  // ---------------- Office (6) ----------------
  { id: "off-01", name: "Ergotron LX Monitor Arm", category: "Office", subcategory: "monitor_arm", price: 11500, rating: 4.7, reviews: 2210, image: img("1587829743061-f7da0d3c3c3e"), description: "Side-by-side dual monitor desk mount.", tags: ["monitor_arm", "office"] },
  { id: "off-02", name: "Keychron K2 Mechanical Keyboard", category: "Office", subcategory: "keyboard", price: 8200, rating: 4.7, reviews: 3210, image: img("1587829743061-f7da0d3c3c3e"), description: "Wireless 75% mechanical keyboard, hot-swap.", tags: ["keyboard", "office"] },
  { id: "off-03", name: "Logitech MX Master 3S Mouse", category: "Office", subcategory: "mouse", price: 8200, rating: 4.8, reviews: 6210, image: img("1527814050087-379381547c3c"), description: "Premium wireless mouse, 8K DPI.", tags: ["mouse", "office"] },
  { id: "off-04", name: "Anker 555 USB-C Hub 7-in-1", category: "Office", subcategory: "usb_hub", price: 3200, rating: 4.6, reviews: 4210, image: img("1587829743061-f7da0d3c3c3e"), description: "HDMI, SD, USB-A and 100W passthrough.", tags: ["usb_hub", "office"] },
  { id: "off-05", name: "Roost Laptop Stand", category: "Office", subcategory: "laptop_stand", price: 7400, rating: 4.6, reviews: 1810, image: img("1587829743061-f7da0d3c3c3e"), description: "Folding adjustable laptop stand.", tags: ["laptop_stand", "office"] },
  { id: "off-06", name: "Yamazaki Desk Mat Large", category: "Office", subcategory: "desk_mat", price: 2400, rating: 4.5, reviews: 1410, image: img("1587829743061-f7da0d3c3c3e"), description: "Waterproof PU leather desk pad.", tags: ["desk_mat", "office"] },

  // ---------------- Travel (5) ----------------
  { id: "trv-01", name: "Anker 737 GaN Charger 100W", category: "Travel", subcategory: "gan_charger", price: 6600, rating: 4.7, reviews: 3210, image: img("1609592424476-9d5e7b3c3c3e"), description: "Compact 3-port GaN wall charger.", tags: ["gan_charger", "travel"] },
  { id: "trv-02", name: "Sony WH-1000XM5 ANC Headphones", category: "Travel", subcategory: "anc_headphones", price: 33000, rating: 4.8, reviews: 5210, image: img("1505740420928-5e560c06d30e"), description: "Industry-leading noise-cancelling headphones.", tags: ["anc_headphones", "travel"] },
  { id: "trv-03", name: "Peak Design Travel Backpack 45L", category: "Travel", subcategory: "travel_pack", price: 26600, rating: 4.8, reviews: 1610, image: img("1553062407-98eeb64c6a62"), description: "Carry-on travel pack with packing system.", tags: ["travel_pack", "travel"] },
  { id: "trv-04", name: "Ceptics World Travel Adapter", category: "Travel", subcategory: "adapter", price: 2400, rating: 4.6, reviews: 2810, image: img("1609592424476-9d5e7b3c3c3e"), description: "Universal plug adapter, 100+ countries.", tags: ["adapter", "travel"] },
  { id: "trv-05", name: "Bagail Packing Cubes 6-Piece", category: "Travel", subcategory: "packing_cubes", price: 2100, rating: 4.7, reviews: 4210, image: img("1553062407-98eeb64c6a62"), description: "Set of 6 lightweight luggage organizers.", tags: ["packing_cubes", "travel"] },
];

export const getProductById = (id) => PRODUCTS.find((p) => p.id === id);