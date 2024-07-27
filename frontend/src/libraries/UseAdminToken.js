import { useState } from 'react';

function useAdminToken() {
    // Retrieve the token from localStorage
    const getToken = () => {
        return localStorage.getItem('adminToken');
    };

    const [token, setToken] = useState(getToken());

    // Save token to localStorage and update state
    const saveToken = (userToken) => {
        localStorage.setItem('adminToken', userToken);
        setToken(userToken);
    };

    return {
        setToken: saveToken,
        token
    };
}

export default useAdminToken;
