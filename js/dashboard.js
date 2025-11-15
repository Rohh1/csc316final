const width = 420, height = 420, margin = { top: 40, right: 30, bottom: 60, left: 60 };

const color = d3.scaleOrdinal()
    .domain(["Asia","Africa","Europe","North America","South America","Australia","Antarctica"])
    .range(["#1f77b4","#ff7f0e","#2ca02c","#9467bd","#d62728","#8c564b","#7f7f7f"]);

const continentGroup = new Map([
    ["Canada","North America"], ["United States","North America"], ["Mexico","North America"],
    ["Brazil","South America"], ["Argentina","South America"], ["Chile","South America"], ["Colombia", "South America"], ["Venezuela", "South America"],
    ["Germany","Europe"], ["France","Europe"], ["United Kingdom","Europe"], ["Russia","Europe"], ["Spain", "Europe"], ["Italy", "Europe"],
    ["China","Asia"], ["India","Asia"], ["Japan","Asia"], ["Saudi Arabia","Asia"], ["Iran", "Asia"], ["Turkey", "Asia"],
    ["Nigeria","Africa"], ["South Africa","Africa"], ["Egypt","Africa"], ["Kenya","Africa"],
    ["Australia","Australia"], ["New Zealand","Australia"], ["Antarctica","Antarctica"],
    ["Kuwait", "Asia"], ["Lebanon", "Asia"], ["Cyprus", "Europe"], ["Israel", "Asia"], ["Qatar", "Asia"], ["Singapore", "Asia"],
    ["Maldives", "Asia"], ["Macau", "Asia"], ["Syria", "Asia"], ["Zimbabwe", "Africa"], ["Jordan", "Asia"], ["Libya", "Africa"],
    ["Cayman Islands", "North America"], ["Bahrain", "Asia"], ["United Arab Emirates", "Asia"], ["Anguilla", "North America"],
    ["Turks and Caicos Islands", "North America"], ["South Sudan", "Africa"], ["Aruba", "North America"], ["El Salvador", "North America"],
    ["Saint Pierre and Miquelon", "North America"], ["Sao Tome and Principe", "Africa"], ["Puerto Rico", "North America"],
    ["Somalia", "Africa"], ["Saint Vincent and the Grenadines", "North America"], ["Guyana", "South America"], ["Moldova", "Europe"],
    ["Samoa", "Australia"], ["Nauru", "Australia"], ["Tonga", "Australia"], ["Micronesia, Federated States of", "Australia"],
    ["American Samoa", "Australia"], ["British Virgin Islands", "North America"]
]);

