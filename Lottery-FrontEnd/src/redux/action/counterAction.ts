import { createAction } from "@reduxjs/toolkit"

const increment = createAction("counter/increment")

const decrement = createAction("counter/decrement")

const setValue = createAction<number>("counter/setValue")
// const setValue = createAction("counter/setValue") // no TS

export { decrement, increment, setValue }
// export default 
