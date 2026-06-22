import { useEffect, useState } from "react"
import { getAllCustomer, saveCustomer } from "../service/customer"

const Customer = () => {
  const [customers, setCustomers] = useState([])
  const [name, setName] = useState("")
  const [age, setAge] = useState(0)
  const [isAdmin, setIsAdmin] = useState(false)

  const fetchCustomers = async () => {
    try {
      const res: any = await getAllCustomer()
      setCustomers(res?.data ?? [])
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchCustomers()
    // const res = axios.get("http://localhost:5000/api/v1/customer")
    // res
    //   .then((resData) => {
    //     console.log(resData)
    //   })
    //   .catch((err) => {
    //     console.error(err)
    //   })
  }, [])

  const handleOnSave = async () => {
    try {
      const customer = {
        name,
        age,
        isAdmin
      }
      await saveCustomer(customer)
      console.log("Saved")
      alert("saved")
    } catch (err) {}
  }

  return (
    <div>
      <div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          type="text"
          placeholder="name"
        />
        <input
          value={age}
          onChange={(e) => setAge(Number(e.target.value))}
          type="number"
          placeholder="age"
        />
        <input
          checked={isAdmin}
          onChange={() => setIsAdmin(!isAdmin)}
          // e.target.checked
          type="checkbox"
          placeholder="is admin"
        />
        <button onClick={handleOnSave}>Save</button>
      </div>
      <div className="flex flex-wrap gap-5 justify-center">
        {customers.map((customer: any, index) => (
          <div
            key={index}
            className="bg-white w-72 p-6 rounded-lg shadow-lg border-t-8 border-indigo-600"
          >
            <h1 className="text-lg font-extrabold text-gray-800 border-b pb-2 mb-4">
              Name: {customer?.name || "N/A"}
            </h1>{" "}
            <p className="text-gray-700 font-semibold my-1">
              Age: {customer?.age || "N/A"}
            </p>
            <p className="text-gray-700 font-semibold my-1">
              Admin: {customer?.isAdmin ? "YES" : "NO"}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Customer
