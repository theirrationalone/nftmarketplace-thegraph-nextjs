import { useEffect, useState } from "react";
import { useWeb3Contract, useMoralis } from "react-moralis";
import { Form, Card } from "@web3uikit/core";
import { useNotification } from "@web3uikit/core";
import { Bell, Cross, Exchange } from "@web3uikit/icons";
import { ethers } from "ethers";

import { NFTMarketplaceContractABI, contractAddresses } from "../constants/";
import LoadingCmp from "../components/LoadingCmp";

export default function SellNFT() {
  const [withdrawProceeds, setWithdrawProceeds] = useState("");
  const [listtingLoading, setListingLoading] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();

  const chainId = chainIdHex ? parseInt(chainIdHex).toString() : null;

  const NFTMarketplaceAddress = chainId
    ? contractAddresses[chainId]["NFTMarketplace"][
        contractAddresses[chainId]["NFTMarketplace"].length - 1
      ]
    : null;

  const { runContractFunction } = useWeb3Contract();

  const dispatch = useNotification();

  const getWithdrawProceedsSuccessHandler = async (proceeds) => {
    setWithdrawProceeds(proceeds.toString());
    dispatch({
      position: "topR",
      type: "success",
      icon: <Bell />,
      iconColor: "green",
      message: "Your Withdraw Proceeds Fetched Successfully!",
      title: "Retrieve Proceeds!",
    });
  };

  const getWithdrawProceeds = async () => {
    setWithdrawLoading(true);
    await runContractFunction({
      params: {
        contractAddress: NFTMarketplaceAddress,
        abi: NFTMarketplaceContractABI,
        functionName: "getProceeds",
      },
      onSuccess: (res) => {
        setWithdrawLoading(false);
        getWithdrawProceedsSuccessHandler(res);
      },
      onError: (err) => {
        setWithdrawLoading(false);
        console.log(err);
      },
    });
  };

  useEffect(() => {
    if (isWeb3Enabled) {
      getWithdrawProceeds();
    }
  }, [isWeb3Enabled]);

  const sellNftSuccessHandler = async (tx) => {
    await tx.wait(1);
    dispatch({
      position: "topR",
      type: "success",
      icon: <Bell />,
      iconColor: "green",
      message: "NFT Listed on NFT Market Place Successfully!",
      title: "NFT Listed!",
    });
  };

  const formSubmitHandler = async ({ data }) => {
    const _nftAddress = data[0].inputResult;
    const _tokenId = data[1].inputResult;
    const _price = ethers.utils.parseEther(data[2].inputResult).toString();

    setListingLoading(true);

    await runContractFunction({
      params: {
        abi: NFTMarketplaceContractABI,
        contractAddress: NFTMarketplaceAddress,
        functionName: "listItem",
        params: {
          _nftAddress: _nftAddress,
          _tokenId: _tokenId,
          _price: _price,
        },
      },
      onSuccess: (res) => {
        setListingLoading(false);
        sellNftSuccessHandler(res);
      },
      onError: (err) => {
        setListingLoading(false);
        console.log(err);
      },
    });
  };

  const withdrawProceedsSuccessHandler = async (tx) => {
    await tx.wait(1);
    dispatch({
      position: "topR",
      type: "success",
      icon: <Bell />,
      iconColor: "green",
      title: "Withdrawal Succeeds!",
      message: "Proceeds Withdrawal was Successful, check Your Wallet Balance!",
    });
  };

  const withdrawProceedsHandler = async (currentProceeds) => {
    if (+currentProceeds <= 0) {
      return dispatch({
        position: "topR",
        type: "error",
        icon: <Cross />,
        iconColor: "red",
        title: "Nothing to Withdraw!",
        message: "You have Nothing to Withdraw, Nody Bought your NFT yet!",
      });
    }

    setWithdrawLoading(true);

    await runContractFunction({
      params: {
        abi: NFTMarketplaceContractABI,
        contractAddress: NFTMarketplaceAddress,
        functionName: "withdrawProceeds",
      },
      onSuccess: (res) => {
        setWithdrawLoading(false);
        withdrawProceedsSuccessHandler(res);
      },
      onError: (err) => {
        setWithdrawLoading(false);
        console.log(err);
      },
    });
  };

  let withdrawProceedsEl = <div> You Have no Withdraw Proceeds</div>;

  if (withdrawProceeds !== "0" && +withdrawProceeds > 0) {
    withdrawProceedsEl = (
      <div className="p-4 m-4 text-gray-700">
        You Have Proceeds of{" "}
        <span className="text-2xl font-semibold text-blue-600">
          {ethers.utils.formatEther(withdrawProceeds)} ETH
        </span>{" "}
        to Withdraw!{" "}
      </div>
    );
  }

  return (
    <div className="m-4 p-4">
      {listtingLoading ? (
        <LoadingCmp />
      ) : (
        <Form
          title="Sell-NFT"
          buttonConfig={{
            style: {
              border: "1px solid blueviolet",
              padding: "8px 24px",
              cursor: "pointer",
              color: "blueviolet",
            },
            icon: <Exchange />,
            iconColor: "blue",
          }}
          onSubmit={formSubmitHandler}
          id="main-form"
          data={[
            {
              name: "NFT Address",
              type: "text",
              value: "",
              inputWidth: "50%",
              key: "_nftAddress",
            },
            {
              name: "NFT Token",
              type: "text",
              value: "",
              key: "_tokenId",
            },
            {
              name: "NFT Price",
              type: "number",
              value: "",
              inputWidth: "35%",
              key: "_price",
            },
          ]}
        />
      )}

      {withdrawLoading ? (
        <LoadingCmp />
      ) : (
        <Card
          title="Withdraw Proceeds"
          style={{
            display: "block",
            width: "fit-content",
            border: "1px solid blue",
          }}
          onClick={withdrawProceedsHandler.bind(this, withdrawProceeds)}
        >
          {withdrawProceedsEl}
        </Card>
      )}
    </div>
  );
}
