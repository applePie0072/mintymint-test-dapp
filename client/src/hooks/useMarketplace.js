import React, { useEffect, useState } from 'react';
import { NFTContracts } from '../contracts/tokens';
import { useMarketplaceContract } from './useContracts';

export const useListItems = () => {
  const [listItems, setListItems] = useState([]);
  const contract = useMarketplaceContract();

  useEffect(() => {
    (async () => {
      if (contract) {
        const items = await Promise.all(
          NFTContracts.map(async (address) => {
            const totalNum = await contract.methods
              .numOfTokenListings(address)
              .call()
              .catch(() => 0);
            if (totalNum > 0) {
              const listItems = await contract.methods
                .getTokenListings(address, '0', totalNum)
                .call();
              return listItems.map((item) => ({
                ...item,
                id: item.tokenId,
                address,
              }));
            } else return [];
          })
        );
        setListItems(items.flat(1));
      }
    })();
  }, [contract]);

  console.log(listItems);

  return listItems;
};
