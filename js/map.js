const width = 780;
const height = 460;


const svg = d3.select("#map")
    .append("svg")
    .attr("width", width)
    .attr("height", height);


const mapLayer = svg.append("g").attr("class", "map-layer");


const projection = d3.geoOrthographic()
    .scale(height / 2 - 20)
    .translate([width / 2, height / 2])
    .clipAngle(90);   // 只显示前半球


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


// svg.call(zoom);


let rotation = [0, 0];


const drag = d3.drag().on("drag", (event) => {
    rotation[0] += event.dx * 0.5;
    rotation[1] -= event.dy * 0.5;


    rotation[1] = Math.max(-90, Math.min(90, rotation[1]));


    projection.rotate(rotation);


    mapLayer.selectAll("path").attr("d", path);
});


svg.call(drag);


const regionLookup = {


    // AFRICA
    "Algeria": "Africa",
    "Angola": "Africa",
    "Benin": "Africa",
    "Botswana": "Africa",
    "Burkina Faso": "Africa",
    "Burundi": "Africa",
    "Cameroon": "Africa",
    "Cape Verde": "Africa",
    "Central African Republic": "Africa",
    "Chad": "Africa",
    "Comoros": "Africa",
    "Congo, Democratic Republic of the": "Africa",
    "Congo, Republic of the": "Africa",
    "Djibouti": "Africa",
    "Egypt": "Africa",
    "Equatorial Guinea": "Africa",
    "Eritrea": "Africa",
    "Eswatini": "Africa",
    "Ethiopia": "Africa",
    "Gabon": "Africa",
    "Gambia, The": "Africa",
    "Ghana": "Africa",
    "Guinea": "Africa",
    "Guinea-Bissau": "Africa",
    "Ivory Coast": "Africa",
    "Kenya": "Africa",
    "Lesotho": "Africa",
    "Liberia": "Africa",
    "Libya": "Africa",
    "Madagascar": "Africa",
    "Malawi": "Africa",
    "Mali": "Africa",
    "Mauritania": "Africa",
    "Mauritius": "Africa",
    "Mayotte": "Africa",
    "Morocco": "Africa",
    "Mozambique": "Africa",
    "Namibia": "Africa",
    "Niger": "Africa",
    "Nigeria": "Africa",
    "Reunion": "Africa",
    "Rwanda": "Africa",
    "Saint Helena, Ascension, and Tristan da Cunha": "Africa",
    "Sao Tome and Principe": "Africa",
    "Senegal": "Africa",
    "Seychelles": "Africa",
    "Sierra Leone": "Africa",
    "Somalia": "Africa",
    "South Africa": "Africa",
    "South Sudan": "Africa",
    "Sudan": "Africa",
    "Tanzania": "Africa",
    "Togo": "Africa",
    "Tunisia": "Africa",
    "Uganda": "Africa",
    "Zambia": "Africa",
    "Zimbabwe": "Africa",
    "Western Sahara": "Africa",


    // ASIA
    "Afghanistan": "Asia",
    "Armenia": "Asia",
    "Azerbaijan": "Asia",
    "Bahrain": "Asia",
    "Bangladesh": "Asia",
    "Bhutan": "Asia",
    "Brunei": "Asia",
    "Cambodia": "Asia",
    "China": "Asia",
    "Cyprus": "Asia",
    "East Timor": "Asia",
    "Georgia": "Asia",
    "Hong Kong": "Asia",
    "India": "Asia",
    "Indonesia": "Asia",
    "Iran": "Asia",
    "Iraq": "Asia",
    "Israel": "Asia",
    "Japan": "Asia",
    "Jordan": "Asia",
    "Kazakhstan": "Asia",
    "Kuwait": "Asia",
    "Kyrgyzstan": "Asia",
    "Laos": "Asia",
    "Lebanon": "Asia",
    "Macau": "Asia",
    "Malaysia": "Asia",
    "Maldives": "Asia",
    "Mongolia": "Asia",
    "Myanmar": "Asia",
    "Nepal": "Asia",
    "North Korea": "Asia",
    "Oman": "Asia",
    "Pakistan": "Asia",
    "Palestine": "Asia",
    "Philippines": "Asia",
    "Qatar": "Asia",
    "Saudi Arabia": "Asia",
    "Singapore": "Asia",
    "South Korea": "Asia",
    "Sri Lanka": "Asia",
    "Syria": "Asia",
    "Taiwan": "Asia",
    "Tajikistan": "Asia",
    "Thailand": "Asia",
    "Turkey": "Asia",
    "Turkmenistan": "Asia",
    "United Arab Emirates": "Asia",
    "Uzbekistan": "Asia",
    "Vietnam": "Asia",
    "Yemen": "Asia",


    // EUROPE
    "Albania": "Europe",
    "Andorra": "Europe",
    "Austria": "Europe",
    "Belarus": "Europe",
    "Belgium": "Europe",
    "Bosnia and Herzegovina": "Europe",
    "Bulgaria": "Europe",
    "Croatia": "Europe",
    "Czech Republic": "Europe",
    "Denmark": "Europe",
    "Estonia": "Europe",
    "Faroe Islands": "Europe",
    "Finland": "Europe",
    "France": "Europe",
    "Germany": "Europe",
    "Gibraltar": "Europe",
    "Greece": "Europe",
    "Guernsey": "Europe",
    "Hungary": "Europe",
    "Iceland": "Europe",
    "Ireland": "Europe",
    "Isle of Man": "Europe",
    "Italy": "Europe",
    "Jersey": "Europe",
    "Kosovo": "Europe",
    "Latvia": "Europe",
    "Liechtenstein": "Europe",
    "Lithuania": "Europe",
    "Luxembourg": "Europe",
    "Malta": "Europe",
    "Moldova": "Europe",
    "Monaco": "Europe",
    "Montenegro": "Europe",
    "Netherlands": "Europe",
    "North Macedonia": "Europe",
    "Norway": "Europe",
    "Poland": "Europe",
    "Portugal": "Europe",
    "Romania": "Europe",
    "Russia": "Europe",
    "San Marino": "Europe",
    "Serbia": "Europe",
    "Slovakia": "Europe",
    "Slovenia": "Europe",
    "Spain": "Europe",
    "Svalbard": "Europe",
    "Sweden": "Europe",
    "Switzerland": "Europe",
    "Ukraine": "Europe",
    "United Kingdom": "Europe",
    "Vatican City": "Europe",
    "Akrotiri": "Europe",


    //NORTH AMERICA
    "Antigua and Barbuda": "North America",
    "Bahamas, The": "North America",
    "Barbados": "North America",
    "Belize": "North America",
    "Bermuda": "North America",
    "Canada": "North America",
    "Costa Rica": "North America",
    "Cuba": "North America",
    "Dominica": "North America",
    "Dominican Republic": "North America",
    "El Salvador": "North America",
    "Greenland": "North America",
    "Grenada": "North America",
    "Guatemala": "North America",
    "Haiti": "North America",
    "Honduras": "North America",
    "Jamaica": "North America",
    "Mexico": "North America",
    "Nicaragua": "North America",
    "Panama": "North America",
    "Puerto Rico": "North America",
    "Saint Barthelemy": "North America",
    "Saint Kitts and Nevis": "North America",
    "Saint Lucia": "North America",
    "Saint Martin": "North America",
    "Saint Pierre and Miquelon": "North America",
    "Saint Vincent and the Grenadines": "North America",
    "Trinidad and Tobago": "North America",
    "United States": "North America",
    "United States of America": "North America",
    "Virgin Islands": "North America",
    "Cayman Islands": "North America",
    "Anguilla": "North America",
    "Aruba": "North America",
    "Guadeloupe": "North America",
    "Martinique": "North America",
    "Montserrat": "North America",
    "Sint Maarten": "North America",
    "Curacao": "North America",
    "Turks and Caicos Islands": "North America",
    "Navassa Island": "North America",
    "Bonaire": "North America",
    "Clipperton Island": "North America",


    // SOUTH AMERICA
    "Argentina": "South America",
    "Bolivia": "South America",
    "Brazil": "South America",
    "Chile": "South America",
    "Colombia": "South America",
    "Ecuador": "South America",
    "French Guiana": "South America",
    "Guyana": "South America",
    "Paraguay": "South America",
    "Peru": "South America",
    "Suriname": "South America",
    "Uruguay": "South America",
    "Venezuela": "South America",
    "Falkland Islands": "South America",


    // OCEANIA
    "American Samoa": "Oceania",
    "Australia": "Oceania",
    "Cook Islands": "Oceania",
    "Fiji": "Oceania",
    "French Polynesia": "Oceania",
    "Guam": "Oceania",
    "Kiribati": "Oceania",
    "Marshall Islands": "Oceania",
    "Micronesia, Federated States of": "Oceania",
    "Nauru": "Oceania",
    "New Caledonia": "Oceania",
    "New Zealand": "Oceania",
    "Niue": "Oceania",
    "Norfolk Island": "Oceania",
    "Northern Mariana Islands": "Oceania",
    "Palau": "Oceania",
    "Papua New Guinea": "Oceania",
    "Pitcairn Islands": "Oceania",
    "Samoa": "Oceania",
    "Solomon Islands": "Oceania",
    "Tokelau": "Oceania",
    "Tonga": "Oceania",
    "Tuvalu": "Oceania",
    "Vanuatu": "Oceania",
    "Wallis and Futuna": "Oceania",
    "Wake Island": "Oceania",
    "U.S. Pacific Island Wildlife Refuges": "Oceania",
    "Ashmore and Cartier Islands": "Oceania",


};




