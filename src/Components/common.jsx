import {useNavigation} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {solid} from "@fortawesome/fontawesome-svg-core/import.macro";

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