import { useState } from 'react';

export default function Showcase({ onDataSend })
{
    const[comicIndex, setComicIndex] = useState(1)
    const[comics, setComics] = useState([
        {
            panels: [
                 'https://placehold.co/500x500',
                 'https://placehold.co/500x500',
                 'https://placehold.co/500x500'
            ]
        },
        {
            panels:[
                'https://placehold.co/500x500',
                'https://placehold.co/500x500',
                'https://placehold.co/500x500'
            ]
        }
    ]);
    

    return (
        <>
            <h1>
                Showcase Page
            </h1>
            <div>
                <div>
                    List of comics as clickable links:
                </div>
                <a className="link">
                    1. Awesome Comic by user123
                </a>
                <p></p>
                <a className="link">
                    2. Good Comic by user321
                </a>
                <p></p>
                <a className="link">
                    3. Not Very Good Comic by user999
                </a>

            </div>
            <div className="menuContainer">
                <div className="menuContainer">

                   {comics[comicIndex].panels.map((panel, index) => (
                    <img key = {index} src = {panel} />
                   ))}
                </div>

                <button>Previous</button>
                <button>AutoScroll = On/Off</button>
                <button>Next</button>
            </div>
        </>
    );
}
