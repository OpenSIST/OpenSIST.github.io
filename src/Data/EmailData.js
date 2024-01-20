import {INBOX, MOVE_BACK_INBOX, MOVE_TO_TRASH, REMOVE_FROM_TRASH, TRASH} from "../APIs/APIs";
import {handleErrors, headerGenerator} from "./Common";
import PostalMime from "postal-mime";
import {redirect} from "react-router-dom";

export async function getEmails(source='inbox') {
    const API = source === 'inbox' ? INBOX : TRASH;
    const response = await fetch(API, {
        method: 'POST',
        credentials: 'include',
        headers: await headerGenerator(true),
    });
    await handleErrors(response);
    let emails = (await response.json()).data;
    let emailObject = {};
    for (let [id, email] of Object.entries(emails)) {
        const parser = new PostalMime();
        emailObject[id] = await parser.parse(email.body);
    }
    emailObject = Object.entries(emailObject).sort((a, b) => {
        return new Date(b[1].date) - new Date(a[1].date);
    }).reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
    }, {});
    return emailObject;
}

export async function moveEmail(emailID, action) {
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
        body: JSON.stringify({EmailID: emailID})
    });
    await handleErrors(response);
}
