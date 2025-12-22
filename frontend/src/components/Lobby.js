import React, { useState } from 'react';

const Lobby = ({ onJoin }) => {
    const [roomId, setRoomId] = useState('');
    const [rounds, setRounds] = useState(3);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (roomId.trim()) {
            onJoin(roomId, parseInt(rounds));
        }
    };

    return (
        <div className="lobby-container">
            <div className="lobby-card">
                <h2>Multiplayer Setup</h2>
                <form onSubmit={handleSubmit}>
                    <input 
                        type="text"
                        placeholder="Enter Room Name (e.g. Arena1)" 
                        value={roomId} 
                        onChange={(e) => setRoomId(e.target.value)} 
                        required 
                    />
                    <div className="round-picker">
                        <label>Rounds (1-10):</label>
                        <input 
                            type="number" 
                            min="1" max="10" 
                            value={rounds} 
                            onChange={(e) => setRounds(e.target.value)} 
                        />
                    </div>
                    <button type="submit" className="primary-btn">Enter Arena</button>
                </form>
            </div>
        </div>
    );
};

export default Lobby;