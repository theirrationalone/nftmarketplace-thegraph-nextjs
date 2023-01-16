import { useState } from "react";
import { Modal, Input } from "@web3uikit/core";
import { useWeb3Contract, useMoralis } from "react-moralis";
import { useNotification } from "@web3uikit/core";

import {
  contractAddresses,
  NFTMarketplaceContractABI,
} from "../constants/index";
import { ethers } from "ethers";
import { Bell } from "@web3uikit/icons";

const UpdateBuyListings = ({
  nftAddress,
  tokenId,
  showModal,
  disableModal,
  finishUpdate,
}) => {
  const [price, setPrice] = useState("");

  const { chainId: chainIdHex } = useMoralis();

  const chainId = chainIdHex ? parseInt(chainIdHex).toString() : null;

  const NFTMarketplaceContractAddress = chainId
    ? contractAddresses[chainId]["NFTMarketplace"][
        contractAddresses[chainId]["NFTMarketplace"].length - 1
      ]
    : null;

  const dispatch = useNotification();

  const { runContractFunction } = useWeb3Contract();

  const updateListingSuccessHandler = async (tx) => {
    await tx.wait(1);
    dispatch({
      position: "topR",
      type: "success",
      icon: <Bell />,
      iconColor: "green",
      message: "NFT Listed Item Updated!",
      title: "Update Item!",
    });
    finishUpdate(true);
  };

  const updateListingHandler = async () => {
    const updateItemOptions = {
      abi: NFTMarketplaceContractABI,
      contractAddress: NFTMarketplaceContractAddress,
      functionName: "updateItem",
      params: {
        _nftAddress: nftAddress,
        _tokenId: tokenId,
        _newPrice: ethers.utils.parseEther(price.toString()),
      },
    };

    await runContractFunction({
      params: updateItemOptions,
      onSuccess: updateListingSuccessHandler,
      onError: (err) => {
        finishUpdate(false);
        console.log("Error: ", err);
      },
    });

    disableModal();
    finishUpdate(false);
  };

  return (
    <Modal
      isVisible={showModal}
      title="Update Listing"
      onOk={updateListingHandler}
      onCancel={disableModal}
      onCloseButtonPressed={disableModal}
    >
      <Input
        type="number"
        description="NFT New Price"
        label="Price"
        onChange={(event) => setPrice(event.target.value)}
      />
    </Modal>
  );
};

export default UpdateBuyListings;
