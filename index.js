const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.31xws.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'UnAuthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        req.decoded = decoded;
        next();
    });
}

async function run() {
    try {
        await client.connect();
        const productsCollection = client.db("keyBoardMania").collection("products");
        const reviewsCollection = client.db("keyBoardMania").collection("reviews");
        const usersCollection = client.db("keyBoardMania").collection("users");
        const ordersCollection = client.db("keyBoardMania").collection("orders");

        // Get all products
        app.get("/products", async (req, res) => {
            const products = await productsCollection.find().toArray();
            res.send(products);
        });

        // Get product by id
        app.get('/products/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productsCollection.findOne(query);
            res.send(product);
        })

        // Get all reviews
        app.get("/reviews", async (req, res) => {
            const reviews = await reviewsCollection.find().toArray();
            res.send(reviews);
        });

        // Add user in DB
        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res.send({ result, token });
        });

        // Save orders in DB
        app.post('/order', verifyJWT, async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.send(result);
        });
    } finally {
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('server running');
})

app.listen(port, () => {
    console.log(`listening to port ${port}`);
})