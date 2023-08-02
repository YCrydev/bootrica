import type { NextPage } from "next";
import Link from "next/link";
// import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import logo from "../../assets/logo.png";
import { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react"
import { sign } from "crypto";
import * as nearAPI from "near-api-js";

interface DiscordUser {
  id: string;
  username: string;
  avatar: string;
  discriminator: string;
  public_flags: number;
  flags: number;
  locale: string;
  mfa_enabled: boolean;
  premium_type: number;
}
type PropsDiscord = { user: DiscordUser | null };
export interface TwitterObject {
  id: String;
  profile_image_url: String;
  name: String;
  username: String;
}
type Props = {
  walletState:Boolean;
  setWalletState:Function
};
const Navbar: NextPage<Props> = ({setWalletState,walletState}) => {
  const [openMobile, setOpenMobile] = useState(false);
  const [checkSignUp, setCheckSignUp] = useState(true);
  const [pathName, setPathName] = useState("");
  const { connect } = nearAPI;
  const { data: session } = useSession()
  console.log(session)
  const router = useRouter();
  useEffect(() => {
    if (!router.isReady) return;
    const query = router;
    setPathName(query.pathname);

  }, [router.isReady, router.query]);
  function replaceBetween(
    origin: any,
    startIndex: any,
    endIndex: any,
    insertion: any
  ) {
    return (
      origin?.substring(0, startIndex) + insertion + origin?.substring(endIndex)
    );
  }

  return (
    <>
      <div className="navbar">
        <Link href="/">
          <img src={logo.src} className="navbar-img" />
        </Link>
        <div className="navbar-link-div">
          {/* <Link href="/">
            <div className={`navbar-link ${pathName=="/"?"active":""}`}>Nominate</div>
          </Link> */}
          {/* <Link href="/communities">
            <div className={`navbar-link ${pathName=="/communities"?"active":""}`}>Communities</div>
          </Link>
          <Link href="/profiles">
            <div className={`navbar-link ${pathName=="/profiles"?"active":""}`}>Profiles</div>
          </Link> */}
        </div>
        {checkSignUp ? (
              <></>
            ) : (
              <button className="navbar-create-profile">
                {" "}
                <Link href="/register"> Create a Profile</Link>
              </button>
            )}
    
      </div>
    </>
  );
};
export default Navbar;
