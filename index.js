const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

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

async function run() {
    try {
        await client.connect();
        const productsCollection = client.db("keyBoardMania").collection("products");

        // Get all products
        app.get("/products", async (req, res) => {
            const products = await productsCollection.find().toArray();
            res.send(products);
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