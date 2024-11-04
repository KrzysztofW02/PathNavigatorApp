const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors');

const routes = [
  {
    id: 1,
    name: 'Trasa Górska',
    description: 'Przyjemna wycieczka przez górskie szlaki',
    waypoints: [
      { id: 1, name: 'Start', description: 'Początek trasy', lat: 49.2827, lng: 19.9383 },
      { id: 2, name: 'Punkt Widokowy', description: 'Piękny widok na dolinę', lat: 49.2987, lng: 19.9723 },
      { id: 3, name: 'Meta', description: 'Koniec trasy', lat: 49.3101, lng: 19.9876 },
    ]
  },
  {
    id: 2,
    name: 'Spacer po Mieście',
    description: 'Zwiedzanie zabytkowych ulic miasta',
    waypoints: [
      { id: 1, name: 'Rynek', description: 'Główny plac miasta', lat: 50.0621, lng: 19.9382 },
      { id: 2, name: 'Kościół Mariacki', description: 'Zabytkowy kościół', lat: 50.0625, lng: 19.9397 },
      { id: 3, name: 'Wawel', description: 'Zamek królewski', lat: 50.0540, lng: 19.9366 },
    ]
  },
  {
    id: 3,
    name: 'Wycieczka po Lesie',
    description: 'Trasa przez malowniczy las',
    waypoints: [
      { id: 1, name: 'Wejście do lasu', description: 'Początek ścieżki', lat: 52.2297, lng: 21.0122 },
      { id: 2, name: 'Środek lasu', description: 'Cicha i spokojna okolica', lat: 52.2397, lng: 21.0222 },
      { id: 3, name: 'Polana', description: 'Miejsce na odpoczynek', lat: 52.2497, lng: 21.0322 },
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
