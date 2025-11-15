const width = 900, height = 1000, margin = { top: 40, right: 30, bottom: 60, left: 160 };

const svg = d3.select("#demographics-plot")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

const plotArea = svg.append("g");
const tooltip = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);

// Global maps for data lookups (copied from map.js/scatter.js)
const continentGroup = new Map([
    ["Canada", "North America"], ["United States", "North America"], ["Mexico", "North America"],
    ["Brazil", "South America"], ["Argentina", "South America"], ["Chile", "Chile"], ["Colombia", "South America"],
    ["United Kingdom", "Europe"], ["France", "Europe"], ["Germany", "Europe"], ["Italy", "Europe"], ["Spain", "Europe"], ["Russia", "Europe"],
    ["Nigeria", "Africa"], ["South Africa", "Africa"], ["Egypt", "Africa"], ["Kenya", "Africa"],
    ["China", "Asia"], ["India", "Asia"], ["Japan", "Asia"], ["South Korea", "Asia"], ["Indonesia", "Asia"], ["Saudi Arabia", "Asia"],
    ["Australia", "Australia"], ["New Zealand", "Australia"], ["Antarctica", "Antarctica"], ["Iran", "Asia"], ["Turkey", "Asia"], ["Ukraine", "Europe"],
    ["Pakistan", "Asia"], ["Venezuela", "South America"], ["South Sudan", "Africa"], ["Ethiopia", "Africa"], ["Iraq", "Asia"], ["Vietnam", "Asia"],
    ["Malaysia", "Asia"], ["Philippines", "Asia"], ["Poland", "Europe"], ["Ecuador", "South America"], ["New Caledonia", "Australia"],
    ["Kuwait", "Asia"], ["Lebanon", "Asia"], ["Cyprus", "Europe"], ["Israel", "Asia"], ["Qatar", "Asia"], ["Singapore", "Asia"],
    ["Maldives", "Asia"], ["Macau", "Asia"]
]);
const economicGroup = new Map([
    ["United States", "Developed"], ["Canada", "Developed"], ["Germany", "Developed"], ["Australia", "Developed"],
    ["United Kingdom", "Developed"], ["France", "Developed"], ["Japan", "Developed"], ["Italy", "Developed"],
    ["China", "Developing"], ["India", "Developing"], ["Brazil", "Developing"], ["Russia", "Developing"],
    ["Nigeria", "Developing"], ["South Africa", "Developing"], ["Mexico", "Developing"], ["Indonesia", "Developing"]
]);

// Color Scales
// Natural Change (Birth - Death) - Diverging, focusing on Growth vs Decline
const naturalColor = d3.scaleDiverging()
    .domain([-5, 0, 30]) // Example domain: from -5 to +30, centered at 0
    .interpolator(d3.interpolatePiYG); // Green (positive) to Brown (negative)

// Net Migration (Migration Rate) - Diverging, focusing on Inflow vs Outflow
const migrationColor = d3.scaleDiverging()
    .domain([-15, 0, 15]) // Consistent with map.js
    .interpolator(d3.interpolateRdBu); // Red (negative/outflow) to Blue (positive/inflow)

