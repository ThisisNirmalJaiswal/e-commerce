const express = require('express')
const router = express.Router()
const userController = require('../controller/userController')
const productController = require('../controller/productController')
const cartController = require('../controller/cartController')
const orderController = require('../controller/orderController')
const auth = require('../auth/auth');
const {
    Route53RecoveryControlConfig
} = require('aws-sdk');


router.get("/testme", function (req, res) {
    res.send("Hey its working")
});

//---------------------------------FEATURE I- User API------------------------------------------
router.post("/register", userController.createUser)
router.post("/login", userController.login)
router.get("/user/:userId/profile", auth.verifyToken, auth.authentication, auth.authorization, userController.getUser)
router.put("/user/:userId/profile", auth.verifyToken, auth.authentication, auth.authorization, userController.updateUser)

//---------------------------------FEATTURE II- Product API--------------------------------------
router.post("/products", productController.createProduct);
router.get("/products", productController.getProduct);
router.get("/products/:productId", productController.getProductById);
router.put("/products/:productId", productController.updateProduct)
router.delete("/products/:productId", productController.deleteProductById)

//----------------------------------FEATURE III- Cart API-----------------------------------------

router.post("/users/:userId/cart",auth.verifyToken, auth.authentication, auth.authorization, cartController.createCart);
router.get("/users/:userId/cart",auth.verifyToken, auth.authentication, auth.authorization, cartController.getCartDetails);
router.put("/users/:userId/cart",auth.verifyToken, auth.authentication, auth.authorization, cartController.updateCart);
router.delete("/users/:userId/cart",auth.verifyToken, auth.authentication, auth.authorization, cartController.deleteCart);


//----------------------------------FEATURE IV- order API-----------------------------------------
router.post("/users/:userId/orders",auth.verifyToken, auth.authentication, auth.authorization, orderController.createOrder);
router.put("/users/:userId/orders", auth.verifyToken, auth.authentication, auth.authorization, orderController.updateOrder);

module.exports = router;