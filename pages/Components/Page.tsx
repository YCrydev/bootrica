import Head from "next/head";
import clientPromise from "../../lib/mongodb";
import { InferGetServerSidePropsType } from "next";
import * as nearAPI from "near-api-js";
import Navbar from "../Components/Navbar";
import loadingSvg from "../../assets/loading.svg";
import Grid from "@mui/material/Grid";
import bs58 from "bs58";
import Modal from '@mui/material/Modal';
import { useEffect, useState } from "react";
import Tilt from "react-parallax-tilt";
const toastr = require('toastr');
import 'toastr/build/toastr.min.css';
import { useSession, signIn, signOut } from "next-auth/react"
import axios from "axios";
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
  isConnected,selectedProject
}: any) {
  const { connect } = nearAPI;
  const [account_id, setAccount_id] = useState("");
  const [batch_nft_array, setbatch_nft_array] = useState([]);
  const [walletState, setWalletState] = useState<any>();
  const [selectedNfts, setSelectedNfts] = useState<any[]>([]);
  const [metadata, setMetadata] = useState<any>({});
  const [openModal, SetOpenModal] = useState(false);
  const [openSuccessModal,setOpenSuccessModal] = useState(false);
  const [simalrity,setSimilarity] = useState<any>({})
  const [loading,setLoading]= useState(false)
  const [statModal,setStatModal]= useState(false)
  const [loadBurnt,setLoadBurnt]= useState("");
  const { data: session } = useSession()

  const handleClose = () =>  {console.log(selectedNfts)
   SetOpenModal(false)};
   const handleStatClose = () =>  {console.log(selectedNfts)
    setStatModal(false)};
   const handleSuccessClose = () =>  {console.log(selectedNfts)
    setOpenSuccessModal(false)};
    const handleLoadBurntNFTS = ()=>{
      setStatModal(true)
      loadBurntNfts(account_id)
    }
    
    const loadBurntNfts = async(account_id:string)=>{
      try {
        axios.get('https://admin.misfits.land/users/checkTotalBurnt', {
          params: {     
            userWallet:account_id,
            contract_id:selectedProject
          }
        }).then(response => {
          setLoadBurnt(response.data);
        }).catch(error => {
          console.error(error);
        });
      } catch (error) {
        console.log(error);
      }
    }
  if (typeof window !== "undefined") {
    const near = new nearAPI.Near({
      keyStore: new nearAPI.keyStores.BrowserLocalStorageKeyStore(),
      networkId: "mainnet",
      nodeUrl: "https://rpc.mainnet.near.org",
      walletUrl: "https://wallet.mainnet.near.org",
    });
    const wallet = new nearAPI.WalletConnection(near, "Burn Misfits");
    // setWalletState(wallet)
 const loadNfts = async (account_id: string) => {
      try {
        const contract_id_load = selectedProject;
        const contract: any = new nearAPI.Contract(
          wallet.account(), // the account object that is connecting
          contract_id_load,
          {
            changeMethods: [],
            viewMethods: ["nft_tokens_for_owner", "nft_metadata"],
          }
        );
        try {
          const response = await contract.nft_tokens_for_owner({
            account_id: account_id,
          });
          const response_metadata = await contract.nft_metadata();
          console.log(response);
          setMetadata(response_metadata);
          if (response.length > 0) {
            console.log(response_metadata);
           
          const arraySet =  response.map((data:any,index:number)=>{
              return{id:index,checked:false,token_id:data.token_id}
            })
            setSelectedNfts(arraySet)
            setbatch_nft_array(response);
          }
        } catch (error) {
          console.log(error);
        }
      } catch (error) {
        console.log(error);
      }
    };

    useEffect(() => {
      if(walletState){
        wallet.signOut();
      }
      if (wallet.isSignedIn()) {
        // wallet.signOut();
        setAccount_id(wallet?.getAccountId());
        loadNfts(wallet?.getAccountId());
        loadBurntNfts(wallet?.getAccountId());
      } else {
        wallet.requestSignIn({
          contractId: "burn-misfits.near",
          // successUrl: "https://mint.nearkits.io", // optional
          // failureUrl: "https://mint.nearkits.io",
        });
      }
    }, [walletState]);
    useEffect(() => {
      // Check if the stored array exists in localStorage
      const storedArray = localStorage.getItem('SendNfts');
      if (storedArray&&session) {
        const myArray = JSON.parse(storedArray);
        // Do something with the retrieved array
        setOpenSuccessModal(true)
        setLoading(true)
        setTimeout(()=>{
          axios.get('https://admin.misfits.land/checkNfts', {
            params: {     
              data: myArray.join(','),
              wallet:wallet?.getAccountId(),
              userId: session?.user?.email,
              contract:selectedProject
             
            }
          }).then(response => {
            console.log(response.data);
            setSimilarity(response.data)
            localStorage.removeItem('SendNfts');
            setLoading(false)
          }).catch(error => {
            console.error(error);
          });
        },5000)
       
      }
      
    }, [session]);
  }
const selectAll = ()=>{
  const selectedNftsArray = selectedNfts.map((data,index)=>{
    return {id:index,checked: true,token_id:selectedNfts[index]?.token_id}
  })
  setSelectedNfts(selectedNftsArray)
}
const deSelectAll = ()=>{
  const selectedNftsArray = selectedNfts.map((data,index)=>{
    return {id:index,checked: false,token_id:selectedNfts[index]?.token_id}
  })
  setSelectedNfts(selectedNftsArray)
}

  const sendTransactions= async () =>{
    try{
    if (typeof window !== "undefined") {
      if(!session){
        toastr.warning("please connect discord")
        return
      }
      const near = new nearAPI.Near({
        keyStore: new nearAPI.keyStores.BrowserLocalStorageKeyStore(),
        networkId: "mainnet",
        nodeUrl: "https://rpc.mainnet.near.org",
        walletUrl: "https://wallet.mainnet.near.org",
      });
      const wallet = new nearAPI.WalletConnection(near, "Burn Misfits");
    const account = await near.account(account_id);
   console.log(account_id)
    const keypair = await new nearAPI.keyStores.BrowserLocalStorageKeyStore().getKey("mainnet", account_id);
    const value = "burn-misfits.near";
    console.log(keypair)
    const transactions_array:any[] = []
    const nftsStored:any[]  = []
    if (value.includes(".near") || value.length == 64) {
      const publicKey = keypair?.getPublicKey()
       const publicKey_string = publicKey?.toString();
       const blockGot:any = await near.connection.provider.query({
          request_type: "view_access_key",
          account_id: account_id,
          public_key: publicKey_string,
          finality: "optimistic",
       });

       selectedNfts.forEach(function (nft:any,index:number) {
        if(selectedNfts[index].checked){
          nftsStored.push(selectedNfts[index].token_id)
          var transaction_send = new nearAPI.transactions.Transaction({
             signerId: account_id,
             publicKey: publicKey,
             nonce: blockGot?.nonce + 1,
             receiverId: selectedProject,
             blockHash: bs58.decode(blockGot?.block_hash),
             actions: [
                nearAPI.transactions.functionCall(
                   "nft_transfer",
                   {
                      receiver_id: "burn-misfits.near",
                      token_id: String(selectedNfts[index].token_id),
                   },
                   30000000000000,
                   1
                ),
             ],
          });
          //         const serializedTx = nearApi.utils.serialize.serialize(
          //   nearApi.transactions.SCHEMA,
          //   transaction
          // );
 
          // const signedSerializedTx = bs58.encode(serializedTx);
          transactions_array.push(transaction_send);
        }
       });
 
       console.log(transactions_array);
       localStorage.setItem('SendNfts', JSON.stringify(nftsStored));
          const result_1 = await wallet.requestSignTransactions({
             transactions: transactions_array,
          });
       
       console.log(result_1);
    } else {
       //   toastr.warning("Invalid account address!");
    }
  }
}catch(e){
  console.log(e)
}


 }
  const setSelectedNftsFunc = (indexSelected:number,token_id:string)=>{
    const selectedNftsArray = selectedNfts.map((data,index)=>{
      return {id:index,checked: indexSelected==index? !selectedNfts[index]?.checked:selectedNfts[index]?.checked,token_id:selectedNfts[index]?.token_id}
    })
    setSelectedNfts(selectedNftsArray)
  }


  return (
    <div className="container">
      <Head>
        <title>Misfits Portal</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
    <Navbar walletState={walletState} setWalletState={setWalletState}/>
      <div>
        {/* <button onClick={()=>walletStuff()}>
          {account_id?account_id:"Connect Wallet"}
        </button>
        <button onClick={()=>disconnectWallet()}>
        Disconnect
        </button> */}
        {/* <div className="selected-nft-container">
        <div className={`card selected-nft`} onClick={()=>setSelectedNftsFunc(0,batch_nft_array[0]?.token_id)}>
                    <img
                      className=""
                      src={`${metadata?.base_uri +  batch_nft_array[0]?.metadata?.media}`}
                      alt=""
                    />
          </div>
        </div> */}
        <div className="into-portal-div">
        <button className="into-portal-button" onClick={()=>(selectedNfts.filter(function(s) { return s.checked; }).length != selectedNfts.length?selectAll():deSelectAll())}>
     { selectedNfts.filter(function(s) { return s.checked; }).length != selectedNfts.length? "Select All":"Unselect All"}
      </button>
      <button className="into-portal-button" onClick={()=>{handleLoadBurntNFTS()}}>
        Stats
      </button>
         <button className="into-portal-button" onClick={()=>{SetOpenModal(true);console.log(selectedNfts.filter(function(s) { return s.checked; }))}}>
        Into The Portal
      </button>
      
      </div>
        {selectedProject!=""&& (<>
        <Grid container spacing={2} className={"nft-container"}>
          {batch_nft_array.map((data: any, index: number) => {
            return (
              <>
                <Grid item xs={6} sm={4} md={3} lg={3} xl={2} key={index}>
                  <div className={`card ${selectedNfts[index]?.checked&&"border-selected"}`} onClick={()=>setSelectedNftsFunc(index,data?.token_id)}>
                    <img
                      className=""
                      src={`${metadata?.base_uri + data?.metadata?.media}`}
                      alt=""
                    />
                    <div className="card-bottom"><div>{selectedProject=="cards.nearkits.near"?"Nearkits":"Dons"}</div> 
                    #{data?.metadata.title}</div>
                  </div>
                </Grid>
              </>
            );
          })}
        </Grid>
      
     
      </>)}
     </div>
      <Modal
        open={openModal}
        onClose={handleClose}
    
      >
<div     className={"into-the-portal-div"}><div>{`You're about to burn ${selectedNfts.filter(function(s) { return s.checked; }).length} NFTs, are you sure you want to proceed?`}
<button className="into-portal-button-alt" onClick={()=>sendTransactions()}>
        Burn
      </button>
      </div>
      </div>
      
      </Modal>
      <Modal
        open={openSuccessModal}
        onClose={handleSuccessClose}
    
      >
      <div  className={"into-the-portal-div alt"}> 
      <div className="close-btn" onClick={()=>handleSuccessClose()}>X</div> 
         {!loading?<>{simalrity?.similar?.length} Burned
          <br/>
          {simalrity?.nonSimilar?.length} Not Burned
          <br/>
          {simalrity?.totalBurnt} Total Burnt</>:
          
          <>
          <div><img src={loadingSvg.src}/>
          <div style={{textAlign:"center",fontSize:"20px",marginBottom:"20px"}}>Checking Burnt Nfts
          </div></div></>} 
      </div>
      
      </Modal>

      <Modal
        open={statModal}
        onClose={handleStatClose}
    
      >
     <div  className={"into-the-portal-div alt"}> 
      <div className="close-btn" onClick={()=>handleStatClose()}>X</div> 
         {loadBurnt==""? <div><img style={{height:"20px",marginRight:"10px"}} src={loadingSvg.src}/></div>:<>{loadBurnt}</> } Total Burnt 
      </div>
      
      </Modal>
    </div>
  );
}
