import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import "./admin-action.scss"
import { useConnection } from '../../../connectionProvider/connection_provider';
import { Box } from '../../Box';

function AdminAction() {

  const { connectionState, connectWallet, owner, setOwnable } = useConnection();
  const { accounts } = connectionState;
  const navigate = useNavigate();


  useEffect(() => {
    setOwnable()
    // eslint-disable-next-line 
  }, [accounts])

  return (
    <div>
      <div className="back-btn" onClick={() => {
        navigate(-1);
      }}>← Back To Overview</div>
      <div className="hr-flex" style={{ color: "red" }}>
        <br /> <br />
        <p className='moving-text'>You cant remove your self from admin, Admin can promotes others to Admins</p>
      </div>
      <div style={{ marginTop: 25, textAlign: "center" }}>
        {accounts.length > 0 && <button style={{ background: "darkgreen" }} className='clickable' onClick={() => navigate('/campaign/manageAdmins/addAdmin/')}> Add Admin</button>}
        <Box height="10" />
        {accounts.length > 0 && <button style={{ background: "red" }} className='clickable' onClick={() => navigate('/campaign/manageAdmins/removeAdmin/')}> remove admin</button>}
        <Box height="10" />
        {accounts.length > 0 && owner && <button style={{ background: "purple" }} className='clickable' onClick={() => navigate('/campaign/manageAdmins/setOwnableAddress/')}> Set Ownable Contract</button>}
        {accounts.length <= 0 && <button style={{ background: "purple" }} className='clickable' onClick={() => connectWallet()}> Connect wallet</button>}
      </div>

    </div>
  )
}

export default AdminAction