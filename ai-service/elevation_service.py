from typing import List, Dict, Any, Tuple
import numpy as np
from schemas import ElevationPoint, LatLng
from ner_graph import NER_NODES

def generate_elevation_profile(path_nodes: List[str], total_distance_km: float) -> Tuple[List[ElevationPoint], Dict[str, float]]:
    """
    Interpolates elevation and slope gradients between waypoints along the route path.
    """
    if not path_nodes:
        return [], {"avg_elevation": 0.0, "max_elevation": 0.0, "elevation_gain": 0.0, "max_gradient": 0.0}

    node_elevations = [NER_NODES[n]["elevation"] for n in path_nodes]
    num_steps = max(len(path_nodes) * 5, 20)
    
    # Calculate step distances
    step_dist = total_distance_km / (num_steps - 1) if num_steps > 1 else 0
    
    points: List[ElevationPoint] = []
    # Create smooth spline-like interpolation
    x_indices = np.linspace(0, len(path_nodes) - 1, num_steps)
    interp_elevations = np.interp(x_indices, np.arange(len(path_nodes)), node_elevations)
    
    # Add slight natural terrain roughness
    np.random.seed(hash("".join(path_nodes)) % 10000)
    noise = np.random.normal(0, 15, num_steps)
    interp_elevations = np.maximum(10, interp_elevations + noise)
    
    total_gain = 0.0
    max_gradient = 0.0
    
    for i in range(num_steps):
        dist_so_far = round(i * step_dist, 1)
        elev = round(float(interp_elevations[i]), 1)
        
        if i > 0:
            elev_diff = elev - points[i-1].elevation_m
            horizontal_dist_m = max(step_dist * 1000.0, 1.0)
            grad_pct = round((elev_diff / horizontal_dist_m) * 100.0, 2)
            if elev_diff > 0:
                total_gain += elev_diff
            max_gradient = max(max_gradient, abs(grad_pct))
        else:
            grad_pct = 0.0
            
        # Risk factor increases on higher slopes & altitudes
        hazard_risk = min(0.95, round(0.1 + (elev / 5000.0) * 0.4 + (abs(grad_pct) / 20.0) * 0.4, 2))

        points.append(ElevationPoint(
            distance_km=dist_so_far,
            elevation_m=elev,
            gradient_percent=grad_pct,
            hazard_risk_score=hazard_risk
        ))
        
    stats = {
        "avg_elevation": round(float(np.mean(interp_elevations)), 1),
        "max_elevation": round(float(np.max(interp_elevations)), 1),
        "elevation_gain": round(float(total_gain), 1),
        "max_gradient": round(float(max_gradient), 1)
    }
    
    return points, stats

def interpolate_polyline(coord1: Tuple[float, float], coord2: Tuple[float, float], num_points: int = 6) -> List[List[float]]:
    """Generates realistic curved coordinates between two geographic points."""
    lats = np.linspace(coord1[0], coord2[0], num_points)
    lngs = np.linspace(coord1[1], coord2[1], num_points)
    
    # Add realistic winding mountain road perturbation
    np.random.seed(int((coord1[0] + coord2[0]) * 1000) % 10000)
    lat_wobble = np.random.normal(0, 0.006, num_points)
    lng_wobble = np.random.normal(0, 0.006, num_points)
    
    # Keep endpoints exact
    lat_wobble[0] = lat_wobble[-1] = 0
    lng_wobble[0] = lng_wobble[-1] = 0
    
    polyline = []
    for lat, lng, dw_lat, dw_lng in zip(lats, lngs, lat_wobble, lng_wobble):
        polyline.append([round(float(lat + dw_lat), 5), round(float(lng + dw_lng), 5)])
    return polyline
