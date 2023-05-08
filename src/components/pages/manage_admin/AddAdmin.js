import { React, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useConnection } from '../../../connectionProvider/connection_provider';
import { Box } from '../../Box';
import Loading from '../../loading/Loading';
import Web3 from 'web3';

function AddAdmin() {
    const { connectionState, connectWallet } = useConnection();
    const { accounts, ownableContract } = connectionState;

    const [address, setAddress] = useState("");
    const [isLoading, setLoading] = useState(false);

    // For validation errors
    const [error, setError] = useState({ address: null, button: null });

    const navigate = useNavigate();

    // const { campaignIndex } = useParams()

    const _setAdmin = async () => {
        let f = false;
        if (address === "") {
            setError({ address: "Please fill this feild" });
            f = true
        }
        if (address.length > 0) {
            let isErc20 = Web3.utils.isAddress(address);
            if (isErc20) {
                f = false;
            }
            else {
                setError({ address: "given input is not an ERC20 Address" });
                f = true;
            }
        }
        if (f) return;

        setError({});
        setLoading(true);

        try {
            if (window.confirm(`do you want promote ${address.substring(0, 5) + '...' + address.substring(address.length - 4, address.length)} to be an admin`)) {
                let isAdmin = await ownableContract.methods.admin(address).call()
                if (isAdmin)
                    throw new Error("Given address is already an admin")
                else {
                    let admin = await ownableContract.methods.addWhitelistedAdmin(address).send({ from: accounts[0] })
                    console.log("admin :", admin)
                    setLoading(false);
                    alert("admin promoted successfully")
                    console.log("")
                }
            }

        } catch (e) {
            if (e.code === 4001) {
                setError({ button: "Denied Metamask Transaction Signature" });
            } else {
                console.log("error :", e.length)
                setError({ button: e.message });
            }
        }
        setLoading(false);
        setAddress('')

    };

    useEffect(() => {
        setAddress('')
    }, [])

    if (isLoading) {
        return <Loading text='Adding the address to Admin panel' />
    }
    return (
        <div>
            <submit className="back-btn" onClick={() => {
                navigate(-1);
            }}>← Back To Overview</submit>

            <div className="container create-proposal">

                <div className="heading title">Add New Admin</div>
                <div className="proposal-box" >
                    <label>Address</label>
                    <div className="textfield" >
                        <input id='address' onChange={e => setAddress(e.target.value)} type="text" placeholder="Enter the address" />
                    </div>
                    <p className="error">{error.address}</p>

                    <Box height="20"></Box>

                    <button
                        className="clickable"
                        onClick={() => {
                            if (accounts.length > 0) {
                                _setAdmin()
                            } else {
                                connectWallet()
                            }
                        }}
                    >
                        {accounts.length > 0 ? 'update New Admin' : 'connect wallet'}
                    </button>

                    {error.button && <Box height="10" />}
                    <p className="error">{error.button}</p>
                </div>
            </div>
        </div>
    )
}

export default AddAdmin