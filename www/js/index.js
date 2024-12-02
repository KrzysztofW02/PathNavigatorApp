document.addEventListener('deviceready', function () {
    var permissions = cordova.plugins.permissions;
    permissions.requestPermission(
        permissions.ACCESS_FINE_LOCATION,
        function (status) {
            if (status.hasPermission) {
                console.log('Geolocation permission granted');
                initApp(); 
            } else {
                console.error('Geolocation permission denied');
            }
        },
        function (error) {
            console.error('Error requesting geolocation permission: ', error);
        }
    );
});

let map;

function initApp() {
    console.log("Initializing the app...");

    if (typeof L === 'undefined') {
        console.error("Leaflet library (L) is not loaded!");
        return;
    }

    const url = "http://localhost:3000/api/routes"; 
    if (navigator.onLine) {
        cordova.plugin.http.get(url, {}, {}, function (response) {
            let routes = JSON.parse(response.data);
            displayRoutes(routes);
        }, function(error) {
            console.error("Error fetching routes: ", error);
        });
    } else {
        console.log("Offline mode: Loading routes from local storage...");
        loadOfflineRoutes();
    }

    console.log("Setting up the map...");
    map = L.map('map').setView([51.505, -0.09], 13); 

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    getLocation();
}

let shouldCenterMap = true; 
let currentLocationMarker = null; 

function getLocation() {
    const locationDisplay = document.getElementById("location-display");

    if (!map) {
        console.error("Map is not initialized");
        return;
    }

    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
            function (position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                locationDisplay.innerHTML = `Latitude: ${lat}<br>Longitude: ${lng}`;

                if (currentLocationMarker) {
                    currentLocationMarker.setLatLng([lat, lng]);
                } else {
                    currentLocationMarker = L.marker([lat, lng]).addTo(map);
                }

                if (shouldCenterMap) {
                    map.setView([lat, lng], 13);
                }
            },
            function (error) {
                console.error('Error with watchPosition:', error.message);
                locationDisplay.innerHTML = "Error retrieving location.";
            },
            {
                enableHighAccuracy: true,
                maximumAge: 30000,
                timeout: 27000
            }
        );

        map.on('movestart', function () {
            shouldCenterMap = false;
        });
    } else {
        locationDisplay.innerHTML = "Geolocation is not supported by this browser.";
    }
}

function displayRoutes(routes) {
    var routeList = document.getElementById("route-list");

    if (routeList) {
        console.log("Route list element found. Displaying routes...");
        
        routeList.innerHTML = '';

        routes.forEach(route => {
            let li = document.createElement("li");
            li.innerHTML = route.name + ": " + route.description;

            let selectButton = document.createElement("button");
            selectButton.innerText = "Select Route";
            selectButton.onclick = function() {
                selectRoute(route.id);
            };

            li.appendChild(selectButton);
            routeList.appendChild(li);
        });
    } else {
        console.error("Route list element not found!");
    }
}


let selectedRouteId = null;
let currentPolyline = null;
let currentMarkers = [];
let routingControl = null;

function selectRoute(routeId) {
    if (selectedRouteId === routeId) {
        console.log("This route is already selected.");
        return; 
    }

    if (routingControl) {
        map.removeControl(routingControl);
        routingControl = null;
    }

    if (currentPolyline) {
        map.removeLayer(currentPolyline);
        currentPolyline = null;
    }
    if (currentMarkers.length > 0) {
        currentMarkers.forEach(marker => map.removeLayer(marker));
        currentMarkers = [];
    }

    selectedRouteId = routeId;
    const url = `http://localhost:3000/api/routes/${routeId}/waypoints`;

    console.log(`Fetching waypoints for route ID: ${routeId}...`);

    cordova.plugin.http.get(url, {}, {}, function (response) {
        let waypoints = JSON.parse(response.data);
        saveRouteOffline(routeId, waypoints);

        displayRouteWithRoutingMachine(waypoints);
        const lastWaypoint = waypoints[waypoints.length - 1];
        checkArrival(lastWaypoint);
    }, function (error) {
        console.error("Error fetching waypoints: ", error);
    });
}


function displayWaypoints(waypoints) {
    const latLngs = waypoints.map(wp => {
        let marker = L.marker([wp.lat, wp.lng]).addTo(map).bindPopup(wp.name);
        currentMarkers.push(marker); 
        return [wp.lat, wp.lng];
    });

    currentPolyline = L.polyline(latLngs, { color: 'blue', weight: 4 }).addTo(map);
}

