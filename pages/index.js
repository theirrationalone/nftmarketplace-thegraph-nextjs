import { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import { Modal } from "@web3uikit/core";
import { useMoralis } from "react-moralis";

import { FETCH_ACTIVE_ITEMS } from "../constants/subGraphQueries";
import AllNfts from "../components/AllNfts";
import LoadingCmp from "../components/LoadingCmp";

export default function Home() {
  const [showModalError, setShowModalError] = useState(true);
  const [isUpdateFinished, setIsUpdatefinished] = useState(true);
  const [isPurchaseFinished, setIsPurchasedFinished] = useState(true);
  const [listedNfts, setListedNfts] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const { isWeb3Enabled } = useMoralis();
  const [getUpdatedItems] = useLazyQuery(FETCH_ACTIVE_ITEMS);

  const updateListings = () => {
    getUpdatedItems()
      .then((res) => {
        setListedNfts(res.data);
        setLoading(res.loading);
        setError(res.error);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  useEffect(() => {
    updateListings();
  }, []);

  let mainPage = <LoadingCmp />;

  if (listedNfts && !loading) {
    mainPage = isWeb3Enabled ? (
      <div className="flex flex-row max-w-fit min-w-fit p-8 justify-between items-center">
        {listedNfts.activeItems.map((item) => (
          <AllNfts
            key={item.id}
            nftAddress={item.nftAddress}
            price={item.price}
            seller={item.seller}
            tokenId={item.tokenId}
            updateFinish={(isFinished) => {
              updateListings();
              setIsUpdatefinished(isFinished);
            }}
            purchaseFinish={(isPurchased) => {
              updateListings();
              setIsPurchasedFinished(isPurchased);
            }}
          />
        ))}
      </div>
    ) : (
      <div className="text-2xl font-extrabold m-4 text-stone-400">
        Web3 Not Enabled!
      </div>
    );
  }

  if (!listedNfts && !loading && !!error) {
    console.log("\x1b[31m%s\x1b[0m", `error: ${error.message}`);
    console.log("\x1b[31m%s\x1b[0m", `error-stack: ${error.stack}`);

    mainPage = (
      <Modal
        hasCancel={false}
        title="Something Went Wrong! Try Again :("
        isCentered={true}
        id="modal-1"
        isVisible={showModalError}
        onOk={() => setShowModalError(false)}
      >
        <div>Please Check Your internet connection or queryMethods!</div>
      </Modal>
    );
  }

  if (!isUpdateFinished) {
    mainPage = <LoadingCmp />;
  }

  if (!isPurchaseFinished) {
    mainPage = <LoadingCmp />;
  }

  return mainPage;
}
