import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import path from "path";
import fs from "fs";

dotenv.config();

const url = process.env.MONGO_DB_URL;
const dbName = process.env.MONGO_DB;

const app = express();

// Configure CORS middleware
app.use(cors());

app.use(express.json()); // Middleware to parse JSON bodies

const PORT = 3000;

// Endpoint to fetch all shoes
app.get("/shoe", async (req, res) => {
  try {
    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = client.db(dbName);
    const shoesCollection = db.collection("shoe");
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
    const shoesCollection = db.collection("shoe");
    const { searchTerm } = req.body;
    console.log("Search term:", searchTerm); // Log the search term
    const query = { "shoeDetails.brand": { $regex: searchTerm, $options: "i" } }; // Example of text search
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

// Endpoint to fetch distinct categories
app.get("/categories", async (req, res) => {
  try {
    const client = await MongoClient.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const db = client.db(dbName);
    const shoesCollection = db.collection("shoe");

    const brands = await shoesCollection.distinct("shoeDetails.brand");
    const colors = await shoesCollection.distinct("shoeDetails.color");
    const sizes = await shoesCollection.distinct("shoeDetails.size");

    client.close();
    res.json({ brands, colors, sizes });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("Error fetching categories.");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
