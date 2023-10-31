import axios from "axios";

export const api = axios.create({
	baseURL: "http://10.0.2.2:3000", // para emuladores: 10.0.2.2, para dispositivos reais: 127.0.0.1
	timeout: 10000,
});
