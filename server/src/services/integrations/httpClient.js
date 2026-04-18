import axios from "axios";

const httpClient = axios.create({
  timeout: 30000,
  headers: {
    "User-Agent": "CuraLinkResearchAssistant/0.1",
  },
});

export default httpClient;
