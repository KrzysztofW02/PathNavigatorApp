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
            console.log("Parsed routes: ", routes);
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
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.marker([51.5, -0.09]).addTo(map)
        .bindPopup('A pretty CSS popup.<br> Easily customizable.')
        .openPopup();

    navigator.geolocation.getCurrentPosition(onSuccess, onError);

    function onSuccess(position) {
        console.log('Latitude: ' + position.coords.latitude + '\n' +
                    'Longitude: ' + position.coords.longitude + '\n');
        map.setView([position.coords.latitude, position.coords.longitude], 13);
    }

    function onError(error) {
        console.error('Error getting geolocation: ' + error.message);
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
