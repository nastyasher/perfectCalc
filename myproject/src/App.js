import React, {useState, useReducer, useEffect} from 'react';
import logo from '../src/favicon.ico';
import './App.css';

import {BrowserRouter as Router, Route, Redirect, Link, withRouter} from 'react-router-dom';
import {createBrowserHistory as createHistory} from 'history'
import ReactDOM from 'react-dom';
import Favicon from 'react-favicon';
import {Provider, connect} from 'react-redux';
import {createStore, combineReducers, applyMiddleware} from 'redux';
import {
    actionSearch,
    actionAddProduct,
    actionRemoveProduct,
    actionSetQuantity,
    actionCreateMeal,
} from "./action";

import thunk from "redux-thunk";
import {Table} from 'react-bootstrap';
import {Button} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import {GraphQLClient} from "graphql-request";
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import $ from 'jquery';
import Popper from 'popper.js';
import 'bootstrap/dist/js/bootstrap.js';
import {LoginForm} from "./login/forma"
import {CNewProduct, NewProduct} from "./newProduct/productForm"
import {reducerAuth} from "./login/reducerAuth"
import {reducerMain} from "./reducers/index"
import {actionRegister, actionLogin, actionLogOut} from "./login/action";
import storage from 'redux-persist/lib/storage'
import {persistReducer, persistStore} from "redux-persist";
import { PersistGate } from 'redux-persist/integration/react'


ReactDOM.render(
    <div>
        <Favicon
            url="https://i.pinimg.com/favicons/6a3eb788a704b4d0423eda950a0499b984267ffc59a139be61f259c4.ico?98272d68f7b3f2b795d84c431fd49077"/>
    </div>

    , document.getElementById('root'));

const SearchProduct = withRouter (({actionAddProduct, actionSearch, products, newMeal=[]}) => {
    // console.log(products)
    return (
        <div className="search-product">
            <div className="search-add ">
                <input placeholder={"Введите продукт"} onChange={e => actionSearch(e.target.value)}/>
                <Link  type="button" className="btn btn-plus btn-success" to='/product'> + </Link>
            </div>
            <div style={{display: products.length > 0 ? "" : "none", color:"white"}} id="search_box-result">Результат поиска<br/>
                <TableSearch onAdd={actionAddProduct}
                             products={products}/></div>

        </div>
    )
})
const CSearchProducts = connect(
    state => ({products: state.storeMain.searchProducts || [], newMeal: state.storeMain.newMeal}),
    {actionAddProduct, actionSearch}
)(SearchProduct)
const NewMeal = withRouter (({ history, newMeal, actionCreateMeal, actionLogOut, login}) => {
    const meals = ["Завтрак", "Обед", "Ужин", "Перекус"]
    return (
        <div>
            <div className="page-header">
                <div className="log-out">
                    <button className="button-log-out btn btn-outline-success text-white" onClick={() => {
                        actionLogOut()
                        history.push("./login")
                    }}>Выйти</button>
                </div>
                <div className="hello-text text-white">Приветствуем, {login}</div>
            </div>
            <div className="new-meal btn-group">
                <button type="button" className="btn btn-success dropdown-toggle" data-toggle="dropdown"
                        aria-haspopup="true" aria-expanded="false">
                    {newMeal || "Выбрать прием пищи"}
                </button>
                <div className="dropdown-menu">
                    {meals.map((meal, i) => <div onClick={() => {
                        actionCreateMeal(meal)
                    }} key={i} className="dropdown-item"
                                               href="#">{meal}</div>)}
                </div>
            </div>
            <CSearchProducts/>
            <CMealProducts/>
        </div>

    )

})


const RowSearch = ({title, calories, proteins, fats, carbohydrates, onAdd}) =>
    <tr onClick={onAdd}>
        <td>{title}</td>
        <td>{calories}</td>
        <td>{proteins}</td>
        <td>{fats}</td>
        <td>{carbohydrates}</td>
        <td>
            <input type="checkbox" />
        </td>
    </tr>


const TableSearch = ({products, onAdd}) => {
    console.log(products)
    return (<table className="text-white table-responsive-md table-dark table table-bordered table-striped table-hover">
        <thead>
        <tr className="table-success">
            <th scope="col">Название продукта</th>
            <th scope="col">Калории</th>
            <th scope="col">Белки</th>
            <th scope="col">Жиры</th>
            <th scope="col">Углеводы</th>
            <th scope="col">Выбрать</th>
        </tr>
        </thead>
        <tbody>
        {products.map((product, i) => <RowSearch key={i}
                                                 onAdd={() => onAdd({...product})} {...product}/>)}
        </tbody>
    </table>);
}

