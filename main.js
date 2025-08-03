var svg = d3.select("svg");
var width = +svg.attr("width");
var height = +svg.attr("height");

var margin = {top: 50, right: 50, bottom: 70, left: 70};
var innerWidth = width - margin.left - margin.right;
var innerHeight = height - margin.top - margin.bottom;

var g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

var xScale = d3.scaleLog().range([0, innerWidth]).base(10);
var yScale = d3.scaleLinear().range([innerHeight, 0]);

var dataGlobal;
var currentScene = 1;

d3.csv("Sheet1.csv", function(d) {
  return {
    Entity: d.Entity,
    GDP_per_capita: +d["GDP_per_capita"],
    Share_animal_calories: +d["Share of the daily calorie supply that comes from animal protein"]
  };
}).then(function(data) {
  dataGlobal = data;

  // Set scales domain based on data
  xScale.domain(d3.extent(dataGlobal, d => d.GDP_per_capita));
  yScale.domain([0, d3.max(dataGlobal, d => d.Share_animal_calories)]);

  drawScene(currentScene);
});

// Function to draw scenes
function drawScene(scene) {
  g.selectAll("*").remove();

  // Draw axes
  g.append("g")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(xScale).ticks(10, "~s"));

  g.append("g")
    .call(d3.axisLeft(yScale));

  // Add axis labels
  g.append("text")
    .attr("x", innerWidth/2)
    .attr("y", innerHeight + 50)
    .attr("text-anchor", "middle")
    .text("GDP per Capita (log scale)");

  g.append("text")
    .attr("x", -innerHeight/2)
    .attr("y", -50)
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .text("Share of Calories from Animal Protein (%)");

  // Choose color based on scene
  var colorFunc;
  var annotationText;

  if (scene === 1) {
    colorFunc = () => "steelblue";
    annotationText = "Global distribution of animal protein share vs GDP.";
  } else if (scene === 2) {
    colorFunc = d => d.GDP_per_capita > 40000 ? "orange" : "#ddd";
    annotationText = "High-income countries (GDP > $40,000) highlighted.";
  } else if (scene === 3) {
    colorFunc = d => d.GDP_per_capita < 5000 ? "green" : "#ddd";
    annotationText = "Low-income countries (GDP < $5,000) highlighted.";
  }

  // Draw circles
  g.selectAll("circle")
    .data(dataGlobal)
    .enter()
    .append("circle")
    .attr("cx", d => xScale(d.GDP_per_capita))
    .attr("cy", d => yScale(d.Share_animal_calories))
    .attr("r", 5)
    .attr("fill", colorFunc)
    .attr("opacity", 0.8);

  // Add annotation text box
  g.append("rect")
    .attr("x", 10)
    .attr("y", 10)
    .attr("width", 400)
    .attr("height", 40)
    .attr("fill", "#eee")
    .attr("stroke", "#999")
    .attr("rx", 8)
    .attr("ry", 8);

  g.append("text")
    .attr("x", 20)
    .attr("y", 35)
    .attr("font-size", "14px")
    .text(annotationText);
}

// Button triggers
d3.select("#btn1").on("click", () => { currentScene = 1; drawScene(currentScene); });
d3.select("#btn2").on("click", () => { currentScene = 2; drawScene(currentScene); });
d3.select("#btn3").on("click", () => { currentScene = 3; drawScene(currentScene); });
