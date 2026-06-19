import React, {useEffect, useRef, useState} from "react";
import "./SearchBar.css"
import {useSearchParams} from "react-router-dom";
import Select from "@mui/material/Select";
import {Box, Checkbox, Divider, InputBase, ListItemText, MenuItem, OutlinedInput, Paper} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import {degreeList, majorList, regionFlagMapping, regionList} from "../../../../Data/Schemas";

export default function SearchBar({query, pageName}) {
    return <SearchBarForm key={JSON.stringify(createFilters(query))} query={query} pageName={pageName}/>;
}

function SearchBarForm({query, pageName}) {
    const [searchParams, setSearchParams] = useSearchParams();
    const timeoutRef = useRef(null);
    const [filters, setFilters] = useState(() => createFilters(query));

    useEffect(() => () => clearTimeout(timeoutRef.current), []);

    const handleFilterChange = (e) => {
        const newSearchParams = new URLSearchParams(searchParams);
        const name = e.target.name;
        const value = e.target.value;
        setFilters((currentFilters) => ({...currentFilters, [name]: value}));
        if (value === '' || value.length === 0) {
            newSearchParams.delete(name);
        } else {
            newSearchParams.set(name, value);
        }
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setSearchParams(newSearchParams, {replace: true});
        }, 500);
    };

    return (
        <Box
            className={`${pageName}-searchbar searchbar-style`}
            sx={{display: 'flex', gap: "10px", flexDirection: 'column'}}
        >
            <Paper
                role='search'
                elevation={0}
                className='searchContainer'
                sx={{
                    bgcolor: (theme) => theme.palette.surfaceVariant,
                }}
            >
                <SearchIcon sx={{mx: "10px"}}/>
                <Divider orientation="vertical" variant="middle" flexItem/>
                {pageName === 'program' || pageName === 'favorites' ? <InputBase
                    id='u'
                    name='u'
                    placeholder="Search..."
                    type="search"
                    className='SearchBar'
                    onChange={handleFilterChange}
                    value={filters.u}
                    fullWidth
                    size="small"
                /> : <InputBase
                    id='searchStr'
                    name='searchStr'
                    placeholder="Search..."
                    type="search"
                    className='SearchBar'
                    onChange={handleFilterChange}
                    value={filters.searchStr}
                    fullWidth
                    size="small"
                />}
            </Paper>
            {pageName === 'program' || pageName === 'favorites' ? (
                <Box sx={{display: 'flex', gap: '8px'}}>
                    <Filter
                        label='学历'
                        id='d'
                        name='d'
                        value={filters.d}
                        handleFilterChange={handleFilterChange}
                        options={degreeList}
                        OptionItem={CheckBoxOptionItem}
                    />
                    <Filter
                        label='专业'
                        id='m'
                        name='m'
                        value={filters.m}
                        handleFilterChange={handleFilterChange}
                        options={majorList}
                        OptionItem={CheckBoxOptionItem}
                    />
                    <Filter
                        label='地区'
                        id='r'
                        name='r'
                        value={filters.r}
                        handleFilterChange={handleFilterChange}
                        options={regionList}
                        OptionItem={FlagOptionContent}
                    />
                </Box>
            ) : null}
        </Box>
    )
}

function createFilters(query) {
    return {
        u: query.u ?? '',
        d: splitFilter(query.d),
        m: splitFilter(query.m),
        r: splitFilter(query.r),
        searchStr: query.searchStr ?? '',
    };
}

function splitFilter(value) {
    return typeof value === 'string' ? value.split(',').filter(Boolean) : value ?? [];
}

function Filter({label, id, name, value, handleFilterChange, options, OptionItem: OptionContent}) {
    const active = value.length > 0;
    return (
        <Select
            multiple
            displayEmpty
            size="small"
            id={id}
            name={name}
            value={value}
            onChange={handleFilterChange}
            input={<OutlinedInput/>}
            className={`filter-pill${active ? ' filter-pill-active' : ''}`}
            MenuProps={{PaperProps: {sx: {borderRadius: 2, mt: 0.5, backgroundImage: 'none'}}}}
            renderValue={() => (active ? `${label} · ${value.length}` : label)}
            sx={{
                flex: 1,
                minWidth: 0,
                bgcolor: (theme) => theme.palette.surfaceVariant,
                color: (theme) => (active ? theme.palette.primary.main : theme.palette.text.secondary),
                '& .MuiSelect-select': {py: '7px', pl: '12px', fontSize: 13},
            }}
        >
            {options.map((opt) => (
                <MenuItem key={opt} value={opt} dense>
                    <Checkbox checked={value.includes(opt)} size='small'/>
                    <OptionContent optionValue={opt}/>
                </MenuItem>
            ))}
        </Select>
    )
}

function CheckBoxOptionItem({optionValue}) {
    return (
        <ListItemText
            primary={optionValue}
            sx={{
                '& .MuiListItemText-primary': {
                    fontSize: '0.8rem',
                    lineHeight: 'inherit',
                }
            }}
        />
    )
}

function FlagOptionContent({optionValue}) {
    return (
        <ListItemText
            primary={`${optionValue} ${regionFlagMapping[optionValue]}`}
            sx={{
                '& .MuiListItemText-primary': {
                    fontSize: '0.8rem',
                    lineHeight: 'inherit',
                }
            }}
        />
    )
}
