
const width = 960,
    height = 560,
    margin = { top: 40, right: 260, bottom: 70, left: 70 };

const svg = d3.select("#scatter")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

const infoPanel = d3.select("#scatter-info");

const width = 960,
    height = 560,
    margin = { top: 40, right: 260, bottom: 70, left: 70 };

const svg = d3.select("#scatter")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

const infoPanel = d3.select("#scatter-info");

const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("pointer-events", "none");

Promise.all([ d3.csv("data/cia_factbook.csv", d3.autoType) ])
    .then(([data]) => {

        const continentLookup = new Map([
            ["Canada","North America"],["United States","North America"],["Mexico","North America"],
            ["Brazil","South America"],["Argentina","South America"],["Chile","South America"],
            ["United Kingdom","Europe"],["Germany","Europe"],["France","Europe"],["Italy","Europe"],
            ["Spain","Europe"],["Russia","Europe"],
            ["China","Asia"],["India","Asia"],["Japan","Asia"],["South Korea","Asia"],
            ["Indonesia","Asia"],["Saudi Arabia","Asia"],
            ["Nigeria","Africa"],["Egypt","Africa"],["South Africa","Africa"],["Kenya","Africa"],
            ["Australia","Oceania"],["New Zealand","Oceania"]
        ]);

        const economicGroup = new Map([
            ["United States","Developed"],["Canada","Developed"],
            ["Germany","Developed"],["France","Developed"],
            ["Japan","Developed"],["Australia","Developed"],
            ["China","Developing"],["India","Developing"],
            ["Brazil","Developing"],["Russia","Developing"],
            ["Nigeria","Developing"]
        ]);


        const metrics = {
            life_exp_at_birth: "Life Expectancy",
            net_migration_rate: "Net Migration Rate",
            birth_rate: "Birth Rate",
            death_rate: "Death Rate",
            population: "Population"
        };

        let currentX = "life_exp_at_birth";
        let currentY = "net_migration_rate";

        let x = d3.scaleLinear().range([margin.left, width - margin.right]);
        let y = d3.scaleLinear().range([height - margin.bottom, margin.top]);
        const r = d3.scaleSqrt()
            .domain(d3.extent(data, d => d.population))
            .range([3, 22]);

        const color = d3.scaleOrdinal()
            .domain(["North America","Europe","Asia","Africa","South America","Oceania"])
            .range(["#1f77b4","#9467bd","#2ca02c","#d62728","#ff7f0e","#17becf"]);

        const xAxisG = svg.append("g").attr("transform", `translate(0,${height-margin.bottom})`);
        const yAxisG = svg.append("g").attr("transform", `translate(${margin.left},0)`);

        const xLabel = svg.append("text")
            .attr("x", width/2)
            .attr("y", height - 20)
            .attr("text-anchor","middle")
            .style("font-size","14px");

        const yLabel = svg.append("text")
            .attr("transform","rotate(-90)")
            .attr("x", -height/2)
            .attr("y", 25)
            .attr("text-anchor","middle")
            .style("font-size","14px");

        const zoom = d3.zoom()
            .scaleExtent([0.8, 8])
            .on("zoom", function(event) {
                svg.selectAll("circle").attr("transform", event.transform);
                xAxisG.call(d3.axisBottom(x).scale(event.transform.rescaleX(x)));
                yAxisG.call(d3.axisLeft(y).scale(event.transform.rescaleY(y)));
            });

        svg.call(zoom);


        function draw(filtered) {

            x.domain(d3.extent(filtered, d => d[currentX])).nice();
            y.domain(d3.extent(filtered, d => d[currentY])).nice();

            xAxisG.transition().duration(400).call(d3.axisBottom(x));
            yAxisG.transition().duration(400).call(d3.axisLeft(y));

            xLabel.text(metrics[currentX]);
            yLabel.text(metrics[currentY]);

            let pts = svg.selectAll("circle")
                .data(filtered, d => d.country);

            pts.exit()
                .transition().duration(300)
                .attr("r", 0)
                .remove();

            pts.transition().duration(400)
                .attr("cx", d => x(d[currentX]))
                .attr("cy", d => y(d[currentY]))
                .attr("r", d => r(d.population))
                .attr("fill", d => color(continentLookup.get(d.country)))
                .attr("opacity", 0.85);

            pts.enter()
                .append("circle")
                .attr("cx", d => x(d[currentX]))
                .attr("cy", d => y(d[currentY]))
                .attr("r", 0)
                .attr("fill", d => color(continentLookup.get(d.country)))
                .attr("opacity", 0.85)
                .transition().duration(400)
                .attr("r", d => r(d.population));

            svg.selectAll("circle")
                .on("mouseover", function(event, d) {
                    const cont = continentLookup.get(d.country);

                    d3.select(this)
                        .raise()
                        .transition()
                        .duration(120)
                        .attr("r", r(d.population) + 4)
                        .attr("stroke", "#000")
                        .attr("stroke-width", 1.4);

                    svg.selectAll("circle")
                        .filter(p => p.country !== d.country)
                        .transition()
                        .duration(120)
                        .attr("opacity", 0.18);

                    tooltip.style("opacity", 1)
                        .html(`
                        <strong>${d.country}</strong><br>
                        ${metrics[currentX]}: ${d[currentX]}<br>
                        ${metrics[currentY]}: ${d[currentY]}
                    `)
                        .style("left", event.pageX + 12 + "px")
                        .style("top", event.pageY - 28 + "px");

                    infoPanel.style("display", "block").html(`
                    <h3>${d.country}</h3>
                    <b>${metrics[currentX]}:</b> ${d[currentX]}<br>
                    <b>${metrics[currentY]}:</b> ${d[currentY]}<br>
                    <b>Population:</b> ${d3.format(",")(d.population)}
                `);
                })
                .on("mousemove", (event) => {
                    tooltip.style("left", event.pageX + 12 + "px")
                        .style("top", event.pageY - 28 + "px");
                })
                .on("mouseout", function(event, d) {
                    d3.select(this)
                        .transition()
                        .duration(120)
                        .attr("r", r(d.population))
                        .attr("stroke-width", 0);

                    svg.selectAll("circle")
                        .transition()
                        .attr("opacity", 0.85);

                    tooltip.style("opacity", 0);
                    infoPanel.style("display", "none");
                });
        }

        function applyFilter() {
            const sel = document.getElementById("filter").value;

            let filtered;
            if (sel === "all") filtered = data;
            else if (sel === "Developed" || sel === "Developing")
                filtered = data.filter(d => economicGroup.get(d.country) === sel);
            else
                filtered = data.filter(d => continentLookup.get(d.country) === sel);

            draw(filtered);
        }

        d3.select("#axis-x").on("change", e => {
            currentX = e.target.value;
            applyFilter();
        });

        d3.select("#axis-y").on("change", e => {
            currentY = e.target.value;
            applyFilter();
        });

        d3.select("#filter").on("change", applyFilter);

        draw(data);

    });

