/**
 * Comprehensive North Eastern Physical Geographic & Terrain Dataset
 * Includes: Mountain Peaks, Alpine Passes, River Basins, Forest Corridors,
 * National Parks, and High-Resolution Contour Markers.
 */

export const NER_GEOGRAPHIC_TERRAIN_FEATURES = [
  // Major Mountain Peaks & High Passes
  { name: "Gorichen Peak", elevation: 6488, type: "MOUNTAIN_PEAK", lat: 27.8100, lng: 92.4200, state: "Arunachal Pradesh", desc: "Highest peak in Eastern Arunachal, glaciated crest" },
  { name: "Kangto Peak", elevation: 7060, type: "MOUNTAIN_PEAK", lat: 27.8600, lng: 92.5300, state: "Arunachal Pradesh", desc: "Permanent snowfield & trans-Himalayan divide" },
  { name: "Sela Pass Alpine Crest", elevation: 4170, type: "CRITICAL_PASS", lat: 27.5034, lng: 92.1037, state: "Arunachal Pradesh", desc: "Key military highway pass connecting Bomdila to Tawang" },
  { name: "Bum La Pass", elevation: 4633, type: "BORDER_PASS", lat: 27.7200, lng: 91.9000, state: "Arunachal Pradesh", desc: "Strategic Sino-Indian border pass north of Tawang" },
  { name: "Japfu Peak", elevation: 3048, type: "MOUNTAIN_PEAK", lat: 25.6000, lng: 94.0700, state: "Nagaland", desc: "Second highest peak in Nagaland, famous rhododendron sanctuary" },
  { name: "Saramati Peak", elevation: 3841, type: "MOUNTAIN_PEAK", lat: 25.7400, lng: 95.0300, state: "Nagaland", desc: "Highest point of Patkai Range on Indo-Myanmar border" },
  { name: "Phawngpui (Blue Mountain)", elevation: 2157, type: "MOUNTAIN_PEAK", lat: 22.6300, lng: 93.0500, state: "Mizoram", desc: "Highest peak in Mizoram, Lushai Hills biosphere" },
  { name: "Shillong Peak", elevation: 1965, type: "MOUNTAIN_PEAK", lat: 25.5300, lng: 91.8700, state: "Meghalaya", desc: "Highest point in Khasi Hills plateau, radar airbase" },
  { name: "Nathula Pass", elevation: 4310, type: "BORDER_PASS", lat: 27.3800, lng: 88.8300, state: "Sikkim", desc: "Historic Silk Route Himalayan pass into Tibet" },
  { name: "Kanchenjunga Range Base", elevation: 5200, type: "MOUNTAIN_PEAK", lat: 27.7000, lng: 88.1500, state: "Sikkim", desc: "Glacial massif & UNESCO World Heritage bio-corridor" },

  // River Basins & Waterway Corridors
  { name: "Brahmaputra River Basin", elevation: 45, type: "RIVER_BASIN", lat: 26.2500, lng: 92.5000, state: "Assam", desc: "National Waterway NW-2, primary alluvial floodplain" },
  { name: "Kameng River Gorge", elevation: 320, type: "RIVER_GORGE", lat: 27.0500, lng: 92.6200, state: "Arunachal Pradesh", desc: "Deep Himalayan gorge cut along NH-13 highway" },
  { name: "Teesta River Canyon", elevation: 210, type: "RIVER_GORGE", lat: 27.0200, lng: 88.4800, state: "Sikkim / WB", desc: "Monsoon torrential canyon along NH-10 Siliguri-Gangtok" },
  { name: "Barak River Valley", elevation: 30, type: "RIVER_BASIN", lat: 24.8500, lng: 92.8000, state: "Assam", desc: "Cachar-Silchar tea & transshipment basin" },
  { name: "Umngot River Gorge", elevation: 95, type: "RIVER_GORGE", lat: 25.2000, lng: 92.0200, state: "Meghalaya", desc: "Crystal clear border river basin at Dawki" },

  // Biosphere & Forest Corridors
  { name: "Kaziranga Elephant Corridor", elevation: 65, type: "BIO_CORRIDOR", lat: 26.5800, lng: 93.3000, state: "Assam", desc: "High animal movement corridor along NH-27 (40 km/h speed limit)" },
  { name: "Nameri Tiger Foothills", elevation: 120, type: "BIO_CORRIDOR", lat: 26.9200, lng: 92.8200, state: "Assam", desc: "Sub-Himalayan dense forest fringe" },
  { name: "Dzukou Valley Alpine Meadow", elevation: 2452, type: "BIO_CORRIDOR", lat: 25.5500, lng: 94.0500, state: "Nagaland/Manipur", desc: "High mountain eco-valley between Kohima and Senapati" }
];

export const NER_DISTRICTS_DATA = [
  { id: 1, name: "Kamrup Metropolitan", state: "Assam", stateCode: "AS", elevation: 55, terrain: "River Basin", difficulty: 2, vulnerability: "35%", highway: "NH-27" },
  { id: 2, name: "Tawang", state: "Arunachal Pradesh", stateCode: "AR", elevation: 3048, terrain: "High Altitude Mountain", difficulty: 9, vulnerability: "85%", highway: "NH-13" },
  { id: 3, name: "East Khasi Hills", state: "Meghalaya", stateCode: "ML", elevation: 1525, terrain: "Hill Ridge", difficulty: 6, vulnerability: "78%", highway: "NH-6" },
  { id: 4, name: "Kohima", state: "Nagaland", stateCode: "NL", elevation: 1444, terrain: "Hill Ridge", difficulty: 7, vulnerability: "72%", highway: "NH-29" },
  { id: 5, name: "Imphal West", state: "Manipur", stateCode: "MN", elevation: 786, terrain: "River Basin", difficulty: 5, vulnerability: "55%", highway: "NH-2" },
  { id: 6, name: "Aizawl", state: "Mizoram", stateCode: "MZ", elevation: 1132, terrain: "Hill Ridge", difficulty: 8, vulnerability: "68%", highway: "NH-306" },
  { id: 7, name: "West Tripura", state: "Tripura", stateCode: "TR", elevation: 15, terrain: "Floodplain", difficulty: 3, vulnerability: "45%", highway: "NH-8" },
  { id: 8, name: "Gangtok", state: "Sikkim", stateCode: "SK", elevation: 1650, terrain: "High Mountain", difficulty: 9, vulnerability: "88%", highway: "NH-10" },
];

