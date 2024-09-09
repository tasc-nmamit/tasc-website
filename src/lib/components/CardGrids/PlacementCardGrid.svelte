<script lang="ts">
    import { PLACEMENT_DETAILS } from "$lib/data/Achievements";
    import type { Placement, PlacementDetails, PlacementOffer } from "$lib/components/types/AchievementData";
    import PlacementCard from "$lib/components/Card/PlacementCard.svelte";
    export let companies: string[];
    export let placements: Record<string, any[]> = {};

    // let placements: Placement[] = PLACEMENT_DETAILS.find((placement: PlacementDetails) => placement.year === year)?.placements || [];

    // let placementsByCompany: Record<string, string[]> = {};
    // let placementsByStudent: Record<string, PlacementOffer[]> = {};

    // let companyNames: string[] = PLACEMENT_DETAILS.find((placements: PlacementDetails) => placements.year === year)?.companies || [];

    // placements.forEach((placement: Placement) => {
    //     placement.offers.forEach((offer: { company: string, package: string }) => {
    //         if (!placementsByCompany[offer.company]) placementsByCompany[offer.company] = [];
    //         placementsByCompany[offer.company].push(placement.name);
    //     })

    //     if (!placementsByStudent[placement.name]) placementsByStudent[placement.name] = [];
    //     placementsByStudent[placement.name] = placement.offers;
    // })
</script>

<div class="px-4 md:py-5 py-0">
    <PlacementCard offers={placements} companyNames={companies} />
</div>