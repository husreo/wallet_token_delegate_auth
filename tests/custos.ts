import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Custos } from "../target/types/custos";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { min } from "bn.js";
import { publicKey } from "@project-serum/anchor/dist/cjs/utils";

const delegateAccountPrefix = "custos";
const delegateTokenAccountPrefix = "custos_token";

describe("custos", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Custos as Program<Custos>;
  const provider = anchor.AnchorProvider.env();
  const wallet = provider.wallet as anchor.Wallet;

  const hotWallet = new anchor.web3.PublicKey(
    "A9pi8RdMraY4dwYtREty48ksw69FwELjScsnodd56dD4"
  );

  it("Create Delegate", async () => {
    const [delegateAccount, delegateAccountBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from(delegateAccountPrefix), wallet.publicKey.toBuffer()],
        program.programId
      );
    console.log("delegateAccount:", delegateAccount.toBase58());
    console.log("coldwallet:", wallet.publicKey.toBuffer());
    
    // Add your test here.
    const tx = await program.methods
      .createDelegate()
      .accounts({
        authority: wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        delegateAccount: delegateAccount,
        toDelegateAccount: hotWallet,
      })
      .rpc();

    console.log("createDelegate -", tx);
  });

  it("Revoke Delegate", async () => {
    const [delegateAccount, delegateAccountBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from(delegateAccountPrefix), wallet.publicKey.toBuffer()],
        program.programId
      );

    const tx = await program.methods
      .revokeDelegate()
      .accounts({
        authority: wallet.publicKey,
        delegateAccount: delegateAccount,
      })
      .rpc();

    console.log("revokeDelegate -", tx);
  });

  it("Should Create Token delegate", async () => {
    const mint = new anchor.web3.PublicKey(
      "5CY4inXAWEKDENqJ5ZLNaTYX8gzjHZNXimuj7VmFmVi6"
    );
    let wallet_ata = await getAssociatedTokenAddress(
      mint, // mint
      wallet.publicKey // owner
    );

    const [delegateAccount, delegateAccountBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from(delegateTokenAccountPrefix),
          wallet.publicKey.toBuffer(),
          wallet_ata.toBuffer(),
        ],
        program.programId
      );

    const tx = await program.methods
      .createTokenDelegate()
      .accounts({
        authority: wallet.publicKey,
        mint: mint,
        delegateTokenAccount: delegateAccount,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenAccount: wallet_ata,
        toDelegateAccount: hotWallet,
      })
      .rpc();

    console.log("createTokenDelegate -", tx);
  });

  it("Should revoke token account", async () => {
    const mint = new anchor.web3.PublicKey(
      "5CY4inXAWEKDENqJ5ZLNaTYX8gzjHZNXimuj7VmFmVi6"
    );
    let wallet_ata = await getAssociatedTokenAddress(
      mint, // mint
      wallet.publicKey // owner
    );

    const [delegateAccount, delegateAccountBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from(delegateTokenAccountPrefix),
          wallet.publicKey.toBuffer(),
          wallet_ata.toBuffer(),
        ],
        program.programId
      );

    const tx = await program.methods
      .revokeTokenDelegate()
      .accounts({
        authority: wallet.publicKey,
        delegateTokenAccount: delegateAccount,
      })
      .rpc();

    console.log("revokeTokenDelegate -", tx);
  });
});
