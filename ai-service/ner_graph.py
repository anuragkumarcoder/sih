import networkx as nx
from typing import Dict, Any, List, Tuple
import math

# Realistic North Eastern Nodes with geographical coordinates & elevation in meters
# Realistic North Eastern Nodes with geographical coordinates & elevation in meters
NER_NODES = {
    # Assam
    "Guwahati": {"lat": 26.1445, "lng": 91.7362, "elevation": 55, "state": "AS", "type": "PRIMARY_HUB"},
    "Bongaigaon": {"lat": 26.5000, "lng": 90.5500, "elevation": 62, "state": "AS", "type": "REGIONAL_HUB"},
    "Goalpara": {"lat": 26.1700, "lng": 90.6200, "elevation": 35, "state": "AS", "type": "TRANSIT_HUB"},
    "Dhubri": {"lat": 26.0200, "lng": 89.9700, "elevation": 34, "state": "AS", "type": "BORDER_PORT"},
    "Nagaon": {"lat": 26.3500, "lng": 92.6800, "elevation": 60, "state": "AS", "type": "REGIONAL_HUB"},
    "Tezpur": {"lat": 26.6528, "lng": 92.7926, "elevation": 48, "state": "AS", "type": "REGIONAL_HUB"},
    "North_Lakhimpur": {"lat": 27.2300, "lng": 94.1000, "elevation": 101, "state": "AS", "type": "TRANSIT_DEPOT"},
    "Dhemaji": {"lat": 27.4800, "lng": 94.5800, "elevation": 104, "state": "AS", "type": "TRANSIT_DEPOT"},
    "Dibrugarh": {"lat": 27.4728, "lng": 94.9120, "elevation": 108, "state": "AS", "type": "AIR_RAIL_HUB"},
    "Tinsukia": {"lat": 27.5000, "lng": 95.3600, "elevation": 116, "state": "AS", "type": "REGIONAL_HUB"},
    "Jorhat": {"lat": 26.7509, "lng": 94.2037, "elevation": 116, "state": "AS", "type": "REGIONAL_HUB"},
    "Sivasagar": {"lat": 26.9800, "lng": 94.6300, "elevation": 95, "state": "AS", "type": "TRANSIT_DEPOT"},
    "Haflong": {"lat": 25.1700, "lng": 93.0200, "elevation": 680, "state": "AS", "type": "HIGH_ALTITUDE_HUB"},
    "Silchar": {"lat": 24.8333, "lng": 92.7789, "elevation": 25, "state": "AS", "type": "VALLEY_HUB"},
    "Karimganj": {"lat": 24.8700, "lng": 92.3600, "elevation": 20, "state": "AS", "type": "BORDER_POST"},

    # Meghalaya
    "Shillong": {"lat": 25.5788, "lng": 91.8933, "elevation": 1525, "state": "ML", "type": "STATE_CAPITAL"},
    "Sohra": {"lat": 25.2702, "lng": 91.7323, "elevation": 1430, "state": "ML", "type": "HIGH_RAIN_ZONE"},
    "Dawki": {"lat": 25.1834, "lng": 92.0167, "elevation": 85, "state": "ML", "type": "BORDER_TRADE_POST"},
    "Jowai": {"lat": 25.4500, "lng": 92.2000, "elevation": 1380, "state": "ML", "type": "REGIONAL_HUB"},
    "Khliehriat": {"lat": 25.3500, "lng": 92.3700, "elevation": 1200, "state": "ML", "type": "TRANSIT_DEPOT"},
    "Nongstoin": {"lat": 25.5200, "lng": 91.2700, "elevation": 1400, "state": "ML", "type": "REGIONAL_HUB"},
    "Tura": {"lat": 25.5140, "lng": 90.2200, "elevation": 650, "state": "ML", "type": "REGIONAL_HUB"},
    "Williamnagar": {"lat": 25.6000, "lng": 90.6200, "elevation": 280, "state": "ML", "type": "TRANSIT_DEPOT"},

    # Arunachal Pradesh
    "Bhalukpong": {"lat": 27.0135, "lng": 92.6469, "elevation": 213, "state": "AR", "type": "TRANSIT_GATEWAY"},
    "Bomdila": {"lat": 27.2645, "lng": 92.4159, "elevation": 2415, "state": "AR", "type": "MOUNTAIN_HUB"},
    "Dirang": {"lat": 27.3556, "lng": 92.2341, "elevation": 1560, "state": "AR", "type": "VALLEY_STATION"},
    "Sela_Pass": {"lat": 27.5034, "lng": 92.1037, "elevation": 4170, "state": "AR", "type": "HIGH_ALTITUDE_PASS"},
    "Tawang": {"lat": 27.5861, "lng": 91.8653, "elevation": 3048, "state": "AR", "type": "BORDER_DEPOT"},
    "Itanagar": {"lat": 27.0844, "lng": 93.6053, "elevation": 320, "state": "AR", "type": "STATE_CAPITAL"},
    "Ziro": {"lat": 27.5500, "lng": 93.8300, "elevation": 1572, "state": "AR", "type": "HIGH_ALTITUDE_HUB"},
    "Daporijo": {"lat": 27.9800, "lng": 94.2200, "elevation": 600, "state": "AR", "type": "VALLEY_HUB"},
    "Aalo": {"lat": 28.1700, "lng": 94.8000, "elevation": 610, "state": "AR", "type": "REGIONAL_HUB"},
    "Pasighat": {"lat": 28.0664, "lng": 95.3265, "elevation": 155, "state": "AR", "type": "EASTERN_GATEWAY"},
    "Roing": {"lat": 28.1400, "lng": 95.8400, "elevation": 390, "state": "AR", "type": "REGIONAL_HUB"},
    "Tezu": {"lat": 27.9200, "lng": 96.1700, "elevation": 210, "state": "AR", "type": "REGIONAL_HUB"},
    "Namsai": {"lat": 27.6700, "lng": 95.8700, "elevation": 156, "state": "AR", "type": "REGIONAL_HUB"},
    "Changlang": {"lat": 27.1500, "lng": 95.7400, "elevation": 580, "state": "AR", "type": "TRANSIT_DEPOT"},
    "Khonsa": {"lat": 27.0200, "lng": 95.5700, "elevation": 1215, "state": "AR", "type": "HIGH_ALTITUDE_HUB"},

    # Nagaland
    "Dimapur": {"lat": 25.9090, "lng": 93.7270, "elevation": 145, "state": "NL", "type": "RAIL_GATEWAY"},
    "Kohima": {"lat": 25.6751, "lng": 94.1086, "elevation": 1444, "state": "NL", "type": "STATE_CAPITAL"},
    "Wokha": {"lat": 26.1000, "lng": 94.2700, "elevation": 1313, "state": "NL", "type": "MOUNTAIN_HUB"},
    "Mokokchung": {"lat": 26.3248, "lng": 94.5160, "elevation": 1325, "state": "NL", "type": "MOUNTAIN_HUB"},
    "Tuensang": {"lat": 26.2800, "lng": 94.8300, "elevation": 1371, "state": "NL", "type": "MOUNTAIN_HUB"},
    "Mon": {"lat": 26.7400, "lng": 95.0600, "elevation": 898, "state": "NL", "type": "BORDER_POST"},
    "Phek": {"lat": 25.6600, "lng": 94.4900, "elevation": 1524, "state": "NL", "type": "MOUNTAIN_HUB"},

    # Manipur
    "Senapati": {"lat": 25.2678, "lng": 94.0191, "elevation": 1050, "state": "MN", "type": "TRANSIT_STATION"},
    "Imphal": {"lat": 24.8170, "lng": 93.9368, "elevation": 786, "state": "MN", "type": "STATE_CAPITAL"},
    "Ukhrul": {"lat": 25.1100, "lng": 94.3600, "elevation": 2020, "state": "MN", "type": "HIGH_ALTITUDE_HUB"},
    "Jiribam": {"lat": 24.8000, "lng": 93.1200, "elevation": 33, "state": "MN", "type": "RAIL_GATEWAY"},
    "Noney": {"lat": 24.8500, "lng": 93.6000, "elevation": 420, "state": "MN", "type": "TRANSIT_DEPOT"},
    "Kakching": {"lat": 24.4800, "lng": 93.9800, "elevation": 798, "state": "MN", "type": "REGIONAL_HUB"},
    "Churachandpur": {"lat": 24.3333, "lng": 93.6833, "elevation": 914, "state": "MN", "type": "REGIONAL_HUB"},
    "Moreh": {"lat": 24.2442, "lng": 94.3025, "elevation": 240, "state": "MN", "type": "BORDER_TRADE_POST"},

    # Mizoram
    "Kolasib": {"lat": 24.2300, "lng": 92.6800, "elevation": 888, "state": "MZ", "type": "TRANSIT_DEPOT"},
    "Aizawl": {"lat": 23.7271, "lng": 92.7176, "elevation": 1132, "state": "MZ", "type": "STATE_CAPITAL"},
    "Champhai": {"lat": 23.4750, "lng": 93.3275, "elevation": 1678, "state": "MZ", "type": "BORDER_TRADE_POST"},
    "Serchhip": {"lat": 23.3400, "lng": 92.8500, "elevation": 1285, "state": "MZ", "type": "MOUNTAIN_HUB"},
    "Lunglei": {"lat": 22.8872, "lng": 92.7350, "elevation": 722, "state": "MZ", "type": "MOUNTAIN_HUB"},
    "Lawngtlai": {"lat": 22.5300, "lng": 92.8900, "elevation": 790, "state": "MZ", "type": "REGIONAL_HUB"},
    "Saiha": {"lat": 22.4900, "lng": 92.9700, "elevation": 729, "state": "MZ", "type": "MOUNTAIN_HUB"},

    # Tripura
    "Dharmanagar": {"lat": 24.3700, "lng": 92.1700, "elevation": 21, "state": "TR", "type": "RAIL_GATEWAY"},
    "Ambassa": {"lat": 23.9200, "lng": 91.8500, "elevation": 80, "state": "TR", "type": "TRANSIT_DEPOT"},
    "Agartala": {"lat": 23.8315, "lng": 91.2868, "elevation": 15, "state": "TR", "type": "STATE_CAPITAL"},
    "Udaipur": {"lat": 23.5333, "lng": 91.4833, "elevation": 28, "state": "TR", "type": "REGIONAL_HUB"},
    "Belonia": {"lat": 23.2500, "lng": 91.4500, "elevation": 23, "state": "TR", "type": "BORDER_POST"},
    "Sabroom": {"lat": 23.0000, "lng": 91.7000, "elevation": 18, "state": "TR", "type": "BORDER_POST"},

    # Sikkim & North Bengal
    "Siliguri": {"lat": 26.7271, "lng": 88.3953, "elevation": 122, "state": "WB", "type": "CHICKEN_NECK_CORRIDOR"},
    "Lava": {"lat": 27.0800, "lng": 88.6600, "elevation": 2130, "state": "WB", "type": "HIGH_ALTITUDE_HUB"},
    "Gangtok": {"lat": 27.3389, "lng": 88.6065, "elevation": 1650, "state": "SK", "type": "STATE_CAPITAL"},
    "Namchi": {"lat": 27.1700, "lng": 88.3500, "elevation": 1315, "state": "SK", "type": "MOUNTAIN_HUB"},
    "Pelling": {"lat": 27.3200, "lng": 88.2400, "elevation": 2150, "state": "SK", "type": "HIGH_ALTITUDE_HUB"},
    "Mangan": {"lat": 27.5097, "lng": 88.5298, "elevation": 1310, "state": "SK", "type": "NORTH_SIKKIM_HUB"},
    "Chungthang": {"lat": 27.6000, "lng": 88.6400, "elevation": 1790, "state": "SK", "type": "STRATEGIC_BORDER_DEPOT"},
}

