<script lang="ts">
    import PlacementCard from "$lib/components/Card/PlacementCard.svelte";
    export let companies: string[];
    export let placements: Record<string, any[]> = {};
</script>

<div class="px-4 md:py-5 py-0">
    <PlacementCard offers={placements} companyNames={companies} />
</div>