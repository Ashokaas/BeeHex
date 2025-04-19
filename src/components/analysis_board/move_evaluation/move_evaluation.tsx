import React from "react";
import styles from "./move_evaluation.module.css";
import Spacer from "../../spacer/spacer";

export function MoveEvaluation(props: { 
  index: number, 
  Evaluation: number, 
  nextMoves: Array<string>, 
  onClick: (index: number) => void
  onHover: (index: number) => void
  onLeave: (index: number) => void
}) {
  const evaluationClass =
    props.Evaluation >= 0 ? styles.positive : styles.negative;

  return (
    <div 
      className={styles.container} 
      onClick={() => props.onClick(props.index)} 
      onMouseEnter={() => props.onHover(props.index)}
      onMouseLeave={() => props.onLeave(props.index)}
    >
      <div className={`${styles.moveEvaluation} ${evaluationClass}`}>
        <p>{props.Evaluation > 0 ? `+${props.Evaluation}` : props.Evaluation}</p>
      </div>
      <div className={styles.nextMoves}>
        {props.nextMoves.map((move, index) => (
          <div key={index}>
            <p>{move},</p>
          </div>
        ))}
        <div>
          <p> ...</p>
        </div>
      </div>
    </div>
  );
}
