import axios from "axios";

export default function getHTTPClient (serverRequest) {
  if (!serverRequest) {
    return axios;
  }

  return axios.create({
    headers: serverRequest.headers
  });
}