Promise.all([
    d3.csv("data/cia_factbook.csv", d3.autoType)
]).then(([data]) => {

    const r = d3.scaleSqrt()
        .domain(d3.extent(data, d => d.population))
        .range([2, 14]);

    // Scatter 1: life expectancy vs infant mortality (Health)
    const svg1 = d3.select("#plot1").append("svg")
        .attr("width", width)
        .attr("height", height);

    const x1 = d3.scaleLinear()
        .domain(d3.extent(data, d => d.life_exp_at_birth)).nice()
        .range([margin.left, width - margin.right]);
    const y1 = d3.scaleLinear()
        .domain(d3.extent(data, d => d.infant_mortality_rate)).nice()
        .range([height - margin.bottom, margin.top]);

    svg1.append("g").attr("transform", `translate(0,${height - margin.bottom})`).call(d3.axisBottom(x1));
    svg1.append("g").attr("transform", `translate(${margin.left},0)`).call(d3.axisLeft(y1));
    svg1.append("text").attr("x", width/2).attr("y", height-15).attr("text-anchor","middle").text("Life Expectancy");
    svg1.append("text").attr("x", -height/2).attr("y", 20).attr("transform","rotate(-90)").attr("text-anchor","middle").text("Infant Mortality Rate");

    const dots1 = svg1.append("g")
        .selectAll("circle")
        .data(data.filter(d => d.life_exp_at_birth != null && d.infant_mortality_rate != null))
        .join("circle")
        .attr("cx", d => x1(d.life_exp_at_birth))
        .attr("cy", d => y1(d.infant_mortality_rate))
        .attr("r", d => r(d.population))
        .attr("fill", d => color(continentGroup.get(d.country) || "gray"))
        .attr("opacity", 0.8);
    
    // Mean Marker 1 (Health)
    const meanMarker1 = svg1.append("polygon")
        .attr("points", "0,0 0,0 0,0 0,0") // Placeholder for diamond shape
        .attr("fill", "gold")
        .attr("stroke", "#333")
        .attr("stroke-width", 2)
        .attr("opacity", 0)
        .style("pointer-events", "none");

    // Scatter 2: birth vs death rate (Demography)
    const svg2 = d3.select("#plot2").append("svg")
        .attr("width", width)
        .attr("height", height);

    const x2 = d3.scaleLinear()
        .domain(d3.extent(data, d => d.birth_rate)).nice()
        .range([margin.left, width - margin.right]);
    const y2 = d3.scaleLinear()
        .domain(d3.extent(data, d => d.death_rate)).nice()
        .range([height - margin.bottom, margin.top]);

    svg2.append("g").attr("transform", `translate(0,${height - margin.bottom})`).call(d3.axisBottom(x2));
    svg2.append("g").attr("transform", `translate(${margin.left},0)`).call(d3.axisLeft(y2));
    svg2.append("text").attr("x", width/2).attr("y", height-15).attr("text-anchor","middle").text("Birth Rate");
    svg2.append("text").attr("x", -height/2).attr("y", 20).attr("transform","rotate(-90)").attr("text-anchor","middle").text("Death Rate");

    const dots2 = svg2.append("g")
        .selectAll("circle")
        .data(data.filter(d => d.birth_rate != null && d.death_rate != null))
        .join("circle")
        .attr("cx", d => x2(d.birth_rate))
        .attr("cy", d => y2(d.death_rate))
        .attr("r", d => r(d.population))
        .attr("fill", d => color(continentGroup.get(d.country) || "gray"))
        .attr("opacity", 0.8);
    
    // Mean Marker 2 (Demography)
    const meanMarker2 = svg2.append("polygon")
        .attr("points", "0,0 0,0 0,0 0,0") // Placeholder for diamond shape
        .attr("fill", "gold")
        .attr("stroke", "#333")
        .attr("stroke-width", 2)
        .attr("opacity", 0)
        .style("pointer-events", "none");


    // Function to calculate and update visual state
    function updateBrushedState(selection, isBrush1) {
        let selected = [];
        const fullData = data.filter(d => d.life_exp_at_birth != null && d.infant_mortality_rate != null && d.birth_rate != null && d.death_rate != null);

        if (selection) {
            const [[x0, y0], [x1b, y1b]] = selection;
            
            if (isBrush1) {
                // Brush on Scatter 1 (Health)
                selected = fullData.filter(d =>
                    x1(d.life_exp_at_birth) >= x0 && x1(d.life_exp_at_birth) <= x1b &&
                    y1(d.infant_mortality_rate) >= y0 && y1(d.infant_mortality_rate) <= y1b
                );
            } else {
                // Brush on Scatter 2 (Demography)
                selected = fullData.filter(d =>
                    x2(d.birth_rate) >= x0 && x2(d.birth_rate) <= x1b &&
                    y2(d.death_rate) >= y0 && y2(d.death_rate) <= y1b
                );
            }
        }

        const names = new Set(selected.map(d => d.country));

        // 1. Highlight points
        dots1.attr("stroke", d => names.has(d.country) ? "#000" : null)
            .attr("stroke-width", d => names.has(d.country) ? 1.5 : null)
            .attr("opacity", d => names.has(d.country) ? 0.8 : 0.2); // Also reduce opacity of unselected

        dots2.attr("stroke", d => names.has(d.country) ? "#000" : null)
            .attr("stroke-width", d => names.has(d.country) ? 1.5 : null)
            .attr("opacity", d => names.has(d.country) ? 0.8 : 0.2); // Also reduce opacity of unselected

        // 2. Update Mean Markers
        if (selected.length > 0) {
            const avgLifeExp = d3.mean(selected, d => d.life_exp_at_birth);
            const avgInfantMort = d3.mean(selected, d => d.infant_mortality_rate);
            const avgBirthRate = d3.mean(selected, d => d.birth_rate);
            const avgDeathRate = d3.mean(selected, d => d.death_rate);

            const markerSize = 8; // Half the diamond width/height
            
            const diamondPoints1 = [
                `${x1(avgLifeExp)},${y1(avgInfantMort) - markerSize}`,
                `${x1(avgLifeExp) + markerSize},${y1(avgInfantMort)}`,
                `${x1(avgLifeExp)},${y1(avgInfantMort) + markerSize}`,
                `${x1(avgLifeExp) - markerSize},${y1(avgInfantMort)}`
            ].join(" ");
            
            const diamondPoints2 = [
                `${x2(avgBirthRate)},${y2(avgDeathRate) - markerSize}`,
                `${x2(avgBirthRate) + markerSize},${y2(avgDeathRate)}`,
                `${x2(avgBirthRate)},${y2(avgDeathRate) + markerSize}`,
                `${x2(avgBirthRate) - markerSize},${y2(avgDeathRate)}`
            ].join(" ");

            // Move and show marker 1 (Health Mean)
            meanMarker1.attr("points", diamondPoints1).attr("opacity", 1);
            
            // Move and show marker 2 (Demography Mean)
            meanMarker2.attr("points", diamondPoints2).attr("opacity", 1);
        } else {
            // Hide markers if no selection
            meanMarker1.attr("opacity", 0);
            meanMarker2.attr("opacity", 0);
            // Reset opacity for all dots that match the current filter
            const currentFilter = d3.select("#filter").property("value");
            dots1.attr("opacity", d => (currentFilter === "all" || continentGroup.get(d.country) === currentFilter) ? 0.8 : 0.05);
            dots2.attr("opacity", d => (currentFilter === "all" || continentGroup.get(d.country) === currentFilter) ? 0.8 : 0.05);
        }
    }


    // Handler for brush on plot 1
    function brushed1(event) {
        if (!event.selection) {
            updateBrushedState(null, true);
        } else {
            updateBrushedState(event.selection, true);
        }
        // Clear brush on other plot to allow re-brushing
        svg2.select(".brush").call(brush2.move, null);
    }

    // Handler for brush on plot 2
    function brushed2(event) {
        if (!event.selection) {
            updateBrushedState(null, false);
        } else {
            updateBrushedState(event.selection, false);
        }
        // Clear brush on other plot to allow re-brushing
        svg1.select(".brush").call(brush1.move, null);
    }

    // Brushing Setup
    const brush1 = d3.brush()
        .extent([[margin.left, margin.top],[width - margin.right, height - margin.bottom]])
        .on("brush end", brushed1);

    svg1.append("g").attr("class", "brush").call(brush1);

    const brush2 = d3.brush()
        .extent([[margin.left, margin.top],[width - margin.right, height - margin.bottom]])
        .on("brush end", brushed2);

    svg2.append("g").attr("class", "brush").call(brush2);

    // Filtering by continent (updated to handle opacity logic reset)
    d3.select("#filter").on("change", e => {
        const selected = e.target.value;
        
        // Clear brush selections and hide mean markers
        svg1.select(".brush").call(brush1.move, null);
        svg2.select(".brush").call(brush2.move, null);
        meanMarker1.attr("opacity", 0);
        meanMarker2.attr("opacity", 0);

        // Filter points
        dots1.attr("opacity", d => {
            const c = continentGroup.get(d.country);
            return selected === "all" || c === selected ? 0.8 : 0.05;
        })
        .attr("stroke", null)
        .attr("stroke-width", null);
        
        dots2.attr("opacity", d => {
            const c = continentGroup.get(d.country);
            return selected === "all" || c === selected ? 0.8 : 0.05;
        })
        .attr("stroke", null)
        .attr("stroke-width", null);
    });

    // Legend for Dashboard (unchanged)
    const legendSvg = d3.select("#legend-dashboard svg");
    const continents = color.domain();
    const legendX = 30, legendY = 20;

    // Continent color legend
    continents.forEach((c, i) => {
        legendSvg.append("circle")
            .attr("cx", legendX)
            .attr("cy", legendY + i * 18)
            .attr("r", 6)
            .attr("fill", color(c));

        legendSvg.append("text")
            .attr("x", legendX + 14)
            .attr("y", legendY + i * 18 + 4)
            .text(c)
            .style("font-size", "13px")
            .style("fill", "#333");
    });

    // Size legend (population)
    const popLegend = [1e6, 5e7, 2e8, 1e9];
    const sizeLegendX = 220, sizeLegendY = 45;

    legendSvg.append("text")
        .attr("x", sizeLegendX)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .text("Population size")
        .style("font-size", "13px")
        .style("fill", "#333");

    popLegend.forEach((p, i) => {
        legendSvg.append("circle")
            .attr("cx", sizeLegendX + i * 55)
            .attr("y", sizeLegendY)
            .attr("r", r(p))
            .attr("fill", "none")
            .attr("stroke", "#555");

        legendSvg.append("text")
            .attr("x", sizeLegendX + i * 55)
            .attr("y", sizeLegendY + r(p) + 14)
            .attr("text-anchor", "middle")
            .text(d3.format(".2s")(p))
            .style("font-size", "11px")
            .style("fill", "#555");
    });
    
    // Mean Marker Legend
    legendSvg.append("polygon")
        .attr("points", "300,38 308,46 300,54 292,46")
        .attr("fill", "gold")
        .attr("stroke", "#333")
        .attr("stroke-width", 2);

    legendSvg.append("text")
        .attr("x", 320)
        .attr("y", 49)
        .text("Group Mean (Novelty)")
        .style("font-size", "13px")
        .style("fill", "#333");


}); 