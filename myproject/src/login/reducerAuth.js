import {applyMiddleware, createStore} from "redux";
import thunk from "redux-thunk";

export let reducerAuth = (state = {user: {isAuthenticated: false}}, {type, error, login, token, validationErrors}) => {

    if (type === 'ADD_NEW_USER') {
        return {...state, user: {username: login, isAuthenticated: true, authToken: token}}
    }
    if (type === 'REGISTRATION_ERROR') {
        return {...state, error, user: {isAuthenticated: false}}
    }
    if (type === 'LOGIN_USER') {
        return {...state, user: {username: login, isAuthenticated: true, authToken: token}}
    }
    if (type === 'LOGIN_ERROR') {
        alert(error)
        return {...state, user: {isAuthenticated: false}};
    }
    if (type === 'LOG_OUT') {
        return {...state, user: {isAuthenticated: false, authToken: null}};
    }
    if (type === 'VALIDATION_ERROR') {
        alert(validationErrors.map(({message}) => `${message}`).join("\n"))
    }
    return state
}