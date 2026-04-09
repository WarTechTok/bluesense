// src/constants/packages.js
// ============================================
// PACKAGES - All package data, prices, and booking rules
// ============================================

export const OASIS1_PACKAGES = [
  {
    id: "oasis1-package-1",
    name: "Package 1",
    image: "/images/packages/oasis1/package-1.jpg",
    subtitle: "No Room — Cottage Only",
    capacity: "Up to 20 pax",
    inclusions: [
      "Swimming pool with bubble jacuzzi & fountain",
      "Cottage (Gazebo) & kubo cottage near parking",
      "Free WiFi",
      "Portable griller",
      "All outside amenities",
    ],
    addons: [
      { name: "Karaoke", price: 700 },
      { name: "Stove (10hrs)", price: 200 },
      { name: "Stove (22hrs)", price: 400 },
    ],
    sessions: ["Day", "Night"],
    pricing: {
      weekday: { Day: 5999, Night: 6400 },
      weekend: { Day: 6400, Night: 6800 },
    },
  },
  {
    id: "oasis1-package-2",
    name: "Package 2",
    image: "/images/packages/oasis1/package-2.jpg",
    subtitle: "1 AC Superior Room",
    capacity: "2–4 sleeping capacity",
    inclusions: [
      "Swimming pool with bubble jacuzzi & fountain",
      "Cottage (Gazebo) & kubo cottage near parking",
      "AC Superior Room (2–4 sleeping capacity)",
      "Smart TV with Netflix",
      "Free WiFi",
      "Portable griller",
      "Cooler",
      "All outside amenities",
    ],
    addons: [
      { name: "Karaoke", price: 700 },
      { name: "Stove (10hrs)", price: 200 },
      { name: "Stove (22hrs)", price: 400 },
    ],
    sessions: ["Day", "Night", "22hrs"],
    pricing: {
      weekday: { Day: 9000, Night: 10000, "22hrs": 15000 },
      weekend: { Day: 9500, Night: 10500, "22hrs": 16000 },
    },
  },
  {
    id: "oasis1-package-3",
    name: "Package 3",
    image: "/images/packages/oasis1/package-3.jpg",
    subtitle: "1 AC Family Room",
    capacity: "8–12 sleeping capacity",
    inclusions: [
      "Swimming pool with bubble jacuzzi & fountain",
      "Cottage (Gazebo) & kubo cottage near parking",
      "AC Family Room (8–12 sleeping capacity)",
      "Smart TV with Netflix & Fridge",
      "Free WiFi",
      "Portable griller",
      "Cooler",
      "All outside amenities",
    ],
    addons: [
      { name: "Karaoke", price: 700 },
      { name: "Stove (10hrs)", price: 200 },
      { name: "Stove (22hrs)", price: 400 },
    ],
    sessions: ["Day", "Night", "22hrs"],
    pricing: {
      weekday: { Day: 9500, Night: 10500, "22hrs": 16000 },
      weekend: { Day: 10000, Night: 11000, "22hrs": 17000 },
    },
  },
  {
    id: "oasis1-package-4",
    name: "Package 4",
    image: "/images/packages/oasis1/package-4.jpg",
    subtitle: "2 AC Rooms",
    capacity: "12–15 sleeping capacity",
    inclusions: [
      "Swimming pool with bubble jacuzzi & fountain",
      "Cottage (Gazebo) & kubo cottage near parking",
      "AC Family Room + Superior Room",
      "Smart TV with Netflix & Fridge",
      "Free WiFi",
      "Portable griller",
      "Cooler",
      "All outside amenities",
    ],
    addons: [
      { name: "Karaoke", price: 700 },
      { name: "Stove (10hrs)", price: 200 },
      { name: "Stove (22hrs)", price: 400 },
    ],
    sessions: ["Day", "Night", "22hrs"],
    pricing: {
      weekday: { Day: 10000, Night: 11000, "22hrs": 17000 },
      weekend: { Day: 10500, Night: 11500, "22hrs": 18000 },
    },
  },
  {
    id: "oasis1-package-5",
    name: "Package 5",
    image: "/images/packages/oasis1/package-5.jpg",
    subtitle: "4 AC Rooms",
    capacity: "22–25 sleeping capacity",
    inclusions: [
      "Swimming pool with bubble jacuzzi & fountain",
      "Cottage (Gazebo) & kubo cottage near parking",
      "2 AC Family Rooms + 2 AC Superior Rooms",
      "Smart TV with Netflix & Fridge",
      "Free WiFi",
      "Portable griller",
      "Cooler",
      "All outside amenities",
    ],
    addons: [
      { name: "Karaoke", price: 700 },
      { name: "Stove (10hrs)", price: 200 },
      { name: "Stove (22hrs)", price: 400 },
    ],
    sessions: ["Day", "Night", "22hrs"],
    pricing: {
      weekday: { Day: 14200, Night: 14600, "22hrs": 19400 },
      weekend: { Day: 15600, Night: 16000, "22hrs": 21200 },
    },
  },
  {
    id: "oasis1-package-5plus",
    name: "Package 5+",
    image: "/images/packages/oasis1/package-5plus.jpg",
    subtitle: "4 AC Rooms — Large Group",
    capacity: "30–50 pax",
    inclusions: [
      "Swimming pool with bubble jacuzzi & fountain",
      "Cottage (Gazebo) & kubo cottage near parking",
      "2 AC Family Rooms + 2 AC Superior Rooms",
      "Smart TV with Netflix & Fridge",
      "Free WiFi",
      "Portable griller",
      "Cooler",
      "All outside amenities",
    ],
    addons: [
      { name: "Karaoke", price: 700 },
      { name: "Stove (10hrs)", price: 200 },
      { name: "Stove (22hrs)", price: 400 },
    ],
    sessions: ["Day", "Night", "22hrs"],
    pricing: {
      weekday: { Day: 17000, Night: 18000, "22hrs": 25000 },
      weekend: { Day: 20000, Night: 21000, "22hrs": 30000 },
    },
  },
];

