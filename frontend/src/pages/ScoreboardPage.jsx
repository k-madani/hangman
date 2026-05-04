import React from 'react';

const ScoreboardPage = ({ gameMode, finalScores, userStats, onPlayAgain, onBackToMenu }) => {
    const isMultiplayer = gameMode === 'multi';

    const sp = userStats?.single || null;
    const mp = userStats?.multi  || null;

    const spWinRate = sp && sp.gamesPlayed > 0 ? Math.round((sp.wins / sp.gamesPlayed) * 100) : null;
    const mpWinRate = mp && mp.gamesPlayed > 0 ? Math.round((mp.wins / mp.gamesPlayed) * 100) : null;

    if (isMultiplayer) {
        const p1Score = finalScores.p1;
        const p2Score = finalScores.p2;
        const isTie   = p1Score === p2Score;
        const winner  = p1Score > p2Score ? 'Player 1' : 'Player 2';

        return (
            <div className="scoreboard-container">
                <div className="scoreboard-header">
                    <h1>GAME OVER</h1>
                    <h2>{isTie ? "🤝 It's a Tie!" : `🏆 ${winner} Wins!`}</h2>
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

                {/* Stats summary if logged in */}
                {mp && (
                    <div className="sb-stats-bar">
                        <span className="sb-stats-label">Your multiplayer record:</span>
                        <span className="sb-stat"><span className="sb-val sb-green">{mp.wins}W</span></span>
                        <span className="sb-stat"><span className="sb-val sb-red">{mp.losses}L</span></span>
                        <span className="sb-stat"><span className="sb-val sb-yellow">{mp.ties}T</span></span>
                        {mpWinRate !== null && (
                            <span className="sb-stat"><span className="sb-val sb-purple">{mpWinRate}% win rate</span></span>
                        )}
                    </div>
                )}

                <div className="scoreboard-actions">
                    <button className="primary-btn" onClick={onPlayAgain}>Play Again</button>
                    <button className="secondary-btn" onClick={onBackToMenu}>Back to Menu</button>
                </div>
            </div>
        );
    }

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

            {/* Stats summary if logged in */}
            {sp && (
                <div className="sb-stats-bar">
                    <span className="sb-stats-label">Your single player record:</span>
                    <span className="sb-stat"><span className="sb-val sb-green">{sp.wins}W</span></span>
                    <span className="sb-stat"><span className="sb-val sb-red">{sp.losses}L</span></span>
                    {spWinRate !== null && (
                        <span className="sb-stat"><span className="sb-val sb-purple">{spWinRate}% win rate</span></span>
                    )}
                    <span className="sb-stat sb-hint">Click your username to see full history</span>
                </div>
            )}

            <div className="scoreboard-actions">
                <button className="primary-btn" onClick={onPlayAgain}>Play Again</button>
                <button className="secondary-btn" onClick={onBackToMenu}>Back to Menu</button>
            </div>
        </div>
    );
};

export default ScoreboardPage;