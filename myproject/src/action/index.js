import {actionValidationError} from "../login/action"

const actionSuccessSearch = (products) => ({type: 'SEARCH_SUCCESS', searchProducts: products})
const actionFailedSearch = (error) => ({type: 'SEARCH_ERROR', error})

export const actionAddProduct = (product) => ({type: 'MEAL_PRODUCT_ADD', mealProduct: product})
export const actionSetQuantity = (id, quantity) => ({type: 'SET_QUANTITY', id, quantity: +quantity})
export const actionRemoveProduct = (id) => ({type: 'REMOVE_PRODUCT', id})
export const actionSetMealTitleAndDate = (newMeal) => ({type: 'SET_MEAL_TITLE', newMeal})
const actionCreatMeal = (newMeal, products, authToken, date) => ({type: "CREAT_MEAL", newMeal, products, authToken, date})
const actionFailedCreateMeal = (error) => ({type: 'CREAT_MEAL_ERROR', error})
export const actionCreatProduct = (newProduct) => ({type:'CREAT_PRODUCT', newProduct})
const actionFailedCreatProduct = (error) => ({type: 'CREAT_PRODUCT_ERROR', error})

const actionCreatHistory = (meals) => ({type: 'CREAT_HISTORY', meals})
const actionFailedCreatHistory = (error) => ({type: 'HISTORY_ERROR', error})

export const actionSearch = (searchText) => async (dispatch) => {
    try {
        dispatch(actionSuccessSearch((await requestFind(searchText))))
    }
    catch (e) {
        dispatch(actionFailedSearch(e))
    }
}

export const actionAddNewProduct = (newProduct) => async (dispatch) => {
    try {
        const res = await postNewProduct(newProduct)
        if (res.status === 200) {
            dispatch(actionCreatProduct(newProduct))
        }
        else if (res.status === 422) {
            dispatch(actionValidationError(await res.json()))
        }
        else if (res.status === 500) {
            dispatch(actionFailedCreatProduct("Ошибка сервера"))
        }
        else {
            dispatch(actionFailedCreatProduct("Что-то пошло не так"))
        }
    }
    catch (e) {
        alert(e.message)
        throw e
    }
}
export const actionAddNewMeal = (newMeal, products, authToken, history, date) => async (dispatch) => {
    try {
        const res = await  postNewMeal(newMeal, products, authToken)
        if (res.status === 200) {
            dispatch(actionCreatMeal(newMeal, products, authToken))
            dispatch(actionAddHistory(authToken, date))
            history.push('/history')
        }
        else if (res.status === 422) {
            dispatch(actionValidationError(await res.json()))
        }
        else if (res.status === 500) {
            dispatch(actionFailedCreateMeal("Ошибка сервера"))
        }
        else {
            dispatch(actionFailedCreateMeal("Что-то пошло не так"))
        }
    }
    catch (e) {
        alert(e.message)
        throw e
    }
}

export const actionAddHistory = (token, date) => async (dispatch) => {
    try {
        const res = await getMeals(token, date)

        const meals = await res.json()
        console.log(meals)
        if (res.status === 200) {
            dispatch(actionCreatHistory(meals))
        }
        else if (res.status === 422) {
            dispatch(actionValidationError(await res.json()))
        }
        else if (res.status === 500) {
            dispatch(actionFailedCreatHistory("Ошибка сервера"))
        }
        else {
            dispatch(actionFailedCreatHistory("Что-то пошло не так"))
        }
    }
    catch (e) {
        alert(e.message)
        throw e
    }
}

async function requestFind(text) {
    const response = await fetch('http://localhost:4000/search?text=' + text, {
        method: 'GET',
        headers: {
            "accept": "application/json"
        },
    })
    return await response.json();
}

async function postNewProduct(newProduct) {
    const response = await fetch('http://localhost:4000/product', {
        method: 'POST',
        headers: {
            "Content-type": "application/json",
            "accept": "application/json"
        },
        body: JSON.stringify({
            newProduct: newProduct
        })
    })
    return response;
}

async function postNewMeal(newMeal, products, authToken) {
    const response = await fetch('http://localhost:4000/meal', {
        method: 'POST',
        headers: {
            "Content-type": "application/json",
            "accept": "application/json"
        },
        body: JSON.stringify({
            title: newMeal.title,
            date: newMeal.date,
            products: products,
            token: authToken
        })
    })
    return response;
}

async function getMeals(token, date) {
    console.log(date)
    return await fetch('http://localhost:4000/history?date='  + date.toISOString().slice(0, 10), {
        method: 'GET',
        headers: {
            "Content-type": "application/json",
            "accept": "application/json",
            "authorization": token,
        }
    });
}

