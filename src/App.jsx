import { useState } from "react";
import { nanoid } from "nanoid";
import { decode } from "he";
import Trivia from "./components/Trivia.jsx";

export default function App() {
  const [quiz, setQuiz] = useState(null);
  const [selected, setSelected] = useState([]);
  const [isChecked, setIsChecked] = useState(false);
  const [message, setMessage] = useState("");

  const result =
    JSON.stringify(selected) !== "{}" &&
    selected.filter((answer) =>
      quiz.some(
        (trivia) =>
          trivia.id === answer.triviaId &&
          trivia.correct_answer === answer.value
      )
    ).length;

  const quizElements = quiz
    ? quiz.map((trivia) => (
        <Trivia
          key={trivia.id}
          trivia={trivia}
          selected={
            selected.filter((answer) => answer.triviaId === trivia.id)[0] || {}
          }
          handleClick={handleClick}
          isChecked={isChecked}
        />
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
        correct_answer: decode(el.correct_answer),
        incorrect_answers: el.incorrect_answers.map((answer) => decode(answer)),
        question: decode(el.question),
        id: nanoid(),
        answers: shuffleArray([...el.incorrect_answers, el.correct_answer]).map(
          (answer) => ({
            value: decode(answer),
            id: nanoid(),
          })
        ),
      }))
    );
  }

  function handleClick(triviaId, answerId, value) {
    setSelected((prevSelected) => {
      let newSelected;
      const triviaIndex = prevSelected.findIndex(
        (answer) => answer.triviaId === triviaId
      );
      if (triviaIndex >= 0) {
        newSelected = [...prevSelected];
        newSelected[triviaIndex] = {
          triviaId,
          answerId,
          value,
        };
      } else {
        newSelected = [
          ...prevSelected,
          {
            triviaId,
            answerId,
            value,
          },
        ];
      }
      return newSelected;
    });
  }

  function checkAnswers() {
    if (selected.length === quiz.length) {
      setIsChecked(true);
      setMessage(`You scored ${result}/${quiz.length} correct answers`);
    } else {
      setMessage("Please answer all questions before checking the results");
    }
  }

  async function playAgain() {
    await startQuiz();
    setIsChecked(false);
    setSelected([]);
    setMessage("");
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
            {!isChecked ? (
              <div className="trivias--results">
                <button className="trivias--btn" onClick={checkAnswers}>
                  Check answers
                </button>
                <span className="results--warning">{message}</span>
              </div>
            ) : (
              <div className="trivias--results">
                <span className="results--display">{message}</span>
                <button className="trivias--btn" onClick={playAgain}>
                  Play again
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
