import { useEffect, useState, useRef } from "react";
import {
  getProblemsForDomain,
  getPossibleSubcategories,
  tickProblemAsAnswered,
} from "../dbUtils";
import Button from "./Button";

interface LanguageQuizProps {
  domain: Domain;
}

const LanguageQuiz = ({ domain }: LanguageQuizProps) => {
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [userTranslation, setUserTranslation] = useState<string>("");
  const [possibleSubcategories, setPossibleSubcategories] = useState<string[]>(
    []
  );
  const [problems, setProblems] = useState<Problem[]>([]);

  const nbOfHints = useRef<number>(0);

  useEffect(() => {
    const fetchProblems = async () => {
      const problems = await getProblemsForDomain(domain);
      const subcategories = await getPossibleSubcategories(domain);
      setProblems(problems);
      setPossibleSubcategories(subcategories);
      setSelectedSubcategory(subcategories[0]);
    };
    fetchProblems();
  }, [domain]);

  useEffect(() => {
    const possibleProblems = problems
      .filter((problem) => problem.answered === 0)
      .filter((problem) => problem.subcategory === selectedSubcategory);
    const newCurrentProblem = possibleProblems[0];
    setCurrentProblem(newCurrentProblem);
  }, [selectedSubcategory, problems]);

  const submitAnswer = () => {
    if (currentProblem) {
      if (
        userTranslation.toLowerCase() === currentProblem.answer.toLowerCase()
      ) {
        tickProblemAsAnswered(currentProblem);
        setUserTranslation("");

        // Update problems state
        const newProblems = problems.map((problem) => {
          if (problem.id === currentProblem.id) {
            return { ...problem, answered: 1 };
          }
          return problem;
        });
        setProblems(newProblems);
        nbOfHints.current = 0;
      } else {
        alert("Wrong answer, try again!");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {currentProblem ? (
        <>
          <div className="flex items-center self-end space-x-2">
            <p className="">{selectedSubcategory.toLowerCase()}</p>
            <Button
              onClick={() => {
                setSelectedSubcategory(
                  possibleSubcategories[
                    Math.floor(Math.random() * possibleSubcategories.length)
                  ]
                );
                nbOfHints.current = 0;
              }}
              text="random category"
              secondary
            />
          </div>

          <p className="text-lg mb-2 mt-32">
            {currentProblem.description.toLocaleLowerCase()}
          </p>
          <input
            type="text"
            value={userTranslation.toLocaleLowerCase()}
            onChange={(e) => setUserTranslation(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg w-2/3 text-black"
            onKeyDown={
              // Listen for Enter key
              (e) => e.key === "Enter" && submitAnswer()
            }
          />
          <div className="flex space-x-2 mt-2">
            <Button onClick={submitAnswer} text="Submit" />
            <Button
              onClick={() => {
                nbOfHints.current += 1;
                // Set user input as the n first words of the answer
                const words = currentProblem.answer.split(" ");
                if (nbOfHints.current > words.length) {
                  nbOfHints.current = words.length;
                }
                const hint = words.slice(0, nbOfHints.current).join(" ");
                setUserTranslation(hint);
              }}
              text="Hint"
              secondary
            />
          </div>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default LanguageQuiz;
