import * as assert from "assert";
import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Puppet } from "../target/types/puppet";
import { PuppetMaster } from "../target/types/puppet_master";

describe("cpi", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.Provider.local();
  anchor.setProvider(provider);

  const puppet = anchor.workspace.Puppet as Program<Puppet>;
  const puppetMaster = anchor.workspace.PuppetMaster as Program<PuppetMaster>;

  const newPuppetAccount = anchor.web3.Keypair.generate();

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await puppet.rpc.initialize({
      accounts: {
        puppet: newPuppetAccount.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [newPuppetAccount],
    });
    console.log("Your transaction signature", tx);

    await puppetMaster.rpc.pullStrings(new anchor.BN(111), {
      accounts: {
        puppet: newPuppetAccount.publicKey,
        puppetProgram: puppet.programId,
      },
    });

    const puppetAccount = await puppet.account.data.fetch(
      newPuppetAccount.publicKey
    );
    assert.ok(puppetAccount.data.eq(new anchor.BN(111)));
  });
});
