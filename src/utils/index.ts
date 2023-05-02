export function CustomException(code: number, message?: string) {
	const error = new Error(message) as any;
	error.code = code;
	return error;
}

export function safeJsonParse(string: string) {
	try {
		return JSON.parse(string);
	} catch (error) {
		return null;
	}
}
