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
    var routeList= document.getElementById("route-list");
    routes.forEach(route => {
        let li = document.createElement("li");
        li.innerHTML = route.name + ": " + route.description;
        routeList.appendChild(li);
    });
}
