import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import NFT from '../components/NFT';
import Web3Context from '../context';
import { USDC } from '../contracts/tokens';
import { useNFTContract } from '../hooks/useContracts';
import { useNFTs } from '../hooks/useNFT';
import { NFTsWrapper } from '../styles/NFT';

const NFTs = () => {
  const { address } = useParams();
  const tokens = useNFTs(address);
  const { accounts } = useContext(Web3Context);

  const [mintValue, setMintValue] = useState('');
  const [owner, setOwner] = useState('');

  const nftContract = useNFTContract(address);

  useEffect(() => {
    (async () => {
      if (nftContract) {
        nftContract.methods
          .owner()
          .call()
          .then((_owner) => {
            setOwner(_owner);
          });
      }
    })();
  });

  const handleMint = useCallback(() => {
    if (nftContract) {
      nftContract.methods
        .mint(mintValue?.toString())
        .send({ from: accounts[0] });
    }
  }, [nftContract, accounts, mintValue]);

  return (
    <>
      {accounts?.[0] === owner && (
        <>
          <input
            value={mintValue}
            onChange={(e) => setMintValue(e.target.value)}
          />
          <button onClick={handleMint}>Mint</button>
        </>
      )}
      <NFTsWrapper>
        {tokens
          ? tokens?.map((token) => (
              <NFT
                contractAddress={address}
                tokenId={token.id}
                owner={token.owner}
              />
            ))
          : null}
      </NFTsWrapper>
    </>
  );
};

export default NFTs;
