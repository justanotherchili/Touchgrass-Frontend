import React, { createContext, useContext, useState } from 'react';



const ScoreContext = createContext();

export const ScoreProvider = ({ children }) => {
  const [score, setScore] = useState(0);

  const incrementScore = (points) => {
    setScore(score + points);
  };

  return (
    <ScoreContext.Provider value={{ score, incrementScore }}>
      {children}
    </ScoreContext.Provider>
  );
};


export const useScore = () => useContext(ScoreContext);
