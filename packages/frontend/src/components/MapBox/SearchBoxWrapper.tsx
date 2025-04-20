import React from 'react';
import {SearchBox as RawSearchBox} from '@mapbox/search-js-react';
import {SearchBoxProps} from "@mapbox/search-js-react/dist/components/SearchBox";

const SearchBox = RawSearchBox as unknown as React.FC<SearchBoxProps>;

const SearchBoxWrapper: React.FC<SearchBoxProps> = (props) => {
    return <SearchBox {...props} />;
};

export default SearchBoxWrapper;
