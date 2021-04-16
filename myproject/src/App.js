import React, {useState} from 'react';
import './App.css';
import {BrowserRouter as Router, Route, Redirect, Link, withRouter} from 'react-router-dom';
import {createBrowserHistory as createHistory} from 'history'
import {Provider, connect} from 'react-redux';
import {createStore, combineReducers, applyMiddleware} from 'redux';
import {
    actionSearch,
    actionAddProduct,
    actionRemoveProduct,
    actionSetQuantity,
    actionAddNewMeal,
    actionSetMealTitleAndDate,
    actionAddHistory
} from "./action";
import thunk from "redux-thunk";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.js';
import {LoginForm} from "./login/forma"
import {CNewProduct} from "./newProduct/productForm"
import {reducerAuth} from "./login/reducerAuth"
import {reducerMain} from "./reducers/index"
import {actionRegister, actionLogin, actionLogOut} from "./login/action";
import storage from 'redux-persist/lib/storage'
import {persistReducer, persistStore} from "redux-persist"
import { PersistGate } from 'redux-persist/integration/react'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
 import {CHistory} from "./historyMeal/historyForm";

const SearchProduct = withRouter (({actionAddProduct, actionSearch, products}) => {
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

const NewMeal = withRouter (({ history, actionSetMealTitleAndDate, title, actionAddHistory, authToken, actionLogOut, login}) => {
    const meals = ["Завтрак", "Обед", "Ужин", "Перекус"]
    const [date, setDate] = useState(new Date());
    return (
        <div>
            <div className="page-header">
                <div className="history-log-out">
                    <button className="button-log-out btn btn-outline-success text-white" onClick={async () => {
                        await actionAddHistory(authToken, date)
                        history.push("./history")
                    }}>История</button>
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
                    {title || "Выбрать прием пищи"}
                </button>
                <div className="dropdown-menu">
                    {meals.map((meal, i) => <div onClick={() => {actionSetMealTitleAndDate({title:meal, date:date})
                    }} key={i} className="dropdown-item">{meal}</div>)}
                </div>
            </div>
            <div className="btn-group">
                <button type="button" className="btn btn-success dropdown-toggle" data-toggle="dropdown"
                        aria-haspopup="true" aria-expanded="false">
                    {new Intl.DateTimeFormat().format(date) || "Выбрать дату"}
                </button>
                <div className="dropdown-menu">
                    <DatePicker selected={date} onChange={date => {
                        setDate(date)
                        actionSetMealTitleAndDate({title:title, date:date})
                    }} />
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
    return (<table className="text-white table-responsive-md table-dark table table-bordered table-striped table-hover">
        <thead>
        <tr className="bg-success">
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
            <td>{(+sumCal).toFixed(2)}</td>
            <td>{(+sumProt).toFixed(1)}</td>
            <td>{(+sumFat).toFixed(1)}</td>
            <td>{(+sumCarbo).toFixed(1)}</td>
            <td>{sumQuantity}</td>
            <td></td>
        </tr>
        </tfoot>
    )
}
const TableMeal = withRouter (({onRemove, actionSetQuantity, history, actionAddNewMeal, products = [], newMeal, date, authToken}) => {
    return (
        <div style={{display: products.length > 0 ? "" : "none", color:"white"}}> Дневник питания
            <table className="text-white table-responsive-md table-dark table table-bordered table-striped table-hover">
                <thead>
                <tr className="bg-success">
                    <th  scope="col">Название продукта</th>
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
            <button onClick={() => {actionAddNewMeal(newMeal, products, authToken, history, newMeal.date)}} type="button" className="btn btn-success">Сохранить
            </button>
        </div>
    )
})
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

const MealProducts = ({onRemove, products, actionAddNewMeal, actionSetQuantity, newMeal, authToken}) => {
    return (
        <div>

            <div id="meal_box-result"><TableMeal authToken={authToken} newMeal={newMeal} onRemove={onRemove}
                                                 actionAddNewMeal={actionAddNewMeal} actionSetQuantity={actionSetQuantity} products={products}/></div>
        </div>
    )
}

const CMealProducts = connect(
    state => ({products: state.storeMain.mealProducts, newMeal: state.storeMain.newMeal, authToken: state.storeLog.user.authToken}),
    {onRemove: actionRemoveProduct, actionSetQuantity, actionAddNewMeal}
)(MealProducts)

const CNewMeal = connect(
    state => ({title: state.storeMain.newMeal.title, login: state.storeLog.user.username, authToken: state.storeLog.user.authToken}),
    {actionAddNewMeal, actionSetMealTitleAndDate, actionLogOut, actionAddHistory}
)(NewMeal)

const CUser = connect(
    state => ({user: state.storeLog.user}),
    {actionRegister, actionLogin})
(LoginForm)

const RootComponent = () =>
    <Router history = {createHistory()}>
        <div>
            <Route path="/meal" component = {CNewMeal} />
            <Route path="/mealProducts" component = {CMealProducts} />
            <Route path="/login" component = {CUser} />
            <Route path="/product" component = {CNewProduct} />
            <Route path="/history" component = {CHistory} />
            <Redirect from="/" to={store.getState().storeLog.user.isAuthenticated ? '/meal' : '/login'} />
            <Redirect from="/login" to={store.getState().storeLog.user.isAuthenticated ? '/meal' : '/login'} />
        </div>
    </Router>


const persistConfig = {
    key: 'root',
    storage,
}
const persistedReducerAuth = persistReducer(persistConfig, reducerAuth)
const reducers = combineReducers({
    storeMain: reducerMain,
    storeLog: persistedReducerAuth
})

const store = createStore(reducers, applyMiddleware(thunk));
const persistor = persistStore(store)

store.subscribe(() => console.log(store.getState()))
export default () => {
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <RootComponent/>
            </PersistGate>
         </Provider>
    )
}
