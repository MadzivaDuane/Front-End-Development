import { useReducer } from 'react';
import './App.css';
import OperationButton from './OperationButton';
import DigitButton from './DigitButton';

//Lists all the possible actions which determine calculator functionilty
export const ACTIONS = {
  ADD_DIGIT: 'add-digit',
  CHOOSE_OPERATION: 'choose-operation',
  CLEAR: 'clear',
  DELETE_DIGIT: 'delete-digit',
  EVALUATE: 'evaluate'
}

//Will handle all our states
function reducer(state, {type, payload}){
  switch(type){
//--------------
    //Adding Digits
    case ACTIONS.ADD_DIGIT:
      //Allow the calculator to overwrite the answer from = when a new calulation begins
      if (state.overwrite) {
        return {
          ...state,
          currentOperand: payload.digit,
          overwrite: false
        }
      }
      //Disble the calculator from typing leading zeros e.g 000005+8 makes no sense
      if (payload.digit === "0" && state.currentOperand === "0"){
        return state
      }

      //Disable the calculator from adding multiple periods e.g 0.56.9
      if (payload.digit === "." && state.currentOperand.includes(".")){
        return state
      }
        
      return {
        ...state,
        currentOperand: `${state.currentOperand || ""}${payload.digit}`,
      }
//---------------
    //Adding operations
    case ACTIONS.CHOOSE_OPERATION:
      //No digits pressed or no output available, if operations are clicked, return the current state
      if (state.currentOperand == null && state.previousOperand == null){
        return state
      }

      //Allow calculator to overwrite an operation e.g 5+ but you want 5* you can simply click the new operation
      if (state.currentOperand == null){
        return {
          ...state,
          operation: payload.operation
        }
      }

      //Core aspect of the calculator
      //If there are digits in the current operand, we want to move them to the previous operand so an operation can be applied
      if (state.previousOperand == null){
        return {
          ...state,
          operation: payload.operation,
          previousOperand: state.currentOperand, //set current operand to previous operand
          currentOperand: null
        }
      }

      return {
        ...state,
        previousOperand: evaluate(state), //evaluate is a function that will do the math to calculate an output
        operation: payload.operation,
        currentOperand: null
      }

//--------------- 
    //Clear input and ouput - returns to initial state
    case ACTIONS.CLEAR:
      return {}

//--------------- 
    //Delete digit
    case ACTIONS.DELETE_DIGIT:
      if (state.overwrite){
        return {
          ...state,
          overwrite: false,
          currentOperand: null
        }
      }
      
      // If there is nothing to delete leave the currnet operand in state
      if (state.currentOperand == null){
        return state
      }

      //If there is 1 digit left on the current operand remove it entirely
      if (state.currentOperand.length === 1){
        return {
          ...state,
          currentOperand: null
        }
      }

      return {
        ...state,
        currentOperand: state.currentOperand.slice(0, -1) //deletes digits 1 by 1 on each del instantiation
      }

//--------------- 
    //Equal
    case ACTIONS.EVALUATE:
      //Return current state if we do not have all information, i.e., current operand, previous operand and/ or operation
      if (state.currentOperand == null || state.previousOperand == null || state.operation == null){
        return state
      }

      //Return calculation
      return {
        ...state,
        //clear the screen of other items and leave the result in the current operand
        overwrite: true, //overwrite allows us to remove the result when a new calculation begins
        previousOperand: null,
        operation: null,
        currentOperand: evaluate(state)
      }
  }
}

function evaluate({currentOperand, previousOperand, operation }){
  //Keep in mind all visuals on the calculator are strings, so we need to convert the requested digits into integers before calculations
  const prev = parseFloat(previousOperand)
  const current = parseFloat(currentOperand)

  //if non-integers are entered we want to return an empty string
  if (isNaN(prev) || isNaN(current))
    return ""

  //Calculation
  let computation = ""
  switch(operation){
    case "+":
      computation = prev + current
      break
    case "-":
      computation = prev - current
      break
    case "*":
      computation = prev * current
      break
    case "÷":
      computation = prev / current
      break
  }

  return computation.toString() // return string because everything on the calculator is in string
}

const INTEGER_FORMATTER = new Intl.NumberFormat("en-us", {
  maximumFractionDigits: 0
})

function formatOperand(operand) {
  if (operand == null) return 
  const [integer, decimal] = operand.split('.')

  if (decimal == null) return INTEGER_FORMATTER.format(integer)

  return `${INTEGER_FORMATTER.format(integer)}.${decimal}`
}

function App() {

  const [{currentOperand, previousOperand, operation}, dispatch] = useReducer(reducer, {})

  return (
    <div className='calculator-grid'>
      <div className='output'>
        <div className='previous-operand'>
          {formatOperand(previousOperand)} {operation}
        </div>
        <div className='current-operand'>
          {formatOperand(currentOperand)}
        </div>
      </div>
      {/*Operation button component handles +, -, * and / signs
         Digit button component handles all number and decimals  */}
      <button className='span-two' onClick={() => dispatch({type: ACTIONS.CLEAR})} >AC</button>
      <button onClick={() => dispatch({type: ACTIONS.DELETE_DIGIT})} >DEL</button>
      <OperationButton operation="÷" dispatch={dispatch}/>
      <DigitButton digit="1" dispatch={dispatch}/>
      <DigitButton digit="2" dispatch={dispatch}/>
      <DigitButton digit="3" dispatch={dispatch}/>
      <OperationButton operation="*" dispatch={dispatch}/>
      <DigitButton digit="4" dispatch={dispatch}/>
      <DigitButton digit="5" dispatch={dispatch}/>
      <DigitButton digit="6" dispatch={dispatch}/>
      <OperationButton operation="+" dispatch={dispatch}/>
      <DigitButton digit="7" dispatch={dispatch}/>
      <DigitButton digit="8" dispatch={dispatch}/>
      <DigitButton digit="9" dispatch={dispatch}/>
      <OperationButton operation="-" dispatch={dispatch}/>
      <DigitButton digit="." dispatch={dispatch}/>
      <DigitButton digit="0" dispatch={dispatch}/>
      <button className='span-two' onClick={() => dispatch({type: ACTIONS.EVALUATE})} >=</button>
    </div>
  );
}

export default App;
