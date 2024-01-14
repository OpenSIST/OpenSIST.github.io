const ROOT = "https://opensist-auth.caoster.workers.dev/";
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