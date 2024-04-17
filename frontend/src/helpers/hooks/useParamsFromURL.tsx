import { useSearchParams } from 'react-router-dom';

export const useParamsFromURL = () => {
    const [searchParams] = useSearchParams();

    const searchParamsToObject = (params: URLSearchParams) => {
        const result: Record<string, string> = {};
        params.forEach((value, key) => {
            result[key] = value;
        });
        return result;
    };

    return searchParamsToObject(searchParams)
}