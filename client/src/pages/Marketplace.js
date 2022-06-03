import React from 'react';
import NFT from '../components/NFT';
import { useListItems } from '../hooks/useMarketplace';
import { NFTsWrapper } from '../styles/NFT';

const Marketplace = () => {
  const tokens = useListItems();

  return (
    <NFTsWrapper>
      {tokens
        ? tokens?.map(({ address, id, seller }, index) => (
            <NFT
              key={index}
              owner={seller}
              contractAddress={address}
              tokenId={id}
            />
          ))
        : null}
    </NFTsWrapper>
  );
};

export default Marketplace;
