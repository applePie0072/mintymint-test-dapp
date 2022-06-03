import React, { useCallback, useContext, useState, useEffect } from 'react';
import Web3Context from '../context';
import { useUSDCContract } from '../hooks/useContracts';
import { USDC } from '../contracts/tokens.js';

const NFTs = () => {
  const { accounts } = useContext(Web3Context);
  const [address, setAddress] = useState('');
  const [value, setValue] = useState('');
  const [owner, setOwner] = useState('');
  const USDCContract = useUSDCContract();

  const handleGetUSDC = useCallback(() => {
    try {
      if (USDCContract) {
        USDCContract.methods
          .mint(address, (value * Math.pow(10, USDC.decimals)).toString())
          .send({ from: accounts[0] });
      }
    } catch {}
  }, [address, USDCContract, accounts]);

  return (
    <>
      <div>
        <label>Address</label>
        <input value={address} onChange={(e) => setAddress(e.target.value)} />
        <label>Value</label>
        <input value={value} onChange={(e) => setValue(e.target.value)} />
        <button onClick={handleGetUSDC}>Mint</button>
      </div>
    </>
  );
};

export default NFTs;
