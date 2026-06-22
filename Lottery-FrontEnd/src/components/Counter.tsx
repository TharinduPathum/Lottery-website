import { useDispatch, useSelector } from "react-redux"
import { decrement, increment, setValue } from "../redux/action/counterAction"

function Counter() {
  //     const count = useSelector((state: any) => {
  //     return state?.counter?.count
  //   })
  const count = useSelector((state: any) => state?.counter?.count)

  const dispatch = useDispatch()

  const handleIncrement = () => {
    dispatch(increment())
  }

  const handleDecrement = () => {
    dispatch(decrement())
  }

  const handleReset = () => {
    dispatch(setValue(0))
  }

  return (
    <div>
      <h1>count: {count}</h1>
      <button onClick={handleIncrement}>+</button>
      <button onClick={handleDecrement}>-</button>
      <button onClick={handleReset}>Reset</button>
    </div>
  )
}

export default Counter
