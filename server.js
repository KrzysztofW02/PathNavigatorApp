const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors');

const routes = [
  {
    id: 1,
    name: 'Trasa Górska',
    description: 'Przyjemna wycieczka przez górskie szlaki w okolicy Bielska-Białej',
    waypoints: [
      { id: 1, name: 'Start - Dolina Wapienicy', description: 'Początek trasy', lat: 49.7851, lng: 18.9816 },
      { id: 2, name: 'Przełęcz Łysa', description: 'Piękny widok na okoliczne góry', lat: 49.7729, lng: 18.9652 },
      { id: 3, name: 'Meta - Szczyt Klimczok', description: 'Koniec trasy', lat: 49.7558, lng: 18.9574 },
    ]
  },
  {
    id: 2,
    name: 'Spacer po Mieście',
    description: 'Zwiedzanie atrakcji Bielska-Białej',
    waypoints: [
      { id: 1, name: 'Plac Chrobrego', description: 'Główny plac w mieście', lat: 49.78420, lng: 19.0600 },
      { id: 2, name: 'Zamek Sułkowskich', description: 'Zabytkowy zamek z XVIII wieku', lat: 49.78422, lng: 19.0611 },
      { id: 3, name: 'Rynek', description: 'Centralny rynek z klimatycznymi kamienicami', lat: 49.78522, lng: 19.0622 },
    ]
  },
  {
    id: 3,
    name: 'Wycieczka po Lesie',
    description: 'Trasa przez malowniczy las w pobliżu Bielska-Białej',
    waypoints: [
      { id: 1, name: 'Wejście do Lasu Cygańskiego', description: 'Początek leśnej ścieżki', lat: 49.8168, lng: 19.0345 },
      { id: 2, name: 'Polana z Altaną', description: 'Miejsce na odpoczynek z widokiem na góry', lat: 49.8129, lng: 19.0256 },
      { id: 3, name: 'Szczyt Dębowiec', description: 'Punkt końcowy trasy, widok na Beskidy', lat: 49.8009, lng: 19.0238 },
    ]
  }
];

app.use(cors({
  origin: '*' 
}));

app.get('/api/routes', (req, res) => {
  res.json(routes);
});

app.get('/api/routes/:id/waypoints', (req, res) => {
  const routeId = parseInt(req.params.id);
  const route = routes.find(route => route.id === routeId);

  if (route) {
    res.json(route.waypoints);
  } else {
    res.status(404).json({ message: 'Route not found' });
  }
});


app.listen(port, () => {
  console.log(`Serwer działa na http://localhost:${port}`);
});
