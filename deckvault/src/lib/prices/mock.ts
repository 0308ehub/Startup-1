export function getMockPrice() {
	return { value: Number((1 + Math.random() * 20).toFixed(2)), asOf: new Date() };
}


