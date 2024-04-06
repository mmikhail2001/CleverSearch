// export const debounce = (func: () => void, delay: number) => {
// 	let debounceHandler: NodeJS.Timeout;
// 	return function () {
// 		clearTimeout(debounceHandler);
// 		debounceHandler = setTimeout(() => {
// 			func();
// 		}, delay);
// 	};
// };

export function debounce(func: any, delay = 300) {
	let timer: NodeJS.Timeout;
	return (...args: any) => {
		clearTimeout(timer);
		timer = setTimeout(() => { func.apply(this, args); }, delay);
	};
}