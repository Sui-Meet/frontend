import { getFullnodeUrl } from "@mysten/sui/client";
import { createNetworkConfig } from "@mysten/dapp-kit";

const { networkConfig, useNetworkVariable, useNetworkVariables } = createNetworkConfig({
    testnet: {
        url: getFullnodeUrl("testnet"),
        // variables: {
        //     suiGalleryPackageId: process.env.NEXT_PUBLIC_PACKAGE_ID,
        //     suiGallerySharedId: process.env.NEXT_PUBLIC_GALLERY_SHARED_ID,
        // },
    },
    mainnet: { url: getFullnodeUrl('mainnet') }
});

export { useNetworkVariable, useNetworkVariables, networkConfig };