import Head from "next/head";
import clientPromise from "../lib/mongodb";
import { InferGetServerSidePropsType } from "next";
import * as nearAPI from "near-api-js";
import Navbar from "./Components/Navbar";
import { signIn, signOut, useSession } from "next-auth/react";
import StarfieldAnimation from 'react-starfield-animation'

import axios from "axios"
import Grid from "@mui/material/Grid";
import loadingSvg from "../assets/loading.svg";
import bs58 from "bs58";
import Modal from '@mui/material/Modal';
import { useEffect, useState } from "react";
import Tilt from "react-parallax-tilt";
import Link from "next/link";
import { Session } from "inspector";

interface ContractType {
  nft_tokens_for_owner: string;
  nft_metadata: string;
}
export async function getServerSideProps(context:any) {
  try {
    await clientPromise;

    // `await clientPromise` will use the default database passed in the MONGODB_URI
    // However you can use another database (e.g. myDatabase) by replacing the `await clientPromise` with the following code:
    //
    // `const client = await clientPromise`
    // `const db = client.db("myDatabase")`
    //
    // Then you can execute queries against your database like so:
    // db.find({}) or any of the MongoDB Node Driver commands

    return {
      props: { isConnected: true },
    };
  } catch (e) {
    console.error(e);
    return {
      props: { isConnected: false },
    };
  }
}

export default function Home({
  isConnected,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { connect } = nearAPI;
  const [account_id, setAccount_id] = useState("");
  const [batch_nft_array, setbatch_nft_array] = useState([]);
  const [walletState, setWalletState] = useState<any>(false);
  const [selectedNfts, setSelectedNfts] = useState<any[]>([]);
  const [metadata, setMetadata] = useState<any>({});
  const [openModal, SetOpenModal] = useState(false);
  const [openSuccessModal,setOpenSuccessModal] = useState(false);
  const [selectedProject, SetSelectedProject] = useState("");
  const [NKTCount, setNKTcount] = useState(0);
  const [donsCount, setDonsCount] = useState(0);
  const {data:session}=useSession()
const handleClose = () =>  {console.log(selectedNfts)
   SetOpenModal(false)};

   if (typeof window !== "undefined") {
    const near = new nearAPI.Near({
      keyStore: new nearAPI.keyStores.BrowserLocalStorageKeyStore(),
      networkId: "mainnet",
      nodeUrl: "https://rpc.mainnet.near.org",
      walletUrl: "https://wallet.mainnet.near.org",
    });
    const wallet = new nearAPI.WalletConnection(near, "Burn Misfits");
    // setWalletState(wallet)
    useEffect(()=>{
      if (wallet.isSignedIn()) {
        setAccount_id(wallet?.getAccountId());
      }
    },[])
    // useEffect(()=>{
    //   if (wallet.isSignedIn()&&session) {
    //    alert("")
    //   }
    // },[wallet,session])
  }
  const walletStuff=()=>{
    if (typeof window !== "undefined") {
    const near = new nearAPI.Near({
      keyStore: new nearAPI.keyStores.BrowserLocalStorageKeyStore(),
      networkId: "mainnet",
      nodeUrl: "https://rpc.mainnet.near.org",
      walletUrl: "https://wallet.mainnet.near.org",
    });
    const wallet = new nearAPI.WalletConnection(near, "Burn Misfits");
    if(walletState){
      wallet.signOut();
    }
   
    if (wallet.isSignedIn()) {
      
      setAccount_id(wallet?.getAccountId());
   
    } else {
      wallet.requestSignIn({
        contractId: "burn-misfits.near",
        // successUrl: "https://mint.nearkits.io", // optional
        // failureUrl: "https://mint.nearkits.io",
      });
    }
  }
   }
   const disconnectWallet=()=>{
    if (typeof window !== "undefined") {
    const near = new nearAPI.Near({
      keyStore: new nearAPI.keyStores.BrowserLocalStorageKeyStore(),
      networkId: "mainnet",
      nodeUrl: "https://rpc.mainnet.near.org",
      walletUrl: "https://wallet.mainnet.near.org",
    });
    const wallet = new nearAPI.WalletConnection(near, "Burn Misfits");
    if(wallet?.isSignedIn()){
      wallet.signOut();
    }
  }
   }

  const setSelectedNftsFunc = (indexSelected:number,token_id:string)=>{
    const selectedNftsArray = selectedNfts.map((data,index)=>{
      return {id:index,checked: indexSelected==index? !selectedNfts[index]?.checked:selectedNfts[index]?.checked,token_id:selectedNfts[index]?.token_id}
    })
    setSelectedNfts(selectedNftsArray)
  }

const trunc=(longString:string)=>{
  if(longString.length>10){
  return longString.slice(0, 5) + "..." + longString.slice(-4);
  }else{
    return longString
  }
}
const submitInfo =() => {

}
  return (
    <div className="container" >
      <Head>
        <title>Connect Portal</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar walletState={walletState} setWalletState={setWalletState}/>
      <StarfieldAnimation
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%'
        }}
      />
      <div className="connect-btn">
        <button onClick={account_id?()=>walletStuff():()=>disconnectWallet()}>
          {account_id?trunc(account_id):"Connect Wallet"}
        </button>
        <button onClick={!session?()=>signIn():()=>signOut()}>
          {session?.user?.name?trunc(session?.user?.name):"Connect Discord"}
        </button>
    
     </div>
     <div className="connect-btn-alt">
     <button className="submit-data" disabled={session&&account_id?false:true} onClick={()=>submitInfo()}>
          SUBMIT
        </button>
        </div>
    </div>
  );
        }
