// TON Connect functionality
const TONConnect = {
    connector: null,
    
    // Initialize TON Connect
    async init() {
        try {
            this.connector = new TonConnectSDK.TonConnect({
                manifestUrl: 'https://muntasil79.github.io/Cx-Miner/tonconnect-manifest.json'
            });
            
            if (this.connector.connected) {
                await this.handleConnectedWallet();
            }
            
            this.connector.onStatusChange(async walletInfo => {
                if (walletInfo) {
                    await this.handleConnectedWallet(walletInfo);
                } else {
                    this.handleDisconnectedWallet();
                }
            });
            
        } catch (error) {
            console.error('TON Connect initialization failed:', error);
            UI.showToast('Failed to initialize wallet connection', 'error');
        }
    },
    
    // Handle wallet connection
    async handleConnectedWallet(walletInfo) {
        GameState.data.walletConnected = true;
        UI.updateWalletStatus(true);
        
        if (walletInfo) {
            await this.fetchRealBalances(walletInfo.account.address);
        }
        
        UI.showToast('Wallet connected successfully', 'success');
    },
    
    // Handle wallet disconnection
    handleDisconnectedWallet() {
        GameState.data.walletConnected = false;
        GameState.data.tonBalance = 0;
        UI.updateWalletStatus(false);
        UI.updateWalletDisplay();
    },
    
    // Fetch real balances from blockchain
    async fetchRealBalances(walletAddress) {
        try {
            UI.showWalletLoading(true);
            
            const tonResponse = await fetch(`https://toncenter.com/api/v2/getAddressInformation?address=${walletAddress}`);
            const tonData = await tonResponse.json();
            
            if (tonData.result && tonData.result.balance) {
                GameState.data.tonBalance = tonData.result.balance / 1000000000;
                UI.updateWalletDisplay();
            }
            
            UI.showWalletLoading(false);
        } catch (error) {
            console.error('Failed to fetch balances:', error);
            UI.showWalletLoading(false, 'Error fetching balances');
            UI.showToast('Failed to fetch wallet balances', 'error');
        }
    },
    
    // Connect to specific wallet
    connectWallet(walletType) {
        if (!this.connector) return;
        
        const universalLink = this.connector.connect({
            [walletType]: walletType
        });
        
        window.open(universalLink, '_blank');
    },
    
    // Disconnect wallet
    disconnectWallet() {
        if (this.connector) {
            this.connector.disconnect();
        }
    }
};

// Add these methods to your TONConnect object
const TONConnect = {
    // ... existing code ...
    
    // Purchase item with TON
    async purchaseWithTON(itemId, price) {
        try {
            UI.showWalletLoading(true, 'Processing transaction...');
            
            // Simulate transaction (replace with actual TON transaction)
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Deduct balance and add item
            GameState.data.tonBalance -= price;
            GameState.data.premiumItems[itemId] = true;
            GameState.save();
            
            UI.updateWalletDisplay();
            UI.updatePremiumShop();
            UI.showWalletLoading(false);
            UI.showToast('Purchase successful!', 'success');
            
            return true;
        } catch (error) {
            console.error('TON purchase failed:', error);
            UI.showWalletLoading(false, 'Transaction failed');
            UI.showToast('Purchase failed', 'error');
            return false;
        }
    },
    
    // Handle incoming TON (simulated)
    handleIncomingTON(amount) {
        GameState.data.tonBalance += amount;
        GameState.save();
        UI.updateWalletDisplay();
        UI.showToast(`Received ${amount} TON!`, 'success');
    }
};
