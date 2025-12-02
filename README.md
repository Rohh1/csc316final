## CSC316: Data Visualization - Final Project

## [The Global Migration Mystery](https://rohh1.github.io/csc316final/)

## Authors and Contributors:

This project was created by **Team MIRRY**.
* Yanze Wang
* Rohan Singh
* Ismail H. Iraz
* Rohan Sahota
* Mohammad Fahim Uddin Alvi

## Project Overview:

This interactive data visualization project explores global migration patterns and their relationship with demographic, economic, and political factors. Through a series of engaging visualizations and a story-mode format, users can investigate the complexities of migration, population health, and democracy across countries worldwide.

In this project, users embark on a mission to uncover the mysteries of global migration. They will navigate through various visualizations, each designed to highlight different aspects of migration and its impact on countries. The project combines interactive elements, quizzes, and a narrative structure to create an immersive learning experience.

-----

## Table of Contents:

* [Project Structure](https://github.com/Rohh1/csc316final#project-structure)
* [Libraries & Datasets](https://github.com/Rohh1/csc316final#datasets)
* [Features](https://github.com/Rohh1/csc316final#features)
* [Project Link & Screencast](https://github.com/Rohh1/csc316final#links)

-----

## Project Structure:
**HTML - Story and Format:**
* index.html — main site structure, story-mode layout, containers for all visualizations.

**JavaScript — All Core Visualizations:**
* js/map.js — 3D Orthographic Earth (drag/rotate, scroll zoom, region targeting, population growth bloom).
* js/migration_flights.js — Animated global migration arcs, planes, inbound/outbound toggle.
* js/dashboard.js — Life expectancy vs infant mortality medical cross plot + birth-death quadrant swarm.
* js/demographics.js — Stacked bar comparison of natural increase vs migration across countries.
* js/force-galaxy.js — Birth–death “galaxy” simulation with gravity clustering and glow effect.
* js/orbit.js — Democracy Orbit visualization: radial democracy indicators + country tracking & search.
* js/scatter.js — Interactive demographic scatter with zoom, tooltips, axis switching.

**JavaScript — Game & Story Mode:**
* js/script.js — Global mission flow, initialization of each visualization, scoring, quiz logic, typewriter intro, transitions.

**CSS:**
* css/style.css — Overall theme, layout, fullscreen video background, tooltips, transitions, and UI.

**Data Files:**
* data/cia_factbook.csv - Primary dataset with demographic, economic, and geographic info.
* data/democracy_data_clean.csv - Dataset providing democracy indices and political indicators for countries.
* data/gdp_country.csv - Dataset containing GDP information for countries.

## Datasets:

1. [CIA World Factbook](https://www.cia.gov/the-world-factbook/) - Primary dataset containing demographic, economic, and geographic information for countries worldwide.
2. [Democracy Data](https://www.v-dem.net/en/data/) - Dataset providing democracy indices and political indicators for countries.
3. [GDP Data](https://data.worldbank.org/indicator/NY.GDP.MKTP.CD) - Dataset containing GDP information for countries.


## Features:
Explanation of Non-Obvious Features:

**A. Story-Mode Navigation (script.js)**:

* Fullscreen video background with typewriter text intro.
* Mission-based structure: each visualization is a "mission" with instructions and quizzes.
* Smooth transitions between visualizations with fade effects.

**B. 3D Earth (map.js)**:

* Scrollable and draggable globe
* Population growth bloom effect: countries with high growth rates glow.
* Region targeting: click on regions to zoom in and highlight.

**C. Migration Flights Visualization (migration_flights.js)**:

* Animated arcs representing migration flows between countries.
* Airplane icons flying along migration paths.
* Toggle between inbound and outbound migration views.

**D. Migration Chord Diagram + Bars (demographics.js)**:

* Chord diagram showing migration flows between countries.
* Stacked bar chart comparing natural increase vs migration for selected countries.
* Interactive tooltips with detailed statistics.

**E. Population Health Dashboard (dashboard.js)**:

* Scatter plot of life expectancy vs infant mortality rates.
* Quadrant swarm plot showing birth and death rates.
* Interactive zoom and tooltips for detailed country data.

**F. Force Galaxy - Birth–Death–Life (force-galaxy.js)**:

* Force-directed simulation clustering countries based on birth and death rates.
* Glow effect for countries with extreme birth or death rates.
* Interactive tooltips and country highlighting.

**G. Democracy Orbit (orbit.js)**:

* Radial visualization of democracy indicators.
* Orbiting countries based on democracy scores.
* Search functionality to track specific countries.

## Links:
Link to project (GitHub Pages): https://rohh1.github.io/csc316final/

Github Repoistory: https://github.com/Rohh1/csc316final/

Screencast Video: https://play.library.utoronto.ca/watch/8f0bbb9919b9bf58a46abfc99a296b85/