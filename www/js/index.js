document.addEventListener('deviceready', function () {
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
