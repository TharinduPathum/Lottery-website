import api from "./api"

export const getAllCustomer = async () => {
  const res = await api.get("/customer")
  return res.data
}

export const saveCustomer = async (customer: any) => {
  const res = await api.post("/customer/save", customer)
  return res.data
}
