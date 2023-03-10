import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useConnection } from './connectionProvider/connection_provider';
import NavigationBar from "./components/navbar/NavigationBar";
import Campaigns from "./components/pages/campaigns/Campaigns";
import CreateCampaign from "./components/pages/createCampaigns/CreateCampaign";
import CampainsView from "./components/pages/campaign_view_page/CampaignView.js"
import CreateProposal from "./components/pages/create_proposal_page/CreateProposal";
import ProposalPage from "./components/pages/proposal_page/ProposalPage";
import VotingPages from "./components/pages/voting_page/VotingPage"
function App() {
  const { connectionState } = useConnection();

  const { error } = connectionState;

  if (error) {
    return <div className="backdrop"><p>{error}</p></div>
  }
  return (

    <div>
      <BrowserRouter>
        <NavigationBar />
        <Routes>
          <Route path="/" element={<Campaigns />} />
          <Route path="/campaigns/createCampaigns" element={<CreateCampaign />} />
          <Route path="/campaign/viewCampaign/:index" element={<CampainsView />} />
          <Route path="/campaign/:campaignIndex/createProposal/" element={<CreateProposal />} />
          <Route path="/campaign/:campaignIndex/proposals/" element={<ProposalPage />} />
          <Route path="/campaign/:campaignIndex/proposals/:proposalIndex" element={<VotingPages />} />

        </Routes>
      </BrowserRouter>
    </div>
  )

}

export default App;
