import api from "./api"

export const createBlog = async (data: any) => {
  const res = await api.post("/blog/create", data, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  })
  return res.data
}

export const getAllBlog = async (page: number, limit: number) => {
  const res = await api.get(`/blog?page=${page}&limit=${limit}`)
  return res.data
}

export const getMyBlog = async (page: number, limit: number) => {
  const res = await api.get(`/blog/me?page=${page}&limit=${limit}`)
  return res.data
}