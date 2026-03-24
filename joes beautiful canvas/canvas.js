const BrushState = Object.freeze({
  BRUSH: "brush",
  SQUARE: "square",
  CIRCLE: "circle",
  TRIANGLE: "triangle",
  ERASE: "erase"
});

let brush = {
  size : 4,
  color : [0, 0, 0],
  state : BrushState.BRUSH
}

let background_details = {
  color : [255, 255, 255],
  size : [500, 500]
}

let brush_tools_list = [
  ["Paint Brush", () => changeBrushState(BrushState.BRUSH)],
  ["Square", () => changeBrushState(BrushState.SQUARE)],
  ["Circle", () => changeBrushState(BrushState.CIRCLE)],
  ["Triangle", () => changeBrushState(BrushState.TRIANGLE)],
  ["Eraser", () => changeBrushState(BrushState.ERASE)],
  ["Clear Canvas", () => clearCanvas()],
  ["Save Image", () => roundEnd()]
]

let brush_size_list = [
  ["Tiny", 4],
  ["Small", 8],
  ["Medium", 12],
  ["Large", 16],
  ["Huge", 24]
]

let color_list = [
  [255, 255, 255],
  [120, 120, 120],
  [0, 0, 0],
  [255, 0, 0],
  [0, 255, 0],
  [0, 0, 255],
  [255, 255, 0],
  [255, 0, 255],
  [0, 255, 255],
  [255, 122, 122]
]

function setup() {
  generateToolButtons();
  generateColorButtons();
  generateBrushSizeButtons();
  let c = createCanvas(background_details.size[0], background_details.size[1]);
  c.parent("canvas");
  background(background_details.color);
}

function draw(){
  if (mouseIsPressed){
    strokeWeight(brush.size);
    switch (brush.state){
      case BrushState.BRUSH:
        stroke(brush.color);
        line(pmouseX, pmouseY, mouseX, mouseY);
        break;
      case BrushState.SQUARE:
        stroke(brush.color);
        fill(brush.color);
        square((mouseX - (brush.size / 2)), (mouseY - (brush.size / 2)), brush.size);
        break;
      case BrushState.CIRCLE:
        stroke(brush.color);
        fill(brush.color);
        circle(mouseX, mouseY, brush.size);
        break;
      case BrushState.TRIANGLE:
        stroke(brush.color);
        fill(brush.color);
        triangle(mouseX, (mouseY - brush.size), (mouseX - brush.size), (mouseY + brush.size), (mouseX + brush.size), (mouseY + brush.size)); 
        break;
      case BrushState.ERASE:
        stroke(background_details.color)
        line(pmouseX, pmouseY, mouseX, mouseY);
        break;
    }
  }
}

function windowResized(){
  //nothing for now
}

function setBrushSize(new_size){
  brush.size = new_size;
}

function setBrushColor(r,g, b){
  brush.color = [r, g, b];
}

function changeBrushState(new_state){
  brush.state = new_state;
}

function clearCanvas(){
  background(background_details.color);
  brush.state = BrushState.BRUSH;
  giveSelectedButtonOutline(document.getElementById("tool-button-container").children[0], "tool-button");
}

function roundEnd(){
  saveCanvas("Painting", "jpg"); //change name to be 'comic title' + page num + .jpg :)
}

function generateToolButtons() {
  const container = document.getElementById("tool-button-container");
  container.innerHTML = "";

  brush_tools_list.forEach(([label, action]) => {
    const btn = document.createElement("button");
    btn.className = "tool-button";
    btn.textContent = label;

    btn.onclick = () => {
      action();
      giveSelectedButtonOutline(btn, "tool-button");
    };
    container.appendChild(btn);
  });
}

function generateBrushSizeButtons() {
  const container = document.getElementById("size-button-container");
  container.innerHTML = "";

  brush_size_list.forEach(([label, value]) => {
    const btn = document.createElement("button");
    btn.className = "size-button";
    btn.textContent = label;

    btn.onclick = () => {
      setBrushSize(value);
      giveSelectedButtonOutline(btn, "size-button");
    };
    container.appendChild(btn);
  });
}

function generateColorButtons() {
  const container = document.getElementById("color-button-container");
  container.innerHTML = "";

  color_list.forEach(color => {
    const btn = document.createElement("button");
    btn.className = "color-button";
    btn.style.background = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;


    btn.onclick = () => {
      setBrushColor(color[0], color[1], color[2]);
      giveSelectedButtonOutline(btn, "color-button");
    };
    container.appendChild(btn);
  });
}

function giveSelectedButtonOutline(button, groupClass) {
  document.querySelectorAll("." + groupClass).forEach(b => b.classList.remove("selected"));
  button.classList.add("selected");
}