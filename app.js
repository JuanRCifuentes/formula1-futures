import { seasonData } from './seasonData.js';

const driverColors = {
  'Max Verstappen': '#1e41ff',
  'Lando Norris': '#ff8700',
  'Charles Leclerc': '#dc0000',
  'Lewis Hamilton': '#00d2be',
  'Oscar Piastri': '#f4d03f',
  'Carlos Sainz': '#f05e23',
  'George Russell': '#4cd0c8',
  'Sergio Perez': '#3671c6',
  'Fernando Alonso': '#006f62',
  'Alex Albon': '#005aff',
};

const state = {
  races: seasonData.races,
  standings: seasonData.standings,
  selectedDriver: seasonData.standings[0]?.driver || '',
  showAllDrivers: true,
  driverHistory: {},
};

let chart;
let elements;

const raceLabels = state.races.map((race) => `R${String(race.round).padStart(2, '0')}`);

function init() {
  elements = {
    championCard: document.getElementById('championCard'),
    standingsBody: document.querySelector('#standingsTable tbody'),
    driverSelect: document.getElementById('driverSelect'),
    showAllToggle: document.getElementById('showAllDrivers'),
    chartCanvas: document.getElementById('progressChart'),
    driverInsight: document.getElementById('driverInsight'),
    timeline: document.getElementById('raceTimeline'),
    raceFilter: document.getElementById('raceFilter'),
    driverFilter: document.getElementById('driverFilter'),
    resultsBody: document.querySelector('#resultsTable tbody'),
  };

  state.driverHistory = buildDriverHistory(state.races);

  renderChampionCard();
  renderStandings();
  populateDriverSelect();
  setupChart();
  renderDriverInsight();
  renderTimeline();
  populateFilters();
  updateResultsTable();

  elements.driverSelect.addEventListener('change', (event) => {
    state.selectedDriver = event.target.value;
    renderStandings();
    renderDriverInsight();
    updateChartAppearance();
  });

  elements.showAllToggle.addEventListener('change', (event) => {
    state.showAllDrivers = event.target.checked;
    updateChartAppearance();
  });

  elements.raceFilter.addEventListener('change', updateResultsTable);
  elements.driverFilter.addEventListener('change', updateResultsTable);

  window.addEventListener('resize', () => chart?.resize());
}

document.addEventListener('DOMContentLoaded', init);

function buildDriverHistory(races) {
  const map = {};
  races.forEach((race) => {
    race.results.forEach((result) => {
      if (!map[result.driver]) {
        map[result.driver] = [];
      }
      map[result.driver].push({
        round: race.round,
        race: race.name,
        date: race.date,
        position: result.position,
        points: result.points,
        fastestLap: race.fastestLap.driver === result.driver,
      });
    });
  });
  return map;
}

function renderChampionCard() {
  const champion = state.standings[0];
  if (!champion) {
    elements.championCard.textContent = 'No data available';
    return;
  }

  const runnerUp = state.standings[1];
  const gapToSecond = runnerUp ? champion.points - runnerUp.points : 0;

  elements.championCard.innerHTML = `
    <h2>World Champion</h2>
    <strong>${champion.driver}</strong>
    <span>${champion.team}</span>
    <div class="meta">
      <span>${champion.points} pts</span>
      <span>${champion.wins} wins</span>
      <span>${champion.podiums} podiums</span>
    </div>
    <p>Fastest laps: ${champion.fastestLaps} • Final margin: ${gapToSecond} pts</p>
  `;
}

