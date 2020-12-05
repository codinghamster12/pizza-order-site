const express= require('express');
const expressEjsLayouts = require('express-ejs-layouts');
const app= express()
const PORT= process.env.PORT || 2000
const path= require('path')
const mongoose= require('mongoose')
const session= require('express-session')
const flash= require('express-flash')
const passport= require('passport')
const MongoDbStore= require('connect-mongo')(session)
const Emitter= require('events')
require('dotenv').config()

app.use(flash())

mongoose.connect(`mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@cluster0.e4r3t.mongodb.net/${process.env.MONGO_DB_DATABASE}?retryWrites=true&w=majority`, 
{
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useCreateIndex:true
}).then(() => {
    console.log('Database connected');
});
const connection= mongoose.connection;



let mongoStore= new MongoDbStore({
    mongooseConnection: connection,
    collection:'sessions',

})

const eventEmitter= new Emitter()
app.set('eventEmitter', eventEmitter)

app.use(session({
    secret: process.env.COOKIESECRET,
    resave: false,
    store: mongoStore,
    saveUninitialized: false,
    store: mongoStore,
    cookie: { maxAge: 1000 * 60 * 60 * 24}
}))

const passportInit= require('./app/config/passport');
const { info } = require('console');
const { emit } = require('process');
passportInit(passport)
app.use(passport.initialize())
app.use(passport.session())

app.use(express.static('public'));
app.use(express.urlencoded({
    extended: false
}))
app.use(express.json())

app.use((req, res, next) => {
    res.locals.session= req.session
    res.locals.user= req.user
    next()

})
app.use(expressEjsLayouts)
app.set('views', path.join(__dirname, '/resources/views'))
app.set('view engine', 'ejs')

require('./app/routes/web')(app)


const server= app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})

const io= require('socket.io')(server)
io.on('connection', (socket) => {
    console.log(socket.id)
    socket.on('join',(orderId)=> {
        socket.join(orderId)
        console.log(orderId)

    })

})

eventEmitter.on('orderUpdated', (data) => {
    io.to(`order_${data.id}`).emit('orderUpdated', data)
})

eventEmitter.on('orderPlaced', (data) => {
    io.to('adminRoom').emit('orderPlaced', data)
})

