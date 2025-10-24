const width = 420, height = 420, margin = { top: 40, right: 30, bottom: 60, left: 60 };

const color = d3.scaleOrdinal()
    .domain(["Asia","Africa","Europe","North America","South America","Australia","Antarctica"])
    .range(["#1f77b4","#ff7f0e","#2ca02c","#9467bd","#d62728","#8c564b","#7f7f7f"]);

const continentGroup = new Map([
    ["Canada","North America"], ["United States","North America"], ["Mexico","North America"],
    ["Brazil","South America"], ["Argentina","South America"], ["Chile","South America"],
    ["Germany","Europe"], ["France","Europe"], ["United Kingdom","Europe"], ["Russia","Europe"],
    ["China","Asia"], ["India","Asia"], ["Japan","Asia"], ["Saudi Arabia","Asia"],
    ["Nigeria","Africa"], ["South Africa","Africa"], ["Egypt","Africa"], ["Kenya","Africa"],
    ["Australia","Australia"], ["New Zealand","Australia"], ["Antarctica","Antarctica"]
]);

Promise.all([
    d3.csv("data/cia_factbook.csv", d3.autoType)
]).then(([data]) => {

    const r = d3.scaleSqrt()
        .domain(d3.extent(data, d => d.population))
        .range([2, 14]);

    // Scatter 1: life expectancy vs infant mortality
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
        .data(data)
        .join("circle")
        .attr("cx", d => x1(d.life_exp_at_birth))
        .attr("cy", d => y1(d.infant_mortality_rate))
        .attr("r", d => r(d.population))
        .attr("fill", d => color(continentGroup.get(d.country) || "gray"))
        .attr("opacity", 0.8);

    // Scatter 2: birth vs death rate
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
        .data(data)
        .join("circle")
        .attr("cx", d => x2(d.birth_rate))
        .attr("cy", d => y2(d.death_rate))
        .attr("r", d => r(d.population))
        .attr("fill", d => color(continentGroup.get(d.country) || "gray"))
        .attr("opacity", 0.8);

    // brushing
    const brush1 = d3.brush()
        .extent([[margin.left, margin.top],[width - margin.right, height - margin.bottom]])
        .on("brush end", brushed);

    svg1.append("g").attr("class", "brush").call(brush1);

    function brushed(event) {
        const sel = event.selection;
        if (!sel) {
            dots1.attr("stroke", null);
            dots2.attr("stroke", null);
            return;
        }
        const [[x0,y0],[x1b,y1b]] = sel;
        const selected = data.filter(d =>
            x1(d.life_exp_at_birth) >= x0 && x1(d.life_exp_at_birth) <= x1b &&
            y1(d.infant_mortality_rate) >= y0 && y1(d.infant_mortality_rate) <= y1b
        );
        const names = new Set(selected.map(d => d.country));
        dots1.attr("stroke", d => names.has(d.country) ? "#000" : null)
            .attr("stroke-width", d => names.has(d.country) ? 1.5 : null);
        dots2.attr("stroke", d => names.has(d.country) ? "#000" : null)
            .attr("stroke-width", d => names.has(d.country) ? 1.5 : null);
    }

    // Filtering by continent
    d3.select("#filter").on("change", e => {
        const selected = e.target.value;
        dots1.attr("opacity", d => {
            const c = continentGroup.get(d.country);
            return selected === "all" || c === selected ? 0.8 : 0.05;
        });
        dots2.attr("opacity", d => {
            const c = continentGroup.get(d.country);
            return selected === "all" || c === selected ? 0.8 : 0.05;
        });
    });

    // Legend for Dashboard
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
        .text("Population size")
        .style("font-size", "13px")
        .style("fill", "#333");

    popLegend.forEach((p, i) => {
        legendSvg.append("circle")
            .attr("cx", sizeLegendX + i * 55)
            .attr("cy", sizeLegendY)
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

});
