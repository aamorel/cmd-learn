import { useEffect, useState } from "react";

interface Problem {
  problem: string;
  options: string;
  correct: string;
}

interface MathQuizProps {}

const MathQuiz = ({}: MathQuizProps) => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState<number | null>(
    null
  );
  const [showFeedback, setShowFeedback] = useState<string | null>(null);

  useEffect(() => {
    const loadProblems = async () => {
      const response = await fetch("./math.json");
      const data = await response.json();
      setProblems(data);
      // Select random problem
      setCurrentProblemIndex(Math.floor(Math.random() * data.length));
    };

    loadProblems();
  }, []);

  const handleOptionClick = (optionIndex: number) => {
    if (currentProblemIndex !== null) {
      const currentProblem = problems[currentProblemIndex];
      const options = currentProblem.options.split(",");
      const correctOptionLetter = currentProblem.correct.trim().toLowerCase();
      const correctIndex =
        correctOptionLetter.charCodeAt(0) - "a".charCodeAt(0); // Convert letter to index

      if (optionIndex === correctIndex) {
        // Move to the next question if the answer is correct
        const nextIndex = currentProblemIndex + 1;
        if (nextIndex < problems.length) {
          setCurrentProblemIndex(nextIndex);
          setShowFeedback(null); // Reset feedback for the next question
        } else {
          // Handle end of questions list if needed
          alert("You've completed all questions!");
        }
      } else {
        // Show feedback if the answer is incorrect
        setShowFeedback(options[correctIndex]); // Show the correct option as feedback
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {currentProblemIndex !== null && problems.length > 0 ? (
        <>
          <h1 className="text-xl font-bold mb-4">Question</h1>
          <p className="text-lg mb-2">
            {problems[currentProblemIndex].problem}
          </p>
          <div className="mb-4">
            Options:
            <ul className="list-disc pl-5">
              {problems[currentProblemIndex].options
                .split(",")
                .map((option, index) => (
                  <li key={index} className="mb-2">
                    <button
                      className={`p-2 rounded-lg ${
                        showFeedback === option.trim()
                          ? "bg-red-500 text-white"
                          : "bg-gray-200 hover:bg-gray-300"
                      }`}
                      onClick={() => handleOptionClick(index)}
                    >
                      {option.trim()}
                    </button>
                  </li>
                ))}
            </ul>
            {showFeedback && (
              <div className="text-red-500 mt-2">
                Incorrect, the correct answer was "{showFeedback}"
              </div>
            )}
          </div>
        </>
      ) : (
        <p>Loading question...</p>
      )}
    </div>
  );
};

export default MathQuiz;
