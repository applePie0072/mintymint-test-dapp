import React, { useEffect, useReducer } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Marketplace from './pages/Marketplace';
import GetUSDC from './pages/GetUSDC';
import NFTs from './pages/NFTs';
import getWeb3 from './getWeb3';
import Web3Context from './context';

const reducer = (state, action) => {
  return { ...state, ...action };
};

export default function () {
  const [state, setState] = useReducer(reducer, {
    web3: null,
    accounts: null,
    networkId: null,
  });

  useEffect(() => {
    (async () => {
      try {
        // Get network provider and web3 instance.
        const web3 = await getWeb3();

        // Use web3 to get the user's accounts.
        const accounts = await web3.eth.getAccounts();

        // Get the contract instance.
        const networkId = await web3.eth.net.getId();

        window.ethereum.on('accountsChanged', function (accounts) {
          // Time to reload your interface with accounts[0]!
          setState({ accounts });
        });

        // Set web3, accounts, and contract to the state, and then proceed with an
        // example of interacting with the contract's methods.
        setState({ web3, accounts, networkId });
      } catch (error) {
        // Catch any errors for any of the above operations.
        alert(
          `Failed to load web3, accounts, or contract. Check console for details.`
        );
        console.error(error);
      }
    })();
  }, []);

  return (
    <Web3Context.Provider value={state}>
      <Router>
        <Routes>
          <Route path='/' element={<Marketplace />} />
          <Route path='/get-usdc' element={<GetUSDC />} />
          <Route path='collection/:address' element={<NFTs />} />
        </Routes>
      </Router>
    </Web3Context.Provider>
  );
}
