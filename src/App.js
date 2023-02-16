import { BrowserRouter, Routes } from "react-router-dom";
import { useConnection } from './connectionProvider/connection_provider';
import NavigationBar from "./components/navbar/NavigationBar";
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
        </Routes>
      </BrowserRouter>
    </div>
  )

}

export default App;
