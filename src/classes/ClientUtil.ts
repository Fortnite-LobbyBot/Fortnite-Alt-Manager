export class ClientUtil {
	wait(time: number) {
		return new Promise((resolve) => setTimeout(resolve, time));
	}

	toCodeBlock(code: string, text: string): string {
		return `\`\`\`${code.replace(/```/g, '')}\n${text.replace(
			/```/g,
			''
		)}\n\`\`\``;
	}

	toCode(text: string): string {
		return `\`${text
			.toString()
			.replace(/`/g, '')
			.replace(/[\n\r]/g, '')}\``;
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
}
