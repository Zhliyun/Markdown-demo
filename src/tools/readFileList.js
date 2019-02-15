import axios from 'axios'

const readFileList = (path) => {
    if (!path) return false;
    return axios.get(path);
}

export default readFileList