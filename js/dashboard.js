// Population Health Dashboard
// Linked scatter + force-directed "quadrant swarm"

const width  = 430;
const height = 430;
const margin = { top: 50, right: 30, bottom: 55, left: 65 };

// Shared tooltip (uses .tooltip styles from style.css)
const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("display", "none");

// Global state
let data = [];
let dotsScatter, dotsSwarm;
let brushedCountries = new Set();
let currentRegion = "all";
let activeQuadrant = null;

// Load CIA Factbook data
d3.csv("data/cia_factbook.csv", d3.autoType).then(raw => {
    // Basic cleaning: keep rows with all required fields
    data = raw.filter(d =>
        d.country &&
        !isNaN(d.life_exp_at_birth) &&
        !isNaN(d.infant_mortality_rate) &&
        !isNaN(d.birth_rate) &&
        !isNaN(d.death_rate) &&
        d.population > 0
    );

    // Region values straight from the dataset (e.g., "Africa", "Europe", etc.)
    const regions = Array.from(new Set(data.map(d => d.region))).sort();
    const color = d3.scaleOrdinal()
        .domain(regions)
        .range(d3.schemeTableau10.concat(d3.schemeSet3).slice(0, regions.length));

    const rPop = d3.scaleSqrt()
        .domain(d3.extent(data, d => d.population))
        .range([3, 15]);

    // ----- Populate region filter from data -----
    const filterSelect = d3.select("#filter");
    filterSelect.selectAll("option").remove();
    filterSelect.append("option")
        .attr("value", "all")
        .text("All regions");
    regions.forEach(region => {
        filterSelect.append("option")
            .attr("value", region)
            .text(region);
    });

    filterSelect.on("change", e => {
        currentRegion = e.target.value;
        updateStyles();
        updateSummary();
    });

    // ----- Derived thresholds for quadrants -----
    const medianBirth = d3.median(data, d => d.birth_rate);
    const medianDeath = d3.median(data, d => d.death_rate);

    const quadrantKey = (b, d) => {
        if (b >= medianBirth && d <  medianDeath) return "highBirth_lowDeath";
        if (b >= medianBirth && d >= medianDeath) return "highBirth_highDeath";
        if (b <  medianBirth && d <  medianDeath) return "lowBirth_lowDeath";
        return "lowBirth_highDeath";
    };

    const quadrantConfig = {
        highBirth_lowDeath: {
            label: "Fast-growing",
            detail: "High birth, low death",
            x: 0.25,
            y: 0.3
        },
        highBirth_highDeath: {
            label: "High churn",
            detail: "High birth, high death",
            x: 0.75,
            y: 0.3
        },
        lowBirth_lowDeath: {
            label: "Stable",
            detail: "Low birth, low death",
            x: 0.25,
            y: 0.75
        },
        lowBirth_highDeath: {
            label: "Aging & pressured",
            detail: "Low birth, high death",
            x: 0.75,
            y: 0.75
        }
    };

    data.forEach(d => {
        const key = quadrantKey(d.birth_rate, d.death_rate);
        d.quadrantKey = key;
        d.quadrantLabel = quadrantConfig[key].label;
    });

    // ---------------------------------------------------------------------
    // Panel 1: Life expectancy vs infant mortality scatter
    // ---------------------------------------------------------------------
    const svg1 = d3.select("#plot1").append("svg")
        .attr("width", width)
        .attr("height", height);

    const x1 = d3.scaleLinear()
        .domain(d3.extent(data, d => d.life_exp_at_birth)).nice()
        .range([margin.left, width - margin.right]);

    const y1 = d3.scaleLinear()
        .domain(d3.extent(data, d => d.infant_mortality_rate)).nice()
        .range([height - margin.bottom, margin.top]);

    // axes
    svg1.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x1));
    svg1.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y1));

    // axis labels
    svg1.append("text")
        .attr("x", width / 2)
        .attr("y", height - 15)
        .attr("text-anchor", "middle")
        .text("Life expectancy at birth (years)");

    svg1.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .text("Infant mortality (deaths per 1,000 births)");

    // panel title
    svg1.append("text")
        .attr("x", width / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-weight", 600)
        .text("Life vs Infant Survival");

    // median lines for guidance (life & infant)
    const medianLife = d3.median(data, d => d.life_exp_at_birth);
    const medianInfant = d3.median(data, d => d.infant_mortality_rate);

    svg1.append("line")
        .attr("x1", x1(medianLife))
        .attr("x2", x1(medianLife))
        .attr("y1", margin.top)
        .attr("y2", height - margin.bottom)
        .attr("stroke", "#9ca3af")
        .attr("stroke-dasharray", "4,4");

    svg1.append("line")
        .attr("x1", margin.left)
        .attr("x2", width - margin.right)
        .attr("y1", y1(medianInfant))
        .attr("y2", y1(medianInfant))
        .attr("stroke", "#9ca3af")
        .attr("stroke-dasharray", "4,4");

    // dots
    dotsScatter = svg1.append("g")
        .selectAll("circle")
        .data(data)
        .join("circle")
        .attr("cx", d => x1(d.life_exp_at_birth))
        .attr("cy", d => y1(d.infant_mortality_rate))
        .attr("r", d => rPop(d.population))
        .attr("fill", d => color(d.region))
        .attr("fill-opacity", 0.9)
        .attr("class", "dot-scatter")
        .on("mousemove", (event, d) => showTooltip(event, d))
        .on("mouseleave", () => hideTooltip())
        .on("click", (event, d) => focusSingleCountry(d.country));

    // brushing on scatter
    const brush = d3.brush()
        .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]])
        .on("brush end", brushed);

    svg1.append("g")
        .attr("class", "brush")
        .call(brush);

    function brushed(event) {
        if (!event.selection) {
            brushedCountries.clear();
            updateStyles();
            updateSummary();
            return;
        }
        const [[x0, y0], [x1b, y1b]] = event.selection;
        brushedCountries = new Set(
            data
                .filter(d => {
                    const px = x1(d.life_exp_at_birth);
                    const py = y1(d.infant_mortality_rate);
                    return px >= x0 && px <= x1b && py >= y0 && py <= y1b;
                })
                .map(d => d.country)
        );
        updateStyles();
        updateSummary();
    }

    // ---------------------------------------------------------------------
    // Panel 2: Force-directed birth–death quadrant swarm
    // ---------------------------------------------------------------------
    const svg2 = d3.select("#plot2").append("svg")
        .attr("width", width)
        .attr("height", height);

    // panel title
    svg2.append("text")
        .attr("x", width / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-weight", 600)
        .text("Birth–Death Quadrant Swarm");

    // faint quadrant grid
    svg2.append("line")
        .attr("x1", width / 2)
        .attr("x2", width / 2)
        .attr("y1", margin.top + 15)
        .attr("y2", height - margin.bottom + 10)
        .attr("stroke", "#e5e7eb")
        .attr("stroke-width", 1.2);

    svg2.append("line")
        .attr("x1", margin.left - 10)
        .attr("x2", width - margin.right + 10)
        .attr("y1", height / 2)
        .attr("y2", height / 2)
        .attr("stroke", "#e5e7eb")
        .attr("stroke-width", 1.2);

    // quadrant labels
    const quadEntries = Object.entries(quadrantConfig);
    const quadLabelGroup = svg2.append("g")
        .attr("class", "quadrant-labels");

    quadEntries.forEach(([key, cfg]) => {
        const gx = margin.left + (width - margin.left - margin.right) * cfg.x;
        const gy = margin.top + (height - margin.top - margin.bottom) * cfg.y;

        const group = quadLabelGroup.append("g")
            .attr("transform", `translate(${gx},${gy})`)
            .style("cursor", "pointer")
            .on("click", () => {
                activeQuadrant = (activeQuadrant === key) ? null : key;
                updateStyles();
                updateSummary();
            });

        group.append("rect")
            .attr("x", -70)
            .attr("y", -22)
            .attr("width", 140)
            .attr("height", 36)
            .attr("rx", 10)
            .attr("ry", 10)
            .attr("fill", "#f3f4f6")
            .attr("stroke", "#d1d5db");

        group.append("text")
            .attr("y", -4)
            .attr("text-anchor", "middle")
            .style("font-weight", 600)
            .style("font-size", 13)
            .text(cfg.label);

        group.append("text")
            .attr("y", 10)
            .attr("text-anchor", "middle")
            .style("font-size", 11)
            .style("fill", "#6b7280")
            .text(cfg.detail);
    });

    // nodes for swarm layout (copy references so simulation can mutate x,y)
    const nodes = data.map(d => Object.assign({}, d));

    // initial positions near their quadrant centers (in pixel space)
    nodes.forEach(n => {
        const q = quadrantConfig[n.quadrantKey];
        n.x = margin.left + (width - margin.left - margin.right) * q.x;
        n.y = margin.top + (height - margin.top - margin.bottom) * q.y;
    });

    dotsSwarm = svg2.append("g")
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", d => rPop(d.population))
        .attr("fill", d => color(d.region))
        .attr("fill-opacity", 0.9)
        .attr("class", "dot-swarm")
        .on("mousemove", (event, d) => showTooltip(event, d))
        .on("mouseleave", () => hideTooltip())
        .on("click", (event, d) => focusSingleCountry(d.country));

    // force simulation pulls nodes into quadrant clusters
    const sim = d3.forceSimulation(nodes)
        .force("x", d3.forceX(d => {
            const cfg = quadrantConfig[d.quadrantKey];
            return margin.left + (width - margin.left - margin.right) * cfg.x;
        }).strength(0.08))
        .force("y", d3.forceY(d => {
            const cfg = quadrantConfig[d.quadrantKey];
            return margin.top + (height - margin.top - margin.bottom) * cfg.y;
        }).strength(0.08))
        .force("collide", d3.forceCollide(d => rPop(d.population) + 1.5))
        .alpha(1)
        .alphaDecay(0.025)
        .on("tick", () => {
            dotsSwarm
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);
        });

    // ---------------------------------------------------------------------
    // Legend (regions + population size)
    // ---------------------------------------------------------------------
    const legendSvg = d3.select("#legend-dashboard svg");
    legendSvg.selectAll("*").remove();

    const legendPadding = 16;
    const legendRegionX = 20;
    const legendRegionY = 20;

    const regionLegend = legendSvg.append("g")
        .attr("transform", `translate(${legendRegionX},${legendRegionY})`);

    regionLegend.append("text")
        .attr("x", 0)
        .attr("y", -6)
        .style("font-size", 12)
        .style("font-weight", 600)
        .text("Color: region (CIA Factbook)");

    regions.forEach((region, i) => {
        const y = 12 + i * 16;
        regionLegend.append("circle")
            .attr("cx", 0)
            .attr("cy", y)
            .attr("r", 5)
            .attr("fill", color(region));
        regionLegend.append("text")
            .attr("x", 12)
            .attr("y", y + 4)
            .style("font-size", 11)
            .text(region);
    });

    const sizeLegend = legendSvg.append("g")
        .attr("transform", "translate(260,30)");

    sizeLegend.append("text")
        .attr("y", -6)
        .style("font-size", 12)
        .style("font-weight", 600)
        .text("Size: population");

    const popSamples = [5_000_000, 50_000_000, 200_000_000];
    popSamples.forEach((p, i) => {
        const x = 15 + i * 55;
        const r = rPop(p);
        sizeLegend.append("circle")
            .attr("cx", x)
            .attr("cy", 20)
            .attr("r", r)
            .attr("fill", "#e5e7eb")
            .attr("stroke", "#9ca3af");
        sizeLegend.append("text")
            .attr("x", x)
            .attr("y", 42)
            .attr("text-anchor", "middle")
            .style("font-size", 10)
            .text(p >= 100_000_000 ? (p / 1_000_000_000).toFixed(1) + "B"
                 : (p / 1_000_000).toFixed(0) + "M");
    });

    // ---------------------------------------------------------------------
    // Shared helpers
    // ---------------------------------------------------------------------
    const fmt1 = d3.format(".1f");
    const fmtPop = d3.format(",.0f");

    function showTooltip(event, d) {
        const region = d.region || "Unknown region";
        const html = `
            <strong>${d.country}</strong><br/>
            Region: ${region}<br/>
            Life expectancy: ${fmt1(d.life_exp_at_birth)} years<br/>
            Infant mortality: ${fmt1(d.infant_mortality_rate)} / 1,000 births<br/>
            Birth rate: ${fmt1(d.birth_rate)} / 1,000 people<br/>
            Death rate: ${fmt1(d.death_rate)} / 1,000 people<br/>
            Population: ${fmtPop(d.population)}<br/>
            Quadrant: ${d.quadrantLabel}
        `;
        tooltip
            .style("display", "block")
            .html(html)
            .style("left", (event.pageX + 12) + "px")
            .style("top", (event.pageY - 28) + "px");
    }

    function hideTooltip() {
        tooltip.style("display", "none");
    }

    // Highlight a single country across both views when clicked
    function focusSingleCountry(countryName) {
        brushedCountries = new Set([countryName]);
        activeQuadrant = null; // reset quadrant filter for clarity
        updateStyles();
        updateSummary();
    }

    function updateStyles() {
        const hasBrush = brushedCountries.size > 0;

        dotsScatter
            .attr("stroke", d => brushedCountries.has(d.country) ? "#111827" : "none")
            .attr("stroke-width", d => brushedCountries.has(d.country) ? 1.6 : 0.7)
            .attr("opacity", d => {
                const regionOK   = (currentRegion === "all" || d.region === currentRegion);
                const quadrantOK = (!activeQuadrant || d.quadrantKey === activeQuadrant);
                let base = (regionOK && quadrantOK) ? 0.9 : 0.08;
                if (hasBrush) {
                    if (brushedCountries.has(d.country)) return 1.0;
                    base *= 0.4;
                }
                return base;
            });

        dotsSwarm
            .attr("stroke", d => brushedCountries.has(d.country) ? "#111827" : "none")
            .attr("stroke-width", d => brushedCountries.has(d.country) ? 1.6 : 0.7)
            .attr("opacity", d => {
                const regionOK   = (currentRegion === "all" || d.region === currentRegion);
                const quadrantOK = (!activeQuadrant || d.quadrantKey === activeQuadrant);
                let base = (regionOK && quadrantOK) ? 0.9 : 0.08;
                if (hasBrush) {
                    if (brushedCountries.has(d.country)) return 1.0;
                    base *= 0.4;
                }
                return base;
            });

        // visual feedback on quadrant labels (bold active one)
        quadLabelGroup.selectAll("g").select("rect")
            .attr("stroke", (d, i, nodes) => {
                const key = quadEntries[i][0];
                return (key === activeQuadrant) ? "#111827" : "#d1d5db";
            })
            .attr("stroke-width", (d, i) => {
                const key = quadEntries[i][0];
                return (key === activeQuadrant) ? 2 : 1;
            });
    }

    function updateSummary() {
        const summaryEl = d3.select("#selection-summary");

        const inRegion = d => (currentRegion === "all" || d.region === currentRegion);
        const inQuad   = d => (!activeQuadrant || d.quadrantKey === activeQuadrant);
        const inBrush  = d => (brushedCountries.size === 0 || brushedCountries.has(d.country));

        const filtered = data.filter(d => inRegion(d) && inQuad(d) && inBrush(d));

        if (filtered.length === 0) {
            summaryEl.text("No countries match this combination of filters/selection.");
            return;
        }

        const meanLife   = d3.mean(filtered, d => d.life_exp_at_birth);
        const meanInfant = d3.mean(filtered, d => d.infant_mortality_rate);
        const meanBirth  = d3.mean(filtered, d => d.birth_rate);
        const meanDeath  = d3.mean(filtered, d => d.death_rate);

        const regionText = (currentRegion === "all")
            ? "all regions"
            : currentRegion;

        let scopeText = "";
        if (brushedCountries.size > 0) {
            scopeText = `for the ${filtered.length} highlighted countr${filtered.length === 1 ? "y" : "ies"}`;
        } else if (activeQuadrant) {
            scopeText = `for ${filtered.length} countr${filtered.length === 1 ? "y" : "ies"} in the “${quadrantConfig[activeQuadrant].label}” quadrant`;
        } else {
            scopeText = `for ${filtered.length} countr${filtered.length === 1 ? "y" : "ies"}`;
        }

        summaryEl.html(
            `In <b>${regionText}</b>, ${scopeText}: ` +
            `average life expectancy is <b>${fmt1(meanLife)} years</b>, ` +
            `infant mortality is about <b>${fmt1(meanInfant)}</b> per 1,000 births, ` +
            `birth rates are <b>${fmt1(meanBirth)}</b> and death rates <b>${fmt1(meanDeath)}</b> per 1,000 people.`
        );
    }

    // Initial render
    updateStyles();
    updateSummary();
});
