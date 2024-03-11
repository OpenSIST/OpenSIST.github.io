import React, {useEffect, useState} from "react";
import "./SearchBar.css"
import {useSearchParams} from "react-router-dom";
import Select from "@mui/material/Select";
import {
    Box,
    Checkbox,
    Divider, FormControl,
    InputBase,
    InputLabel,
    ListItemText,
    MenuItem,
    OutlinedInput, Paper, useTheme
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import {majorList, degreeList, regionList} from "../../../../Data/Schemas";
import {isEmptyObject} from "../../../common";
import {regionFlagMapping} from "../../../../Data/Common";
import {grey} from "@mui/material/colors";

export default function SearchBar({query}) {
    const theme = useTheme();
    const darkMode = theme.palette.mode === 'dark';
    const [searchParams, setSearchParams] = useSearchParams();
    const [timeoutId, setTimeoutId] = useState(null);
    useEffect(() => {
        document.getElementById('u').value = query.u;
        document.getElementById('d').value = query.d?.split(',');
        document.getElementById('m').value = query.m?.split(',');
        document.getElementById('r').value = query.r?.split(',');
    }, [query, searchParams, setSearchParams]);

    const handleFilterChange = (e) => {
        const newSearchParams = new URLSearchParams(searchParams);
        const value = e.target.value;
        if (isEmptyObject(value)) {
            newSearchParams.delete(e.target.name);
        } else {
            newSearchParams.set(e.target.name, value);
        }
        if (timeoutId) clearTimeout(timeoutId);
        const id = setTimeout(() => {
            setSearchParams(newSearchParams, {replace: true});
        }, 500);
        // setSearchParams(newSearchParams, {replace: true});
        setTimeoutId(id);
    };

    const defaultDegree = degreeList.filter(x => query.d?.split(',').includes(x));
    const defaultMajor = majorList.filter(x => query.m?.split(',').includes(x));
    const defaultRegion = regionList.filter(x => query.r?.split(',').includes(x));

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', gap: "10px", mb: '10px'}}>
            <Paper
                role='search'
                className='searchContainer'
                sx={{
                    bgcolor: darkMode ? grey[800] : '#fff',
                }}
            >
                <SearchIcon sx={{mx: "10px"}}/>
                <Divider orientation="vertical" variant="middle" flexItem/>
                <InputBase
                    id='u'
                    name='u'
                    placeholder="Search..."
                    type="search"
                    className='SearchBar'
                    onChange={handleFilterChange}
                    defaultValue={query.u}
                    fullWidth
                    size="small"
                />
            </Paper>
            <Filter
                label='Select Degree'
                id='d'
                name='d'
                value={defaultDegree}
                handleFilterChange={handleFilterChange}
                options={degreeList}
                OptionItem={CheckBoxOptionItem}
            />
            <Filter
                label='Select Major'
                id='m'
                name='m'
                value={defaultMajor}
                handleFilterChange={handleFilterChange}
                options={majorList}
                OptionItem={CheckBoxOptionItem}
            />
            <Filter
                label='Select Region'
                id='r'
                name='r'
                value={defaultRegion}
                handleFilterChange={handleFilterChange}
                options={regionList}
                OptionItem={FlagOptionContent}
            />
        </Box>
    )
}

function Filter({label, id, name, value, handleFilterChange, options, OptionItem: OptionContent}) {
    return (
        <FormControl component={Paper} fullWidth sx={{
            bgcolor: (theme) => theme.palette.mode === 'dark' ? grey[800] : "#fff",
        }}>
            <InputLabel size="small">{label}</InputLabel>
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
                            <Checkbox checked={value.indexOf(opt) > -1}/>
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
        <ListItemText primary={optionValue}/>

    )
}

function FlagOptionContent({optionValue}) {
    return (
        <ListItemText primary={`${optionValue} ${regionFlagMapping[optionValue]}`}/>
    )
}