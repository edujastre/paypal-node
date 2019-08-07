const router = require('express').Router();
const paypal = require('@paypal/checkout-server-sdk');
const paypalConfig = require('../config/paypal');

// SETUP PAYPAL CONFIG
// Creating an environment
let clientId = "AeFZmDW4AtJR36IA3bzKD0Ra8_sqX6iOV4yXTd66_Bc_WFbQjv4YN-DNau8TdIk5RS0DSV2v2IahCaAO";
let clientSecret = "ED2DmYZ2OzwQPZN2T0b72rHgrDbnNCE0EAZngVktBv1eL3DWRjIf8nuXtuesWnXsqBpyf85tTsj98nhj";
let environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
let client = new paypal.core.PayPalHttpClient(environment);


// CREATE PAYMENT JSON
const createPaymentJson = ({
    carrinho,
    valor,
    descricao
}) => ({
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
        "return_url": "http://localhost:3000/success",
        "cancel_url": "http://localhost:3000/cancel"
    },
    "transactions": [{
        "item_list": {
            "items": carrinho
        },
        "amount": valor,
        "description": descricao
    }]
});

const executePaymentJson = ({
    payerId,
    valor
}) => ({
    "payer_id": payerId,
    "transactions": [{
        "amount": valor
    }]
});

const products = require('../config/products').products;

// ROUTES - PAGE
router.get('/', (req, res) => res.render('index', {
    products
}));

// ROUTES WITH PAYPAL
let globalProductSelected;
router.post('/buy', (req, res) => {
    const productId = req.query.id;
    
    console.log(`request: ${JSON.stringify(req.body)}`);
    const product = products.reduce((all, p) => {
        // console.log(p.id === productId ? p : all);
        return p.id === productId ? p : all
    });
    // console.log('produto =>', product);
    if (!product.id) return res.render('index', {
        products
    });

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
router.get('/successc', (req, res) => {
    res.send('success'); // criar ejs
});

router.get('/success', (req, res) => {
    console.log(req);
    const payerId = req.query.id;
    const paymentId = req.query.paymentId;
    const valor = {
        "currency": "BRL",
        "total": globalProductSelected.preco.toFixed(2) // SEM DB
    };
    const execute_payment_json = executePaymentJson({
        payerId,
        valor
    });

    paypal.payment.execute(paymentId, execute_payment_json, (error, payment) => {
        if (error) {
            console.log(error.response);
            throw error; // criar ejs
        } else {
            console.log('Get Payment Response');
            console.log(JSON.stringify(payment));
            // res.send('Success'); // criar ejs
            res.render('success', {
                payment
            })
        }
    });
});

// ROUTER DE RESPOSTA DE PAGAMENTO CANCELADO
router.get('/cancel', (req, res) => {
    res.send('Cancelled'); // criar ejs
});

router.get('/products/:id?', (req, res) => {

    const productId = req.params.id;
    const product =  productId ? products.filter(item => item.id == productId) : products;
    
    // products.reduce((all, p) => {
    //     console.log(productId, p.id === productId ? p : all);
    //     return p.id === productId ? p : all
    // });

    res.status(200).json(product)
})

module.exports = router;