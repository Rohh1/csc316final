// --- GLOBAL GAME & FLOW CONTROL ---

// Shared D3 Tooltip for all visualizations
const tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("display", "none");

const sections = [
  { id: "map", correct: "B", init: initMapVis, next: "flows" },
  { id: "flows", correct: "B", init: initFlowsVis, next: "dashboard" },
  {
    id: "dashboard",
    correct: "C",
    init: initDashboardVis,
    next: "force-galaxy",
  },
  { id: "force-galaxy", correct: "C", init: initForceGalaxyVis, next: "orbit" }, // Placeholder section
  { id: "orbit", correct: "B", init: initOrbitVis, next: "intro-page" },
];

// Typewriter effect for intro
document.addEventListener("DOMContentLoaded", () => {
  const textElement = document.getElementById("mission-text");
  const text = textElement.textContent.trim();
  textElement.textContent = "";
  let i = 0;
  const speed = 25; // typing speed in milliseconds

  function typeWriter() {
    if (i < text.length) {
      textElement.textContent += text.charAt(i);
      i++;
      setTimeout(typeWriter, speed);
    } else {
      // Once typing is done, stop the cursor effect
      textElement.style.borderRight = "none";
    }
  }
  typeWriter();

  // Begin Investigation button handler
  const beginBtn = document.getElementById("begin-investigation-btn");
  if (beginBtn) {
    beginBtn.addEventListener("click", () => {
      // Hide intro page
      document.getElementById("intro-page").style.display = "none";

      // Show first section
      const sectionMap = document.getElementById("section-map");
      if (sectionMap) {
        sectionMap.classList.remove("hidden");
        // Initialize the map visualization
        initMapVis();
        // Scroll to top of the section
        sectionMap.scrollIntoView({ behavior: "smooth" });
      }
    });
  }
});

function scrollToSection(selector) {
  document.querySelector(selector).scrollIntoView({ behavior: "smooth" });
}

// Attach click listeners to all MCQ options
document.querySelectorAll(".mcq-option").forEach((option) => {
  option.addEventListener("click", function () {
    const quizId = this.dataset.quiz;
    const selectedAnswer = this.dataset.answer;

    // Highlight selected option
    document
      .querySelectorAll(`.mcq-option[data-quiz="${quizId}"]`)
      .forEach((o) => o.classList.remove("selected"));
    this.classList.add("selected");

    checkAnswer(quizId, selectedAnswer);
  });
});

// Attach click listeners to Submit Report buttons
document.querySelectorAll(".submit-report-btn").forEach((btn) => {
  btn.addEventListener("click", function () {
    const sectionId = this.id.replace("submit-report-", "");
    const quizBlock = document.getElementById(`quiz-${sectionId}`);
    if (quizBlock) {
      quizBlock.classList.remove("hidden");
      scrollToSection(`#quiz-${sectionId}`);
    }
  });
});

// Attach click listeners to Continue buttons (in quiz blocks)
document.querySelectorAll(".continue-btn").forEach((btn) => {
  if (btn.id.startsWith("continue-")) {
    btn.addEventListener("click", function () {
      const sectionId = this.id.replace("continue-", "");

      // Special handling for final task (orbit)
      if (sectionId === "orbit") {
        // Hide all sections
        document.querySelectorAll(".vis-section").forEach((section) => {
          section.style.display = "none";
        });

        // Show final congratulations page
        const finalPage = document.getElementById("final-page");
        if (finalPage) {
          finalPage.classList.remove("hidden");
          finalPage.style.display = "flex";
          finalPage.scrollIntoView({ behavior: "smooth" });
        }
        return;
      }

      const section = sections.find((s) => s.id === sectionId);
      if (section && section.next) {
        // Reveal next section
        const nextSectionElement = document.getElementById(
          `section-${section.next}`
        );
        if (nextSectionElement) {
          nextSectionElement.classList.remove("hidden");
          scrollToSection(`#section-${section.next}`);

          // Initialize next section's visualization
          const nextSection = sections.find((s) => s.id === section.next);
          if (nextSection && nextSection.init) {
            nextSection.init();
          }
        }
      }
    });
  }
});

function checkAnswer(id, selected) {
  const section = sections.find((s) => s.id === id);
  const feedbackBox = document.getElementById(`feedback-${id}`);
  const continueBtn = document.getElementById(`continue-${id}`);
  const mcqOptions = document.querySelectorAll(
    `.mcq-option[data-quiz="${id}"]`
  );

  if (!section || !feedbackBox || !continueBtn) return;

  // Reset classes
  feedbackBox.classList.remove("feedback-correct", "feedback-incorrect");

  if (selected === section.correct) {
    feedbackBox.innerHTML =
      "<strong>✅ GOOD WORK, AGENT.</strong> Access Granted. Scroll down for the analysis.";
    feedbackBox.classList.add("feedback-correct");
  } else {
    feedbackBox.innerHTML = `<strong>❌ NICE TRY.</strong> The correct answer is Option ${section.correct}. Access Granted for Remedial Study.`;
    feedbackBox.classList.add("feedback-incorrect");
  }

  continueBtn.classList.remove("hidden");
  mcqOptions.forEach((o) => (o.style.pointerEvents = "none"));
  feedbackBox.classList.remove("hidden");
}

// --- VISUALIZATION INITIALIZATION FUNCTIONS ---

function initMapVis() {
  // Now map.js handles all rendering
  console.log("3D Earth Map initialized via map.js");
}

