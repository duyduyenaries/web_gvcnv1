import React, { useEffect, useState, useRef } from 'react';
import { getProvider } from '../../core/provider';
import { Question } from '../../core/types';
import { Play, RotateCcw, Trophy, Clock, Zap } from 'lucide-react';

const GAME_DURATION = 15; // Seconds per question
const QUESTIONS_PER_ROUND = 10;

const SpeedGame: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'end'>('start');
  
  // Gameplay State
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  
  // Game Loop Data
  const [gameQuestions, setGameQuestions] = useState<Question[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // Load all questions initially
    getProvider().getQuestions().then(setQuestions);
  }, []);

  useEffect(() => {
      if (gameState === 'playing' && timeLeft > 0) {
          timerRef.current = window.setTimeout(() => {
              setTimeLeft(prev => prev - 1);
          }, 1000);
      } else if (timeLeft === 0 && gameState === 'playing') {
          handleNextQuestion(false); // Time out counts as wrong/skip
      }

      return () => {
          if (timerRef.current) clearTimeout(timerRef.current);
      };
  }, [timeLeft, gameState]);

  const startGame = () => {
      if (questions.length === 0) return alert('Chưa có câu hỏi nào trong ngân hàng!');
      
      // Shuffle and pick questions
      const shuffled = [...questions].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, QUESTIONS_PER_ROUND);
      
      setGameQuestions(selected);
      setCurrentQIndex(0);
      setScore(0);
      setStreak(0);
      setTimeLeft(GAME_DURATION);
      setGameState('playing');
      setSelectedAnswer(null);
  };

  const handleAnswer = (index: number) => {
      if (selectedAnswer !== null) return; // Prevent double click
      setSelectedAnswer(index);
      
      const currentQ = gameQuestions[currentQIndex];
      const isCorrect = index === currentQ.correctIndex;
      
      // Delay slightly to show result color then move on
      setTimeout(() => {
          handleNextQuestion(isCorrect);
      }, 800);
  };

  const handleNextQuestion = (lastCorrect: boolean) => {
      // Calc Score
      if (lastCorrect) {
          const timeBonus = Math.floor(timeLeft / 2); // Bonus for speed
          const streakBonus = Math.floor(streak / 3) * 5; // Bonus for streaks
          setScore(prev => prev + 10 + timeBonus + streakBonus);
          setStreak(prev => prev + 1);
      } else {
          setStreak(0);
      }

      if (currentQIndex < gameQuestions.length - 1) {
          setCurrentQIndex(prev => prev + 1);
          setTimeLeft(GAME_DURATION);
          setSelectedAnswer(null);
      } else {
          setGameState('end');
      }
  };

  if (gameState === 'start') {
      return (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white p-8 shadow-xl">
              <div className="bg-white/20 p-6 rounded-full mb-6 animate-bounce">
                  <Zap size={64} className="text-yellow-300" fill="currentColor"/>
              </div>
              <h1 className="text-4xl font-black mb-4 uppercase tracking-wider text-center">Game Tốc Độ</h1>
              <p className="text-indigo-100 mb-8 text-center max-w-md">Trả lời đúng và nhanh nhất có thể để đạt điểm cao. Bạn có {GAME_DURATION} giây cho mỗi câu hỏi!</p>
              
              <button 
                  onClick={startGame}
                  disabled={questions.length === 0}
                  className="bg-yellow-400 text-indigo-900 px-8 py-4 rounded-full font-black text-xl hover:scale-105 transition shadow-lg hover:shadow-yellow-400/50 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  <Play size={24} fill="currentColor"/> BẮT ĐẦU NGAY
              </button>
              {questions.length === 0 && <p className="mt-4 text-red-300 text-sm">Chưa có dữ liệu câu hỏi.</p>}
          </div>
      );
  }

  if (gameState === 'end') {
      return (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] bg-white rounded-xl text-slate-800 p-8 border border-slate-200 shadow-sm">
              <Trophy size={80} className="text-yellow-500 mb-4" />
              <h2 className="text-3xl font-bold mb-2">Hoàn thành!</h2>
              <div className="text-slate-500 mb-8">Bạn đã trả lời hết câu hỏi.</div>
              
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 min-w-[250px] text-center mb-8">
                  <div className="text-sm text-slate-400 uppercase font-bold tracking-wide mb-1">Tổng điểm</div>
                  <div className="text-5xl font-black text-indigo-600">{score}</div>
              </div>

              <button 
                  onClick={startGame}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition flex items-center gap-2"
              >
                  <RotateCcw size={20} /> Chơi lại
              </button>
          </div>
      );
  }

  // Playing State
  const currentQ = gameQuestions[currentQIndex];
  const progressPercent = (timeLeft / GAME_DURATION) * 100;
  const progressColor = timeLeft < 5 ? 'bg-red-500' : timeLeft < 10 ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div className="max-w-2xl mx-auto h-full flex flex-col gap-6">
        {/* Header Stats */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
             <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-700 font-bold">
                     {currentQIndex + 1}/{gameQuestions.length}
                 </div>
                 <div className="text-sm">
                     <div className="text-slate-400 font-bold">Câu hỏi</div>
                     <div className="text-slate-800 font-bold">Liên tiếp: {streak} 🔥</div>
                 </div>
             </div>
             <div className="text-right">
                 <div className="text-slate-400 text-xs font-bold uppercase">Điểm số</div>
                 <div className="text-2xl font-black text-indigo-600">{score}</div>
             </div>
        </div>

        {/* Timer Bar */}
        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
            <div 
                className={`h-full transition-all duration-1000 ease-linear ${progressColor}`} 
                style={{ width: `${progressPercent}%` }}
            />
        </div>

        {/* Question Card */}
        <div className="bg-white p-6 md:p-10 rounded-2xl shadow-lg border border-slate-100 flex-1 flex flex-col justify-center text-center relative overflow-hidden">
             <div className="absolute top-4 right-4 text-slate-200 font-black text-6xl opacity-20 pointer-events-none">
                 <Clock /> {timeLeft}
             </div>
             <h3 className="text-xl md:text-2xl font-bold text-slate-800 leading-relaxed mb-8">
                 {currentQ.content}
             </h3>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {currentQ.options.map((opt, idx) => {
                     let btnClass = "bg-slate-50 border-2 border-slate-100 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50";
                     if (selectedAnswer !== null) {
                         if (idx === currentQ.correctIndex) btnClass = "bg-green-500 border-green-600 text-white"; // Correct answer
                         else if (idx === selectedAnswer) btnClass = "bg-red-500 border-red-600 text-white"; // Wrong selection
                         else btnClass = "opacity-50 bg-slate-100"; // Others
                     }

                     return (
                         <button
                             key={idx}
                             disabled={selectedAnswer !== null}
                             onClick={() => handleAnswer(idx)}
                             className={`p-4 rounded-xl font-bold text-lg transition-all transform active:scale-95 shadow-sm ${btnClass}`}
                         >
                             {opt}
                         </button>
                     );
                 })}
             </div>
        </div>
    </div>
  );
};

export default SpeedGame;