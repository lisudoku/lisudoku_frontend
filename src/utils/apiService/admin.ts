import axios from 'axios'

export const fetchGroupCounts = async () => {
  return axios.get('/admin/puzzle_counts', {
    // headers: {
    //   'Authorization': `Bearer ${userToken()}`,
    // },
  }).then(response => response.data)
}
