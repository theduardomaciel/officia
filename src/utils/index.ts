export function CustomException(code: number, message?: string) {
	const error = new Error(message) as any;
	error.code = code;
	return error;
}

export function safeJsonParse(string: string | undefined) {
	if (!string) return null;
	try {
		return JSON.parse(string);
	} catch (error) {
		return null;
	}
}

export const isAdult = (birthday: Date) => {
	const today = new Date();
	let age = today.getFullYear() - birthday.getFullYear();
	const m = today.getMonth() - birthday.getMonth();
	if (m < 0 || (m === 0 && today.getDate() < birthday.getDate())) {
		age--;
	}
	return age >= 16;
};

export const censorEmail = (email: string) => {
	const [firstPart, secondPart] = email.split("@");
	const firstPartLength = firstPart.length;
	const firstPartCensored =
		firstPart.slice(0, 3) + "*".repeat(firstPartLength - 3);
	return `${firstPartCensored}@${secondPart}`;
};
