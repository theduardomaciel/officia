export function CustomException(code: number, message?: string) {
	const error = new Error(message) as any;
	error.code = code;
	return error;
}
