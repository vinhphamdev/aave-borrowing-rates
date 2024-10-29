import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { debounce } from "lodash";
import { AAVE_ABI } from "./AAVE_ABI";

const AAVE_LENDING_POOL_ADDRESS = "0x41393e5e337606dc3821075Af65AeE84D7688CBD";

const assets = [
  {
    symbol: "USDC",
    address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    logo: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
    decimals: 6,
  },
  {
    symbol: "DAI",
    address: "0x6b175474e89094c44da98b954eedeac495271d0f",
    logo: "https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png",
    decimals: 18,
  },
  {
    symbol: "USDT",
    address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    logo: "https://cryptologos.cc/logos/tether-usdt-logo.png",
    decimals: 6,
  },
  {
    symbol: "WETH",
    address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
    decimals: 18,
  },
  {
    symbol: "WBTC",
    address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
    logo: "https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.png",
    decimals: 8,
  },
  {
    symbol: "AAVE",
    address: "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9",
    logo: "https://cryptologos.cc/logos/aave-aave-logo.png",
    decimals: 18,
  },
  {
    symbol: "LINK",
    address: "0x514910771af9ca656af840dff83e8264ecf986ca",
    logo: "https://cryptologos.cc/logos/chainlink-link-logo.png",
    decimals: 18,
  },
  {
    symbol: "UNI",
    address: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
    logo: "https://cryptologos.cc/logos/uniswap-uni-logo.png",
    decimals: 18,
  },
];

const BorrowingRates = () => {
  const [rates, setRates] = useState([]);
  const [error, setError] = useState(null);
  const [provider, setProvider] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [blockNumber, setBlockNumber] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
    if (provider && autoRefresh) {
      fetchBorrowingRates(provider);

      provider.on("block", (blockNumber) => {
        setBlockNumber(blockNumber);
        debouncedFetchRates(provider);
      });

      return () => {
        provider.removeAllListeners("block");
        debouncedFetchRates.cancel();
      };
    }
  }, [provider, autoRefresh]);

  const debouncedFetchRates = debounce((provider) => {
    fetchBorrowingRates(provider);
  }, 1000);

  const checkIfWalletIsConnected = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
          const ethersProvider = new ethers.providers.Web3Provider(
            window.ethereum
          );
          setProvider(ethersProvider);
          await fetchBorrowingRates(ethersProvider);
        }
      }
    } catch (error) {
      console.error("Error checking wallet connection:", error);
      setError(error.message);
    }
  };

  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
        setIsConnected(true);
        const ethersProvider = new ethers.providers.Web3Provider(
          window.ethereum
        );
        setProvider(ethersProvider);
        await fetchBorrowingRates(ethersProvider);
      } else {
        setError("Please install MetaMask!");
      }
    } catch (error) {
      console.error("Error connecting to wallet:", error);
      setError(error.message);
    }
  };

  const fetchBorrowingRates = async (ethersProvider) => {
    setIsLoading(true);
    try {
      const lendingPoolContract = new ethers.Contract(
        AAVE_LENDING_POOL_ADDRESS,
        AAVE_ABI,
        ethersProvider
      );
      const fetchedRates = [];

      for (const asset of assets) {
        try {
          const checksumAddress = ethers.utils.getAddress(asset.address);
          const reserveData = await lendingPoolContract.getReserveData(
            checksumAddress
          );

          const variableBorrowRate = ethers.utils.formatUnits(
            reserveData.variableBorrowRate,
            27
          );

          fetchedRates.push({
            ...asset,
            variableBorrowRate: (parseFloat(variableBorrowRate) * 100).toFixed(
              2
            ),
          });
        } catch (err) {
          console.error(`Error fetching data for ${asset.symbol}:`, err);
          setError(`Error fetching data for ${asset.symbol}: ${err.message}`);
        }
      }

      setRates(fetchedRates);
      setLastUpdate(new Date());
    } finally {
      setIsLoading(false);
    }
  };

  const LoadingSkeleton = () => (
    <tbody className="animate-pulse">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
        <tr key={index} className="border-b">
          <td className="py-2 px-4">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-gray-200 rounded-full mr-2"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          </td>
          <td className="py-2 px-4">
            <div className="flex justify-end">
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  );

  if (!isConnected) {
    return (
      <div className="container mx-auto p-4 text-center">
         <button
          onClick={connectWallet}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Aave V3 Borrowing Rates</h1>
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-4">
          {blockNumber && (
            <span className="text-sm text-gray-600">
              Current Block: {blockNumber}
            </span>
          )}
          <span className="text-sm">
            Connected: {account?.slice(0, 6)}...{account?.slice(-4)}
          </span>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="autoRefresh"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="autoRefresh" className="text-sm">Auto Refresh</label>
          </div>
          {lastUpdate && (
            <span className="text-sm text-gray-600">
              Last Update: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <div className="flex space-x-2">
            <button
              onClick={() => fetchBorrowingRates(provider)}
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm disabled:opacity-50"
            >
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={() => {
                setIsConnected(false);
                setAccount(null);
                setProvider(null);
                setRates([]);
              }}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-sm"
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="py-3 px-6">
                Asset
              </th>
              <th scope="col" className="py-3 px-6 text-right">
                Variable Borrow Rate
              </th>
            </tr>
          </thead>
          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <tbody>
              {rates.map((rate, index) => (
                <tr key={index} className="bg-white border-b">
                  <td className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={rate.logo}
                        alt={rate.symbol}
                        className="w-6 h-6 mr-2"
                      />
                      <span>{rate.symbol}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    {rate.variableBorrowRate}%
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>
    </div>
  );
};

export default BorrowingRates;