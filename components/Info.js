import React, { useState, useEffect, use } from 'react';
import { ethers } from 'ethers';
import { Toaster, toast } from 'react-hot-toast';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useChainId } from 'wagmi';
import 'tailwindcss/tailwind.css';
import { useEthersProvider, useEthersSigner } from './tl';
import { Alchemy, Network } from 'alchemy-sdk';

const Info = ({ handleClose,app }) => {
  
  const Wall = () => {
    return (
      <section>
        <div className="text-center mb-10">
          <h2 className="text-4xl text-pink-500 font-extrabold">The Wall User Guide</h2>
          <p className="text-gray-600 mt-2 text-lg">Discover how to engage with the on-chain chat spaces.</p>
        </div>
  
        {/* Introduction */}
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-bold text-gray-900">What is The Wall?</h3>
            <p className="text-gray-700 leading-relaxed">
              <strong>The Wall</strong> is an on-chain chat platform that allows users to communicate in a decentralized and immutable environment. It's like a global chat room where messages (tags) are stored onchain, ensuring transparency and permanence. Users can create their own spaces (walls), participate in chats, tip other users, and set up subscription-based access. Each wall operates independently and has its own unique token.
            </p>
          </div>
  
          {/* Key Features */}
          <div>
            <h3 className="text-xl font-bold text-gray-900">Key Features of The Wall</h3>
            <div className="text-gray-700 space-y-2">
              <p>💬 <strong>On-Chain Chat Spaces:</strong> Engage in conversations that are stored permanently onchain.</p>
              <p>🧱 <strong>Create Custom Walls:</strong> Set up your own chat spaces for specific communities or topics.</p>
              <p>🪙 <strong>Unique Tokens:</strong> Each wall has its own token that can be earned and used within that wall.</p>
              <p>✍️ <strong>Mint Messages (Tags):</strong> Send messages that become part of the blockchain history.</p>
              <p>💰 <strong>Tip Participants:</strong> Show appreciation by sending tokens to other users.</p>
              <p>🔒 <strong>Subscriptions:</strong> Earn <strong>ETH</strong> to your wallet by setting a subscription fee for your wall. Users can access your wall by paying the subscription fee.</p>
              <p>🌐 <strong>Multi-Network Support:</strong> Available on multiple supported Ethereum networks.</p>
            </div>
          </div>
  
          {/* How to Use The Wall */}
          <div>
            <h3 className="text-xl font-bold text-gray-900">How to Use The Wall</h3>
            <div className="text-gray-700 space-y-6">
              {/* Accessing Walls */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800">Accessing Walls</h4>
                <p>
                  Browse through the list of available walls or search for a specific one by name. Click on a wall to enter its chat space and see the latest messages. Try out a few walls to explore different communities and features.
                </p>
              </div>
  
              {/* Participating in Chats */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800">Participating in Chats</h4>
                <p>
                  To join the conversation, enter your message in the input area and click "Mint Tag". Your message will be added to the wall and stored on-chain, visible to all participants. Depending on the wall's settings, you might earn tokens for your participation.
                </p>
              </div>
  
              {/* Creating Your Own Wall */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800">Creating Your Own Wall</h4>
                <p>
                  Want to start a new chat space? Click on the <strong>"Deploy a New Wall"</strong> button and follow these steps:
                </p>
                <div className="mt-4 space-y-4 text-gray-700">
                  <div>
                    <p>🏷️ <strong>Name:</strong> Enter a unique name for your wall. This will help users identify and search for your chat space.</p>
                  </div>
                  <div>
                    <p>🔣 <strong>Symbol:</strong> Provide a symbol or abbreviation for your wall. This acts like a ticker and represents the wall's unique token.</p>
                  </div>
                  <div>
                    <p>💵 <strong>Price:</strong> Set the subscription fee (in ETH) for users to access your wall for 30 days. The fees collected go directly to your wallet as earnings. If you want open access, you can set this to zero.</p>
                  </div>
                  <div>
                    <p>✖️ <strong>Multiplier (Multi):</strong> Decide on a multiplier for token rewards. This determines how many tokens users earn when they post messages on your wall.</p>
                  </div>
                  <div>
                    <p>🔐 <strong>Subscription Wall:</strong> Choose whether your wall requires a subscription fee for access. Select "Yes" to enable subscriptions or "No" for open access.</p>
                  </div>
                  <div>
                    <p>🛠️ <strong>Can Moderate:</strong> Specify if you want moderation capabilities. Setting this to "Yes" allows you to manage content and users within your wall.</p>
                  </div>
                  <div>
                    <p>✏️ <strong>Can Change:</strong> Decide if users can change their messages after posting. "Yes" allows edits; "No" makes all messages permanent.</p>
                  </div>
                </div>
                <p className="mt-4">
                  After filling in all the details, click "Deploy Wall". You'll need to confirm the transaction in your wallet. Once deployed, your new wall will appear in the list, and others can join and interact in your chat space.
                </p>
              </div>
  
              {/* Tipping Users */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800">Tipping Users</h4>
                <p>
                  Support contributors by tipping them. Click the "Tip" button next to a message, specify the amount, and confirm the transaction to send tokens directly to the user.
                </p>
              </div>
  
              {/* Subscribing to Walls */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800">Subscribing to Walls</h4>
                <p>
                  Some walls may require a subscription fee for access. If prompted, you can subscribe by paying the specified fee, unlocking the ability to read and post messages in that wall. Subscription fees go directly to the wall owner's wallet.
                </p>
              </div>
            </div>
          </div>
  
          {/* Best Practices */}
          <div>
            <h3 className="text-xl font-bold text-gray-900">Best Practices</h3>
            <div className="text-gray-700 space-y-2">
              <p>🔐 <strong>Security:</strong> Ensure you're connected to the correct wallet and verify transactions before confirming.</p>
              <p>🌐 <strong>Network Compatibility:</strong> The Wall is available on multiple supported Ethereum networks. Check that you're on a compatible network for a seamless experience.</p>
              <p>🤗 <strong>Community Engagement:</strong> Respect others, follow community guidelines, and contribute positively.</p>
              <p>🧪 <strong>Explore Walls:</strong> Try out different walls to experience various communities and features.</p>
            </div>
          </div>
        </div>
  
        <button
          className="w-full py-3 bg-pink-500 text-white font-semibold rounded-full hover:bg-pink-600 transition duration-300 ease-in-out mt-12"
          onClick={handleClose}
        >
          Got it
        </button>
      </section>
    );
  };
  const Vault = () => {
    return (
          <div>
            <div>
              <button className="close cursor-pointer text-gray-600 text-2xl absolute top-4 right-4 focus:outline-none" onClick={handleClose}>
                &times;
              </button>
              <section id="create-info">
                <div className="text-center mb-10">
                  <h2 className="text-4xl text-pink-500 font-extrabold">Crypto Vault Survival Guide</h2>
                  <p className="text-gray-600 mt-2 text-lg">Learn how to create a vault and keep your assets safe.</p>
                </div>
      
                {/* Section 1: Crypto Vault Survival Guide */}
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">What is a Vault?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      A Vault is a secure smart contract that functions as a simple, safe savings account for your hot wallet. It allows you to deposit tokens and NFTs, set withdrawal limits, whitelist addresses, and require multiple signers for transactions. Vaults help keep your assets safe from drainers, hacks, open approvals, and lost or leaked private keys, making it an effective way to enhance the security and management of your digital assets.
                    </p>
                  </div>
      
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Benefits of Using a Vault</h3>
                    <div className="text-gray-700 space-y-2">
                      <p>🔒 <strong>Protection from Drainers:</strong> Vaults limit daily withdrawals, making it nearly impossible for malicious contracts to drain your account in one go.</p>
                      <p>🛡️ <strong>Mitigation Against Hacks:</strong> Even if a hacker gains access to your wallet, vault security measures like multisig approvals and daily limits give you time to react.</p>
                      <p>⚙️ <strong>Protection from Contract Hacks:</strong> Vaults prevent open token approvals from allowing unauthorized access to your assets.</p>
                      <p>🔑 <strong>Safety from Leaked Private Keys:</strong> Vaults offer multiple layers of security, such as requiring multiple signers and utilizing a recovery address, ensuring your assets are safe even if your private key is compromised.</p>
                    </div>
                  </div>
      
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Key Features of Crypto Vaults</h3>
                    <div className="text-gray-700 space-y-2">
                      <p>💰 <strong>Deposit & Withdraw Any Token/NFT:</strong> Vaults allow for easy deposit and withdrawal of any tokens or NFTs, offering flexibility in managing assets.</p>
                      <p>🌐 <strong>Universal Vaults:</strong> Vaults are universal, using the same address for every user across all chains.</p>
                      <p>📊 <strong>Daily Withdrawal Limits:</strong> Set daily limits to protect your assets from large losses due to hacks or mistakes.</p>
                      <p>🖊️ <strong>Multisig Approval:</strong> Require multiple signatures to approve transactions, adding extra protection.</p>
                      <p>✅ <strong>Whitelist Addresses:</strong> Authorize trusted addresses to interact with your vault and confirm transactions.</p>
                      <p>⏳ <strong>Safety Delays:</strong> Set a delay before certain transactions are executed to detect suspicious activity.</p>
                      <p>🛑 <strong>Freeze and Recovery:</strong> Freeze the vault to stop all activity and use the recovery address to regain access when needed.</p>
                    </div>
                  </div>
      
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">How to Use a Vault Effectively</h3>
                    <div className="text-gray-700 space-y-2">
                      <p>⚖️ <strong>Set Realistic Daily Limits:</strong> Balance security with flexibility by adjusting withdrawal limits based on your usage patterns.</p>
                      <p>🤝 <strong>Choose Trusted Signers:</strong> Select reliable, knowledgeable signers for multisig transactions to enhance protection.</p>
                      <p>📦 <strong>Use a Cold Wallet for Recovery:</strong> Ensure your recovery address is a secure cold wallet that’s stored safely offline.</p>
                    </div>
                  </div>
                </div>
      
                {/* Section 2: Creating a Vault */}
                <div className="space-y-8 mt-12">
                  <h3 className="text-2xl font-bold text-pink-500 text-center">Creating a Vault</h3>
      
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Vault Name</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Select a unique name for your vault on the chosen chain. The vault may be associated with a `.vlt.eth` domain if available, but this should not be relied upon for security purposes.
                    </p>
                  </div>
      
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Recovery Address</h3>
                    <p className="text-gray-700 leading-relaxed">
                      The recovery address is a secure cold wallet address used to recover access to your vault. Keep this address offline and stored securely to safeguard your assets.
                    </p>
                  </div>
      
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Whitelist Addresses</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Specify trusted addresses allowed to interact with your vault as signers. These addresses will confirm transactions according to your defined threshold. Separate multiple addresses with commas.
                    </p>
                  </div>
      
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Safety Delay</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Set a delay period (in days) to add an extra layer of security for non-daily transactions. After the delay, you can self-approve transactions. Set it to 0 to always require signers.
                    </p>
                  </div>
      
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Threshold</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Define the number of signers required to approve a transaction. This threshold ensures that no single signer has complete control over your assets.
                    </p>
                  </div>
      
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Daily Limit</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Set a daily withdrawal limit to control the amount of assets that can be withdrawn from the vault. This limits exposure to potential risks.
                    </p>
                  </div>
      
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Freeze</h3>
                    <p className="text-gray-700 leading-relaxed">
                      The vault can be frozen to stop all withdrawals and transactions. The vault owner, recovery address, or whitelisted addresses can initiate the freeze, but only the recovery address can unfreeze the vault.
                    </p>
                  </div>
                </div>
      {/* Using a Vault */}
    <div className="space-y-8 mt-12">
      <h3 className="text-2xl font-bold text-pink-500 text-center">Using a Vault</h3>
      
      {/* Depositing into the Vault */}
      <div>
        <h3 className="text-xl font-bold text-gray-900">Depositing into the Vault</h3>
        <p className="text-gray-700 leading-relaxed">
          💰 <strong>Deposit Tokens/NFTs using dApp:</strong> Select a token to deposit from the presets or use the "Deposit New Token" option in the Vault interface. Enter the amount you wish to deposit and follow the prompts to complete the transaction.
          <br />
          💸 <strong>Direct Deposit:</strong> You can also deposit tokens or NFTs by sending them directly to the vault’s address from your wallet, bypassing the dApp interface.
        </p>
      </div>
      
      {/* Managing Assets */}
      <div>
        <h3 className="text-xl font-bold text-gray-900">Managing Assets</h3>
        <div className="text-gray-700 space-y-2">
          <p>💼 <strong>View Balances:</strong> You can view the tokens and NFTs stored in your vault at any time within the app interface.</p>
          <p>📊 <strong>Set Token Limits:</strong> You can define fixed or percentage-based withdrawal limits for each asset, ensuring that only a portion of the asset can be withdrawn in a single day.</p>
          <p>❄️ <strong>Freeze Functionality:</strong> You can freeze the vault to stop all activity and withdrawals. Only the recovery address or a majority of signers can unfreeze it.</p>
        </div>
      </div>
      
      {/* Withdrawing Assets */}
      <div>
        <h3 className="text-xl font-bold text-gray-900">Withdrawing Assets</h3>
        <div className="text-gray-700 space-y-2">
          <p>🏦 <strong>Queue a Withdrawal:</strong> Use the Vault interface to queue a withdrawal of tokens or NFTs. Depending on your vault’s configuration, additional signers may need to approve the transaction. You can withdraw up to the daily limit without needing signers, but larger amounts or NFTs will require approval.</p>
          <p>📝 <strong>Approval Process:</strong> The whitelisted signers, according to the set threshold, must approve the transaction before it can be executed.</p>
          <p>⏳ <strong>Delayed Transactions:</strong> For large withdrawals, custom transactions, or NFTs, there may be a delay period. Once the delay passes without cancellation, the transaction can be executed without signers.</p>
        </div>
      </div>
      
      {/* Custom Transactions */}
      <div>
        <h3 className="text-xl font-bold text-gray-900">Custom Transactions</h3>
        <p className="text-gray-700 leading-relaxed">
          ⚙️ <strong>Vaults allow you to queue custom transactions.</strong> Specify a target address, an Ethereum value, and a function signature to call specific contract functions from the vault. This gives you advanced control over your assets.
        </p>
      </div>
    
      {/* Signers Confirming or Canceling Transactions */}
      <div>
        <h3 className="text-xl font-bold text-gray-900">Signers Confirming or Canceling Transactions</h3>
        <p className="text-gray-700 leading-relaxed">
          ✍️ <strong>Signers’ Role in Approval:</strong> Once a transaction is queued, any of the signers can review and approve it. If enough signers confirm, the transaction will be executed.
          <br />
          🛑 <strong>Canceling Transactions:</strong> During the delay period for large withdrawals, custom transactions, or NFTs, any signer or the vault owner can cancel the transaction, preventing it from being executed.
        </p>
      </div>
      
    </div>
    
                <button
                  className="w-full py-3 bg-pink-500 text-white font-semibold rounded-full hover:bg-pink-600 transition duration-300 ease-in-out mt-12"
                  onClick={handleClose}
                >
                  Got it
                </button>
              </section>
            </div>
          </div>
        );
      }      
      const Spot = () => {
        return (
          <section>
            <div className="text-center mb-10">
              <h2 className="text-4xl text-pink-500 font-extrabold">Spot User Guide</h2>
              <p className="text-gray-600 mt-2 text-lg">
                Learn how to use Spot for social loans and token lending.
              </p>
            </div>
    
            {/* Introduction */}
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900">What is Spot?</h3>
                <p className="text-gray-700 leading-relaxed">
                  <strong>Spot</strong> is a fresh platform that's revolutionizing the way you borrow and lend tokens among friends. It allows you to lend tokens without locking them up or sending them elsewhere—they stay safe in your own wallet. Spot makes it easy to set allowances for friends, enabling them to borrow tokens directly from your wallet up to a limit you set.
                </p>
              </div>
    
              {/* Key Features */}
              <div>
                <h3 className="text-xl font-bold text-gray-900">Key Features of Spot</h3>
                <div className="text-gray-700 space-y-2">
                  <p>🍕 <strong>Social Loans:</strong> Borrow and lend tokens directly between friends.</p>
                  <p>🔒 <strong>No Token Lock-up:</strong> Keep your tokens in your own wallet while they're available for lending.</p>
                  <p>🤝 <strong>Set Allowances:</strong> Decide which tokens and how much you're willing to lend to each friend.</p>
                  <p>💸 <strong>Direct Borrowing:</strong> Friends can borrow tokens directly from your wallet up to the limit you've set.</p>
                  <p>📊 <strong>Easy Tracking:</strong> Keep track of your lending and borrowing activities with intuitive dashboards.</p>
                </div>
              </div>
    
              {/* How to Use Spot */}
              <div>
                <h3 className="text-xl font-bold text-gray-900">How to Use Spot</h3>
                <div className="text-gray-700 space-y-6">
                  {/* Step 1 */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">Step 1: Connect Your Wallet 🔐</h4>
                    <p>
                      Click on the "Connect" button in the top right corner and choose your preferred wallet provider (e.g., MetaMask). This will allow Spot to interact with your wallet securely.
                    </p>
                  </div>
    
                  {/* Step 2 */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">Step 2: Set Allowances for Your Friends 🤝</h4>
                    <p>
                      In the "Spot a Friend" section, select the token you want to lend. Enter your friend's Ethereum address in the "Borrower Address" field, set the borrow amount, and click "Set Allowance." This grants your friend permission to borrow up to the specified amount.
                    </p>
                  </div>
    
                  {/* Step 3 */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">Step 3: Track Your Lending 📊</h4>
                    <p>
                      Navigate to the "Allowances to Friends" section to view all active allowances. You can see which friends you've spotted, adjust allowances, and monitor outstanding balances.
                    </p>
                  </div>
    
                  {/* Step 4 */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">Step 4: Borrow from Friends 💸</h4>
                    <p>
                      In the "Friends That Have Spotted Me" section, you can see which friends have set allowances for you. Enter the amount you'd like to borrow and click "Borrow" to receive tokens directly from their wallets.
                    </p>
                  </div>
    
                  {/* Step 5 */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">Step 5: Repay Borrowed Tokens 😎</h4>
                    <p>
                      When you're ready to repay, find the friend and token in the "Friends That Have Spotted Me" section. Enter the repayment amount and click "Repay" to return the tokens to your friend's wallet.
                    </p>
                  </div>
    
                  {/* Step 6 */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">Step 6: Monitor Your Borrowing 🏆</h4>
                    <p>
                      Keep an eye on your borrowing activity through the dashboard. Each token card shows your borrowing limit, outstanding balance, and a progress bar indicating how close you are to your limit.
                    </p>
                  </div>
                </div>
              </div>
    
              {/* Best Practices */}
              <div>
                <h3 className="text-xl font-bold text-gray-900">Best Practices</h3>
                <div className="text-gray-700 space-y-2">
                  <p>🔐 <strong>Security:</strong> Only set allowances for trusted friends and always double-check wallet addresses.</p>
                  <p>🤝 <strong>Responsibility:</strong> Borrow responsibly and repay on time to maintain trust within your network.</p>
                  <p>📈 <strong>Stay Informed:</strong> Regularly monitor your allowances and adjust them as needed.</p>
                </div>
              </div>
            </div>
    
            <button
              className="w-full py-3 bg-pink-500 text-white font-semibold rounded-full hover:bg-pink-600 transition duration-300 ease-in-out mt-12"
              onClick={handleClose}
            >
              Got it
            </button>
          </section>
        );
      };
 
      const Stream = () => {
        return (
            <section>
                <div className="text-center mb-10">
                    <h2 className="text-4xl text-pink-500 font-extrabold">Stream Payment Guide</h2>
                    <p className="text-gray-600 mt-2 text-lg">Learn how to set up and manage continuous token streams.</p>
                </div>
    
                {/* Introduction */}
                <div className="space-y-8">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">What is a Stream?</h3>
                        <p className="text-gray-700 leading-relaxed">
                            A <strong>Stream</strong> is a continuous, automated payment solution that allows you to send tokens incrementally over time. Ideal for subscription payments, salaries, grants, and other recurring payments, streams provide a smoother and more flexible approach to financial transactions.
                        </p>
                    </div>
    
                    {/* Benefits of Using Streams */}
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Benefits of Using Streams</h3>
                        <div className="text-gray-700 space-y-2">
                            <p>💸 <strong>Continuous Payments:</strong> Ensure recipients are paid incrementally over time without manual intervention.</p>
                            <p>🔒 <strong>Control and Flexibility:</strong> Set the amount, duration, and intervals for payments with full control.</p>
                            <p>📊 <strong>Transparency:</strong> Recipients can view payment progress in real-time, enhancing trust.</p>
                            <p>💰 <strong>Any Token:</strong> Stream payments in any token, providing flexibility for both senders and recipients.</p>
                            <p>⚙️ <strong>Set and Forget:</strong> Configure a stream once, and it will continue automatically, so you don’t need to manage recurring payments manually.</p>
                            <p>🕊️ <strong>Simple:</strong> There’s no need to wrap or deposit tokens – recipients claim payments directly from your wallet, keeping funds secure and accessible by you without needing to manage streams.</p>
                            <p>💲<strong>0 Fee:</strong> Stream payments without any fees, making it a cost-effective solution for recurring transactions.</p>
    </div>
                    </div>
                    {/* Key Features of Stream Payments */}
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Key Features of Stream Payments</h3>
                        <div className="text-gray-700 space-y-2">
                            <p>💰 <strong>Multi-Token Support:</strong> Stream in various tokens based on user preference.</p>
                            <p>🔄 <strong>Set Duration and Intervals:</strong> Specify how long the stream will last and how often payments will be sent.</p>
                            <p>📅 <strong>Customizable End Dates:</strong> Adjust end dates for a more tailored streaming schedule.</p>
                            <p>📈 <strong>Track Payment History:</strong> Easily monitor payments made to recipients over the streaming period.</p>
                            <p>🚫 <strong>Cancel Streams:</strong> Stop a stream anytime if circumstances change, with no hassle.</p>
                        </div>
                    </div>
    
                    {/* Claim All Feature */}
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Claim All</h3>
                        <p className="text-gray-700 leading-relaxed">
                            The <strong>Claim All</strong> feature allows users to collect all accumulated funds from their active streams in a single action. Instead of claiming each stream individually, use the "Claim All" button to collect available funds from all ongoing streams at once, saving time and gas fees.
                        </p>
                    </div>
    
                    {/* How to Use Streams */}
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">How to Use Streams</h3>
                        <div className="text-gray-700 space-y-6">
                            
                            {/* Setting Up a Stream */}
                            <div>
                                <h4 className="text-lg font-semibold text-gray-800">Setting Up a Stream</h4>
                                <p>
                                    To create a stream, enter the recipient's address, choose the token, specify the amount, and set the duration (in days). You can optionally set intervals for the payments (e.g., daily, weekly).
                                </p>
                            </div>
    
                            {/* Managing Active Streams */}
                            <div>
                                <h4 className="text-lg font-semibold text-gray-800">Managing Active Streams</h4>
                                <p>
                                    View and track your active streams through the dashboard. Each stream will show details like remaining balance, elapsed time, and upcoming payments.
                                </p>
                            </div>
    
                            {/* Claiming Funds */}
                            <div>
                                <h4 className="text-lg font-semibold text-gray-800">Claiming Funds</h4>
                                <p>
                                    Click "Claim" next to a specific stream to collect available funds, or use the "Claim All" button to collect from all streams simultaneously. The Claim All feature is a convenient option that aggregates claims across multiple streams, reducing transaction costs.
                                </p>
                            </div>
                        </div>
                    </div>
    
                    {/* Pro Mode Features */}
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Pro Mode Features</h3>
                        <p className="text-gray-700 leading-relaxed">
                            <strong>Pro Mode</strong> unlocks additional advanced features for power users, including batch streaming, customized payment intervals, and more. Toggle Pro Mode on to access these features.
                        </p>
                        <div className="text-gray-700 space-y-6">
                            
                            {/* Batch Streaming */}
                            <div>
                                <h4 className="text-lg font-semibold text-gray-800">Batch Streaming</h4>
                                <p>
                                    Send streams to multiple recipients simultaneously. Enter multiple recipient addresses, set a single token and amount, and start streaming payments to all recipients at once. Perfect for distributing payments to a team or multiple contributors.
                                </p>
                            </div>
    
    
                            {/* Unlimited Stream Option */}
                            <div>
                                <h4 className="text-lg font-semibold text-gray-800">Unlimited Stream Option</h4>
                                <p>
                                    Enable an unlimited stream that does not require a predefined end date. The stream will continue until manually stopped. This option is useful for long-term subscriptions or indefinite payments.
                                </p>
                            </div>
    
    
                        </div>
                    </div>
    
                    {/* Best Practices */}
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Best Practices</h3>
                        <div className="text-gray-700 space-y-2">
                            <p>🔐 <strong>Security:</strong> Double-check recipient addresses and payment details before confirming a stream.</p>
                            <p>📅 <strong>Choose Appropriate Intervals:</strong> Set intervals that match the payment needs, such as weekly or monthly, to avoid micro-transactions.</p>
                            <p>🔄 <strong>Monitor Active Streams:</strong> Regularly check your active streams to make adjustments if necessary.</p>
                        </div>
                    </div>
                </div>
    
                <button
                    className="w-full py-3 bg-pink-500 text-white font-semibold rounded-full hover:bg-pink-600 transition duration-300 ease-in-out mt-12"
                    onClick={handleClose}
                >
                    Got it
                </button>
            </section>
        );
    };
    const Sub = () => {
      return (
          <section>
              <div className="text-center mb-10">
                  <h2 className="text-4xl text-pink-500 font-extrabold">Spot.Pizza Sub Guide 🍕</h2>
                  <p className="text-gray-600 mt-2 text-lg">
                      Welcome to Sub, your one-stop solution for creating, managing, and earning from on-chain subscriptions! 🍕🎉
                  </p>
              </div>
  
              {/* What Is a Sub and How Does It Work? */}
              <div className="space-y-8">
                  <div>
                      <h3 className="text-xl font-bold text-gray-900">What Is a Sub and How Does It Work? 🍕🤔</h3>
                      <p className="text-gray-700 leading-relaxed">
                          A <strong>Sub</strong> is an on-chain stream where you (the subscriber) send a specific amount of tokens to a recipient at defined intervals or over a certain period. It allows you to support creators, services, or friends directly from your crypto wallet, without intermediaries! 💖
                      </p>
                  </div>
  
                  {/* Benefits of Using Sub */}
                  <div>
                      <h3 className="text-xl font-bold text-gray-900">Benefits of Using Sub</h3>
                      <div className="text-gray-700 space-y-2">
                          <p>🔒 <strong>Direct Support:</strong> Support creators and services directly without relying on intermediaries.</p>
                          <p>💸 <strong>Any ERC-20 Token:</strong> Stream payments with any ERC-20 token, making it flexible and user-friendly.</p>
                          <p>🛡️ <strong>No Deposits or Wrapping:</strong> Your tokens stay in your wallet until streamed, so there's no need to deposit or wrap tokens.</p>
                          <p>🚀 <strong>Set and Forget:</strong> One-tap setup for a subscription that runs automatically with no need for further action.</p>
                          <p>🌐 <strong>Evergreen Links:</strong> Share your subscription link with multiple subscribers. One link, unlimited subscribers!</p>
                          <p>🔄 <strong>Recurring or One-Time:</strong> Set up recurring payments or one-time payments as needed.</p>
                      </div>
                  </div>
  
                  {/* Creating a Subscription */}
                  <div>
                      <h3 className="text-xl font-bold text-gray-900">Creating a Subscription 🍕✏️</h3>
                      <p className="text-gray-700 leading-relaxed">
                          Access the "Create Subscription" section on Spot.Pizza. Fill in the details such as the network, token, recipient address, amount, and duration. Generate a unique, evergreen subscription link to share with subscribers. 🌐
                      </p>
                  </div>
  
                  {/* Subscribing to a Service */}
                  <div>
                      <h3 className="text-xl font-bold text-gray-900">Subscribing to a Service 🎟️</h3>
                      <div className="text-gray-700 space-y-6">
                          <p>Paste the subscription link in your browser, connect your wallet, and review the details (recipient, token, amount, and duration).</p>
                          <p>Click "Subscribe" and confirm any necessary token approvals and transactions in your wallet.</p>
                      </div>
                  </div>
  
                  {/* Managing Subscriptions */}
                  <div>
                      <h3 className="text-xl font-bold text-gray-900">Managing Your Subscriptions 📋</h3>
                      <div className="text-gray-700 space-y-6">
                          <p>🔄 <strong>Check Subscriptions:</strong> View all active subscriptions, including recipients, tokens, amounts, and statuses.</p>
                          <p>❌ <strong>Cancel Anytime:</strong> Cancel any subscription at any time directly from your list of active subscriptions.</p>
                      </div>
                  </div>
  
                  {/* Claiming Subscriptions */}
                  <div>
                      <h3 className="text-xl font-bold text-gray-900">Claiming Subscriptions 💰</h3>
                      <p className="text-gray-700 leading-relaxed">
                          Go to the "Subscribed To Me" section to view available funds. Claim funds individually or click "Claim All" to collect from all subscriptions at once, saving on gas fees. 💸
                      </p>
                  </div>
  
                  {/* Pro Mode Features */}
                  <div>
                      <h3 className="text-xl font-bold text-gray-900">Pro Mode Features 🌟</h3>
                      <div className="text-gray-700 space-y-6">
                          <p>💼 <strong>Advanced Sub Links:</strong> Create different links with custom tokens, durations, and amounts for specific needs.</p>
                          <p>🌍 <strong>Multi-Network Support:</strong> Create subscription links on various Ethereum-compatible networks, offering flexibility for you and your subscribers.</p>
                      </div>
                  </div>
  
                  {/* Best Practices */}
                  <div>
                      <h3 className="text-xl font-bold text-gray-900">Best Practices</h3>
                      <div className="text-gray-700 space-y-2">
                          <p>🔐 <strong>Security:</strong> Double-check all details before sharing or subscribing to a link.</p>
                          <p>🌐 <strong>Track Subscriptions:</strong> Monitor your active subs to stay aware of active payments and available funds.</p>
                      </div>
                  </div>
              </div>
  
              <button
                  className="w-full py-3 bg-pink-500 text-white font-semibold rounded-full hover:bg-pink-600 transition duration-300 ease-in-out mt-12"
                  onClick={handleClose}
              >
                  Got it
              </button>
          </section>
      );
  };
  const FeedGuide = () => (
    <section>
      <div className="text-center mb-10">
        <h2 className="text-4xl text-pink-500 font-extrabold">Feed User Guide</h2>
        <p className="text-gray-600 mt-2 text-lg">
          A complete guide to using Feed for creating and managing blogs, posts, comments, tips, and subscriptions.
        </p>
      </div>

      <div className="space-y-8">
        {/* Introduction */}
        <div>
          <h3 className="text-xl font-bold text-gray-900">What is Feed?</h3>
          <p className="text-gray-700 leading-relaxed">
            <strong>Feed</strong> is a decentralized blogging and social platform that allows users to create and manage blogs, publish posts, add comments, and support content through likes and tips. Premium content can be accessed through subscriptions, making it a versatile space for creators and readers.
          </p>
        </div>

        {/* Key Features */}
        <div>
          <h3 className="text-xl font-bold text-gray-900">Key Features of Feed</h3>
          <div className="text-gray-700 space-y-2">
            <p>✍️ <strong>Create Blogs:</strong> Set up a unique blog with a bio, subscription token, and optional subscription cost.</p>
            <p>📖 <strong>Publish Posts:</strong> Share text and images with support for Markdown formatting.</p>
            <p>💬 <strong>Comment:</strong> Engage with posts by adding and responding to comments.</p>
            <p>💰 <strong>Tip Creators:</strong> Support posts and comments by tipping in tokens.</p>
            <p>♡ <strong>Like Content:</strong> Show appreciation for posts and comments by liking them.</p>
            <p>🔒 <strong>Subscription-Based Access:</strong> Pay a monthly fee to access premium content on blogs.</p>
          </div>
        </div>

        {/* How to Use Feed */}
        <div>
          <h3 className="text-xl font-bold text-gray-900">How to Use Feed</h3>
          <div className="text-gray-700 space-y-6">

            {/* Creating a Blog */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800">Creating a Blog</h4>
              <p>
                In the <strong>Create Blog</strong> section, enter a blog name, bio, subscription token, and monthly subscription cost if desired. Click <strong>Create Blog</strong> to make your blog public. You can update your blog anytime.
              </p>
            </div>

            {/* Publishing a Post */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800">Publishing a Post</h4>
              <p>
                In the <strong>Create Post</strong> section, write your content in Markdown format. Add a title and images if needed, then click <strong>Create Post</strong> to share it on your blog.
              </p>
            </div>

            {/* Commenting and Engaging */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800">Commenting and Engaging</h4>
              <p>
                Open any post to view comments and add your own. Enter your comment and click <strong>Create Comment</strong>. You can also like and tip other comments.
              </p>
            </div>

            {/* Tipping Posts and Comments */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800">Tipping Posts and Comments</h4>
              <p>
                To support content creators, click <strong>Tip</strong> next to a post or comment, enter your tip amount, and confirm the transaction.
              </p>
            </div>

            {/* Subscribing to Premium Content */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800">Subscribing to Premium Content</h4>
              <p>
                Some blogs require a subscription fee to access premium content. Click <strong>Subscribe to Blog</strong> to pay the fee and unlock all posts on that blog.
              </p>
            </div>
          </div>
        </div>

        {/* Best Practices */}
        <div>
          <h3 className="text-xl font-bold text-gray-900">Best Practices</h3>
          <div className="text-gray-700 space-y-2">
            <p>🔐 <strong>Security:</strong> Verify transaction details before confirming.</p>
            <p>🌟 <strong>Support Creators:</strong> Like and tip content to encourage creators.</p>
            <p>🔄 <strong>Stay Updated:</strong> Regularly check blogs for new posts and interactions.</p>
          </div>
        </div>
      </div>

      <button onClick={handleClose} className="w-full py-3 bg-pink-500 text-white font-semibold rounded-full hover:bg-pink-600 transition duration-300 ease-in-out mt-12">
        Got it
      </button>
    </section>
  );

      return(
  <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 w-full" onClick={handleClose}>
        <div
        style={{ overflowY: 'auto', scrollbarWidth: 'thin', WebkitScrollbarWidth: 'thin', WebkitScrollbarTrack: { backgroundColor: '#e5e7eb', borderRadius: '9999px', }, WebkitScrollbarThumb: { backgroundColor: '#9ca3af', borderRadius: '9999px', border: '2px solid #e5e7eb', }, }}
      id="info-section" className="absolute top-2 bg-white p-8 overflow-y-auto max-w-3xl m-4 mx-auto rounded-3xl shadow-lg justify-center inset-0">
  {app == 'wall'&& <Wall />}
  {app == 'vault'&& <Vault />}
  {app == 'spot'&& <Spot />}
  {app == 'stream'&& <Stream />}
  {app == 'sub'&& <Sub />}
  {app == 'feed'&& <FeedGuide />}
  </div>
  </div>
      );
  
}

export default Info;