export const OASIS2_PACKAGES = [
  {
    id: "oasis2-package-a",
    name: "Package A",
    image: "/images/packages/oasis2/package-a.jpg",
    subtitle: "No Room",
    capacity: "Up to 30 pax",
    inclusions: [
      "Pool & all open spaces",
      "Free WiFi",
      "Griller",
    ],
    addons: [
      { name: "Karaoke", price: null },
      { name: "Stove", price: null },
    ],
    sessions: ["Day", "Night"],
    pricing: {
      weekday: { Day: 7500, Night: 8500 },
      weekend: { Day: 10000, Night: 11000 },
    },
  },
  {
    id: "oasis2-package-b",
    name: "Package B",
    image: "/images/packages/oasis2/package-b.jpg",
    subtitle: "1 AC Family Room",
    capacity: "Up to 30 pax",
    inclusions: [
      "Pool & all open spaces",
      "Free WiFi",
      "AC Family Room with Fridge",
      "Smart TV with Netflix",
      "Griller",
    ],
    addons: [
      { name: "Karaoke", price: null },
      { name: "Stove", price: null },
    ],
    sessions: ["Day", "Night", "22hrs"],
    pricing: {
      weekday: { Day: 9000, Night: 10000, "22hrs": 16500 },
      weekend: { Day: 12000, Night: 12500, "22hrs": 20000 },
    },
  },
  {
    id: "oasis2-package-c",
    name: "Package C",
    image: "/images/packages/oasis2/package-c.jpg",
    subtitle: "Events — Large Group",
    capacity: "50–100 pax",
    inclusions: [
      "Pool & all open spaces",
      "Free WiFi",
      "AC Family Room with Fridge",
      "Smart TV with Netflix",
      "Griller",
    ],
    addons: [
      { name: "Karaoke", price: null },
      { name: "Stove", price: null },
    ],
    sessions: ["Day", "Night", "22hrs"],
    pricing: {
      "50pax": { Day: 19000, Night: 20000, "22hrs": 26000 },
      "100pax": { Day: 20000, Night: 21000, "22hrs": 30000 },
    },
  },
];

export const PAYMENT_METHODS = ["GCash", "Maya", "GoTyme", "SeaBank", "Cash"];

// ============================================
// BOOKING RULES - CLEAN, NO ICONS
// ============================================

export const BOOKING_RULES = [
  { title: "Downpayment", desc: "₱3,000 for Day/Night · ₱5,000 for 22-hour packages (non-refundable)" },
  { title: "Incidental Fee", desc: "₱1,000 collected before check-in, refundable upon checkout" },
  { title: "Extra Person", desc: "₱150 per person beyond the package capacity" },
  { title: "Check-in / Check-out", desc: "Check-in: 8:00 AM · Check-out: 6:00 PM" },
  { title: "Rescheduling", desc: "Allowed at least 1 week before booking date" },
  { title: "Valid ID Required", desc: "Present 1 valid government-issued ID upon arrival" },
];