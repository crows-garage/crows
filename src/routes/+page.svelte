<script>
	import AnalyticsTracker from '#lib/components/AnalyticsTracker.svelte'
	import HeroSection from '#lib/components/home/HeroSection.svelte'
	import PurposeSection from '#lib/components/home/PurposeSection.svelte'
	import PillarsSection from '#lib/components/home/PillarsSection.svelte'
	import ProjectsSection from '#lib/components/home/ProjectsSection.svelte'
	import BlogShowcase from '#lib/components/home/BlogShowcase.svelte'
	import AgendaStrip from '#lib/components/home/AgendaStrip.svelte'
	import GalleryShowcase from '#lib/components/home/GalleryShowcase.svelte'

	let { data } = $props()
</script>

<svelte:head>
	<title>Crow Projects</title>
</svelte:head>

<AnalyticsTracker />
<div class="bg-base">
	<HeroSection org={data.org} ctas={data.ctas} />
	<PurposeSection />
	<ProjectsSection projects={data.projects} />
	<PillarsSection />
	<AgendaStrip events={data.events} />
	<BlogShowcase posts={data.posts} />
	<GalleryShowcase galleries={data.galleries} />
</div>
