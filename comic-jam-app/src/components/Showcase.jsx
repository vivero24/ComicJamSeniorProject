import { useState } from 'react';

export default function Showcase({ onDataSend })
{
    const[comicIndex, setComicIndex] = useState(0)
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
                    <h1>Comic # {comicIndex + 1}</h1>
                   {comics.length > 0 && comics[comicIndex] && 
                        comics[comicIndex].panels.map((panel, index) => (
                    <img key = {index} src = {panel} />
                   ))}
                </div>

                <button onClick = {() => setComicIndex(prev => Math.max(0, prev - 1))}>Previous</button>
                <button>AutoScroll = On/Off</button>
                <button onClick = {() => setComicIndex(prev => Math.min(comics.length -1 , prev + 1))}>Next</button>
            </div>
        </>
    );
}