export const NER_WAREHOUSES_DATA = [
  {
    id: 1,
    code: "WH-GHY-CENTRAL",
    name: "Guwahati Central Gateway Logistics Hub",
    state: "Assam",
    stateCode: "AS",
    lat: 26.1445,
    lng: 91.7362,
    elevation: 55,
    capacityMT: 12000,
    stockMT: 7850,
    coldStorageMT: 3500,
    emergencyStockMT: 2000,
    helipad: true,
    amenities: ["24/7 Heavy Fuel", "EV Fast Charger", "Driver Rest Dorm", "Repair Workshop"],
    contact: "Pranab Barman (+91-94350-11223)"
  },
  {
    id: 2,
    code: "WH-TEZ-TRANSIT",
    name: "Tezpur Strategic Transit Hub",
    state: "Assam",
    stateCode: "AS",
    lat: 26.6528,
    lng: 92.7926,
    elevation: 48,
    capacityMT: 6000,
    stockMT: 4100,
    coldStorageMT: 1500,
    emergencyStockMT: 1200,
    helipad: true,
    amenities: ["Bridge Support Base", "Heavy Axle Scales", "Driver Dorm"],
    contact: "Debajit Saikia (+91-94351-44556)"
  },
  {
    id: 3,
    code: "WH-BOM-MOUNTAIN",
    name: "Bomdila High-Altitude Staging Base",
    state: "Arunachal Pradesh",
    stateCode: "AR",
    lat: 27.2645,
    lng: 92.4159,
    elevation: 2415,
    capacityMT: 3500,
    stockMT: 2800,
    coldStorageMT: 800,
    emergencyStockMT: 1500,
    helipad: true,
    amenities: ["Oxygen Refill Bank", "Heated Dorms", "4x4 Snow Chain Depot", "BRO Co-location"],
    contact: "Major T. Norbu (+91-94360-77889)"
  },
  {
    id: 4,
    code: "WH-TAW-BORDER",
    name: "Tawang Forward Logistics Depot",
    state: "Arunachal Pradesh",
    stateCode: "AR",
    lat: 27.5861,
    lng: 91.8653,
    elevation: 3048,
    capacityMT: 2500,
    stockMT: 1950,
    coldStorageMT: 500,
    emergencyStockMT: 1100,
    helipad: true,
    amenities: ["Strategic Cold Vault", "Drone Pad Active", "Emergency Radio Relays"],
    contact: "Dorjee Khandu (+91-94362-33445)"
  },
  {
    id: 5,
    code: "WH-SHL-COLD",
    name: "Shillong Cold-Chain Life Science Vault",
    state: "Meghalaya",
    stateCode: "ML",
    lat: 25.5788,
    lng: 91.8933,
    elevation: 1525,
    capacityMT: 4500,
    stockMT: 3100,
    coldStorageMT: 2500,
    emergencyStockMT: 800,
    helipad: false,
    amenities: ["Pharma Temperature Loggers", "Backup Generators", "Rapid Drone Launch Base"],
    contact: "Dr. Patricia Mukhim (+91-94361-99881)"
  },
  {
    id: 6,
    code: "WH-DMR-RAIL",
    name: "Dimapur Intermodal Rail Freight Terminal",
    state: "Nagaland",
    stateCode: "NL",
    lat: 25.9090,
    lng: 93.7270,
    elevation: 145,
    capacityMT: 8000,
    stockMT: 5200,
    coldStorageMT: 1200,
    emergencyStockMT: 1000,
    helipad: false,
    amenities: ["Rail Siding 24/7", "Container Gantry", "Bulk Grain Silos"],
    contact: "Imlikaba Jamir (+91-94360-12345)"
  },
  {
    id: 7,
    code: "WH-KOH-HILL",
    name: "Kohima Ridge Emergency Relief Center",
    state: "Nagaland",
    stateCode: "NL",
    lat: 25.6751,
    lng: 94.1086,
    elevation: 1444,
    capacityMT: 3000,
    stockMT: 2100,
    coldStorageMT: 600,
    emergencyStockMT: 900,
    helipad: true,
    amenities: ["Disaster Response Command", "Mobile Satellite Terminal", "Fleet Workshop"],
    contact: "Vitsalie Zhasa (+91-94364-55667)"
  },
  {
    id: 8,
    code: "WH-IMP-VALLEY",
    name: "Imphal Valley Food & Vaccine Reservoir",
    state: "Manipur",
    stateCode: "MN",
    lat: 24.8170,
    lng: 93.9368,
    elevation: 786,
    capacityMT: 5000,
    stockMT: 3400,
    coldStorageMT: 1800,
    emergencyStockMT: 1200,
    helipad: true,
    amenities: ["Solar Cold Rooms", "Convoy Security Escort Post", "Fuel Storage"],
    contact: "N. Biren Singh (+91-94360-66778)"
  }
];

export const NER_HYBRID_NODES_DATA = [
  { id: 1, code: "NODE-GHY-AIRPORT", name: "LGBI Airport Cargo Complex", type: "AIR_CARGO", state: "AS", lat: 26.1061, lng: 91.5859, capacityTons: 1500, status: "OPERATIONAL" },
  { id: 2, code: "NODE-BOGIBEEL-BRIDGE", name: "Bogibeel Rail-Road Terminal", type: "INTERMODAL_BRIDGE", state: "AS", lat: 27.4000, lng: 94.9000, capacityTons: 5000, status: "OPERATIONAL" },
  { id: 3, code: "NODE-DMR-RAIL", name: "Dimapur Railway Freight Siding", type: "RAILHEAD", state: "NL", lat: 25.9090, lng: 93.7270, capacityTons: 2500, status: "OPERATIONAL" },
  { id: 4, code: "NODE-MOR-BORDER", name: "Moreh Integrated Border Checkpost", type: "BORDER_POST", state: "MN", lat: 24.2442, lng: 94.3025, capacityTons: 800, status: "OPERATIONAL" },
  { id: 5, code: "NODE-DAW-BORDER", name: "Dawki Land Customs Station", type: "BORDER_POST", state: "ML", lat: 25.1834, lng: 92.0167, capacityTons: 600, status: "OPERATIONAL" },
];

export const NER_LOGISTICS_NODES_DATA = NER_HYBRID_NODES_DATA;

