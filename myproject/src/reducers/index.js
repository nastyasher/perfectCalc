import {applyMiddleware, createStore} from "redux";
import thunk from "redux-thunk";

export const reducerMain = (state = {
    mealProducts: [],
    newMeal: {},
    newProduct: {}, meals: []
}, {newMeal, newProduct, type, searchProducts, id, quantity, mealProduct, error, products, authToken, meals, date}) => {
    if (type === 'SEARCH_SUCCESS') {
        return {...state, searchProducts}
    }
    if (type === 'SEARCH_ERROR') {
        return {...state, error}
    }
    if (type === 'SET_QUANTITY') {
        const mealProducts = state.mealProducts.map(
            product => product.id === id ? {...product, quantity: quantity} : product
        )
        return {...state, mealProducts}
    }
    if (type === 'SET_MEAL_TITLE') {
        return {...state, newMeal: newMeal}
    }
    if (type === 'CREAT_PRODUCT') {
        return {...state, newMeal: newMeal, mealProducts: products, authToken: authToken}
    }
    if (type === 'CREAT_PRODUCT_ERROR') {
        return {...state, error}
    }
    if (type === 'CREAT_MEAL') {
        return {...state, newProduct: newProduct, date:date}
    }
    if (type === 'MEAL_PRODUCT_ADD') {
        return {...state, mealProducts: [...state.mealProducts, {...mealProduct, quantity: 100}], searchProducts: []}
    }
   if (type === 'REMOVE_PRODUCT') {
        const mealProducts = state.mealProducts.filter((item) => item.id !== id)
        return {...state, mealProducts}
    }
    if (type === 'CREAT_HISTORY') {
        console.log(meals)
        return {...state, meals: meals}
    }
    if (type === ' HISTORY_ERROR') {
        return {...state, error}
    }
    return state;
}
