import React, { useEffect, useState } from 'react';
import './Campaigns.scss';
import Loading from '../../loading/Loading';
import { Box } from '../../Box';
import { useNavigate } from 'react-router';
import { useConnection } from '../../../connectionProvider/connection_provider';
import Web3 from 'web3';

function Campaigns() {
    const { connectionState } = useConnection();
    const { accounts, crowdFundingContract } = connectionState;

    const [isLoading, setLoading] = useState(false);
    const navigate = useNavigate();

    const getStatus = (state) => {
        if (state === '0') return 'Approved'
        if (state === '1') return 'Rejected'
        if (state === '2') return 'Pending'
    }

    const [campaignsList, setcampaignsList] = useState([]);

    const HexToString = (value) => {
        return Web3.utils.hexToString(value);
     }

    async function fetchData() {
        if (crowdFundingContract != null) {
            setLoading(true);
            const campaignCount = await crowdFundingContract.methods.campaignCount().call();
            let tempList = [];
            for (let i = campaignCount; i > 0; i--) {
                const campaign = await crowdFundingContract.methods.getCampaign(i).call();
                tempList.push(campaign);
            }
            setcampaignsList(tempList);

            setLoading(false);
        }
    }

    // async function statement  () {
    //     let eventsemitted = crowdFundingContract.events.campaignCreated()
    //     console.log(" eventsemitted : ",eventsemitted)
    // }


    useEffect(() => {
        // statement();
        fetchData();
        // eslint-disable-next-line 
    }, [accounts, crowdFundingContract]);

    if (isLoading) {
        return <Loading text='Loading All campaigns' />;
    }

    return (
        <div className="g-page">
            <div className="hr-flex">
                <h3 className="heading">CrowdFunding Dao</h3>
                <button className="clickable" style={{marginLeft:300}} onClick={() => { navigate('/campaigns/createCampaigns') }}>
                    Create Campaigns
                </button>
                {
                // "admin "== "accounts[0]"  
                <button className="clickable" style={{background: "darkCyan"}} onClick={() => { navigate('/campaign/addAdmin/') }}> Manage Admins </button>
                }

            </div>
            <div className="p-list">
                {campaignsList.length === 0 ?
                    <div className='subtitle' style={{ textAlign: 'center' }}>No Campaign Found</div>
                    : <div className="subtitle">All Campaigns</div>}
                {campaignsList.map((campaigns, idx) => (
                    <div key={idx} className="p-list-tile" onClick={() => { navigate(`campaign/viewCampaign/${campaigns.campaignId}`) }}>
                        <div className="p-left">
                            <p className="p-title">Campaign Title : {campaigns.campaignTitle}</p>
                            <p className="p-title">Available Token :{(campaigns.target - campaigns.contribution)}</p>
                            <p className="p-title">Creator : {campaigns.creator}</p>
                            <button className='clickable hr-flex-start' onClick={(event) => {
                                event.preventDefault()
                                event.stopPropagation()
                                navigate(`/campaign/${campaigns.campaignId}/proposals`)
                            }} style={{ textAlign: 'right', float: 'right' }} >view proposal</button>
                            <Box height="10" />
                            <div className="hr-flex-start">
                                <p className="p-result" style={(campaigns.status === '0' || campaigns.status === '1' || campaigns.status === '2') ? { '--res-color': 'var(--primary)' } : { '--res-color': 'rgba(0,0,0,0.5)' }}>
                                    {getStatus(campaigns.status)}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Campaigns;
