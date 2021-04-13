import {GraphQLClient} from "graphql-request";

const actionAddNewUser = (login, token) => ({type: 'ADD_NEW_USER', login, token})
const actionFailedRegistration = (error) => ({type: 'REGISTRATION_ERROR', error})

const actionSuccessLogin = (login, token) => ({type: 'LOGIN_USER', login, token})
const actionFailedLogin = (error) => ({type: 'LOGIN_ERROR', error})

export const actionLogOut = () => ({type: 'LOG_OUT'})

export const actionValidationError = (errors) => ({type: 'VALIDATION_ERROR', validationErrors: errors})

async function postNewUser(user) {
    const response = await fetch('http://localhost:4000/register', {
        method: 'POST',
        headers: {
            "Content-type": "application/json",
            "accept": "application/json"
        },
        body: JSON.stringify({
            user: user
        })
    })
    return response
}

async function postLoginUser(user) {
    const response = await fetch('http://localhost:4000/login', {
        method: 'POST',
        headers: {
            "Content-type": "application/json",
            "accept": "application/json"
        },
        body: JSON.stringify({
            user: user
        })
    })
    return response
}

export const actionRegister = (user, history) => async (dispatch) => {
    try {
        const res = await postNewUser(user)
        if (res.status === 200) {
            dispatch(actionAddNewUser(user.login, await res.json()))
            history.push('/meal')
        }
        else if(res.status === 422) {
            dispatch(actionValidationError(await res.json()))
        }
        else if (res.status === 500) {
            dispatch(actionFailedRegistration("Ошибка сервера"))
        }
        else {
            dispatch(actionFailedRegistration("Что-то пошло не так"))
        }
    }
    catch (e) {
        alert(e.message)
        throw e
    }
}

export const actionLogin = (user, history) => async (dispatch) => {
    try {
        const res = await postLoginUser(user)
        if (res.status === 200) {
            dispatch(actionSuccessLogin(user.login, await res.json()))
            history.push('/meal')
        }
        else if(res.status === 422) {
            dispatch(actionValidationError(await res.json()))
        }
        else if (res.status === 500) {
            dispatch(actionFailedLogin("Ошибка сервера"))
        }
        else {
            dispatch(actionFailedLogin("Что-то пошло не так"))
        }
    }
    catch (e) {
        alert(e.message)
        throw e
    }
}
