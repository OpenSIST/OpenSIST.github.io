const defaultRoot = "https://opensist.tech/";
const ROOT = process.env.REACT_APP_BACKEND_SPECIFIC_API?.trim() || defaultRoot;
if (ROOT !== defaultRoot) {
    console.log("Using Alpha API: " + ROOT);
}

export const PROGRAM_LIST = ROOT + "api/list/programs";
export const PROGRAM_DESC = ROOT + "api/query/program_description";
export const ADD_MODIFY_PROGRAM = ROOT + "api/mutating/new_modify_program";
export const SEND_RESET_VERIFY_TOKEN = ROOT + "api/auth/forget";
export const RESET_PASSWORD = ROOT + "api/auth/forget_verify_reset";
export const SEND_VERIFY_TOKEN = ROOT + "api/auth/register";
export const REGISTER = ROOT + "api/auth/verify";
export const LOGIN = ROOT + "api/auth/login";
export const LOGOUT = ROOT + "api/my/logout";
export const REMOVE_PROGRAM = ROOT + "api/admin/remove_program";
export const MODIFY_PROGRAM_ID = ROOT + "api/admin/modify_program_id";
export const INBOX = ROOT + "api/admin/email/inbox";
export const TRASH = ROOT + "api/admin/email/trash";
export const GET_EMAIL_CONTENT = ROOT + "api/admin/email/fetch_one";
export const MOVE_TO_TRASH = ROOT + "api/admin/email/move_to_trash";
export const MOVE_BACK_INBOX = ROOT + "api/admin/email/move_back_inbox";
export const REMOVE_FROM_TRASH = ROOT + "api/admin/email/remove_from_trash";
export const ADD_MODIFY_APPLICANT = ROOT + "api/mutating/new_modify_applicant";
export const REMOVE_APPLICANT = ROOT + "api/mutating/remove_applicant";
export const APPLICANT_LIST = ROOT + "api/list/applicants";
export const GET_RECORD_BY_RECORD_IDs = ROOT + "api/query/by_records";
export const ADD_MODIFY_RECORD = ROOT + "api/mutating/new_modify_record";
export const REMOVE_RECORD = ROOT + "api/mutating/remove_record";
export const UPLOAD_AVATAR = ROOT + "api/user/upload_avatar";
export const GET_DISPLAY_NAME = ROOT + "api/my/get_display_name";
export const GET_METADATA = ROOT + "api/user/get_metadata";
export const GET_AVATAR = ROOT + "api/user/get_avatar";
export const TOGGLE_NICKNAME = ROOT + "api/my/toggle_nickname";
export const UPDATE_CONTACT = ROOT + "api/user/update_contact";

export const FILE_LIST = ROOT + "api/list/files";
export const GET_FILE_CONTENT = ROOT + "api/query/file_content";
export const REMOVE_FILE = ROOT + "api/mutating/remove_file";
export const ADD_FILE = ROOT + "api/mutating/new_file";
export const MODIFY_FILE = ROOT + "api/mutating/modify_file";

export const COLLECT_PROGRAM = ROOT + "api/user/collect_program";
export const UNCOLLECT_PROGRAM = ROOT + "api/user/un_collect_program";

export const CREATE_POST_API = ROOT + "api/post/create_post";
export const CREATE_COMMENT_API = ROOT + "api/post/create_comment";
export const MODIFY_CONTENT_API = ROOT + "api/post/modify_content";
export const TOGGLE_LIKE_API = ROOT + "api/post/toggle_like";
export const LIST_POSTS_API = ROOT + "api/post/list_posts";
export const GET_CONTENT_API = ROOT + "api/post/get_content";
export const DELETE_CONTENT_API = ROOT + "api/post/delete_content";