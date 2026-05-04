import React from 'react';

const ProfileModal = ({ user, onClose }) => {
    if (!user) return null;

    const sp = user.stats?.single || { gamesPlayed: 0, wins: 0, losses: 0, recentGames: [] };
    const mp = user.stats?.multi  || { gamesPlayed: 0, wins: 0, losses: 0, ties: 0, recentGames: [] };

    const spWinRate = sp.gamesPlayed > 0 ? Math.round((sp.wins / sp.gamesPlayed) * 100) : 0;
    const mpWinRate = mp.gamesPlayed > 0 ? Math.round((mp.wins / mp.gamesPlayed) * 100) : 0;

    const memberSince = user.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : 'Recently';

    const timeAgo = (date) => {
        const diff = Date.now() - new Date(date).getTime();
        const mins  = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days  = Math.floor(diff / 86400000);
        if (mins  < 60)  return `${mins}m ago`;
        if (hours < 24)  return `${hours}h ago`;
        return `${days}d ago`;
    };

    const resultBadge = (result) => {
        if (result === 'win')  return <span className="pm-badge pm-win">W</span>;
        if (result === 'loss') return <span className="pm-badge pm-loss">L</span>;
        return <span className="pm-badge pm-tie">=</span>;
    };

    return (
        <div className="pm-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="pm-panel">

                {/* Header */}
                <div className="pm-header">
                    <div className="pm-identity">
                        <div className="pm-avatar">
                            {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="pm-eyebrow">WORD ARENA</p>
                            <h2 className="pm-username">{user.username}</h2>
                            <p className="pm-since">Member since {memberSince}</p>
                        </div>
                    </div>
                    <button className="pm-close" onClick={onClose}>✕</button>
                </div>

                {/* Stats Grid */}
                <div className="pm-stats-grid">
                    {/* Single Player */}
                    <div className="pm-stat-block">
                        <p className="pm-block-title">🎮 Single Player</p>
                        <div className="pm-counters">
                            <div className="pm-counter">
                                <span className="pm-counter-val">{sp.gamesPlayed}</span>
                                <span className="pm-counter-label">Played</span>
                            </div>
                            <div className="pm-counter">
                                <span className="pm-counter-val pm-green">{sp.wins}</span>
                                <span className="pm-counter-label">Wins</span>
                            </div>
                            <div className="pm-counter">
                                <span className="pm-counter-val pm-red">{sp.losses}</span>
                                <span className="pm-counter-label">Losses</span>
                            </div>
                            <div className="pm-counter">
                                <span className="pm-counter-val pm-purple">{spWinRate}%</span>
                                <span className="pm-counter-label">Win Rate</span>
                            </div>
                        </div>
                    </div>

                    {/* Multiplayer */}
                    <div className="pm-stat-block">
                        <p className="pm-block-title">⚔️ Multiplayer</p>
                        <div className="pm-counters">
                            <div className="pm-counter">
                                <span className="pm-counter-val">{mp.gamesPlayed}</span>
                                <span className="pm-counter-label">Played</span>
                            </div>
                            <div className="pm-counter">
                                <span className="pm-counter-val pm-green">{mp.wins}</span>
                                <span className="pm-counter-label">Wins</span>
                            </div>
                            <div className="pm-counter">
                                <span className="pm-counter-val pm-red">{mp.losses}</span>
                                <span className="pm-counter-label">Losses</span>
                            </div>
                            <div className="pm-counter">
                                <span className="pm-counter-val pm-yellow">{mp.ties}</span>
                                <span className="pm-counter-label">Ties</span>
                            </div>
                            <div className="pm-counter">
                                <span className="pm-counter-val pm-purple">{mpWinRate}%</span>
                                <span className="pm-counter-label">Win Rate</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Single Player Games */}
                {sp.recentGames.length > 0 && (
                    <div className="pm-recent">
                        <p className="pm-recent-title">Recent Single Player</p>
                        <div className="pm-game-list">
                            {sp.recentGames.map((g, i) => (
                                <div key={i} className="pm-game-row">
                                    <span className="pm-game-category">{g.category}</span>
                                    <span className="pm-game-score">{g.score}/{g.rounds}</span>
                                    {g.score > g.rounds / 2
                                        ? <span className="pm-badge pm-win">W</span>
                                        : <span className="pm-badge pm-loss">L</span>
                                    }
                                    <span className="pm-game-time">{timeAgo(g.playedAt)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recent Multiplayer Games */}
                {mp.recentGames.length > 0 && (
                    <div className="pm-recent">
                        <p className="pm-recent-title">Recent Multiplayer</p>
                        <div className="pm-game-list">
                            {mp.recentGames.map((g, i) => (
                                <div key={i} className="pm-game-row">
                                    <span className="pm-game-category">vs {g.opponentUsername}</span>
                                    <span className="pm-game-score">{g.myScore}–{g.opponentScore}</span>
                                    {resultBadge(g.result)}
                                    <span className="pm-game-time">{timeAgo(g.playedAt)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {sp.recentGames.length === 0 && mp.recentGames.length === 0 && (
                    <div className="pm-empty">
                        <p>No games played yet.</p>
                        <p>Start a game to see your history here!</p>
                    </div>
                )}
            </div>

            <style>{`
                .pm-overlay {
                    position: fixed; inset: 0;
                    background: rgba(0,0,0,0.85);
                    backdrop-filter: blur(8px);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 1000; padding: 20px;
                }
                .pm-panel {
                    background: #0f0f26;
                    border: 1px solid rgba(139,92,246,0.25);
                    border-radius: 14px;
                    width: 100%; max-width: 580px;
                    max-height: 88vh; overflow-y: auto;
                    box-shadow: 0 0 60px rgba(124,58,237,0.15), 0 32px 80px rgba(0,0,0,0.8);
                    scrollbar-width: thin; scrollbar-color: rgba(139,92,246,0.2) transparent;
                }
                /* Header */
                .pm-header {
                    display: flex; align-items: flex-start; justify-content: space-between;
                    padding: 28px 32px 24px;
                    border-bottom: 1px solid rgba(139,92,246,0.15);
                }
                .pm-identity { display: flex; align-items: center; gap: 16px; }
                .pm-avatar {
                    width: 52px; height: 52px;
                    background: linear-gradient(135deg, #7c3aed, #a78bfa);
                    border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 22px; font-weight: 900; color: #fff;
                    flex-shrink: 0;
                }
                .pm-eyebrow {
                    font-size: 9px; letter-spacing: 0.25em;
                    color: #a78bfa; font-family: 'Courier New', monospace; margin: 0 0 4px;
                }
                .pm-username {
                    font-size: 20px; font-weight: 800; color: #fff;
                    margin: 0 0 4px; letter-spacing: -0.02em;
                }
                .pm-since {
                    font-size: 11px; color: rgba(255,255,255,0.3);
                    font-family: 'Courier New', monospace; margin: 0;
                }
                .pm-close {
                    background: none; border: 1px solid rgba(139,92,246,0.2);
                    border-radius: 6px; color: rgba(255,255,255,0.4);
                    width: 30px; height: 30px; cursor: pointer; font-size: 11px;
                    display: flex; align-items: center; justify-content: center;
                    flex-shrink: 0; transition: all 0.15s;
                }
                .pm-close:hover { border-color: rgba(139,92,246,0.6); color: #a78bfa; }
                /* Stats grid */
                .pm-stats-grid {
                    display: grid; grid-template-columns: 1fr 1fr;
                    border-bottom: 1px solid rgba(139,92,246,0.1);
                }
                .pm-stat-block {
                    padding: 20px 24px;
                }
                .pm-stat-block:first-child {
                    border-right: 1px solid rgba(139,92,246,0.1);
                }
                .pm-block-title {
                    font-size: 11px; font-weight: 700;
                    color: rgba(255,255,255,0.5);
                    letter-spacing: 0.06em; margin: 0 0 14px;
                }
                .pm-counters {
                    display: flex; flex-wrap: wrap; gap: 12px;
                }
                .pm-counter {
                    display: flex; flex-direction: column; align-items: center;
                    min-width: 42px;
                }
                .pm-counter-val {
                    font-size: 22px; font-weight: 900; color: #fff;
                    line-height: 1; letter-spacing: -0.02em;
                }
                .pm-counter-val.pm-green  { color: #4ade80; }
                .pm-counter-val.pm-red    { color: #f87171; }
                .pm-counter-val.pm-yellow { color: #facc15; }
                .pm-counter-val.pm-purple { color: #a78bfa; }
                .pm-counter-label {
                    font-size: 9px; color: rgba(255,255,255,0.3);
                    text-transform: uppercase; letter-spacing: 0.1em;
                    margin-top: 4px; font-family: 'Courier New', monospace;
                }
                /* Recent games */
                .pm-recent { padding: 20px 32px; border-bottom: 1px solid rgba(139,92,246,0.1); }
                .pm-recent-title {
                    font-size: 10px; letter-spacing: 0.2em;
                    color: rgba(167,139,250,0.5); text-transform: uppercase;
                    font-family: 'Courier New', monospace; margin: 0 0 12px;
                }
                .pm-game-list { display: flex; flex-direction: column; gap: 8px; }
                .pm-game-row {
                    display: flex; align-items: center; gap: 12px;
                    background: rgba(139,92,246,0.05);
                    border: 1px solid rgba(139,92,246,0.1);
                    border-radius: 6px; padding: 8px 12px;
                }
                .pm-game-category {
                    font-size: 13px; color: #fff; font-weight: 600; flex: 1;
                }
                .pm-game-score {
                    font-size: 12px; color: rgba(255,255,255,0.5);
                    font-family: 'Courier New', monospace;
                }
                .pm-badge {
                    font-size: 10px; font-weight: 900;
                    padding: 2px 7px; border-radius: 4px;
                }
                .pm-win  { background: rgba(74,222,128,0.15); color: #4ade80; }
                .pm-loss { background: rgba(248,113,113,0.15); color: #f87171; }
                .pm-tie  { background: rgba(250,204,21,0.15);  color: #facc15; }
                .pm-game-time {
                    font-size: 11px; color: rgba(255,255,255,0.25);
                    font-family: 'Courier New', monospace; white-space: nowrap;
                }
                /* Empty state */
                .pm-empty {
                    padding: 32px; text-align: center;
                    color: rgba(255,255,255,0.25); font-size: 13px; line-height: 1.8;
                }
                @media (max-width: 520px) {
                    .pm-stats-grid { grid-template-columns: 1fr; }
                    .pm-stat-block:first-child { border-right: none; border-bottom: 1px solid rgba(139,92,246,0.1); }
                    .pm-header, .pm-recent { padding-left: 20px; padding-right: 20px; }
                    .pm-stat-block { padding: 16px 20px; }
                }
            `}</style>
        </div>
    );
};

export default ProfileModal;