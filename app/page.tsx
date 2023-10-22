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
import {
  ThirdwebProvider,
  useAddress,
  useContract,
  useMintNFT,
  useOwnedNFTs,
} from "@thirdweb-dev/react";
import { ConnectWallet } from "@thirdweb-dev/react";
import { Textarea } from "@/components/ui/textarea";

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

const SectionOne = ({ logMessage }: { logMessage: string }) => {
  return (
    <>
      <MintNFTButton logMessage={logMessage} />
      <LogList />
    </>
  );
};

const LogList = () => {
  const sender = useAddress();
  const { contract: nftContract, isLoading: nftContractLoading } = useContract(
    "0x9CE4BCD0a375fEb72369c79070c1bEe316c8e821"
  );
  const {
    data: ownedNFTs,
    isLoading,
    error,
  } = useOwnedNFTs(nftContract, sender);

  return (
    <>
      {isLoading && <div>Loading...</div>}
      {ownedNFTs && (
        <ul>
          {ownedNFTs.map((nft) => (
            <li key={nft.metadata.id}>
              <img
                src={nft.metadata.image || undefined}
                alt={nft.metadata.name?.toString() || "image"}
              />
              <div>{nft.metadata.name}</div>
              <div>{nft.metadata.description}</div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

const MintNFTButton = ({ logMessage }: { logMessage: string }) => {
  const sender = useAddress();
  const { contract: nftContract, isLoading: nftContractLoading } = useContract(
    "0x9CE4BCD0a375fEb72369c79070c1bEe316c8e821"
  );
  const { mutate: mintNft, isLoading, error } = useMintNFT(nftContract);

  if (error) {
    console.error("failed to mint NFT", error);
  }

  if (!sender) return <>Connect first</>;

  return (
    <Button
      disabled={isLoading}
      onClick={() => {
        const metadata = {
          name: `LifeLog ${Date.now().toString()}`,
          description: logMessage,
          image: "https://i.imgur.com/wFrLRk4.png", // This can be an image url or file
        };
        mintNft({
          metadata: metadata,
          to: sender,
        });
      }}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Minting
        </>
      ) : (
        "Mint"
      )}
    </Button>
  );
};

export default function Home() {
  const [contract, setContract] = useState<ethers.Contract>();
  const [wallet, setWallet] = useState<ComethWallet>();
  const [provider, setProvider] = useState<ComethProvider>();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [textAreaMessage, setTextAreaMessage] = useState("");

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
          Lifelog
        </h2>

        <div className="flex flex-col gap-2">
          <ConnectWallet />
          <Textarea
            onChange={(e) => {
              setTextAreaMessage(e.target.value);
            }}
          />
          <SectionOne logMessage={textAreaMessage} />
        </div>

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
