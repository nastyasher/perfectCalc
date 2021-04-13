import React, {useEffect, useRef, useState} from "react";
import {connect} from "react-redux";
import {actionAddNewProduct} from "../action";

export const NewProduct = ({actionAddNewProduct}) => {

    const [newProduct, setNewProduct] = useState({title:"", calories:"", proteins:"", fats:"", carbohydrates:""});
    return     <div className="new-product-block">
        <h3 className="new-product-title">Добавьте ваш продукт</h3>
        <form className="row new-product" onSubmit={(e) => {
            e.preventDefault()
            actionAddNewProduct(newProduct)
        }}>
            <div className="col-12">
                <input type="text" onChange={e => setNewProduct({...newProduct, title: e.target.value})} className="form-control new-product-input title" placeholder="Название продукта"/>
                <div className="error text-danger error-prod" style={{display: newProduct.title.length < 5 ? "" : "none"}}> Введите не менее 5 символов </div>
            </div>
            <div className="col-12 col-md-6">
                <input type="number" step="0.01" onChange={e => setNewProduct({...newProduct, calories: e.target.value})} className="form-control new-product-input" placeholder="Калории"/>
                <div className="error text-danger error-prod" style={{display: newProduct.calories.length < 1 || newProduct.calories.length > 5 ? "" : "none"}}> Введите корректные калории </div>
            </div>
            <div className="col-12 col-md-6">
                <input type="number" step="0.01" onChange={e => setNewProduct({...newProduct, proteins: e.target.value})} className="form-control new-product-input" placeholder="Белки"/>
                <div className="error text-danger error-prod" style={{display: newProduct.proteins.length < 1 || newProduct.proteins.length > 5 ? "" : "none"}}> Введите корректные белки </div>
            </div>
            <div className="col-12 col-md-6">
                <input type="number" step="0.01" onChange={e => setNewProduct({...newProduct, fats: e.target.value})} className="form-control new-product-input" placeholder="Жиры"/>
                <div className="error text-danger error-prod" style={{display: newProduct.fats.length < 1 || newProduct.fats.length > 5 ? "" : "none"}}> Введите корректные жиры </div>
            </div>
            <div className="col-12 col-md-6">
                <input type="number" step="0.01" onChange={e => setNewProduct({...newProduct, carbohydrates: e.target.value})} className="form-control new-product-input" placeholder="Углеводы"/>
                <div className="error text-danger error-prod" style={{display: newProduct.carbohydrates.length < 1 || newProduct.carbohydrates.length > 5 ? "" : "none"}}> Введите корректные углеводы </div>
            </div>
            <div className="col-6 col-md-6 product-button">
                <button type="submit" className="btn-new-product btn btn-success">Сохранить</button>
            </div>
        </form>

</div>
}

export const CNewProduct = connect(
    state => ({newProduct: state.newProduct}),
    {actionAddNewProduct}
)(NewProduct)