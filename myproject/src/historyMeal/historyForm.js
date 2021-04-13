import React from "react";
import {connect} from "react-redux";
import {actionRemoveProduct, actionSetQuantity} from "../action";

const TableMeal = ({onRemove, actionSetQuantity, products, newMeal}) => {
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
            <button onClick={() => postNewMeal(newMeal, products)} type="button" className="btn btn-success">Сохранить
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

const MealProducts = ({onRemove, products, actionSetQuantity, newMeal}) => {
    return (
        <div>
            <div id="meal_box-result"><TableMeal newMeal={newMeal} onRemove={onRemove}
                                                 actionSetQuantity={actionSetQuantity} products={products}/></div>
        </div>
    )
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

const CMealProducts = connect(
    state => ({products: state.mealProducts, newMeal: state.newMeal}),
    {onRemove: actionRemoveProduct, actionSetQuantity}
)(MealProducts)