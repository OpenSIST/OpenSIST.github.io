import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {solid} from "@fortawesome/fontawesome-svg-core/import.macro";
import React, {useState, useEffect} from "react";
import "./SearchBar.css"
import {Form, useLoaderData, useNavigation, useSearchParams, useSubmit} from "react-router-dom";
import Select from 'react-select'

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
        { value: 'US', label: `US \u{1F1FA}\u{1F1F8}` },
        { value: 'CA', label: 'CA \u{1F1E8}\u{1F1E6}' },
        { value: 'EU', label: 'EU \u{1F1EA}\u{1F1FA}' },
        { value: 'UK', label: 'UK \u{1F1EC}\u{1F1E7}' },
        { value: 'HK', label: 'HK \u{1F1ED}\u{1F1F0}' },
        { value: 'SG', label: 'SG \u{1F1F8}\u{1F1EC}' },
        { value: 'Others', label: 'Others' }
    ];

    const colorMapping = [
        { label: 'US \u{1F1FA}\u{1F1F8}', color: 'rgb(21,168,47)' },
        { label: 'CA \u{1F1E8}\u{1F1E6}', color: 'rgb(25,35,185)' },
        { label: 'EU \u{1F1EA}\u{1F1FA}', color: 'rgb(67,144,213)' },
        { label: 'UK \u{1F1EC}\u{1F1E7}', color: 'rgb(227,195,68)' },
        { label: 'HK \u{1F1ED}\u{1F1F0}', color: 'rgb(234,64,95)' },
        { label: 'SG \u{1F1F8}\u{1F1EC}', color: 'rgb(220,126,49)' },
        { label: 'Others', color: 'rgb(128,128,128)' },
        { label: 'CS', color: 'rgb(21,168,47)' },
        { label: 'EE', color: 'rgb(67,144,213)' },
        { label: 'IE', color: 'rgb(220,126,49)' },
    ]

    const defaultDegree = degreeOptions.find(x => x.value === loaderData.d);
    const defaultMajor = majorOptions.filter(x => loaderData.m?.split(',').includes(x.value));
    const defaultRegion = regionOptions.filter(x => loaderData.r?.split(',').includes(x.value));

    const colors = getComputedStyle(document.body);
    const customStyles = {
        control: (provided) => ({
            ...provided,
            width: '100%',
            marginBottom: '10px',
            backgroundColor: colors.getPropertyValue('--bg-color'),
            color: colors.getPropertyValue('--color'),
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            borderRadius: '5px',
        }),
        option: (provided) => ({
            ...provided,
            color: colors.getPropertyValue('--color'),
            backgroundColor: colors.getPropertyValue('--menu-bg-color'),
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
            '&:hover': {
                backgroundColor: colors.getPropertyValue('--block-hover-bg-color'),
            },
        }),
        clearIndicator: (provided) => ({
            ...provided,
            padding: 0,
            svg: {
                paddingLeft: '6px',
                paddingRight: '6px',
            },
        }),
        dropdownIndicator: (provided) => ({
            ...provided,
            padding: 0,
            svg: {
                paddingLeft: '6px',
                paddingRight: '6px',
            },
        }),
        placeholder: (provided) => ({
            ...provided,
            color: colors.getPropertyValue('--color'),
        }),
        input: (provided) => ({
            ...provided,
            color: colors.getPropertyValue('--color'),
        }),
        singleValue: (provided) => ({
            ...provided,
            color: colors.getPropertyValue('--color'),
        }),
        multiValue: (provided) => ({
            ...provided,
            color: colors.getPropertyValue('--color'),
        }),
        multiValueLabel: (provided, state) => {
            const color = colorMapping.find(x => x.label === state.data.label)?.color;
            let backgroundColor = color.replace(/rgb/i, "rgba");
            backgroundColor = backgroundColor.replace(/\)/i,',0.1)');
            return {
                ...provided,
                color: color,
                fontWeight: 'bold',
                backgroundColor: backgroundColor,
                paddingLeft: '7px',
                display: 'flex',
                alignSelf: 'center',
            }
        },
        multiValueRemove: (provided, state) => {
            const color = colorMapping.find(x => x.label === state.data.label)?.color;
            let backgroundColor = color.replace(/rgb/i, "rgba");
            backgroundColor = backgroundColor.replace(/\)/i,',0.1)');
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
        },
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
                    styles={customStyles}
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
                    styles={customStyles}
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
                    styles={customStyles}
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