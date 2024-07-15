import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Shoe from "./components/Shoe";
import Search from "./components/Search";
import Promotion from "./components/Promotion";
import Home from "./components/Home";
import RequireAuth from "./components/RequireAuth";
import About from "./components/About";
import Featured from "./components/Featured";
import AddShoe from "./components/AddShoe";
import LoginForm from "./components/LoginForm";
import { AuthProvider } from "./hooks/AuthContext";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";

function App() {
  const [data, setData] = useState([]);
  const [cart, setCart] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/shoes`);
        if (!response.ok) {
          throw new Error("Data could not be fetched!");
        }
        const json_response = await response.json();
        setData(json_response);
      } catch (error) {
        console.error("Error fetching shoes:", error);
      }
    };

    fetchData();
  }, [page]);

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  return (
    <>
      <Router>
        <nav className="navbar navbar-expand-lg bg-body-tertiary">
          <div className="container-fluid">
            <Link className="navbar-brand" to="/">
              <h2 style={{ fontFamily: "Didot", color: "#003f69" }}>
                <b>S T E P - U P </b>
              </h2>
            </Link>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarSupportedContent"
              aria-controls="navbarSupportedContent"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarSupportedContent">
              <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                <li className="nav-item">
                  <Link className="nav-link" to="/">
                    <b>HOME</b>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/about">
                    <b>ABOUT </b>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/cart">
                    <b>MY CART</b>
                  </Link>
                </li>
              </ul>
              <Search setData={setData} />
            </div>
          </div>
        </nav>
        <main role="main" className="col-md-9 ml-sm-auto col-lg-10 px-md-4">
          <div className="container-fluid">
            <div className="row">
              <Featured data={[]} />
              <hr />
              <AuthProvider>
                <Routes>
                  <Route
                    exact
                    path="/"
                    element={
                      <Home
                        data={data}
                        handleDelete={() => {}}
                        page={page}
                        setPage={setPage}
                        addToCart={addToCart}
                      />
                    }
                  />
                  <Route path="/about" element={<About />} />
                  <Route
                    path="/add"
                    element={
                      <RequireAuth>
                        <AddShoe addToCart={addToCart} />
                      </RequireAuth>
                    }
                  />
                  <Route path="/Login" element={<LoginForm />} />
                  <Route path="/cart" element={<Cart cart={cart} />} />
                  <Route path="/checkout" element={<Checkout cart={cart} />} />
                </Routes>
              </AuthProvider>
            </div>
          </div>
        </main>
        <footer>
          <div>
            <strong>{import.meta.env.VITE_ENVIRONMENT.toUpperCase()}</strong>
          </div>
        </footer>
      </Router>
    </>
  );
}

const Cart = ({ cart }) => (
  <div style={{ textAlign: "center" }}>
    <h3 style={{ fontFamily: "Didot", color: "#004878" }}>
      <b><u>C A R T - I T E M S </u></b>
    </h3>
    <ul>
      {cart.map((item, index) => (
        <li key={index}>
          {item.brand} - Quantity: {item.quantity}
        </li>
      ))}
    </ul>
    <Link to="/checkout">
      <button className="btn btn-primary">Proceed to Checkout</button>
    </Link>
  </div>
);

const Checkout = ({ cart }) => {
  const [paymentInfo, setPaymentInfo] = useState("");
  const [shippingInfo, setShippingInfo] = useState("");

  const handleCheckout = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cart, paymentInfo, shippingInfo }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Order placed:", data);
      // Clear cart and form fields after successful order placement
    } catch (error) {
      console.error("Error placing order:", error);
    }
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div style={{ textAlign: "center" }}>
      <h3 style={{ fontFamily: "Didot", color: "#004878" }}>
        <b><u>CHECKOUT</u></b>
      </h3>
      <ul>
        {cart.map((item, index) => (
          <li key={index}>
            {item.brand} - Quantity: {item.quantity} - Price: ${item.price}
          </li>
        ))}
      </ul>
      <h4>Total: ${total}</h4>
      <div>
        <label>
          Payment Info:
          <input
            type="text"
            value={paymentInfo}
            onChange={(e) => setPaymentInfo(e.target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          Shipping Info:
          <input
            type="text"
            value={shippingInfo}
            onChange={(e) => setShippingInfo(e.target.value)}
          />
        </label>
      </div>
      <button className="btn btn-primary" onClick={handleCheckout}>Place Order</button>
    </div>
  );
};

export default App;
