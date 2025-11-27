(function() {

  // --- SAME ARRAYS AS YOUR CHORD VIS ---
  const continents = [
    "Africa",
    "Asia",
    "Europe",
    "North America",
    "South America",
    "Oceania"
  ];

  const colors = d3.scaleOrdinal()
    .domain(continents)
    .range(["#d32f2f", "#f57c00", "#388e3c", "#1976d2", "#6a1b9a", "#00838f"]);

  // SAME MATRIX AS CHORD
  const baseMatrix = [
    [0, 50, 30, 10, 8, 2],
    [40, 0, 70, 25, 15, 6],
    [25, 80, 0, 45, 12, 5],
    [12, 30, 50, 0, 20, 4],
    [10, 15, 25, 35, 0, 3],
    [3, 8, 10, 4, 2, 0]
  ];

  function transpose(m) {
    return m[0].map((_, i) => m.map(row => row[i]));
  }

  let flowMode = "outbound"; // outbound or inbound
  let activeArc = null;

  // --- WORLD MAP SETUP ---
  const width = 1100, height = 600;

  const container = document.getElementById("flightmap");

  if (!container) {
    console.error("Flight map container (#flightmap) not found. Skipping visualization setup.");
    return;
  }

  const svg = d3.select(container).append("svg")
    .attr("width", width)
    .attr("height", height);

  const gMap = svg.append("g");
  const gArcs = svg.append("g");
  const gPlanes = svg.append("g");

  // NEW: Info Panel (using absolute positioning relative to the container)
  const infoPanel = d3.select(container)
    .append("div")
    .attr("id", "flight-info")
    .style("position", "absolute")
    .style("top", "20px")
    .style("right", "20px")
    .style("width", "260px")
    .style("padding", "15px")
    .style("border-radius", "10px")
    .style("font-size", "14px")
    .style("line-height", "1.5")
    .style("display", "none")
    .style("box-shadow", "0 4px 10px rgba(0,0,0,0.5)"); // Added box-shadow for style

  const projection = d3.geoNaturalEarth1()
    .scale(220)
    .translate([width/2, height/1.8]);

  const path = d3.geoPath().projection(projection);

  // continent centroid long/lat
  const centroids = {
    "Africa": projection([20, 5]),
    "Asia": projection([90, 30]),
    "Europe": projection([10, 50]),
    "North America": projection([-100, 40]),
    "South America": projection([-60, -15]),
    "Oceania": projection([140, -20])
  };

  // Load world map
  d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
    .then(world => {

      const countries = topojson.feature(world, world.objects.countries);

      // Draw background sphere
      gMap.append("path")
        .attr("d", path({type:"Sphere"}))
        .attr("fill", "#0f172a")
        .attr("stroke", "#334155");

      // Draw countries
      gMap.selectAll("path.country")
        .data(countries.features)
        .enter()
        .append("path")
        .attr("fill", "#1e293b")
        .attr("stroke", "#475569")
        .attr("stroke-width", 0.4)
        .attr("d", path);

      drawFlows();
    });

  // --- FLOW DRAWING FUNCTION ---
  function drawFlows() {

    gArcs.selectAll("*").remove();
    gPlanes.selectAll("*").remove();
    activeArc = null;
    infoPanel.style("display", "none");

    const matrix = flowMode === "outbound" ? baseMatrix : transpose(baseMatrix);

    const flows = [];

    continents.forEach((from, i) => {
      continents.forEach((to, j) => {
        if (i !== j) {
          const v = matrix[i][j];
          if (v > 0) {
            flows.push({
              from, to, value: v,
              cx1: centroids[from][0],
              cy1: centroids[from][1],
              cx2: centroids[to][0],
              cy2: centroids[to][1]
            });
          }
        }
      });
    });

    const maxVal = d3.max(flows, d => d.value);

    // Draw arcs
    const arcPaths = gArcs.selectAll("path.arc")
      .data(flows)
      .enter()
      .append("path")
      .attr("class", "arc")
      .attr("stroke", d => colors(d.from))
      .attr("stroke-width", d => 1 + 5*(d.value/maxVal))
      .attr("stroke-opacity", 0.9)
      .attr("fill", "none")
      .style("cursor", "pointer")
      .attr("d", d => {
        const x1 = d.cx1, y1 = d.cy1;
        const x2 = d.cx2, y2 = d.cy2;
        const mx = (x1 + x2)/2;
        const my = (y1 + y2)/2 - 80;
        return `M${x1},${y1} Q${mx},${my} ${x2},${y2}`;
      })
      .on("click", function(event, d) {
        selectArc(this, d);
      });

    // Animated Planes
    const planeShape = "M2,0 L-2,0 L0,-5 Z";

    const planes = gPlanes.selectAll("path.plane")
      .data(flows)
      .enter()
      .append("path")
      .attr("class", "plane")
      .attr("d", planeShape)
      .attr("fill", d => colors(d.from))
      .attr("opacity", 0.9);

    function animate() {
      planes
        .transition()
        .duration(d => 6000 + 6000 * Math.random())
        .ease(d3.easeLinear)
        .attrTween("transform", function(d) {
          const arc = arcPaths.filter(p => p === d).node();
          const L = arc.getTotalLength();

          return function(t) {
            const p = arc.getPointAtLength(t * L);
            const next = arc.getPointAtLength(Math.min(t*L + 2, L));
            const angle = Math.atan2(next.y - p.y, next.x - p.x)*180/Math.PI;
            return `translate(${p.x},${p.y}) rotate(${angle})`;
          };
        })
        .on("end", animate);
    }

    animate();

    drawLegend();
  }

  // --- ARC SELECTION ---
  function selectArc(node, d) {

    activeArc = node;

    // fade all arcs except selected
    gArcs.selectAll("path.arc")
      .attr("stroke-opacity", arc => (arc === d ? 1 : 0.15));

    // enlarge + glow
    d3.select(node)
      .transition()
      .duration(200)
      .attr("stroke-width", 8)
      .attr("filter", "drop-shadow(0px 0px 6px white)");

    // highlight plane color
    gPlanes.selectAll("path.plane")
      .attr("opacity", plane => (plane === d ? 1 : 0.15))
      .attr("fill", plane => plane === d ? "#ffffff" : colors(plane.from));

    // Show info panel
    showInfo(d);
  }

  function showInfo(d) {
    const strength = d.value > 40 ? "High" :
                     d.value > 20 ? "Medium" : "Low";

    infoPanel
      .style("display", "block")
      .html(`
        <h3 style="margin-top:0;">🌍 Migration Route</h3>
        <div><strong>From:</strong> ${d.from}</div>
        <div><strong>To:</strong> ${d.to}</div>
        <div><strong>Migrants:</strong> ${d.value}k</div>
        <div><strong>Direction:</strong> ${flowMode === "outbound" ? "Outbound" : "Inbound"}</div>
        <div><strong>Strength:</strong> ${strength}</div>
        <hr style="border-color:#334155;">
        <div style="font-size:13px; opacity:0.8;">
          Click another arc to compare flows.
        </div>
      `);
  }

  // --- LEGEND ---
  function drawLegend() {

    svg.selectAll(".legend").remove();

    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", "translate(30,540)");

    let x = 0;
    continents.forEach(cont => {
      legend.append("circle")
        .attr("cx", x)
        .attr("cy", 0)
        .attr("r", 6)
        .attr("fill", colors(cont));

      legend.append("text")
        .attr("x", x + 12)
        .attr("y", 4)
        .text(cont)
        .style("fill", "#e2e8f0");

      x += 130;
    });
  }

  // --- FLOW MODE TOGGLE ---
  document.getElementById("toggleFlowBtn")
    .addEventListener("click", () => {
      flowMode = flowMode === "outbound" ? "inbound" : "outbound";
      document.getElementById("toggleFlowBtn").textContent =
        flowMode === "outbound" ? "Switch to Inbound" : "Switch to Outbound";
      drawFlows();
    });

})();