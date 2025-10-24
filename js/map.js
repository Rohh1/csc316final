const width = 900, height = 500;
const svg = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height);

const projection = d3.geoNaturalEarth1()
    .scale(160)
    .translate([width / 2, height / 2]);

const path = d3.geoPath().projection(projection);
const tooltip = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);

Promise.all([
    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"),
    d3.csv("data/cia_factbook.csv", d3.autoType)
]).then(([world, data]) => {
    const countries = topojson.feature(world, world.objects.countries).features;

    // Create lookup tables
    const migrationData = new Map(data.map(d => [d.country, d.net_migration_rate]));
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

        // Australia
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

// New vivid color scale
    const color = d3.scaleDiverging()
        .domain([-15, 0, 15])
        .interpolator(d3.interpolateRdBu)
        .unknown("#ccc");

// Draw map
    const paths = svg.selectAll("path")
        .data(countries)
        .join("path")
        .attr("class", "country")
        .attr("d", path)
        .attr("fill", d => {
            const rate = migrationData.get(d.properties.name);
            return rate != null ? color(rate) : "#ccc";
        })
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.5)
        .on("mouseover", (event, d) => {
            const name = d.properties.name;
            const rate = migrationData.get(name);
            tooltip.transition().duration(150).style("opacity", 1);
            tooltip.html(`
      <strong>${name}</strong><br/>
      Net migration rate: ${rate != null ? rate.toFixed(2) : "No data"}
    `)
                .style("left", (event.pageX + 8) + "px")
                .style("top", (event.pageY - 30) + "px");
        })
        .on("mouseout", () => tooltip.transition().duration(200).style("opacity", 0));

// filtering
    d3.select("#filter").on("change", e => {
        const selected = e.target.value;

        paths.transition().duration(800)
            .attr("fill", d => {
                const name = d.properties.name;
                const rate = migrationData.get(name);
                const cont = continentGroup.get(name);
                const econ = economicGroup.get(name);

                const inGroup =
                    selected === "all" ||
                    cont === selected ||
                    econ === selected;

                if (!inGroup) return "#eee"; // gray out others
                return rate != null ? color(rate) : "#ccc";
            })
            .attr("stroke-width", d => {
                const name = d.properties.name;
                const cont = continentGroup.get(name);
                const econ = economicGroup.get(name);
                return (cont === selected || econ === selected) ? 1.5 : 0.5;
            });
    });

    // Legend for Map
    const legendSvg = d3.select("#legend-map svg");
    const legendWidth = 260;
    const legendHeight = 10;

    const defs = legendSvg.append("defs");
    const gradient = defs.append("linearGradient")
        .attr("id", "gradient-map")
        .attr("x1", "0%")
        .attr("x2", "100%")
        .attr("y1", "0%")
        .attr("y2", "0%");

    gradient.selectAll("stop")
        .data([
            { offset: "0%", color: color(-15) },
            { offset: "50%", color: color(0) },
            { offset: "100%", color: color(15) }
        ])
        .enter()
        .append("stop")
        .attr("offset", d => d.offset)
        .attr("stop-color", d => d.color);

    legendSvg.append("rect")
        .attr("x", 30)
        .attr("y", 20)
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#gradient-map)")
        .style("stroke", "#ccc");

    legendSvg.append("text")
        .attr("x", 20)
        .attr("y", 15)
        .style("font-size", "12px")
        .text("← More Emigrants");

    legendSvg.append("text")
        .attr("x", 250)
        .attr("y", 15)
        .style("font-size", "12px")
        .text("More Immigrants →");

    legendSvg.append("text")
        .attr("x", 120)
        .attr("y", 45)
        .style("font-size", "12px")
        .style("fill", "#555")
        .text("Net Migration Rate (per 1,000 population)");

})

