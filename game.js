class Game {
    constructor() {
        this.stats = {
            gamesPlayed: 0,
            wins: 0,
            currentGuesses: 0,
            maxAttempts: 5
        };
        
        this.secretNumber = null;
        this.maxNumber = 100; // default
        this.isGameActive = false;
        this.attempts = 0;
        
        this.initElements();
        this.bindEvents();
        this.updateStats();
        this.setupProbabilityListener();
    }
    
    initElements() {
        this.elements = {
            maxNumberInput: document.getElementById('max-number'),
            maxNumberDisplay: document.getElementById('max-number-display'),
            guessInput: document.getElementById('guess-input'),
            startButton: document.getElementById('start-game'),
            guessButton: document.getElementById('guess-button'),
            playAgainButton: document.getElementById('play-again'),
            resultCard: document.getElementById('result-card'),
            resultMessage: document.getElementById('result-message'),
            resultIcon: document.getElementById('result-icon'),
            gameSection: document.getElementById('game-section'),
            startSection: document.getElementById('start-section'),
            attemptsRemaining: document.getElementById('attempts-remaining'),
            probabilityDisplay: document.getElementById('probability'),
            stats: {
                gamesPlayed: document.getElementById('games-played'),
                wins: document.getElementById('wins'),
                winRate: document.getElementById('win-rate'),
                probability: document.getElementById('probability')
            }
        };
    }
    
    bindEvents() {
        this.elements.startButton.addEventListener('click', () => this.startGame());
        this.elements.guessButton.addEventListener('click', () => this.checkGuess());
        this.elements.playAgainButton.addEventListener('click', () => this.resetGame());
        this.elements.guessInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.checkGuess();
        });
    }
    
    setupProbabilityListener() {
        this.elements.maxNumberInput.addEventListener('input', () => {
            const max = parseInt(this.elements.maxNumberInput.value) || 100;
            const probability = Math.min(100, (1 / (max + 1)) * 100).toFixed(2);
            this.updateStat('probability', `${probability}%`);
        });
    }
    
    startGame() {
        const max = parseInt(this.elements.maxNumberInput.value) || 100;
        this.maxNumber = Math.max(1, max);
        
        // Set number of attempts based on max number
        this.stats.maxAttempts = this.maxNumber <= 50 ? 5 : 
                                this.maxNumber > 1000 ? 10 : 7;
        
        this.secretNumber = Math.floor(Math.random() * (this.maxNumber + 1));
        this.attempts = 0;
        this.isGameActive = true;
        
        // Update UI
        this.elements.startSection.classList.add('hidden');
        this.elements.gameSection.classList.remove('hidden');
        this.elements.resultCard.classList.add('hidden');
        this.elements.maxNumberDisplay.textContent = this.maxNumber;
        this.elements.attemptsRemaining.textContent = this.stats.maxAttempts;
        this.elements.guessInput.value = '';
        this.elements.guessInput.focus();
    }
    
    checkGuess() {
        if (!this.isGameActive) return;
        
        const guess = parseInt(this.elements.guessInput.value);
        const max = this.maxNumber;
        
        // Validate input
        if (isNaN(guess) || guess < 0 || guess > max) {
            this.showResult(
                `Please enter a valid number between 0 and ${max}`,
                'warning'
            );
            return;
        }
        
        this.attempts++;
        const remainingAttempts = this.stats.maxAttempts - this.attempts;
        this.elements.attemptsRemaining.textContent = remainingAttempts;
        
        if (guess === this.secretNumber) {
            this.handleWin();
        } else if (remainingAttempts <= 0) {
            this.handleLoss();
        } else {
            const hint = guess < this.secretNumber ? 'higher' : 'lower';
            this.showResult(
                `Try again! The number is ${hint} than ${guess} ${remainingAttempts} ${remainingAttempts === 1 ? 'attempt' : 'attempts'} left`,
                'warning',
                guess
            );
        }
        
        this.elements.guessInput.value = '';
    }
    
    handleWin() {
        this.stats.gamesPlayed++;
        this.stats.wins++;
        this.stats.currentGuesses = this.attempts;
        this.isGameActive = false;
        
        // Update stats
        this.updateStats();
        
        // Show win message with success styling
        this.showResult(
            `You won in ${this.attempts} ${this.attempts === 1 ? 'guess' : 'guesses'}! The number was ${this.secretNumber}.`,
            'success',
            this.secretNumber
        );
    }
    
    handleLoss() {
        this.stats.gamesPlayed++;
        this.isGameActive = false;
        
        // Update stats with animation
        this.updateStat('gamesPlayed', this.stats.gamesPlayed);
        this.updateWinRate();
        
        // Show loss message with error styling
        this.showResult(
            `Game over! The number was ${this.secretNumber}. Better luck next time!`,
            'error',
            this.secretNumber
        );
    }
    
    resetGame() {
        this.elements.gameSection.classList.add('hidden');
        this.elements.startSection.classList.remove('hidden');
        this.elements.resultCard.classList.add('hidden');
        this.elements.maxNumberInput.focus();
    }
    
    showResult(message, type = 'info', guess = null) {
        const resultCard = this.elements.resultCard;
        const resultIcon = this.elements.resultIcon;
        const resultMessage = this.elements.resultMessage;
        const attemptsLeftEl = document.getElementById('attempts-left');
        
        // Clear previous content and classes
        resultCard.className = 'result-card p-6 rounded-xl';
        resultIcon.innerHTML = '';
        
        // Set icon based on result type
        let iconSvg = '';
        
        switch(type) {
            case 'success':
                iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2ecc71" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="result-icon">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>`;
                break;
            case 'error':
                iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="result-icon">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>`;
                break;
            default: // warning
                iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="result-icon">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>`;
        }
        
        // Process message to extract attempts left if present
        let mainMessage = message;
        let attemptsText = '';
        
        // Check if message contains attempts information
        const attemptsMatch = message.match(/(.*?)(\d+ (?:attempt|guess).*)/i);
        if (attemptsMatch) {
            mainMessage = attemptsMatch[1].trim();
            attemptsText = attemptsMatch[2].trim();
        }
        
        // Highlight numbers in the main message with accent color
        const formattedMessage = mainMessage.replace(/(\d+)/g, 
            '<span class="font-medium" style="color: #21808D">$1</span>');
        
        // Set the content
        resultIcon.innerHTML = iconSvg;
        resultMessage.innerHTML = formattedMessage;
        attemptsLeftEl.textContent = attemptsText;
        
        // Hide attempts element if no attempts text
        attemptsLeftEl.style.display = attemptsText ? 'block' : 'none';
        
        // Show the card and add type class for styling
        resultCard.classList.remove('hidden');
        resultCard.classList.add(type);
        
        // Trigger reflow to restart animation
        void resultCard.offsetWidth;
        
        // Add visible class to trigger animation
        resultCard.classList.add('visible');
        
        // Focus the play again button for better accessibility
        if (type === 'success' || type === 'error') {
            this.elements.playAgainButton.focus();
        }
    }
    
    updateStats() {
        this.updateStat('gamesPlayed', this.stats.gamesPlayed);
        this.updateStat('wins', this.stats.wins);
        this.updateWinRate();
        
        // Initial probability calculation
        const probability = Math.min(100, (1 / (this.maxNumber + 1)) * 100).toFixed(2);
        this.updateStat('probability', `${probability}%`);
    }
    
    updateWinRate() {
        const winRate = this.stats.gamesPlayed > 0 
            ? Math.round((this.stats.wins / this.stats.gamesPlayed) * 100) 
            : 0;
        this.updateStat('winRate', `${winRate}%`);
    }
    
    updateStat(statId, value) {
        const element = this.elements.stats[statId];
        if (!element) return;
        
        // Add animation class
        element.classList.add('updated');
        
        // Update value
        element.textContent = value;
        
        // Remove animation class after animation completes
        setTimeout(() => {
            element.classList.remove('updated');
        }, 500);
    }
}

// Initialize the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
});