const SumMeal = ({products}) => {
    const sumCal = products.reduce(function (prev, curr) {
        return prev + +curr.calories * +curr.quantity / 100
    }, 0);
    const sumProt = products.reduce(function (prev, curr) {
        return prev + +curr.proteins * +curr.quantity / 100
    }, 0);
    const sumFat = products.reduce(function (prev, curr) {
        return prev + +curr.fats * +curr.quantity / 100
    }, 0);
    const sumCarbo = products.reduce(function (prev, curr) {
        return prev + +curr.carbohydrates * +curr.quantity / 100
    }, 0);
    const sumQuantity = products.reduce(function (prev, curr) {
        return prev + +curr.quantity
    }, 0);

    return (
        <tfoot>
        <tr>
            <td>Всего</td>
            <td>{sumCal}</td>
            <td>{sumProt}</td>
            <td>{sumFat}</td>
            <td>{sumCarbo}</td>
            <td>{sumQuantity}</td>
            <td></td>
        </tr>
        </tfoot>
    )
}
const TableMeal = ({onRemove, actionSetQuantity, products = [], newMeal, authToken}) => {
    console.log(products, newMeal)
    return (
        <div style={{display: products.length > 0 ? "" : "none", color:"white"}}> Дневник питания
            <table className="text-white table-responsive-md table-dark table table-bordered table-striped table-hover">
                <thead>
                <tr className="table-success">
                    <th className="table-danger" scope="col">Название продукта</th>
                    <th type="number" scope="col">Калории</th>
                    <th scope="col">Белки</th>
                    <th scope="col">Жиры</th>
                    <th scope="col">Углеводы</th>
                    <th scope="col">Количество</th>
                    <th scope="col">Удалить</th>
                </tr>
                </thead>
                <tbody>
                {products.map((product, i) => <RowMeal key={i} actionSetQuantity={actionSetQuantity}
                                                       onRemove={onRemove} {...product}/>)}
                </tbody>
                <SumMeal products={products}/>
            </table>
            <button onClick={() => postNewMeal(newMeal, products, authToken)} type="button" className="btn btn-success">Сохранить
            </button>
        </div>
    )
}
const RowMeal = ({title, id, calories, proteins, fats, carbohydrates, quantity, actionSetQuantity, onRemove}) =>
    <tr>
        <td>{title}</td>
        <td>{(calories * quantity) / 100}</td>
        <td>{(proteins * quantity) / 100}</td>
        <td>{(fats * quantity) / 100}</td>
        <td>{(carbohydrates * quantity) / 100}</td>
        <td><input className="quantity" type="number" value={+quantity} onChange={e => actionSetQuantity(id, e.target.value)}/></td>
        <td>
            <button onClick={() => onRemove(id)}>x</button>
        </td>

    </tr>

const MealProducts = ({onRemove, products, actionSetQuantity, newMeal, authToken}) => {
    return (
        <div>
            <div id="meal_box-result"><TableMeal authToken={authToken} newMeal={newMeal} onRemove={onRemove}
                                                 actionSetQuantity={actionSetQuantity} products={products}/></div>
        </div>
    )
}




const CMealProducts = connect(
    state => ({products: state.storeMain.mealProducts, newMeal: state.storeMain.newMeal, authToken: state.storeLog.user.authToken}),
    {onRemove: actionRemoveProduct, actionSetQuantity}
)(MealProducts)

const CNewMeal = connect(
    state => ({newMeal: state.storeMain.newMeal, login: state.storeLog.user.username}),
    {actionCreateMeal, actionLogOut}
)(NewMeal)

const CUser = connect(
    state => ({user: state.storeLog.user}),
    {actionRegister, actionLogin})
(LoginForm)

const RootComponent = () =>
    <Router history = {createHistory()}>
        <div>
            <Route path="/meal" component = {CNewMeal} />
            {/*<Route path="/search" component = {CSearchProducts} />*/}
            <Route path="/mealProducts" component = {CMealProducts} />
            <Route path="/login" component = {CUser} />
            <Route path="/product" component = {CNewProduct} />
            <Redirect from="/" to={store.getState().storeLog.user.isAuthenticated ? '/meal' : '/login'} />
            <Redirect from="/login" to={store.getState().storeLog.user.isAuthenticated ? '/meal' : '/login'} />
        </div>
    </Router>

async function postNewMeal(newMeal, products, authToken) {
    const response = await fetch('http://localhost:4000/meal', {
        method: 'POST',
        headers: {
            "Content-type": "application/json",
            "accept": "application/json"
        },
        body: JSON.stringify({
            title: newMeal,
            products: products,
            token: authToken
        })
    })

    console.log(await response.json())
    return true;
}

const persistConfig = {
    key: 'root',
    storage,
}
const persistedReducerAuth = persistReducer(persistConfig, reducerAuth)
const reducers = combineReducers({ //создаем функцию-обертку, которая запустит последовательно counterReducer и booleanReducer передав им ветви c и b хранилища и обновив эти же ветви в случае нового состояния.
    storeMain: reducerMain,
    storeLog: persistedReducerAuth
})

const store = createStore(reducers, applyMiddleware(thunk));
const persistor = persistStore(store)


store.subscribe(() => console.log(store.getState()))
export default () => {
    return (
        // <Provider store={combineReducers({store, reducerAuth})}>
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>

                <RootComponent/>
                 {/*<Router>*/}
                 {/*    <Route path="/meal" component={} />*/}
                 {/*</Router>*/}
            </PersistGate>
         </Provider>
    )
}
