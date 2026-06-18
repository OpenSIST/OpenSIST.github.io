import React, {useEffect, useRef, useState} from "react";
import "./SearchBar.css"
import {useSearchParams} from "react-router-dom";
import Select from "@mui/material/Select";
import {Box, Checkbox, Divider, FormControl, InputBase, InputLabel, ListItemText, MenuItem, OutlinedInput, Paper} from "@mui/material";
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
            {pageName === 'program' || pageName === 'favorites' ? <>
                <Filter
                    label='Select Degree'
                    id='d'
                    name='d'
                    value={filters.d}
                    handleFilterChange={handleFilterChange}
                    options={degreeList}
                    OptionItem={CheckBoxOptionItem}
                />
                <Filter
                    label='Select Major'
                    id='m'
                    name='m'
                    value={filters.m}
                    handleFilterChange={handleFilterChange}
                    options={majorList}
                    OptionItem={CheckBoxOptionItem}
                />
                <Filter
                    label='Select Region'
                    id='r'
                    name='r'
                    value={filters.r}
                    handleFilterChange={handleFilterChange}
                    options={regionList}
                    OptionItem={FlagOptionContent}
                />
            </> : null}
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
    return (
        <FormControl component={Paper} elevation={0} fullWidth sx={{
            bgcolor: (theme) => theme.palette.surfaceVariant,
        }}>
            <InputLabel size='small' sx={{fontSize: '0.8rem', lineHeight: 'inherit'}}>{label}</InputLabel>
            <Select
                multiple
                id={id}
                name={name}
                value={value}
                onChange={handleFilterChange}
                className='searchContainer'
                input={<OutlinedInput label={label} size="small"/>}
                renderValue={(selected) => selected.join(', ')}
                sx={{
                    '.MuiOutlinedInput-notchedOutline': {border: 0},
                }}
                size="small"
            >
                {options.map((opt) => (
                        <MenuItem key={opt} value={opt}>
                            <Checkbox checked={value.includes(opt)} size='small'/>
                            <OptionContent optionValue={opt}/>
                        </MenuItem>
                    )
                )}
            </Select>
        </FormControl>
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
