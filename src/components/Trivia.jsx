import PropTypes from "prop-types";

export default function Trivia({ trivia, handleClick, selected, isChecked }) {
  return (
    <div className="trivia--container">
      <h2 className="trivia--title">{trivia.question}</h2>
      <div className="answers--container">
        {trivia.answers.map((answer) => {
          const isHeld =
            JSON.stringify(selected) !== "{}" &&
            selected.answerId === answer.id;
          const isCorrect = trivia.correct_answer === answer.value;
          const isIncorrect = isHeld && !isCorrect;
          return (
            <span
              className={`${!isChecked && isHeld ? "answer--held" : ""} ${
                isChecked && isCorrect ? "answer--green" : ""
              } ${isChecked && isIncorrect ? "answer--red" : ""} ${
                isChecked && !isCorrect ? "answer--gray" : ""
              } ${isChecked ? "answer--disabled" : ""}`}
              key={answer.id}
              onClick={() => handleClick(trivia.id, answer.id, answer.value)}
            >
              {answer.value}
            </span>
          );
        })}
      </div>
    </div>
  );
}

Trivia.propTypes = {
  trivia: PropTypes.object.isRequired,
  handleClick: PropTypes.func.isRequired,
  selected: PropTypes.object.isRequired,
  isChecked: PropTypes.bool.isRequired,
};
