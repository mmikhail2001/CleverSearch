export function debounce(func: any, delay = 300) {
	let timer: NodeJS.Timeout;
	return (...args: any) => {
		clearTimeout(timer);
		timer = setTimeout(() => { func.apply(this, args); }, delay);
	};
}