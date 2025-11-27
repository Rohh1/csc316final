// Democracy Orbit Visualization Script
(function() {
    'use strict';

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        console.log('Democracy Orbit: Initializing...');
        console.log('Democracy Orbit: DOM elements check:', {
            trackingSearch: !!document.getElementById('trackingSearch'),
            suggestions: !!document.getElementById('suggestions'),
            trackingPanel: !!document.getElementById('trackingPanel'),
            orbitVis: !!document.getElementById('orbit-vis')
        });

// Enhanced color scheme - distinct and purposeful
const regionColors = {
    'Europe': '#3498db',           // Blue - stability
    'Asia': '#e74c3c',             // Red - dynamism
    'Africa': '#f39c12',           // Orange - growth
    'North America': '#9b59b6',    // Purple - established
    'South America': '#1abc9c',    // Teal - emerging
    'Oceania': '#16a085',          // Dark teal - isolated
    'Middle East': '#e67e22',      // Burnt orange - conflict
    'Caribbean': '#2ecc71',        // Green - small states
    'Central Asia': '#95a5a6',     // Gray - transition
    'Unknown': '#bdc3c7'           // Light gray
};

// Region mapping based on country names - COMPREHENSIVE
const countryToRegion = {
    // Europe
    'Albania': 'Europe', 'Austria': 'Europe', 'Belgium': 'Europe', 'Bulgaria': 'Europe',
    'Croatia': 'Europe', 'Czech Republic': 'Europe', 'Denmark': 'Europe', 'Estonia': 'Europe',
    'Finland': 'Europe', 'France': 'Europe', 'Germany': 'Europe', 'Greece': 'Europe',
    'Hungary': 'Europe', 'Iceland': 'Europe', 'Ireland': 'Europe', 'Italy': 'Europe',
    'Latvia': 'Europe', 'Lithuania': 'Europe', 'Luxembourg': 'Europe', 'Netherlands': 'Europe',
    'Norway': 'Europe', 'Poland': 'Europe', 'Portugal': 'Europe', 'Romania': 'Europe',
    'Slovakia': 'Europe', 'Slovenia': 'Europe', 'Spain': 'Europe', 'Sweden': 'Europe',
    'Switzerland': 'Europe', 'United Kingdom': 'Europe', 'Ukraine': 'Europe', 'Belarus': 'Europe',
    'Moldova': 'Europe', 'Serbia': 'Europe', 'Bosnia and Herzegovina': 'Europe', 'Montenegro': 'Europe',
    'North Macedonia': 'Europe', 'Kosovo': 'Europe',
    'Cyprus': 'Europe', 'Malta': 'Europe', 'Monaco': 'Europe', 'Gibraltar': 'Europe',
    'Slovak Republic': 'Europe', // Alternative name for Slovakia

    // Asia
    'China': 'Asia', 'India': 'Asia', 'Japan': 'Asia', 'South Korea': 'Asia', 'Korea': 'Asia',
    'North Korea': 'Asia', 'Indonesia': 'Asia', 'Thailand': 'Asia', 'Vietnam': 'Asia',
    'Philippines': 'Asia', 'Myanmar': 'Asia', 'Malaysia': 'Asia', 'Singapore': 'Asia',
    'Bangladesh': 'Asia', 'Pakistan': 'Asia', 'Sri Lanka': 'Asia', 'Nepal': 'Asia',
    'Cambodia': 'Asia', 'Laos': 'Asia', 'Mongolia': 'Asia', 'Bhutan': 'Asia',
    'Brunei': 'Asia', 'Timor-Leste': 'Asia', 'Taiwan': 'Asia', 'Hong Kong': 'Asia',
    'Macao': 'Asia', 'Maldives': 'Asia',

    // Africa
    'Nigeria': 'Africa', 'Ethiopia': 'Africa', 'Egypt': 'Africa', 'South Africa': 'Africa',
    'Kenya': 'Africa', 'Tanzania': 'Africa', 'Uganda': 'Africa', 'Algeria': 'Africa',
    'Sudan': 'Africa', 'Morocco': 'Africa', 'Angola': 'Africa', 'Ghana': 'Africa',
    'Mozambique': 'Africa', 'Madagascar': 'Africa', 'Cameroon': 'Africa', 'Niger': 'Africa',
    'Mali': 'Africa', 'Burkina Faso': 'Africa', 'Malawi': 'Africa', 'Zambia': 'Africa',
    'Senegal': 'Africa', 'Somalia': 'Africa', 'Chad': 'Africa', 'Zimbabwe': 'Africa',
    'Guinea': 'Africa', 'Rwanda': 'Africa', 'Benin': 'Africa', 'Tunisia': 'Africa',
    'Burundi': 'Africa', 'Togo': 'Africa', 'Sierra Leone': 'Africa', 'Libya': 'Africa',
    'Liberia': 'Africa', 'Mauritania': 'Africa', 'Central African Republic': 'Africa',
    'Eritrea': 'Africa', 'Namibia': 'Africa', 'Botswana': 'Africa', 'Lesotho': 'Africa',
    'Congo': 'Africa', 'Gabon': 'Africa', 'Guinea-Bissau': 'Africa', 'Equatorial Guinea': 'Africa',
    'Mauritius': 'Africa', 'Eswatini': 'Africa', 'Djibouti': 'Africa', 'Comoros': 'Africa',
    'Cape Verde': 'Africa', 'Sao Tome and Principe': 'Africa', 'Seychelles': 'Africa',
    'Côte d`Ivoire': 'Africa', 'Gambia': 'Africa', 'South Sudan': 'Africa', 'Swaziland': 'Africa',

    // North America (including Central America)
    'United States': 'North America', 'Canada': 'North America', 'Mexico': 'North America',
    'Guatemala': 'North America', 'Honduras': 'North America', 'El Salvador': 'North America',
    'Nicaragua': 'North America', 'Costa Rica': 'North America', 'Panama': 'North America',
    'Belize': 'North America',

    // South America
    'Brazil': 'South America', 'Argentina': 'South America', 'Colombia': 'South America',
    'Peru': 'South America', 'Venezuela': 'South America', 'Chile': 'South America',
    'Ecuador': 'South America', 'Bolivia': 'South America', 'Paraguay': 'South America',
    'Uruguay': 'South America', 'Guyana': 'South America', 'Suriname': 'South America',

    // Middle East
    'Saudi Arabia': 'Middle East', 'Iran': 'Middle East', 'Iraq': 'Middle East',
    'Turkey': 'Middle East', 'Yemen': 'Middle East', 'Syria': 'Middle East',
    'Jordan': 'Middle East', 'United Arab Emirates': 'Middle East', 'Israel': 'Middle East',
    'Lebanon': 'Middle East', 'Oman': 'Middle East', 'Kuwait': 'Middle East',
    'Qatar': 'Middle East', 'Bahrain': 'Middle East', 'Palestine': 'Middle East',
    'Afghanistan': 'Middle East',

    // Central Asia
    'Kazakhstan': 'Central Asia', 'Uzbekistan': 'Central Asia', 'Turkmenistan': 'Central Asia',
    'Kyrgyzstan': 'Central Asia', 'Tajikistan': 'Central Asia', 'Azerbaijan': 'Central Asia',
    'Armenia': 'Central Asia', 'Georgia': 'Central Asia', 'Russia': 'Central Asia',

    // Oceania
    'Australia': 'Oceania', 'New Zealand': 'Oceania', 'Papua New Guinea': 'Oceania',
    'Fiji': 'Oceania', 'Solomon Islands': 'Oceania', 'Vanuatu': 'Oceania',
    'Samoa': 'Oceania', 'Kiribati': 'Oceania', 'Tonga': 'Oceania', 'Micronesia': 'Oceania',
    'Palau': 'Oceania', 'Marshall Islands': 'Oceania', 'Nauru': 'Oceania', 'Tuvalu': 'Oceania',
    'Cook Islands': 'Oceania', 'Guam': 'Oceania', 'Northern Mariana Islands': 'Oceania',

    // Caribbean
    'Cuba': 'Caribbean', 'Haiti': 'Caribbean', 'Dominican Republic': 'Caribbean',
    'Jamaica': 'Caribbean', 'Trinidad and Tobago': 'Caribbean', 'Bahamas': 'Caribbean',
    'Barbados': 'Caribbean', 'Saint Lucia': 'Caribbean', 'Grenada': 'Caribbean',
    'Saint Vincent and the Grenadines': 'Caribbean', 'Antigua and Barbuda': 'Caribbean',
    'Dominica': 'Caribbean', 'Saint Kitts and Nevis': 'Caribbean',
    'Puerto Rico': 'Caribbean', 'Aruba': 'Caribbean', 'Curacao': 'Caribbean',
    'Anguilla': 'Caribbean', 'Bermuda': 'Caribbean', 'British Virgin Islands': 'Caribbean',
    'Cayman Islands': 'Caribbean', 'Sint Maarten': 'Caribbean', 'Turks and Caicos': 'Caribbean',
    'US Virgin Islands': 'Caribbean',
    // Alternative names
    'Trinidad &Tobago': 'Caribbean', 'St. Kitts & Nevis': 'Caribbean',
    'St. Lucia': 'Caribbean', 'St.Vincent & Grenadines': 'Caribbean',
};

// Load and visualize data
d3.csv('data/democracy_data_clean.csv').then(data => {
    // Parse data
    data.forEach(d => {
        d.country = d.country_name;
        d.year = +d.year;
        d.spatialElectoral = +d.spatial_electoral;
        d.spatialDemocracy = +d.spatial_democracy;
        d.lowerHouseMembers = +d.lower_house_members || 0;
        d.upperHouseMembers = +d.upper_house_members || 0;
        d.parliamentChambers = +d.parliament_chambers || 0;
        d.hasProportionalVoting = d.has_proportional_voting === 'TRUE' || d.has_proportional_voting === true;
        d.regimeCategory = d.regime_category;
        d.electoralCategory = d.electoral_category;
        d.region = countryToRegion[d.country] || 'Unknown';
    });

    // Filter valid data
    data = data.filter(d =>
        !isNaN(d.spatialElectoral) &&
        !isNaN(d.spatialDemocracy)
    );

    console.log('Data loaded:', data.length, 'rows');

    // Set up dimensions
    const margin = {top: 20, right: 80, bottom: 80, left: 100};
    const width = 1000 - margin.left - margin.right;
    const height = 700 - margin.top - margin.bottom;

    const svg = d3.select('#orbit-vis').append("svg")
        .attr("id", "orbit-chart")
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Scales
    const xExtent = d3.extent(data, d => d.spatialElectoral);
    const yExtent = d3.extent(data, d => d.spatialDemocracy);

    const xScale = d3.scaleLinear()
        .domain(xExtent[0] !== undefined ? xExtent : [0, 10])
        .range([0, width])
        .nice();

    const yScale = d3.scaleLinear()
        .domain(yExtent[0] !== undefined ? yExtent : [0, 10])
        .range([height, 0])
        .nice();

    const sizeScale = d3.scaleSqrt()
        .domain([0, d3.max(data, d => d.lowerHouseMembers + d.upperHouseMembers) || 1000])
        .range([3, 20]);

    // Add axes
    svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale).ticks(10).tickFormat(d3.format('.1f')));

    svg.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(yScale).ticks(10).tickFormat(d3.format('.1f')));

    // Axis labels
    svg.append('text')
        .attr('class', 'axis-label')
        .attr('text-anchor', 'middle')
        .attr('x', width / 2)
        .attr('y', height + 50)
        .text('Neighbors\' Electoral Democracy →');

    svg.append('text')
        .attr('class', 'axis-label')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -60)
        .text('← Neighbors\' Democracy Level');

    // Create groups
    const trailsGroup = svg.append('g').attr('class', 'trails');
    const clustersGroup = svg.append('g').attr('class', 'clusters');
    const planetsGroup = svg.append('g').attr('class', 'planets');

    // State
    let currentYear = 1950;
    let isPlaying = false;
    let playInterval = null;
    let viewMode = 'cluster'; // 'cluster' or 'detail'
    let expandedRegion = null;
    let trackedEntity = null; // {type: 'country'/'region', name: 'CountryName'/'RegionName'}

    // Build search index
    const allCountries = [...new Set(data.map(d => d.country))].sort();
    const allRegions = [...new Set(data.map(d => d.region))].filter(r => r !== 'Unknown').sort();

    // Create legend
    const legendItems = d3.select('#legendItems');
    Object.keys(regionColors).forEach(region => {
        if (region === 'Unknown') return;
        const item = legendItems.append('div').attr('class', 'legend-item');
        item.append('div')
            .attr('class', 'legend-color')
            .style('background-color', regionColors[region]);
        item.append('span').text(region);

        // Make legend items clickable
        item.style('cursor', 'pointer')
            .on('click', () => {
                expandedRegion = expandedRegion === region ? null : region;
                updateVisualization(currentYear);
            });
    });

    // Search and tracking functions
    function updateSuggestions(searchTerm) {
        const suggestions = document.getElementById('suggestions');
        if (!searchTerm.trim()) {
            suggestions.classList.remove('active');
            return;
        }

        const term = searchTerm.toLowerCase();
        const matches = [];

        // Search countries
        allCountries.forEach(country => {
            if (country.toLowerCase().includes(term)) {
                matches.push({ name: country, type: 'Country' });
            }
        });

        // Search regions
        allRegions.forEach(region => {
            if (region.toLowerCase().includes(term)) {
                matches.push({ name: region, type: 'Region' });
            }
        });

        if (matches.length === 0) {
            suggestions.classList.remove('active');
            return;
        }

        suggestions.innerHTML = matches.slice(0, 10).map(match => `
            <div class="suggestion-item" data-name="${match.name}" data-type="${match.type}">
                <span class="name">${match.name}</span>
                <span class="type">${match.type}</span>
            </div>
        `).join('');

        suggestions.classList.add('active');

        // Add click handlers
        suggestions.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const name = item.getAttribute('data-name');
                const type = item.getAttribute('data-type');
                setTracking(name, type);
                document.getElementById('trackingSearch').value = name;
                suggestions.classList.remove('active');
            });
        });
    }

    function setTracking(name, type) {
        trackedEntity = { name, type: type.toLowerCase() };

        // If tracking a country AND currently in cluster view, automatically expand into its region
        if (trackedEntity.type === 'country' && viewMode === 'cluster') {
            // Find the region this country belongs to
            const countryData = data.find(d => d.country === name);
            if (countryData) {
                expandedRegion = countryData.region;
                // Keep viewMode as 'cluster' - don't switch to 'detail'
                // The expandedRegion being set will show individual countries in that region
            }
        }
        // If already in detail view, just track without changing expandedRegion

        updateTrackingPanel();
        updateVisualization(currentYear);
    }

    function clearTracking() {
        trackedEntity = null;
        document.getElementById('trackingSearch').value = '';
        document.getElementById('trackingPanel').classList.remove('active');
        updateVisualization(currentYear);
    }

    function updateTrackingPanel() {
        const panel = document.getElementById('trackingPanel');
        if (!trackedEntity) {
            panel.classList.remove('active');
            return;
        }

        panel.classList.add('active');
        document.getElementById('trackedName').textContent = trackedEntity.name;
        document.getElementById('trackedType').textContent = trackedEntity.type === 'country' ? 'Country' : 'Region';

        // Get current year data for the tracked entity
        const yearData = data.filter(d => d.year === currentYear);
        if (trackedEntity.type === 'country') {
            const countryData = yearData.find(d => d.country === trackedEntity.name);
            if (countryData) {
                // Show region info
                document.getElementById('trackedRegionStat').style.display = 'block';
                document.getElementById('trackedRegion').textContent = countryData.region;

                document.getElementById('trackedYear').textContent = currentYear;
                document.getElementById('trackedElectoral').textContent = countryData.spatialElectoral.toFixed(2);
                document.getElementById('trackedDemocracy').textContent = countryData.spatialDemocracy.toFixed(2);
            } else {
                document.getElementById('trackedRegionStat').style.display = 'none';
                document.getElementById('trackedYear').textContent = currentYear;
                document.getElementById('trackedElectoral').textContent = 'N/A';
                document.getElementById('trackedDemocracy').textContent = 'N/A';
            }
        } else {
            // Region tracking - hide region stat
            document.getElementById('trackedRegionStat').style.display = 'none';

            const regionData = yearData.filter(d => d.region === trackedEntity.name);
            if (regionData.length > 0) {
                const avgElectoral = d3.mean(regionData, d => d.spatialElectoral);
                const avgDemocracy = d3.mean(regionData, d => d.spatialDemocracy);
                document.getElementById('trackedYear').textContent = currentYear;
                document.getElementById('trackedElectoral').textContent = avgElectoral.toFixed(2);
                document.getElementById('trackedDemocracy').textContent = avgDemocracy.toFixed(2);
            } else {
                document.getElementById('trackedYear').textContent = currentYear;
                document.getElementById('trackedElectoral').textContent = 'N/A';
                document.getElementById('trackedDemocracy').textContent = 'N/A';
            }
        }
    }

    // Event listeners for search
    document.getElementById('trackingSearch').addEventListener('input', (e) => {
        updateSuggestions(e.target.value);
    });

    document.getElementById('trackingSearch').addEventListener('blur', () => {
        // Delay to allow click on suggestions
        setTimeout(() => {
            document.getElementById('suggestions').classList.remove('active');
        }, 200);
    });

    document.getElementById('clearTracking').addEventListener('click', clearTracking);

    // Calculate regional clusters
    function calculateClusters(yearData) {
        const clusters = d3.rollup(
            yearData,
            countries => ({
                countries: countries,
                count: countries.length,
                avgElectoral: d3.mean(countries, d => d.spatialElectoral),
                avgDemocracy: d3.mean(countries, d => d.spatialDemocracy),
                totalParliament: d3.sum(countries, d => d.lowerHouseMembers + d.upperHouseMembers),
                regimes: [...new Set(countries.map(d => d.regimeCategory))].join(', ')
            }),
            d => d.region
        );
        return Array.from(clusters, ([region, data]) => ({region, ...data}));
    }

    // Update function
    function updateVisualization(year) {
        currentYear = year;
        d3.select('#yearDisplay').text(year);
        d3.select('#yearSlider').property('value', year);

        // Update tracking panel if active
        if (trackedEntity) {
            updateTrackingPanel();
        }

        const showTrails = d3.select('#showTrails').property('checked');
        const yearData = data.filter(d => d.year === year);

        // Update trails
        if (showTrails && viewMode === 'detail') {
            const countryData = d3.group(data, d => d.country);
            const trails = trailsGroup.selectAll('.trail')
                .data(Array.from(countryData.entries()), d => d[0]);

            trails.enter()
                .append('path')
                .attr('class', 'trail')
                .merge(trails)
                .attr('d', d => {
                    const points = d[1]
                        .filter(p => p.year <= year && !isNaN(p.spatialElectoral) && !isNaN(p.spatialDemocracy))
                        .sort((a, b) => a.year - b.year);
                    if (points.length < 2) return '';
                    return d3.line()
                        .x(p => xScale(p.spatialElectoral))
                        .y(p => yScale(p.spatialDemocracy))
                        .defined(p => !isNaN(xScale(p.spatialElectoral)) && !isNaN(yScale(p.spatialDemocracy)))
                        .curve(d3.curveCardinal.tension(0.5))(points);
                })
                .attr('stroke', d => regionColors[d[1][0].region] || '#bdbdbd')
                .classed('tracked', d => trackedEntity && trackedEntity.type === 'country' && trackedEntity.name === d[0]);

            trails.exit().remove();
        } else {
            trailsGroup.selectAll('.trail').remove();
        }

        if (viewMode === 'cluster' && !expandedRegion) {
            // Show clusters
            planetsGroup.selectAll('.planet').remove();
            const clusters = calculateClusters(yearData);

            const clusterElements = clustersGroup.selectAll('.cluster')
                .data(clusters, d => d.region);

            clusterElements.enter()
                .append('circle')
                .attr('class', 'cluster')
                .attr('cx', d => xScale(d.avgElectoral))
                .attr('cy', d => yScale(d.avgDemocracy))
                .attr('r', 0)
                .merge(clusterElements)
                .classed('tracked', d => trackedEntity && trackedEntity.type === 'region' && trackedEntity.name === d.region)
                .transition()
                .duration(300)
                .attr('cx', d => xScale(d.avgElectoral))
                .attr('cy', d => yScale(d.avgDemocracy))
                .attr('r', d => Math.sqrt(d.count) * 12)
                .attr('fill', d => regionColors[d.region] || '#bdbdbd')
                .attr('stroke', '#fff')
                .attr('stroke-width', 2)
                .attr('opacity', 0.75);

            clusterElements.exit()
                .transition()
                .duration(300)
                .attr('r', 0)
                .remove();

            // Add interactions
            clustersGroup.selectAll('.cluster')
                .on('click', function(event, d) {
                    if (event.shiftKey) {
                        // Shift+click to track region
                        setTracking(d.region, 'Region');
                        document.getElementById('trackingSearch').value = d.region;
                    } else {
                        // Regular click to expand
                        expandedRegion = d.region;
                        updateVisualization(currentYear);
                    }
                })
                .on('mouseover', function(event, d) {
                    d3.select(this).attr('opacity', 1);
                    tooltip.transition().duration(100).style('opacity', 1);
                    tooltip.html(`
                        <strong>${d.region}</strong><br/>
                        Countries: ${d.count}<br/>
                        Avg Electoral: ${d.avgElectoral.toFixed(2)}<br/>
                        Avg Democracy: ${d.avgDemocracy.toFixed(2)}<br/>
                        <em>Click to explore • Shift+Click to track</em>
                    `)
                        .style('left', (event.pageX + 15) + 'px')
                        .style('top', (event.pageY - 15) + 'px');
                })
                .on('mouseout', function() {
                    d3.select(this).attr('opacity', 0.75);
                    tooltip.transition().duration(200).style('opacity', 0);
                });

        } else {
            // Show individual countries
            clustersGroup.selectAll('.cluster').remove();

            let displayData = yearData;
            if (expandedRegion) {
                displayData = yearData.filter(d => d.region === expandedRegion);
            }

            const planets = planetsGroup.selectAll('.planet')
                .data(displayData, d => d.country);

            planets.enter()
                .append('circle')
                .attr('class', 'planet')
                .attr('cx', d => xScale(d.spatialElectoral))
                .attr('cy', d => yScale(d.spatialDemocracy))
                .attr('r', 0)
                .merge(planets)
                .classed('tracked', d => trackedEntity && trackedEntity.type === 'country' && trackedEntity.name === d.country)
                .transition()
                .duration(300)
                .attr('cx', d => xScale(d.spatialElectoral))
                .attr('cy', d => yScale(d.spatialDemocracy))
                .attr('r', d => {
                    const total = d.lowerHouseMembers + d.upperHouseMembers;
                    return total > 0 ? sizeScale(total) : 5;
                })
                .attr('fill', d => regionColors[d.region] || '#bdbdbd')
                .attr('stroke', d => d.hasProportionalVoting ? '#ffd700' : '#fff')
                .attr('stroke-width', d => d.hasProportionalVoting ? 2.5 : 1.5)
                .attr('opacity', 0.85);

            planets.exit()
                .transition()
                .duration(300)
                .attr('r', 0)
                .remove();

            // Add interactions
            planetsGroup.selectAll('.planet')
                .on('mouseover', function(event, d) {
                    d3.select(this).attr('opacity', 1).attr('stroke-width', 3);
                    tooltip.transition().duration(100).style('opacity', 1);
                    const clickHint = expandedRegion ? '<em>Click to return to regions</em>' : '<em>Click to track</em>';
                    tooltip.html(`
                        <strong>${d.country}</strong> (${d.year})<br/>
                        Region: ${d.region}<br/>
                        Regime: ${d.regimeCategory || 'Unknown'}<br/>
                        Electoral: ${d.spatialElectoral.toFixed(2)}<br/>
                        Democracy: ${d.spatialDemocracy.toFixed(2)}<br/>
                        Parliament: ${d.lowerHouseMembers + d.upperHouseMembers} members<br/>
                        ${clickHint}
                    `)
                        .style('left', (event.pageX + 15) + 'px')
                        .style('top', (event.pageY - 15) + 'px');
                })
                .on('mouseout', function(event, d) {
                    d3.select(this)
                        .attr('opacity', 0.85)
                        .attr('stroke-width', d => d.hasProportionalVoting ? 2.5 : 1.5);
                    tooltip.transition().duration(200).style('opacity', 0);
                })
                .on('click', function(event, d) {
                    if (expandedRegion) {
                        // If in expanded region, click returns to clusters
                        expandedRegion = null;
                        viewMode = 'cluster';
                        updateVisualization(currentYear);
                    } else {
                        // Otherwise, click to track
                        setTracking(d.country, 'Country');
                        document.getElementById('trackingSearch').value = d.country;
                    }
                });
        }

        // Update legend title
        d3.select('.legend-title').html(
            expandedRegion
                ? `🌍 ${expandedRegion} <button onclick="expandedRegion=null; updateVisualization(${currentYear}); return false;" style="font-size:0px; padding:0px 0px;"></button>`
                : '🌍 Regions (Click to explore)'
        );
    }

    // Play/pause
    function togglePlay() {
        isPlaying = !isPlaying;
        const button = d3.select('#playButton');
        if (isPlaying) {
            button.text('⏸ Pause').classed('active', true);
            playInterval = setInterval(() => {
                currentYear = currentYear >= 2020 ? 1950 : currentYear + 1;
                updateVisualization(currentYear);
                if (currentYear >= 2020) togglePlay();
            }, 200);
        } else {
            button.text('▶ Play').classed('active', false);
            if (playInterval) clearInterval(playInterval);
        }
    }

    // Event listeners
    d3.select('#playButton').on('click', togglePlay);
    d3.select('#resetButton').on('click', () => {
        if (isPlaying) togglePlay();
        updateVisualization(1950);
    });
    d3.select('#yearSlider').on('input', function() {
        if (isPlaying) togglePlay();
        updateVisualization(+this.value);
    });
    d3.select('#showTrails').on('change', () => updateVisualization(currentYear));

    // View mode toggle
    d3.select('#clusterView').on('click', function() {
        viewMode = 'cluster';
        expandedRegion = null;
        d3.selectAll('.view-toggle button').classed('active', false);
        d3.select(this).classed('active', true);
        updateVisualization(currentYear);
    });

    d3.select('#detailView').on('click', function() {
        viewMode = 'detail';
        expandedRegion = null;
        d3.selectAll('.view-toggle button').classed('active', false);
        d3.select(this).classed('active', true);
        updateVisualization(currentYear);
    });

    // Make updateVisualization global for legend button
    window.updateVisualization = updateVisualization;
    window.expandedRegion = null;

    // Initial render
    updateVisualization(1950);

}).catch(error => {
    console.error('Error loading data:', error);
    d3.select('#orbit-vis').append('div')
        .style('padding', '40px')
        .style('text-align', 'center')
        .style('color', '#d32f2f')
        .html(`
            <h3>Error Loading Data</h3>
            <p>Could not load democracy_data_clean.csv</p>
            <p style="font-size: 12px; color: #666;">Error: ${error.message}</p>
        `);
});

