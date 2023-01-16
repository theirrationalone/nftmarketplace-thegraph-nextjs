import { gql } from "@apollo/client";

export const FETCH_ACTIVE_ITEMS = gql`
  {
    activeItems(first: 5, where: { buyer: null }) {
      id
      nftAddress
      tokenId
      buyer
      seller
      price
    }
  }
`;
