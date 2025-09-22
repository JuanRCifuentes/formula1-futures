# Formula 1 2025 Championship Points Tracker

A lightweight single-page application that visualises a fictional take on the 2025 Formula 1 World Championship. Explore driver standings, cumulative points progression, race summaries and detailed results for every round in the season.

## Features

- 📊 **Driver standings** with wins, podiums, fastest laps and average finishing positions.
- 📈 **Interactive Chart.js visualisation** of cumulative championship points with driver highlighting and all-driver toggle.
- 🗺️ **Race timeline** cards summarising podiums, fastest laps and storyline for each Grand Prix.
- 🧭 **Results explorer** table with race and driver filters to inspect how points were earned.
- 📁 All data is included locally (`seasonData.js`) so the app works offline without an API.

## Getting started

1. Clone the repository and open the project folder.
2. Serve the files with any static web server or open `index.html` directly in your browser.
   - Example using Python: `python -m http.server 8000`
   - Then browse to `http://localhost:8000` and navigate to `index.html`.

## Project structure

```
├── app.js           # Application logic and interactive behaviour
├── index.html       # Main page markup
├── seasonData.js    # Driver and race data for the 2025 season (fictional)
├── styles.css       # Styling and layout
└── README.md
```

## Notes

- The standings and results portray a narrative scenario for 2025 and are not based on real-world data.
- The visuals are optimised for modern browsers. For the best experience view the app on a device wider than 768px.
