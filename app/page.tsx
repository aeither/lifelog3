"use client";

import { Button } from "@/components/ui/button";
import {
  ComethProvider,
  ComethWallet,
  ConnectAdaptor,
  RelayTransactionResponse,
  SupportedNetworks,
} from "@cometh/connect-sdk";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import countContractAbi from "../lib/contract/counterABI.json";
import { Loader2 } from "lucide-react";
import { ScrollSepoliaTestnet } from "@thirdweb-dev/chains";
import { ThirdwebProvider, useContract, useMintNFT } from "@thirdweb-dev/react";

const COUNTER_CONTRACT_ADDRESS = "0x3633A1bE570fBD902D10aC6ADd65BB11FC914624";

if (!process.env.NEXT_PUBLIC_COMETH_API_KEY)
  throw new Error("NEXT_PUBLIC_COMETH_API_KEY not found");
const NEXT_PUBLIC_COMETH_API_KEY = process.env.NEXT_PUBLIC_COMETH_API_KEY;

if (!process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID)
  throw new Error("NEXT_PUBLIC_THIRDWEB_CLIENT_ID not found");
const NEXT_PUBLIC_THIRDWEB_CLIENT_ID =
  process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;

const connect = async () => {
  const walletAdaptor = new ConnectAdaptor({
    chainId: SupportedNetworks.MUMBAI,
    apiKey: NEXT_PUBLIC_COMETH_API_KEY,
  });

  const instance = new ComethWallet({
    authAdapter: walletAdaptor,
    apiKey: NEXT_PUBLIC_COMETH_API_KEY,
  });

  const localStorageAddress = window.localStorage.getItem("walletAddress");

  if (localStorageAddress) {
    console.log(
      "🚀 ~ file: page.tsx:26 ~ connect ~ localStorageAddress:",
      localStorageAddress
    );
    await instance.connect(localStorageAddress);
  } else {
    console.log("seon", localStorageAddress);
    await instance.connect();
    const walletAddress = await instance.getAddress();
    window.localStorage.setItem("walletAddress", walletAddress);
  }

  const instanceProvider = new ComethProvider(instance);

  const contract = new ethers.Contract(
    COUNTER_CONTRACT_ADDRESS,
    countContractAbi,
    instanceProvider.getSigner()
  );

  return { wallet: instance, provider: instanceProvider, contract };
};

const MintNFTButton = () => {
  const { contract: nftContract, isLoading: nftContractLoading } = useContract(
    "0x73C57F4f764516C940c5396890672EcaCDd8503B"
  );
  const { mutate: mintNft, isLoading, error } = useMintNFT(nftContract);

  if (error) {
    console.error("failed to mint NFT", error);
  }

  return (
    <button
      disabled={isLoading}
      onClick={() => {
        const metadata = {
          name: "LifeLog Date()",
          description: "log content",
          image: "https://i.imgur.com/wFrLRk4.png", // This can be an image url or file
        };
        mintNft({
          metadata: metadata,
          to: "0xf2e9703ec4A5Ccf9Af9D9200910f877632374acc",
        });
      }}
    >
      Mint!
    </button>
  );
};

export default function Home() {
  const [contract, setContract] = useState<ethers.Contract>();
  const [wallet, setWallet] = useState<ComethWallet>();
  const [provider, setProvider] = useState<ComethProvider>();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const connectWallet = async () => {
    setIsLoading(true);
    try {
      const { contract, provider, wallet } = await connect();

      setWallet(wallet);
      setProvider(provider);
      setContract(contract);

      setIsConnected(true);
    } catch (e) {
      console.error((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestTransaction = async () => {
    console.log("sendTestTransaction");
    setIsLoading(true);
    try {
      if (!wallet) throw new Error("No wallet instance");

      const tx: RelayTransactionResponse = await contract!.count();

      const txResponse = await tx.wait();
      console.log(
        "🚀 ~ file: page.tsx:90 ~ sendTestTransaction ~ txResponse:",
        txResponse
      );

      const balance = await contract!.counters(wallet.getAddress());
      console.log(
        "🚀 ~ file: page.tsx:92 ~ sendTestTransaction ~ balance:",
        balance
      );
    } catch (e) {
      console.log("Error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (wallet) {
      (async () => {
        const balance = await contract!.counters(wallet.getAddress());
        console.log("🚀 ~ file: page.tsx:86 ~ balance:", Number(balance));
      })();
    }
  }, [wallet]);

  return (
    <ThirdwebProvider
      activeChain={ScrollSepoliaTestnet}
      clientId={NEXT_PUBLIC_THIRDWEB_CLIENT_ID} // You can get a client id from dashboard settings
    >
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
          DeFi App
        </h2>
        <div>Chain ID: {wallet?.chainId}</div>
        {isConnected ? (
          <>
            <Button
              disabled={isLoading}
              onClick={async () => {
                await sendTestTransaction();
              }}
            >
              Add Count
            </Button>
            <Button
              variant={"destructive"}
              onClick={async () => {
                await wallet!.logout();

                setIsConnected(false);
              }}
            >
              Disconnnect
            </Button>
          </>
        ) : (
          <Button
            disabled={isLoading}
            onClick={async () => {
              await connectWallet();
            }}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting
              </>
            ) : (
              "Connect"
            )}
          </Button>
        )}
      </main>
    </ThirdwebProvider>
  );
}
