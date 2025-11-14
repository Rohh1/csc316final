const width = 780;
const height = 460;

const svg = d3.select("#map")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

const mapLayer = svg.append("g").attr("class", "map-layer");

const projection = d3.geoNaturalEarth1()
    .scale(150)
    .translate([width / 2, height / 2]);

const path = d3.geoPath().projection(projection);

const panel = d3.select("#map-info-panel");
const regionFilter = d3.select("#regionFilter");

const regionColors = {
    "Europe": "#2F5FA8",
    "North America": "#F28C28",
    "Asia": "#4CAF50",
    "South America": "#C0392B",
    "Oceania": "#9B59B6",
    "Africa": "#8D5A4A",
    "Other": "#7E7E7E"
};

const regionLegend = d3.select("#region-legend");
regionLegend.html(
    Object.entries(regionColors).map(([name, color]) => `
        <span style="
            display:inline-flex;
            align-items:center;
            margin-right:18px;
            font-size:14px;
        ">
            <span style="
                width:15px;
                height:15px;
                background:${color};
                border-radius:50%;
                margin-right:6px;
                box-shadow:0 0 3px rgba(0,0,0,0.25);
            "></span>
            ${name}
        </span>
    `).join("")
);

const zoom = d3.zoom()
    .scaleExtent([1, 7])
    .on("zoom", (event) => {
        mapLayer.attr("transform", event.transform);
    });

svg.call(zoom);

const regionLookup = {
    "Canada": "North America",
    "United States": "North America",
    "Brazil": "South America",
    "Argentina": "South America",
    "France": "Europe",
    "Germany": "Europe",
    "United Kingdom": "Europe",
    "Russia": "Europe",
    "China": "Asia",
    "Japan": "Asia",
    "India": "Asia",
    "Taiwan": "Asia",
    "Australia": "Oceania",
    "New Zealand": "Oceania",
    "South Africa": "Africa",
    "Egypt": "Africa",
};

Promise.all([
    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"),
    d3.csv("data/cia_factbook.csv", d3.autoType)
]).then(([world, data]) => {

    const countries = topojson.feature(world, world.objects.countries).features;
    const dataByName = new Map(data.map(d => [d.country, d]));

    const migExtent = d3.extent(data, d => d.net_migration_rate);
    const maxAbs = Math.max(Math.abs(migExtent[0] || 0), Math.abs(migExtent[1] || 0));

    const migrationColor = d3.scaleDiverging(t =>
        d3.interpolateRdBu(1 - t)
    ).domain([-maxAbs, 0, maxAbs]);

    countries.forEach(f => {
        const name = f.properties.name;
        const row = dataByName.get(name);
        if (row) f.properties.metrics = row;
        f.properties.region = regionLookup[name] || "Other";
    });

    const uniqueRegions = [...new Set(countries.map(d => d.properties.region))];

    regionFilter.selectAll("option").remove();

    regionFilter
        .append("option")
        .text("All regions")
        .attr("value", "All");

    uniqueRegions.forEach(r =>
        regionFilter.append("option").text(r).attr("value", r)
    );


    const graticule = d3.geoGraticule();
    mapLayer.append("path")
        .datum(graticule())
        .attr("class", "graticule")
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", "#94a3b8")
        .attr("stroke-width", 0.4)
        .attr("stroke-opacity", 0.4);

    const countryPaths = mapLayer.selectAll("path.country")
        .data(countries)
        .join("path")
        .attr("class", "country")
        .attr("d", path)
        .attr("fill", d => regionColors[d.properties.region] || "#7E7E7E")
        .attr("fill-opacity", 0.55)
        .attr("stroke", d => {
            const m = d.properties.metrics;
            if (!m) return "#ccc";
            return migrationColor(m.net_migration_rate);
        })
        .attr("stroke-width", 1.4)
        .attr("opacity", 1);

    countryPaths
        .on("mouseover", function (event, d) {
            const metrics = d.properties.metrics;

            d3.select(this)
                .raise()
                .transition()
                .duration(120)
                .attr("fill-opacity", 0.9)
                .attr("stroke-width", 3)
                .attr("filter", "drop-shadow(0px 0px 4px #333)");

            if (!metrics) {
                panel.style("display", "block").html(`
                    <h3>${d.properties.name}</h3>
                    <div style="color:#6b7280;">No data available</div>
                `);
                return;
            }

            panel.style("display", "block").html(`
                <h3>${d.properties.name}</h3>
                <div><strong>Region:</strong> ${d.properties.region}</div>
                <div><strong>Net migration:</strong> ${metrics.net_migration_rate} per 1,000</div>
                <div><strong>Birth rate:</strong> ${metrics.birth_rate}</div>
                <div><strong>Death rate:</strong> ${metrics.death_rate}</div>
                <div><strong>Life expectancy:</strong> ${metrics.life_exp_at_birth}</div>
                <div><strong>Population:</strong> ${d3.format(",")(metrics.population)}</div>
            `);
        })
        .on("mouseout", function (event, d) {
            d3.select(this)
                .transition()
                .duration(150)
                .attr("fill-opacity", 0.55)
                .attr("stroke-width", 1.4)
                .attr("filter", null);

        })

        .on("click", function (event, d) {
            const bounds = path.bounds(d);
            const dx = bounds[1][0] - bounds[0][0];
            const dy = bounds[1][1] - bounds[0][1];
            const x = (bounds[0][0] + bounds[1][0]) / 2;
            const y = (bounds[0][1] + bounds[1][1]) / 2;

            const scale = Math.max(
                1,
                Math.min(7, 0.85 / Math.max(dx / width, dy / height))
            );
            const translate = [width / 2 - scale * x, height / 2 - scale * y];

            svg.transition()
                .duration(800)
                .call(
                    zoom.transform,
                    d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
                );
        });

    regionFilter.on("change", function () {
        const selected = this.value;

        countryPaths
            .transition()
            .duration(350)
            .attr("opacity", d => {
                if (selected === "All") return 1.0;
                return d.properties.region === selected ? 1.0 : 0.18;
            })
            .attr("stroke-width", d => {
                if (selected === "All") return 1.4;
                return d.properties.region === selected ? 2.2 : 0.6;
            });
    });

}).catch(err => {
    console.error(err);
    d3.select("#map").append("div")
        .style("color", "#b91c1c")
        .style("margin-top", "10px")
        .text("Error loading map or data.");
});
