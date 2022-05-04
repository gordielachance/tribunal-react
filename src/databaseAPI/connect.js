//https://blog.microideation.com/2021/11/29/automate-oauth-refresh-token-flow-using-axios-interceptors-in-reactjs-react-native-or-javascript/
//https://blog.liplex.de/axios-interceptor-to-refresh-jwt-token-after-expiration/
//https://gist.github.com/paulsturgess/ebfae1d1ac1779f18487d3dee80d1258

import axios from 'axios';
import {WP_URL,DEBUG} from "../Constants";

// Define the constants
const WP_REST_URL = WP_URL + '/wp-json';
// Define defaults
const databaseAPI = axios.create({
    baseURL: WP_REST_URL,
    withCredentials:false
});

export {databaseAPI};
