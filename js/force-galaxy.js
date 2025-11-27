
function startForceGalaxy() {

    const tooltipFG = d3.select("body")
        .append("div")
        .attr("class", "force-tooltip")
        .style("opacity", 0);

    const regionLookup = {
        // Africa
        "Algeria": "Africa", "Angola": "Africa", "Benin": "Africa", "Botswana": "Africa",
        "Burkina Faso": "Africa", "Burundi": "Africa", "Cameroon": "Africa", "Cape Verde": "Africa",
        "Central African Republic": "Africa", "Chad": "Africa", "Comoros": "Africa", "Congo": "Africa",
        "Djibouti": "Africa", "Egypt": "Africa", "Equatorial Guinea": "Africa", "Eritrea": "Africa",
        "Eswatini": "Africa", "Ethiopia": "Africa", "Gabon": "Africa", "Gambia": "Africa",
        "Ghana": "Africa", "Guinea": "Africa", "Guinea-Bissau": "Africa", "Kenya": "Africa",
        "Lesotho": "Africa", "Liberia": "Africa", "Libya": "Africa", "Madagascar": "Africa",
        "Malawi": "Africa", "Mali": "Africa", "Mauritania": "Africa", "Mauritius": "Africa",
        "Morocco": "Africa", "Mozambique": "Africa", "Namibia": "Africa", "Niger": "Africa",
        "Nigeria": "Africa", "Rwanda": "Africa", "Senegal": "Africa", "Seychelles": "Africa",
        "Sierra Leone": "Africa", "Somalia": "Africa", "South Africa": "Africa", "Sudan": "Africa",
        "Tanzania": "Africa", "Togo": "Africa", "Tunisia": "Africa", "Uganda": "Africa",
        "Zambia": "Africa", "Zimbabwe": "Africa",

        // Asia
        "Afghanistan": "Asia", "Armenia": "Asia", "Azerbaijan": "Asia", "Bahrain": "Asia",
        "Bangladesh": "Asia", "Bhutan": "Asia", "Brunei": "Asia", "Cambodia": "Asia",
        "China": "Asia", "Georgia": "Asia", "India": "Asia", "Indonesia": "Asia",
        "Iran": "Asia", "Iraq": "Asia", "Israel": "Asia", "Japan": "Asia", "Jordan": "Asia",
        "Kazakhstan": "Asia", "Kuwait": "Asia", "Kyrgyzstan": "Asia", "Laos": "Asia",
        "Lebanon": "Asia", "Malaysia": "Asia", "Maldives": "Asia", "Mongolia": "Asia",
        "Myanmar": "Asia", "Nepal": "Asia", "North Korea": "Asia", "Oman": "Asia",
        "Pakistan": "Asia", "Philippines": "Asia", "Qatar": "Asia", "Saudi Arabia": "Asia",
        "Singapore": "Asia", "South Korea": "Asia", "Sri Lanka": "Asia", "Syria": "Asia",
        "Taiwan": "Asia", "Tajikistan": "Asia", "Thailand": "Asia", "Timor-Leste": "Asia",
        "Turkey": "Asia", "Turkmenistan": "Asia", "UAE": "Asia", "Uzbekistan": "Asia",
        "Vietnam": "Asia", "Yemen": "Asia",

        // Europe
        "Albania": "Europe", "Andorra": "Europe", "Austria": "Europe", "Belarus": "Europe",
        "Belgium": "Europe", "Bosnia and Herzegovina": "Europe", "Bulgaria": "Europe",
        "Croatia": "Europe", "Czech Republic": "Europe", "Denmark": "Europe", "Estonia": "Europe",
        "Finland": "Europe", "France": "Europe", "Germany": "Europe", "Greece": "Europe",
        "Hungary": "Europe", "Iceland": "Europe", "Ireland": "Europe", "Italy": "Europe",
        "Latvia": "Europe", "Lithuania": "Europe", "Luxembourg": "Europe",
        "Malta": "Europe", "Moldova": "Europe", "Montenegro": "Europe",
        "Netherlands": "Europe", "North Macedonia": "Europe", "Norway": "Europe", "Poland": "Europe",
        "Portugal": "Europe", "Romania": "Europe", "Russia": "Europe", "Serbia": "Europe",
        "Slovakia": "Europe", "Slovenia": "Europe", "Spain": "Europe", "Sweden": "Europe",
        "Switzerland": "Europe", "UK": "Europe", "Ukraine": "Europe",

        // North America
        "Canada": "North America", "United States": "North America", "Mexico": "North America",
        "Guatemala": "North America", "Honduras": "North America", "El Salvador": "North America",
        "Nicaragua": "North America", "Costa Rica": "North America", "Panama": "North America",
        "Bahamas": "North America", "Cuba": "North America", "Haiti": "North America",
        "Dominican Republic": "North America", "Jamaica": "North America",

        // South America
        "Argentina": "South America", "Bolivia": "South America", "Brazil": "South America",
        "Chile": "South America", "Colombia": "South America", "Ecuador": "South America",
        "Guyana": "South America", "Paraguay": "South America", "Peru": "South America",
        "Suriname": "South America", "Uruguay": "South America", "Venezuela": "South America",

        // Oceania
        "Australia": "Oceania", "New Zealand": "Oceania", "Fiji": "Oceania",
        "Papua New Guinea": "Oceania", "Samoa": "Oceania", "Tonga": "Oceania",
        "Solomon Islands": "Oceania"
    };

    const widthFG = 980, heightFG = 520;

    const svgFG = d3.select("#galaxy")
        .append("svg")
        .attr("width", widthFG)
        .attr("height", heightFG)
        .attr("style", "transform: translateY(-40px);");


    const defsFG = svgFG.append("defs");
    const glow = defsFG.append("filter")
        .attr("id", "glow")
        .attr("height", "300%")
        .attr("width", "300%")
        .attr("x", "-75%")
        .attr("y", "-75%");

    glow.append("feGaussianBlur")
        .attr("stdDeviation", 4)
        .attr("result", "coloredBlur");

    const feMergeFG = glow.append("feMerge");
    feMergeFG.append("feMergeNode").attr("in", "coloredBlur");
    feMergeFG.append("feMergeNode").attr("in", "SourceGraphic");

    const xAxisFG = d3.scaleLinear().range([80, widthFG - 80]);
    const yAxisFG = d3.scaleLinear().range([heightFG - 80, 80]);
    const sizeFG = d3.scaleSqrt().range([4, 26]);
    const glowFG = d3.scaleLinear().range([0.15, 1.0]);
    const colorFG = d3.scaleOrdinal()
        .range(["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#7f7f7f"]);

    const regionSelector = d3.select("#regionSel");
    const clusterBtn = d3.select("#clusterToggle");
    const regionPlotWrap = d3.select("#region-plot-wrapper");
    const regionPlotDiv = d3.select("#region-plot");
    const mortalityPlotWrap = d3.select("#mortality-plot-wrapper");
    const mortalityPlotDiv = d3.select("#mortality-plot");

    const tipFG = d3.select("body").append("div")
        .attr("class", "tip");

    svgFG.append("text")
        .attr("class", "axis-label")
        .attr("x", widthFG / 2)
        .attr("y", heightFG - 20)
        .attr("text-anchor", "middle")
        .text("Birth rate  →  low at left, high at right");

    svgFG.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -heightFG / 2)
        .attr("y", 18)
        .attr("text-anchor", "middle")
        .text("Death rate  →  high at top, low at bottom");

    const crossFG = svgFG.append("g").attr("opacity", 0.25);
    crossFG.append("line")
        .attr("x1", widthFG / 2).attr("x2", widthFG / 2)
        .attr("y1", 60).attr("y2", heightFG - 60)
        .attr("stroke", "#5c6f8a").attr("stroke-dasharray", "4 4");

    crossFG.append("line")
        .attr("x1", 60).attr("x2", widthFG - 60)
        .attr("y1", heightFG / 2).attr("y2", heightFG / 2)
        .attr("stroke", "#5c6f8a").attr("stroke-dasharray", "4 4");

    let simulationFG;
    let clusterModeFG = false;


    d3.csv("data/cia_factbook.csv", d3.autoType).then(raw => {

        const dataFG = raw.map(d => ({
            country: d.country,
            birth: d.birth_rate,
            death: d.death_rate,
            population: d.population,
            life: d.life_exp_at_birth,
            infant: d.infant_mortality_rate,
            region: regionLookup[d.country] || "Other"
        })).filter(d => isFinite(d.birth) && isFinite(d.death));

        xAxisFG.domain(d3.extent(dataFG, d => d.birth)).nice();
        yAxisFG.domain(d3.extent(dataFG, d => d.death)).nice();
        sizeFG.domain(d3.extent(dataFG, d => d.population));
        glowFG.domain(d3.extent(dataFG, d => d.life));
        colorFG.domain([...new Set(dataFG.map(d => d.region))]);

        colorFG.domain().forEach(reg => {
            regionSelector.append("option")
                .attr("value", reg)
                .text(reg);
        });

        const legendFG = d3.select(".controls").append("div").attr("class", "legend");
        legendFG.selectAll(".legend-item")
            .data(colorFG.domain())
            .join("div")
            .attr("class", "legend-item")
            .html(d => `<span class="legend-swatch" style="background:${colorFG(d)};"></span>${d}`);

        const nodesFG = svgFG.selectAll(".node")
            .data(dataFG, d => d.country)
            .join("g")
            .attr("class", "node");

        const circlesFG = nodesFG.append("circle")
            .attr("class", "node-circle")
            .attr("r", d => sizeFG(d.population))
            .attr("fill", d => colorFG(d.region))
            .attr("fill-opacity", d => glowFG(d.life))
            .style("filter", "url(#glow)");

        nodesFG.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .style("pointer-events", "none")
            .style("font-size", "9px")
            .style("fill", "#001322")
            .style("opacity", d => sizeFG(d.population) > 14 ? 0.9 : 0)
            .text(d => d.country);

        nodesFG
            .on("mouseover", (event, d) => {
                d3.select(event.currentTarget).select("circle")
                    .attr("stroke", "#fff")
                    .attr("stroke-width", 3);

                tipFG.style("opacity", 1)
                    .html(`
            <strong>${d.country}</strong><br/>
            Region: ${d.region}<br/>
            Birth rate: ${d.birth}<br/>
            Death rate: ${d.death}<br/>
            Life expectancy: ${d.life}<br/>
            Infant mortality: ${d.infant}<br/>
            Population: ${d3.format(",")(d.population)}
        `)
                    .style("left", event.pageX + 12 + "px")
                    .style("top", event.pageY - 18 + "px");
            })
            .on("mousemove", event => {
                tipFG.style("left", event.pageX + 12 + "px")
                    .style("top", event.pageY - 18 + "px");
            })
            .on("mouseout", event => {
                d3.select(event.currentTarget).select("circle")
                    .attr("stroke-width", 1.2)
                    .attr("stroke", "#fff");

                tipFG.style("opacity", 0);
            });


        simulationFG = d3.forceSimulation(dataFG)
            .force("x", d3.forceX(d => xAxisFG(d.birth)).strength(0.4))
            .force("y", d3.forceY(d => yAxisFG(d.death)).strength(0.4))
            .force("collision", d3.forceCollide(d => sizeFG(d.population) + 1.5))
            .force("charge", d3.forceManyBody().strength(-5))
            .alphaDecay(0.015)
            .on("tick", () => {
                nodesFG.attr("transform", d => `translate(${d.x},${d.y})`);
            });

        const regions = colorFG.domain();
        const cx = widthFG / 2;
        const cy = heightFG / 2;
        const clusterRadius = Math.min(widthFG, heightFG) * 0.28;

        const regionCenters = {};
        regions.forEach((reg, i) => {
            const angle = 2 * Math.PI * i / regions.length - Math.PI / 2;
            regionCenters[reg] = {
                x: cx + clusterRadius * Math.cos(angle),
                y: cy + clusterRadius * Math.sin(angle)
            };
        });

        function applyGalaxy() {
            simulationFG
                .force("x", d3.forceX(d => xAxisFG(d.birth)).strength(0.4))
                .force("y", d3.forceY(d => yAxisFG(d.death)).strength(0.4))
                .alpha(1)
                .restart();
        }

        function applyCluster() {
            simulationFG
                .force("x", d3.forceX(d => regionCenters[d.region]?.x || cx).strength(0.6))
                .force("y", d3.forceY(d => regionCenters[d.region]?.y || cy).strength(0.6))
                .alpha(1)
                .restart();
        }

        function updateRegionScatter() {
            const selected = regionSelector.property("value");

            if (!clusterModeFG || selected === "All") {
                regionPlotWrap.style("display", "none");
                regionPlotDiv.selectAll("*").remove();
                return;
            }

            const regionData = dataFG.filter(d => d.region === selected);

            regionPlotWrap.style("display", "block");
            d3.select("#region-plot-title").text(`Death–Birth Map for ${selected}`);
            d3.select("#region-plot-subtitle").text(
                `Within ${selected}, birth rate (x) vs death rate (y), size ∝ population.`
            );

            regionPlotDiv.selectAll("*").remove();

            const m = {top: 20, right: 20, bottom: 50, left: 60};
            const containerWidthR = document.getElementById("region-plot-wrapper").clientWidth;
            const w = containerWidthR - m.left - m.right;
            const h = 320 - m.top - m.bottom;

            const svgR = regionPlotDiv.append("svg")
                .attr("width", w + m.left + m.right)
                .attr("height", h + m.top + m.bottom)
                .append("g")
                .attr("transform", `translate(${m.left},${m.top})`);

            const xR = d3.scaleLinear()
                .domain(d3.extent(regionData, d => d.birth)).nice()
                .range([0, w]);

            const yR = d3.scaleLinear()
                .domain(d3.extent(regionData, d => d.death)).nice()
                .range([h, 0]);

            const rR = d3.scaleSqrt()
                .domain(d3.extent(regionData, d => d.population))
                .range([3, 18]);

            svgR.append("g")
                .attr("transform", `translate(0,${h})`)
                .call(d3.axisBottom(xR));

            svgR.append("g")
                .call(d3.axisLeft(yR));

            const medBirth = d3.median(regionData, d => d.birth);
            const medDeath = d3.median(regionData, d => d.death);

            svgR.append("line")
                .attr("x1", xR(medBirth)).attr("x2", xR(medBirth))
                .attr("y1", 0).attr("y2", h)
                .attr("stroke", "#999").attr("stroke-dasharray", "4 4");

            svgR.append("line")
                .attr("x1", 0).attr("x2", w)
                .attr("y1", yR(medDeath)).attr("y2", yR(medDeath))
                .attr("stroke", "#999").attr("stroke-dasharray", "4 4");

            const pts = svgR.selectAll("circle")
                .data(regionData)
                .join("circle")
                .attr("cx", d => xR(d.birth))
                .attr("cy", d => yR(d.death))
                .attr("r", 0)
                .attr("fill", d => colorFG(d.region))
                .attr("stroke", "#fff")
                .attr("stroke-width", 1)
                .on("mouseover", (event, d) => {
                    tipFG.style("opacity", 1)
                        .html(`
            <strong>${d.country}</strong><br/>
            Birth rate: ${d.birth}<br/>
            Death rate: ${d.death}<br/>
            Life expectancy: ${d.life}<br/>
            Infant mortality: ${d.infant}<br/>
            Population: ${d3.format(",")(d.population)}
        `)
                        .style("left", event.pageX + 12 + "px")
                        .style("top", event.pageY - 18 + "px");

                    d3.select(event.currentTarget)
                        .attr("stroke", "#fff")
                        .attr("stroke-width", 2);
                })
                .on("mousemove", event => {
                    tipFG.style("left", event.pageX + 12 + "px")
                        .style("top", event.pageY - 18 + "px");
                })
                .on("mouseout", (event, d) => {
                    tipFG.style("opacity", 0);
                    d3.select(event.currentTarget)
                        .attr("stroke", "#fff")
                        .attr("stroke-width", 1);
                });


            pts.transition()
                .duration(600)
                .attr("r", d => rR(d.population));
        }

        function updateMortalityBloom() {
            const selected = regionSelector.property("value");

            if (!clusterModeFG || selected === "All") {
                mortalityPlotWrap.style("display", "none");
                mortalityPlotDiv.selectAll("*").remove();
                return;
            }

            const regionData = dataFG.filter(d => d.region === selected);

            mortalityPlotWrap.style("display", "block");
            d3.select("#mortality-plot-title").text(
                `Infant Mortality Bloom for ${selected}`
            );
            d3.select("#mortality-plot-subtitle").text(
                `Each petal shows infant mortality. Length ∝ infant mortality, width ∝ population.`
            );

            mortalityPlotDiv.selectAll("*").remove();

            const containerWidthB = document.getElementById("mortality-plot-wrapper").clientWidth;
            const widthB = containerWidthB;
            const heightB = 420;
            const radius = Math.min(widthB, heightB) / 2 - 50;

            const svgB = mortalityPlotDiv.append("svg")
                .attr("width", widthB)
                .attr("height", heightB)
                .append("g")
                .attr("transform", `translate(${widthB / 2}, ${heightB / 2})`);

            const maxInf = d3.max(regionData, d => d.infant);
            const rScaleB = d3.scaleLinear().domain([0, maxInf]).range([20, radius]);

            const maxPop = d3.max(regionData, d => d.population);
            const widthScale = d3.scaleLinear().domain([0, maxPop]).range([6, 22]);

            const colorMort = d3.scaleLinear()
                .domain([0, maxInf * 0.4, maxInf * 0.7, maxInf])
                .range(["#fcecc0", "#f2a65a", "#d94f2a", "#B30000"]);

            const angleStep = (2 * Math.PI) / regionData.length;

            for (let i = 1; i <= 5; i++) {
                svgB.append("circle")
                    .attr("r", (radius / 5) * i)
                    .attr("fill", "none")
                    .attr("stroke", "#ddd")
                    .attr("stroke-dasharray", "4 4");
            }

            svgB.append("text")
                .attr("text-anchor", "middle")
                .attr("dy", "0.35em")
                .style("font-size", "15px")
                .text(selected);

            svgB.selectAll(".petal")
                .data(regionData)
                .join("path")
                .attr("class", "petal")
                .attr("fill", d => colorMort(d.infant))
                .attr("fill-opacity", 0.95)
                .attr("stroke", "#660000")
                .attr("stroke-width", 1.2)
                .each(function (d, i) {
                    const angle = angleStep * i - Math.PI / 2;
                    const r = rScaleB(d.infant);
                    const w = widthScale(d.population);

                    const x1 = Math.cos(angle - 0.01) * w;
                    const y1 = Math.sin(angle - 0.01) * w;

                    const x2 = Math.cos(angle) * r;
                    const y2 = Math.sin(angle) * r;

                    const x3 = Math.cos(angle + 0.01) * w;
                    const y3 = Math.sin(angle + 0.01) * w;

                    const path = d3.path();
                    path.moveTo(0, 0);
                    path.lineTo(x1, y1);
                    path.lineTo(x2, y2);
                    path.lineTo(x3, y3);
                    path.closePath();

                    d3.select(this)
                        .attr("d", path.toString())
                        .attr("opacity", 0)
                        .transition()
                        .duration(700)
                        .delay(i * 60)
                        .attr("opacity", 1);
                })
                .on("mouseover", (event, d) => {
                    tipFG.style("opacity", 1)
                        .html(`
            <strong>${d.country}</strong><br/>
            Infant mortality: ${d.infant}<br/>
            Birth rate: ${d.birth}<br/>
            Death rate: ${d.death}<br/>
            Life expectancy: ${d.life}<br/>
            Population: ${d3.format(",")(d.population)}
        `)
                        .style("left", event.pageX + 14 + "px")
                        .style("top", event.pageY - 18 + "px");

                    d3.select(event.currentTarget)
                        .attr("stroke", "#fff")
                        .attr("stroke-width", 2.2);
                })
                .on("mousemove", event => {
                    tipFG.style("left", event.pageX + 14 + "px")
                        .style("top", event.pageY - 18 + "px");
                })
                .on("mouseout", (event, d) => {
                    tipFG.style("opacity", 0);

                    d3.select(event.currentTarget)
                        .attr("stroke", "#660000")
                        .attr("stroke-width", 1.2);
                });
        }

        clusterBtn.on("click", () => {
            clusterModeFG = !clusterModeFG;
            clusterBtn.text(clusterModeFG ? "Back to Galaxy" : "Cluster by Region");

            if (clusterModeFG) applyCluster();
            else applyGalaxy();

            updateRegionScatter();
            updateMortalityBloom();
        });

        regionSelector.on("change", () => {
            const selected = regionSelector.property("value");

            circlesFG.classed("dimmed", d =>
                selected !== "All" && d.region !== selected
            );

            updateRegionScatter();
            updateMortalityBloom();
        });

        function pulse() {
            circlesFG
                .transition()
                .duration(1800)
                .ease(d3.easeSinInOut)
                .attr("fill-opacity", d => glowFG(d.life) + 0.2)
                .transition()
                .duration(1800)
                .ease(d3.easeSinInOut)
                .attr("fill-opacity", d => glowFG(d.life));

            setTimeout(pulse, 3600);
        }

        pulse();
    });
}