// 2. Migration Flows (Logic included)
function initFlowsVis() {
  // Prevent double initialization
  if (d3.select("#chord svg").size() > 0) return;

  // Migration Flow Logic from flows.html
  const width = 700,
    height = 700;
  const outerRadius = Math.min(width, height) * 0.35;
  const innerRadius = outerRadius - 20;

  const svg = d3
    .select("#chord")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  const barSvg = d3
    .select("#bar")
    .append("svg")
    .attr("width", 600)
    .attr("height", 300)
    .style("display", "block");

  const barDefs = barSvg.append("defs");

  const continents = [
    "Africa",
    "Asia",
    "Europe",
    "North America",
    "South America",
    "Oceania",
  ];
  const color = d3
    .scaleOrdinal()
    .domain(continents)
    .range(["#d32f2f", "#f57c00", "#388e3c", "#1976d2", "#6a1b9a", "#00838f"]);

  // Data (in thousands of migrants)
  const baseMatrix = [
    [0, 50, 30, 10, 8, 2], // Africa Outbound
    [40, 0, 70, 25, 15, 6], // Asia Outbound
    [25, 80, 0, 45, 12, 5], // Europe Outbound
    [12, 30, 50, 0, 20, 4], // N. America Outbound
    [10, 15, 25, 35, 0, 3], // S. America Outbound
    [3, 8, 10, 4, 2, 0], // Oceania Outbound
  ];

  let flowMode = "outbound";
  let defs;

  function getMatrix(mode) {
    if (mode === "outbound") return baseMatrix;
    if (mode === "inbound") {
      return baseMatrix[0].map((_, i) => baseMatrix.map((row) => row[i]));
    }
  }

  function drawChord(matrix) {
    svg.selectAll("*").remove();
    const chord = d3.chord().padAngle(0.05).sortSubgroups(d3.descending)(
      matrix
    );
    const arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);
    const ribbon = d3.ribbon().radius(innerRadius);

    const group = svg.append("g").selectAll("g").data(chord.groups).join("g");

    group
      .append("path")
      .attr("fill", (d) => color(continents[d.index]))
      .attr("stroke", (d) => d3.rgb(color(continents[d.index])).darker())
      .attr("d", arc)
      .on("mouseover", (event, d) => {
        updateBars(d.index);
        highlightGroup(d.index);
      })
      .on("mouseout", clearHighlight);

    group
      .append("text")
      .each((d) => (d.angle = (d.startAngle + d.endAngle) / 2))
      .attr("dy", ".35em")
      .attr(
        "transform",
        (d) => `
          rotate(${(d.angle * 180) / Math.PI - 90})
          translate(${outerRadius + 15})
          ${d.angle > Math.PI ? "rotate(180)" : ""}
        `
      )
      .attr("text-anchor", (d) => (d.angle > Math.PI ? "end" : "start"))
      .style("font-size", "13px")
      .style("fill", "#f0f0f0") // Use theme color
      .text((d) => continents[d.index]);

    defs = svg.append("defs");

    svg
      .append("g")
      .attr("fill-opacity", 0.85)
      .selectAll("path")
      .data(chord)
      .join("path")
      .attr("class", "ribbon")
      .attr("d", ribbon)
      .each(function (d) {
        const sourceAngle = (d.source.startAngle + d.source.endAngle) / 2;
        const targetAngle = (d.target.startAngle + d.target.endAngle) / 2;

        const sourceX = Math.cos(sourceAngle - Math.PI / 2) * innerRadius;
        const sourceY = Math.sin(sourceAngle - Math.PI / 2) * innerRadius;
        const targetX = Math.cos(targetAngle - Math.PI / 2) * innerRadius;
        const targetY = Math.sin(targetAngle - Math.PI / 2) * innerRadius;

        const gradientId = `gradient-${d.source.index}-${
          d.target.index
        }-${Math.random().toString(36).substr(2, 9)}`;
        const gradient = defs
          .append("linearGradient")
          .attr("id", gradientId)
          .attr("gradientUnits", "userSpaceOnUse")
          .attr("x1", sourceX)
          .attr("y1", sourceY)
          .attr("x2", targetX)
          .attr("y2", targetY);

        gradient
          .append("stop")
          .attr("offset", "0%")
          .attr("stop-color", color(continents[d.source.index]));

        gradient
          .append("stop")
          .attr("offset", "100%")
          .attr("stop-color", color(continents[d.target.index]));

        d3.select(this).attr("fill", `url(#${gradientId})`);
      })
      .attr("stroke", (d) => d3.rgb(color(continents[d.target.index])).darker())
      .on("mouseover", (event, d) => {
        updateBars(d.source.index, d.target.index);
        highlightConnection(d.source.index, d.target.index);
        tooltip
          .style("display", "block")
          .transition()
          .duration(50)
          .style("opacity", 1);

        let fromContinent, toContinent;
        if (flowMode === "outbound") {
          fromContinent = continents[d.source.index];
          toContinent = continents[d.target.index];
        } else {
          fromContinent = continents[d.target.index];
          toContinent = continents[d.source.index];
        }

        tooltip
          .html(
            `
                    <strong>${fromContinent}</strong> → ${toContinent}<br/>
                    Migrants: ${matrix[d.source.index][d.target.index]}k
                `
          )
          .style("left", event.pageX + 15 + "px")
          .style("top", event.pageY - 15 + "px");
      })
      .on("mouseout", () => {
        tooltip
          .style("display", "none")
          .transition()
          .duration(100)
          .style("opacity", 0);
        clearHighlight();
      });
  }

  function highlightGroup(i) {
    svg
      .selectAll(".ribbon")
      .transition()
      .duration(100)
      .style("opacity", (d) =>
        d.source.index === i || d.target.index === i ? 1 : 0.1
      );
  }
  function highlightConnection(s, t) {
    svg
      .selectAll(".ribbon")
      .transition()
      .duration(100)
      .style("opacity", (d) =>
        (d.source.index === s && d.target.index === t) ||
        (d.source.index === t && d.target.index === s)
          ? 1
          : 0.1
      );
  }

  const barWidth = 600,
    barHeight = 300;
  const margin = { top: 20, right: 100, bottom: 30, left: 20 };
  const x = d3.scaleLinear().range([margin.left, barWidth - margin.right]);
  const y = d3
    .scaleBand()
    .range([margin.top, barHeight - margin.bottom])
    .padding(0.15);

  function updateBars(regionIndex, targetIndex = null) {
    const regionName = continents[regionIndex];
    const regionColor = color(regionName);

    let titleHTML;
    if (targetIndex === null) {
      const titlePrefix =
        flowMode === "outbound" ? "Migrations from " : "Migrations to ";
      titleHTML = `${titlePrefix}<span style="color: ${regionColor}; font-weight: 600;">${regionName}</span>`;
    } else {
      const targetName = continents[targetIndex];
      const targetColor = color(targetName);

      if (flowMode === "outbound") {
        titleHTML = `<span style="color: ${regionColor}; font-weight: 600;">${regionName}</span> to <span style="color: ${targetColor}; font-weight: 600;">${targetName}</span>`;
      } else {
        titleHTML = `<span style="color: ${targetColor}; font-weight: 600;">${targetName}</span> to <span style="color: ${regionColor}; font-weight: 600;">${regionName}</span>`;
      }
    }

    d3.select("#barTitle").html(titleHTML);

    const matrix = getMatrix(flowMode);
    let data = [];
    if (targetIndex === null) {
      data = matrix[regionIndex]
        .map((v, i) => ({ target: continents[i], value: v }))
        .filter((d) => d.value > 0 && d.target !== regionName); // Exclude self
    } else {
      data = [
        {
          target: continents[targetIndex],
          value: matrix[regionIndex][targetIndex],
        },
      ];
    }
    data.sort((a, b) => b.value - a.value);

    const maxValue = d3.max(data, (d) => d.value);
    x.domain([0, Math.max(maxValue, 10)]);
    y.domain(data.map((d) => d.target));

    if (data.length === 1) {
      y.padding(0.5);
    } else {
      y.padding(0.15);
    }

    const labelPadding = 8;
    let maxLabelWidth = 0;
    const measureGroup = barSvg.append("g").attr("opacity", 0);
    measureGroup
      .selectAll("text")
      .data(data, (d) => d.target)
      .join("text")
      .text((d) => `${d.target} (${d.value}k)`)
      .each(function () {
        const w = this.getBBox ? this.getBBox().width : 0;
        if (w > maxLabelWidth) maxLabelWidth = w;
      });
    measureGroup.remove();

    const availableRight =
      barWidth - margin.right - labelPadding - maxLabelWidth;
    const safeRight = Math.max(availableRight, margin.left + 10);
    x.range([margin.left, safeRight]);

    barDefs.selectAll("linearGradient").remove();
    data.forEach((d) => {
      const gradientId = `bar-gradient-${regionIndex}-${continents.indexOf(
        d.target
      )}`;
      const gradient = barDefs
        .append("linearGradient")
        .attr("id", gradientId)
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%");

      if (flowMode === "outbound") {
        gradient
          .append("stop")
          .attr("offset", "0%")
          .attr("stop-color", color(continents[regionIndex]));
        gradient
          .append("stop")
          .attr("offset", "100%")
          .attr("stop-color", color(d.target));
      } else {
        gradient
          .append("stop")
          .attr("offset", "0%")
          .attr("stop-color", color(d.target));
        gradient
          .append("stop")
          .attr("offset", "100%")
          .attr("stop-color", color(continents[regionIndex]));
      }
    });

    const bars = barSvg.selectAll(".bar").data(data, (d) => d.target);
    bars.join(
      (enter) =>
        enter
          .append("rect")
          .attr("class", "bar")
          .attr("x", x(0))
          .attr("y", (d) => y(d.target))
          .attr("height", y.bandwidth())
          .attr("width", (d) => x(d.value) - x(0))
          .attr(
            "fill",
            (d) =>
              `url(#bar-gradient-${regionIndex}-${continents.indexOf(
                d.target
              )})`
          ),
      (update) =>
        update
          .attr("y", (d) => y(d.target))
          .attr("height", y.bandwidth())
          .attr(
            "fill",
            (d) =>
              `url(#bar-gradient-${regionIndex}-${continents.indexOf(
                d.target
              )})`
          )
          .transition()
          .duration(200)
          .attr("width", (d) => x(d.value) - x(0)),
      (exit) => exit.remove()
    );

    const labels = barSvg.selectAll(".label").data(data, (d) => d.target);
    labels.join(
      (enter) =>
        enter
          .append("text")
          .attr("class", "label")
          .attr("x", (d) => x(d.value) + labelPadding)
          .attr("y", (d) => y(d.target) + y.bandwidth() / 2)
          .attr("dy", "0.35em")
          .attr("text-anchor", "start")
          .text((d) => `${d.target} (${d.value}k)`)
          .style("font-size", "13px")
          .style("fill", "#ccc")
          .style("font-weight", "500"),
      (update) =>
        update
          .attr("x", (d) => x(d.value) + labelPadding)
          .attr("y", (d) => y(d.target) + y.bandwidth() / 2)
          .text((d) => `${d.target} (${d.value}k)`),
      (exit) => exit.remove()
    );
  }

  function showDefaultBars() {
    const matrix = getMatrix(flowMode);
    const totals = matrix.map((row, i) => ({
      index: i,
      total: row.reduce((sum, val) => sum + val, 0),
    }));
    const maxContinent = totals.reduce((max, curr) =>
      curr.total > max.total ? curr : max
    );
    updateBars(maxContinent.index);
  }

  function clearHighlight() {
    svg.selectAll(".ribbon").transition().duration(100).style("opacity", 0.85);
    showDefaultBars();
  }

  drawChord(getMatrix(flowMode));
  showDefaultBars();

  d3.select("#toggleFlow").on("click", () => {
    flowMode = flowMode === "outbound" ? "inbound" : "outbound";
    d3.select("#toggleFlow").text(
      flowMode === "outbound" ? "Show Inbound" : "Show Outbound"
    );
    svg.selectAll("*").transition().duration(600).style("opacity", 0.2);
    setTimeout(() => {
      drawChord(getMatrix(flowMode));
      showDefaultBars();
    }, 400);
  });
}

