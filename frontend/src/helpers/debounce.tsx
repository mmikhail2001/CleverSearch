export const debounce = (func: () => void, delay: number) => {
	let debounceHandler: NodeJS.Timeout;
	return function () {
		clearTimeout(debounceHandler);
		debounceHandler = setTimeout(() => {
			func();
		}, delay);
	};
};
