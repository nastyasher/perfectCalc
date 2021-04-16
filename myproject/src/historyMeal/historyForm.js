import React, {useState} from "react";
import {connect} from "react-redux";
import {actionAddHistory, actionRemoveProduct, actionSetQuantity} from "../action";
import DatePicker from "react-datepicker";
import {withRouter} from "react-router-dom";

export const TableHistory = withRouter(({meals, actionAddHistory, authToken, history}) => {
    const [date, setDate] = useState(new Date());
    return (
        <div className="meal">
            <div className="meal-head">
                <h3>История приемов пищи</h3>
                <div className="btn-group">
                    <button type="button" className="btn btn-success dropdown-toggle" data-toggle="dropdown"
                            aria-haspopup="true" aria-expanded="false">
                        {new Intl.DateTimeFormat().format(date) || "Выбрать дату"}
                    </button>
                    <div className="dropdown-menu">
                        <DatePicker popperPlacement="left-start" selected={date} onChange={date => {
                            setDate(date)
                            actionAddHistory(authToken, date)
                        }} />
                    </div>
                </div>
            </div>
            <table className="text-white table table-striped table-hover table-borderless">
                <tbody className='bg-success'>
                    {meals.map((meal, i) =>
                        <>
                            <tr><td key={i}>{meal.title}</td></tr>
                            <tr className='bg-dark'>
                                <td>Продукт</td>
                                <td>Калории</td>
                                <td>Белки</td>
                                <td>Жиры</td>
                                <td>Углеводы</td>
                                <td>Количество</td>
                            </tr>
                            {meal.mealProducts.map((product, i) =>
                                <RowMeal key={i} {...product}/>)}
                            <TotalMeal {...meal} quantity={meal.mealProducts.map(product => product.quantity)}/>
                        </>
                    )}
                </tbody>
                <tfoot>
                <TotalMeals meals={meals}/>
                </tfoot>
            </table>
            <div className="d-flex justify-content-center">
                <button  type="button" className="btn add-meal btn-success" onClick={() => history.push("./meal")}>Добавить прием пищи</button>
            </div>
        </div>
    )})
const RowMeal = ({product:{title, calories, proteins, fats, carbohydrates}, quantity}) =>
    <tr className="table-success text-dark">
        <td>{title}</td>
        <td>{(calories * quantity) / 100}</td>
        <td>{(proteins * quantity) / 100}</td>
        <td>{(fats * quantity) / 100}</td>
        <td>{(carbohydrates * quantity) / 100}</td>
        <td className="quantity" >{quantity}</td>
    </tr>
const TotalMeal = ({title, totalCalories, totalCarbohydrates, totalFats, totalProteins, quantity}) =>
    <tr className="bg-dark">
        <td>Всего за {title} </td>
        <td>{totalCalories}</td>
        <td>{totalProteins}</td>
        <td>{totalFats}</td>
        <td>{totalCarbohydrates}</td>
        <td>{quantity.reduce((a, b) => (a + b))}</td>
    </tr>
const TotalMeals = ({meals}) =>
    <tr className="bg-success">
        <td>Всего за день</td>
        <td>{(meals.reduce((a, meal) => a+(+meal.totalCalories), 0)).toFixed(2)}</td>
        <td>{(meals.reduce((a, meal) => a+(+meal.totalProteins), 0)).toFixed(1)}</td>
        <td>{(meals.reduce((a, meal) => (a + (+meal.totalFats)), 0)).toFixed(1)}</td>
        <td>{(meals.reduce((a, meal) => (a + (+meal.totalCarbohydrates)), 0)).toFixed(1)}</td>
        <td>{meals.map(meal => meal.mealProducts.reduce((a, mealProduct) => (a + mealProduct.quantity), 0)).reduce((a,b) => (a+b), 0)}</td>
    </tr>

export const CHistory = connect(
    state => ({authToken: state.storeLog.user.authToken, meals: state.storeMain.meals}),
    {onRemove: actionRemoveProduct, actionSetQuantity, actionAddHistory}
)(TableHistory)