function renderStandings() {
  const body = elements.standingsBody;
  const leaderPoints = state.standings[0]?.points ?? 0;
  body.innerHTML = '';

  state.standings.forEach((entry, index) => {
    const row = document.createElement('tr');
    if (entry.driver === state.selectedDriver) {
      row.classList.add('highlight');
    }

    const gap = index === 0 ? '—' : `+${leaderPoints - entry.points}`;

    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${entry.driver}</td>
      <td>${entry.team}</td>
      <td>${entry.points}</td>
      <td>${gap}</td>
      <td>${entry.wins}</td>
      <td>${entry.podiums}</td>
      <td>${entry.fastestLaps}</td>
      <td>P${entry.averageFinish}</td>
    `;

    body.appendChild(row);
  });
}

function populateDriverSelect() {
  const select = elements.driverSelect;
  select.innerHTML = '';

  state.standings.forEach((entry, index) => {
    const option = document.createElement('option');
    option.value = entry.driver;
    option.textContent = `#${index + 1} ${entry.driver}`;
    if (entry.driver === state.selectedDriver) {
      option.selected = true;
    }
    select.appendChild(option);
  });
}

function setupChart() {
  const ctx = elements.chartCanvas.getContext('2d');
  const datasets = state.standings.map((entry) => buildDataset(entry));

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: raceLabels,
      datasets,
    },
    options: {
      maintainAspectRatio: false,
      responsive: true,
      interaction: {
        intersect: false,
        mode: 'index',
      },
      plugins: {
        legend: {
          labels: {
            color: '#e2e8f0',
            usePointStyle: true,
            font: {
              family: 'Barlow',
              size: 12,
            },
          },
        },
        tooltip: {
          callbacks: {
            title: (items) => {
              if (!items.length) return '';
              const index = items[0].dataIndex;
              const race = state.races[index];
              return `Round ${race.round} • ${race.name}`;
            },
            label: (context) => {
              const race = state.races[context.dataIndex];
              return `${context.dataset.label}: ${context.formattedValue} pts after ${race.name}`;
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: '#cbd5f5',
          },
          grid: {
            color: 'rgba(148, 163, 184, 0.15)',
          },
        },
        y: {
          ticks: {
            color: '#cbd5f5',
          },
          beginAtZero: true,
          grid: {
            color: 'rgba(148, 163, 184, 0.15)',
          },
        },
      },
    },
  });
}

function buildDataset(entry) {
  const baseColor = driverColors[entry.driver] || '#94a3b8';
  const isSelected = entry.driver === state.selectedDriver;
  return {
    label: entry.driver,
    data: entry.progression,
    borderColor: baseColor,
    backgroundColor: hexToRgba(baseColor, isSelected ? 0.25 : 0.1),
    borderWidth: isSelected ? 3 : 1.5,
    pointRadius: isSelected ? 4 : 2,
    pointHoverRadius: 5,
    tension: 0.28,
    fill: false,
    hidden: !state.showAllDrivers && !isSelected,
  };
}

function updateChartAppearance() {
  chart.data.datasets.forEach((dataset) => {
    const baseColor = driverColors[dataset.label] || '#94a3b8';
    const isSelected = dataset.label === state.selectedDriver;
    dataset.hidden = !state.showAllDrivers && !isSelected;
    dataset.borderWidth = isSelected ? 3 : 1.5;
    dataset.pointRadius = isSelected ? 4 : state.showAllDrivers ? 2 : 0;
    dataset.backgroundColor = hexToRgba(baseColor, isSelected ? 0.28 : 0.08);
    dataset.borderColor = baseColor;
  });
  chart.update();
}

function renderDriverInsight() {
  const insight = elements.driverInsight;
  const entry = state.standings.find((driver) => driver.driver === state.selectedDriver);
  if (!entry) {
    insight.textContent = 'Select a driver to see season insights.';
    return;
  }

  const history = state.driverHistory[state.selectedDriver] || [];
  if (!history.length) {
    insight.textContent = 'No race history available.';
    return;
  }

  const bestFinish = [...history].sort((a, b) => a.position - b.position)[0];
  const highestScore = [...history].sort((a, b) => b.points - a.points)[0];
  const latestRace = history[history.length - 1];
  const topFiveCount = history.filter((race) => race.position <= 5).length;

  insight.innerHTML = `
    <h3>${entry.driver}</h3>
    <p>${entry.team} • ${entry.points} pts • ${entry.wins} wins • ${entry.podiums} podiums • ${entry.fastestLaps} fastest laps</p>
    <ul>
      <li>Best finish: P${bestFinish.position} at ${bestFinish.race}</li>
      <li>Highest scoring weekend: ${highestScore.points} pts at ${highestScore.race}</li>
      <li>Top-five finishes: ${topFiveCount} of ${history.length}</li>
      <li>Wrapped the year with P${latestRace.position} in ${latestRace.race}</li>
    </ul>
  `;
}

