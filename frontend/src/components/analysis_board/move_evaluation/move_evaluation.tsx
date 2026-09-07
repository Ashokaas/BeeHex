import React from "react";
import styles from "./move_evaluation.module.css";
import Spacer from "../../spacer/spacer";
import { Coordinate } from "@/app/definitions";
import { Score } from "@/app/hex/[gameId]/Algorithm";

export function MoveEvaluation(props: { 
  index: number, 
  Evaluation: Score,
  turn: number,
  nextMoves: Array<Coordinate>, 
  onClick: (index: number) => void
  onHover: (index: number) => void
  onLeave: (index: number) => void
}) {
  const evaluationClass =
    props.turn % 2 === 0 ? styles.negative : styles.positive;

    
  return (
    <div 
      className={styles.container} 
      onClick={() => props.onClick(props.index)} 
      /*
      onMouseEnter={() => {
        props.onHover(props.index)
        for (let i = 0; i < props.nextMoves.length; i++) {
          const hexa = props.nextMoves[i].slice().reverse().join('-')

            
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
          const hexa = props.nextMoves[i].slice().reverse().join('-')
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
        */
    >
      <div className={`${styles.moveEvaluation} ${evaluationClass}`}>
        <p>{props.Evaluation.toString()}</p>
      </div>
      <div className={styles.nextMoves}>
        {props.nextMoves.map((move, index) => (
          <div key={index}>
            <p>{move.slice().reverse().map((n) => n+1).join('-')},</p>
          </div>
        ))}
        <div>
          <p> ...</p>
        </div>
      </div>
    </div>
  );
}
