//https://blog.microideation.com/2021/11/29/automate-oauth-refresh-token-flow-using-axios-interceptors-in-reactjs-react-native-or-javascript/
//https://blog.liplex.de/axios-interceptor-to-refresh-jwt-token-after-expiration/
//https://gist.github.com/paulsturgess/ebfae1d1ac1779f18487d3dee80d1258

import axios from 'axios';
import {STRAPI_URL,DEBUG} from "../Constants";

// Define defaults
const strapiAPI = axios.create({
    baseURL: `${STRAPI_URL}/api`,
    withCredentials:false
});

export {strapiAPI};
