import React, {useState, useLayoutEffect} from 'react';
export default function Downloads({ onDataSend })
{
    const [comics, setComics] = useState([])

    useLayoutEffect(() => {
        const fetchComics = async () => {
            await fetch('api/list-comics')
            .then(res => res.json())
            .then(json => setComics(json));
            // TODO: parse JSON, load into comic Names, display comic names
        };

        fetchComics();
    }, [])

    const initDownload = async (comicID) => {
        await fetch('/api/download-comic?comicID='+comicID, {
            headers: {
                'Content-Type': 'application/zip',
            },
        }).then(res => res.blob())
        .then( blob => {
            // Works on Firefox but sources say that this might not work on all browsers.
            var blobURL = window.URL.createObjectURL(blob)
            var tempLink = document.createElement('a');
            tempLink.href = blobURL;
            tempLink.setAttribute('download', 'download.zip');
            tempLink.click();
        });
    }

    return (
        <>
            <h1>
                Download Page Debug
            </h1>
            <div>
                {comics.map((comic, index) => {
                    return (<div>
                        <a className="link" onClick={() => {initDownload(comic['comicID'])} }>
                            "{comic['comicName']}" by {comic['creator']}
                        </a>
                        <p></p>
                    </div>)
                })}
            </div>
        </>
    );
}
