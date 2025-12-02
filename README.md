# CSC316 Final Project

Title: The Global Migration Mystery
Course: CSC316 — Final project
Authors: Yanze Wang, Rohan Singh, Rohan Sahota, Ismail H. Iraz, Mohammad Fahim Uddin Alvi


In this project, we utilize CIA Factbook data to create novel visualizations and provide a new perspective on analyzing population data worldwide.
This project investigates how countries grow, shrink, migrate, age, and change politically — using a collection of highly interactive visualizations built in D3.
This interactive “story-mode” website guides the user through global demographic intelligence analysis using multiple complex visualizations: a 3D rotating Earth, animated migration flows, a population-health dashboard, a force-directed birth–death galaxy, and a democracy orbit.
Each visualization is embedded as a mission based task, followed by quizzes and a final ranking.

Link: https://rohh1.github.io/csc316final/

Screencast Video: https://play.library.utoronto.ca/watch/8f0bbb9919b9bf58a46abfc99a296b85


HTML:\
index.html — main site structure, story-mode layout, containers for all visualizations.

JavaScript — All Core Visualizations:\
js/map.js — 3D Orthographic Earth (drag/rotate, scroll zoom, region targeting, population growth bloom).\
js/migration_flights.js — Animated global migration arcs, planes, inbound/outbound toggle.\
js/dashboard.js — Life expectancy vs infant mortality medical cross plot + birth-death quadrant swarm.\
js/demographics.js — Stacked bar comparison of natural increase vs migration across countries.\
js/force-galaxy.js — Birth–death “galaxy” simulation with gravity clustering and glow effect.\
js/orbit.js — Democracy Orbit visualization: radial democracy indicators + country tracking & search.\
js/scatter.js — Interactive demographic scatter with zoom, tooltips, axis switching.\

JavaScript — Game & Story Mode:\
js/script.js — Global mission flow, initialization of each visualization, scoring, quiz logic, typewriter intro, transitions.

CSS:\
css/style.css — Overall theme, layout, fullscreen video background, tooltips, transitions, and UI.


Explanation of Non-Obvious Features:\
A. Story-Mode Navigation\
B. 3D Earth (map.js)\

Scroll to zoom (custom filter prevents drag-zoom conflict)\
Region snapping: selecting "Asia" rotates the globe smoothly toward Asia\
Population map appears only when a region filter is applied\
Growth Bloom automatically updates based on selected region\




C. Migration Flights Visualization\
D. Migration Chord Diagram + Bars
E. Population Health Dashboard\
F. Force Galaxy (Birth–Death–Life)\
G. Democracy Orbit\