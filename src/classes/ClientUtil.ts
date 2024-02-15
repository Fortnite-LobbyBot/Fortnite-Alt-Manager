export class ClientUtil {
	wait(time: number) {
		return new Promise((resolve) => setTimeout(resolve, time));
	}

	toCodeBlock(code: string, text: string): string {
		return `\`\`\`${code.replace(/```/g, '')}\n${text.replaceAll(
			'```',
			'\\`\\`\\`'
		)}\n\`\`\``;
	}

	toCode(text: string): string {
		return `\`${text
			.toString()
			.replaceAll('`', '\\`')
			.replaceAll(/[\n\r]/g, '')}\``;
	}

	toRelativeTimestamp(timestamp: number): string {
		return `<t:${timestamp.toString().slice(0, -3)}:R>`;
	}

	clearMentions(text: string): string {
		return text
			.replace(/</g, '')
			.replace(/!/g, '')
			.replace(/@/g, '')
			.replace(/#/g, '')
			.replace(/&/g, '')
			.replace(/>/g, '');
	}

	reverseMap<T, O>(arr: T[], cb: (v: T, i: number, ri: number) => O) {
		return (
			arr?.map((_, i, cArr) => {
				const ri = cArr.length - i - 1;

				return cb(cArr[ri] as T, i, ri);
			}) ?? []
		);
	}

	chunkArray<ArrayType>(
		targetArray: ArrayType[],
		chunkSize: number,
		fromEnd: boolean = false
	): ArrayType[][] {
		const result = [];
		const arrayLength = targetArray.length;

		if (fromEnd) {
			for (let i = arrayLength; i > 0; i -= chunkSize)
				result.push(targetArray.slice(Math.max(i - chunkSize, 0), i));
		} else {
			for (let i = 0; i < arrayLength; i += chunkSize)
				result.push(targetArray.slice(i, i + chunkSize));
		}

		return result;
	}
}
