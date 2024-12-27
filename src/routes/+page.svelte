<script>
	import { writable } from "svelte/store";

	let userMessage = $state('')
	let chatHistory = writable([]);
	let isLoading = writable(false);
    let token = $state(5)

	async function sendMessage() {
		if (!userMessage.trim()) return;

		chatHistory.update((history) => [
			...history,
			{ role: "user", content: userMessage }
		]);

		isLoading.set(true);

		try {
			const responseStream = await fetch("/api/chat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					messages: [{ role: "user", content: userMessage }]
				})
			});

			userMessage = "";

			if (!responseStream.body) throw new Error("No response body");

			const reader = responseStream.body.getReader();
			const decoder = new TextDecoder();

			let chunkBuffer = ""; // Store incomplete responses
			let addedResponses = new Set(); // Track added responses to prevent duplication

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				// Decode the incoming chunk and append it to the buffer
				chunkBuffer += decoder.decode(value, { stream: true });

				// Split by sentences or line breaks
				const responses = chunkBuffer.split(/(?<=[.?!])\s+/);

				// Process each response
				for (let i = 0; i < responses.length - 1; i++) {
					const response = responses[i].trim();

					if (response && !addedResponses.has(response)) {
						chatHistory.update((history) => [
							...history,
							{ role: "system", content: response }
						]);
						addedResponses.add(response); // Track this response
					}
				}

				// Keep the last incomplete sentence in the buffer
				chunkBuffer = responses[responses.length - 1];
			}

			// Add any remaining content in the buffer
			const finalResponse = chunkBuffer.trim();
			if (finalResponse && !addedResponses.has(finalResponse)) {
				chatHistory.update((history) => [
					...history,
					{ role: "system", content: finalResponse }
				]);
			}
		} catch (error) {
			console.error("Error while streaming:", error);
			chatHistory.update((history) => [
				...history,
				{ role: "system", content: "Error: Could not fetch response." }
			]);
		} finally {
			isLoading.set(false);
            token = token - 1
            console.log(token)
		}
	}
</script>

<header class="justify-center flex flex-col items-center text-gray-900 dark:text-gray-200 m-5">
	<h1 class="font-bold text-ce text-4xl md:text-5xl lg:text-6xl mb-4 text-center">
		Generate Lead on upcoming <b class="text-orange-300">project</b>
	</h1>
	<div class="max-w-lg text-center mb-6">
		<p>Have you ever wanted to generate a step-by-step guide for executing a particular project?</p>
		<p class="text-sm mt-2">Let's help you with the best lead generation strategy for your project.</p>
	</div>

	<input
		type="text"
		placeholder="Example: Help me generate a startup lead"
		class="input input-bordered input-warning w-full max-w-md mb-4"
		bind:value={userMessage}
		onkeypress={(e) => e.key === "Enter" && sendMessage()}
	/>
    {#if token >0}
	<button class="btn-primary mb-5" onclick={sendMessage} disabled={$isLoading}>
        {#if $isLoading}
            <span class="loader"></span> Generating...
        {:else}
            Send
        {/if}
	</button>
    {:else}
        <button class="btn-primary mb-5" disabled>

            <span class="loader"></span>Out of Token
    
        </button>
    {/if}

	<ul class="todo-list mt-6">
		{#each $chatHistory as message (message.content)}
			<li class="todo-item {message.role}">
				<span class="role">{message.role === "user" ? "You:" : "System:"}</span>
				{message.content}
			</li>
		{/each}
	</ul>
</header>

<style>
	.todo-list {
		list-style: none;
		padding: 0;
		margin: 0 auto;
		max-width: 600px;
		border: 1px solid #ddd;
		border-radius: 8px;
		background: #f9f9f9;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		overflow: hidden;
        color: black;
	}

	.todo-item {
		padding: 1rem;
		border-bottom: 1px solid #eee;
	}

	.todo-item:last-child {
		border-bottom: none;
	}

	.todo-item.user {
		background: #f0f8ff;
		text-align: right;
	}

	.todo-item.system {
		background: #e7ffe6;
		text-align: left;
	}

	.role {
		font-weight: bold;
		margin-right: 0.5rem;
	}

	button.btn-primary {
		padding: 0.5rem 1rem;
		background: #007bff;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}

	button.btn-primary:disabled {
		background: #6c757d;
		cursor: not-allowed;
	}

	.loader {
		border: 2px solid #f3f3f3;
		border-top: 2px solid #3498db;
		border-radius: 50%;
		width: 14px;
		height: 14px;
		animation: spin 1s linear infinite;
		display: inline-block;
		margin-right: 0.5rem;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
