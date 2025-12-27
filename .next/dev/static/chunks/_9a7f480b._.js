(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/constants/index.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PROGRAM_ID",
    ()=>PROGRAM_ID,
    "RPC_ENDPOINT",
    ()=>RPC_ENDPOINT,
    "STAKE_SEED",
    ()=>STAKE_SEED,
    "VAULT_SEED",
    ()=>VAULT_SEED,
    "VAULT_SOL_SEED",
    ()=>VAULT_SOL_SEED
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$web3$2e$js$2f$lib$2f$index$2e$browser$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@solana/web3.js/lib/index.browser.esm.js [app-client] (ecmascript)");
;
const PROGRAM_ID = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$web3$2e$js$2f$lib$2f$index$2e$browser$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PublicKey"]('BjXncxDW9oA7TqLdWVLcgyhoPT3vecadXmi9HJFw2Hmc');
const RPC_ENDPOINT = 'http://127.0.0.1:8899';
const VAULT_SEED = 'vault';
const VAULT_SOL_SEED = 'vault_sol';
const STAKE_SEED = 'stake';
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/target/idl/stake.json (json)", ((__turbopack_context__) => {

__turbopack_context__.v({"address":"BjXncxDW9oA7TqLdWVLcgyhoPT3vecadXmi9HJFw2Hmc","metadata":{"name":"stake","version":"0.1.0","spec":"0.1.0","description":"Created with Anchor"},"instructions":[{"name":"initialize_vault","docs":["Initializes the staking vault"],"discriminator":[48,191,163,44,71,129,63,164],"accounts":[{"name":"authority","docs":["The authority that will manage the vault.","Pays for account creation and becomes the vault admin."],"writable":true,"signer":true},{"name":"vault","docs":["Vault PDA storing staking configuration.","","Seeds: [\"vault\"]","- Deterministic: Anyone can derive this address","- Singleton: Only one vault per program deployment","- Program-owned: Only this program can modify it"],"writable":true,"pda":{"seeds":[{"kind":"const","value":[118,97,117,108,116]}]}},{"name":"vault_sol_account","docs":["PDA system account that holds staked SOL.","","Seeds: [\"vault_sol\"]","- This is a System Program-owned account (not a program account)","- Allows holding native SOL that can be transferred via CPI","- Program signs for withdrawals using PDA seeds","","1. Seeds are validated by Anchor","2. Rent-exempt system account","3. Only program can sign for transfers from this PDA"],"writable":true,"pda":{"seeds":[{"kind":"const","value":[118,97,117,108,116,95,115,111,108]}]}},{"name":"system_program","address":"11111111111111111111111111111111"}],"args":[]},{"name":"stake_sol","docs":["Stakes native SOL into the vault"],"discriminator":[200,38,157,155,245,57,236,168],"accounts":[{"name":"user","docs":["The user staking SOL. Must sign the transaction.","Marked as mutable because SOL will be debited from this account."],"writable":true,"signer":true},{"name":"vault","docs":["The vault PDA storing global staking state.","Mutable because we update total_staked."],"writable":true,"pda":{"seeds":[{"kind":"const","value":[118,97,117,108,116]}]}},{"name":"stake_account","docs":["The user's stake account PDA.","Seeds: [\"stake\", user_pubkey] - unique per user.","init_if_needed: Creates on first stake, reuses on subsequent stakes."],"writable":true,"pda":{"seeds":[{"kind":"const","value":[115,116,97,107,101]},{"kind":"account","path":"user"}]}},{"name":"vault_sol_account","docs":["PDA system account that holds staked SOL.","This is where all staked SOL is pooled."],"writable":true,"pda":{"seeds":[{"kind":"const","value":[118,97,117,108,116,95,115,111,108]}]}},{"name":"system_program","docs":["Required for SOL transfers via CPI."],"address":"11111111111111111111111111111111"}],"args":[{"name":"amount","type":"u64"}]},{"name":"unstake_sol","docs":["Unstakes native SOL from the vault"],"discriminator":[70,150,140,208,166,13,252,150],"accounts":[{"name":"user","docs":["The user unstaking SOL. Must be the owner of the StakeAccount.","Will receive the unstaked SOL and rent from closed account."],"writable":true,"signer":true},{"name":"vault","docs":["The vault PDA storing global staking state.","Mutable because we update total_staked."],"writable":true,"pda":{"seeds":[{"kind":"const","value":[118,97,117,108,116]}]}},{"name":"stake_account","docs":["The user's stake account PDA.","- Seeds verify this belongs to the user","- Constraint ensures caller is the owner","- close = user: Returns rent lamports to user after unstaking"],"writable":true,"pda":{"seeds":[{"kind":"const","value":[115,116,97,107,101]},{"kind":"account","path":"user"}]}},{"name":"vault_sol_account","docs":["PDA system account that holds staked SOL.","SOL will be transferred from here back to the user.","","1. Seeds are validated by Anchor","2. Bump is verified against stored vault.vault_bump","3. Only this program can sign for transfers via invoke_signed"],"writable":true,"pda":{"seeds":[{"kind":"const","value":[118,97,117,108,116,95,115,111,108]}]}},{"name":"system_program","docs":["Required for SOL transfers via CPI."],"address":"11111111111111111111111111111111"}],"args":[{"name":"amount","type":"u64"}]}],"accounts":[{"name":"StakeAccount","discriminator":[80,158,67,124,50,189,192,255]},{"name":"Vault","discriminator":[211,8,232,43,2,152,117,119]}],"errors":[{"code":6000,"name":"InvalidAmount","msg":"Invalid amount: must be greater than zero"},{"code":6001,"name":"Unauthorized","msg":"Unauthorized: caller does not own this stake account"},{"code":6002,"name":"NoActiveStake","msg":"No active stake: user has not staked any SOL"},{"code":6003,"name":"EarlyUnstake","msg":"Early unstake: stake is still locked, please wait until lock period ends"},{"code":6004,"name":"InsufficientFunds","msg":"Insufficient funds: unstake amount exceeds staked balance"},{"code":6005,"name":"Overflow","msg":"Arithmetic overflow: operation would exceed maximum value"}],"types":[{"name":"StakeAccount","docs":["StakeAccount PDA for tracking a user's native SOL stake.","","## PDA Seeds: [\"stake\", user_pubkey]","- `\"stake\"`: Namespace prefix to avoid collisions with other PDAs","- `user_pubkey`: The staker's wallet address, ensuring one stake account per user","","## Space Calculation","- Discriminator: 8 bytes (Anchor account identifier)","- user: 32 bytes (Pubkey)","- amount: 8 bytes (u64)","- stake_timestamp: 8 bytes (i64)","- bump: 1 byte (u8)","- Total: 8 + 32 + 8 + 8 + 1 = 57 bytes","","Using InitSpace derive macro for automatic calculation."],"type":{"kind":"struct","fields":[{"name":"user","docs":["The user's wallet pubkey who owns this stake.","Used as part of PDA seeds to ensure unique stake account per user."],"type":"pubkey"},{"name":"amount","docs":["Amount of native SOL staked in lamports.","1 SOL = 1_000_000_000 lamports (10^9).","u64 max: ~18.4 billion SOL (more than total supply)."],"type":"u64"},{"name":"stake_timestamp","docs":["Unix timestamp (seconds) when the stake was created or last updated.","Used for calculating staking duration, rewards, or enforcing lock periods.","i64 allows dates until year 292 billion."],"type":"i64"},{"name":"bump","docs":["Bump seed for PDA derivation.","Stored to avoid recalculating during subsequent instructions.","Seeds: [\"stake\", user.key().as_ref()], bump"],"type":"u8"}]}},{"name":"Vault","docs":["Vault PDA (Program Derived Address) for holding staked SOL.","","## Why use a PDA?","- **Deterministic**: The address is derived from seeds [\"vault\"], making it","predictable and discoverable by anyone with the program ID.","- **Program-owned**: Only this program can sign for the PDA, ensuring","SOL can only be moved through program instructions.","- **No private key**: PDAs have no corresponding private key, eliminating","the risk of key compromise.","- **Rent-exempt**: Initialized with enough lamports to be rent-exempt,","ensuring the account persists indefinitely.","","## Seeds: [\"vault\"]","Single seed creates a unique, singleton vault per program deployment."],"type":{"kind":"struct","fields":[{"name":"authority","docs":["Authority that can manage the vault (e.g., admin operations)"],"type":"pubkey"},{"name":"bump","docs":["Bump seed used to derive the PDA - stored to avoid recalculation"],"type":"u8"},{"name":"vault_bump","docs":["Bump seed for the vault's SOL holding account"],"type":"u8"},{"name":"total_staked","docs":["Total lamports (SOL) staked in the vault"],"type":"u64"}]}}]});}),
"[project]/app/utils/anchorClient.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getStakingProgram",
    ()=>getStakingProgram
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$coral$2d$xyz$2f$anchor$2f$dist$2f$browser$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@coral-xyz/anchor/dist/browser/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$web3$2e$js$2f$lib$2f$index$2e$browser$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@solana/web3.js/lib/index.browser.esm.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/constants/index.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$target$2f$idl$2f$stake$2e$json__$28$json$29$__ = __turbopack_context__.i("[project]/target/idl/stake.json (json)");
;
;
;
;
const getStakingProgram = (wallet)=>{
    // Create connection to Solana cluster (localnet/devnet/mainnet)
    const connection = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$web3$2e$js$2f$lib$2f$index$2e$browser$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Connection"](__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RPC_ENDPOINT"], 'confirmed');
    // Create AnchorProvider - bridges wallet adapter with Anchor
    // This provider handles signing transactions using the connected wallet
    const provider = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$coral$2d$xyz$2f$anchor$2f$dist$2f$browser$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["AnchorProvider"](connection, wallet, {
        commitment: 'confirmed'
    });
    // Initialize and return the Program instance with:
    // - IDL: defines the program's interface (accounts, instructions, types)
    // - Program ID: on-chain address of the deployed program
    // - Provider: handles RPC calls and transaction signing
    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$coral$2d$xyz$2f$anchor$2f$dist$2f$browser$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Program"](__TURBOPACK__imported__module__$5b$project$5d2f$target$2f$idl$2f$stake$2e$json__$28$json$29$__["default"], __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PROGRAM_ID"], provider);
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/utils/pda.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getStakePda",
    ()=>getStakePda,
    "getVaultPda",
    ()=>getVaultPda,
    "getVaultSolPda",
    ()=>getVaultSolPda
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$buffer$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/compiled/buffer/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$web3$2e$js$2f$lib$2f$index$2e$browser$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@solana/web3.js/lib/index.browser.esm.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/constants/index.ts [app-client] (ecmascript)");
;
;
const getVaultPda = ()=>{
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$web3$2e$js$2f$lib$2f$index$2e$browser$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PublicKey"].findProgramAddressSync([
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$buffer$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Buffer"].from(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["VAULT_SEED"])
    ], __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PROGRAM_ID"]);
};
const getVaultSolPda = ()=>{
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$web3$2e$js$2f$lib$2f$index$2e$browser$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PublicKey"].findProgramAddressSync([
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$buffer$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Buffer"].from(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["VAULT_SOL_SEED"])
    ], __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PROGRAM_ID"]);
};
const getStakePda = (userPublicKey)=>{
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$web3$2e$js$2f$lib$2f$index$2e$browser$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PublicKey"].findProgramAddressSync([
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$buffer$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Buffer"].from(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STAKE_SEED"]),
        userPublicKey.toBuffer()
    ], __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PROGRAM_ID"]);
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$wallet$2d$adapter$2d$react$2f$lib$2f$esm$2f$useConnection$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@solana/wallet-adapter-react/lib/esm/useConnection.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$wallet$2d$adapter$2d$react$2f$lib$2f$esm$2f$useWallet$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@solana/wallet-adapter-react/lib/esm/useWallet.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$web3$2e$js$2f$lib$2f$index$2e$browser$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@solana/web3.js/lib/index.browser.esm.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$coral$2d$xyz$2f$anchor$2f$dist$2f$browser$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@coral-xyz/anchor/dist/browser/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$coral$2d$xyz$2f$anchor$2f$node_modules$2f$bn$2e$js$2f$lib$2f$bn$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BN$3e$__ = __turbopack_context__.i("[project]/node_modules/@coral-xyz/anchor/node_modules/bn.js/lib/bn.js [app-client] (ecmascript) <export default as BN>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/shared/lib/app-dynamic.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$anchorClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/utils/anchorClient.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$pda$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/utils/pda.ts [app-client] (ecmascript)");
;
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
;
const WalletMultiButton = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(async ()=>(await __turbopack_context__.A("[project]/node_modules/@solana/wallet-adapter-react-ui/lib/esm/index.js [app-client] (ecmascript, next/dynamic entry, async loader)")).WalletMultiButton, {
    loadableGenerated: {
        modules: [
            "[project]/node_modules/@solana/wallet-adapter-react-ui/lib/esm/index.js [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
});
_c = WalletMultiButton;
function Home() {
    _s();
    const { connection } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$wallet$2d$adapter$2d$react$2f$lib$2f$esm$2f$useConnection$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useConnection"])();
    const wallet = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$wallet$2d$adapter$2d$react$2f$lib$2f$esm$2f$useWallet$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWallet"])();
    const [balance, setBalance] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [stakedAmount, setStakedAmount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [amount, setAmount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Home.useEffect": ()=>{
            if (wallet.publicKey) {
                fetchData();
            }
        }
    }["Home.useEffect"], [
        wallet.publicKey
    ]);
    const fetchData = async ()=>{
        if (!wallet.publicKey) return;
        try {
            const bal = await connection.getBalance(wallet.publicKey);
            setBalance(bal / __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$web3$2e$js$2f$lib$2f$index$2e$browser$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LAMPORTS_PER_SOL"]);
            const program = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$anchorClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getStakingProgram"])(wallet);
            const [stakeAccountPda] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$pda$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getStakePda"])(wallet.publicKey);
            const accountInfo = await connection.getAccountInfo(stakeAccountPda);
            if (accountInfo) {
                const stakeAccount = await program.account.stakeAccount.fetch(stakeAccountPda);
                setStakedAmount(stakeAccount.amount.toNumber() / __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$web3$2e$js$2f$lib$2f$index$2e$browser$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LAMPORTS_PER_SOL"]);
            }
        } catch (err) {
            console.error('Error:', err);
        }
    };
    const handleStake = async ()=>{
        if (!wallet.publicKey || !amount) return;
        setLoading(true);
        try {
            const amountInLamports = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$coral$2d$xyz$2f$anchor$2f$node_modules$2f$bn$2e$js$2f$lib$2f$bn$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BN$3e$__["BN"](parseFloat(amount) * __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$web3$2e$js$2f$lib$2f$index$2e$browser$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LAMPORTS_PER_SOL"]);
            const program = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$anchorClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getStakingProgram"])(wallet);
            const [vaultPda] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$pda$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getVaultPda"])();
            const [vaultSolPda] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$pda$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getVaultSolPda"])();
            const [stakeAccountPda] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$pda$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getStakePda"])(wallet.publicKey);
            await program.methods.stakeSol(amountInLamports).accountsPartial({
                user: wallet.publicKey,
                vault: vaultPda,
                stakeAccount: stakeAccountPda,
                vaultSolAccount: vaultSolPda,
                systemProgram: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$web3$2e$js$2f$lib$2f$index$2e$browser$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemProgram"].programId
            }).rpc();
            setAmount('');
            await fetchData();
        } catch (error) {
            console.error('Stake failed:', error);
            alert(error.message || 'Failed');
        } finally{
            setLoading(false);
        }
    };
    const handleUnstake = async ()=>{
        if (!wallet.publicKey) return;
        setLoading(true);
        try {
            const program = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$anchorClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getStakingProgram"])(wallet);
            const [vaultPda] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$pda$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getVaultPda"])();
            const [vaultSolPda] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$pda$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getVaultSolPda"])();
            const [stakeAccountPda] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$pda$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getStakePda"])(wallet.publicKey);
            await program.methods.unstakeSol().accountsPartial({
                user: wallet.publicKey,
                vault: vaultPda,
                stakeAccount: stakeAccountPda,
                vaultSolAccount: vaultSolPda
            }).rpc();
            await fetchData();
        } catch (error) {
            console.error('Unstake failed:', error);
            alert(error.message || 'Failed');
        } finally{
            setLoading(false);
        }
    };
    if (!wallet.connected) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
            className: "min-h-screen flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-4xl font-bold mb-8",
                        children: "SOL Staking"
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 116,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(WalletMultiButton, {}, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 117,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 115,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/page.tsx",
            lineNumber: 114,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "min-h-screen flex items-center justify-center p-4",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-full max-w-md text-center space-y-6",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                    className: "text-3xl font-bold mb-6",
                    children: "SOL Staking"
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 126,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(WalletMultiButton, {}, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 128,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "border border-gray-700 rounded-lg p-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-gray-400",
                            children: "Balance"
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 131,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-2xl font-bold",
                            children: [
                                balance.toFixed(2),
                                " SOL"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 132,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 130,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "border border-gray-700 rounded-lg p-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-gray-400",
                            children: "Staked"
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 136,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-2xl font-bold",
                            children: [
                                stakedAmount.toFixed(2),
                                " SOL"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 137,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 135,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "border border-gray-700 rounded-lg p-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-lg font-bold mb-4",
                            children: "Stake SOL"
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 141,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            type: "number",
                            placeholder: "Amount",
                            value: amount,
                            onChange: (e)=>setAmount(e.target.value),
                            className: "w-full bg-gray-900 border border-gray-700 rounded p-3 text-white mb-4"
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 142,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleStake,
                            disabled: loading || !amount,
                            className: "w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white py-3 rounded",
                            children: loading ? 'Processing...' : 'Stake'
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 149,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 140,
                    columnNumber: 9
                }, this),
                stakedAmount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "border border-gray-700 rounded-lg p-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-lg font-bold mb-4",
                            children: "Unstake"
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 160,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleUnstake,
                            disabled: loading,
                            className: "w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white py-3 rounded",
                            children: loading ? 'Processing...' : 'Unstake All'
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 161,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 159,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/page.tsx",
            lineNumber: 125,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 124,
        columnNumber: 5
    }, this);
}
_s(Home, "qgZiLvbC4bCnFE7MZXjJ2NOtE9s=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$wallet$2d$adapter$2d$react$2f$lib$2f$esm$2f$useConnection$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useConnection"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$wallet$2d$adapter$2d$react$2f$lib$2f$esm$2f$useWallet$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWallet"]
    ];
});
_c1 = Home;
var _c, _c1;
__turbopack_context__.k.register(_c, "WalletMultiButton");
__turbopack_context__.k.register(_c1, "Home");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_9a7f480b._.js.map