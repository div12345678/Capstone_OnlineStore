import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import cors from "cors";
import express from "express";

dotenv.config();

const url = process.env.MONGO_DB_URL;
const dbName = process.env.MONGO_DB;

const app = express();

// Configure CORS middleware
app.use(cors());

app.use(express.json()); // Middleware to parse JSON bodies

const PORT = 3000;

// Endpoint to fetch all shoes
app.get("/shoes", async (req, res) => {
  try {
    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = client.db(dbName);
    const shoesCollection = db.collection("shoes");
    const shoes = await shoesCollection.find({}).toArray();
    res.json(shoes);
    client.close(); // Close the database connection
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("Error fetching shoes.");
  }
});

// Endpoint to search for shoes by criteria
app.post("/search", async (req, res) => {
  try {
    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = client.db(dbName);
    const shoesCollection = db.collection("shoes");
    const { searchTerm } = req.body;
    const query = { $text: { $search: searchTerm } }; // Example of text search
    const shoes = await shoesCollection.find(query).toArray();
    res.json(shoes);
    client.close(); // Close the database connection
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("Error searching for shoes.");
  }
});

// Endpoint to create an order
app.post("/orders", async (req, res) => {
  try {
    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = client.db(dbName);
    const ordersCollection = db.collection("orders");
    const { cart, total, paymentInfo, shippingInfo } = req.body;
    const newOrder = {
      cart,
      total,
      paymentInfo,
      shippingInfo,
      createdAt: new Date(),
    };
    const result = await ordersCollection.insertOne(newOrder);
    res.status(201).send({ orderId: result.insertedId });
    client.close(); // Close the database connection
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("Error creating order.");
  }
});

// Endpoint to fetch all orders (for admin purposes)
app.get("/orders", async (req, res) => {
  try {
    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = client.db(dbName);
    const ordersCollection = db.collection("orders");
    const orders = await ordersCollection.find({}).toArray();
    res.json(orders);
    client.close(); // Close the database connection
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("Error fetching orders.");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});




// Load KNN model 
const knnModel = require("C:Capstone_OnlineStorepythonKNNmodel.pkl"); 

// Endpoint to get recommended products
app.post("/api/recommendations", async (req, res) => {
  try {
    const selectedProduct = req.body; // Assuming the selected product is sent in the request body
    // Preprocess the input features (normalize, encode, etc.) to match the model's format
 
    // Use the KNN model to get recommended products
    const recommendedProducts = knnModel.getRecommendations(selectedProduct);

    // Return the recommended products as JSON response
    res.json(recommendedProducts);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    res.status(500).send("Error fetching recommendations.");
  }
});