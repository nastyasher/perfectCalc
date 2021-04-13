const {Sequelize, ValidationError, Model, DataTypes, Op} = require('sequelize');
require('dotenv').config()
const {DB_DB, DB_USER, DB_HOST, DB_PASSWORD} = process.env
const fs = require('fs')
const sequelize = new Sequelize(DB_DB, DB_USER, DB_PASSWORD, {host: DB_HOST, dialect: 'mysql'});
const bcrypt = require( 'bcrypt' );
const express_graphql = require('express-graphql').graphqlHTTP;
const {buildSchema} = require('graphql');
const bodyParser = require('body-parser')
const express = require('express');
const app = express()
const cors = require('cors')
const jwt = require('jsonwebtoken');
const jwt_decode = require('jwt-decode')

app.use(express.static('public'))
app.use(cors())
app.use(bodyParser.json())
const schema = buildSchema(`
    type Query {
        getUsers:[User]
        getUser(id:ID):User
        searchProducts(title:String):[Product]
        getMealProduct:[MealProduct]
    }
     type Mutation {
        register(username: String!, password: String!):User
     }
     type User {
        id: ID
        username: String
        weight: String
        height: String
        age: String
     }
     
     type Meal {
        id: ID
        title: String
        totalCalories: Int
        totalProteins: Int
        totalFats: Int
        totalCarbohydrates: Int
        user: User 
     }
     
     type MealProduct {
        id: ID
        meal: Meal
        product: Product
        quantity: Int
     }

     type Product {
        id: ID
        title: String
        proteins: Int
        fats: Int
        carbohydrates: Int
        calories: Int
     }
`)

const rootResolver = {
    async register({username, password}) {
        return await User.create({username, password});
    },
    async getUsers() {
        return await User.findAll({})
    },
    async getUser({id}) {
        return await User.findByPk(id)
    },
    async getMeal() {
        return await Meal.findAll({})
    },
    async getMealProduct() {
        return await MealProduct.findAll({})
    },
    async searchProducts({title}) {
        //console.log(title)
        return await Product.findAll({where: {
                title: {[Op.like]: `%${title}%`}
            },})
    },
}



app.use('/graphql', express_graphql({
    schema,
    rootValue: rootResolver,
    graphiql: true
}));



app.post("/meal", async (req, res, next) => {
    const products = req.body.products
    const user = jwt_decode(req.body.token)
    try {
        const newMeal = await Meal.create(
            {
                title: req.body.title,
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
        res.status(422).send(JSON.stringify([{message:"Проверьте логин"}]))
        return
    }
    const token = jwt.sign( {id: user.id, login: user.username}, privateKey, { algorithm: 'RS256' });
    bcrypt.compare(reqUser.password, user.password, function(err, isMatch) {
        if (err) {
            throw err
        } else if (!isMatch) {
            res.status(422).send(JSON.stringify([{path: 'password', message: "Не верный пароль"}]))
            console.log("Не верный пароль")
        } else {
            res.status(200).send(JSON.stringify(token))
            console.log("Верный пароль")
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
            notNull: {args: true, msg: "Вы должны ввести логин"},
            len: {args: [5,30], msg: "Не менее 5 символов в логине"},
        },
        unique: {
            name: true,
            msg: 'Такой логин уже занят'
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: {args: true, msg: "Введите пароль"},
            len: {args: [5,100], msg: "Не менее 5 символов в пароле"},
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
            notNull: {args: true, msg: "Вы должны ввести количество продукта"},
            min: {args: 1, msg: "Введите корректное количество"},
            max: {args: 1000, msg: "Введите корректное количество"},
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
            notNull: {args: true, msg: "Вы должны ввести название вашего продукта"},
            len: {args: [5, 200], msg: "Введите корректное название продукта"},
    }},
    proteins: { type: DataTypes.DECIMAL(5, 2), allowNull:false,
        validate: {
            notNull: {args: true, msg: "Вы должны ввести количество белка"},
            len: {args: [1, 3], msg: "Введите корректное значение белков"},
        }
    },
    fats: {type: DataTypes.DECIMAL(5, 2), allowNull:false,
        validate: {
            notNull: {args: true, msg: "Вы должны ввести количество жиров"},
            len: {args: [1, 3], msg: "Введите корректное значение жиров"},
        }
    },
    carbohydrates: { type: DataTypes.DECIMAL(5, 2), allowNull:false,
        validate: {
            notNull: {args: true, msg: "Вы должны ввести количество углеводов"},
            len: {args: [1, 3], msg: "Введите корректное значение углеводов"},
        }
    },
    calories: { type: DataTypes.DECIMAL(5, 2), allowNull:false,
        validate: {
            notNull: {args: true, msg: "Вы должны ввести количество калорий"},
            len: {args: [1, 3], msg: "Введите корректное значение калорий"},
        }
    },
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE,
}, {sequelize, modelName: 'product'});

User.hasMany(Meal, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' })
Meal.MealProducts = Meal.hasMany(MealProduct, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' })
MealProduct.Meal = MealProduct.belongsTo(Product, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' })
Product.hasMany(MealProduct, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' })

// console.log( Meal.prototype)

;(async () => {
    await sequelize.sync();
    //await User.create({username: 'vasya', password: '1234', weight: 60, height: 170, age: 20 });
    // const user = await User.findByPk(1)
    // let newMeal = await user.createMeal({title: 'Завтрак'})
    // let newMealProduct = await newMeal.createMealProduct({quantity: 150})
    // const mealProduct = await MealProduct.findAll()
    // let newProduct = await mealProduct.createProduct({title: 'Овсяные хлопья', calories: 371, proteins: 10.7, fats: 5.2, carbohydrates: 70.4})

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