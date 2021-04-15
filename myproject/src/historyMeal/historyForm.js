import React, {useState} from "react";
import {connect} from "react-redux";
import {actionAddHistory, actionRemoveProduct, actionSetMealTitleAndDate, actionSetQuantity} from "../action";
import DatePicker from "react-datepicker";
// import withRouter from "react-router-dom";

export const TableHistory = ({meals, actionAddHistory, authToken}) => {
    const [date, setDate] = useState(new Date());
    return (
        <div className="meal">История приемов пищи
            <div className="btn-group">
                <button type="button" className="btn btn-success dropdown-toggle" data-toggle="dropdown"
                        aria-haspopup="true" aria-expanded="false">
                    {new Intl.DateTimeFormat().format(date) || "Выбрать дату"}
                </button>
                <div className="dropdown-menu">
                    <DatePicker selected={date} onChange={date => {
                        setDate(date)
                        actionAddHistory(authToken, date)
                    }} />
                </div>
            </div>
            <table className="text-white table-responsive table-dark table table-bordered table-striped table-hover">
                <tbody>
                    {meals.map((meal, i) =>
                        <>
                            <tr><td key={i}>{meal.title}</td></tr>
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
        </div>
    )}
const RowMeal = ({product:{title, calories, proteins, fats, carbohydrates}, quantity}) =>
    <tr>
        <td>{title}</td>
        <td>{(calories * quantity) / 100}</td>
        <td>{(proteins * quantity) / 100}</td>
        <td>{(fats * quantity) / 100}</td>
        <td>{(carbohydrates * quantity) / 100}</td>
        <td className="quantity" >{quantity}</td>
    </tr>
const TotalMeal = ({title, totalCalories, totalCarbohydrates, totalFats, totalProteins, quantity}) =>
    <tr>
        <td>Всего за {title} </td>
        <td>{totalCalories}</td>
        <td>{totalProteins}</td>
        <td>{totalFats}</td>
        <td>{totalCarbohydrates}</td>
        <td>{quantity.reduce((a, b) => (a + b))}</td>
    </tr>
const TotalMeals = ({meals}) =>
    <tr>
        <td>Всего за день</td>
        <td>{Math.round(meals.reduce((a, meal) => a+(+meal.totalCalories), 0))}</td>
        <td>{Math.round(meals.reduce((a, meal) => a+(+meal.totalProteins), 0))}</td>
        <td>{Math.round(meals.reduce((a, meal) => (a + (+meal.totalFats)), 0))}</td>
        <td>{Math.round(meals.reduce((a, meal) => (a + (+meal.totalCarbohydrates)), 0))}</td>
        <td>{meals.map(meal => meal.mealProducts.reduce((a, mealProduct) => (a + mealProduct.quantity), 0)).reduce((a,b) => (a+b), 0)}</td>
    </tr>


// const SumMeal = ({products}) => {
//     return (
//         <tfoot>
//         <tr>
//             <td>Всего</td>
//             <td>{totalCalories}</td>
//             <td>{totalProteins}</td>
//             <td>{totalFats}</td>
//             <td>{totalCarbohydrates}</td>
//             <td>{totalQuantity}</td>
//             <td></td>
//         </tr>
//         </tfoot>
//     )
// }

export const CHistory = connect(
    state => ({authToken: state.storeLog.user.authToken, meals: state.storeMain.meals}),
    {onRemove: actionRemoveProduct, actionSetQuantity, actionAddHistory}
)(TableHistory)