export const INITIAL_ACTIVE_INCIDENTS = [
  {
    id: "INC-2026-SELA-001",
    hazardType: "LANDSLIDE",
    severity: "CRITICAL",
    lat: 27.5034,
    lng: 92.1037,
    roadName: "NH-13 (Trans-Arunachal Highway)",
    landmark: "Sela Pass North Approach (Elevation 4,170m)",
    description: "Massive rock boulder slide blocking both lanes. Clearance crew actively operating.",
    clearanceHours: 10,
    clearancePercent: 45,
    passableBy4x4: false,
    verified: true,
    status: "OFFICIAL_VERIFIED",
    verifiedBy: "BRO Task Force 88 (Maj. T. Norbu)",
    reportedBy: "BRO Alpine Patrol",
    reporterRole: "ROLE_BRO_INSPECTOR",
    machineryDeployed: "2x Heavy Excavators & Rock Breakers On-Site",
    rainfallMm: 145,
    reportedTime: "2 hours ago",
    clearanceUpdates: [
      { time: "2 hours ago", author: "BRO Task Force 88", message: "2x Komatsu PC210 Excavators mobilized to Sela North portal. Rock blasting completed.", progressPercent: 20 },
      { time: "45 mins ago", author: "Maj. T. Norbu", message: "45% debris removed from inbound lane. Target opening for emergency 4x4 convoys by 19:00 IST.", progressPercent: 45 }
    ]
  },
  {
    id: "INC-2026-PAGLA-002",
    hazardType: "ROAD_SUBSIDENCE",
    severity: "HIGH",
    lat: 25.7920,
    lng: 93.9170,
    roadName: "NH-29 (Dimapur-Kohima Road)",
    landmark: "Pagla Pahar Gorge section",
    description: "Road shoulder sinking into gorge due to continuous rain. Single lane regulated crawl for 4x4 only.",
    clearanceHours: 4,
    clearancePercent: 70,
    passableBy4x4: true,
    verified: true,
    status: "OFFICIAL_VERIFIED",
    verifiedBy: "Nagaland PWD / BRO",
    reportedBy: "State Highway Patrol",
    reporterRole: "ROLE_BRO_INSPECTOR",
    machineryDeployed: "Piling Rig & Traffic Marshall Escort Active",
    rainfallMm: 92,
    reportedTime: "4 hours ago",
    clearanceUpdates: [
      { time: "3 hours ago", author: "Nagaland PWD", message: "Gorge shoulder stabilization pillars inserted. Shingle gravel laid.", progressPercent: 50 },
      { time: "1 hour ago", author: "BRO Engineer", message: "70% stabilized. Single lane regulated crawl operating smoothly under marshal supervision.", progressPercent: 70 }
    ]
  },
  {
    id: "INC-2026-SONA-003",
    hazardType: "FLASH_FLOOD",
    severity: "MEDIUM",
    lat: 25.1250,
    lng: 92.3500,
    roadName: "NH-6 (Meghalaya-Barak Valley)",
    landmark: "Sonapur Mudslide Zone",
    description: "Waterlogging and mud deposits over culvert #14. Medium vehicles moving with caution.",
    clearanceHours: 1.5,
    clearancePercent: 85,
    passableBy4x4: true,
    verified: true,
    status: "OFFICIAL_VERIFIED",
    verifiedBy: "Meghalaya Police Highway Patrol",
    reportedBy: "Meghalaya Police Patrol",
    reporterRole: "ROLE_BRO_INSPECTOR",
    machineryDeployed: "Water Pump Sump & Escort Assigned",
    rainfallMm: 110,
    reportedTime: "1 hour ago",
    clearanceUpdates: [
      { time: "1 hour ago", author: "Highway Patrol", message: "High-capacity submersible water pumps cleared 85% floodwater. Traffic flowing steadily.", progressPercent: 85 }
    ]
  }
];

export const INITIAL_FLEET_VEHICLES = [
  {
    vehicleId: "NER-TRUCK-AS01-9921",
    driverName: "Biren Gogoi",
    type: "HEAVY_COMMERCIAL",
    lat: 25.5788,
    lng: 91.8933,
    altitude: 1525,
    speedKmh: 48,
    heading: 110,
    engineTemp: 84,
    fuel: 72,
    battery: 95,
    cargo: "Medical Vaccines & Critical Relief (4,200 kg)",
    status: "EN_ROUTE",
    origin: "Guwahati",
    destination: "Silchar",
    nextStop: "Khliehriat Mountain Toll",
    etaMinutes: 180
  },
  {
    vehicleId: "NER-4X4-AR03-1044",
    driverName: "Tsering Norbu",
    type: "OFFROAD_4X4",
    lat: 27.3556,
    lng: 92.2341,
    altitude: 2415,
    speedKmh: 34,
    heading: 320,
    engineTemp: 88,
    fuel: 61,
    battery: 88,
    cargo: "Disaster Emergency Telecom Kit (850 kg)",
    status: "MOUNTAIN_CLIMB",
    origin: "Dirang",
    destination: "Tawang",
    nextStop: "Sela Pass North Staging Post",
    etaMinutes: 90
  },
  {
    vehicleId: "NER-TRUCK-SK02-4411",
    driverName: "Pema Bhutia",
    type: "HEAVY_COMMERCIAL",
    lat: 26.8500,
    lng: 88.4500,
    altitude: 310,
    speedKmh: 45,
    heading: 25,
    engineTemp: 82,
    fuel: 85,
    battery: 92,
    cargo: "Essential Food Grains & Life-Saving Insulin (3,800 kg)",
    status: "EN_ROUTE",
    origin: "Siliguri",
    destination: "Gangtok",
    nextStop: "Coronation Bridge Junction",
    etaMinutes: 120
  },
  {
    vehicleId: "NER-TRUCK-NL07-5512",
    driverName: "Kevichusa Angami",
    type: "HEAVY_COMMERCIAL",
    lat: 25.8200,
    lng: 93.8500,
    altitude: 720,
    speedKmh: 38,
    heading: 140,
    engineTemp: 89,
    fuel: 58,
    battery: 90,
    cargo: "Solar Inverters & Batteries (3,100 kg)",
    status: "CONGESTED_PASS",
    origin: "Dimapur",
    destination: "Kohima",
    nextStop: "Zubza Highway Siding",
    etaMinutes: 60
  },
  {
    vehicleId: "NER-DRONE-AIR-07",
    driverName: "Autonomous Pilot (AI-07)",
    type: "CARGO_DRONE",
    lat: 25.4200,
    lng: 91.8200,
    altitude: 1680,
    speedKmh: 82,
    heading: 195,
    engineTemp: 45,
    fuel: 100,
    battery: 64,
    cargo: "Anti-Venom & Blood Plasma Units (45 kg)",
    status: "AIRBORNE_RELIEF",
    origin: "Shillong",
    destination: "Dawki",
    nextStop: "Dawki Border Helipad",
    etaMinutes: 12
  }
];

