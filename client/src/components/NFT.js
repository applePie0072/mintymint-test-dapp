import React, { useCallback, useContext, useEffect, useState } from 'react';
import Web3Context from '../context';
import { marketplaceAddress } from '../contracts/tokens';
import {
  useNFTContract,
  useMarketplaceContract,
  useUSDCContract,
} from '../hooks/useContracts';
import { useCollection } from '../hooks/useNFT';
import { NFTItemRoot } from '../styles/NFT';

const address0 = '0x0000000000000000000000000000000000000000';

const NFT = ({ contractAddress, tokenId, owner, cost }) => {
  const { accounts } = useContext(Web3Context);
  const collection = useCollection(contractAddress);
  const nftContract = useNFTContract(contractAddress);
  const marketplace = useMarketplaceContract();
  const USDC = useUSDCContract();

  const [seller, setSeller] = useState();

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
    if (USDC) {
      USDC.methods
        .approve(marketplaceAddress, '0xffffffffffffffffffffffffffffff')
        .send({ from: accounts[0] });
    }
  }, [USDC]);

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

  const checkListing = useCallback(() => {
    if (marketplace) {
      marketplace.methods
        .getTokenListing(contractAddress, tokenId)
        .call()
        .then((data) => {
          if (data && data.seller && data.seller !== address0)
            setSeller(data.seller);
        });
    }
  }, [marketplace]);

  useEffect(() => {
    checkListing();
  }, [checkListing]);

  const isListItem = Boolean(seller);
  const isMyList = owner?.toLowerCase() === seller?.toLowerCase();

  return (
    <NFTItemRoot>
      <div>
        <span>Name: </span>
        <span>{collection.name}</span>
      </div>
      <div>
        <span>Symbol: </span>
        <span>{collection.symbol}</span>
      </div>
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
        <span>Cost: </span>
        <span>{cost} USDC</span>
      </div>
      <div>
        {accounts?.[0]?.toLowerCase() === owner?.toLowerCase() ? (
          <>
            {!isListItem ? (
              <>
                <button onClick={handleApprove}>Approve</button>
                <button onClick={handleList}>List</button>
              </>
            ) : isMyList ? (
              <button onClick={handleDelist}>Remove</button>
            ) : null}
            <button onClick={handleBurn}>Burn</button>
          </>
        ) : isListItem ? (
          <>
            <button onClick={handleApproveUSDC}>Approve USDC</button>
            <button onClick={handleBuy}>Buy</button>
          </>
        ) : null}
      </div>
    </NFTItemRoot>
  );
};

export default NFT;
