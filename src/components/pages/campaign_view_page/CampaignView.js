import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Box } from '../../Box';
import Loading from '../../loading/Loading';
import { useConnection } from '../../../connectionProvider/connection_provider';
import './campaign_View.scss';
import Web3 from 'web3';

function CampaignView() {
    const { connectionState } = useConnection();
    const { accounts, crowdFundingContract, ownableContract } = connectionState;

    const navigate = useNavigate();

    const states = ['Approved', 'Rejected', 'Pending']

    const [isLoading, setLoading] = useState(false);
    const [admin, setAdmin] = useState()
    const [error, setError] = useState({
        response: '', buttons: ''
    });
    const [buyToken, setBuyToken] = useState()
    const [refund, setRefund] = useState()
    const [buyValueInETH, setBuyValueInETH] = useState()


    const { index } = useParams();

    const [campaign, setCampaign] = useState({
        company: "",
        campaignId: "",
        title: "",
        creator: "",
        description: "",
        value: "",
        deadLine: "",
        target: "",
        received: "",
        need: "",
        Name: "",
        Symbol: "",
        totalSupply: "",
        contract: "",
        status: "",
        startDate: "",
        withDrawalStatus: "",
        target_In_Eth: ""
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            if (crowdFundingContract) {
                let adminOf = await ownableContract.methods.admin(accounts[0]).call()
                if(adminOf === true) setAdmin(adminOf)
                else setAdmin(adminOf)
                const response = await crowdFundingContract.methods.getCampaign(index).call();
                let company = await crowdFundingContract.methods.getCompany(response.contractAddress).call()

                let tokenValue = Web3.utils.fromWei(response.pricePerToken, 'ether')
                let tokenNeed = (response.contribution === response.target)
                    ? 'target reached'
                    : response.target - response.contribution
                    console.log("response L:",response)
                setCampaign({
                    campaignId: index,
                    company: response.companyName,
                    title: response.campaignTitle,
                    description: response.campaignDescription,
                    value: tokenValue,
                    Name: response.tokenName,
                    deadLine: response.endDate,
                    target: response.target,
                    target_In_Eth: response.target * tokenValue,
                    received: tokenValue * response.contribution,
                    need: tokenNeed,
                    Symbol: response.tokenSymbol,
                    totalSupply: company.totalSupply,
                    creator: response.creator.toString(),
                    contract: response.contractAddress,
                    status: states[response.status],
                    startDate: Date(response.startDate),
                    withDrawalStatus: response[15] ? "withdrawal done" : "Not done yet"
                })
            }
        } catch (error) {
            if (error.code === 4001) {
                setError({ buttons: "Denied Metamask Transaction Signature" });
            } else {
                console.log("this is error: ",error.message)
                setError({ buttons: "Smart Contract Error. See Console" });
            }
        }
        setLoading(false);
    }

    const handleRejectCampaign = async () => {
        setError({ buttons: "" })
        setLoading(true)
        if (window.confirm("Do u want to reject this campaign  ?")) {
            setError({ buttons: '' })
            setLoading(true)
            try {
                await crowdFundingContract.methods.rejectCampaign(index).send({ from: accounts[0] })
                setLoading(false)
                fetchData()
            } catch (error) {
                if (error.code === 4001) {
                    setError({ buttons: "Denied Metamask Transaction Signature" });
                } else {
                    setError({ buttons: "Smart Contract Error. See Console" });
                }
            }
            setError(false)
        }
        setLoading(false)

    }


    const handleApproveCampaign = async () => {

        setError({ buttons: "" })
        setLoading(true)
        if (window.confirm("Do u want to Approve this campaign  ?")) {
            setError({ buttons: '' })
            setLoading(true)
            try {
                await crowdFundingContract.methods.approveCampaign(index).send({ from: accounts[0] })
                setLoading(false)
                fetchData()
            } catch (error) {
                if (error.code === 4001) {
                    setError({ buttons: "Denied Metamask Transaction Signature" });
                } else {
                    setError({ buttons: "Smart Contract Error. See Console" });
                }
            }
            setError(false)
        }
        setLoading(false);
    }

    const withDrawal = async () => {
        setError({ buttons: "" })
        setLoading(true)
        try {
            await crowdFundingContract.methods.withDraw(index).send({ from: accounts[0] })
            navigate('/')
        } catch (error) {
            console.log("error :", error.message)
        }
        setLoading(false)

    }

    function setTotalCostInEth(value) {
        let pricePerTokenInWei = Web3.utils.toWei(campaign.value, 'ether');
        const totalCostInWei = Web3.utils.toBN(pricePerTokenInWei).mul(Web3.utils.toBN(value));
        const totalCostInEth = Web3.utils.fromWei(totalCostInWei, 'ether');
        setBuyValueInETH(totalCostInEth)
    }

    function handleInputChange(event) {
        setTotalCostInEth(event.target.value);
        setBuyToken(event.target.value)
    }
    function handleRefundInput(event) {
        event.preventDefault()
        setRefund(event.target.value)
    }

    const handleBuy = async (event) => {
        event.preventDefault();
        if (buyToken === undefined || buyToken <= 0) {
            alert("No values given")
            return
        }
        if (window.confirm("Do u want to contribute ...!  ?")) {
            setError({ buttons: '' })
            setLoading(true)
            try {
                await crowdFundingContract.methods.contribute(index, buyToken)
                    .send({
                        from: accounts[0],
                        value: Web3.utils.toWei(buyValueInETH, 'ether')
                    })
                navigate('/')
                setLoading(false)
                fetchData()
            } catch (error) {
                console.log("error ", error.message)
                if (error.code === 4001) {
                    setError({ buttons: "Denied Metamask Transaction Signature" });
                } else {
                    setError({ buttons: "Smart Contract Error. See Console" });
                }
            }
            setError(false)
        }
        setLoading(false);

    }

    const handleRefund = async (event) => {
        event.preventDefault();
        if (refund === undefined || refund <= 0) {
            alert("No values given")
            return
        }
        if (window.confirm("Do u want to raise Refund ...! ?")) {
            setError({ buttons: '' })
            setLoading(true)
            try {

                await crowdFundingContract.methods.refund(index, refund)
                    .send({
                        from: accounts[0]
                    })
                navigate('/')
                setLoading(false)
                fetchData()
            } catch (error) {
                console.log("error ", error.message)
                if (error.code === 4001) {
                    setError({ buttons: "Denied Metamask Transaction Signature" });
                } else {
                    setError({ buttons: "Smart Contract Error. See Console" });
                }
            }
            setError(false)
        }
        setLoading(false);

    }

    const isDeadlinePassed = () => {
        return parseInt(campaign.deadLine) < Math.floor(Date.now() / 1000)
    }

    useEffect(() => {
        fetchData()
        // eslint-disable-next-line
    }, [accounts, crowdFundingContract]);

    if (isLoading) {
        return <Loading text="Please Wait" />;
    }

    return (
        <div className="g-page">
            <div className="back-btn" onClick={() => {
                navigate(-1);
            }}>← Back To Overview</div>
            <div className="hr-flex">
                <Box height="10"></Box>
                {
                    ((!isDeadlinePassed() && states[0] === campaign.status)) &&
                    <button className='clickable' onClick={() => { navigate(`/campaign/${campaign.campaignId}/createProposal`) }}>Create Proposal against campaign</button>
                }
            </div>
            <Box height="20" />
            <div className="p-overview hr-flex-modif">
                <div className="p-left">
                        <h1 className="heading">{campaign.title}</h1>
                    {
                        isDeadlinePassed() &&
                        <div className="options">
                            <div className="option" ><div>Campaign deadline passed</div></div>
                        </div>
                    }
                    <Box height="10" />

                    <div className="flex">
                        <p className="status"
                            style={(campaign.status === 0 || campaign.status === 1, campaign.status === 2)
                                ? { '--res-color': 'var(--primary)' } : { '--res-color': 'rgba(0,0,0,0.5)' }}
                        >
                            {campaign.status}

                        </p>


                        <p className="p-date">
                            Ended : {new Date(parseInt(campaign.deadLine) * 1000).toLocaleString('default', { month: 'short', day: '2-digit', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' })}</p></div>
                </div>
                {error.buttons !== '' && <Box height="10" />}
                <div className='progress-bar-track'>
                    <table>
                        <thead>
                        </thead>
                        <tbody>
                            {Object.entries(campaign).map(([key, value]) => (
                                (key !== 'deadLine' && key !== 'status') &&
                                <tr key={key}>
                                    <td style={{ paddingRight: "60px" }}>{key}</td>
                                    <td>{value}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="hr-flex">
                {
                    accounts[0] && (
                        <div>
                            {
                                (!isDeadlinePassed() && admin &&
                                    states[2] === campaign.status) &&
                                <button type="button" className='clickable button' onClick={handleApproveCampaign}>Approve campaign</button>
                            }
                            <> </>
                            {
                                (!isDeadlinePassed() && admin && states[2] === campaign.status) &&
                                <button className='clickable' onClick={handleRejectCampaign}>Reject Campaign</button>
                            }

                            {
                                (isDeadlinePassed() && admin && states[2] === campaign.status) &&
                                <button className='clickable' onClick={handleRejectCampaign}>Reject Campaign</button>
                            }
                            <Box height="10"></Box>
                            {
                                <form onSubmit={handleBuy} className="textfield">
                                    <br />
                                    <label >
                                        {campaign.received !== campaign.target && (!isDeadlinePassed() && states[0] === campaign.status) ? "Enter tokens to buy" : ""}
                                    </label>
                                    {(campaign.received !== campaign.target && (!isDeadlinePassed() && states[0] === campaign.status)) &&
                                        <input type="number" value={buyToken} onChange={handleInputChange} />}
                                    {(campaign.received !== campaign.target && (!isDeadlinePassed() && states[0] === campaign.status)) &&
                                        <button className='clickable' type="submit">
                                            {buyToken ? `Pay  ${buyValueInETH} ETH` : "Enter Token and Pay with ETH"}
                                        </button>
                                    }
                                </form>
                            }
                            <Box height="10"></Box>
                            { campaign.received > 0 &&
                                <form onSubmit={handleRefund} className="textfield">
                                    <br />
                                    <label >
                                        {(!isDeadlinePassed() && states[0] === campaign.status) ? "Enter tokens to raise refund" : ""}
                                    </label>
                                    {((!isDeadlinePassed() && states[0] === campaign.status)) &&
                                        <input type="number" value={refund} onChange={handleRefundInput} />}
                                    {((!isDeadlinePassed() && states[0] === campaign.status)) &&
                                        <button className='clickable' type="submit">
                                            {refund ? ` raise request ${refund}` : "Enter Token that you contributed"}
                                        </button>
                                    }
                                </form>
                            }
                            {
                                (isDeadlinePassed() && ((campaign.creator).toLocaleLowerCase() === (accounts[0]).toLocaleLowerCase()) && campaign.withDrawalStatus === "Not done yet" && campaign.received > 0) &&
                                <button className='clickable' onClick={withDrawal}>withDrawal fund</button>
                            }
                        </div>
                    )
                }
            </div>
        </div>
    );
}

export default CampaignView;