// Draw function
function draw(data, sortKey, filterKey) {
    // 1. Data Processing and Filtering
    const processedData = data
        .filter(d => d.birth_rate != null && d.death_rate != null && d.net_migration_rate != null)
        .map(d => {
            const naturalChange = d.birth_rate - d.death_rate;
            const netMigration = d.net_migration_rate;
            const totalGrowth = naturalChange + netMigration;

            // Apply filters here
            const cont = continentGroup.get(d.country) || 'Other';
            const econ = economicGroup.get(d.country);
            // NOTE: The filter logic must match the options in demographics.html
            const inGroup = filterKey === "all" || cont === filterKey || econ === filterKey; 

            return {
                country: d.country,
                naturalChange: naturalChange,
                netMigration: netMigration,
                totalGrowth: totalGrowth,
                population: d.population,
                continent: cont,
                economic: econ,
                inGroup: inGroup
            };
        })
        .filter(d => d.inGroup); // Filter the data

    // 2. Sorting
    processedData.sort((a, b) => {
        if (sortKey === 'migration') return d3.descending(a.netMigration, b.netMigration);
        if (sortKey === 'natural') return d3.descending(a.naturalChange, b.naturalChange);
        return d3.descending(a.totalGrowth, b.totalGrowth); // Default/total sort
    });

    const categories = ['naturalChange', 'netMigration'];
    let stack = d3.stack().keys(categories);
    const stackedData = stack(processedData);

    const maxGrowth = d3.max(processedData, d => d.totalGrowth) || 0;
    const minGrowth = d3.min(processedData, d => {
        // Find the most negative part of the stack (min(naturalChange, 0) + min(netMigration, 0))
        return (d.naturalChange < 0 ? d.naturalChange : 0) + (d.netMigration < 0 ? d.netMigration : 0);
    }) || 0;

    // 3. Scales
    const x = d3.scaleLinear()
        .domain([minGrowth * 1.1, maxGrowth * 1.1])
        .nice()
        .range([margin.left, width - margin.right]);

    const y = d3.scaleBand()
        .domain(processedData.map(d => d.country))
        .range([margin.top, height - margin.bottom])
        .padding(0.2);

    // Dynamic height based on number of countries
    const newHeight = Math.max(height, processedData.length * y.step() + margin.top + margin.bottom);
    svg.attr("height", newHeight);
    y.range([margin.top, newHeight - margin.bottom]);

    // 4. Axis update (Y-axis for Country names)
    const yAxis = g => g
        .attr("transform", `translate(${x(0)},0)`) // Place axis at x=0
        .call(d3.axisRight(y).tickSize(3))
        .call(g => g.selectAll(".domain").remove()) // Remove the main line
        .call(g => g.selectAll(".tick line").remove()); // Remove tick marks

    // Update Y-axis
    plotArea.select(".y-axis").remove();
    plotArea.append("g").attr("class", "y-axis").call(yAxis);

    // X-Axis (Bottom)
    const xAxis = g => g
        .attr("transform", `translate(0,${newHeight - margin.bottom})`)
        .call(d3.axisBottom(x).tickFormat(d3.format(".1f")))
        .call(g => g.select(".domain").remove());

    // Update X-axis
    plotArea.select(".x-axis").remove();
    plotArea.append("g").attr("class", "x-axis").call(xAxis)
        .append("text")
        .attr("class", "x-axis-title")
        .attr("x", width / 2)
        .attr("y", 40)
        .attr("text-anchor", "middle")
        .text("Population Change Rate (per 1,000 population)");

    // Zero Line
    plotArea.select(".zero-line").remove();
    plotArea.append("line")
        .attr("class", "zero-line")
        .attr("x1", x(0))
        .attr("x2", x(0))
        .attr("y1", margin.top)
        .attr("y2", newHeight - margin.bottom);

    // 5. Data Join (Bars)
    const barGroups = plotArea.selectAll(".bar-group")
        .data(stackedData, d => d.key); // Key by category name (naturalChange or netMigration)

    // Remove old groups
    barGroups.exit().remove();

    // Enter new groups
    const enteringGroups = barGroups.enter().append("g")
        .attr("class", d => `bar-group ${d.key}`);

    // Update selection (groups that exist in old and new data)
    const updatingGroups = enteringGroups.merge(barGroups);

    // Use .each() to correctly process the data join for nested elements
    updatingGroups.each(function(d) {
        const groupKey = d.key; // 'naturalChange' or 'netMigration'

        d3.select(this).selectAll("rect")
            .data(d, d => d.data.country) // Data for rects is the stack segments
            .join("rect")
            .attr("y", d => y(d.data.country))
            .attr("height", y.bandwidth())
            // FIX: Use the parent group's key (groupKey) to assign the correct color scale
            .attr("fill", d => {
                if (groupKey === "naturalChange") {
                    return naturalColor(d.data.naturalChange);
                }
                return migrationColor(d.data.netMigration);
            })
            .on("mouseover", (event, d) => {
                tooltip.transition().duration(100).style("opacity", 1);
                tooltip.html(`
                    <strong>${d.data.country}</strong><br/>
                    Total Growth: ${d.data.totalGrowth.toFixed(2)}<br/>
                    Natural Change (Birth-Death): ${d.data.naturalChange.toFixed(2)}<br/>
                    Net Migration: ${d.data.netMigration.toFixed(2)}<br/>
                    Population: ${d3.format(".2s")(d.data.population)}
                `)
                    .style("left", (event.pageX + 8) + "px")
                    .style("top", (event.pageY - 30) + "px");

                // Highlight the specific country row
                d3.select(event.target.parentNode)
                    .raise()
                    .selectAll("rect")
                    .attr("stroke", "#0f172a")
                    .attr("stroke-width", 1.5);

            })
            .on("mouseout", (event) => {
                tooltip.transition().duration(200).style("opacity", 0);
                d3.select(event.target.parentNode)
                    .selectAll("rect")
                    .attr("stroke", null)
                    .attr("stroke-width", null);
            })
            .transition() // Transition for sorting/filtering
            .duration(800)
            .attr("y", d => y(d.data.country))
            .attr("x", d => x(d[0])) // x transition
            .attr("width", d => x(d[1]) - x(d[0])); // width transition
    });

    // 6. Legend Drawing (Simplified)
    drawLegend(newHeight);
}

