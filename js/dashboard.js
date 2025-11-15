// Population Health Dashboard
// Linked scatter + birth–death quadrant swarm with medical cross glyphs

const width  = 430;
const height = 430;
const margin = { top: 50, right: 30, bottom: 55, left: 65 };

// Shared tooltip (uses .tooltip class from style.css)
const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("display", "none");

// Global state
let data = [];
let dotsScatter, dotsSwarm;
let brushedCountries = new Set();
let currentHealthTier = "all";
let activeQuadrant = null;

// Load CIA Factbook data (ONLY using columns that exist in your CSV)
d3.csv("data/cia_factbook.csv", d3.autoType).then(raw => {
    data = raw.filter(d =>
        d.country &&
        !isNaN(d.life_exp_at_birth) &&
        !isNaN(d.infant_mortality_rate) &&
        !isNaN(d.birth_rate) &&
        !isNaN(d.death_rate) &&
        d.population > 0
    );

    // ---------- HEALTH PROFILE CATEGORIES (from your health data only) ----------
    // Use a simple score = life expectancy - infant mortality, then split into tertiles.
    const scores = data.map(d => d.life_exp_at_birth - d.infant_mortality_rate).sort(d3.ascending);
    const h1 = d3.quantile(scores, 0.33);
    const h2 = d3.quantile(scores, 0.66);

    const healthTiers = ["High risk", "In transition", "Health leaders"];

    data.forEach(d => {
        const s = d.life_exp_at_birth - d.infant_mortality_rate;
        if (s <= h1) {
            d.healthTier = "High risk";
        } else if (s <= h2) {
            d.healthTier = "In transition";
        } else {
            d.healthTier = "Health leaders";
        }
    });

    // Color by health profile (health-ish palette)
    const color = d3.scaleOrdinal()
        .domain(healthTiers)
        .range(["#ef4444", "#f59e0b", "#22c55e"]); // red, amber, green

    // Population → size scale (used to size the medical crosses)
    const rPop = d3.scaleSqrt()
        .domain(d3.extent(data, d => d.population))
        .range([3, 15]);

    const symbolSize = d => Math.PI * Math.pow(rPop(d.population), 2);

    // ---------- Populate health profile dropdown ----------
    const filterSelect = d3.select("#filter");
    filterSelect.selectAll("option").remove();
    filterSelect.append("option")
        .attr("value", "all")
        .text("All health profiles");
    healthTiers.forEach(tier => {
        filterSelect.append("option")
            .attr("value", tier)
            .text(tier);
    });

    filterSelect.on("change", e => {
        currentHealthTier = e.target.value;
        updateStyles();
        updateSummary();
    });

    // ---------- Birth–death quadrants (same idea as before) ----------
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

    // ---------- Panel 1: Life vs infant mortality (medical crosses) ----------
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

    // title
    svg1.append("text")
        .attr("x", width / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-weight", 600)
        .text("Life vs Infant Survival (medical crosses)");

    // median guide lines
    const medianLife   = d3.median(data, d => d.life_exp_at_birth);
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

    // medical cross glyphs
    const crossSymbolScatter = d3.symbol()
        .type(d3.symbolCross);

    dotsScatter = svg1.append("g")
        .selectAll("path")
        .data(data)
        .join("path")
        .attr("class", "dot-scatter")
        .attr("d", d => crossSymbolScatter.size(symbolSize(d))())
        .attr("transform", d => `translate(${x1(d.life_exp_at_birth)},${y1(d.infant_mortality_rate)})`)
        .attr("fill", "none")
        .attr("stroke", d => color(d.healthTier))
        .attr("stroke-width", 1.3)
        .on("mousemove", (event, d) => showTooltip(event, d))
        .on("mouseleave", hideTooltip)
        .on("click", (event, d) => focusSingleCountry(d.country));

    // brushing
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

    // ---------- Panel 2: Birth–death quadrant swarm (medical crosses) ----------
    const svg2 = d3.select("#plot2").append("svg")
        .attr("width", width)
        .attr("height", height);

    svg2.append("text")
        .attr("x", width / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-weight", 600)
        .text("Birth–Death Quadrant Swarm");

    // quadrant grid
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

    // copy data for simulation, carrying healthTier and quadrant info
    const nodes = data.map(d => Object.assign({}, d));

    nodes.forEach(n => {
        const q = quadrantConfig[n.quadrantKey];
        n.x = margin.left + (width - margin.left - margin.right) * q.x;
        n.y = margin.top + (height - margin.top - margin.bottom) * q.y;
    });

    const crossSymbolSwarm = d3.symbol().type(d3.symbolCross);

    dotsSwarm = svg2.append("g")
        .selectAll("path")
        .data(nodes)
        .join("path")
        .attr("class", "dot-swarm")
        .attr("d", d => crossSymbolSwarm.size(symbolSize(d))())
        .attr("transform", d => `translate(${d.x},${d.y})`)
        .attr("fill", "none")
        .attr("stroke", d => color(d.healthTier))
        .attr("stroke-width", 1.3)
        .on("mousemove", (event, d) => showTooltip(event, d))
        .on("mouseleave", hideTooltip)
        .on("click", (event, d) => focusSingleCountry(d.country));

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
            dotsSwarm.attr("transform", d => `translate(${d.x},${d.y})`);
        });

    // ---------- Legend ----------
    const legendSvg = d3.select("#legend-dashboard svg");
    legendSvg.selectAll("*").remove();

    const legendRegionX = 20;
    const legendRegionY = 20;

    const profileLegend = legendSvg.append("g")
        .attr("transform", `translate(${legendRegionX},${legendRegionY})`);

    profileLegend.append("text")
        .attr("x", 0)
        .attr("y", -6)
        .style("font-size", 12)
        .style("font-weight", 600)
        .text("Color: health profile");

    const crossLegendSymbol = d3.symbol().type(d3.symbolCross).size(80);

    healthTiers.forEach((tier, i) => {
        const y = 12 + i * 18;

        profileLegend.append("path")
            .attr("d", crossLegendSymbol())
            .attr("transform", `translate(0,${y})`)
            .attr("fill", "none")
            .attr("stroke", color(tier))
            .attr("stroke-width", 1.2);

        profileLegend.append("text")
            .attr("x", 14)
            .attr("y", y + 3)
            .style("font-size", 11)
            .text(tier);
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
            .attr("fill", "none")
            .attr("stroke", "#555");

        sizeLegend.append("text")
            .attr("x", x)
            .attr("y", 42)
            .attr("text-anchor", "middle")
            .style("font-size", 11)
            .style("fill", "#555")
            .text(d3.format(".2s")(p));
    });

    // ---------- Shared helpers ----------
    const fmt1   = d3.format(".1f");
    const fmtPop = d3.format(",.0f");

    function showTooltip(event, d) {
        const html = `
            <strong>${d.country}</strong><br/>
            Health profile: ${d.healthTier}<br/>
            Life expectancy: ${fmt1(d.life_exp_at_birth)} years<br/>
            Infant mortality: ${fmt1(d.infant_mortality_rate)} / 1,000 births<br/>
            Birth rate: ${fmt1(d.birth_rate)} / 1,000 people<br/>
            Death rate: ${fmt1(d.death_rate)} / 1,000 people<br/>
            Population: ${fmtPop(d.population)}<br/>
            Birth–death quadrant: ${d.quadrantLabel}
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

    function focusSingleCountry(countryName) {
        brushedCountries = new Set([countryName]);
        activeQuadrant = null;
        updateStyles();
        updateSummary();
    }

    function updateStyles() {
        const hasBrush = brushedCountries.size > 0;

        dotsScatter
            .attr("stroke-width", d => brushedCountries.has(d.country) ? 2 : 1.3)
            .attr("opacity", d => {
                const profileOK = (currentHealthTier === "all" || d.healthTier === currentHealthTier);
                const quadrantOK = (!activeQuadrant || d.quadrantKey === activeQuadrant);
                let base = (profileOK && quadrantOK) ? 0.95 : 0.1;
                if (hasBrush) {
                    if (brushedCountries.has(d.country)) return 1.0;
                    base *= 0.4;
                }
                return base;
            });

        dotsSwarm
            .attr("stroke-width", d => brushedCountries.has(d.country) ? 2 : 1.3)
            .attr("opacity", d => {
                const profileOK = (currentHealthTier === "all" || d.healthTier === currentHealthTier);
                const quadrantOK = (!activeQuadrant || d.quadrantKey === activeQuadrant);
                let base = (profileOK && quadrantOK) ? 0.95 : 0.1;
                if (hasBrush) {
                    if (brushedCountries.has(d.country)) return 1.0;
                    base *= 0.4;
                }
                return base;
            });

        // highlight active quadrant label border
        quadLabelGroup.selectAll("g").select("rect")
            .attr("stroke", (d, i) => {
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

        const profileOK = d => (currentHealthTier === "all" || d.healthTier === currentHealthTier);
        const quadOK    = d => (!activeQuadrant || d.quadrantKey === activeQuadrant);
        const brushOK   = d => (brushedCountries.size === 0 || brushedCountries.has(d.country));

        const filtered = data.filter(d => profileOK(d) && quadOK(d) && brushOK(d));

        if (filtered.length === 0) {
            summaryEl.text("No countries match this combination of health profile, quadrant, and selection.");
            return;
        }

        const meanLife   = d3.mean(filtered, d => d.life_exp_at_birth);
        const meanInfant = d3.mean(filtered, d => d.infant_mortality_rate);
        const meanBirth  = d3.mean(filtered, d => d.birth_rate);
        const meanDeath  = d3.mean(filtered, d => d.death_rate);

        const profileText = (currentHealthTier === "all")
            ? "all health profiles"
            : `the “${currentHealthTier}” profile`;

        let scopeText = "";
        if (brushedCountries.size > 0) {
            scopeText = `for the ${filtered.length} highlighted countr${filtered.length === 1 ? "y" : "ies"}`;
        } else if (activeQuadrant) {
            scopeText = `for ${filtered.length} countr${filtered.length === 1 ? "y" : "ies"} in the “${quadrantConfig[activeQuadrant].label}” quadrant`;
        } else {
            scopeText = `for ${filtered.length} countr${filtered.length === 1 ? "y" : "ies"}`;
        }

        summaryEl.html(
            `Within <b>${profileText}</b>, ${scopeText}: ` +
            `average life expectancy is <b>${fmt1(meanLife)} years</b>, ` +
            `infant mortality is about <b>${fmt1(meanInfant)}</b> per 1,000 births, ` +
            `birth rates are <b>${fmt1(meanBirth)}</b> and death rates <b>${fmt1(meanDeath)}</b> per 1,000 people.`
        );
    }

    // initial render
    updateStyles();
    updateSummary();
});
