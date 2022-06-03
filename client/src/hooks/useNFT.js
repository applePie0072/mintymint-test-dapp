import { useEffect, useMemo, useState } from 'react';
import { useNFTContract } from './useContracts';

const address0 = '0x0000000000000000000000000000000000000000';

export const useNFTs = (contractAddress) => {
  const nftContract = useNFTContract(contractAddress);
  const [totalSupply, setTotalSupply] = useState(0);
  const [data, setData] = useState([]);

  const tokenIds = useMemo(() => {
    if (totalSupply) {
      const ids = [];
      for (let index = 0; index < totalSupply; index++) {
        ids.push(index);
      }
      return ids;
    } else {
      return [];
    }
  }, [totalSupply]);

  console.log(tokenIds);

  useEffect(() => {
    (async () => {
      try {
        if (nftContract) {
          const _totalSupply = await nftContract.methods.totalSupply().call();
          setTotalSupply(_totalSupply);
        } else return 0;
      } catch {
        return 0;
      }
    })();
  }, [nftContract]);

  useEffect(() => {
    (async () => {
      if (nftContract && totalSupply) {
        const data = await Promise.all(
          tokenIds.map(async (index) => {
            try {
              const id = await nftContract.methods.tokenByIndex(index).call();
              const tokenURI = await nftContract.methods.tokenURI(id).call();
              const metadata = await fetch(tokenURI)
                .then((response) => {
                  return response.json();
                })
                .then((data) => data)
                .catch(() => {});
              const owner = await nftContract.methods
                .ownerOf(id.toString())
                .call();
              if (owner === address0) return null;
              const cost = await nftContract.methods.cost().call();
              return {
                owner,
                id,
                address: contractAddress,
                metadata,
                cost: cost / Math.pow(10, 18),
              };
            } catch {
              return null;
            }
          })
        );
        setData(data.filter((item) => item));
      }
    })();
  }, [totalSupply, nftContract, tokenIds, contractAddress]);
  return data;
};

export const useCollection = (address) => {
  const [collection, setCollection] = useState([]);
  const nftContract = useNFTContract(address);

  useEffect(() => {
    if (nftContract) {
      (async () => {
        try {
          const symbol = await nftContract.methods.symbol().call();
          const name = await nftContract.methods.name().call();
          const cost = await nftContract.methods.cost().call();
          setCollection({
            symbol,
            name,
            cost,
          });
        } catch {}
      })();
    }
  });
  return collection;
};
