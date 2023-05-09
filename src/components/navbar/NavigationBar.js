import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { supportedNetworks, useConnection } from '../../connectionProvider/connection_provider';
import { Box } from '../Box';
import Chip from '../../chip/Chip';
import './navbar.scss'

function NavigationaBar() {
    const { connectionState, connectWallet, DisconnectWallet } = useConnection();
    const { accounts, chainId, crowdFundingContract,ownableContract } = connectionState;
    const [isOwnerOfOwnableContract, setIsOwnerOwnerOfOwnableContract] = useState()

    const navigate = useNavigate();


    async function setOwnerContractAddress() {
        try {
    console.log("isOwnerOfOwnableContract :",isOwnerOfOwnableContract)

            console.log("accounts[0] :", accounts[0])
            let response = await crowdFundingContract
            let make = await ownableContract.methods.admin(accounts[0]).call()
            console.log("resasaddaadponse :", make)
            setIsOwnerOwnerOfOwnableContract(response)
            // console.log("isOwnerOfOwnableContract :",isOwnerOfOwnableContract)

        } catch (error) {
            console.log("error message  : ", error.message)
        }
    }

    async function checkOwnableSetter() {
        let response = await crowdFundingContract.methods.setOwnable(accounts[0]).call()
        console.log("crowdFunding :", response)
        if (response) return true;
        else return false;
    }
    useEffect(() => {
        Array.from(document.getElementsByClassName('nav-option')).forEach(element => {
            element.addEventListener('click', () => {
                element.setAttribute('class', 'nav-option nav-option-c')
            })
        });
    }, []);

    return (
        <div>
            <div id="box"></div>
            <nav className="no-select">
                <div className="logo">CrowdFunding DAO</div>
                <div className="nav-menu">
                    <Box width="20" />
                    <div id="g" onClick={() => { navigate('/') }} className="nav-option" >Crowd Funding Campaigns</div>
                </div>
                <div className="nav-btn-flex">

                    {(accounts.length > 0 && checkOwnableSetter()) &&
                        <Chip bgColor="var(--accent)" textColor="yellow" content={"Ownable Address setted"} alt="placed" />
                    }

                    <Box width="10" />

                    {
                        (accounts.length > 0 && checkOwnableSetter()) &&
                        <Chip
                            onclick={setOwnerContractAddress}
                            bgColor="var(--accent)" textColor="yellow"
                            content="set ownable contract" />
                    }

                    <Box width="10" />

                    {accounts.length > 0 ?
                        <Chip bgColor="var(--accent)" textColor="yellow" content={supportedNetworks[chainId].name} /> :
                        <div></div>
                    }
                    <Box width="10" />

                    {accounts.length > 0 ?
                        <Chip bgColor="var(--accent)" textColor="yellow" content={"address : " +
                            accounts[0].substring(0, 5) + '...' + accounts[0].substring(accounts[0].length - 3, accounts[0].length)
                        } /> :
                        <Chip
                            onclick={() => {
                                connectWallet()
                                setOwnerContractAddress()
                            }
                            }
                            bgColor="var(--accent)" textColor="green"
                            content="Connect Wallet"
                        />
                    }
                    <Box width="10" />
                    {accounts.length > 0 &&
                        <Chip
                            onclick={DisconnectWallet}
                            bgColor="var(--accent)" textColor="red"
                            content="Drop connection"
                        />}
                </div>
            </nav>
        </div>
    );
}

export default NavigationaBar;