import { React, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useConnection } from '../../../connectionProvider/connection_provider';
import { Box } from '../../Box';
import Loading from '../../loading/Loading';
import Web3 from 'web3';

function RemoveAdmin() {
    const { connectionState, connectWallet } = useConnection();
    const { accounts, ownableContract } = connectionState;

    const [erc20Address, setErc20Address] = useState("");
    const [isLoading, setLoading] = useState(false);

    // For validation errors
    const [error, setError] = useState({ erc20Address: null, button: null });

    const navigate = useNavigate();

    // const { campaignIndex } = useParams()

    const handleRemoveAdmin = async () => {
        let f = false;
        if (erc20Address === "") {
            setError({ erc20Address: "Please fill this feild" });
            f = true
        }
        if (erc20Address.length > 0) {
            let isErc20 = Web3.utils.isAddress(erc20Address);
            if (isErc20) {
                f = false;
            }
            else {
                setError({ erc20Address: "given input is not an ERC20 Address" });
                f = true;
            }
        }
        if (f) return;

        setError({});
        setLoading(true);
        try {
            if (window.confirm(`do you want remove ${erc20Address.substring(0, 5) + '...' + erc20Address.substring(erc20Address.length - 4, erc20Address.length)} from the admin`)) {
                let isAdmin = await ownableContract.methods.admin(erc20Address).call()
                if (!isAdmin)
                    throw new Error(" Given address is not a admin")
                else {
                    await ownableContract.methods.removeWhitelistedAdmin(erc20Address).send({ from: accounts[0] })
                    setError({ button: "given address not founded in the admin panel" });
                }
            }

        } catch (e) {
            if (e.code === 4001) {
                setError({ button: "Denied Metamask Transaction Signature" });
            } else {
                setError({ button: e.message });
            }
        }
        setLoading(false);
        setErc20Address(erc20Address)
    };

    if (isLoading) {
        return <Loading text='Removing admin from Admin panel' />
    }
    return (
        <div>
            <submit className="back-btn" onClick={() => {
                navigate(-1);
            }}>← Back To Overview</submit>

            <div className="container create-proposal">

                <div className="heading title">Remove Admin from the panel</div>
                <div className="proposal-box" >
                    <label>Address</label>
                    <div className="textfield" >
                        <input onChange={e => setErc20Address(e.target.value)} type="text" placeholder="Enter the address" />
                    </div>
                    <p className="error">{error.erc20Address}</p>

                    <Box height="20"></Box>

                    <button
                        className="clickable"
                        onClick={() => {
                            if (accounts.length > 0) {
                                handleRemoveAdmin()
                            } else {
                                connectWallet()
                            }
                        }}
                    >
                        {accounts.length > 0 ? `Remove Admin` : 'connect your wallet'}
                    </button>

                    {error.button && <Box height="10" />}
                    <p className="error">{error.button}</p>
                </div>
            </div>
        </div>
    )
}

export default RemoveAdmin