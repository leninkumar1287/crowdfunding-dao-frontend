import { React, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useConnection } from '../../../connectionProvider/connection_provider';
import { Box } from '../../Box';
import Loading from '../../loading/Loading';
import Web3 from 'web3';
import CopyToClipboard from 'react-copy-to-clipboard';

function SetOwnable() {
    const { connectionState, connectWallet, owner, setOwnable } = useConnection();
    const { accounts, crowdFundingContract, ownableContract } = connectionState;

    const [erc20Address, setErc20Address] = useState("");
    const [isLoading, setLoading] = useState(false);

    // For validation errors
    const [error, setError] = useState({ erc20Address: null, button: null });

    const navigate = useNavigate();

    const [ownableContractAddress, setOwnableContractAddress] = useState("Text to copy");
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
        }, 1000);
    };

    const handleSetOwnableContractAddress = async () => {
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
            let set = await crowdFundingContract.methods.setOwnable(erc20Address).send({ from: accounts[0] })
            if (set) {
                alert("Now you can avail the all option's in this application")
                navigate("/campaign/manageAdmins")
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

    useEffect(() => {
        if (accounts.length > 0 && ownableContract) {
            setError({});
            setOwnable()
            setOwnableContractAddress(ownableContract._address)
        }
        // eslint-disable-next-line 
    }, [accounts, ownableContract])

    if (isLoading) {
        return <Loading text='Setting Ownable contract address' />
    }
    return (
        <div>
            <submit className="back-btn" onClick={() => {
                navigate(-1);
            }}>← Back To Overview</submit>
            {owner === true ?
                <div className="container create-proposal">

                    <div className="heading title">Set ownable contract address</div>
                    {accounts.length > 0 &&
                        <div>
                            <CopyToClipboard text={ownableContractAddress} onCopy={handleCopy}>
                                <button style={{ background: "purple" }}>copy address  </button>
                            </CopyToClipboard>
                            <span>{ownableContractAddress}</span>
                            {copied && <span style={{ color: "green" }}><Box width="10" />Copied!</span>}
                        </div>}

                    <div className="proposal-box" >
                        <label>Address</label>
                        <div className="textfield" >
                            <input onChange={e => setErc20Address(e.target.value)} type="text" placeholder="Enter the address" />
                        </div>
                        <p className="error">{error.erc20Address}</p>

                        <Box height="20"></Box>

                        <button
                            className="clickable" style={{ background: "purple" }}
                            onClick={() => {
                                if (accounts.length > 0) {
                                    handleSetOwnableContractAddress()
                                } else {
                                    connectWallet()
                                }
                            }}
                        >
                            {accounts.length > 0 ? `set address` : 'connect your wallet'}
                        </button>

                        {error.button && <Box height="10" />}
                        <p className="error">{error.button}</p>
                    </div>
                </div> : <div className='bolding'>You are not a owner, You can't </div>}
        </div >
    )
}

export default SetOwnable