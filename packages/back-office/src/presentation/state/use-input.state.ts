import {useState} from 'react';

export const useInputState = () => {
    const [inputValue, setInputValue] = useState('');

    return {
        inputValue,
        setInputValue,
    };
};