// 3. Population Health Dashboard (FULL Logic Integrated - from csc316final/js/dashboard.js)
function initDashboardVis() {
  if (d3.select("#plot1 svg").size() > 0) return;

  // Adjusted dimensions to match new style.css for larger plots
  const width = 500;
  const height = 400;
  const margin = { top: 50, right: 50, bottom: 65, left: 80 }; // Increased margins

  // Global state
  let data = [];
  let dotsScatter, dotsSwarm;
  let brushedCountries = new Set();
  let currentHealthTier = "all";
  let activeQuadrant = null;
  let quadLabelGroup; // Must be accessible in updateStyles

  // Load CIA Factbook data
  d3.csv("data/cia_factbook.csv", d3.autoType).then((raw) => {
    data = raw.filter(
      (d) =>
        d.country &&
        !isNaN(d.life_exp_at_birth) &&
        !isNaN(d.infant_mortality_rate) &&
        !isNaN(d.birth_rate) &&
        !isNaN(d.death_rate) &&
        d.population > 0
    );

    // ---------- HEALTH PROFILE CATEGORIES ----------
    const scores = data
      .map((d) => d.life_exp_at_birth - d.infant_mortality_rate)
      .sort(d3.ascending);
    const h1 = d3.quantile(scores, 0.33);
    const h2 = d3.quantile(scores, 0.66);

    const healthTiers = ["High risk", "In transition", "Health leaders"];

    data.forEach((d) => {
      const s = d.life_exp_at_birth - d.infant_mortality_rate;
      if (s <= h1) {
        d.healthTier = "High risk";
      } else if (s <= h2) {
        d.healthTier = "In transition";
      } else {
        d.healthTier = "Health leaders";
      }
    });

    const color = d3
      .scaleOrdinal()
      .domain(healthTiers)
      .range(["#ef4444", "#f59e0b", "#22c55e"]);

    const rPop = d3
      .scaleSqrt()
      .domain(d3.extent(data, (d) => d.population))
      .range([3, 15]);

    const symbolSize = (d) => Math.PI * Math.pow(rPop(d.population), 2);

    // ---------- Populate health profile dropdown ----------
    const filterSelect = d3.select("#filter");
    filterSelect.selectAll("option").remove();
    filterSelect
      .append("option")
      .attr("value", "all")
      .text("All health profiles");
    healthTiers.forEach((tier) => {
      filterSelect.append("option").attr("value", tier).text(tier);
    });

    filterSelect.on("change", (e) => {
      currentHealthTier = e.target.value;
      updateStyles();
      updateSummary();
    });

    // ---------- Birth–death quadrants ----------
    const medianBirth = d3.median(data, (d) => d.birth_rate);
    const medianDeath = d3.median(data, (d) => d.death_rate);

    const quadrantKey = (b, d) => {
      if (b >= medianBirth && d < medianDeath) return "highBirth_lowDeath";
      if (b >= medianBirth && d >= medianDeath) return "highBirth_highDeath";
      if (b < medianBirth && d < medianDeath) return "lowBirth_lowDeath";
      return "lowBirth_highDeath";
    };

    const quadrantConfig = {
      highBirth_lowDeath: {
        label: "Fast-growing",
        detail: "High birth, low death",
        x: 0.25,
        y: 0.3,
      },
      highBirth_highDeath: {
        label: "High churn",
        detail: "High birth, high death",
        x: 0.75,
        y: 0.3,
      },
      lowBirth_lowDeath: {
        label: "Stable",
        detail: "Low birth, low death",
        x: 0.25,
        y: 0.75,
      },
      lowBirth_highDeath: {
        label: "Aging & pressured",
        detail: "Low birth, high death",
        x: 0.75,
        y: 0.75,
      },
    };

    data.forEach((d) => {
      const key = quadrantKey(d.birth_rate, d.death_rate);
      d.quadrantKey = key;
      d.quadrantLabel = quadrantConfig[key].label;
    });

    // ---------- Panel 1: Life vs infant mortality ----------
    const svg1 = d3
      .select("#plot1")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const x1 = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.life_exp_at_birth))
      .nice()
      .range([margin.left, width - margin.right]);

    const y1 = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.infant_mortality_rate))
      .nice()
      .range([height - margin.bottom, margin.top]);

    // axes
    svg1
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x1).tickFormat(d3.format(".0f")).tickSize(5));

    svg1
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y1).tickFormat(d3.format(".0f")).tickSize(5));

    // axis labels
    svg1
      .append("text")
      .attr("x", width / 2)
      .attr("y", height - 15)
      .attr("text-anchor", "middle")
      .attr("fill", "#ccc")
      .text("Life expectancy at birth (years)");

    svg1
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .attr("fill", "#ccc")
      .text("Infant mortality (deaths per 1,000 births)");

    // title
    svg1
      .append("text")
      .attr("x", width / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .style("font-weight", 600)
      .attr("fill", "#f0f0f0")
      .text("Life vs Infant Survival (medical crosses)");

    // median guide lines
    const medianLife = d3.median(data, (d) => d.life_exp_at_birth);
    const medianInfant = d3.median(data, (d) => d.infant_mortality_rate);

    svg1
      .append("line")
      .attr("x1", x1(medianLife))
      .attr("x2", x1(medianLife))
      .attr("y1", margin.top)
      .attr("y2", height - margin.bottom)
      .attr("stroke", "#4CAF50")
      .attr("stroke-dasharray", "4,4")
      .attr("opacity", 0.5);

    svg1
      .append("line")
      .attr("x1", margin.left)
      .attr("x2", width - margin.right)
      .attr("y1", y1(medianInfant))
      .attr("y2", y1(medianInfant))
      .attr("stroke", "#4CAF50")
      .attr("stroke-dasharray", "4,4")
      .attr("opacity", 0.5);

    // medical cross glyphs
    const crossSymbolScatter = d3.symbol().type(d3.symbolCross);

    dotsScatter = svg1
      .append("g")
      .selectAll("path")
      .data(data)
      .join("path")
      .attr("class", "dot-scatter")
      .attr("d", (d) => crossSymbolScatter.size(symbolSize(d))())
      .attr(
        "transform",
        (d) =>
          `translate(${x1(d.life_exp_at_birth)},${y1(d.infant_mortality_rate)})`
      )
      .attr("fill", "none")
      .attr("stroke", (d) => color(d.healthTier))
      .attr("stroke-width", 1.3)
      .on("mousemove", (event, d) => showTooltip(event, d))
      .on("mouseleave", hideTooltip)
      .on("click", (event, d) => focusSingleCountry(d.country));

    // brushing
    const brush = d3
      .brush()
      .extent([
        [margin.left, margin.top],
        [width - margin.right, height - margin.bottom],
      ])
      .on("brush end", brushed);

    svg1.append("g").attr("class", "brush").call(brush);

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
          .filter((d) => {
            const px = x1(d.life_exp_at_birth);
            const py = y1(d.infant_mortality_rate);
            return px >= x0 && px <= x1b && py >= y0 && py <= y1b;
          })
          .map((d) => d.country)
      );
      updateStyles();
      updateSummary();
    }

    // ---------- Panel 2: Birth–death quadrant swarm ----------
    const svg2 = d3
      .select("#plot2")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    svg2
      .append("text")
      .attr("x", width / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .style("font-weight", 600)
      .attr("fill", "#f0f0f0")
      .text("Birth–Death Quadrant Swarm");

    // quadrant grid
    svg2
      .append("line")
      .attr("x1", width / 2)
      .attr("x2", width / 2)
      .attr("y1", margin.top + 15)
      .attr("y2", height - margin.bottom + 10)
      .attr("stroke", "#555") // Darker grid lines
      .attr("stroke-width", 1.2);

    svg2
      .append("line")
      .attr("x1", margin.left - 10)
      .attr("x2", width - margin.right + 10)
      .attr("y1", height / 2)
      .attr("y2", height / 2)
      .attr("stroke", "#555") // Darker grid lines
      .attr("stroke-width", 1.2);

    const quadEntries = Object.entries(quadrantConfig);
    quadLabelGroup = svg2.append("g").attr("class", "quadrant-labels");

    quadEntries.forEach(([key, cfg]) => {
      const gx = margin.left + (width - margin.left - margin.right) * cfg.x;
      const gy = margin.top + (height - margin.top - margin.bottom) * cfg.y;

      const group = quadLabelGroup
        .append("g")
        .attr("transform", `translate(${gx},${gy})`)
        .style("cursor", "pointer")
        .on("click", () => {
          activeQuadrant = activeQuadrant === key ? null : key;
          updateStyles();
          updateSummary();
        });

      group
        .append("rect")
        .attr("x", -70)
        .attr("y", -22)
        .attr("width", 140)
        .attr("height", 36)
        .attr("rx", 10)
        .attr("ry", 10)
        .attr("fill", "#333") // Dark background for label
        .attr("stroke", "#888");

      group
        .append("text")
        .attr("y", -4)
        .attr("text-anchor", "middle")
        .style("font-weight", 600)
        .style("font-size", 13)
        .attr("fill", "#f0f0f0")
        .text(cfg.label);

      group
        .append("text")
        .attr("y", 10)
        .attr("text-anchor", "middle")
        .style("font-size", 11)
        .style("fill", "#aaa")
        .text(cfg.detail);
    });

    // copy data for simulation
    const nodes = data.map((d) => Object.assign({}, d));

    nodes.forEach((n) => {
      const q = quadrantConfig[n.quadrantKey];
      n.x = margin.left + (width - margin.left - margin.right) * q.x;
      n.y = margin.top + (height - margin.top - margin.bottom) * q.y;
    });

    const crossSymbolSwarm = d3.symbol().type(d3.symbolCross);

    dotsSwarm = svg2
      .append("g")
      .selectAll("path")
      .data(nodes)
      .join("path")
      .attr("class", "dot-swarm")
      .attr("d", (d) => crossSymbolSwarm.size(symbolSize(d))())
      .attr("transform", (d) => `translate(${d.x},${d.y})`)
      .attr("fill", "none")
      .attr("stroke", (d) => color(d.healthTier))
      .attr("stroke-width", 1.3)
      .on("mousemove", (event, d) => showTooltip(event, d))
      .on("mouseleave", hideTooltip)
      .on("click", (event, d) => focusSingleCountry(d.country));

    const sim = d3
      .forceSimulation(nodes)
      .force(
        "x",
        d3
          .forceX((d) => {
            const cfg = quadrantConfig[d.quadrantKey];
            return margin.left + (width - margin.left - margin.right) * cfg.x;
          })
          .strength(0.08)
      )
      .force(
        "y",
        d3
          .forceY((d) => {
            const cfg = quadrantConfig[d.quadrantKey];
            return margin.top + (height - margin.top - margin.bottom) * cfg.y;
          })
          .strength(0.08)
      )
      .force(
        "collide",
        d3.forceCollide((d) => rPop(d.population) + 1.5)
      )
      .alpha(1)
      .alphaDecay(0.025)
      .on("tick", () => {
        dotsSwarm.attr("transform", (d) => `translate(${d.x},${d.y})`);
      });

    // ---------- Legend ----------
    const legendSvg = d3.select("#legend-dashboard svg");
    legendSvg.selectAll("*").remove();

    const legendRegionX = 20;
    const legendRegionY = 20;

    const profileLegend = legendSvg
      .append("g")
      .attr("transform", `translate(${legendRegionX},${legendRegionY})`);

    profileLegend
      .append("text")
      .attr("x", 0)
      .attr("y", -6)
      .style("font-size", 12)
      .style("font-weight", 600)
      .attr("fill", "#f0f0f0")
      .text("Color: health profile");

    const crossLegendSymbol = d3.symbol().type(d3.symbolCross).size(80);

    healthTiers.forEach((tier, i) => {
      const y = 12 + i * 18;

      profileLegend
        .append("path")
        .attr("d", crossLegendSymbol())
        .attr("transform", `translate(0,${y})`)
        .attr("fill", "none")
        .attr("stroke", color(tier))
        .attr("stroke-width", 1.2);

      profileLegend
        .append("text")
        .attr("x", 14)
        .attr("y", y + 3)
        .style("font-size", 11)
        .attr("fill", "#ccc")
        .text(tier);
    });

    const sizeLegend = legendSvg
      .append("g")
      .attr("transform", "translate(260,30)");

    sizeLegend
      .append("text")
      .attr("y", -6)
      .style("font-size", 12)
      .style("font-weight", 600)
      .attr("fill", "#f0f0f0")
      .text("Size: population");

    const popSamples = [5_000_000, 50_000_000, 200_000_000];

    popSamples.forEach((p, i) => {
      const x = 15 + i * 55;
      const r = rPop(p);

      sizeLegend
        .append("circle")
        .attr("cx", x)
        .attr("cy", 20)
        .attr("r", r)
        .attr("fill", "none")
        .attr("stroke", "#888");

      sizeLegend
        .append("text")
        .attr("x", x)
        .attr("y", 42)
        .attr("text-anchor", "middle")
        .style("font-size", 11)
        .style("fill", "#aaa")
        .text(d3.format(".2s")(p));
    });

    // ---------- Shared helpers ----------
    const fmt1 = d3.format(".1f");
    const fmtPop = d3.format(",.0f");

    function showTooltip(event, d) {
      const html = `
                <strong>${d.country}</strong><br/>
                Health profile: ${d.healthTier}<br/>
                Life expectancy: ${fmt1(d.life_exp_at_birth)} years<br/>
                Infant mortality: ${fmt1(
                  d.infant_mortality_rate
                )} / 1,000 births<br/>
                Birth rate: ${fmt1(d.birth_rate)} / 1,000 people<br/>
                Death rate: ${fmt1(d.death_rate)} / 1,000 people<br/>
                Population: ${fmtPop(d.population)}<br/>
                Birth–death quadrant: ${d.quadrantLabel}
            `;
      tooltip
        .style("display", "block")
        .html(html)
        .style("left", event.pageX + 12 + "px")
        .style("top", event.pageY - 28 + "px");
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
        .attr("stroke-width", (d) =>
          brushedCountries.has(d.country) ? 2.5 : 1.3
        )
        .attr("stroke", (d) =>
          brushedCountries.has(d.country) ? "#fff" : color(d.healthTier)
        )
        .attr("opacity", (d) => {
          const profileOK =
            currentHealthTier === "all" || d.healthTier === currentHealthTier;
          const quadrantOK =
            !activeQuadrant || d.quadrantKey === activeQuadrant;
          let base = profileOK && quadrantOK ? 0.95 : 0.1;
          if (hasBrush) {
            if (brushedCountries.has(d.country)) return 1.0;
            base *= 0.4;
          }
          return base;
        });

      dotsSwarm
        .attr("stroke-width", (d) =>
          brushedCountries.has(d.country) ? 2.5 : 1.3
        )
        .attr("stroke", (d) =>
          brushedCountries.has(d.country) ? "#fff" : color(d.healthTier)
        )
        .attr("opacity", (d) => {
          const profileOK =
            currentHealthTier === "all" || d.healthTier === currentHealthTier;
          const quadrantOK =
            !activeQuadrant || d.quadrantKey === activeQuadrant;
          let base = profileOK && quadrantOK ? 0.95 : 0.1;
          if (hasBrush) {
            if (brushedCountries.has(d.country)) return 1.0;
            base *= 0.4;
          }
          return base;
        });

      // highlight active quadrant label border
      quadLabelGroup
        .selectAll("g")
        .select("rect")
        .attr("stroke", (d, i) => {
          const key = quadEntries[i][0];
          return key === activeQuadrant ? "#4CAF50" : "#888";
        })
        .attr("stroke-width", (d, i) => {
          const key = quadEntries[i][0];
          return key === activeQuadrant ? 2 : 1;
        });
    }

    function updateSummary() {
      const summaryEl = d3.select("#selection-summary");

      const profileOK = (d) =>
        currentHealthTier === "all" || d.healthTier === currentHealthTier;
      const quadOK = (d) => !activeQuadrant || d.quadrantKey === activeQuadrant;
      const brushOK = (d) =>
        brushedCountries.size === 0 || brushedCountries.has(d.country);

      const filtered = data.filter(
        (d) => profileOK(d) && quadOK(d) && brushOK(d)
      );

      if (filtered.length === 0) {
        summaryEl.text(
          "No countries match this combination of health profile, quadrant, and selection."
        );
        return;
      }

      const meanLife = d3.mean(filtered, (d) => d.life_exp_at_birth);
      const meanInfant = d3.mean(filtered, (d) => d.infant_mortality_rate);
      const meanBirth = d3.mean(filtered, (d) => d.birth_rate);
      const meanDeath = d3.mean(filtered, (d) => d.death_rate);

      const profileText =
        currentHealthTier === "all"
          ? "all health profiles"
          : `the “${currentHealthTier}” profile`;

      let scopeText = "";
      if (brushedCountries.size > 0) {
        scopeText = `for the ${filtered.length} highlighted countr${
          filtered.length === 1 ? "y" : "ies"
        }`;
      } else if (activeQuadrant) {
        scopeText = `for ${filtered.length} countr${
          filtered.length === 1 ? "y" : "ies"
        } in the “${quadrantConfig[activeQuadrant].label}” quadrant`;
      } else {
        scopeText = `for ${filtered.length} countr${
          filtered.length === 1 ? "y" : "ies"
        }`;
      }

      summaryEl.html(
        `Within <b>${profileText}</b>, ${scopeText}: ` +
          `average life expectancy is <b>${fmt1(meanLife)} years</b>, ` +
          `infant mortality is about <b>${fmt1(
            meanInfant
          )}</b> per 1,000 births, ` +
          `birth rates are <b>${fmt1(meanBirth)}</b> and death rates <b>${fmt1(
            meanDeath
          )}</b> per 1,000 people.`
      );
    }

    // initial render
    updateStyles();
    updateSummary();
  });
}