// ========== GDP OVER TIME BAR CHART (SEPARATE COMPONENT) ==========
// This section is completely independent and doesn't modify the main visualization

let gdpData = null;

// Load GDP data separately
d3.csv('data/gdp_country.csv').then(data => {
    // Process GDP data into lookup by country
    gdpData = {};
    data.forEach(row => {
        const country = row['Country Name'];
        gdpData[country] = {};
        for (let year = 1960; year <= 2024; year++) {
            const gdpValue = row[year.toString()];
            if (gdpValue && gdpValue !== '' && !isNaN(+gdpValue)) {
                gdpData[country][year] = +gdpValue;
            }
        }
    });
    console.log('GDP data loaded successfully');
}).catch(error => {
    console.error('Error loading GDP data:', error);
});

// Function to update GDP chart when tracking a country
function updateGDPChart(countryName) {
    // Clear previous chart
    d3.select('#gdpDemocracyChart').html('');

    // Remove any stray tooltips from previous renders
    d3.selectAll('.gdp-tooltip').remove();

    // Check if data is loaded
    if (!gdpData) {
        console.log('Waiting for GDP data to load...');
        d3.select('#gdpDemocracyPanel').classed('active', false);
        return;
    }

    // Get country GDP data
    const countryGDPData = gdpData[countryName];

    if (!countryGDPData || Object.keys(countryGDPData).length === 0) {
        console.log('No GDP data for', countryName);
        d3.select('#gdpDemocracyPanel').classed('active', false);
        d3.selectAll('.gdp-tooltip').remove();
        return;
    }

    // Convert to array format for bar chart
    const gdpArray = Object.entries(countryGDPData)
        .map(([year, gdp]) => ({
            year: +year,
            gdp: gdp
        }))
        .sort((a, b) => a.year - b.year);

    if (gdpArray.length === 0) {
        d3.select('#gdpDemocracyPanel').classed('active', false);
        d3.selectAll('.gdp-tooltip').remove();
        return;
    }

    // Show panel
    d3.select('#gdpDemocracyPanel').classed('active', true);
    d3.select('#gdpChartCountryName').text(countryName);

    // Chart dimensions
    const chartMargin = {top: 20, right: 60, bottom: 60, left: 100};
    const chartWidth = 900 - chartMargin.left - chartMargin.right;
    const chartHeight = 400 - chartMargin.top - chartMargin.bottom;

    // Create SVG
    const chartSvg = d3.select('#gdpDemocracyChart')
        .append('svg')
        .attr('width', chartWidth + chartMargin.left + chartMargin.right)
        .attr('height', chartHeight + chartMargin.top + chartMargin.bottom)
        .append('g')
        .attr('transform', `translate(${chartMargin.left},${chartMargin.top})`);

    // Scales
    const xScale = d3.scaleBand()
        .domain(gdpArray.map(d => d.year))
        .range([0, chartWidth])
        .padding(0.1);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(gdpArray, d => d.gdp) * 1.1])
        .range([chartHeight, 0]);

    // Create fresh tooltip for GDP chart (after cleanup)
    const gdpTooltip = d3.select('body').append('div')
        .attr('class', 'gdp-tooltip')
        .style('opacity', 0)
        .style('position', 'absolute')
        .style('background', 'rgba(0, 0, 0, 0.8)')
        .style('color', '#fff')
        .style('padding', '8px 12px')
        .style('border-radius', '6px')
        .style('pointer-events', 'none')
        .style('font-size', '13px')
        .style('z-index', '10000');

    // Axes
    const xAxis = d3.axisBottom(xScale)
        .tickValues(gdpArray.filter((d, i) => i % 5 === 0).map(d => d.year));
    const yAxis = d3.axisLeft(yScale).ticks(8).tickFormat(d3.format("$.2s"));

    chartSvg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${chartHeight})`)
        .call(xAxis)
        .style('font-size', '12px')
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end');

    chartSvg.append('g')
        .attr('class', 'y-axis')
        .call(yAxis)
        .style('font-size', '12px');

    // Axis labels
    chartSvg.append('text')
        .attr('x', chartWidth / 2)
        .attr('y', chartHeight + 55)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('fill', '#495057')
        .style('font-weight', '600')
        .text('Year →');

    chartSvg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -chartHeight / 2)
        .attr('y', -75)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('fill', '#495057')
        .style('font-weight', '600')
        .text('← GDP (Current US$)');

    // Add bars
    chartSvg.selectAll('.bar')
        .data(gdpArray)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => xScale(d.year))
        .attr('y', d => yScale(d.gdp))
        .attr('width', xScale.bandwidth())
        .attr('height', d => chartHeight - yScale(d.gdp))
        .attr('fill', '#0077cc')
        .attr('opacity', 0.8)
        .on('mouseover', function(event, d) {
            d3.select(this)
                .transition()
                .duration(100)
                .attr('opacity', 1)
                .attr('fill', '#005fa3');

            gdpTooltip.transition().duration(100).style('opacity', 1);
            gdpTooltip.html(`
                <strong>Year: ${d.year}</strong><br/>
                GDP: $${d3.format(',.0f')(d.gdp)}
            `)
                .style('left', (event.pageX + 15) + 'px')
                .style('top', (event.pageY - 15) + 'px');
        })
        .on('mouseout', function() {
            d3.select(this)
                .transition()
                .duration(100)
                .attr('opacity', 0.8)
                .attr('fill', '#0077cc');

            gdpTooltip.transition().duration(200).style('opacity', 0);
        });
}

// Listen for tracking changes (hook into existing tracking functionality)
// We'll use a MutationObserver to detect when tracking panel becomes active
const trackingPanel = document.getElementById('trackingPanel');
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
            const isActive = trackingPanel.classList.contains('active');
            if (isActive) {
                const trackedName = document.getElementById('trackedName').textContent;
                const trackedType = document.getElementById('trackedType').textContent;

                // Only show GDP chart for countries
                if (trackedType.toLowerCase() === 'country') {
                    setTimeout(() => updateGDPChart(trackedName), 100);
                } else {
                    d3.select('#gdpDemocracyPanel').classed('active', false);
                    d3.selectAll('.gdp-tooltip').remove();
                }
            } else {
                // Hide GDP panel when tracking is cleared
                d3.select('#gdpDemocracyPanel').classed('active', false);
                d3.selectAll('.gdp-tooltip').remove();
            }
        }
    });
});

observer.observe(trackingPanel, { attributes: true });

    } // end init()
})();