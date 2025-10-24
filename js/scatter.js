const width = 900, height = 500, margin = { top: 40, right: 40, bottom: 60, left: 70 };

const svg = d3.select("#scatter")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

Promise.all([
    d3.csv("data/cia_factbook.csv", d3.autoType)
]).then(([data]) => {

    // Define scales
    const x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.life_exp_at_birth))
        .nice()
        .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
        .domain(d3.extent(data, d => d.net_migration_rate))
        .nice()
        .range([height - margin.bottom, margin.top]);

    const r = d3.scaleSqrt()
        .domain(d3.extent(data, d => d.population))
        .range([2, 18]);

    const color = d3.scaleOrdinal()
        .domain(["North America", "Europe", "Asia", "Africa", "Oceania"])
        .range(["#1f77b4", "#9467bd", "#2ca02c", "#d62728", "#ff7f0e"]);

    const continentGroup = new Map([
        // North America
        ["Canada", "North America"],
        ["United States", "North America"],
        ["Mexico", "North America"],

        // South America
        ["Brazil", "South America"],
        ["Argentina", "South America"],
        ["Chile", "South America"],
        ["Colombia", "South America"],

        // Europe
        ["United Kingdom", "Europe"],
        ["France", "Europe"],
        ["Germany", "Europe"],
        ["Italy", "Europe"],
        ["Spain", "Europe"],
        ["Russia", "Europe"],

        // Africa
        ["Nigeria", "Africa"],
        ["South Africa", "Africa"],
        ["Egypt", "Africa"],
        ["Kenya", "Africa"],

        // Asia
        ["China", "Asia"],
        ["India", "Asia"],
        ["Japan", "Asia"],
        ["South Korea", "Asia"],
        ["Indonesia", "Asia"],
        ["Saudi Arabia", "Asia"],

        // Australia / Oceania
        ["Australia", "Australia"],
        ["New Zealand", "Australia"],

        // Antarctica
        ["Antarctica", "Antarctica"]
    ]);


    const economicGroup = new Map([
        ["United States", "Developed"],
        ["Canada", "Developed"],
        ["Germany", "Developed"],
        ["Australia", "Developed"],
        ["China", "Developing"],
        ["India", "Developing"],
        ["Brazil", "Developing"],
        ["Russia", "Developing"],
        ["Nigeria", "Developing"]
    ]);

    // Draw axes
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .append("text")
        .attr("x", width / 2)
        .attr("y", 40)
        .attr("fill", "black")
        .text("Life Expectancy (Years)");

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .append("text")
        .attr("x", -50)
        .attr("y", 20)
        .attr("fill", "black")
        .text("Net Migration Rate (per 1,000)");

    // Plot points
    const circles = svg.selectAll("circle")
        .data(data)
        .join("circle")
        .attr("cx", d => x(d.life_exp_at_birth))
        .attr("cy", d => y(d.net_migration_rate))
        .attr("r", d => r(d.population))
        .attr("fill", d => color(continentGroup.get(d.country) || "gray"))
        .attr("opacity", 0.8)
        .on("mouseover", (event, d) => {
            tooltip.transition().duration(100).style("opacity", 1);
            tooltip.html(`
        <strong>${d.country}</strong><br/>
        Life Expectancy: ${d.life_exp_at_birth}<br/>
        Net Migration Rate: ${d.net_migration_rate}<br/>
        Population: ${d3.format(",")(d.population)}
      `)
                .style("left", (event.pageX + 8) + "px")
                .style("top", (event.pageY - 30) + "px");
        })
        .on("mouseout", () => tooltip.transition().duration(200).style("opacity", 0));

    // Filtering by region/economy
    d3.select("#filter").on("change", e => {
        const selected = e.target.value;

        const filteredData = data.filter(d => {
            const cont = continentGroup.get(d.country);
            const econ = economicGroup.get(d.country);
            if (selected === "all") return true;
            if (["Developed", "Developing"].includes(selected))
                return econ === selected;
            return cont === selected;
        });

        const update = svg.selectAll("circle")
            .data(filteredData, d => d.country);

        update.exit()
            .transition()
            .duration(500)
            .attr("r", 0)
            .remove();

        update.transition()
            .duration(600)
            .attr("cx", d => x(d.life_exp_at_birth))
            .attr("cy", d => y(d.net_migration_rate))
            .attr("r", d => r(d.population))
            .attr("fill", d => color(continentGroup.get(d.country) || "gray"))
            .attr("opacity", 0.85);

        update.enter()
            .append("circle")
            .attr("cx", d => x(d.life_exp_at_birth))
            .attr("cy", d => y(d.net_migration_rate))
            .attr("r", 0)
            .attr("fill", d => color(continentGroup.get(d.country) || "gray"))
            .attr("opacity", 0.85)
            .transition()
            .duration(600)
            .attr("r", d => r(d.population));

        svg.selectAll("circle")
            .on("mouseover", (event, d) => {
                tooltip.transition().duration(100).style("opacity", 1);
                tooltip.html(`
        <strong>${d.country}</strong><br/>
        Life Expectancy: ${d.life_exp_at_birth}<br/>
        Net Migration Rate: ${d.net_migration_rate}<br/>
        Population: ${d3.format(",")(d.population)}
      `)
                    .style("left", (event.pageX + 8) + "px")
                    .style("top", (event.pageY - 30) + "px");
            })
            .on("mouseout", () => tooltip.transition().duration(200).style("opacity", 0));
    });

    // Legend for Scatter Plot
    const legendSvg = d3.select("#legend-scatter svg");

// Color legend (continent)
    const continents = color.domain();
    const legendX = 30, legendY = 20;

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

// ---- Size legend (population) ----
    const popLegend = [1e6, 5e7, 2e8, 1e9]; // adjust to fit your data range
    const sizeLegendX = 200, sizeLegendY = 40;

    legendSvg.append("text")
        .attr("x", sizeLegendX)
        .attr("y", 15)
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
