import React, { useRef, useEffect } from 'react'; 
import p5 from 'p5';

// TODO: fix scoping issue with the setBrushSize, color, and state so it can work within the game component.

export default function DrawScreen()
{
 
    const BrushState = Object.freeze({
        BRUSH: "brush",
        SQUARE: "square",
        CIRCLE: "circle",
        TRIANGLE: "triangle",
        ERASE: "erase"
    });


    let background_details = {
        color : [255, 255, 255],
        size : [500, 500]
    }

    let brush_tools_list = [
        ["Paint Brush", () => p5Ref.current.changeBrushState(BrushState.BRUSH)],
        ["Square", () => p5Ref.current.changeBrushState(BrushState.SQUARE)],
        ["Circle", () => p5Ref.current.changeBrushState(BrushState.CIRCLE)],
        ["Triangle", () => p5Ref.current.changeBrushState(BrushState.TRIANGLE)],
        ["Eraser", () => p5Ref.current.changeBrushState(BrushState.ERASE)],
        ["Clear Canvas", () => p5Ref.current.clearCanvas()],
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


    const sketch = (p) =>
    {
        let brush = {
            size : 4,
            color : [0, 0, 0],
            state : BrushState.BRUSH
        }

        p.setup = () =>
        {
            p.createCanvas(background_details.size[0], background_details.size[1]);
            //background function call here, not sure what it does yet or where it is
            p.background(background_details.color);

        };

        //draw function
        p.draw = () =>
        {

            if (p.mouseIsPressed){
                p.strokeWeight(brush.size);
                switch (brush.state){
                case BrushState.BRUSH:
                    p.stroke(brush.color);
                    p.line(p.pmouseX, p.pmouseY, p.mouseX, p.mouseY);
                    break;
                case BrushState.SQUARE:
                    p.stroke(brush.color);
                    p.fill(brush.color);
                    p.square((p.mouseX - (brush.size / 2)), (p.mouseY - (brush.size / 2)), brush.size);
                    break;
                case BrushState.CIRCLE:
                    p.stroke(brush.color);
                    p.fill(brush.color);
                    p.circle(p.mouseX, p.mouseY, brush.size);
                    break;
                case BrushState.TRIANGLE:
                    p.stroke(brush.color);
                    p.fill(brush.color);
                    p.triangle(p.mouseX, (p.mouseY - brush.size), (p.mouseX - brush.size), (p.mouseY + brush.size), (p.mouseX + brush.size), (p.mouseY + brush.size)); 
                    break;
                case BrushState.ERASE:
                    p.stroke(background_details.color)
                    p.line(p.pmouseX, p.pmouseY, p.mouseX, p.mouseY);
                    break;
                }
            }
        }

        p.setBrushSize = (size) =>
        {
            brush.size = size;
        }
        
        p.setBrushColor = (r, g, b) =>
        {
            brush.color = [r, g, b];
        }
        
        p.changeBrushState = (state) =>
        {
            brush.state = state;
        }

        p.clearCanvas = () =>
        {
            p.background(background_details.color);
            brush.state = BrushState.BRUSH;
        }

    }

    const canvasRef = useRef();
    const p5Ref = useRef();

    useEffect(() =>
    {
        p5Ref.current = new p5(sketch, canvasRef.current);
        return () => p5Ref.current.remove();
        
    }, []);

    return(
        <>
        <h1>Canvas</h1>
        <div ref = {canvasRef}></div>
            <div id = "brushTools">

                <label>Brush Options</label>
                <div className = "toolSection">
                    {brush_tools_list.map((tool) =>
                    (
                        <button className = "tool-button" onClick = {tool[1]} >  {tool[0]} </button>
                    ))};
                </div>

                <div className = "seperator"></div>

                <label>Brush size</label>
                <div className = "toolSection">
                    {brush_size_list.map((size) =>
                    (
                        <button className = "size-button" onClick = {() => p5Ref.current.setBrushSize(size[1])}>{size[0]}</button>
                    ))};
                </div>

                <div className = "seperator"></div>
                <label>Brush color</label>
                <div className = "toolSection">
                    {color_list.map((color) =>
                    (
                        <button className = "color-button" style = {{ backgroundColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})` }} onClick = {() => p5Ref.current.setBrushColor(color[0], color[1], color[2])}>
                            
                        </button>
                    ))};

                </div>

            </div>
        </>
    )
}