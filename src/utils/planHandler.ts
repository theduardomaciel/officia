import { userStorage } from "context/AuthContext";

export function getAccountPlan() {
	const planExpiresAt = userStorage.getString("plan");
	if (planExpiresAt) {
		const date = new Date(planExpiresAt);
		if (date.getTime() > new Date().getTime()) {
			return "premium";
		}
	} else {
		return undefined;
	}
	return undefined;
}
