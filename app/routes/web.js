const homeController= require('../http/controllers/homeController')
const authController= require('../http/controllers/authController')
const cartController= require('../http/controllers/customers/cartController')
const guest= require('../http/middlewares/guest')
const auth= require('../http/middlewares/auth')
const orderController= require('../http/controllers/orderController')
const AdminOrderController= require('../http/controllers/admin/orderController')
const admin= require('../http/middlewares/admin')
const statusController= require('../http/controllers/admin/statusController')

function initRoutes(app){
    app.get('/', homeController().index)
    app.get('/cart', cartController().index)
    app.get('/login', guest, authController().login)
    app.post('/login', authController().postLogin)
    app.get('/register',guest,  authController().register)
    app.post('/logout', authController().logout)
    app.post('/update-cart', cartController().update)
    app.post('/register', authController().postRegister)
    app.post('/orders', auth, orderController().store)
    app.get('/customer/orders', auth, orderController().index)
    app.get('/customer/orders/:id', auth, orderController().show)

    // Admin routes
    app.get('/admin/orders', admin, AdminOrderController().index)
    app.post('/admin/order/status', admin, statusController().update)

    

}

module.exports= initRoutes