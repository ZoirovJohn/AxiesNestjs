console.log("Train.ts ishga tushdi");
console.log("--------------------------------------");
/**TASK-ZQ:

Shunday function yozing, u parametridagi array ichida 2 marta qaytarilgan sonlarni alohida araryda qaytarsin.
MASALAN: findDuplicates([1,2,3,4,5,4,3,4]) return [3, 4]
*/

function findDuplicates(arr: number[]) {
  const countMap: Record<number, number> = {};
  const result: number[] = [];

  for (const num of arr) {
    countMap[num] = (countMap[num] || 0) + 1;
  }

  for (const num in countMap) {
    if (countMap[num] > 1) {
      result.push(Number(num));
    }
  }

  return result;
}

console.log(findDuplicates([1, 2, 3, 4, 5, 4, 3, 4]));
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
/**TASK-ZL:

Shunday function yozing, u parametrda berilgan stringni kebab casega otkazib qaytarsin. Bosh harflarni kichik harflarga ham otkazsin.
MASALAN: stringToKebab(“I love Kebab”) return “i-love-kebab”


function stringToKebab(str: string) {
	return str.split(" ").map((ele) => ele.toLowerCase()).join("-")
}

console.log(stringToKebab('I love Kebab'));
*/
/**TASK ZM:

Shunday function yozing, va bu function parametr
sifatida raqamlarni qabul qilsin. Bu function qabul qilingan
raqamlarni orqasiga o'girib qaytarsin

MASALAN: reverseInteger(123456789); return 987654321;

Yuqoridagi misolda, function kiritilgan raqamlarni orqasiga
o'girib (reverse) qilib qaytarmoqda.


function reverseInteger(number: number) {
	return Number(number.toString().split("").reverse().join(""))

}

console.log(reverseInteger(123456789));
*/
/**TASK-ZN:

Shunday function yozing, uni array va number parametri bolsin. Ikkinchi parametrda berilgan raqamli indexgacha arrayni orqasiga ogirib qaytarsin.
MASALAN: rotateArray([1, 2, 3, 4, 5, 6], 3) return [5, 6, 1, 2, 3, 4]

function rotateArray(arr: number[], index: number) {
	return arr.splice(index + 1, arr.length).concat(arr);
  }
  
  console.log(rotateArray([1, 2, 3, 4, 5, 6], 3));
  */

/**TASK-ZO:

Shunday function yozing, u parametrdagi string ichidagi qavslar miqdori balansda ekanligini aniqlasin. Ya'ni ochish("(") va yopish(")") qavslar soni bir xil bolishi kerak.
MASALAN: areParenthesesBalanced("string()ichida(qavslar)soni()balansda") return true


function areParenthesesBalanced(str: string) {
	return str.split("(").length === str.split(")").length
  }
  
  console.log(areParenthesesBalanced("string()ichida(qavslar)soni()balansda"))
  */
/**TASK-ZP:

Shunday function yozing, u parametridagi string ichidagi raqam va sonlarni sonini sanasin.
MASALAN: countNumberAndLetters(“string152%\¥”) return {number:3, letter:6}


function countNumberAndLetters(str: string) {
	let number = 0;
	let letter = 0;
	for (const char of str) {
	  if (/[0-9]/.test(char)) number++;
	  else if (/[a-zA-Z]/.test(char)) letter++;
	}
	return { number: number, letter: letter };
  }
  
  console.log(countNumberAndLetters("string152%\¥"));
  */
