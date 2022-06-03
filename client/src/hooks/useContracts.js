import { useContext, useMemo, useState } from 'react';
import Airplane from '../contracts/Airplane.json';
import Marketplace from '../contracts/Marketplace.json';
import XYZToken from '../contracts/XYZToken.json';
import { marketplaceAddress, USDC } from '../contracts/tokens.js';
import Web3Context from '../context';

export const useContract = (address, abi) => {
  const { web3 } = useContext(Web3Context);

  return useMemo(() => {
    try {
      if (web3) {
        const contract = new web3.eth.Contract(abi, address);
        if (contract) return contract;
        else return null;
      } else {
        return null;
      }
    } catch (err) {
      console.log(err.message);
      return null;
    }
  }, [web3, address, abi]);
};

export const useMarketplaceContract = () => {
  return useContract(marketplaceAddress, Marketplace.abi);
};

export const useUSDCContract = () => {
  return useContract(USDC.address, XYZToken.abi);
};

export const useNFTContract = (address) => {
  return useContract(address, Airplane.abi);
};
