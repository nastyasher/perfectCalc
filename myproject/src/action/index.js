import {GraphQLClient} from "graphql-request";
import {actionValidationError} from "../login/action"

const actionSuccessSearch = (products) => ({type: 'SEARCH_SUCCESS', searchProducts: products})
const actionFailedSearch = (error) => ({type: 'SEARCH_ERROR', error})

export const actionAddProduct = (product) => ({type: 'MEAL_PRODUCT_ADD', mealProduct: product})
export const actionSetQuantity = (id, quantity) => ({type: 'SET_QUANTITY', id, quantity: +quantity})
export const actionRemoveProduct = (id) => ({type: 'REMOVE_PRODUCT', id})
export const actionCreateMeal = (newMeal) => ({type: 'CREATE_MEAL', newMeal})
export const actionCreatProduct = (newProduct) => ({type:'CREAT_PRODUCT', newProduct})
const actionFailedCreatProduct = (error) => ({type: 'CREAT_PRODUCT_ERROR', error})

export const actionSearch = (searchText) => async (dispatch) => {
    try {
        dispatch(actionSuccessSearch((await requestFind(searchText)).searchProducts))
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

const gql = new GraphQLClient('http://localhost:4000/graphql')

async function requestFind(text) {
    return await gql.request(`
        {
            searchProducts(title:"${text}"){
                title, id, calories, proteins, fats, carbohydrates
            }
        }`
    )
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