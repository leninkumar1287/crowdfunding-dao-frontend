import React, { useContext, useEffect, useState } from 'react';
import Web3 from "web3";
import crowdFunding from "../contracts/CrowdFunding.json";
import dao from "../contracts/Dao.json"
const defaultChainId = 80001;
export const supportedNetworks = {
    1337: {
        name: 'Ganache Local',
        tokenSymbol: 'ETH',
        rpcURL: 'http://localhost:7545',
        crowdFundingContract: crowdFunding.networks[1337] ? crowdFunding.networks[1337].address : '',
        daoContract: dao.networks[1337] ? dao.networks[1337].address : ''
    },
    80001: {
        name: 'Mumbai Polygon Testnet',
        tokenSymbol: 'MATIC',
        rpcURL: 'https://rpc-mumbai.maticvigil.com/',
        crowdFundingContract: crowdFunding.networks[80001] ? crowdFunding.networks[80001].address : '',
        daoContract: dao.networks[80001] ? dao.networks[80001].address : ''
    }
}
const ConnectionContext = React.createContext();

export function useConnection() {
    return useContext(ConnectionContext);
}
export function ConnectionProvider(props) {

    const [connectionState, setConnectionState] = useState({
        web3: null,
        chainId: defaultChainId,
        accounts: [],
        crowdFundingContract: null,
        daoContract: null,
        error: null,
    });

    const initiate = async () => {
        try {
            // Use local web3 object by default before user connects metamask
            const provider = new Web3.providers.HttpProvider(supportedNetworks[defaultChainId].rpcURL);
            const web3 = new Web3(provider);

            const crowdFundingContract = new web3.eth.Contract(
                crowdFunding.abi,
                supportedNetworks[defaultChainId].crowdFundingContract
            );
            const daoContract = new web3.eth.Contract(
                dao.abi,
                supportedNetworks[defaultChainId].daoContract
            )

            setConnectionState({ ...connectionState, web3, crowdFundingContract, daoContract });
        } catch (e) {
            console.log("useConnection : initiate Error -> ", e.toString());
            setConnectionState({ ...connectionState, error: e.toString() });
        }
    };

    const connectWallet = async () => {
        try {
            if (!window.ethereum) {
                throw new Error("Browser Wallet Not Found");
            }
            const web3 = new Web3(window.ethereum);
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const chainId = await web3.eth.net.getId();
            if (!supportedNetworks[chainId]) {
                throw new Error("Use Correct Network")
            }
            const crowdFundingContract = new web3.eth.Contract(
                crowdFunding.abi,
                supportedNetworks[chainId].crowdFundingContract
            );

            const daoContract = new web3.eth.Contract(
                dao.abi,
                supportedNetworks[defaultChainId].daoContract
            )

            setConnectionState({ ...connectionState, web3, accounts, chainId, crowdFundingContract,daoContract });
        } catch (e) {
            if (e.code === 4001) {
                // eslint-disable-next-line 
                e = 'Denied Browser Wallet Access';
            }
            console.log("useConnection : connectWallet Error -> ", e.toString());
            setConnectionState({ ...connectionState, error: e.toString() });
        }
    }

    const DisconnectWallet = () => {
        setConnectionState({
            ...connectionState, web3: null,
            chainId: defaultChainId,
            accounts: [],
            crowdFundingContract: null,
            daoContract: null,
            error: null
        });
    }

    useEffect(()=>{
        initiate()

        if (window.ethereum) {
            // Detect metamask account change
            window.ethereum.on('accountsChanged', async function (_accounts) {
                setConnectionState({ ...connectionState, accounts: _accounts })
                connectWallet()
            })

            // Detect metamask network change
            window.ethereum.on('chainChanged', function (networkId) {
                setConnectionState({ ...connectionState, accounts: networkId })
                connectWallet();
            });
        }
        // eslint-disable-next-line 
    },[])

    return (
        <>
            <ConnectionContext.Provider value={{ connectionState, setConnectionState, connectWallet, DisconnectWallet }}>
                {props.children}
            </ConnectionContext.Provider>
        </>
    );
}