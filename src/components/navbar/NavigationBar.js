import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { supportedNetworks, useConnection } from '../../connectionProvider/connection_provider';
import { Box } from '../Box';
import Chip from '../../chip/Chip';
import './navbar.scss'

function NavigationaBar() {
    const { connectionState, connectWallet, DisconnectWallet } = useConnection();
    const { accounts, chainId } = connectionState;

    const navigate = useNavigate();

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
                                onclick={connectWallet}
                                bgColor="var(--accent)" textColor="green"
                                content="Connect Wallet"
                            />
                        }
                        <Box width = "10"/>
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