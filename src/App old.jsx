import { useState, useEffect } from "react";
import { nanoid } from "nanoid";
import { decode } from "he";
import Trivia from "./components/Trivia.jsx";

export default function App() {
  const [quiz, setQuiz] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [results, setResults] = useState([]);

  useEffect(() => {
    console.log("Answered");
  }, [answered]);

  // console.log(`Results: ${JSON.stringify(results)}`);
  //quiz && console.log(quiz.map((trivia) => trivia.correct_answer));
  // console.log(quiz);

  const quizElements = quiz
    ? quiz.map((trivia) => (
        <Trivia key={trivia.id} trivia={trivia} handleClick={handleClick} />
      ))
    : [];

  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
    return arr;
  }

  async function startQuiz() {
    const res = await fetch("https://opentdb.com/api.php?amount=5&category=22");
    const data = await res.json();

    setQuiz(
      data.results.map((el) => ({
        ...el,
        question: decode(el.question),
        id: nanoid(),
        answers: shuffleArray([...el.incorrect_answers, el.correct_answer]).map(
          (answer) => ({
            value: answer,
            id: nanoid(),
            isHeld: false,
          })
        ),
      }))
    );
  }

  function handleClick(triviaId, answerId) {
    setQuiz((prevQuiz) => {
      const newQuiz = prevQuiz.map((trivia) => {
        if (trivia.id === triviaId) {
          return {
            ...trivia,
            answers: trivia.answers.map((answer) => {
              if (answer.id === answerId) {
                return {
                  ...answer,
                  isHeld: true,
                };
              }
              return {
                ...answer,
                isHeld: false,
              };
            }),
          };
        }

        return trivia;
      });
      return newQuiz;
    });
  }

  function checkAnswers() {
    // Disable all spans

    // Verify if selected answer is the correct answer
    quiz.forEach((trivia) => {
      const currAnswer = trivia.answers.filter((answer) => answer.isHeld)[0]
        .value;

      if (currAnswer === trivia.correct_answer) {
        setResults((prevResults) => [
          ...prevResults,
          { result: true, id: trivia.id },
        ]);
      } else {
        setResults((prevResults) => [
          ...prevResults,
          { result: false, id: trivia.id },
        ]);
      }
    });

    // If it's the correct answer, change bg-color to green, the rest turn gray

    // If it's not the correct answer, change selected bg-color to red, change correct answer bg-color to green, the rest turn gray

    // Change answered state
    setAnswered(true);
  }

  return (
    <div className="quiz--container">
      {!quiz ? (
        <div className="start--container">
          <img src="/img/start1.png" className="img--one" />
          <img src="/img/start2.png" className="img--two" />
          <h1 className="start--title">Quizzical</h1>
          <p>The best trivia in town</p>
          <button className="start--btn" onClick={startQuiz}>
            Start quiz
          </button>
        </div>
      ) : (
        <div>
          <img src="/img/quiz1.png" className="img--one" />
          <img src="/img/quiz2.png" className="img--two" />
          <div className="trivias--container">
            {quizElements}
            <button className="trivias--btn" onClick={checkAnswers}>
              Check answers
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
