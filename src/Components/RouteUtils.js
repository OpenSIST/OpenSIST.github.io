export function encodePathSegment(value) {
    return encodeURIComponent(String(value ?? ""));
}

export function decodePathParam(value) {
    // React Router decodes path params once before loaders/components receive them.
    return value;
}

function hasUnsafeRedirectCharacter(path) {
    return Array.from(path).some((char) => {
        const code = char.charCodeAt(0);
        return char === "\\" || code <= 31 || code === 127;
    });
}

export function safeLocalPath(path, fallbackPath = "/") {
    if (
        typeof path !== "string" ||
        !path.startsWith("/") ||
        path.startsWith("//") ||
        hasUnsafeRedirectCharacter(path)
    ) {
        return fallbackPath;
    }
    return path;
}

export function dataPointsApplicantPath(applicantId) {
    return `/datapoints/applicant/${encodePathSegment(applicantId)}`;
}

export function dataPointsProgramPath(programId) {
    return `/datapoints/program/${encodePathSegment(programId)}`;
}

export function applicantDialogPath(pathname, applicantId) {
    const basePath = safeLocalPath(pathname, "/datapoints").replace(/\/applicant\/[^/]+\/?$/, "");
    return `${basePath.replace(/\/$/, "")}/applicant/${encodePathSegment(applicantId)}`;
}

export function favoritesProgramPath(programId) {
    return `/favorites/${encodePathSegment(programId)}`;
}

export function postsPostPath(postId) {
    return `/posts/${encodePathSegment(postId)}`;
}

export function postsApplicantPath(postId, applicantId) {
    return `${postsPostPath(postId)}/applicant/${encodePathSegment(applicantId)}`;
}

export function profileApplicantPath(applicantId) {
    return `/profile/${encodePathSegment(applicantId)}`;
}

export function profileApplicantEditPath(applicantId) {
    return `${profileApplicantPath(applicantId)}/edit`;
}

export function profileRecordEditPath(applicantId, programId) {
    return `${profileApplicantPath(applicantId)}/${encodePathSegment(programId)}/edit`;
}

export function programsProgramPath(programId) {
    return `/programs/${encodePathSegment(programId)}`;
}
