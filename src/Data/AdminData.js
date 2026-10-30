import {
    ADMIN_ALLOW_USER,
    ADMIN_BAN_USER,
    ADMIN_PROGRAM_VERSIONS,
    ADMIN_ROLLBACK_PROGRAM,
    ADMIN_USERS_LIST,
    FETCH_MESSAGES,
    INBOX,
    MODIFY_PROGRAM_ID,
    MOVE_BACK_INBOX,
    MOVE_TO_TRASH,
    REMOVE_FROM_TRASH,
    REMOVE_PROGRAM,
    TRASH,
} from "../APIs/APIs";
import {apiJson} from "./Common";
import {removeCacheValue} from "./CacheStore";
import {invalidateMetadataCache} from "./UserData";

export function extractApiError(error, fallback = "操作失败") {
    if (error instanceof Response) {
        return error.statusText || `请求失败 (HTTP ${error.status})`;
    }
    if (error instanceof Error && error.message) {
        return error.message;
    }
    return fallback;
}

export async function fetchAdminUsers() {
    const response = await apiJson(ADMIN_USERS_LIST);
    return response.data ?? [];
}

export async function banAdminUser(user) {
    await apiJson(ADMIN_BAN_USER, {body: {user}});
}

export async function allowAdminUser(user) {
    await apiJson(ADMIN_ALLOW_USER, {body: {user}});
}

export async function fetchProgramVersions(programId = "", limit = 100) {
    const body = {limit};
    if (programId) {
        body.ProgramID = programId;
    }
    const response = await apiJson(ADMIN_PROGRAM_VERSIONS, {body});
    return response.data ?? {currentProgram: null, versions: []};
}

export async function rollbackProgramVersion(id, programId) {
    await apiJson(ADMIN_ROLLBACK_PROGRAM, {body: {id}});
    await Promise.all([
        removeCacheValue("programs"),
        ...(programId ? [removeCacheValue(`${programId}-Desc`)] : []),
    ]);
}

export async function renameProgramId(oldProgramId, newProgramId) {
    await apiJson(MODIFY_PROGRAM_ID, {
        body: {
            ProgramID: oldProgramId,
            NewProgramID: newProgramId,
        },
    });
    await Promise.all([
        removeCacheValue("programs"),
        removeCacheValue("records"),
        removeCacheValue("applicants"),
        removeCacheValue(`${oldProgramId}-Desc`),
        removeCacheValue(`${newProgramId}-Desc`),
        invalidateMetadataCache(),
    ]);
}

export async function deleteEmptyProgram(programId) {
    await apiJson(REMOVE_PROGRAM, {body: {ProgramID: programId}});
    await Promise.all([
        removeCacheValue("programs"),
        removeCacheValue(`${programId}-Desc`),
    ]);
}

export async function fetchMailboxMessages(box = "inbox") {
    const url = box === "trash" ? TRASH : INBOX;
    const response = await apiJson(url);
    const entries = Object.entries(response.data ?? {}).map(([id, meta]) => ({
        id,
        ...meta,
    }));
    return entries.sort((a, b) => {
        const timeA = new Date(a.time ?? 0).getTime() || 0;
        const timeB = new Date(b.time ?? 0).getTime() || 0;
        return timeB - timeA;
    });
}

export async function fetchMessageDetail(messageId) {
    const response = await apiJson(FETCH_MESSAGES, {
        body: {MessageIDs: [messageId]},
    });
    return {
        raw: response.data?.[messageId] ?? null,
        parsed: response.parsed?.[messageId] ?? null,
    };
}

export async function moveMessagesToTrash(messageIds) {
    await apiJson(MOVE_TO_TRASH, {body: {MessageIDs: messageIds}});
}

export async function moveMessagesBackToInbox(messageIds) {
    await apiJson(MOVE_BACK_INBOX, {body: {MessageIDs: messageIds}});
}

export async function removeMessagesPermanently(messageIds) {
    await apiJson(REMOVE_FROM_TRASH, {body: {MessageIDs: messageIds}});
}
