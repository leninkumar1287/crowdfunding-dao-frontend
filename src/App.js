import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useConnection } from './connectionProvider/connection_provider';
import NavigationBar from "./components/navbar/NavigationBar";
import Campaigns from "./components/pages/campaigns/Campaigns";
import CreateCampaign from "./components/pages/createCampaigns/CreateCampaign";
import CampaignView from "./components/pages/campaign_view_page/CampaignView.js"

function App() {
  const  {connectionState}  = useConnection();

  const { error } = connectionState;

  if (error) {
    return <div className="backdrop"><p>{error}</p></div>
  }
  return (
      
    <div>
      <BrowserRouter>
        <NavigationBar/>
        <Routes>
        <Route path="/" element={<Campaigns />} />
        <Route path="/campaigns/createCampaigns" element={<CreateCampaign/>} />
        <Route path="/contribution/contribute/:index" element={<CampaignView/>} />

        </Routes>
      </BrowserRouter>
    </div>
  )

}

export default App;
