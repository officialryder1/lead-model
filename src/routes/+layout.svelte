<script>
	import '../app.css';
    import Nav from "$lib/nav.svelte";
	let { children } = $props();
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@200..700&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap" rel="stylesheet">
</svelte:head>

<div>
	<main class="flex-1">
		{@render children()}
	</main>
	<footer class=" footer footer-center footer-title bg-slate-800 p-4">
		<p class="">made with 💖 by <a href="/">officialryder</a></p>
	</footer>
	
</div>
<style>
	:global(h1){
        @apply text-2xl;
		font-family: "Oswald", serif;
		font-optical-sizing: auto;
		font-weight: 700;
		font-style: normal;
    }
	:global(body){
		font-family: "Oswald", serif;
		font-optical-sizing: auto;
		font-weight: 400;
		font-style: normal
	}
	div{
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

</style>