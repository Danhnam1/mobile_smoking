import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "./config";

/**
 * Retrieves the headers for an API request.
 * Includes the Authorization header with a bearer token if required.
 * @param {boolean} isAuth - Whether the request requires authentication.
 * @returns {Promise<Object>} The headers object.
 */
const getHeaders = async (isAuth = true) => {
    const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
    };
    if (isAuth) {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
    }
    return headers;
};

/**
 * Handles the response from a fetch request.
 * Parses the JSON body and throws an error if the response is not ok.
 * @param {Response} response - The response object from a fetch call.
 * @returns {Promise<any>} The parsed JSON data from the response body.
 */
const handleResponse = async (response) => {
    // If the response is successful, parse and return the JSON.
    if (response.ok) {
        // Handle cases where response might be empty
        const text = await response.text();
        return text ? JSON.parse(text) : {};
    }
    
    // If response is not ok, attempt to parse a structured error message.
    let errorMessage = `Lỗi mạng: ${response.status}`;
    try {
        const errorData = await response.json();
        errorMessage = errorData.message || JSON.stringify(errorData);
    } catch (error) {
        // If the body isn't JSON, use the status text as a fallback.
        errorMessage = response.statusText || errorMessage;
    }
    
    // Display the error to the user and throw it to stop the execution flow.
    Alert.alert('Lỗi', errorMessage);
    throw new Error(errorMessage);
};

/**
 * Performs a POST request.
 * @param {{ url: string, payload: any, isAuth?: boolean }} params - The request parameters.
 * @returns {Promise<any>} The response data.
 */
const post = async ({ url, payload, isAuth = true }) => {
    const headers = await getHeaders(isAuth);
    const body = JSON.stringify(payload);
    
    const fullUrl = `${API_BASE_URL}${url}`;

    const response = await fetch(fullUrl, {
        method: "POST",
        headers,
        body,
    });
    
    return handleResponse(response);
};

/**
 * Performs a GET request.
 * @param {{ url: string, isAuth?: boolean }} params - The request parameters.
 * @returns {Promise<any>} The response data.
 */
const get = async ({ url, isAuth = true }) => {
    const headers = await getHeaders(isAuth);
    
    const fullUrl = `${API_BASE_URL}${url}`;
    console.log('[API Call] GET:', fullUrl); // DEBUG: Log the full URL

    const response = await fetch(fullUrl, {
        method: "GET",
        headers,
    });
    
    return handleResponse(response);
};

export const BaseService = {
    post,
    get,
}; 