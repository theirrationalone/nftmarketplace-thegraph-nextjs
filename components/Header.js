import Head from "next/head";
import { ConnectButton } from "@web3uikit/web3";
import Link from "next/link";
import { useRouter } from "next/router";

const Header = () => {
  const router = useRouter();
  return (
    <div>
      <Head>
        <title>NFT MARKET PLACE x Hardhat</title>
        <meta name="description" content="NFT MARKET PLACE x Hardhat" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <div className="p-8 flex flex-row justify-between border-b-2">
        <h1 className="text-4xl font-semibold text-fuchsia-600">
          NFT MARKETPLACE
        </h1>
        <nav className="flex flex-row justify-between">
          <Link
            href="/"
            className={
              router.pathname === "/"
                ? "text-orange-600 mr-8 text-2xl"
                : "mr-8 text-2xl"
            }
          >
            Home
          </Link>
          <Link
            href="./sell-nft"
            className={
              router.pathname === "/sell-nft"
                ? "text-orange-600 mr-8 text-2xl"
                : "mr-8 text-2xl"
            }
          >
            Sell NFT
          </Link>
          <ConnectButton moralisAuth={false} />
        </nav>
      </div>
    </div>
  );
};

export default Header;
