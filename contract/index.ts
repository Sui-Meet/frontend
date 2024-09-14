import { bcs } from "@mysten/sui/bcs";
import { Transaction as TX } from "@mysten/sui/transactions";

const mint = async (photo_blob: string, detail_blob: string) => {
  console.log('test', photo_blob, detail_blob);
  
    const tx = new TX();
    tx.moveCall({
        target: `${process.env.NEXT_PUBLIC_CONTRACT_PACKAGE}::meet::create_profile`,
        arguments: [
          tx.object(process.env.NEXT_PUBLIC_CONTRACT_STATE!),
          tx.pure(bcs.string().serialize(photo_blob).toBytes()),
          tx.pure(bcs.string().serialize(detail_blob).toBytes()),
        ],
    });
    return tx;
}

export { mint };