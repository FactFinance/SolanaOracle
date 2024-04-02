import * as anchor from "@coral-xyz/anchor";
import { Consumer } from "../target/types/consumer";
import { Oracle } from "../target/types/oracle";
import { Keypair, PublicKey } from "@solana/web3.js";
const {  SystemProgram, Transaction } = require('@solana/web3.js');
import fs from "mz/fs";
import path from "path";

async function getKey() {
  const PROGRAM_KEYPAIR_PATH = path.join(path.resolve(__dirname, "/home/juvinski/.config/solana/"), "id.json");  
  const secretKeyString = await fs.readFile(PROGRAM_KEYPAIR_PATH, { encoding: "utf8" });
  const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
  const programKeypair = Keypair.fromSecretKey(secretKey);
  return programKeypair;
}



describe("Fact Finance Oracle", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const consumer = anchor.workspace.Consumer as anchor.Program<Consumer>;
  const oracle = anchor.workspace.Oracle as anchor.Program<Oracle>;

    
  const feedid1 = 1;
  const feedid2 = 180;
  const new_value = 50000;
  const timestamp = Date.now() / 1000;
  const license = 0;

  it("Initialize the oracle!", async () => {
    async function run(feedid: number) {
      const wallet = await getKey();
      let [datafeedAccount, _] = await anchor.web3.PublicKey.findProgramAddress([wallet.publicKey.toBuffer(), Buffer.from("_"), Buffer.from(feedid.toString())], oracle.programId);

      try {
        let data = await oracle.account.dataFeed.fetch(datafeedAccount);
      } catch (e) {
        await oracle.methods
          .initialize(feedid)
          .accounts({
            datafeed: datafeedAccount,
            signer: provider.wallet.publicKey,
          })
          .signers([wallet])
          .rpc();
      }
    }
    await run(feedid1);
    await run(feedid2);
  });

  it("Set Value!", async () => {
    async function run(feedid: number) {
      const new_value = 500666943;

      const wallet = await getKey();      

      let [datafeedAccount, _] = await anchor.web3.PublicKey.findProgramAddress([wallet.publicKey.toBuffer(), Buffer.from("_"), Buffer.from(feedid.toString())], oracle.programId);

      await oracle.methods
        .setValue(new_value, timestamp, 'Bitcoin')
        .accounts({
          datafeed: datafeedAccount,
        })        
        .rpc();
    }
    await run(feedid1);
    await run(feedid2);
  });

  it("Set License!", async () => {
    async function run(feedid: number) {
      const wallet = await getKey();
      let [datafeedAccount, _] = await anchor.web3.PublicKey.findProgramAddress([wallet.publicKey.toBuffer(), Buffer.from("_"), Buffer.from(feedid.toString())], oracle.programId);

      await oracle.methods
        .setLicense(license)
        .accounts({
          datafeed: datafeedAccount,
        })
        .rpc();
    }
    await run(feedid1);
    await run(feedid2);
  });

  it("Add subscription!", async () => {
    async function run(feedid: number) {
      const wallet = await getKey();
      let [datafeedAccount, _] = await anchor.web3.PublicKey.findProgramAddress([wallet.publicKey.toBuffer(), Buffer.from("_"), Buffer.from(feedid.toString())], oracle.programId);
	    const pubkeyStr = "4SaWY3ErtEoh9ixRQnhzBNKC5CzuTyZmDoEZhtNXriSD";
	    const pubkeymac = new PublicKey(pubkeyStr);
      await oracle.methods
        .addSubscription(wallet.publicKey)
        .accounts({
          datafeed: datafeedAccount,
        })
        .rpc();
    }
    await run(feedid1);
    await run(feedid2);
  });

  it("Pull the oracle!", async () => {
    async function run(feedid: number) {
      const wallet = await getKey();
            
      let [datafeedAccount, _] = await anchor.web3.PublicKey.findProgramAddress([wallet.publicKey.toBuffer(), Buffer.from("_"), Buffer.from(feedid.toString())], oracle.programId);

      await consumer.methods
        .pullOracle()
        .accounts({
          datafeed: datafeedAccount,
          oracleProgram: oracle.programId,
        })      
        .rpc();
    }
    await run(feedid1);
   await run(feedid2);
  });

  it("Revoke subscription!", async () => {
    const wallet = await getKey();

    async function run(feedid: number) {
      const wallet = await getKey();
      let [datafeedAccount, _] = await anchor.web3.PublicKey.findProgramAddress([wallet.publicKey.toBuffer(), Buffer.from("_"), Buffer.from(feedid.toString())], oracle.programId);

      await oracle.methods
        .revokeSubscription(wallet.publicKey)
        .accounts({
          datafeed: datafeedAccount,
        })
        .rpc();
    }
    await run(feedid1);
    await run(feedid2);
  });





});