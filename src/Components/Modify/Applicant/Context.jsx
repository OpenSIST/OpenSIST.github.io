import React, { createContext, useCallback, useMemo, useReducer } from "react";

type FormValue = { [key: string]: any };

export const ApplicantContext = createContext({
    activeStep: 0,
    formValues: {},
    handleChange() {},
    handleNext() {},
    handleBack() {},
});

interface ProviderProps {
    children: React.ReactNode;
}

type State = {
    activeStep: number;
    formValues: FormValue;
};

type Action =
    | { type: "increase" }
    | { type: "decrease" }
    | { type: "form-value"; name: string; fieldValue: any };

function reducer(state: State, action: Action): State {
    console.log(state, action)
    switch (action.type) {
        case "increase":
            return {
                ...state,
                activeStep: state.activeStep + 1
            };
        case "decrease":
            return {
                ...state,
                activeStep: state.activeStep - 1
            };
        case "form-value":
            return {
                ...state,
                formValues: {
                    ...state.formValues,
                    [action.name]: {
                        ...state.formValues[action.name],
                        value: action.fieldValue
                    }
                }
            };

        default:
            return state;
    }
}

export function StepsProvider({ children }: ProviderProps) {
    const [{ activeStep, formValues }, dispatch] = useReducer(reducer, {
        activeStep: 0,
        formValues: {}
    });

    // Proceed to next step
    const handleNext = useCallback(() => dispatch({ type: "increase" }), []);
    // Go back to prev step
    const handleBack = useCallback(() => dispatch({ type: "decrease" }), []);

    // Handle form change
    const handleChange = useCallback(
        (event) => {
            const { type, name, value } = event.target;
            console.log(event.target.value)
            dispatch({ type: "form-value", name, value });
        },
        []
    );

    const contextValue = useMemo(
        () => ({
            activeStep,
            formValues,
            handleChange,
            handleNext,
            handleBack
        }),
        [activeStep, formValues, handleChange, handleNext, handleBack]
    );

    return (
        <ApplicantContext.Provider value={contextValue}>
            {/*<div>{children}</div>*/}
            {children}
        </ApplicantContext.Provider>
    );
}