function drawLegend(newHeight) {
    const legendSvg = d3.select("#legend-demographics svg");
    legendSvg.attr("width", 600).attr("height", 80);
    legendSvg.selectAll("*").remove(); // Clear existing legend

    const format = d3.format(".1f");

    // Helper for gradient legend
    function createGradientLegend(scale, title, id, startX) {
        const legendWidth = 200;
        const legendHeight = 10;
        const yOffset = 20;

        const defs = legendSvg.append("defs");
        const gradient = defs.append("linearGradient")
            .attr("id", id)
            .attr("x1", "0%")
            .attr("x2", "100%")
            .attr("y1", "0%")
            .attr("y2", "0%");

        const domain = scale.domain();
        const extent = [domain[0], domain[domain.length - 1]];

        gradient.selectAll("stop")
            .data([
                { offset: "0%", color: scale(extent[0]), value: extent[0] },
                { offset: "50%", color: scale(domain[1]), value: domain[1] },
                { offset: "100%", color: scale(extent[1]), value: extent[1] }
            ])
            .enter()
            .append("stop")
            .attr("offset", d => d.offset)
            .attr("stop-color", d => d.color);

        legendSvg.append("text")
            .attr("x", startX + legendWidth / 2)
            .attr("y", 10)
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .text(title);

        legendSvg.append("rect")
            .attr("x", startX)
            .attr("y", yOffset)
            .attr("width", legendWidth)
            .attr("height", legendHeight)
            .style("fill", `url(#${id})`)
            .style("stroke", "#ccc");

        // Labels for the start/end/middle
        legendSvg.append("text").attr("x", startX).attr("y", yOffset + 25).style("font-size", "12px").text(format(extent[0]));
        legendSvg.append("text").attr("x", startX + legendWidth).attr("y", yOffset + 25).attr("text-anchor", "end").style("font-size", "12px").text(format(extent[1]));
        legendSvg.append("text").attr("x", startX + legendWidth / 2).attr("y", yOffset + 25).attr("text-anchor", "middle").style("font-size", "12px").text(format(naturalColor.domain()[1]));
    }

    createGradientLegend(naturalColor, "Natural Change Rate (Growth ← Decline)", "gradient-natural", 30);
    createGradientLegend(migrationColor, "Net Migration Rate (Inflow ← Outflow)", "gradient-migration", 300);

    legendSvg.append("text")
        .attr("x", 300)
        .attr("y", 70)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("fill", "#555")
        .text("Rates are per 1,000 population.");
}


// Main execution block
Promise.all([
    d3.csv("data/cia_factbook.csv", d3.autoType)
]).then(([data]) => {
    // FIX: Set 'Asia' as the default filter value since 'all' is being removed from HTML.
    let currentSort = d3.select("#sort").property("value");
    let currentFilter = d3.select("#filter").property("value") || "Asia"; // Default to Asia if filter is not set

    // Ensure the dropdown reflects the new default filter, if it exists
    const filterSelect = d3.select("#filter");
    if (filterSelect.node() && filterSelect.node().value === 'all') {
        filterSelect.property('value', 'Asia');
    }
    
    draw(data, currentSort, currentFilter);

    // Add event listeners
    d3.select("#sort").on("change", e => {
        currentSort = e.target.value;
        currentFilter = d3.select("#filter").property("value");
        draw(data, currentSort, currentFilter);
    });

    d3.select("#filter").on("change", e => {
        currentFilter = e.target.value;
        draw(data, currentSort, currentFilter);
    });
}).catch(error => {
    console.error("Error loading data:", error);
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .text("Error loading data. Check console for details.");
});
