import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {solid} from "@fortawesome/fontawesome-svg-core/import.macro";
import React, {useState, useEffect} from "react";
import "./SearchBar.css"
import {faArrowsRotate, faSpinner} from "@fortawesome/free-solid-svg-icons";
import {Form, useLoaderData, useNavigation, useSearchParams, useSubmit} from "react-router-dom";
import Select, { StylesConfig } from 'react-select'

export default function SearchBar() {
    const loaderData = useLoaderData();
    const navigation = useNavigation();
    const searching = navigation.location && new URLSearchParams(navigation.location.search).has('u');
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        document.getElementById('u').value = loaderData.u;
        document.getElementById('d').value = loaderData.d;
        document.getElementById('m').value = loaderData.m?.split(',');
        document.getElementById('r').value = loaderData.r?.split(',');
    }, [loaderData, searchParams, setSearchParams]);

    const handleFilterChange = (selectedOption, actionMeta) => {
        const newSearchParams = new URLSearchParams(searchParams);
        if (actionMeta.action === 'select-option' || actionMeta.action === 'remove-value' || actionMeta.action === 'pop-value' || actionMeta.action === 'clear') {
            const value = Array.isArray(selectedOption)
                ? selectedOption.map(option => option.value).join(',')
                : selectedOption?.value || '';
            if (value !== '') {
                newSearchParams.set(actionMeta.name, value);
            } else {
                newSearchParams.delete(actionMeta.name);
            }
        }
        setSearchParams(newSearchParams, { replace: true });
    };

    const degreeOptions = [
        { value: 'MS', label: 'Master' },
        { value: 'PhD', label: 'PhD' }
    ];
    const majorOptions = [
        { value: 'CS', label: 'CS' },
        { value: 'EE', label: 'EE' },
        { value: 'IE', label: 'IE' }
    ];
    const regionOptions = [
        { value: 'US', label: 'United States' },
        { value: 'CA', label: 'Canada' },
        { value: 'EU', label: 'Europe' },
        { value: 'UK', label: 'United Kingdom' },
        { value: 'HK', label: 'Hong Kong' },
        { value: 'SG', label: 'Singapore' },
        { value: 'Others', label: 'Others' }
    ];

    const defaultDegree = degreeOptions.find(x => x.value === loaderData.d);
    const defaultMajor = majorOptions.filter(x => loaderData.m?.split(',').includes(x.value));
    const defaultRegion = regionOptions.filter(x => loaderData.r?.split(',').includes(x.value));

    const MultiSelectStyles: StylesConfig = {
        control: (styles) => ({ ...styles, backgroundColor: 'grey' }),
        multiValueLabel: (styles) => ({
            ...styles,
            color: 'grey',
        }),
        multiValueRemove: (styles) => ({
            ...styles,
            color: 'black',
            ':hover': {
                backgroundColor: 'black',
                color: 'white',
            },
        }),
    };

    return (
        <Form role='search' className='SearchBlock'>
            <div className='searchContainer'>
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
                    onChange={(e) => {
                        const newSearchParams = new URLSearchParams(searchParams);
                        const value = e.target.value;
                        if (value !== '') {
                            newSearchParams.set('u', value);
                        } else {
                            newSearchParams.delete('u');
                        }
                        setSearchParams(newSearchParams, { replace: true });
                    }}
                    defaultValue={loaderData.u}
                />
            </div>
            <div className='filterContainer'>
                <Select
                    className='Select'
                    name='d'
                    options={degreeOptions}
                    onChange={handleFilterChange}
                    placeholder='Select Degree'
                    isClearable
                    id='d'
                    key='d'
                    value={defaultDegree}
                />
                <Select
                    name='m'
                    options={majorOptions}
                    onChange={handleFilterChange}
                    isClearable={false}
                    isMulti
                    closeMenuOnSelect={false}
                    placeholder='Select Major(s)'
                    style={MultiSelectStyles}
                    className='Select'
                    id='m'
                    key='m'
                    value={defaultMajor}
                />
                <Select
                    style={MultiSelectStyles}
                    className='Select'
                    name='r'
                    options={regionOptions}
                    onChange={handleFilterChange}
                    isClearable={false}
                    isMulti
                    closeMenuOnSelect={false}
                    placeholder='Select Region(s)'
                    id='r'
                    key='r'
                    value={defaultRegion}
                />
            </div>
        </Form>
    )
}