export const NER_TOPOLOGY_LOCATIONS = [
  // ASSAM (15 Strategic Logistics Hubs)
  { name: "Guwahati", lat: 26.1445, lng: 91.7362, elevation: 55, state: "Assam", hubType: "PRIMARY_GATEWAY", amenities: ["Major Fuel Hub", "Driver Dorms", "Repair Docks", "Airport Cargo"] },
  { name: "Bongaigaon", lat: 26.5000, lng: 90.5500, elevation: 62, state: "Assam", hubType: "REGIONAL_HUB", amenities: ["Refinery Freight Hub", "Heavy Repair Station"] },
  { name: "Goalpara", lat: 26.1700, lng: 90.6200, elevation: 35, state: "Assam", hubType: "TRANSIT_DEPOT", amenities: ["Brahmaputra South Bank Hub", "Fuel Pumps"] },
  { name: "Dhubri", lat: 26.0200, lng: 89.9700, elevation: 34, state: "Assam", hubType: "BORDER_POST", amenities: ["Inland Waterway Port", "Customs Terminal"] },
  { name: "Nagaon", lat: 26.3500, lng: 92.6800, elevation: 60, state: "Assam", hubType: "REGIONAL_HUB", amenities: ["Central Highway Junction", "Multi-Fuel Depot"] },
  { name: "Tezpur", lat: 26.6528, lng: 92.7926, elevation: 48, state: "Assam", hubType: "REGIONAL_HUB", amenities: ["Bridge Transit Terminal", "Heavy Fuel Station", "Workshops"] },
  { name: "North_Lakhimpur", lat: 27.2300, lng: 94.1000, elevation: 101, state: "Assam", hubType: "TRANSIT_DEPOT", amenities: ["North Bank Depot", "Fuel Stations"] },
  { name: "Dhemaji", lat: 27.4800, lng: 94.5800, elevation: 104, state: "Assam", hubType: "TRANSIT_DEPOT", amenities: ["Bogibeel North Terminal", "Rest Dhabas"] },
  { name: "Dibrugarh", lat: 27.4728, lng: 94.9120, elevation: 108, state: "Assam", hubType: "AIR_RAIL_HUB", amenities: ["Bogibeel Rail-Road Terminal", "Airport Logistics", "Heavy Depot"] },
  { name: "Tinsukia", lat: 27.5000, lng: 95.3600, elevation: 116, state: "Assam", hubType: "REGIONAL_HUB", amenities: ["Eastern Rail Container Depot", "Petro Logistics"] },
  { name: "Jorhat", lat: 26.7509, lng: 94.2037, elevation: 116, state: "Assam", hubType: "REGIONAL_HUB", amenities: ["Tea Freight Terminal", "Highway Fuel", "Rest Plazas"] },
  { name: "Sivasagar", lat: 26.9800, lng: 94.6300, elevation: 95, state: "Assam", hubType: "TRANSIT_DEPOT", amenities: ["Heritage Corridor Depot", "Fuel Station"] },
  { name: "Haflong", lat: 25.1700, lng: 93.0200, elevation: 680, state: "Assam", hubType: "HIGH_ALTITUDE_HUB", amenities: ["Dima Hasao Hill Base", "BRO Road Camp"] },
  { name: "Silchar", lat: 24.8333, lng: 92.7789, elevation: 25, state: "Assam", hubType: "VALLEY_HUB", amenities: ["Barak Valley Hub", "Intermodal Rail Yard", "Fuel Depot"] },
  { name: "Karimganj", lat: 24.8700, lng: 92.3600, elevation: 20, state: "Assam", hubType: "BORDER_POST", amenities: ["Sutarkandi Border Trade Center", "Customs Post"] },

  // MEGHALAYA (8 Hubs)
  { name: "Shillong", lat: 25.5788, lng: 91.8933, elevation: 1525, state: "Meghalaya", hubType: "STATE_CAPITAL", amenities: ["Cold Storage Depot", "Pharma Lab", "Fuel Pumps"] },
  { name: "Sohra", lat: 25.2702, lng: 91.7323, elevation: 1430, state: "Meghalaya", hubType: "VALLEY_POST", amenities: ["Emergency Helipad", "Disaster Cache"] },
  { name: "Dawki", lat: 25.1834, lng: 92.0167, elevation: 85, state: "Meghalaya", hubType: "BORDER_POST", amenities: ["Land Customs Station", "Border Security Post"] },
  { name: "Jowai", lat: 25.4500, lng: 92.2000, elevation: 1380, state: "Meghalaya", hubType: "REGIONAL_HUB", amenities: ["Jaintia Hills Transit", "Fuel Depot"] },
  { name: "Khliehriat", lat: 25.3500, lng: 92.3700, elevation: 1200, state: "Meghalaya", hubType: "TRANSIT_DEPOT", amenities: ["East Jaintia Pass Station", "Heavy Dhabas"] },
  { name: "Nongstoin", lat: 25.5200, lng: 91.2700, elevation: 1400, state: "Meghalaya", hubType: "REGIONAL_HUB", amenities: ["West Khasi Bypass Station", "Emergency Mechanic"] },
  { name: "Tura", lat: 25.5140, lng: 90.2200, elevation: 650, state: "Meghalaya", hubType: "REGIONAL_HUB", amenities: ["Garo Hills Central Depot", "Fuel Hub"] },
  { name: "Williamnagar", lat: 25.6000, lng: 90.6200, elevation: 280, state: "Meghalaya", hubType: "TRANSIT_DEPOT", amenities: ["Simsang River Post", "Fuel Station"] },

  // ARUNACHAL PRADESH (15 Strategic Alpine Passes & Valley Hubs)
  { name: "Bhalukpong", lat: 27.0135, lng: 92.6469, elevation: 213, state: "Arunachal Pradesh", hubType: "MOUNTAIN_GATEWAY", amenities: ["ILP Border Checkpost", "Mountain Fuel Depot", "4x4 Fitting"] },
  { name: "Bomdila", lat: 27.2645, lng: 92.4159, elevation: 2415, state: "Arunachal Pradesh", hubType: "HIGH_ALTITUDE_HUB", amenities: ["High-Altitude Oxygen", "BRO Camp", "Heated Shelter"] },
  { name: "Dirang", lat: 27.3556, lng: 92.2341, elevation: 1560, state: "Arunachal Pradesh", hubType: "VALLEY_HUB", amenities: ["Valley Transshipment", "Emergency Food Stock", "Mechanic Post"] },
  { name: "Sela_Pass", lat: 27.5034, lng: 92.1037, elevation: 4170, state: "Arunachal Pradesh", hubType: "CRITICAL_PASS", amenities: ["BRO Snow Clearing HQ", "Emergency Shelter (4,170m)"] },
  { name: "Tawang", lat: 27.5861, lng: 91.8653, elevation: 3048, state: "Arunachal Pradesh", hubType: "STRATEGIC_BORDER_DEPOT", amenities: ["Strategic Military Depot", "Helipad Active", "Oxygen Bank"] },
  { name: "Itanagar", lat: 27.0844, lng: 93.6053, elevation: 320, state: "Arunachal Pradesh", hubType: "STATE_CAPITAL", amenities: ["Capital Logistics Hub", "Fuel Stations", "EV Chargers"] },
  { name: "Ziro", lat: 27.5500, lng: 93.8300, elevation: 1572, state: "Arunachal Pradesh", hubType: "HIGH_ALTITUDE_HUB", amenities: ["Apatani High Valley Base", "Fuel Pump"] },
  { name: "Daporijo", lat: 27.9800, lng: 94.2200, elevation: 600, state: "Arunachal Pradesh", hubType: "VALLEY_HUB", amenities: ["Subansiri River Depot", "Transit Station"] },
  { name: "Aalo", lat: 28.1700, lng: 94.8000, elevation: 610, state: "Arunachal Pradesh", hubType: "REGIONAL_HUB", amenities: ["West Siang Logistics Base", "Repair Workshop"] },
  { name: "Pasighat", lat: 28.0664, lng: 95.3265, elevation: 155, state: "Arunachal Pradesh", hubType: "EASTERN_GATEWAY", amenities: ["Siang River Terminal", "Highway Hub"] },
  { name: "Roing", lat: 28.1400, lng: 95.8400, elevation: 390, state: "Arunachal Pradesh", hubType: "REGIONAL_HUB", amenities: ["Dibang Valley Gateway", "Fuel Station"] },
  { name: "Tezu", lat: 27.9200, lng: 96.1700, elevation: 210, state: "Arunachal Pradesh", hubType: "REGIONAL_HUB", amenities: ["Lohit Strategic Depot", "Airport Helipad"] },
  { name: "Namsai", lat: 27.6700, lng: 95.8700, elevation: 156, state: "Arunachal Pradesh", hubType: "REGIONAL_HUB", amenities: ["NH-13 Central Transshipment", "Fuel Station"] },
  { name: "Changlang", lat: 27.1500, lng: 95.7400, elevation: 580, state: "Arunachal Pradesh", hubType: "TRANSIT_DEPOT", amenities: ["Eastern Ridge Post", "Fuel Pump"] },
  { name: "Khonsa", lat: 27.0200, lng: 95.5700, elevation: 1215, state: "Arunachal Pradesh", hubType: "HIGH_ALTITUDE_HUB", amenities: ["Tirap Border Station", "BRO Camp"] },

  // NAGALAND (7 Hubs)
  { name: "Dimapur", lat: 25.9090, lng: 93.7270, elevation: 145, state: "Nagaland", hubType: "RAIL_GATEWAY", amenities: ["Rail Freight Terminal", "Inland Container Depot", "Fuel Hub"] },
  { name: "Kohima", lat: 25.6751, lng: 94.1086, elevation: 1444, state: "Nagaland", hubType: "STATE_CAPITAL", amenities: ["Hill Capital Depot", "Emergency Health Depot"] },
  { name: "Wokha", lat: 26.1000, lng: 94.2700, elevation: 1313, state: "Nagaland", hubType: "MOUNTAIN_HUB", amenities: ["Doyang Ridge Station", "Fuel Pump"] },
  { name: "Mokokchung", lat: 26.3248, lng: 94.5160, elevation: 1325, state: "Nagaland", hubType: "MOUNTAIN_HUB", amenities: ["Transit Station", "Fuel Pump"] },
  { name: "Tuensang", lat: 26.2800, lng: 94.8300, elevation: 1371, state: "Nagaland", hubType: "MOUNTAIN_HUB", amenities: ["Eastern Nagaland Post", "Disaster Cache"] },
  { name: "Mon", lat: 26.7400, lng: 95.0600, elevation: 898, state: "Nagaland", hubType: "BORDER_POST", amenities: ["Northern Border Depot", "Fuel Station"] },
  { name: "Phek", lat: 25.6600, lng: 94.4900, elevation: 1524, state: "Nagaland", hubType: "MOUNTAIN_HUB", amenities: ["Pfütsero Agri Transit", "Emergency Post"] },

  // MANIPUR (8 Hubs)
  { name: "Senapati", lat: 25.2678, lng: 94.0191, elevation: 1050, state: "Manipur", hubType: "TRANSIT_DEPOT", amenities: ["Hill Convoy Staging", "Rest Dhabas"] },
  { name: "Imphal", lat: 24.8170, lng: 93.9368, elevation: 786, state: "Manipur", hubType: "STATE_CAPITAL", amenities: ["Valley Logistics Hub", "Pharma Cold Depot", "Airport Terminal"] },
  { name: "Ukhrul", lat: 25.1100, lng: 94.3600, elevation: 2020, state: "Manipur", hubType: "HIGH_ALTITUDE_HUB", amenities: ["Shirui Lily Mountain Base", "Fuel Pump"] },
  { name: "Jiribam", lat: 24.8000, lng: 93.1200, elevation: 33, state: "Manipur", hubType: "RAIL_GATEWAY", amenities: ["Inter-State Railhead", "Barak Transit"] },
  { name: "Noney", lat: 24.8500, lng: 93.6000, elevation: 420, state: "Manipur", hubType: "TRANSIT_DEPOT", amenities: ["World's Tallest Pier Bridge Station", "Emergency Rest"] },
  { name: "Kakching", lat: 24.4800, lng: 93.9800, elevation: 798, state: "Manipur", hubType: "REGIONAL_HUB", amenities: ["South Manipur Transit", "Fuel Station"] },
  { name: "Churachandpur", lat: 24.3333, lng: 93.6833, elevation: 914, state: "Manipur", hubType: "REGIONAL_HUB", amenities: ["Southern Depot", "Fuel Stations"] },
  { name: "Moreh", lat: 24.2442, lng: 94.3025, elevation: 240, state: "Manipur", hubType: "BORDER_POST", amenities: ["Integrated Border Checkpost", "Asian Highway AH-1 Customs"] },

  // MIZORAM (7 Hubs)
  { name: "Kolasib", lat: 24.2300, lng: 92.6800, elevation: 888, state: "Mizoram", hubType: "TRANSIT_DEPOT", amenities: ["Northern Mizoram Gate", "Fuel Pumps"] },
  { name: "Aizawl", lat: 23.7271, lng: 92.7176, elevation: 1132, state: "Mizoram", hubType: "STATE_CAPITAL", amenities: ["Capital Mountain Depot", "Lengpui Airport Transit", "Fuel Stations"] },
  { name: "Champhai", lat: 23.4750, lng: 93.3275, elevation: 1678, state: "Mizoram", hubType: "BORDER_POST", amenities: ["Zokhawthar Border Checkpost", "Customs Depot"] },
  { name: "Serchhip", lat: 23.3400, lng: 92.8500, elevation: 1285, state: "Mizoram", hubType: "MOUNTAIN_HUB", amenities: ["Central Mizoram Transit", "Fuel Station"] },
  { name: "Lunglei", lat: 22.8872, lng: 92.7350, elevation: 722, state: "Mizoram", hubType: "MOUNTAIN_HUB", amenities: ["Southern Mizoram Post", "Fuel Storage"] },
  { name: "Lawngtlai", lat: 22.5300, lng: 92.8900, elevation: 790, state: "Mizoram", hubType: "REGIONAL_HUB", amenities: ["Kaladan Project Base", "Fuel Depot"] },
  { name: "Saiha", lat: 22.4900, lng: 92.9700, elevation: 729, state: "Mizoram", hubType: "MOUNTAIN_HUB", amenities: ["Mara Autonomous Post", "Emergency Station"] },

  // TRIPURA (6 Hubs)
  { name: "Dharmanagar", lat: 24.3700, lng: 92.1700, elevation: 21, state: "Tripura", hubType: "RAIL_GATEWAY", amenities: ["North Tripura Rail Freight Depot", "Fuel Station"] },
  { name: "Ambassa", lat: 23.9200, lng: 91.8500, elevation: 80, state: "Tripura", hubType: "TRANSIT_DEPOT", amenities: ["Dhalai District Hub", "Rest Plaza"] },
  { name: "Agartala", lat: 23.8315, lng: 91.2868, elevation: 15, state: "Tripura", hubType: "STATE_CAPITAL", amenities: ["Akhaura Integrated Checkpost", "Railway Container Depot"] },
  { name: "Udaipur", lat: 23.5333, lng: 91.4833, elevation: 28, state: "Tripura", hubType: "REGIONAL_HUB", amenities: ["South Tripura Terminal", "Fuel Pumps"] },
  { name: "Belonia", lat: 23.2500, lng: 91.4500, elevation: 23, state: "Tripura", hubType: "BORDER_POST", amenities: ["Muhurighat Border Post", "Customs Terminal"] },
  { name: "Sabroom", lat: 23.0000, lng: 91.7000, elevation: 18, state: "Tripura", hubType: "BORDER_POST", amenities: ["Maitri Setu Bridge to Chittagong", "SEZ Port Depot"] },

  // SIKKIM & NORTH BENGAL CORRIDOR (7 Hubs)
  { name: "Siliguri", lat: 26.7271, lng: 88.3953, elevation: 122, state: "West Bengal", hubType: "CORRIDOR_GATEWAY", amenities: ["Chicken's Neck Strategic Hub", "Mega Logistics Park"] },
  { name: "Lava", lat: 27.0800, lng: 88.6600, elevation: 2130, state: "West Bengal", hubType: "HIGH_ALTITUDE_HUB", amenities: ["NH-717A Mountain Ridge Station", "Emergency Post"] },
  { name: "Gangtok", lat: 27.3389, lng: 88.6065, elevation: 1650, state: "Sikkim", hubType: "STATE_CAPITAL", amenities: ["Himalayan Logistics Hub", "Pharma Transport Post"] },
  { name: "Namchi", lat: 27.1700, lng: 88.3500, elevation: 1315, state: "Sikkim", hubType: "MOUNTAIN_HUB", amenities: ["South Sikkim Base", "Fuel Pumps"] },
  { name: "Pelling", lat: 27.3200, lng: 88.2400, elevation: 2150, state: "Sikkim", hubType: "HIGH_ALTITUDE_HUB", amenities: ["West Sikkim Ridge Post", "4x4 Emergency Service"] },
  { name: "Mangan", lat: 27.5097, lng: 88.5298, elevation: 1310, state: "Sikkim", hubType: "HIGH_MOUNTAIN_HUB", amenities: ["North Sikkim Base", "Disaster Relief Camp"] },
  { name: "Chungthang", lat: 27.6000, lng: 88.6400, elevation: 1790, state: "Sikkim", hubType: "STRATEGIC_BORDER_DEPOT", amenities: ["Lachen-Lachung Confluence Base", "Military Transit HQ"] }
];

