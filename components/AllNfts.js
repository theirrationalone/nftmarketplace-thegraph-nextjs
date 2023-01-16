import { useEffect, useState } from "react";
import Image from "next/image";
import { useWeb3Contract, useMoralis } from "react-moralis";
import { Card, Tooltip, useNotification } from "@web3uikit/core";
import { Bell } from "@web3uikit/icons";
import { ethers } from "ethers";

import {
  BasicNFTContractABI,
  contractAddresses,
  NFTMarketplaceContractABI,
} from "../constants/index";
import UpdateBuyListings from "./UpdateBuyListings";

const AllNfts = ({
  nftAddress,
  tokenId,
  seller,
  price,
  updateFinish,
  purchaseFinish,
}) => {
  const [uriName, setUriName] = useState("");
  const [uriImageUrl, setUriImageUrl] = useState("");
  const [uriDescription, setUriDescription] = useState("");
  const [showModal, setShowModal] = useState(false);
  const dispatch = useNotification();

  const { chainId: chainIdHex, account, isWeb3Enabled } = useMoralis();

  const chainId = chainIdHex ? parseInt(chainIdHex).toString() : null;

  const contractAddress = chainId
    ? contractAddresses[chainId]["BasicNFT"][
        contractAddresses[chainId]["BasicNFT"].length - 1
      ]
    : null;

  const NFTMarketplaceContractAddress = chainId
    ? contractAddresses[chainId]["NFTMarketplace"][
        contractAddresses[chainId]["NFTMarketplace"].length - 1
      ]
    : null;

  const { runContractFunction: tokenURI } = useWeb3Contract({
    abi: BasicNFTContractABI,
    contractAddress: contractAddress,
    functionName: "tokenURI",
    params: {
      tokenId: tokenId,
    },
  });

  const { runContractFunction } = useWeb3Contract();

  const handleGetTokenSuccess = async (tokenUri) => {
    dispatch({
      position: "topR",
      type: "success",
      icon: <Bell />,
      iconColor: "green",
      message: "NFT URI Fetched Successfully!",
      title: "URI Fetched!",
    });

    const formattedUri = tokenUri.replace("ipfs://", "https://ipfs.io/ipfs/");
    const uriResponse = await fetch(formattedUri);
    const uriData = await uriResponse.json();
    const uriImage = uriData.image.replace("ipfs://", "https://ipfs.io/ipfs/");
    setUriName(uriData.name);
    setUriImageUrl(uriImage);
    setUriDescription(uriData.description);
  };

  useEffect(() => {
    if (isWeb3Enabled) {
      const getTokenURI = async () => {
        await tokenURI({
          onSuccess: (res) => handleGetTokenSuccess(res),
          onError: (er) => console.log(er),
        });
      };

      getTokenURI();
    }
  }, [isWeb3Enabled]);

  const buySuccessHandler = async (tx) => {
    await tx.wait(1);

    dispatch({
      position: "topR",
      type: "success",
      icon: <Bell />,
      iconColor: "green",
      message: "NFT Purchased Successfully!",
      title: "ITEM BOUGHT!",
    });

    purchaseFinish(true);
  };

  const buyNFtHandler = async (nftAddress, tokenId, price) => {
    if (seller === account) {
      setShowModal(true);
    } else {
      const buyItemOptions = {
        abi: NFTMarketplaceContractABI,
        contractAddress: NFTMarketplaceContractAddress,
        functionName: "buyItem",
        params: {
          _nftAddress: nftAddress,
          _tokenId: tokenId,
        },

        msgValue: price,
      };

      await runContractFunction({
        params: buyItemOptions,
        onSuccess: (res) => buySuccessHandler(res),
        onError: (err) => {
          purchaseFinish(true);
          console.log(err);
        },
      });
      purchaseFinish(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap">
        <UpdateBuyListings
          nftAddress={nftAddress}
          tokenId={tokenId}
          showModal={showModal}
          disableModal={() => setShowModal(false)}
          finishUpdate={(isFinished) => updateFinish(isFinished)}
        />
        <Tooltip
          position="top"
          title={seller !== account ? "Buy Me!" : "Update"}
          style={{ margin: 4 }}
        >
          <Card
            title={uriName}
            description={uriDescription}
            style={{
              border: "1px solid green",
              margin: 4,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
            onClick={buyNFtHandler.bind(this, nftAddress, tokenId, price)}
          >
            <div className="text-right">#{tokenId}</div>
            <div className="mb-2 font-semibold text-blue-500 text-center">
              {account && seller
                ? seller === account.toString()
                  ? "Owned By You!"
                  : "Owned By " + seller
                : "Not Connected"}
            </div>
            <div className="flex flex-row justify-center">
              {uriImageUrl ? (
                <Image
                  src={uriImageUrl}
                  alt="uri-image"
                  width="200"
                  height="200"
                  loader={() => uriImageUrl}
                />
              ) : (
                <img alt="uri-image" />
              )}
            </div>
            <div className="text-right mb-2">
              {ethers.utils.formatEther(price)} ETH
            </div>
          </Card>
        </Tooltip>
      </div>
    </div>
  );
};

export default AllNfts;