function renderTimeline() {
  const container = elements.timeline;
  container.innerHTML = '';
  const formatter = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  state.races.forEach((race) => {
    const card = document.createElement('article');
    card.className = 'race-card';

    const podium = race.results.slice(0, 3);
    const podiumList = podium
      .map((entry, index) => {
        const badges = ['gold', 'silver', 'bronze'];
        return `
          <li>
            <span class="podium-badge ${badges[index]}">${index + 1}</span>
            <span>${entry.driver}</span>
          </li>
        `;
      })
      .join('');

    card.innerHTML = `
      <header>
        <span class="round-pill">Round ${race.round}</span>
        <h3>${race.name}</h3>
        <p class="race-meta">${formatter.format(new Date(race.date))} • ${race.location}</p>
      </header>
      <ul class="podium-list">${podiumList}</ul>
      <p class="fastest-lap">Fastest lap: ${race.fastestLap.driver} (+${race.fastestLap.pointsAwarded} pt)</p>
      <p>${race.summary}</p>
    `;

    container.appendChild(card);
  });
}

function populateFilters() {
  const raceFilter = elements.raceFilter;
  const driverFilter = elements.driverFilter;

  raceFilter.innerHTML = '';
  const allOption = document.createElement('option');
  allOption.value = 'all';
  allOption.textContent = 'All races';
  raceFilter.appendChild(allOption);

  state.races.forEach((race) => {
    const option = document.createElement('option');
    option.value = String(race.round);
    option.textContent = `Round ${race.round} · ${race.name}`;
    raceFilter.appendChild(option);
  });
  raceFilter.value = 'all';

  driverFilter.innerHTML = '';
  const allDrivers = document.createElement('option');
  allDrivers.value = 'all';
  allDrivers.textContent = 'All drivers';
  driverFilter.appendChild(allDrivers);

  state.standings.forEach((entry) => {
    const option = document.createElement('option');
    option.value = entry.driver;
    option.textContent = entry.driver;
    driverFilter.appendChild(option);
  });
  driverFilter.value = 'all';
}

function updateResultsTable() {
  const raceValue = elements.raceFilter.value;
  const driverValue = elements.driverFilter.value;

  const rows = [];
  const relevantRaces = raceValue === 'all'
    ? state.races
    : state.races.filter((race) => String(race.round) === raceValue);

  relevantRaces.forEach((race) => {
    race.results.forEach((result) => {
      if (driverValue !== 'all' && result.driver !== driverValue) {
        return;
      }
      rows.push({
        round: race.round,
        race: race.name,
        driver: result.driver,
        team: result.team,
        position: result.position,
        points: result.points,
        fastest: race.fastestLap.driver === result.driver,
      });
    });
  });

  rows.sort((a, b) => (a.round === b.round ? a.position - b.position : a.round - b.round));

  const body = elements.resultsBody;
  body.innerHTML = '';

  if (!rows.length) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 7;
    cell.textContent = 'No results match the current filters.';
    row.appendChild(cell);
    body.appendChild(row);
    return;
  }

  rows.forEach((rowData) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>R${String(rowData.round).padStart(2, '0')}</td>
      <td>${rowData.race}</td>
      <td>P${rowData.position}</td>
      <td>${rowData.driver}</td>
      <td>${rowData.team}</td>
      <td>${rowData.points}</td>
      <td>${rowData.fastest ? 'Yes (+1)' : '—'}</td>
    `;
    body.appendChild(row);
  });
}

function hexToRgba(hex, alpha = 1) {
  const sanitized = hex.replace('#', '');
  const bigint = parseInt(sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
