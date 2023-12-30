import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {solid} from "@fortawesome/fontawesome-svg-core/import.macro";
import React from "react";
import "./SearchBar.css"

export default function SearchBar({setSearchedUniv, univList}) {
    const handleSearch = (event) => {
        setSearchedUniv(univList.filter((univ) => univ[0].toLowerCase().includes(
            event.target.value.toLowerCase())));
    }

    return (
        <form className='SearchBlock'>
            <FontAwesomeIcon icon={solid("magnifying-glass")}/>|
            <input onChange={handleSearch} type='text' id='Search' name='Search'
                   className='Search-bar' placeholder='search for...'
            />
        </form>
    )
}