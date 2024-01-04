import {useNavigation} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {solid} from "@fortawesome/fontawesome-svg-core/import.macro";
import {useEffect, useState} from "react";

export function ResponsiveButton({
                                     content = (<FontAwesomeIcon icon={solid("arrows-rotate")}/>),
                                     title = 'Refresh'
                                 }) {
    const navigation = useNavigation()
    const loading =
        navigation.state !== 'idle'
        && navigation.formData != null
        && navigation.formAction === navigation.location?.pathname;

    return (
        <button
            type='submit'
            title={title}
            className='Button'
        >
            {loading ? <FontAwesomeIcon icon={solid("arrows-rotate")} spin={loading}/> : content}
        </button>
    )
}

export function useHidden() {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [windowHeight, setWindowHeight] = useState(window.innerHeight);
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
            setWindowHeight(window.innerHeight);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return windowWidth / windowHeight < 0.75 || windowWidth < 768;
}

export function usePending() {
    const navigation = useNavigation();
    return navigation.state === 'loading' ? 'loading' : '';
}