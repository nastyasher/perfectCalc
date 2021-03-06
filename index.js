const {Sequelize, ValidationError, Model, DataTypes, Op} = require('sequelize');
require('dotenv').config()
const {DB_DB, DB_USER, DB_HOST, DB_PASSWORD} = process.env
const fs = require('fs')
const sequelize = new Sequelize(DB_DB, DB_USER, DB_PASSWORD, {host: DB_HOST, dialect: 'mysql'});
const bcrypt = require( 'bcrypt' );
const bodyParser = require('body-parser')
const express = require('express');
const app = express()
const cors = require('cors')
const jwt = require('jsonwebtoken');
const jwt_decode = require('jwt-decode')

app.use(express.static(__dirname + '/myproject/build'))
app.use(express.static('public'))
app.use(cors())
app.use(bodyParser.json())

app.get("/search", async (req, res, next) => {
    const text = req.query.text
    try {
        const searchProduct = await Product.findAll({
            where: {
                title: {[Op.like]: `%${text}%`}
            },
            limit: 15
        })
        res.status(200).send(JSON.stringify(searchProduct))
    }
    catch (e) {
        next(e)
    }
})

app.post("/meal", async (req, res, next) => {
    const products = req.body.products
    const user = jwt_decode(req.body.token)
    try {
        const newMeal = await Meal.create(
            {
                title: req.body.title,
                date: req.body.date,
                userId: user.id,
                mealProducts: products.map(product => ({
                    quantity: product.quantity,
                    productId: product.id,
                })),
            },
            {
                include: [
                    {
                        association: Meal.MealProducts,
                    }
                ],
            }
        )
        res.status(200).send(JSON.stringify(newMeal))
    } catch (e) {
        next(e)
    }
})
app.post("/product", async (req, res, next) => {
    const product = req.body.newProduct
    try {
        const newProduct = await Product.create(
            {
                title: product.title,
                calories: product.calories,
                proteins: product.proteins,
                fats: product.fats,
                carbohydrates: product.carbohydrates
            }
        )
        res.status(200).send(JSON.stringify(newProduct))
    } catch (e) {
        next(e)
    }
})
const privateKey = fs.readFileSync('./myproject/jwtRS256.key');

app.post("/login", async (req,res) => {
    const reqUser = req.body.user
    const user = await User.findOne( {where: {username: reqUser.login}})
    if (!user) {
        res.status(422).send(JSON.stringify([{message:"?????????????????? ??????????"}]))
        return
    }
    const token = jwt.sign( {id: user.id, login: user.username}, privateKey, { algorithm: 'RS256' });
    bcrypt.compare(reqUser.password, user.password, function(err, isMatch) {
        if (err) {
            throw err
        } else if (!isMatch) {
            res.status(422).send(JSON.stringify([{path: 'password', message: "???? ???????????? ????????????"}]))
            console.log("???? ???????????? ????????????")
        } else {
            res.status(200).send(JSON.stringify(token))
            console.log("???????????? ????????????")
        }
    })
})
app.post("/register", async (req, res, next) => {
    const reqUser = req.body.user
    try {
        const newUser = await User.create({username: reqUser.login, password: reqUser.password, weight: reqUser.weight, height: reqUser.height, age: reqUser.age });
        const token = jwt.sign( {id: newUser.id, login: newUser.username}, privateKey, { algorithm: 'RS256' });
        res.status(200).send(JSON.stringify(token))
    }
    catch (err) {
        next(err)
    }
})

app.get('/history', async (req, res) => {
    const user = jwt_decode(req.headers.authorization)
    const dateTo = new Date(req.query.date)
    dateTo.setDate(dateTo.getDate() + 1);
    res.send(
        await Meal.findAll({
            where: {
                userId: user.id,
                date: {
                    [Op.gte]: req.query.date,
                    [Op.lt]: dateTo.toISOString().slice(0, 10)
                }
            },
            order: [['date', 'ASC']],
            include: [
                {
                    model: MealProduct,
                    include: [{model: Product}]
                }
            ]
        })
    )})

app.use(function(err, req, res, next) {
    if (err instanceof ValidationError) {
        res.status(422).send(JSON.stringify(err.errors.map(error => ({path: error.path, message: error.message}))))
    } else {
        res.status(500).send("error")
        throw err
    }
});

app.listen(process.env.PORT, () => console.log("ok"))
const notNullColumn = (type) => ({allowNull: false, type})
class User extends Model {
}
User.init({
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: {args: true, msg: "???? ???????????? ???????????? ??????????"},
            len: {args: [5,30], msg: "???? ?????????? 5 ???????????????? ?? ????????????"},
        },
        unique: {
            name: true,
            msg: '?????????? ?????????? ?????? ??????????'
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: {args: true, msg: "?????????????? ????????????"},
            len: {args: [5,100], msg: "???? ?????????? 5 ???????????????? ?? ????????????"},
        },
    },
    weight: DataTypes.FLOAT,
    height: DataTypes.SMALLINT,
    age: DataTypes.TINYINT,
},
{
    hooks: {
        beforeCreate: async (user) =>
            (user.password = await bcrypt.hash(user.password, 10)),
    },
    sequelize,
    modelName: 'user'
});

