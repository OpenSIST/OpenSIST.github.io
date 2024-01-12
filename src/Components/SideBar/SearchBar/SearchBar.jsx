import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {solid} from "@fortawesome/fontawesome-svg-core/import.macro";
import React, {useEffect} from "react";
import "./SearchBar.css"
import {Form, useLoaderData, useNavigation, useSearchParams} from "react-router-dom";
import Select from 'react-select'
import {getSelectorStyle} from "../../common";
import {colorMapping, degreeOptions, majorOptions, regionOptions} from "../../../Data/Common";

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
        setSearchParams(newSearchParams, {replace: true});
    };

    const defaultDegree = degreeOptions.find(x => x.value === loaderData.d);
    const defaultMajor = majorOptions.filter(x => loaderData.m?.split(',').includes(x.value));
    const defaultRegion = regionOptions.filter(x => loaderData.r?.split(',').includes(x.value));

    const selectorStyle = getSelectorStyle();
    selectorStyle.multiValueLabel = (provided, state) => {
        const color = colorMapping.find(x => x.label === state.data.label)?.color;
        let backgroundColor = color.replace(/rgb/i, "rgba");
        backgroundColor = backgroundColor.replace(/\)/i, ',0.1)');
        return {
            ...provided,
            color: color,
            fontWeight: 'bold',
            backgroundColor: backgroundColor,
            paddingLeft: '7px',
            display: 'flex',
            alignSelf: 'center',
        }
    }
    selectorStyle.multiValueRemove = (provided, state) => {
        const color = colorMapping.find(x => x.label === state.data.label)?.color;
        let backgroundColor = color.replace(/rgb/i, "rgba");
        backgroundColor = backgroundColor.replace(/\)/i, ',0.1)');
        return {
            ...provided,
            color: color,
            backgroundColor: backgroundColor,
            textAlign: 'center',
            padding: 0,
            '&:hover': {
                backgroundColor: color,
                color: 'white',
            },
            svg: {
                padding: '5px',
            },
        }
    }

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
                    placeholder="Search..."
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
                        setSearchParams(newSearchParams, {replace: true});
                    }}
                    defaultValue={loaderData.u}
                />
            </div>
            <div className='filterContainer'>
                <Select
                    styles={selectorStyle}
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
                    styles={selectorStyle}
                    name='m'
                    options={majorOptions}
                    onChange={handleFilterChange}
                    isClearable
                    isMulti
                    closeMenuOnSelect={false}
                    placeholder='Select Major(s)'
                    id='m'
                    key='m'
                    value={defaultMajor}
                />
                <Select
                    styles={selectorStyle}
                    name='r'
                    options={regionOptions}
                    onChange={handleFilterChange}
                    isClearable
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