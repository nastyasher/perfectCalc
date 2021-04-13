import React, {useState, useRef, useEffect} from "react";
// import {actionRegister, actionLogin} from "./action";
import {withRouter} from 'react-router-dom'

export const LoginForm = withRouter (({ history, actionRegister, actionLogin}) => {
    const [newUser, setNewUser] = useState({login:"", password:"", repeatPassword:"", age:"", weight:"", height:""});
    const [userIsRegistered, setUserIsRegistered] = useState(false)
    return <div className="form-login">
        <form onSubmit={e => {
            e.preventDefault()
            const user = {
                login: newUser.login,
                password: newUser.password,
                age: newUser.age || 0,
                weight: newUser.weight || 0,
                height: newUser.height || 0
            }
            if (userIsRegistered) {
                actionLogin(user, history)
            } else {
                actionRegister(user, history)
            }

        }}  className="login-form">
            <div className="row">
                <div className="col-md-12 col-lg-4 form-group">
                    <label className="text-login" htmlFor="exampleInputLogin">Логин</label>
                    <input  onChange={e => setNewUser({...newUser, login: e.target.value})} type="text" className="login form-control" id="exampleInputLogin" aria-describedby="loginHelp"
                           placeholder="Ваш логин"/>
                    <div className="error text-danger" style={{display: newUser.login.length < 5 ? "" : "none"}}> Введите логин не короче 5 символов </div>
                </div>
                <div className="col-md-12 col-lg-4 form-group">
                    <label className="text-login" htmlFor="exampleInputPassword1">Пароль</label>
                    <input onChange={e => setNewUser({...newUser, password: e.target.value})} type="password" className="password form-control" id="exampleInputPassword1" placeholder="Ваш пароль"/>
                    <div className="error text-danger" style={{display: newUser.password.length < 5 ? "" : "none"}}> Введите пароль не короче 5 символов </div>
                </div>
                <div className="col-md-12 col-lg-4 group-reg form-group" style={{display: userIsRegistered ? "none" : ""}}>
                    <label className="text-login" htmlFor="exampleInputPassword2">Повторите пароль</label>
                    <input onChange={e => setNewUser({...newUser, repeatPassword: e.target.value})} type="password" className="password-repeat form-control" id="exampleInputPassword2" placeholder="Пароль"/>
                    <div className="error text-danger" style={{display: newUser.password !== newUser.repeatPassword  ? "" : "none"}}> Пароли не совпадают   </div>
                </div>
            </div>
            <div className="row">
                <div className="col-md-12 col-lg-4 form-group group-reg" style={{display: userIsRegistered ? "none" : ""}}>
                    <label className="text-login" htmlFor="exampleInputPassword3">Возраст</label>
                    <input type="text" onChange={e => setNewUser({...newUser, age: e.target.value})} className="age form-control" id="exampleInputPassword3" placeholder="Ваш возраст"/>
                </div>
                <div className="col-md-12 col-lg-4 form-group group-reg" style={{display: userIsRegistered ? "none" : ""}}>
                    <label className="text-login" htmlFor="exampleInputPassword4">Рост</label>
                    <input type="text" onChange={e => setNewUser({...newUser, height: e.target.value})} className="height form-control" id="exampleInputPassword4" placeholder="Ваш рост"/>
                </div>
                <div className="col-md-12 col-lg-4 form-group group-reg" style={{display: userIsRegistered ? "none" : ""}}>
                    <label className="text-login" htmlFor="exampleInputPassword5">Вес</label>
                    <input type="text" onChange={e => setNewUser({...newUser, weight: e.target.value})} className="weight form-control" id="exampleInputPassword5" placeholder="Ваш вес"/>
                </div>
            </div>
            <div className="form-check">
                <input type="checkbox" className="form-check-input" id="exampleCheck1" onChange={e => setUserIsRegistered(!userIsRegistered)}/>
                    <label className="form-check-label text-white" htmlFor="exampleCheck1"> Я уже зарегестрирован</label>
            </div>
            <div className="button-log">
                <button type="submit" className="btn-log btn btn-success" disabled={newUser.login.length < 5 || newUser.password.length <5} style={{display: userIsRegistered ? "" : "none"}}>Войти</button>
                <button type="submit" className="btn-reg group-reg btn btn-success"   style={{display: userIsRegistered ? "none" : ""}}>Регистрация</button>
            </div>
        </form>
    </div>
})

//disabled={newUser.login.length < 5 || newUser.password.length <5 || newUser.password !== newUser.repeatPassword}