const router = require('express').Router();
const paypal = require('@paypal/checkout-server-sdk');
const paypalConfig = require('../config/paypal');

// SETUP PAYPAL CONFIG
// Creating an environment
let clientId = "AeFZmDW4AtJR36IA3bzKD0Ra8_sqX6iOV4yXTd66_Bc_WFbQjv4YN-DNau8TdIk5RS0DSV2v2IahCaAO";
let clientSecret = "ED2DmYZ2OzwQPZN2T0b72rHgrDbnNCE0EAZngVktBv1eL3DWRjIf8nuXtuesWnXsqBpyf85tTsj98nhj";
let environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
let client = new paypal.core.PayPalHttpClient(environment);

const products = require('../config/products').products;

// ROUTES - PAGE
router.get('/', (req, res) => res.render('index', {
    products
}));

// ROUTES WITH PAYPAL
router.post('/buy', (req, res) => {
    const productId = req.query.id;

    console.log(`request: ${JSON.stringify(req.body)}`);
 
    let request = new paypal.orders.OrdersCreateRequest();
    request.headers["prefer"] = "return=representation";
    request.requestBody(req.body);

    // Call API with your client and get a response for your call
    let createOrder = async function () {
        let order;
        try {
            order = await client.execute(request);
        } catch (err) {

            // 4. Handle any errors from the call
            console.error(err);
            return res.sendStatus(500);
        }

        // 5. Return a successful response to the client with the order ID

        console.log(`Response: ${JSON.stringify(order)}`);
        // If call returns body in response, you can get the deserialized version from the result attribute of the response.
        console.log(`Order: ${JSON.stringify(order.result)}`);

        res.status(200).json({
            orderID: order.result.id
        });

    }
    createOrder();

});

// ROUTER DE RESPOSTA DE PAGAMENTO COM SUCESSO
router.get('/success', (req, res) => {
    res.send('success'); // criar ejs
});


// ROUTER DE RESPOSTA DE PAGAMENTO CANCELADO
router.get('/cancel', (req, res) => {
    res.send('Cancelled'); // criar ejs
});

router.get('/products/:id?', (req, res) => {

    const productId = req.params.id;
    const product = productId ? products.filter(item => item.id == productId) : products;

    res.status(200).json(product)
})

module.exports = router;