const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("pointer-events", "none");

Promise.all([ d3.csv("data/cia_factbook.csv", d3.autoType) ])
    .then(([data]) => {

        const continentLookup = new Map([
            ["Canada","North America"],["United States","North America"],["Mexico","North America"],
            ["Brazil","South America"],["Argentina","South America"],["Chile","South America"],
            ["United Kingdom","Europe"],["Germany","Europe"],["France","Europe"],["Italy","Europe"],
            ["Spain","Europe"],["Russia","Europe"],
            ["China","Asia"],["India","Asia"],["Japan","Asia"],["South Korea","Asia"],
            ["Indonesia","Asia"],["Saudi Arabia","Asia"],
            ["Nigeria","Africa"],["Egypt","Africa"],["South Africa","Africa"],["Kenya","Africa"],
            ["Australia","Oceania"],["New Zealand","Oceania"]
        ]);

        const economicGroup = new Map([
            ["United States","Developed"],["Canada","Developed"],
            ["Germany","Developed"],["France","Developed"],
            ["Japan","Developed"],["Australia","Developed"],
            ["China","Developing"],["India","Developing"],
            ["Brazil","Developing"],["Russia","Developing"],
            ["Nigeria","Developing"]
        ]);

        const metrics = {
            life_exp_at_birth: "Life Expectancy",
            net_migration_rate: "Net Migration Rate",
            birth_rate: "Birth Rate",
            death_rate: "Death Rate",
            population: "Population"
        };

        let currentX = "life_exp_at_birth";
        let currentY = "net_migration_rate";

        let x = d3.scaleLinear().range([margin.left, width - margin.right]);
        let y = d3.scaleLinear().range([height - margin.bottom, margin.top]);
        const r = d3.scaleSqrt()
            .domain(d3.extent(data, d => d.population))
            .range([3, 22]);

        const color = d3.scaleOrdinal()
            .domain(["North America","Europe","Asia","Africa","South America","Oceania"])
            .range(["#1f77b4","#9467bd","#2ca02c","#d62728","#ff7f0e","#17becf"]);

        const xAxisG = svg.append("g").attr("transform", `translate(0,${height-margin.bottom})`);
        const yAxisG = svg.append("g").attr("transform", `translate(${margin.left},0)`);

        const xLabel = svg.append("text")
            .attr("x", width/2)
            .attr("y", height - 20)
            .attr("text-anchor","middle")
            .style("font-size","14px");

        const yLabel = svg.append("text")
            .attr("transform","rotate(-90)")
            .attr("x", -height/2)
            .attr("y", 25)
            .attr("text-anchor","middle")
            .style("font-size","14px");

        const zoom = d3.zoom()
            .scaleExtent([0.8, 8])
            .on("zoom", function(event) {
                svg.selectAll("circle").attr("transform", event.transform);
                xAxisG.call(d3.axisBottom(x).scale(event.transform.rescaleX(x)));
                yAxisG.call(d3.axisLeft(y).scale(event.transform.rescaleY(y)));
            });

        svg.call(zoom);


        function draw(filtered) {

            x.domain(d3.extent(filtered, d => d[currentX])).nice();
            y.domain(d3.extent(filtered, d => d[currentY])).nice();

            xAxisG.transition().duration(400).call(d3.axisBottom(x));
            yAxisG.transition().duration(400).call(d3.axisLeft(y));

            xLabel.text(metrics[currentX]);
            yLabel.text(metrics[currentY]);

            let pts = svg.selectAll("circle")
                .data(filtered, d => d.country);

            pts.exit()
                .transition().duration(300)
                .attr("r", 0)
                .remove();

            pts.transition().duration(400)
                .attr("cx", d => x(d[currentX]))
                .attr("cy", d => y(d[currentY]))
                .attr("r", d => r(d.population))
                .attr("fill", d => color(continentLookup.get(d.country)))
                .attr("opacity", 0.85);

            pts.enter()
                .append("circle")
                .attr("cx", d => x(d[currentX]))
                .attr("cy", d => y(d[currentY]))
                .attr("r", 0)
                .attr("fill", d => color(continentLookup.get(d.country)))
                .attr("opacity", 0.85)
                .transition().duration(400)
                .attr("r", d => r(d.population));

            svg.selectAll("circle")
                .on("mouseover", function(event, d) {
                    const cont = continentLookup.get(d.country);

                    d3.select(this)
                        .raise()
                        .transition()
                        .duration(120)
                        .attr("r", r(d.population) + 4)
                        .attr("stroke", "#000")
                        .attr("stroke-width", 1.4);

                    svg.selectAll("circle")
                        .filter(p => p.country !== d.country)
                        .transition()
                        .duration(120)
                        .attr("opacity", 0.18);

                    tooltip.style("opacity", 1)
                        .html(`
                        <strong>${d.country}</strong><br>
                        ${metrics[currentX]}: ${d[currentX]}<br>
                        ${metrics[currentY]}: ${d[currentY]}
                    `)
                        .style("left", event.pageX + 12 + "px")
                        .style("top", event.pageY - 28 + "px");

                    infoPanel.style("display", "block").html(`
                    <h3>${d.country}</h3>
                    <b>${metrics[currentX]}:</b> ${d[currentX]}<br>
                    <b>${metrics[currentY]}:</b> ${d[currentY]}<br>
                    <b>Population:</b> ${d3.format(",")(d.population)}
                `);
                })
                .on("mousemove", (event) => {
                    tooltip.style("left", event.pageX + 12 + "px")
                        .style("top", event.pageY - 28 + "px");
                })
                .on("mouseout", function(event, d) {
                    d3.select(this)
                        .transition()
                        .duration(120)
                        .attr("r", r(d.population))
                        .attr("stroke-width", 0);

                    svg.selectAll("circle")
                        .transition()
                        .attr("opacity", 0.85);

                    tooltip.style("opacity", 0);
                    infoPanel.style("display", "none");
                });
        }

        function applyFilter() {
            const sel = document.getElementById("filter").value;

            let filtered;
            if (sel === "all") filtered = data;
            else if (sel === "Developed" || sel === "Developing")
                filtered = data.filter(d => economicGroup.get(d.country) === sel);
            else
                filtered = data.filter(d => continentLookup.get(d.country) === sel);

            draw(filtered);
        }

        d3.select("#axis-x").on("change", e => {
            currentX = e.target.value;
            applyFilter();
        });

        d3.select("#axis-y").on("change", e => {
            currentY = e.target.value;
            applyFilter();
        });

        d3.select("#filter").on("change", applyFilter);

        draw(data);

    });