// 4. Force Galaxy (Placeholder - Actual implementation not possible without code)
function initForceGalaxyVis() {
    console.log("Initializing Force Galaxy...");

    if (window.forceGalaxyLoaded) {
        console.log("Force Galaxy already loaded, skipping re-load.");
        return;
    }

    const script = document.createElement("script");
    script.src = "js/force-galaxy.js";
    script.onload = () => {
        console.log("Force Galaxy script loaded successfully.");

        if (typeof startForceGalaxy === "function") {
            startForceGalaxy();
        }
    };

    script.onerror = () =>
        console.error("Failed to load js/force-galaxy.js. Check file path.");

    document.body.appendChild(script);
    window.forceGalaxyLoaded = true;
}

// 5. Democracy Orbit (Logic included)
function initOrbitVis() {
  // Prevent double initialization
  if (d3.select("#orbit-chart").node()) {
    return;
  }

  // Enhanced color scheme
  const regionColors = {
    Europe: "#3498db",
    Asia: "#e74c3c",
    Africa: "#f39c12",
    "North America": "#9b59b6",
    "South America": "#1abc9c",
    Oceania: "#16a085",
    "Middle East": "#e67e22",
    Caribbean: "#2ecc71",
    "Central Asia": "#95a5a6",
    Unknown: "#bdc3c7",
  };

  const countryToRegion = {
    Albania: "Europe",
    China: "Asia",
    India: "Asia",
    Nigeria: "Africa",
    "United States": "North America",
    Brazil: "South America",
    "Saudi Arabia": "Middle East",
    Kazakhstan: "Central Asia",
    Australia: "Oceania",
    Cuba: "Caribbean",
    Austria: "Europe",
    Belgium: "Europe",
    Bulgaria: "Europe",
    Croatia: "Europe",
    "Czech Republic": "Europe",
    Denmark: "Europe",
    Estonia: "Europe",
    Finland: "Europe",
    France: "Europe",
    Germany: "Europe",
    Greece: "Europe",
    Hungary: "Europe",
    Iceland: "Europe",
    Ireland: "Europe",
    Italy: "Europe",
    Latvia: "Europe",
    Lithuania: "Europe",
    Luxembourg: "Europe",
    Netherlands: "Europe",
    Norway: "Europe",
    Poland: "Europe",
    Portugal: "Europe",
    Romania: "Europe",
    Slovakia: "Europe",
    Slovenia: "Europe",
    Spain: "Europe",
    Sweden: "Europe",
    Switzerland: "Europe",
    "United Kingdom": "Europe",
    Ukraine: "Europe",
    Belarus: "Europe",
    Moldova: "Europe",
    Serbia: "Europe",
    "Bosnia and Herzegovina": "Europe",
    Montenegro: "Europe",
    "North Macedonia": "Europe",
    Kosovo: "Europe",
    Japan: "Asia",
    "South Korea": "Asia",
    "North Korea": "Asia",
    Indonesia: "Asia",
    Thailand: "Asia",
    Vietnam: "Asia",
    Philippines: "Asia",
    Myanmar: "Asia",
    Malaysia: "Asia",
    Singapore: "Asia",
    Bangladesh: "Asia",
    Pakistan: "Asia",
    "Sri Lanka": "Asia",
    Nepal: "Asia",
    Cambodia: "Asia",
    Laos: "Asia",
    Mongolia: "Asia",
    Bhutan: "Asia",
    Brunei: "Asia",
    "Timor-Leste": "Asia",
    Taiwan: "Asia",
    "Hong Kong": "Asia",
    Macao: "Asia",
    Ethiopia: "Africa",
    Egypt: "Africa",
    "South Africa": "Africa",
    Kenya: "Africa",
    Tanzania: "Africa",
    Uganda: "Africa",
    Algeria: "Africa",
    Sudan: "Africa",
    Morocco: "Africa",
    Angola: "Africa",
    Ghana: "Africa",
    Mozambique: "Africa",
    Madagascar: "Africa",
    Cameroon: "Africa",
    Niger: "Africa",
    Mali: "Africa",
    "Burkina Faso": "Africa",
    Malawi: "Africa",
    Zambia: "Africa",
    Senegal: "Africa",
    Somalia: "Africa",
    Chad: "Africa",
    Zimbabwe: "Africa",
    Guinea: "Africa",
    Rwanda: "Africa",
    Benin: "Africa",
    Tunisia: "Africa",
    Burundi: "Africa",
    Togo: "Africa",
    "Sierra Leone": "Africa",
    Libya: "Africa",
    Liberia: "Africa",
    Mauritania: "Africa",
    "Central African Republic": "Africa",
    Eritrea: "Africa",
    Namibia: "Africa",
    Botswana: "Africa",
    Lesotho: "Africa",
    Congo: "Africa",
    Gabon: "Africa",
    "Guinea-Bissau": "Africa",
    "Equatorial Guinea": "Africa",
    Mauritius: "Africa",
    Eswatini: "Africa",
    Djibouti: "Africa",
    Comoros: "Africa",
    "Cape Verde": "Africa",
    "Sao Tome and Principe": "Africa",
    Seychelles: "Africa",
    Canada: "North America",
    Mexico: "North America",
    Argentina: "South America",
    Colombia: "South America",
    Peru: "South America",
    Venezuela: "South America",
    Chile: "South America",
    Ecuador: "South America",
    Bolivia: "South America",
    Paraguay: "South America",
    Uruguay: "South America",
    Guyana: "South America",
    Suriname: "South America",
    Iran: "Middle East",
    Iraq: "Middle East",
    Turkey: "Middle East",
    Yemen: "Middle East",
    Syria: "Middle East",
    Jordan: "Middle East",
    "United Arab Emirates": "Middle East",
    Israel: "Middle East",
    Lebanon: "Middle East",
    Oman: "Middle East",
    Kuwait: "Middle East",
    Qatar: "Middle East",
    Bahrain: "Middle East",
    Palestine: "Middle East",
    Afghanistan: "Middle East",
    Uzbekistan: "Central Asia",
    Turkmenistan: "Central Asia",
    Kyrgyzstan: "Central Asia",
    Tajikistan: "Central Asia",
    Azerbaijan: "Central Asia",
    Armenia: "Central Asia",
    Georgia: "Central Asia",
    Russia: "Central Asia",
    "New Zealand": "Oceania",
    "Papua New Guinea": "Oceania",
    Fiji: "Oceania",
    "Solomon Islands": "Oceania",
    Vanuatu: "Oceania",
    Samoa: "Oceania",
    Kiribati: "Oceania",
    Tonga: "Oceania",
    Micronesia: "Oceania",
    Palau: "Oceania",
    "Marshall Islands": "Oceania",
    Nauru: "Oceania",
    Tuvalu: "Oceania",
    Haiti: "Caribbean",
    "Dominican Republic": "Caribbean",
    Jamaica: "Caribbean",
    "Trinidad and Tobago": "Caribbean",
    Bahamas: "Caribbean",
    Barbados: "Caribbean",
    "Saint Lucia": "Caribbean",
    Grenada: "Caribbean",
    "Saint Vincent and the Grenadines": "Caribbean",
    "Antigua and Barbuda": "Caribbean",
    Dominica: "Caribbean",
    "Saint Kitts and Nevis": "Caribbean",
  };

  // NOTE: Ensure 'data/democracy_data_clean.csv' is accessible.
  d3.csv("data/democracy_data_clean.csv")
    .then((data) => {
      data.forEach((d) => {
        d.country = d.country_name;
        d.year = +d.year;
        d.spatialElectoral = +d.spatial_electoral;
        d.spatialDemocracy = +d.spatial_democracy;
        d.lowerHouseMembers = +d.lower_house_members || 0;
        d.upperHouseMembers = +d.upper_house_members || 0;
        d.hasProportionalVoting =
          d.has_proportional_voting === "TRUE" ||
          d.has_proportional_voting === true;
        d.regimeCategory = d.regime_category;
        d.region = countryToRegion[d.country] || "Unknown";
      });

      data = data.filter(
        (d) => !isNaN(d.spatialElectoral) && !isNaN(d.spatialDemocracy)
      );

      // Set up dimensions
      const margin = { top: 20, right: 80, bottom: 80, left: 100 };
      const width = 1000 - margin.left - margin.right; // Using a fixed 1000px width for the chart area
      const height = 700 - margin.top - margin.bottom;

      const svg = d3
        .select("#orbit-vis")
        .append("svg")
        .attr("id", "orbit-chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Scales
      const xExtent = d3.extent(data, (d) => d.spatialElectoral);
      const yExtent = d3.extent(data, (d) => d.spatialDemocracy);

      const xScale = d3
        .scaleLinear()
        .domain(xExtent[0] !== undefined ? xExtent : [0, 10])
        .range([0, width])
        .nice();

      const yScale = d3
        .scaleLinear()
        .domain(yExtent[0] !== undefined ? yExtent : [0, 10])
        .range([height, 0])
        .nice();

      const sizeScale = d3
        .scaleSqrt()
        .domain([
          0,
          d3.max(data, (d) => d.lowerHouseMembers + d.upperHouseMembers) ||
            1000,
        ])
        .range([3, 20]);

      // Add axes
      svg
        .append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).ticks(10).tickFormat(d3.format(".1f")));

      svg
        .append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale).ticks(10).tickFormat(d3.format(".1f")));

      // Axis labels
      svg
        .append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + 50)
        .attr("fill", "#ccc")
        .text("Neighbors' Electoral Democracy →");

      svg
        .append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -60)
        .attr("fill", "#ccc")
        .text("← Neighbors' Democracy Level");

      const trailsGroup = svg.append("g").attr("class", "trails");
      const clustersGroup = svg.append("g").attr("class", "clusters");
      const planetsGroup = svg.append("g").attr("class", "planets");

      let currentYear = 1950;
      let isPlaying = false;
      let playInterval = null;
      let viewMode = "cluster";
      window.expandedRegion = null;

      // Create legend
      const legendItems = d3.select("#legendItems");
      legendItems.selectAll("*").remove();
      Object.keys(regionColors).forEach((region) => {
        if (region === "Unknown") return;
        const item = legendItems.append("div").attr("class", "legend-item");
        item
          .append("div")
          .attr("class", "legend-color")
          .style("background-color", regionColors[region]);
        item.append("span").text(region);

        item.style("cursor", "pointer").on("click", () => {
          window.expandedRegion =
            window.expandedRegion === region ? null : region;
          updateVisualization(currentYear);
        });
      });

      function calculateClusters(yearData) {
        const clusters = d3.rollup(
          yearData,
          (countries) => ({
            countries: countries,
            count: countries.length,
            avgElectoral: d3.mean(countries, (d) => d.spatialElectoral),
            avgDemocracy: d3.mean(countries, (d) => d.spatialDemocracy),
            totalParliament: d3.sum(
              countries,
              (d) => d.lowerHouseMembers + d.upperHouseMembers
            ),
            regimes: [...new Set(countries.map((d) => d.regimeCategory))].join(
              ", "
            ),
          }),
          (d) => d.region
        );
        return Array.from(clusters, ([region, data]) => ({ region, ...data }));
      }

      function updateVisualization(year) {
        currentYear = year;
        d3.select("#yearDisplay").text(year);
        d3.select("#yearSlider").property("value", year);

        const showTrails = d3.select("#showTrails").property("checked");
        const yearData = data.filter((d) => d.year === year);

        // Update trails
        trailsGroup.selectAll(".trail").remove();
        if (showTrails && viewMode === "detail") {
          const countryData = d3.group(data, (d) => d.country);

          trailsGroup
            .selectAll(".trail")
            .data(Array.from(countryData.entries()), (d) => d[0])
            .join("path")
            .attr("class", "trail")
            .attr("d", (d) => {
              const points = d[1]
                .filter(
                  (p) =>
                    p.year <= year &&
                    !isNaN(p.spatialElectoral) &&
                    !isNaN(p.spatialDemocracy)
                )
                .sort((a, b) => a.year - b.year);
              if (points.length < 2) return "";
              return d3
                .line()
                .x((p) => xScale(p.spatialElectoral))
                .y((p) => yScale(p.spatialDemocracy))
                .defined(
                  (p) =>
                    !isNaN(xScale(p.spatialElectoral)) &&
                    !isNaN(yScale(p.spatialDemocracy))
                )
                .curve(d3.curveCardinal.tension(0.5))(points);
            })
            .attr("stroke", (d) => regionColors[d[1][0].region] || "#bdbdbd");
        }

        if (viewMode === "cluster" && !window.expandedRegion) {
          planetsGroup.selectAll(".planet").remove();
          const clusters = calculateClusters(yearData);

          const clusterElements = clustersGroup
            .selectAll(".cluster")
            .data(clusters, (d) => d.region)
            .join(
              (enter) =>
                enter
                  .append("circle")
                  .attr("class", "cluster")
                  .attr("r", 0)
                  .attr("cx", (d) => xScale(d.avgElectoral))
                  .attr("cy", (d) => yScale(d.avgDemocracy)),
              (update) => update,
              (exit) => exit.transition().duration(300).attr("r", 0).remove()
            )
            .transition()
            .duration(300)
            .attr("cx", (d) => xScale(d.avgElectoral))
            .attr("cy", (d) => yScale(d.avgDemocracy))
            .attr("r", (d) => Math.sqrt(d.count) * 12)
            .attr("fill", (d) => regionColors[d.region] || "#bdbdbd")
            .attr("stroke", "#fff")
            .attr("stroke-width", 2)
            .attr("opacity", 0.75);

          clustersGroup
            .selectAll(".cluster")
            .on("click", function (event, d) {
              window.expandedRegion = d.region;
              updateVisualization(currentYear);
            })
            .on("mouseover", function (event, d) {
              d3.select(this).attr("opacity", 1);
              tooltip
                .style("display", "block")
                .transition()
                .duration(100)
                .style("opacity", 1);
              tooltip
                .html(
                  `<strong>${d.region}</strong><br/>Countries: ${
                    d.count
                  }<br/>Avg Electoral: ${d.avgElectoral.toFixed(2)}`
                )
                .style("left", event.pageX + 15 + "px")
                .style("top", event.pageY - 15 + "px");
            })
            .on("mouseout", function () {
              d3.select(this).attr("opacity", 0.75);
              tooltip
                .style("display", "none")
                .transition()
                .duration(200)
                .style("opacity", 0);
            });
        } else {
          clustersGroup.selectAll(".cluster").remove();

          let displayData = yearData;
          if (window.expandedRegion) {
            displayData = yearData.filter(
              (d) => d.region === window.expandedRegion
            );
          }

          planetsGroup
            .selectAll(".planet")
            .data(displayData, (d) => d.country)
            .join(
              (enter) =>
                enter
                  .append("circle")
                  .attr("class", "planet")
                  .attr("r", 0)
                  .attr("cx", (d) => xScale(d.spatialElectoral))
                  .attr("cy", (d) => yScale(d.spatialDemocracy)),
              (update) => update,
              (exit) => exit.transition().duration(300).attr("r", 0).remove()
            )
            .transition()
            .duration(300)
            .attr("cx", (d) => xScale(d.spatialElectoral))
            .attr("cy", (d) => yScale(d.spatialDemocracy))
            .attr("r", (d) => {
              const total = d.lowerHouseMembers + d.upperHouseMembers;
              return total > 0 ? sizeScale(total) : 5;
            })
            .attr("fill", (d) => regionColors[d.region] || "#bdbdbd")
            .attr("stroke", (d) =>
              d.hasProportionalVoting ? "#ffd700" : "#fff"
            )
            .attr("stroke-width", (d) => (d.hasProportionalVoting ? 2.5 : 1.5))
            .attr("opacity", 0.85);

          planetsGroup
            .selectAll(".planet")
            .on("mouseover", function (event, d) {
              d3.select(this).attr("opacity", 1).attr("stroke-width", 3);
              tooltip
                .style("display", "block")
                .transition()
                .duration(100)
                .style("opacity", 1);
              tooltip
                .html(
                  `<strong>${d.country}</strong> (${d.year})<br/>Region: ${
                    d.region
                  }<br/>Electoral: ${d.spatialElectoral.toFixed(2)}`
                )
                .style("left", event.pageX + 15 + "px")
                .style("top", event.pageY - 15 + "px");
            })
            .on("mouseout", function (event, d) {
              d3.select(this)
                .attr("opacity", 0.85)
                .attr("stroke-width", (d) =>
                  d.hasProportionalVoting ? 2.5 : 1.5
                );
              tooltip
                .style("display", "none")
                .transition()
                .duration(200)
                .style("opacity", 0);
            })
            .on("click", function (event, d) {
              if (window.expandedRegion) {
                window.expandedRegion = null;
                viewMode = "cluster";
                updateVisualization(currentYear);
                d3.select("#clusterView").dispatch("click");
              }
            });
        }

        // Update legend title
        const legendButton = window.expandedRegion
          ? ` <button onclick="window.expandedRegion=null; updateVisualization(${currentYear}); return false;" class="continue-btn" style="font-size:12px; padding:2px 8px; margin-left: 10px; background: #333; color: #f0f0f0;">← Back to All Regions</button>`
          : "";
        d3.select(".legend-title").html(
          window.expandedRegion
            ? `🌍 ${window.expandedRegion}` + legendButton
            : "🌍 Regions (Click to explore)"
        );
      }

      // Play/pause
      function togglePlay() {
        isPlaying = !isPlaying;
        const button = d3.select("#playButton");
        if (isPlaying) {
          button.text("⏸ Pause").classed("active", true);
          playInterval = setInterval(() => {
            currentYear = currentYear >= 2020 ? 1950 : currentYear + 1;
            updateVisualization(currentYear);
            if (currentYear >= 2020) togglePlay();
          }, 200);
        } else {
          button.text("▶ Play").classed("active", false);
          if (playInterval) clearInterval(playInterval);
        }
      }

      // Event listeners
      d3.select("#playButton").on("click", togglePlay);
      d3.select("#resetButton").on("click", () => {
        if (isPlaying) togglePlay();
        updateVisualization(1950);
      });
      d3.select("#yearSlider").on("input", function () {
        if (isPlaying) togglePlay();
        updateVisualization(+this.value);
      });
      d3.select("#showTrails").on("change", () =>
        updateVisualization(currentYear)
      );

      // View mode toggle
      d3.select("#clusterView").on("click", function () {
        viewMode = "cluster";
        window.expandedRegion = null;
        d3.selectAll(".view-toggle button").classed("active", false);
        d3.select(this).classed("active", true);
        updateVisualization(currentYear);
      });

      d3.select("#detailView").on("click", function () {
        viewMode = "detail";
        window.expandedRegion = null;
        d3.selectAll(".view-toggle button").classed("active", false);
        d3.select(this).classed("active", true);
        updateVisualization(currentYear);
      });

      // Initial render
      window.updateVisualization = updateVisualization;
      updateVisualization(1950);
    })
    .catch((error) => {
      console.error("Error loading data:", error);
      d3.select("#orbit-vis").html(`
            <div style="padding: 40px; text-align: center; color: #d32f2f;">
                <h3>Error Loading Data</h3>
                <p>Could not load democracy_data_clean.csv. Please ensure it is in the data/ folder.</p>
            </div>
        `);
    });
}
