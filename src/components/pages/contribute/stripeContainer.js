import React from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import PaymentPage from "./PaymentPage";
// import { CheckoutForm } from "../checkout/checkout";

const PUBLIC_KEY = "pk_test_51MdU3gSFgDtmRjfImOlDs48r9vrA57OhhZwzlHwjEOlIOvzrIm3IvA2V30ny6ktZoKC8WWs0ZMwv0okUM9A7SmWK00Kju6SQFH";

const stripeTestPromise = loadStripe(PUBLIC_KEY);

const Stripe = () => {
  return (
    <Elements stripe={stripeTestPromise}>
      <PaymentPage/>
    </Elements>
  );
};

export default Stripe;