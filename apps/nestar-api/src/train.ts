console.log('Train.ts ishga tushdi');
console.log('--------------------------------------');
/**TASK-ZL:

Shunday function yozing, u parametrda berilgan stringni kebab casega otkazib qaytarsin. Bosh harflarni kichik harflarga ham otkazsin.
MASALAN: stringToKebab(“I love Kebab”) return “i-love-kebab”
*/

function stringToKebab(str: string) {
	return str.split(" ").map((ele) => ele.toLowerCase()).join("-")
}

console.log(stringToKebab('I love Kebab'));
//****************************************************** */
/**TASK-ZK:

Shunday function yozing, u har soniyada bir marta consolega 1 dan 5 gacha bolgan raqamlarni chop etsin va 5 soniyadan keyin ishini toxtatsin.
MASALAN: printNumbers()


function printNumbers(arr: any[]) {
	const interval = setInterval(() => {
		for (let i = 1; i <= 5; i++) {
			console.log(i);
		}
	}, 1000);
	setTimeout(() => {
		clearInterval(interval);
	}, 5000);
}

printNumbers([1, [1, 2, [4]]]);
*/
/**TASK-ZK:

Shunday function yozing, u har soniyada bir marta consolega 1 dan 5 gacha bolgan raqamlarni chop etsin va 5 soniyadan keyin ishini toxtatsin.
MASALAN: printNumbers()


function printNumbers(arr: any[]) {
	const interval = setInterval(() => {
		for (let i = 1; i <= 5; i++) {
			console.log(i);
		}
	}, 1000);
	setTimeout(() => {
		clearInterval(interval);
	}, 5000);
}

printNumbers([1, [1, 2, [4]]]);
*/
