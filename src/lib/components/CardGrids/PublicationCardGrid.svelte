<script lang="ts">
    import PublicationCard from '$lib/components/Card/PublicationCard.svelte';
    export let faculties;

</script>

<div class="px-4 md:py-5 py-0">
    <PublicationCard  faculties={faculties}/>
</div>