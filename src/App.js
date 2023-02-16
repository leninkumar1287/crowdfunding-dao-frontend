import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useConnection } from './connectionProvider/connection_provider';
import NavigationBar from "./components/navbar/NavigationBar";
import Campaigns from "./components/pages/campaigns/Campaigns";
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
        </Routes>
      </BrowserRouter>
    </div>
  )

}

export default App;
