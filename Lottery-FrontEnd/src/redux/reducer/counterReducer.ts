import { createReducer } from "@reduxjs/toolkit"
import { decrement, increment, setValue } from "../action/counterAction"

const initialState = {
  count: 0
}

export const counterReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(increment, (state) => {
      state.count += 1 //  state.count = state.count+1
    })
    .addCase(decrement, (state) => {
      state.count -= 1
    })
    .addCase(setValue, (state, action) => {
      state.count = action.payload
    })
})
