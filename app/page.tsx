"use client";
import Image from "next/image";
import {
  ComethProvider,
  ComethWallet,
  ConnectAdaptor,
  SupportedNetworks,
} from "@cometh/connect-sdk";
import { Button } from "@/components/ui/button";

if (!process.env.NEXT_PUBLIC_COMETH_API_KEY) throw new Error("NEXT_PUBLIC_COMETH_API_KEY not found");
const NEXT_PUBLIC_COMETH_API_KEY = process.env.NEXT_PUBLIC_COMETH_API_KEY;

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
    await instance.connect(localStorageAddress);
  } else {
    await instance.connect();
    const walletAddress = await instance.getAddress();
    window.localStorage.setItem("walletAddress", walletAddress);
  }

  const instanceProvider = new ComethProvider(instance);

  // const contract = new ethers.Contract(
  //   COUNTER_CONTRACT_ADDRESS,
  //   countContractAbi,
  //   instanceProvider.getSigner()
  // );
};

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
        The People of the Kingdom
      </h2>
      <Button
        onClick={async () => {
          await connect();
        }}
      >
        Fn 1
      </Button>
    </main>
  );
}