class Meal extends Model {
    async save(options) {
        this.totalCalories = this.mealProducts === undefined ? 0 : await this.mealProducts.reduce(
            async function (calories, mealProduct) {
                return await calories + await mealProduct.getCalories()
            },
            Promise.resolve(0)
        );
        this.totalProteins = this.mealProducts === undefined ? 0 : await this.mealProducts.reduce(
            async function (proteins, mealProduct) {
                return await proteins + await mealProduct.getProteins()
            },
            Promise.resolve(0)
        )
        this.totalFats = this.mealProducts === undefined ? 0 : await this.mealProducts.reduce(
            async function (fats, mealProduct) {
                return await fats + await mealProduct.getFats()
            },
            Promise.resolve(0)
        )
        this.totalCarbohydrates = this.mealProducts === undefined ? 0 : await this.mealProducts.reduce(
            async function (carbohydrates, mealProduct) {
                return await carbohydrates + await mealProduct.getCarbohydrates()
            },
            Promise.resolve(0)
        )
        console.log(this.totalFats, this.totalCalories, this.totalProteins, this.totalCarbohydrates)
        return super.save(options)
    }
    get user() {
        return this.getUser()
    }
}

Meal.init({
    title: notNullColumn(DataTypes.STRING),
    date: notNullColumn(DataTypes.DATE),
    totalCalories: notNullColumn(DataTypes.DECIMAL(8, 2)),
    totalProteins: notNullColumn(DataTypes.DECIMAL(8, 2)),
    totalFats: notNullColumn(DataTypes.DECIMAL(8, 2)),
    totalCarbohydrates: notNullColumn(DataTypes.DECIMAL(8, 2)),
}, {sequelize, modelName: 'meal'});

class MealProduct extends Model {
    async getCalories() {
        return this.quantity * (await this.getProduct()).calories / 100
    }
    async getProteins() {
        return this.quantity * (await this.getProduct()).proteins / 100
    }
    async getFats() {
        return this.quantity * (await this.getProduct()).fats / 100
    }
    async getCarbohydrates() {
        return this.quantity * (await this.getProduct()).carbohydrates / 100
    }
    get meal() {
        return this.getMeal()
    }
}
MealProduct.init({
    quantity: {type: DataTypes.SMALLINT, allowNull:false,
        validate: {
            notNull: {args: true, msg: "???? ???????????? ???????????? ???????????????????? ????????????????"},
            min: {args: 1, msg: "?????????????? ???????????????????? ????????????????????"},
            max: {args: 10000, msg: "?????????????? ???????????????????? ????????????????????"},
        }
    }
}, {sequelize, modelName: 'mealProduct'});

class Product extends Model {
    get mealProduct() {
        return this.getMealProduct()
    }
}
Product.init({
    title: {type: DataTypes.STRING, allowNull:false,
        validate: {
            notNull: {args: true, msg: "???? ???????????? ???????????? ???????????????? ???????????? ????????????????"},
            len: {args: [5, 200], msg: "?????????????? ???????????????????? ???????????????? ????????????????"},
    }},
    proteins: { type: DataTypes.DECIMAL(5, 2), allowNull:false,
        validate: {
            notNull: {args: true, msg: "???? ???????????? ???????????? ???????????????????? ??????????"},
            len: {args: [1, 5], msg: "?????????????? ???????????????????? ???????????????? ????????????"},
        }
    },
    fats: {type: DataTypes.DECIMAL(5, 2), allowNull:false,
        validate: {
            notNull: {args: true, msg: "???? ???????????? ???????????? ???????????????????? ??????????"},
            len: {args: [1, 5], msg: "?????????????? ???????????????????? ???????????????? ??????????"},
        }
    },
    carbohydrates: { type: DataTypes.DECIMAL(5, 2), allowNull:false,
        validate: {
            notNull: {args: true, msg: "???? ???????????? ???????????? ???????????????????? ??????????????????"},
            len: {args: [1, 5], msg: "?????????????? ???????????????????? ???????????????? ??????????????????"},
        }
    },
    calories: { type: DataTypes.DECIMAL(5, 2), allowNull:false,
        validate: {
            notNull: {args: true, msg: "???? ???????????? ???????????? ???????????????????? ??????????????"},
            len: {args: [1, 6], msg: "?????????????? ???????????????????? ???????????????? ??????????????"},
        }
    },
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE,
}, {sequelize, modelName: 'product'});

User.hasMany(Meal, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' })
Meal.MealProducts = Meal.hasMany(MealProduct, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' })
MealProduct.Product = MealProduct.belongsTo(Product, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' })
Product.hasMany(MealProduct, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' })

// console.log( Meal.prototype)

;(async () => {
    await sequelize.sync();
    //await User.create({username: 'vasya', password: '1234', weight: 60, height: 170, age: 20 });
    // const user = await User.findByPk(1)
    // let newMeal = await user.createMeal({title: '??????????????'})
    // let newMealProduct = await newMeal.createMealProduct({quantity: 150})
    // const mealProduct = await MealProduct.findAll()
    // let newProduct = await mealProduct.createProduct({title: '?????????????? ????????????', calories: 371, proteins: 10.7, fats: 5.2, carbohydrates: 70.4})

    // console.log(user.toJSON())
    // console.log(newMeal.toJSON())
    // console.log(newMealProduct.toJSON())
    // console.log(newProduct.toJSON())
})();
//
// const TelegramBot = require('node-telegram-bot-api');
//
// const token = '1435446495:AAEi7qK2Dd61edZXvxr22Tpu8abXb7Rwokg';
//
// const bot = new TelegramBot(token, {polling: true});
//
// bot.on('message', (msg) => {
//     const chatId = msg.chat.id;
//     // console.log(msg)
//     // send a message to the chat acknowledging receipt of their message
//     bot.sendMessage(chatId, `
//         \`\`\`
// ${JSON.stringify(msq, null, 4)}
//         \`\`\`
//         `, {parse_mode: "Markdown"});
// });