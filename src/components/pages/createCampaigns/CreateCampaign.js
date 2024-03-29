import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import Web3 from 'web3';
import "./createCampaign.scss";
import { Box } from '../../Box';
import Loading from '../../loading/Loading';
import { useConnection } from '../../../connectionProvider/connection_provider';

function CreateCampaign(props) {
    const { connectionState, connectWallet } = useConnection();
    const { accounts, crowdFundingContract } = connectionState;
    const [campaign, setCampaign] = useState({
        companyName: "",
        title: "",
        description: "",
        pricePerToken: "",
        tokenName: "",
        deadLine: "",
        target: "",
        tokenSymbol: "",
        totalSupply: "",
    });

    const [isLoading, setLoading] = useState(false);
    const [admin, setAdmin] = useState();

    useEffect(() => {
        _setAdmin();
        // eslint-disable-next-line
    }, [accounts])

    // For validation errors
    const [error, setError] = useState({
        companyName: "",
        title: "",
        description: "",
        pricePerToken: "",
        tokenName: "",
        deadLine: "",
        target: "",
        tokenSymbol: "",
        totalSupply: "",
        button: ""
    });

    const navigate = useNavigate();

    const dataHandlder = (event) => {
        let { name, value } = event.target
        setCampaign({ ...campaign, [name]: value })
    }


    const handleCampaignCreation = async () => {

        if (window.confirm("Do you want to create a new crowd funding campaign ?")) {
            setLoading(true);
            try {
                let tokenValue = Web3.utils.toWei(campaign.pricePerToken, 'ether')
                await crowdFundingContract.methods.createCampaign(
                    campaign.companyName,
                    campaign.title,
                    campaign.description,
                    tokenValue,
                    campaign.tokenName,
                    Date.parse(campaign.deadLine) / 1000,
                    campaign.target,
                    campaign.tokenSymbol,
                    campaign.totalSupply
                ).send({ from: accounts[0] });
                navigate("/")
            } catch (e) {
                if (e.code === 4001) {
                    setError({ button: "Denied Metamask Transaction Signature" });
                } else {
                    setError({ button: "Smart Contract Error. See Console" });
                }
            }
            setLoading(false);
        }

    }

    if (isLoading) {
        return <Loading text='Creating Campaign' />
    }

    async function _setAdmin() {
            let adminOf = await crowdFundingContract.methods.admin().call()
            setAdmin(adminOf.toLowerCase());
    }

    return (
        <div className="container create-campaign">
            <div className="back-btn" onClick={() => {
                navigate(-1);
            }}>← Back To Overview</div>
            <div className="container create-campaign">
                {accounts[0] !== admin ? (
                    <div>
                        <div className="heading title">Create Campaign</div>
                        <div className="campaign-box" >
                            <div>
                                <label>companyName</label>
                                <div className="textfield" >
                                    <input id="companyName" name='companyName' value={campaign.companyName}
                                        minLength="10" maxLength="20" onChange={dataHandlder}
                                        type="text" placeholder="Enter the company name" required />
                                </div>
                                <p className="error">{error.companyName}</p>
                            </div>

                            <div>
                                <label>title</label>
                                <div className="textfield" >
                                    <input id="title" name='title' value={campaign.title}
                                        minLength="5" maxLength="20" onChange={dataHandlder}
                                        type="text" placeholder="Enter the title of the campaign" required />
                                </div>
                                <p className="error">{error.title}</p>
                            </div>

                            <div>
                                <label>tokenName</label>
                                <div className="textfield" >
                                    <input id="tokenName" name='tokenName' value={campaign.tokenName}
                                        minLength="5" maxLength="10" onChange={dataHandlder}
                                        type="text" placeholder="Enter Token Name" required />
                                </div>
                                <p className="error">{error.tokenName}</p>
                            </div>

                            <div>
                                <label>tokenSymbol</label>
                                <div className="textfield" >
                                    <input id="tokenSymbol" name='tokenSymbol' value={campaign.tokenSymbol}
                                        minLength="3" maxLength="5"
                                        onChange={dataHandlder} type="text" placeholder="Enter token symbol" required />
                                </div>
                                <p className="error">{error.tokenSymbol}</p>
                            </div>

                            <div>
                                <label>pricePerToken (ETH)</label>
                                <div className="textfield" >
                                    <input id="pricePerToken" name='pricePerToken'
                                        value={campaign.pricePerToken}
                                        minLength="1" maxLength="100" onChange={dataHandlder}
                                        type="number" placeholder="Enter the price per token" required />
                                </div>
                                <p className="error">{error.pricePerToken}</p>
                            </div>

                            <div>
                                <label>target (ETH)</label>
                                <div className="textfield" >
                                    <input id="target" name='target' value={campaign.target}
                                        minLength="1" maxLength="20" onChange={dataHandlder}
                                        type="number" placeholder="Goal of this campaign" required />
                                </div>
                                <p className="error">{error.target}</p>
                            </div>

                            <div>
                                <label>deadLine</label>
                                <div className="textfield" >

                                    <input id="deadLine" name='deadLine' value={campaign.deadLine}
                                        onChange={dataHandlder} type="datetime-local"
                                        placeholder="Last date for this campaign" required />
                                </div>
                                <p className="error">{error.deadLine}</p>
                            </div>
                            <Box height="10"></Box>
                            <div>
                                <label>totalSupply (ETH)</label>
                                <div className="textfield" >
                                    <input id="totalSupply" name='totalSupply'
                                        value={campaign.totalSupply} onChange={dataHandlder} type="number" placeholder="Enter how many tokens you want to launch" required />
                                </div>
                                <p className="error">{error.totalSupply}</p>
                            </div>

                            <div>
                                <Box height="10"></Box>
                                <label>description</label>
                                <div className="textfield">
                                    <input id="description" name='description'
                                        value={campaign.description} onChange={dataHandlder} rows="3" placeholder="Why should people want to contribute to this campaign ?" required />
                                </div>
                                <p className="error">{error.description}</p>
                            </div>
                            <Box height="20"></Box>

                            <button
                                className="clickable"
                                type="button"
                                onClick={() => {
                                    if (accounts.length > 0) {
                                        handleCampaignCreation()
                                    } else {
                                        connectWallet()
                                    }
                                }}
                            >
                                {accounts.length > 0 ? 'Create Campaign' : 'Connect Wallet'}
                            </button>

                            {error.button && <Box height="10" />}
                            <p className="error">{error.button}</p>
                        </div>
                    </div>
                ) : <div className='bolding'>You are a admin You cant create a new crowdfunding campaign</div>
                }
            </div>
        </div>
    );
}

export default CreateCampaign;
