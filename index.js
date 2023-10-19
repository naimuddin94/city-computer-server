const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const banner = require("./banner.json");
const companies = require("./companies.json");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fv3bzks.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // create product collection
    const productCollection = client
      .db("productDB")
      .collection("productCollection");

    // create cart collection
    const cartCollection = client.db("cartDB").collection("cartCollection");

    // get product by name
    app.get("/brands/:name", async (req, res) => {
      const name = req.params.name;
      const query = { brand: name };
      const cursor = productCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // get product by name
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.findOne(query);
      res.send(result);
    });

    // get cart product by email address
    app.get("/carts/:email", async (req, res) => {
      const queryEmail = req.params.email;
      const query = { email: queryEmail };
      const cursor = cartCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.delete("/carts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: id };
      const result = await cartCollection.deleteOne(query);
      res.send(result);
    });

    // saved product to database
    app.post("/products", async (req, res) => {
      const product = req.body;
      const result = await productCollection.insertOne(product);
      res.send(result);
    });

    // saved card to database with user email address
    app.post("/carts", async (req, res) => {
      const cart = req.body;
      const result = await cartCollection.insertOne(cart);
      res.send(result);
    });

    // update product by id
    app.patch("/update/:id", async (req, res) => {
      const id = req.params.id;
      const { name, photo, brand, category, price, description, rating } =
        req.body;
      const filter = { _id: new ObjectId(id) };
      const updateProduct = {
        $set: {
          name,
          photo,
          brand,
          category,
          price,
          description,
          rating,
        },
      };

      const result = await productCollection.updateOne(filter, updateProduct);
      res.send(result);
    });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.log);

app.get("/", (req, res) => {
  res.send("Welcome to the city computers server!");
});

app.get("/banner", (req, res) => {
  res.send(banner);
});

app.get("/companies", (req, res) => {
  res.send(companies);
});

app.listen(port, () => {
  console.log(`server listening on port ${port}`);
});
