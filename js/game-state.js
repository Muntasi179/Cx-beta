// Game state management
const GameState = {
    // Default state
    data: {
        points: 0,
        energy: 100,
        maxEnergy: 100,
        energyRegen: 0.5,
        multitap: 1,
        totalTaps: 0,
        level: 1,
        multiplierActive: false,
        multiplierTime: 0,
        walletConnected: false,
        lastSave: Date.now(),
        tonBalance: 0,
        starBalance: 0,
        soundEnabled: false,
        vibrationEnabled: false,
        reduceAnimations: false,
        referralCode: "ref" + Math.floor(Math.random() * 10000),
        lastTapTime: 0,
        tapCooldown: 100,
        streakCount: 0,
        lastStreakClaim: null,
        notifications: [
            {
                id: 1,
                title: "Welcome to CX Miner!",
                message: "Start tapping to earn CX coins. Connect your wallet to purchase boosts.",
                time: new Date().toISOString(),
                read: false
            },
            {
                id: 2,
                title: "Daily Bonus Available",
                message: "Claim your daily bonus of 50 CX coins in the tasks section.",
                time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                read: false
            },
            {
                id: 3,
                title: "New Boost Available",
                message: "Max Energy boost is now available in the shop for 1500 CX.",
                time: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
                read: true
            }
        ],
        leaderboard: [
            { username: "CryptoKing", points: 12500, level: 25, avatar: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png" },
            { username: "MinerMax", points: 10800, level: 23, avatar: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png" },
            { username: "TapMaster", points: 9200, level: 21, avatar: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png" },
            { username: "User", points: 0, level: 1, avatar: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png" }
        ],
        completedTasks: []
    },

    // Initialize game state
    init() {
        this.load();
        return this.data;
    },

    // Save game state to localStorage
    save() {
        localStorage.setItem('cxMiner_save', JSON.stringify(this.data));
        this.data.lastSave = Date.now();
    },

    // Load game state from localStorage
    load() {
        const saved = localStorage.getItem('cxMiner_save');
        if (saved) {
            try {
                const savedState = JSON.parse(saved);
                this.data = {...this.data, ...savedState};
            } catch (e) {
                console.error('Error loading saved game:', e);
            }
        }
    },

    // Update points
    addPoints(amount) {
        this.data.points += amount;
        this.save();
    },

    // Update energy
    updateEnergy(amount) {
        this.data.energy = Math.max(0, Math.min(this.data.maxEnergy, this.data.energy + amount));
        this.save();
    },

    // Check for level up
    checkLevelUp() {
        const oldLevel = this.data.level;
        const newLevel = Math.floor(this.data.totalTaps / 1000) + 1;
        
        if (newLevel > oldLevel) {
            this.data.level = newLevel;
            this.data.starBalance += 5;
            this.save();
            return true;
        }
        return false;
    },

    // Check daily streak
    checkDailyStreak() {
        const today = new Date().toDateString();
        if (this.data.lastStreakClaim === today) {
            return false; // Already claimed today
        }
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();
        
        if (this.data.lastStreakClaim === yesterdayStr) {
            // Consecutive day
            this.data.streakCount++;
        } else if (!this.data.lastStreakClaim || this.data.lastStreakClaim !== today) {
            // Broken streak or first time
            this.data.streakCount = 1;
        }
        
        this.data.lastStreakClaim = today;
        this.save();
        
        return true;
    },

    // Claim daily streak reward
    claimDailyStreak() {
        if (!this.checkDailyStreak()) {
            return false;
        }
        
        // Calculate reward based on streak
        const baseReward = 50;
        const streakBonus = this.data.streakCount * 10;
        const totalReward = baseReward + streakBonus;
        
        this.data.points += totalReward;
        this.save();
        
        return totalReward;
    },

    // Purchase item
    purchaseItem(itemId, price, currency) {
        if (currency === 'cx' && this.data.points < price) {
            return false;
        }
        
        if (currency === 'stars' && this.data.starBalance < price) {
            return false;
        }
        
        // Deduct cost
        if (currency === 'cx') {
            this.data.points -= price;
        } else {
            this.data.starBalance -= price;
        }
        
        // Apply item effect
        this.applyItemEffect(itemId);
        
        this.save();
        return true;
    },

    // Apply item effect
    applyItemEffect(itemId) {
        switch(itemId) {
            case 'energyRegen':
                this.data.energyRegen += 0.2;
                break;
            case 'multitap':
                this.data.multitap += 1;
                break;
            case 'maxEnergy':
                this.data.maxEnergy += 20;
                break;
            case 'energyPack':
                this.data.energy = this.data.maxEnergy;
                break;
            case 'starterPack':
                this.data.points += 2000;
                this.data.energy = this.data.maxEnergy;
                break;
            case 'premiumPack':
                this.data.multitap += 2;
                this.data.points += 5000;
                break;
            case 'superEnergy':
                this.data.maxEnergy += 50;
                break;
        }
    },

    // Get time ago string
    getTimeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) {
            return 'Just now';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
        } else {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} day${days !== 1 ? 's' : ''} ago`;
        }
    }
};

// Add these properties to your GameState.data object
const GameState = {
    data: {
        // ... existing properties ...
        
        // Premium currency balances
        tonBalance: 0,
        starBalance: 0,
        
        // Premium items ownership
        premiumItems: {
            starBooster: false,
            tonMultiplier: false,
            energyShield: false,
            ultimatePack: false
        },
        
        // Enhanced social tasks with increased rewards
        socialTasks: {
            telegram: { completed: false, reward: 150 },
            twitter: { completed: false, reward: 150 },
            youtube: { completed: false, reward: 200 }
        },
        
        // Enhanced daily streak system
        streakData: {
            currentStreak: 0,
            longestStreak: 0,
            lastClaimDate: null,
            rewards: [50, 75, 100, 150, 200, 250, 300] // Weekly rewards
        },
        
        // New game stats
        totalEarned: 0,
        boostersUsed: 0,
        referralCount: 0
    },
    
    // ... existing methods ...
    
    // Add these new methods to your GameState object
    
    // Purchase premium item
    purchasePremiumItem(itemId, price, currency) {
        if (currency === 'ton' && this.data.tonBalance < price) {
            return false;
        }
        
        if (currency === 'stars' && this.data.starBalance < price) {
            return false;
        }
        
        // Deduct cost
        if (currency === 'ton') {
            this.data.tonBalance -= price;
        } else {
            this.data.starBalance -= price;
        }
        
        // Mark item as purchased
        this.data.premiumItems[itemId] = true;
        
        // Apply item effect
        this.applyPremiumItemEffect(itemId);
        
        this.save();
        return true;
    },
    
    // Apply premium item effect
    applyPremiumItemEffect(itemId) {
        switch(itemId) {
            case 'starBooster':
                // Activate star booster for 1 hour
                this.activateBooster('earnings', 1.2, 3600000);
                break;
            case 'tonMultiplier':
                // Activate 2x multiplier for 30 minutes
                this.activateBooster('multiplier', 2, 1800000);
                break;
            case 'energyShield':
                // Activate energy shield for 15 minutes
                this.activateBooster('energyShield', true, 900000);
                break;
            case 'ultimatePack':
                this.data.points += 10000;
                this.data.starBalance += 100;
                this.activateBooster('multiplier', 2, 3600000);
                break;
        }
    },
    
    // Activate a booster with duration
    activateBooster(type, value, duration) {
        const booster = {
            type: type,
            value: value,
            expires: Date.now() + duration
        };
        
        // Add to active boosters
        this.data.activeBoosters = this.data.activeBoosters || {};
        this.data.activeBoosters[type] = booster;
        
        // Update stats
        this.data.boostersUsed += 1;
        
        // Set timeout to deactivate booster
        setTimeout(() => {
            this.deactivateBooster(type);
        }, duration);
    },
    
    // Complete social task
    completeSocialTask(platform) {
        if (this.data.socialTasks[platform] && !this.data.socialTasks[platform].completed) {
            this.data.socialTasks[platform].completed = true;
            this.data.points += this.data.socialTasks[platform].reward;
            this.data.totalEarned += this.data.socialTasks[platform].reward;
            this.save();
            return true;
        }
        return false;
    },
    
    // Update daily streak
    updateDailyStreak() {
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        
        if (this.data.streakData.lastClaimDate === today) {
            // Already claimed today
            return false;
        }
        
        if (this.data.streakData.lastClaimDate === yesterday) {
            // Consecutive day
            this.data.streakData.currentStreak += 1;
        } else {
            // Broken streak
            this.data.streakData.currentStreak = 1;
        }
        
        // Update longest streak if needed
        if (this.data.streakData.currentStreak > this.data.streakData.longestStreak) {
            this.data.streakData.longestStreak = this.data.streakData.currentStreak;
        }
        
        this.data.streakData.lastClaimDate = today;
        
        // Calculate reward based on streak
        const dayIndex = Math.min(this.data.streakData.currentStreak - 1, 6);
        const reward = this.data.streakData.rewards[dayIndex];
        
        // Add reward
        this.data.points += reward;
        this.data.totalEarned += reward;
        
        this.save();
        return reward;
    }
};
