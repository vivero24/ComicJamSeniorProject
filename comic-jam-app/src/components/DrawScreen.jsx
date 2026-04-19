import React, { useRef, useEffect, useImperativeHandle } from 'react'; 
import p5 from 'p5';

export default function DrawScreen({onDrawingSubmit, ref})
{
    const submitDrawing = async () =>{
        const imageData = p5Ref.current.getImageData();

        await onDrawingSubmit(imageData)
    }


    useImperativeHandle(ref, () =>({
        submitDrawing: submitDrawing
        }
    ));

    const BrushState = Object.freeze({
        BRUSH: "brush",
        ERASE: "erase"
    });

    let background_details = {
        color : [255, 255, 255],
        size : [500, 500]
    }

    let brush_tools_list = [
        ["Paint Brush", () => p5Ref.current.changeBrushState(BrushState.BRUSH)],
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
        [215, 13, 34],
        [255, 54, 58],
        [254, 108, 22],
        [204, 109, 2],
        [247, 180, 75],
        [255, 196, 28],
        [255, 222, 0],
        [200, 223, 78],
        [127, 224, 76],
        [100, 255, 69],
        [77, 192, 161],
        [88, 207, 229],
        [114, 145, 228],
        [137, 117, 230],
        [112, 76, 236],
        [117, 114, 227],
        [150, 74, 206],
        [210, 111, 225],
        [221, 72, 215],
        [255, 60, 246],
        [255, 255, 255],
        [120, 120, 120],
        [0, 0, 0],
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

        p.getImageData = () =>
        {
            return p.canvas.toDataURL();
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

        <div id="canvas-container">
            <div id="brush-tools">

                <div className = "tool-section">
                    <label className="title-text">Brush Options</label>
                    <div id="tool-button-container" class="button-container">
                        {brush_tools_list.map((tool) =>
                        (
                            <button className="button-canvas" onClick = {tool[1]}>{tool[0]}</button>
                        ))}
                    </div>
                </div>

                <div className = "separator"></div>

                <div className = "tool-section">
                    <label className="title-text">Brush Size</label>
                    <div id="size-button-container" class="button-container">
                            {brush_size_list.map((size) =>
                            (
                                <button className="button-canvas" onClick = {() => p5Ref.current.setBrushSize(size[1])}>{size[0]}</button>
                            ))}
                        </div>
                    </div>

                    <div className = "separator"></div>

                    <div className = "tool-section">
                        <label className="title-text">Brush Colors</label>
                        <div id="color-button-container" class="button-container">
                            {color_list.map((color) =>
                            (
                                <button className="button-color" style = {{ backgroundColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})` }} onClick = {() => p5Ref.current.setBrushColor(color[0], color[1], color[2])}></button>
                            ))}
                        </div>
                    </div>
                </div>
                <div ref = {canvasRef} id="canvas"></div>
            </div>
        </>
    )
}
