export default function Downloads({ onDataSend })
{
    return (
        <>
            <h1>
                Download Page Debug
            </h1>
            <div>
                <div>
                    List of comics as clickable links (Triggers Download):
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
        </>
    );
}
