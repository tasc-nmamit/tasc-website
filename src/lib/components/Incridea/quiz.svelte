<script>
	let arr = ["1"]; 
    let activeQuestionIndex = 0;
	let question = 'Lorem ipsum dolor sit amet consectetur adipisicing elit. A, voluptates quis cumque cupiditate eveniet quod laboriosam obcaecati, ab excepturi vero rem dolore totam temporibus saepe itaque! Itaque omnis nostrum deserunt? Dignissimos harum, sapiente consequatur vero, labore veniam amet asperiores earum ipsam maxime beatae, quasi corporis modi deserunt aperiam fuga quaerat.';
</script>

<div class="z-20 mx-auto h-2/3 w-full max-w-3xl rounded-md bg-white p-20 text-black">
	{#each arr as data}
		<h2>{question}</h2>
		<div>
			<p>Option1</p>
			<p>Option2</p>
			<p>Option3</p>
			<p>Option4</p>
		</div>
	{/each}
</div>
