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
      onMouseEnter={() => {
        props.onHover(props.index)
        for (let i = 0; i < props.nextMoves.length; i++) {
          const hexa = props.nextMoves[i]
            .split('-')
            .map((num) => (parseInt(num) - 1).toString())
            .join('-')
            
          const styleToAdd = 
          evaluationClass === styles.positive 
            ? styles[`hexPreviewPos${i+1}`] 
            : styles[`hexPreviewNeg${i+1}`];
          
          const elements = document.getElementsByClassName(hexa);
          if (elements.length > 0) {
            document.getElementsByClassName(hexa)[0].classList.add(styleToAdd);
          }
      
        }
      
      }}
      onMouseLeave={() => {
        props.onLeave(props.index)
        for (let i = 0; i < props.nextMoves.length; i++) {
          const hexa = props.nextMoves[i]
            .split('-')
            .map((num) => (parseInt(num) - 1).toString())
            .join('-')
          const styleToRemove = 
          evaluationClass === styles.positive 
            ? styles[`hexPreviewPos${i+1}`] 
            : styles[`hexPreviewNeg${i+1}`];
          
          const elements = document.getElementsByClassName(hexa);
          if (elements.length > 0) {
            document.getElementsByClassName(hexa)[0].classList.remove(styleToRemove);
          }
        }

      }}
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
