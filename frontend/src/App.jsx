import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import MapViewer from './components/MapViewer';
import RoutePlanner from './components/RoutePlanner';
import HazardPredictor from './components/HazardPredictor';
import DataArchitectureView from './components/DataArchitectureView';
import TelemetryStreamFeed from './components/TelemetryStreamFeed';
import IncidentReporter from './components/IncidentReporter';
import ColdChainSimulatorModal from './components/ColdChainSimulatorModal';
import VehicleInspectorModal from './components/VehicleInspectorModal';
import AddConvoyModal from './components/AddConvoyModal';
import RoleDashboardView from './components/RoleDashboardView';
import DriverNavigationHUD from './components/DriverNavigationHUD';
import AmbientCanvas from './components/AmbientCanvas';
import AuthModal, { DEMO_USERS } from './components/AuthModal';
import AIMissionSimulatorHelpbox from './components/AIMissionSimulatorHelpbox';
import { calculateTacticalRoute } from './utils/nerRoutingEngine';
import { 
  INITIAL_ACTIVE_INCIDENTS, INITIAL_FLEET_VEHICLES, 
  NER_TOPOLOGY_LOCATIONS, NER_WAREHOUSES_DATA 
} from './data/mockMasterData';
import { checkBackendHealth, checkAIHealth, optimizeRouteApi } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [backendOnline, setBackendOnline] = useState(false);
  const [aiOnline, setAiOnline] = useState(false);
  const [activeIncidents, setActiveIncidents] = useState(INITIAL_ACTIVE_INCIDENTS);
  const [fleetVehicles, setFleetVehicles] = useState(INITIAL_FLEET_VEHICLES);
  const [plannedRoute, setPlannedRoute] = useState(null);
  const [alternativeRoute, setAlternativeRoute] = useState(null);
  const [trackedVehicle, setTrackedVehicle] = useState(null);
  
  // RBAC User Authentication State
  const [currentUser, setCurrentUser] = useState(DEMO_USERS[0]); // Default to ROLE_ADMIN
  const [authToken, setAuthToken] = useState("siH26002_jwt_bearer_token");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Vehicle Inspection Modal State
  const [selectedVehicleForInspection, setSelectedVehicleForInspection] = useState(null);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);

  // Add Convoy Dispatch Modal State
  const [isAddConvoyModalOpen, setIsAddConvoyModalOpen] = useState(false);

  // Modals
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [isColdChainModalOpen, setIsColdChainModalOpen] = useState(false);
  const [coldChainAlertBanner, setColdChainAlertBanner] = useState(null);

  // Health checks
  useEffect(() => {
    async function checkHealth() {
      const bOk = await checkBackendHealth();
      const aOk = await checkAIHealth();
      setBackendOnline(bOk);
      setAiOnline(aOk);
    }
    checkHealth();
    const interval = setInterval(checkHealth, 8000);
    return () => clearInterval(interval);
  }, []);

  // Filter incidents for active user context
  const getEffectiveIncidentsForRouting = (user = currentUser, incidents = activeIncidents) => {
    // Exclude any incident that has been cleared or reached 100%
    const unblockedIncidents = incidents.filter(inc => 
      inc.status !== 'OFFICIAL_CLEARED' && 
      inc.status !== 'RESOLVED_CLEARED' && 
      (inc.clearancePercent === undefined || inc.clearancePercent < 100)
    );

    if (!user) return unblockedIncidents.filter(inc => inc.verified);
    
    // Admins and BRO Inspectors see all verified + pending for tactical inspection
    if (user.role === 'ROLE_ADMIN' || user.role === 'ROLE_BRO_INSPECTOR') {
      return unblockedIncidents;
    }
    
    // Field Driver: Sees all verified incidents PLUS their own reported unverified hazards
    // (So their personal vehicle immediately gets tactical detour navigation!)
    if (user.role === 'ROLE_FIELD_DRIVER') {
      return unblockedIncidents.filter(inc => 
        inc.verified || 
        inc.reportedBy === user.name ||
        inc.reporterRole === user.role
      );
    }
    
    // All other drivers/dispatchers/public: ONLY officially verified incidents affect routes!
    return unblockedIncidents.filter(inc => inc.verified);
  };

  // Compute initial route on mount
  useEffect(() => {
    async function loadInitialRoute() {
      const routingIncidents = getEffectiveIncidentsForRouting(currentUser, INITIAL_ACTIVE_INCIDENTS);

      const tactical = calculateTacticalRoute({
        originName: 'Guwahati',
        destinationName: 'Tezpur',
        vehicleType: 'HEAVY_COMMERCIAL',
        activeIncidents: routingIncidents,
        userRole: currentUser.role
      });
      setPlannedRoute(tactical);

      const originObj = NER_TOPOLOGY_LOCATIONS.find(n => n.name === 'Guwahati');
      const destObj = NER_TOPOLOGY_LOCATIONS.find(n => n.name === 'Tezpur');

      const payload = {
        origin: { lat: 26.1445, lng: 91.7362, name: 'Guwahati' },
        destination: { lat: 26.6528, lng: 92.7926, name: 'Tezpur' },
        vehicle_type: 'HEAVY_COMMERCIAL',
        cargo_weight_kg: 3500,
        is_emergency_relief: false,
        weather: { rainfall_24h_mm: 75, is_monsoon_active: true },
        active_incidents: routingIncidents.map(inc => ({
          incident_id: inc.id,
          hazard_type: inc.hazardType,
          severity: inc.severity,
          road_name: inc.roadName || "NH-6",
          landmark: inc.landmark || "Mountain Hazard",
          danger_key: inc.dangerKey || (
            (inc.landmark || '').toUpperCase().includes('SELA') || (inc.roadName || '').includes('13') ? 'SELA_PASS_NH13' :
            (inc.landmark || '').toUpperCase().includes('SONAPUR') || (inc.roadName || '').includes('6') ? 'SONAPUR_NH6' :
            (inc.landmark || '').toUpperCase().includes('PAGLA') || (inc.roadName || '').includes('29') ? 'PAGLA_PAHAR_NH29' :
            (inc.landmark || '').toUpperCase().includes('TEESTA') || (inc.roadName || '').includes('10') ? 'TEESTA_NH10' :
            'GENERAL_OBSTACLE'
          ),
          status: 'ACTIVE',
          verified: true,
          location: { lat: inc.lat, lng: inc.lng },
          impact_radius_km: 15.0,
          passable_by_4x4: inc.passableBy4x4 || false
        })),
        avoid_high_altitude_passes: false
      };

      try {
        const data = await optimizeRouteApi(payload);
        if (data && data.recommended_route && data.recommended_route.segments?.length > 0) {
          if (tactical && tactical.segments && tactical.segments.length > 0) {
            const tacticalPts = tactical.segments.flatMap(s => s.polyline || []);
            const apiPts = data.recommended_route.segments.flatMap(s => s.polyline || []);
            if (tacticalPts.length > apiPts.length) {
              data.recommended_route.segments = tactical.segments;
            }
          }
          setPlannedRoute(data.recommended_route);
          setAlternativeRoute(data.alternative_routes?.[0] || null);
        }
      } catch (e) {
        // Kept tactical route
      }
    }
    loadInitialRoute();
  }, []);

  // Vehicle movement simulation
  useEffect(() => {
    const moveInterval = setInterval(() => {
      setFleetVehicles(prevVehicles =>
        prevVehicles.map(v => {
          const angleRad = (v.heading * Math.PI) / 180;
          const speedFactor = 0.00035;
          const dLat = Math.cos(angleRad) * speedFactor;
          const dLng = Math.sin(angleRad) * speedFactor;
          
          return {
            ...v,
            lat: Number((v.lat + dLat).toFixed(4)),
            lng: Number((v.lng + dLng).toFixed(4)),
            speedKmh: Math.max(20, Math.min(85, v.speedKmh + (Math.random() * 4 - 2))),
            engineTemp: Math.min(96, Math.max(78, v.engineTemp + (Math.random() * 1 - 0.5)))
          };
        })
      );
    }, 2500);

    return () => clearInterval(moveInterval);
  }, []);

  const handleRouteCalculated = (rec, alt) => {
    setPlannedRoute(rec);
    setAlternativeRoute(alt);
    setActiveTab('map');
  };

  const handleQuickRoutePlan = async (originName, destName, vehicleMode = 'TRUCK', userContext = currentUser, incidentsContext = activeIncidents) => {
    const vType = vehicleMode === 'DRONE' 
      ? 'CARGO_DRONE' 
      : vehicleMode === '4X4' 
      ? 'OFFROAD_4X4' 
      : 'HEAVY_COMMERCIAL';

    const effectiveIncidents = getEffectiveIncidentsForRouting(userContext, incidentsContext);

    // 1. Calculate instant, realistic tactical detour route with real curved road coordinates
    const tacticalRoute = calculateTacticalRoute({
      originName,
      destinationName: destName,
      vehicleType: vType,
      activeIncidents: effectiveIncidents,
      userRole: userContext?.role || 'ROLE_ADMIN'
    });

    setPlannedRoute(tacticalRoute);
    setAlternativeRoute(null);

    // 2. Also query backend / AI microservice if reachable
    const originObj = NER_TOPOLOGY_LOCATIONS.find(n => n.name === originName);
    const destObj = NER_TOPOLOGY_LOCATIONS.find(n => n.name === destName);

    const payload = {
      origin: { lat: originObj ? originObj.lat : 26.1445, lng: originObj ? originObj.lng : 91.7362, name: originName },
      destination: { lat: destObj ? destObj.lat : 27.5861, lng: destObj ? destObj.lng : 91.8653, name: destName },
      vehicle_type: vType,
      cargo_weight_kg: vType === 'CARGO_DRONE' ? 50 : vType === 'OFFROAD_4X4' ? 1200 : 4500,
      is_emergency_relief: vType === 'OFFROAD_4X4' || vType === 'CARGO_DRONE',
      weather: { rainfall_24h_mm: 60, is_monsoon_active: true },
      active_incidents: effectiveIncidents.map(inc => ({
        incident_id: inc.id,
        hazard_type: inc.hazardType,
        severity: inc.severity,
        road_name: inc.roadName || "NH-6",
        landmark: inc.landmark || "Mountain Hazard",
        danger_key: inc.dangerKey || (
          (inc.landmark || '').toUpperCase().includes('SELA') || (inc.roadName || '').includes('13') ? 'SELA_PASS_NH13' :
          (inc.landmark || '').toUpperCase().includes('SONAPUR') || (inc.roadName || '').includes('6') ? 'SONAPUR_NH6' :
          (inc.landmark || '').toUpperCase().includes('PAGLA') || (inc.roadName || '').includes('29') ? 'PAGLA_PAHAR_NH29' :
          (inc.landmark || '').toUpperCase().includes('TEESTA') || (inc.roadName || '').includes('10') ? 'TEESTA_NH10' :
          'GENERAL_OBSTACLE'
        ),
        status: 'ACTIVE',
        verified: true,
        location: { lat: inc.lat, lng: inc.lng },
        impact_radius_km: 15.0,
        passable_by_4x4: inc.passableBy4x4 || false
      })),
      avoid_high_altitude_passes: false
    };

    try {
      const data = await optimizeRouteApi(payload);
      if (data && data.recommended_route && data.recommended_route.segments?.length > 0) {
        // Retain high-density curved road coordinates from tactical engine if present
        if (tacticalRoute && tacticalRoute.segments && tacticalRoute.segments.length > 0) {
          const tacticalPts = tacticalRoute.segments.flatMap(s => s.polyline || []);
          const apiPts = data.recommended_route.segments.flatMap(s => s.polyline || []);
          if (tacticalPts.length > apiPts.length) {
            data.recommended_route.segments = tacticalRoute.segments;
          }
        }
        setPlannedRoute(data.recommended_route);
        setAlternativeRoute(data.alternative_routes?.[0] || null);
      }
    } catch (e) {
      // Kept tacticalRoute
    }
  };

  // When an incident is added
  const handleIncidentAdded = (newInc) => {
    const updatedIncidents = [newInc, ...activeIncidents];
    setActiveIncidents(updatedIncidents);

    // If the reporting user is a Field Driver, immediately recalculate their route with this obstacle avoided!
    if (currentUser.role === 'ROLE_FIELD_DRIVER') {
      const originName = plannedRoute?.waypoints?.[0]?.name || 'Guwahati';
      const destName = plannedRoute?.waypoints?.[plannedRoute?.waypoints?.length - 1]?.name || 'Tezpur';
      handleQuickRoutePlan(originName, destName, 'TRUCK', currentUser, updatedIncidents);
      setActiveTab('map');
    }
  };

  const handleToggleVerifyIncident = (incidentId) => {
    const updated = activeIncidents.map(inc => {
      if (inc.id === incidentId) {
        const nextVerified = !inc.verified;
        return {
          ...inc,
          verified: nextVerified,
          status: nextVerified ? 'OFFICIAL_VERIFIED' : 'PENDING_VERIFICATION',
          verifiedBy: nextVerified 
            ? `${currentUser?.name || "Maj. T. Norbu"} (${currentUser?.role === 'ROLE_ADMIN' ? 'DoNER Admin' : 'BRO Task Force 88'})`
            : "Pending BRO Verification",
          machineryDeployed: nextVerified 
            ? "2x Heavy Bulldozers & Excavator Clearing Active" 
            : "Awaiting Site Inspection Certification"
        };
      }
      return inc;
    });

    setActiveIncidents(updated);

    // When an Admin / BRO Inspector verifies or revokes, recalculate system routes for everyone!
    const originName = plannedRoute?.waypoints?.[0]?.name || 'Guwahati';
    const destName = plannedRoute?.waypoints?.[plannedRoute?.waypoints?.length - 1]?.name || 'Tawang';
    handleQuickRoutePlan(originName, destName, 'TRUCK', currentUser, updated);
  };

  const handleDismissIncident = (incidentId) => {
    const updated = activeIncidents.filter(inc => inc.id !== incidentId);
    setActiveIncidents(updated);
    const originName = plannedRoute?.waypoints?.[0]?.name || 'Guwahati';
    const destName = plannedRoute?.waypoints?.[plannedRoute?.waypoints?.length - 1]?.name || 'Tezpur';
    handleQuickRoutePlan(originName, destName, 'TRUCK', currentUser, updated);
  };

  // 🛠️ Live Clearance Progress & SITREP Updation Handler (Admin / BRO Only)
  const handleUpdateIncidentProgress = (incidentId, newPercent, newHours, newSitrep) => {
    const isComplete = Number(newPercent) >= 100;
    const updated = activeIncidents.map(inc => {
      if (inc.id === incidentId) {
        const updatedUpdates = newSitrep ? [
          {
            time: "Just now",
            author: `${currentUser?.name || "BRO Official"} (${currentUser?.role === 'ROLE_ADMIN' ? 'Admin' : 'BRO Task Force'})`,
            message: newSitrep,
            progressPercent: Number(newPercent)
          },
          ...(inc.clearanceUpdates || [])
        ] : (inc.clearanceUpdates || []);

        return {
          ...inc,
          clearancePercent: Number(newPercent),
          clearanceHours: isComplete ? 0 : Number(newHours),
          status: isComplete ? 'OFFICIAL_CLEARED' : inc.status,
          verified: isComplete ? false : inc.verified,
          clearanceUpdates: updatedUpdates
        };
      }
      return inc;
    });

    setActiveIncidents(updated);

    // If marked 100% complete, recalculate route to reopen normal highway!
    if (isComplete) {
      const originName = plannedRoute?.waypoints?.[0]?.name || 'Guwahati';
      const destName = plannedRoute?.waypoints?.[plannedRoute?.waypoints?.length - 1]?.name || 'Tawang';
      handleQuickRoutePlan(originName, destName, 'TRUCK', currentUser, updated);
    }
  };

  // 🚀 Handle New Convoy Dispatch
  const handleAddVehicle = (newVeh) => {
    setFleetVehicles(prev => [newVeh, ...prev]);
    setTrackedVehicle(newVeh);
    const mode = newVeh.type === 'CARGO_DRONE' ? 'DRONE' : newVeh.type === 'OFFROAD_4X4' ? '4X4' : 'TRUCK';
    handleQuickRoutePlan(newVeh.origin, newVeh.destination, mode);
    setActiveTab('map');
  };

  // Handle Cold-Chain Emergency Diversion Simulation Event
  const handleColdChainDiversion = (event) => {
    setColdChainAlertBanner({
      type: event.type,
      message: event.type === 'ROAD_DIVERSION'
        ? `🚨 THERMAL BREACH: NER-TRUCK-AS01-9921 Diverted to ${event.targetDepot.name} (ETA: ${event.targetDepot.etaMinutes}m)`
        : `🛸 DRONE AIRLIFT: Autonomous Medical Drone AI-07 dispatched for payload intercept`
    });

    setFleetVehicles(prev => prev.map(v => {
      if (v.vehicleId === 'NER-TRUCK-AS01-9921') {
        return {
          ...v,
          status: 'EMERGENCY_COLD_DIVERSION',
          destination: event.targetDepot.name.split(' ')[0],
          speedKmh: 68
        };
      }
      return v;
    }));

    handleQuickRoutePlan('Tezpur', 'Guwahati', event.type === 'DRONE_AIRLIFT' ? 'DRONE' : '4X4');
    setActiveTab('map');
  };

  const handleResetColdChain = () => {
    setColdChainAlertBanner(null);
  };

  const handleLogin = (user, token) => {
    setCurrentUser(user);
    setAuthToken(token);
    setActiveTab('dashboard');
    // When switching user persona, re-evaluate their specific route context
    handleQuickRoutePlan('Guwahati', user.role === 'ROLE_FIELD_DRIVER' ? 'Tezpur' : 'Tawang', 'TRUCK', user, activeIncidents);
  };

  const handleSelectVehicle = (veh) => {
    setSelectedVehicleForInspection(veh);
    setIsVehicleModalOpen(true);
  };

  const handleTrackVehicleOnMap = (veh) => {
    setTrackedVehicle(veh);
    handleQuickRoutePlan(veh.origin, veh.destination, veh.type === 'CARGO_DRONE' ? 'DRONE' : veh.type === 'OFFROAD_4X4' ? '4X4' : 'TRUCK');
    setActiveTab('map');
  };

  const handleRunScenario = (scenarioKey) => {
    if (scenarioKey === 'SONAPUR_DETOUR') {
      // Ensure Sonapur incident is active & verified
      const updated = activeIncidents.map(inc => {
        if (inc.roadName?.includes('NH-6') || inc.id?.includes('SONA')) {
          return { ...inc, verified: true, clearancePercent: 15, status: 'OFFICIAL_VERIFIED' };
        }
        return inc;
      });
      setActiveIncidents(updated);
      handleQuickRoutePlan('Guwahati', 'Silchar', 'TRUCK', currentUser, updated);
      setActiveTab('map');
    } else if (scenarioKey === 'SELA_PASS_4X4') {
      // Ensure Sela Pass incident is active & verified
      const updated = activeIncidents.map(inc => {
        if (inc.roadName?.includes('NH-13') || inc.id?.includes('SELA')) {
          return { ...inc, verified: true, clearancePercent: 20, status: 'OFFICIAL_VERIFIED' };
        }
        return inc;
      });
      setActiveIncidents(updated);
      handleQuickRoutePlan('Dirang', 'Tawang', '4X4', currentUser, updated);
      setActiveTab('map');
    }
  };

  const handleClearAllRoadblocks = () => {
    const cleared = activeIncidents.map(inc => ({
      ...inc,
      verified: true,
      clearancePercent: 100,
      clearanceHours: 0,
      status: 'OFFICIAL_CLEARED'
    }));
    setActiveIncidents(cleared);

    // Recalculate route on opened highways
    const firstWp = plannedRoute?.waypoints?.[0]?.name.split(' ')[0] || 'Guwahati';
    const lastWp = plannedRoute?.waypoints?.[plannedRoute?.waypoints?.length - 1]?.name.split(' ')[0] || 'Silchar';
    const foundOrigin = NER_TOPOLOGY_LOCATIONS.find(n => n.name === firstWp || plannedRoute?.waypoints?.[0]?.name.includes(n.name));
    const foundDest = NER_TOPOLOGY_LOCATIONS.find(n => n.name === lastWp || plannedRoute?.waypoints?.[plannedRoute?.waypoints?.length - 1]?.name.includes(n.name));
    
    handleQuickRoutePlan(foundOrigin?.name || 'Guwahati', foundDest?.name || 'Silchar', 'TRUCK', currentUser, cleared);
    setActiveTab('map');
  };

  return (
    <div className="min-h-screen bg-[#03050c] text-zinc-100 flex flex-col selection:bg-emerald-500 selection:text-white relative overflow-x-hidden pb-16">
      {/* Lusion-Inspired Fluid Ambient Particle Canvas & Glows */}
      <AmbientCanvas />

      {/* 🤖 AI Mission Copilot & Smart Hazard Simulator Helpbox (Only on Map & Dashboard tabs) */}
      {(activeTab === 'map' || activeTab === 'dashboard') && currentUser?.role !== 'ROLE_FIELD_DRIVER' && (
        <AIMissionSimulatorHelpbox
          currentUser={currentUser}
          plannedRoute={plannedRoute}
          activeIncidents={activeIncidents}
          fleetVehicles={fleetVehicles}
          onQuickRoutePlan={(orig, dest, mode) => handleQuickRoutePlan(orig, dest, mode, currentUser, activeIncidents)}
          onIncidentToggle={(updatedIncidents) => {
            setActiveIncidents(updatedIncidents);
            const firstWp = plannedRoute?.waypoints?.[0]?.name.split(' ')[0] || 'Guwahati';
            const lastWp = plannedRoute?.waypoints?.[plannedRoute?.waypoints?.length - 1]?.name.split(' ')[0] || 'Silchar';
            handleQuickRoutePlan(firstWp, lastWp, 'TRUCK', currentUser, updatedIncidents);
          }}
          onClearAllRoadblocks={handleClearAllRoadblocks}
          onSimulateColdBreach={() => setIsColdChainModalOpen(true)}
          onSelectConvoy={(veh) => {
            setTrackedVehicle(veh);
            const mode = veh.type === 'CARGO_DRONE' ? 'DRONE' : veh.type === 'OFFROAD_4X4' ? '4X4' : 'TRUCK';
            handleQuickRoutePlan(veh.origin, veh.destination, mode, currentUser, activeIncidents);
          }}
        />
      )}

      {/* Navbar with Role Badge & Regional Alert Ticker */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        backendOnline={backendOnline}
        aiOnline={aiOnline}
        onOpenIncidentModal={() => setIsIncidentModalOpen(true)}
        onOpenColdChainSimulator={() => setIsColdChainModalOpen(true)}
        onOpenAddConvoyModal={() => setIsAddConvoyModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        currentUser={currentUser}
      />

      {/* Emergency Cold Chain Alert Banner (When active) */}
      {coldChainAlertBanner && (
        <div className="bg-gradient-to-r from-cyan-950 via-blue-950 to-cyan-950 border-b border-cyan-500/50 px-4 py-2 flex items-center justify-between text-xs font-semibold text-cyan-300">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span>{coldChainAlertBanner.message}</span>
          </div>
          <button
            onClick={() => setColdChainAlertBanner(null)}
            className="text-zinc-400 hover:text-white text-xs underline font-normal"
          >
            Dismiss Alert
          </button>
        </div>
      )}

      {/* Main Layout Area */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-3 sm:px-6 py-2.5">
        {/* Dynamic Role-Tailored Dashboard View */}
        {activeTab === 'dashboard' && (
          <div className="w-full space-y-4">
            <RoleDashboardView
              currentUser={currentUser}
              fleetVehicles={fleetVehicles}
              activeIncidents={activeIncidents}
              plannedRoute={plannedRoute}
              onQuickRoutePlan={handleQuickRoutePlan}
              onIncidentToggle={setActiveIncidents}
              onNavigateToMap={() => setActiveTab('map')}
              onNavigateToDriverNav={() => setActiveTab('driver_nav')}
              onOpenIncidentModal={() => setIsIncidentModalOpen(true)}
              onOpenColdChainSimulator={() => setIsColdChainModalOpen(true)}
              onOpenAddConvoyModal={() => setIsAddConvoyModalOpen(true)}
              onSelectVehicle={handleSelectVehicle}
              onToggleVerifyIncident={handleToggleVerifyIncident}
              onDismissIncident={handleDismissIncident}
              onUpdateIncidentProgress={handleUpdateIncidentProgress}
              onSwitchUser={handleLogin}
            />
          </div>
        )}

        {/* 🧭 Dedicated In-Cabin Field Driver GPS Navigation HUD */}
        {activeTab === 'driver_nav' && (
          <div className="w-full space-y-4">
            <DriverNavigationHUD
              currentUser={currentUser}
              fleetVehicles={fleetVehicles}
              activeIncidents={activeIncidents}
              plannedRoute={plannedRoute}
              onQuickRoutePlan={handleQuickRoutePlan}
              onIncidentAdded={handleIncidentAdded}
              onSwitchUser={handleLogin}
            />
          </div>
        )}

        {/* Operations Map Tab: Full-Width Immersive GIS Canvas */}
        {activeTab === 'map' && (
          <div className="space-y-3">
            <MapViewer
              activeIncidents={activeIncidents}
              fleetVehicles={fleetVehicles}
              plannedRoute={plannedRoute}
              alternativeRoute={alternativeRoute}
              onQuickRoutePlan={handleQuickRoutePlan}
              onSelectVehicle={handleSelectVehicle}
              onOpenAddConvoyModal={() => setIsAddConvoyModalOpen(true)}
              trackedVehicle={trackedVehicle}
              currentUser={currentUser}
              onToggleVerifyIncident={handleToggleVerifyIncident}
              onDismissIncident={handleDismissIncident}
              onUpdateIncidentProgress={handleUpdateIncidentProgress}
            />

            {/* Live Telemetry Stream Bar */}
            <TelemetryStreamFeed 
              fleetVehicles={fleetVehicles} 
              currentUser={currentUser}
              onSelectVehicle={handleSelectVehicle}
            />
          </div>
        )}

        {/* AI Route Planner Tab (Available to ROLE_ADMIN & ROLE_DISPATCHER) */}
        {activeTab === 'routing' && currentUser.allowedTabs.includes('routing') && (
          <div className="max-w-7xl mx-auto space-y-4">
            <RoutePlanner
              onRouteCalculated={handleRouteCalculated}
              activeIncidents={getEffectiveIncidentsForRouting(currentUser, activeIncidents)}
            />
          </div>
        )}

        {/* Geotechnical ML Hazard Predictor Tab (Available to ROLE_ADMIN, ROLE_DISPATCHER, ROLE_BRO_INSPECTOR) */}
        {activeTab === 'hazards' && currentUser.allowedTabs.includes('hazards') && (
          <div className="max-w-7xl mx-auto space-y-4">
            <HazardPredictor />
          </div>
        )}

        {/* Hybrid Data Architecture Tab (Restricted to ROLE_ADMIN only) */}
        {activeTab === 'data' && currentUser.allowedTabs.includes('data') && (
          <div className="max-w-7xl mx-auto space-y-4">
            <DataArchitectureView />
          </div>
        )}
      </main>

      {/* Add Convoy Dispatch Modal */}
      <AddConvoyModal
        isOpen={isAddConvoyModalOpen}
        onClose={() => setIsAddConvoyModalOpen(false)}
        onAddVehicle={handleAddVehicle}
        currentUser={currentUser}
      />

      {/* Incident Reporting Modal */}
      <IncidentReporter
        isOpen={isIncidentModalOpen}
        onClose={() => setIsIncidentModalOpen(false)}
        onIncidentAdded={handleIncidentAdded}
        currentUser={currentUser}
      />

      {/* Cold Chain Vaccine Malfunction Simulator Modal */}
      <ColdChainSimulatorModal
        isOpen={isColdChainModalOpen}
        onClose={() => setIsColdChainModalOpen(false)}
        onTriggerDiversion={handleColdChainDiversion}
        onResetSimulation={handleResetColdChain}
      />

      {/* RBAC Authentication & Role Switcher Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLogin={handleLogin}
      />

      {/* Interactive Vehicle Mission & Checkpoints Inspector Modal */}
      <VehicleInspectorModal
        isOpen={isVehicleModalOpen}
        onClose={() => setIsVehicleModalOpen(false)}
        vehicle={selectedVehicleForInspection}
        onTrackOnMap={handleTrackVehicleOnMap}
      />

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-[#070a14] py-2.5 text-center text-xs text-zinc-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <span>Smart India Hackathon 2026 • SIH26002 • North Eastern Accessibility Intelligence Platform</span>
          <span>Security: Spring Security 6 + JWT RBAC (Active: {currentUser.role})</span>
        </div>
      </footer>
    </div>
  );
}
