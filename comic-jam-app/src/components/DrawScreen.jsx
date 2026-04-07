import React, { useRef, useEffect } from 'react'; 
import p5 from 'p5';

export default function DrawScreen()
{
    const sketch = (p) =>
    {
        let c; 

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

        p.setup = () =>
        {
            //need to find a way to add createToolButtons, createBrushSizeButtons, and generateColorButtons functions
            //may not need to.
            p.createCanvas(background_details.size[0], background_details.size[1]);
            //c.parent("canvas");
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
    }

    const canvasRef = useRef();

    useEffect(() =>
    {
        const p5instance = new p5(sketch, canvasRef.current);
    }, []);



    return(
        <>
        <div ref = {canvasRef}>
        </div>
        </>
    )
}