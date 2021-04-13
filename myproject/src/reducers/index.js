import {applyMiddleware, createStore} from "redux";
import thunk from "redux-thunk";

export const reducerMain = (state = {
    mealProducts: [],
    newMeal: "",
    newProduct: {}
}, {newMeal, newProduct, type, searchProducts, id, quantity, mealProduct, error}) => {
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
    if (type === 'CREATE_MEAL') {
        return {...state, newMeal: newMeal}
    }
    if (type === 'CREAT_PRODUCT') {
        return {...state, newProduct: newProduct}
    }
    if (type === 'CREAT_PRODUCT_ERROR') {
        return {...state, error}
    }
    if (type === 'MEAL_PRODUCT_ADD') {
        return {...state, mealProducts: [...state.mealProducts, {...mealProduct, quantity: 100}], searchProducts: []}
    }
   if (type === 'REMOVE_PRODUCT') {
        const mealProducts = state.mealProducts.filter((item) => item.id !== id)
        return {...state, mealProducts}
    }
    return state;
}
