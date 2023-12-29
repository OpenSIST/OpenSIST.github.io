import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {solid} from "@fortawesome/fontawesome-svg-core/import.macro";
import React from "react";
import "./SearchBar.css"

export default function SearchBar({setSearchedUniv, univList}) {
    return (
        <form onSubmit={event => {
            event.preventDefault();
            setSearchedUniv(univList.filter((univ) => univ[0].toLowerCase().includes(
                event.target.Search.value.toLowerCase())));
        }}>
            <FontAwesomeIcon icon={solid("magnifying-glass")}/>
            <input type='text' id='Search' name='Search' className='Search-bar' placeholder='search for...'/>
        </form>
    )
}