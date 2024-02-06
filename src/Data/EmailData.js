import {GET_EMAIL_CONTENT, INBOX, MOVE_BACK_INBOX, MOVE_TO_TRASH, REMOVE_FROM_TRASH, TRASH} from "../APIs/APIs";
import {handleErrors, headerGenerator} from "./Common";
import PostalMime from "postal-mime";
export async function getEmailList(source) {
    const API = source === 'inbox' ? INBOX : TRASH;
    const response = await fetch(API, {
        method: 'POST',
        credentials: 'include',
        headers: await headerGenerator(true),
    });
    await handleErrors(response);
    let emails = (await response.json()).data;
    emails = Object.entries(emails).sort((a, b) => {
        return new Date(b[1].time) - new Date(a[1].time);
    }).reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
    }, {});
    return emails;
}

export async function getEmailBody(emailID) {
    const response = await fetch(GET_EMAIL_CONTENT, {
        method: 'POST',
        credentials: 'include',
        headers: await headerGenerator(true),
        body: JSON.stringify({EmailID: emailID})
    });
    await handleErrors(response);
    const email = (await response.json()).data;
    const parser = new PostalMime();
    return await parser.parse(email);
}

export async function moveEmail(emailID, action) {
    console.log(emailID, action)
    let API = "";
    if (action === 'MoveToTrash') {
        API = MOVE_TO_TRASH;
    } else if (action === 'MoveBackInbox') {
        API = MOVE_BACK_INBOX;
    } else if (action === 'RemoveFromTrash') {
        API = REMOVE_FROM_TRASH;
    }
    const response = await fetch(API, {
        method: 'POST',
        credentials: 'include',
        headers: await headerGenerator(true),
        body: JSON.stringify({EmailIDs: emailID})
    });
    await handleErrors(response);
}
