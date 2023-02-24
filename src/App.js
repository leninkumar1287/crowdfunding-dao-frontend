import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useConnection } from './connectionProvider/connection_provider';
import NavigationBar from "./components/navbar/NavigationBar";
import Campaigns from "./components/pages/campaigns/Campaigns";
import CreateCampaign from "./components/pages/createCampaigns/CreateCampaign";
import CampainsView from "./components/pages/campaign_view_page/CampaignView.js"
import Stripe from "./components/pages/contribute/stripeContainer";
import Checkout from "./components/pages/contribute/Checkout";
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
          <Route path="/campaign/paymentPage/:index" element={<Stripe />} />
          <Route path="/campaign/viewCampaign/:index" element={<CampainsView />} />
          <Route path="/contribute/checkout/:index" element={<Checkout />} />
        </Routes>
      </BrowserRouter>
    </div>
  )

}

export default App;
