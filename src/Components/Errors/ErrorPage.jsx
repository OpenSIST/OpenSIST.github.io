import { useRouteError } from "react-router-dom";
import "./ErrorPage.css"

const NetworkBrokeMessage = "网络异常，请检查网络连接或采取以下措施：\n" +
    "1. 如果您连接的是上科大校园网，可以不用开启VPN\n" +
    "2. 如果您在国内且未连接上科大校园网，请确保VPN开启且网络稳定\n"  +
    "3. 如果您在海外（包含港澳台地区），则无需使用代理服务"
export default function ErrorPage() {
    const error = useRouteError();
    const stackLines = error?.stack?.split('\n') || [];
    error.message = (error.message === 'Failed to fetch' ? NetworkBrokeMessage : error.message) ?? "";
    return (
        <div className="error-page">
            <h1 className="error-title">Oops!</h1>
            <div className="error-detail">
                {(error.statusText || error.message).split("\n").map((line, index) => (
                    <p key={index}>
                        {line}
                    </p>
                ))}
            </div>
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