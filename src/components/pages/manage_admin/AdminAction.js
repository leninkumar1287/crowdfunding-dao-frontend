import React from 'react'
import { useNavigate } from 'react-router-dom';
import "./admin-action.scss"

function AdminAction() {
  const navigate = useNavigate();
  return (
    <div>
      <div className="back-btn" onClick={() => {
        navigate(-1);
      }}>← Back To Overview</div>
      <div className="hr-flex" style={{ color: "red" }}>
        <br /> <br />
        <p className='moving-text'>You cant remove your self from admin, Admin can promotes others to Admins</p>
      </div>
      <div style={{marginTop:25, textAlign: "center" }}>
        <button style={{ background: "darkgreen" }} className='clickable' onClick={() => navigate('/campaign/manageAdmin/addAdmin/')}> Add Admin</button>
        <> </>
        <button style={{ background: "red" }} className='clickable' onClick={() => navigate('/campaign/manageAdmin/removeAdmin/')}> remove admin</button>
      </div>
    </div>
  )
}

export default AdminAction