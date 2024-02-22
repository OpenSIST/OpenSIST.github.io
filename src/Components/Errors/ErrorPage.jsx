import { useRouteError } from "react-router-dom";
import "./ErrorPage.css"
export default function ErrorPage() {
    const error = useRouteError();
    const stackLines = error?.stack?.split('\n') || [];
    return (
        <div id="error-page" className="error-page">
            <h1 className="error-title">Oops!</h1>
            <p className="error-message">Sorry, an unexpected error has occurred.</p>
            <p className="error-detail">
                <i>{error.statusText || error.message}</i>
            </p>
            <div className="error-stack">
                {stackLines.map((line, index) => (
                    <p key={index} className="stack-line">
                        <small>{line}</small>
                    </p>
                ))}
            </div>
        </div>
    );
}