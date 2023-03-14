import React, { useEffect, useState } from 'react';
import '../campaigns/Campaigns.scss';
import Loading from '../../loading/Loading';
import { Box } from '../../Box';
import { useNavigate, useParams } from 'react-router';
import { useConnection } from '../../../connectionProvider/connection_provider';

function ProposalPage() {
    const { connectionState } = useConnection();
    const { accounts, daoContract } = connectionState;
    const { campaignIndex } = useParams();
    const [isLoading, setLoading] = useState(false);
    const stateValues = ["Live", "Passed", "Rejected", "Draw"];
    const navigate = useNavigate();
    // List of polls for home page
    const [proposalList, setProposalList] = useState([]);

    const getStatus = (state) => {
        if (state === 'Live') return 'Voting'
        if (state === 'Passed') return 'Passed'
        if (state === 'Failed') return 'Rejected'
        if (state === 'Draw') return 'Draw'
    }

    // const [campaignContractAddress, setCampaignContractAddress] = useState([])

    async function fetchData() {
        if (daoContract != null) {
            setLoading(true);
            // Fetch number of polls
            const proposalCount = await daoContract.methods.proposalCount().call();
            // Fetch all polls overview
            let tempList = [];
            for (let i = proposalCount; i > 0; i--) {
                const proposal = await daoContract.methods.proposals(campaignIndex, i).call();
                if (proposal.proposer === "0x0000000000000000000000000000000000000000") {
                    continue
                }
                else {
                    const proposal = await daoContract.methods.proposals(campaignIndex, i).call();
                    const state = await daoContract.methods.stateOfTheProposal(i, campaignIndex).call();
                    proposal.index = i;
                    proposal.campaignIndex = campaignIndex;
                    proposal.state = stateValues[state];
                    tempList.push(proposal)
                    JSON.stringify(tempList)
                }
            }
            setProposalList(tempList);
            setLoading(false);
            return
        }
    }

    // On load, refresh and accounts changed Refetch
    useEffect(() => {
        fetchData();
        // eslint-disable-next-line 
    }, [accounts, daoContract]);

    if (isLoading) {
        return <Loading text='Loading All Proposals' />;
    }

    return (
        <div className="g-page">
            <div className="back-btn" onClick={() => {
                navigate(-1);
            }}>← Back To Overview</div>
            <br />
            <div className="hr-flex">
                <h3 className="heading" style={{ color: "darkmagenta" }}>Voting Proposals</h3>
            </div>
            <div className="p-list">
                {proposalList.length === 0 ?
                    <div className='subtitle' style={{ textAlign: 'center' }}>No Proposals Created</div>
                    : <div className="subtitle">All Proposals</div>}
                {proposalList.map((proposal, idx) => (
                    <div key={idx} className="p-list-tile" onClick={() => { navigate(`/campaign/${campaignIndex}/proposals/${proposal.index}`) }}>
                        <div className="p-left">
                            <p className="p-title">{proposal.title}</p>
                            <Box height="10" />
                            <div className="hr-flex-start">
                                <p className="p-result" style={(proposal.state === 'Live' || proposal.state === 'Passed') ? { '--res-color': 'var(--primary)' } : { '--res-color': 'rgba(0,0,0,0.5)' }}>{proposal.state}</p>
                                <Box width="20" />
                                <p className="p-date">{new Date(parseInt(proposal.dateOfCreation) * 1000).toLocaleString('default', { month: 'long', day: '2-digit', year: 'numeric' })}</p>
                            </div>
                        </div>
                        <p className="p-status">{parseInt(proposal.voterCount) === 0 ? "No votes" : getStatus(proposal.state)}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ProposalPage;
