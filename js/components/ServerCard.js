import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Spinner from './Spinner';
const StatusIndicator = ({ status, currentTest }) => {
    if (status === 'pending')
        return _jsx("span", { className: "text-xs text-yellow-400", children: "Pending..." });
    if (status === 'testing-latency')
        return _jsxs("div", { className: "flex items-center text-xs text-sky-400", children: [_jsx(Spinner, { size: "h-3 w-3 mr-1" }), " Testing Latency..."] });
    if (status === 'testing-download')
        return _jsxs("div", { className: "flex items-center text-xs text-sky-400", children: [_jsx(Spinner, { size: "h-3 w-3 mr-1" }), " Testing Download..."] });
    if (status === 'testing-upload')
        return _jsxs("div", { className: "flex items-center text-xs text-sky-400", children: [_jsx(Spinner, { size: "h-3 w-3 mr-1" }), " Testing Upload..."] });
    if (status === 'completed')
        return _jsx("span", { className: "text-xs text-green-400", children: "Completed" });
    if (status === 'error')
        return _jsx("span", { className: "text-xs text-red-400", children: "Error" });
    return _jsx("span", { className: "text-xs text-slate-400", children: "Idle" });
};
const MetricDisplay = ({ label, value, unit, icon, status, testType }) => {
    const isActiveTest = (testType === 'latency' && status === 'testing-latency') ||
        (testType === 'download' && status === 'testing-download') ||
        (testType === 'upload' && status === 'testing-upload');
    return (_jsxs("div", { className: "flex justify-between items-center py-2", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("span", { className: "mr-2 text-slate-400", children: icon }), _jsx("span", { className: "text-sm text-slate-300", children: label })] }), isActiveTest ? (_jsx(Spinner, { size: "h-4 w-4", color: "text-sky-400" })) : value !== null ? (_jsxs("span", { className: "text-sm font-semibold text-slate-100", children: [value, " ", _jsx("span", { className: "text-xs text-slate-400", children: unit })] })) : (_jsx("span", { className: "text-sm text-slate-500", children: "-" }))] }));
};
const PingIcon = () => ( // Simplified icon
_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-5 h-5", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l-2.481-2.481M19.5 12v6.75M10.5 17.25v6.75m0 0H4.5m6 0v-6.75m0 0L8.019 8.019m0 0c1.138-1.137 2.6-1.755 4.126-1.755C14.943 6.264 16.5 7.39 16.5 8.874c0 .892-.38 1.705-1.005 2.275M4.5 17.25H0" }) }));
const DownloadIcon = () => (_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-5 h-5", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" }) }));
const UploadIcon = () => (_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-5 h-5", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" }) }));
const ServerCard = ({ serverInfo, testState }) => {
    return (_jsxs("div", { className: "bg-slate-800 shadow-xl rounded-lg p-6 w-full transform transition-all duration-300 hover:scale-[1.02]", children: [_jsxs("div", { className: "flex justify-between items-start mb-3", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-xl font-semibold text-sky-400", children: serverInfo.name }), _jsx("p", { className: "text-xs text-slate-400", children: serverInfo.location })] }), _jsx(StatusIndicator, { status: testState.status })] }), _jsxs("div", { className: "space-y-1 divide-y divide-slate-700", children: [_jsx(MetricDisplay, { label: "Latency", value: testState.latency, unit: "ms", icon: _jsx(PingIcon, {}), status: testState.status, testType: "latency" }), _jsx(MetricDisplay, { label: "Download", value: testState.downloadSpeed, unit: "Mbps", icon: _jsx(DownloadIcon, {}), status: testState.status, testType: "download" }), _jsx(MetricDisplay, { label: "Upload", value: testState.uploadSpeed, unit: "Mbps", icon: _jsx(UploadIcon, {}), status: testState.status, testType: "upload" })] }), testState.error && (_jsxs("p", { className: "mt-3 text-xs text-red-400 bg-red-900/30 p-2 rounded", children: ["Error: ", testState.error] }))] }));
};
export default ServerCard;
