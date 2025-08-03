const svg = d3.select("svg");
const width = +svg.attr("width");
const height = +svg.attr("height");
const margin = {top: 60, right: 100, bottom: 60, left: 80};
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

const tooltip = d3.select(".tooltip");

let dataGlobal; // will hold full dataset
let currentScene = 1;

// Color scale for continents/regions
const colorScale = d3.scaleOrdinal()
  .domain(["Asia","Europe","Africa","North America","South America","Oceania"])
  .range(["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b"]);

// Scales (log scales)
const xScale = d3.scaleLog().range([0, innerWidth]);
const yScale = d3.scaleLinear().range([innerHeight, 0]);

// Axes groups
const xAxisG = g.append("g").attr("transform", `translate(0,${innerHeight})`);
const yAxisG = g.append("g");

// Axis labels
g.append("text")
  .attr("class", "x label")
  .attr("x", innerWidth / 2)
  .attr("y", innerHeight + 45)
  .attr("text-anchor", "middle")
  .text("GDP per Capita (USD, log scale)");

g.append("text")
  .attr("class", "y label")
  .attr("transform", "rotate(-90)")
  .attr("x", -innerHeight / 2)
  .attr("y", -55)
  .attr("text-anchor", "middle")
  .text("Share of Calories from Animal Protein (%)");

// Legend
const legend = svg.append("g")
  .attr("class", "legend")
  .attr("transform", `translate(${width - margin.right + 20},${margin.top})`);

const regions = colorScale.domain();
regions.forEach((region, i) => {
  const legendRow = legend.append("g").attr("transform", `translate(0, ${i * 25})`);
  legendRow.append("rect")
    .attr("width", 18).attr("height", 18)
    .attr("fill", colorScale(region));
  legendRow.append("text")
    .attr("x", 25).attr("y", 13)
    .text(region);
});

// Load data and initialize
d3.csv("data416.csv").then(data => {
  // Parse numeric fields
  data.forEach(d => {
    d.GDP = +d["GDP per capita"];
    d.animalProteinShare = +d["Share of the daily calorie supply that comes from animal protein"] * 100; // convert to %
  });

  dataGlobal = data;

  // Set domains for scales based on full data
  xScale.domain(d3.extent(data, d => d.GDP)).nice();
  yScale.domain([0, d3.max(data, d => d.animalProteinShare)]).nice();

  // Draw initial scene
  drawScene1();

  // Set up button event listeners
  d3.select("#btn1").on("click", () => { currentScene = 1; drawScene1(); });
  d3.select("#btn2").on("click", () => { currentScene = 2; drawScene2(); });
  d3.select("#btn3").on("click", () => { currentScene = 3; drawScene3(); });
});

function drawAxes() {
  const xAxis = d3.axisBottom(xScale).ticks(10, "~s");
  const yAxis = d3.axisLeft(yScale);

  xAxisG.transition().duration(750).call(xAxis);
  yAxisG.transition().duration(750).call(yAxis);
}

function drawScene1() {
  g.selectAll(".annotation").remove();

  drawAxes();

  const points = g.selectAll(".point").data(dataGlobal, d => d.Entity);

  points.exit().remove();

  points.enter()
    .append("circle")
    .attr("class", "point")
    .attr("r", 5)
    .attr("fill", d => colorScale(d["World regions according to OWID"]))
    .attr("stroke", "black")
    .attr("stroke-width", 0.5)
    .on("mouseover", (event, d) => {
      tooltip.style("opacity", 1)
        .html(`<strong>${d.Entity}</strong><br/>GDP: $${d3.format(",.0f")(d.GDP)}<br/>Animal Protein Share: ${d3.format(".2f")(d.animalProteinShare)}%`)
        .style("left", (event.pageX + 15) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", () => {
      tooltip.style("opacity", 0);
    })
    .merge(points)
    .transition().duration(750)
    .attr("cx", d => xScale(d.GDP))
    .attr("cy", d => yScale(d.animalProteinShare));

  // Annotation example for scene 1
  g.append("text")
    .attr("class", "annotation")
    .attr("x", innerWidth * 0.3)
    .attr("y", innerHeight * 0.2)
    .attr("fill", "black")
    .style("font-size", "14px")
    .text("Higher GDP tends to correlate with higher animal protein share.");

}

function drawScene2() {
  g.selectAll(".annotation").remove();

  drawAxes();

  // Filter to high income countries (GDP > 30000)
  const filtered = dataGlobal.filter(d => d.GDP > 30000);

  const points = g.selectAll(".point").data(filtered, d => d.Entity);
  points.exit().remove();

  points.enter()
    .append("circle")
    .attr("class", "point")
    .attr("r", 6)
    .attr("fill", d => colorScale(d["World regions according to OWID"]))
    .attr("stroke", "black")
    .attr("stroke-width", 0.5)
    .on("mouseover", (event, d) => {
      tooltip.style("opacity", 1)
        .html(`<strong>${d.Entity}</strong><br/>GDP: $${d3.format(",.0f")(d.GDP)}<br/>Animal Protein Share: ${d3.format(".2f")(d.animalProteinShare)}%`)
        .style("left", (event.pageX + 15) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", () => {
      tooltip.style("opacity", 0);
    })
    .merge(points)
    .transition().duration(750)
    .attr("cx", d => xScale(d.GDP))
    .attr("cy", d => yScale(d.animalProteinShare));

  // Annotation for scene 2
  g.append("text")
    .attr("class", "annotation")
    .attr("x", innerWidth * 0.1)
    .attr("y", innerHeight * 0.8)
    .attr("fill", "black")
    .style("font-size", "14px")
    .text("Focus on high-income countries with GDP > $30,000.");
}

function drawScene3() {
  g.selectAll(".annotation").remove();

  drawAxes();

  // Filter to low income countries (GDP < 5000)
  const filtered = dataGlobal.filter(d => d.GDP < 5000);

  const points = g.selectAll(".point").data(filtered, d => d.Entity);
  points.exit().remove();

  points.enter()
    .append("circle")
    .attr("class", "point")
    .attr("r", 6)
    .attr("fill", d => colorScale(d["World regions according to OWID"]))
    .attr("stroke", "black")
    .attr("stroke-width", 0.5)
    .on("mouseover", (event, d) => {
      tooltip.style("opacity", 1)
        .html(`<strong>${d.Entity}</strong><br/>GDP: $${d3.format(",.0f")(d.GDP)}<br/>Animal Protein Share: ${d3.format(".2f")(d.animalProteinShare)}%`)
        .style("left", (event.pageX + 15) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", () => {
      tooltip.style("opacity", 0);
    })
    .merge(points)
    .transition().duration(750)
    .attr("cx", d => xScale(d.GDP))
    .attr("cy", d => yScale(d.animalProteinShare));

  // Annotation for scene 3
  g.append("text")
    .attr("class", "annotation")
    .attr("x", innerWidth * 0.3)
    .attr("y", innerHeight * 0.1)
    .attr("fill", "black")
    .style("font-size", "14px")
    .text("Focus on low-income countries with GDP < $5,000.");
}
