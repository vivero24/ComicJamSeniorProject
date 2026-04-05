export default function Showcase({ onDataSend })
{
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
                    Display Comic Here
                </div>

                <button>Previous</button>
                <button>AutoScroll = On/Off</button>
                <button>Next</button>
            </div>
        </>
    );
}
