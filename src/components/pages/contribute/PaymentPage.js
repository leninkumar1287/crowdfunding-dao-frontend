import React, { useEffect, useState } from 'react'
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import '../campaign_view_page/campaign_View.scss';

const MySwal = withReactContent(Swal);

function PaymentPage() {
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();
    const location = useLocation()

    const payNow = async (event) => {
        event.preventDefault();
        try {
            const response = await axios({
                url: 'http://localhost:4000/api/v1/txn/payment',
                method: 'post',
                data: {
                    name: location.state.form.name,
                    email: location.state.form.email,
                    postal_code: location.state.form.zipCode,
                    country: location.state.form.country,
                    amount: location.state.form.totalTokensToBuy * location.state.tokenValue,
                    currency: location.state.form.currency,
                    addressLine: location.state.form.addressLine
                },
            });
            if (response.status === 201) {
                const cardElement = elements.getElement(CardElement);
                if (cardElement) {
                    //setProcessing(true);
                    const payload = await stripe.confirmCardPayment(response.data.data, {
                        payment_method: {
                            card: cardElement,
                        },
                    });
                    if (payload.paymentIntent.status === "succeeded") {
                        handleSuccess()
                        navigate({
                            ...location,
                            state: "",
                            replace: true,
                        });
                    }
                    else {
                        handleFailure()
                        console.log("Payment not yet Confirmed")
                    }
                }
            }
        } catch (error) {
            handleFailure();
            console.log("error : ", error);
        }
    };

    const handleSuccess = () => {
        MySwal.fire({
            icon: 'success',
            title: 'Payment was successful',
        });
        navigate('/')

    };
    const handleFailure = () => {
        MySwal.fire({
            icon: 'error',
            title: 'Payment was not successful',
        });
    };

    return (
        <div className='campaign-page'>

            <h1>Pay credit or Debit card</h1>
            <br />
            <form style={{ maxWidth: 400 }}>
                <CardElement />
                <div className='text-center'>
                    <button className="clickable" onClick={payNow}>Pay {location.state == null ? navigate('/') : location.state.form.totalTokensToBuy * location.state.tokenValue}</button>
                </div>

            </form>
        </div>

    )
}

export default PaymentPage