Promise.all([
    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"),
    d3.csv("data/cia_factbook.csv", d3.autoType)
]).then(([world, data]) => {


    function updatePopulationLegend(minValue, maxValue) {
        const canvas = document.getElementById("legend-canvas");
        const ctx = canvas.getContext("2d");


        const width = canvas.width;
        const height = canvas.height;


        const gradient = ctx.createLinearGradient(0, 0, width, 0);


        for (let i = 0; i <= 1; i += 0.01) {
            gradient.addColorStop(i, d3.interpolateYlOrRd(i));
        }


        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);


        document.getElementById("legend-min").textContent = d3.format(",")(minValue);
        document.getElementById("legend-max").textContent = d3.format(",")(maxValue);
    }




    const nameAliases = {
        "United States": "United States of America",
        "Bahamas, The": "Bahamas",
        "Congo, Democratic Republic of the": "Democratic Republic of the Congo",
        "Congo, Republic of the": "Republic of the Congo",
        "Gambia, The": "Gambia",
        "Korea, South": "South Korea",
        "Korea, North": "North Korea",
        "Cote d'Ivoire": "Ivory Coast",
        "Syria": "Syrian Arab Republic"
    };


    data.forEach(d => {
        if (nameAliases[d.country]) {
            d.country = nameAliases[d.country];
        }
    });


    function drawBloomChart(regionCountries) {
        const svg = d3.select("#growth-bloom");
        const width = +svg.attr("width");
        const height = +svg.attr("height");
        const radius = Math.min(width, height) / 2 - 20;


        svg.selectAll("*").remove();  // 清空旧图


        const g = svg.append("g")
            .attr("transform", `translate(${width / 2}, ${height / 2})`);


        const angleStep = (2 * Math.PI) / regionCountries.length;


        const growthExtent = d3.extent(regionCountries, d =>
            d.properties.metrics.population_growth_rate
        );


        const bloomScale = d3.scaleLinear()
            .domain(growthExtent)
            .range([30, radius]);


        const bloomColor = d3.scaleSequential()
            .domain(growthExtent)
            .interpolator(d3.interpolateRdYlGn);


        const tooltip = d3.select("#bloom-tooltip");


        regionCountries.forEach((d, i) => {
            const angle = i * angleStep - Math.PI / 2;


            const growth = d.properties.metrics.population_growth_rate;
            const length = bloomScale(growth);


            const x = Math.cos(angle) * length;
            const y = Math.sin(angle) * length;


            const petal = g.append("line")
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", 0)
                .attr("y2", 0)
                .attr("stroke", bloomColor(growth))
                .attr("stroke-width", 4)
                .attr("stroke-linecap", "round")
                .style("cursor", "pointer")
                .on("mousemove", function (event) {
                    tooltip
                        .style("display", "block")
                        .style("left", event.pageX + 10 + "px")
                        .style("top", event.pageY - 20 + "px")
                        .html(`
                       <strong>${d.properties.name}</strong><br>
                       Growth Rate: ${growth}%
                   `);
                    d3.select(this).attr("stroke-width", 7);
                })
                .on("mouseout", function () {
                    tooltip.style("display", "none");
                    d3.select(this).attr("stroke-width", 4);
                })
                .on("click", function () {
                    const countryName = d.properties.name;


                    const mapCountry = d3.selectAll(".country")
                        .filter(c => c.properties.name === countryName);


                    d3.selectAll(".country")
                        .transition()
                        .duration(200)
                        .attr("stroke-width", 1.4)
                        .attr("filter", null);


                    mapCountry.raise()
                        .transition()
                        .duration(300)
                        .attr("stroke-width", 4)
                        .attr("filter", "drop-shadow(0px 0px 4px #ff4444)");


                    const metrics = d.properties.metrics;
                    panel.style("display", "block").html(`
       <h3>${countryName}</h3>
       <div><strong>Population:</strong> ${d3.format(",")(metrics.population)}</div>
       <div><strong>Growth Rate:</strong> ${metrics.population_growth_rate}%</div>
   `);


                    const centroid = d3.geoCentroid(d);

                    const baseScale = height / 2 - 20;
                    const zoomMultiplier = 1.05;
                    const targetScale = baseScale * zoomMultiplier;

                    const startRotate = projection.rotate();
                    const endRotate = [-centroid[0], -centroid[1]];
                    const rotateInterp = d3.interpolate(startRotate, endRotate);

                    const startScale = projection.scale();
                    const scaleInterp = d3.interpolate(startScale, targetScale);

                    d3.transition()
                        .duration(1300)
                        .ease(d3.easeCubicOut)
                        .tween("rotate", () => {
                            return function(t) {
                                projection
                                    .rotate(rotateInterp(t))
                                    .scale(scaleInterp(t));

                                mapLayer.selectAll("path").attr("d", path);
                            };
                        });


                })




            petal.transition()
                .duration(650)
                .delay(i * 20)
                .attr("x2", x)
                .attr("y2", y);


            const dot = g.append("circle")
                .attr("cx", x)
                .attr("cy", y)
                .attr("r", 0)
                .attr("fill", bloomColor(growth))
                .style("cursor", "pointer")
                .on("mousemove", function (event) {
                    tooltip
                        .style("display", "block")
                        .style("left", event.pageX + 10 + "px")
                        .style("top", event.pageY - 20 + "px")
                        .html(`
                       <strong>${d.properties.name}</strong><br>
                       Growth Rate: ${growth}%
                   `);
                    d3.select(this).attr("r", 8);
                })
                .on("mouseout", function () {
                    tooltip.style("display", "none");
                    d3.select(this).attr("r", 5);
                });


            dot.transition()
                .duration(500)
                .delay(i * 20 + 300)
                .attr("r", 5);
        });
    }




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


    mapLayer.append("path")
        .datum({type: "Sphere"})
        .attr("fill", "#e0f2ff")
        .attr("stroke", "#94a3b8")
        .attr("stroke-width", 1)
        .attr("d", path);


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
               <div><strong>Population:</strong> ${
                metrics.population ? d3.format(",")(metrics.population) : "No data"
            }</div>
               <div><strong>Population growth:</strong> ${
                metrics.population_growth_rate ?? "No data"
            }%</div>
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

            const centroid = d3.geoCentroid(d);

            const baseScale = height / 2 - 20;
            const zoomMultiplier = 1.05;
            const targetScale = baseScale * zoomMultiplier;

            const startRotate = projection.rotate();
            const endRotate = [-centroid[0], -centroid[1]];
            const rotateInterp = d3.interpolate(startRotate, endRotate);

            const startScale = projection.scale();
            const scaleInterp = d3.interpolate(startScale, targetScale);

            d3.transition()
                .duration(1300)
                .ease(d3.easeCubicOut)
                .tween("rotate", () => {
                    return function (t) {
                        projection
                            .rotate(rotateInterp(t))
                            .scale(scaleInterp(t));
                        mapLayer.selectAll("path").attr("d", path);
                    };
                });

        });


    regionFilter.on("change", function () {
        const selected = this.value;


        if (selected === "All") {
            countryPaths.transition().duration(400)
                .attr("opacity", 1)
                .attr("fill", d =>
                    regionColors[d.properties.region] || "#7E7E7E"
                )
                .attr("stroke-width", 1.4);
            return;
        }


        const selectedCountries = countries.filter(
            d => d.properties.region === selected && d.properties.metrics
        );
        drawBloomChart(selectedCountries);




        const popExtent = d3.extent(
            selectedCountries,
            d => d.properties.metrics.population
        );


        updatePopulationLegend(popExtent[0], popExtent[1]);




        const popColor = d3.scaleSequential()
            .domain(popExtent)
            .interpolator(d3.interpolateYlOrRd);


        countryPaths.transition().duration(500)
            .attr("fill", d => {
                if (d.properties.region !== selected) {
                    return "#dddddd";
                }
                const m = d.properties.metrics;
                return m ? popColor(m.population) : "#aaaaaa";
            })
            .attr("opacity", d =>
                d.properties.region === selected ? 1 : 0.18
            )
            .attr("stroke-width", d =>
                d.properties.region === selected ? 2.2 : 0.5
            )
            .attr("stroke", "#222");
    });




}).catch(err => {
    console.error(err);
    d3.select("#map").append("div")
        .style("color", "#b91c1c")
        .style("margin-top", "10px")
        .text("Error loading map or data.");
});
