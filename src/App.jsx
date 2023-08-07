import { useState } from "react";
import { nanoid } from "nanoid";
import { decode } from "he";
import Trivia from "./components/Trivia.jsx";
import { categories } from "./data.jsx";

export default function App() {
  const [quiz, setQuiz] = useState(null);
  const [selected, setSelected] = useState([]);
  const [isChecked, setIsChecked] = useState(false);
  const [message, setMessage] = useState("");
  const [parameters, setParameters] = useState({
    difficulty: "any",
    category: 0,
    type: "any",
  });

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

  async function startQuiz(event) {
    !isChecked && event.preventDefault();

    let url = "https://opentdb.com/api.php?amount=5";

    const params = Object.entries(parameters).filter(
      ([key, value]) =>
        ((key === "difficulty" || key === "type") && value !== "any") ||
        (key === "category" && value !== 0)
    );

    if (params.length > 0) {
      params.forEach(([key, value]) => {
        url += `&${key}=${value}`;
      });
    }

    const res = await fetch(url);
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

  function setOptions(event) {
    const name = event.target.name;
    setParameters((prevParam) => ({
      ...prevParam,
      [name]: event.target.value,
    }));
  }

  function restart() {
    setIsChecked(false);
    setSelected([]);
    setMessage("");
    setQuiz(null);
  }

  return (
    <div className="quiz--container">
      {!quiz ? (
        <div className="start--container">
          <img src="/img/start1.png" className="img--one" />
          <img src="/img/start2.png" className="img--two" />
          <h1 className="start--title">Quizzical</h1>
          <p>The best trivia in town</p>
          <form className="parameters--form">
            <div className="params--container">
              <label htmlFor="difficulty">Choose difficulty level:</label>
              <select
                name="difficulty"
                id="difficulty"
                value={parameters.difficulty}
                onChange={setOptions}
              >
                <option value="any">Any difficulty</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="params--container">
              <label htmlFor="category">Choose category:</label>
              <select
                name="category"
                id="category"
                value={parameters.category}
                onChange={setOptions}
              >
                <option value={0}>Any category</option>
                {categories.trivia_categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="params--container">
              <label htmlFor="type">Choose type:</label>
              <select
                name="type"
                id="type"
                value={parameters.type}
                onChange={setOptions}
              >
                <option value="any">Any type</option>
                <option value="multiple">Multiple choice</option>
                <option value="boolean">True / False</option>
              </select>
            </div>
            <button className="start--btn" onClick={startQuiz}>
              Start quiz
            </button>
          </form>
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
                <button className="restart-btn" onClick={restart}>
                  Reset parameters
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
