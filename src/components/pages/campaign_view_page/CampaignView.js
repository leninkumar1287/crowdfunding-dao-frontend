import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Box } from '../../Box';
import Loading from '../../loading/Loading';
import { useConnection } from '../../../connectionProvider/connection_provider';
import './campaign_View.scss';

function CampaignView() {
    const { connectionState } = useConnection();
    const { accounts, crowdFundingContract } = connectionState;

    const navigate = useNavigate();

    const states = ['Approved', 'Rejected', 'Pending']

    const [isLoading, setLoading] = useState(false);
    const [admin, setAdmin] = useState()
    const [error, setError] = useState({
        response: '', buttons: ''
    });


    const { index } = useParams();

    const [campaign, setCampaign] = useState({
        company: "",
        title: "",
        creator: "",
        description: "",
        value: "",
        deadLine: "",
        target: "",
        Name: "",
        Symbol: "",
        totalSupply: "",
        contract: "",
        status: "",
        startDate: ""
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            if (crowdFundingContract) {

                let adminOf = await crowdFundingContract.methods.admin().call()
                setAdmin(adminOf.toLowerCase());
                const response = await crowdFundingContract.methods.getCampaign(index).call();
                let company = await crowdFundingContract.methods.getCompany(response.contractAddress).call()
                let totalSupply = Math.round(company.totalSupply / (10 ** 18));
                setCampaign({
                    company: response.companyName,
                    title: response.campaignTitle,
                    description: response.campaignDescription,
                    value: response.pricePerToken,
                    Name: response.tokenName,
                    deadLine: response.endDate,
                    target: response.target,
                    Symbol: response.tokenSymbol,
                    totalSupply,
                    creator: response.creator.toString(),
                    contract: response.contractAddress,
                    status: states[response.status],
                    startDate: Date(response.startDate)
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

    const isDeadlinePassed = () => {
        return parseInt(campaign.deadLine) * 1000 < Date.now()
    }

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
            <Box height="20" />
            <div className="p-overview hr-flex-modif">
                <div className="p-left">
                    <p className="heading">{campaign.title}</p>
                    {
                        !isDeadlinePassed() &&
                        <div className="options">
                            <div className="option" ><div>Campaign deadline passed</div></div>
                        </div>
                    }
                    <Box height="10" />

                    <div className="flex">
                        <p className="p-result"
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
                                <tr key={key}>
                                    <td>{key}</td>
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
                                (!isDeadlinePassed() && admin === accounts[0] &&
                                    states[2] === campaign.status) &&
                                <button type="button" className='clickable button' onClick={handleApproveCampaign}>Approve campaign</button>
                            }
                            <> </>
                            {
                                (!isDeadlinePassed() && admin === accounts[0] && states[2] === campaign.status) &&
                                <button className='clickable' onClick={handleRejectCampaign}>Reject Campaign</button>
                            }
                        </div>
                    )
                }
            </div>
        </div>
    );
}

export default CampaignView;