const N = {};
NER_TOPOLOGY_LOCATIONS.forEach(loc => {
  N[loc.name] = [loc.lat, loc.lng];
});

// Curvilinear Highways with Complete Terrain Data
export const NER_HIGHWAY_CORRIDORS = [
  {
    from: "Guwahati",
    to: "Shillong",
    highway: "NH-6",
    distance: 99,
    status: "PASSABLE",
    grade: "6.5%",
    surface: "Smooth 4-Lane Paved",
    connectivity: "100% 5G/4G",
    hairpins: 14,
    nightDriving: "SAFE_STREETLIT",
    scenicHighlight: "Umiam Lake Panoramic Overlook",
    enRouteAmenities: [
      { name: "Nongpoh Tourist Food Plaza", lat: 25.9000, lng: 91.8800, type: "FOOD_PLAZA" },
      { name: "Umiam Lake Viewpoint & EV Fast Charge", lat: 25.6600, lng: 91.9000, type: "EV_CHARGER" }
    ],
    coords: [
      N["Guwahati"],
      [26.05, 91.80],
      [25.90, 91.88],
      [25.75, 91.90],
      [25.66, 91.90],
      N["Shillong"]
    ]
  },
  {
    from: "Shillong",
    to: "Sohra",
    highway: "SH-5",
    distance: 54,
    status: "PASSABLE",
    grade: "7.8%",
    surface: "2-Lane Mountain Scenic Route",
    connectivity: "85% 4G",
    hairpins: 22,
    nightDriving: "CAUTION_HEAVY_FOG",
    scenicHighlight: "Mawkdok Dympep Valley Viewpoint",
    enRouteAmenities: [
      { name: "Mawkdok Valley Zip-line Rest Stop", lat: 25.3500, lng: 91.7500, type: "FOOD_PLAZA" }
    ],
    coords: [
      N["Shillong"],
      [25.48, 91.82],
      [25.35, 91.75],
      N["Sohra"]
    ]
  },
  {
    from: "Shillong",
    to: "Dawki",
    highway: "NH-206",
    distance: 82,
    status: "PASSABLE",
    grade: "5.5%",
    surface: "2-Lane Mountain Highway",
    connectivity: "80% 4G",
    hairpins: 18,
    nightDriving: "SAFE",
    scenicHighlight: "Wah Umngot River Canyon & Pamsut Forest",
    enRouteAmenities: [
      { name: "Pynursla Fuel & Rest Stop", lat: 25.3000, lng: 91.9000, type: "FUEL_REST" }
    ],
    coords: [
      N["Shillong"],
      [25.45, 91.90],
      [25.30, 91.90],
      [25.24, 91.98],
      N["Dawki"]
    ]
  },
  {
    from: "Shillong",
    to: "Silchar",
    highway: "NH-6",
    distance: 215,
    status: "CAUTION",
    grade: "8.2%",
    surface: "Mountain 2-Lane (Monsoon Mudslide Vulnerable)",
    connectivity: "70% 3G/4G",
    hairpins: 52,
    nightDriving: "DANGEROUS_FOG",
    note: "Sonapur Mudslide Prone Stretch (Km 142)",
    scenicHighlight: "Jaintia Hills Coal Ridge & Lubha River Bridge",
    enRouteAmenities: [
      { name: "Jowai Highway Rest Stop", lat: 25.4400, lng: 92.2000, type: "FOOD_PLAZA" },
      { name: "Sonapur BRO Rescue Camp", lat: 25.1200, lng: 92.3600, type: "BRO_POST" }
    ],
    coords: [
      N["Shillong"],
      [25.50, 92.05],
      [25.44, 92.20],
      [25.30, 92.28],
      [25.18, 92.34],
      [25.12, 92.36],
      [24.98, 92.52],
      N["Silchar"]
    ]
  },
  {
    from: "Guwahati",
    to: "Tezpur",
    highway: "NH-15",
    distance: 178,
    status: "PASSABLE",
    grade: "1.2%",
    surface: "4-Lane Divided Expressway",
    connectivity: "100% 5G/4G",
    hairpins: 0,
    nightDriving: "EXCELLENT_LIT",
    scenicHighlight: "Brahmaputra River Overlook & Kolia Bhomora Bridge",
    enRouteAmenities: [
      { name: "Mangaldai Food Plaza", lat: 26.4300, lng: 92.0300, type: "FOOD_PLAZA" },
      { name: "Dhekiajuli Heavy Fleet Depot", lat: 26.7000, lng: 92.5000, type: "FUEL_REST" }
    ],
    coords: [
      N["Guwahati"],
      [26.25, 91.85],
      [26.43, 92.03],
      [26.60, 92.35],
      [26.70, 92.50],
      N["Tezpur"]
    ]
  },
  {
    from: "Tezpur",
    to: "Bhalukpong",
    highway: "NH-13",
    distance: 58,
    status: "PASSABLE",
    grade: "4.5%",
    surface: "Smooth 2-Lane Paved",
    connectivity: "95% 4G",
    hairpins: 6,
    nightDriving: "SAFE",
    scenicHighlight: "Kameng River Gorge Entrance",
    enRouteAmenities: [
      { name: "Bhalukpong ILP Gate Checkpost", lat: 27.0100, lng: 92.6500, type: "CHECKPOST" }
    ],
    coords: [
      N["Tezpur"],
      [26.75, 92.80],
      [26.85, 92.76],
      [26.94, 92.70],
      N["Bhalukpong"]
    ]
  },
  {
    from: "Bhalukpong",
    to: "Bomdila",
    highway: "NH-13",
    distance: 97,
    status: "CAUTION",
    grade: "9.2%",
    surface: "Mountain 2-Lane Asphalt",
    connectivity: "75% 4G",
    hairpins: 48,
    nightDriving: "CAUTION_SHARP_TURNS",
    scenicHighlight: "Tenga Valley Military Station & Bomdila Pass",
    enRouteAmenities: [
      { name: "Tenga Valley Army Rest Post", lat: 27.1800, lng: 92.4800, type: "REST_STATION" },
      { name: "Bomdila BRO Emergency Camp", lat: 27.2600, lng: 92.4100, type: "BRO_POST" }
    ],
    coords: [
      N["Bhalukpong"],
      [27.05, 92.60],
      [27.12, 92.54],
      [27.18, 92.48],
      [27.22, 92.44],
      N["Bomdila"]
    ]
  },
  {
    from: "Bomdila",
    to: "Dirang",
    highway: "NH-13",
    distance: 42,
    status: "PASSABLE",
    grade: "7.0%",
    surface: "Smooth Paved Valley Road",
    connectivity: "90% 4G",
    hairpins: 16,
    nightDriving: "SAFE",
    scenicHighlight: "Dirang Kiwi Orchards & Hot Springs",
    enRouteAmenities: [
      { name: "Dirang Tourist Rest Station & Fuel", lat: 27.3500, lng: 92.2400, type: "FUEL_REST" }
    ],
    coords: [
      N["Bomdila"],
      [27.29, 92.38],
      [27.32, 92.30],
      N["Dirang"]
    ]
  },
  {
    from: "Dirang",
    to: "Sela_Pass",
    highway: "NH-13",
    distance: 62,
    status: "BLOCKED",
    grade: "11.5%",
    surface: "Steep High-Alpine Asphalt / Boulder Slides",
    connectivity: "55% 2G/3G",
    hairpins: 64,
    nightDriving: "EXTREME_DANGER_BLIZZARD",
    note: "🔴 BLOCKED: Sela Pass 120m Landslide",
    scenicHighlight: "Paradise Lake (4,170m) & Sela Tunnel Portals",
    enRouteAmenities: [
      { name: "Baisakhi Army Camp & Oxygen Bank", lat: 27.4500, lng: 92.1800, type: "ARMY_POST" },
      { name: "Sela Top BRO Emergency Igloo", lat: 27.5034, lng: 92.1037, type: "BRO_POST" }
    ],
    coords: [
      N["Dirang"],
      [27.38, 92.20],
      [27.45, 92.18],
      [27.48, 92.14],
      N["Sela_Pass"]
    ]
  },
  {
    from: "Sela_Pass",
    to: "Tawang",
    highway: "NH-13",
    distance: 78,
    status: "CAUTION",
    grade: "8.5%",
    surface: "Alpine Paved / Patchy Ice",
    connectivity: "70% 4G",
    hairpins: 56,
    nightDriving: "CAUTION_BLACK_ICE",
    scenicHighlight: "Jaswant Garh War Memorial & Jung Nuranang Falls",
    enRouteAmenities: [
      { name: "Jaswant Garh War Memorial Rest Stop", lat: 27.5200, lng: 92.0500, type: "FOOD_PLAZA" },
      { name: "Jung Falls Tourist Complex", lat: 27.5500, lng: 91.9800, type: "REST_STATION" }
    ],
    coords: [
      N["Sela_Pass"],
      [27.52, 92.05],
      [27.55, 91.98],
      [27.56, 91.92],
      N["Tawang"]
    ]
  },
  {
    from: "Guwahati",
    to: "Dimapur",
    highway: "NH-27_NH-29",
    distance: 278,
    status: "PASSABLE",
    grade: "2.0%",
    surface: "4-Lane National Highway",
    connectivity: "98% 5G/4G",
    hairpins: 4,
    nightDriving: "SAFE",
    scenicHighlight: "Kaziranga Elephant Corridor Overpass",
    enRouteAmenities: [
      { name: "Nagaon Rest Plaza", lat: 26.3500, lng: 92.6800, type: "FOOD_PLAZA" },
      { name: "Numaligarh Refinery Fuel Depot", lat: 26.5800, lng: 93.7500, type: "FUEL_REST" }
    ],
    coords: [
      N["Guwahati"],
      [26.20, 92.20],
      [26.35, 92.68],
      [26.50, 93.20],
      [26.05, 93.60],
      N["Dimapur"]
    ]
  },
  {
    from: "Dimapur",
    to: "Kohima",
    highway: "NH-29",
    distance: 74,
    status: "BLOCKED",
    grade: "8.5%",
    surface: "Gorge Sinking Roadway",
    connectivity: "80% 4G",
    hairpins: 36,
    nightDriving: "HIGH_RISK_GORGE",
    note: "🔴 BLOCKED: Pagla Pahar Gorge shoulder collapse",
    enRouteAmenities: [
      { name: "Medziphema Fuel & Transit Hub", lat: 25.8000, lng: 93.8500, type: "FUEL_REST" },
      { name: "Zubza Viaduct Viewpoint", lat: 25.7200, lng: 94.0200, type: "REST_STATION" }
    ],
    coords: [
      N["Dimapur"],
      [25.84, 93.80],
      [25.79, 93.91],
      [25.72, 94.02],
      N["Kohima"]
    ]
  },
  {
    from: "Kohima",
    to: "Senapati",
    highway: "NH-2",
    distance: 68,
    status: "CAUTION",
    grade: "6.0%",
    surface: "2-Lane Mountain Asphalt",
    connectivity: "85% 4G",
    hairpins: 24,
    nightDriving: "CAUTION",
    scenicHighlight: "Dzukou Valley Foothills & Mao Border Gate",
    enRouteAmenities: [
      { name: "Mao Gate Customs Checkpost", lat: 25.4800, lng: 94.1200, type: "CHECKPOST" }
    ],
    coords: [
      N["Kohima"],
      [25.55, 94.10],
      [25.40, 94.05],
      N["Senapati"]
    ]
  },
  {
    from: "Senapati",
    to: "Imphal",
    highway: "NH-2",
    distance: 62,
    status: "PASSABLE",
    grade: "3.5%",
    surface: "Smooth 2-Lane Valley Road",
    connectivity: "95% 4G",
    hairpins: 8,
    nightDriving: "SAFE",
    scenicHighlight: "Kangpokpi Pine Forests & Imphal Valley",
    enRouteAmenities: [
      { name: "Kangpokpi Fuel Station", lat: 25.1500, lng: 93.9800, type: "FUEL_PUMP" }
    ],
    coords: [
      N["Senapati"],
      [25.18, 94.00],
      [25.02, 93.95],
      N["Imphal"]
    ]
  },
  {
    from: "Siliguri",
    to: "Gangtok",
    highway: "NH-10",
    distance: 114,
    status: "CAUTION",
    grade: "7.5%",
    surface: "2-Lane River Gorge Highway",
    connectivity: "85% 4G",
    hairpins: 28,
    nightDriving: "CAUTION_LANDSLIDE",
    note: "Teesta Gorge Silt Slowdown",
    scenicHighlight: "Coronation Bridge & Teesta River Canyon",
    enRouteAmenities: [
      { name: "Sevoke Coronation Bridge Checkpost", lat: 26.8800, lng: 88.4700, type: "CHECKPOST" },
      { name: "Rangpo Sikkim Border Gate & Fuel", lat: 27.1700, lng: 88.5200, type: "CHECKPOST_FUEL" }
    ],
    coords: [
      N["Siliguri"],
      [26.88, 88.47],
      [27.05, 88.49],
      [27.17, 88.52],
      [27.23, 88.50],
      N["Gangtok"]
    ]
  }
];
