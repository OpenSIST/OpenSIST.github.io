import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {solid} from "@fortawesome/fontawesome-svg-core/import.macro";
import React, {useEffect} from "react";
import "./SearchBar.css"
import {faArrowsRotate, faSpinner} from "@fortawesome/free-solid-svg-icons";
import {Form, useLoaderData, useNavigation, useSubmit} from "react-router-dom";

export default function SearchBar() {
    const u = useLoaderData().u;
    const navigation = useNavigation();
    const submit = useSubmit();
    const searching = navigation.location && new URLSearchParams(navigation.location.search).has('u');
    useEffect(() => {
        document.getElementById('u').value = u;
    }, [u]);

    return (
        <Form
            role='search'
            className='SearchBlock'
        >
            {searching ? <FontAwesomeIcon
                icon={solid("arrows-rotate")}
                spin={searching}/> : <FontAwesomeIcon
                icon={solid("magnifying-glass")}
                spin={searching}/>}|
            <input
                id="u"
                placeholder="Search"
                type="search"
                name="u"
                className='SearchBar'
                defaultValue={u}
                onChange={(e) => {
                    submit(e.currentTarget.form);
                }}
            />
        </Form>
    )
}