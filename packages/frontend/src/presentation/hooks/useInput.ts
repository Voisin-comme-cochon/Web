import {useState} from "react";

export const useInput = () => {
    const [inputValue, setInputValue] = useState("");

    return {
        inputValue,
        setInputValue,
    }
}