# Road segments with realistic distance (km), highway classification, baseline grade (%), base hazard risk
NER_EDGES = [
    # Lower Assam & Siliguri
    ("Siliguri", "Bongaigaon", {"distance": 230, "highway": "NH-27", "quality": "EXCELLENT_4LANE", "grade": 0.8, "base_risk": 0.08}),
    ("Bongaigaon", "Guwahati", {"distance": 155, "highway": "NH-27", "quality": "EXCELLENT_4LANE", "grade": 0.8, "base_risk": 0.08}),
    ("Siliguri", "Dhubri", {"distance": 210, "highway": "NH-17", "quality": "GOOD_2LANE", "grade": 0.9, "base_risk": 0.12}),
    ("Dhubri", "Goalpara", {"distance": 65, "highway": "NH-17", "quality": "GOOD_2LANE", "grade": 0.9, "base_risk": 0.10}),
    ("Goalpara", "Guwahati", {"distance": 135, "highway": "NH-17", "quality": "GOOD_2LANE", "grade": 1.2, "base_risk": 0.10}),

    # Meghalaya
    ("Goalpara", "Tura", {"distance": 105, "highway": "NH-217", "quality": "MODERATE_HILL", "grade": 4.5, "base_risk": 0.25}),
    ("Tura", "Williamnagar", {"distance": 72, "highway": "NH-217", "quality": "MODERATE_HILL", "grade": 5.0, "base_risk": 0.28}),
    ("Williamnagar", "Nongstoin", {"distance": 85, "highway": "NH-106", "quality": "MODERATE_HILL", "grade": 5.8, "base_risk": 0.30}),
    ("Nongstoin", "Shillong", {"distance": 92, "highway": "NH-106", "quality": "GOOD_2LANE", "grade": 5.2, "base_risk": 0.22}),
    ("Guwahati", "Shillong", {"distance": 99, "highway": "NH-6", "danger_key": "GHY_SHL_4LANE", "quality": "EXCELLENT_4LANE", "grade": 6.5, "base_risk": 0.15}),
    ("Shillong", "Sohra", {"distance": 54, "highway": "SH-5", "quality": "GOOD_2LANE", "grade": 8.0, "base_risk": 0.35}),
    ("Shillong", "Dawki", {"distance": 82, "highway": "NH-206", "is_detour": True, "quality": "MODERATE_2LANE", "grade": 7.5, "base_risk": 0.30}),
    ("Dawki", "Jowai", {"distance": 46, "highway": "NH-206", "is_detour": True, "quality": "MODERATE_2LANE", "grade": 6.0, "base_risk": 0.28}),
    ("Shillong", "Jowai", {"distance": 64, "highway": "NH-6", "danger_key": "SHL_JOWAI_2LANE", "quality": "GOOD_2LANE", "grade": 5.5, "base_risk": 0.25}),
    ("Jowai", "Khliehriat", {"distance": 32, "highway": "NH-6", "danger_key": "JOWAI_KHLIEHRIAT", "quality": "GOOD_2LANE", "grade": 6.2, "base_risk": 0.35}),
    ("Khliehriat", "Silchar", {"distance": 120, "highway": "NH-6", "danger_key": "SONAPUR_NH6", "quality": "RUGGED_HILL", "grade": 9.2, "base_risk": 0.65}), # Sonapur tunnel landslide prone
    ("Dawki", "Silchar", {"distance": 135, "highway": "NH-206", "is_detour": True, "quality": "MODERATE_HILL", "grade": 4.8, "base_risk": 0.30}),

    # Central & Upper Assam
    ("Guwahati", "Nagaon", {"distance": 120, "highway": "NH-27", "quality": "EXCELLENT_4LANE", "grade": 1.1, "base_risk": 0.08}),
    ("Nagaon", "Tezpur", {"distance": 65, "highway": "NH-715", "quality": "EXCELLENT_4LANE", "grade": 1.0, "base_risk": 0.08}),
    ("Nagaon", "Haflong", {"distance": 165, "highway": "NH-27_MAHASADAK", "quality": "EXCELLENT_4LANE", "grade": 5.5, "base_risk": 0.25}),
    ("Haflong", "Silchar", {"distance": 105, "highway": "NH-27_MAHASADAK", "quality": "EXCELLENT_4LANE", "grade": 6.2, "base_risk": 0.30}),
    ("Nagaon", "Jorhat", {"distance": 180, "highway": "NH-715", "quality": "GOOD_4LANE", "grade": 1.2, "base_risk": 0.10}),
    ("Jorhat", "Sivasagar", {"distance": 55, "highway": "NH-715", "quality": "GOOD_4LANE", "grade": 1.0, "base_risk": 0.08}),
    ("Sivasagar", "Dibrugarh", {"distance": 82, "highway": "NH-37", "quality": "GOOD_4LANE", "grade": 1.0, "base_risk": 0.08}),
    ("Dibrugarh", "Tinsukia", {"distance": 48, "highway": "NH-37", "quality": "GOOD_4LANE", "grade": 0.9, "base_risk": 0.06}),
    ("Tezpur", "North_Lakhimpur", {"distance": 175, "highway": "NH-15", "quality": "GOOD_2LANE", "grade": 1.2, "base_risk": 0.15}),
    ("North_Lakhimpur", "Dhemaji", {"distance": 65, "highway": "NH-15", "quality": "GOOD_2LANE", "grade": 1.0, "base_risk": 0.12}),
    ("Dibrugarh", "Dhemaji", {"distance": 45, "highway": "BOGIBEEL_BRIDGE", "quality": "EXCELLENT_4LANE", "grade": 1.0, "base_risk": 0.08}),
    ("Dhemaji", "Pasighat", {"distance": 110, "highway": "NH-515", "quality": "GOOD_2LANE", "grade": 2.2, "base_risk": 0.20}),

    # Arunachal Pradesh
    ("Tezpur", "Bhalukpong", {"distance": 58, "highway": "NH-13", "quality": "GOOD_2LANE", "grade": 3.5, "base_risk": 0.20}),
    ("Bhalukpong", "Bomdila", {"distance": 98, "highway": "NH-13", "quality": "STEEP_MOUNTAIN", "grade": 7.2, "base_risk": 0.45}),
    ("Bomdila", "Dirang", {"distance": 42, "highway": "NH-13", "quality": "MOUNTAIN_2LANE", "grade": 5.8, "base_risk": 0.35}),
    ("Dirang", "Sela_Pass", {"distance": 62, "highway": "NH-13", "danger_key": "SELA_PASS_NH13", "quality": "HIGH_ALTITUDE_PASS", "grade": 11.2, "base_risk": 0.70}),
    ("Sela_Pass", "Tawang", {"distance": 78, "highway": "NH-13", "danger_key": "SELA_PASS_NH13", "quality": "HIGH_ALTITUDE_PASS", "grade": 8.5, "base_risk": 0.65}),
    ("Dirang", "Tawang", {"distance": 125, "highway": "NH-13_SELA_BYPASS", "is_detour": True, "quality": "SANGTI_4X4_TRACK", "grade": 9.8, "base_risk": 0.40}),
    ("Tezpur", "Itanagar", {"distance": 155, "highway": "NH-15_NH415", "quality": "GOOD_4LANE", "grade": 3.2, "base_risk": 0.20}),
    ("Itanagar", "Ziro", {"distance": 110, "highway": "NH-13", "quality": "MOUNTAIN_2LANE", "grade": 6.8, "base_risk": 0.40}),
    ("Ziro", "Daporijo", {"distance": 160, "highway": "NH-13", "quality": "MOUNTAIN_2LANE", "grade": 7.5, "base_risk": 0.45}),
    ("Daporijo", "Aalo", {"distance": 155, "highway": "NH-13", "quality": "MOUNTAIN_2LANE", "grade": 7.0, "base_risk": 0.42}),
    ("Aalo", "Pasighat", {"distance": 105, "highway": "NH-13", "quality": "GOOD_2LANE", "grade": 5.5, "base_risk": 0.35}),
    ("Tinsukia", "Roing", {"distance": 115, "highway": "DHOLA_SADIYA", "quality": "EXCELLENT_2LANE", "grade": 1.8, "base_risk": 0.15}),
    ("Roing", "Tezu", {"distance": 65, "highway": "NH-13", "quality": "GOOD_2LANE", "grade": 3.2, "base_risk": 0.22}),
    ("Tezu", "Namsai", {"distance": 55, "highway": "NH-13", "quality": "GOOD_2LANE", "grade": 2.0, "base_risk": 0.18}),
    ("Namsai", "Changlang", {"distance": 85, "highway": "NH-215", "quality": "MOUNTAIN_2LANE", "grade": 6.0, "base_risk": 0.38}),
    ("Changlang", "Khonsa", {"distance": 68, "highway": "NH-215", "quality": "MOUNTAIN_2LANE", "grade": 7.8, "base_risk": 0.42}),
    ("Khonsa", "Dibrugarh", {"distance": 125, "highway": "NH-315A", "quality": "GOOD_2LANE", "grade": 4.5, "base_risk": 0.25}),

    # Nagaland & Manipur
    ("Nagaon", "Dimapur", {"distance": 165, "highway": "NH-29", "quality": "GOOD_4LANE", "grade": 2.5, "base_risk": 0.15}),
    ("Dimapur", "Kohima", {"distance": 74, "highway": "NH-29", "quality": "CRITICAL_HILL_CORRIDOR", "grade": 8.5, "base_risk": 0.60}),
    ("Kohima", "Wokha", {"distance": 75, "highway": "NH-2", "quality": "MOUNTAIN_2LANE", "grade": 7.2, "base_risk": 0.38}),
    ("Wokha", "Mokokchung", {"distance": 82, "highway": "NH-2", "quality": "MOUNTAIN_2LANE", "grade": 7.5, "base_risk": 0.40}),
    ("Mokokchung", "Jorhat", {"distance": 88, "highway": "NH-702D", "quality": "STEEP_HILL", "grade": 6.0, "base_risk": 0.32}),
    ("Mokokchung", "Tuensang", {"distance": 115, "highway": "NH-202", "quality": "RUGGED_HILL", "grade": 8.8, "base_risk": 0.48}),
    ("Tuensang", "Mon", {"distance": 140, "highway": "NH-202", "quality": "RUGGED_HILL", "grade": 8.5, "base_risk": 0.50}),
    ("Kohima", "Phek", {"distance": 120, "highway": "NH-29A", "quality": "STEEP_HILL", "grade": 9.0, "base_risk": 0.45}),
    ("Kohima", "Senapati", {"distance": 68, "highway": "NH-2", "quality": "HILL_HIGHWAY", "grade": 6.2, "base_risk": 0.40}),
    ("Senapati", "Imphal", {"distance": 62, "highway": "NH-2", "quality": "VALLEY_APPROACH", "grade": 4.5, "base_risk": 0.25}),
    ("Silchar", "Jiribam", {"distance": 52, "highway": "NH-37", "quality": "GOOD_2LANE", "grade": 3.5, "base_risk": 0.25}),
    ("Jiribam", "Noney", {"distance": 98, "highway": "NH-37", "quality": "MOUNTAIN_2LANE", "grade": 7.8, "base_risk": 0.55}),
    ("Noney", "Imphal", {"distance": 65, "highway": "NH-37", "quality": "MOUNTAIN_2LANE", "grade": 6.0, "base_risk": 0.40}),
    ("Imphal", "Ukhrul", {"distance": 84, "highway": "NH-202", "quality": "STEEP_MOUNTAIN", "grade": 8.2, "base_risk": 0.45}),
    ("Imphal", "Kakching", {"distance": 45, "highway": "NH-2", "quality": "GOOD_4LANE", "grade": 1.5, "base_risk": 0.10}),
    ("Kakching", "Churachandpur", {"distance": 48, "highway": "NH-2", "quality": "GOOD_2LANE", "grade": 3.5, "base_risk": 0.20}),
    ("Kakching", "Moreh", {"distance": 68, "highway": "NH-102_AH1", "quality": "BORDER_HIGHWAY", "grade": 5.5, "base_risk": 0.35}),

    # Mizoram
    ("Silchar", "Kolasib", {"distance": 85, "highway": "NH-306", "quality": "HILL_2LANE", "grade": 6.8, "base_risk": 0.42}),
    ("Kolasib", "Aizawl", {"distance": 87, "highway": "NH-306", "quality": "STEEP_RIDGE", "grade": 8.2, "base_risk": 0.50}),
    ("Aizawl", "Champhai", {"distance": 188, "highway": "NH-6", "quality": "MOUNTAIN_2LANE", "grade": 7.5, "base_risk": 0.38}),
    ("Aizawl", "Serchhip", {"distance": 90, "highway": "NH-54", "quality": "STEEP_RIDGE", "grade": 7.8, "base_risk": 0.40}),
    ("Serchhip", "Lunglei", {"distance": 78, "highway": "NH-54", "quality": "MOUNTAIN_PASS", "grade": 8.5, "base_risk": 0.45}),
    ("Lunglei", "Lawngtlai", {"distance": 54, "highway": "NH-54", "quality": "MOUNTAIN_2LANE", "grade": 7.0, "base_risk": 0.38}),
    ("Lawngtlai", "Saiha", {"distance": 28, "highway": "NH-54", "quality": "MOUNTAIN_2LANE", "grade": 6.5, "base_risk": 0.30}),

    # Tripura
    ("Silchar", "Karimganj", {"distance": 55, "highway": "NH-8", "quality": "GOOD_2LANE", "grade": 1.0, "base_risk": 0.10}),
    ("Karimganj", "Dharmanagar", {"distance": 62, "highway": "NH-8", "quality": "GOOD_2LANE", "grade": 2.5, "base_risk": 0.15}),
    ("Dharmanagar", "Ambassa", {"distance": 85, "highway": "NH-8", "quality": "GOOD_2LANE", "grade": 3.5, "base_risk": 0.20}),
    ("Ambassa", "Agartala", {"distance": 88, "highway": "NH-8", "quality": "GOOD_2LANE", "grade": 3.0, "base_risk": 0.18}),
    ("Agartala", "Udaipur", {"distance": 52, "highway": "NH-8", "quality": "EXCELLENT_4LANE", "grade": 1.2, "base_risk": 0.08}),
    ("Udaipur", "Belonia", {"distance": 45, "highway": "NH-8", "quality": "GOOD_2LANE", "grade": 1.5, "base_risk": 0.10}),
    ("Belonia", "Sabroom", {"distance": 50, "highway": "NH-8_MAITRI_SETU", "quality": "GOOD_2LANE", "grade": 1.2, "base_risk": 0.08}),

    # Sikkim & North Bengal
    ("Siliguri", "Gangtok", {"distance": 114, "highway": "NH-10", "quality": "TEESTA_VALLEY_GORGE", "grade": 8.5, "base_risk": 0.68}),
    ("Siliguri", "Lava", {"distance": 85, "highway": "NH-717A", "quality": "GOOD_DEFENSE_ROAD", "grade": 6.2, "base_risk": 0.25}),
    ("Lava", "Gangtok", {"distance": 72, "highway": "NH-717A_RESIDETOUR", "quality": "GOOD_DEFENSE_ROAD", "grade": 6.5, "base_risk": 0.28}),
    ("Gangtok", "Namchi", {"distance": 78, "highway": "NH-510", "quality": "MOUNTAIN_2LANE", "grade": 8.0, "base_risk": 0.45}),
    ("Namchi", "Pelling", {"distance": 68, "highway": "NH-510", "quality": "MOUNTAIN_2LANE", "grade": 9.5, "base_risk": 0.50}),
    ("Gangtok", "Mangan", {"distance": 65, "highway": "NORTH_SIKKIM_HWY", "quality": "EXTREME_MOUNTAIN", "grade": 10.5, "base_risk": 0.75}),
    ("Mangan", "Chungthang", {"distance": 35, "highway": "NORTH_SIKKIM_HWY", "quality": "EXTREME_MOUNTAIN", "grade": 12.0, "base_risk": 0.80}),
]

def build_ner_network_graph() -> nx.Graph:
    """Builds an undirected NetworkX graph with realistic terrain attributes."""
    G = nx.Graph()
    for name, data in NER_NODES.items():
        G.add_node(name, **data)
    
    for u, v, attrs in NER_EDGES:
        # compute elevation differential
        elev_u = NER_NODES[u]["elevation"]
        elev_v = NER_NODES[v]["elevation"]
        elev_diff = abs(elev_v - elev_u)
        G.add_edge(u, v, **attrs, elevation_diff=elev_diff)
    return G

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Computes great circle distance between two points."""
    R = 6371.0 # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2.0)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2.0)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def find_nearest_node(lat: float, lng: float) -> str:
    """Finds the closest NER graph node to given coordinates."""
    min_dist = float('inf')
    best_node = "Guwahati"
    for name, data in NER_NODES.items():
        dist = haversine_distance_km(lat, lng, data["lat"], data["lng"])
        if dist < min_dist:
            min_dist = dist
            best_node = name
    return best_node
