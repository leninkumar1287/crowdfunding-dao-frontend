import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import Loading from '../../loading/Loading';
import { useConnection } from '../../../connectionProvider/connection_provider';
import '../campaign_view_page/campaign_View.scss';

function Checkout() {
    const { connectionState } = useConnection();
    const { accounts, crowdFundingContract } = connectionState;

    const navigate = useNavigate();

    const states = ['Approved', 'Rejected', 'Pending']

    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState({
        response: '', buttons: ''
    });

    const { index } = useParams();

    const [formData, setFormData] = useState({
        name: "",
        country: "",
        email: "",
        addressLine: "",
        zipCode: "",
        totalTokensToBuy: "",
    });

    const handleInputChange = (event) => {
        setFormData({ ...formData, [event.target.name]: event.target.value });
    };

    const [campaign, setCampaign] = useState({
        CampaignName: "",
        tokenName: "",
        tokenSymbol: "",
        value: "",
        deadLine: "",
        target: "",
        status: "",
        startDate: ""
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            if (crowdFundingContract) {

                const response = await crowdFundingContract.methods.getCampaign(index).call();
                let company = await crowdFundingContract.methods.getCompany(response.contractAddress).call()

                setCampaign({
                    CampaignName: response.campaignTitle,
                    tokenName: response.tokenName,
                    tokenSymbol: response.tokenSymbol,
                    value: Number(response.pricePerToken),
                    deadLine: response.endDate,
                    target: response.target,
                    status: states[response.status],
                    startDate: Date(response.startDate),
                })
            }
        } catch (error) {
            console.log("error : ", error)
            if (error.code === 4001) {
                setError({ buttons: "Denied Metamask Transaction Signature" });
            } else {
                setError({ buttons: "Smart Contract Error. See Console" });
            }
        }
        setLoading(false);
    }

    const isDeadlinePassed = () => {
        let currentTime = Date.now()
        return parseInt(campaign.deadLine) * 1000 < Math.floor(currentTime/1000)
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        navigate(`/campaign/paymentPage/${index}`, {
            state: {
                form: formData,
                tokenValue: campaign.value
            }
        })
    };

    const isSubmitDisabled = Object.values(formData).some((value) => value === "");

    useEffect(() => {
        fetchData()
        // eslint-disable-next-line
    }, [accounts, crowdFundingContract]);

    if (isLoading) {
        return <Loading text="Please Wait" />;
    }

    return (
        <div className="campaign-page">
            <div className="back-btn" onClick={() => {
                navigate(-1);
            }}>← Back To Overview</div>
            <div >
                <br />
                <div className="heading title">💶 Contribution</div>
                <br />
                <h1 className='heading title'>{`campaign Name    : ${campaign.CampaignName}`}</h1>
                <h1 className='heading title'>{`Token Name       : ${campaign.tokenName}`}</h1>
                <h1 className='heading title'>{`Token symbol     : ${campaign.tokenSymbol}`}</h1>
                <br />
                {!isDeadlinePassed ? 'deadLine passed ': <form onSubmit={handleSubmit}>
                    <label>
                        Name:
                        <br />
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                        />
                    </label>
                    <br />
                    <br />
                    <label>
                        Country:
                        <br />
                        <select
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            required
                            pattern="[A-Za-z]+"
                        >
                            <option value="">Select a country</option>
                            <option value="US">USA</option>
                            <option value="IN">IND</option>
                            <option value="UK">UK</option>
                        </select>
                    </label>
                    <br />
                    <br />
                    <label>
                        Currency:
                        <br />
                        <select
                            name="currency"
                            value={formData.currency}
                            onChange={handleInputChange}
                            required
                            pattern="[A-Za-z]+"
                        >
                            <option value="">Select a currency</option>
                            <option value="USD">USA</option>
                            <option value="INR">IND</option>
                            <option value="EUR">UK</option>
                        </select>
                    </label>
                    <br />
                    <br />
                    <label>
                        Email:
                        <br />
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                        />
                    </label>
                    <br />
                    <br />
                    <label>
                        Address Line:
                        <br />
                        <input
                            type="text"
                            name="addressLine"
                            value={formData.addressLine}
                            onChange={handleInputChange}
                            required
                            pattern="[A-Za-z0-9\s]+"
                        />
                    </label>
                    <br />
                    <br />
                    <label>
                        Zip Code:
                        <br />
                        <input
                            type="number"
                            name="zipCode"
                            value={formData.zipCode}
                            onChange={handleInputChange}
                            required
                            attern="[0-9]{5}"
                        />
                    </label>
                    <label>
                        <br />
                        <br />
                        BuyToken
                        <br />
                        <input
                            type="number"
                            name="totalTokensToBuy"
                            value={formData.totalTokensToBuy}
                            onChange={handleInputChange}
                            placeholder='Enter tokens to buy' />
                        <br />
                    </label>
                    <br />
                    <br />
                    <button className="clickable" disabled={isSubmitDisabled}>
                        {
                            formData.totalTokensToBuy > 0 &&
                                formData.zipCode &&
                                formData.currency &&
                                formData.addressLine &&
                                formData.country &&
                                formData.email
                                ? 'Move to Payment' : "Can't Make Payment"} 
                    </button>
                </form>
                }
                <br />
            </div>
        </div>
    );
}

export default Checkout;

