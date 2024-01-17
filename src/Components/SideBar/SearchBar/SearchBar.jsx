import React, {useEffect} from "react";
import "./SearchBar.css"
import {useLoaderData, useSearchParams} from "react-router-dom";
import Select from "@mui/material/Select";
import {
    Box,
    Checkbox,
    Divider, FormControl,
    InputBase,
    InputLabel, ListItemIcon,
    ListItemText,
    MenuItem,
    OutlinedInput,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import {majorOptions, degreeOptions, regionOptions} from "../../../Data/Schemas";
import {CountryFlag, isEmptyObject} from "../../common";

export default function SearchBar() {
    const loaderData = useLoaderData();
    const [searchParams, setSearchParams] = useSearchParams();
    useEffect(() => {
        document.getElementById('u').value = loaderData.u;
        document.getElementById('d').value = loaderData.d?.split(',');
        document.getElementById('m').value = loaderData.m?.split(',');
        document.getElementById('r').value = loaderData.r?.split(',');
    }, [loaderData, searchParams, setSearchParams]);

    const handleFilterChange = (e) => {
        const newSearchParams = new URLSearchParams(searchParams);
        const value = e.target.value;
        if (isEmptyObject(value)) {
            newSearchParams.delete(e.target.name);
        } else {
            newSearchParams.set(e.target.name, value);
        }
        setSearchParams(newSearchParams, {replace: true});
    };

    const defaultDegree = degreeOptions.filter(x => loaderData.d?.split(',').includes(x));
    const defaultMajor = majorOptions.filter(x => loaderData.m?.split(',').includes(x));
    const defaultRegion = regionOptions.filter(x => loaderData.r?.split(',').includes(x));

    return (
        <Box>
            <Box role='search' className='searchContainer'>
                <SearchIcon sx={{m: "10px"}}/>
                <Divider orientation="vertical" variant="middle" flexItem/>
                <InputBase
                    id="u"
                    label="Search"
                    variant="outlined"
                    placeholder="Search..."
                    type="search"
                    name="u"
                    className='SearchBar'
                    onChange={handleFilterChange}
                    defaultValue={loaderData.u}
                />
            </Box>
            <FormControl sx={{width: "100%"}}>
                <InputLabel>Select Degree</InputLabel>
                <Select
                    multiple
                    id='d'
                    name='d'
                    value={defaultDegree}
                    onChange={handleFilterChange}
                    className='searchContainer'
                    input={<OutlinedInput label="Select Degree"/>}
                    renderValue={(selected) => selected.join(', ')}
                >
                    {degreeOptions.map((d) => (
                        <MenuItem key={d} value={d}>
                            <Checkbox checked={defaultDegree.indexOf(d) > -1}/>
                            <ListItemText primary={d}/>
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <FormControl sx={{width: "100%"}}>
                <InputLabel>Select Major</InputLabel>
                <Select
                    multiple
                    id='m'
                    name='m'
                    value={defaultMajor}
                    onChange={handleFilterChange}
                    className='searchContainer'
                    input={<OutlinedInput label="Select Major"/>}
                    renderValue={(selected) => selected.join(', ')}
                >
                    {majorOptions.map((m) => (
                        <MenuItem key={m} value={m}>
                            <Checkbox checked={defaultMajor.indexOf(m) > -1}/>
                            <ListItemText primary={m}/>
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <FormControl sx={{width: "100%"}}>
                <InputLabel>Select Region</InputLabel>
                <Select
                    multiple
                    id='r'
                    name='r'
                    value={defaultRegion}
                    onChange={handleFilterChange}
                    className='searchContainer'
                    input={<OutlinedInput label="Select Region"/>}
                    renderValue={(selected) => selected.join(', ')}
                >
                    {regionOptions.map((r) => (
                        <MenuItem key={r} value={r}>
                            <Checkbox checked={defaultRegion.indexOf(r) > -1}/>
                            <ListItemText primary={r}/>
                            <ListItemIcon><CountryFlag country={r}/></ListItemIcon>
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    )
}