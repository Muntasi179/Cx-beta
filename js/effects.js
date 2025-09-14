// Visual and audio effects
const Effects = {
    // Create tap effect
    createTapEffect(x, y) {
        if (GameState.data.reduceAnimations) return;
        
        const tapEffect = document.createElement('div');
        tapEffect.className = 'tap-effect';
        tapEffect.style.left = `${x}px`;
        tapEffect.style.top = `${y}px`;
        document.getElementById('tapEffects').appendChild(tapEffect);
        
        setTimeout(() => {
            tapEffect.remove();
        }, 500);
    },
    
    // Create particle effects
    createParticles(x, y, count = 8) {
        if (GameState.data.reduceAnimations) return;
        
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Calculate particle trajectory
            const angle = (i / count) * Math.PI * 2;
            const distance = 50 + Math.random() * 50;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;
            
            particle.style.setProperty('--tx', `${tx}px`);
            particle.style.setProperty('--ty', `${ty}px`);
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            
            document.getElementById('particleEffects').appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
            }, 1000);
        }
    },
    
    // Create floating text effect
    createFloatingText(x, y, text, type = "default") {
        // Check if any modal is open
        const modals = document.querySelectorAll('.modal');
        const isModalOpen = Array.from(modals).some(modal => modal.classList.contains('show'));
        if (isModalOpen) return;
        
        if (GameState.data.reduceAnimations) return;
        
        const floatingText = document.createElement('div');
        floatingText.className = `floating-text floating-text-${type}`;
        floatingText.textContent = text;
        floatingText.style.left = `${x}px`;
        floatingText.style.top = `${y}px`;
        
        document.body.appendChild(floatingText);
        
        // Animate
        setTimeout(() => {
            floatingText.style.transform = 'translateY(-30px)';
            floatingText.style.opacity = '0';
        }, 10);
        
        setTimeout(() => {
            floatingText.remove();
        }, 1000);
    },
    
    // Show combo effect
    showCombo(count, x, y) {
        if (GameState.data.reduceAnimations) return;
        
        const comboDisplay = document.getElementById('comboDisplay');
        const comboCount = document.getElementById('comboCount');
        
        comboCount.textContent = count;
        comboDisplay.style.display = 'block';
        comboDisplay.style.left = `${x}px`;
        comboDisplay.style.top = `${y}px`;
        
        // Animate
        setTimeout(() => {
            comboDisplay.style.transform = 'translate(-50%, -50%) scale(1.2)';
        }, 10);
        
        // Hide after 1 second
        setTimeout(() => {
            comboDisplay.style.transform = 'translate(-50%, -50%) scale(1)';
            setTimeout(() => {
                comboDisplay.style.display = 'none';
            }, 500);
        }, 1000);
    },
    
    // Show critical hit effect
    showCriticalHit(x, y) {
        if (GameState.data.reduceAnimations) return;
        
        const criticalHit = document.getElementById('criticalHit');
        
        criticalHit.style.display = 'block';
        criticalHit.style.left = `${x}px`;
        criticalHit.style.top = `${y}px`;
        
        // Create explosion particles
        this.createParticles(x, y, 20);
        
        // Play special sound
        this.playCriticalSound();
        
        // Animate
        setTimeout(() => {
            criticalHit.style.transform = 'translate(-50%, -50%) scale(1.5)';
            criticalHit.style.opacity = '1';
        }, 10);
        
        // Hide after 1.5 seconds
        setTimeout(() => {
            criticalHit.style.transform = 'translate(-50%, -50%) scale(1)';
            criticalHit.style.opacity = '0';
            setTimeout(() => {
                criticalHit.style.display = 'none';
            }, 500);
        }, 1500);
    },
    
    // Play sound effect
    playSound() {
        if (!GameState.data.soundEnabled) return;
        
        try {
            // Web Audio API implementation
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            gainNode.gain.value = 0.1;
            
            oscillator.start();
            gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.1);
            
            setTimeout(() => {
                oscillator.stop();
            }, 100);
        } catch (e) {
            console.log('Sound not supported');
        }
    },
    
    // Play critical sound effect
    playCriticalSound() {
        if (!GameState.data.soundEnabled) return;
        
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 1200;
            gainNode.gain.value = 0.2;
            
            oscillator.start();
            gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.3);
            
            setTimeout(() => {
                oscillator.stop();
            }, 300);
        } catch (e) {
            console.log('Sound not supported');
        }
    },
    
    // Vibrate device
    vibrate() {
        if (!GameState.data.vibrationEnabled) return;
        
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    }
};
