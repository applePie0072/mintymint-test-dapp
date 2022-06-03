import React, { useCallback, useContext, useEffect } from 'react';
import Web3Context from '../context';
import { marketplaceAddress } from '../contracts/tokens';
import {
  useNFTContract,
  useMarketplaceContract,
  useUSDCContract,
} from '../hooks/useContracts';
import { NFTItemRoot } from '../styles/NFT';

const NFT = ({ contractAddress, tokenId, owner }) => {
  const { accounts } = useContext(Web3Context);
  const nftContract = useNFTContract(contractAddress);
  const marketplace = useMarketplaceContract();
  const USDC = useUSDCContract();

  const handleApprove = useCallback(() => {
    if (nftContract) {
      nftContract.methods
        .approve(marketplaceAddress, tokenId)
        .send({ from: accounts[0] });
    }
  }, [nftContract]);

  const handleList = useCallback(() => {
    if (marketplace) {
      marketplace.methods
        .listToken(contractAddress, tokenId)
        .send({ from: accounts[0] });
    }
  }, [marketplace]);

  const handleDelist = useCallback(() => {
    if (marketplace) {
      marketplace.methods
        .delistToken(contractAddress, tokenId)
        .send({ from: accounts[0] });
    }
  }, [marketplace]);

  const handleBuy = useCallback(() => {
    if (marketplace) {
      marketplace.methods
        .buyToken(contractAddress, tokenId)
        .send({ from: accounts[0] });
    }
  }, [marketplace]);

  const handleApproveUSDC = useCallback(() => {
    if (marketplace) {
      USDC.methods
        .approve(marketplaceAddress, '0xffffffffffffffffffffffffffffff')
        .send({ from: accounts[0] });
    }
  }, [marketplace]);

  const test = useCallback(() => {
    if (USDC) {
      USDC.methods
        .balanceOf(accounts[0])
        .call()
        .then((balance) => {
          console.log(balance);
        });
    }
  }, [USDC]);

  const handleBurn = useCallback(() => {
    if (nftContract) {
      nftContract.methods.burn(tokenId).send({ from: accounts[0] });
    }
  }, [nftContract]);

  useEffect(() => {
    test();
  }, [test]);

  return (
    <NFTItemRoot>
      <div>
        <span>Owner: </span>
        <span>{owner}</span>
      </div>
      <div>
        <span>Address: </span>
        <span>{contractAddress}</span>
      </div>
      <div>
        <span>Token Id: </span>
        <span>{tokenId}</span>
      </div>
      <div>
        {accounts?.[0]?.toLowerCase() === owner?.toLowerCase() ? (
          <>
            <button onClick={handleApprove}>Approve</button>
            <button onClick={handleList}>List</button>
            <button onClick={handleDelist}>Remove</button>
            <button onClick={handleBurn}>Burn</button>
          </>
        ) : (
          <>
            <button onClick={handleApproveUSDC}>Approve USDC</button>
            <button onClick={handleBuy}>Buy</button>
          </>
        )}
      </div>
    </NFTItemRoot>
  );
};

export default NFT;