function saveRouteOffline(routeId, waypoints) {
    const routeData = JSON.stringify(waypoints);
    localStorage.setItem(`route-${routeId}`, routeData);
}

function loadRouteOffline(routeId) {
    const routeData = localStorage.getItem(`route-${routeId}`);
    return routeData ? JSON.parse(routeData) : null;
}

function loadOfflineRoutes() {
    const routeList = [];
    
    for (let key in localStorage) {
        if (key.startsWith("route-")) { 
            const routeId = key.split("-")[1];
            const waypoints = loadRouteOffline(routeId);
            routeList.push({ id: routeId, waypoints });
        }
    }
    displayRoutes(routeList); 
}

function startNavigation() {
    console.log("Starting navigation...");

    if (!selectedRouteId) {
        console.error("No route selected for navigation.");
        return;
    }

    const waypoints = JSON.parse(localStorage.getItem(`route-${selectedRouteId}`)); 

    if (!waypoints || waypoints.length === 0) {
        console.error("No waypoints available for navigation.");
        return;
    }

    if (routingControl) {
        map.removeControl(routingControl);
    }

    console.log("Drawing route using Leaflet Routing Machine...");
    routingControl = L.Routing.control({
        waypoints: waypoints.map(wp => L.latLng(wp.lat, wp.lng)),
        routeWhileDragging: false,
        draggableWaypoints: false,
        addWaypoints: false,
        show: true,
        lineOptions: {
            styles: [{ color: 'red', weight: 6 }]
        }
    }).addTo(map);
}

let isRouteReady = false;

function displayRouteWithRoutingMachine(waypoints) {
    const leafletWaypoints = waypoints.map(wp => L.latLng(wp.lat, wp.lng));

    routingControl = L.Routing.control({
        waypoints: leafletWaypoints,
        routeWhileDragging: false,
        draggableWaypoints: false,
        addWaypoints: false,
        show: true,
        lineOptions: {
            styles: [{ color: 'blue', weight: 4 }]
        },
        createMarker: function() { return null; } 
    }).addTo(map);

    routingControl.on('routesfound', function(e) {
        console.log("Route has been successfully generated.");
        routeCoordinates = e.routes[0].coordinates; 
    });
}


function centerOnCurrentLocation() {
    if (currentLocationMarker) {
        const latLng = currentLocationMarker.getLatLng();
        map.setView(latLng, 13); 
        shouldCenterMap = true; 
    } else {
        console.log("Current location is not available yet.");
    }
}

let hasArrived = false; 

function simulateNavigation() {
    console.log("Starting simulation...");
    hasArrived = false;

    if (!routeCoordinates || routeCoordinates.length === 0) {
        console.error("No route data available.");
        return;
    }

    let index = 0;
    const totalDuration = 5000; 
    const interval = totalDuration / routeCoordinates.length; 

    const simulationInterval = setInterval(() => {
        if (index >= routeCoordinates.length) {
            clearInterval(simulationInterval);
            console.log("Dotarłeś do miejsca.");
            return;
        }

        const { lat, lng } = routeCoordinates[index];
        console.log(`Simulated location: (${lat}, ${lng})`);

        if (currentLocationMarker) {
            currentLocationMarker.setLatLng([lat, lng]);
        } else {
            currentLocationMarker = L.marker([lat, lng]).addTo(map);
        }

        if (shouldCenterMap) {
            map.setView([lat, lng], 13);
        }

        index++; 
    }, interval); 
}


function checkArrival(lastWaypoint) {
    watchId = navigator.geolocation.watchPosition(
        function (position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            const distance = calculateDistance(lat, lng, lastWaypoint.lat, lastWaypoint.lng);
            if (!hasArrived && distance <= 50) { 
                hasArrived = true; 
                alert(`Witamy na miejscu! ${lastWaypoint.name}`);
                stopWatchingLocation(); 
            }
        },
        function (error) {
            console.error('Błąd podczas sprawdzania lokalizacji:', error.message);
        },
        { enableHighAccuracy: true }
    );
}

let watchId = null;

function stopWatchingLocation() {
    if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }
}

function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371e3; 
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; 
}
