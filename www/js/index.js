document.addEventListener('deviceready', function () {
    var url = "http://localhost:3000/api/routes";

    cordova.plugin.http.get(url, {}, {}, function (response) {
        let routes = JSON.parse(response.data);
        console.log(routes);
        displayRoutes(routes);
    }, function(error) {
        console.error("Błąd pobierania danych: " + error);
    });
});

function displayRoutes(routes) {
    var routeList= document.getElementById("route-list");
    routes.forEach(route => {
        let li = document.createElement("li");
        li.innerHTML = route.name; + ": " + route.description;
        routeList.appendChild(li);
    });
}
