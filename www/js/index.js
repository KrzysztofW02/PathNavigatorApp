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

    var map = L.map('map').setView([51.505, -0.09], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

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

document.addEventListener('DOMContentLoaded', function() {
});

function displayRoutes(routes) {
    var routeList = document.getElementById("route-list");
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
}

function selectRoute(routeId) {
    var url = `http://10.0.2.2:3000/api/routes/${routeId}/waypoints`; 
    
    cordova.plugin.http.get(url, {}, {}, function (response) {
        let waypoints = JSON.parse(response.data);
        displayWaypoints(waypoints);
    }, function(error) {
        console.error(error);
    });
}

function displayWaypoints(waypoints) {
    waypoints.forEach(waypoint => {
        console.log(`Waypoint: ${waypoint.name}, Coordinates: (${waypoint.lat}, ${waypoint.lng})`);
    });
}

