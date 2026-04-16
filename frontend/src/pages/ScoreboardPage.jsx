import React from 'react';

const ScoreboardPage = ({ gameMode, finalScores, onPlayAgain, onBackToMenu }) => {
    const isMultiplayer = gameMode === 'multi';

    if (isMultiplayer) {
        const p1Score = finalScores.p1;
        const p2Score = finalScores.p2;
        const winner = p1Score > p2Score ? 'Player 1' : p2Score > p1Score ? 'Player 2' : 'Tie';
        const isTie = p1Score === p2Score;

        return (
            <div className="scoreboard-container">
                <div className="scoreboard-header">
                    <h1>GAME OVER</h1>
                    <h2>{isTie ? '🤝 It\'s a Tie!' : winner === 'Player 1' ? '🏆 Player 1 Wins!' : '🏆 Player 2 Wins!'}</h2>
                </div>

                <div className="final-scores">
                    <div className="player-score">
                        <h3>Player 1</h3>
                        <div className="score-display">{p1Score}</div>
                    </div>
                    <div className="vs-divider">VS</div>
                    <div className="player-score">
                        <h3>Player 2</h3>
                        <div className="score-display">{p2Score}</div>
                    </div>
                </div>

                <div className="scoreboard-actions">
                    <button className="primary-btn" onClick={onPlayAgain}>Play Again</button>
                    <button className="secondary-btn" onClick={onBackToMenu}>Back to Menu</button>
                </div>
            </div>
        );
    } else {
        // Single Player
        const score = finalScores.p1;
        return (
            <div className="scoreboard-container">
                <div className="scoreboard-header">
                    <h1>GAME OVER</h1>
                    <h2>🎮 Game Complete!</h2>
                </div>

                <div className="final-score-single">
                    <h3>Your Score</h3>
                    <div className="score-display">{score}</div>
                </div>

                <div className="scoreboard-actions">
                    <button className="primary-btn" onClick={onPlayAgain}>Play Again</button>
                    <button className="secondary-btn" onClick={onBackToMenu}>Back to Menu</button>
                </div>
            </div>
        );
    }
};

export default ScoreboardPage;
