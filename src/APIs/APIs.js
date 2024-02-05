const ROOT = "https://opensist-backend.caoster.workers.dev/";
export const PROGRAM_LIST = ROOT + "api/static_data/programs";
export const PROGRAM_DESC = ROOT + "api/query/program_description";
export const ADD_MODIFY_PROGRAM = ROOT + "api/mutating/new_modify_program";
export const SEND_RESET_VERIFY_TOKEN = ROOT + "api/auth/forget";
export const RESET_PASSWORD = ROOT + "api/auth/forget_verify_reset";
export const SEND_VERIFY_TOKEN = ROOT + "api/auth/register";
export const REGISTER = ROOT + "api/auth/verify";
export const LOGIN = ROOT + "api/auth/login";
export const LOGOUT = ROOT + "api/my/logout";
export const IS_LOGIN = ROOT + "api/my/is_login";
export const REMOVE_PROGRAM = ROOT + "api/admin/remove_program";
export const MODIFY_PROGRAM_ID = ROOT + "api/admin/modify_program_id";
export const INBOX = ROOT + "api/admin/email/inbox";
export const TRASH = ROOT + "api/admin/email/trash";
export const GET_EMAIL_CONTENT = ROOT + "api/admin/email/fetch_one";
export const MOVE_TO_TRASH = ROOT + "api/admin/email/move_to_trash";
export const MOVE_BACK_INBOX = ROOT + "api/admin/email/move_back_inbox";
export const REMOVE_FROM_TRASH = ROOT + "api/admin/email/remove_from_trash";
export const ADD_MODIFY_APPLICANT = ROOT + "api/mutating/new_modify_applicant";
export const REMOVE_APPLICANT = ROOT + "api/admin/remove_applicant";
export const APPLICANT_LIST = ROOT + "api/list/applicants";