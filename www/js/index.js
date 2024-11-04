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

function initApp() {
    console.log("Initializing the app...");

    if (typeof L === 'undefined') {
        console.error("Leaflet library (L) is not loaded!");
        return;
    }

    var url = "http://10.0.2.2:3000/api/routes"; 
    cordova.plugin.http.get(url, {}, {}, function (response) {
        try {
            let routes = JSON.parse(response.data);
            displayRoutes(routes);
        } catch (e) {
            console.error("Error parsing JSON: ", e);
        }
    }, function(error) {
        console.error(error);
    });

    console.log("Setting up the map...");
    var map = L.map('map').setView([51.505, -0.09], 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    getLocation(map);
}

function getLocation(map) {
    const locationDisplay = document.getElementById("location-display");

    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
            function (position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                locationDisplay.innerHTML = `Latitude: ${lat}<br>Longitude: ${lng}`;
                map.setView([lat, lng], 13);

                L.marker([lat, lng]).addTo(map)
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
    } else {
        locationDisplay.innerHTML = "Geolocation is not supported by this browser.";
    }
}


function displayRoutes(routes) {
    var routeList = document.getElementById("route-list");
    
    if (routeList) {
        console.log("Route list element found. Displaying routes...");

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

function selectRoute(routeId) {
    var url = `http://10.0.2.2:3000/api/routes/${routeId}/waypoints`; 

    console.log(`Fetching waypoints for route ID: ${routeId}...`);

    cordova.plugin.http.get(url, {}, {}, function (response) {
        let waypoints = JSON.parse(response.data);
        displayWaypoints(waypoints);
    }, function(error) {
        console.error("Error fetching waypoints: ", error);
    });
}

function displayWaypoints(waypoints) {
    waypoints.forEach(waypoint => {
        console.log(`Waypoint: ${waypoint.name}, Coordinates: (${waypoint.lat}, ${waypoint.lng})`);
    });
}
